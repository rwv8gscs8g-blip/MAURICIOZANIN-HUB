"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type BrazilStatesMapProps = {
  activeState?: string | null;
  allowedStates?: string[];
  onSelectState?: (uf: string) => void;
  className?: string;
  svgSrc?: string;
  fallbackImageSrc?: string;
};

const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
const DEFAULT_ALLOWED = UF_LIST;
const STATE_NAME_TO_UF: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

const REGION_PALETTE = {
  norte: { base: "#D9F2FF", hover: "#BFDFFF", stroke: "#6B9CC9" },
  nordeste: { base: "#FFE1C7", hover: "#FFD2AD", stroke: "#D28B5A" },
  centroOeste: { base: "#D9F2D9", hover: "#C5EBC5", stroke: "#5A9D6A" },
  sudeste: { base: "#E7DDFF", hover: "#D6C7FF", stroke: "#7C6BC9" },
  sul: { base: "#DDF6F4", hover: "#C7EFEC", stroke: "#4A9A94" },
};

const UF_REGION: Record<string, keyof typeof REGION_PALETTE> = {
  AC: "norte",
  AP: "norte",
  AM: "norte",
  PA: "norte",
  RO: "norte",
  RR: "norte",
  TO: "norte",
  AL: "nordeste",
  BA: "nordeste",
  CE: "nordeste",
  MA: "nordeste",
  PB: "nordeste",
  PE: "nordeste",
  PI: "nordeste",
  RN: "nordeste",
  SE: "nordeste",
  DF: "centroOeste",
  GO: "centroOeste",
  MT: "centroOeste",
  MS: "centroOeste",
  ES: "sudeste",
  MG: "sudeste",
  RJ: "sudeste",
  SP: "sudeste",
  PR: "sul",
  RS: "sul",
  SC: "sul",
};

const buildUfSelectors = (uf: string) =>
  [
    `[id="${uf}"]`,
    `[id="BR${uf}"]`,
    `[id="BR.${uf}"]`,
    `[id="BR-${uf}"]`,
  ].join(",");

export default function BrazilStatesMap({
  activeState,
  allowedStates = DEFAULT_ALLOWED,
  onSelectState,
  className,
  svgSrc = "/br-states.svg",
  fallbackImageSrc = "/Brazilian_States.svg",
}: BrazilStatesMapProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [hasUfIds, setHasUfIds] = useState(false);

  const allowedSet = useMemo(() => new Set(allowedStates), [allowedStates]);

  useEffect(() => {
    let isMounted = true;
    fetch(svgSrc)
      .then((res) => {
        if (!res.ok) throw new Error("SVG not found");
        return res.text();
      })
      .then((text) => {
        if (!isMounted) return;
        setSvgContent(text);
        const ufRegex = new RegExp(`id=["'](?:${UF_LIST.join("|")})["']`, "i");
        setHasUfIds(ufRegex.test(text));
        setHasError(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSvgContent(null);
        setHasError(true);
        setHasUfIds(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normalizeUf = (rawId: string) => {
    if (!rawId) return "";
    const clean = rawId.trim();
    const normalized = normalizeText(clean);
    if (normalized.length === 2) return normalized.toUpperCase();
    if (normalized.startsWith("br") && normalized.length >= 4) {
      return normalized.slice(-2).toUpperCase();
    }
    if (STATE_NAME_TO_UF[normalized]) return STATE_NAME_TO_UF[normalized];
    if (clean.length >= 2) return clean.slice(-2).toUpperCase();
    return "";
  };

  const findUfFromTarget = (target: Element | null) => {
    let current: Element | null = target;
    while (current) {
      const id = current.getAttribute?.("id");
      if (id) {
        const uf = normalizeUf(id);
        if (uf) return uf;
      }
      current =
        (current as HTMLElement).parentElement || (current as Element).parentNode as Element | null;
    }
    return "";
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element | null;
    if (!target) return;
    const uf = findUfFromTarget(target);
    if (!uf || !allowedSet.has(uf)) return;
    onSelectState?.(uf);
  };

  const regionStyles = useMemo(() => {
    return Object.entries(UF_REGION)
      .map(([uf, region]) => {
        const palette = REGION_PALETTE[region];
        const selectors = buildUfSelectors(uf);
        return `
          .brazil-map svg ${selectors} { fill: ${palette.base}; stroke: ${palette.stroke}; }
          .brazil-map svg ${selectors}:hover { fill: ${palette.hover}; }
        `;
      })
      .join("\n");
  }, []);

  return (
    <div
      className={cn(
        "brazil-map relative border border-[#E2E8F0] bg-[#F8FAFC] p-4",
        className
      )}
      onClick={handleClick}
    >
      <style>
        {`
          .brazil-map svg { width: 100%; height: auto; }
          .brazil-map svg * { pointer-events: all; }
          .brazil-map svg [id] { fill: #E2E8F0; stroke: #94A3B8; stroke-width: 0.5; }
          .brazil-map svg text { fill: #93C5FD; font-family: 'Gabarito', 'DM Sans', sans-serif; letter-spacing: 0.06em; }
          ${regionStyles}
          .brazil-map svg [id="${activeState ?? ""}"] { fill: #60A5FA; stroke: #2563EB; }
          .brazil-map svg [id="BR${activeState ?? ""}"] { fill: #60A5FA; stroke: #2563EB; }
          .brazil-map svg [id="BR.${activeState ?? ""}"] { fill: #60A5FA; stroke: #2563EB; }
          .brazil-map svg [id="BR-${activeState ?? ""}"] { fill: #60A5FA; stroke: #2563EB; }
          .brazil-map svg [id] { cursor: pointer; }
        `}
      </style>
      {svgContent && hasUfIds ? (
        <div
          aria-label="Mapa do Brasil"
          className="w-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : svgContent || fallbackImageSrc ? (
        <div className="relative w-full">
          <img
            src={fallbackImageSrc}
            alt="Mapa do Brasil"
            className="w-full h-auto"
          />
          <button
            type="button"
            onClick={() => onSelectState?.("PE")}
            className={cn(
              "absolute text-[10px] font-semibold px-2 py-1 rounded-full border shadow-sm",
              "bg-emerald-50 text-emerald-800 border-emerald-500 hover:bg-emerald-100",
              activeState === "PE" && "ring-2 ring-emerald-400"
            )}
            style={{ right: "12px", top: "12px" }}
          >
            PE
          </button>
        </div>
      ) : (
        <div className="text-sm text-[#64748B]">
          {hasError
            ? "Mapa do Brasil não encontrado. Coloque o arquivo em public/br-states.svg com IDs por UF."
            : "Carregando mapa do Brasil..."}
        </div>
      )}
    </div>
  );
}

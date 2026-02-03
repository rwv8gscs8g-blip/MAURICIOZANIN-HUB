"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { eixosDiagnostico, blocosDiagnostico, checklistPorEixo } from "@/data/diagnostico-eixos";
import { isValidCnpj, normalizeCnpj } from "@/lib/cnpj";
import { cn } from "@/lib/utils";
import BrazilStatesMap from "@/components/ui/BrazilStatesMap";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HelpButton } from "@/components/ui/HelpButton";
import { Trash2, LayoutDashboard, FileEdit, LogIn, Plus, ExternalLink, Users, FileText, ListOrdered, ClipboardEdit, Search, CheckCircle, Printer, BarChart2 } from "lucide-react";

const STORAGE_KEY = "diagnostico-compras-v1";

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Submetido",
  IN_REVIEW: "Em análise",
  RETURNED: "Devolvido para ajustes",
  FINALIZED: "Finalizado",
};

const STATUS_LEVELS = [
  { key: "nao-iniciado", label: "Não iniciado", min: 0, max: 0 },
  { key: "t0", label: "T0", min: 1, max: 1 },
  { key: "t1", label: "T1", min: 2, max: 2 },
  { key: "t2", label: "T2", min: 3, max: 3 },
  { key: "t3", label: "T3", min: 4, max: 4 },
  { key: "t4", label: "T4", min: 5, max: Infinity },
];

/** Classe de cor da coluna Última nota: não realizado (preto), 0–3 vermelho, 4–6 amarelo/laranja, 7–10 verde */
function notaColorClass(nota: number | null | undefined): string {
  if (nota == null || Number.isNaN(Number(nota))) return "text-[#0F172A]"; // não realizado
  const n = Number(nota);
  if (n >= 7) return "text-emerald-600 font-semibold";
  if (n >= 4) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold"; // 0 a 3
}

function buildInitialEixos() {
  return eixosDiagnostico.map((eixo) => ({
    eixoKey: eixo.key,
    positivoParte1: [...(checklistPorEixo[eixo.key].positivo || [])],
    positivoParte2: "",
    positivoNota: null as number | null,
    positivoNotaConsultor: null as number | null,
    negativoParte1: [...(checklistPorEixo[eixo.key].negativo || [])],
    negativoParte2: "",
    negativoNota: null as number | null,
    negativoNotaConsultor: null as number | null,
    solucaoParte1: [...(checklistPorEixo[eixo.key].solucao || [])],
    solucaoParte2: "",
    solucaoNota: null as number | null,
    solucaoNotaConsultor: null as number | null,
    solucaoSebraeDescs: new Array(10).fill(""),
    solucaoDescricao: "",
    consultor: {
      positivoParte3: "",
      negativoParte3: "",
      solucaoParte3: "",
    },
  }));
}

function DiagnosticoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const municipioFromQuery = useMemo(() => {
    const raw = searchParams.get("municipio");
    return raw ? String(raw).trim() : "";
  }, [searchParams]);
  const classroomCode = useMemo(() => {
    const raw = searchParams.get("classroomCode");
    return raw ? raw.toUpperCase() : null;
  }, [searchParams]);
  const classroomSessionId = useMemo(() => {
    const raw = searchParams.get("classroomSessionId");
    return raw ? String(raw).trim() : null;
  }, [searchParams]);
  const [classroomToken, setClassroomToken] = useState<string | null>(null);
  const [classroomParticipantId, setClassroomParticipantId] = useState<string | null>(null);
  const [classroomNotice, setClassroomNotice] = useState<string | null>(null);
  const [role, setRole] = useState<"MUNICIPIO" | "CONSULTOR">("MUNICIPIO");
  const [step, setStep] = useState(0);
  const [selectedState, setSelectedState] = useState<string | null>("PE");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState("DRAFT");
  const [consent, setConsent] = useState(false);
  const [dataDiagnostico, setDataDiagnostico] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [respondent, setRespondent] = useState({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
  });
  const [municipioUf, setMunicipioUf] = useState<string | null>(null);
  const [municipios, setMunicipios] = useState<{ id: string; nome: string }[]>([]);
  const [municipioId, setMunicipioId] = useState("");
  const [municipioInfo, setMunicipioInfo] = useState<any>(null);
  const [wikiInfo, setWikiInfo] = useState<any>(null);
  const [wikiLocation, setWikiLocation] = useState<any>(null);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [autosaveInfo, setAutosaveInfo] = useState<{
    state: "idle" | "saving" | "saved" | "error";
    message?: string;
    at?: number;
  }>({ state: "idle" });
  const [versions, setVersions] = useState<any[]>([]);
  const [lastServerVersion, setLastServerVersion] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);
  const [compareRightId, setCompareRightId] = useState<string | null>(null);
  const [diagnosticosList, setDiagnosticosList] = useState<any[]>([]);
  const [diagnosticosStatus, setDiagnosticosStatus] = useState("SUBMITTED");
  const [diagnosticosDateFrom, setDiagnosticosDateFrom] = useState("");
  const [diagnosticosDateTo, setDiagnosticosDateTo] = useState("");
  const [diagnosticosUf, setDiagnosticosUf] = useState("");
  const [diagnosticosLoading, setDiagnosticosLoading] = useState(false);
  const [diagnosticosListError, setDiagnosticosListError] = useState<string | null>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [rankingDisclaimer, setRankingDisclaimer] = useState("");
  const [estadoDiagnosticos, setEstadoDiagnosticos] = useState<any[]>([]);
  const [estadoDiagnosticosLoading, setEstadoDiagnosticosLoading] = useState(false);
  const [municipioSearch, setMunicipioSearch] = useState("");
  const [municipioStatusFilter, setMunicipioStatusFilter] = useState<
    "all" | "t0" | "t1" | "t2" | "t3" | "t4" | "nao-iniciado"
  >("all");
  const [municipioSortBy, setMunicipioSortBy] = useState<"nome" | "status" | "nota">("nome");
  const [municipioSortDir, setMunicipioSortDir] = useState<"asc" | "desc">("asc");
  const [eixos, setEixos] = useState(buildInitialEixos);
  const [participants, setParticipants] = useState<
    { name: string; email: string; phone: string }[]
  >([{ name: "", email: "", phone: "" }]);

  // Fluxo simplificado: quando vier município na query, já pula direto para o formulário.
  useEffect(() => {
    if (!municipioFromQuery) return;
    setMunicipioId(municipioFromQuery);
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipioFromQuery]);

  useEffect(() => {
    if (typeof versions?.[0]?.versionNumber === "number") {
      setLastServerVersion(versions[0].versionNumber);
    }
  }, [versions]);

  useEffect(() => {
    if (!classroomCode) {
      setClassroomToken(null);
      setClassroomParticipantId(null);
      // Novo fluxo: modo sala por classroomSessionId (sem token).
      if (classroomSessionId) {
        try {
          const participantId = sessionStorage.getItem("classroomParticipantId");
          setClassroomParticipantId(participantId || null);
          setClassroomNotice("Modo sala ativo (entrada por município).");
        } catch {
          setClassroomParticipantId(null);
          setClassroomNotice("Modo sala ativo (entrada por município).");
        }
        return;
      }
      setClassroomNotice(null);
      return;
    }
    try {
      const token = sessionStorage.getItem(`classroomToken:${classroomCode}`);
      const participantId = sessionStorage.getItem(`classroomParticipant:${classroomCode}`);
      setClassroomToken(token || null);
      setClassroomParticipantId(participantId || null);
      setClassroomNotice(
        token
          ? `Modo sala ativo (código ${classroomCode}).`
          : `Modo sala ativo (código ${classroomCode}), mas o token não foi encontrado neste navegador. Volte para /sala/entrar e entre novamente.`
      );
    } catch {
      setClassroomToken(null);
      setClassroomParticipantId(null);
      setClassroomNotice(
        `Modo sala ativo (código ${classroomCode}), mas não foi possível ler o token do navegador.`
      );
    }
  }, [classroomCode, classroomSessionId]);

  const clientParam = searchParams.get("client");
  const unitParam = searchParams.get("unit");
  const viewParam = searchParams.get("view");
  const clientLabel = clientParam === "sebrae" ? "Sebrae" : clientParam;
  const isSubmittedOnlyView = viewParam === "submitted" && role === "CONSULTOR";
  const unitLabel = unitParam
    ? unitParam
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
    : null;
  // Considera visão válida tanto no contexto do cliente (client/unit)
  // quanto quando o acesso vem de uma sala de aula (classroomSessionId/classroomCode).
  const isClientView = Boolean(clientLabel) || Boolean(classroomSessionId) || Boolean(classroomCode);
  const isSalaMode = Boolean(classroomSessionId || classroomCode);

  const storageKey = [
    STORAGE_KEY,
    clientParam || "default-client",
    unitParam || "default-unit",
    classroomCode || "standalone",
    classroomParticipantId || "anon",
  ].join(":");

  if (!isClientView) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid max-w-2xl">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8">
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-2">
              Diagnóstico (backup interno)
            </h1>
            <p className="text-fluid-sm text-[#64748B]">
              A visualização padrão do diagnóstico foi movida para o contexto do cliente.
            </p>
            <Link
              href="/clientes/sebrae"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 transition-colors"
            >
              Acessar via Sebrae →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initialPerguntasChave = {
    pcaPacPncp: "",
    integracaoPlanejamento: "",
    sebraeSolucoes: [] as string[],
    sebraeSolucoesOutro: "",
    sistemasUtilizados: {
      comprasGov: false,
      pncp: false,
      sistemaProprio: false,
      semSistema: false,
    },
    tramitacaoEletronicaNota: 0,
    tramitacaoEletronicaComentario: "",
    salaEmpreendedor: "",
    estrategiasFornecedores: "",
    beneficiosLc123: "",
    integracaoSustentabilidade: "",
    consultorAnalise: "",
  };

  const [perguntasChave, setPerguntasChave] = useState(initialPerguntasChave);

  const totalSteps = eixosDiagnostico.length + 3;

  const clearLocalDraft = () => {
    if (typeof window === "undefined") return;
    if (
      !window.confirm(
        "Descartar apenas o rascunho guardado no seu navegador e voltar a editar do zero?\n\n" +
        "• O diagnóstico já salvo no servidor (se existir) NÃO será apagado.\n" +
        "• Apenas o backup local no navegador será removido."
      )
    )
      return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY)) keysToRemove.push(key);
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // ignore
    }
    setStep(0);
    setDraftId(null);
    setStatus("DRAFT");
    setConsent(false);
    setRespondent({ name: "", email: "", phone: "", cnpj: "" });
    setDataDiagnostico(new Date().toISOString().slice(0, 10));
    setSelectedState("PE");
    setMunicipioUf("PE");
    setMunicipioId("");
    setEixos(buildInitialEixos());
    setPerguntasChave(initialPerguntasChave);
    setAutosaveInfo({ state: "idle" });
    setVersions([]);
    setLastServerVersion(null);
  };

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) || localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role) setRole(parsed.role);
      if (parsed.step !== undefined) setStep(parsed.step);
      if (parsed.draftId) setDraftId(parsed.draftId);
      if (parsed.status) setStatus(parsed.status);
      if (parsed.consent) setConsent(parsed.consent);
      if (parsed.respondent) setRespondent(parsed.respondent);
      if (parsed.dataDiagnostico) setDataDiagnostico(parsed.dataDiagnostico);
      if (parsed.selectedState) setSelectedState(parsed.selectedState);
      if (parsed.municipioUf) setMunicipioUf(parsed.municipioUf);
      if (parsed.municipioId) setMunicipioId(parsed.municipioId);
      if (parsed.eixos) setEixos(parsed.eixos);
      if (parsed.perguntasChave) setPerguntasChave(parsed.perguntasChave);
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    if (selectedState && !municipioUf) {
      setMunicipioUf(selectedState);
    }
  }, [selectedState, municipioUf]);

  useEffect(() => {
    const ufParam = searchParams.get("uf");
    const municipioParam = searchParams.get("municipio");
    if (ufParam && ufParam.length === 2) {
      const upper = ufParam.toUpperCase();
      if (selectedState !== upper) {
        setSelectedState(upper);
      }
      if (municipioUf !== upper) {
        setMunicipioUf(upper);
      }
    }
    if (municipioParam) {
      if (municipioId !== municipioParam) {
        setMunicipioId(municipioParam);
      }
      if (step === 0) {
        setStep(1);
      }
    }
  }, [searchParams, municipioId, municipioUf, selectedState, step]);

  useEffect(() => {
    const payload = {
      role,
      step,
      draftId,
      status,
      consent,
      respondent,
      dataDiagnostico,
      municipioId,
      selectedState,
      municipioUf,
      eixos,
      perguntasChave,
      classroomCode,
      classroomParticipantId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [
    storageKey,
    role,
    step,
    draftId,
    status,
    consent,
    respondent,
    dataDiagnostico,
    municipioId,
    selectedState,
    municipioUf,
    eixos,
    perguntasChave,
    classroomCode,
    classroomParticipantId,
  ]);

  useEffect(() => {
    if (!municipioUf) return;
    fetch(`/api/ibge/municipios?uf=${municipioUf}`)
      .then((res) => res.json())
      .then((data) => setMunicipios(data.municipios || []))
      .catch(() => setMunicipios([]));
  }, [municipioUf]);

  useEffect(() => {
    if (!municipioId) return;
    fetch(`/api/ibge/municipio/${municipioId}`)
      .then((res) => res.json())
      .then((data) => setMunicipioInfo(data))
      .catch(() => setMunicipioInfo(null));
  }, [municipioId]);

  useEffect(() => {
    if (!municipioInfo?.nome) return;
    fetch(`/api/wiki/summary?title=${encodeURIComponent(municipioInfo.nome)}`)
      .then((res) => res.json())
      .then((data) => setWikiInfo(data))
      .catch(() => setWikiInfo(null));
  }, [municipioInfo]);

  useEffect(() => {
    if (!municipioInfo?.nome) return;
    fetch(
      `/api/wiki/location?title=${encodeURIComponent(municipioInfo.nome)}&ibgeId=${municipioId}`
    )
      .then((res) => res.json())
      .then((data) => setWikiLocation(data))
      .catch(() => setWikiLocation(null));
  }, [municipioInfo]);

  useEffect(() => {
    if (!selectedState) return;
    setEstadoDiagnosticosLoading(true);
    fetch(`/api/diagnosticos?includeEixos=1&municipioUf=${selectedState}`)
      .then((res) => res.json())
      .then((data) => setEstadoDiagnosticos(data.diagnosticos || []))
      .catch(() => setEstadoDiagnosticos([]))
      .finally(() => setEstadoDiagnosticosLoading(false));
  }, [selectedState]);

  useEffect(() => {
    if (!draftId) return;
    const base = `/api/diagnosticos/${draftId}/versions`;
    const url =
      classroomCode && classroomToken
        ? `${base}?${new URLSearchParams({ classroomCode, classroomToken }).toString()}`
        : base;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setVersions(data.versions || []))
      .catch(() => setVersions([]));
  }, [draftId, classroomCode, classroomToken]);

  useEffect(() => {
    if (!draftId) return;
    fetch(`/api/diagnosticos/${draftId}`)
      .then((res) => res.json())
      .then((data) => {
        const diagnostico = data?.diagnostico;
        if (!diagnostico) return;
        setRespondent({
          name: diagnostico.respondentName || "",
          email: diagnostico.respondentEmail || "",
          phone: diagnostico.respondentPhone || "",
          cnpj: diagnostico.cnpj || "",
        });
        setMunicipioId(diagnostico.municipioIbgeId ? String(diagnostico.municipioIbgeId) : "");
        if (diagnostico.dataDiagnostico) {
          setDataDiagnostico(new Date(diagnostico.dataDiagnostico).toISOString().slice(0, 10));
        }
        if (diagnostico.status) setStatus(diagnostico.status);

        const base = buildInitialEixos();
        const analises = diagnostico.analises || [];
        const merged = base.map((item: any) => {
          const eixoData = diagnostico.eixos?.find((eixo: any) => eixo.eixoKey === item.eixoKey);
          const eixoAnalise = analises.find((eixo: any) => eixo.eixoKey === item.eixoKey);
          return {
            ...item,
            ...(eixoData || {}),
            consultor: {
              positivoParte3: eixoAnalise?.positivoParte3 || "",
              negativoParte3: eixoAnalise?.negativoParte3 || "",
              solucaoParte3: eixoAnalise?.solucaoParte3 || "",
            },
            solucaoSebraeDescs: eixoData?.solucaoSebraeDescs || item.solucaoSebraeDescs,
            solucaoDescricao: eixoData?.solucaoDescricao || item.solucaoDescricao,
          };
        });
        setEixos(merged);

        if (diagnostico.perguntas) {
          setPerguntasChave((prev) => ({
            ...prev,
            ...diagnostico.perguntas,
          }));
        }
      })
      .catch(() => null);
  }, [draftId]);

  useEffect(() => {
    if (role !== "CONSULTOR") return;
    setDiagnosticosLoading(true);
    setDiagnosticosListError(null);
    const params = new URLSearchParams();
    if (diagnosticosStatus) params.set("status", diagnosticosStatus);
    if (diagnosticosUf) params.set("municipioUf", diagnosticosUf);
    if (diagnosticosDateFrom) params.set("updatedAtFrom", diagnosticosDateFrom);
    if (diagnosticosDateTo) params.set("updatedAtTo", diagnosticosDateTo);
    params.set("submittedFromRoomOnly", "1");
    const qs = params.toString();
    fetch(`/api/diagnosticos?${qs}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) {
            setDiagnosticosList([]);
            setDiagnosticosListError("Faça login como consultor/admin para visualizar a lista de diagnósticos.");
            return;
          }
          setDiagnosticosList([]);
          setDiagnosticosListError(data?.error || "Erro ao carregar diagnósticos.");
          return;
        }
        setDiagnosticosList(data.diagnosticos || []);
      })
      .catch(() => setDiagnosticosList([]))
      .finally(() => setDiagnosticosLoading(false));
  }, [role, viewParam, diagnosticosStatus, diagnosticosUf, diagnosticosDateFrom, diagnosticosDateTo]);

  useEffect(() => {
    fetch("/api/diagnosticos/ranking")
      .then((res) => res.json())
      .then((data) => {
        setRanking(data.ranking || []);
        setRankingDisclaimer(data.disclaimer || "");
      })
      .catch(() => {
        setRanking([]);
        setRankingDisclaimer("");
      });
  }, []);

  useEffect(() => {
    if (viewParam === "submitted") setRole("CONSULTOR");
  }, [viewParam]);

  useEffect(() => {
    if (typeof window === "undefined" || role !== "CONSULTOR") return;
    if (window.location.hash !== "#diagnosticos-submetidos") return;
    const t = setTimeout(() => {
      const el = document.getElementById("diagnosticos-submetidos");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(t);
  }, [role]);

  const eixoIndex = step - 2;
  const eixoAtual = eixoIndex >= 0 && eixoIndex < eixosDiagnostico.length ? eixosDiagnostico[eixoIndex] : null;
  const isPerguntasChave = step === eixosDiagnostico.length + 2;

  const isMunicipioEditable =
    role === "MUNICIPIO" && (status === "DRAFT" || status === "RETURNED");
  const isConsultorEditable = role === "CONSULTOR" && ["SUBMITTED", "IN_REVIEW", "RETURNED"].includes(status);

  const isEmailValid =
    respondent.email.trim().length === 0 ||
    respondent.email.includes("@");
  const isIdentificationComplete =
    !!municipioId && respondent.name.trim().length > 0;

  useEffect(() => {
    if (!isMunicipioEditable || !municipioId) return;
    const handler = setTimeout(() => {
      setAutosaveInfo({ state: "saving" });
      saveDraft(undefined, { silent: true })
        .then(() => setAutosaveInfo({ state: "saved", at: Date.now() }))
        .catch(() =>
          setAutosaveInfo({
            state: "error",
            at: Date.now(),
            message: "Falha ao autosalvar no servidor (seu navegador mantém um backup local).",
          })
        );
    }, 1200);
    return () => clearTimeout(handler);
  }, [isMunicipioEditable, municipioId, respondent, eixos, perguntasChave, consent]);

  // Flush extra em perda de foco / troca de aba (reduz perda por expiração e fechamento).
  useEffect(() => {
    if (!isMunicipioEditable || !municipioId) return;

    let t: any = null;
    const schedule = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        setAutosaveInfo({ state: "saving" });
        saveDraft(undefined, { silent: true, keepalive: true })
          .then(() => setAutosaveInfo({ state: "saved", at: Date.now() }))
          .catch(() =>
            setAutosaveInfo({
              state: "error",
              at: Date.now(),
              message: "Falha ao autosalvar no servidor (seu navegador mantém um backup local).",
            })
          );
      }, 250);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") schedule();
    };
    const onBlur = () => schedule();
    const onPageHide = () => schedule();

    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isMunicipioEditable, municipioId, respondent, eixos, perguntasChave, consent]);

  const resolveNota = (eixo: any, bloco: "positivo" | "negativo" | "solucao") => {
    const consultorKey = `${bloco}NotaConsultor`;
    const baseKey = `${bloco}Nota`;
    const value = eixo?.[consultorKey] ?? eixo?.[baseKey];
    return typeof value === "number" ? value : 0;
  };

  const notaGeral = useMemo(() => {
    const notas = eixos
      .map((eixo) => [
        resolveNota(eixo, "positivo"),
        resolveNota(eixo, "negativo"),
        resolveNota(eixo, "solucao"),
      ])
      .flat();
    if (notas.length === 0) return 0;
    return Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10;
  }, [eixos]);

  const buildSnapshotSummary = (snapshot: any) => {
    if (!snapshot) return null;
    const eixoRespostas = snapshot.eixoRespostas || [];
    const notas = eixoRespostas
      .map((eixo: any) => [
        resolveNota(eixo, "positivo"),
        resolveNota(eixo, "negativo"),
        resolveNota(eixo, "solucao"),
      ])
      .flat();
    const notaMedia = notas.length
      ? Math.round((notas.reduce((a: number, b: number) => a + b, 0) / notas.length) * 10) / 10
      : 0;
    const narrativas = eixoRespostas.reduce((total: number, eixo: any) => {
      return (
        total +
        (eixo.positivoParte2 ? eixo.positivoParte2.length : 0) +
        (eixo.negativoParte2 ? eixo.negativoParte2.length : 0) +
        (eixo.solucaoParte2 ? eixo.solucaoParte2.length : 0)
      );
    }, 0);

    const eixoScores: Record<string, number> = {};
    const eixoItemScores: Record<
      string,
      { positivo: number; negativo: number; solucao: number }
    > = {};
    eixoRespostas.forEach((eixo: any) => {
      const values = [
        resolveNota(eixo, "positivo"),
        resolveNota(eixo, "negativo"),
        resolveNota(eixo, "solucao"),
      ];
      eixoScores[eixo.eixoKey] = values.length
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;
      eixoItemScores[eixo.eixoKey] = {
        positivo: resolveNota(eixo, "positivo"),
        negativo: resolveNota(eixo, "negativo"),
        solucao: resolveNota(eixo, "solucao"),
      };
    });

    return { notaMedia, narrativas, eixoScores, eixoItemScores };
  };

  const selectedVersion = versions.find((version) => version.id === selectedVersionId) || null;
  const selectedSummary = selectedVersion ? buildSnapshotSummary(selectedVersion.snapshot) : null;
  const leftVersion = versions.find((version) => version.id === compareLeftId) || null;
  const rightVersion = versions.find((version) => version.id === compareRightId) || null;
  const leftSummary = leftVersion ? buildSnapshotSummary(leftVersion.snapshot) : null;
  const rightSummary = rightVersion ? buildSnapshotSummary(rightVersion.snapshot) : null;

  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => a.versionNumber - b.versionNumber),
    [versions]
  );
  const latestVersion = sortedVersions[sortedVersions.length - 1] || null;
  const latestSummary = latestVersion ? buildSnapshotSummary(latestVersion.snapshot) : null;

  const getSparklinePoints = (values: number[]) => {
    if (values.length === 0) return "";
    const max = Math.max(...values, 10);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    return values
      .map((value, idx) => {
        const x = (idx / Math.max(values.length - 1, 1)) * 120;
        const y = 30 - ((value - min) / range) * 30;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const renderSparkline = (values: number[]) => {
    const points = getSparklinePoints(values);
    return (
      <svg viewBox="0 0 120 30" className="h-6 w-28 text-[#1E3A8A]">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  const getEixoMedia = (eixoKey: string) => {
    const eixo = eixos.find((item) => item.eixoKey === eixoKey);
    if (!eixo) return 0;
    const values = [
      resolveNota(eixo, "positivo"),
      resolveNota(eixo, "negativo"),
      resolveNota(eixo, "solucao"),
    ];
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCnpjBlur = () => {
    if (!respondent.cnpj) return;
    if (!isValidCnpj(respondent.cnpj)) {
      setCnpjError("CNPJ invalido");
      return;
    }
    setCnpjError(null);

    fetch(`/api/diagnosticos/lookup-cnpj?cnpj=${normalizeCnpj(respondent.cnpj)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mapping?.municipio?.ibgeId) {
          setMunicipioId(data.mapping.municipio.ibgeId);
        }
      })
      .catch(() => null);
  };

  const saveDraft = async (
    nextStatus?: string,
    opts?: { silent?: boolean; keepalive?: boolean }
  ) => {
    if (!municipioId) return;
    if (classroomCode && !classroomToken) {
      setClassroomNotice(
        `Modo sala ativo (código ${classroomCode}), mas o token não foi encontrado neste navegador. Volte para /sala/entrar e entre novamente.`
      );
      throw new Error("CLASSROOM_TOKEN_MISSING");
    }
    const eixoRespostas = eixos.map((eixo) => ({
      ...eixo,
      positivoNota: eixo.positivoNota ?? 0,
      negativoNota: eixo.negativoNota ?? 0,
      solucaoNota: eixo.solucaoNota ?? 0,
      positivoNotaConsultor: eixo.positivoNotaConsultor ?? null,
      negativoNotaConsultor: eixo.negativoNotaConsultor ?? null,
      solucaoNotaConsultor: eixo.solucaoNotaConsultor ?? null,
    }));

    const baseVersionNumber =
      typeof lastServerVersion === "number"
        ? lastServerVersion
        : typeof versions?.[0]?.versionNumber === "number"
          ? versions[0].versionNumber
          : undefined;

    const payload = {
      id: draftId,
      municipioIbgeId: municipioId,
      cnpj: normalizeCnpj(respondent.cnpj),
      respondentName: respondent.name,
      respondentEmail: respondent.email,
      respondentPhone: respondent.phone,
      consentLgpd: consent,
      status: nextStatus || status,
      role,
      dataDiagnostico,
      eixoRespostas,
      baseVersionNumber,
      classroomCode: classroomCode || undefined,
      classroomToken: classroomCode ? classroomToken || undefined : undefined,
      classroomSessionId: classroomSessionId || undefined,
      perguntasChave: {
        pcaPacPncp: perguntasChave.pcaPacPncp,
        integracaoPlanejamento: perguntasChave.integracaoPlanejamento,
        sebraeSolucoes: perguntasChave.sebraeSolucoes,
        sistemasUtilizados: perguntasChave.sistemasUtilizados,
        tramitacaoEletronicaNota: perguntasChave.tramitacaoEletronicaNota,
        tramitacaoEletronicaComentario: perguntasChave.tramitacaoEletronicaComentario,
        salaEmpreendedor: perguntasChave.salaEmpreendedor,
        estrategiasFornecedores: perguntasChave.estrategiasFornecedores,
        beneficiosLc123: perguntasChave.beneficiosLc123,
        integracaoSustentabilidade: perguntasChave.integracaoSustentabilidade,
        consultorAnalise: perguntasChave.consultorAnalise,
      },
    };

    const response = await fetch("/api/diagnosticos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: !!opts?.keepalive,
    });

    const data = await response.json();
    if (!response.ok) {
      if (!opts?.silent) {
        setAutosaveInfo({
          state: "error",
          at: Date.now(),
          message: data?.error || "Falha ao salvar. Seu navegador mantém um backup local.",
        });
      }
      throw new Error(data?.error || "SAVE_FAILED");
    }
    if (data?.id) {
      setDraftId(data.id);
      if (nextStatus) setStatus(nextStatus);
      if (typeof data.versionNumber === "number") {
        setLastServerVersion(data.versionNumber);
      }
      if (data.conflictDetected && !opts?.silent) {
        setClassroomNotice(
          `Conflito detectado (last-write-wins). Seus dados foram salvos, mas houve edição concorrente.`
        );
      }
    }
  };

  const submitDiagnostico = async () => {
    if (!draftId) {
      await saveDraft("DRAFT");
    }
    if (!draftId && !municipioId) return;

    const submitId = draftId || (await new Promise<string | null>((resolve) => {
      setTimeout(() => resolve(draftId), 300);
    }));

    if (!submitId) return;

    const submitPayload =
      classroomCode && classroomToken
        ? { classroomCode, classroomToken }
        : classroomSessionId
          ? { classroomSessionId }
          : {};

    await fetch(`/api/diagnosticos/${submitId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitPayload),
    });

    const versionsUrl = (() => {
      const base = `/api/diagnosticos/${submitId}/versions`;
      if (classroomCode && classroomToken) {
        const qs = new URLSearchParams({ classroomCode, classroomToken });
        return `${base}?${qs.toString()}`;
      }
      return base;
    })();

    fetch(versionsUrl)
      .then((res) => res.json())
      .then((data) => setVersions(data.versions || []))
      .catch(() => null);
    setStatus("SUBMITTED");
  };

  const handleConsultorSave = async (nextStatus?: string) => {
    if (!draftId) return;

    const analises = eixos.map((eixo) => ({
      eixoKey: eixo.eixoKey,
      positivoParte3: eixo.consultor.positivoParte3,
      negativoParte3: eixo.consultor.negativoParte3,
      solucaoParte3: eixo.consultor.solucaoParte3,
    }));
    const eixoRespostas = eixos.map((eixo) => ({
      ...eixo,
      positivoNotaConsultor: eixo.positivoNotaConsultor ?? null,
      negativoNotaConsultor: eixo.negativoNotaConsultor ?? null,
      solucaoNotaConsultor: eixo.solucaoNotaConsultor ?? null,
    }));

    const payload = {
      analises,
      eixoRespostas,
      dataDiagnostico,
      perguntasChave: {
        consultorAnalise: perguntasChave.consultorAnalise,
      },
      status: nextStatus,
    };

    await fetch(`/api/diagnosticos/${draftId}/consultor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    fetch(`/api/diagnosticos/${draftId}/versions`)
      .then((res) => res.json())
      .then((data) => setVersions(data.versions || []))
      .catch(() => null);

    if (nextStatus) setStatus(nextStatus);
  };

  const handleStepChange = (nextStep: number) => {
    if (nextStep < 0 || nextStep >= totalSteps) return;
    setStep(nextStep);
  };

  const updateChecklist = (eixoIdx: number, blocoKey: string, index: number, value: string) => {
    setEixos((prev) =>
      prev.map((item, idx) => {
        if (idx !== eixoIdx) return item;
        const key = `${blocoKey}Parte1` as "positivoParte1" | "negativoParte1" | "solucaoParte1";
        const nextList = [...(item[key] as string[])];
        nextList[index] = value;
        return { ...item, [key]: nextList };
      })
    );
  };

  const updateText = (eixoIdx: number, field: string, value: string) => {
    setEixos((prev) => prev.map((item, idx) => (idx === eixoIdx ? { ...item, [field]: value } : item)));
  };

  const updateSolucaoSebrae = (eixoIdx: number, index: number, value: string) => {
    setEixos((prev) =>
      prev.map((item, idx) => {
        if (idx !== eixoIdx) return item;
        const nextList = [...(item.solucaoSebraeDescs || [])];
        nextList[index] = value;
        return { ...item, solucaoSebraeDescs: nextList };
      })
    );
  };

  const updateNota = (eixoIdx: number, field: string, value: number) => {
    const safeValue = Math.min(10, Math.max(0, value));
    setEixos((prev) => prev.map((item, idx) => (idx === eixoIdx ? { ...item, [field]: safeValue } : item)));
  };

  const updateConsultorNota = (eixoIdx: number, field: string, value: number) => {
    const safeValue = Math.min(10, Math.max(0, value));
    setEixos((prev) => prev.map((item, idx) => (idx === eixoIdx ? { ...item, [field]: safeValue } : item)));
  };

  const updateConsultor = (eixoIdx: number, field: string, value: string) => {
    setEixos((prev) =>
      prev.map((item, idx) =>
        idx === eixoIdx
          ? {
            ...item,
            consultor: {
              ...item.consultor,
              [field]: value,
            },
          }
          : item
      )
    );
  };

  const canSubmit = municipioId && consent && status === "DRAFT" && isIdentificationComplete;

  const estados = [
    { code: "AC", name: "Acre" },
    { code: "AL", name: "Alagoas" },
    { code: "AP", name: "Amapá" },
    { code: "AM", name: "Amazonas" },
    { code: "BA", name: "Bahia" },
    { code: "CE", name: "Ceará" },
    { code: "DF", name: "Distrito Federal" },
    { code: "ES", name: "Espírito Santo" },
    { code: "GO", name: "Goiás" },
    { code: "MA", name: "Maranhão" },
    { code: "MT", name: "Mato Grosso" },
    { code: "MS", name: "Mato Grosso do Sul" },
    { code: "MG", name: "Minas Gerais" },
    { code: "PA", name: "Pará" },
    { code: "PB", name: "Paraíba" },
    { code: "PR", name: "Paraná" },
    { code: "PE", name: "Pernambuco" },
    { code: "PI", name: "Piauí" },
    { code: "RJ", name: "Rio de Janeiro" },
    { code: "RN", name: "Rio Grande do Norte" },
    { code: "RS", name: "Rio Grande do Sul" },
    { code: "RO", name: "Rondônia" },
    { code: "RR", name: "Roraima" },
    { code: "SC", name: "Santa Catarina" },
    { code: "SP", name: "São Paulo" },
    { code: "SE", name: "Sergipe" },
    { code: "TO", name: "Tocantins" },
  ];

  const selectedStateName =
    estados.find((estado) => estado.code === selectedState)?.name || "Estado selecionado";
  const statePrepositionByUf: Record<string, "da" | "do" | "de"> = {
    AC: "do",
    AL: "de",
    AP: "do",
    AM: "do",
    BA: "da",
    CE: "do",
    DF: "do",
    ES: "do",
    GO: "de",
    MA: "do",
    MT: "do",
    MS: "do",
    MG: "de",
    PA: "do",
    PB: "da",
    PR: "do",
    PE: "de",
    PI: "do",
    RJ: "do",
    RN: "do",
    RS: "do",
    RO: "de",
    RR: "de",
    SC: "de",
    SP: "de",
    SE: "de",
    TO: "de",
  };
  const selectedStatePreposition =
    (selectedState && statePrepositionByUf[selectedState]) || "de";
  const selectedStateLabel = `${selectedStatePreposition} ${selectedStateName}`;

  const diagnosticoByMunicipio = useMemo(() => {
    const map = new Map<string, { versions: number; ultimaNota: number | null; diagnosticoId: string | null }>();
    estadoDiagnosticos.forEach((item) => {
      if (!item.municipioIbgeId) return;
      const key = String(item.municipioIbgeId);
      if (map.has(key)) return;
      const notas = (item.eixos || [])
        .map((eixo: any) => [
          resolveNota(eixo, "positivo"),
          resolveNota(eixo, "negativo"),
          resolveNota(eixo, "solucao"),
        ])
        .flat();
      const ultimaNota = notas.length
        ? Math.round((notas.reduce((a: number, b: number) => a + b, 0) / notas.length) * 10) / 10
        : null;
      map.set(key, {
        versions: item._count?.versions ?? 0,
        ultimaNota,
        diagnosticoId: item.id ?? null,
      });
    });
    return map;
  }, [estadoDiagnosticos]);

  const resolveStatusLabel = (versions: number) => {
    const level = STATUS_LEVELS.find(
      (item) => versions >= item.min && versions <= item.max
    );
    return level?.key ?? "nao-iniciado";
  };

  const municipiosComStatus = useMemo(() => {
    const search = municipioSearch.trim().toLowerCase();
    const base = municipios
      .filter((m) => !search || m.nome.toLowerCase().includes(search))
      .map((m) => {
        const diagnostico = diagnosticoByMunicipio.get(m.id);
        const versions = diagnostico?.versions ?? 0;
        const statusLabel = resolveStatusLabel(versions);
        return {
          ...m,
          statusLabel,
          ultimaNota: diagnostico?.ultimaNota ?? null,
          diagnosticoId: diagnostico?.diagnosticoId ?? null,
        };
      })
      .filter((item) => {
        if (municipioStatusFilter === "all") return true;
        if (municipioStatusFilter === "nao-iniciado") return item.statusLabel === "nao-iniciado";
        return item.statusLabel === municipioStatusFilter;
      });

    const sorted = [...base].sort((a, b) => {
      if (municipioSortBy === "nome") {
        const cmp = a.nome.localeCompare(b.nome, "pt-BR");
        return municipioSortDir === "asc" ? cmp : -cmp;
      }
      if (municipioSortBy === "status") {
        const idx = (key: string) =>
          STATUS_LEVELS.findIndex((s) => s.key === key);
        const cmp = idx(a.statusLabel) - idx(b.statusLabel);
        return municipioSortDir === "asc" ? cmp : -cmp;
      }
      // nota
      const notaA = a.ultimaNota ?? -Infinity;
      const notaB = b.ultimaNota ?? -Infinity;
      const cmp = notaA === notaB ? 0 : notaA < notaB ? -1 : 1;
      return municipioSortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [
    municipios,
    diagnosticoByMunicipio,
    municipioSearch,
    municipioStatusFilter,
    municipioSortBy,
    municipioSortDir,
  ]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "nao-iniciado": 0,
      t0: 0,
      t1: 0,
      t2: 0,
      t3: 0,
      t4: 0,
    };
    municipios.forEach((m) => {
      const diagnostico = diagnosticoByMunicipio.get(m.id);
      const versions = diagnostico?.versions ?? 0;
      const statusLabel = resolveStatusLabel(versions);
      counts[statusLabel] = (counts[statusLabel] || 0) + 1;
    });
    return counts;
  }, [municipios, diagnosticoByMunicipio]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      {isClientView && (
        <div className="bg-white border-b border-[#E2E8F0] mb-8">
          <div className="container-fluid py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
                Cliente
              </div>
              <div className="text-fluid-xl font-bold text-[#0F172A]">
                {clientLabel}
                {unitLabel ? ` • ${unitLabel}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={
                  clientParam
                    ? unitParam
                      ? `/clientes/${clientParam}/unidades/${unitParam}`
                      : `/clientes/${clientParam}`
                    : "/clientes/sebrae"
                }
                className="text-sm text-[#1E3A8A] hover:underline"
              >
                Voltar ao cliente
              </Link>
              <button
                type="button"
                onClick={clearLocalDraft}
                className="inline-flex items-center gap-2 px-3 py-2 border border-amber-300 text-amber-800 text-sm rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors"
                title="Apenas descarta o rascunho no navegador para voltar a editar do zero. O diagnóstico no servidor não é apagado."
              >
                <Trash2 className="h-4 w-4" /> Descartar rascunho local
              </button>
              <Link
                href="/hubs"
                className="px-3 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
              >
                Hubs
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="container-fluid space-y-10 print-scope">
        <div className="print-only print-section mb-8">
          <div className="border border-[#E2E8F0] p-6 print-card">
            <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
              Rede Inovajuntos • Diagnóstico de Compras Governamentais
            </div>
            <div className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
              Relatório de Diagnóstico
            </div>
            <div className="text-fluid-sm text-[#64748B] mt-2">
              Gerado em {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] tracking-tight">
              Diagnóstico de Maturidade em Compras Governamentais
            </h1>
            <p className="text-fluid-base text-[#64748B]">
              Wizard para municípios (piloto Pernambuco) com devolutiva técnica.
            </p>
            {municipioInfo?.nome && (
              <p className="text-fluid-sm text-[#0F172A] mt-1">
                Município em edição:{" "}
                <span className="font-semibold">
                  {municipioInfo.nome}
                  {municipioInfo.uf ? ` (${municipioInfo.uf})` : ""}
                </span>
              </p>
            )}
            {role === "CONSULTOR" && (
              <div className="mt-3 text-xs text-[#1E3A8A] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-2 inline-flex">
                Modo CONSULTOR ativo: Partes 1 e 2 bloqueadas, somente Parte 3 liberada.
              </div>
            )}
            {classroomNotice && (
              <div
                className={[
                  "mt-3 text-xs px-3 py-2 inline-flex border",
                  classroomToken ? "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]" : "text-rose-700 bg-rose-50 border-rose-200",
                ].join(" ")}
              >
                {classroomNotice}
              </div>
            )}
            {autosaveInfo.state !== "idle" && (
              <div
                className={[
                  "mt-2 text-xs px-3 py-2 inline-flex border",
                  autosaveInfo.state === "saved"
                    ? "text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]"
                    : autosaveInfo.state === "saving"
                      ? "text-[#1E3A8A] bg-[#EEF2FF] border-[#C7D2FE]"
                      : "text-rose-700 bg-rose-50 border-rose-200",
                ].join(" ")}
              >
                {autosaveInfo.state === "saving"
                  ? "Autosave: salvando…"
                  : autosaveInfo.state === "saved"
                    ? `Autosave: salvo${autosaveInfo.at ? ` (${new Date(autosaveInfo.at).toLocaleTimeString("pt-BR")})` : ""}`
                    : `Autosave: ${autosaveInfo.message || "erro ao salvar"}`
                }
              </div>
            )}
          </div>
          {false && (
            <div className="flex items-center gap-3 print-hidden">
              <span className="text-fluid-xs text-[#64748B]">Perfil ativo</span>
              <select
                className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm"
                value={role}
                onChange={(event) => setRole(event.target.value as "MUNICIPIO" | "CONSULTOR")}
              >
                <option value="MUNICIPIO">Município</option>
                <option value="CONSULTOR">Consultor</option>
              </select>
              <span className="text-fluid-xs text-[#64748B]">Status: {statusLabels[status]}</span>
            </div>
          )}
        </div>

        {!isSubmittedOnlyView && (
          <div className="bg-white border border-[#E2E8F0] p-4 print-card print-section">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fluid-xs text-[#64748B]">
                Etapa {step + 1} de {totalSteps}
              </span>
              <span className="text-fluid-xs text-[#64748B]">Nota geral: {notaGeral}</span>
            </div>
            <div className="h-2 bg-slate-100">
              <div
                className="h-2 bg-[#1E3A8A]"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {isSubmittedOnlyView && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <Link
                  href={clientParam && unitParam ? `/diagnostico?client=${clientParam}&unit=${unitParam}` : "/diagnostico"}
                  className="text-fluid-sm text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                >
                  ← Ver página completa do diagnóstico
                </Link>
                <h2 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
                  Diagnósticos submetidos (Análise de respostas recebidas)
                </h2>
                <p className="text-fluid-sm text-[#64748B] mt-1">
                  Esta tela mostra apenas diagnósticos <strong>pendentes de avaliação</strong> (enviados a partir de uma sala). Use os filtros abaixo e &quot;Abrir diagnóstico no wizard&quot; ou &quot;Notas do consultor →&quot; para avaliar. Para ver a página completa (mapa, passos e tabela de municípios), use o link acima.
                </p>
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-8 print-hidden" id="diagnosticos-submetidos">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                  Status
                  <select
                    className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                    value={diagnosticosStatus}
                    onChange={(e) => setDiagnosticosStatus(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="SUBMITTED">Submetido (pendentes de avaliação)</option>
                    <option value="IN_REVIEW">Em análise</option>
                    <option value="RETURNED">Devolvido</option>
                    <option value="FINALIZED">Finalizado</option>
                  </select>
                </label>
                <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                  Estado (UF)
                  <select
                    className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                    value={diagnosticosUf}
                    onChange={(e) => setDiagnosticosUf(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="PE">PE</option>
                    <option value="AL">AL</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="PB">PB</option>
                    <option value="RN">RN</option>
                    <option value="PI">PI</option>
                    <option value="MA">MA</option>
                    <option value="SE">SE</option>
                  </select>
                </label>
                <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                  Data de (atualização)
                  <input
                    type="date"
                    className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                    value={diagnosticosDateFrom}
                    onChange={(e) => setDiagnosticosDateFrom(e.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                  Data até (atualização)
                  <input
                    type="date"
                    className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                    value={diagnosticosDateTo}
                    onChange={(e) => setDiagnosticosDateTo(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-fluid-xs text-[#64748B]">Período rápido:</span>
                <button
                  type="button"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 7);
                    setDiagnosticosDateFrom(start.toISOString().slice(0, 10));
                    setDiagnosticosDateTo(end.toISOString().slice(0, 10));
                  }}
                  className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg hover:bg-slate-50 text-[#0F172A]"
                >
                  Últimos 7 dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 30);
                    setDiagnosticosDateFrom(start.toISOString().slice(0, 10));
                    setDiagnosticosDateTo(end.toISOString().slice(0, 10));
                  }}
                  className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg hover:bg-slate-50 text-[#0F172A]"
                >
                  Últimos 30 dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiagnosticosDateFrom("");
                    setDiagnosticosDateTo("");
                  }}
                  className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg hover:bg-slate-50 text-[#0F172A]"
                >
                  Limpar datas
                </button>
              </div>
              {diagnosticosLoading ? (
                <p className="text-fluid-sm text-[#64748B]">Carregando lista...</p>
              ) : diagnosticosListError ? (
                <p className="text-fluid-sm text-rose-600">{diagnosticosListError}</p>
              ) : diagnosticosList.length === 0 ? (
                <p className="text-fluid-sm text-[#64748B]">Nenhum diagnóstico encontrado.</p>
              ) : (
                <div className="space-y-3 text-fluid-sm text-[#64748B]">
                  {diagnosticosList.map((item) => (
                    <div key={item.id} className="border border-[#E2E8F0] p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[#0F172A] font-semibold">
                          {item.respondentName || "Não informado"}
                        </div>
                        <div className="text-xs text-[#64748B]">{item.status}</div>
                      </div>
                      <div className="text-xs text-[#64748B] mt-1">
                        IBGE: {item.municipioIbgeId || "Não informado"} • CNPJ: {item.cnpj || "Não informado"}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">
                        Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftId(item.id);
                            setStatus(item.status);
                          }}
                          className="text-[#1E3A8A] text-xs hover:underline"
                        >
                          Abrir diagnóstico no wizard
                        </button>
                        {item.municipioIbgeId && (
                          <Link
                            href={`/diagnostico/municipio/${item.municipioIbgeId}`}
                            className="ml-4 text-emerald-700 text-xs hover:underline"
                          >
                            Notas do consultor →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}

        {clientLabel && step === 0 && !isSubmittedOnlyView && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-[1fr_1.2fr] gap-8"
          >
            <div className="bg-white border border-[#E2E8F0] p-8">
              <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-4">
                Escolha o estado
              </h2>
              <p className="text-fluid-sm text-[#64748B] mb-6">
                Mapa do Brasil com estados disponíveis para seleção.
              </p>
              <div className="grid gap-4">
                <BrazilStatesMap
                  activeState={selectedState}
                  allowedStates={estados.map((estado) => estado.code)}
                  className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 shadow-sm min-h-[520px] flex items-center justify-center"
                  onSelectState={(uf) => {
                    setSelectedState(uf);
                    setMunicipioUf(uf);
                  }}
                />
                {selectedState && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                    <span>
                      Estado selecionado: <strong className="text-[#0F172A]">{selectedState}</strong>
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {estados.map((estado) => {
                    const isSelected = selectedState === estado.code;
                    return (
                      <button
                        key={estado.code}
                        type="button"
                        onClick={() => {
                          setSelectedState(estado.code);
                          setMunicipioUf(estado.code);
                        }}
                        className={cn(
                          "border px-3 py-2 text-left rounded-md transition-all text-[11px] font-semibold tracking-[0.06em]",
                          "border-[#E2E8F0] text-[#0F172A] hover:bg-blue-50",
                          isSelected && "ring-2 ring-blue-300"
                        )}
                      >
                        {estado.name} ({estado.code})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-fluid-xl font-bold text-[#0F172A]">
                    Municípios {selectedStateLabel}
                  </h3>
                  <p className="text-fluid-sm text-[#64748B]">
                    Status do diagnóstico (Não iniciado, T0-T4) e última nota.
                  </p>
                </div>
                <div className="text-xs text-[#64748B]">
                  {estadoDiagnosticosLoading ? "Carregando..." : `${municipiosComStatus.length} municípios`}
                </div>
              </div>
              {!selectedState ? (
                <p className="text-fluid-sm text-[#64748B]">
                  Selecione um estado no mapa para carregar a lista de municípios.
                </p>
              ) : (
                <div className="space-y-4">
                  <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                    Buscar município
                    <input
                      value={municipioSearch}
                      onChange={(e) => setMunicipioSearch(e.target.value)}
                      className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm"
                      placeholder="Digite o nome do município"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("nao-iniciado")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "nao-iniciado"
                          ? "border-slate-400 text-slate-700 bg-slate-50"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      Não iniciado ({statusCounts["nao-iniciado"] || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("t0")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "t0"
                          ? "border-amber-500 text-amber-700 bg-amber-50"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      T0 ({statusCounts.t0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("t1")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "t1"
                          ? "border-blue-500 text-blue-700 bg-blue-50"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      T1 ({statusCounts.t1})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("t2")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "t2"
                          ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      T2 ({statusCounts.t2})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("t3")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "t3"
                          ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      T3 ({statusCounts.t3})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("t4")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "t4"
                          ? "border-violet-500 text-violet-700 bg-violet-50"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      T4 ({statusCounts.t4})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMunicipioStatusFilter("all")}
                      className={cn(
                        "px-3 py-1 border",
                        municipioStatusFilter === "all"
                          ? "border-[#1E3A8A] text-[#1E3A8A] bg-[#E0E7FF]"
                          : "border-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      Todos ({municipios.length})
                    </button>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto border border-[#E2E8F0]">
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#64748B] border-b border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={() =>
                          setMunicipioSortBy((prev) =>
                            prev === "nome"
                              ? (setMunicipioSortDir((d) => (d === "asc" ? "desc" : "asc")), "nome")
                              : (setMunicipioSortDir("asc"), "nome")
                          )
                        }
                        className="text-left font-semibold hover:text-[#0F172A]"
                      >
                        Município
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMunicipioSortBy((prev) =>
                            prev === "status"
                              ? (setMunicipioSortDir((d) => (d === "asc" ? "desc" : "asc")), "status")
                              : (setMunicipioSortDir("asc"), "status")
                          )
                        }
                        className="text-center font-semibold hover:text-[#0F172A]"
                      >
                        Status
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMunicipioSortBy((prev) =>
                            prev === "nota"
                              ? (setMunicipioSortDir((d) => (d === "asc" ? "desc" : "asc")), "nota")
                              : (setMunicipioSortDir("desc"), "nota")
                          )
                        }
                        className="text-center font-semibold hover:text-[#0F172A]"
                      >
                        Última nota
                      </button>
                      <span className="text-right">Ação</span>
                    </div>
                    {municipiosComStatus.map((m) => (
                      <div
                        key={m.id}
                        className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-3 py-3 text-fluid-sm border-b border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMunicipioId(m.id);
                            handleStepChange(1);
                          }}
                          className="text-left text-[#0F172A] font-semibold hover:underline"
                        >
                          {m.nome}
                        </button>
                        <span className="text-xs text-[#64748B] uppercase text-center">
                          {STATUS_LEVELS.find((item) => item.key === m.statusLabel)?.label || "-"}
                        </span>
                        <span className={cn("text-xs text-center tabular-nums", notaColorClass(m.ultimaNota))}>
                          {m.ultimaNota != null && !Number.isNaN(Number(m.ultimaNota)) ? m.ultimaNota : "-"}
                        </span>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setMunicipioId(m.id);
                              handleStepChange(1);
                            }}
                            className="text-xs text-[#1E3A8A] hover:underline"
                          >
                            Avaliar →
                          </button>
                          {role === "CONSULTOR" && (
                            <Link
                              href={`/diagnostico/municipio/${m.id}`}
                              className="text-xs text-emerald-700 hover:underline"
                            >
                              Notas do consultor →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedState && (
              <div className="lg:col-span-2 mt-8 space-y-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                  <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                    <ListOrdered className="h-6 w-6 text-[#1E3A8A]" />
                    Fluxo em sala de aula
                  </h3>
                  <p className="text-fluid-sm text-[#64748B] mb-6">
                    Ao criar uma sala para {selectedStateLabel}, siga os passos abaixo. Cada sala pode ter no nome o município ou o código IBGE.
                  </p>
                  <ol className="space-y-4">
                    <li className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] hover:bg-[#F8FAFC] transition-colors">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white text-sm font-bold">1</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] flex items-center gap-2"><Users className="h-5 w-5 text-[#64748B]" /> Passo 1 — Crie a sala do município </h4>
                        <p className="text-fluid-sm text-[#64748B] mt-1">
                          Crie as salas e associe cada sala a um município.  <strong>nome do município</strong> ou o <strong>código IBGE</strong> (ex.: 2600054 para Abreu e Lima).
                        </p>
                        <Link href="/sala/criar" className="inline-flex items-center gap-2 mt-3 text-sm text-[#1E3A8A] hover:underline font-medium">
                          <Plus className="h-4 w-4" /> Criar sala
                        </Link>
                      </div>
                    </li>
                    <li className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] hover:bg-[#F8FAFC] transition-colors">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white text-sm font-bold">2</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] flex items-center gap-2"><ClipboardEdit className="h-5 w-5 text-[#64748B]" /> Passo 2 — Preencha o diagnóstico</h4>
                        <p className="text-fluid-sm text-[#64748B] mt-1">
                          Participantes entram pelo link da sala (número 111, 222, 333…) e preenchem o formulário do município daquela sala.
                        </p>
                        <Link href="/sala/entrar" className="inline-flex items-center gap-2 mt-3 text-sm text-[#1E3A8A] hover:underline font-medium">
                          <LogIn className="h-4 w-4" /> Entrar na sala (participante)
                        </Link>
                      </div>
                    </li>
                    <li className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] hover:bg-[#F8FAFC] transition-colors">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white text-sm font-bold">3</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] flex items-center gap-2"><Search className="h-5 w-5 text-[#64748B]" /> Passo 3 — Analise as respostas recebidas (Análise de Respostas Recebidas)</h4>
                        <p className="text-fluid-sm text-[#64748B] mt-1">
                          Consultor acessa a ficha do município, lê as respostas e adiciona notas e comentários (análise). Para abrir a tela só de diagnósticos enviados para avaliação,{" "}
                          <Link
                            href={clientParam && unitParam ? `/diagnostico?client=${clientParam}&unit=${unitParam}&view=submitted` : "/diagnostico?view=submitted"}
                            className="text-[#1E3A8A] font-medium underline hover:no-underline"
                          >
                            clique aqui
                          </Link>
                          .
                        </p>
                        {role === "CONSULTOR" && (
                          <Link
                            href={clientParam && unitParam ? `/diagnostico?client=${clientParam}&unit=${unitParam}&view=submitted` : "/diagnostico?view=submitted"}
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
                          >
                            <Search className="h-4 w-4" /> Ir para Diagnósticos submetidos (só pendentes)
                          </Link>
                        )}
                      </div>
                    </li>
                    <li className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] hover:bg-[#F8FAFC] transition-colors">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white text-sm font-bold">4</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] flex items-center gap-2"><CheckCircle className="h-5 w-5 text-[#64748B]" /> Passo 4 — Aprove o relatório</h4>
                        <p className="text-fluid-sm text-[#64748B] mt-1">
                          Após revisar as respostas e as notas do consultor, altere o status para &quot;Finalizado&quot; ou &quot;Submetido&quot; na ficha do município.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] hover:bg-[#F8FAFC] transition-colors">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white text-sm font-bold">5</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] flex items-center gap-2"><Printer className="h-5 w-5 text-[#64748B]" /> Passo 5 — Imprima o relatório final do município</h4>
                        <p className="text-fluid-sm text-[#64748B] mt-1">
                          Na ficha do município, use &quot;Imprimir relatório&quot; para gerar o documento final (conteúdo + notas + recomendações).
                        </p>
                        <p className="text-fluid-xs text-[#64748B] mt-2">
                          Ou use o botão &quot;Relatório&quot; na tabela de municípios abaixo.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-6">
                  <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6 text-[#1E3A8A]" />
                    Área administrativa
                  </h3>
                  <p className="text-fluid-sm text-[#64748B] mb-4">
                    Interfaces restritas aos municípios do estado selecionado no mapa ({selectedState}). Todas as ações abaixo valem apenas para {selectedStateLabel}. Validação por estado.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#64748B] mb-2">
                        <Users className="h-4 w-4" /> Visão ativa
                      </div>
                      <p className="text-fluid-sm text-[#0F172A] font-medium">
                        {role === "CONSULTOR" ? "Consultor" : "Município"}
                      </p>
                      <p className="text-fluid-xs text-[#64748B] mt-1">
                        {role === "CONSULTOR"
                          ? "Partes 1 e 2 bloqueadas; edição das notas e análises da Parte 3 (consultor)."
                          : "Preenchimento das Partes 1 e 2 pelo município; Parte 3 somente leitura."}
                      </p>
                      <p className="text-fluid-xs text-[#64748B] mt-2">
                        Altere o perfil no seletor acima para trocar a visão.
                      </p>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#64748B] mb-2">
                        <LayoutDashboard className="h-4 w-4" /> Salas
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href="/sala/criar"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-[#1E3A8A] text-white text-sm rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
                        >
                          <Plus className="h-4 w-4" /> Criar sala
                        </Link>
                        <Link
                          href="/sala"
                          className="inline-flex items-center gap-2 px-3 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Gerenciar salas
                        </Link>
                        <Link
                          href="/sala/entrar"
                          className="inline-flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] text-[#64748B] text-sm rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <LogIn className="h-4 w-4" /> Entrar na sala (participante)
                        </Link>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-fluid-lg font-semibold text-[#0F172A] mb-3">
                    Municípios {selectedStateLabel} — Criar, editar e ajustar
                  </h4>
                  <p className="text-fluid-sm text-[#64748B] mb-4">
                    Para cada município: estado (UF), status (Não iniciado, T0–T4) e ações. Use <strong>Radiografia</strong> para ver o gráfico de evolução (T0→T1→…) e relatórios por versão — a página existe para todos os municípios (gráfico vazio quando ainda não há dados).
                  </p>
                  {/* Filtros inteligentes (como na tabela de municípios acima) */}
                  <div className="mb-4 space-y-3">
                    <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                      Buscar município
                      <input
                        value={municipioSearch}
                        onChange={(e) => setMunicipioSearch(e.target.value)}
                        className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg max-w-xs"
                        placeholder="Digite o nome do município"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("nao-iniciado")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "nao-iniciado"
                            ? "border-slate-400 text-slate-700 bg-slate-100"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
                        )}
                      >
                        Não iniciado ({statusCounts["nao-iniciado"] ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("t0")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "t0"
                            ? "border-amber-500 text-amber-800 bg-amber-100"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-amber-50/50"
                        )}
                      >
                        T0 ({statusCounts.t0 ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("t1")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "t1"
                            ? "border-blue-500 text-blue-800 bg-blue-100"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-blue-50/50"
                        )}
                      >
                        T1 ({statusCounts.t1 ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("t2")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "t2"
                            ? "border-emerald-500 text-emerald-800 bg-emerald-100"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-emerald-50/50"
                        )}
                      >
                        T2 ({statusCounts.t2 ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("t3")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "t3"
                            ? "border-indigo-500 text-indigo-800 bg-indigo-100"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-indigo-50/50"
                        )}
                      >
                        T3 ({statusCounts.t3 ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("t4")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "t4"
                            ? "border-violet-500 text-violet-800 bg-violet-100"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-violet-50/50"
                        )}
                      >
                        T4 ({statusCounts.t4 ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMunicipioStatusFilter("all")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border font-medium transition-colors",
                          municipioStatusFilter === "all"
                            ? "border-[#1E3A8A] text-[#1E3A8A] bg-blue-50"
                            : "border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
                        )}
                      >
                        Todos ({municipios.length})
                      </button>
                    </div>
                  </div>
                  <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                    <table className="w-full text-fluid-sm border-collapse">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.18em] text-[#64748B] bg-slate-50 border-b border-[#E2E8F0]">
                          <th className="text-left py-3 px-4 w-[72px]">Estado</th>
                          <th className="text-left py-3 px-4 min-w-[140px]">
                            <button
                              type="button"
                              onClick={() =>
                                setMunicipioSortBy((prev) =>
                                  prev === "nome"
                                    ? (setMunicipioSortDir((d) => (d === "asc" ? "desc" : "asc")), "nome")
                                    : (setMunicipioSortDir("asc"), "nome")
                                )
                              }
                              className="font-semibold hover:text-[#0F172A]"
                            >
                              Município
                            </button>
                          </th>
                          <th className="text-center py-3 px-4 w-[100px]">
                            <button
                              type="button"
                              onClick={() =>
                                setMunicipioSortBy((prev) =>
                                  prev === "status"
                                    ? (setMunicipioSortDir((d) => (d === "asc" ? "desc" : "asc")), "status")
                                    : (setMunicipioSortDir("asc"), "status")
                                )
                              }
                              className="font-semibold hover:text-[#0F172A]"
                            >
                              Status
                            </button>
                          </th>
                          <th className="text-center py-3 px-4 w-[100px]">
                            <button
                              type="button"
                              onClick={() =>
                                setMunicipioSortBy((prev) =>
                                  prev === "nota"
                                    ? (setMunicipioSortDir((d) => (d === "asc" ? "desc" : "asc")), "nota")
                                    : (setMunicipioSortDir("desc"), "nota")
                                )
                              }
                              className="font-semibold hover:text-[#0F172A]"
                            >
                              Última nota
                            </button>
                          </th>
                          <th className="text-right py-3 px-4 min-w-[200px]">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {municipiosComStatus.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] last:border-b-0"
                          >
                            <td className="py-3 px-4 text-left font-semibold text-[#0F172A] align-middle">
                              {selectedState}
                            </td>
                            <td className="py-3 px-4 text-left align-middle">
                              <Link
                                href={`/diagnostico/municipio/${m.id}`}
                                className="text-[#0F172A] font-medium hover:text-[#1E3A8A] hover:underline"
                              >
                                {m.nome}
                              </Link>
                            </td>
                            <td className="py-3 px-4 text-center align-middle">
                              <span
                                className={cn(
                                  "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                                  m.statusLabel === "nao-iniciado" && "bg-slate-100 text-slate-700",
                                  m.statusLabel === "t0" && "bg-amber-100 text-amber-800",
                                  m.statusLabel === "t1" && "bg-blue-100 text-blue-800",
                                  m.statusLabel === "t2" && "bg-emerald-100 text-emerald-800",
                                  m.statusLabel === "t3" && "bg-indigo-100 text-indigo-800",
                                  m.statusLabel === "t4" && "bg-violet-100 text-violet-800"
                                )}
                              >
                                {STATUS_LEVELS.find((l) => l.key === m.statusLabel)?.label ?? "-"}
                              </span>
                            </td>
                            <td className={cn("py-3 px-4 text-center align-middle tabular-nums", notaColorClass(m.ultimaNota))}>
                              {m.ultimaNota != null && !Number.isNaN(Number(m.ultimaNota)) ? m.ultimaNota : "-"}
                            </td>
                            <td className="py-3 px-4 text-right align-middle">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMunicipioId(m.id);
                                    handleStepChange(1);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[#1E3A8A] hover:underline rounded border border-[#E2E8F0] hover:border-[#1E3A8A]/30"
                                >
                                  <FileEdit className="h-3.5 w-3.5" />
                                  {m.diagnosticoId ? "Editar" : "Criar"}
                                </button>
                                <Link
                                  href={`/diagnostico/municipio/${m.id}`}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[#0F766E] hover:underline rounded border border-teal-200 hover:bg-teal-50 font-medium"
                                  title="Radiografia dos diagnósticos: gráfico de evolução e relatórios T0, T1, …"
                                >
                                  <BarChart2 className="h-3.5 w-3.5" /> Radiografia
                                </Link>
                                <Link
                                  href={`/diagnostico/municipio/${m.id}`}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[#1E3A8A] hover:underline rounded border border-[#E2E8F0] hover:bg-slate-50"
                                >
                                  <FileText className="h-3.5 w-3.5" /> Ver diagnóstico
                                </Link>
                                {m.diagnosticoId && (
                                  <Link
                                    href={`/diagnostico/imprimir?id=${encodeURIComponent(m.diagnosticoId)}`}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] rounded border border-[#E2E8F0] hover:bg-slate-50"
                                  >
                                    <FileText className="h-3.5 w-3.5" /> Relatório
                                  </Link>
                                )}
                                {role === "CONSULTOR" && m.diagnosticoId && (
                                  <Link
                                    href={`/diagnostico/municipio/${m.id}#analise`}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-emerald-700 hover:underline rounded border border-emerald-200 hover:bg-emerald-50"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> Análise consultor
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {step === 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E2E8F0] rounded-xl p-10"
          >
            <h2 className="text-fluid-2xl font-bold text-[#0F172A]">Iniciar diagnóstico</h2>
            <p className="text-fluid-sm text-[#64748B] mt-2">
              Interface simplificada: consultor cria/ativa a sala por município e o participante entra pela lista de salas ativas.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 print-hidden">
              <Link
                href="/sala/criar"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
              >
                Criar sala (consultor)
              </Link>
              <Link
                href="/sala/entrar"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
              >
                Entrar (participante)
              </Link>
            </div>
            <div className="mt-6 text-xs text-[#64748B]">
              Dica: se você veio de uma sala ativa, o formulário abre automaticamente (município e sala já vêm selecionados).
            </div>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-[1.1fr_1fr] gap-8"
          >
            <div className="bg-white border border-[#E2E8F0] p-8">
              <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-6">
                Identificação do município
              </h2>
              <div className="grid gap-4">
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  Nome do responsável (obrigatório)
                  <input
                    value={respondent.name}
                    onChange={(e) => setRespondent((prev) => ({ ...prev, name: e.target.value }))}
                    className="border border-[#E2E8F0] px-3 py-2"
                  />
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  E-mail (obrigatório)
                  <input
                    value={respondent.email}
                    onChange={(e) => setRespondent((prev) => ({ ...prev, email: e.target.value }))}
                    className="border border-[#E2E8F0] px-3 py-2"
                  />
                  {!isEmailValid && respondent.email.length > 0 && (
                    <span className="text-xs text-rose-600">Informe um e-mail válido.</span>
                  )}
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  Telefone (opcional)
                  <input
                    value={respondent.phone}
                    onChange={(e) => setRespondent((prev) => ({ ...prev, phone: e.target.value }))}
                    className="border border-[#E2E8F0] px-3 py-2"
                  />
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  Data do diagnóstico
                  <input
                    type="date"
                    value={dataDiagnostico}
                    onChange={(e) => setDataDiagnostico(e.target.value)}
                    className="border border-[#E2E8F0] px-3 py-2"
                  />
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  CNPJ do município
                  <input
                    value={respondent.cnpj}
                    onChange={(e) => setRespondent((prev) => ({ ...prev, cnpj: e.target.value }))}
                    onBlur={handleCnpjBlur}
                    className="border border-[#E2E8F0] px-3 py-2"
                  />
                  {cnpjError && <span className="text-xs text-red-500">{cnpjError}</span>}
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  UF (piloto)
                  <input
                    value={municipioUf || ""}
                    readOnly
                    className="border border-[#E2E8F0] px-3 py-2 bg-slate-50"
                  />
                </label>
                {isSalaMode ? (
                  <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                    Município
                    <input
                      value={
                        municipioInfo?.nome
                          ? `${municipioInfo.nome} / ${municipioInfo.uf || ""}`
                          : municipioId
                      }
                      readOnly
                      className="border border-[#E2E8F0] px-3 py-2 bg-slate-50"
                    />
                    <span className="text-xs text-[#94A3B8]">
                      Definido pela sala de aula; não é possível alterar o município neste modo.
                    </span>
                  </label>
                ) : (
                  <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                    Município
                    <select
                      value={municipioId}
                      onChange={(e) => setMunicipioId(e.target.value)}
                      className="border border-[#E2E8F0] px-3 py-2"
                      disabled={!municipioUf}
                    >
                      <option value="">Selecione</option>
                      {municipios.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {/* Participantes da sala */}
              <div className="mt-6 border-t border-[#E2E8F0] pt-4">
                <h3 className="text-fluid-base font-semibold text-[#0F172A] mb-2">
                  Participantes na sala (opcional)
                </h3>
                <p className="text-fluid-xs text-[#64748B] mb-3">
                  Registre os nomes (e, se desejar, e-mail e telefone) das pessoas que participarão do
                  preenchimento em sala de aula. Apenas o nome é obrigatório.
                </p>
                <div className="space-y-3">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-3 items-center"
                    >
                      <input
                        value={p.name}
                        onChange={(e) =>
                          setParticipants((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, name: e.target.value } : item
                            )
                          )
                        }
                        className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm"
                        placeholder="Nome do participante (obrigatório)"
                      />
                      <input
                        value={p.email}
                        onChange={(e) =>
                          setParticipants((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, email: e.target.value } : item
                            )
                          )
                        }
                        className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm"
                        placeholder="E-mail (opcional)"
                      />
                      <input
                        value={p.phone}
                        onChange={(e) =>
                          setParticipants((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, phone: e.target.value } : item
                            )
                          )
                        }
                        className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm"
                        placeholder="Telefone (opcional)"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setParticipants((prev) => [...prev, { name: "", email: "", phone: "" }])
                  }
                  className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 border border-dashed border-[#1E3A8A] text-xs text-[#1E3A8A] rounded-lg hover:bg-[#EFF6FF]"
                >
                  + Adicionar participante
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 print-hidden">
                <button
                  type="button"
                  onClick={() => handleStepChange(step + 1)}
                  className="px-5 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm"
                  disabled={!isIdentificationComplete}
                >
                  Iniciar diagnóstico
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-8">
              <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Cartão do município</h3>
              {municipioInfo ? (
                <div className="space-y-3 text-fluid-sm text-[#64748B]">
                  <div className="text-fluid-base text-[#0F172A] font-semibold">
                    {municipioInfo.nome} / {municipioInfo.uf}
                  </div>
                  <div>
                    População{municipioInfo.populacaoFonte ? ` (${municipioInfo.populacaoFonte})` : ""}:{" "}
                    {municipioInfo.populacao ?? "Não informado na fonte consultada"}
                  </div>
                  <div>Área territorial: {municipioInfo.areaKm2 ?? "Não informado na fonte consultada"}</div>
                  <div>Densidade: {municipioInfo.densidade ?? "Não informado na fonte consultada"}</div>
                  <div>PIB per capita: {municipioInfo.pibPerCapita ?? "Não informado na fonte consultada"}</div>
                  <div>IDHM: {municipioInfo.idhm ?? "Não informado na fonte consultada"}</div>
                  <a
                    href={municipioInfo.fontes?.ibgeMunicipio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E3A8A] hover:underline"
                  >
                    Fonte IBGE
                  </a>
                  {municipioInfo.fontes?.origemMunicipios && (
                    <div className="text-xs text-[#64748B]">
                      Origem dos dados: {municipioInfo.fontes.origemMunicipios}
                    </div>
                  )}
                  {wikiInfo?.extract && (
                    <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                      <div className="text-fluid-xs uppercase tracking-[0.18em] text-[#64748B] mb-2">
                        Complementar (Wikipedia)
                      </div>
                      <p className="text-fluid-sm text-[#0F172A] leading-[1.6]">
                        {wikiInfo.extract}
                      </p>
                      <a
                        href={wikiInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1E3A8A] text-fluid-xs hover:underline"
                      >
                        Conteúdo não oficial
                      </a>
                      {(wikiLocation?.locationUrl ||
                        municipioInfo.fontes?.wikipediaLocalizacao) && (
                          <div className="mt-2">
                            <a
                              href={
                                wikiLocation?.locationUrl ||
                                municipioInfo.fontes?.wikipediaLocalizacao
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0F172A] font-semibold hover:underline"
                            >
                              Localização no mapa (Wikipedia)
                            </a>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-fluid-sm text-[#64748B]">
                  Selecione um município para carregar dados oficiais.
                </p>
              )}
            </div>

            {false && (
              <div className="bg-white border border-[#E2E8F0] p-8 print-card print-section">
                <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-2">Linha do tempo de versões</h3>
                <p className="text-fluid-sm text-[#64748B] mb-4">
                  Clique em uma versão para ler o conteúdo completo (identificação, eixos e perguntas-chave) dessa etapa.
                </p>
                {versions.length === 0 ? (
                  <p className="text-fluid-sm text-[#64748B]">
                    Nenhuma versão registrada ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <button
                        type="button"
                        key={version.id}
                        onClick={() => setSelectedVersionId(version.id)}
                        className={cn(
                          "w-full text-left border p-3 text-fluid-sm transition-colors rounded-lg",
                          selectedVersionId === version.id
                            ? "border-[#1E3A8A] bg-[#EFF6FF] ring-2 ring-[#1E3A8A]/30"
                            : "border-[#E2E8F0] hover:border-[#1E3A8A] hover:bg-[#F8FAFC]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#0F172A] font-semibold">
                            Versão {version.versionNumber}
                          </span>
                          <span className="text-[#64748B] text-xs shrink-0">
                            {new Date(version.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="text-[#64748B] text-xs mt-1">
                          Origem: {version.createdByRole} • Status: {version.snapshot?.status || "N/A"}
                        </div>
                        <div className="mt-2 text-[#1E3A8A] text-xs font-medium flex items-center gap-1">
                          {selectedVersionId === version.id ? "▼ Conteúdo abaixo" : "Clique para ver conteúdo"}
                        </div>
                      </button>
                    ))}

                    {selectedVersion && selectedSummary && (
                      <div className="border-2 border-[#1E3A8A] rounded-xl bg-[#F8FAFC] p-6 mt-6">
                        <h4 className="text-fluid-lg font-bold text-[#0F172A] mb-1">
                          Conteúdo da Versão {selectedVersion.versionNumber}
                        </h4>
                        <p className="text-fluid-xs text-[#64748B] mb-4">
                          Dados registrados nesta versão (leitura). Status: {selectedVersion.snapshot?.status || "N/A"} • {new Date(selectedVersion.createdAt).toLocaleString("pt-BR")}
                        </p>

                        <div className="space-y-6">
                          <section>
                            <h5 className="text-sm font-semibold text-[#0F172A] mb-2 uppercase tracking-wider">Etapa 1 — Identificação</h5>
                            <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 grid gap-2 text-fluid-sm text-[#0F172A]">
                              <div><span className="text-[#64748B]">Responsável:</span> {selectedVersion.snapshot?.respondentName ?? "—"}</div>
                              <div><span className="text-[#64748B]">E-mail:</span> {selectedVersion.snapshot?.respondentEmail ?? "—"}</div>
                              <div><span className="text-[#64748B]">Telefone:</span> {selectedVersion.snapshot?.respondentPhone ?? "—"}</div>
                              <div><span className="text-[#64748B]">Data do diagnóstico:</span> {selectedVersion.snapshot?.dataDiagnostico ? new Date(selectedVersion.snapshot.dataDiagnostico).toLocaleDateString("pt-BR") : "—"}</div>
                            </div>
                          </section>

                          <section>
                            <h5 className="text-sm font-semibold text-[#0F172A] mb-2 uppercase tracking-wider">Etapas 2+ — Eixos (notas e textos)</h5>
                            <div className="space-y-4">
                              {eixosDiagnostico.map((eixo) => {
                                const eixoSnapshot = selectedVersion.snapshot?.eixoRespostas?.find((item: any) => item.eixoKey === eixo.key);
                                const eixoAnalise = selectedVersion.snapshot?.analises?.find((item: any) => item.eixoKey === eixo.key);
                                return (
                                  <div key={eixo.key} className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                                    <div className="font-semibold text-[#0F172A] mb-2">{eixo.title}</div>
                                    <div className="text-xs text-[#64748B] mb-2">
                                      Notas: Positivo {resolveNota(eixoSnapshot, "positivo")} • Negativo {resolveNota(eixoSnapshot, "negativo")} • Solução {resolveNota(eixoSnapshot, "solucao")}
                                    </div>
                                    <div className="grid gap-3 text-fluid-xs">
                                      <div>
                                        <span className="uppercase tracking-wider text-[#94A3B8] text-[10px]">Parte 1 (checklist)</span>
                                        <div className="mt-1 text-[#64748B]">
                                          Positivos: {(eixoSnapshot?.positivoParte1 || []).filter(Boolean).join(", ") || "—"} • Negativos: {(eixoSnapshot?.negativoParte1 || []).filter(Boolean).join(", ") || "—"} • Soluções: {(eixoSnapshot?.solucaoParte1 || []).filter(Boolean).join(", ") || "—"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="uppercase tracking-wider text-[#94A3B8] text-[10px]">Parte 2 (narrativas)</span>
                                        <div className="mt-1 text-[#0F172A] space-y-1">
                                          {eixoSnapshot?.positivoParte2 && <div><strong>Positivo:</strong> {eixoSnapshot.positivoParte2}</div>}
                                          {eixoSnapshot?.negativoParte2 && <div><strong>Negativo:</strong> {eixoSnapshot.negativoParte2}</div>}
                                          {eixoSnapshot?.solucaoParte2 && <div><strong>Solução:</strong> {eixoSnapshot.solucaoParte2}</div>}
                                          {!eixoSnapshot?.positivoParte2 && !eixoSnapshot?.negativoParte2 && !eixoSnapshot?.solucaoParte2 && <span className="text-[#64748B]">—</span>}
                                        </div>
                                      </div>
                                      {(eixoAnalise?.positivoParte3 || eixoAnalise?.negativoParte3 || eixoAnalise?.solucaoParte3) && (
                                        <div>
                                          <span className="uppercase tracking-wider text-[#94A3B8] text-[10px]">Parte 3 (consultor)</span>
                                          <div className="mt-1 text-[#0F172A] space-y-1">
                                            {eixoAnalise?.positivoParte3 && <div><strong>Positivo:</strong> {eixoAnalise.positivoParte3}</div>}
                                            {eixoAnalise?.negativoParte3 && <div><strong>Negativo:</strong> {eixoAnalise.negativoParte3}</div>}
                                            {eixoAnalise?.solucaoParte3 && <div><strong>Solução:</strong> {eixoAnalise.solucaoParte3}</div>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </section>

                          {selectedVersion.snapshot?.perguntasChave && (
                            <section>
                              <h5 className="text-sm font-semibold text-[#0F172A] mb-2 uppercase tracking-wider">Perguntas-chave</h5>
                              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 text-fluid-sm text-[#0F172A]">
                                <pre className="whitespace-pre-wrap font-sans text-xs text-[#64748B]">
                                  {JSON.stringify(selectedVersion.snapshot.perguntasChave, null, 2)}
                                </pre>
                              </div>
                            </section>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedSummary && latestSummary && (
                      <details className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white mt-4">
                        <summary className="px-4 py-3 text-fluid-sm font-medium text-[#0F172A] cursor-pointer hover:bg-[#F8FAFC]">
                          Comparativo entre versões (notas e evolução)
                        </summary>
                        <div className="border-t border-[#E2E8F0] p-4">
                          <div className="text-fluid-xs uppercase tracking-[0.18em] text-[#64748B] mb-3">
                            Comparativo simples
                          </div>
                          <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                            <div>
                              Nota média (versão selecionada):{" "}
                              <strong className="text-[#0F172A]">
                                {selectedSummary?.notaMedia}
                              </strong>
                            </div>
                            <div>
                              Nota média (última versão):{" "}
                              <strong className="text-[#0F172A]">
                                {latestSummary?.notaMedia}
                              </strong>
                            </div>
                            <div>
                              Volume de narrativa (chars) versão selecionada:{" "}
                              <strong className="text-[#0F172A]">
                                {selectedSummary?.narrativas}
                              </strong>
                            </div>
                            <div>
                              Volume de narrativa (chars) última versão:{" "}
                              <strong className="text-[#0F172A]">
                                {latestSummary?.narrativas}
                              </strong>
                            </div>
                          </div>
                          <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                            <div className="text-fluid-xs uppercase tracking-[0.18em] text-[#64748B] mb-3">
                              Evolução da nota geral
                            </div>
                            <div className="flex items-center gap-4 text-fluid-xs text-[#64748B]">
                              {renderSparkline(
                                sortedVersions.map(
                                  (version) =>
                                    buildSnapshotSummary(version.snapshot)?.notaMedia ?? 0
                                )
                              )}
                              <span>{sortedVersions.length} versoes registradas</span>
                            </div>
                          </div>
                          <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                            <div className="text-fluid-xs uppercase tracking-[0.18em] text-[#64748B] mb-3">
                              Comparativo por eixo (T0, T1, T2...)
                            </div>
                            <div className="flex flex-wrap gap-3 mb-4 text-fluid-xs text-[#64748B]">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                melhorou
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                caiu
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                estável
                              </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 mb-4">
                              <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                                Comparar de (T0...)
                                <select
                                  className="border border-[#E2E8F0] px-2 py-1 text-fluid-sm"
                                  value={compareLeftId || ""}
                                  onChange={(event) => setCompareLeftId(event.target.value || null)}
                                >
                                  <option value="">Selecione</option>
                                  {versions.map((version) => (
                                    <option key={version.id} value={version.id}>
                                      T{version.versionNumber - 1} ({new Date(version.createdAt).toLocaleDateString("pt-BR")})
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                                Comparar para (Tn)
                                <select
                                  className="border border-[#E2E8F0] px-2 py-1 text-fluid-sm"
                                  value={compareRightId || ""}
                                  onChange={(event) => setCompareRightId(event.target.value || null)}
                                >
                                  <option value="">Selecione</option>
                                  {versions.map((version) => (
                                    <option key={version.id} value={version.id}>
                                      T{version.versionNumber - 1} ({new Date(version.createdAt).toLocaleDateString("pt-BR")})
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <div className="grid gap-3 text-fluid-sm text-[#64748B]">
                              {eixosDiagnostico.map((eixo) => (
                                <div key={eixo.key} className="flex items-start justify-between gap-4">
                                  <div>
                                    <div>{eixo.title}</div>
                                    <div className="text-xs text-[#94A3B8] mt-1">
                                      Positivo: {latestSummary?.eixoItemScores?.[eixo.key]?.positivo ?? 0} •
                                      Negativo: {latestSummary?.eixoItemScores?.[eixo.key]?.negativo ?? 0} •
                                      Solucao: {latestSummary?.eixoItemScores?.[eixo.key]?.solucao ?? 0}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {renderSparkline(
                                      sortedVersions.map((version) =>
                                        buildSnapshotSummary(version.snapshot)?.eixoScores?.[eixo.key] ?? 0
                                      )
                                    )}
                                    <span className="text-[#0F172A] font-semibold">
                                      <span className="text-xs text-[#64748B] mr-1">
                                        T{(selectedVersion?.versionNumber || 1) - 1}
                                      </span>
                                      {selectedSummary?.eixoScores?.[eixo.key] ?? 0}
                                      <span className="mx-2 text-[#94A3B8]">→</span>
                                      <span className="text-xs text-[#64748B] mr-1">
                                        T{(latestVersion?.versionNumber || 1) - 1}
                                      </span>
                                      <span
                                        className={cn(
                                          (latestSummary?.eixoScores?.[eixo.key] ?? 0) > (selectedSummary?.eixoScores?.[eixo.key] ?? 0)
                                            ? "text-emerald-600"
                                            : (latestSummary?.eixoScores?.[eixo.key] ?? 0) < (selectedSummary?.eixoScores?.[eixo.key] ?? 0)
                                              ? "text-rose-600"
                                              : "text-[#0F172A]"
                                        )}
                                      >
                                        {latestSummary?.eixoScores?.[eixo.key] ?? 0}
                                      </span>
                                      <span className="ml-2 text-xs text-[#94A3B8]">
                                        {(() => {
                                          const delta =
                                            (latestSummary?.eixoScores?.[eixo.key] ?? 0) -
                                            (selectedSummary?.eixoScores?.[eixo.key] ?? 0);
                                          return delta === 0 ? "= 0" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
                                        })()}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {selectedVersion && selectedSummary && (
                              <div className="mt-6 border-t border-[#E2E8F0] pt-4">
                                <div className="text-fluid-xs uppercase tracking-[0.18em] text-[#64748B] mb-3">
                                  Detalhes da versão selecionada (T{selectedVersion.versionNumber - 1})
                                </div>
                                <div className="text-xs text-[#94A3B8] mb-3">
                                  Status registrado: {selectedVersion.snapshot?.status || "N/A"}
                                </div>
                                <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                                  {eixosDiagnostico.map((eixo) => {
                                    const eixoSnapshot = selectedVersion.snapshot?.eixoRespostas?.find(
                                      (item: any) => item.eixoKey === eixo.key
                                    );
                                    const eixoAnalise = selectedVersion.snapshot?.analises?.find(
                                      (item: any) => item.eixoKey === eixo.key
                                    );
                                    return (
                                      <div key={eixo.key} className="border border-[#E2E8F0] p-3">
                                        <div className="font-semibold text-[#0F172A]">{eixo.title}</div>
                                        <div className="text-xs text-[#94A3B8] mt-1">
                                          Positivo: {resolveNota(eixoSnapshot, "positivo")} •
                                          Negativo: {resolveNota(eixoSnapshot, "negativo")} •
                                          Solução: {resolveNota(eixoSnapshot, "solucao")}
                                        </div>
                                        <div className="text-xs text-[#64748B] mt-2">
                                          Narrativas: {eixoSnapshot?.positivoParte2?.length ?? 0} /{" "}
                                          {eixoSnapshot?.negativoParte2?.length ?? 0} /{" "}
                                          {eixoSnapshot?.solucaoParte2?.length ?? 0}
                                        </div>
                                        <div className="mt-3 grid gap-2 text-xs text-[#64748B]">
                                          <div>
                                            <span className="uppercase tracking-[0.16em] text-[#94A3B8] text-[11px]">
                                              Parte 1 (checklist)
                                            </span>
                                            <div className="mt-1">
                                              <div>Positivos: {(eixoSnapshot?.positivoParte1 || []).join(", ") || "Não informado"}</div>
                                              <div>Negativos: {(eixoSnapshot?.negativoParte1 || []).join(", ") || "Não informado"}</div>
                                              <div>Soluções: {(eixoSnapshot?.solucaoParte1 || []).join(", ") || "Não informado"}</div>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="uppercase tracking-[0.16em] text-[#94A3B8] text-[11px]">
                                              Parte 2 (narrativas)
                                            </span>
                                            <div className="mt-1">
                                              <div>Positivos: {eixoSnapshot?.positivoParte2 || "Não informado"}</div>
                                              <div>Negativos: {eixoSnapshot?.negativoParte2 || "Não informado"}</div>
                                              <div>Soluções: {eixoSnapshot?.solucaoParte2 || "Não informado"}</div>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="uppercase tracking-[0.16em] text-[#94A3B8] text-[11px]">
                                              Parte 3 (consultor)
                                            </span>
                                            <div className="mt-1">
                                              <div>Positivos: {eixoAnalise?.positivoParte3 || "Não informado"}</div>
                                              <div>Negativos: {eixoAnalise?.negativoParte3 || "Não informado"}</div>
                                              <div>Soluções: {eixoAnalise?.solucaoParte3 || "Não informado"}</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {leftSummary && rightSummary && (
                              <div className="mt-6 border-t border-[#E2E8F0] pt-4">
                                <div className="text-fluid-xs uppercase tracking-[0.18em] text-[#64748B] mb-3">
                                  Comparação personalizada
                                </div>
                                <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                                  {eixosDiagnostico.map((eixo) => {
                                    const leftValue = leftSummary?.eixoScores?.[eixo.key] ?? 0;
                                    const rightValue = rightSummary?.eixoScores?.[eixo.key] ?? 0;
                                    const delta = rightValue - leftValue;
                                    return (
                                      <div key={eixo.key} className="flex items-center justify-between">
                                        <span>{eixo.title}</span>
                                        <span className="text-[#0F172A] font-semibold">
                                          <span className="text-xs text-[#64748B] mr-1">
                                            T{(leftVersion?.versionNumber || 1) - 1}
                                          </span>
                                          {leftValue}
                                          <span className="mx-2 text-[#94A3B8]">→</span>
                                          <span className="text-xs text-[#64748B] mr-1">
                                            T{(rightVersion?.versionNumber || 1) - 1}
                                          </span>
                                          <span
                                            className={cn(
                                              rightValue > leftValue
                                                ? "text-emerald-600"
                                                : rightValue < leftValue
                                                  ? "text-rose-600"
                                                  : "text-[#0F172A]"
                                            )}
                                          >
                                            {rightValue}
                                          </span>
                                          <span className="ml-2 text-xs text-[#94A3B8]">
                                            {delta === 0 ? "= 0" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
                                          </span>
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-4 grid gap-3 text-fluid-xs text-[#64748B]">
                                  {eixosDiagnostico.map((eixo) => {
                                    const leftItems = leftSummary?.eixoItemScores?.[eixo.key];
                                    const rightItems = rightSummary?.eixoItemScores?.[eixo.key];
                                    if (!leftItems && !rightItems) return null;
                                    return (
                                      <div key={eixo.key} className="border border-[#E2E8F0] p-3">
                                        <div className="font-semibold text-[#0F172A] mb-1">{eixo.title}</div>
                                        <div className="grid sm:grid-cols-3 gap-2">
                                          <div>
                                            <div className="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
                                              Positivo
                                            </div>
                                            <div className="text-[#0F172A]">
                                              {leftItems?.positivo ?? 0} → {rightItems?.positivo ?? 0}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
                                              Negativo
                                            </div>
                                            <div className="text-[#0F172A]">
                                              {leftItems?.negativo ?? 0} → {rightItems?.negativo ?? 0}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
                                              Solução
                                            </div>
                                            <div className="text-[#0F172A]">
                                              {leftItems?.solucao ?? 0} → {rightItems?.solucao ?? 0}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white border border-[#E2E8F0] p-8 print-card print-section">
              <h3 className="text-fluid-xl font-bold text-[#0F172A] mb-4">Resumo do diagnóstico</h3>
              <div className="text-fluid-sm text-[#64748B] space-y-3">
                <div className="text-fluid-base text-[#0F172A] font-semibold">
                  Nota geral atual: {notaGeral}
                </div>
                <div className="grid gap-2">
                  {eixosDiagnostico.map((eixo) => (
                    <div key={eixo.key} className="flex items-center justify-between">
                      <span>{eixo.title}</span>
                      <span className="text-[#0F172A] font-semibold">{getEixoMedia(eixo.key)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E2E8F0] pt-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#64748B] mb-2">
                    Lacunas (sem nota)
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {eixosDiagnostico
                      .filter((eixo) => getEixoMedia(eixo.key) === 0)
                      .map((eixo) => eixo.title)
                      .join(", ") || "Nenhuma lacuna detectada"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm"
                  >
                    Imprimir resumo
                  </button>
                  {draftId && (
                    <a
                      href={`/api/diagnosticos/${draftId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
                    >
                      Exportar JSON
                    </a>
                  )}
                  {draftId && (
                    <Link
                      href={`/diagnostico/imprimir?id=${draftId}`}
                      className="px-4 py-2 border border-[#0F766E] text-[#0F766E] text-fluid-sm"
                    >
                      Conclusões e recomendações (PDF)
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-8 print-card print-section">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-fluid-xl font-bold text-[#0F172A]">Ranking piloto (Pernambuco)</h3>
                <span className="text-xs text-[#64748B]">
                  {ranking.length} diagnosticos finalizados
                </span>
              </div>
              <p className="text-fluid-xs text-[#64748B] mb-4">
                {rankingDisclaimer ||
                  "Ranking baseado apenas nos diagnósticos registrados no sistema; não representa avaliação oficial."}
              </p>
              {ranking.length === 0 ? (
                <p className="text-fluid-sm text-[#64748B]">Nenhum diagnóstico finalizado ainda.</p>
              ) : (
                <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                  {ranking.slice(0, 15).map((item, idx) => (
                    <div
                      key={item.diagnosticoId}
                      className="flex items-center justify-between border border-[#E2E8F0] px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#94A3B8]">#{idx + 1}</span>
                        <span className="text-[#0F172A] font-semibold">
                          {item.municipio?.nome || "Município não informado"}
                        </span>
                      </div>
                      <span className="text-[#0F172A] font-semibold">{item.average}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {role === "CONSULTOR" && (
              <div className="bg-white border border-[#E2E8F0] p-8 print-hidden" id="diagnosticos-submetidos">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="text-fluid-xl font-bold text-[#0F172A]">Diagnósticos submetidos (Análise de respostas recebidas)</h3>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 mb-4">
                  <p className="text-fluid-sm font-medium text-amber-900">
                    Onde fazer tarefas pendentes (consultor)
                  </p>
                  <p className="text-fluid-sm text-amber-800 mt-1">
                    <strong>Para uma tela só com pendentes de avaliação:</strong>{" "}
                    <Link
                      href={clientParam && unitParam ? `/diagnostico?client=${clientParam}&unit=${unitParam}&view=submitted` : "/diagnostico?view=submitted"}
                      className="font-medium text-amber-800 underline hover:text-amber-900"
                    >
                      Ir para tela só de pendentes →
                    </Link>
                    {" "}
                    <strong>Nesta seção</strong> (visível ao rolar a página) aparecem todos os diagnósticos enviados a partir de uma sala; use os filtros por status, estado (UF) e período para encontrar os pendentes. Use &quot;Abrir diagnóstico no wizard&quot; ou &quot;Notas do consultor →&quot; para preencher sua avaliação. Também é possível usar a tabela &quot;Municípios … Criar, editar e ajustar&quot; (mais abaixo) e clicar em Editar, Radiografia ou Ver diagnóstico no município.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                    Status
                    <select
                      className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                      value={diagnosticosStatus}
                      onChange={(e) => setDiagnosticosStatus(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="SUBMITTED">Submetido (pendentes de avaliação)</option>
                      <option value="IN_REVIEW">Em análise</option>
                      <option value="RETURNED">Devolvido</option>
                      <option value="FINALIZED">Finalizado</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                    Estado (UF)
                    <select
                      className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                      value={diagnosticosUf}
                      onChange={(e) => setDiagnosticosUf(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="PE">PE</option>
                      <option value="AL">AL</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="PB">PB</option>
                      <option value="RN">RN</option>
                      <option value="PI">PI</option>
                      <option value="MA">MA</option>
                      <option value="SE">SE</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                    Data de (atualização)
                    <input
                      type="date"
                      className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                      value={diagnosticosDateFrom}
                      onChange={(e) => setDiagnosticosDateFrom(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-2 text-fluid-xs text-[#64748B]">
                    Data até (atualização)
                    <input
                      type="date"
                      className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm rounded-lg"
                      value={diagnosticosDateTo}
                      onChange={(e) => setDiagnosticosDateTo(e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-fluid-xs text-[#64748B]">Período rápido:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(start.getDate() - 7);
                      setDiagnosticosDateFrom(start.toISOString().slice(0, 10));
                      setDiagnosticosDateTo(end.toISOString().slice(0, 10));
                    }}
                    className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg hover:bg-slate-50 text-[#0F172A]"
                  >
                    Últimos 7 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(start.getDate() - 30);
                      setDiagnosticosDateFrom(start.toISOString().slice(0, 10));
                      setDiagnosticosDateTo(end.toISOString().slice(0, 10));
                    }}
                    className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg hover:bg-slate-50 text-[#0F172A]"
                  >
                    Últimos 30 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosticosDateFrom("");
                      setDiagnosticosDateTo("");
                    }}
                    className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-lg hover:bg-slate-50 text-[#0F172A]"
                  >
                    Limpar datas
                  </button>
                </div>
                <p className="text-fluid-sm text-[#64748B] mb-4">
                  Aqui aparecem <strong>somente</strong> diagnósticos que tiveram sala criada, participante entrou na sala e o diagnóstico foi enviado (pelo participante ao concluir ou automaticamente ao encerrar o prazo da sala). Não aparecem diagnósticos vazios nem de municípios que nunca participaram de uma sala. Filtre por <strong>Submetido</strong> para ver os pendentes de avaliação. Para uma tela dedicada só com pendentes:{" "}
                  <Link
                    href={clientParam && unitParam ? `/diagnostico?client=${clientParam}&unit=${unitParam}&view=submitted` : "/diagnostico?view=submitted"}
                    className="text-[#1E3A8A] font-medium hover:underline"
                  >
                    Ir para tela só de pendentes →
                  </Link>
                  {" "}
                  Use &quot;Abrir diagnóstico no wizard&quot; ou &quot;Notas do consultor →&quot; para preencher sua avaliação.
                </p>
                {diagnosticosLoading ? (
                  <p className="text-fluid-sm text-[#64748B]">Carregando lista...</p>
                ) : diagnosticosListError ? (
                  <p className="text-fluid-sm text-rose-600">{diagnosticosListError}</p>
                ) : diagnosticosList.length === 0 ? (
                  <p className="text-fluid-sm text-[#64748B]">Nenhum diagnóstico encontrado.</p>
                ) : (
                  <div className="space-y-3 text-fluid-sm text-[#64748B]">
                    {diagnosticosList.map((item) => (
                      <div key={item.id} className="border border-[#E2E8F0] p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[#0F172A] font-semibold">
                            {item.respondentName || "Não informado"}
                          </div>
                          <div className="text-xs text-[#64748B]">{item.status}</div>
                        </div>
                        <div className="text-xs text-[#64748B] mt-1">
                          IBGE: {item.municipioIbgeId || "Não informado"} • CNPJ: {item.cnpj || "Não informado"}
                        </div>
                        <div className="text-xs text-[#94A3B8] mt-1">
                          Atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDraftId(item.id);
                              setStatus(item.status);
                            }}
                            className="text-[#1E3A8A] text-xs hover:underline"
                          >
                            Abrir diagnóstico no wizard
                          </button>
                          {item.municipioIbgeId && (
                            <Link
                              href={`/diagnostico/municipio/${item.municipioIbgeId}`}
                              className="ml-4 text-emerald-700 text-xs hover:underline"
                            >
                              Notas do consultor →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}

        {eixoAtual && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-fluid-2xl font-bold text-[#0F172A]">{eixoAtual.title}</h2>
                <p className="text-fluid-sm text-[#64748B]">Eixo {eixoIndex + 1} de {eixosDiagnostico.length}</p>
              </div>
              <div className="flex gap-2 print-hidden">
                <button
                  type="button"
                  onClick={() => handleStepChange(step - 1)}
                  className="px-4 py-2 border border-[#E2E8F0] text-fluid-sm"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => handleStepChange(step + 1)}
                  className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
                >
                  Próximo
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {blocosDiagnostico.map((bloco) => {
                const blocoKey = bloco.key;
                const eixoData = eixos[eixoIndex];
                const parte1Key = `${blocoKey}Parte1` as "positivoParte1" | "negativoParte1" | "solucaoParte1";
                const parte2Key = `${blocoKey}Parte2` as "positivoParte2" | "negativoParte2" | "solucaoParte2";
                const notaKey = `${blocoKey}Nota` as "positivoNota" | "negativoNota" | "solucaoNota";
                const consultorNotaKey = `${blocoKey}NotaConsultor` as
                  | "positivoNotaConsultor"
                  | "negativoNotaConsultor"
                  | "solucaoNotaConsultor";
                const consultorKey = `${blocoKey}Parte3` as "positivoParte3" | "negativoParte3" | "solucaoParte3";
                const blocoStyles = {
                  positivo: {
                    bg: "bg-[#EAF7EF]",
                    border: "border-emerald-500",
                    badgeBg: "bg-emerald-600/10",
                    badgeText: "text-emerald-700",
                    iconBg: "bg-emerald-100",
                    iconText: "text-emerald-700",
                    accent: "text-emerald-700",
                    iconLabel: "OK",
                  },
                  negativo: {
                    bg: "bg-[#FDEEEE]",
                    border: "border-rose-500",
                    badgeBg: "bg-rose-600/10",
                    badgeText: "text-rose-700",
                    iconBg: "bg-rose-100",
                    iconText: "text-rose-700",
                    accent: "text-rose-700",
                    iconLabel: "!",
                  },
                  solucao: {
                    bg: "bg-[#EAF2FF]",
                    border: "border-blue-500",
                    badgeBg: "bg-blue-600/10",
                    badgeText: "text-blue-700",
                    iconBg: "bg-blue-100",
                    iconText: "text-blue-700",
                    accent: "text-blue-700",
                    iconLabel: "S",
                  },
                }[blocoKey];

                return (
                  <div
                    key={blocoKey}
                    className={cn(
                      "border border-[#E2E8F0] border-l-[6px] p-6",
                      blocoStyles.border,
                      blocoStyles.bg
                    )}
                  >
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold",
                            blocoStyles.iconBg,
                            blocoStyles.iconText
                          )}
                        >
                          {blocoStyles.iconLabel}
                        </span>
                        <div>
                          <div
                            className={cn(
                              "text-[11px] uppercase tracking-[0.22em] font-semibold",
                              blocoStyles.badgeBg,
                              blocoStyles.badgeText,
                              "px-2 py-1 inline-flex rounded-full"
                            )}
                          >
                            {bloco.title}
                          </div>
                          <h3 className="text-fluid-xl font-bold text-[#0F172A] mt-2">{bloco.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/70 border border-white/60 px-3 py-2 rounded-full">
                        <input
                          type="range"
                          min={0}
                          max={10}
                          value={eixoData[notaKey] ?? 0}
                          onChange={(e) => updateNota(eixoIndex, notaKey, Number(e.target.value))}
                          className={cn("accent-[#1E3A8A]", !isMunicipioEditable && "opacity-60")}
                          disabled={!isMunicipioEditable}
                        />
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={eixoData[notaKey] ?? 0}
                          onChange={(e) => updateNota(eixoIndex, notaKey, Number(e.target.value))}
                          className="border border-[#E2E8F0] px-2 py-1 w-16 text-fluid-sm bg-white"
                          disabled={!isMunicipioEditable}
                        />
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_0.8fr] gap-6">
                      <div className={cn("space-y-4", !isMunicipioEditable && "opacity-80")}>
                        {!isMunicipioEditable && (
                          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
                            Parte 1 e 2 bloqueadas para este perfil/status.
                          </div>
                        )}
                        <div>
                          <div className={cn("text-fluid-xs uppercase tracking-[0.2em] mb-2", blocoStyles.accent)}>
                            Parte 1 - Tópicos curtos
                          </div>
                          <div className="grid gap-2">
                            {(eixoData[parte1Key] as string[]).map((item, idx) => (
                              <div key={`${blocoKey}-${idx}`} className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-semibold",
                                    blocoStyles.iconBg,
                                    blocoStyles.iconText
                                  )}
                                >
                                  {blocoStyles.iconLabel}
                                </span>
                                <input
                                  value={item}
                                  onChange={(e) => updateChecklist(eixoIndex, blocoKey, idx, e.target.value)}
                                  className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm w-full bg-white"
                                  placeholder={`Tópico ${idx + 1}`}
                                  disabled={!isMunicipioEditable}
                                />
                              </div>
                            ))}
                          </div>
                          {blocoKey === "solucao" && (
                            <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                              <div className={cn("text-fluid-xs uppercase tracking-[0.2em] mb-2", blocoStyles.accent)}>
                                Soluções SEBRAE (descrição por item)
                              </div>
                              <div className="grid gap-2">
                                {(eixoData.solucaoParte1 as string[]).map((label, idx) => (
                                  <label
                                    key={`sebrae-${idx}`}
                                    className="grid gap-1 text-fluid-xs text-[#64748B]"
                                  >
                                    {label}
                                    <input
                                      value={(eixoData.solucaoSebraeDescs || [])[idx] || ""}
                                      onChange={(e) => updateSolucaoSebrae(eixoIndex, idx, e.target.value)}
                                      className="border border-[#E2E8F0] px-3 py-2 text-fluid-sm bg-white"
                                      placeholder="Descreva como essa solução pode ser aplicada"
                                      disabled={!isMunicipioEditable}
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className={cn("text-fluid-xs uppercase tracking-[0.2em] mb-2", blocoStyles.accent)}>
                            Parte 2 - Narrativa
                          </div>
                          <textarea
                            value={eixoData[parte2Key] as string}
                            onChange={(e) => updateText(eixoIndex, parte2Key, e.target.value)}
                            className="border border-[#E2E8F0] px-3 py-2 min-h-[120px] w-full text-fluid-sm bg-white"
                            disabled={!isMunicipioEditable}
                          />
                          {blocoKey === "solucao" && (
                            <div className="mt-4">
                              <div className={cn("text-fluid-xs uppercase tracking-[0.2em] mb-2", blocoStyles.accent)}>
                                Descrição complementar das soluções
                              </div>
                              <textarea
                                value={eixoData.solucaoDescricao || ""}
                                onChange={(e) => updateText(eixoIndex, "solucaoDescricao", e.target.value)}
                                className="border border-[#E2E8F0] px-3 py-2 min-h-[120px] w-full text-fluid-sm bg-white"
                                disabled={!isMunicipioEditable}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={cn(
                        "border border-l-[6px] p-4",
                        isConsultorEditable
                          ? "border-[#2563EB] bg-[#EEF4FF]"
                          : "border-[#CBD5F5] bg-[#F3F6FF]"
                      )}>
                        {!isConsultorEditable && (
                          <div className="text-xs text-slate-600 bg-white border border-[#E2E8F0] px-3 py-2 mb-3">
                            Parte 3 bloqueada. Disponível apenas para CONSULTOR após submissão.
                          </div>
                        )}
                        <div className="text-fluid-xs uppercase tracking-[0.2em] text-[#1E3A8A] mb-2">
                          Parte 3 - Análise técnica (Consultor)
                        </div>
                        <textarea
                          value={eixoData.consultor[consultorKey] as string}
                          onChange={(e) => updateConsultor(eixoIndex, consultorKey, e.target.value)}
                          className="border border-[#E2E8F0] px-3 py-2 min-h-[160px] w-full text-fluid-sm bg-white"
                          disabled={!isConsultorEditable}
                        />
                        <div className="mt-4">
                          <div className="text-fluid-xs uppercase tracking-[0.2em] text-[#1E3A8A] mb-2">
                            Nota do consultor (0-10)
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={10}
                              value={eixoData[consultorNotaKey] ?? 0}
                              onChange={(e) =>
                                updateConsultorNota(eixoIndex, consultorNotaKey, Number(e.target.value))
                              }
                              className="accent-[#1E3A8A]"
                              disabled={!isConsultorEditable}
                            />
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={eixoData[consultorNotaKey] ?? 0}
                              onChange={(e) =>
                                updateConsultorNota(eixoIndex, consultorNotaKey, Number(e.target.value))
                              }
                              className="border border-[#E2E8F0] px-2 py-1 w-16 text-fluid-sm bg-white"
                              disabled={!isConsultorEditable}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 print-hidden">
              {isConsultorEditable && (
                <button
                  type="button"
                  onClick={() => handleConsultorSave("IN_REVIEW")}
                  className="px-5 py-2 bg-[#0F766E] text-white text-fluid-sm"
                >
                  Salvar análise
                </button>
              )}
              {isConsultorEditable && (
                <button
                  type="button"
                  onClick={() => handleConsultorSave("FINALIZED")}
                  className="px-5 py-2 bg-emerald-600 text-white text-fluid-sm"
                >
                  Finalizar devolutiva
                </button>
              )}
              {isConsultorEditable && (
                <button
                  type="button"
                  onClick={() => handleConsultorSave("RETURNED")}
                  className="px-5 py-2 border border-amber-500 text-amber-600 text-fluid-sm"
                >
                  Solicitar ajustes ao município
                </button>
              )}
              {isConsultorEditable && (
                <button
                  type="button"
                  onClick={() => handleConsultorSave("RETURNED")}
                  className="px-5 py-2 border border-amber-500 text-amber-600 text-fluid-sm"
                >
                  Solicitar ajustes ao município
                </button>
              )}
            </div>
          </motion.section>
        )}

        {isPerguntasChave && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-white border border-[#E2E8F0] p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-fluid-2xl font-bold text-[#0F172A]">Perguntas-chave</h2>
                <p className="text-fluid-sm text-[#64748B]">Consolidação e comparabilidade.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStepChange(step - 1)}
                  className="px-4 py-2 border border-[#E2E8F0] text-fluid-sm"
                >
                  Voltar
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-[#E2E8F0] p-4">
                <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-3">Governança e Planejamento</h3>
                <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                  PCA/PAC no PNCP
                  <select
                    value={perguntasChave.pcaPacPncp}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({ ...prev, pcaPacPncp: e.target.value }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2"
                    disabled={!isMunicipioEditable}
                  >
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                    <option value="Em construção">Em construção</option>
                  </select>
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B] mt-3">
                  Integração planejamento x compras
                  <select
                    value={perguntasChave.integracaoPlanejamento}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({ ...prev, integracaoPlanejamento: e.target.value }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2"
                    disabled={!isMunicipioEditable}
                  >
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Não">Não</option>
                  </select>
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B] mt-3">
                  Soluções SEBRAE (multi)
                  <input
                    value={perguntasChave.sebraeSolucoes.join(", ")}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({
                        ...prev,
                        sebraeSolucoes: e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2"
                    placeholder="PCA, Compras Estratégicas, Credenciamento..."
                    disabled={!isMunicipioEditable}
                  />
                </label>
              </div>

              <div className="border border-[#E2E8F0] p-4">
                <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-3">Digitalização</h3>
                <div className="grid gap-2 text-fluid-sm text-[#64748B]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={perguntasChave.sistemasUtilizados.comprasGov}
                      onChange={(e) =>
                        setPerguntasChave((prev) => ({
                          ...prev,
                          sistemasUtilizados: { ...prev.sistemasUtilizados, comprasGov: e.target.checked },
                        }))
                      }
                      disabled={!isMunicipioEditable}
                    />
                    compras.gov.br
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={perguntasChave.sistemasUtilizados.pncp}
                      onChange={(e) =>
                        setPerguntasChave((prev) => ({
                          ...prev,
                          sistemasUtilizados: { ...prev.sistemasUtilizados, pncp: e.target.checked },
                        }))
                      }
                      disabled={!isMunicipioEditable}
                    />
                    PNCP
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={perguntasChave.sistemasUtilizados.sistemaProprio}
                      onChange={(e) =>
                        setPerguntasChave((prev) => ({
                          ...prev,
                          sistemasUtilizados: { ...prev.sistemasUtilizados, sistemaProprio: e.target.checked },
                        }))
                      }
                      disabled={!isMunicipioEditable}
                    />
                    sistema próprio
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={perguntasChave.sistemasUtilizados.semSistema}
                      onChange={(e) =>
                        setPerguntasChave((prev) => ({
                          ...prev,
                          sistemasUtilizados: { ...prev.sistemasUtilizados, semSistema: e.target.checked },
                        }))
                      }
                      disabled={!isMunicipioEditable}
                    />
                    não utiliza sistemas digitais
                  </label>
                </div>
                <label className="grid gap-2 text-fluid-sm text-[#64748B] mt-3">
                  Grau de tramitação eletrônica (0-10)
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={perguntasChave.tramitacaoEletronicaNota}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({
                        ...prev,
                        tramitacaoEletronicaNota: Number(e.target.value),
                      }))
                    }
                    className="accent-[#1E3A8A]"
                    disabled={!isMunicipioEditable}
                  />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={perguntasChave.tramitacaoEletronicaNota}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({
                        ...prev,
                        tramitacaoEletronicaNota: Number(e.target.value),
                      }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2 w-24"
                    disabled={!isMunicipioEditable}
                  />
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B] mt-3">
                  Comentário
                  <textarea
                    value={perguntasChave.tramitacaoEletronicaComentario}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({
                        ...prev,
                        tramitacaoEletronicaComentario: e.target.value,
                      }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2 min-h-[100px]"
                    disabled={!isMunicipioEditable}
                  />
                </label>
              </div>

              <div className="border border-[#E2E8F0] p-4 md:col-span-2">
                <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-3">
                  Inclusão Econômica e Desenvolvimento Local
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                    Interação com Sala do Empreendedor
                    <select
                      value={perguntasChave.salaEmpreendedor}
                      onChange={(e) =>
                        setPerguntasChave((prev) => ({ ...prev, salaEmpreendedor: e.target.value }))
                      }
                      className="border border-[#E2E8F0] px-3 py-2"
                      disabled={!isMunicipioEditable}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-fluid-sm text-[#64748B]">
                    Aplicação da LC 123/2006
                    <select
                      value={perguntasChave.beneficiosLc123}
                      onChange={(e) =>
                        setPerguntasChave((prev) => ({ ...prev, beneficiosLc123: e.target.value }))
                      }
                      className="border border-[#E2E8F0] px-3 py-2"
                      disabled={!isMunicipioEditable}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Não">Não</option>
                    </select>
                  </label>
                </div>
                <label className="grid gap-2 text-fluid-sm text-[#64748B] mt-3">
                  Estratégias para informar e preparar fornecedores locais
                  <textarea
                    value={perguntasChave.estrategiasFornecedores}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({
                        ...prev,
                        estrategiasFornecedores: e.target.value,
                      }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2 min-h-[100px]"
                    disabled={!isMunicipioEditable}
                  />
                </label>
                <label className="grid gap-2 text-fluid-sm text-[#64748B] mt-3">
                  Integração sustentabilidade + agricultura familiar + MPE
                  <input
                    value={perguntasChave.integracaoSustentabilidade}
                    onChange={(e) =>
                      setPerguntasChave((prev) => ({
                        ...prev,
                        integracaoSustentabilidade: e.target.value,
                      }))
                    }
                    className="border border-[#E2E8F0] px-3 py-2"
                    disabled={!isMunicipioEditable}
                  />
                </label>
              </div>
            </div>

            <div className={cn(
              "border border-dashed p-4",
              isConsultorEditable ? "border-emerald-400 bg-emerald-50" : "border-[#E2E8F0] bg-slate-50"
            )}>
              {!isConsultorEditable && (
                <div className="text-xs text-slate-600 bg-white border border-[#E2E8F0] px-3 py-2 mb-3">
                  Parte 3 bloqueada. Disponível apenas para CONSULTOR após submissão.
                </div>
              )}
              <div className="text-fluid-xs uppercase tracking-[0.2em] text-[#64748B] mb-2">
                Parte 3 - Análise consolidada (Consultor)
              </div>
              <textarea
                value={perguntasChave.consultorAnalise}
                onChange={(e) =>
                  setPerguntasChave((prev) => ({ ...prev, consultorAnalise: e.target.value }))
                }
                className="border border-[#E2E8F0] px-3 py-2 min-h-[120px] w-full"
                disabled={!isConsultorEditable}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 print-hidden">
              {isMunicipioEditable && (
                <label className="flex items-center gap-2 text-fluid-sm text-[#64748B]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  Concordo com o tratamento de dados (LGPD)
                </label>
              )}
              {isMunicipioEditable && (
                <button
                  type="button"
                  onClick={submitDiagnostico}
                  className="px-5 py-2 bg-[#1E3A8A] text-white text-fluid-sm"
                  disabled={!canSubmit}
                >
                  Submeter diagnóstico
                </button>
              )}
              {isConsultorEditable && (
                <button
                  type="button"
                  onClick={() => handleConsultorSave("FINALIZED")}
                  className="px-5 py-2 bg-emerald-600 text-white text-fluid-sm"
                >
                  Finalizar devolutiva
                </button>
              )}
            </div>
          </motion.section>
        )}
      </div>
      <HelpButton
        title="Diagnóstico (wizard)"
        helpHref={classroomCode ? "/ajuda/diagnostico" : "/ajuda/diagnostico"}
      >
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Se você entrou via sala, o sistema usa <strong>código + token</strong> (guardado no navegador) para salvar e
            submeter sem login.
          </li>
          <li>
            O diagnóstico faz <strong>autosalvamento</strong> para reduzir risco de perda (aba fechada, sessão expirada,
            etc.).
          </li>
          <li>
            Se aparecer aviso de <strong>conflito</strong>, seus dados foram salvos, mas houve edição concorrente (last-write-wins).
          </li>
        </ul>
      </HelpButton>
    </div>
  );
}

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-12">Carregando diagnóstico...</div>}>
      <DiagnosticoContent />
    </Suspense>
  );
}

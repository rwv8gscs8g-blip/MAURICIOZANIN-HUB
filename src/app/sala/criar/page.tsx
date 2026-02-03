"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpButton } from "@/components/ui/HelpButton";
import { Plus, ArrowLeft, Calendar, MapPin, Hash, Search, X } from "lucide-react";

type Municipio = { id: string; nome: string; uf?: string };

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function SalaCriarPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [municipioIbgeId, setMunicipioIbgeId] = useState("");
  const [municipioSelecionado, setMunicipioSelecionado] = useState<Municipio | null>(null);
  const [uf, setUf] = useState("PE");
  const [municipioSearch, setMunicipioSearch] = useState("");
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [municipiosLoading, setMunicipiosLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [cicloGestaoInicio, setCicloGestaoInicio] = useState<number | "">("");
  const [cicloGestaoFim, setCicloGestaoFim] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string } | null>(null);

  useEffect(() => {
    setMunicipiosLoading(true);
    fetch(`/api/ibge/municipios?uf=${uf}`)
      .then((res) => res.json())
      .then((data) => {
        setMunicipios(data.municipios || []);
      })
      .catch(() => setMunicipios([]))
      .finally(() => setMunicipiosLoading(false));
  }, [uf]);

  // Sugestão de horário padrão: hoje às 18h (horário local do usuário).
  useEffect(() => {
    if (expiresAt) return;
    const now = new Date();
    const closing = new Date(now);
    closing.setHours(18, 0, 0, 0);
    if (closing.getTime() <= now.getTime()) {
      closing.setDate(closing.getDate() + 1);
    }
    const y = closing.getFullYear();
    const m = String(closing.getMonth() + 1).padStart(2, "0");
    const d = String(closing.getDate()).padStart(2, "0");
    const h = String(closing.getHours()).padStart(2, "0");
    const min = String(closing.getMinutes()).padStart(2, "0");
    setExpiresAt(`${y}-${m}-${d}T${h}:${min}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const municipiosFiltrados = useMemo(() => {
    const termo = municipioSearch.trim().toLowerCase();
    if (!termo) return municipios.slice(0, 20);
    return municipios
      .filter((m) => m.nome.toLowerCase().includes(termo))
      .slice(0, 15);
  }, [municipios, municipioSearch]);

  const selecionarMunicipio = (m: Municipio) => {
    setMunicipioSelecionado(m);
    setMunicipioIbgeId(m.id);
    setMunicipioSearch("");
    setDropdownOpen(false);
    if (!description.trim()) {
      setDescription(`Sala para diagnóstico do município de ${m.nome}.`);
    }
  };

  const limparMunicipio = () => {
    setMunicipioSelecionado(null);
    setMunicipioIbgeId("");
    setMunicipioSearch("");
    setDescription("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      if (!municipioIbgeId.trim()) {
        setError("Selecione o município para criar a sala.");
        return;
      }
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          municipioIbgeId: municipioIbgeId.trim(),
          cicloGestaoInicio: typeof cicloGestaoInicio === "number" ? cicloGestaoInicio : undefined,
          cicloGestaoFim: typeof cicloGestaoFim === "number" ? cicloGestaoFim : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Não foi possível criar a sala.");
        return;
      }

      setResult({ id: data.session.id });

      // Após criar, já abre o formulário (wizard) para edição/preenchimento.
      const params = new URLSearchParams({ municipio: municipioIbgeId.trim() });
      params.set("classroomSessionId", String(data.session.id));
      router.push(`/diagnostico?${params.toString()}`);
    } catch {
      setError("Erro inesperado ao criar a sala.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "border border-[#CBD5E1] px-3 py-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition-colors";

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid max-w-3xl space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#64748B]">
            <Plus className="h-4 w-4" aria-hidden /> Sala de aula
          </div>
          <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">Criar sala</h1>
          <p className="text-fluid-sm text-[#64748B] mt-2">
            Gera um código curto e um token mágico. O token é armazenado apenas como hash e será exibido uma única vez.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-8">
          <form onSubmit={handleCreate} className="space-y-5">
            <label className="grid gap-2">
              <span className="text-sm text-[#0F172A] font-medium">Descrição (opcional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} min-h-24`}
              />
            </label>

            <div className="space-y-4">
              <div className="grid gap-2">
                <span className="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                  <MapPin className="h-4 w-4 text-[#64748B]" /> Município do diagnóstico
                </span>
                <p className="text-fluid-xs text-[#64748B]">
                  Busque pelo nome do município (ex.: Aliança). O nome da sala será o nome do município. Códigos/tokens ficam ocultos para implementação futura.
                </p>
                <div className="grid sm:grid-cols-[100px_1fr] gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs text-[#64748B]">Estado (UF)</span>
                    <select
                      value={uf}
                      onChange={(e) => {
                        setUf(e.target.value);
                        setMunicipioSelecionado(null);
                        setMunicipioIbgeId("");
                        setMunicipioSearch("");
                      }}
                      className={inputClass}
                    >
                      {UFS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" aria-hidden />
                      <input
                        value={municipioSelecionado ? municipioSelecionado.nome : municipioSearch}
                        onChange={(e) => {
                          setMunicipioSearch(e.target.value);
                          if (municipioSelecionado) setMunicipioSelecionado(null);
                          setMunicipioIbgeId("");
                          setDropdownOpen(true);
                        }}
                        onFocus={() => setDropdownOpen(true)}
                        className={`${inputClass} pl-9 pr-9`}
                        placeholder="Ex.: Aliança"
                        readOnly={!!municipioSelecionado}
                      />
                      {municipioSelecionado && (
                        <button
                          type="button"
                          onClick={limparMunicipio}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                          title="Limpar município"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {dropdownOpen && !municipioSelecionado && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {municipiosLoading ? (
                          <div className="px-4 py-3 text-fluid-sm text-[#64748B]">Carregando municípios...</div>
                        ) : municipiosFiltrados.length === 0 ? (
                          <div className="px-4 py-3 text-fluid-sm text-[#64748B]">
                            {municipioSearch.trim() ? "Nenhum município encontrado." : "Selecione o estado e digite o nome."}
                          </div>
                        ) : (
                          municipiosFiltrados.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => selecionarMunicipio({ ...m, uf: m.uf || uf })}
                              className="w-full px-4 py-2.5 text-left text-fluid-sm text-[#0F172A] hover:bg-[#F1F5F9] border-b border-[#E2E8F0] last:border-b-0"
                            >
                              <span className="font-medium">{m.nome}</span>
                              <span className="text-[#64748B] ml-2 text-xs">({m.uf || uf})</span>
                              <span className="text-[#64748B] ml-2 text-xs">• IBGE {m.id}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {municipioSelecionado && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-fluid-sm">
                    <MapPin className="h-5 w-5 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#0F172A]">{municipioSelecionado.nome}</span>
                      <span className="text-[#64748B] ml-2">({municipioSelecionado.uf || uf})</span>
                      <span className="text-[#64748B] ml-2">• Código IBGE: {municipioSelecionado.id}</span>
                    </div>
                    <button
                      type="button"
                      onClick={limparMunicipio}
                      className="text-[#64748B] hover:text-[#0F172A] text-xs"
                    >
                      Trocar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                    <Calendar className="h-4 w-4 text-[#64748B]" /> Expira em (opcional)
                  </span>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <div />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                  <Hash className="h-4 w-4 text-[#64748B]" /> Ciclo gestão (início)
                </span>
                <input
                  type="number"
                  value={cicloGestaoInicio}
                  onChange={(e) => setCicloGestaoInicio(e.target.value ? Number(e.target.value) : "")}
                  className={inputClass}
                  placeholder="2025"
                />
              </label>
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm text-[#0F172A] font-medium">
                  <Hash className="h-4 w-4 text-[#64748B]" /> Ciclo gestão (fim)
                </span>
                <input
                  type="number"
                  value={cicloGestaoFim}
                  onChange={(e) => setCicloGestaoFim(e.target.value ? Number(e.target.value) : "")}
                  className={inputClass}
                  placeholder="2028"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/90 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {busy ? "Criando..." : "Criar sala"}
              </button>
              <Link
                href="/sala"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/5 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para salas
              </Link>
            </div>
          </form>
        </div>

        {result && (
          <div className="bg-white border border-emerald-200 rounded-xl shadow-sm p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-emerald-700 font-medium">
              Sala criada
            </div>
            <p className="text-fluid-sm text-[#64748B]">
              Sala criada com sucesso. Você será redirecionado automaticamente para o formulário do diagnóstico.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/sala/${result.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm rounded-lg hover:bg-[#1E3A8A]/5 transition-colors"
              >
                Gerenciar sala
              </Link>
            </div>
          </div>
        )}
      </div>
      <HelpButton title="Criar sala (consultor)" helpHref="/ajuda/sala">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            No fluxo simplificado, o consultor cria a sala selecionando o <strong>município</strong>. Código e token ficam <strong>ocultos</strong>.
          </li>
          <li>
            Campos opcionais como <strong>cicloGestao</strong> servem para preencher automaticamente o diagnóstico
            quando o aluno entrar via sala.
          </li>
          <li>
            Se você informar <strong>expiração</strong>, a sala bloqueia entrada/salvamento após esse horário.
          </li>
        </ul>
      </HelpButton>
    </div>
  );
}


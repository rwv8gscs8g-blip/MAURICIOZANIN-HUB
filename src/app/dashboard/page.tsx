"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, FileText, Network, ShoppingCart, Users, Code2 } from "lucide-react";
import Link from "next/link";

type HubKey =
  | "COOPERACAO_INTERNACIONAL"
  | "COMPRAS_GOVERNAMENTAIS"
  | "SUPORTE_MUNICIPIOS"
  | "DESENVOLVIMENTO_SOFTWARE";

const hubCards: Array<{ key: HubKey; title: string; description: string; icon: any; href: string }> = [
  {
    key: "COOPERACAO_INTERNACIONAL",
    title: "Cooperação Internacional",
    description: "Rede Inovajuntos e cooperação internacional integrada ao histórico do hub.",
    icon: Network,
    href: "/hubs/cooperacao-internacional",
  },
  {
    key: "COMPRAS_GOVERNAMENTAIS",
    title: "Compras Governamentais e Governança",
    description: "Diagnósticos, capacitações, marcos legais e projetos de governança.",
    icon: ShoppingCart,
    href: "/hubs/compras-governamentais-governanca",
  },
  {
    key: "SUPORTE_MUNICIPIOS",
    title: "Suporte aos Municípios",
    description: "Ações de suporte técnico, políticas públicas e desenvolvimento local.",
    icon: Users,
    href: "/hubs/suporte-aos-municipios",
  },
  {
    key: "DESENVOLVIMENTO_SOFTWARE",
    title: "Desenvolvimento de Software",
    description: "Plataformas digitais, sistemas de gestão e soluções tecnológicas.",
    icon: Code2,
    href: "/hubs/desenvolvimento-software",
  },
];

export default function DashboardPage() {
  const [session, setSession] = useState<{
    user?: {
      hubAccesses?: string[];
      role?: string;
      clientAccessApproved?: boolean;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setPending(params.get("pending") === "1");
  }, []);

  const allowedHubs = useMemo(() => {
    if (!session?.user) return [];
    if (session.user.role === "ADMIN") {
      return hubCards.map((hub) => hub.key);
    }
    return session.user.hubAccesses || [];
  }, [session]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-3 tracking-tight">
            Painel do Hub
          </h1>
          <p className="text-fluid-base text-[#64748B] max-w-2xl">
            Escolha o eixo para acessar projetos, produtos, publicações e registros da linha do tempo.
          </p>
        </motion.div>

        {loading ? (
          <div className="bg-white border border-[#E2E8F0] p-8 text-fluid-base text-[#64748B]">
            Carregando acessos...
          </div>
        ) : (
          <>
            {pending && session?.user?.role === "CLIENTE" && (
              <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Seu acesso ao ambiente do cliente ainda precisa de aprovação do administrador.
              </div>
            )}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hubCards.map((hub) => {
              const allowed = allowedHubs.includes(hub.key);
              const Icon = hub.icon;
              return (
                <div
                  key={hub.key}
                  className={`border border-[#E2E8F0] p-6 bg-white ${
                    allowed ? "hover:-translate-y-1 transition-all" : "opacity-60"
                  }`}
                >
                  <Icon className="h-6 w-6 text-[#1E3A8A] mb-4" />
                  <h2 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                    {hub.title}
                  </h2>
                  <p className="text-fluid-sm text-[#64748B] mb-4">{hub.description}</p>
                  {allowed ? (
                    <Link
                      href={hub.href}
                      className="text-fluid-sm text-[#1E3A8A] hover:underline"
                    >
                      Acessar hub →
                    </Link>
                  ) : (
                    <span className="text-fluid-sm text-[#94A3B8]">
                      Sem permissão
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          </>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Link
            href="/clientes"
            className="border border-[#E2E8F0] bg-white p-6 flex items-center gap-4 hover:-translate-y-1 transition-all"
          >
            <Building2 className="h-6 w-6 text-[#1E3A8A]" />
            <div>
              <h3 className="text-fluid-base font-semibold text-[#0F172A]">Clientes</h3>
              <p className="text-fluid-sm text-[#64748B]">
                Organização por cliente e unidades.
              </p>
            </div>
          </Link>
          <Link
            href="/produtos"
            className="border border-[#E2E8F0] bg-white p-6 flex items-center gap-4 hover:-translate-y-1 transition-all"
          >
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <div>
              <h3 className="text-fluid-base font-semibold text-[#0F172A]">Produtos</h3>
              <p className="text-fluid-sm text-[#64748B]">
                Conteúdos associados a clientes e hubs.
              </p>
            </div>
          </Link>
          <Link
            href="/publicacoes"
            className="border border-[#E2E8F0] bg-white p-6 flex items-center gap-4 hover:-translate-y-1 transition-all"
          >
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <div>
              <h3 className="text-fluid-base font-semibold text-[#0F172A]">Publicações</h3>
              <p className="text-fluid-sm text-[#64748B]">
                Linha do tempo com documentos aprovados.
              </p>
            </div>
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/projetos"
              className="border border-[#E2E8F0] bg-white p-6 flex items-center gap-4 hover:-translate-y-1 transition-all"
            >
              <FileText className="h-6 w-6 text-[#1E3A8A]" />
              <div>
                <h3 className="text-fluid-base font-semibold text-[#0F172A]">Projetos</h3>
                <p className="text-fluid-sm text-[#64748B]">
                  Gerenciar projetos por cliente e hub.
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

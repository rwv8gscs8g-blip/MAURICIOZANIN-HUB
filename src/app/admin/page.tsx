import Link from "next/link";
import { Users, FileText, Newspaper, Network, FolderKanban, ShieldCheck } from "lucide-react";

const cards = [
  {
    title: "Usuários",
    description: "Perfis, hubs e projetos de acesso.",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Projetos",
    description: "Projetos por cliente e hub.",
    href: "/admin/projetos",
    icon: FolderKanban,
  },
  {
    title: "Produtos",
    description: "Atestados e controle interno.",
    href: "/admin/produtos",
    icon: FileText,
  },
  {
    title: "Publicações",
    description: "Aprovar e publicar conteúdos.",
    href: "/admin/publicacoes",
    icon: FileText,
  },
  {
    title: "Na Mídia",
    description: "Revisar e aprovar menções.",
    href: "/admin/midia",
    icon: Newspaper,
  },
  {
    title: "Linha do tempo",
    description: "Aprovar itens da trajetória.",
    href: "/admin/timeline",
    icon: Network,
  },
];

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="mb-10">
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-3">
            Administração
          </h1>
          <p className="text-fluid-base text-[#64748B]">
            Central de gestão do hub, usuários, produtos e publicações.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="border border-[#E2E8F0] bg-white p-6 hover:-translate-y-1 transition-all"
              >
                <Icon className="h-6 w-6 text-[#1E3A8A] mb-4" />
                <h2 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                  {card.title}
                </h2>
                <p className="text-fluid-sm text-[#64748B]">{card.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 bg-white border border-[#E2E8F0] p-6 flex items-center gap-4">
          <ShieldCheck className="h-6 w-6 text-[#1E3A8A]" />
          <div>
            <div className="text-fluid-base font-semibold text-[#0F172A]">
              Fluxo de aprovação obrigatório
            </div>
            <div className="text-fluid-sm text-[#64748B]">
              Conteúdos só aparecem no público após aprovação manual.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

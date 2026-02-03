import Link from "next/link";
import { Network, ShoppingCart, Users, Code2 } from "lucide-react";

const hubs = [
  {
    slug: "cooperacao-internacional",
    title: "Cooperação Internacional",
    description: "Rede Inovajuntos integrada ao eixo internacional.",
    icon: Network,
  },
  {
    slug: "compras-governamentais-governanca",
    title: "Compras Governamentais e Governança",
    description: "Diagnósticos, licitações e governança pública.",
    icon: ShoppingCart,
  },
  {
    slug: "suporte-aos-municipios",
    title: "Suporte aos Municípios",
    description: "Ações técnicas e desenvolvimento local.",
    icon: Users,
  },
  {
    slug: "desenvolvimento-software",
    title: "Desenvolvimento de Software",
    description: "Soluções digitais e plataformas de gestão.",
    icon: Code2,
  },
];

export default function HubsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="mb-10">
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-3">
            Hubs de atuação
          </h1>
          <p className="text-fluid-base text-[#64748B]">
            Acesse os eixos do hub para organizar clientes, produtos e linha do tempo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <Link
                key={hub.slug}
                href={`/hubs/${hub.slug}`}
                className="border border-[#E2E8F0] bg-white p-6 hover:-translate-y-1 transition-all"
              >
                <Icon className="h-6 w-6 text-[#1E3A8A] mb-4" />
                <h2 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                  {hub.title}
                </h2>
                <p className="text-fluid-sm text-[#64748B]">{hub.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

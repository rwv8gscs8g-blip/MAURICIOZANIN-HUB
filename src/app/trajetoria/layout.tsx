import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trajetória Profissional | Maurício Zanin - Estrategista de Compras Públicas",
  description:
    "Linha do tempo completa da trajetória profissional de Maurício Zanin, incluindo vídeos da CNM, publicações, projetos da Rede Inovajuntos e eventos em governança pública. História de mais de 15 anos transformando a gestão pública.",
  keywords: [
    "Maurício Zanin",
    "Trajetória profissional",
    "Compras públicas",
    "Rede Inovajuntos",
    "CNM",
    "Governança pública",
    "Cooperação internacional",
  ],
  openGraph: {
    title: "Trajetória Profissional | Maurício Zanin",
    description:
      "História completa da carreira em governança e compras públicas, incluindo vídeos, publicações e projetos.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trajetória Profissional | Maurício Zanin",
    description: "História completa da carreira em governança e compras públicas",
  },
};

export default function TrajetoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

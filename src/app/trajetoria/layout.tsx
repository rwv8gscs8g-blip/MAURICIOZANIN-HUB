import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linha do Tempo | Maurício Zanin",
  description:
    "Linha do tempo com registros, publicações e ações nas três áreas do hub: cooperação internacional, compras governamentais e suporte aos municípios.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Linha do Tempo | Maurício Zanin",
    description:
      "Linha do tempo com registros, publicações e ações nas três áreas do hub: cooperação internacional, compras governamentais e suporte aos municípios.",
    type: "website",
  },
};

export default function TrajetoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

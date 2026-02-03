import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicações | Maurício Zanin",
  description:
    "Publicações, cartilhas e produções técnicas organizadas por data, com acesso rápido a downloads e referências.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Publicações | Maurício Zanin",
    description:
      "Publicações, cartilhas e produções técnicas organizadas por data, com acesso rápido a downloads e referências.",
    type: "website",
  },
};

export default function PublicacoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

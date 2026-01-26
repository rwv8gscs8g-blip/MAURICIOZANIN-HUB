import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Sobre | Luís Maurício Junqueira Zanin - Estrategista de Compras Públicas",
  description:
    "Biografia e trajetória profissional de Luís Maurício Junqueira Zanin, especialista em compras governamentais, fundador da Rede Inovajuntos e consultor internacional em governança pública.",
  keywords: [
    "Maurício Zanin",
    "Luís Maurício Junqueira Zanin",
    "Compras Públicas",
    "Governança Pública",
    "Rede Inovajuntos",
    "Lei 14.133/2021",
    "Cooperação Intermunicipal",
    "Estrategista de Compras Públicas",
  ],
  openGraph: {
    title: "Luís Maurício Junqueira Zanin - Estrategista de Compras Públicas",
    description:
      "Autoridade reconhecida em compras governamentais, fundador da Rede Inovajuntos e consultor internacional em governança pública.",
    type: "profile",
    url: "https://mauriciozanin.com.br/sobre",
    siteName: "Maurício Zanin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luís Maurício Junqueira Zanin - Estrategista de Compras Públicas",
    description:
      "Autoridade reconhecida em compras governamentais e fundador da Rede Inovajuntos",
  },
  alternates: {
    canonical: "https://mauriciozanin.com.br/sobre",
  },
};

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd type="person" />
      {children}
    </>
  );
}

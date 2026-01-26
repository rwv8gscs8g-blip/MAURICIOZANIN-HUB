import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materiais Compartilhados | Maurício Zanin",
  description:
    "Acesse cartilhas, templates, planilhas e materiais exclusivos sobre compras públicas, governança e Lei 14.133/2021.",
  openGraph: {
    title: "Materiais Compartilhados | Maurício Zanin",
    description: "Recursos exclusivos sobre governança e compras públicas",
    type: "website",
  },
};

export default function CompartilheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

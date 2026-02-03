import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compartilhe | Maurício Zanin",
  description:
    "Materiais gratuitos para download e compartilhamento, com citações prontas e conteúdos de apoio.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Compartilhe | Maurício Zanin",
    description:
      "Materiais gratuitos para download e compartilhamento, com citações prontas e conteúdos de apoio.",
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

import type { Metadata } from "next";
import "@fontsource/inter/latin.css";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Maurício Zanin - Consultoria em Governança e Compras Públicas",
  description: "Especialista em Governança e Compras Públicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <JsonLd type="person" />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

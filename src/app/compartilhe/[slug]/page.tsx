import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { resources } from "./data";
import { ResourceDetailClient } from "./ResourceDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources[slug];

  if (!resource) {
    return {
      title: "Recurso não encontrado",
    };
  }

  return {
    title: `${resource.name} | Maurício Zanin`,
    description: resource.fullDescription,
    openGraph: {
      title: resource.name,
      description: resource.description,
      type: "article",
    },
  };
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = resources[slug];

  if (!resource) {
    // Em Server Components, podemos usar retorno normal ou notFound()
    // Como o original tinha um UI "Recurso não encontrado" bonito, mantivemos aqui,
    // mas sem use client.
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <div className="text-center">
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mb-4">
              Recurso não encontrado
            </h1>
            <Link
              href="/compartilhe"
              className="text-[#1E3A8A] hover:underline"
            >
              Voltar para materiais compartilhados
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ResourceDetailClient resource={resource} />;
}

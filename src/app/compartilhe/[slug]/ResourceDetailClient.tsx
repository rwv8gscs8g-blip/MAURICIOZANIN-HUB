"use client";

import { Download, ArrowLeft, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CitationBox } from "@/components/citation/CitationBox";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResourceDetail } from "./data";

interface Props {
    resource: ResourceDetail;
}

export function ResourceDetailClient({ resource }: Props) {
    const handleDownload = async () => {
        // Registrar interesse no banco de dados
        await fetch("/api/resources/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                resourceId: resource.id,
                userId: null,
            }),
        });

        // Redirecionar para Sync.com
        window.open(resource.syncUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-16">
            <div className="container-fluid max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Breadcrumb */}
                    <Link
                        href="/compartilhe"
                        className="inline-flex items-center gap-2 text-fluid-sm text-[#64748B] hover:text-[#1E3A8A] mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para materiais compartilhados
                    </Link>

                    {/* Header */}
                    <div className="bg-white border border-[#E2E8F0] p-8 md:p-12 mb-8">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <span className="inline-block text-fluid-xs text-[#1E3A8A] px-3 py-1 bg-slate-50 border border-[#E2E8F0] mb-3">
                                    {resource.category}
                                </span>
                                <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
                                    {resource.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-fluid-sm text-[#64748B]">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4" />
                                        <span>{resource.author}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <time>
                                            {format(new Date(resource.publishedAt), "dd/MM/yyyy")}
                                        </time>
                                    </div>
                                    {resource.pages && (
                                        <span>{resource.pages} páginas</span>
                                    )}
                                    {resource.size && (
                                        <span>{resource.size}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-fluid-base text-[#64748B] leading-[1.8] mb-8">
                            {resource.fullDescription}
                        </p>

                        <button
                            onClick={handleDownload}
                            className="w-full md:w-auto px-8 py-4 bg-[#1E3A8A] text-white text-fluid-base font-semibold hover:bg-[#1E3A8A]/90 transition-colors flex items-center justify-center gap-2 border border-[#1E3A8A]"
                        >
                            <Download className="h-5 w-5" />
                            Baixar Material
                        </button>
                    </div>

                    {/* Citation Box */}
                    <div className="mb-8">
                        <CitationBox
                            author="ZANIN, L. M. J."
                            title={resource.name}
                            publisher={resource.category}
                            year={format(new Date(resource.publishedAt), "yyyy")}
                            url={`https://mauriciozanin.com.br/compartilhe/${resource.slug}`}
                            type={resource.category.includes("Cartilha") ? "cartilha" : "artigo"}
                        />
                    </div>

                    {/* Informações Adicionais */}
                    <div className="bg-white border border-[#E2E8F0] p-8">
                        <h2 className="text-fluid-xl font-bold text-[#0F172A] mb-4 tracking-tight">
                            Informações do Material
                        </h2>
                        <dl className="grid md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-fluid-sm font-medium text-[#64748B] mb-1">
                                    Categoria
                                </dt>
                                <dd className="text-fluid-base text-[#0F172A]">
                                    {resource.category}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-fluid-sm font-medium text-[#64748B] mb-1">
                                    Formato
                                </dt>
                                <dd className="text-fluid-base text-[#0F172A] uppercase">
                                    {resource.type}
                                </dd>
                            </div>
                            {resource.pages && (
                                <div>
                                    <dt className="text-fluid-sm font-medium text-[#64748B] mb-1">
                                        Páginas
                                    </dt>
                                    <dd className="text-fluid-base text-[#0F172A]">
                                        {resource.pages}
                                    </dd>
                                </div>
                            )}
                            {resource.size && (
                                <div>
                                    <dt className="text-fluid-sm font-medium text-[#64748B] mb-1">
                                        Tamanho
                                    </dt>
                                    <dd className="text-fluid-base text-[#0F172A]">
                                        {resource.size}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </motion.div>
            </div>

            {/* JSON-LD Schema */}
            <JsonLd
                type="article"
                articleData={{
                    title: resource.name,
                    description: resource.fullDescription,
                    author: "Luís Maurício Junqueira Zanin",
                    publisher: resource.category,
                    datePublished: resource.publishedAt,
                    url: `https://mauriciozanin.com.br/compartilhe/${resource.slug}`,
                }}
            />
        </div>
    );
}

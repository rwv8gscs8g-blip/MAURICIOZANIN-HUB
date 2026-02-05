"use client";

import { useState, useEffect } from "react";

type PdfFlipViewerProps = {
  url: string;
  className?: string;
  height?: string;
  /** URL para o link "Baixar PDF" (deve ser a mesma do proxy para funcionar sem login) */
  downloadUrl?: string;
};

/**
 * Visualizador de PDF: iframe (navegador exibe o PDF quando suportado) + link de download.
 * Evita dependência de pdfjs-dist e funciona em localhost e produção sem redirect para login.
 */
export function PdfFlipViewer({ url, className, height = "80vh", downloadUrl }: PdfFlipViewerProps) {
  const [iframeError, setIframeError] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const href = downloadUrl ?? url;

  useEffect(() => {
    if (!url || iframeError) return;
    const t = setTimeout(() => setSlowLoad(true), 10000);
    return () => clearTimeout(t);
  }, [url, iframeError]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#1E3A8A] font-medium underline hover:opacity-80"
        >
          Baixar PDF
        </a>
        <span className="text-xs text-[#64748B]">
          Use o link acima para abrir ou baixar o documento em outra aba.
        </span>
      </div>

      <div
        className="w-full bg-slate-50 border border-[#E2E8F0] overflow-auto flex flex-col items-center justify-center"
        style={{ minHeight: height }}
      >
        {!iframeError ? (
          <iframe
            src={url}
            title="Visualização do PDF"
            className="w-full border-0 flex-1"
            style={{ minHeight: height }}
            onError={() => setIframeError(true)}
          />
        ) : null}
        {iframeError ? (
          <div className="p-6 text-center text-sm text-[#64748B]">
            <p className="mb-2">O navegador não exibiu o PDF nesta página.</p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1E3A8A] font-medium underline hover:opacity-80"
            >
              Abrir ou baixar PDF
            </a>
          </div>
        ) : null}
        {slowLoad && !iframeError ? (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-2 rounded">
            Se o documento não carregou (ex.: em produção), use o link &quot;Baixar PDF&quot; acima para abrir em outra aba.
          </p>
        ) : null}
      </div>
    </div>
  );
}

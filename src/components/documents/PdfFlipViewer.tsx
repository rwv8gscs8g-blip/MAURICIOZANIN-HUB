"use client";

import { useEffect, useRef, useState } from "react";

type PdfFlipViewerProps = {
  url: string;
  className?: string;
  height?: string;
};

export function PdfFlipViewer({ url, className, height = "80vh" }: PdfFlipViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    (async () => {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs";
      }
      const encodedUrl = encodeURI(url);
      const loadingTask = pdfjs.getDocument(encodedUrl);
      const pdf = await loadingTask.promise;
      if (cancelled) return;
      setPdfDoc(pdf);
      setPages(pdf.numPages || 1);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const pageObj = await pdfDoc.getPage(page);
      const viewport = pageObj.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await pageObj.render({ canvasContext: context!, viewport }).promise;
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, page, scale]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pages, p + 1));

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={handlePrev}
          className="px-3 py-2 border border-[#E2E8F0] text-sm text-[#0F172A] hover:bg-slate-50"
        >
          Página anterior
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-2 border border-[#E2E8F0] text-sm text-[#0F172A] hover:bg-slate-50"
        >
          Próxima página
        </button>
        <label className="text-sm text-[#64748B] flex items-center gap-2">
          Página
          <input
            type="number"
            min={1}
            max={pages}
            value={page}
            onChange={(e) => setPage(Number(e.target.value) || 1)}
            className="w-20 border border-[#E2E8F0] px-2 py-1 text-sm"
          />
        </label>
        <label className="text-sm text-[#64748B] flex items-center gap-2">
          Zoom
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="border border-[#E2E8F0] px-2 py-1 text-sm"
          >
            {[0.8, 1, 1.2, 1.4, 1.6].map((value) => (
              <option key={value} value={value}>
                {Math.round(value * 100)}%
              </option>
            ))}
          </select>
        </label>
        <div className="text-xs text-[#64748B]">{pages} páginas</div>
      </div>

      <div
        className="w-full bg-slate-50 border border-[#E2E8F0] overflow-auto flex items-center justify-center"
        style={{ height }}
      >
        {loading ? (
          <div className="text-sm text-[#64748B]">Carregando PDF...</div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
}

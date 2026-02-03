"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

export function HelpButton({
  title = "Ajuda",
  helpHref,
  children,
}: {
  title?: string;
  helpHref?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full border border-[#1E3A8A] bg-white px-4 py-2 text-sm text-[#1E3A8A] shadow-sm hover:bg-[#F8FAFC]"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
      >
        Ajuda
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          id={id}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Fechar ajuda"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[#64748B]">Ajuda</div>
                <h2 className="text-xl font-bold text-[#0F172A] mt-2">{title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 border border-[#CBD5E1] text-sm text-[#0F172A]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-[#0F172A] leading-relaxed">
              {children}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {helpHref && (
                <Link
                  href={helpHref}
                  target="_blank"
                  className="px-4 py-2 bg-[#1E3A8A] text-white text-sm"
                >
                  Abrir help (HTML)
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


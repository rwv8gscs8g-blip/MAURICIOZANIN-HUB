"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type ClientLogoUploadProps = {
  clientId: string;
  clientSlug: string;
};

export function ClientLogoUpload({ clientId, clientSlug }: ClientLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const fileInput = fileInputRef.current;
        if (!fileInput?.files?.[0]) {
          setError("Selecione uma imagem (PNG, JPG ou WebP).");
          return;
        }
        setIsUploading(true);
        setError(null);
        setSuccess(false);
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("clientId", clientId);
        try {
          const response = await fetch("/api/admin/clients", {
            method: "POST",
            body: formData,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            setError(data?.error || "Falha ao enviar logo.");
            return;
          }
          if (data?.logoUrl) {
            setSuccess(true);
            fileInput.value = "";
            router.refresh();
          } else {
            setError("Resposta inválida do servidor.");
          }
        } catch (err) {
          setError("Erro de conexão. Tente novamente.");
        } finally {
          setIsUploading(false);
        }
      }}
    >
      <label className="text-sm text-[#1E3A8A] border border-[#1E3A8A] px-3 py-2 rounded-md cursor-pointer hover:bg-[#1E3A8A]/5">
        {isUploading ? "Enviando..." : "Enviar logo (PNG, JPG ou WebP)"}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
        />
      </label>
      {success && <span className="text-xs text-emerald-600">Logo atualizada.</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}

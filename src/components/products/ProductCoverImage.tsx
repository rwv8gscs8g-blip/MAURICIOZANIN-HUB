"use client";

import { useState } from "react";

const PLACEHOLDER_SRC = "/images/placeholder.svg";

/**
 * Imagem de capa do produto com fallback para placeholder em caso de 404 ou erro.
 * Usa o proxy /api/products/[slug]/cover que busca no R2 em produção.
 */
export function ProductCoverImage({
  slug,
  alt,
  className = "w-full h-48 object-contain",
}: {
  slug: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const src = error ? PLACEHOLDER_SRC : `/api/products/${slug}/cover`;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

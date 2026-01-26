/**
 * GALERIA DE FOTOS PROFISSIONAIS
 * 
 * Para adicionar novas fotos:
 * 1. Coloque a imagem em /public/images/professional/
 * 2. Adicione um objeto abaixo com id, src, alt e filename
 * 3. As imagens serão exibidas automaticamente no carrossel
 */

export interface ProfessionalPhoto {
  id: string;
  src: string; // Caminho relativo a /public/images/professional/
  alt: string;
  filename?: string; // Nome do arquivo para download
}

export const professionalPhotos: ProfessionalPhoto[] = [
  {
    id: "photo-1",
    src: "/images/professional/photo-1.jpg",
    alt: "Luís Maurício Junqueira Zanin - Foto profissional séria",
    filename: "mauricio-zanin-foto-profissional-1.jpg",
  },
  {
    id: "photo-2",
    src: "/images/professional/photo-2.jpg",
    alt: "Luís Maurício Junqueira Zanin - Foto profissional sorrindo",
    filename: "mauricio-zanin-foto-profissional-2.jpg",
  },
  {
    id: "photo-3",
    src: "/images/professional/photo-3.jpg",
    alt: "Luís Maurício Junqueira Zanin - Foto profissional formal",
    filename: "mauricio-zanin-foto-profissional-3.jpg",
  },
];

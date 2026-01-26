# Galeria de Fotos Profissionais

Esta pasta contém as fotos profissionais exibidas no carrossel da página `/sobre`.

## Como Adicionar/Atualizar Fotos

### Método 1: Adicionar manualmente

1. Coloque suas imagens nesta pasta (`public/images/professional/`)
2. Nomeie os arquivos como: `photo-1.jpg`, `photo-2.jpg`, etc.
3. Edite o arquivo `src/data/professional-photos.ts` e adicione/atualize as entradas:

```typescript
{
  id: "photo-4",
  src: "/images/professional/photo-4.jpg",
  alt: "Luís Maurício Junqueira Zanin - Descrição da foto",
  filename: "mauricio-zanin-foto-profissional-4.jpg",
}
```

### Método 2: Substituir imagens existentes

1. Substitua os arquivos `photo-1.jpg`, `photo-2.jpg`, `photo-3.jpg` mantendo os mesmos nomes
2. As imagens serão atualizadas automaticamente no site

## Formatos Suportados

- JPG/JPEG (recomendado)
- PNG
- WebP

## Tamanho Recomendado

- Proporção: 3:4 (vertical)
- Resolução mínima: 800x1066px
- Resolução ideal: 1200x1600px ou superior

## Otimização

Para melhor performance, otimize as imagens antes de adicionar:
- Use ferramentas como TinyPNG, Squoosh ou ImageOptim
- Mantenha o tamanho do arquivo abaixo de 500KB por imagem

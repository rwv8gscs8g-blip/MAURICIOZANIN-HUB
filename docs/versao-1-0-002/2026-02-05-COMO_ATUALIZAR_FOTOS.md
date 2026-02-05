# 📸 Como Atualizar as Fotos Profissionais

## Método Rápido (Substituir Fotos Existentes)

1. **Localize a pasta:**
   ```
   /public/images/professional/
   ```

2. **Substitua os arquivos:**
   - `photo-1.jpg` → Substitua pela nova foto 1
   - `photo-2.jpg` → Substitua pela nova foto 2
   - `photo-3.jpg` → Substitua pela nova foto 3

3. **Mantenha os mesmos nomes de arquivo!**
   - O site atualizará automaticamente
   - Não precisa editar código

## Método Completo (Adicionar Mais Fotos)

1. **Adicione a imagem na pasta:**
   ```
   /public/images/professional/photo-4.jpg
   ```

2. **Edite o arquivo:** `src/data/professional-photos.ts`

3. **Adicione a nova entrada:**
   ```typescript
   {
     id: "photo-4",
     src: "/images/professional/photo-4.jpg",
     alt: "Luís Maurício Junqueira Zanin - Descrição da foto",
     filename: "mauricio-zanin-foto-profissional-4.jpg",
   }
   ```

## Especificações Técnicas

- **Formato:** JPG, PNG ou WebP
- **Proporção:** 3:4 (vertical) - recomendado
- **Tamanho:** Mínimo 800x1066px, ideal 1200x1600px ou superior
- **Peso:** Máximo 500KB por imagem (otimize antes de adicionar)

## Funcionalidades do Carrossel

✅ **Alternância automática** a cada 5 segundos  
✅ **Navegação manual** com setas ou miniaturas  
✅ **Pausar/Reproduzir** o carrossel automático  
✅ **Download** de qualquer foto com um clique  
✅ **Responsivo** para mobile e desktop  

## Localização no Site

As fotos aparecem na página: **http://localhost:3001/sobre**

Logo após o cabeçalho, antes da biografia.

import { useState, useEffect } from "react";

interface LinkedInPost {
  id: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export function useLinkedIn() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar buscar da API
      const response = await fetch("/api/linkedin/posts?limit=10");

      if (!response.ok) {
        throw new Error("Erro ao buscar posts do LinkedIn");
      }

      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        // Converter formato da API para formato do componente
        setPosts(
          data.posts.map((post: any) => ({
            id: post.id || post.postId,
            content: post.content,
            imageUrl: post.imageUrl,
            linkUrl: post.linkUrl || `https://linkedin.com/posts/${post.id || post.postId}`,
            publishedAt: post.publishedAt,
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
          }))
        );
      } else {
        // Fallback para dados mock se API não retornar dados
        const mockPosts: LinkedInPost[] = [
          {
            id: "1",
            content:
              "Acabei de participar de um workshop internacional sobre compras públicas sustentáveis. A troca de experiências com especialistas europeus foi enriquecedora e reforça a importância da cooperação internacional em governança pública.",
            publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            likes: 45,
            comments: 12,
            shares: 8,
          },
          {
            id: "2",
            content:
              "A Rede Inovajuntos alcançou mais de 200 municípios! 🎉\n\nÉ gratificante ver como a cooperação intermunicipal está transformando a gestão pública no Brasil. Juntos, estamos construindo um futuro mais inovador e eficiente.",
            publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            likes: 128,
            comments: 34,
            shares: 21,
          },
          {
            id: "3",
            content:
              "Nova cartilha do Sebrae sobre Compras Públicas para Pequenos Negócios está disponível!\n\nEste material é essencial para empresas que querem participar de licitações públicas de forma estratégica e conforme a Lei 14.133/2021.",
            linkUrl: "/compartilhe",
            publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
            likes: 89,
            comments: 18,
            shares: 15,
          },
        ];
        setPosts(mockPosts);
      }
    } catch (err) {
      console.error("Erro ao buscar posts do LinkedIn:", err);
      setError("Erro ao carregar posts do LinkedIn");
      // Manter posts anteriores em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
}

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
        setPosts([]);
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

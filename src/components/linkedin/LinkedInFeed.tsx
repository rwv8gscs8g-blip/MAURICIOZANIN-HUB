"use client";

import { motion } from "framer-motion";
import { Linkedin, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

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

interface LinkedInFeedProps {
  posts: LinkedInPost[];
  maxPosts?: number;
}

export function LinkedInFeed({ posts, maxPosts = 3 }: LinkedInFeedProps) {
  const displayPosts = posts.slice(0, maxPosts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Linkedin className="h-6 w-6 text-[#1E3A8A]" />
          <h2 className="text-fluid-2xl font-bold text-[#0F172A] tracking-tight">
            Últimas Publicações
          </h2>
        </div>
        <a
          href="https://linkedin.com/in/mauriciozanin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-fluid-sm text-[#1E3A8A] hover:underline flex items-center gap-1"
        >
          Ver perfil completo
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="space-y-4">
        {displayPosts.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] p-6 text-fluid-sm text-[#64748B]">
            Publicações em consolidação. Em breve, os posts oficiais estarão disponíveis.
          </div>
        ) : (
          displayPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-[#E2E8F0] p-6 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <time className="text-fluid-xs text-[#64748B]">
                  {format(new Date(post.publishedAt), "dd/MM/yyyy")}
                </time>
              </div>

              <p className="text-fluid-base text-[#0F172A] leading-[1.8] mb-4 whitespace-pre-line">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              )}

              {post.linkUrl && (
                <a
                  href={post.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-4 p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="text-fluid-sm text-[#1E3A8A] flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Ver link compartilhado
                  </span>
                </a>
              )}

              <div className="flex items-center gap-6 text-fluid-sm text-[#64748B] pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares}</span>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}

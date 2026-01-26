"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { TriplePillar } from "@/components/home/TriplePillar";
import { LinkedInFeed } from "@/components/linkedin/LinkedInFeed";
import { useLinkedIn } from "@/hooks/useLinkedIn";

export default function HomePage() {
  const { posts, loading } = useLinkedIn();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <TriplePillar />
      
      {/* LinkedIn Feed Section */}
      <section className="py-24 bg-white">
        <div className="container-fluid">
          {loading ? (
            <div className="text-center text-[#64748B]">Carregando publicações...</div>
          ) : (
            <LinkedInFeed posts={posts} maxPosts={3} />
          )}
        </div>
      </section>
    </div>
  );
}

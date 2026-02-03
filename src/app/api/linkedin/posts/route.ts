import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

/**
 * API Route para buscar posts do LinkedIn
 * 
 * Esta rota busca posts do LinkedIn usando a Posts API v2
 * e retorna os posts mais recentes.
 * 
 * GET /api/linkedin/posts?limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const orgId = process.env.LINKEDIN_ORG_ID;

    if (!accessToken) {
      console.warn("LINKEDIN_ACCESS_TOKEN não configurado");
      return NextResponse.json({
        posts: [],
        total: 0,
      });
    }

    // Implementação real com LinkedIn Pages Data Portability API
    // Usando o endpoint /dmaPosts para buscar posts da organização
    // Documentação: https://learn.microsoft.com/en-us/linkedin/dma/pages-data-portability-overview
    // 
    // const response = await fetch(
    //   `https://api.linkedin.com/rest/dmaPosts?q=author&author=${orgId}&maxPaginationCount=${limit}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "Linkedin-Version": "202501",
    //       "X-Restli-Protocol-Version": "2.0.0",
    //     },
    //   }
    // );

    // if (!response.ok) {
    //   throw new Error(`LinkedIn API error: ${response.statusText}`);
    // }

    // const data = await response.json();
    // const posts = data.elements.map((post: any) => ({
    //   id: post.id,
    //   content: post.specificContent?.com.linkedin.ugc.ShareContent?.text?.text || "",
    //   publishedAt: post.created?.time || new Date().toISOString(),
    //   likes: post.numLikes || 0,
    //   comments: post.numComments || 0,
    //   shares: post.numShares || 0,
    // }));

    // Salvar no banco de dados
    // for (const post of posts) {
    //   await prisma.linkedInPost.upsert({
    //     where: { postId: post.id },
    //     update: {
    //       content: post.content,
    //       publishedAt: new Date(post.publishedAt),
    //       likes: post.likes,
    //       comments: post.comments,
    //       shares: post.shares,
    //     },
    //     create: {
    //       postId: post.id,
    //       content: post.content,
    //       publishedAt: new Date(post.publishedAt),
    //       likes: post.likes,
    //       comments: post.comments,
    //       shares: post.shares,
    //     },
    //   });
    // }

    return NextResponse.json({
      message: "LinkedIn Posts API endpoint - Configure LINKEDIN_ACCESS_TOKEN para usar",
      posts: [],
      total: 0,
    });
  } catch (error) {
    console.error("Erro ao buscar posts do LinkedIn:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts do LinkedIn" },
      { status: 500 }
    );
  }
}

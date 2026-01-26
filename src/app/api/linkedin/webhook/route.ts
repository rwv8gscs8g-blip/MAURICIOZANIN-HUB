import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
// import { prisma } from "@/lib/prisma";

/**
 * LinkedIn Webhook Handler
 * 
 * Este endpoint recebe notificações do LinkedIn quando novos posts são publicados.
 * 
 * GET: Validação do webhook (LinkedIn envia challengeCode)
 * POST: Recebe notificações de novos posts
 */
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const webhookSecret = process.env.LINKEDIN_WEBHOOK_SECRET;

  if (challenge && webhookSecret) {
    // Validar webhook usando HMACSHA256
    // LinkedIn espera que retornemos o challengeCode assinado
    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(challenge)
      .digest("hex");

    return NextResponse.json({
      challenge: challenge,
      signature: signature,
    });
  }

  if (challenge) {
    // Modo simples (sem validação HMAC) - apenas para desenvolvimento
    return NextResponse.json(challenge, { status: 200 });
  }

  return NextResponse.json(
    { message: "LinkedIn Webhook endpoint - Configure LINKEDIN_WEBHOOK_SECRET" },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.LINKEDIN_WEBHOOK_SECRET;
    const signature = request.headers.get("x-linkedin-signature");

    // Validar assinatura do webhook
    if (webhookSecret && signature) {
      const body = await request.text();
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const data = await request.json();

    // Processar notificação do LinkedIn
    // LinkedIn envia diferentes tipos de eventos
    if (data.eventType === "POST_CREATED" || data.eventType === "POST_UPDATED") {
      const post = data.post;

      // Salvar no banco de dados
      // await prisma.linkedInPost.upsert({
      //   where: { postId: post.id },
      //   update: {
      //     content: post.content,
      //     publishedAt: new Date(post.publishedAt),
      //     likes: post.engagement?.likes || 0,
      //     comments: post.engagement?.comments || 0,
      //     shares: post.engagement?.shares || 0,
      //   },
      //   create: {
      //     postId: post.id,
      //     content: post.content,
      //     imageUrl: post.imageUrl,
      //     linkUrl: post.linkUrl,
      //     publishedAt: new Date(post.publishedAt),
      //     likes: post.engagement?.likes || 0,
      //     comments: post.engagement?.comments || 0,
      //     shares: post.engagement?.shares || 0,
      //   },
      // });

      // Criar evento na timeline se for novo post
      // if (data.eventType === "POST_CREATED") {
      //   await prisma.event.create({
      //     data: {
      //       title: "Publicação no LinkedIn",
      //       description: post.content.substring(0, 200),
      //       date: new Date(post.publishedAt),
      //       type: "PUBLICATION",
      //       category: "SOCIAL",
      //       url: post.linkUrl || `https://linkedin.com/posts/${post.id}`,
      //       thumbnailUrl: post.imageUrl,
      //     },
      //   });
      // }
    }

    return NextResponse.json(
      { success: true, message: "Webhook processado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar webhook do LinkedIn:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

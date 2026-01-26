import { NextRequest, NextResponse } from "next/server";

// Função para identificar a fonte do acesso
function identifySource(referrer: string | null, userAgent: string | null): string | null {
  if (!referrer) return "direct";

  const referrerLower = referrer.toLowerCase();

  // Wikipedia
  if (referrerLower.includes("wikipedia.org")) {
    return "wikipedia";
  }

  // LinkedIn
  if (referrerLower.includes("linkedin.com")) {
    return "linkedin";
  }

  // Google
  if (referrerLower.includes("google.com") || referrerLower.includes("google.")) {
    return "google";
  }

  // Facebook
  if (referrerLower.includes("facebook.com")) {
    return "facebook";
  }

  // Twitter/X
  if (referrerLower.includes("twitter.com") || referrerLower.includes("x.com")) {
    return "twitter";
  }

  // YouTube
  if (referrerLower.includes("youtube.com")) {
    return "youtube";
  }

  return "other";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    const referrer = request.headers.get("referer") || null;
    const userAgent = request.headers.get("user-agent") || null;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;

    const source = identifySource(referrer, userAgent);

    // TODO: Salvar no banco de dados usando Prisma
    // await prisma.accessLog.create({
    //   data: {
    //     path,
    //     referrer,
    //     userAgent,
    //     ipAddress,
    //     source,
    //   }
    // });

    return NextResponse.json(
      { success: true, source, referrer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao registrar acesso:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao registrar acesso" },
      { status: 500 }
    );
  }
}

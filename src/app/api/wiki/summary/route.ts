import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ error: "Título não informado" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`,
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Resumo não encontrado" }, { status: 404 });
    }

    const data = await response.json();

    return NextResponse.json({
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page || null,
      source: "Wikipedia",
    });
  } catch (error) {
    console.error("Wikipedia summary error", error);
    return NextResponse.json({ error: "Erro ao consultar Wikipedia" }, { status: 500 });
  }
}

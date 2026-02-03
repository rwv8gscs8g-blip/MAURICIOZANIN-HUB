import { NextRequest, NextResponse } from "next/server";

// TODO: Implementar integração com Google Custom Search API
// Este é um mock que simula a busca de menções na web
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // Mock de resultados de busca
    // Em produção, você usaria a Google Custom Search API:
    // const response = await fetch(
    //   `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
    // );
    // const data = await response.json();

    const mockResults: Array<{
      title: string;
      snippet: string;
      link: string;
      source: string;
    }> = [];

    // Salvar no banco de dados:
    // for (const result of mockResults) {
    //   await prisma.newsMention.create({
    //     data: {
    //       url: result.link,
    //       title: result.title,
    //       source: result.source,
    //       excerpt: result.snippet,
    //       status: 'PENDENTE',
    //       publishedAt: new Date(),
    //     }
    //   });
    // }

    return NextResponse.json(
      { success: true, results: mockResults },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar menções:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar menções" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const ibgeId = searchParams.get("ibgeId");

  if (!title) {
    return NextResponse.json({ error: "Título não informado" }, { status: 400 });
  }

  try {
    const summaryRes = await fetch(
      `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!summaryRes.ok) {
      return NextResponse.json({ error: "Resumo não encontrado" }, { status: 404 });
    }

    const summary = await summaryRes.json();
    const pageUrl = summary.content_urls?.desktop?.page || null;
    if (!pageUrl) {
      return NextResponse.json({ locationUrl: null });
    }

    const titleSlug = summary.title.replace(/ /g, "_");

    const parseRes = await fetch(
      `https://pt.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
        titleSlug
      )}&prop=images|text&format=json&origin=*`,
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!parseRes.ok) {
      return NextResponse.json({ locationUrl: pageUrl });
    }

    const parse = await parseRes.json();
    const images: string[] = parse?.parse?.images || [];
    const locationImage = images.find((img) =>
      /Mapa.*localiza|localiza.*mapa|mapa.*municipio|mapa.*localiza/i.test(img)
    );

    if (!locationImage) {
      return NextResponse.json({ locationUrl: pageUrl });
    }

    const imageInfoRes = await fetch(
      `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        locationImage
      )}&prop=imageinfo&iiprop=url&format=json&origin=*`,
      { next: { revalidate: 60 * 60 * 24 } }
    );

    if (!imageInfoRes.ok) {
      return NextResponse.json({ locationUrl: pageUrl });
    }

    const imageInfo = await imageInfoRes.json();
    const page = Object.values(imageInfo?.query?.pages || {})[0] as any;
    const imageUrl = page?.imageinfo?.[0]?.url || null;

    const locationUrl = imageUrl || pageUrl;

    if (ibgeId && locationUrl) {
      const municipio = await prisma.municipio.findUnique({ where: { ibgeId } });
      if (municipio) {
        await prisma.municipio.update({
          where: { ibgeId },
          data: {
            fontes: {
              ...((municipio.fontes as any) || {}),
              wikipediaLocalizacao: locationUrl,
            },
          },
        });
      }
    }

    return NextResponse.json({
      locationUrl,
      source: "Wikipedia",
    });
  } catch (error) {
    console.error("Wikipedia location error", error);
    return NextResponse.json({ error: "Erro ao consultar Wikipedia" }, { status: 500 });
  }
}

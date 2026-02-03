import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClienteProdutoRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/produtos/${resolvedParams.slug}`);
}

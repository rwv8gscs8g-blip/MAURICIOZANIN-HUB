import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DiagnosticoVerRedirectPage({
  params,
}: {
  params: Promise<{ ibgeId: string }>;
}) {
  const resolvedParams = await params;
  const ibgeId = String(resolvedParams.ibgeId || "").trim();
  if (!ibgeId) redirect("/diagnostico");
  redirect(`/diagnostico/municipio/${ibgeId}`);
}

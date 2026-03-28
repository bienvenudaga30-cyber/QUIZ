// app/j/[slug]/page.tsx
import { redirect } from "next/navigation";
import { resolveShortLink } from "@/lib/qr";

export default async function ShortLinkPage({
  params,
}: {
  params: { slug: string };
}) {
  const code = await resolveShortLink(params.slug);
  if (!code) redirect("/");
  redirect(`/player?code=${code}`);
}
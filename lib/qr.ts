// lib/qr.ts
import { createClient } from "@/lib/supabase/server";

function randomSlug(len = 6): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function createShortLink(roomId: string): Promise<string> {
  const supabase = await createClient();

  // Générer un slug unique
  let slug = randomSlug();
  let attempts = 0;
  while (attempts < 5) {
    const { data } = await supabase
      .from("short_links")
      .select("id")
      .eq("slug", slug)
      .single();
    if (!data) break;
    slug = randomSlug();
    attempts++;
  }

  await supabase.from("short_links").insert({ slug, room_id: roomId });

  return `${process.env.NEXT_PUBLIC_APP_URL}/j/${slug}`;
}

export async function resolveShortLink(slug: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("short_links")
    .select("room_id, rooms(code)")
    .eq("slug", slug)
    .single();

  if (!data) return null;

  // Incrémenter le compteur de clics
  await supabase
    .from("short_links")
    .update({ clicks: supabase.rpc("increment", { x: 1 }) })
    .eq("slug", slug);

  return (data.rooms as any)?.code ?? null;
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionsFromPrompt } from "@/lib/ai-questions";

export async function POST(req: NextRequest) {
  const { roomId, prompt, count = 10 } = await req.json();
  const supabase = await createClient();

  // Vérifier que c'est un admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Générer les questions avec l'IA
  const questions = await generateQuestionsFromPrompt(prompt, count);

  // Insérer dans Supabase avec position auto
  const { data: existing } = await supabase
    .from("questions")
    .select("position")
    .eq("room_id", roomId)
    .order("position", { ascending: false })
    .limit(1);

  let nextPos = (existing?.[0]?.position ?? 0) + 1;

  const toInsert = questions.map((q: any, i: number) => ({
    ...q,
    room_id: roomId,
    position: nextPos + i,
  }));

  const { data, error } = await supabase
    .from("questions")
    .insert(toInsert)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ questions: data, count: data.length });
}
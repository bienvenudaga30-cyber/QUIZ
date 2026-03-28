import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { roomId, jsonText } = await req.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let questions;
  try {
    const parsed = JSON.parse(jsonText);
    questions = parsed.questions ?? parsed;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("questions")
    .select("position")
    .eq("room_id", roomId)
    .order("position", { ascending: false })
    .limit(1);

  let nextPos = (existing?.[0]?.position ?? 0) + 1;

  const toInsert = questions.map((q: any, i: number) => ({
    room_id: roomId,
    text: q.text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_opt: q.correct_opt,
    timer_sec: q.timer_sec ?? 30,
    points: q.points ?? 1000,
    category: q.category ?? null,
    difficulty: q.difficulty ?? 2,
    position: nextPos + i,
  }));

  const { data, error } = await supabase
    .from("questions")
    .insert(toInsert)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ questions: data, count: data.length });
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { roomId, questions, text, option_a, option_b, option_c, option_d, correct_option } = body

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get the next position
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('position')
    .eq('room_id', roomId)
    .order('position', { ascending: false })
    .limit(1)

  let nextPosition = (existingQuestions?.[0]?.position ?? -1) + 1

  // Handle array of questions (from AdminSetup)
  if (questions && Array.isArray(questions)) {
    const questionsWithRoom = questions.map((q: { text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: string }, index: number) => ({
      room_id: roomId,
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      position: nextPosition + index,
    }))

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsWithRoom)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // Handle single question (from QuestionsList)
  if (!text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('questions')
    .insert([
      {
        room_id: roomId,
        text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        position: nextPosition,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

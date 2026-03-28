import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { roomId, text, option_a, option_b, option_c, option_d, correct_option } = await request.json()

  if (!roomId || !text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get the next position
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('position')
    .eq('room_id', roomId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = (existingQuestions?.[0]?.position ?? -1) + 1

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

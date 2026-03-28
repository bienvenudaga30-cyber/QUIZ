import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { roomId, questionId } = await request.json()

  if (!roomId || !questionId) {
    return NextResponse.json({ error: 'Room ID and Question ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  const timerStart = new Date().toISOString()

  const { error } = await supabase
    .from('current_question')
    .update({
      question_id: questionId,
      is_active: true,
      timer_start: timerStart,
      timer_duration: 30,
      updated_at: timerStart,
    })
    .eq('room_id', roomId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

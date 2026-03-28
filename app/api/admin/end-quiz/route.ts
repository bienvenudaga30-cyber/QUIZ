import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { roomId } = await request.json()

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Update room status to finished
  const { error: roomError } = await supabase
    .from('rooms')
    .update({ status: 'finished', updated_at: new Date().toISOString() })
    .eq('id', roomId)

  if (roomError) {
    return NextResponse.json({ error: roomError.message }, { status: 500 })
  }

  // Deactivate current question
  const { error: qError } = await supabase
    .from('current_question')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('room_id', roomId)

  if (qError) {
    return NextResponse.json({ error: qError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

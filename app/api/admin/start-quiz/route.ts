import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { roomId } = await request.json()

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Update room status to playing
  const { error: roomError } = await supabase
    .from('rooms')
    .update({ status: 'playing', updated_at: new Date().toISOString() })
    .eq('id', roomId)

  if (roomError) {
    return NextResponse.json({ error: roomError.message }, { status: 500 })
  }

  // Initialize current_question if doesn't exist
  const { data: existing } = await supabase
    .from('current_question')
    .select('id')
    .eq('room_id', roomId)
    .single()

  if (!existing) {
    const { error } = await supabase
      .from('current_question')
      .insert([{ room_id: roomId, is_active: false }])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

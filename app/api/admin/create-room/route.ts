import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function POST() {
  try {
    const supabase = await createClient()

    // Create the room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert([{ code: generateRoomCode(), status: 'waiting' }])
      .select()
      .single()

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 })
    }

    // Initialize current_question for this room
    const { error: cqError } = await supabase
      .from('current_question')
      .insert([{ room_id: room.id, is_active: false }])

    if (cqError) {
      return NextResponse.json({ error: cqError.message }, { status: 500 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Failed to create room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

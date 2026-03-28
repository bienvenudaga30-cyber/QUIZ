import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { roomCode, playerName } = await request.json()

  if (!roomCode || !playerName) {
    return NextResponse.json({ error: 'Room code and player name required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id')
    .eq('code', roomCode)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  // Add player to room
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert([{ room_id: room.id, pseudo: playerName }])
    .select()
    .single()

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 500 })
  }

  return NextResponse.json({ playerId: player.id, roomId: room.id, playerName })
}

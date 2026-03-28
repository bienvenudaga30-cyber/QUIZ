import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('room_id', roomId)
    .order('position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

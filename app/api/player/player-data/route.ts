import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId')

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (error) {
    return NextResponse.json(null)
  }

  return NextResponse.json(data)
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Room code required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single()

  if (error) {
    return NextResponse.json(null)
  }

  return NextResponse.json(data)
}

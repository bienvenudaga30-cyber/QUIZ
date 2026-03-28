import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const questionId = request.nextUrl.searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json({ error: 'Question ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)

  if (error) {
    return NextResponse.json([])
  }

  return NextResponse.json(data)
}

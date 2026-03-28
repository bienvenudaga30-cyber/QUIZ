import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { playerId, questionId, selectedOption } = await request.json()

  if (!playerId || !questionId || !selectedOption) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get question to check correct answer
  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('correct_option')
    .eq('id', questionId)
    .single()

  if (qError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const isCorrect = selectedOption === question.correct_option

  // Insert answer
  const { data: answer, error: aError } = await supabase
    .from('answers')
    .insert([
      {
        player_id: playerId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
      },
    ])
    .select()
    .single()

  if (aError) {
    return NextResponse.json({ error: aError.message }, { status: 500 })
  }

  // Update player score if correct
  if (isCorrect) {
    const { data: player } = await supabase
      .from('players')
      .select('score')
      .eq('id', playerId)
      .single()

    if (player) {
      await supabase
        .from('players')
        .update({ score: player.score + 1 })
        .eq('id', playerId)
    }
  }

  return NextResponse.json({ answer, isCorrect })
}

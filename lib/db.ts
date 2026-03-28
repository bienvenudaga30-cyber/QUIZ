import { createClient } from '@/lib/supabase/server'
import { Room, Question, Player, Answer, CurrentQuestion } from './types'

// Room operations
export async function createRoom() {
  const code = generateRoomCode()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .insert([{ code, status: 'waiting' }])
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function getRoomByCode(code: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single()

  if (error) return null
  return data as Room
}

export async function getRoomById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Room
}

export async function updateRoomStatus(id: string, status: Room['status']) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Room
}

// Question operations
export async function addQuestions(roomId: string, questions: Omit<Question, 'id' | 'room_id' | 'created_at'>[]) {
  const supabase = await createClient()

  const questionsWithRoom = questions.map((q, index) => ({
    ...q,
    room_id: roomId,
    position: index,
  }))

  const { data, error } = await supabase
    .from('questions')
    .insert(questionsWithRoom)
    .select()

  if (error) throw error
  return data as Question[]
}

export async function getQuestions(roomId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('room_id', roomId)
    .order('position', { ascending: true })

  if (error) throw error
  return data as Question[]
}

export async function getQuestionById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Question
}

// Current question operations
export async function initializeCurrentQuestion(roomId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('current_question')
    .insert([{ room_id: roomId, is_active: false }])
    .select()
    .single()

  if (error) throw error
  return data as CurrentQuestion
}

export async function getCurrentQuestion(roomId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('current_question')
    .select('*')
    .eq('room_id', roomId)
    .single()

  if (error) return null
  return data as CurrentQuestion
}

export async function updateCurrentQuestion(
  roomId: string,
  questionId: string | null,
  isActive: boolean,
  timerDuration: number = 30
) {
  const supabase = await createClient()

  const timerStart = isActive ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('current_question')
    .update({
      question_id: questionId,
      is_active: isActive,
      timer_start: timerStart,
      timer_duration: timerDuration,
      updated_at: new Date().toISOString(),
    })
    .eq('room_id', roomId)
    .select()
    .single()

  if (error) throw error
  return data as CurrentQuestion
}

// Player operations
export async function joinGame(roomId: string, pseudo: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .insert([{ room_id: roomId, pseudo }])
    .select()
    .single()

  if (error) throw error
  return data as Player
}

export async function getPlayers(roomId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .order('score', { ascending: false })

  if (error) throw error
  return data as Player[]
}

export async function getPlayerById(playerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (error) throw error
  return data as Player
}

export async function updatePlayerScore(playerId: string, score: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .update({ score })
    .eq('id', playerId)
    .select()
    .single()

  if (error) throw error
  return data as Player
}

// Answer operations
export async function submitAnswer(
  playerId: string,
  questionId: string,
  selectedOption: 'A' | 'B' | 'C' | 'D'
) {
  const supabase = await createClient()

  const question = await getQuestionById(questionId)
  const isCorrect = selectedOption === question.correct_option

  const { data, error } = await supabase
    .from('answers')
    .insert([{ player_id: playerId, question_id: questionId, selected_option: selectedOption, is_correct: isCorrect }])
    .select()
    .single()

  if (error) throw error

  // Update player score if correct
  if (isCorrect) {
    const player = await supabase.from('players').select('score').eq('id', playerId).single()
    if (!player.error) {
      await updatePlayerScore(playerId, player.data.score + 1)
    }
  }

  return data as Answer
}

export async function getAnswers(roomId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('answers')
    .select('*, players(pseudo)')
    .eq('players.room_id', roomId)

  if (error) throw error
  return data
}

export async function getAnswersForQuestion(questionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)

  if (error) throw error
  return data as Answer[]
}

export async function getAnsweredQuestions(playerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('answers')
    .select('question_id')
    .eq('player_id', playerId)

  if (error) throw error
  return data.map((a) => a.question_id)
}

// Utility
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

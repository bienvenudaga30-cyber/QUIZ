export type Room = {
  id: string
  code: string
  status: 'waiting' | 'playing' | 'finished'
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  room_id: string
  text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  position: number
  created_at: string
}

export type CurrentQuestion = {
  id: string
  room_id: string
  question_id: string | null
  timer_start: string | null
  timer_duration: number
  is_active: boolean
  updated_at: string
}

export type Player = {
  id: string
  room_id: string
  pseudo: string
  score: number
  joined_at: string
}

export type Answer = {
  id: string
  player_id: string
  question_id: string
  selected_option: 'A' | 'B' | 'C' | 'D'
  is_correct: boolean
  answered_at: string
}

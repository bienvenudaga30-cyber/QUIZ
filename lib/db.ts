// This file is for client-side utility functions only
// All server-side database operations should be in API routes

import { Room, Question, Player, Answer, CurrentQuestion } from './types'

// Utility function - client side only
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

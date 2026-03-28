'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Question } from '@/lib/types'

interface AdminSetupProps {
  onRoomCreated: (roomId: string, roomCode: string) => void
}

export default function AdminSetup({ onRoomCreated }: AdminSetupProps) {
  const [loading, setLoading] = useState(false)
  const [questionsText, setQuestionsText] = useState('')
  const [error, setError] = useState('')

  const handleCreateRoom = async () => {
    setLoading(true)
    setError('')

    try {
      // Create room via API
      const roomRes = await fetch('/api/admin/create-room', {
        method: 'POST',
      })
      
      if (!roomRes.ok) {
        throw new Error('Failed to create room')
      }
      
      const room = await roomRes.json()

      if (questionsText.trim()) {
        const questions = parseQuestions(questionsText)
        if (questions.length > 0) {
          const questionsRes = await fetch('/api/admin/add-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room.id, questions }),
          })
          
          if (!questionsRes.ok) {
            throw new Error('Failed to add questions')
          }
        }
      }

      onRoomCreated(room.id, room.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const parseQuestions = (text: string): Omit<Question, 'id' | 'room_id' | 'created_at' | 'position'>[] => {
    const questions: Omit<Question, 'id' | 'room_id' | 'created_at' | 'position'>[] = []
    const blocks = text.split('\n\n').filter((b) => b.trim())

    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim())
      if (lines.length >= 6) {
        try {
          questions.push({
            text: lines[0],
            option_a: lines[1],
            option_b: lines[2],
            option_c: lines[3],
            option_d: lines[4],
            correct_option: (lines[5].toUpperCase() as 'A' | 'B' | 'C' | 'D') || 'A',
          })
        } catch {
          // Skip malformed questions
        }
      }
    }

    return questions
  }

  return (
    <Card className="p-8 bg-card space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Create New Quiz Room</h2>
        <p className="text-muted-foreground">
          Enter questions below (optional). Format: Question | OptionA | OptionB | OptionC | OptionD | CorrectAnswer (A/B/C/D)
        </p>
      </div>

      <div>
        <label htmlFor="questions" className="block text-sm font-medium text-foreground mb-2">
          Questions (one per block, separated by blank lines)
        </label>
        <Textarea
          id="questions"
          placeholder="Question 1?
Option A
Option B
Option C
Option D
A

Question 2?
Option A
Option B
Option C
Option D
B"
          value={questionsText}
          onChange={(e) => setQuestionsText(e.target.value)}
          className="min-h-64"
        />
      </div>

      {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">{error}</div>}

      <Button
        onClick={handleCreateRoom}
        disabled={loading}
        className="w-full text-lg py-6"
      >
        {loading ? 'Creating Room...' : 'Create Quiz Room'}
      </Button>
    </Card>
  )
}

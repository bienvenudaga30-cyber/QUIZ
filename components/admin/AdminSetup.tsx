'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Question } from '@/lib/types'
import { Zap, FileText, AlertCircle } from 'lucide-react'

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

  const questionCount = questionsText.trim() ? parseQuestions(questionsText).length : 0

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Add Questions</h2>
          <p className="text-sm text-muted-foreground">
            Paste your questions below. Each question block should be separated by a blank line.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="questions" className="text-sm font-medium text-foreground">
            Questions
          </label>
          {questionCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {questionCount} question{questionCount !== 1 ? 's' : ''} parsed
            </span>
          )}
        </div>
        <Textarea
          id="questions"
          placeholder={`What is the capital of France?
Paris
London
Berlin
Madrid
A

What is 2 + 2?
3
4
5
6
B`}
          value={questionsText}
          onChange={(e) => setQuestionsText(e.target.value)}
          className="min-h-64 bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Format: Question text, then 4 options (A-D), then the correct answer letter (A/B/C/D)
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button
        onClick={handleCreateRoom}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Creating Arena...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Launch Arena
          </span>
        )}
      </Button>
    </div>
  )
}

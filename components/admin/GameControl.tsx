'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Play, SkipForward, Square, Eye, Radio, Users } from 'lucide-react'

interface GameControlProps {
  roomId: string
}

const fetcher = async (key: string) => {
  const response = await fetch(key)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function GameControl({ roomId }: GameControlProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const { data: questions = [] } = useSWR(
    `/api/admin/questions?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 2000 }
  )

  const { data: currentQuestion, mutate: refetchCurrent } = useSWR(
    `/api/admin/current-question?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 1000 }
  )

  const { data: players = [] } = useSWR(
    `/api/dashboard/players?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 2000 }
  )

  const handleStartQuiz = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/start-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setLoading(true)
      try {
        const nextIndex = currentQuestionIndex + 1
        const nextQuestion = questions[nextIndex]
        await fetch('/api/admin/next-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, questionId: nextQuestion.id }),
        })
        setCurrentQuestionIndex(nextIndex)
        refetchCurrent()
      } finally {
        setLoading(false)
      }
    }
  }

  const handleShowQuestion = async (index: number) => {
    if (index < questions.length) {
      setLoading(true)
      try {
        const question = questions[index]
        await fetch('/api/admin/show-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, questionId: question.id, timerDuration: 30 }),
        })
        setCurrentQuestionIndex(index)
        refetchCurrent()
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEndQuiz = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/end-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Game Control</h2>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{players.length} players</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Round</p>
          <p className="text-2xl font-bold text-foreground">
            {currentQuestion?.question_id ? currentQuestionIndex + 1 : '0'} 
            <span className="text-muted-foreground text-lg font-normal"> / {questions.length}</span>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2">
            {currentQuestion?.is_active ? (
              <>
                <Radio className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-primary font-semibold">LIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">Standby</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Current Question Preview */}
      {currentQuestion?.question_id && questions[currentQuestionIndex] && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
          <p className="text-xs text-primary uppercase tracking-wider mb-2">Now Playing</p>
          <p className="text-foreground font-medium">{questions[currentQuestionIndex]?.text}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleStartQuiz}
          disabled={loading || questions.length === 0}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-5"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Quiz
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleShowQuestion(currentQuestionIndex)}
            disabled={loading || questions.length === 0 || !questions[currentQuestionIndex]}
            variant="outline"
            className="border-border hover:border-primary hover:bg-primary/10 py-5"
          >
            <Eye className="w-4 h-4 mr-2" />
            Show Q{currentQuestionIndex + 1}
          </Button>

          <Button
            onClick={handleNextQuestion}
            disabled={loading || currentQuestionIndex >= questions.length - 1}
            variant="outline"
            className="border-border hover:border-primary hover:bg-primary/10 py-5"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Next
          </Button>
        </div>

        <Button
          onClick={handleEndQuiz}
          disabled={loading}
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive py-5"
        >
          <Square className="w-4 h-4 mr-2" />
          End Quiz
        </Button>
      </div>
    </div>
  )
}

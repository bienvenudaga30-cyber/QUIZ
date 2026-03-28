'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Question } from '@/lib/types'
import { Trophy, Clock, Check, X, Send, Loader2 } from 'lucide-react'

interface GameInterfaceProps {
  playerId: string
  roomId: string
}

const fetcher = async (key: string) => {
  const response = await fetch(key)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function GameInterface({ playerId, roomId }: GameInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [submitted, setSubmitted] = useState(false)

  const { data: currentQuestion } = useSWR(
    `/api/player/current-question?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 500 }
  )

  const { data: question } = useSWR(
    currentQuestion?.question_id ? `/api/player/question?id=${currentQuestion.question_id}` : null,
    fetcher,
    { refreshInterval: 1000 }
  )

  const { data: playerData } = useSWR(`/api/player/player-data?playerId=${playerId}`, fetcher, {
    refreshInterval: 1000,
  })

  const { data: answeredQuestions = [] } = useSWR(
    `/api/player/answered-questions?playerId=${playerId}`,
    fetcher,
    { refreshInterval: 1000 }
  )

  useEffect(() => {
    setSelectedOption(null)
    setHasAnswered(false)
    setSubmitted(false)
  }, [currentQuestion?.question_id])

  useEffect(() => {
    if (!currentQuestion?.is_active) {
      setTimeLeft(currentQuestion?.timer_duration || 30)
      return
    }

    const interval = setInterval(() => {
      const start = new Date(currentQuestion.timer_start).getTime()
      const duration = (currentQuestion.timer_duration || 30) * 1000
      const elapsed = Date.now() - start
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000))
      setTimeLeft(remaining)
    }, 100)

    return () => clearInterval(interval)
  }, [currentQuestion])

  const handleSubmitAnswer = async () => {
    if (!selectedOption || hasAnswered || !currentQuestion?.question_id) return

    setSubmitted(true)
    setHasAnswered(true)

    try {
      await fetch('/api/player/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          questionId: currentQuestion.question_id,
          selectedOption,
        }),
      })
    } catch (err) {
      console.error('Failed to submit answer', err)
    }
  }

  // Waiting state
  if (!currentQuestion) {
    return (
      <div className="space-y-6">
        {/* Score Card */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground">Your Score</span>
            </div>
            <span className="text-4xl font-bold text-primary">{playerData?.score || 0}</span>
          </div>
        </div>

        {/* Waiting Message */}
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Waiting for Next Round</h2>
          <p className="text-muted-foreground">The host will start the question soon...</p>
        </div>
      </div>
    )
  }

  // Question paused
  if (!currentQuestion.is_active) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground">Your Score</span>
            </div>
            <span className="text-4xl font-bold text-primary">{playerData?.score || 0}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Round paused</p>
        </div>
      </div>
    )
  }

  // Loading question
  if (!question) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    )
  }

  const isAnswered = answeredQuestions.some((q: { question_id: string }) => q.question_id === question.id)

  const optionColors = {
    A: 'from-red-500 to-red-600',
    B: 'from-blue-500 to-blue-600',
    C: 'from-yellow-500 to-yellow-600',
    D: 'from-green-500 to-green-600',
  }

  return (
    <div className="space-y-4">
      {/* Header with Score and Timer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-2xl font-bold text-primary">{playerData?.score || 0}</span>
        </div>

        {/* Circular Timer */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(timeLeft / 30) * 283} 283`}
              className={timeLeft <= 10 ? 'text-destructive' : 'text-primary'}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xl font-semibold text-foreground leading-relaxed">{question.text}</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3">
        {(['A', 'B', 'C', 'D'] as const).map((option) => {
          const optionText = question[`option_${option.toLowerCase()}` as keyof Question]
          const isSelected = selectedOption === option
          const isCorrect = option === question.correct_option
          const showResult = isAnswered || (hasAnswered && timeLeft === 0)

          return (
            <button
              key={option}
              onClick={() => !isAnswered && !hasAnswered && setSelectedOption(option)}
              disabled={isAnswered || hasAnswered || timeLeft === 0}
              className={`relative p-4 rounded-xl text-white font-semibold transition-all duration-200 min-h-24 flex flex-col items-center justify-center text-center ${
                showResult
                  ? isCorrect
                    ? 'bg-gradient-to-br from-green-500 to-green-600 ring-4 ring-green-400/50'
                    : isSelected
                      ? 'bg-gradient-to-br from-red-500 to-red-600 ring-4 ring-red-400/50'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700 opacity-50'
                  : isSelected
                    ? `bg-gradient-to-br ${optionColors[option]} ring-4 ring-white/50 scale-[1.02]`
                    : `bg-gradient-to-br ${optionColors[option]} hover:scale-[1.02] active:scale-[0.98]`
              }`}
            >
              {showResult && isCorrect && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5" />
                </div>
              )}
              {showResult && isSelected && !isCorrect && (
                <div className="absolute top-2 right-2">
                  <X className="w-5 h-5" />
                </div>
              )}
              <span className="text-sm opacity-80 mb-1">{option}</span>
              <span className="text-sm leading-tight">{optionText}</span>
            </button>
          )
        })}
      </div>

      {/* Submit Button */}
      {!isAnswered && !hasAnswered && (
        <Button
          onClick={handleSubmitAnswer}
          disabled={!selectedOption || timeLeft === 0}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Answer
        </Button>
      )}

      {/* Status Messages */}
      {hasAnswered && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <Check className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-primary font-semibold">Answer Submitted!</p>
        </div>
      )}

      {isAnswered && !hasAnswered && (
        <div className="rounded-xl border border-muted bg-muted/20 p-4 text-center">
          <p className="text-muted-foreground">You already answered this question</p>
        </div>
      )}
    </div>
  )
}

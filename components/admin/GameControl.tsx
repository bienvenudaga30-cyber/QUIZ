'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getQuestions, updateRoomStatus, updateCurrentQuestion, getCurrentQuestion } from '@/lib/db'

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

  const { data: questions = [], isLoading: questionsLoading } = useSWR(
    `/api/admin/questions?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 1000 }
  )

  const { data: currentQuestion, mutate: refetchCurrent } = useSWR(
    `/api/admin/current-question?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 1000 }
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
    <Card className="p-6 bg-white space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Game Control</h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Questions: {questions.length}
        </p>
        {currentQuestion && (
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              Current: Question {currentQuestionIndex + 1}/{questions.length}
            </p>
            {currentQuestion.is_active && (
              <p className="text-xs text-blue-700 mt-1">🔴 ACTIVE - Timer running</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleStartQuiz}
          disabled={loading || questions.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Start Quiz
        </Button>

        <Button
          onClick={() => handleShowQuestion(currentQuestionIndex)}
          disabled={loading || questions.length === 0 || !questions[currentQuestionIndex]}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Show Question {currentQuestionIndex + 1}
        </Button>

        <Button
          onClick={handleNextQuestion}
          disabled={loading || currentQuestionIndex >= questions.length - 1}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Next Question
        </Button>

        <Button
          onClick={handleEndQuiz}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          End Quiz
        </Button>
      </div>
    </Card>
  )
}

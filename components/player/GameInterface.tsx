'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Question, CurrentQuestion, Player } from '@/lib/types'

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

  if (!currentQuestion) {
    return (
      <Card className="p-8 bg-white text-center">
        <p className="text-gray-600 mb-4">Waiting for the quiz to start...</p>
        {playerData && (
          <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
            <p className="text-lg font-bold text-gray-900">Score: {playerData.score}</p>
          </div>
        )}
      </Card>
    )
  }

  if (!currentQuestion.is_active) {
    return (
      <Card className="p-8 bg-white text-center space-y-4">
        <p className="text-gray-600">Question paused</p>
        {playerData && (
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <p className="text-lg font-bold text-gray-900">Score: {playerData.score}</p>
          </div>
        )}
      </Card>
    )
  }

  if (!question) {
    return (
      <Card className="p-8 bg-white text-center">
        <p className="text-gray-600">Loading question...</p>
      </Card>
    )
  }

  const isAnswered = answeredQuestions.some((q: { question_id: string }) => q.question_id === question.id)

  return (
    <Card className="p-8 bg-white space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Score: {playerData?.score || 0}</h2>
        <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded border border-blue-200">
        <p className="text-xl font-semibold text-gray-900">{question.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(['A', 'B', 'C', 'D'] as const).map((option) => {
          const optionText = question[`option_${option.toLowerCase()}` as keyof Question]
          const isSelected = selectedOption === option
          const isCorrect = option === question.correct_option

          return (
            <button
              key={option}
              onClick={() => !isAnswered && !hasAnswered && setSelectedOption(option)}
              disabled={isAnswered || hasAnswered || timeLeft === 0}
              className={`p-4 rounded font-semibold text-white transition ${
                isAnswered
                  ? isCorrect
                    ? 'bg-green-600'
                    : selectedOption === option
                      ? 'bg-red-600'
                      : 'bg-gray-400'
                  : isSelected
                    ? 'bg-yellow-500'
                    : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <div className="text-sm">{option}</div>
              <div className="text-xs mt-2">{optionText}</div>
            </button>
          )
        })}
      </div>

      {!isAnswered && !hasAnswered && (
        <Button
          onClick={handleSubmitAnswer}
          disabled={!selectedOption || timeLeft === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
        >
          Submit Answer
        </Button>
      )}

      {hasAnswered && (
        <div className="p-4 bg-blue-50 text-center border border-blue-200 rounded">
          <p className="text-blue-900 font-semibold">Answer submitted!</p>
        </div>
      )}

      {isAnswered && !hasAnswered && (
        <div className="p-4 bg-gray-50 text-center border border-gray-200 rounded">
          <p className="text-gray-700">You already answered this question</p>
        </div>
      )}
    </Card>
  )
}

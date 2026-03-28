'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Question, Player, Answer } from '@/lib/types'

interface ScreenDashboardProps {
  roomCode: string
}

const fetcher = async (key: string) => {
  const response = await fetch(key)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function ScreenDashboard({ roomCode }: ScreenDashboardProps) {
  const [timeLeft, setTimeLeft] = useState(30)

  const { data: room } = useSWR(`/api/dashboard/room?code=${roomCode}`, fetcher, {
    refreshInterval: 1000,
  })

  const { data: currentQuestion } = useSWR(
    room?.id ? `/api/dashboard/current-question?roomId=${room.id}` : null,
    fetcher,
    { refreshInterval: 500 }
  )

  const { data: question } = useSWR(
    currentQuestion?.question_id ? `/api/dashboard/question?id=${currentQuestion.question_id}` : null,
    fetcher,
    { refreshInterval: 1000 }
  )

  const { data: players = [] } = useSWR(
    room?.id ? `/api/dashboard/players?roomId=${room.id}` : null,
    fetcher,
    { refreshInterval: 500 }
  )

  const { data: answers = [] } = useSWR(
    currentQuestion?.question_id ? `/api/dashboard/answers?questionId=${currentQuestion.question_id}` : null,
    fetcher,
    { refreshInterval: 500 }
  )

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

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 bg-gray-800 text-center">
          <p className="text-2xl text-gray-300">Waiting for quiz to start...</p>
        </Card>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-12 bg-gray-800 text-center">
          <p className="text-2xl text-gray-300">Loading question...</p>
        </Card>
      </div>
    )
  }

  const answerCounts = {
    A: answers.filter((a: Answer) => a.selected_option === 'A').length,
    B: answers.filter((a: Answer) => a.selected_option === 'B').length,
    C: answers.filter((a: Answer) => a.selected_option === 'C').length,
    D: answers.filter((a: Answer) => a.selected_option === 'D').length,
  }

  const totalAnswers = Object.values(answerCounts).reduce((a, b) => a + b, 0)
  const maxAnswers = Math.max(...Object.values(answerCounts), 1)

  return (
    <div className="space-y-8">
      {/* Top section with timer */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <Card className="p-8 bg-gradient-to-br from-blue-600 to-blue-800">
            <h2 className="text-3xl font-bold text-white mb-4">{question.text}</h2>
            {currentQuestion.is_active && (
              <p className="text-blue-100">🔴 LIVE - Timer running</p>
            )}
          </Card>
        </div>
        <div className="flex items-center justify-center">
          <div className={`text-6xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Answer options with response rates */}
      <div className="grid grid-cols-4 gap-4">
        {(['A', 'B', 'C', 'D'] as const).map((option) => {
          const optionText = question[`option_${option.toLowerCase()}` as keyof Question]
          const count = answerCounts[option]
          const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
          const isCorrect = option === question.correct_option

          return (
            <Card
              key={option}
              className={`p-6 ${
                isCorrect ? 'bg-gradient-to-br from-green-600 to-green-700' : 'bg-gradient-to-br from-gray-700 to-gray-800'
              }`}
            >
              <div className="text-white space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Option {option}</h3>
                  <p className="text-lg">{optionText}</p>
                </div>

                {/* Response bar */}
                <div>
                  <div className="bg-white bg-opacity-20 rounded h-12 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full flex items-center justify-center font-bold text-gray-900 transition-all"
                      style={{
                        width: `${maxAnswers > 0 ? (count / maxAnswers) * 100 : 0}%`,
                      }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                  <p className="text-sm mt-2">{percentage}% ({count} responses)</p>
                </div>

                {isCorrect && (
                  <div className="text-yellow-300 font-bold text-sm">✓ CORRECT ANSWER</div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Leaderboard</h3>
        <div className="grid grid-cols-2 gap-4">
          {players.slice(0, 10).map((player: Player, index: number) => (
            <Card key={player.id} className="p-4 bg-gray-800 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">#{index + 1}</p>
                  <p className="text-gray-300">{player.pseudo}</p>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{player.score}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

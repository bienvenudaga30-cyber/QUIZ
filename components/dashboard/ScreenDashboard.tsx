'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Question, Player } from '@/lib/types'
import { useRealtimeCurrentQuestion, useRealtimePlayers, useRealtimeAnswers } from '@/hooks/use-realtime'
import { Zap, Users, Trophy, Star, TrendingUp, Menu } from 'lucide-react'

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

  // Fetch room data once
  const { data: room } = useSWR(`/api/dashboard/room?code=${roomCode}`, fetcher, {
    revalidateOnFocus: false,
  })

  // Use Supabase Realtime for current question - instant updates
  const currentQuestion = useRealtimeCurrentQuestion(room?.id || null)

  // Fetch question details when current question changes
  const { data: question } = useSWR(
    currentQuestion?.question_id ? `/api/dashboard/question?id=${currentQuestion.question_id}` : null,
    fetcher
  )

  // Fetch all questions once for round counter
  const { data: allQuestions = [] } = useSWR(
    room?.id ? `/api/admin/questions?roomId=${room.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Use Supabase Realtime for players - instant leaderboard updates
  const realtimePlayers = useRealtimePlayers(room?.id || null)

  // Use Supabase Realtime for answers - instant response tracking
  const realtimeAnswers = useRealtimeAnswers(currentQuestion?.question_id || null)

  // Timer effect
  useEffect(() => {
    if (!currentQuestion?.is_active) {
      setTimeLeft(currentQuestion?.timer_duration || 30)
      return
    }

    const interval = setInterval(() => {
      const start = new Date(currentQuestion.timer_start!).getTime()
      const duration = (currentQuestion.timer_duration || 30) * 1000
      const elapsed = Date.now() - start
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000))
      setTimeLeft(remaining)
    }, 100)

    return () => clearInterval(interval)
  }, [currentQuestion])

  const sortedPlayers = [...realtimePlayers].sort((a, b) => b.score - a.score)
  const currentQuestionIndex = question ? allQuestions.findIndex((q: Question) => q.id === question.id) : -1

  // Waiting state
  if (!currentQuestion || !question) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6 text-muted-foreground" />
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Session ID</span>
            <span className="font-mono font-bold text-primary tracking-wider">{roomCode}</span>
          </div>
        </header>

        {/* Waiting Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Waiting for Quiz to Start</h1>
            <p className="text-xl text-muted-foreground mb-8">Players can join with code: <span className="text-primary font-bold">{roomCode}</span></p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>{realtimePlayers.length} player{realtimePlayers.length !== 1 ? 's' : ''} connected</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const answerCounts = {
    A: realtimeAnswers.filter((a) => a.selected_option === 'A').length,
    B: realtimeAnswers.filter((a) => a.selected_option === 'B').length,
    C: realtimeAnswers.filter((a) => a.selected_option === 'C').length,
    D: realtimeAnswers.filter((a) => a.selected_option === 'D').length,
  }

  const totalAnswers = Object.values(answerCounts).reduce((a, b) => a + b, 0)
  const maxAnswers = Math.max(...Object.values(answerCounts), 1)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-muted-foreground" />
          <Zap className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Session ID</span>
          <span className="font-mono font-bold text-primary tracking-wider">{roomCode}</span>
          <div className="w-10 h-10 rounded-full border-2 border-secondary bg-secondary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 flex gap-6">
        {/* Left Sidebar - Stats */}
        <div className="w-48 flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Round</p>
            <p className="text-3xl font-bold text-foreground">
              {String(currentQuestionIndex + 1).padStart(2, '0')} 
              <span className="text-muted-foreground text-lg"> / {String(allQuestions.length).padStart(2, '0')}</span>
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-primary uppercase tracking-wider mb-1">Total Players</p>
            <p className="text-3xl font-bold text-primary">{realtimePlayers.length}</p>
          </div>

          {/* Top 3 Players Preview */}
          <div className="flex-1 flex flex-col gap-2">
            {sortedPlayers.slice(0, 3).map((player, index) => (
              <div key={player.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{player.pseudo}</p>
                  <p className="text-xs text-muted-foreground">{player.score.toLocaleString()} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Timer Circle */}
          <div className="flex justify-center">
            <div className="relative">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(timeLeft / 30) * 283} 283`}
                  className={timeLeft <= 10 ? 'text-destructive' : 'text-primary'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time Remaining</p>
                <span className={`text-6xl font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Live Badge */}
          {currentQuestion.is_active && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/50">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">NEXT LEADER INCOMING</span>
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-2xl font-semibold text-foreground leading-relaxed">{question.text}</p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4">
            {(['A', 'B', 'C', 'D'] as const).map((option) => {
              const optionText = question[`option_${option.toLowerCase()}` as keyof Question]
              const count = answerCounts[option]
              const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
              const isCorrect = option === question.correct_option
              const barWidth = maxAnswers > 0 ? (count / maxAnswers) * 100 : 0

              const optionColors = {
                A: 'bg-red-500',
                B: 'bg-blue-500',
                C: 'bg-yellow-500',
                D: 'bg-green-500',
              }

              return (
                <div
                  key={option}
                  className={`relative rounded-xl border overflow-hidden ${
                    isCorrect ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  {/* Background bar */}
                  <div
                    className={`absolute inset-y-0 left-0 ${optionColors[option]} opacity-20 transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                  
                  <div className="relative p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${optionColors[option]} flex items-center justify-center text-white font-bold`}>
                      {option}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{optionText}</p>
                      <p className="text-sm text-muted-foreground">{percentage}% ({count} responses)</p>
                    </div>
                    {isCorrect && (
                      <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">
                        CORRECT
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar - Leaderboard */}
        <div className="w-64">
          <div className="rounded-xl border border-border bg-card h-full p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Leaderboard</h3>
            </div>
            
            <div className="space-y-2">
              {sortedPlayers.slice(0, 10).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                    index === 0 ? 'bg-primary/10 border border-primary/30' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    index === 0 
                      ? 'bg-primary text-primary-foreground' 
                      : index === 1 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                      {player.pseudo}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {player.score.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ticker */}
      <footer className="border-t border-border bg-card/50 py-3 overflow-hidden">
        <div className="flex items-center animate-ticker whitespace-nowrap gap-8">
          {sortedPlayers.slice(0, 5).map((player, index) => (
            <div key={player.id} className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {index === 0 ? 'LEADER: ' : ''}{player.pseudo} - {player.score.toLocaleString()} PTS
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span className="text-muted-foreground">
              {realtimeAnswers.length} RESPONSES IN THIS ROUND
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

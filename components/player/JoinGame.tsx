'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, User, Hash, AlertCircle } from 'lucide-react'

interface JoinGameProps {
  onJoined: (playerId: string, roomId: string, playerName: string) => void
}

export default function JoinGame({ onJoined }: JoinGameProps) {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!roomCode.trim() || !playerName.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/player/join-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase(), playerName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join game')
      }

      const data = await response.json()
      onJoined(data.playerId, data.roomId, playerName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <form onSubmit={handleJoin} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="roomCode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Hash className="w-4 h-4 text-primary" />
              Session Code
            </label>
            <Input
              id="roomCode"
              type="text"
              placeholder="XXXX"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="text-center text-3xl font-mono font-bold tracking-[0.5em] bg-input border-border h-16 text-primary placeholder:text-muted-foreground/50"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="playerName" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <User className="w-4 h-4 text-primary" />
              Your Nickname
            </label>
            <Input
              id="playerName"
              type="text"
              placeholder="Enter your arena name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-input border-border h-12"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !roomCode || !playerName}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Joining...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Join Arena
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

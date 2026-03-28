'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
    <Card className="p-8 bg-white space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Quiz</h2>
        <p className="text-gray-600">Enter the room code and your name to start playing</p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
            Room Code
          </label>
          <Input
            id="roomCode"
            type="text"
            placeholder="XXXX"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="text-center text-2xl font-bold tracking-widest"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <Input
            id="playerName"
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">{error}</div>}

        <Button
          type="submit"
          disabled={loading || !roomCode || !playerName}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
        >
          {loading ? 'Joining...' : 'Join Game'}
        </Button>
      </form>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import JoinGame from '@/components/player/JoinGame'
import GameInterface from '@/components/player/GameInterface'

export default function PlayerPage() {
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string | null>(null)

  const handleJoined = (pid: string, rid: string, name: string) => {
    setPlayerId(pid)
    setRoomId(rid)
    setPlayerName(name)
  }

  const handleLeave = () => {
    setPlayerId(null)
    setRoomId(null)
    setPlayerName(null)
  }

  if (!playerId || !roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Join Game</h1>
            <Link href="/">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
                Back Home
              </Button>
            </Link>
          </div>

          <JoinGame onJoined={handleJoined} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome, <span className="text-green-200">{playerName}</span>!
            </h1>
          </div>
          <Button variant="outline" onClick={handleLeave} className="text-white border-white hover:bg-white hover:text-green-600">
            Leave Game
          </Button>
        </div>

        <GameInterface playerId={playerId} roomId={roomId} />
      </div>
    </div>
  )
}

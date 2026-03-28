'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import JoinGame from '@/components/player/JoinGame'
import GameInterface from '@/components/player/GameInterface'
import { Zap, ArrowLeft, LogOut } from 'lucide-react'

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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-lg mx-auto flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:border-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Enter the Arena</h1>
            <p className="text-muted-foreground">Join a live quiz session and compete</p>
          </div>
          <JoinGame onJoined={handleJoined} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <span className="text-primary font-semibold">{playerName}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLeave}
            className="border-border text-muted-foreground hover:text-destructive hover:border-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <GameInterface playerId={playerId} roomId={roomId} />
      </main>
    </div>
  )
}

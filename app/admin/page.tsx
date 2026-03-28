'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AdminSetup from '@/components/admin/AdminSetup'
import QuestionsList from '@/components/admin/QuestionsList'
import GameControl from '@/components/admin/GameControl'
import { Zap, ArrowLeft, Plus, Copy, Check } from 'lucide-react'

export default function AdminPage() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRoomCreated = (id: string, code: string) => {
    setRoomId(id)
    setRoomCode(code)
  }

  const handleBack = () => {
    setRoomId(null)
    setRoomCode(null)
  }

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Admin</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:border-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Arena</h1>
            <p className="text-muted-foreground">Set up your quiz room and add questions to get started</p>
          </div>
          <AdminSetup onRoomCreated={handleRoomCreated} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
            </div>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Session ID</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/50 bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <span className="font-mono font-bold text-primary tracking-wider">{roomCode}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-primary/70" />
                )}
              </button>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack} 
            className="border-border text-muted-foreground hover:text-foreground hover:border-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Room
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <GameControl roomId={roomId} />
          <QuestionsList roomId={roomId} />
        </div>
      </main>
    </div>
  )
}

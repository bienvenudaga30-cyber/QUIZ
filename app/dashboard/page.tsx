'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ScreenDashboard from '@/components/dashboard/ScreenDashboard'
import { Zap, ArrowLeft, Monitor, Hash } from 'lucide-react'

export default function DashboardPage() {
  const [roomCode, setRoomCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomCode.trim()) {
      setSubmitted(true)
    }
  }

  if (!submitted || !roomCode) {
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
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Live Screen</h1>
            <p className="text-muted-foreground">Display the live quiz dashboard for your audience</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-8 space-y-6">
            <div>
              <label htmlFor="code" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Hash className="w-4 h-4 text-primary" />
                Session Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="XXXX"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="text-center text-3xl font-mono font-bold tracking-[0.5em] bg-input border-border h-16 text-primary placeholder:text-muted-foreground/50"
              />
            </div>

            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-6 text-lg font-semibold">
              <Monitor className="w-5 h-5 mr-2" />
              Open Dashboard
            </Button>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ScreenDashboard roomCode={roomCode} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ScreenDashboard from '@/components/dashboard/ScreenDashboard'

export default function DashboardPage() {
  const [roomCode, setRoomCode] = useState('')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomCode.trim()) {
      setSubmitted(true)
    }
  }

  if (!submitted || !roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <Link href="/">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                Back Home
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="text-center text-2xl font-bold tracking-widest"
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6">
                Enter Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Quiz Dashboard</h1>
          <Link href="/">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              Back Home
            </Button>
          </Link>
        </div>

        <ScreenDashboard roomCode={roomCode} />
      </div>
    </div>
  )
}

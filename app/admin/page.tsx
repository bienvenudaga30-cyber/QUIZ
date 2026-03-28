'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import AdminSetup from '@/components/admin/AdminSetup'
import QuestionsList from '@/components/admin/QuestionsList'
import GameControl from '@/components/admin/GameControl'

export default function AdminPage() {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)

  const handleRoomCreated = (id: string, code: string) => {
    setRoomId(id)
    setRoomCode(code)
  }

  const handleBack = () => {
    setRoomId(null)
    setRoomCode(null)
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <Link href="/">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Back Home
              </Button>
            </Link>
          </div>

          <AdminSetup onRoomCreated={handleRoomCreated} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Control</h1>
            <div className="bg-white bg-opacity-20 rounded px-4 py-2 inline-block text-white">
              Room Code: <span className="font-bold text-xl">{roomCode}</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleBack} className="text-white border-white hover:bg-white hover:text-blue-600">
            Create New Room
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <GameControl roomId={roomId} />
          </div>
          <div>
            <QuestionsList roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  )
}

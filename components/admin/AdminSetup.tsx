'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, Loader2, LogOut } from 'lucide-react'

interface AdminSetupProps {
  onRoomCreated: (id: string, code: string) => void
}

export default function AdminSetup({ onRoomCreated }: AdminSetupProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/create-room', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create room')
      onRoomCreated(data.id, data.code)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Nouvelle session</h2>
              <p className="text-sm text-muted-foreground">
                Crée une salle et partage le code aux joueurs
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button onClick={handleCreateRoom} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création en cours...</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" />Créer une salle</>
          )}
        </Button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Compte créé ! Vérifie ton email pour confirmer, puis connecte-toi.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/admin')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-wider text-foreground">ARENA LIVE</span>
          <span className="text-sm text-muted-foreground">Espace administrateur</span>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h1 className="text-lg font-semibold text-foreground text-center">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-500 bg-green-500/10 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </Button>
        </div>

        {/* Switch mode */}
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}
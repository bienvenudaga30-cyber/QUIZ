'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, ClipboardPaste } from 'lucide-react'

const PROMPT_TEMPLATE = `Génère 10 questions QCM en JSON pour un quiz. 
Réponds UNIQUEMENT avec ce JSON, sans texte autour :

{
  "questions": [
    {
      "text": "Question ici ?",
      "option_a": "Réponse A",
      "option_b": "Réponse B",
      "option_c": "Réponse C",
      "option_d": "Réponse D",
      "correct_opt": "A",
      "timer_sec": 30,
      "points": 1000,
      "category": "général",
      "difficulty": 2
    }
  ]
}

Sujet : [ÉCRIS TON SUJET ICI]`

interface AIImportProps {
  roomId: string
  onImported: () => void
}

export default function AIImport({ roomId, onImported }: AIImportProps) {
  const [copied, setCopied] = useState(false)
  const [jsonPasted, setJsonPasted] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const copyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = async () => {
    if (!jsonPasted.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, jsonText: jsonPasted }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(`✅ ${data.count} questions importées !`)
      setJsonPasted('')
      onImported()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-card">

      {/* ÉTAPE 1 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          Étape 1 — Copie ce prompt
        </p>
        <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground font-mono whitespace-pre-wrap mb-2 max-h-40 overflow-y-auto">
          {PROMPT_TEMPLATE}
        </div>
        <Button onClick={copyPrompt} variant="outline" size="sm" className="w-full">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copié !' : 'Copier le prompt'}
        </Button>
      </div>

      {/* ÉTAPE 2 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">
          Étape 2 — Colle-le dans ChatGPT, modifie le sujet, puis copie le JSON reçu
        </p>
        <a
          href="https://chat.openai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline"
        >
          Ouvrir ChatGPT →
        </a>
      </div>

      {/* ÉTAPE 3 */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          Étape 3 — Colle le résultat JSON ici
        </p>
        <Textarea
          placeholder={'{\n  "questions": [...]\n}'}
          value={jsonPasted}
          onChange={(e) => setJsonPasted(e.target.value)}
          className="font-mono text-xs min-h-32"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}

      <Button
        onClick={handleImport}
        disabled={loading || !jsonPasted.trim()}
        className="w-full"
      >
        <ClipboardPaste className="w-4 h-4 mr-2" />
        {loading ? 'Importation...' : 'Importer les questions'}
      </Button>
    </div>
  )
}
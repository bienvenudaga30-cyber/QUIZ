'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Question } from '@/lib/types'
import { Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface QuestionsListProps {
  roomId: string
}

const fetcher = async (key: string) => {
  const response = await fetch(key)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function QuestionsList({ roomId }: QuestionsListProps) {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as const,
  })
  const [loading, setLoading] = useState(false)

  const { data: questions = [], mutate } = useSWR<Question[]>(
    `/api/admin/questions?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 3000 }
  )

  const handleAddQuestion = async () => {
    if (!newQuestion.text || !newQuestion.option_a || !newQuestion.option_b || !newQuestion.option_c || !newQuestion.option_d) {
      return
    }

    setLoading(true)
    try {
      await fetch('/api/admin/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, ...newQuestion }),
      })

      setNewQuestion({
        text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
      })
      setShowForm(false)
      mutate()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Questions</h2>
          <p className="text-sm text-muted-foreground">{questions.length} total</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'default'}
          size="sm"
          className={showForm ? 'border-border' : 'bg-primary text-primary-foreground'}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>

      {/* Add Question Form */}
      {showForm && (
        <div className="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
          <Input
            placeholder="Enter question..."
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            className="bg-input border-border"
          />

          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <div key={opt} className="relative">
                <Input
                  placeholder={`Option ${opt}`}
                  value={newQuestion[`option_${opt.toLowerCase()}` as keyof typeof newQuestion]}
                  onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${opt.toLowerCase()}`]: e.target.value })}
                  className="bg-input border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setNewQuestion({ ...newQuestion, correct_option: opt })}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    newQuestion.correct_option === opt 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {newQuestion.correct_option === opt ? <Check className="w-3 h-3" /> : opt}
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleAddQuestion}
            disabled={loading || !newQuestion.text}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? 'Adding...' : 'Add Question'}
          </Button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {questions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No questions yet</p>
            <p className="text-sm text-muted-foreground/70">Add questions to get started</p>
          </div>
        ) : (
          questions.map((q: Question, index: number) => (
            <div 
              key={q.id} 
              className="rounded-lg border border-border bg-muted/20 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground truncate">{q.text}</p>
                </div>
                {expandedId === q.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {expandedId === q.id && (
                <div className="px-3 pb-3 space-y-1 border-t border-border pt-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <div 
                      key={opt}
                      className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
                        q.correct_option === opt 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                        q.correct_option === opt 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {q.correct_option === opt ? <Check className="w-3 h-3" /> : opt}
                      </span>
                      <span>{q[`option_${opt.toLowerCase()}` as keyof Question]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Question } from '@/lib/types'

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
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as const,
  })
  const [loading, setLoading] = useState(false)

  const { data: questions = [], mutate } = useSWR(
    `/api/admin/questions?roomId=${roomId}`,
    fetcher,
    { refreshInterval: 2000 }
  )

  const handleAddQuestion = async () => {
    if (!newQuestion.text || !newQuestion.option_a || !newQuestion.option_b || !newQuestion.option_c || !newQuestion.option_d) {
      alert('Please fill all fields')
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
    <Card className="p-6 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {showForm ? 'Cancel' : '+ Add Question'}
        </Button>
      </div>

      {showForm && (
        <div className="space-y-3 p-4 bg-gray-50 rounded border border-gray-200">
          <input
            type="text"
            placeholder="Question text"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Option A"
              value={newQuestion.option_a}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Option B"
              value={newQuestion.option_b}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Option C"
              value={newQuestion.option_c}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Option D"
              value={newQuestion.option_d}
              onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <select
            value={newQuestion.correct_option}
            onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="A">Correct: A</option>
            <option value="B">Correct: B</option>
            <option value="C">Correct: C</option>
            <option value="D">Correct: D</option>
          </select>

          <Button
            onClick={handleAddQuestion}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Adding...' : 'Add Question'}
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {questions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No questions yet</p>
        ) : (
          questions.map((q: Question, index: number) => (
            <div key={q.id} className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {index + 1}. {q.text}
              </p>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p>A: {q.option_a}</p>
                <p>B: {q.option_b}</p>
                <p>C: {q.option_c}</p>
                <p>D: {q.option_d}</p>
                <p className="font-medium text-green-700">✓ Correct: {q.correct_option}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

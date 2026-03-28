'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = 'rooms' | 'questions' | 'current_question' | 'players' | 'answers'

interface UseRealtimeOptions<T> {
  table: TableName
  filter?: { column: string; value: string }
  enabled?: boolean
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
}

export function useRealtimeSubscription<T extends Record<string, unknown>>({
  table,
  filter,
  enabled = true,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      const eventType = payload.eventType

      if (eventType === 'INSERT') {
        const newRecord = payload.new as T
        setData((prev) => [...prev, newRecord])
        onInsert?.(newRecord)
      } else if (eventType === 'UPDATE') {
        const updatedRecord = payload.new as T
        setData((prev) =>
          prev.map((item) =>
            (item as { id?: string }).id === (updatedRecord as { id?: string }).id
              ? updatedRecord
              : item
          )
        )
        onUpdate?.(updatedRecord)
      } else if (eventType === 'DELETE') {
        const deletedRecord = payload.old as T
        setData((prev) =>
          prev.filter(
            (item) =>
              (item as { id?: string }).id !== (deletedRecord as { id?: string }).id
          )
        )
        onDelete?.(deletedRecord)
      }
    },
    [onInsert, onUpdate, onDelete]
  )

  useEffect(() => {
    if (!enabled) return

    const channelName = filter
      ? `${table}:${filter.column}:${filter.value}`
      : `${table}:all`

    const filterConfig = filter
      ? `${filter.column}=eq.${filter.value}`
      : undefined

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as const,
        {
          event: '*',
          schema: 'public',
          table,
          filter: filterConfig,
        },
        handleChange as (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase, table, filter?.column, filter?.value, enabled, handleChange])

  return { data, setData, isConnected }
}

// Hook for current question realtime updates
export function useRealtimeCurrentQuestion(roomId: string | null) {
  const [currentQuestion, setCurrentQuestion] = useState<{
    room_id: string
    question_id: string | null
    is_active: boolean
    timer_start: string | null
    timer_duration: number
  } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!roomId) return

    // Initial fetch
    const fetchCurrent = async () => {
      const { data } = await supabase
        .from('current_question')
        .select('*')
        .eq('room_id', roomId)
        .single()

      if (data) {
        setCurrentQuestion(data)
      }
    }

    fetchCurrent()

    // Subscribe to changes
    const channel = supabase
      .channel(`current_question:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'current_question',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCurrentQuestion(payload.new as typeof currentQuestion)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, roomId])

  return currentQuestion
}

// Hook for players realtime updates
export function useRealtimePlayers(roomId: string | null) {
  const [players, setPlayers] = useState<
    Array<{
      id: string
      room_id: string
      pseudo: string
      score: number
      created_at: string
    }>
  >([])

  const supabase = createClient()

  useEffect(() => {
    if (!roomId) return

    // Initial fetch
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false })

      if (data) {
        setPlayers(data)
      }
    }

    fetchPlayers()

    // Subscribe to changes
    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => [...prev, payload.new as typeof players[0]].sort((a, b) => b.score - a.score))
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev
                .map((p) => (p.id === (payload.new as typeof players[0]).id ? (payload.new as typeof players[0]) : p))
                .sort((a, b) => b.score - a.score)
            )
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as typeof players[0]).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, roomId])

  return players
}

// Hook for answers realtime updates
export function useRealtimeAnswers(questionId: string | null) {
  const [answers, setAnswers] = useState<
    Array<{
      id: string
      player_id: string
      question_id: string
      selected_option: string
      is_correct: boolean
      created_at: string
    }>
  >([])

  const supabase = createClient()

  useEffect(() => {
    if (!questionId) return

    // Initial fetch
    const fetchAnswers = async () => {
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)

      if (data) {
        setAnswers(data)
      }
    }

    fetchAnswers()

    // Subscribe to changes
    const channel = supabase
      .channel(`answers:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          setAnswers((prev) => [...prev, payload.new as typeof answers[0]])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, questionId])

  return answers
}

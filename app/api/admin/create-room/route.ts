import { NextResponse } from 'next/server'
import { createRoom, initializeCurrentQuestion } from '@/lib/db'

export async function POST() {
  try {
    const room = await createRoom()
    await initializeCurrentQuestion(room.id)
    return NextResponse.json(room)
  } catch (error) {
    console.error('Failed to create room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

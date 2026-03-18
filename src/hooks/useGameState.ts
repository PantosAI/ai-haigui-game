import { useCallback, useMemo, useState } from 'react'
import type { Story } from '../data/stories'

export type Role = 'user' | 'assistant'

export type Message = {
  id: string
  role: Role
  content: string
  timestamp: number
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useGameState(initialStory?: Story) {
  const [storyId, setStoryId] = useState<string | null>(initialStory?.id ?? null)
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = useCallback((role: Role, content: string) => {
    const msg: Message = { id: createId(), role, content, timestamp: Date.now() }
    setMessages((prev) => [...prev, msg])
    return msg.id
  }, [])

  const reset = useCallback((nextStoryId: string | null) => {
    setStoryId(nextStoryId)
    setMessages([])
  }, [])

  const hasStory = useMemo(() => storyId !== null, [storyId])

  return { storyId, setStoryId, hasStory, messages, addMessage, reset }
}


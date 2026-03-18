import { useCallback, useEffect, useRef, useState } from 'react'
import { askAI } from '../api/ai'
import type { NormalizedAnswer } from '../utils/parseAIResponse'

export type AIRequestStatus = 'idle' | 'pending' | 'success' | 'error'

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useAIAnswer() {
  const [status, setStatus] = useState<AIRequestStatus>('idle')
  const [answer, setAnswer] = useState<NormalizedAnswer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef<string | null>(null)

  const send = useCallback(async (params: { storyId: string; question: string }) => {
    abortRef.current?.abort()

    const requestId = createRequestId()
    requestIdRef.current = requestId

    const ac = new AbortController()
    abortRef.current = ac

    setStatus('pending')
    setAnswer(null)
    setError(null)

    try {
      const a = await askAI({ ...params, signal: ac.signal })
      if (requestIdRef.current !== requestId) return
      setAnswer(a)
      setStatus('success')
    } catch (e: unknown) {
      if (requestIdRef.current !== requestId) return
      if (e instanceof DOMException && e.name === 'AbortError') return
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    requestIdRef.current = null
    setStatus('idle')
  }, [])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return { status, answer, error, send, cancel }
}


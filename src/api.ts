import { stories } from './data/stories'
import { normalizeAIAnswer, type NormalizedAnswer } from './utils/parseAIResponse'

export type AskAIParams = {
  storyId: string
  question: string
  signal?: AbortSignal
}

export async function askAI({ storyId, question, signal }: AskAIParams): Promise<NormalizedAnswer> {
  const story = stories.find((s) => s.id === storyId)
  if (!story) throw new Error(`Unknown storyId: ${storyId}`)

  const API_BASE_URL = '/api';
  console.log('前端正在发起请求到后端...');
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      // 后端会使用这些字段拼 Prompt 并调用 DeepSeek
      question,
      story,
    }),
    signal,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`AI request failed: ${res.status}${errText ? ` - ${errText}` : ''}`)
  }

  const data: unknown = await res.json()
  type ChatCompletionLikeResponse = {
    answer?: unknown
    choices?: Array<{
      message?: { content?: unknown }
      delta?: { content?: unknown }
    }>
  }

  const answerResponse = data as ChatCompletionLikeResponse
  const answer =
    answerResponse.answer ??
    answerResponse.choices?.[0]?.message?.content ??
    answerResponse.choices?.[0]?.delta?.content ??
    ''

  return normalizeAIAnswer(String(answer))
}

export type { NormalizedAnswer }
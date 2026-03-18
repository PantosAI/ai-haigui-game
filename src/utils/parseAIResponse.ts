export type NormalizedAnswer = '是' | '否' | '无关'

const YES = new Set(['是', 'yes', 'y', 'true', '对', '对的'])
const NO = new Set(['否', 'no', 'n', 'false', '不', '不是'])

export function normalizeAIAnswer(raw: string): NormalizedAnswer {
  const s = raw.trim()
  if (!s) return '无关'

  const firstLine = s.split(/\r?\n/, 1)[0]?.trim() ?? ''
  const token = firstLine.replace(/[。.!！?？\s]/g, '')

  if (YES.has(token)) return '是'
  if (NO.has(token)) return '否'
  if (token === '无关' || token === '不相关') return '无关'

  if (token.includes('无关') || token.includes('不相关')) return '无关'
  return '无关'
}


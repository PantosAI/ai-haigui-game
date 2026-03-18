import { useEffect, useMemo, useRef, useState } from 'react'
import { Message } from './Message'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const canSend = useMemo(() => text.trim().length > 0, [text])

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // 自动滚动到底部
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const content = text.trim()
    if (!content) return
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }
    setMessages((prev) => [...prev, newMessage])
    setText('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl ring-1 ring-slate-800">
      {/* 消息滚动区域 */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto p-3"
        aria-label="聊天消息"
      >
        {messages.map((m) => (
          <Message key={m.id} role={m.role} content={m.content} />
        ))}
      </div>

      {/* 底部输入区（固定在组件底部） */}
      <form
        className="sticky bottom-0 flex items-end gap-2 border-t border-slate-800 bg-slate-900/70 p-3 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // input 默认回车即提交，但这里显式处理以避免某些浏览器差异
              e.preventDefault()
              handleSend()
            }
          }}
          className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2 text-slate-100 ring-1 ring-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="输入你的消息并按回车发送…"
          aria-label="输入消息"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg disabled:opacity-50"
          aria-label="发送消息"
        >
          发送
        </button>
      </form>
    </div>
  )
}


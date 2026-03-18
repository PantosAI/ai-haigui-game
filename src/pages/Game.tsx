import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StoryReveal } from '../components/StoryReveal'
import { stories } from '../data/stories'
import { Message } from '../components/Message'
import { askAI } from '../api'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function Game() {
  const { id } = useParams()
  const navigate = useNavigate()
  const story = stories.find((s) => s.id === id)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [brainstormDots, setBrainstormDots] = useState(0)
  const [toast, setToast] = useState<null | { id: string; message: string }>(null)
  const activeAbortRef = useRef<AbortController | null>(null)

  const canSend = useMemo(() => text.trim().length > 0 && !isLoading, [text, isLoading])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // 新消息“新增”时滚到底部，避免每秒更新占位内容时频繁滚动打断阅读。
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (!isLoading) return
    // 让初始展示更接近 “...” 的视觉习惯
    setBrainstormDots(2)
    const t = globalThis.setInterval(() => {
      setBrainstormDots((d) => (d + 1) % 3)
    }, 450)
    return () => globalThis.clearInterval(t)
  }, [isLoading])

  useEffect(() => {
    if (!toast) return
    const t = globalThis.setTimeout(() => setToast(null), 4000)
    return () => globalThis.clearTimeout(t)
  }, [toast])

  function handleBackToHome() {
    const ok = globalThis.confirm?.('确定要返回大厅吗？当前对话记录将保留在本页。') ?? true
    if (!ok) return
    navigate('/')
  }

  if (!story) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-amber-400">未找到故事</h1>
          <button
            type="button"
            onClick={handleBackToHome}
            className="text-sm text-slate-300 hover:text-slate-100"
          >
            返回大厅
          </button>
        </header>
        <section className="rounded-lg bg-slate-800/60 p-4 shadow-lg ring-1 ring-slate-700">
          <p className="text-slate-200">这个故事不存在或已被移除。</p>
        </section>
      </main>
    )
  }

  const currentStory = story

  async function handleSend() {
    const content = text.trim()
    if (!content || isLoading) return

    activeAbortRef.current?.abort()
    const ac = new AbortController()
    activeAbortRef.current = ac

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

    const placeholderId = crypto.randomUUID()
    const placeholder: ChatMessage = {
      id: placeholderId,
      role: 'assistant',
      content: '思考中...',
    }

    setMessages((prev) => [...prev, userMessage, placeholder])
    setText('')
    setIsLoading(true)

    let interval: number | undefined
    let timeout: number | undefined

    try {
      const startedAt = Date.now()
      interval = globalThis.setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: `思考中...（${elapsed}s）` } : m,
          ),
        )
      }, 1000)

      timeout = globalThis.setTimeout(() => {
        ac.abort()
      }, 15000)

      const reply = await askAI({ storyId: currentStory.id, question: content, signal: ac.signal })

      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...m, content: reply } : m)),
      )
    } catch (e: unknown) {
      const aborted = e instanceof DOMException && e.name === 'AbortError'
      const msg = e instanceof Error ? e.message : 'AI 请求失败'
      if (aborted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: '请求超时，请重试。' } : m,
          ),
        )
      } else {
        // 让玩家直接看到友好提示，而不仅是控制台输出。
        const friendly = '服务器开小差了，请重试'
        setToast({ id: crypto.randomUUID(), message: friendly })
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, content: friendly } : m)),
        )
        // 保留错误信息，方便开发定位问题。
        console.error('[Game] AI request failed:', msg)
      }
    } finally {
      if (timeout != null) globalThis.clearTimeout(timeout)
      if (interval != null) globalThis.clearInterval(interval)
      setIsLoading(false)
      if (activeAbortRef.current === ac) activeAbortRef.current = null
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-amber-400">{story.title}</h1>
        <button
          type="button"
          onClick={handleBackToHome}
          className="text-sm text-slate-300 hover:text-slate-100"
        >
          返回大厅
        </button>
      </header>

      <div className="space-y-4">
        <StoryReveal title="汤面" content={story.surface} />

        {/* 聊天盒子：上方消息区 + 下方输入框，保持深蓝悬疑风 */}
        <section className="rounded-xl bg-slate-900/50 p-3 shadow-lg ring-1 ring-slate-800">
          <div className="flex h-full min-h-0 flex-col rounded-xl ring-1 ring-slate-800">
            {/* 消息滚动区域 */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-2 overflow-y-auto p-3"
              aria-label="聊天消息"
            >
              {messages.length === 0 ? (
                <div className="rounded-xl bg-slate-950/40 p-4 ring-1 ring-slate-800">
                  <p className="text-sm font-semibold text-amber-300">不知道怎么问？我给你几个开场白</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200/90">
                    <li>这件事发生在现实世界吗？</li>
                    <li>故事里有人死亡/受伤吗？</li>
                    <li>关键点和“误会/谐音/身份”有关吗？</li>
                    <li>主角的动机是为了求生/报复/爱情吗？</li>
                  </ul>
                  <p className="mt-3 text-xs text-slate-400">提示：尽量问能用“是/否/无关”回答的问题。</p>
                </div>
              ) : null}
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
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {isLoading ? (
                  <div
                    className="flex items-center gap-2 text-xs text-slate-200"
                    aria-live="polite"
                  >
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                    <span className="font-medium text-amber-200">
                      AI 正在头脑风暴中{'.'.repeat(brainstormDots + 1)}
                    </span>
                  </div>
                ) : null}
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={isLoading}
                  className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2 text-slate-100 ring-1 ring-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-80"
                  placeholder={isLoading ? 'AI 正在思考…' : '输入你的消息并按回车发送…'}
                  aria-label="输入消息"
                />
              </div>
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow-lg disabled:opacity-50"
                aria-label="发送消息"
              >
                {isLoading ? '思考中...' : '发送'}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* 底部操作按钮：查看汤底 / 返回大厅（在移动端也易点触） */}
      <div className="sticky bottom-0 mt-6 -mx-4 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent px-4 pb-[env(safe-area-inset-bottom)] pt-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={`/result/${currentStory.id}`}
            className="inline-flex justify-center rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300"
          >
            查看汤底
          </Link>
          <button
            type="button"
            onClick={handleBackToHome}
            className="inline-flex justify-center rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-lg hover:bg-slate-600"
          >
            返回大厅
          </button>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 w-[min(90vw,420px)] -translate-x-1/2">
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl bg-slate-950/90 p-4 shadow-2xl ring-1 ring-slate-700"
          >
            <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100">提示</div>
              <div className="mt-1 text-sm text-slate-200">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
              aria-label="关闭提示"
            >
              关闭
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}


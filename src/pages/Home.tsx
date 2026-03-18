import { GameCard } from '../components/GameCard'
import { STORIES } from '../data/stories'
import type { Story, StoryInput } from '../data/stories'

function difficultyCnToEn(d: StoryInput['difficulty']): Story['difficulty'] {
  // Home 只负责展示；实际答案仍由后端从 story 对象中取出。
  if (d === '简单') return 'easy'
  if (d === '中等') return 'medium'
  return 'hard'
}

export function Home() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_20%_0%,rgba(251,191,36,0.10),transparent_60%),radial-gradient(60rem_40rem_at_80%_20%,rgba(56,189,248,0.08),transparent_55%)]" />

      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-amber-300">AI 海龟汤</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          选择一个故事开始提问。你只能向 AI 提“是/否/无关”的问题，直到推理出真相。
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => {
          const story: Story = {
            id: s.id,
            title: s.title,
            difficulty: difficultyCnToEn(s.difficulty),
            surface: s.content,
            bottom: s.answer,
          }
          return <GameCard key={story.id} story={story} />
        })}
      </section>
    </main>
  )
}


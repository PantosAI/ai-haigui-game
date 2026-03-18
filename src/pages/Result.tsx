import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { stories } from '../data/stories'

export function Result() {
  const navigate = useNavigate()
  const { storyId } = useParams()
  const [searchParams] = useSearchParams()
  const resolvedStoryId = storyId ?? searchParams.get('storyId') ?? undefined

  const story = resolvedStoryId ? stories.find((s) => s.id === resolvedStoryId) : undefined

  const title = story?.title ?? '结果'
  const bottom = story?.bottom

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-amber-400">{title}</h1>
        <Link to="/" className="text-sm text-slate-300 hover:text-slate-100">
          返回大厅
        </Link>
      </header>

      <section className="rounded-2xl bg-slate-950/50 p-6 shadow-xl ring-1 ring-slate-800 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-amber-300/90">汤底 · REVEAL</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">真相揭晓</h2>
          </div>
          {resolvedStoryId ? (
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-slate-700">
              storyId: {resolvedStoryId}
            </span>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-5 ring-1 ring-slate-800">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-1 rounded-xl bg-[radial-gradient(40rem_20rem_at_30%_0%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(30rem_18rem_at_80%_60%,rgba(56,189,248,0.10),transparent_55%)]"
              aria-hidden="true"
            />
            <div className="relative">
              {bottom ? (
                <p className="result-fade-in text-base leading-7 text-slate-100/95">
                  {bottom}
                </p>
              ) : (
                <div className="text-slate-200">
                  <p className="font-semibold text-amber-300">未找到对应故事</p>
                  <p className="mt-2 text-sm text-slate-300">
                    请从大厅选择故事开始，或检查传参的 <span className="font-semibold">storyId</span>。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 mt-6 -mx-4 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent px-4 pb-[env(safe-area-inset-bottom)] pt-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex w-full justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          再来一局
        </button>
      </div>

      <style>{`
        @keyframes resultFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .result-fade-in {
          animation: resultFadeIn 700ms ease-out 80ms both;
        }
      `}</style>
    </main>
  )
}


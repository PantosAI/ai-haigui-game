import { Link } from 'react-router-dom'
import type { Story } from '../data/stories'

const difficultyLabel: Record<Story['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const difficultyClassName: Record<Story['difficulty'], string> = {
  easy: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30',
  medium: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30',
  hard: 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30',
}

export function GameCard(props: { story: Story }) {
  return (
    <Link
      to={`/game/${props.story.id}`}
      className="group relative block rounded-xl bg-slate-900/40 p-5 shadow-lg ring-1 ring-slate-700/80 backdrop-blur transition will-change-transform hover:-translate-y-0.5 hover:scale-[1.02] hover:ring-amber-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-50">{props.story.title}</h2>
        <span
          className={[
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
            difficultyClassName[props.story.difficulty],
          ].join(' ')}
        >
          {difficultyLabel[props.story.difficulty]}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-200/90">{props.story.surface}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">点击进入</span>
        <span className="text-sm font-semibold text-amber-300 transition group-hover:text-amber-200">
          开始推理 →
        </span>
      </div>
    </Link>
  )
}


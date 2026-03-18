export function StoryReveal(props: { title: string; content: string }) {
  return (
    <section className="rounded-lg bg-slate-800/60 p-4 shadow-lg ring-1 ring-slate-700">
      <h2 className="text-base font-semibold text-amber-400">{props.title}</h2>
      <p className="mt-3 text-slate-200">{props.content}</p>
    </section>
  )
}


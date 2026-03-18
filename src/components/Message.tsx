export type MessageRole = 'user' | 'assistant'

export function Message(props: { role: MessageRole; content: string }) {
  const isUser = props.role === 'user'
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={[
          'flex max-w-[90%] items-end gap-2',
          isUser ? 'flex-row-reverse' : 'flex-row',
        ].join(' ')}
      >
        <div
          className={[
            'grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ring-1',
            isUser ? 'bg-blue-950 text-slate-100 ring-blue-900/60' : 'bg-slate-800 text-slate-100 ring-slate-700',
          ].join(' ')}
          aria-hidden="true"
        >
          {isUser ? '你' : 'AI'}
        </div>
        <div
          className={[
            'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-lg',
            isUser ? 'bg-blue-950 text-slate-100' : 'bg-slate-700 text-slate-100',
          ].join(' ')}
        >
          {props.content}
        </div>
      </div>
    </div>
  )
}


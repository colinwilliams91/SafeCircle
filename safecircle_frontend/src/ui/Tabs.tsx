import { cn } from './cn'

export type TabId = 'child' | 'chat' | 'privacy' | 'guardian'

function Icon({
  name,
  className,
}: {
  name: 'child' | 'chat' | 'privacy' | 'guardian'
  className?: string
}) {
  const base = cn('h-4 w-4', className)
  if (name === 'child') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden="true">
        <path
          d="M12 5.2a6.8 6.8 0 0 0-6.8 6.8v1.8c0 2.5 2 4.5 4.5 4.5h4.6c2.5 0 4.5-2 4.5-4.5V12A6.8 6.8 0 0 0 12 5.2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.3 12.6h.01M14.7 12.6h.01M9.2 15.1c1 .8 2.1 1.2 2.8 1.2.7 0 1.9-.4 2.8-1.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden="true">
        <path
          d="M7 9.5h8M7 13h5M12 20a8 8 0 1 0-7.6-10.5c.4 1.4.3 3-.4 4.6-.4.9-.6 1.3-.5 1.6.1.2.2.4.4.5.2.2.7.2 1.6.2h.5a8 8 0 0 0 5.5 3.6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (name === 'privacy') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden="true">
        <path
          d="M12 3 4.5 6.5V12c0 5.1 3.2 8.9 7.5 10 4.3-1.1 7.5-4.9 7.5-10V6.5L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 12.3 11 14.1l3.8-4.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden="true">
      <path
        d="M12 4a7.5 7.5 0 0 0-7.5 7.5v2.2c0 2.9 2.4 5.3 5.3 5.3h4.4c3 0 5.3-2.4 5.3-5.3v-2.2A7.5 7.5 0 0 0 12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.5h.01M14.8 12.5h.01M9 15.2c1 .9 2.1 1.3 3 1.3s2-.4 3-1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Tabs({
  value,
  onChange,
}: {
  value: TabId
  onChange: (id: TabId) => void
}) {
  const items: Array<{ id: TabId; hint: string }> = [
    { id: 'child', hint: 'Child chat interface' },
    { id: 'chat', hint: 'Youth chat demo' },
    { id: 'privacy', hint: 'Privacy by design' },
    { id: 'guardian', hint: 'Guardian view' },
  ]

  return (
    <div className="flex items-center justify-center gap-10" role="tablist" aria-label="SafeCircle screens">
      {items.map((t) => {
        const isActive = value === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={t.hint}
            onClick={() => onChange(t.id)}
            className={cn(
              'group flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60',
            )}
          >
            <span
              className={cn(
                'grid h-14 w-14 place-items-center rounded-2xl',
                'bg-white/6 ring-1 ring-white/12 backdrop-blur transition',
                'shadow-[0_18px_40px_rgba(0,0,0,0.35)]',
                isActive
                  ? 'bg-gradient-to-b from-sky-300/30 via-emerald-300/10 to-amber-300/20 ring-white/25'
                  : 'active:scale-[0.98]',
              )}
            >
              <Icon name={t.id} className={cn('h-5 w-5', isActive ? 'text-white' : 'text-slate-200')} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

import { cn } from './cn'
import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'safe' | 'medium' | 'high' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-white/8 text-slate-200 ring-1 ring-white/12',
  safe: 'bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/15',
  medium: 'bg-amber-400/12 text-amber-200 ring-1 ring-amber-300/15',
  high: 'bg-rose-500/12 text-rose-200 ring-1 ring-rose-300/15',
  danger: 'bg-rose-500/12 text-rose-200 ring-1 ring-rose-300/15',
}

export function Badge({
  tone,
  children,
}: {
  tone: BadgeTone
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
        tones[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {children}
    </span>
  )
}

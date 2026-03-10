import { cn } from './cn'
import type { ReactNode } from 'react'

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-2xl bg-slate-950/40 p-5 ring-1 ring-white/10 backdrop-blur',
        className,
      )}
    >
      {children}
    </section>
  )
}

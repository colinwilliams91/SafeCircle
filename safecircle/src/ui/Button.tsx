import { cn } from './cn'
import type { ButtonHTMLAttributes } from 'react'

type ButtonTone = 'primary' | 'secondary' | 'danger'

const tones: Record<ButtonTone, string> = {
  primary:
    'bg-sky-400/15 text-sky-100 ring-1 ring-sky-200/15 hover:bg-sky-400/20 active:bg-sky-400/25',
  secondary:
    'bg-white/7 text-slate-100 ring-1 ring-white/12 hover:bg-white/10 active:bg-white/12',
  danger:
    'bg-rose-500/14 text-rose-100 ring-1 ring-rose-200/15 hover:bg-rose-500/18 active:bg-rose-500/24',
}

export function Button({
  tone = 'secondary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold',
        'cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 disabled:opacity-50',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

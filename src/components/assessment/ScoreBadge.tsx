import { cn, scoreBg } from '../../lib/utils'

export function ScoreBadge({ score, className }: { score: number | null; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[3rem] rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums',
        scoreBg(score),
        className,
      )}
    >
      {score !== null ? `${Math.round(score)}%` : '—'}
    </span>
  )
}

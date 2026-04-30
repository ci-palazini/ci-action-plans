type Props = {
  value: number
  total?: number
  done?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({ value, total, done, showLabel = true, size = 'md', className }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const tone = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-slate-400'
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span className="font-medium">{pct}%</span>
          {typeof total === 'number' && typeof done === 'number' && (
            <span className="text-slate-400">
              {done}/{total}
            </span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-100 overflow-hidden ${height}`}>
        <div className={`${tone} ${height} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

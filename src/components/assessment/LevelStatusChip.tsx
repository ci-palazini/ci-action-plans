import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import type { LevelStatus } from '../../types'

const styles: Record<LevelStatus, string> = {
  'Accomplished': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Progress':  'bg-amber-50  text-amber-700  border-amber-200',
  'Open':         'bg-slate-50  text-slate-500  border-slate-200',
}

export function LevelStatusChip({ status }: { status: LevelStatus | null }) {
  const { t } = useTranslation()
  if (!status) return null
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', styles[status])}>
      {t(`levelStatus.${status}`)}
    </span>
  )
}

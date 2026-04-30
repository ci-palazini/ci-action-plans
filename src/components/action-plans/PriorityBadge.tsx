import { useTranslation } from 'react-i18next'
import { PRIORITY_COLORS } from '../../lib/constants'
import type { ActionPriority } from '../../types'

export function PriorityBadge({ priority, size = 'md' }: { priority: ActionPriority; size?: 'sm' | 'md' }) {
  const { t } = useTranslation()
  const c = PRIORITY_COLORS[priority]
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${padding} ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {t(`actionPlan.priority_${priority}`)}
    </span>
  )
}

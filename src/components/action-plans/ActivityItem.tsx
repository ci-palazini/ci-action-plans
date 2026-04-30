import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Sparkles,
  Flag as FlagIcon,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Settings,
} from 'lucide-react'
import type { ActionPlanActivity } from '../../types'
import type { Profile } from '../../types'

const iconByType: Record<ActionPlanActivity['type'], React.ComponentType<{ className?: string }>> = {
  comment: MessageSquare,
  plan_created: Sparkles,
  status_changed: FlagIcon,
  priority_changed: FlagIcon,
  deadline_changed: Calendar,
  responsible_changed: UserIcon,
  task_added: Plus,
  task_completed: CheckCircle2,
  task_reopened: Circle,
  task_removed: Trash2,
}

function relativeTime(iso: string, locale = 'en'): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.round(ms / 60000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: '2-digit' })
}

type Props = {
  activity: ActionPlanActivity
  authorById: Map<string, Profile>
}

export function ActivityItem({ activity, authorById }: Props) {
  const { t, i18n } = useTranslation()
  const Icon = iconByType[activity.type] ?? Settings
  const author = activity.author_id ? authorById.get(activity.author_id) : null
  const isComment = activity.type === 'comment'

  if (isComment) {
    return (
      <li className="flex gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          {(author?.avatar_initials ?? author?.full_name?.[0] ?? '?').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">
              {author?.full_name ?? t('actionPlan.timeline.unknownUser')}
            </span>
            {author?.role === 'admin' && author?.country_id === null && (
              <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 border border-indigo-100">
                {t('actionPlan.timeline.globalAdmin')}
              </span>
            )}
            <span className="text-xs text-slate-400">{relativeTime(activity.created_at, i18n.language)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{activity.content}</p>
        </div>
      </li>
    )
  }

  // Eventos do sistema
  const meta = (activity.metadata ?? {}) as Record<string, unknown>
  const from = meta.from
  const to = meta.to
  const title = meta.title

  return (
    <li className="flex gap-3 text-sm text-slate-500">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0 pt-1.5">
        <span>
          <span className="font-medium text-slate-700">
            {author?.full_name ?? t('actionPlan.timeline.system')}
          </span>{' '}
          {t(`actionPlan.timeline.event_${activity.type}`, {
            from: typeof from === 'string' ? t(eventLabel(activity.type, from)) : from,
            to:   typeof to   === 'string' ? t(eventLabel(activity.type, to))   : to,
            title,
            defaultValue: activity.type,
          })}
        </span>
        <span className="ml-2 text-xs text-slate-400">{relativeTime(activity.created_at, i18n.language)}</span>
      </div>
    </li>
  )
}

// Resolve labels traduzíveis para from/to dependendo do tipo de mudança.
function eventLabel(type: string, value: string): string {
  if (type === 'status_changed')   return `actionPlan.status_${value}`
  if (type === 'priority_changed') return `actionPlan.priority_${value}`
  return value
}

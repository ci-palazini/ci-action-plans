import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Bell, Check, MessageSquare, Flag as FlagIcon, Sparkles } from 'lucide-react'
import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import type { ActionPlan, Notification, ActivityType } from '../../types'

type PlanLite = Pick<ActionPlan, 'id' | 'country_id' | 'pillar_name' | 'element_name'>

async function fetchPlansLite(ids: string[]): Promise<PlanLite[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('action_plans')
    .select('id, country_id, pillar_name, element_name')
    .in('id', ids)
  if (error) throw error
  return (data ?? []) as PlanLite[]
}

const iconByType: Partial<Record<ActivityType, React.ComponentType<{ className?: string }>>> = {
  comment: MessageSquare,
  status_changed: FlagIcon,
  priority_changed: FlagIcon,
  plan_created: Sparkles,
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.round(ms / 60000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
}

export function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { list, unread } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const items = list.data ?? []
  const planIds = Array.from(new Set(items.map((n) => n.action_plan_id)))
  const { data: plans = [] } = useQuery({
    queryKey: ['plans-lite', planIds.join(',')],
    queryFn: () => fetchPlansLite(planIds),
    enabled: planIds.length > 0,
  })
  const planMap = new Map(plans.map((p) => [p.id, p]))

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function handleClick(n: Notification) {
    if (!n.read_at) markRead.mutate(n.id)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('notifications.title')}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {(unread.data ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {Math.min(unread.data ?? 0, 99)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 max-w-[90vw] rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-700">{t('notifications.title')}</p>
            {(unread.data ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
              >
                <Check className="h-3 w-3" />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">{t('notifications.empty')}</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {items.map((n) => {
                const plan = planMap.get(n.action_plan_id)
                const Icon = iconByType[n.type] ?? Bell
                const url = plan ? `/countries/${plan.country_id}/action-plans/${plan.id}` : '#'
                return (
                  <li key={n.id}>
                    <Link
                      to={url}
                      onClick={() => handleClick(n)}
                      className={cn(
                        'flex gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors',
                        !n.read_at && 'bg-indigo-50/40',
                      )}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-700 line-clamp-1">
                          {plan ? plan.element_name : t('notifications.unknownPlan')}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {t(`notifications.type_${n.type}`, { defaultValue: n.type })}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-slate-400">{relativeTime(n.created_at)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

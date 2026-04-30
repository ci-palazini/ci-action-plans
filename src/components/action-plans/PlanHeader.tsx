import { useTranslation } from 'react-i18next'
import { Calendar, User as UserIcon } from 'lucide-react'
import { Flag } from '../ui/Flag'
import { PriorityBadge } from './PriorityBadge'
import { ProgressBar } from './ProgressBar'
import { useUpdateActionPlanStatus, useUpdateActionPlanPriority } from '../../hooks/useActionPlan'
import { useAuth } from '../../contexts/AuthContext'
import { canChangeStatusOrPriority } from '../../lib/permissions'
import { COUNTRIES, STATUS_COLORS, PRIORITIES } from '../../lib/constants'
import { formatDate } from '../../lib/utils'
import type { ActionPlan, ActionStatus, ActionPriority } from '../../types'

type Props = {
  plan: ActionPlan
  taskCount?: number
  doneCount?: number
}

export function PlanHeader({ plan, taskCount, doneCount }: Props) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const updateStatus = useUpdateActionPlanStatus()
  const updatePriority = useUpdateActionPlanPriority()

  const country = COUNTRIES.find((c) => c.id === plan.country_id)
  const statusColors = STATUS_COLORS[plan.status]
  const allow = canChangeStatusOrPriority(profile, plan)

  function changeStatus(next: ActionStatus) {
    if (!user) return
    updateStatus.mutate({ id: plan.id, status: next, authorId: user.id })
  }

  function changePriority(next: ActionPriority) {
    if (!user) return
    updatePriority.mutate({ id: plan.id, priority: next, authorId: user.id })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <Flag countryId={plan.country_id} className="h-8 w-auto mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {country?.name} · {t(`pillar.${plan.pillar_name}`)}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 break-words">{plan.element_name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Status */}
              {allow ? (
                <select
                  value={plan.status}
                  onChange={(e) => changeStatus(e.target.value as ActionStatus)}
                  disabled={updateStatus.isPending}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                >
                  <option value="open">{t('actionPlan.status_open')}</option>
                  <option value="in_progress">{t('actionPlan.status_in_progress')}</option>
                  <option value="completed">{t('actionPlan.status_completed')}</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                  {t(`actionPlan.status_${plan.status}`)}
                </span>
              )}

              {/* Prioridade */}
              {allow ? (
                <select
                  value={plan.priority}
                  onChange={(e) => changePriority(e.target.value as ActionPriority)}
                  disabled={updatePriority.isPending}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {t(`actionPlan.priority_${p}`)}
                    </option>
                  ))}
                </select>
              ) : (
                <PriorityBadge priority={plan.priority} />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
            {plan.responsible_person}
          </span>
          {plan.deadline && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(plan.deadline)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={plan.progress_pct}
          total={taskCount}
          done={doneCount}
        />
      </div>
    </div>
  )
}

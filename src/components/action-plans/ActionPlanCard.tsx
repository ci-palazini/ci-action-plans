import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, Calendar, User } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ActionPlanModal } from './ActionPlanModal'
import { PriorityBadge } from './PriorityBadge'
import { ProgressBar } from './ProgressBar'
import { useDeleteActionPlan } from '../../hooks/useActionPlans'
import { formatDate, isEnglishLocale, resolveContentLocale } from '../../lib/utils'
import { STATUS_COLORS, COUNTRIES } from '../../lib/constants'
import type { ActionPlan } from '../../types'

export function ActionPlanCard({
  plan,
  canEdit = false,
  showMeta = false,
}: {
  plan: ActionPlan
  canEdit?: boolean
  showMeta?: boolean
}) {
  const { t, i18n } = useTranslation()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteMutation = useDeleteActionPlan()
  const colors = STATUS_COLORS[plan.status]

  const country = COUNTRIES.find((c) => c.id === plan.country_id)
  const countryLocale = country?.locale ?? 'en'
  const isBilingual = !isEnglishLocale(countryLocale)
  const showingEn = isBilingual && resolveContentLocale(i18n.language, countryLocale) === 'en'

  const problemText = showingEn
    ? (plan.problem_description_en || plan.problem_description)
    : plan.problem_description

  const actionsText = showingEn
    ? (plan.proposed_actions_en || plan.proposed_actions)
    : plan.proposed_actions

  const statusLabel = {
    open:        t('actionPlan.status_open'),
    in_progress: t('actionPlan.status_in_progress'),
    completed:   t('actionPlan.status_completed'),
  }[plan.status]

  const detailUrl = `/countries/${plan.country_id}/action-plans/${plan.id}`

  // Impede que clicar nos botões de ação dispare navegação do Link
  const stop = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <>
      <Link
        to={detailUrl}
        className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
              {statusLabel}
            </span>
            <PriorityBadge priority={plan.priority} size="sm" />
            {showMeta && (
              <Badge variant="outline">{plan.element_name}</Badge>
            )}
            {showingEn && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                EN
              </span>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={(e) => { stop(e); setEditOpen(true) }}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { stop(e); setConfirmDelete(true) }}
                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('actionPlan.problemDescription')}</p>
            <p className="text-sm text-slate-800 mt-0.5 line-clamp-2">{problemText}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('actionPlan.proposedActions')}</p>
            <p className="text-sm text-slate-800 mt-0.5 line-clamp-2">{actionsText}</p>
          </div>
        </div>

        <ProgressBar value={plan.progress_pct} size="sm" className="mt-3" />

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {plan.responsible_person}
          </span>
          {plan.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(plan.deadline)}
            </span>
          )}
        </div>
      </Link>

      {editOpen && (
        <ActionPlanModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          countryId={plan.country_id}
          pillarName={plan.pillar_name}
          elementName={plan.element_name}
          plan={plan}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">{t('actionPlan.delete')}</h3>
            <p className="text-sm text-slate-600 mb-4">{t('actionPlan.deleteConfirm')}</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutateAsync(plan.id).then(() => setConfirmDelete(false))}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

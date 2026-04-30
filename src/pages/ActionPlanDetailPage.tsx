import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Pencil, Globe2, ListChecks, MessageSquare } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PlanHeader } from '../components/action-plans/PlanHeader'
import { TaskList } from '../components/action-plans/TaskList'
import { ActivityTimeline } from '../components/action-plans/ActivityTimeline'
import { CommentComposer } from '../components/action-plans/CommentComposer'
import { ActionPlanModal } from '../components/action-plans/ActionPlanModal'
import { useActionPlan } from '../hooks/useActionPlan'
import { useActionPlanTasks } from '../hooks/useActionPlanTasks'
import { useAuth } from '../contexts/AuthContext'
import { canEditPlanContent, canManageTasks, canComment } from '../lib/permissions'
import { COUNTRIES } from '../lib/constants'
import { isEnglishLocale, resolveContentLocale, formatDate } from '../lib/utils'

export function ActionPlanDetailPage() {
  const { countryId = '', planId = '' } = useParams<{ countryId: string; planId: string }>()
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const { data: plan, isLoading } = useActionPlan(planId)
  const { data: tasks = [] } = useActionPlanTasks(planId)
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title={t('actionPlan.detail.notFound')}
          description={t('actionPlan.detail.notFoundDescription')}
        />
        <div className="mt-4 flex justify-center">
          <Link to={`/countries/${countryId}/action-plans`}>
            <Button variant="secondary">
              <ChevronLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Mismatch: caso o user manipule a URL com countryId diferente do plano,
  // redireciona para a URL canônica.
  if (plan.country_id !== countryId) {
    return <Navigate to={`/countries/${plan.country_id}/action-plans/${plan.id}`} replace />
  }

  const country = COUNTRIES.find((c) => c.id === plan.country_id)
  const countryLocale = country?.locale ?? 'en'
  const isBilingual = !isEnglishLocale(countryLocale)
  const showingEn = isBilingual && resolveContentLocale(i18n.language, countryLocale) === 'en'
  const problem = showingEn ? plan.problem_description_en || plan.problem_description : plan.problem_description
  const actions = showingEn ? plan.proposed_actions_en   || plan.proposed_actions   : plan.proposed_actions

  const total = tasks.length
  const done = tasks.filter((x) => x.done).length

  const allowEditContent = canEditPlanContent(profile, plan)
  const allowManageTasks = canManageTasks(profile, plan)
  const allowComment     = canComment(profile, plan)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <Link
        to={`/countries/${plan.country_id}/action-plans`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('actionPlan.detail.backToList', { country: country?.name })}
      </Link>

      <PlanHeader plan={plan} taskCount={total} doneCount={done} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* Coluna principal */}
        <div className="space-y-4">
          {/* Controles de edição / idioma */}
          <div className="flex items-center justify-between min-h-[28px]">
            {showingEn ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                <Globe2 className="h-3 w-3" />
                {t('actionPlan.viewingInEnglish')}
              </span>
            ) : (
              <span />
            )}
            {allowEditContent ? (
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                {t('actionPlan.detail.editContent')}
              </Button>
            ) : profile && profile.role === 'admin' ? (
              <span className="text-xs italic text-slate-400">
                {t('actionPlan.detail.cannotEditContent')}
              </span>
            ) : null}
          </div>

          {/* Descrição do problema */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('actionPlan.problemDescription')}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{problem}</p>
          </section>

          {/* Ações propostas */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('actionPlan.proposedActions')}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{actions}</p>
          </section>

          {/* Tarefas */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <ListChecks className="h-3.5 w-3.5" />
              {t('actionPlan.detail.tab_tasks')}
              {total > 0 && (
                <span className="ml-1 text-slate-400 normal-case font-normal tracking-normal">
                  ({done}/{total})
                </span>
              )}
            </h2>
            <TaskList planId={plan.id} canManage={allowManageTasks} />
          </section>
        </div>

        {/* Coluna direita — sticky */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Metadados */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {t('actionPlan.detail.metadata')}
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-400">{t('actionPlan.responsible')}</dt>
                <dd className="text-slate-700">{plan.responsible_person}</dd>
              </div>
              {plan.deadline && (
                <div>
                  <dt className="text-xs text-slate-400">{t('actionPlan.deadline')}</dt>
                  <dd className="text-slate-700">{formatDate(plan.deadline)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400">{t('actionPlan.detail.createdAt')}</dt>
                <dd className="text-slate-700">{formatDate(plan.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t('actionPlan.detail.element')}</dt>
                <dd className="text-slate-700">{plan.element_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t('actionPlan.detail.pillar')}</dt>
                <dd className="text-slate-700">{t(`pillar.${plan.pillar_name}`)}</dd>
              </div>
            </dl>
          </div>

          {/* Comentários e atividade */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <MessageSquare className="h-3.5 w-3.5" />
              {t('actionPlan.detail.tab_timeline')}
            </h3>
            <CommentComposer planId={plan.id} canComment={allowComment} />
            <div className="mt-4 max-h-[480px] overflow-y-auto pr-1">
              <ActivityTimeline planId={plan.id} />
            </div>
          </div>
        </aside>
      </div>

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
    </div>
  )
}

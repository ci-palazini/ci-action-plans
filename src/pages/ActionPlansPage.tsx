import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Search, Globe2 } from 'lucide-react'
import { useActionPlans } from '../hooks/useActionPlans'
import { useAuth } from '../contexts/AuthContext'
import { ActionPlanCard } from '../components/action-plans/ActionPlanCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { COUNTRIES, PILLARS, PRIORITIES } from '../lib/constants'
import { Flag } from '../components/ui/Flag'
import { isEnglishLocale, resolveContentLocale } from '../lib/utils'
import type { ActionStatus, ActionPriority } from '../types'

export function ActionPlansPage() {
  const { countryId = '' } = useParams<{ countryId: string }>()
  const { t, i18n } = useTranslation()
  const { canWrite } = useAuth()
  const country = COUNTRIES.find((c) => c.id === countryId)
  const canEdit = canWrite(countryId)

  const countryLocale = country?.locale ?? 'en'
  const isBilingual = !isEnglishLocale(countryLocale)
  const showingEn = isBilingual && resolveContentLocale(i18n.language, countryLocale) === 'en'

  const { data: plans = [], isLoading } = useActionPlans(countryId)

  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState<ActionStatus | 'all'>('all')
  const [pillarFilter, setPillar]     = useState<string>('all')
  const [priorityFilter, setPriority] = useState<ActionPriority | 'all'>('all')

  const filtered = plans.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      p.element_name.toLowerCase().includes(q) ||
      p.problem_description.toLowerCase().includes(q) ||
      (p.problem_description_en ?? '').toLowerCase().includes(q) ||
      (p.proposed_actions_en ?? '').toLowerCase().includes(q) ||
      p.responsible_person.toLowerCase().includes(q)
    const matchStatus   = statusFilter   === 'all' || p.status   === statusFilter
    const matchPillar   = pillarFilter   === 'all' || p.pillar_name === pillarFilter
    const matchPriority = priorityFilter === 'all' || p.priority === priorityFilter
    return matchSearch && matchStatus && matchPillar && matchPriority
  })

  // Group by pillar
  const grouped = new Map<string, typeof filtered>()
  for (const p of filtered) {
    const arr = grouped.get(p.pillar_name) ?? []
    arr.push(p)
    grouped.set(p.pillar_name, arr)
  }
  const orderedPillars = PILLARS.filter((p) => grouped.has(p))

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link to={`/countries/${countryId}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        {t('common.backToCountry', { country: country?.name })}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag countryId={countryId} className="h-7 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('actionPlan.title')}</h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              {country?.name}
              {!canEdit && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Globe2 className="h-3 w-3" />
                  {t('actionPlan.bestPractice')}
                </span>
              )}
              {showingEn && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                  <Globe2 className="h-3 w-3" />
                  {t('actionPlan.viewingInEnglish')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('actionPlan.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value as ActionStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{t('actionPlan.allStatuses')}</option>
          <option value="open">{t('actionPlan.status_open')}</option>
          <option value="in_progress">{t('actionPlan.status_in_progress')}</option>
          <option value="completed">{t('actionPlan.status_completed')}</option>
        </select>
        <select
          value={pillarFilter}
          onChange={(e) => setPillar(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{t('actionPlan.allPillars')}</option>
          {PILLARS.map((p) => (
            <option key={p} value={p}>{t(`pillar.${p}`)}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriority(e.target.value as ActionPriority | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{t('actionPlan.allPriorities')}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{t(`actionPlan.priority_${p}`)}</option>
          ))}
        </select>
      </div>

      {/* Plans */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('actionPlan.noPlans')}
          description={search || statusFilter !== 'all' ? 'Try adjusting your filters.' : t('actionPlan.addFirst')}
        />
      ) : (
        <div className="space-y-6">
          {orderedPillars.map((pillar) => (
            <div key={pillar}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                {t(`pillar.${pillar}`)} · {grouped.get(pillar)!.length}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {grouped.get(pillar)!.map((plan) => (
                  <ActionPlanCard key={plan.id} plan={plan} canEdit={canEdit} showMeta />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

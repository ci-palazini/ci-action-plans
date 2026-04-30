import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useActionPlans } from '../hooks/useActionPlans'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Flag } from '../components/ui/Flag'
import { PriorityBadge } from '../components/action-plans/PriorityBadge'
import { ProgressBar } from '../components/action-plans/ProgressBar'
import { COUNTRIES, STATUS_COLORS, PRIORITIES } from '../lib/constants'
import { formatDate } from '../lib/utils'
import type { ActionStatus, ActionPriority } from '../types'

export function AllActionPlansPage() {
  const { t } = useTranslation()
  const { data: plans = [], isLoading } = useActionPlans()

  const [search, setSearch]           = useState('')
  const [country, setCountry]         = useState<string>('all')
  const [status, setStatus]           = useState<ActionStatus | 'all'>('all')
  const [priority, setPriority]       = useState<ActionPriority | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return plans.filter((p) => {
      const matchSearch = !search ||
        p.element_name.toLowerCase().includes(q) ||
        p.problem_description.toLowerCase().includes(q) ||
        (p.problem_description_en ?? '').toLowerCase().includes(q) ||
        p.responsible_person.toLowerCase().includes(q)
      const matchCountry  = country  === 'all' || p.country_id === country
      const matchStatus   = status   === 'all' || p.status === status
      const matchPriority = priority === 'all' || p.priority === priority
      return matchSearch && matchCountry && matchStatus && matchPriority
    })
  }, [plans, search, country, status, priority])

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('allPlans.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('allPlans.subtitle', { count: filtered.length })}</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('actionPlan.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{t('allPlans.allCountries')}</option>
          {COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ActionStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{t('actionPlan.allStatuses')}</option>
          <option value="open">{t('actionPlan.status_open')}</option>
          <option value="in_progress">{t('actionPlan.status_in_progress')}</option>
          <option value="completed">{t('actionPlan.status_completed')}</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as ActionPriority | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">{t('actionPlan.allPriorities')}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{t(`actionPlan.priority_${p}`)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('actionPlan.noPlans')}
          description={t('allPlans.adjustFilters')}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">{t('allPlans.country')}</th>
                  <th className="px-3 py-3 text-left">{t('allPlans.element')}</th>
                  <th className="px-3 py-3 text-left">{t('allPlans.responsible')}</th>
                  <th className="px-3 py-3 text-left">{t('actionPlan.status')}</th>
                  <th className="px-3 py-3 text-left">{t('actionPlan.priority')}</th>
                  <th className="px-3 py-3 text-left w-44">{t('allPlans.progress')}</th>
                  <th className="px-3 py-3 text-left">{t('actionPlan.deadline')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const c = COUNTRIES.find((x) => x.id === p.country_id)
                  const sc = STATUS_COLORS[p.status]
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <Link
                          to={`/countries/${p.country_id}/action-plans/${p.id}`}
                          className="flex items-center gap-2 hover:text-indigo-600"
                        >
                          <Flag countryId={p.country_id} className="h-4 w-auto" />
                          <span className="font-medium text-slate-700">{c?.name ?? p.country_id}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          to={`/countries/${p.country_id}/action-plans/${p.id}`}
                          className="block hover:text-indigo-600"
                        >
                          <p className="font-medium text-slate-800">{p.element_name}</p>
                          <p className="text-xs text-slate-500">{t(`pillar.${p.pillar_name}`)}</p>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{p.responsible_person}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {t(`actionPlan.status_${p.status}`)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <PriorityBadge priority={p.priority} size="sm" />
                      </td>
                      <td className="px-3 py-2.5">
                        <ProgressBar value={p.progress_pct} size="sm" showLabel />
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {p.deadline ? formatDate(p.deadline) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

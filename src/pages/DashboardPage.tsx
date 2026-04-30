import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, ClipboardList, CheckCircle2, Target, AlertTriangle } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { CountryScoreCard } from '../components/dashboard/CountryScoreCard'
import { PillarRadarChart } from '../components/dashboard/PillarRadarChart'
import { ActionPlanStatusChart } from '../components/dashboard/ActionPlanStatusChart'
import { CoverageProgressBars } from '../components/dashboard/CoverageProgressBars'
import { CoverageByPillarChart } from '../components/dashboard/CoverageByPillarChart'
import { Spinner } from '../components/ui/Spinner'
import { cn } from '../lib/utils'

const TABS = ['countries', 'coverage', 'byPillar', 'actionPlans'] as const
type Tab = typeof TABS[number]

const KPI_ACCENTS: Record<string, string> = {
  score:    '#6366f1',
  open:     '#ef4444',
  done:     '#10b981',
  coverage: '#f59e0b',
  missing:  '#8b5cf6',
}

function KpiCard({ label, value, accent, icon: Icon }: {
  label: string
  value: string | number
  accent: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-white/80" style={{ borderLeftWidth: 3, borderLeftColor: accent }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>{label}</p>
      </div>
      <p className="font-mono-data text-[2rem] font-bold text-slate-900 tabular-nums leading-none">{value}</p>
    </div>
  )
}

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { summaries, globalAvg, totalOpen, totalCompleted, coverageStats, isLoading } = useDashboard()
  const [tab, setTab] = useState<Tab>('countries')

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  const tabLabels: Record<Tab, string> = {
    countries:   t('dashboard.countries'),
    coverage:    t('dashboard.coverageTab'),
    byPillar:    t('dashboard.byPillar'),
    actionPlans: t('dashboard.actionPlans'),
  }

  return (
    <div className="min-h-full p-5 lg:p-7" style={{ background: '#f7f4ef' }}>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">
              {t('app.header_tagline')}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.title')}</h1>
          </div>
          <p className="text-sm text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard icon={TrendingUp}    accent={KPI_ACCENTS.score}    label={t('dashboard.avgScore')}              value={`${Math.round(globalAvg)}%`}           />
          <KpiCard icon={ClipboardList} accent={KPI_ACCENTS.open}     label={t('dashboard.openPlans')}             value={totalOpen}                              />
          <KpiCard icon={CheckCircle2}  accent={KPI_ACCENTS.done}     label={t('dashboard.completedPlans')}        value={totalCompleted}                         />
          <KpiCard icon={Target}        accent={KPI_ACCENTS.coverage}  label={t('dashboard.coverage.globalPct')}    value={`${coverageStats.globalCoveragePct}%`}  />
          <KpiCard icon={AlertTriangle} accent={KPI_ACCENTS.missing}   label={t('dashboard.coverage.withoutPlan')}  value={coverageStats.globalUncoveredCount}     />
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 gap-1 shadow-sm border border-white/80">
          {TABS.map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={cn(
                'flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                tab === t_
                  ? 'bg-white shadow-md text-slate-900'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50',
              )}
            >
              {tabLabels[t_]}
            </button>
          ))}
        </div>

        {/* ── Tab: Países ─────────────────────────────────── */}
        {tab === 'countries' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {summaries.map((s) => (
              <CountryScoreCard key={s.countryId} summary={s} />
            ))}
          </div>
        )}

        {/* ── Tab: Cobertura ──────────────────────────────── */}
        {tab === 'coverage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-5">{t('dashboard.coverage.tableTitle')}</h2>
              <CoverageProgressBars rows={coverageStats.byCountry} />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">{t('dashboard.coverage.chartTitle')}</h2>
              <CoverageByPillarChart rows={coverageStats.byPillar} />
            </div>
          </div>
        )}

        {/* ── Tab: Por Pilar ──────────────────────────────── */}
        {tab === 'byPillar' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">{t('dashboard.scoreByPillar')}</h2>
            <PillarRadarChart summaries={summaries} />
          </div>
        )}

        {/* ── Tab: Status de Planos ───────────────────────── */}
        {tab === 'actionPlans' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">{t('dashboard.actionPlanStatus')}</h2>
            <ActionPlanStatusChart summaries={summaries} />
          </div>
        )}

      </div>
    </div>
  )
}

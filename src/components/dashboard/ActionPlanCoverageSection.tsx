import { useTranslation } from 'react-i18next'
import { CoverageByCountryTable } from './CoverageByCountryTable'
import { CoverageByPillarChart } from './CoverageByPillarChart'
import type { CoverageStats } from '../../types'

export function ActionPlanCoverageSection({ stats }: { stats: CoverageStats }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 mt-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          {t('dashboard.coverage.tableTitle')}
        </h2>
        <CoverageByCountryTable rows={stats.byCountry} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          {t('dashboard.coverage.chartTitle')}
        </h2>
        <CoverageByPillarChart rows={stats.byPillar} />
      </div>
    </div>
  )
}

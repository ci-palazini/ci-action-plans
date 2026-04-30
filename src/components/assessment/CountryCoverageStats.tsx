import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import type { CountryActionPlanCoverage } from '../../types'

export function CountryCoverageStats({ coverage }: { coverage: CountryActionPlanCoverage }) {
  const { t } = useTranslation()

  if (coverage.totalNeedsPlan === 0) return null

  const pctColor =
    coverage.coveragePct >= 80 ? 'text-emerald-600' :
    coverage.coveragePct >= 50 ? 'text-amber-500' :
    'text-red-500'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          {t('dashboard.coverage.tableTitle')}
        </h2>
        <span className={cn('text-2xl font-bold tabular-nums', pctColor)}>
          {coverage.coveragePct}%
        </span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-1">{t('dashboard.coverage.needsPlan')}</p>
          <p className="text-xl font-bold text-slate-800 tabular-nums">{coverage.totalNeedsPlan}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-emerald-600 mb-1">{t('dashboard.coverage.withPlan')}</p>
          <p className="text-xl font-bold text-emerald-700 tabular-nums">{coverage.totalWithPlan}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-red-500 mb-1">{t('dashboard.coverage.withoutPlan')}</p>
          <p className="text-xl font-bold text-red-600 tabular-nums">{coverage.totalWithoutPlan}</p>
        </div>
      </div>

      {/* Per-pillar breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2 text-left font-medium text-slate-500 pr-4">{t('actionPlan.pillar')}</th>
              <th className="pb-2 text-right font-medium text-slate-500 px-3">{t('dashboard.coverage.needsPlan')}</th>
              <th className="pb-2 text-right font-medium text-slate-500 px-3">{t('dashboard.coverage.withPlan')}</th>
              <th className="pb-2 text-right font-medium text-slate-500 px-3">{t('dashboard.coverage.withoutPlan')}</th>
              <th className="pb-2 text-right font-medium text-slate-500 pl-3">{t('dashboard.coverage.coveragePct')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coverage.byPillar.map((row) => {
              const total = row.withPlan + row.withoutPlan
              const pct = total === 0 ? 0 : Math.round((row.withPlan / total) * 100)
              const rowColor =
                pct >= 80 ? 'text-emerald-600' :
                pct >= 50 ? 'text-amber-500' :
                'text-red-500'

              return (
                <tr key={row.pillarName} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 pr-4 font-medium text-slate-700">{row.pillarName}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{total}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-emerald-600 font-medium">{row.withPlan}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-red-500 font-medium">{row.withoutPlan}</td>
                  <td className="py-2 pl-3 text-right">
                    <span className={cn('tabular-nums font-bold', rowColor)}>{pct}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

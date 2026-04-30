import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import type { CountryCoverageRow } from '../../types'

export function CoverageByCountryTable({ rows }: { rows: CountryCoverageRow[] }) {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-slate-400">
        {t('common.noData')}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-2 text-left font-medium text-slate-500 pr-4">{t('dashboard.coverage.country')}</th>
            <th className="pb-2 text-right font-medium text-slate-500 px-4">{t('dashboard.coverage.needsPlan')}</th>
            <th className="pb-2 text-right font-medium text-slate-500 px-4">{t('dashboard.coverage.withPlan')}</th>
            <th className="pb-2 text-right font-medium text-slate-500 px-4">{t('dashboard.coverage.withoutPlan')}</th>
            <th className="pb-2 text-right font-medium text-slate-500 pl-4">{t('dashboard.coverage.coveragePct')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const pctColor =
              row.coveragePct >= 80 ? 'text-emerald-600' :
              row.coveragePct >= 50 ? 'text-amber-500' :
              'text-red-500'

            return (
              <tr key={row.countryId} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{row.flagEmoji}</span>
                    <span className="font-medium text-slate-800">{row.countryName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-600">{row.needsPlan}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-emerald-600 font-medium">{row.withPlan}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-red-500 font-medium">{row.withoutPlan}</td>
                <td className="py-2.5 pl-4 text-right">
                  <span className={cn('tabular-nums font-bold', pctColor)}>{row.coveragePct}%</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import type { CountryCoverageRow } from '../../types'

export function CoverageProgressBars({ rows }: { rows: CountryCoverageRow[] }) {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-slate-400">
        {t('common.noData')}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {rows.map((row) => {
        const color =
          row.coveragePct >= 80 ? '#10b981' :
          row.coveragePct >= 50 ? '#f59e0b' :
          '#ef4444'
        const track =
          row.coveragePct >= 80 ? '#d1fae5' :
          row.coveragePct >= 50 ? '#fef3c7' :
          '#fee2e2'

        return (
          <div key={row.countryId}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{row.flagEmoji}</span>
                <span className="text-sm font-medium text-slate-700">{row.countryName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span style={{ color: '#10b981' }} className="font-medium">
                  {row.withPlan} {t('dashboard.coverage.withPlan')}
                </span>
                <span style={{ color: '#ef4444' }}>
                  {row.withoutPlan} {t('dashboard.coverage.withoutPlan')}
                </span>
                <span
                  className="font-mono-data font-bold tabular-nums w-9 text-right"
                  style={{ color }}
                >
                  {row.coveragePct}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: track }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${row.coveragePct}%`, background: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

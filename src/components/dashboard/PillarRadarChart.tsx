import { useTranslation } from 'react-i18next'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { PILLARS, CHART_COLORS } from '../../lib/constants'
import type { CountrySummary } from '../../types'

const PILLAR_SHORT: Record<string, string> = {
  'Collaboration & Engagement': 'C&E',
  'Safety': 'Safety',
  'Learning Culture': 'Learning',
  'Sales & Operations Planning': 'S&OP',
  'Sustainability': 'Sustain.',
  'Quality': 'Quality',
  'Continuous Improvement': 'CI',
  'Digital': 'Digital',
}

function CountryRadarCard({ summary }: { summary: CountrySummary }) {
  const { t } = useTranslation()
  const color = CHART_COLORS[summary.countryId as keyof typeof CHART_COLORS] ?? '#6366F1'

  const data = PILLARS.map((p) => {
    const ps = summary.pillars.find((x) => x.pillarName === p)
    return {
      pillar: PILLAR_SHORT[p] ?? p,
      score: Math.round(ps?.avgScore ?? 0),
      fullName: t(`pillar.${p}`)
    }
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center gap-1 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-1.5 w-full justify-center">
        <span className="text-lg leading-none">{summary.flagEmoji}</span>
        <span className="text-sm font-semibold text-slate-700 truncate">{summary.countryName}</span>
      </div>
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>
        {Math.round(summary.avgScore)}%
      </span>
      <ResponsiveContainer width="100%" height={160}>
        <RadarChart data={data} margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ fontSize: 9, fill: '#94a3b8' }}
          />
          <Radar
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.18}
            strokeWidth={1.5}
          />
          <Tooltip
            contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11 }}
            formatter={(value, _name, item) => [
              `${value ?? 0}%`,
              (item?.payload as { fullName?: string } | undefined)?.fullName ?? '',
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PillarRadarChart({ summaries }: { summaries: CountrySummary[] }) {
  const { t } = useTranslation()

  const withData = summaries.filter((s) => s.hasAssessment)
  if (withData.length === 0) return null

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3">
        {t('dashboard.scoreByPillarHint', 'Each radar shows the Foundation Score per pillar for that country.')}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {withData.map((s) => (
          <CountryRadarCard key={s.countryId} summary={s} />
        ))}
      </div>
    </div>
  )
}

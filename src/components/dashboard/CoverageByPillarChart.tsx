import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import type { PillarCoverageRow } from '../../types'

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

export function CoverageByPillarChart({ rows }: { rows: PillarCoverageRow[] }) {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        {t('common.noData')}
      </div>
    )
  }

  const withPlanLabel    = t('dashboard.coverage.withPlan')
  const withoutPlanLabel = t('dashboard.coverage.withoutPlan')

  const data = rows.map((r) => ({
    name: PILLAR_SHORT[r.pillarName] ?? r.pillarName,
    fullName: t(`pillar.${r.pillarName}`),
    [withPlanLabel]:    r.withPlan,
    [withoutPlanLabel]: r.withoutPlan,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || _label}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey={withPlanLabel}    stackId="a" fill="#10b981" />
        <Bar dataKey={withoutPlanLabel} stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

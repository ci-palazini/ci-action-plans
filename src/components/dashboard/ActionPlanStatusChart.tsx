import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import type { CountrySummary } from '../../types'

export function ActionPlanStatusChart({ summaries }: { summaries: CountrySummary[] }) {
  const { t } = useTranslation()

  const data = summaries
    .filter((s) => s.actionPlansOpen + s.actionPlansInProgress + s.actionPlansCompleted > 0)
    .map((s) => ({
      name: s.countryName,
      [t('actionPlan.status_open')]:        s.actionPlansOpen,
      [t('actionPlan.status_in_progress')]: s.actionPlansInProgress,
      [t('actionPlan.status_completed')]:   s.actionPlansCompleted,
    }))

  if (data.length === 0) return (
    <div className="flex h-48 items-center justify-center text-sm text-slate-400">
      {t('common.noData')}
    </div>
  )

  const openKey        = t('actionPlan.status_open')
  const inProgressKey  = t('actionPlan.status_in_progress')
  const completedKey   = t('actionPlan.status_completed')

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey={openKey}       fill="#ef4444" radius={[3, 3, 0, 0]} />
        <Bar dataKey={inProgressKey} fill="#f59e0b" radius={[3, 3, 0, 0]} />
        <Bar dataKey={completedKey}  fill="#10b981" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

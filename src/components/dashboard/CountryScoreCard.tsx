import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Upload } from 'lucide-react'
import { Flag } from '../ui/Flag'
import type { CountrySummary } from '../../types'

function ScoreRing({ score, size = 84 }: { score: number; size?: number }) {
  const sw = 7
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(Math.max(score, 0), 100) / 100) * circ
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
  const track = score >= 90 ? '#d1fae5' : score >= 70 ? '#fef3c7' : '#fee2e2'
  const cx = size / 2
  const cy = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  )
}

export function CountryScoreCard({ summary }: { summary: CountrySummary }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { avgScore, hasAssessment } = summary
  const color = avgScore >= 90 ? '#10b981' : avgScore >= 70 ? '#f59e0b' : '#ef4444'

  return (
    <div
      onClick={() => navigate(`/countries/${summary.countryId}`)}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      {/* Country header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Flag countryId={summary.countryId} className="h-4 w-auto flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate leading-tight">
            {summary.countryName}
          </span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-1" />
      </div>

      {hasAssessment ? (
        <>
          {/* Score ring */}
          <div className="flex items-center justify-center my-2">
            <div className="relative" style={{ width: 84, height: 84 }}>
              <ScoreRing score={avgScore} size={84} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono-data text-lg font-bold tabular-nums leading-none" style={{ color }}>
                  {Math.round(avgScore)}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{t('level.FOUNDATION')}</span>
              </div>
            </div>
          </div>

        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
            <Upload className="h-5 w-5 text-slate-300" />
          </div>
          <span className="text-xs text-slate-400">{t('dashboard.noAssessment')}</span>
        </div>
      )}
    </div>
  )
}

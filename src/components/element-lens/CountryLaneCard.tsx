import { Link } from 'react-router-dom'
import { ArrowRight, UserCircle2, CalendarDays, CheckCircle2 } from 'lucide-react'
import { Flag } from '../ui/Flag'
import { formatDate } from '../../lib/utils'
import type { CountryLensRow } from '../../hooks/useElementLens'

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return null
  const pct = Math.min(Math.max(score, 0), 100)
  const color = score >= 100 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return null
  const cls =
    score >= 100
      ? 'bg-emerald-50 text-emerald-700'
      : score >= 70
        ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-700'
  return (
    <span className={`ml-auto font-mono-data text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${cls}`}>
      {score}%
    </span>
  )
}

export function CountryLaneCard({ row }: { row: CountryLensRow }) {
  const description = row.plan?.problem_description_en || row.plan?.problem_description
  const actions = row.plan?.proposed_actions_en || row.plan?.proposed_actions
  const noGap = (row.score ?? 0) >= 100

  if (noGap) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Flag countryId={row.countryId} className="rounded-sm" />
          <span className="font-semibold text-slate-800 text-sm">{row.countryName}</span>
          <ScorePill score={row.score} />
        </div>
        <ScoreBar score={row.score} />
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Already at foundation level
        </div>
      </div>
    )
  }

  if (!row.plan) {
    return (
      <div className="bg-white/60 rounded-2xl border border-dashed border-slate-200 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Flag countryId={row.countryId} className="rounded-sm opacity-70" />
          <span className="font-semibold text-slate-500 text-sm">{row.countryName}</span>
          <ScorePill score={row.score} />
        </div>
        <ScoreBar score={row.score} />
        <p className="text-xs text-slate-400 italic">No action plan yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2.5">
        <Flag countryId={row.countryId} className="rounded-sm" />
        <span className="font-semibold text-slate-800 text-sm">{row.countryName}</span>
        <ScorePill score={row.score} />
      </div>

      <ScoreBar score={row.score} />

      {description && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">The Problem</p>
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">{description}</p>
        </div>
      )}

      {actions && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-400 mb-1.5">What We Will Do</p>
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">{actions}</p>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          {row.plan.responsible_person && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <UserCircle2 className="h-3 w-3 shrink-0" />
              {row.plan.responsible_person}
            </span>
          )}
          {row.plan.deadline && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="h-3 w-3 shrink-0" />
              {formatDate(row.plan.deadline)}
            </span>
          )}
        </div>
        <Link
          to={`/countries/${row.plan.country_id}/action-plans/${row.plan.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 transition-colors"
        >
          View plan <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

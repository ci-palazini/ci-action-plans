import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Cell,
  Tooltip,
} from 'recharts'
import { useElementLens } from '../hooks/useElementLens'
import { CountryLaneCard } from '../components/element-lens/CountryLaneCard'
import { Spinner } from '../components/ui/Spinner'
import { PILLARS, PILLAR_COLORS, COUNTRIES } from '../lib/constants'
import { cn } from '../lib/utils'

type Filter = 'all' | 'with-plan' | 'no-plan'

function scoreBarFill(score: number | null): string {
  if (score === null) return '#cbd5e1'
  if (score >= 100) return '#10b981'
  if (score >= 70) return '#f59e0b'
  return '#ef4444'
}

export function ElementLensPage() {
  const { pillarName: rawPillar, elementName: rawElement } = useParams<{
    pillarName: string
    elementName: string
  }>()

  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [sortAsc, setSortAsc] = useState(true)

  const pillarName = rawPillar ?? ''
  const elementName = rawElement ?? ''

  const { rows, isLoading } = useElementLens(pillarName, elementName)

  const pillarIndex = (PILLARS as readonly string[]).indexOf(pillarName)
  const pillarColor = pillarIndex >= 0 ? PILLAR_COLORS[pillarIndex] : '#6366f1'

  const assessedCount = rows.length
  const withPlanCount = rows.filter((r) => r.plan !== null).length

  const filtered = rows
    .filter((r) => {
      if (filter === 'with-plan') return r.plan !== null
      if (filter === 'no-plan') return r.plan === null
      return true
    })
    .sort((a, b) => {
      const sa = a.score ?? -1
      const sb = b.score ?? -1
      return sortAsc ? sa - sb : sb - sa
    })

  const chartData = [...rows]
    .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
    .map((r) => ({
      name: COUNTRIES.find((c) => c.id === r.countryId)?.name ?? r.countryId,
      score: r.score ?? 0,
    }))

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  if (!isLoading && rows.length === 0) {
    return (
      <div className="min-h-full p-5 lg:p-7" style={{ background: '#f7f4ef' }}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-center py-24 text-slate-400">
            <Layers className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="text-base font-medium text-slate-500 mb-1">{elementName}</p>
            <p className="text-sm">No countries have been assessed on this element yet.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-5 lg:p-7" style={{ background: '#f7f4ef' }}>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 rounded-xl p-2 text-slate-500 hover:bg-white hover:shadow-sm transition-all shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${pillarColor}1a`, color: pillarColor }}
              >
                {pillarName}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">{elementName}</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {assessedCount} {assessedCount === 1 ? 'country' : 'countries'} assessed
              {' · '}
              {withPlanCount} with action {withPlanCount === 1 ? 'plan' : 'plans'}
            </p>
          </div>
        </div>

        {/* Score Panorama */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-4">
              Foundation Score by Country
            </p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData} margin={{ top: 4, right: 32, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Outfit, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 120]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Outfit, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value ?? 0}%`, 'Score']}
                  contentStyle={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <ReferenceLine
                  y={100}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Foundation target',
                    position: 'right',
                    fontSize: 10,
                    fill: '#10b981',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={scoreBarFill(entry.score)} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filter + Sort row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white/70 rounded-xl p-1 gap-1 shadow-sm border border-white/80">
            {(['all', 'with-plan', 'no-plan'] as Filter[]).map((f) => {
              const labels: Record<Filter, string> = {
                all: 'All',
                'with-plan': 'With plan',
                'no-plan': 'No plan yet',
              }
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                    filter === f
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700',
                  )}
                >
                  {labels[f]}
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
            <span className="mr-1">Sort:</span>
            <button
              onClick={() => setSortAsc(true)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-semibold transition-all',
                sortAsc ? 'bg-white shadow-sm text-slate-800 border border-slate-200' : 'hover:text-slate-600',
              )}
            >
              Worst first
            </button>
            <button
              onClick={() => setSortAsc(false)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-semibold transition-all',
                !sortAsc ? 'bg-white shadow-sm text-slate-800 border border-slate-200' : 'hover:text-slate-600',
              )}
            >
              Best first
            </button>
          </div>
        </div>

        {/* Country Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Layers className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No countries match this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
            {filtered.map((row) => (
              <CountryLaneCard key={row.countryId} row={row} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

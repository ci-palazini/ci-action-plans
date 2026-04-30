import { useTranslation } from 'react-i18next'
import { groupByPillar } from '../../lib/csvParser'
import { ScoreBadge } from '../assessment/ScoreBadge'
import { PILLAR_COLORS, PILLARS } from '../../lib/constants'
import type { ParsedElement } from '../../lib/csvParser'

const PILLAR_INDEX = PILLARS.reduce<Record<string, number>>((acc, p, i) => ({ ...acc, [p]: i }), {})

export function ParsePreview({ elements }: { elements: ParsedElement[] }) {
  const { t } = useTranslation()
  const grouped = groupByPillar(elements)

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {Array.from(grouped.entries()).map(([pillar, els]) => {
        const color = PILLAR_COLORS[PILLAR_INDEX[pillar] ?? 0]
        return (
          <div key={pillar} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <p className="text-sm font-semibold text-slate-800">{t(`pillar.${pillar}`)}</p>
              <span className="ml-auto text-xs text-slate-500">{els.length} elements</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-2 text-left font-medium">Element</th>
                  <th className="px-4 py-2 text-center font-medium">Foundation</th>
                  <th className="px-4 py-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {els.map((el) => (
                  <tr key={el.elementName} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-800">{el.elementName}</td>
                    <td className="px-4 py-2.5 text-center">
                      <ScoreBadge score={el.foundationScore} />
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-slate-500">
                      {el.foundationStatus ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

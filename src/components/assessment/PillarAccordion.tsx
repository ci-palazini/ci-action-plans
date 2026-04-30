import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { ElementRow } from './ElementRow'
import { cn } from '../../lib/utils'
import { PILLARS, PILLAR_COLORS } from '../../lib/constants'
import { useElementDefinitions } from '../../hooks/useElementDefinitions'
import type { AssessmentElement } from '../../types'

const PILLAR_INDEX = PILLARS.reduce<Record<string, number>>(
  (acc, p, i) => ({ ...acc, [p]: i }),
  {},
)

export function PillarAccordion({
  pillarName,
  elements,
  canEdit,
  defaultOpen = false,
}: {
  pillarName: string
  elements: AssessmentElement[]
  canEdit: boolean
  defaultOpen?: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(defaultOpen)
  const { data: definitions = {} } = useElementDefinitions()
  const scores = elements.map((e) => e.foundation_score).filter((s): s is number => s !== null)
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const belowCount = elements.filter((e) => (e.foundation_score ?? 0) < 100).length
  const color = PILLAR_COLORS[PILLAR_INDEX[pillarName] ?? 0]

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-slate-900">{t(`pillar.${pillarName}`)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{elements.length} {t('upload.elementCount', { count: elements.length }).replace(/^\d+ /, '')}</p>
        </div>
        <div className="flex items-center gap-3">
          {belowCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-3 w-3" />
              {belowCount}
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${avg}%`, backgroundColor: avg >= 100 ? '#10b981' : avg >= 70 ? '#f59e0b' : '#ef4444' }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums w-10 text-right" style={{ color }}>
              {Math.round(avg)}%
            </span>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {elements.map((el) => (
            <ElementRow key={el.id} element={el} canEdit={canEdit} definition={definitions[el.element_name]} />
          ))}
        </div>
      )}
    </div>
  )
}

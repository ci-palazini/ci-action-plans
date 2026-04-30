import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ChevronRight, Info, Globe } from 'lucide-react'
import { ScoreBadge } from './ScoreBadge'
import { LevelStatusChip } from './LevelStatusChip'
import { ActionPlanModal } from '../action-plans/ActionPlanModal'
import { ActionPlanCard } from '../action-plans/ActionPlanCard'
import { useElementActionPlans } from '../../hooks/useActionPlans'
import type { AssessmentElement, ElementDefinition } from '../../types'

export function ElementRow({
  element,
  canEdit,
  definition,
}: {
  element: AssessmentElement
  canEdit: boolean
  definition?: ElementDefinition
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [defOpen, setDefOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const needsActionPlan = (element.foundation_score ?? 0) < 100
  const { data: plans = [] } = useElementActionPlans(
    element.country_id,
    element.pillar_name,
    element.element_name,
  )

  useEffect(() => {
    if (!defOpen) return
    const handler = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) {
        setDefOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [defOpen])

  const behaviour = definition?.explanation_en || definition?.criteria?.behaviour
  const foundationCriteria = definition?.criteria?.maturity_levels?.FOUNDATION

  return (
    <>
      <div className="group">
        <div
          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => needsActionPlan && setExpanded((v) => !v)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-slate-800 truncate">{element.element_name}</p>
              {definition && (behaviour || foundationCriteria) && (
                <div className="relative flex-shrink-0" ref={popoverRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDefOpen(v => !v) }}
                    className="rounded p-0.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 transition-colors"
                    title="View definition"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  {defOpen && (
                    <div className="absolute left-0 top-6 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                      <div className="p-4 space-y-3">
                        {behaviour && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Behaviour</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{behaviour}</p>
                          </div>
                        )}
                        {foundationCriteria && (
                          <div>
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Foundation Criteria</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{foundationCriteria}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <LevelStatusChip status={element.foundation_status} />
            </div>
          </div>

          <ScoreBadge score={element.foundation_score} />

          {needsActionPlan && (
            <div className="flex items-center gap-2">
              {plans.length > 0 && (
                <>
                  <span className="text-xs text-slate-500">{plans.length} PA</span>
                  <Link
                    to={`/elements/${encodeURIComponent(element.pillar_name)}/${encodeURIComponent(element.element_name)}`}
                    onClick={(e) => e.stopPropagation()}
                    title="Compare across countries"
                    className="rounded-md p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
              {canEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); setModalOpen(true) }}
                  className="rounded-md p-1 text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title={t('actionPlan.new')}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <ChevronRight
                className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </div>
          )}
        </div>

        {expanded && plans.length > 0 && (
          <div className="px-4 pb-3 space-y-2 bg-slate-50">
            {plans.map((p) => (
              <ActionPlanCard key={p.id} plan={p} canEdit={canEdit} />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <ActionPlanModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          countryId={element.country_id}
          pillarName={element.pillar_name}
          elementName={element.element_name}
        />
      )}
    </>
  )
}

import { useQuery } from '@tanstack/react-query'
import { getAllElements } from '../services/assessmentService'
import { getAllActionPlanCounts, getActionPlanKeys } from '../services/actionPlanService'
import { COUNTRIES, PILLARS, isoToFlagEmoji } from '../lib/constants'
import type { CountrySummary, PillarSummary, CoverageStats, CountryCoverageRow, PillarCoverageRow } from '../types'

export function useDashboard() {
  const elementsQuery = useQuery({
    queryKey: ['dashboard', 'elements'],
    queryFn: getAllElements,
  })

  const plansQuery = useQuery({
    queryKey: ['dashboard', 'plans'],
    queryFn: getAllActionPlanCounts,
  })

  const planKeysQuery = useQuery({
    queryKey: ['dashboard', 'planKeys'],
    queryFn: getActionPlanKeys,
  })

  const isLoading = elementsQuery.isLoading || plansQuery.isLoading || planKeysQuery.isLoading
  const error = elementsQuery.error ?? plansQuery.error ?? planKeysQuery.error

  const summaries: CountrySummary[] = COUNTRIES.map((country) => {
    const elements = (elementsQuery.data ?? []).filter((e) => e.country_id === country.id)
    const counts = (plansQuery.data ?? []).filter((c) => c.country_id === country.id)

    const pillarMap = new Map<string, typeof elements>()
    for (const el of elements) {
      const arr = pillarMap.get(el.pillar_name) ?? []
      arr.push(el)
      pillarMap.set(el.pillar_name, arr)
    }

    const pillars: PillarSummary[] = PILLARS.map((p) => {
      const els = pillarMap.get(p) ?? []
      const scores = els.map((e) => e.foundation_score).filter((s): s is number => s !== null)
      return {
        pillarName: p,
        avgScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        elementCount: els.length,
        belowHundredCount: els.filter((e) => (e.foundation_score ?? 0) < 100).length,
      }
    })

    const allScores = elements.map((e) => e.foundation_score).filter((s): s is number => s !== null)
    const avgScore = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0

    return {
      countryId: country.id,
      countryName: country.name,
      flagEmoji: isoToFlagEmoji(country.iso),
      avgScore,
      pillars,
      actionPlansOpen:       counts.find((c) => c.status === 'open')?.count ?? 0,
      actionPlansInProgress: counts.find((c) => c.status === 'in_progress')?.count ?? 0,
      actionPlansCompleted:  counts.find((c) => c.status === 'completed')?.count ?? 0,
      hasAssessment: elements.length > 0,
    }
  })

  const globalAvg = (() => {
    const all = summaries.filter((s) => s.hasAssessment)
    if (!all.length) return 0
    return all.reduce((a, s) => a + s.avgScore, 0) / all.length
  })()

  const totalOpen      = summaries.reduce((a, s) => a + s.actionPlansOpen, 0)
  const totalCompleted = summaries.reduce((a, s) => a + s.actionPlansCompleted, 0)
  const countriesWithData = summaries.filter((s) => s.hasAssessment).length

  const coverageStats: CoverageStats = (() => {
    const elements = elementsQuery.data ?? []
    const planKeys = planKeysQuery.data ?? []

    const planKeySet = new Set(
      planKeys.map((k) => `${k.country_id}|${k.pillar_name}|${k.element_name}`)
    )

    const byCountry: CountryCoverageRow[] = COUNTRIES.map((country) => {
      const needs = elements.filter(
        (e) => e.country_id === country.id && (e.foundation_score ?? 0) < 100
      )
      const withPlan = needs.filter((e) =>
        planKeySet.has(`${e.country_id}|${e.pillar_name}|${e.element_name}`)
      ).length
      const needsPlan = needs.length
      return {
        countryId: country.id,
        countryName: country.name,
        flagEmoji: isoToFlagEmoji(country.iso),
        needsPlan,
        withPlan,
        withoutPlan: needsPlan - withPlan,
        coveragePct: needsPlan === 0 ? 0 : Math.round((withPlan / needsPlan) * 100),
      }
    }).filter((r) => r.needsPlan > 0)

    const byPillar: PillarCoverageRow[] = PILLARS.map((pillarName) => {
      const needs = elements.filter(
        (e) => e.pillar_name === pillarName && (e.foundation_score ?? 0) < 100
      )
      const withPlan = needs.filter((e) =>
        planKeySet.has(`${e.country_id}|${e.pillar_name}|${e.element_name}`)
      ).length
      return { pillarName, withPlan, withoutPlan: needs.length - withPlan }
    }).filter((r) => r.withPlan + r.withoutPlan > 0)

    const totalNeedsPlan = byCountry.reduce((a, r) => a + r.needsPlan, 0)
    const totalWithPlan  = byCountry.reduce((a, r) => a + r.withPlan, 0)
    return {
      globalCoveragePct: totalNeedsPlan === 0 ? 0 : Math.round((totalWithPlan / totalNeedsPlan) * 100),
      globalUncoveredCount: totalNeedsPlan - totalWithPlan,
      byCountry,
      byPillar,
    }
  })()

  return { summaries, globalAvg, totalOpen, totalCompleted, countriesWithData, coverageStats, isLoading, error }
}

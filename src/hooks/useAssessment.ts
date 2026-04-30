import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAssessment, getAssessmentElements, uploadAssessment } from '../services/assessmentService'
import { getCountryActionPlanKeys } from '../services/actionPlanService'
import { type ParsedElement, groupByPillar, pillarAvgScore } from '../lib/csvParser'
import type { PillarSummary, CountryActionPlanCoverage, PillarCoverageRow } from '../types'
import { PILLARS } from '../lib/constants'

export function useAssessment(countryId: string) {
  return useQuery({
    queryKey: ['assessments', countryId],
    queryFn: () => getAssessment(countryId),
    enabled: !!countryId,
  })
}

export function useAssessmentElements(countryId: string) {
  return useQuery({
    queryKey: ['assessment-elements', countryId],
    queryFn: () => getAssessmentElements(countryId),
    enabled: !!countryId,
  })
}

export function usePillarSummaries(countryId: string): PillarSummary[] {
  const { data: elements = [] } = useAssessmentElements(countryId)
  const grouped = new Map<string, typeof elements>()
  for (const el of elements) {
    const arr = grouped.get(el.pillar_name) ?? []
    arr.push(el)
    grouped.set(el.pillar_name, arr)
  }
  return Array.from(grouped.entries()).map(([pillarName, els]) => {
    const scores = els.map((e) => e.foundation_score).filter((s): s is number => s !== null)
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    return {
      pillarName,
      avgScore: avg,
      elementCount: els.length,
      belowHundredCount: els.filter((e) => (e.foundation_score ?? 0) < 100).length,
    }
  })
}

export function useCountryCoverage(countryId: string): CountryActionPlanCoverage {
  const { data: elements = [] } = useAssessmentElements(countryId)
  const { data: planKeys = [] } = useQuery({
    queryKey: ['action-plans', countryId, 'keys'],
    queryFn: () => getCountryActionPlanKeys(countryId),
    enabled: !!countryId,
  })

  const planKeySet = new Set(
    planKeys.map((k) => `${k.pillar_name}|${k.element_name}`)
  )

  const byPillar: PillarCoverageRow[] = PILLARS.map((pillarName) => {
    const needs = elements.filter(
      (e) => e.pillar_name === pillarName && (e.foundation_score ?? 0) < 100
    )
    const withPlan = needs.filter((e) =>
      planKeySet.has(`${e.pillar_name}|${e.element_name}`)
    ).length
    return { pillarName, withPlan, withoutPlan: needs.length - withPlan }
  }).filter((r) => r.withPlan + r.withoutPlan > 0)

  const totalNeedsPlan = byPillar.reduce((a, r) => a + r.withPlan + r.withoutPlan, 0)
  const totalWithPlan  = byPillar.reduce((a, r) => a + r.withPlan, 0)

  return {
    totalNeedsPlan,
    totalWithPlan,
    totalWithoutPlan: totalNeedsPlan - totalWithPlan,
    coveragePct: totalNeedsPlan === 0 ? 0 : Math.round((totalWithPlan / totalNeedsPlan) * 100),
    byPillar,
  }
}

export function useUploadAssessment(countryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      fileName,
      uploadedBy,
      elements,
    }: { fileName: string; uploadedBy: string; elements: ParsedElement[] }) =>
      uploadAssessment(countryId, fileName, uploadedBy, elements),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments', countryId] })
      qc.invalidateQueries({ queryKey: ['assessment-elements', countryId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export { groupByPillar, pillarAvgScore }

import { useQuery } from '@tanstack/react-query'
import { getElementPlansAllCountries } from '../services/actionPlanService'
import { getElementScoresAllCountries } from '../services/assessmentService'
import { COUNTRIES } from '../lib/constants'
import type { ActionPlan, AssessmentElement } from '../types'

export type CountryLensRow = {
  countryId: string
  countryName: string
  score: number | null
  element: AssessmentElement | null
  plan: ActionPlan | null
}

export function useElementLens(pillarName: string, elementName: string) {
  const enabled = !!pillarName && !!elementName

  const plansQuery = useQuery({
    queryKey: ['element-lens-plans', pillarName, elementName],
    queryFn: () => getElementPlansAllCountries(pillarName, elementName),
    enabled,
  })

  const scoresQuery = useQuery({
    queryKey: ['element-lens-scores', pillarName, elementName],
    queryFn: () => getElementScoresAllCountries(pillarName, elementName),
    enabled,
  })

  const rows: CountryLensRow[] = COUNTRIES
    .filter((c) => scoresQuery.data?.some((e) => e.country_id === c.id))
    .map((country) => {
      const element = scoresQuery.data?.find((e) => e.country_id === country.id) ?? null
      const plan = plansQuery.data?.find((p) => p.country_id === country.id) ?? null
      return {
        countryId: country.id,
        countryName: country.name,
        score: element?.foundation_score ?? null,
        element,
        plan,
      }
    })

  return {
    rows,
    isLoading: plansQuery.isLoading || scoresQuery.isLoading,
  }
}

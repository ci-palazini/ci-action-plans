import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActionPlans,
  getElementActionPlans,
  createActionPlan,
  updateActionPlan,
  deleteActionPlan,
  type ActionPlanContentUpdate,
} from '../services/actionPlanService'
import type { ActionPlan } from '../types'

export function useActionPlans(countryId?: string) {
  return useQuery({
    queryKey: ['action-plans', countryId ?? 'all'],
    queryFn: () => getActionPlans(countryId),
  })
}

export function useElementActionPlans(countryId: string, pillarName: string, elementName: string) {
  return useQuery({
    queryKey: ['action-plans', countryId, pillarName, elementName],
    queryFn: () => getElementActionPlans(countryId, pillarName, elementName),
    enabled: !!countryId && !!pillarName && !!elementName,
  })
}

export function useCreateActionPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (
      plan: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at' | 'progress_pct'>,
    ) => createActionPlan(plan),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['action-plans'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({
        queryKey: ['action-plans', data.country_id, data.pillar_name, data.element_name],
      })
    },
  })
}

export function useUpdateActionPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
      authorId,
    }: {
      id: string
      updates: ActionPlanContentUpdate
      authorId?: string
    }) => updateActionPlan(id, updates, authorId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['action-plans'] })
      qc.invalidateQueries({ queryKey: ['action-plan', data.id] })
      qc.invalidateQueries({ queryKey: ['action-plan-activity', data.id] })
      qc.invalidateQueries({
        queryKey: ['action-plans', data.country_id, data.pillar_name, data.element_name],
      })
    },
  })
}

export function useDeleteActionPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteActionPlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['action-plans'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActionPlanById,
  updateActionPlanStatus,
  updateActionPlanPriority,
} from '../services/actionPlanService'
import { fanOutNotification } from '../services/notificationService'
import { listActivity } from '../services/actionPlanActivityService'
import { useAuth } from '../contexts/AuthContext'
import type { ActionStatus, ActionPriority } from '../types'

export function useActionPlan(planId: string | undefined) {
  return useQuery({
    queryKey: ['action-plan', planId],
    queryFn: () => getActionPlanById(planId as string),
    enabled: !!planId,
  })
}

// Após uma mudança que registra evento (status_changed/priority_changed),
// busca a activity recém-criada para então fan-outar notificações.
async function fanOutLatestEvent(
  planId: string,
  type: 'status_changed' | 'priority_changed',
  authorId: string,
  authorIsGlobalAdmin: boolean,
) {
  const [plan, activity] = await Promise.all([getActionPlanById(planId), listActivity(planId)])
  const latest = activity.find((a) => a.type === type)
  if (!plan || !latest) return
  await fanOutNotification({
    plan: { id: plan.id, country_id: plan.country_id, responsible_person: plan.responsible_person },
    activityId: latest.id,
    type,
    authorId,
    authorIsGlobalAdmin,
  })
}

export function useUpdateActionPlanStatus() {
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async ({ id, status, authorId }: { id: string; status: ActionStatus; authorId: string }) => {
      const updated = await updateActionPlanStatus(id, status, authorId)
      const isGlobalAdmin = profile?.role === 'admin' && profile?.country_id === null
      await fanOutLatestEvent(id, 'status_changed', authorId, isGlobalAdmin)
      return updated
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['action-plan', data.id] })
      qc.invalidateQueries({ queryKey: ['action-plan-activity', data.id] })
      qc.invalidateQueries({ queryKey: ['action-plans'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateActionPlanPriority() {
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async ({ id, priority, authorId }: { id: string; priority: ActionPriority; authorId: string }) => {
      const updated = await updateActionPlanPriority(id, priority, authorId)
      const isGlobalAdmin = profile?.role === 'admin' && profile?.country_id === null
      await fanOutLatestEvent(id, 'priority_changed', authorId, isGlobalAdmin)
      return updated
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['action-plan', data.id] })
      qc.invalidateQueries({ queryKey: ['action-plan-activity', data.id] })
      qc.invalidateQueries({ queryKey: ['action-plans'] })
    },
  })
}

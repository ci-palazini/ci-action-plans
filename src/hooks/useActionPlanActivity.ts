import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listActivity, addComment } from '../services/actionPlanActivityService'
import { fanOutNotification } from '../services/notificationService'
import { getActionPlanById } from '../services/actionPlanService'
import { useAuth } from '../contexts/AuthContext'

export function useActionPlanActivity(planId: string | undefined) {
  return useQuery({
    queryKey: ['action-plan-activity', planId],
    queryFn: () => listActivity(planId as string),
    enabled: !!planId,
  })
}

export function useAddComment(planId: string) {
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async ({ authorId, content }: { authorId: string; content: string }) => {
      const activity = await addComment(planId, authorId, content)
      const plan = await getActionPlanById(planId)
      if (plan) {
        await fanOutNotification({
          plan: { id: plan.id, country_id: plan.country_id, responsible_person: plan.responsible_person },
          activityId: activity.id,
          type: 'comment',
          authorId,
          authorIsGlobalAdmin: profile?.role === 'admin' && profile?.country_id === null,
        })
      }
      return activity
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['action-plan-activity', planId] })
    },
  })
}

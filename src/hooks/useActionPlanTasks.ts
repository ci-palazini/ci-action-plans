import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listTasks,
  createTask,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  reorderTasks,
} from '../services/actionPlanTaskService'
import type { ActionPlanTask } from '../types'

const taskKey = (planId: string) => ['action-plan-tasks', planId] as const

export function useActionPlanTasks(planId: string | undefined) {
  return useQuery({
    queryKey: taskKey(planId ?? ''),
    queryFn: () => listTasks(planId as string),
    enabled: !!planId,
  })
}

function invalidatePlanCaches(qc: ReturnType<typeof useQueryClient>, planId: string) {
  qc.invalidateQueries({ queryKey: taskKey(planId) })
  qc.invalidateQueries({ queryKey: ['action-plan', planId] })
  qc.invalidateQueries({ queryKey: ['action-plan-activity', planId] })
  qc.invalidateQueries({ queryKey: ['action-plans'] })
}

export function useCreateTask(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { title: string; created_by: string }) =>
      createTask({ action_plan_id: planId, ...input }),
    onSuccess: () => invalidatePlanCaches(qc, planId),
  })
}

export function useToggleTask(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ task, userId }: { task: ActionPlanTask; userId: string }) => toggleTask(task, userId),
    onSuccess: () => invalidatePlanCaches(qc, planId),
  })
}

export function useUpdateTaskTitle(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) => updateTaskTitle(taskId, title),
    onSuccess: () => invalidatePlanCaches(qc, planId),
  })
}

export function useDeleteTask(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ task, userId }: { task: ActionPlanTask; userId: string }) => deleteTask(task, userId),
    onSuccess: () => invalidatePlanCaches(qc, planId),
  })
}

export function useReorderTasks(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderTasks(planId, orderedIds),
    onSuccess: () => invalidatePlanCaches(qc, planId),
  })
}

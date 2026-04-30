import { supabase } from '../lib/supabase'
import type { ActionPlanTask } from '../types'
import { recordEvent } from './actionPlanActivityService'

export async function listTasks(planId: string): Promise<ActionPlanTask[]> {
  const { data, error } = await supabase
    .from('action_plan_tasks')
    .select('*')
    .eq('action_plan_id', planId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ActionPlanTask[]
}

export async function createTask(input: {
  action_plan_id: string
  title: string
  created_by: string
  position?: number
}): Promise<ActionPlanTask> {
  let nextPos = input.position
  if (nextPos === undefined) {
    const { data: last } = await supabase
      .from('action_plan_tasks')
      .select('position')
      .eq('action_plan_id', input.action_plan_id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()
    nextPos = (last?.position ?? -1) + 1
  }

  const { data, error } = await supabase
    .from('action_plan_tasks')
    .insert({
      action_plan_id: input.action_plan_id,
      title: input.title,
      created_by: input.created_by,
      position: nextPos,
    })
    .select()
    .single()
  if (error) throw error

  await recordEvent(input.action_plan_id, input.created_by, 'task_added', { title: input.title })
  return data as ActionPlanTask
}

export async function toggleTask(task: ActionPlanTask, userId: string): Promise<ActionPlanTask> {
  const nextDone = !task.done
  const { data, error } = await supabase
    .from('action_plan_tasks')
    .update({
      done: nextDone,
      completed_by: nextDone ? userId : null,
      completed_at: nextDone ? new Date().toISOString() : null,
    })
    .eq('id', task.id)
    .select()
    .single()
  if (error) throw error

  await recordEvent(
    task.action_plan_id,
    userId,
    nextDone ? 'task_completed' : 'task_reopened',
    { title: task.title },
  )
  return data as ActionPlanTask
}

export async function updateTaskTitle(taskId: string, title: string): Promise<ActionPlanTask> {
  const { data, error } = await supabase
    .from('action_plan_tasks')
    .update({ title })
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data as ActionPlanTask
}

export async function deleteTask(task: ActionPlanTask, userId: string): Promise<void> {
  const { error } = await supabase.from('action_plan_tasks').delete().eq('id', task.id)
  if (error) throw error

  await recordEvent(task.action_plan_id, userId, 'task_removed', { title: task.title })
}

export async function reorderTasks(planId: string, orderedIds: string[]): Promise<void> {
  // Atualiza position em sequência. Loop simples — a lista de tasks por plano é pequena.
  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from('action_plan_tasks').update({ position: idx }).eq('id', id).eq('action_plan_id', planId),
    ),
  )
}

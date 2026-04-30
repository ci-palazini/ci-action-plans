import { supabase } from '../lib/supabase'
import type { ActionPlan, ActionStatus, ActionPriority } from '../types'
import { recordEvent } from './actionPlanActivityService'

export async function getActionPlans(countryId?: string): Promise<ActionPlan[]> {
  let query = supabase.from('action_plans').select('*').order('created_at', { ascending: false })
  if (countryId) query = query.eq('country_id', countryId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getActionPlanById(id: string): Promise<ActionPlan | null> {
  const { data, error } = await supabase.from('action_plans').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getElementActionPlans(
  countryId: string,
  pillarName: string,
  elementName: string,
): Promise<ActionPlan[]> {
  const { data, error } = await supabase
    .from('action_plans')
    .select('*')
    .eq('country_id', countryId)
    .eq('pillar_name', pillarName)
    .eq('element_name', elementName)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createActionPlan(
  plan: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at' | 'progress_pct'> & { priority?: ActionPriority },
): Promise<ActionPlan> {
  const { data, error } = await supabase.from('action_plans').insert(plan).select().single()
  if (error) throw error

  // Evento de criação na timeline (fire-and-forget para a UI; falha aqui não invalida o plano).
  try {
    await recordEvent(data.id, plan.created_by, 'plan_created', null)
  } catch {
    /* ignore */
  }
  return data
}

export type ActionPlanContentUpdate = Partial<
  Pick<
    ActionPlan,
    'problem_description' | 'proposed_actions' | 'problem_description_en' | 'proposed_actions_en' |
    'responsible_person' | 'deadline'
  >
>

export async function updateActionPlan(
  id: string,
  updates: ActionPlanContentUpdate,
  authorId?: string,
): Promise<ActionPlan> {
  const { data: prev } = await supabase
    .from('action_plans')
    .select('responsible_person, deadline')
    .eq('id', id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('action_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  // Eventos automáticos para campos cujas mudanças interessam à timeline.
  if (authorId && prev) {
    if (updates.responsible_person !== undefined && updates.responsible_person !== prev.responsible_person) {
      await recordEvent(id, authorId, 'responsible_changed', { from: prev.responsible_person, to: updates.responsible_person })
    }
    if (updates.deadline !== undefined && updates.deadline !== prev.deadline) {
      await recordEvent(id, authorId, 'deadline_changed', { from: prev.deadline, to: updates.deadline })
    }
  }
  return data
}

export async function updateActionPlanStatus(
  id: string,
  next: ActionStatus,
  authorId: string,
): Promise<ActionPlan> {
  const { data: prev } = await supabase
    .from('action_plans')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('action_plans')
    .update({ status: next })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  if (prev && prev.status !== next) {
    await recordEvent(id, authorId, 'status_changed', { from: prev.status, to: next })
  }
  return data
}

export async function updateActionPlanPriority(
  id: string,
  next: ActionPriority,
  authorId: string,
): Promise<ActionPlan> {
  const { data: prev } = await supabase
    .from('action_plans')
    .select('priority')
    .eq('id', id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('action_plans')
    .update({ priority: next })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  if (prev && prev.priority !== next) {
    await recordEvent(id, authorId, 'priority_changed', { from: prev.priority, to: next })
  }
  return data
}

export async function deleteActionPlan(id: string): Promise<void> {
  const { error } = await supabase.from('action_plans').delete().eq('id', id)
  if (error) throw error
}

export async function getActionPlanKeys(): Promise<
  { country_id: string; pillar_name: string; element_name: string }[]
> {
  const { data, error } = await supabase
    .from('action_plans')
    .select('country_id, pillar_name, element_name')
  if (error) throw error
  return data ?? []
}

export async function getElementPlansAllCountries(
  pillarName: string,
  elementName: string,
): Promise<ActionPlan[]> {
  const { data, error } = await supabase
    .from('action_plans')
    .select('*')
    .eq('pillar_name', pillarName)
    .eq('element_name', elementName)
    .order('country_id')
  if (error) throw error
  return data ?? []
}

export async function getCountryActionPlanKeys(
  countryId: string,
): Promise<{ pillar_name: string; element_name: string }[]> {
  const { data, error } = await supabase
    .from('action_plans')
    .select('pillar_name, element_name')
    .eq('country_id', countryId)
  if (error) throw error
  return data ?? []
}

export async function getAllActionPlanCounts(): Promise<
  { country_id: string; status: ActionStatus; count: number }[]
> {
  const { data, error } = await supabase
    .from('action_plans')
    .select('country_id, status')
  if (error) throw error

  const counts: Record<string, Record<string, number>> = {}
  for (const row of data ?? []) {
    counts[row.country_id] ??= {}
    counts[row.country_id][row.status] = (counts[row.country_id][row.status] ?? 0) + 1
  }

  return Object.entries(counts).flatMap(([country_id, statuses]) =>
    Object.entries(statuses).map(([status, count]) => ({
      country_id,
      status: status as ActionStatus,
      count,
    })),
  )
}

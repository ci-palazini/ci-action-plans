import { supabase } from '../lib/supabase'
import type { ActionPlanActivity, ActivityType } from '../types'

export async function listActivity(planId: string): Promise<ActionPlanActivity[]> {
  const { data, error } = await supabase
    .from('action_plan_activity')
    .select('*')
    .eq('action_plan_id', planId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ActionPlanActivity[]
}

export async function addComment(planId: string, authorId: string, content: string): Promise<ActionPlanActivity> {
  const { data, error } = await supabase
    .from('action_plan_activity')
    .insert({ action_plan_id: planId, author_id: authorId, type: 'comment', content })
    .select()
    .single()
  if (error) throw error
  return data as ActionPlanActivity
}

export async function recordEvent(
  planId: string,
  authorId: string | null,
  type: Exclude<ActivityType, 'comment'>,
  metadata: Record<string, unknown> | null = null,
): Promise<ActionPlanActivity> {
  const { data, error } = await supabase
    .from('action_plan_activity')
    .insert({ action_plan_id: planId, author_id: authorId, type, metadata })
    .select()
    .single()
  if (error) throw error
  return data as ActionPlanActivity
}

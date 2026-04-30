import type { Profile, ActionPlan } from '../types'

const isGlobalAdmin = (p: Profile | null) => p?.role === 'admin'
const isOwnerOf = (p: Profile | null, countryId: string) =>
  p?.country_id === countryId

// Conteúdo do plano (problema, ações, deadline, responsável) — só dono do país.
// Admin global NÃO edita conteúdo de planos de outros países (mantém ownership do país).
export function canEditPlanContent(profile: Profile | null, plan: Pick<ActionPlan, 'country_id'>) {
  return isOwnerOf(profile, plan.country_id)
}

export function canDeletePlan(profile: Profile | null, plan: Pick<ActionPlan, 'country_id'>) {
  return isOwnerOf(profile, plan.country_id)
}

// Status, prioridade, marcar tarefas e comentar: admin global pode atuar em qualquer país.
export function canChangeStatusOrPriority(profile: Profile | null, plan: Pick<ActionPlan, 'country_id'>) {
  return isGlobalAdmin(profile) || isOwnerOf(profile, plan.country_id)
}

export function canManageTasks(profile: Profile | null, plan: Pick<ActionPlan, 'country_id'>) {
  return isGlobalAdmin(profile) || isOwnerOf(profile, plan.country_id)
}

export function canComment(profile: Profile | null, plan: Pick<ActionPlan, 'country_id'>) {
  return isGlobalAdmin(profile) || isOwnerOf(profile, plan.country_id)
}

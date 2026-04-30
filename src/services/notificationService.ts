import { supabase } from '../lib/supabase'
import type { Notification, ActionPlan, ActivityType } from '../types'

export async function listNotifications(recipientId: string, limit = 20): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Notification[]
}

export async function getUnreadCount(recipientId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .is('read_at', null)
  if (error) throw error
  return count ?? 0
}

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
  if (error) throw error
}

export async function markAllAsRead(recipientId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', recipientId)
    .is('read_at', null)
  if (error) throw error
}

// Fan-out: a partir de uma activity recém-criada, gera notificações para os destinatários relevantes.
//
// Regras:
//   • Comentário/mudança em plano de país → notifica todos os admins globais
//   • Comentário do admin global         → notifica admins do país do plano
//   • Em ambos os casos, tenta notificar também o "responsible_person" se existir um profile com nome correspondente.
//   • Nunca notifica o próprio autor.
export async function fanOutNotification(input: {
  plan: Pick<ActionPlan, 'id' | 'country_id' | 'responsible_person'>
  activityId: string
  type: ActivityType
  authorId: string | null
  authorIsGlobalAdmin: boolean
}) {
  const { plan, activityId, type, authorId, authorIsGlobalAdmin } = input

  // Buscar destinatários candidatos
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role, country_id, full_name')

  if (!profiles) return

  const recipientIds = new Set<string>()

  for (const p of profiles) {
    if (p.id === authorId) continue

    if (authorIsGlobalAdmin) {
      // Admin global agiu → notifica admins do país do plano
      if (p.country_id === plan.country_id) recipientIds.add(p.id)
    } else {
      // País agiu → notifica admins globais
      if (p.role === 'admin' && p.country_id === null) recipientIds.add(p.id)
    }

    // Em qualquer caso: notifica o responsible_person se houver match exato no full_name
    if (
      plan.responsible_person &&
      p.full_name &&
      p.full_name.trim().toLowerCase() === plan.responsible_person.trim().toLowerCase()
    ) {
      recipientIds.add(p.id)
    }
  }

  if (recipientIds.size === 0) return

  const rows = Array.from(recipientIds).map((recipient_id) => ({
    recipient_id,
    action_plan_id: plan.id,
    activity_id: activityId,
    type,
  }))

  const { error } = await supabase.from('notifications').insert(rows)
  if (error) throw error
}

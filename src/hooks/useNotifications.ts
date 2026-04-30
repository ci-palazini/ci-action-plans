import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService'
import { useAuth } from '../contexts/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => listNotifications(user!.id),
    enabled: !!user?.id,
  })

  const unread = useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: () => getUnreadCount(user!.id),
    enabled: !!user?.id,
  })

  // Realtime: invalida na chegada de nova notificação para este usuário
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`notif:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', user.id] })
          qc.invalidateQueries({ queryKey: ['notifications-unread', user.id] })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, qc])

  return { list, unread }
}

export function useMarkRead() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
      qc.invalidateQueries({ queryKey: ['notifications-unread', user?.id] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: () => markAllAsRead(user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
      qc.invalidateQueries({ queryKey: ['notifications-unread', user?.id] })
    },
  })
}

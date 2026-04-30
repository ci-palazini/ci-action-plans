import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useActionPlanActivity } from '../../hooks/useActionPlanActivity'
import { Spinner } from '../ui/Spinner'
import { ActivityItem } from './ActivityItem'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types'

async function fetchProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('profiles').select('*').in('id', ids)
  if (error) throw error
  return (data ?? []) as Profile[]
}

export function ActivityTimeline({ planId }: { planId: string }) {
  const { t } = useTranslation()
  const { data: activity = [], isLoading } = useActionPlanActivity(planId)

  const authorIds = useMemo(() => {
    const set = new Set<string>()
    for (const a of activity) if (a.author_id) set.add(a.author_id)
    return Array.from(set)
  }, [activity])

  const { data: authors = [] } = useQuery({
    queryKey: ['profiles-by-ids', authorIds.join(',')],
    queryFn: () => fetchProfilesByIds(authorIds),
    enabled: authorIds.length > 0,
  })

  const authorById = useMemo(() => {
    const m = new Map<string, Profile>()
    for (const a of authors) m.set(a.id, a)
    return m
  }, [authors])

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="h-6 w-6 text-indigo-600" />
      </div>
    )
  }

  if (activity.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic py-6 text-center border border-dashed border-slate-200 rounded-lg">
        {t('actionPlan.timeline.empty')}
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {activity.map((a) => (
        <ActivityItem key={a.id} activity={a} authorById={authorById} />
      ))}
    </ul>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { TaskItem } from './TaskItem'
import { ProgressBar } from './ProgressBar'
import { useActionPlanTasks, useCreateTask } from '../../hooks/useActionPlanTasks'
import { useAuth } from '../../contexts/AuthContext'

type Props = {
  planId: string
  canManage: boolean
}

export function TaskList({ planId, canManage }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: tasks = [], isLoading } = useActionPlanTasks(planId)
  const createTask = useCreateTask(planId)

  const [draft, setDraft] = useState('')

  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !user) return
    createTask.mutate(
      { title: trimmed, created_by: user.id },
      {
        onSuccess: () => setDraft(''),
      },
    )
  }

  return (
    <div className="space-y-4">
      {total > 0 && <ProgressBar value={pct} total={total} done={done} />}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner className="h-6 w-6 text-indigo-600" />
        </div>
      ) : total === 0 ? (
        <p className="text-sm text-slate-500 italic py-4 text-center border border-dashed border-slate-200 rounded-lg">
          {t('actionPlan.tasks.empty')}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} planId={planId} canManage={canManage} />
          ))}
        </ul>
      )}

      {canManage && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('actionPlan.tasks.addPlaceholder')}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="submit" size="sm" disabled={!draft.trim()} isLoading={createTask.isPending}>
            <Plus className="h-4 w-4" />
            {t('actionPlan.tasks.add')}
          </Button>
        </form>
      )}
    </div>
  )
}

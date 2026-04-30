import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Trash2, X } from 'lucide-react'
import { useToggleTask, useUpdateTaskTitle, useDeleteTask } from '../../hooks/useActionPlanTasks'
import { useAuth } from '../../contexts/AuthContext'
import type { ActionPlanTask } from '../../types'

type Props = {
  task: ActionPlanTask
  planId: string
  canManage: boolean
}

export function TaskItem({ task, planId, canManage }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const toggle = useToggleTask(planId)
  const updateTitle = useUpdateTaskTitle(planId)
  const remove = useDeleteTask(planId)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  function handleToggle() {
    if (!canManage || !user) return
    toggle.mutate({ task, userId: user.id })
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) {
      updateTitle.mutate({ taskId: task.id, title: trimmed })
    }
    setEditing(false)
  }

  return (
    <li className="group flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
      <button
        type="button"
        onClick={handleToggle}
        disabled={!canManage}
        aria-label={task.done ? t('actionPlan.tasks.markIncomplete') : t('actionPlan.tasks.markComplete')}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
          task.done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 bg-white hover:border-indigo-500'
        } ${!canManage ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {task.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(task.title)
                setEditing(false)
              }
            }}
            className="w-full rounded-md border border-indigo-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <button
            type="button"
            onClick={() => canManage && setEditing(true)}
            className={`block w-full text-left text-sm ${
              task.done ? 'text-slate-400 line-through' : 'text-slate-800'
            } ${canManage ? 'cursor-text' : 'cursor-default'}`}
          >
            {task.title}
          </button>
        )}
      </div>

      {canManage && !editing && (
        <button
          type="button"
          onClick={() => remove.mutate({ task, userId: user!.id })}
          className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
          aria-label={t('actionPlan.tasks.remove')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      {editing && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            setDraft(task.title)
            setEditing(false)
          }}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
          aria-label={t('common.cancel')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  )
}

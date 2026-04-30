import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { useAddComment } from '../../hooks/useActionPlanActivity'
import { useAuth } from '../../contexts/AuthContext'

export function CommentComposer({ planId, canComment }: { planId: string; canComment: boolean }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const addComment = useAddComment(planId)
  const [content, setContent] = useState('')

  if (!canComment) {
    return (
      <p className="text-xs text-slate-400 italic">
        {t('actionPlan.timeline.cannotComment')}
      </p>
    )
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || !user) return
    addComment.mutate(
      { authorId: user.id, content: trimmed },
      { onSuccess: () => setContent('') },
    )
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-3">
      <Textarea
        id="comment"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('actionPlan.timeline.composerPlaceholder')}
        label=""
      />
      <div className="mt-2 flex justify-end">
        <Button type="submit" size="sm" disabled={!content.trim()} isLoading={addComment.isPending}>
          <Send className="h-3.5 w-3.5" />
          {t('actionPlan.timeline.send')}
        </Button>
      </div>
    </form>
  )
}

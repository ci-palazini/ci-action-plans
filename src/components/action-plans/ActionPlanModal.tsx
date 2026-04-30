import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useCreateActionPlan, useUpdateActionPlan } from '../../hooks/useActionPlans'
import {
  useUpdateActionPlanStatus,
  useUpdateActionPlanPriority,
} from '../../hooks/useActionPlan'
import { useAuth } from '../../contexts/AuthContext'
import { COUNTRIES, PRIORITIES } from '../../lib/constants'
import { isEnglishLocale } from '../../lib/utils'
import type { ActionPlan } from '../../types'

const baseFields = {
  problem_description: z.string().min(1),
  proposed_actions:    z.string().min(1),
  responsible_person:  z.string().min(1),
  deadline:            z.string().min(1),
  status:              z.enum(['open', 'in_progress', 'completed']),
  priority:            z.enum(['low', 'medium', 'high', 'critical']),
}

// Mono e bilingual compartilham o MESMO type final para o react-hook-form;
// a diferença é só na validação: bilingual exige conteúdo nos campos EN.
const monoSchema = z.object({
  ...baseFields,
  problem_description_en: z.string(),
  proposed_actions_en:    z.string(),
})

const bilingualSchema = z.object({
  ...baseFields,
  problem_description_en: z.string().min(1),
  proposed_actions_en:    z.string().min(1),
})

type FormData = z.infer<typeof bilingualSchema>

interface Props {
  open: boolean
  onClose: () => void
  countryId: string
  pillarName: string
  elementName: string
  plan?: ActionPlan
}

export function ActionPlanModal({ open, onClose, countryId, pillarName, elementName, plan }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const createMutation = useCreateActionPlan()
  const updateMutation = useUpdateActionPlan()
  const updateStatusMutation = useUpdateActionPlanStatus()
  const updatePriorityMutation = useUpdateActionPlanPriority()

  const country = COUNTRIES.find((c) => c.id === countryId)
  const isBilingual = !isEnglishLocale(country?.locale ?? 'en')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isBilingual ? bilingualSchema : monoSchema),
    defaultValues: {
      status: 'open',
      priority: 'medium',
      problem_description: '',
      proposed_actions: '',
      problem_description_en: '',
      proposed_actions_en: '',
      responsible_person: '',
      deadline: '',
    },
  })

  useEffect(() => {
    if (plan) {
      reset({
        problem_description:    plan.problem_description,
        proposed_actions:       plan.proposed_actions,
        problem_description_en: plan.problem_description_en ?? '',
        proposed_actions_en:    plan.proposed_actions_en ?? '',
        responsible_person:     plan.responsible_person,
        deadline:               plan.deadline,
        status:                 plan.status,
        priority:               plan.priority,
      })
    } else {
      reset({
        status: 'open',
        priority: 'medium',
        problem_description: '',
        proposed_actions: '',
        problem_description_en: '',
        proposed_actions_en: '',
        responsible_person: '',
        deadline: '',
      })
    }
  }, [plan, open, reset])

  async function onSubmit(data: FormData) {
    if (plan) {
      // Atualiza conteúdo (sem status/priority — eles têm mutations próprias que registram eventos)
      await updateMutation.mutateAsync({
        id: plan.id,
        authorId: user?.id,
        updates: {
          problem_description:    data.problem_description,
          proposed_actions:       data.proposed_actions,
          problem_description_en: data.problem_description_en || null,
          proposed_actions_en:    data.proposed_actions_en    || null,
          responsible_person:     data.responsible_person,
          deadline:               data.deadline,
        },
      })
      if (data.status !== plan.status && user) {
        await updateStatusMutation.mutateAsync({ id: plan.id, status: data.status, authorId: user.id })
      }
      if (data.priority !== plan.priority && user) {
        await updatePriorityMutation.mutateAsync({ id: plan.id, priority: data.priority, authorId: user.id })
      }
    } else {
      await createMutation.mutateAsync({
        ...data,
        country_id:   countryId,
        pillar_name:  pillarName,
        element_name: elementName,
        created_by:   user!.id,
      })
    }
    onClose()
  }

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateStatusMutation.isPending ||
    updatePriorityMutation.isPending

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <Dialog.Title className="text-base font-semibold text-slate-900">
                {plan ? t('actionPlan.edit') : t('actionPlan.new')}
              </Dialog.Title>
              <p className="text-xs text-slate-500 mt-0.5">{elementName} · {pillarName}</p>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isBilingual ? (
              <>
                {/* Local language section */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t('actionPlan.localVersion')}
                  </p>
                  <Textarea
                    id="problem"
                    label={t('actionPlan.problemDescription')}
                    rows={3}
                    error={errors.problem_description?.message}
                    {...register('problem_description')}
                  />
                  <Textarea
                    id="actions"
                    label={t('actionPlan.proposedActions')}
                    rows={3}
                    error={errors.proposed_actions?.message}
                    {...register('proposed_actions')}
                  />
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                      {t('actionPlan.englishTranslation')}
                    </span>
                  </div>
                </div>

                {/* English translation section */}
                <div className="space-y-3">
                  <Textarea
                    id="problem_en"
                    label={t('actionPlan.problemDescription_en')}
                    rows={3}
                    placeholder="Describe the gap or problem in English..."
                    error={errors.problem_description_en?.message}
                    {...register('problem_description_en')}
                  />
                  <Textarea
                    id="actions_en"
                    label={t('actionPlan.proposedActions_en')}
                    rows={3}
                    placeholder="List the actions in English..."
                    error={errors.proposed_actions_en?.message}
                    {...register('proposed_actions_en')}
                  />
                </div>
              </>
            ) : (
              <>
                <Textarea
                  id="problem"
                  label={t('actionPlan.problemDescription')}
                  rows={3}
                  placeholder="Describe the gap or problem..."
                  error={errors.problem_description?.message}
                  {...register('problem_description')}
                />
                <Textarea
                  id="actions"
                  label={t('actionPlan.proposedActions')}
                  rows={3}
                  placeholder="List the actions to address the problem..."
                  error={errors.proposed_actions?.message}
                  {...register('proposed_actions')}
                />
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="responsible"
                label={t('actionPlan.responsible')}
                placeholder="Name or team"
                error={errors.responsible_person?.message}
                {...register('responsible_person')}
              />
              <Input
                id="deadline"
                type="date"
                label={t('actionPlan.deadline')}
                error={errors.deadline?.message}
                {...register('deadline')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="status" className="text-sm font-medium text-slate-700">
                  {t('actionPlan.status')}
                </label>
                <select
                  id="status"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('status')}
                >
                  <option value="open">{t('actionPlan.status_open')}</option>
                  <option value="in_progress">{t('actionPlan.status_in_progress')}</option>
                  <option value="completed">{t('actionPlan.status_completed')}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="priority" className="text-sm font-medium text-slate-700">
                  {t('actionPlan.priority')}
                </label>
                <select
                  id="priority"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('priority')}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{t(`actionPlan.priority_${p}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                {t('actionPlan.cancel')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {t('actionPlan.save')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

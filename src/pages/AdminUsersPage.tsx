import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X } from 'lucide-react'
import { getAllProfiles, updateProfileCountryAndRole, createUser } from '../services/profileService'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { COUNTRIES } from '../lib/constants'
import type { Profile } from '../types'

const createSchema = z.object({
  email: z.email(),
  full_name: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['admin', 'member']),
  country_id: z.string().optional(),
})
type CreateFormData = z.infer<typeof createSchema>

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'member' },
  })
  const role = watch('role')

  const mutation = useMutation({
    mutationFn: (data: CreateFormData) =>
      createUser({
        email: data.email,
        full_name: data.full_name ?? '',
        password: data.password,
        role: data.role,
        country_id: data.role === 'admin' ? null : (data.country_id || null),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
      onClose()
    },
  })

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none">
        <div className="flex items-center justify-between mb-5">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            {t('admin.createUserTitle')}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input
            id="email"
            label={t('auth.email')}
            type="email"
            placeholder="user@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="full_name"
            label={t('admin.fullName')}
            placeholder={t('admin.fullNamePlaceholder')}
            {...register('full_name')}
          />

          <Input
            id="password"
            label={t('admin.tempPassword')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-role" className="text-sm font-medium text-slate-700">
              {t('admin.assignRole')}
            </label>
            <select
              id="modal-role"
              {...register('role')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="member">{t('admin.role_member')}</option>
              <option value="admin">{t('admin.role_admin')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="modal-country" className="text-sm font-medium text-slate-700">
              {t('admin.assignCountry')}
            </label>
            <select
              id="modal-country"
              {...register('country_id')}
              disabled={role === 'admin'}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
            >
              <option value="">{t('admin.noCountry')}</option>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">{t('common.cancel')}</Button>
            </Dialog.Close>
            <Button type="submit" isLoading={mutation.isPending}>
              {mutation.isPending ? t('admin.creating') : t('admin.createUser')}
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

function UserRow({ profile }: { profile: Profile }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [countryId, setCountryId] = useState(profile.country_id ?? '')
  const [role, setRole]           = useState<'admin' | 'member'>(profile.role === 'admin' ? 'admin' : 'member')
  const [saved, setSaved]         = useState(false)

  const mutation = useMutation({
    mutationFn: () => updateProfileCountryAndRole(profile.id, countryId || null, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {profile.avatar_initials ?? profile.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{profile.full_name ?? '—'}</p>
            <p className="text-xs text-slate-500">{profile.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="member">{t('admin.role_member')}</option>
          <option value="admin">{t('admin.role_admin')}</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          disabled={role === 'admin'}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
        >
          <option value="">{t('admin.noCountry')}</option>
          {COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        {saved ? (
          <span className="text-xs text-emerald-600 font-medium">{t('admin.updated')}</span>
        ) : (
          <Button size="sm" variant="outline" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            {t('admin.save')}
          </Button>
        )}
      </td>
    </tr>
  )
}

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: getAllProfiles,
  })

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">Assign roles and countries to users</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              {t('admin.createUser')}
            </Button>
          </Dialog.Trigger>
          <CreateUserModal onClose={() => setOpen(false)} />
        </Dialog.Root>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-indigo-600" />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{t('admin.assignRole')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{t('admin.assignCountry')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <UserRow key={p.id} profile={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

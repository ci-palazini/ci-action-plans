import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Upload, ClipboardList, Users, LogOut, Activity, Layers } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { COUNTRIES } from '../../lib/constants'
import { Flag } from '../ui/Flag'
import { ElementSearchModal } from '../element-lens/ElementSearchModal'

const navItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white',
  )

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const { isAdmin, profile } = useAuth()
  const navigate = useNavigate()
  const [lensOpen, setLensOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const userCountry = profile?.country_id
    ? COUNTRIES.find((c) => c.id === profile.country_id)
    : null

  return (
    <>
    <ElementSearchModal open={lensOpen} onClose={() => setLensOpen(false)} />
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-white">CI Action Plans</p>
          <p className="text-xs text-slate-400 mt-0.5">Maturity Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <NavLink to="/" end className={navItem} onClick={onClose}>
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          {t('nav.dashboard')}
        </NavLink>

        <button
          onClick={() => { setLensOpen(true); onClose?.() }}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-slate-300 hover:bg-slate-700 hover:text-white',
          )}
        >
          <Layers className="h-4 w-4 flex-shrink-0" />
          Element Lens
        </button>

        <div className="pt-3 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('nav.countries')}
          </p>
        </div>

        {COUNTRIES.map((c) => (
          <NavLink
            key={c.id}
            to={`/countries/${c.id}`}
            className={navItem}
            onClick={onClose}
          >
            <Flag countryId={c.id} className="h-4 w-auto flex-shrink-0" />
            <span className="truncate">{c.name}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </p>
            </div>
            <NavLink to="/admin/all-plans" className={navItem} onClick={onClose}>
              <ClipboardList className="h-4 w-4 flex-shrink-0" />
              {t('nav.allPlans')}
            </NavLink>
            <NavLink to="/admin/users" className={navItem} onClick={onClose}>
              <Users className="h-4 w-4 flex-shrink-0" />
              {t('nav.admin')}
            </NavLink>
          </>
        )}

        {userCountry && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quick Links
              </p>
            </div>
            <NavLink to={`/countries/${userCountry.id}/upload`} className={navItem} onClick={onClose}>
              <Upload className="h-4 w-4 flex-shrink-0" />
              {t('nav.upload')}
            </NavLink>
            <NavLink to={`/countries/${userCountry.id}/action-plans`} className={navItem} onClick={onClose}>
              <ClipboardList className="h-4 w-4 flex-shrink-0" />
              {t('nav.actionPlans')}
            </NavLink>
          </>
        )}
      </nav>

      {/* User info */}
      <div className="border-t border-slate-700 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {profile?.avatar_initials ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{profile?.full_name ?? profile?.email}</p>
            <p className="text-xs text-slate-400">{isAdmin ? 'Global Admin' : userCountry?.name ?? '—'}</p>
          </div>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-white transition-colors" title={t('auth.signOut')}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import { NotificationBell } from '../notifications/NotificationBell'

const LOCALES = [
  { code: 'en',    label: 'English' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'es',    label: 'Español' },
  { code: 'zh',    label: '中文' },
  { code: 'fr',    label: 'Français' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'it',    label: 'Italiano' },
]

export function Topbar({ onMenuClick, title }: { onMenuClick: () => void; title?: string }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-2 text-slate-500 hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        {title && <h1 className="text-sm font-semibold text-slate-700">{title}</h1>}
      </div>

      <NotificationBell />

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALES.find((l) => l.code === i18n.language)?.label ?? 'English'}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => {
                  i18n.changeLanguage(locale.code)
                  setOpen(false)
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                  i18n.language === locale.code ? 'font-semibold text-indigo-600' : 'text-slate-700',
                )}
              >
                {locale.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

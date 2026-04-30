import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function isEnglishLocale(locale: string): boolean {
  return locale.startsWith('en')
}

export function resolveContentLocale(
  userLocale: string,
  countryLocale: string,
): 'local' | 'en' {
  if (isEnglishLocale(countryLocale)) return 'local'
  const base = (l: string) => l.toLowerCase().split('-')[0]
  return base(userLocale) === base(countryLocale) ? 'local' : 'en'
}

export function scoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400'
  if (score >= 100) return 'text-emerald-600'
  if (score >= 70) return 'text-amber-500'
  return 'text-red-500'
}

export function scoreBg(score: number | null): string {
  if (score === null) return 'bg-slate-100 text-slate-500'
  if (score >= 100) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

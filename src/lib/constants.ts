export const PILLARS = [
  'Collaboration & Engagement',
  'Safety',
  'Learning Culture',
  'Sales & Operations Planning',
  'Sustainability',
  'Quality',
  'Continuous Improvement',
  'Digital',
] as const

export const PILLAR_ELEMENTS: Record<string, string[]> = {
  'Collaboration & Engagement': [
    'Self-Directed Teams (SDT)', 'Production Meeting', 'Management Meeting',
    'Operations Reviews', 'Vision', 'Policy Deployment',
    'Communications & Listening', 'Metrics', 'Customer Voice',
  ],
  'Safety': ['Safety'],
  'Learning Culture': [
    'Followership', 'Spirax Operator Excellence Pathway',
    'Positive Performance & Development', 'Inclusive Talent',
    'Inclusion & Diversity', 'Essential Compliance Training',
  ],
  'Sales & Operations Planning': [
    'Sales & Operations Plan (S&OP) Meeting',
    'Capacity', 'Sales & Operations (S&OP) Data', 'New Products',
    'Inventory Control', 'Business Risk Management', 'Supplier Review',
    'Organisation', 'Site Layout', 'Supply Base', 'Purchase', 'Cash Focus',
  ],
  'Sustainability': [
    'Sustainability Fundamentals', 'Net Zero & Energy Management',
    'Biodiversity & Community Engagement', 'Environment Improvements',
    'Sustainable Products', 'Sustainable Supply Chains',
  ],
  'Quality': [
    'Change Management', 'FMEA (Failure Modes Effect Analysis)',
    'Manufacturing Processes Controls', 'Zero Defects', 'Capability',
    'Six Sigma', 'Layered Audit', 'Root Cause',
  ],
  'Continuous Improvement': [
    '5S', 'Standard Work', 'Visual Management', 'Changeover Reduction (SMED)',
    'Total Productive Maintenance', '1 Piece Flow', 'Cell Perimeter',
    '8 Wastes / Kaizen', 'Leader Standard Work (LSW)', 'Andon (Escalation)',
    'Best Practice', 'Office Lean',
  ],
  'Digital': [
    'Equipment & Automation', 'Digital Shop Floor', 'Digital Factory',
    'Security and Infrastructure', 'Digital Skillset', 'Supply Chain',
    'Digital Twin', 'Decision Making',
  ],
}

export const CANONICAL_ELEMENTS = PILLARS.flatMap((pillar) =>
  PILLAR_ELEMENTS[pillar].map((elementName) => ({ pillarName: pillar, elementName })),
)

export const LEVELS = ['FOUNDATION', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const

export const COUNTRIES = [
  { id: 'argentina', name: 'Argentina', locale: 'es',    iso: 'ar' },
  { id: 'brazil',       name: 'Brazil',         locale: 'pt-BR', iso: 'br' },
  { id: 'brazil_hiter', name: 'Brazil (Hiter)', locale: 'pt-BR', iso: 'br' },
  { id: 'china',     name: 'China',     locale: 'zh',    iso: 'cn' },
  { id: 'france',    name: 'France',    locale: 'fr',    iso: 'fr' },
  { id: 'germany',   name: 'Germany',   locale: 'de',    iso: 'de' },
  { id: 'india',     name: 'India',     locale: 'en',    iso: 'in' },
  { id: 'italy',     name: 'Italy',     locale: 'it',    iso: 'it' },
  { id: 'uk',        name: 'UK',        locale: 'en-GB', iso: 'gb' },
  { id: 'usa',       name: 'USA',       locale: 'en-US', iso: 'us' },
] as const

export const COUNTRY_ISO: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c.iso]),
)

export function isoToFlagEmoji(iso: string): string {
  const normalized = iso.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return ''
  return String.fromCodePoint(...normalized.split('').map((char) => 127397 + char.charCodeAt(0)))
}

export const CHART_COLORS = {
  argentina: '#EF4444',
  brazil:       '#10B981',
  brazil_hiter: '#059669',
  china:     '#F59E0B',
  france:    '#3B82F6',
  germany:   '#8B5CF6',
  india:     '#F97316',
  italy:     '#06B6D4',
  uk:        '#EC4899',
  usa:       '#6366F1',
} as const

export const PILLAR_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
] as const

export const STATUS_COLORS = {
  open:        { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  in_progress: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  completed:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
} as const

export const PRIORITY_COLORS = {
  low:      { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400'  },
  medium:   { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200',    dot: 'bg-sky-500'    },
  high:     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  critical: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-500'   },
} as const

export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

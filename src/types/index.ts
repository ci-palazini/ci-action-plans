export type UserRole = 'admin' | 'member'
export type ActionStatus = 'open' | 'in_progress' | 'completed'
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical'
export type LevelStatus = 'Accomplished' | 'In Progress' | 'Open'

export type Country = {
  id: string
  name: string
  locale: string
  flag_emoji: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  country_id: string | null
  created_at: string
  updated_at: string
  avatar_initials: string | null
}

export type Assessment = {
  id: string
  country_id: string
  uploaded_by: string
  file_name: string
  uploaded_at: string
}

export type AssessmentElement = {
  id: string
  assessment_id: string
  country_id: string
  pillar_name: string
  element_name: string
  foundation_status: LevelStatus | null
  bronze_status: LevelStatus | null
  silver_status: LevelStatus | null
  gold_status: LevelStatus | null
  platinum_status: LevelStatus | null
  foundation_score: number | null
  bronze_score: number | null
  silver_score: number | null
  gold_score: number | null
  platinum_score: number | null
}

export type ActionPlan = {
  id: string
  country_id: string
  pillar_name: string
  element_name: string
  problem_description: string
  proposed_actions: string
  problem_description_en: string | null
  proposed_actions_en: string | null
  responsible_person: string
  deadline: string
  status: ActionStatus
  priority: ActionPriority
  progress_pct: number
  created_by: string
  created_at: string
  updated_at: string
}

export type ActionPlanTask = {
  id: string
  action_plan_id: string
  title: string
  done: boolean
  position: number
  created_by: string
  completed_by: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type ActivityType =
  | 'comment'
  | 'plan_created'
  | 'status_changed'
  | 'priority_changed'
  | 'deadline_changed'
  | 'responsible_changed'
  | 'task_added'
  | 'task_completed'
  | 'task_reopened'
  | 'task_removed'

export type ActionPlanActivity = {
  id: string
  action_plan_id: string
  author_id: string | null
  type: ActivityType
  content: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type Notification = {
  id: string
  recipient_id: string
  action_plan_id: string
  activity_id: string
  type: ActivityType
  read_at: string | null
  created_at: string
}

export type PillarSummary = {
  pillarName: string
  avgScore: number
  elementCount: number
  belowHundredCount: number
}

export type CountrySummary = {
  countryId: string
  countryName: string
  flagEmoji: string
  avgScore: number
  pillars: PillarSummary[]
  actionPlansOpen: number
  actionPlansInProgress: number
  actionPlansCompleted: number
  hasAssessment: boolean
}

export type ActionPlanKey = {
  country_id: string
  pillar_name: string
  element_name: string
}

export type CountryCoverageRow = {
  countryId: string
  countryName: string
  flagEmoji: string
  needsPlan: number
  withPlan: number
  withoutPlan: number
  coveragePct: number
}

export type PillarCoverageRow = {
  pillarName: string
  withPlan: number
  withoutPlan: number
}

export type CoverageStats = {
  globalCoveragePct: number
  globalUncoveredCount: number
  byCountry: CountryCoverageRow[]
  byPillar: PillarCoverageRow[]
}

export type CountryActionPlanCoverage = {
  totalNeedsPlan: number
  totalWithPlan: number
  totalWithoutPlan: number
  coveragePct: number
  byPillar: PillarCoverageRow[]
}

export type ElementDefinition = {
  code: string
  name_en: string
  explanation_en: string | null
  criteria: {
    behaviour?: string
    maturity_levels?: {
      FOUNDATION?: string
      BRONZE?: string
      SILVER?: string
      GOLD?: string
      PLATINUM?: string
    }
  }
}

import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Upload, ClipboardList, AlertCircle } from 'lucide-react'
import { useAssessment, useAssessmentElements, useCountryCoverage } from '../hooks/useAssessment'
import { useAuth } from '../contexts/AuthContext'
import { PillarAccordion } from '../components/assessment/PillarAccordion'
import { CountryCoverageStats } from '../components/assessment/CountryCoverageStats'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { formatDate } from '../lib/utils'
import { COUNTRIES, PILLARS } from '../lib/constants'
import { Flag } from '../components/ui/Flag'

export function CountryDetailPage() {
  const { countryId = '' } = useParams<{ countryId: string }>()
  const { t } = useTranslation()
  const { canWrite } = useAuth()

  const country = COUNTRIES.find((c) => c.id === countryId)
  const assessmentQuery = useAssessment(countryId)
  const elementsQuery   = useAssessmentElements(countryId)
  const coverage        = useCountryCoverage(countryId)
  const isLoading = assessmentQuery.isLoading || elementsQuery.isLoading
  const canEdit = canWrite(countryId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Spinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  const assessment = assessmentQuery.data
  const elements   = elementsQuery.data ?? []

  // Group elements by pillar preserving PILLARS order
  const pillarMap = new Map<string, typeof elements>()
  for (const el of elements) {
    const arr = pillarMap.get(el.pillar_name) ?? []
    arr.push(el)
    pillarMap.set(el.pillar_name, arr)
  }
  const orderedPillars = PILLARS.filter((p) => pillarMap.has(p))

  const totalBelow = elements.filter((e) => (e.foundation_score ?? 0) < 100).length

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Flag countryId={countryId} className="h-8 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {country?.name ?? countryId}
            </h1>
            {assessment ? (
              <p className="text-sm text-slate-500 mt-0.5">
                {t('country.detail.uploadDate', { date: formatDate(assessment.uploaded_at) })}
                {' · '}
                {elements.length} elements
                {totalBelow > 0 && (
                  <span className="ml-1 inline-flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {t('country.detail.elementsBelow', { count: totalBelow })}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-0.5">{t('country.detail.noAssessment')}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {assessment && (
            <Link to={`/countries/${countryId}/action-plans`}>
              <Button variant="outline" size="sm">
                <ClipboardList className="h-4 w-4" />
                {t('country.detail.viewActionPlans')}
              </Button>
            </Link>
          )}
          {canEdit && (
            <Link to={`/countries/${countryId}/upload`}>
              <Button size="sm">
                <Upload className="h-4 w-4" />
                {t('upload.title')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {!assessment ? (
        <EmptyState
          icon={Upload}
          title={t('country.detail.noAssessment')}
          action={
            canEdit ? (
              <Link to={`/countries/${countryId}/upload`}>
                <Button>{t('country.detail.uploadCta')}</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <CountryCoverageStats coverage={coverage} />
          <div className="space-y-3">
            {orderedPillars.map((pillar, i) => (
              <PillarAccordion
                key={pillar}
                pillarName={pillar}
                elements={pillarMap.get(pillar)!}
                canEdit={canEdit}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

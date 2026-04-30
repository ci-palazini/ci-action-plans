import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { parseAssessmentFile, type ParsedElement } from '../lib/csvParser'
import { useUploadAssessment } from '../hooks/useAssessment'
import { useAssessment } from '../hooks/useAssessment'
import { useAuth } from '../contexts/AuthContext'
import { DropZone } from '../components/upload/DropZone'
import { ParsePreview } from '../components/upload/ParsePreview'
import { Button } from '../components/ui/Button'
import { COUNTRIES } from '../lib/constants'
import { Flag } from '../components/ui/Flag'

type Step = 'select' | 'preview' | 'done'

export function UploadPage() {
  const { countryId = '' } = useParams<{ countryId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const country = COUNTRIES.find((c) => c.id === countryId)

  const [step, setStep] = useState<Step>('select')
  const [file, setFile] = useState<File | null>(null)
  const [elements, setElements] = useState<ParsedElement[]>([])
  const [parseError, setParseError] = useState('')

  const { data: existing } = useAssessment(countryId)
  const uploadMutation = useUploadAssessment(countryId)

  async function handleFile(f: File) {
    setParseError('')
    try {
      const result = await parseAssessmentFile(f)
      if (result.errors.length && result.elements.length === 0) {
        setParseError(result.errors[0])
        return
      }
      setFile(f)
      setElements(result.elements)
      setStep('preview')
    } catch {
      setParseError(t('upload.parseError'))
    }
  }

  async function handleConfirm() {
    if (!file || !user) return
    await uploadMutation.mutateAsync({
      fileName: file.name,
      uploadedBy: user.id,
      elements,
    })
    setStep('done')
  }

  const STEPS = [t('upload.stepSelect'), t('upload.stepPreview'), t('upload.stepSave')]
  const stepIdx = { select: 0, preview: 1, done: 2 }[step]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to={`/countries/${countryId}`} className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          {t('common.backToCountry', { country: country?.name })}
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('upload.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="inline-flex items-center gap-1.5">
            <Flag countryId={countryId} className="h-4 w-auto" />
            {country?.name} · {t('upload.subtitle')}
          </span>
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              i < stepIdx ? 'bg-indigo-600 text-white' :
              i === stepIdx ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < stepIdx ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === stepIdx ? 'text-indigo-700' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="text-slate-300 mx-1">›</span>}
          </div>
        ))}
      </div>

      {/* Replace warning */}
      {existing && step === 'preview' && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            {t('upload.replaceWarning', { country: country?.name })}
          </p>
        </div>
      )}

      {/* Step content */}
      {step === 'select' && (
        <div className="space-y-3">
          <DropZone onFile={handleFile} />
          {parseError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {parseError}
            </p>
          )}
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              {t('upload.preview', { count: elements.length })}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
              {t('common.back')}
            </Button>
          </div>
          <ParsePreview elements={elements} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep('select')}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirm} isLoading={uploadMutation.isPending}>
              {t('upload.confirm')}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{t('upload.success')}</h2>
          <p className="text-sm text-slate-500 mt-1">{elements.length} elements saved for {country?.name}</p>
          <Button
            className="mt-6"
            onClick={() => navigate(`/countries/${countryId}`)}
          >
            View Assessment
          </Button>
        </div>
      )}
    </div>
  )
}

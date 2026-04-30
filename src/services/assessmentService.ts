import { supabase } from '../lib/supabase'
import type { ParsedElement } from '../lib/csvParser'
import type { Assessment, AssessmentElement } from '../types'

export async function getAssessment(countryId: string): Promise<Assessment | null> {
  const { data } = await supabase
    .from('assessments')
    .select('*')
    .eq('country_id', countryId)
    .maybeSingle()
  return data
}

export async function getAssessmentElements(countryId: string): Promise<AssessmentElement[]> {
  const { data, error } = await supabase
    .from('assessment_elements')
    .select('*')
    .eq('country_id', countryId)
    .order('pillar_name')
    .order('element_name')
  if (error) throw error
  return data ?? []
}

export async function getAllElements(): Promise<AssessmentElement[]> {
  const { data, error } = await supabase
    .from('assessment_elements')
    .select('*')
    .order('country_id')
    .order('pillar_name')
  if (error) throw error
  return data ?? []
}

export async function getElementScoresAllCountries(
  pillarName: string,
  elementName: string,
): Promise<AssessmentElement[]> {
  const { data, error } = await supabase
    .from('assessment_elements')
    .select('*')
    .eq('pillar_name', pillarName)
    .eq('element_name', elementName)
    .order('country_id')
  if (error) throw error
  return data ?? []
}

export async function uploadAssessment(
  countryId: string,
  fileName: string,
  uploadedBy: string,
  elements: ParsedElement[],
): Promise<void> {
  // Upsert assessment row
  const { data: assessment, error: upsertErr } = await supabase
    .from('assessments')
    .upsert(
      { country_id: countryId, uploaded_by: uploadedBy, file_name: fileName },
      { onConflict: 'country_id' },
    )
    .select()
    .single()
  if (upsertErr) throw upsertErr

  // Delete existing elements for this assessment
  await supabase
    .from('assessment_elements')
    .delete()
    .eq('assessment_id', assessment.id)

  // Bulk insert new elements in chunks of 200
  const rows = elements.map((el) => ({
    assessment_id:     assessment.id,
    country_id:        countryId,
    pillar_name:       el.pillarName,
    element_name:      el.elementName,
    foundation_status: el.foundationStatus,
    bronze_status:     el.bronzeStatus,
    silver_status:     el.silverStatus,
    gold_status:       el.goldStatus,
    platinum_status:   el.platinumStatus,
    foundation_score:  el.foundationScore,
    bronze_score:      el.bronzeScore,
    silver_score:      el.silverScore,
    gold_score:        el.goldScore,
    platinum_score:    el.platinumScore,
  }))

  const CHUNK = 200
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from('assessment_elements').insert(rows.slice(i, i + CHUNK))
    if (error) throw error
  }
}

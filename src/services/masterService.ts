import { supabase } from '../lib/supabase'
import type { ElementDefinition } from '../types'

export async function getElementDefinitions(): Promise<Record<string, ElementDefinition>> {
  const { data } = await supabase
    .from('elements_master')
    .select('code, name_en, explanation_en, criteria')
    .eq('is_active', true)
  return Object.fromEntries((data ?? []).map(e => [e.name_en, e as ElementDefinition]))
}

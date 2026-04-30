import * as XLSX from 'xlsx'
import { CANONICAL_ELEMENTS } from './constants'

export type LevelStatus = 'Accomplished' | 'In Progress' | 'Open'

export type ParsedElement = {
  pillarName: string
  elementName: string
  foundationStatus: LevelStatus | null
  bronzeStatus: LevelStatus | null
  silverStatus: LevelStatus | null
  goldStatus: LevelStatus | null
  platinumStatus: LevelStatus | null
  foundationScore: number | null
  bronzeScore: number | null
  silverScore: number | null
  goldScore: number | null
  platinumScore: number | null
}

export type ParseResult = {
  elements: ParsedElement[]
  errors: string[]
}

const VALID_STATUSES = new Set(['Accomplished', 'In Progress', 'Open'])

export function parseAssessmentFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: null,
          raw: false,
        })
        resolve(parseRows(rows as (string | null)[][]))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function parseRows(rows: (string | null)[][]): ParseResult {
  const elements: ParsedElement[] = []
  const errors: string[] = []
  let canonicalIdx = 0

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every((c) => c === null || c === '')) continue

    // Skip summary-only rows (col[0] has a value but no element data in col[2])
    if (row[0]?.trim() && !row[2]?.trim()) continue

    if (canonicalIdx >= CANONICAL_ELEMENTS.length) break

    const canonical = CANONICAL_ELEMENTS[canonicalIdx++]
    elements.push({
      pillarName:       canonical.pillarName,
      elementName:      canonical.elementName,
      foundationStatus: parseStatus(row[4]),
      bronzeStatus:     parseStatus(row[5]),
      silverStatus:     parseStatus(row[6]),
      goldStatus:       parseStatus(row[7]),
      platinumStatus:   parseStatus(row[8]),
      foundationScore:  parseScore(row[9]),
      bronzeScore:      parseScore(row[10]),
      silverScore:      parseScore(row[11]),
      goldScore:        parseScore(row[12]),
      platinumScore:    parseScore(row[13]),
    })
  }

  if (elements.length < CANONICAL_ELEMENTS.length) {
    errors.push(`Expected ${CANONICAL_ELEMENTS.length} elements, found ${elements.length}. Check the file format.`)
  }

  return { elements, errors }
}

function parseStatus(val: string | null): LevelStatus | null {
  const s = val?.trim() ?? ''
  return VALID_STATUSES.has(s) ? (s as LevelStatus) : null
}

function parseScore(val: string | null): number | null {
  if (val === null || val === '') return null
  const normalized = val.replace(',', '.')
  const n = parseFloat(normalized)
  if (isNaN(n)) return null
  return Math.min(100, Math.max(0, n))
}

export function groupByPillar(elements: ParsedElement[]): Map<string, ParsedElement[]> {
  const map = new Map<string, ParsedElement[]>()
  for (const el of elements) {
    const arr = map.get(el.pillarName) ?? []
    arr.push(el)
    map.set(el.pillarName, arr)
  }
  return map
}

export function pillarAvgScore(elements: ParsedElement[]): number {
  const scores = elements.map((e) => e.foundationScore).filter((s): s is number => s !== null)
  if (scores.length === 0) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

import { STORAGE_KEY, DAYS } from '../constants/schedule'
import type { ScheduleRecord, DayKey } from '../types/schedule'

type ExportPayload = {
  exportedAt: string
  storageKey: string
  record: ScheduleRecord
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidColor(value: unknown): boolean {
  return value === 'blue' || value === 'mint' || value === 'peach' || value === 'lavender' || value === 'sand'
}

function isScheduleItem(value: unknown): boolean {
  if (!isObject(value)) {
    return false
  }
  const { title, location, note, color } = value
  if (typeof title !== 'string' || typeof location !== 'string' || typeof note !== 'string') {
    return false
  }
  if (typeof color === 'undefined') {
    return true
  }
  return isValidColor(color)
}

function isScheduleRecord(value: unknown): value is ScheduleRecord {
  if (!isObject(value)) {
    return false
  }
  return Object.values(value).every((item) => isScheduleItem(item))
}

export function loadInitialRecord(): ScheduleRecord {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {}
    }
    const parsed = JSON.parse(stored)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ScheduleRecord
    }
  } catch {
    return {}
  }
  return {}
}

export function saveRecord(record: ScheduleRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function createExportPayload(record: ScheduleRecord) {
  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    record,
  }
  return JSON.stringify(payload, null, 2)
}

export function downloadRecordJson(record: ScheduleRecord) {
  const content = createExportPayload(record)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const dateText = new Date().toISOString().slice(0, 10)
  const link = document.createElement('a')
  link.href = url
  link.download = `uni-schedule-${dateText}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseImportRecord(content: string): ScheduleRecord {
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('JSON形式が不正です')
  }

  if (isObject(parsed) && 'record' in parsed) {
    const candidate = parsed.record
    if (isScheduleRecord(candidate)) {
      return candidate
    }
    throw new Error('recordの形式が不正です')
  }

  if (isScheduleRecord(parsed)) {
    return parsed
  }

  throw new Error('時間割データとして読み込めないJSONです')
}

export function slotKey(day: DayKey, period: number) {
  return `${day}-${period}`
}

export function parseSlot(key: string) {
  const [day, periodText] = key.split('-')
  const dayLabel = DAYS.find((item) => item.key === day)?.label ?? '?'
  const period = Number(periodText)
  return {
    dayLabel,
    period: Number.isFinite(period) ? period : 0,
  }
}

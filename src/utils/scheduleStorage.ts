import { STORAGE_KEY, DAYS } from '../constants/schedule'
import type { ScheduleRecord, DayKey } from '../types/schedule'

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

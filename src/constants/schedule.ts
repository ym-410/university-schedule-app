import type { DayKey, ScheduleColor, ScheduleItem } from '../types/schedule'

export const STORAGE_KEY = 'uni_schedule_record_v1'

export const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: 'mon', label: '月' },
  { key: 'tue', label: '火' },
  { key: 'wed', label: '水' },
  { key: 'thu', label: '木' },
  { key: 'fri', label: '金' },
]

export const PERIODS = [1, 2, 3, 4, 5]

export const TIME_SLOTS: Record<number, { start: string; end: string }> = {
  1: { start: '08:45', end: '10:15' },
  2: { start: '10:30', end: '12:00' },
  3: { start: '13:00', end: '14:30' },
  4: { start: '14:45', end: '16:15' },
  5: { start: '16:30', end: '18:00' },
}

export const COLOR_OPTIONS: Array<{ key: ScheduleColor; label: string }> = [
  { key: 'blue', label: '青' },
  { key: 'mint', label: '緑' },
  { key: 'peach', label: '橙' },
  { key: 'lavender', label: '紫' },
  { key: 'sand', label: '黄' },
]

export const EMPTY_ITEM: ScheduleItem = {
  title: '',
  location: '',
  note: '',
  color: 'blue',
}

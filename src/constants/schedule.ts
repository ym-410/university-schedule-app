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
  1: { start: '09:00', end: '10:40' },
  2: { start: '10:50', end: '12:30' },
  3: { start: '13:20', end: '15:00' },
  4: { start: '15:10', end: '16:50' },
  5: { start: '17:00', end: '18:40' },
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

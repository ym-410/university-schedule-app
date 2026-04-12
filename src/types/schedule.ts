export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export type ScheduleItem = {
  title: string
  location: string
  note: string
}

export type ScheduleRecord = {
  [key: string]: ScheduleItem
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export type ScheduleColor = 'blue' | 'mint' | 'peach' | 'lavender' | 'sand'

export type ScheduleItem = {
  title: string
  location: string
  note: string
  color?: ScheduleColor
}

export type ScheduleRecord = {
  [key: string]: ScheduleItem
}

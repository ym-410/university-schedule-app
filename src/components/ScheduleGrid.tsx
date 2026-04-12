import { DAYS, PERIODS, TIME_SLOTS } from '../constants/schedule'
import type { ScheduleRecord, DayKey } from '../types/schedule'
import { slotKey } from '../utils/scheduleStorage'

type ScheduleGridProps = {
  record: ScheduleRecord
  onOpenDetail: (day: DayKey, period: number) => void
}

function getTodayDayKey(): DayKey | null {
  const dayIndex = new Date().getDay()
  switch (dayIndex) {
    case 1:
      return 'mon'
    case 2:
      return 'tue'
    case 3:
      return 'wed'
    case 4:
      return 'thu'
    case 5:
      return 'fri'
    default:
      return null
  }
}

export function ScheduleGrid({ record, onOpenDetail }: ScheduleGridProps) {
  const todayDayKey = getTodayDayKey()

  const getSlotClassName = (dayKey: DayKey, colorKey?: string) => {
    const resolvedColorKey = colorKey ?? 'blue'
    return [
      'slot',
      colorKey ? 'slot-filled' : '',
      dayKey === todayDayKey ? 'slot-today' : '',
      colorKey ? `slot-color-${resolvedColorKey}` : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  return (
    <section className="grid-panel" aria-label="メイン画面">
      <div className="schedule-grid" role="grid" aria-label="時間割グリッド">
        <div className="corner" aria-hidden="true"></div>
        {DAYS.map((day) => (
          <div
            key={day.key}
            className={day.key === todayDayKey ? 'day-header day-header-today' : 'day-header'}
            role="columnheader"
          >
            <span className="day-label">{day.label}</span>
            {day.key === todayDayKey && <span className="today-badge">今日</span>}
          </div>
        ))}

        {PERIODS.flatMap((period) => {
          const time = TIME_SLOTS[period]
          return [
            <div className="period-label" role="rowheader" key={`label-${period}`}>
              <div className="period-number">{period}</div>
              <div className="period-time">
                <span>{time?.start}</span>
                <span>{time?.end}</span>
              </div>
            </div>,
            ...DAYS.map((day) => {
              const key = slotKey(day.key, period)
              const item = record[key]
              return (
                <button
                  type="button"
                  className={getSlotClassName(day.key, item?.color ?? undefined)}
                  key={key}
                  onClick={() => onOpenDetail(day.key, period)}
                >
                  {item ? (
                    <>
                      <strong>{item.title || '無題の予定'}</strong>
                      {item.location && <span className="location-badge">{item.location}</span>}
                    </>
                  ) : (
                    <span className="empty" aria-hidden="true"></span>
                  )}
                </button>
              )
            }),
          ]
        })}
      </div>
    </section>
  )
}

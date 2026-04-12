import { DAYS, PERIODS, TIME_SLOTS } from '../constants/schedule'
import type { ScheduleRecord, DayKey } from '../types/schedule'
import { slotKey } from '../utils/scheduleStorage'

type ScheduleGridProps = {
  record: ScheduleRecord
  onOpenDetail: (day: DayKey, period: number) => void
}

export function ScheduleGrid({ record, onOpenDetail }: ScheduleGridProps) {
  return (
    <section className="grid-panel" aria-label="メイン画面">
      <div className="schedule-grid" role="grid" aria-label="時間割グリッド">
        <div className="corner" aria-hidden="true"></div>
        {DAYS.map((day) => (
          <div key={day.key} className="day-header" role="columnheader">
            {day.label}
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
                  className={item ? 'slot slot-filled' : 'slot'}
                  key={key}
                  onClick={() => onOpenDetail(day.key, period)}
                >
                  {item ? (
                    <>
                      <strong>{item.title || '無題の予定'}</strong>
                      {item.location && <span className="location-badge">{item.location}</span>}
                    </>
                  ) : (
                    <span className="empty">未登録</span>
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

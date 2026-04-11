import { useEffect, useMemo, useState } from 'react'
import './App.css'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

type ScheduleItem = {
  title: string
  location: string
  note: string
}

type ScheduleRecord = {
  [key: string]: ScheduleItem
}

const STORAGE_KEY = 'uni_schedule_record_v1'

const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: 'mon', label: '月' },
  { key: 'tue', label: '火' },
  { key: 'wed', label: '水' },
  { key: 'thu', label: '木' },
  { key: 'fri', label: '金' },
]

const PERIODS = [1, 2, 3, 4, 5, 6, 7]

const EMPTY_ITEM: ScheduleItem = {
  title: '',
  location: '',
  note: '',
}

function slotKey(day: DayKey, period: number) {
  return `${day}-${period}`
}

function parseSlot(key: string) {
  const [day, periodText] = key.split('-')
  const dayLabel = DAYS.find((item) => item.key === day)?.label ?? '?'
  const period = Number(periodText)
  return {
    dayLabel,
    period: Number.isFinite(period) ? period : 0,
  }
}

function loadInitialRecord() {
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

function App() {
  const [record, setRecord] = useState<ScheduleRecord>(loadInitialRecord)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [draft, setDraft] = useState<ScheduleItem>(EMPTY_ITEM)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  }, [record])

  const selectedLabel = useMemo(() => {
    if (!selectedSlot) {
      return ''
    }
    const parsed = parseSlot(selectedSlot)
    return `${parsed.dayLabel}曜${parsed.period}限`
  }, [selectedSlot])

  const openDetail = (day: DayKey, period: number) => {
    const key = slotKey(day, period)
    setSelectedSlot(key)
    setDraft(record[key] ?? EMPTY_ITEM)
  }

  const saveSlot = () => {
    if (!selectedSlot) {
      return
    }
    const next = {
      ...record,
      [selectedSlot]: {
        title: draft.title.trim(),
        location: draft.location.trim(),
        note: draft.note.trim(),
      },
    }
    setRecord(next)
    setSelectedSlot(null)
  }

  const deleteSlot = () => {
    if (!selectedSlot) {
      return
    }
    const next = { ...record }
    delete next[selectedSlot]
    setRecord(next)
    setSelectedSlot(null)
  }

  const closeDetail = () => {
    setSelectedSlot(null)
  }

  const updateDraft = (field: keyof ScheduleItem, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Campus Flow</p>
        <h1>大学予定管理アプリ</h1>
        <p className="lead">月曜から金曜の1限〜7限を、1タップで管理。</p>
      </header>

      {selectedSlot ? (
        <section className="detail-panel" aria-label="詳細画面">
          <h2>{selectedLabel} の予定編集</h2>
          <label className="field">
            <span>予定名</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => updateDraft('title', event.target.value)}
              placeholder="例: 情報処理概論"
            />
          </label>
          <label className="field">
            <span>場所</span>
            <input
              type="text"
              value={draft.location}
              onChange={(event) => updateDraft('location', event.target.value)}
              placeholder="例: A101"
            />
          </label>
          <label className="field">
            <span>メモ</span>
            <textarea
              value={draft.note}
              onChange={(event) => updateDraft('note', event.target.value)}
              rows={4}
              placeholder="例: レポート提出あり"
            />
          </label>

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={saveSlot}>
              保存
            </button>
            <button className="btn btn-danger" onClick={deleteSlot}>
              削除
            </button>
            <button className="btn btn-ghost" onClick={closeDetail}>
              戻る
            </button>
          </div>
        </section>
      ) : (
        <section className="grid-panel" aria-label="メイン画面">
          <div className="schedule-grid" role="grid" aria-label="時間割グリッド">
            <div className="corner" aria-hidden="true"></div>
            {DAYS.map((day) => (
              <div key={day.key} className="day-header" role="columnheader">
                {day.label}
              </div>
            ))}

            {PERIODS.map((period) => (
              <div className="period-row" key={period}>
                <div className="period-label" role="rowheader">
                  {period}限
                </div>
                {DAYS.map((day) => {
                  const key = slotKey(day.key, period)
                  const item = record[key]
                  return (
                    <button
                      type="button"
                      className="slot"
                      key={key}
                      onClick={() => openDetail(day.key, period)}
                    >
                      {item ? (
                        <>
                          <strong>{item.title || '無題の予定'}</strong>
                          <span>{item.location || '場所未登録'}</span>
                        </>
                      ) : (
                        <span className="empty">未登録</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default App

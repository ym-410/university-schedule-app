import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { ScheduleGrid } from './components/ScheduleGrid'
import { DetailPanel } from './components/DetailPanel'
import { EMPTY_ITEM } from './constants/schedule'
import type { DayKey, ScheduleItem, ScheduleRecord } from './types/schedule'
import { loadInitialRecord, saveRecord, slotKey, parseSlot } from './utils/scheduleStorage'

function App() {
  const [record, setRecord] = useState<ScheduleRecord>(loadInitialRecord)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [draft, setDraft] = useState<ScheduleItem>(EMPTY_ITEM)

  useEffect(() => {
    saveRecord(record)
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
      </header>

      {selectedSlot ? (
        <DetailPanel
          selectedLabel={selectedLabel}
          draft={draft}
          onChange={updateDraft}
          onSave={saveSlot}
          onDelete={deleteSlot}
          onClose={closeDetail}
        />
      ) : (
        <ScheduleGrid record={record} onOpenDetail={openDetail} />
      )}
    </main>
  )
}

export default App

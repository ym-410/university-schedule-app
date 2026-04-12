import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import './App.css'
import { ScheduleGrid } from './components/ScheduleGrid'
import { DetailPanel } from './components/DetailPanel'
import { EMPTY_ITEM } from './constants/schedule'
import type { DayKey, ScheduleItem, ScheduleRecord } from './types/schedule'
import {
  createExportPayload,
  downloadRecordJson,
  loadInitialRecord,
  parseImportRecord,
  parseSlot,
  saveRecord,
  slotKey,
} from './utils/scheduleStorage'

type AppPage = 'menu' | 'schedule' | 'data'

function App() {
  const [record, setRecord] = useState<ScheduleRecord>(loadInitialRecord)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [draft, setDraft] = useState<ScheduleItem>(EMPTY_ITEM)
  const [page, setPage] = useState<AppPage>('schedule')
  const [dataMessage, setDataMessage] = useState('')
  const [importText, setImportText] = useState('')

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
    setDraft({
      ...EMPTY_ITEM,
      ...(record[key] ?? {}),
    })
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
        color: draft.color ?? EMPTY_ITEM.color,
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

  const exportToFile = () => {
    downloadRecordJson(record)
    setDataMessage('JSONファイルを出力しました')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(createExportPayload(record))
      setDataMessage('JSONをクリップボードにコピーしました')
    } catch {
      setDataMessage('コピーに失敗しました。ファイル出力を使ってください')
    }
  }

  const importFromText = () => {
    try {
      const nextRecord = parseImportRecord(importText)
      setRecord(nextRecord)
      setSelectedSlot(null)
      setDataMessage(`JSONを読み込みました（${Object.keys(nextRecord).length}件）`)
    } catch (error) {
      if (error instanceof Error) {
        setDataMessage(error.message)
      } else {
        setDataMessage('読み込みに失敗しました')
      }
    }
  }

  const importFromFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    try {
      const content = await file.text()
      const nextRecord = parseImportRecord(content)
      setRecord(nextRecord)
      setSelectedSlot(null)
      setImportText(content)
      setDataMessage(`JSONファイルを読み込みました（${Object.keys(nextRecord).length}件）`)
    } catch (error) {
      if (error instanceof Error) {
        setDataMessage(error.message)
      } else {
        setDataMessage('ファイル読み込みに失敗しました')
      }
    } finally {
      event.target.value = ''
    }
  }

  const moveToPage = (nextPage: AppPage) => {
    setPage(nextPage)
    setDataMessage('')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Campus Flow</p>
          <h1>大学予定管理アプリ</h1>
        </div>
      </header>

      {page === 'menu' && (
        <section className="menu-panel" aria-label="メニュー選択画面">
          <button type="button" className="menu-card" onClick={() => moveToPage('schedule')}>
            <strong>時間割編集</strong>
            <span>いつもの画面で授業を編集</span>
          </button>
          <button type="button" className="menu-card" onClick={() => moveToPage('data')}>
            <strong>データ管理(JSON)</strong>
            <span>JSON出力・JSONインポート</span>
          </button>
        </section>
      )}

      {page === 'schedule' && selectedSlot ? (
        <DetailPanel
          selectedLabel={selectedLabel}
          draft={draft}
          onChange={updateDraft}
          onSave={saveSlot}
          onDelete={deleteSlot}
          onClose={closeDetail}
        />
      ) : null}

      {page === 'schedule' && !selectedSlot ? (
        <ScheduleGrid record={record} onOpenDetail={openDetail} />
      ) : null}

      {page === 'data' && (
        <section className="data-panel" aria-label="JSONデータ管理画面">
          <h2>JSONデータ管理</h2>
          <div className="data-actions">
            <button type="button" className="btn btn-primary" onClick={exportToFile}>
              JSON出力
            </button>
            <button type="button" className="btn btn-ghost" onClick={copyToClipboard}>
              JSONコピー
            </button>
          </div>

          <label className="field" htmlFor="json-file-input">
            <span>JSONファイルをインポート</span>
            <input id="json-file-input" type="file" accept=".json,application/json" onChange={importFromFile} />
          </label>

          <label className="field" htmlFor="json-import-text">
            <span>JSON文字列を貼り付けてインポート</span>
            <textarea
              id="json-import-text"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={8}
              placeholder="ここにJSONを貼り付け"
            />
          </label>

          <div className="data-actions">
            <button type="button" className="btn btn-primary" onClick={importFromText}>
              JSONインポート
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setImportText('')}>
              入力クリア
            </button>
          </div>

          {dataMessage && <p className="export-message">{dataMessage}</p>}
        </section>
      )}

      <nav className="bottom-nav" aria-label="画面ナビゲーション">
        {page === 'schedule' && (
          <button type="button" className="btn btn-ghost" onClick={() => moveToPage('menu')}>
            メニューを開く
          </button>
        )}
        {page === 'menu' && (
          <button type="button" className="btn btn-ghost" onClick={() => moveToPage('schedule')}>
            時間割へ戻る
          </button>
        )}
        {page === 'data' && (
          <button type="button" className="btn btn-ghost" onClick={() => moveToPage('menu')}>
            メニューへ戻る
          </button>
        )}
      </nav>
    </main>
  )
}

export default App

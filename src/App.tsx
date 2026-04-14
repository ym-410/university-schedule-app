import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import './App.css'
import { ScheduleGrid } from './components/ScheduleGrid'
import { DetailPanel } from './components/DetailPanel'
import { EMPTY_ITEM } from './constants/schedule'
import type { DayKey, ScheduleItem, ScheduleRecord } from './types/schedule'
import {
  consumeGoogleRedirectResult,
  getAuthErrorMessage,
  signInWithGoogle,
  signOutCurrentUser,
  watchAuthState,
} from './bin/aut'
import {
  createExportPayload,
  downloadRecordJson,
  loadInitialRecord,
  parseImportRecord,
  parseSlot,
  saveRecord,
  slotKey,
} from './utils/scheduleStorage'
import { deleteUserScheduleSlot, subscribeUserSchedule, upsertUserScheduleRecord } from './utils/scheduleCloud'

type AppPage = 'menu' | 'schedule' | 'data'

function App() {
  const [record, setRecord] = useState<ScheduleRecord>(loadInitialRecord)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [draft, setDraft] = useState<ScheduleItem>(EMPTY_ITEM)
  const [page, setPage] = useState<AppPage>('schedule')
  const [dataMessage, setDataMessage] = useState('')
  const [importText, setImportText] = useState('')
  const [uid, setUid] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState('ローカルデータを表示中')
  const [isAuthBusy, setIsAuthBusy] = useState(false)
  const [userLabel, setUserLabel] = useState('')
  const [isStandaloneMode, setIsStandaloneMode] = useState(false)

  const isApplyingRemoteRecordRef = useRef(false)
  const lastSyncedTextRef = useRef(JSON.stringify(record))

  useEffect(() => {
    saveRecord(record)
  }, [record])

  useEffect(() => {
    const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandaloneMode(standaloneMedia || iosStandalone)

    const unsubscribe = watchAuthState((user) => {
      if (!user) {
        setUid(null)
        setUserLabel('')
        setSyncMessage('Googleログインでクラウド同期。未ログイン時はローカル利用')
        return
      }

      const label = user.displayName || user.email || 'Googleユーザー'
      setUid(user.uid)
      setUserLabel(label)
      setSyncMessage('Google認証済み。クラウドと同期中')
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    consumeGoogleRedirectResult()
      .then((user) => {
        if (!user) {
          return
        }
        setSyncMessage('Googleログイン完了。クラウド同期を開始します')
      })
      .catch((error) => {
        setSyncMessage(getAuthErrorMessage(error))
      })
  }, [])

  useEffect(() => {
    if (!uid) {
      return
    }

    const unsubscribe = subscribeUserSchedule(
      uid,
      (cloudRecord, fromCache) => {
        if (!cloudRecord) {
          setSyncMessage(fromCache ? 'クラウド未作成。ローカルデータ表示中' : 'クラウド初期化待ち')
          return
        }

        const serialized = JSON.stringify(cloudRecord)
        if (serialized === lastSyncedTextRef.current) {
          setSyncMessage(fromCache ? 'ローカルキャッシュから表示中' : 'クラウドと同期済み')
          return
        }

        isApplyingRemoteRecordRef.current = true
        lastSyncedTextRef.current = serialized
        setRecord(cloudRecord)
        queueMicrotask(() => {
          isApplyingRemoteRecordRef.current = false
        })
        setSyncMessage(fromCache ? 'キャッシュを復元して表示中' : 'クラウド最新データを反映')
      },
      () => {
        setSyncMessage('クラウド取得失敗。ローカルデータ表示中')
      },
    )

    return () => {
      unsubscribe()
    }
  }, [uid])

  useEffect(() => {
    if (!uid || isApplyingRemoteRecordRef.current) {
      return
    }

    const serialized = JSON.stringify(record)
    if (serialized === lastSyncedTextRef.current) {
      return
    }

    let isCancelled = false
    upsertUserScheduleRecord(uid, record)
      .then(() => {
        if (isCancelled) {
          return
        }
        lastSyncedTextRef.current = serialized
        setSyncMessage('クラウドへ保存済み')
      })
      .catch(() => {
        if (isCancelled) {
          return
        }
        setSyncMessage('クラウド保存失敗。ローカルには保存済み')
      })

    return () => {
      isCancelled = true
    }
  }, [record, uid])

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
    const targetSlot = selectedSlot
    const next = { ...record }
    delete next[targetSlot]
    setRecord(next)
    setSelectedSlot(null)

    if (!uid) {
      return
    }

    deleteUserScheduleSlot(uid, targetSlot)
      .then(() => {
        setSyncMessage('クラウド上の予定を削除しました')
      })
      .catch(() => {
        setSyncMessage('クラウド削除に失敗。再同期を試行します')
      })
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

  const handleSignOut = async () => {
    setIsAuthBusy(true)
    try {
      await signOutCurrentUser()
      setSyncMessage('ログアウトしました。ローカルデータ表示中')
    } catch {
      setSyncMessage('ログアウトに失敗しました')
    } finally {
      setIsAuthBusy(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isStandaloneMode) {
      window.open(window.location.href, '_blank', 'noopener,noreferrer')
      setSyncMessage('外部ブラウザを開いてログインしてください')
      return
    }

    setIsAuthBusy(true)
    try {
      await signInWithGoogle()
      setSyncMessage('Google認証ページへ移動します')
    } catch (error) {
      setSyncMessage(getAuthErrorMessage(error))
    } finally {
      setIsAuthBusy(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Campus Flow</p>
          <h1>大学予定管理アプリ</h1>
          <p className="lead">{syncMessage}</p>
          <p className="lead">{uid ? `ログイン中: ${userLabel}` : '未ログイン'}</p>
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
          {!uid ? (
            <button
              type="button"
              className="menu-card menu-auth-card"
              onClick={handleGoogleSignIn}
              disabled={isAuthBusy}
            >
              <strong>
                {isAuthBusy ? '処理中...' : isStandaloneMode ? 'ブラウザで開いてログイン' : 'Googleログイン'}
              </strong>
              <span>
                {isStandaloneMode ? 'PWAでは認証不可。外部ブラウザへ移動' : 'ログインしてクラウド同期を有効化'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="menu-card menu-auth-card"
              onClick={handleSignOut}
              disabled={isAuthBusy}
            >
              <strong>{isAuthBusy ? '処理中...' : 'ログアウト'}</strong>
              <span>ローカル表示モードへ戻す</span>
            </button>
          )}
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

import type { ScheduleItem } from '../types/schedule'

type DetailPanelProps = {
  selectedLabel: string
  draft: ScheduleItem
  onChange: (field: keyof ScheduleItem, value: string) => void
  onSave: () => void
  onDelete: () => void
  onClose: () => void
}

export function DetailPanel({
  selectedLabel,
  draft,
  onChange,
  onSave,
  onDelete,
  onClose,
}: DetailPanelProps) {
  return (
    <section className="detail-panel" aria-label="詳細画面">
      <h2>{selectedLabel} の予定編集</h2>
      <label className="field">
        <span>予定名</span>
        <input
          type="text"
          value={draft.title}
          onChange={(event) => onChange('title', event.target.value)}
          placeholder="例: 情報処理概論"
        />
      </label>
      <label className="field">
        <span>場所</span>
        <input
          type="text"
          value={draft.location}
          onChange={(event) => onChange('location', event.target.value)}
          placeholder="例: A101"
        />
      </label>
      <label className="field">
        <span>メモ</span>
        <textarea
          value={draft.note}
          onChange={(event) => onChange('note', event.target.value)}
          rows={4}
          placeholder="例: レポート提出あり"
        />
      </label>

      <div className="detail-actions">
        <button className="btn btn-primary" onClick={onSave}>
          保存
        </button>
        <button className="btn btn-danger" onClick={onDelete}>
          削除
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          戻る
        </button>
      </div>
    </section>
  )
}

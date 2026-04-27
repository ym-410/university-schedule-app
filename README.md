# 大学予定管理アプリ (Uni Schedule)

時間割形式で大学の予定を管理するWebアプリケーションです。月曜～金曜、1限～7限の時間割をタイル形式で表示し、各コマの予定を記録・管理できます。

## 📋 主な機能

- **時間割表示**: 月曜～金曜、1限～7限のグリッド形式で予定を一覧表示
- **予定管理**: 各コマの予定名、場所、メモを入力・編集・削除
- **データ永続化**: ローカルストレージにデータを自動保存
- **クラウド同期**: Firebaseを使用したGoogle認証とデータクラウド同期
- **データインポート/エクスポート**: JSON形式でのデータ出入力
- **PWA対応**: ホーム画面にインストール可能

## 🛠️ 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite
- **バックエンド**: Firebase (認証・Firestore)
- **スタイル**: CSS
- **開発ツール**: ESLint, TypeScript

## 🚀 セットアップ

### 前提条件
- Node.js 16以上
- npm または yarn

### インストール

```bash
# 依存パッケージのインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開くと、アプリが起動します。

## 📦 ビルド

本番環境用のビルドを生成します：

```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

## 🔍 その他のコマンド

```bash
# プレビューサーバーの起動（ビルド後の確認用）
npm run preview

# ESLintで構文チェック
npm run lint
```

## 📁 プロジェクト構成

```
src/
├── components/          # Reactコンポーネント
│   ├── ScheduleGrid.tsx  # 時間割表示コンポーネント
│   └── DetailPanel.tsx   # 詳細編集パネル
├── bin/                 # ユーティリティ関数
│   ├── firebase.ts       # Firebase設定
│   └── aut.ts            # 認証処理
├── utils/               # ヘルパー関数
│   ├── scheduleStorage.ts # ローカルストレージ操作
│   └── scheduleCloud.ts   # クラウド同期操作
├── constants/           # 定数定義
│   └── schedule.ts       # スケジュール関連定数
├── types/               # TypeScript型定義
│   └── schedule.ts       # スケジュール関連型
├── App.tsx              # ルートコンポーネント
└── main.tsx             # エントリーポイント
```

## 📝 使い方

1. **予定の登録**: グリッド内の任意のコマをタップ
2. **詳細画面で入力**: 予定名、場所、メモを入力
3. **保存**: 保存ボタンをクリック
4. **確認**: メイン画面に自動反映

## 🔐 Firebaseセットアップ

クラウド同期を使用する場合、`src/bin/firebase.ts` でFirebaseプロジェクト設定を行ってください。


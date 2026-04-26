# MyGarden Diary

植物の観察記録を、日付ごとに写真とメモで管理するためのモバイル優先 Web アプリです。

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Heroicons
- JSON ストレージ: `data/db.json`

## 主な機能

- カレンダー表示（月切り替え、未来月の抑止）
- 新規記録作成（日付、植物種、メモ、複数画像）
- 記録詳細（編集、削除、画像全画面表示）
- 記録編集
- 同日複数記録の一覧表示
- 植物種管理（追加、編集、アーカイブ）
- 画像圧縮設定

## セットアップ

```bash
npm install
```

## 開発サーバ起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認します。

## 品質確認

```bash
npm run lint
npm run build
```

## ディレクトリ概要

- `src/app`: 画面と API ルート
- `src/components`: UI コンポーネント
- `src/lib`: 型、バリデーション、ユーティリティ
- `src/hooks`: カスタムフック
- `data`: JSON データとアップロード画像

## 仕様ドキュメント

要件の詳細は [REQUIREMENTS.md](REQUIREMENTS.md) を参照してください。

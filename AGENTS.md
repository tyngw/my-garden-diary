# AGENTS.md

## 目的
このリポジトリで動作する自律エージェントの実装ルールを定義する。

## 技術スタック
- Next.js App Router
- TypeScript
- Tailwind CSS
- Heroicons
- データ保存: data/db.json

## 実装ルール
- 1ファイル150行未満を維持する
- UIは共通コンポーネント化を優先する
- APIは app/api 配下の route.ts に集約する
- 画像はクライアントで圧縮後にアップロードする
- バリデーションは lib/validation.ts で統一する
- 例外はユーザ向けメッセージで返却する

## データ設計
- entries: 観察記録
- plantTypes: 植物種マスタ
- plantTypes は削除禁止、archived=true で非表示化

## 画面設計ルール
- ルートアクセスは /calendar にリダイレクト
- モバイル優先のレスポンシブ設計
- カレンダーセルは画像サムネイルまたはチャットアイコンを表示
- 同日複数件は日付別一覧へ遷移させる

## テスト・検証
- 変更後は npm run lint と npm run build を実行
- 要件変更時は REQUIREMENTS.md を更新する


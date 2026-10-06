# Life is full of things

人生の時間配分を、スマホで見られるWebアプリにしたもの。
生年月日を入れると、ここまでに消費した時間と残りの時間に分けて表示する。

## 開発

```sh
npm install
npm run dev     # 開発サーバ
npm test        # 計算モデルのテスト
npm run build   # dist/ に出力
```

## ページ

- 日本語版: https://nekomami-create.github.io/lifeisfullofthings/
- 英語版: https://nekomami-create.github.io/lifeisfullofthings/en/ （学校制度を US / UK / Japan から選べる）

## 構成

- `src/model/` 計算モデル（年齢区間ごとの時間を積分して集計）
- `src/ui/` 画面部品
- `src/i18n.ts` 日本語・英語の文言と初期値（`<html lang>` で切り替え）
- `en/index.html` 英語版のページ
- `public/` PWA 用の manifest / service worker / アイコン

main に push すると GitHub Actions で GitHub Pages に公開される（リポジトリ設定 Pages の Source を「GitHub Actions」にしておく）。

計画と仕様は [PLAN.md](PLAN.md)。

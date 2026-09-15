ステータス: 確定
最終更新日: 2026-09-15

# OGP 画像

`public/ogp.png` は 1200 × 630 の PNG。AppLibrary の共通 Open Graph / Twitter 画像として使う。

2026-09-15 版は `tools/generate-ogp.py` と `tools/requirements-ogp.txt` で固定した Pillow 11.3.0 を使い、クリーム紙（`--paper` 相当 `#fff8f1`）、電圧ブルーの見出し、白フチのビニール数枚を合成する。ガラスパネルと紫グラデは使わない。OS のシステムフォントと外部画像には依存しない。英字は Pillow 同梱フォント。ビニールはリポジトリ内アイコン。

- `public/apps/pay-cycle/icon.png`
- `public/apps/sublog/icon.png`
- `public/apps/caflog/icon.png`
- `public/apps/dev-tools/icon.png`

形はホームの机と同じ（角丸・円・squircle・やや大きい角丸）。名前はビニールに書かない。配置はガラスパネルのグリッドではなく、キャンバス内の散らばり。上限は 6 件。超えた場合は生成を失敗させる。

初回は `.python-version` と同じ Python 3.13.3 で `python3 -m venv .venv-ogp` を実行し、`.venv-ogp/bin/python -m pip install --disable-pip-version-check --no-deps --require-hashes -r tools/requirements-ogp.txt` で固定依存を導入する。`tools/run-ogp.mjs` はこの専用環境だけを使い、存在しない場合はセットアップ案内を表示して終了する。掲載アプリを追加・削除した場合は、生成スクリプトの `APPS` も更新して `npm run generate:ogp` を実行する。`npm run check:ogp` は生成結果の全ピクセルと commit 済み画像を比較し、`npm run check:docs` と CI で同期を強制する。Vitest は出力形式と 1200 × 630 の寸法も検査する。

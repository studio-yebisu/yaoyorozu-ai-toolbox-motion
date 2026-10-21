# 動く作例の制作コード

ギャラリー向けに制作した42本の作例コードと再現手順です。使用バージョンは[data/preview-production.json](../data/preview-production.json)、制作ログは[作例の制作記録](../docs/作例の制作記録.md)で確認できます。

各例はライブラリの描画・専用エンジン・処理結果・スキルの制作方法を使っています。サイトには動画だけを配信し、ここで使うnpm依存を閲覧者へ読み込ませません。

## 共通のブラウザ作例

Node.js、Python、Chrome、FFmpegを使用。今回はNode 24.18.0、Python 3.13、Chrome 154、FFmpeg 8.1.2。依存はpackage-lock.jsonで固定しています。

```powershell
cd examples/runtime
npm ci
npx vite build --outDir ../../.qa/runtime-dist --emptyOutDir false
cd ../..
python scripts/serve_render.py
```

表示されたURLに`?scene=gsap`を付けると指定作例を読み込みます。フレーム生成の共通契約は`create(ctx)`と`seek(frame)`です。録画は実時間で行わず、各フレームの描画後に取得します。以下のURLは、サーバーが実際に表示したURLへ置き換えます。

```powershell
cd examples/runtime
node capture.mjs --scene gsap --base http://127.0.0.1:PORT --probe
node capture.mjs --scene gsap --base http://127.0.0.1:PORT
```

Chromeの場所が異なる場合は`--chrome`で指定。WASM作例の入力は独自のFFmpeg作品です。先に`python examples/ffmpeg/render_signal.py`を実行し、`.qa/renders/ffmpeg/original.mp4`を`.qa/runtime-dist/source.mp4`へコピーします。Mediabunnyは実VP9/WebMを作って読み戻し、ffmpeg.wasmは実MP4を色・サイズ変換して再生します。Playwrightの4枚は実取得画像を同梱しています。

## Remotion

```powershell
cd examples/remotion
npm ci
npx tsc
npx remotion studio
npx remotion render src/index.ts ReleaseNotes ../../.qa/renders/remotion-skills/original.mp4
npx remotion render src/index.ts VariantFilm ../../.qa/renders/remotion/original.mp4
npx remotion render src/index.ts WhaleyFilm ../../.qa/renders/claude-motion/silent.mp4
```

`ReleaseNotes`にはRemotion制作スキルを適用。`VariantFilm`は独立した可変構成。`WhaleyFilm`の映像と音は`src/whaley-timeline.json`を共有します。音を生成する場合はNumPyを利用して`python synthesize-sfx.py`を実行し、silent.mp4とsfx.wavをFFmpegでmuxします。

## 専用エンジン

- **Anatomy**：[小さなプレスのSVG作例](anatomy/README.md)。`python scripts/prepare_anatomy_example.py`、`node examples/anatomy/build.mjs`で確認済みキットから単独HTMLを生成。共通レンダラーの`--url`で240フレームを取得できます。
- **HyperFrames**：`examples/hyperframes`で`npm ci`、`npx hyperframes lint`、`npx hyperframes render --output ../../.qa/renders/hyperframes/original.mp4 --fps 30 --workers 1`。配布フォントはfonts内のOFLに従います。
- **Motion Canvas**：`examples/motion-canvas`で`npm ci`、`node serve.mjs`。表示された`/render.html`のURLを`node render.mjs URL`へ渡します。実Rendererが専用PNG exporterへ送ったフレームを保存して動画化します。runtimeのPlaywright依存を先に導入してください。
- **Manim Community**：専用Python環境に`manim==0.22.0`を導入し、`python -m manim examples/manim/epicycles.py EpicyclePlate --media_dir .qa/manim-media --format mp4`。図形とTextを使うため、この例はLaTeXを要しません。
- **FFmpeg**：`python examples/ffmpeg/render_signal.py`。ローカルフォントのパスは実行環境へ合わせます。
- **/motion**：`python scripts/fetch_render_inputs.py`でpinnedの上流ファイルを`.qa`だけに取得し、`python examples/motion-skill/prepare.py`で独自SCENEを元テンプレートへ適用。`node .qa/motion-skill/render.mjs .qa/motion-skill/scene.html --stills 1,3,5.5,8.8,11.5`、続いて`--out .qa/renders/motion-skill/original.mp4`。出力フォルダーを先に作成してください。第三者のライセンス未確認テンプレート全文は配布していません。
- **iart kinetic-typography**：`examples/kinetic-typography/index.html`を単独で開けます。`?t=3`で時刻を固定。行のARIA、軽減設定、マスクとstaggerを実装しています。

## 配信用の素材を作る

全レンダリングが完了した状態で、リポジトリのルートから次を実行します。素材のない項目はエラーになり、別の動画で補いません。

```powershell
python scripts/package_previews.py
python scripts/build_site.py
python scripts/check_site.py
```

Riveの作例には公式のrocket.riv（MIT）を使用しています。[素材の帰属と利用条件](../docs/出典とライセンス.md)を掲載しています。オリジナル制作コードは本ガイドのMITで公開しています。

## データと関係図の9作例

2026年10月13日に追加した独自作例です。架空の数値・ノード・接続関係を使用し、実ライブラリのAPIで描画します。Mermaid、Chart.js、Apache ECharts、React Flow、Plotly.js、Nivo、G6、Cytoscape.js、3d-force-graphを使用。使用版は`examples/runtime/package.json`と`package-lock.json`、動画の制作情報は[data/preview-production.json](../data/preview-production.json)へ記録します。

```powershell
cd examples/runtime
npm ci --ignore-scripts
node serve.mjs
```

表示されたURLの`?scene=mermaid`で図解を開けます。`scene`には`mermaid`、`chartjs`、`echarts`、`xyflow`、`plotly`、`nivo`、`g6`、`cytoscape`、`force-graph-3d`を指定できます。各作例は`window.__scene.ready`の完了後、`await window.__scene.seek(frame)`で0〜239のフレームを描きます。実時間での自動再生は行わず、元データ・座標・強調・視点をフレームから更新します。

制作途中のViteではソースの編集による再読み込みが起こるため、連続フレームの取得には静的ビルドを使います。

```powershell
npx vite build --outDir ../../.qa/runtime-dist --emptyOutDir false
cd ../..
python scripts/serve_render.py
```

表示された静的サーバーのURLを`--base`へ渡して取得します。例：

```powershell
cd examples/runtime
$sceneIds = @('mermaid', 'chartjs', 'echarts', 'xyflow', 'plotly', 'nivo', 'g6', 'cytoscape', 'force-graph-3d')
foreach ($sceneId in $sceneIds) {
    node capture.mjs --scene $sceneId --base http://127.0.0.1:PORT
    if ($LASTEXITCODE -ne 0) { throw "Capture failed: $sceneId" }
}
cd ../..
python scripts/package_previews.py mermaid chartjs echarts xyflow plotly nivo g6 cytoscape force-graph-3d
python scripts/build_site.py
python scripts/check_site.py
python scripts/check_previews.py
```

すべて8秒・960×600・30fps、音声なし。Plotlyの作例は2D散布図、NivoはSVGの積み上げ棒、EChartsはSVGのヒートマップ、React FlowはReact版です。CytoscapeはA*探索を使い、3D Force Graphは力学計算後の配置を固定します。全チャート・拡張・フレームワーク版を網羅した検証ではありません。

# CodeVideoModel — 機能紹介と入力動画のデモ

CodeVideoModelは、Three.jsのコードで構図と動きを決め、そのコード動画・参照画像・プロンプトからMiniMax-H3（ref2va）で映像を生成するパイプラインです。[確認した公式README](https://github.com/code-video-model/CodeVideoModel/blob/404e03d67c2977b441622ce94411470bb84984a8/README.md)。

掲載デモで実行したのは、その入力側のコード動画です。配送ローバーがS字道路を走る独自シーンを公式レンダラーで出力しました。参照画像生成とH3による最終映像の生成は未実行です。

CodeVideoModelの公式レンダラーを用い、MiniMax-H3（ref2va）への入力となるコード動画（960×544・24fps・124フレーム、約5.17秒）を制作。Three.jsでS字道路、配送ローバー、障害物を構築し、window.reconstruction.seek(t)によって時刻から車体位置や車輪の回転を一意に計算する設計としました。カメラ軌道データの出力にも対応し、シーンコード側で走行ラインや配色の調整が可能です。

## 再現する

Python、Pillow、Playwright、Chromium、FFmpegを用意し、リポジトリのルートで実行します。

```text
python scripts/prepare_cvm_example.py
python .qa/code-video-model/render.py preview --scene .qa/code-video-model
python .qa/code-video-model/render.py video --scene .qa/code-video-model
```

準備スクリプトは[公式リポジトリの404e03d](https://github.com/code-video-model/CodeVideoModel/tree/404e03d67c2977b441622ce94411470bb84984a8)からレンダラーとThree.jsを取得し、`.qa/code-video-model/`へ配置します。コードと依存ファイルはそのフォルダーで組み合わされます。

出力は`.qa/code-video-model/case/reconstruction.mp4`、カメラ軌道は`camera_trajectory.json`、5フレームの確認画像は`preview.png`です。

## コードを編集する

`case/scene.js`冒頭の`CONFIG`で、走行経路、配色、障害物の高さ、カメラを調整できます。設定を変えた後に準備とレンダリングを再実行します。

`seek(0)` → 終端 → `seek(0)`で同じPNGへ戻ることを公式レンダラーが検査します。公開ページでは、このコード動画を960×600の枠へ余白付きで配置し、30fpsで配信しています。

[作例のMP4](../../assets/previews/code-video-model.mp4) · [GIF](../../assets/previews/code-video-model.gif) · [ネイティブのコード動画](../../assets/previews/code-video-model-native.mp4)

## AI動画へつなぐ

Three.jsのコードで構図や動きを組み、その動画と参照画像をもとにMiniMax-H3（ref2va）で映像を生成する仕組み。

コード動画側はPython、Playwright、ブラウザ、FFmpeg。H3動画生成の公式手順ではUbuntu 22.04とCUDA 12.6対応GPU環境。公式ではコード生成にGPT-6、参照画像生成にGPT-Image-2も使用。

この作例は、その入力側のコード動画です。参照画像とH3を使う後工程は[公式README](https://github.com/code-video-model/CodeVideoModel)に掲載されています。

公開コードの条件はApache-2.0、Three.jsはMITです。準備フォルダーにライセンスを同梱します。このガイドのシーンコードには[MIT](../../LICENSE)が適用されます。

# Motion Reelの独自作例

同じカードをブリーフ、形、共通時計、フレームレビューへ変形させる8秒のコード動画です。商品画面や第三者の素材は使わず、Studio Yebisuの独自の図形と文字で制作しました。

ソースは[Motion Reel 0.1.0](https://github.com/studio-yebisu/motion-reel/tree/56198544e69201b1c202e0c00fb90b568a729824)のひな形をこのフォルダへ収録しています。`index.html`を開くと、再生・停止・時刻指定ができます。

ガイドの[MP4](../../assets/previews/motion-reel.mp4)、[GIF](../../assets/previews/motion-reel.gif)、[ポスター](../../assets/previews/motion-reel.webp)は、そのスキルのレンダラーを実行した出力です。幅960×600、30fps、8秒、240フレーム。4つの効果音は画面と同じ秒のリストから合成しました。音の聴取レビューは別途必要です。

再現：スキルのリポジトリをcloneして`npm ci --ignore-scripts`を実行し、以下のパスを自分の環境へ合わせます。出力先は空の専用フォルダにします。

```text
node <motion-reel>/skills/motion-reel/scripts/render.mjs --project <このフォルダ> --out <空の出力先> --video --synth
```

横長・縦長の書き出し、PNG一致、音量、素材ハッシュの記録は[validation.json](validation.json)へ収録しています。制作コード・図版・効果音はMIT。

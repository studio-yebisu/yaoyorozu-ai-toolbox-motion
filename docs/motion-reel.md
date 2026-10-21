# Motion Reel：制作工程をスキルへ

[seecoの元記事](https://x.com/seeconvm/status/2106096193235259564)をきっかけに、ブリーフ、任意時刻の描画、音の同期、出力レビューをつなぐ[日本語スキル](https://github.com/studio-yebisu/motion-reel)を制作しました。元記事の本文や画像は再配布せず、説明・ひな形・スクリプト・作例はStudio Yebisuの独自実装です。

商品紹介やUI、文字と図形の短い映像が対象です。Claude Code、Codexなどで利用でき、特定モデルやAPIキーは必須ではありません。ブリーフと実素材から各場面の状態を設計し、描画したフレームを見て修正するための判断基準を持ちます。

同梱ツールは `window.seek(seconds)` で画面を直接描画し、PlaywrightとFFmpegで書き出します。別時刻を挟んでも同じPNGになることを確認し、代表時刻の一覧、速い変形の連続フレーム、MP4、ポスター、実行記録を残します。元のコードを編集し、同じタイムラインから各縦横比の配置を描き直せます。

```text
npx skills add studio-yebisu/motion-reel --skill motion-reel
```

2026年10月13日に横長960×600と縦長540×960を、8秒・30fpsで実書き出ししました。技術的な再現性と代表フレームを確認しています。音量は測定し、聴取レビューは未実施です。作品の品質は技術的な検査と分けて判断します。

[作例の再現手順](../examples/motion-reel/README.md) · [検証記録](https://github.com/studio-yebisu/motion-reel/blob/main/docs/validation.md) · [スキル本体](https://github.com/studio-yebisu/motion-reel/blob/main/skills/motion-reel/SKILL.md)

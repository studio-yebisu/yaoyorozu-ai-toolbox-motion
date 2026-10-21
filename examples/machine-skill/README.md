# Machine Skill — 機能紹介と操作デモ

AirsupのMachine Skillは、機械の名前や見せたい動作をAIエージェントに伝え、操作できる3Dシミュレーションと紹介動画を制作するスキルです。寸法・材質・計算モデルを調べ、断面・分解・X線・入力変更・故障の再現を組み込みます。

ここに掲載したコンプレッサーは、その機能を試すためのデモです。回転数を変え、断面・分解・X線・スロー・部品名・吸気弁の故障を操作できます。

**[ブラウザで操作する](https://studio-yebisu.github.io/awesome-claude-motion-design-ja/examples/machine-skill/)** · [28秒の紹介動画](../../assets/previews/machine-skill.mp4) · [GIF](../../assets/previews/machine-skill.gif)

Codexが[AirsupのMachine Skill](https://github.com/AirsupHQ/machine-skill/blob/35074a98b14c5f414e446cbb53bd8b1798ff70cc/SKILL.md)を参照して、機械形状、計算、画面、映像構成を制作しました。実行キットと録画ツールは同じコミットから取得しています。

## 一覧から、その場で操作する

作例一覧の「3Dサイトを操作」で、実際のページを拡大表示します。「動画を見る」で28秒の映像へ切り替えられます。「別タブで開く」から単独ページへ進めます。

3Dサイトは操作ボタンを押したときに読み込み、動画へ戻すか拡大表示を閉じると描画を終了します。操作ページ内でもEscapeで拡大表示を閉じられます。スマホにも3D操作と表示の切り替えを用意しています。

```powershell
node examples/machine-skill/check-gallery.mjs
```

## 編集する場所

- [machine.js](machine.js)：寸法、部品、材質、配管、ラベル、操作、28秒の演出。
- [solver.mjs](solver.mjs)：スライダークランクと0次元の圧縮モデル。
- [style.css](style.css)：日本語画面、モバイル表示。
- [build.mjs](build.mjs)：編集ソースとキットを単一の[index.html](index.html)へまとめるビルド。

ページ本体には描画キットと機械コードが入っています。Three.js 0.170.0とWebフォントはCDNから読み込みます。初回閲覧にはネット接続とWebGL 2対応ブラウザが必要です。読み込みに失敗した場合は動画へのリンクを表示します。

```powershell
cd examples/machine-skill
npm ci
npm run build
node check.mjs
node scripts/record.mjs index.html ../../.qa/renders/machine-skill/original.mp4 --root ../.. --w 960 --h 600 --ss 1 --fps 30
```

Windowsでは既存のChromeを使います。別の実行ファイルを使う場合は`CHROME_PATH`を指定できます。録画にはFFmpegも必要です。`?film=1`では時計を明示的に進めるため、書き出しがフレーム単位で再現できます。

## 計算モデル

内径36 mm、行程30 mm、レシーバー7.6 L、流量の規模は[Makita AC001Gの公開仕様書](https://cdn.makitatools.com/apps/cms/doc/prod/AC0/4de11a1e-2abb-436b-a293-7600a5d06a84_AC001G-IM_NA3-2204.pdf)を参考にしました。外観、連接棒55 mm、クランク1,400 rpm、余隙率6%、ポリトロープ指数1.3、機械効率0.84はこの作例の設計値です。

吐出先を6.2 barのゲージ圧に固定しています。計算には大気圧を加えた絶対圧を使います。1,400 rpmで**理論吐出量33.707 L/min、所要動力186.24 W**。参考機の公称流量は34 L/minですが、この作例の内部形状やクランク回転数は独自設計です。

- ピストン位置は、クランク半径と連接棒長から求めます。
- 余隙内の気体の再膨張を考慮した容積効率から、サイクル平均の吐出量を求めます。
- 圧縮室内の圧力は、再膨張・吸入・圧縮・吐出の4区間で計算します。
- 吸気弁を開いたままにすると、室内圧力が大気圧に保たれ、吐出量が0になります。復帰ボタンで再開できます。

式の参考：[Greg Phillippi / Basic Thermodynamics of Reciprocating Compression, Texas A&M, 2016](https://oaktrust.library.tamu.edu/items/bfc4d7f7-d725-4d8f-82f3-518fd610e931)。弁の圧損・漏れ・タンク充填・温度変化は省略しています。表示する動きは1:30、数値は実際の回転数から計算します。「スロー」は動きだけをさらに遅くします。

## 帰属とライセンス

- 独自の機械・計算・画面・演出コード：© 2026 Studio Yebisu、[MIT](../../LICENSE)。
- `vendor/lab-kit.js`、`scripts/`：© 2026 Airsup、[MIT全文](vendor/LICENSE.txt)。キットは取得版のままです。録画ツールの変更はWindowsのChrome利用と、録画中間ファイルの削除方法です。
- Three.js：MIT。固定版0.170.0をjsDelivrから読み込みます。
- Webフォント：Google FontsのInstrument Serif、Inter、JetBrains Mono（OFL）。フォントファイル自体はこの作例へ同梱していません。
- 発見経路：[Konstantin Saifoullineの紹介投稿](https://x.com/konstantinsaifo/status/2109782163591721100)。機能とMITライセンスは公開リポジトリで確認しています。

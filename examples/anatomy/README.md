# Anatomyで小さなプレスを図解する

65個の立体部品で構成した、架空の小さなプレスのオリジナル作例です。Anatomyの実際のSVG描画キットを使用しています。押し型は8秒で24mm往復し、移動量と隙間を同じモデルから表示します。スライダーと左右キーで位置を変えられ、動きを軽減する設定では自動再生を停止します。

## 準備と表示

Node.js 20.10以上とPython 3を使用します。第三者の描画キットは、公開するツリーの外にあるignoredの`.qa/anatomy/`へ、確認済みコミットを指定して取得します。エージェントへのグローバルインストールは行いません。

リポジトリのルートで実行します。

```powershell
python scripts/prepare_anatomy_example.py
node examples/anatomy/build.mjs
python -u -m http.server 0 --bind 127.0.0.1
```

表示されたURLに`/examples/anatomy/index.html`を付けるとライト版を開けます。ダーク版は`dark.html`。`?t=2.5`で時刻を固定できます。外部フォントやネットワークへの依存はありません。

- [build.mjs](build.mjs)：部品、描画、操作、両テーマのHTML生成。
- [model.mjs](model.mjs)：往復運動と移動量・隙間のモデル。
- [index.html](index.html)：単独で開けるライト版。
- [dark.html](dark.html)：単独で開けるダーク版。

## 動画とGIF

共通レンダラーのPlaywright依存を`examples/runtime`で導入済みの状態で、次を実行します。`PORT`はサーバーが表示した番号に置き換えてください。

```powershell
cd examples/runtime
node capture.mjs --scene anatomy --url http://127.0.0.1:PORT/examples/anatomy/index.html --probe
node capture.mjs --scene anatomy --url http://127.0.0.1:PORT/examples/anatomy/index.html
cd ../..
python scripts/package_previews.py anatomy
python scripts/build_site.py
python scripts/check_site.py
```

録画は実時間の操作を収録する方式ではなく、`seek(frame)`で240フレームを順に描画してから取得します。

## 使用範囲と帰属

確認済み版は[wheresryan22/anatomy / e6600ff](https://github.com/wheresryan22/anatomy/tree/e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f)。[作者の紹介投稿](https://x.com/wheresryan22/status/2108948624004526516)からガイドへ追加しました。

SVGキットの`slabOf`、`solidSvg`、`fitProjection`、`depthOf`、`plateHtml`を使用し、部品の四段階の陰影と、時刻から求めた押し型の移動を描いています。部品配置・機構・操作・モデルは本ガイドのオリジナルです。Anatomyの図解方針をCodexが実装しました。この作例でWebGLやベータ版3Dモードを実行したとは扱いません。

Anatomyの描画キットはMIT、Copyright (c) 2026 Ryan。[MIT全文](ANATOMY-LICENSE.txt)を同梱し、キットから生成したHTMLにも掲載しています。本ガイドの制作コードは[MIT](../../LICENSE)です。

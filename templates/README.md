# Claude モーショングラフィック制作ガイド

Claudeを活用したモーショングラフィックスの制作スタックと実装コードをまとめたガイドです。{{TOTAL}}のスキル・ツールそれぞれに対応する作例動画、GIF、編集可能な実装コードを掲載しています。

**[サイトを開く]({{SITE_URL}})** · **[{{PREVIEW_TOTAL}}本の作例を見る]({{SITE_URL}}projects.html)** · **[制作の始め方]({{SITE_URL}}guide.html)**

![Claude モーショングラフィック制作ガイド](assets/og-card-motion-v4.png)

## ガイドの内容

- **投稿15件の使い分け**：[モーション制作スキル7件を新たに紹介]({{SITE_URL}}guide.html#motion-production-skills)。用途・導入・利用条件を比較し、既掲載7件とUI/UX側の1件へ案内します。新7件は資料の確認段階で、作例の本数とは分けています。
- **{{PREVIEW_TOTAL}}本の作例**：テキスト演出、UI、3D、2D、図解など各ツールの特性に合わせた作例。拡大再生して動きを確認できます。
- **GIFと実装コード**：動きと実装をその場で確認し、コードをコピーして再現・編集できます。
- **6カテゴリと4つの制作ルート**：用途や実行環境に応じた組み合わせを選択できます。
- **Claude Motion（公式ベータ）**：[チャットから制作する方法]({{SITE_URL}}guide.html#claude-motion)。Team・Enterpriseの利用条件と、Charlie Hillsの制作手順・16種の作例記事を紹介しています。
- **動きを詰める方法**：[指示の具体化とフレーム単位の修正]({{SITE_URL}}guide.html#motion-direction)。実験記事の要約と、コピーして使える修正ブリーフを掲載しています。
- **グラフと関係図**：[数値・工程・ネットワークを動かす]({{SITE_URL}}guide.html#data-visualization)。Chart.js、ECharts、Mermaid、React Flowなど9件を追加し、用途と独自作例を比較できます。
- **40秒の紹介動画**：作例31本を用いた紹介映像。[制作コード・構成表](examples/remotion/PROMO_README.md)（Suno楽曲含む）も確認できます。

## 4つの制作ルート

チャット内で制作する公式サービスは[Claude Motionの案内](docs/Claude%20Motion.md)へ。下の4ルートは、コードと制作環境を組み合わせてつくる方法です。

| つくりたいもの | 主なスタック | 詳細解説 |
| --- | --- | --- |
| 商品紹介・文字演出 | HyperFrames + 公式制作スキル + HTML | [HTML動画ルート]({{SITE_URL}}guide.html#html) |
| テンプレート・数値差し替え | Remotion + 公式Agent Skills + React | [React動画ルート]({{SITE_URL}}guide.html#react) |
| 操作に反応するUI・Web | Motion / GSAP + Emil Kowalski Skills | [Web UIルート]({{SITE_URL}}guide.html#web) |
| 数式・アルゴリズムの図解 | Manim / Motion Canvas + シーン構成 | [解説動画ルート]({{SITE_URL}}guide.html#explain) |

## スキル・ツール一覧

{{README_TABLE}}

## 再現と編集の手順

各項目には用途、必要要件、Claudeとの連携方法、公式リポジトリおよびライセンスへのリンクを掲載しています。RemotionやGSAPの独自条件、各モデルやスキルの利用条件は導入前にご確認ください。

- [ツールの選定基準](docs/調査ノート.md)
- [ライセンスと出典一覧](docs/出典とライセンス.md)
- [作例の制作記録](docs/作例の制作記録.md)
- [制作コードと再現手順](examples/README.md)
- [使用制作スタック](docs/制作スタック.md)
- [動きを詰める：実験記事の要約と実装の参照先](docs/動きを詰める.md)
- [グラフと関係図：追加9件の用途と確認範囲](docs/データと図解.md)
- [投稿15件から選ぶモーション制作スキル・ツール](docs/モーション制作スキル15選.md)

使用バージョン・動画ファイル・コードの詳細は[data/preview-production.json](data/preview-production.json)、リポジトリの検証データは[data/verification.json](data/verification.json)に記録しています。

## ローカルでの表示方法

Python 3環境で静的サイトを生成・プレビューできます。

```text
python scripts/build_site.py
python scripts/check_site.py
python -u -m http.server 0 --bind 127.0.0.1
```

実行後にターミナルに表示されたURLをブラウザで開きます。公開はGitHub Pagesの`main`ブランチ（ルートディレクトリ）です。

編集対象ファイルは[data/curation.json](data/curation.json)、[templates](templates/)、[assets](assets/)です。`index.html`、`projects.html`、`guide.html`、`data/projects.json`、本READMEはスクリプトによるビルド生成物です。詳細は[コントリビューションガイド](CONTRIBUTING.md)を参照してください。

一次資料の更新には[scripts/collect_sources.py](scripts/collect_sources.py)を使用します（`--evidence-dir`には公開リポジトリ外のパスを指定）。

## 関連ガイド

- [Claude UI・UXデザインガイド](https://github.com/studio-yebisu/awesome-claude-ui-ux-design-ja)：画面設計・操作性・アクセシビリティのスキルを別リポジトリに整理。
- [AIスライド制作ガイド](https://studio-yebisu.github.io/awesome-codex-ppt-skills-ja/)

## ライセンス

本ガイドの文章、データ、コード、図版は[MITライセンス](LICENSE)で公開しています。各ライブラリ、フォント、素材、APIには個別のライセンスが適用されます。詳細は[出典とライセンス](docs/出典とライセンス.md)をご確認ください。

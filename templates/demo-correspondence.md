# 掲載ツール・スキルとデモの対応

2026年10月13日整理。対象は掲載中の{{TOTAL}}件です。元のスキルやツールが何をするものかと、掲載したデモで何を実行したかを対応づけています。

## 掲載の原則

1. カードの主見出しは元のスキル・ツール名。その役割と用途をデモより先に説明します。
2. デモの見出しは、実際に使った機能を表す題名にします。「配送ローバーの走行」だけではCodeVideoModelの役割が分からないため、「AI動画への入力となる走行のコード動画を作る」と記載します。
3. スキルは制作・レビューの規則、描画ライブラリは画面を描く実行コード、レンダラーはフレーム取得・動画出力を担当します。索引と事例資料には、選択・参照した対象を記録します。
4. スキル集を紹介する場合、デモに適用した個別スキル名と原文のパス・コミットを示します。独自に作った実装と、上流のキットやレンダラーを実行した部分も記録します。
5. 件数は掲載リポジトリの数です。デモの本数や索引内のスキル数を足し合わせて「スキル数」とは呼びません。

各デモは、対応表に記した機能の使用例です。元のリポジトリの全機能を検証したという意味ではありません。映像の題材、スキルの規則、描画・書き出しの担当を一つの名前へまとめないようにします。

## 対応を読むときの要点

- **CodeVideoModel**：元は「Three.jsのコード動画＋参照画像＋プロンプト→MiniMax-H3による動画生成」のパイプライン。配送ローバーは、その入力側のコード動画を公式レンダラーで制作した例です。参照画像生成とH3による最終映像は未実行です。[確認した公式README](https://github.com/code-video-model/CodeVideoModel/blob/404e03d67c2977b441622ce94411470bb84984a8/README.md)。
- **iart.ai Motion Skills**：掲載リポジトリは個別パックへの索引。文字のデモには別リポジトリの`kinetic-typography`を選んで適用しました。索引の説明と選択したスキルの説明をそれぞれ記載します。
- **Opus 5.5 Video Prompts**：動画制作の事例・プロンプト資料。Canvasのデモは資料の方法を参考に制作した独自作品で、「この資料をエンジンとして実行した」とは記載しません。
- **Motion Graphics Skill Pack**：デモに選んだのは`apple-launch-film`。その設計規則を独自Canvas作品へ適用した範囲を記載します。
- **claude-motion / claude-motion-design**：WhaleyとHowseenの別リポジトリです。前者は共通の時間表と音の規則をRemotion・自作効果音へ適用。後者はHTMLの`seek(t)`、共有要素、拍の規則を独自実装へ適用しました。
- **Rive Runtimes / Playwright**：Riveは既存`.riv`素材の再生、Playwrightはブラウザ操作と撮影を担当。素材の新規制作や、撮影対象の描画を担当したと受け取られる説明は避けます。
- **Machine Skill**：機械の調査、寸法・材質・計算モデル、操作できる3Dと紹介動画を制作するスキル。コンプレッサーはその機能を試すためのデモです。

## 全件の対応表

一次資料は取得したコミットに固定したREADME・スキル原文、実行範囲は制作コードと制作記録を参照しています。字幕、地図、APIを使う画像・動画生成など、各デモの実行範囲に含めていない機能については、この表から実行済みと判断しないでください。

{{DEMO_CORRESPONDENCE}}

## 更新する場所

- 元の役割・用途：[data/curation.json](../data/curation.json)。
- 元資料の取得日・コミット：[data/verification.json](../data/verification.json)。
- デモの機能名・適用した役割・説明・実行範囲：[data/preview-notes.json](../data/preview-notes.json)と公開マニフェストの[data/preview-production.json](../data/preview-production.json)。
- 適用したスキルの原文：[data/skill-inputs.json](../data/skill-inputs.json)。
- 制作の経緯・使用環境・再現：[作例の制作記録](作例の制作記録.md)と[各作例の実行方法](../examples/README.md)。

本書の対応表はカードと同じデータから生成します。補足説明の編集元は[templates/demo-correspondence.md](../templates/demo-correspondence.md)。`python scripts/build_site.py`でページと本書を再生成し、`python scripts/check_site.py`で件数・リンク・ページを確認します。表示順、検索、拡大表示、スマホの配置はブラウザで確認します。

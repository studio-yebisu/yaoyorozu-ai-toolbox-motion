# Claude Motion：チャットから短い説明映像をつくる

Claude MotionはAnthropic公式のベータ機能です。Claudeのチャットで制作を依頼し、文字、グラフ、図形、画像を動かすコードを編集してMP4へ書き出せます。[公式発表](https://claude.com/resources/articles/dashboards-and-motion)は2026年10月8日公開です。

## 使える条件

2026年10月13日の[公式ヘルプ](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)確認では、MotionテンプレートはTeamとEnterpriseでベータ提供されています。

- Teamでは既定で有効です。
- Enterpriseでは既定で無効です。所有者がOrganization settings > Artifactsで有効にします。
- ArtifactsにはCloud code execution and file creationの有効化も必要です。

通常のチャットでアニメーションを依頼するか、ArtifactsのMotionテンプレートから始めます。内容やタイミングを調整し、完成したアニメーションをMP4へ出力します。

本ガイドに掲載済みの`whaleyxbt/claude-motion`やClaude Code向けの`/motion`スキルは、別の作者が提供する制作環境です。公式のClaude Motionとは導入方法が異なります。

## 今回の投稿と制作記事

[Charlie HillsのX投稿](https://x.com/charliejhills/status/2109956200507076799)は、Apple風のアニメーション16種と、共通の制作ブリーフを固定して場面の一行を差し替える方法を紹介しています。

- [Claude /motion](https://charliehills.substack.com/p/claude-motion-graphics)：2026年10月11日公開。通常のチャットから制作を始める手順と、最初に渡すブリーフを説明しています。記事の後半は無料購読者向けです。
- [16 Claude Motion prompts (and my brief)](https://charliehills.substack.com/p/16-claude-motion-prompts-and-my-brief)：作例16種、共通ブリーフ、場面の一行、書き出し設定を案内しています。ブリーフと16種のプロンプト本体は無料購読登録が必要です。

制作の入口と、複数の映像で見た目をそろえる考え方が参考になるため、[制作ガイド](https://studio-yebisu.github.io/awesome-claude-motion-design-ja/guide.html#claude-motion)に追加しました。ガイドに載せた日本語の短尺ブリーフは本ガイドの独自例です。

## 選ぶときの視点

手元の文章やグラフを短い説明映像にする際の候補になります。コードをローカルで管理し、繰り返し書き出す制作には、既存のHyperFrames・Remotionなどのルートも比較できます。

作者が述べるApple風の仕上がりや制作時間は、その制作例についての報告です。今回は公式資料、元投稿、記事の公開部分を確認しました。Claude Motionでの生成、MP4書き出し、購読部分のプロンプトの再現検証は実施していません。

確認日：2026年10月13日（日本時間）。公式サービスと参考記事として案内し、リポジトリ一覧の件数には加えていません。

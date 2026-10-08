# Engineering Doctrine

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md) · **日本語**

**Engineering Doctrine** は、規律あるソフトウェア開発を支援する Claude Code プラグインです。Claude が変更を加える前に問題の根本原因、責任の所在、不変条件を把握し、既存のアーキテクチャを尊重しながら必要な範囲だけを修正し、実際の検証結果を踏まえて作業を完了できるようにします。

## インストール

```bash
claude plugin marketplace add onetwohour/claude-plugins
claude plugin install engineering-doctrine@onetwohour
```

インストール後、新しい Claude Code セッションを開始してください。

## 使い方

特別なコマンドは必要ありません。普段どおりに作業を依頼できます。

```text
ログイン後にセッションが断続的に失われる原因を調べて修正して。
```

```text
このモジュールの責務の分担を分析し、必要であればリファクタリングして。
```

```text
このバグを再現して修正し、回帰テストも追加して。
```

プラグインは作業内容に応じて関連する指針を選択します。影響範囲が限られた小さな変更では手順を簡潔に保ち、アーキテクチャ、状態、セキュリティ、データ、並行処理、マイグレーションに関わる変更では、より慎重な検討を促します。

## 基本原則

- **変更する前に理解する：** 症状だけでなく、根本原因、責務、状態、失敗経路を確認します。
- **既存の設計を尊重する：** 同じ責務を持つ別の仕組みや、競合する正規データを不用意に増やさず、既存の抽象化を活用します。
- **変更範囲を適切に絞る：** 必要性が説明できる範囲だけを修正し、既存の作業やデータを保護します。
- **実際の動作を検証する：** 関連する検査を実行し、失敗する場合も考慮して、観測した事実と推測を区別します。
- **完了前にレビューする：** 最終的な差分と検証結果を確認し、根拠のある内容だけを正確に報告します。

## 規範の全文

詳細な原則については、[Engineering Doctrine（英語）](doctrine/ENGINEERING_DOCTRINE.md)を参照してください。

## ローカルでの使用

インストールせずに、クローンしたリポジトリから直接プラグインを実行することもできます。

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir` オプションは、現在のセッションにのみ適用されます。

## ライセンス

[Apache-2.0](LICENSE)

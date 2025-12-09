# 管理者ダッシュボード仕様書

## 概要

CloudPort管理者専用のダッシュボード機能の仕様書。
通常のユーザーインターフェースとは独立した管理者専用UIを提供します。

---

## 1. 専用ヘッダーコンポーネント

### 現在の問題点
- 通常ユーザーと同じHeaderコンポーネントを使用
- 案件一覧、契約、支払いなど管理者に不要なリンクが表示される
- 管理者専用の機能へのナビゲーションがない

### 新規作成: AdminHeader.tsx

#### 構成要素
```tsx
<AdminHeader>
  - ロゴ (CloudPort Admin)
    └─ クリックで管理者ダッシュボードトップへ

  - ナビゲーションメニュー
    ├─ ダッシュボード（契約・返金管理）
    ├─ ユーザー管理
    ├─ 案件管理
    ├─ システムログ
    └─ 設定

  - ユーザー情報
    ├─ 管理者アイコン
    ├─ メールアドレス表示
    └─ ログアウトボタン
</AdminHeader>
```

#### デザイン方針
- ダークテーマを継承
- 管理者専用であることを明示（「Admin」バッジなど）
- 通常ヘッダーとは異なる配色（例: オレンジアクセント → レッドアクセント）
- レスポンシブ対応（モバイルでもハンバーガーメニュー）

---

## 2. 機能別ページ仕様

### 2.1 ダッシュボード（契約・返金管理）

**ファイル**: `frontend/src/pages/Admin/AdminDashboard.tsx`

#### 現在実装されている機能
- ✅ 統計カード
  - 総取引件数
  - 手数料収益
  - 総契約金額
- ✅ フィルター機能
  - ステータス別フィルター（全て/決済済み/未決済）
  - 検索機能（契約ID、決済ID、企業名、技術者名）
- ✅ 契約一覧テーブル
  - 契約ID、案件名、企業名、技術者名
  - 契約金額、手数料、ステータス
  - 決済ID、決済日時
  - 返金ボタン
- ✅ 返金機能
  - モーダル確認ダイアログ
  - PAY.JP経由の返金処理

#### 追加すべき機能

**統計グラフの追加**
- **期間別収益グラフ**
  - 日別/週別/月別の切り替え
  - 手数料収益の推移
  - グラフライブラリ: Recharts or Chart.js

- **契約成立率グラフ**
  - 応募数 vs 契約数の比率
  - 月別の推移

- **返金率の表示**
  - 返金件数 / 総決済件数
  - トレンド表示

**期間選択機能**
- カレンダーピッカーで期間を指定
- プリセット（今日/今週/今月/先月/過去3ヶ月）

**エクスポート機能**
- CSV形式でのデータエクスポート
- フィルター適用後のデータのみエクスポート可能

---

### 2.2 ユーザー管理ページ（新規作成）

**ファイル**: `frontend/src/pages/Admin/AdminUsers.tsx`

#### 機能要件

**ユーザー一覧**
- 全ユーザーのリスト表示
- フィルター
  - ユーザータイプ（企業/エンジニア/全て）
  - アカウント状態（有効/無効/全て）
  - MFA設定状況（有効/無効）
  - 登録日期間
- 検索
  - 名前、メールアドレス、ユーザーID

**表示項目**
| 項目 | 説明 |
|------|------|
| ユーザーID | DynamoDBのキー |
| ユーザー名 | 表示名 |
| メールアドレス | 連絡先 |
| ユーザータイプ | 企業/エンジニア |
| 登録日 | createdAt |
| 最終ログイン | lastLoginAt |
| MFA状態 | 有効/無効 |
| アカウント状態 | 有効/無効/停止中 |
| 操作 | 詳細/編集/無効化 |

**ユーザー詳細モーダル/ページ**
- 基本情報
  - プロフィール詳細
  - 登録情報の閲覧
- アクティビティ
  - ログイン履歴（DynamoDB: login-devices テーブル）
  - 最近の活動（案件投稿/応募/契約）
- セキュリティ
  - ログイン失敗履歴（DynamoDB: login-attempts テーブル）
  - 決済失敗履歴（DynamoDB: payment-attempts テーブル）
  - 新デバイスログイン通知の履歴
- 統計
  - 企業の場合: 投稿案件数、契約数、支払総額
  - エンジニアの場合: 応募数、契約数、獲得総額

**管理操作**
- アカウント有効化/無効化
- パスワードリセット要求の送信
- MFA強制設定/解除
- アカウント削除（論理削除）
- 備考・メモの追加

**バックエンドAPI（新規作成必要）**
```
GET  /admin/users              # ユーザー一覧取得
GET  /admin/users/:userId      # ユーザー詳細取得
PUT  /admin/users/:userId      # ユーザー情報更新
POST /admin/users/:userId/disable   # アカウント無効化
POST /admin/users/:userId/enable    # アカウント有効化
GET  /admin/users/:userId/activity  # アクティビティ取得
GET  /admin/users/:userId/security  # セキュリティログ取得
```

---

### 2.3 案件管理ページ（新規作成）

**ファイル**: `frontend/src/pages/Admin/AdminJobs.tsx`

#### 機能要件

**案件一覧**
- 全案件のリスト表示
- フィルター
  - ステータス（公開中/終了/削除済み）
  - 契約形態
  - AWS必須資格
  - 登録日期間
- 検索
  - 案件タイトル、企業名、案件ID

**表示項目**
| 項目 | 説明 |
|------|------|
| 案件ID | DynamoDBのキー |
| タイトル | 案件名 |
| 企業名 | 投稿企業 |
| 契約金額 | 月額単価 |
| 応募数 | 総応募数 |
| 契約数 | 成立した契約数 |
| ステータス | 公開中/終了/削除済み |
| 投稿日 | createdAt |
| 操作 | 詳細/編集/削除 |

**案件詳細**
- 案件の全情報表示
- 応募者リスト
- 契約情報

**管理操作**
- 案件の公開/非公開切り替え
- 不適切な案件の削除
- 案件内容の編集（必要に応じて）

**統計情報**
- カテゴリ別案件数
- 平均契約金額
- 人気のAWSサービス・スキル

**バックエンドAPI（新規作成必要）**
```
GET    /admin/jobs                 # 案件一覧取得
GET    /admin/jobs/:jobId          # 案件詳細取得
PUT    /admin/jobs/:jobId          # 案件更新
DELETE /admin/jobs/:jobId          # 案件削除
GET    /admin/jobs/statistics      # 統計情報取得
```

---

### 2.4 システムログ・監視ページ（新規作成）

**ファイル**: `frontend/src/pages/Admin/AdminLogs.tsx`

#### 機能要件

**セキュリティイベント**

1. **ログイン失敗の追跡**
   - データソース: DynamoDB `cloudport-login-attempts-dev`
   - 表示項目
     - メールアドレス
     - 失敗回数
     - 最終失敗日時
     - ロック状態
     - IPアドレス（可能であれば）
   - アクション
     - ロック解除
     - 失敗記録のクリア

2. **決済失敗の追跡**
   - データソース: DynamoDB `cloudport-payment-attempts-dev`
   - 表示項目
     - ユーザーID
     - 失敗回数
     - 最終失敗日時
     - エラーメッセージ
     - 対象契約ID
     - ロック状態
   - アクション
     - ロック解除
     - 失敗記録のクリア

3. **新デバイスログイン**
   - データソース: DynamoDB `cloudport-login-devices-dev`
   - 表示項目
     - ユーザーID
     - デバイスID
     - User-Agent
     - IPアドレス
     - 最終ログイン日時
     - 初回ログイン日時

**CloudWatch統合**

1. **アラーム状態表示**
   - Lambda関数エラー率
   - API Gateway 4xx/5xxエラー率
   - その他の設定済みアラーム
   - ステータス: OK / ALARM / INSUFFICIENT_DATA

2. **エラーグラフ**
   - 期間選択可能（1時間/6時間/24時間/7日間）
   - Lambda関数のエラー率推移
   - API Gatewayのエラー率推移

**バックエンドAPI（新規作成必要）**
```
GET /admin/logs/login-attempts      # ログイン失敗履歴
GET /admin/logs/payment-attempts    # 決済失敗履歴
GET /admin/logs/login-devices       # デバイスログイン履歴
GET /admin/logs/cloudwatch-alarms   # CloudWatchアラーム状態
GET /admin/logs/cloudwatch-metrics  # CloudWatchメトリクス
POST /admin/logs/clear-login-lock/:email    # ログインロック解除
POST /admin/logs/clear-payment-lock/:userId # 決済ロック解除
```

---

### 2.5 通知・アラート管理ページ（新規作成・低優先度）

**ファイル**: `frontend/src/pages/Admin/AdminNotifications.tsx`

#### 機能要件

**SNS通知設定**
- サブスクライバー一覧
- 新規サブスクライバーの追加
- 通知テストの送信

**メール配信統計**
- 送信成功/失敗の統計
- バウンス率
- 失敗した通知の再送

**システム通知テンプレート管理**
- 通知テンプレートの編集
- プレビュー機能

---

### 2.6 設定ページ（新規作成・低優先度）

**ファイル**: `frontend/src/pages/Admin/AdminSettings.tsx`

#### 機能要件

**システム設定**
- 手数料率の設定
  - デフォルト手数料率（現在10%）
  - カスタム手数料率の設定
- PAY.JP設定
  - テストモード/本番モードの切り替え
  - APIキーの確認（マスク表示）
- IP制限の管理
  - 管理画面アクセス許可IPの追加/削除
  - CIDR形式対応

**セキュリティ設定**
- MFA強制化の設定
  - 全ユーザー/管理者のみ
- ログイン試行制限の設定
  - 最大試行回数
  - ロック期間
- 決済試行制限の設定
  - 最大試行回数
  - ロック期間

**バックエンドAPI（新規作成必要）**
```
GET  /admin/settings              # 設定取得
PUT  /admin/settings/fee-rate     # 手数料率更新
PUT  /admin/settings/security     # セキュリティ設定更新
GET  /admin/settings/ip-whitelist # IP制限リスト取得
POST /admin/settings/ip-whitelist # IP追加
DELETE /admin/settings/ip-whitelist/:ip # IP削除
```

---

## 3. 実装優先順位

### 高優先度（すぐに実装）
1. **AdminHeader コンポーネント作成**
   - `frontend/src/components/layout/AdminHeader.tsx`
   - 管理者専用ナビゲーション
   - AdminDashboard に適用

2. **ユーザー管理ページ（基本機能）**
   - `frontend/src/pages/Admin/AdminUsers.tsx`
   - ユーザー一覧表示
   - フィルター・検索機能
   - バックエンドAPI実装
     - `backend/src/handlers/admin/listUsers.ts`
     - `backend/src/handlers/admin/getUser.ts`

3. **統計ダッシュボードの拡張**
   - AdminDashboard に期間別収益グラフ追加
   - Recharts ライブラリの導入
   - 期間選択機能

### 中優先度（近いうちに実装）
4. **システムログ・監視ページ**
   - `frontend/src/pages/Admin/AdminLogs.tsx`
   - DynamoDBテーブルからのデータ取得
   - CloudWatch Alarms の状態表示
   - バックエンドAPI実装

5. **案件管理ページ**
   - `frontend/src/pages/Admin/AdminJobs.tsx`
   - 案件一覧・詳細表示
   - 統計情報
   - バックエンドAPI実装

### 低優先度（将来的に実装）
6. **通知・アラート管理ページ**
   - SNS設定管理
   - メール配信統計

7. **設定ページ**
   - システム設定UI
   - セキュリティパラメータ調整

---

## 4. 技術スタック

### フロントエンド
- **React** + **TypeScript**
- **React Router** - ページルーティング
- **Recharts** or **Chart.js** - グラフ表示
- **Tailwind CSS** - スタイリング（既存と統一）
- **date-fns** - 日付処理

### バックエンド
- **AWS Lambda** + **TypeScript**
- **DynamoDB** - データ取得
- **CloudWatch API** - メトリクス・アラーム取得
- **Cognito** - ユーザー管理API

---

## 5. セキュリティ要件

### 認証・認可
- 管理者メールアドレスの厳密なチェック
  - 現在: `yukinag@dotqinc.com` のみ
  - 将来: DynamoDB管理者テーブルでの管理
- すべての管理者APIエンドポイントで認証確認

### IP制限
- 管理者専用エンドポイントのIP制限
  - API Gateway Resource Policy で実装
  - `/admin/*` パスに適用
  - デフォルト許可IP: `138.64.83.96/32`

### MFA
- 管理者アカウントのMFA必須化
  - Cognito UserPool設定で実装済み
  - ダッシュボードに警告バナー表示

### 監査ログ
- すべての管理操作をログに記録
  - CloudWatch Logs に出力
  - 操作内容、実行者、日時を記録

---

## 6. API Gateway リソース構成

```
/admin
├── /contracts
│   ├── GET  /admin/contracts                    # 契約一覧 ✅実装済み
│   └── POST /admin/contracts/:id/refund         # 返金処理 ✅実装済み
├── /users
│   ├── GET  /admin/users                        # ユーザー一覧 🔲未実装
│   ├── GET  /admin/users/:userId                # ユーザー詳細 🔲未実装
│   ├── PUT  /admin/users/:userId                # ユーザー更新 🔲未実装
│   ├── POST /admin/users/:userId/disable        # 無効化 🔲未実装
│   ├── POST /admin/users/:userId/enable         # 有効化 🔲未実装
│   ├── GET  /admin/users/:userId/activity       # アクティビティ 🔲未実装
│   └── GET  /admin/users/:userId/security       # セキュリティログ 🔲未実装
├── /jobs
│   ├── GET  /admin/jobs                         # 案件一覧 🔲未実装
│   ├── GET  /admin/jobs/:jobId                  # 案件詳細 🔲未実装
│   ├── PUT  /admin/jobs/:jobId                  # 案件更新 🔲未実装
│   ├── DELETE /admin/jobs/:jobId                # 案件削除 🔲未実装
│   └── GET  /admin/jobs/statistics              # 統計情報 🔲未実装
├── /logs
│   ├── GET  /admin/logs/login-attempts          # ログイン失敗 🔲未実装
│   ├── GET  /admin/logs/payment-attempts        # 決済失敗 🔲未実装
│   ├── GET  /admin/logs/login-devices           # デバイス履歴 🔲未実装
│   ├── GET  /admin/logs/cloudwatch-alarms       # アラーム状態 🔲未実装
│   ├── GET  /admin/logs/cloudwatch-metrics      # メトリクス 🔲未実装
│   ├── POST /admin/logs/clear-login-lock/:email # ロック解除 🔲未実装
│   └── POST /admin/logs/clear-payment-lock/:userId # ロック解除 🔲未実装
└── /settings
    ├── GET  /admin/settings                     # 設定取得 🔲未実装
    ├── PUT  /admin/settings/fee-rate            # 手数料率更新 🔲未実装
    ├── PUT  /admin/settings/security            # セキュリティ更新 🔲未実装
    ├── GET  /admin/settings/ip-whitelist        # IP一覧 🔲未実装
    ├── POST /admin/settings/ip-whitelist        # IP追加 🔲未実装
    └── DELETE /admin/settings/ip-whitelist/:ip  # IP削除 🔲未実装
```

---

## 7. データモデル

### DynamoDB テーブル構成

#### 既存テーブル（参照）
- `cloudport-users-dev` - ユーザー情報
- `cloudport-jobs-dev` - 案件情報
- `cloudport-contracts-dev` - 契約情報
- `cloudport-applications-dev` - 応募情報
- `cloudport-login-attempts-dev` - ログイン失敗追跡
- `cloudport-login-devices-dev` - デバイス記録
- `cloudport-payment-attempts-dev` - 決済失敗追跡

#### 新規テーブル（将来的に必要に応じて）
- `cloudport-admin-settings` - 管理者設定
  - settingKey (PK) - 設定キー
  - settingValue - 設定値
  - updatedBy - 更新者
  - updatedAt - 更新日時

- `cloudport-admin-audit-logs` - 管理操作ログ
  - logId (PK) - ログID
  - adminId - 管理者ID
  - action - 操作内容
  - targetType - 対象タイプ（user/job/contract）
  - targetId - 対象ID
  - details - 詳細（JSON）
  - timestamp (SK) - 実行日時

---

## 8. UI/UXデザイン方針

### カラーパレット
- **ベース**: 既存のダークテーマを継承
  - `#0A1628` - Deep Navy
  - `#1A2942` - Midnight
  - `#2C4875` - Ocean
- **アクセント**: 管理者専用色
  - `#FF6B35` → `#EF4444` - Red（警告・重要操作）
  - `#00E5FF` - Cyan（情報）
  - `#10B981` - Green（成功）
  - `#F59E0B` - Amber（注意）

### レイアウト
- **サイドバーナビゲーション**（オプション）
  - 左側固定サイドバーで主要機能へアクセス
  - モバイルではハンバーガーメニュー
- **ヘッダー固定**
  - スクロール時も常に表示
  - パンくずリスト表示

### コンポーネント設計
- 既存の `glass-dark` スタイルを活用
- テーブルは既存の AdminDashboard スタイルを踏襲
- モーダルはアクションの重要度に応じて配色変更

---

## 9. 今後の拡張性

### Phase 2（中期）
- **ダッシュボードカスタマイズ**
  - ウィジェットの追加/削除
  - レイアウトのドラッグ&ドロップ
- **レポート機能**
  - 月次レポートの自動生成
  - PDFエクスポート
- **複数管理者対応**
  - 役割ベースのアクセス制御（RBAC）
  - 管理者ごとの権限設定

### Phase 3（長期）
- **リアルタイム通知**
  - WebSocket経由のリアルタイム更新
  - 新規契約・返金申請の即時通知
- **機械学習統合**
  - 不正検知アラート
  - 収益予測
- **APIレート制限管理**
  - ユーザーごとのAPI利用状況
  - レート制限の動的調整

---

## 10. 参考資料

- [SECURITY_IMPLEMENTATION_SUMMARY.md](infrastructure/SECURITY_IMPLEMENTATION_SUMMARY.md) - セキュリティ実装完了サマリー
- [PAYMENT_SECURITY.md](infrastructure/PAYMENT_SECURITY.md) - 決済セキュリティガイド
- [ADMIN_IP_RESTRICTION.md](infrastructure/ADMIN_IP_RESTRICTION.md) - 管理画面IP制限
- [LOGIN_NOTIFICATION_SETUP.md](infrastructure/LOGIN_NOTIFICATION_SETUP.md) - ログイン通知機能

---

## 更新履歴

| 日付 | バージョン | 変更内容 | 担当 |
|------|-----------|---------|------|
| 2025-12-05 | v1.0 | 初版作成 | Claude |

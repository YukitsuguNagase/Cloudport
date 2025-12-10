# CloudPort - プロジェクト仕様書

## プロジェクト概要

**CloudPort**は、AWS技術者と企業をマッチングするプラットフォームです。AWS認定資格保持者や専門技術者が、長期・短期のプロジェクト案件を見つけられるサービスを提供します。

### 目的
- AWS専門技術者の副業・フリーランス案件獲得支援
- 企業のAWS人材不足解消
- 効率的なマッチングによる双方のコスト削減

### ビジネスモデル
**成功報酬型マッチングプラットフォーム**
- 技術者：無料で利用可能
- 企業：契約成立時に成功報酬（契約金額の10-15%）を支払い
- プラットフォーム内でメッセージング・契約成立管理を行うことで、外部流出を防止
- Stripe決済連携による安全な支払い処理

### ターゲットユーザー
- **技術者**: AWS資格保持者、クラウドエンジニア、アーキテクト
- **企業**: AWS案件を持つIT企業、SIer、事業会社

### 主要機能
1. **案件投稿・閲覧**: 企業が案件を投稿、技術者が検索・閲覧
2. **応募管理**: 技術者が案件に応募、企業が応募者を確認
3. **スカウト機能**: 企業が技術者を検索してスカウト送信
4. **メッセージング**: プラットフォーム内で1対1のやりとり（外部流出防止）
5. **契約成立管理**: 双方の承認による契約成立の自己申告
6. **決済・請求**: Stripe連携による成功報酬の自動決済
7. **返金処理**: 管理者による返金対応機能
8. **セキュリティ**: MFA、IP制限、不正ログイン検知
9. **通知システム**: リアルタイム通知とメール通知

---

## 技術スタック

### Frontend
- **フレームワーク**: React 18+ with TypeScript
- **ビルドツール**: Vite
- **UIライブラリ**: Ant Design 5.x
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API
- **ルーティング**: React Router v6
- **ホスティング**: AWS S3 + CloudFront (https://cloudportjob.com)

### Backend
- **ランタイム**: Node.js 20.x (TypeScript)
- **API**: AWS API Gateway (REST API)
- **関数**: AWS Lambda (43 functions)
- **IaC**: AWS SAM (Serverless Application Model)
- **認証**: Amazon Cognito (JWT + MFA)
- **データベース**: Amazon DynamoDB (11 tables)
- **メール送信**: Amazon SES
- **決済**: Stripe Payment API
- **ファイルストレージ**: Amazon S3

### 開発・CI/CD
- **バージョン管理**: Git / GitHub
- **パッケージマネージャー**: npm
- **コード品質**: ESLint, Prettier
- **型チェック**: TypeScript 5.x

---

## システムアーキテクチャ

```
[ユーザー（技術者・企業）]
    ↓
[CloudFront + S3] ← React SPA (https://cloudportjob.com)
    ↓
[API Gateway (REST API)] ← Cognito Authorizer (JWT)
    ↓
[Lambda Functions (43 functions)] ← ビジネスロジック
    ├─ 案件管理 (Jobs)
    ├─ 応募管理 (Applications)
    ├─ メッセージング (Messages)
    ├─ 契約管理 (Contracts)
    ├─ ユーザー管理 (Users)
    ├─ 決済処理 (Payments)
    ├─ スカウト機能 (Scouts)
    ├─ 通知システム (Notifications)
    ├─ セキュリティ (Auth Triggers, IP Blocking, MFA)
    └─ 管理者機能 (Admin)
    ↓
[DynamoDB (11 tables)]
    ├─ Users テーブル
    ├─ Jobs テーブル
    ├─ Applications テーブル
    ├─ Conversations テーブル
    ├─ Messages テーブル
    ├─ Contracts テーブル
    ├─ Notifications テーブル
    ├─ LoginAttempts テーブル (セキュリティ)
    ├─ LoginDevices テーブル (デバイス追跡)
    ├─ BlockedIPs テーブル (IP制限)
    └─ PaymentAttempts テーブル (決済試行管理)
    ↓
[Cognito] ← 認証・認可 (JWT + MFA)
    ├─ PreAuthentication Trigger (ログイン試行制限・IP制限)
    ├─ PostAuthentication Trigger (デバイス記録・新デバイス通知)
    └─ DefineAuthChallenge Trigger (失敗回数記録)
    ↓
[Stripe] ← 決済処理
    ├─ Payment Intent作成
    ├─ 決済確認
    └─ 返金処理
    ↓
[SES] ← メール通知
    ├─ 応募通知
    ├─ メッセージ通知
    ├─ 契約通知
    ├─ 決済完了通知
    ├─ 新デバイスログイン通知
    └─ アカウントロックアウト通知
```

---

## ディレクトリ構成

```
cloudport/
├── README.md
├── CLOUDPORT_SPEC.md         # このファイル
├── .gitignore
│
├── frontend/                  # React アプリケーション
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   │   ├── logo.png
│   │   ├── favicon.ico
│   │   └── robots.txt
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/       # 再利用可能なコンポーネント
│       │   ├── common/       # Button, Input, Card等
│       │   ├── layout/       # Header, Footer, AdminHeader
│       │   ├── features/     # 機能別コンポーネント
│       │   └── payment/      # 決済関連コンポーネント
│       ├── pages/            # ページコンポーネント
│       │   ├── Landing.tsx   # ランディングページ
│       │   ├── SignUp.tsx    # サインアップ
│       │   ├── Login.tsx     # ログイン
│       │   ├── VerifyEmail.tsx
│       │   ├── ForgotPassword.tsx
│       │   ├── ResetPassword.tsx
│       │   ├── Jobs/         # 案件関連
│       │   │   ├── JobList.tsx
│       │   │   ├── JobDetail.tsx
│       │   │   ├── JobForm.tsx    # 企業用
│       │   │   └── JobEdit.tsx    # 企業用
│       │   ├── Applications/ # 応募関連
│       │   │   ├── ApplicationList.tsx      # 技術者用
│       │   │   └── ApplicantList.tsx        # 企業用
│       │   ├── Messages/     # メッセージング
│       │   │   ├── ConversationList.tsx
│       │   │   └── ChatRoom.tsx
│       │   ├── Contracts/    # 契約管理
│       │   │   ├── ContractList.tsx
│       │   │   └── ContractDetail.tsx
│       │   ├── Profile/      # プロフィール
│       │   │   ├── MyPage.tsx
│       │   │   ├── ProfileEdit.tsx
│       │   │   └── MFASettings.tsx
│       │   ├── Notifications/
│       │   │   └── NotificationList.tsx
│       │   ├── Scouts/       # スカウト機能
│       │   │   └── EngineerSearch.tsx
│       │   ├── Payments/     # 支払い（企業用）
│       │   │   └── PaymentList.tsx
│       │   ├── Users/
│       │   │   └── EngineerProfileView.tsx
│       │   ├── Admin/        # 管理者機能
│       │   │   ├── AdminLogin.tsx
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── AdminUsers.tsx
│       │   │   ├── AdminLogs.tsx
│       │   │   └── SecuritySettings.tsx
│       │   ├── Terms.tsx     # 利用規約
│       │   ├── Privacy.tsx   # プライバシーポリシー
│       │   ├── Legal.tsx     # 特定商取引法
│       │   └── Contact.tsx   # お問い合わせ
│       ├── services/         # API通信ロジック
│       │   ├── api.ts        # API クライアント
│       │   ├── auth.ts
│       │   ├── jobs.ts
│       │   ├── messages.ts
│       │   ├── contracts.ts
│       │   ├── notifications.ts
│       │   ├── scouts.ts
│       │   ├── security.ts
│       │   └── mfa.ts
│       ├── types/            # TypeScript型定義
│       │   ├── user.ts
│       │   ├── job.ts
│       │   ├── message.ts
│       │   ├── contract.ts
│       │   └── notification.ts
│       ├── contexts/         # React Context
│       │   └── AuthContext.tsx
│       └── utils/            # ユーティリティ関数
│           ├── formatDate.ts
│           └── validation.ts
│
├── backend/                   # Lambda関数群
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── handlers/         # Lambda ハンドラー (43 functions)
│       │   ├── jobs/
│       │   │   ├── getJobs.ts
│       │   │   ├── getJobDetail.ts
│       │   │   ├── getMyJobs.ts
│       │   │   ├── createJob.ts
│       │   │   ├── updateJob.ts
│       │   │   └── deleteJob.ts
│       │   ├── applications/
│       │   │   ├── applyJob.ts
│       │   │   ├── getApplications.ts
│       │   │   └── updateApplicationStatus.ts
│       │   ├── messages/
│       │   │   ├── getConversations.ts
│       │   │   ├── getConversation.ts
│       │   │   ├── getMessages.ts
│       │   │   ├── sendMessage.ts
│       │   │   ├── markAsRead.ts
│       │   │   ├── createConversation.ts
│       │   │   └── deleteConversation.ts
│       │   ├── contracts/
│       │   │   ├── createContract.ts
│       │   │   ├── approveContract.ts
│       │   │   ├── getContracts.ts
│       │   │   ├── getContractDetail.ts
│       │   │   └── processPayment.ts (Stripe連携)
│       │   ├── users/
│       │   │   ├── getProfile.ts
│       │   │   ├── updateProfile.ts
│       │   │   ├── getUserProfile.ts
│       │   │   ├── getMFAStatus.ts
│       │   │   └── setupMFA.ts
│       │   ├── notifications/
│       │   │   ├── getNotifications.ts
│       │   │   └── markAsRead.ts
│       │   ├── scouts/
│       │   │   ├── searchEngineers.ts
│       │   │   ├── sendScout.ts
│       │   │   └── getScouts.ts
│       │   ├── auth/           # Cognito Triggers
│       │   │   ├── preAuthentication.ts (IP制限・ログイン試行制限)
│       │   │   ├── postAuthentication.ts (デバイス記録・通知)
│       │   │   └── defineAuthChallenge.ts (失敗回数記録)
│       │   └── admin/
│       │       ├── getAllUsers.ts
│       │       ├── getUserDetail.ts
│       │       ├── getAllContracts.ts
│       │       ├── getSystemLogs.ts
│       │       ├── getAccessLogs.ts
│       │       ├── blockIP.ts
│       │       ├── unblockIP.ts
│       │       ├── getBlockedIPs.ts
│       │       └── processRefund.ts
│       ├── models/           # データモデル
│       │   ├── User.ts
│       │   ├── Job.ts
│       │   ├── Application.ts
│       │   ├── Message.ts
│       │   ├── Contract.ts
│       │   └── Notification.ts
│       └── utils/            # 共通ユーティリティ
│           ├── dynamodb.ts   # DynamoDB helper
│           ├── auth.ts       # 認証ヘルパー
│           ├── response.ts   # API レスポンス整形
│           ├── email.ts      # メール送信
│           ├── emailTemplates.ts  # メールテンプレート
│           └── notifications.ts   # 通知作成
│
└── infrastructure/            # AWS SAM / IaC
    ├── template.yaml         # SAM テンプレート (1500+ lines)
    ├── samconfig.toml        # SAM 設定
    ├── SECURITY_IMPLEMENTATION_SUMMARY.md
    └── PAYMENT_SECURITY.md
```

---

## データモデル設計

### Users テーブル
```typescript
{
  userId: string;           // PK (Cognito Sub)
  email: string;
  userType: 'engineer' | 'company';
  name: string;             // 必須 (不正対策強化)
  phoneNumber?: string;     // 必須 (不正対策強化)
  profile: {
    company?: string;
    awsCertifications?: string[];  // SAA, SAP, DVA, etc.
    skills?: string[];
    experience?: string;
    availableHours?: number;       // 週あたり稼働可能時間
    hourlyRate?: number;           // 希望時給
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Jobs テーブル
```typescript
{
  jobId: string;            // PK (UUID)
  companyId: string;        // GSI
  title: string;
  description: string;
  requirements: {
    awsServices: string[];   // 必要なAWSサービス
    certifications?: string[];
    experience?: string;
  };
  duration: {
    type: 'short' | 'long'; // 短期 or 長期
    months?: number;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  status: 'open' | 'closed' | 'filled';
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### Applications テーブル
```typescript
{
  applicationId: string;    // PK (UUID)
  jobId: string;            // GSI
  engineerId: string;       // GSI
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

### Conversations テーブル
```typescript
{
  conversationId: string;   // PK (UUID)
  applicationId: string;    // GSI - どの応募に紐づくか
  jobId: string;            // GSI
  engineerId: string;       // GSI
  companyId: string;        // GSI
  lastMessageAt: string;    // 最終メッセージ日時（ソート用）
  unreadCountEngineer: number;  // 技術者側の未読数
  unreadCountCompany: number;   // 企業側の未読数
  createdAt: string;
}
```

### Messages テーブル
```typescript
{
  messageId: string;        // PK (UUID)
  conversationId: string;   // GSI - どの会話に属するか
  senderId: string;         // 送信者（engineerId or companyId）
  senderType: 'engineer' | 'company';
  content: string;          // メッセージ本文
  isRead: boolean;          // 既読フラグ
  createdAt: string;        // 送信日時（ソートキー）
}
```

### Contracts テーブル
```typescript
{
  contractId: string;       // PK (UUID)
  applicationId: string;    // GSI - どの応募に紐づくか
  jobId: string;            // GSI
  engineerId: string;       // GSI
  companyId: string;        // GSI
  status: 'pending_engineer' | 'pending_company' | 'approved' | 'payment_pending' | 'paid' | 'refunded';
  initiatedBy: 'engineer' | 'company';  // 誰が申請したか
  contractAmount: number;   // 契約金額
  feePercentage: number;    // 手数料率（10-15%）
  feeAmount: number;        // 手数料額
  approvedByEngineer?: string;  // 技術者承認日時
  approvedByCompany?: string;   // 企業承認日時
  paymentIntentId?: string;     // Stripe Payment Intent ID
  paidAt?: string;          // 決済完了日時
  refundedAt?: string;      // 返金日時
  refundReason?: string;    // 返金理由
  createdAt: string;
  updatedAt: string;
}
```

### Notifications テーブル
```typescript
{
  notificationId: string;   // PK (UUID)
  userId: string;           // GSI - 誰への通知か
  type: 'new_application' | 'new_message' | 'contract_request' | 'contract_approved' | 'payment_completed' | 'scout_received' | 'refund_processed';
  title: string;
  message: string;
  link?: string;            // 関連ページへのリンク
  relatedId?: string;       // 関連するID (jobId, contractId等)
  isRead: boolean;
  createdAt: string;
}
```

### LoginAttempts テーブル (セキュリティ)
```typescript
{
  email: string;            // PK
  failedAttempts: number;   // 失敗回数
  lastFailedAt: number;     // 最終失敗日時 (Unix timestamp)
  lockedUntil?: number;     // ロック解除時刻 (Unix timestamp)
  ttl: number;              // DynamoDB TTL (自動削除)
}
```

### LoginDevices テーブル (デバイス追跡)
```typescript
{
  deviceId: string;         // PK (userAgent + ipAddress のハッシュ)
  userId: string;           // GSI
  userAgent: string;
  ipAddress: string;
  firstSeenAt: string;
  lastSeenAt: string;
}
```

### BlockedIPs テーブル (IP制限)
```typescript
{
  ipAddress: string;        // PK
  reason: string;           // ブロック理由
  blockedBy: string;        // 実行者メールアドレス
  blockedAt: string;        // ブロック日時
  expiresAt?: string;       // 有効期限 (null = 永久)
  ttl?: number;             // DynamoDB TTL
}
```

### PaymentAttempts テーブル (決済試行管理)
```typescript
{
  userId: string;           // PK
  failedAttempts: number;
  lastFailedAt: number;
  ttl: number;
}
```

---

## セキュリティ機能

### 1. 二要素認証 (MFA)
- **TOTP認証**: Google Authenticator等のアプリを使用
- **SMS認証**: 電話番号によるSMS認証
- ユーザーが任意で有効化可能
- 設定画面: `/profile/mfa-settings`

### 2. ログイン試行制限
- **制限回数**: 5回失敗で15分間ロックアウト
- **通知**: ロックアウト時にメール通知送信
- **実装**: Cognito PreAuthentication Trigger
- **テーブル**: LoginAttempts

### 3. IP アドレス制限
- **管理者機能**: 不審なIPを手動ブロック
- **期限設定**: 一時的ブロック（時間指定）または永久ブロック
- **管理画面**: `/admin/security`
- **テーブル**: BlockedIPs

### 4. 新デバイス検知
- **デバイス追跡**: User-Agent + IPアドレスでデバイス識別
- **初回ログイン通知**: 新デバイスからのログイン時にメール送信
- **実装**: Cognito PostAuthentication Trigger
- **テーブル**: LoginDevices

### 5. 会員登録時の本人確認強化
- **氏名必須**: 登録時に本名を要求
- **電話番号必須**: 電話番号の登録を必須化
- **メール認証**: Cognito検証コード

### 6. 決済セキュリティ
- **Stripe連携**: PCI DSS準拠の決済処理
- **決済試行制限**: 連続失敗を防止
- **返金機能**: 管理者による返金処理対応
- 詳細: `infrastructure/PAYMENT_SECURITY.md`

---

## 契約成立・決済フロー

```
1. 企業が案件投稿
   ↓
2. 技術者が応募（メッセージ付き）
   ↓
3. 企業が応募者を確認 → 「興味あり」選択
   ↓
4. 【メッセージング開始】← プラットフォーム内チャット
   ↓
5. 条件交渉（チャット内でやりとり）
   ↓
6. どちらかが「契約成立申請」ボタン押下
   ↓
7. 相手に通知 → 相手が「承認」ボタン押下
   ↓
8. 双方承認 → ステータスが「契約成立 (approved)」に
   ↓
9. 企業に決済画面表示（Stripe Payment Element）
   ↓
10. 企業がクレジットカード情報入力・決済実行
   ↓
11. Stripeで決済処理 → 成功報酬 (10-15%) を即時徴収
   ↓
12. 決済完了 → ステータスが「paid」に変更
   ↓
13. 双方に決済完了通知メール送信
   ↓
14. プロジェクト開始
```

**返金フロー:**
- 管理者画面 (`/admin/users`) から返金処理可能
- Stripe API経由で返金実行
- 返金完了メール自動送信
- ステータスが「refunded」に変更

---

## API エンドポイント設計

### 案件関連
- `GET /api/jobs` - 案件一覧取得
- `GET /api/jobs/{jobId}` - 案件詳細取得
- `GET /api/jobs/my` - 自分の投稿案件取得（企業のみ）
- `POST /api/jobs` - 案件投稿（企業のみ）
- `PUT /api/jobs/{jobId}` - 案件更新（企業のみ）
- `DELETE /api/jobs/{jobId}` - 案件削除（企業のみ）

### 応募関連
- `POST /api/jobs/{jobId}/apply` - 案件応募（技術者のみ）
- `GET /api/applications` - 自分の応募一覧（技術者）or 案件への応募一覧（企業）
- `PUT /api/applications/{applicationId}/status` - 応募ステータス更新（企業のみ）

### メッセージング関連
- `GET /api/conversations` - 会話一覧取得
- `GET /api/conversations/{conversationId}` - 会話詳細取得
- `GET /api/conversations/{conversationId}/messages` - メッセージ取得
- `POST /api/conversations/{conversationId}/messages` - メッセージ送信
- `PUT /api/conversations/{conversationId}/read` - 既読更新
- `POST /api/conversations` - 会話作成
- `DELETE /api/conversations/{conversationId}` - 会話削除

### 契約関連
- `POST /api/contracts` - 契約成立申請
- `PUT /api/contracts/{contractId}/approve` - 契約成立承認
- `POST /api/contracts/{contractId}/payment` - 決済処理（Stripe）
- `GET /api/contracts` - 契約一覧取得
- `GET /api/contracts/{contractId}` - 契約詳細取得

### ユーザー関連
- `GET /api/users/me` - 自分のプロフィール取得
- `PUT /api/users/me` - プロフィール更新
- `GET /api/users/{userId}` - ユーザープロフィール取得（公開情報のみ）
- `GET /api/users/mfa/status` - MFA状態取得
- `POST /api/users/mfa/setup` - MFA設定

### 通知関連
- `GET /api/notifications` - 通知一覧取得
- `PUT /api/notifications/{notificationId}/read` - 既読更新

### スカウト関連
- `GET /api/scouts/search` - 技術者検索（企業のみ）
- `POST /api/scouts/send` - スカウト送信（企業のみ）
- `GET /api/scouts` - スカウト一覧取得（技術者のみ）

### 管理者関連
- `GET /api/admin/users` - 全ユーザー取得
- `GET /api/admin/users/{userId}` - ユーザー詳細取得
- `GET /api/admin/contracts` - 全契約取得
- `POST /api/admin/contracts/{contractId}/refund` - 返金処理
- `GET /api/admin/logs/system` - システムログ取得
- `GET /api/admin/logs/access` - アクセスログ取得
- `POST /api/admin/security/block-ip` - IPブロック
- `DELETE /api/admin/security/unblock-ip/{ipAddress}` - IPブロック解除
- `GET /api/admin/security/blocked-ips` - ブロック中IP一覧

---

## 認証フロー

### 基本認証
1. ユーザー登録: Cognito ユーザープール登録
2. メール認証: Cognito 検証コード送信
3. ログイン: ID/パスワード → JWT トークン取得
4. API呼び出し: Authorization ヘッダーに JWT を付与
5. API Gateway: Cognito Authorizer でトークン検証

### MFA認証フロー
1. ユーザーがMFA設定画面で有効化
2. TOTP: QRコード表示 → アプリで読み取り → 検証コード入力
3. SMS: 電話番号入力 → SMS送信 → 検証コード入力
4. ログイン時: パスワード入力後 → MFAコード要求 → 検証

### Cognito Triggers
- **PreAuthentication**: IP制限チェック、ログイン試行回数チェック
- **PostAuthentication**: デバイス記録、新デバイス通知送信
- **DefineAuthChallenge**: ログイン失敗回数記録

---

## 画面一覧

### 【未ログイン】
1. **ランディングページ** (`/`) - サービス紹介
2. **サインアップ** (`/signup`) - 新規登録
3. **ログイン** (`/login`) - ログイン
4. **メール認証** (`/verify-email`) - 認証コード入力
5. **パスワードリセット** (`/forgot-password`, `/reset-password`)
6. **利用規約** (`/terms`)
7. **プライバシーポリシー** (`/privacy`)
8. **特定商取引法** (`/legal`)
9. **お問い合わせ** (`/contact`)

### 【共通画面】
10. **案件一覧** (`/jobs`) - 全案件表示
11. **案件詳細** (`/jobs/:jobId`) - 案件詳細・応募ボタン
12. **マイページ** (`/profile`) - プロフィール表示
13. **プロフィール編集** (`/profile/edit`)
14. **MFA設定** (`/profile/mfa-settings`)
15. **メッセージ一覧** (`/messages`) - 会話一覧
16. **チャット画面** (`/messages/:conversationId`)
17. **通知一覧** (`/notifications`)
18. **契約一覧** (`/contracts`)
19. **契約詳細** (`/contracts/:contractId`)

### 【技術者専用】
20. **応募履歴** (`/applications`)
21. **スカウト一覧** (`/scouts`)
22. **技術者プロフィール閲覧** (`/users/:userId`)

### 【企業専用】
23. **案件投稿** (`/jobs/new`)
24. **案件編集** (`/jobs/:jobId/edit`)
25. **応募者一覧** (`/jobs/:jobId/applicants`)
26. **技術者検索** (`/scouts/search`)
27. **支払い履歴** (`/payments`)

### 【管理者専用】
28. **管理者ログイン** (`/admin/login`)
29. **管理者ダッシュボード** (`/admin/dashboard`)
30. **ユーザー管理** (`/admin/users`)
31. **システムログ** (`/admin/logs`)
32. **セキュリティ設定** (`/admin/security`) - IP制限管理

---

## デプロイメント

### 本番環境
- **フロントエンド**: https://cloudportjob.com (CloudFront + S3)
- **バックエンド**: https://5i2r703nk5.execute-api.ap-northeast-1.amazonaws.com/dev
- **リージョン**: ap-northeast-1 (東京)

### デプロイコマンド

**バックエンド:**
```bash
cd infrastructure
sam build
sam deploy --no-confirm-changeset
```

**フロントエンド:**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://cloudportjob-frontend --delete
aws cloudfront create-invalidation --distribution-id E1Z56G2FJ2CI1I --paths "/*"
```

---

## 実装済み機能 (v0.1)

### ✅ 完了
- [x] ユーザー登録・ログイン（Cognito）
- [x] メール認証
- [x] 二要素認証 (MFA) - TOTP & SMS
- [x] パスワードリセット
- [x] 案件一覧・詳細表示
- [x] 案件投稿・編集・削除（企業）
- [x] 案件応募（技術者）
- [x] 応募者一覧表示（企業）
- [x] プロフィール登録・編集
- [x] メッセージング機能（リアルタイムポーリング）
- [x] 契約成立申請・承認機能
- [x] Stripe決済連携
- [x] 決済完了メール通知
- [x] 返金処理（管理者機能）
- [x] スカウト機能
- [x] 通知システム
- [x] ログイン試行制限（5回 / 15分）
- [x] IPアドレス制限（管理者機能）
- [x] 新デバイス検知・通知
- [x] アカウントロックアウト通知
- [x] 管理者ダッシュボード
- [x] システムログ・アクセスログ

---

## セキュリティ考慮事項

- 全API通信はHTTPS
- Cognitoによる JWT認証 + MFA対応
- Stripe による PCI DSS準拠決済
- ログイン試行制限（5回失敗で15分ロック）
- IPアドレスブロック機能
- 新デバイスログイン通知
- DynamoDBへの直接アクセス禁止（Lambdaのみ）
- IAM ロール最小権限の原則
- 個人情報の暗号化（at rest / in transit）
- CORS設定の適切な制限
- 会員登録時の本人確認強化（氏名・電話番号必須）
- 決済試行回数制限

---

## コスト見積もり（月額）

### 現在の運用コスト（〜100ユーザー想定）
- CloudFront + S3: $5-10
- API Gateway: $10-20
- Lambda: $5-15
- DynamoDB: $10-20
- Cognito: 無料枠内
- SES: 無料枠内
- **合計: $30-65/月**

### 収益モデル
- 月10件の契約成立
- 平均契約額: 50万円
- 手数料率: 12%
- **月間売上: 60万円**
- **粗利: 約59万円/月**

---

## 今後の拡張予定

### 短期（1-3ヶ月）
- [ ] WebSocketリアルタイムチャット
- [ ] 高度な検索・フィルタリング
- [ ] レビュー・評価システム
- [ ] エスクロー決済

### 中期（3-6ヶ月）
- [ ] マルチクラウド対応（GCP、Azure）
- [ ] AIマッチング機能
- [ ] モバイルアプリ（React Native）

### 長期（6ヶ月以降）
- [ ] エージェント機能
- [ ] 企業向け分析ダッシュボード
- [ ] API公開（サードパーティ連携）

---

**Last Updated**: 2025-12-11
**Version**: 0.1.0 (MVP - 決済・セキュリティ機能実装完了)

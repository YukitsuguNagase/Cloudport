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

### ターゲットユーザー
- **技術者**: AWS資格保持者、クラウドエンジニア、アーキテクト
- **企業**: AWS案件を持つIT企業、SIer、事業会社

### 主要機能
1. **案件投稿・閲覧**: 企業が案件を投稿、技術者が検索・閲覧
2. **応募管理**: 技術者が案件に応募、企業が応募者を確認
3. **メッセージング**: プラットフォーム内で1対1のやりとり（外部流出防止）
4. **契約成立管理**: 双方の承認による契約成立の自己申告
5. **決済・請求**: 成功報酬の請求・支払い管理

---

## 技術スタック

### Frontend
- **フレームワーク**: React 18+ with TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API（初期）→ 必要に応じてZustand
- **ルーティング**: React Router v6
- **ホスティング**: AWS S3 + CloudFront

### Backend
- **ランタイム**: Node.js 20.x (TypeScript)
- **API**: AWS API Gateway (REST API)
- **関数**: AWS Lambda
- **IaC**: AWS SAM (Serverless Application Model)
- **認証**: Amazon Cognito
- **データベース**: Amazon DynamoDB
- **メール送信**: Amazon SES
- **ファイルストレージ**: Amazon S3

### 開発・CI/CD
- **バージョン管理**: Git / GitHub
- **CI/CD**: GitHub Actions
- **ローカル開発**: AWS SAM CLI, DynamoDB Local
- **API テスト**: Postman / Thunder Client
- **コード品質**: ESLint, Prettier

---

## システムアーキテクチャ

```
[ユーザー（技術者・企業）]
    ↓
[CloudFront + S3] ← React SPA (静的ホスティング)
    ↓
[API Gateway (REST API)]
    ↓
[Lambda Functions] ← ビジネスロジック
    ├─ 案件管理 (Jobs)
    ├─ 応募管理 (Applications)
    ├─ メッセージング (Messages)
    ├─ 契約管理 (Contracts)
    └─ ユーザー管理 (Users)
    ↓
[DynamoDB]
    ├─ Users テーブル
    ├─ Jobs テーブル
    ├─ Applications テーブル
    ├─ Conversations テーブル
    ├─ Messages テーブル
    └─ Contracts テーブル
    ↓
[Cognito] ← 認証・認可 (JWT)
    ↓
[SES] ← メール通知
    ├─ 応募通知
    ├─ メッセージ通知
    └─ 契約通知
```

### 主要コンポーネント

#### 1. フロントエンド (React SPA)
- S3でホスティング、CloudFrontで配信
- ユーザーインターフェース全般
- API GatewayのREST APIを呼び出し

#### 2. API Gateway
- RESTful APIエンドポイント提供
- Cognito Authorizerで認証
- Lambda関数へのルーティング

#### 3. Lambda Functions
各機能ごとに関数を分離：
- `getJobs`: 案件一覧取得
- `getJobDetail`: 案件詳細取得
- `createJob`: 案件投稿（企業のみ）
- `updateJob`: 案件更新（企業のみ）
- `applyJob`: 案件応募（技術者のみ）
- `getApplications`: 応募一覧取得
- `updateApplicationStatus`: 応募ステータス更新（企業のみ）
- `getProfile`: ユーザープロフィール取得
- `updateProfile`: プロフィール更新
- `getConversations`: メッセージ会話一覧取得
- `getMessages`: 特定会話のメッセージ取得
- `sendMessage`: メッセージ送信
- `createContract`: 契約成立申請
- `approveContract`: 契約成立承認
- `getContracts`: 契約一覧取得

#### 4. DynamoDB テーブル設計
- **Users**: ユーザー情報
- **Jobs**: 案件情報
- **Applications**: 応募情報
- **Conversations**: メッセージ会話（1案件1応募につき1会話）
- **Messages**: メッセージ本文
- **Contracts**: 契約成立情報

#### 5. Cognito
- ユーザー登録・ログイン
- ユーザープール管理
- JWT トークン発行

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
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/       # 再利用可能なコンポーネント
│       │   ├── common/       # ボタン、入力フォーム等
│       │   ├── layout/       # ヘッダー、フッター、ナビ
│       │   └── features/     # 機能別コンポーネント
│       ├── pages/            # ページコンポーネント
│       │   ├── Landing.tsx   # ランディングページ
│       │   ├── SignUp.tsx    # サインアップ
│       │   ├── Login.tsx     # ログイン
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
│       │   │   └── ProfileEdit.tsx
│       │   └── Payments/     # 支払い（企業用）
│       │       └── PaymentList.tsx
│       ├── hooks/            # カスタムフック
│       │   ├── useAuth.ts
│       │   ├── useJobs.ts
│       │   └── useMessages.ts
│       ├── services/         # API通信ロジック
│       │   ├── api.ts        # API クライアント
│       │   ├── auth.ts
│       │   ├── jobs.ts
│       │   ├── messages.ts
│       │   └── contracts.ts
│       ├── types/            # TypeScript型定義
│       │   ├── user.ts
│       │   ├── job.ts
│       │   ├── message.ts
│       │   └── contract.ts
│       ├── contexts/         # React Context
│       │   └── AuthContext.tsx
│       └── utils/            # ユーティリティ関数
│           ├── formatDate.ts
│           └── validation.ts
│
├── backend/                   # Lambda関数群
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── src/
│       ├── handlers/         # Lambda ハンドラー
│       │   ├── jobs/
│       │   │   ├── getJobs.ts
│       │   │   ├── getJobDetail.ts
│       │   │   ├── createJob.ts
│       │   │   ├── updateJob.ts
│       │   │   └── deleteJob.ts
│       │   ├── applications/
│       │   │   ├── applyJob.ts
│       │   │   ├── getApplications.ts
│       │   │   └── updateApplicationStatus.ts
│       │   ├── messages/
│       │   │   ├── getConversations.ts
│       │   │   ├── getMessages.ts
│       │   │   ├── sendMessage.ts
│       │   │   └── markAsRead.ts
│       │   ├── contracts/
│       │   │   ├── createContract.ts
│       │   │   ├── approveContract.ts
│       │   │   └── getContracts.ts
│       │   └── users/
│       │       ├── getProfile.ts
│       │       └── updateProfile.ts
│       ├── models/           # データモデル
│       │   ├── User.ts
│       │   ├── Job.ts
│       │   ├── Application.ts
│       │   ├── Message.ts
│       │   └── Contract.ts
│       ├── services/         # ビジネスロジック
│       │   ├── jobService.ts
│       │   ├── messageService.ts
│       │   └── contractService.ts
│       └── utils/            # 共通ユーティリティ
│           ├── dynamodb.ts   # DynamoDB helper
│           ├── auth.ts       # 認証ヘルパー
│           └── response.ts   # API レスポンス整形
│
└── infrastructure/            # AWS SAM / IaC
    ├── template.yaml         # SAM テンプレート
    ├── samconfig.toml        # SAM 設定
    └── scripts/              # デプロイスクリプト
```

---

## データモデル設計

### Users テーブル
```typescript
{
  userId: string;           // PK (Cognito Sub)
  email: string;
  userType: 'engineer' | 'company';
  profile: {
    name: string;
    company?: string;
    awsCertifications?: string[];  // SAA, SAP, DVA, etc.
    skills?: string[];
    experience?: string;
    availableHours?: number;       // 週あたり稼働可能時間
    hourlyRate?: number;           // 希望時給
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
  status: 'pending_engineer' | 'pending_company' | 'approved' | 'paid';
  // pending_engineer: 企業が申請、技術者の承認待ち
  // pending_company: 技術者が申請、企業の承認待ち
  // approved: 双方承認済み、支払い待ち
  // paid: 支払い完了
  initiatedBy: 'engineer' | 'company';  // 誰が申請したか
  contractAmount: number;   // 契約金額
  feePercentage: number;    // 手数料率（10-15%）
  feeAmount: number;        // 手数料額
  approvedByEngineer?: string;  // 技術者承認日時
  approvedByCompany?: string;   // 企業承認日時
  paidAt?: string;          // 支払い完了日時
  createdAt: string;
  updatedAt: string;
}
```

---

## 契約成立フロー（成功報酬の仕組み）

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
8. 双方承認 → ステータスが「契約成立」に
   ↓
9. 企業に請求書発行（成功報酬 10-15%）
   ↓
10. 企業が支払い（銀行振込 or Stripe）
   ↓
11. 支払い確認後 → 双方の連絡先開示
   ↓
12. 外部（メール・Slack等）でプロジェクト開始
```

**不正防止策：**
- 契約成立は1案件につき1回のみ
- 一度成立したら取り消し不可（またはサポート経由で対応）
- 虚偽報告は利用規約で禁止、発覚時はアカウント停止

---

## 画面一覧

### 【未ログイン】
1. **ランディングページ** - サービス紹介、使い方、料金体系
2. **サインアップ** - 新規登録（技術者 or 企業を選択）
3. **ログイン** - メールアドレス・パスワード認証

---

### 【共通画面】
4. **案件一覧ページ** - 全案件を一覧表示、フィルタ・検索機能
5. **案件詳細ページ** - 案件の詳細情報、応募ボタン（技術者）
6. **マイページ** - 自分のプロフィール、統計情報
7. **プロフィール編集ページ** - 名前、スキル、資格、経験等の編集
8. **メッセージ一覧ページ** - やりとり中の案件・相手のリスト、未読表示
9. **メッセージ詳細ページ（チャット画面）** - 1対1のメッセージング、契約申請ボタン
10. **通知一覧ページ** - 応募通知、メッセージ通知、契約通知

---

### 【技術者専用画面】
11. **応募履歴ページ** - 自分が応募した案件一覧、ステータス表示
12. **契約中案件ページ** - 現在進行中の契約一覧
13. **契約詳細ページ** - 契約内容、ステータス、承認ボタン
14. **契約完了履歴ページ** - 過去の契約実績

---

### 【企業専用画面】
15. **案件投稿フォームページ** - 新規案件作成
16. **案件管理ページ** - 自分が投稿した案件一覧、編集・削除
17. **案件編集ページ** - 投稿済み案件の編集
18. **応募者一覧ページ** - 各案件への応募者リスト、興味ありボタン
19. **契約中案件ページ** - 進行中の契約管理
20. **契約詳細ページ** - 契約内容、承認・支払いボタン
21. **請求・支払いページ** - 成功報酬の請求書、支払い履歴

---

## API エンドポイント設計

### 案件関連
- `GET /api/jobs` - 案件一覧取得（フィルタ・ページネーション対応）
- `GET /api/jobs/{jobId}` - 案件詳細取得
- `POST /api/jobs` - 案件投稿（企業のみ、要認証）
- `PUT /api/jobs/{jobId}` - 案件更新（投稿者のみ、要認証）
- `DELETE /api/jobs/{jobId}` - 案件削除（投稿者のみ、要認証）

### 応募関連
- `POST /api/jobs/{jobId}/apply` - 案件応募（技術者のみ、要認証）
- `GET /api/applications` - 自分の応募一覧（要認証）
- `GET /api/jobs/{jobId}/applications` - 案件への応募一覧（投稿者のみ、要認証）
- `PUT /api/applications/{applicationId}/status` - 応募ステータス更新（企業のみ、要認証）

### メッセージング関連
- `GET /api/conversations` - 自分の会話一覧取得（要認証）
- `GET /api/conversations/{conversationId}/messages` - 特定会話のメッセージ取得（要認証）
- `POST /api/conversations/{conversationId}/messages` - メッセージ送信（要認証）
- `PUT /api/conversations/{conversationId}/read` - 未読メッセージを既読にする（要認証）

### 契約関連
- `POST /api/contracts` - 契約成立申請（要認証）
- `PUT /api/contracts/{contractId}/approve` - 契約成立承認（要認証）
- `GET /api/contracts` - 自分の契約一覧取得（要認証）
- `GET /api/contracts/{contractId}` - 契約詳細取得（要認証）

### ユーザー関連
- `GET /api/users/me` - 自分のプロフィール取得（要認証）
- `PUT /api/users/me` - プロフィール更新（要認証）

---

## 認証フロー

1. ユーザー登録: Cognitoユーザープール登録
2. メール認証: Cognito検証コード送信
3. ログイン: ID/パスワード → JWT トークン取得
4. API呼び出し: Authorization ヘッダーにJWTを付与
5. Lambda Authorizer: Cognitoトークン検証

---

## 開発環境セットアップ

### 必要なツール
- Node.js 20.x
- AWS CLI
- AWS SAM CLI
- Docker（SAM Localに必要）
- Git

### セットアップ手順
```bash
# 1. リポジトリクローン
git clone <repository-url>
cd cloudport

# 2. フロントエンド依存関係インストール
cd frontend
npm install

# 3. バックエンド依存関係インストール
cd ../backend
npm install

# 4. AWS SAM ビルド
cd ../infrastructure
sam build

# 5. ローカル起動
sam local start-api
```

---

## デプロイメント

### 開発環境
```bash
cd infrastructure
sam build
sam deploy --config-env dev
```

### 本番環境
```bash
cd infrastructure
sam build
sam deploy --config-env prod
```

### フロントエンド
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://cloudport-frontend-bucket/
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

---

## MVP フェーズの機能範囲

### Phase 1: 基本機能（最初の2-4週間）
- [ ] ユーザー登録・ログイン（Cognito）
- [ ] 案件一覧表示
- [ ] 案件詳細表示
- [ ] 案件投稿（企業）
- [ ] 案件応募（技術者）
- [ ] 応募者一覧表示（企業）
- [ ] プロフィール登録・編集
- [ ] **メッセージング機能（ポーリング方式）**
- [ ] **契約成立申請・承認機能**

### Phase 2: 拡張機能
- [ ] メール通知（応募通知、メッセージ通知、契約通知）
- [ ] WebSocketリアルタイムチャット
- [ ] フィルタリング・検索機能（詳細）
- [ ] 決済機能（Stripe連携）
- [ ] レビュー・評価機能

### Phase 3: 高度な機能
- [ ] AIマッチング
- [ ] ダッシュボード・分析
- [ ] エスクロー決済
- [ ] 請求書自動発行

---

## セキュリティ考慮事項

- 全API通信はHTTPS
- CognitoによるJWT認証
- DynamoDBへの直接アクセス禁止（Lambdaのみ）
- IAM ロール最小権限の原則
- 個人情報の暗号化（at rest / in transit）
- CORS設定の適切な制限
- Rate limiting（API Gatewayで設定）

---

## コスト見積もり（月額）

### 初期・小規模運用時（〜100ユーザー）
- CloudFront: $1-5
- S3: $1-3
- API Gateway: $3.50/百万リクエスト（メッセージング含む 〜$15）
- Lambda: 無料枠内（〜$5）
- DynamoDB: オンデマンド（メッセージング含む 〜$10-15）
- Cognito: 50,000 MAU まで無料
- SES: 最初の62,000通/月 無料
- **合計: $30-45/月**

### スケール時（1000ユーザー、100案件/月想定）
- 上記 + メッセージング負荷増で$80-150/月程度
- 決済機能追加時: Stripe手数料 3.6% + ¥15/取引

**収益モデル:**
- 月10件の契約成立 × 平均契約額50万円 × 手数料12% = 月60万円の売上
- 運用コスト: 5万円/月程度（AWS + その他）
- **粗利: 約55万円/月**

---

## 今後の拡張性

### 短期（3-6ヶ月）
- WebSocketによるリアルタイムチャット
- Stripe決済連携
- メール通知の充実化
- 高度な検索・フィルタリング

### 中期（6-12ヶ月）
- マルチクラウド対応（GCP、Azure案件も扱う）
- AIマッチング機能
- レビュー・評価システム
- エスクロー決済

### 長期（1年以降）
- エージェント機能（仲介業者の参加）
- 企業向けダッシュボード・分析
- スキル診断・マッチング精度向上
- モバイルアプリ（React Native）
- API公開（サードパーティ連携）

---

## 参考リンク

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [React Documentation](https://react.dev/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)

---

**Last Updated**: 2025-11-16
**Version**: 0.2.0 (成功報酬モデル + メッセージング機能追加)

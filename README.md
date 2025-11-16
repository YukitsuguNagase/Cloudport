# CloudPort

AWS技術者と企業をマッチングするプラットフォーム

## プロジェクト概要

CloudPortは、AWS認定資格保持者や専門技術者が、長期・短期のプロジェクト案件を見つけられるマッチングサービスです。

### 主要機能

- 案件投稿・閲覧
- 応募管理
- プラットフォーム内メッセージング
- 契約成立管理
- 成功報酬型決済

## 技術スタック

### Frontend
- React 18+ with TypeScript
- Vite
- Tailwind CSS
- React Router v6

### Backend
- Node.js 20.x (TypeScript)
- AWS Lambda + API Gateway
- AWS SAM
- Amazon Cognito
- Amazon DynamoDB
- Amazon SES

## セットアップ

### 必要なツール
- Node.js 20.x
- AWS CLI
- AWS SAM CLI
- Docker
- Git

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

### バックエンド

```bash
cd backend
npm install
npm test
```

### インフラストラクチャ

```bash
cd infrastructure
sam build
sam local start-api
```

## デプロイ

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

## ディレクトリ構成

```
cloudport/
├── frontend/          # React アプリケーション
├── backend/           # Lambda 関数群
└── infrastructure/    # AWS SAM / IaC
```

## ライセンス

Proprietary

## ドキュメント

詳細な仕様については [CLOUDPORT_SPEC.md](./CLOUDPORT_SPEC.md) を参照してください。

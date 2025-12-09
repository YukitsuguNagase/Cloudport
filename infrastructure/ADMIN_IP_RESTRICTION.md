# 管理画面のIP制限設定ガイド

## 概要

管理画面（/admin/*エンドポイント）へのアクセスは、API Gateway Resource Policyによって特定のIPアドレスからのみ許可されています。

## 現在の設定

- **デフォルト許可IP**: `138.64.83.96/32`
- **制限対象**: すべての /admin/* エンドポイント
  - GET /admin/contracts
  - POST /admin/contracts/{contractId}/refund

## IP制限の仕組み

1. API Gateway Resource Policyで、/admin/*へのアクセスを制御
2. 許可リストに含まれないIPからのリクエストは403 Forbiddenを返す
3. Cognito認証の前にIP制限が適用される（二重の保護）

## IPアドレスの追加方法

### 1. 現在のIPアドレスを確認

```bash
curl https://checkip.amazonaws.com
```

### 2. デプロイ時にIPを指定

複数のIPアドレスを許可する場合は、カンマ区切りのリストで指定します：

```bash
sam deploy --parameter-overrides \
  "Environment=dev AdminAllowedIPs=\"138.64.83.96/32,203.0.113.0/24,198.51.100.5/32\""
```

### 3. samconfig.tomlを更新（永続的な設定）

`infrastructure/samconfig.toml` を編集:

```toml
[default.deploy.parameters]
parameter_overrides = "Environment=\"dev\" AdminAllowedIPs=\"138.64.83.96/32,203.0.113.0/24\""
```

## CIDR表記の説明

- `/32`: 単一のIPアドレス (例: 138.64.83.96/32 は 138.64.83.96 のみ)
- `/24`: 256個のIPアドレス (例: 203.0.113.0/24 は 203.0.113.0 〜 203.0.113.255)
- `/16`: 65,536個のIPアドレス (例: 10.0.0.0/16 は 10.0.0.0 〜 10.0.255.255)

### 推奨設定

**開発環境**: 特定の開発者のIPアドレスのみ許可
```
138.64.83.96/32,198.51.100.5/32
```

**本番環境**: オフィスの固定IPアドレスまたはVPN経由のみ許可
```
203.0.113.0/24  # オフィスネットワーク
```

## トラブルシューティング

### 403 Forbidden エラーが発生する場合

1. **現在のIPアドレスを確認**:
   ```bash
   curl https://checkip.amazonaws.com
   ```

2. **許可リストを確認**:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name cloudport-dev \
     --query 'Stacks[0].Parameters[?ParameterKey==`AdminAllowedIPs`].ParameterValue' \
     --output text
   ```

3. **IPアドレスを追加してデプロイ**:
   ```bash
   sam deploy --parameter-overrides \
     "Environment=dev AdminAllowedIPs=\"138.64.83.96/32,<新しいIP>/32\""
   ```

### 動的IPアドレスの場合

自宅やモバイル回線など、IPアドレスが頻繁に変わる場合:

1. **VPNサービスの利用**: 固定IPを持つVPNを使用
2. **IPレンジの許可**: ISPのIPレンジを調べて/24または/16で許可（セキュリティリスクあり）
3. **開発環境のみIP制限を緩和**: 本番環境のみ厳格に制限

## セキュリティのベストプラクティス

1. **最小権限の原則**: 必要最小限のIPアドレスのみ許可
2. **定期的な見直し**: 不要になったIPアドレスは削除
3. **/32の使用**: 単一IPの場合は必ず/32を指定
4. **VPNの推奨**: 動的IPの場合はVPN経由でアクセス
5. **監視**: CloudWatchアラームで403エラーを監視

## 緊急時のIP制限解除

**注意**: セキュリティリスクがあるため、緊急時のみ使用してください。

すべてのIPからのアクセスを一時的に許可:
```bash
sam deploy --parameter-overrides \
  "Environment=dev AdminAllowedIPs=\"0.0.0.0/0\""
```

作業完了後は必ず元に戻してください:
```bash
sam deploy --parameter-overrides \
  "Environment=dev AdminAllowedIPs=\"138.64.83.96/32\""
```

## API Gateway Resource Policyの確認

現在のResource Policyを確認:

```bash
aws apigateway get-rest-api \
  --rest-api-id $(aws cloudformation describe-stacks \
    --stack-name cloudport-dev \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text | cut -d'/' -f3 | cut -d'.' -f1) \
  --query 'policy' \
  --output text | jq .
```

## ログの確認

IP制限によるアクセス拒否を確認:

```bash
aws logs tail /aws/apigateway/cloudport-dev --since 1h --filter-pattern "403"
```

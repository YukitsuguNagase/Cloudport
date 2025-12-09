# 決済セキュリティガイド

## 概要

決済試行回数の追跡とアカウントロック機能により、不正な決済試行からシステムを保護します。

## 実装内容

### 1. 決済試行回数の追跡

- **PaymentAttemptsTable**: ユーザーごとの決済失敗回数を記録
- **失敗回数の制限**: 5回の失敗で30分間ロック
- **自動クリーンアップ**: TTL機能により24時間後に自動削除

### 2. セキュリティ機能

#### アカウントロック
- 失敗回数が上限（5回）に達すると自動的にロック
- ロック期間: 30分間
- ロック中の試行: 残り時間を含むエラーメッセージを返す

#### 失敗記録
- 各決済失敗時に以下を記録:
  - ユーザーID
  - 失敗回数
  - 最終失敗時刻
  - エラーメッセージ
  - 契約ID

#### 成功時のリセット
- 決済成功時に失敗回数を自動的にクリア
- ロック状態も解除

## データ構造

### PaymentAttemptsTable

```
userId (Primary Key)
failedAttempts (Number)
lastFailedAt (Timestamp)
lastErrorMessage (String)
lastContractId (String)
lockedUntil (Timestamp)
ttl (Number) - 24時間後に自動削除
```

## セキュリティ設定

### 現在の設定

```typescript
MAX_PAYMENT_ATTEMPTS = 5      // 最大失敗回数
LOCKOUT_DURATION = 30 * 60    // ロック期間（秒）: 30分
TTL = 24 * 60 * 60           // データ保持期間: 24時間
```

### 設定の変更

より厳格なセキュリティが必要な場合、[processPayment.ts](../backend/src/handlers/contracts/processPayment.ts:19-20) の定数を変更してください:

```typescript
const MAX_PAYMENT_ATTEMPTS = 3       // 最大3回に変更
const LOCKOUT_DURATION = 60 * 60     // ロック期間を1時間に延長
```

## エラーレスポンス

### 試行回数超過

```json
{
  "statusCode": 429,
  "body": {
    "error": "決済試行回数の上限に達しました。15分後に再度お試しください。"
  }
}
```

### 決済失敗

```json
{
  "statusCode": 402,
  "body": {
    "error": "Payment processing failed"
  }
}
```

失敗情報はDynamoDBに記録され、次回試行時のチェックに使用されます。

## モニタリング

### Lambda関数ログの確認

```bash
# 決済処理のログを確認
aws logs tail /aws/lambda/cloudport-dev-ProcessPaymentFunction \
  --since 30m \
  --format short \
  --follow
```

成功時のログ:
```
Processing PAY.JP payment for contract xxx
PAY.JP charge created: ch_xxx
Payment attempts cleared for user xxx
```

失敗時のログ:
```
PAY.JP payment error: [エラー内容]
Failed payment attempt recorded for user xxx
```

ブロック時のログ:
```
Payment blocked for user xxx due to too many failed attempts
```

### DynamoDBデータの確認

```bash
# 現在ロックされているユーザーを確認
aws dynamodb scan \
  --table-name cloudport-payment-attempts-dev \
  --filter-expression "lockedUntil > :now" \
  --expression-attribute-values "{\":now\":{\"N\":\"$(date +%s)\"}}" \
  --region ap-northeast-1
```

### 失敗回数の多いユーザーを確認

```bash
aws dynamodb scan \
  --table-name cloudport-payment-attempts-dev \
  --filter-expression "failedAttempts >= :threshold" \
  --expression-attribute-values '{":threshold":{"N":"3"}}' \
  --region ap-northeast-1
```

## 手動での操作

### ユーザーのロック解除

緊急時にユーザーのロックを手動で解除する場合:

```bash
aws dynamodb update-item \
  --table-name cloudport-payment-attempts-dev \
  --key '{"userId":{"S":"user-id-here"}}' \
  --update-expression "SET failedAttempts = :zero, lockedUntil = :null" \
  --expression-attribute-values '{":zero":{"N":"0"},":null":{"NULL":true}}' \
  --region ap-northeast-1
```

### 失敗記録の確認

特定ユーザーの失敗記録を確認:

```bash
aws dynamodb get-item \
  --table-name cloudport-payment-attempts-dev \
  --key '{"userId":{"S":"user-id-here"}}' \
  --region ap-northeast-1
```

### 失敗記録の削除

```bash
aws dynamodb delete-item \
  --table-name cloudport-payment-attempts-dev \
  --key '{"userId":{"S":"user-id-here"}}' \
  --region ap-northeast-1
```

## アラート設定

### CloudWatch Metricsの作成

失敗回数の多いユーザーを検知するため、CloudWatch Logsからメトリクスを作成:

1. CloudWatch Logs Insights クエリ:

```
fields @timestamp, @message
| filter @message like /Failed payment attempt recorded/
| stats count() by bin(5m)
```

2. メトリクスフィルターの作成:

```bash
aws logs put-metric-filter \
  --log-group-name /aws/lambda/cloudport-dev-ProcessPaymentFunction \
  --filter-name PaymentFailureCount \
  --filter-pattern "[time, request_id, level, msg=\"Failed payment attempt recorded*\"]" \
  --metric-transformations \
    metricName=PaymentFailures,\
metricNamespace=CloudPort/Payments,\
metricValue=1,\
defaultValue=0
```

3. アラームの作成:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name cloudport-high-payment-failures \
  --alarm-description "Alert when payment failures exceed threshold" \
  --metric-name PaymentFailures \
  --namespace CloudPort/Payments \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:ap-northeast-1:YOUR_ACCOUNT_ID:cloudport-alerts
```

## テスト方法

### 1. 通常の決済フロー

```bash
# 正常な決済をテスト
curl -X POST \
  https://5i2r703nk5.execute-api.ap-northeast-1.amazonaws.com/dev/contracts/{contractId}/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payjpToken": "tok_valid_token_here"}'
```

### 2. 失敗カウントのテスト

```bash
# 無効なトークンで5回連続失敗させる
for i in {1..5}; do
  curl -X POST \
    https://5i2r703nk5.execute-api.ap-northeast-1.amazonaws.com/dev/contracts/{contractId}/payment \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"payjpToken": "tok_invalid_token"}'
  echo "Attempt $i"
  sleep 2
done
```

### 3. ロック状態の確認

```bash
# 6回目の試行でロックを確認
curl -X POST \
  https://5i2r703nk5.execute-api.ap-northeast-1.amazonaws.com/dev/contracts/{contractId}/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payjpToken": "tok_test_token"}'

# Expected: 429 Too Many Requests
# 「決済試行回数の上限に達しました。30分後に再度お試しください。」
```

## トラブルシューティング

### ロックが解除されない

1. DynamoDBでlockedUntilの値を確認
2. 現在時刻（Unix timestamp）と比較
3. 必要に応じて手動で解除

### 失敗回数がリセットされない

1. 成功した決済のログを確認
2. `clearPaymentAttempts` 関数の実行を確認
3. DynamoDBの更新ログを確認

### TTLが機能しない

1. DynamoDBテーブルのTTL設定を確認:

```bash
aws dynamodb describe-time-to-live \
  --table-name cloudport-payment-attempts-dev \
  --region ap-northeast-1
```

2. TTL属性が正しく設定されているか確認

## セキュリティのベストプラクティス

### 1. 監視とアラート

- 決済失敗率を監視
- 不審なパターンを検知
- 閾値を超えた場合は管理者に通知

### 2. レート制限

- API Gateway レベルでもレート制限を設定
- ユーザーごと、IPアドレスごとの制限を検討

### 3. 不正検知

- 短時間での大量試行を検知
- 異なる契約への連続試行を検知
- 複数アカウントからの同一カード試行を検知

### 4. ログ分析

- 定期的に失敗パターンを分析
- 不審なユーザーを特定
- セキュリティポリシーを随時更新

## PAY.JP本番承認への対応

本機能は PAY.JP の本番承認要件に対応しています:

- ✅ 不正利用対策: 試行回数制限とアカウントロック
- ✅ セキュリティログ: すべての失敗を記録
- ✅ 自動保護: 人手を介さず自動的にブロック
- ✅ 透明性: ユーザーに残り時間を通知

## 関連ドキュメント

- [PAY.JPキー管理ガイド](PAYJP_KEY_MANAGEMENT.md)
- [管理画面IP制限](ADMIN_IP_RESTRICTION.md)
- [ログイン通知機能](LOGIN_NOTIFICATION_SETUP.md)

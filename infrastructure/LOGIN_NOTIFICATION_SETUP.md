# ログイン通知機能セットアップガイド

## 概要

新しいデバイスからのログインを検知し、ユーザーにメール通知を送信する機能です。

## 実装内容

### 1. デバイス追跡

- **LoginDevicesTable**: ユーザーごとのログインデバイスを記録
- **デバイスフィンガープリント**: User-AgentとIPアドレスから生成
- 初回ログイン時にデバイスを登録

### 2. 通知機能

- 新しいデバイスからのログインを検知
- AWS SESを使用してメール通知を送信
- 通知内容: 日時、IPアドレス、デバイス情報

## SESセットアップ（必須）

ログイン通知メールを送信するには、AWS SESで送信元メールアドレスを検証する必要があります。

### 開発環境でのセットアップ

1. **メールアドレスの検証**

```bash
# 送信元メールアドレスを検証（開発環境ではサンドボックスモード）
aws ses verify-email-identity \
  --email-address noreply@cloudportjobs.com \
  --region ap-northeast-1
```

2. **検証メールの確認**

上記コマンド実行後、`noreply@cloudportjobs.com` に検証メールが送信されます。メール内のリンクをクリックして検証を完了してください。

3. **検証状態の確認**

```bash
aws ses get-identity-verification-attributes \
  --identities noreply@cloudportjobs.com \
  --region ap-northeast-1
```

### テスト用メールアドレスの追加

開発環境（サンドボックスモード）では、受信者のメールアドレスも検証する必要があります。

```bash
# テスト用受信者メールアドレスを検証
aws ses verify-email-identity \
  --email-address your-test-email@example.com \
  --region ap-northeast-1
```

### 本番環境へ移行

本番環境で任意のメールアドレスに送信できるようにするには、SESをサンドボックスモードから本番モードに移行する必要があります。

1. AWSコンソールでSESを開く
2. 「Sending Statistics」→「Request Production Access」をクリック
3. 申請フォームに以下を記入:
   - Use case: Transaction emails (login notifications)
   - Website URL: https://cloudportjobs.com
   - Description: セキュリティ目的のログイン通知メール
   - Daily sending volume: 1000通（予想）

### ドメイン認証（推奨）

より信頼性の高い配信のために、ドメイン全体を検証することを推奨します。

```bash
# ドメインの検証
aws ses verify-domain-identity \
  --domain cloudportjobs.com \
  --region ap-northeast-1
```

返却されたTXTレコードをDNS設定に追加してください。

## 送信元メールアドレスの変更

デフォルトの送信元メールアドレスは `noreply@cloudportjobs.com` です。変更する場合:

1. `template.yaml` の環境変数を更新:

```yaml
Globals:
  Function:
    Environment:
      Variables:
        SENDER_EMAIL: your-email@yourdomain.com
```

2. 新しいメールアドレスをSESで検証

3. デプロイ

```bash
cd infrastructure
sam build && sam deploy
```

## テスト方法

### 1. SES検証状態の確認

```bash
aws ses list-identities --region ap-northeast-1
```

### 2. ログインしてテスト

1. フロントエンドアプリケーションにログイン
2. 新しいデバイス（または異なるブラウザ）からログイン
3. ログイン通知メールを確認

### 3. Lambda関数ログの確認

```bash
aws logs tail /aws/lambda/cloudport-dev-PostAuthenticationFunction \
  --since 10m \
  --format short \
  --follow
```

成功時のログ:
```
New device login detected for user xxx-xxx-xxx
Login notification email sent to user@example.com
```

エラー時のログ:
```
Error sending login notification email: ...
```

## トラブルシューティング

### メールが届かない

1. **SES検証状態を確認**
```bash
aws ses get-identity-verification-attributes \
  --identities noreply@cloudportjobs.com \
  --region ap-northeast-1
```

2. **サンドボックスモードの確認**
開発環境では受信者のメールアドレスも検証が必要です。

3. **Lambda関数のログを確認**
```bash
aws logs tail /aws/lambda/cloudport-dev-PostAuthenticationFunction --since 30m
```

### 初回ログインで通知が来ない

これは正常な動作です。システムは初回ログイン時にデバイスを登録し、2回目以降の新しいデバイスからのログインで通知を送信します。

テストする場合:
1. 初回ログイン（通知なし - デバイス登録）
2. ログアウト
3. 別のブラウザまたはシークレットモードでログイン（通知あり）

### デバイスがリセットされない

デバイス情報を手動でリセットする場合:

```bash
# 特定ユーザーのデバイス情報を削除
aws dynamodb query \
  --table-name cloudport-login-devices-dev \
  --key-condition-expression "userId = :userId" \
  --expression-attribute-values '{":userId":{"S":"user-id-here"}}' \
  --region ap-northeast-1
```

## セキュリティ考慮事項

1. **メール送信の失敗はログインをブロックしない**
   - メール送信エラーは記録されますが、ユーザーのログインは継続されます

2. **デバイスフィンガープリント**
   - User-AgentとIPアドレスの組み合わせでデバイスを識別
   - 同じデバイスでもIPが変わると新しいデバイスとして認識されます

3. **プライバシー**
   - デバイス情報（IPアドレス、User-Agent）は暗号化されずに保存されます
   - 必要に応じて暗号化の実装を検討してください

## 次のステップ

- [ ] SESで送信元メールアドレスを検証
- [ ] テスト用受信者メールアドレスを検証
- [ ] ログインテストを実施
- [ ] 本番環境への移行申請（必要に応じて）
- [ ] ドメイン認証の設定（推奨）

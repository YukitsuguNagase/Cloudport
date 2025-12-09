# PAY.JP キー管理ガイド

## 概要

PAY.JPのAPIキーは、AWS Secrets Managerで安全に管理されています。テスト環境と本番環境でキーを切り替える方法を説明します。

## 現在の設定

- **開発環境 (dev)**: テストキー `sk_test_c07bd8dfb391cb8bdc497b46` がデフォルト
- **本番環境 (prod)**: 本番キーを明示的に指定する必要があります

## テストキーから本番キーへの切り替え方法

### 1. 本番キーの取得

PAY.JPダッシュボードから本番用のシークレットキー (sk_live_xxxxx) を取得してください。

### 2. デプロイ時にキーを指定

#### 開発環境で本番キーをテストする場合

```bash
cd infrastructure
sam deploy --parameter-overrides "Environment=dev PayjpSecretKeyParam=sk_live_xxxxxxxxxxxxx"
```

#### 本番環境にデプロイする場合

```bash
cd infrastructure
sam deploy --config-env prod --parameter-overrides "Environment=prod PayjpSecretKeyParam=sk_live_xxxxxxxxxxxxx"
```

### 3. samconfig.toml を更新する場合

`infrastructure/samconfig.toml` ファイルを編集して、parameter_overrides に本番キーを追加:

```toml
[prod.deploy.parameters]
parameter_overrides = "Environment=\"prod\" PayjpSecretKeyParam=\"sk_live_xxxxxxxxxxxxx\""
```

**注意**: この方法はキーがファイルに保存されるため、Gitにコミットしないよう注意してください。

### 4. 環境変数を使用する方法（推奨）

セキュリティのため、本番キーは環境変数として設定することを推奨します:

```bash
export PAYJP_PROD_KEY="sk_live_xxxxxxxxxxxxx"
cd infrastructure
sam deploy --config-env prod --parameter-overrides "Environment=\"prod\" PayjpSecretKeyParam=\"$PAYJP_PROD_KEY\""
```

## セキュリティのベストプラクティス

1. **テストキーと本番キーを明確に区別する**
   - テストキー: `sk_test_xxxxx`
   - 本番キー: `sk_live_xxxxx`

2. **本番キーをGitにコミットしない**
   - `.gitignore` で設定ファイルを除外
   - 環境変数やCI/CDシークレットを使用

3. **キーのローテーション**
   - 定期的に本番キーを更新
   - 漏洩が疑われる場合は即座にローテーション

4. **アクセス制限**
   - AWS Secrets Manager のアクセスは Lambda 関数のみに制限
   - IAMポリシーで適切な権限管理

## キーの確認方法

現在デプロイされているキーを確認:

```bash
aws secretsmanager get-secret-value \
  --secret-id cloudport-payjp-secret-dev \
  --query SecretString \
  --output text | jq -r .secret_key
```

本番環境の場合:

```bash
aws secretsmanager get-secret-value \
  --secret-id cloudport-payjp-secret-prod \
  --query SecretString \
  --output text | jq -r .secret_key
```

## トラブルシューティング

### キーが正しく設定されているか確認

Lambda 関数のログで確認:

```bash
aws logs tail /aws/lambda/cloudport-dev-ProcessPaymentFunction --since 5m
```

### キーの更新が反映されない場合

1. CloudFormation スタックが正常に更新されたか確認
2. Lambda 関数を再起動（キャッシュのクリア）:
   ```bash
   aws lambda update-function-configuration \
     --function-name cloudport-dev-ProcessPaymentFunction \
     --environment Variables={}
   ```

## 本番承認申請時の注意

PAY.JPの本番承認を受けるには:

1. テストキーで十分にテストを実施
2. 本番キーに切り替える前にPAY.JPに本番承認を申請
3. 承認後、本番キーを取得して上記手順でデプロイ
4. 本番環境で決済テストを実施（少額決済→返金で確認）

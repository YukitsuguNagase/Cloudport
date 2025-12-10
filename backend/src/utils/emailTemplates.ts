/**
 * メールテンプレート集
 */

const APP_URL = process.env.APP_URL || 'https://cloudportjob.com'

/**
 * 新規ユーザー登録ウェルカムメール
 */
export const welcomeEmail = (displayName: string, userType: 'engineer' | 'company') => {
  const userTypeText = userType === 'engineer' ? 'エンジニア' : '企業'

  return {
    subject: '【CloudPort】ご登録ありがとうございます',
    body: `
${displayName} 様

CloudPortへのご登録ありがとうございます。

${userTypeText}として登録が完了しました。
早速、CloudPortで${userType === 'engineer' ? '案件を探してみましょう' : '案件を投稿してみましょう'}。

▼ログインはこちら
${APP_URL}/login

▼マイページ
${APP_URL}/profile

ご不明な点がございましたら、お気軽にお問い合わせください。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 新規応募通知（企業向け）
 */
export const newApplicationEmail = (companyName: string, jobTitle: string, engineerName: string, applicationId: string) => {
  return {
    subject: '【CloudPort】新しい応募がありました',
    body: `
${companyName} 様

案件「${jobTitle}」に新しい応募がありました。

応募者: ${engineerName}

▼応募詳細を確認
${APP_URL}/applications

応募者のプロフィールを確認し、メッセージでやり取りを開始してください。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 新規メッセージ通知
 */
export const newMessageEmail = (recipientName: string, senderName: string, jobTitle: string, conversationId: string) => {
  return {
    subject: '【CloudPort】新しいメッセージが届きました',
    body: `
${recipientName} 様

${senderName}さんから新しいメッセージが届きました。

案件: ${jobTitle}

▼メッセージを確認
${APP_URL}/messages/${conversationId}

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 契約申請通知（エンジニア向け）
 */
export const contractRequestEmail = (engineerName: string, companyName: string, jobTitle: string, amount: number, contractId: string) => {
  return {
    subject: '【CloudPort】契約申請が届きました',
    body: `
${engineerName} 様

${companyName}から契約申請が届きました。

案件: ${jobTitle}
契約金額: ¥${amount.toLocaleString()}

▼契約内容を確認
${APP_URL}/contracts/${contractId}

契約内容をご確認の上、承認してください。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 契約承認通知（企業向け）
 */
export const contractApprovedEmail = (companyName: string, engineerName: string, jobTitle: string, amount: number, contractId: string) => {
  return {
    subject: '【CloudPort】契約が承認されました',
    body: `
${companyName} 様

${engineerName}さんが契約を承認しました。

案件: ${jobTitle}
契約金額: ¥${amount.toLocaleString()}

▼決済手続きへ進む
${APP_URL}/contracts/${contractId}

決済が完了すると、プロジェクトを開始できます。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 決済完了通知（企業向け）
 */
export const paymentCompletedEmailForCompany = (companyName: string, engineerName: string, jobTitle: string, amount: number, contractId: string) => {
  return {
    subject: '【CloudPort】決済が完了しました',
    body: `
${companyName} 様

契約の決済が完了しました。

案件: ${jobTitle}
エンジニア: ${engineerName}
決済金額: ¥${amount.toLocaleString()}

▼契約詳細
${APP_URL}/contracts/${contractId}

プロジェクトを開始してください。
完了後は必ず完了報告をお願いします。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 決済完了通知（エンジニア向け）
 */
export const paymentCompletedEmailForEngineer = (engineerName: string, companyName: string, jobTitle: string, amount: number, contractId: string) => {
  return {
    subject: '【CloudPort】契約の決済が完了しました',
    body: `
${engineerName} 様

契約の決済が完了しました。

案件: ${jobTitle}
企業: ${companyName}
契約金額: ¥${amount.toLocaleString()}

▼契約詳細
${APP_URL}/contracts/${contractId}

プロジェクトを開始してください。
作業完了後は、企業からの完了報告をお待ちください。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * スカウト受信通知（エンジニア向け）
 */
export const scoutReceivedEmail = (engineerName: string, companyName: string, jobTitle: string, jobId: string) => {
  return {
    subject: '【CloudPort】スカウトが届きました',
    body: `
${engineerName} 様

${companyName}からスカウトが届きました！

案件: ${jobTitle}

▼案件詳細を確認
${APP_URL}/jobs/${jobId}

興味がある場合は、案件詳細をご確認の上、応募してください。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 返金処理完了通知（企業向け）
 */
export const refundProcessedEmail = (companyName: string, jobTitle: string, refundAmount: number, contractId: string, reason?: string) => {
  return {
    subject: '【CloudPort】返金処理が完了しました',
    body: `
${companyName} 様

契約の返金処理が完了しました。

案件: ${jobTitle}
返金金額: ¥${refundAmount.toLocaleString()}
${reason ? `理由: ${reason}` : ''}

▼契約詳細
${APP_URL}/contracts/${contractId}

返金は通常3-5営業日以内にお客様のクレジットカードに反映されます。

ご不明な点がございましたら、お問い合わせください。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * 契約完了通知（エンジニア向け - 支払い処理後）
 */
export const contractCompletedEmailForEngineer = (engineerName: string, companyName: string, jobTitle: string, amount: number, contractId: string) => {
  return {
    subject: '【CloudPort】契約が完了しました',
    body: `
${engineerName} 様

契約が完了しました。お疲れ様でした！

案件: ${jobTitle}
企業: ${companyName}
報酬: ¥${amount.toLocaleString()}

▼契約詳細
${APP_URL}/contracts/${contractId}

報酬の振込については、別途ご案内いたします。

CloudPort運営チーム
    `.trim(),
  }
}

/**
 * アカウントロックアウト通知
 */
export const accountLockedEmail = (email: string, lockoutMinutes: number, ipAddress: string) => {
  return {
    subject: '【CloudPort】アカウントが一時的にロックされました',
    body: `
${email} 様

セキュリティ保護のため、お客様のアカウントが一時的にロックされました。

▼詳細
ログイン試行回数が上限に達したため、アカウントを保護するために一時的にロックしました。
ロック期間: ${lockoutMinutes}分
アクセス元IPアドレス: ${ipAddress}

▼ロック解除について
${lockoutMinutes}分後に自動的にロックが解除され、再度ログインできるようになります。

▼心当たりがない場合
もしこのアクセスに心当たりがない場合は、第三者による不正アクセスの可能性があります。
以下の対応を推奨します：
1. パスワードを変更する
2. 二要素認証（MFA）を有効にする
3. セキュリティ設定を確認する

▼サポート
ご不明な点やご心配な点がございましたら、お気軽にお問い合わせください。

CloudPort セキュリティチーム
    `.trim(),
  }
}

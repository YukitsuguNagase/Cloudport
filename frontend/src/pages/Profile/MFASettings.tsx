import { useState, useEffect } from 'react'
import { Button, Card, Alert, Spin, QRCode, Input, Space, Typography, Radio, Modal } from 'antd'
import { SafetyOutlined, MobileOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons'
import { getMFAStatus, setupMFA } from '../../services/mfa'

const { Title, Paragraph, Text } = Typography

interface MFAStatus {
  mfaEnabled: boolean
  preferredMfa: string | null
  availableMfaMethods: string[]
  phoneNumber: string | null
  phoneVerified: boolean
  totpEnabled: boolean
  smsEnabled: boolean
}

const MFASettings = () => {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [mfaStatus, setMFAStatus] = useState<MFAStatus | null>(null)
  const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'verify'>('idle')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [secretCode, setSecretCode] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms'>('totp')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    fetchMFAStatus()
  }, [])

  const fetchMFAStatus = async () => {
    try {
      setLoading(true)
      const status = await getMFAStatus()
      setMFAStatus(status)
    } catch (err: any) {
      setError(err.message || 'MFA設定の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSetup = async () => {
    try {
      setActionLoading(true)
      setError('')
      setSuccess('')

      if (selectedMethod === 'totp') {
        // TOTP設定開始
        const result = await setupMFA('setup_totp', {})
        setQrCodeUrl(result.qrCodeUrl || '')
        setSecretCode(result.secretCode || '')
        setSetupStep('qr')
      } else {
        // SMS MFA設定
        if (!mfaStatus?.phoneNumber || !mfaStatus?.phoneVerified) {
          setError('SMS MFAを有効にするには、まず電話番号を登録・認証してください')
          return
        }
        await setupMFA('setup_sms', {})
        setSuccess('SMS MFAを有効にしました')
        await fetchMFAStatus()
      }
    } catch (err: any) {
      setError(err.message || 'MFA設定の開始に失敗しました')
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerifyTOTP = async () => {
    try {
      setActionLoading(true)
      setError('')

      await setupMFA('verify_totp', { code: verificationCode })
      setSuccess('TOTP MFAを有効にしました')
      setSetupStep('idle')
      setVerificationCode('')
      setQrCodeUrl('')
      setSecretCode('')
      await fetchMFAStatus()
    } catch (err: any) {
      setError(err.message || '認証コードの検証に失敗しました')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisableMFA = () => {
    Modal.confirm({
      title: 'MFAを無効にしますか？',
      content: '二要素認証を無効にすると、アカウントのセキュリティが低下します。',
      okText: '無効にする',
      cancelText: 'キャンセル',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setActionLoading(true)
          setError('')
          await setupMFA('disable_mfa', {})
          setSuccess('MFAを無効にしました')
          await fetchMFAStatus()
        } catch (err: any) {
          setError(err.message || 'MFAの無効化に失敗しました')
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  const handleCancelSetup = () => {
    setSetupStep('idle')
    setQrCodeUrl('')
    setSecretCode('')
    setVerificationCode('')
    setError('')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>
        <SafetyOutlined /> 二要素認証（MFA）
      </Title>
      <Paragraph>
        二要素認証を有効にすると、ログイン時にパスワードに加えて追加の認証コードが必要になり、アカウントのセキュリティが大幅に向上します。
      </Paragraph>

      {error && (
        <Alert message={error} type="error" closable onClose={() => setError('')} style={{ marginBottom: 16 }} />
      )}

      {success && (
        <Alert message={success} type="success" closable onClose={() => setSuccess('')} style={{ marginBottom: 16 }} />
      )}

      {/* 現在のステータス */}
      <Card title="MFA設定状況" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>ステータス: </Text>
            {mfaStatus?.mfaEnabled ? (
              <Text type="success">有効</Text>
            ) : (
              <Text type="warning">無効</Text>
            )}
          </div>
          {mfaStatus?.mfaEnabled && (
            <>
              <div>
                <Text strong>使用中の認証方法: </Text>
                <Text>{mfaStatus.preferredMfa === 'SOFTWARE_TOKEN_MFA' ? '認証アプリ (TOTP)' : 'SMS'}</Text>
              </div>
              <div>
                <Text strong>TOTP: </Text>
                <Text>{mfaStatus.totpEnabled ? '有効' : '無効'}</Text>
              </div>
              <div>
                <Text strong>SMS: </Text>
                <Text>{mfaStatus.smsEnabled ? '有効' : '無効'}</Text>
              </div>
            </>
          )}
          {mfaStatus?.phoneNumber && (
            <div>
              <Text strong>登録済み電話番号: </Text>
              <Text>{mfaStatus.phoneNumber}</Text>
              {mfaStatus.phoneVerified ? (
                <Text type="success"> (認証済み)</Text>
              ) : (
                <Text type="warning"> (未認証)</Text>
              )}
            </div>
          )}
        </Space>
      </Card>

      {/* セットアップエリア */}
      {setupStep === 'idle' && (
        <Card title="MFA設定">
          {!mfaStatus?.mfaEnabled ? (
            <>
              <Paragraph>認証方法を選択してMFAを有効にしてください：</Paragraph>
              <Radio.Group
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical">
                  <Radio value="totp">
                    <QrcodeOutlined /> 認証アプリ (TOTP) - Google Authenticator等
                  </Radio>
                  <Radio value="sms" disabled={!mfaStatus?.phoneVerified}>
                    <MobileOutlined /> SMS認証 {!mfaStatus?.phoneVerified && '(電話番号の登録が必要)'}
                  </Radio>
                </Space>
              </Radio.Group>
              <Button type="primary" onClick={handleStartSetup} loading={actionLoading} icon={<SafetyOutlined />}>
                MFAを有効にする
              </Button>
            </>
          ) : (
            <>
              <Paragraph>MFAは既に有効になっています。</Paragraph>
              <Button danger onClick={handleDisableMFA} loading={actionLoading} icon={<DeleteOutlined />}>
                MFAを無効にする
              </Button>
            </>
          )}
        </Card>
      )}

      {/* QRコード表示 */}
      {setupStep === 'qr' && (
        <Card title="Step 1: QRコードをスキャン">
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Paragraph>
              Google AuthenticatorやMicrosoft Authenticatorなどの認証アプリでこのQRコードをスキャンしてください。
            </Paragraph>
            {qrCodeUrl && <QRCode value={qrCodeUrl} size={200} />}
            <Paragraph>
              <Text strong>手動入力用シークレットコード:</Text>
              <br />
              <Text code copyable>
                {secretCode}
              </Text>
            </Paragraph>
            <Button type="primary" onClick={() => setSetupStep('verify')}>
              次へ
            </Button>
            <Button onClick={handleCancelSetup}>キャンセル</Button>
          </Space>
        </Card>
      )}

      {/* 認証コード検証 */}
      {setupStep === 'verify' && (
        <Card title="Step 2: 認証コードを入力">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>認証アプリに表示されている6桁のコードを入力してください。</Paragraph>
            <Input
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              style={{ width: 200 }}
            />
            <Space>
              <Button type="primary" onClick={handleVerifyTOTP} loading={actionLoading} disabled={verificationCode.length !== 6}>
                確認
              </Button>
              <Button onClick={() => setSetupStep('qr')}>戻る</Button>
              <Button onClick={handleCancelSetup}>キャンセル</Button>
            </Space>
          </Space>
        </Card>
      )}
    </div>
  )
}

export default MFASettings

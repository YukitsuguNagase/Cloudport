import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Input, InputNumber, message, Table, Popconfirm, Tag, Space } from 'antd'
import { DeleteOutlined, PlusOutlined, SecurityScanOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import AdminHeader from '../../components/layout/AdminHeader'
import * as securityService from '../../services/security'
import type { BlockedIP } from '../../services/security'

const SecuritySettings = () => {
  const { user, getIdToken } = useAuth()
  const navigate = useNavigate()
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [newIPAddress, setNewIPAddress] = useState('')
  const [reason, setReason] = useState('')
  const [durationHours, setDurationHours] = useState<number | null>(null)

  const loadBlockedIPs = async () => {
    try {
      setLoading(true)
      const idToken = await getIdToken()
      const data = await securityService.getBlockedIPs(idToken)
      setBlockedIPs(data)
    } catch (error) {
      console.error('Failed to load blocked IPs:', error)
      message.error('ブロック中のIPアドレスの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/admin/login')
      return
    }

    // Check if user is admin
    if (user.email !== 'yukinag@dotqinc.com') {
      message.error('管理者権限が必要です')
      navigate('/')
      return
    }

    loadBlockedIPs()
  }, [user, navigate])

  const handleBlockIP = async () => {
    if (!newIPAddress.trim()) {
      message.error('IPアドレスを入力してください')
      return
    }

    if (!reason.trim()) {
      message.error('ブロック理由を入力してください')
      return
    }

    try {
      setLoading(true)
      const idToken = await getIdToken()
      await securityService.blockIP(idToken, {
        ipAddress: newIPAddress.trim(),
        reason: reason.trim(),
        durationHours: durationHours || undefined,
      })
      message.success('IPアドレスをブロックしました')
      setIsModalVisible(false)
      setNewIPAddress('')
      setReason('')
      setDurationHours(null)
      await loadBlockedIPs()
    } catch (error) {
      console.error('Failed to block IP:', error)
      message.error('IPアドレスのブロックに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblockIP = async (ipAddress: string) => {
    try {
      setLoading(true)
      const idToken = await getIdToken()
      await securityService.unblockIP(idToken, ipAddress)
      message.success('IPアドレスのブロックを解除しました')
      await loadBlockedIPs()
    } catch (error) {
      console.error('Failed to unblock IP:', error)
      message.error('IPアドレスのブロック解除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'IPアドレス',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{ip}</span>
      ),
    },
    {
      title: 'ブロック理由',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'ブロック日時',
      dataIndex: 'blockedAt',
      key: 'blockedAt',
      render: (date: string) => new Date(date).toLocaleString('ja-JP'),
    },
    {
      title: 'ブロック実行者',
      dataIndex: 'blockedBy',
      key: 'blockedBy',
    },
    {
      title: '有効期限',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string | null) => {
        if (!expiresAt) {
          return <Tag color="red">永久</Tag>
        }
        const expireDate = new Date(expiresAt)
        const now = new Date()
        const hoursLeft = Math.round((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60))

        return (
          <Space>
            <ClockCircleOutlined />
            <span>
              {expireDate.toLocaleString('ja-JP')}
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                (残り{hoursLeft}時間)
              </span>
            </span>
          </Space>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BlockedIP) => (
        <Popconfirm
          title="ブロックを解除しますか？"
          description={`IPアドレス: ${record.ipAddress}`}
          onConfirm={() => handleUnblockIP(record.ipAddress)}
          okText="解除"
          cancelText="キャンセル"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            解除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <>
      <AdminHeader />
      <div style={{ padding: '24px', minHeight: 'calc(100vh - 80px)', background: '#f5f5f5' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SecurityScanOutlined style={{ fontSize: '32px', color: '#00E5FF' }} />
            セキュリティ設定
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            不審なIPアドレスをブロックして、不正アクセスを防止します
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          size="large"
        >
          IPアドレスをブロック
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={blockedIPs}
        rowKey="ipAddress"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `全${total}件`,
        }}
        locale={{
          emptyText: 'ブロック中のIPアドレスはありません',
        }}
      />

      <Modal
        title="IPアドレスをブロック"
        open={isModalVisible}
        onOk={handleBlockIP}
        onCancel={() => {
          setIsModalVisible(false)
          setNewIPAddress('')
          setReason('')
          setDurationHours(null)
        }}
        okText="ブロック"
        cancelText="キャンセル"
        confirmLoading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              IPアドレス <span style={{ color: 'red' }}>*</span>
            </label>
            <Input
              placeholder="例: 192.168.1.1"
              value={newIPAddress}
              onChange={(e) => setNewIPAddress(e.target.value)}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              ブロック理由 <span style={{ color: 'red' }}>*</span>
            </label>
            <Input.TextArea
              placeholder="例: 不正なログイン試行を複数回検出"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              ブロック期間（時間）
            </label>
            <InputNumber
              placeholder="空欄の場合は永久ブロック"
              value={durationHours}
              onChange={(value) => setDurationHours(value)}
              min={1}
              max={8760}
              style={{ width: '100%' }}
              addonAfter="時間"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              ※空欄の場合は永久ブロックになります
            </div>
          </div>
        </div>
      </Modal>
      </div>
    </>
  )
}

export default SecuritySettings

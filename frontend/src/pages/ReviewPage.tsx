import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Progress,
  message,
} from 'antd'
import { reviewerApi, generatorApi } from '../services/api'
import { QAPair, QACategory } from '../types'
import type { ColumnsType } from 'antd/es/table'

const ReviewPage = () => {
  const [loading, setLoading] = useState(false)
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [reviewingQa, setReviewingQa] = useState<QAPair | null>(null)
  const [reviewResult, setReviewResult] = useState<any>(null)
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    loadQAPairs()
  }, [])

  const loadQAPairs = async () => {
    setLoading(true)
    try {
      const response = await generatorApi.getHistory({
        page: 1,
        page_size: 50,
      })
      if (response.items) {
        setQaPairs(response.items)
      }
    } catch (error: any) {
      message.error('獲取問答對列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (qaPair: QAPair) => {
    setReviewingQa(qaPair)
    setReviewModalVisible(true)
    setReviewResult(null)
    setReviewing(true)

    try {
      const result = await reviewerApi.review(qaPair.id)
      setReviewResult(result)
      message.success('審查結果完成')
      loadQAPairs() // 重新載入列表
    } catch (error: any) {
      message.error(error.message || '審查結果失敗')
    } finally {
      setReviewing(false)
    }
  }

  const handleBatchReview = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('請選擇要生成審查結果的問答對')
      return
    }

    setReviewing(true)
    try {
      const result = await reviewerApi.batchReview(selectedRowKeys)
      message.success(`批量審查結果完成：通過 ${result.summary.passed}，失敗 ${result.summary.failed}`)
      setSelectedRowKeys([])
      loadQAPairs()
    } catch (error: any) {
      message.error(error.message || '批量審查結果失敗')
    } finally {
      setReviewing(false)
    }
  }

  const columns: ColumnsType<QAPair> = [
    {
      title: '問題',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      width: 300,
    },
    {
      title: '答案',
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
      width: 300,
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: QACategory) => <Tag>{category}</Tag>,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          待審查: 'orange',
          已審查: 'blue',
          已通過: 'green',
          已拒絕: 'red',
        }
        return <Tag color={colorMap[status]}>{status}</Tag>
      },
    },
    {
      title: '審查評分',
      dataIndex: 'reviewer_score',
      key: 'reviewer_score',
      width: 100,
      render: (score: number | null) => score ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: QAPair) => (
        <Button
          type="link"
          onClick={() => handleReview(record)}
          disabled={reviewing}
        >
          審查結果
        </Button>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[])
    },
  }

  return (
    <div>
      <Card
        title="AI審核(此功能測試中)"
        extra={
          <Space>
            <Button onClick={loadQAPairs} loading={loading}>
              刷新
            </Button>
            <Button
              type="primary"
              onClick={handleBatchReview}
              disabled={selectedRowKeys.length === 0 || reviewing}
              loading={reviewing}
            >
              批量審查結果 ({selectedRowKeys.length})
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={qaPairs}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="審查結果"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {reviewingQa && (
          <div style={{ marginBottom: 24 }}>
            <h3>問答對內容</h3>
            <p>
              <strong>問題：</strong>
              {reviewingQa.question}
            </p>
            <p>
              <strong>答案：</strong>
              {reviewingQa.answer}
            </p>
          </div>
        )}

        {reviewing && <div>正在生成審查結果中...</div>}

        {reviewResult && (
          <div>
            <h3>審查結果</h3>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <strong>綜合評分：</strong>
                <Progress
                  percent={reviewResult.reviewer_score}
                  status={
                    reviewResult.reviewer_score >= 80
                      ? 'success'
                      : reviewResult.reviewer_score >= 60
                      ? 'normal'
                      : 'exception'
                  }
                />
                <span style={{ marginLeft: 8 }}>
                  {reviewResult.reviewer_score} / 100
                </span>
              </div>

              <div>
                <strong>各維度評分：</strong>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    準確性：
                    <Progress percent={reviewResult.scores.accuracy} />
                  </div>
                  <div>
                    完整性：
                    <Progress percent={reviewResult.scores.completeness} />
                  </div>
                  <div>
                    相關性：
                    <Progress percent={reviewResult.scores.relevance} />
                  </div>
                  <div>
                    語言質量：
                    <Progress percent={reviewResult.scores.language_quality} />
                  </div>
                  <div>
                    領域適配性：
                    <Progress percent={reviewResult.scores.domain_fit} />
                  </div>
                </Space>
              </div>

              <div>
                <strong>審查結果：</strong>
                <Tag color={reviewResult.passed ? 'green' : 'red'}>
                  {reviewResult.passed ? '通過' : '未通過'}
                </Tag>
              </div>

              {reviewResult.suggestions &&
                reviewResult.suggestions.length > 0 && (
                  <div>
                    <strong>改進建議：</strong>
                    <ul>
                      {reviewResult.suggestions.map(
                        (suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReviewPage


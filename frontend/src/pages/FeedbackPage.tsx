import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Radio,
} from 'antd'
import { feedbackApi } from '../services/api'
import { QAPair, QACategory, ReviewAction } from '../types'
import type { ColumnsType } from 'antd/es/table'

const { TextArea } = Input

const FeedbackPage = () => {
  const [loading, setLoading] = useState(false)
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [currentQa, setCurrentQa] = useState<QAPair | null>(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPendingQAs()
  }, [])

  const loadPendingQAs = async () => {
    setLoading(true)
    try {
      const response = await feedbackApi.getPending({
        page: 1,
        page_size: 50,
      })
      if (response.items) {
        setQaPairs(response.items)
      }
    } catch (error: any) {
      message.error('獲取待人工審查列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = (qaPair: QAPair) => {
    setCurrentQa(qaPair)
    setFeedbackModalVisible(true)
    form.resetFields()
    // 初始化表單，如果是修改操作，自動填充原始問題答案
    form.setFieldsValue({
      action: ReviewAction.APPROVE,
      modified_question: qaPair.question,  // 自動填充原始問題
      modified_answer: qaPair.answer,       // 自動填充原始答案
    })
  }

  const handleSubmit = async (values: any) => {
    if (!currentQa) return

    setSubmitting(true)
    try {
      await feedbackApi.submit({
        qa_pair_id: currentQa.id,
        action: values.action,
        modified_question:
          values.action === ReviewAction.MODIFY
            ? values.modified_question
            : undefined,
        modified_answer:
          values.action === ReviewAction.MODIFY
            ? values.modified_answer
            : undefined,
        feedback_categories: values.feedback_categories,
        review_reason: values.review_reason,
      })
      message.success('人工審查提交成功')
      setFeedbackModalVisible(false)
      loadPendingQAs()
    } catch (error: any) {
      message.error(error.message || '提交失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<QAPair> = [
    {
      title: '問題',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      width: 250,
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
      title: 'AI評分',
      dataIndex: 'reviewer_score',
      key: 'reviewer_score',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: QAPair) => (
        <Button type="link" onClick={() => handleFeedback(record)}>
          人工審查
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="待人工審查列表(經審核後才會加入知識庫)"
        extra={
          <Button onClick={loadPendingQAs} loading={loading}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={qaPairs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="人工審查"
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentQa && (
          <div style={{ marginBottom: 24 }}>
            <h3>問答對內容</h3>
            <p>
              <strong>問題：</strong>
              {currentQa.question}
            </p>
            <p>
              <strong>答案：</strong>
              {currentQa.answer}
            </p>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="action"
            label="操作"
            rules={[{ required: true, message: '請選擇操作' }]}
          >
            <Radio.Group>
              <Radio value={ReviewAction.APPROVE}>通過</Radio>
              <Radio value={ReviewAction.MODIFY}>修改</Radio>
              <Radio value={ReviewAction.REJECT}>拒絕</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.action !== currentValues.action
            }
          >
            {({ getFieldValue }) => {
              const action = getFieldValue('action')
              if (action === ReviewAction.MODIFY) {
                // 當選擇修改時，自動填充原始內容
                // 如果欄位為空，設置初始值
                if (!form.getFieldValue('modified_question') && currentQa?.question) {
                  form.setFieldValue('modified_question', currentQa.question)
                }
                if (!form.getFieldValue('modified_answer') && currentQa?.answer) {
                  form.setFieldValue('modified_answer', currentQa.answer)
                }
                
                return (
                  <>
                    <Form.Item
                      name="modified_question"
                      label="修改後的問題"
                      rules={[
                        { required: true, message: '請輸入修改後的問題' },
                      ]}
                    >
                      <TextArea 
                        rows={3} 
                        disabled={submitting}
                        placeholder="請在此修改問題內容"
                      />
                    </Form.Item>
                    <Form.Item
                      name="modified_answer"
                      label="修改後的答案"
                      rules={[
                        { required: true, message: '請輸入修改後的答案' },
                      ]}
                    >
                      <TextArea 
                        rows={5} 
                        disabled={submitting}
                        placeholder="請在此修改答案內容"
                      />
                    </Form.Item>
                  </>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item name="feedback_categories" label="審查分類（可選）">
            <Select mode="multiple" placeholder="選擇審查分類" disabled={submitting}>
              <Select.Option value="準確性">準確性</Select.Option>
              <Select.Option value="完整性">完整性</Select.Option>
              <Select.Option value="相關性">相關性</Select.Option>
              <Select.Option value="語言質量">語言質量</Select.Option>
              <Select.Option value="領域適配性">領域適配性</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="review_reason" label="審查原因">
            <TextArea rows={3} placeholder="請說明審查原因或修改理由" disabled={submitting} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
              <Button onClick={() => setFeedbackModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FeedbackPage


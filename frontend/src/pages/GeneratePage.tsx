import { useState } from 'react'
import {
  Card,
  Form,
  Select,
  InputNumber,
  Input,
  Button,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { generatorApi } from '../services/api'
import { QACategory, QAPair } from '../types'
import type { ColumnsType } from 'antd/es/table'

const GeneratePage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyData, setHistoryData] = useState<QAPair[]>([])

  const handleGenerate = async (values: any) => {
    console.log('開始生成，參數：', values)
    
    // 驗證必填欄位
    if (!values.category) {
      message.error('請選擇知識領域')
      return
    }
    if (!values.count || values.count < 1) {
      message.error('請輸入有效的生成數量（1-100）')
      return
    }
    
    setLoading(true)
    try {
      const requestData = {
        category: values.category,
        count: values.count,
        topic: values.topic || undefined,
        style: values.style || '專業',
      }
      
      console.log('發送請求數據：', requestData)
      
      const response: any = await generatorApi.generate(requestData)

      console.log('生成響應：', response)

      if (response && response.data && response.data.qa_pairs && response.data.qa_pairs.length > 0) {
        const newQaPairs = response.data.qa_pairs
        setQaPairs(newQaPairs)
        
        // 保存到 localStorage
        const stored = localStorage.getItem('qa_history')
        const history = stored ? JSON.parse(stored) : []
        history.unshift(...newQaPairs)
        localStorage.setItem('qa_history', JSON.stringify(history))
        
        message.success(`成功生成 ${newQaPairs.length} 個問答對`)
        // 重新載入歷史記錄
        loadHistory()
      } else if (response && response.qa_pairs && response.qa_pairs.length > 0) {
        // 向后兼容旧格式
        const newQaPairs = response.qa_pairs
        setQaPairs(newQaPairs)
        
        // 保存到 localStorage
        const stored = localStorage.getItem('qa_history')
        const history = stored ? JSON.parse(stored) : []
        history.unshift(...newQaPairs)
        localStorage.setItem('qa_history', JSON.stringify(history))
        
        message.success(`成功生成 ${newQaPairs.length} 個問答對`)
        loadHistory()
      } else {
        message.warning('生成完成，但沒有返回問答對')
      }
    } catch (error: any) {
      console.error('生成失敗：', error)
      console.error('錯誤詳情：', error?.response)
      console.error('完整錯誤對象：', JSON.stringify(error, null, 2))
      
      let errorMessage = '生成失敗'
      
      // 處理不同的錯誤格式
      if (error?.response?.data) {
        // 處理Pydantic驗證錯誤
        if (Array.isArray(error.response.data.detail)) {
          const errors = error.response.data.detail.map((e: any) => {
            return `${e.loc?.join('.')}: ${e.msg}`
          }).join('; ')
          errorMessage = `驗證錯誤: ${errors}`
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // 顯示詳細錯誤信息
      message.error(`生成失敗: ${errorMessage}`)
      console.error('最終錯誤訊息：', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await generatorApi.getHistory({
        page: 1,
        page_size: 20,
      })
      if (response.items) {
        setHistoryData(response.items)
      }
    } catch (error: any) {
      message.error('獲取歷史記錄失敗')
    } finally {
      setHistoryLoading(false)
    }
  }

  const columns: ColumnsType<QAPair> = [
    {
      title: '問題',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
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
          'AI已審查': 'blue',
          已通過: 'green',
          已拒絕: 'red',
        }
        return <Tag color={colorMap[status]}>{status}</Tag>
      },
    },
    {
      title: 'AI評分',
      dataIndex: 'reviewer_score',
      key: 'reviewer_score',
      width: 100,
      render: (score: number | null) => score ?? '-',
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-TW'),
    },
  ]

  return (
    <div>
      <Card title="生成問答對(此AI尚未有Glows流程知識，生成問答以專業知識為主，ex. KVM是什麼)" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          onFinishFailed={(errorInfo) => {
            console.log('表單驗證失敗：', errorInfo)
            message.error('請檢查表單輸入是否正確')
          }}
          initialValues={{
            category: QACategory.GENERAL,
            count: 1,
            style: '專業',
          }}
        >
          <Form.Item
            name="category"
            label="知識領域"
            rules={[{ required: true, message: '請選擇知識領域' }]}
          >
            <Select disabled={loading}>
              {Object.values(QACategory).map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="count"
            label="生成數量"
            rules={[
              { required: true, message: '請輸入生成數量' },
              { type: 'number', min: 1, max: 100 },
            ]}
          >
            <InputNumber 
              min={1} 
              max={100} 
              style={{ width: '100%' }} 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item name="topic" label="主題關鍵詞（可選）">
            <Input 
              placeholder="例如：Python編程、數據庫操作等" 
              disabled={loading}
            />
          </Form.Item>

          <Form.Item name="style" label="生成風格">
            <Select disabled={loading}>
              <Select.Option value="專業">專業</Select.Option>
              <Select.Option value="通俗">通俗</Select.Option>
              <Select.Option value="詳細">詳細</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={loading}
              >
                生成問答對
              </Button>
              <Button onClick={() => form.resetFields()} disabled={loading}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {qaPairs.length > 0 && (
        <Card title="生成結果" style={{ marginBottom: 24 }}>
          {qaPairs.map((qa, index) => (
            <Card
              key={qa.id}
              type="inner"
              title={`問答對 ${index + 1}`}
              style={{ marginBottom: 16 }}
            >
              <p>
                <strong>問題：</strong>
                {qa.question}
              </p>
              <p>
                <strong>答案：</strong>
                {qa.answer}
              </p>
              <Space>
                <Tag>分類：{qa.category}</Tag>
                <Tag>狀態：{qa.status}</Tag>
              </Space>
            </Card>
          ))}
        </Card>
      )}

      <Card
        title="生成歷史"
        extra={
          <Button onClick={loadHistory} loading={historyLoading}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="id"
          loading={historyLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default GeneratePage


import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
} from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { generatorApi, categoryApi } from '../services/api'
import { QAPair, QACategory, QAStatus } from '../types'
import type { ColumnsType } from 'antd/es/table'

const { Search } = Input

const KnowledgeBasePage = () => {
  const [loading, setLoading] = useState(false)
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    loadCategories()
    loadKnowledgeBase()
  }, [])

  const loadCategories = async () => {
    try {
      const cats = await categoryApi.getCategories()
      setCategories(cats)
    } catch (error: any) {
      message.error('獲取分類失敗')
    }
  }

  const loadKnowledgeBase = async () => {
    setLoading(true)
    try {
      const response = await generatorApi.getHistory({
        status: QAStatus.APPROVED,
        category: selectedCategory as QACategory,
        page: 1,
        page_size: 100,
      })
      if (response.items) {
        let filtered = response.items
        if (searchText) {
          filtered = filtered.filter(
            (qa) =>
              qa.question.includes(searchText) ||
              qa.answer.includes(searchText)
          )
        }
        setQaPairs(filtered)
      }
    } catch (error: any) {
      message.error('獲取知識庫失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKnowledgeBase()
  }, [selectedCategory, searchText])

  // 分类映射：中文 → 英文
  const categoryMap: Record<string, string> = {
    '通用知識': 'General',
    '技術規範': 'Technical',
    '技術流程': 'Technical',
    '故障排除': 'Troubleshooting',
    '安全合規': 'Security',
    '資安法規': 'Security',
    '案例分享': 'CaseStudy',
    '應用案例': 'CaseStudy',
  }

  const handleExport = () => {
    if (qaPairs.length === 0) {
      message.warning('沒有可導出的數據')
      return
    }

    try {
      // 轉換為指定格式
      const exportData = qaPairs.map((qa) => ({
        instruction: qa.question,
        output: qa.answer,
        type: categoryMap[qa.category] || qa.category,
      }))

      // 轉換為 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2)

      // 創建 Blob 並下載
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `knowledge_base_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success(`成功導出 ${qaPairs.length} 條問答對`)
    } catch (error: any) {
      console.error('導出失敗:', error)
      message.error('導出失敗：' + (error.message || '未知錯誤'))
    }
  }

  const columns: ColumnsType<QAPair> = [
    {
      title: '問題',
      dataIndex: 'question',
      key: 'question',
      width: 300,
    },
    {
      title: '答案',
      dataIndex: 'answer',
      key: 'answer',
      width: 400,
    },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: QACategory) => <Tag>{category}</Tag>,
    },
    {
      title: '評分',
      key: 'score',
      width: 100,
      render: (_: any, record: QAPair) =>
        record.reviewer_score ?? '-',
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
      <Card
        title="知識庫(已審查)"
        extra={
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="選擇分類"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
            <Search
              placeholder="搜索問題或答案"
              style={{ width: 300 }}
              onSearch={setSearchText}
              allowClear
            />
            <Button onClick={loadKnowledgeBase} loading={loading}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={qaPairs.length === 0}
            >
              匯出 JSON
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={qaPairs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div>
                <p>
                  <strong>問題：</strong>
                  {record.question}
                </p>
                <p>
                  <strong>答案：</strong>
                  {record.answer}
                </p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  )
}

export default KnowledgeBasePage


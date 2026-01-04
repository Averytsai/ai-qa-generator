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


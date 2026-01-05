import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, message } from 'antd'
import { generatorApi, categoryApi } from '../services/api'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    total_qa: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    average_score: 0,
  })
  const [categoryStats, setCategoryStats] = useState<any[]>([])
  const [, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // 獲取所有問答對 - 需要獲取所有數據，所以使用較大的page_size
      // 但後端限制最大100，所以需要多次請求或使用total來獲取所有數據
      const allQAs = await generatorApi.getHistory({ page: 1, page_size: 100 })
      
      console.log('獲取到的問答對數據：', allQAs)
      
      // 檢查數據結構
      // 後端返回格式：{ items: [...], total: 74, page: 1, page_size: 100, total_pages: 1 }
      // 響應攔截器返回response.data，所以allQAs就是上面的結構
      const items = allQAs?.items || []
      const total = allQAs?.total || 0
      
      console.log(`獲取到 ${items.length} 個問答對，總計 ${total} 個`)
      
      if (total > 0 || items.length > 0) {
        // 統計狀態
        const pending = items.filter(
          (qa: any) => qa.status === '待審查' || qa.status === 'AI已審查'
        ).length
        const approved = items.filter(
          (qa: any) => qa.status === '已通過'
        ).length
        const rejected = items.filter(
          (qa: any) => qa.status === '已拒絕'
        ).length
        
        // 計算平均評分（只計算有評分的）
        const scores = items
          .map((qa: any) => qa.reviewer_score)
          .filter((s: any) => s !== null && s !== undefined && !isNaN(s))
        const avgScore =
          scores.length > 0
            ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            : 0

        console.log('統計數據：', { total, pending, approved, rejected, avgScore })

        setStats({
          total_qa: total,
          pending_review: pending,
          approved,
          rejected,
          average_score: Math.round(avgScore * 100) / 100,
        })

        // 按分類統計
        try {
          const categories = await categoryApi.getCategories()
          console.log('獲取到的分類數據：', categories)
          
          if (!Array.isArray(categories) || categories.length === 0) {
            console.warn('分類數據為空或格式錯誤')
            message.warning('獲取分類數據失敗')
            return
          }
          
          // 按分類統計問答對數量
          const categoryData = categories.map((cat: any) => {
            // 匹配分類名稱（cat.name 和 cat.id 都是分類名稱，如"通用知識"）
            const categoryQAs = items.filter(
              (qa: any) => qa.category === cat.name || qa.category === cat.id
            )
            const count = categoryQAs.length
            
            console.log(`分類 ${cat.name}: ${count} 個問答對`)
            
            return {
              id: cat.id || cat.name,
              name: cat.name,
              description: cat.description || '',
              count: count,
            }
          })
          
          console.log('分類統計數據：', categoryData)
          setCategoryStats(categoryData)
        } catch (catError: any) {
          console.error('獲取分類失敗：', catError)
          console.error('錯誤詳情：', catError?.response || catError)
          message.warning('獲取分類統計失敗，但基本統計已加載')
        }
      } else {
        console.warn('未獲取到問答對數據，返回結構：', allQAs)
        message.info('暫無問答對數據，請先生成一些問答對')
      }
    } catch (error: any) {
      console.error('獲取統計數據失敗：', error)
      console.error('錯誤詳情：', error?.response || error)
      const errorMsg = error?.response?.data?.detail || error?.message || '未知錯誤'
      message.error(`獲取統計數據失敗: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Card title="統計概覽" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="總問答數"
              value={stats.total_qa}
              prefix={<FileTextOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待審查"
              value={stats.pending_review}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已通過"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已拒絕"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Statistic
              title="平均評分"
              value={stats.average_score}
              suffix="/ 100"
              precision={2}
            />
          </Col>
        </Row>
      </Card>

      <Card title="分類統計">
        <Row gutter={16}>
          {categoryStats.map((cat: any) => (
            <Col span={8} key={cat.id} style={{ marginBottom: 16 }}>
              <Card>
                <Statistic
                  title={cat.name}
                  value={cat.count}
                  suffix="個問答對"
                />
                <p style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                  {cat.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default AnalyticsPage


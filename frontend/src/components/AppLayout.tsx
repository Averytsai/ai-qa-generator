import { ReactNode } from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

const { Header, Sider } = Layout

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/generate',
      icon: <FileTextOutlined />,
      label: '生成問答',
    },
    {
      key: '/feedback',
      icon: <EditOutlined />,
      label: '人工審查',
    },
    {
      key: '/knowledge',
      icon: <DatabaseOutlined />,
      label: '知識庫',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '統計分析',
    },
    {
      key: '/review',
      icon: <CheckCircleOutlined />,
      label: 'AI審核(測試中)',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#001529',
          color: '#fff',
          padding: '0 24px',
        }}
      >
        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
          AI問答集生成系統
        </h1>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>{children}</Layout>
      </Layout>
    </Layout>
  )
}

export default AppLayout


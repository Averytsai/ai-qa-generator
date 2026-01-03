import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import AppLayout from './components/AppLayout'
import GeneratePage from './pages/GeneratePage'
import ReviewPage from './pages/ReviewPage'
import FeedbackPage from './pages/FeedbackPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import AnalyticsPage from './pages/AnalyticsPage'

const { Content } = Layout

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Content style={{ padding: '24px', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<GeneratePage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Content>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App


import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/dashboard'
import LoginPage from './pages/login'
import MetricsClaims from './pages/metrics/claims'
import MetricsUnderwriting from './pages/metrics/underwriting'
import MetricsAntiFraud from './pages/metrics/anti-fraud'
import BusinessOverview from './pages/business/overview'
import SharedDataAssets from './pages/shared/data-assets'
import SharedKnowledgeRules from './pages/shared/knowledge-rules'
import SharedSkillsMarket from './pages/shared/skills'
import SkillDetail from './pages/shared/skill-detail'
import AgentClaimsLogs from './pages/agent/claims/logs'
import AgentClaimsTaskDetail from './pages/agent/claims/task-detail'
import AgentClaimsDeductionLogDetail from './pages/agent/claims/deduction-log-detail'
import UserManagement from './pages/platform/user'
import { Auth } from './utils/auth'

// 路由守卫：未登录则跳转登录页
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!Auth.isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const PagePlaceholder: React.FC = () => (
  <div style={{ padding: 24, color: '#8c8c8c' }}>页面开发中</div>
)

const App: React.FC = () => {
  return (
    <Routes>
      {/* 登录页 - 无需认证 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 主布局 - 需要认证 */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/business/overview" replace />} />

        {/* 业务应用 */}
        <Route path="business/overview" element={<BusinessOverview />} />
        <Route path="business/claims/metrics" element={<MetricsClaims />} />
        <Route path="business/underwriting/metrics" element={<MetricsUnderwriting />} />
        <Route path="business/anti-fraud/metrics" element={<MetricsAntiFraud />} />

        {/* Agent运营 */}
        <Route path="agent/claims/overview" element={<PagePlaceholder />} />
        <Route path="agent/claims/logs" element={<AgentClaimsLogs />} />
        <Route path="agent/claims/task-detail" element={<AgentClaimsTaskDetail />} />
        <Route path="agent/claims/deduction-log-detail" element={<AgentClaimsDeductionLogDetail />} />
        <Route path="agent/claims/case-analysis" element={<PagePlaceholder />} />
        <Route path="agent/underwriting/overview" element={<PagePlaceholder />} />
        <Route path="agent/underwriting/logs" element={<PagePlaceholder />} />
        <Route path="agent/underwriting/case-analysis" element={<PagePlaceholder />} />
        <Route path="agent/anti-fraud/overview" element={<PagePlaceholder />} />
        <Route path="agent/anti-fraud/logs" element={<PagePlaceholder />} />
        <Route path="agent/anti-fraud/case-analysis" element={<PagePlaceholder />} />

        {/* 技能中心 */}
        <Route path="skills/market" element={<SharedSkillsMarket />} />
        <Route path="skills/mcp" element={<PagePlaceholder />} />
        <Route path="skills/skill/:name/:version?" element={<SkillDetail />} />

        {/* 数据共享 */}
        <Route path="data-share/data-assets" element={<SharedDataAssets />} />
        <Route path="data-share/knowledge-rules" element={<SharedKnowledgeRules />} />

        {/* 平台管理 */}
        <Route path="platform/user" element={<UserManagement />} />
        <Route path="platform/alert" element={<PagePlaceholder />} />

        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* 未匹配路由 - 根据登录态跳转 */}
      <Route path="*" element={
        <Navigate to={Auth.isLoggedIn() ? '/' : '/login'} replace />
      } />
    </Routes>
  )
}

export default App

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/dashboard'
import MetricsClaims from './pages/metrics/claims'
import MetricsUnderwriting from './pages/metrics/underwriting'
import MetricsAntiFraud from './pages/metrics/anti-fraud'
import BusinessOverview from './pages/business/overview'
import AgentClaims from './pages/agent/claims'
import AgentUnderwriting from './pages/agent/underwriting'
import AgentAntiFraud from './pages/agent/anti-fraud'
import SharedDataAssets from './pages/shared/data-assets'
import SharedKnowledgeRules from './pages/shared/knowledge-rules'
import SharedSkillsMarket from './pages/shared/skills'
import SkillDetail from './pages/shared/skill-detail'

const PagePlaceholder: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ padding: 24, color: '#8c8c8c' }}>{name} — 开发中</div>
)

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/business/overview" replace />} />

        {/* 业务应用 */}
        <Route path="business/overview" element={<BusinessOverview />} />
        <Route path="business/claims/metrics" element={<MetricsClaims />} />
        <Route path="business/underwriting/metrics" element={<MetricsUnderwriting />} />
        <Route path="business/anti-fraud/metrics" element={<MetricsAntiFraud />} />

        {/* Agent运营 */}
        <Route path="agent/claims" element={<AgentClaims />} />
        <Route path="agent/underwriting" element={<AgentUnderwriting />} />
        <Route path="agent/anti-fraud" element={<AgentAntiFraud />} />

        {/* 共享中心 */}
        <Route path="shared/skills" element={<SharedSkillsMarket />} />
        <Route path="shared/skill/:name" element={<SkillDetail />} />
        <Route path="shared/mcp" element={<PagePlaceholder name="MCP服务" />} />
        <Route path="shared/data-assets" element={<SharedDataAssets />} />
        <Route path="shared/knowledge-rules" element={<SharedKnowledgeRules />} />

        {/* 平台管理 */}
        <Route path="platform/alert" element={<PagePlaceholder name="异常告警" />} />
        <Route path="platform/permission" element={<PagePlaceholder name="权限控制" />} />
        <Route path="platform/user" element={<PagePlaceholder name="用户管理" />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App

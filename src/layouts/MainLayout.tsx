import React from 'react'
import { Layout, Menu, Avatar, Divider, Typography, message } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined,
  BranchesOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Auth } from '../utils/auth'

// 数据共享图标：圆柱分层堆叠（3层圆盘 + 深色顶盖，层高3px，层间距1px）
const DatabaseIcon = () => (
  <span className="anticon" style={{ display: 'inline-flex', alignItems: 'center' }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      {/* 顶层椭圆 */}
      <ellipse cx="12" cy="5" rx="8" ry="3" opacity="0.85" />
      {/* 第1层（高3px） */}
      <path d="M4 8c0 1.66 3.58 3 8 3s8-1.34 8-3V11c0 1.66-3.58 3-8 3s-8-1.34-8-3z" opacity="0.45" />
      {/* 第2层（高3px） */}
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3V15c0 1.66-3.58 3-8 3s-8-1.34-8-3z" opacity="0.35" />
      {/* 第3层（高3px） */}
      <path d="M4 16c0 1.66 3.58 3 8 3s8-1.34 8-3V19c0 1.66-3.58 3-8 3s-8-1.34-8-3z" opacity="0.25" />
    </svg>
  </span>
)

// Agent运营图标：节点分流（父节点分支为菱形+矩形两个子节点）
const AgentOpsIcon = () => (
  <span className="anticon" style={{ display: 'inline-flex', alignItems: 'center' }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* 父节点（左侧横线） */}
      <path d="M4 12h4" />
      {/* 上分支：折线 + 菱形 */}
      <path d="M8 12v-6h6" />
      <path d="M14 6l4-4 4 4-4 4-4-4z" />
      {/* 下分支：折线 + 矩形 */}
      <path d="M8 12v5h3" />
      <path d="M14 14h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
    </svg>
  </span>
)

const { Sider, Content } = Layout
const { Text } = Typography

const menuItems: MenuProps['items'] = [
  // 业务应用：2级
  {
    key: 'business-app',
    icon: <AppstoreOutlined />,
    label: '业务应用',
    children: [
      { key: '/business/overview', label: '全景概览' },
      { key: '/business/claims/metrics', label: '理赔场景' },
      { key: '/business/underwriting/metrics', label: '核保场景' },
      { key: '/business/anti-fraud/metrics', label: '反欺诈场景' },
    ],
  },
  // Agent运营：3级嵌套
  {
    key: 'agent-ops',
    icon: <AgentOpsIcon />,
    label: 'Agent运营',
    children: [
      {
        key: 'agent-claims',
        label: '理赔',
        children: [
          { key: '/agent/claims/logs', label: '日志清单' },
          { key: '/agent/claims/case-analysis', label: '错例分析' },
        ],
      },
      {
        key: 'agent-underwriting',
        label: '核保',
        children: [
          { key: '/agent/underwriting/logs', label: '日志清单' },
          { key: '/agent/underwriting/case-analysis', label: '错例分析' },
        ],
      },
      {
        key: 'agent-anti-fraud',
        label: '反欺诈',
        children: [
          { key: '/agent/anti-fraud/logs', label: '日志清单' },
          { key: '/agent/anti-fraud/case-analysis', label: '错例分析' },
        ],
      },
    ],
  },
  // 技能中心：2级
  {
    key: 'skill-center',
    icon: <BranchesOutlined />,
    label: '技能中心',
    children: [
      { key: '/skills/market', label: 'Skills集市' },
      { key: '/skills/mcp', label: 'MCP服务' },
    ],
  },
  // 数据共享：2级
  {
    key: 'data-share',
    icon: <DatabaseIcon />,
    label: '数据共享',
    children: [
      { key: '/data-share/data-assets', label: '数据资产' },
      { key: '/data-share/knowledge-rules', label: '知识&规则' },
    ],
  },
  // 平台管理：2级
  {
    key: 'platform-mgmt',
    icon: <SettingOutlined />,
    label: '平台管理',
    children: [
      { key: '/platform/user', label: '用户管理' },
      { key: '/platform/alert', label: '异常告警' },
    ],
  },
]

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // 读取登录账号
  const currentAccount = Auth.getAccount() || '管理员'

  const handleLogout = () => {
    Auth.logout()
    message.success('已退出登录')
    navigate('/login', { replace: true })
  }

  // 当 URL 为 Skill 详情页时，侧边栏仍高亮 Skills集市
  const selectedKey = location.pathname.startsWith('/skills/skill/')
    ? '/skills/market'
    : location.pathname

  // 根据当前路由决定展开的菜单
  let defaultOpenKeys = ['business-app']
  if (location.pathname.startsWith('/business/')) defaultOpenKeys = ['business-app']
  else if (location.pathname.startsWith('/agent/claims/')) defaultOpenKeys = ['agent-ops', 'agent-claims']
  else if (location.pathname.startsWith('/agent/underwriting/')) defaultOpenKeys = ['agent-ops', 'agent-underwriting']
  else if (location.pathname.startsWith('/agent/anti-fraud/')) defaultOpenKeys = ['agent-ops', 'agent-anti-fraud']
  else if (location.pathname.startsWith('/agent/')) defaultOpenKeys = ['agent-ops']
  else if (location.pathname.startsWith('/skills/')) defaultOpenKeys = ['skill-center']
  else if (location.pathname.startsWith('/data-share/')) defaultOpenKeys = ['data-share']

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider theme="light" width={200} style={{
        background: '#fff',
        borderRight: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #e8e8e8',
        }}>
          <h1 style={{ color: '#1d2129', fontSize: 15, margin: 0, whiteSpace: 'nowrap', fontWeight: 700 }}>
            两核智能运营平台
          </h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          inlineIndent={0}
          selectedKeys={[selectedKey]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderRight: 'none',
            flex: 1,
          }}
        />
        <Divider style={{ margin: 0 }} />
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} />
          <Text style={{ fontSize: 13, color: '#1d2129', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentAccount}
          </Text>
          <div
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 4,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </div>
      </Sider>
      <Layout style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Content style={{ margin: 4, padding: 20, background: 'transparent', overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout

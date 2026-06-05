# 全景概览页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现全景概览（智能服务）前端页面，包括智能体卡片、趋势图表、数据资产和知识规则tab切换

**Architecture:** Dashboard 主组件组装三个子模块（智能服务、数据资产、知识&规则），侧边栏改造为可折叠二级菜单。所有数据使用 mock，ECharts 渲染图表，Ant Design 构建 UI 组件

**Tech Stack:** React 18 + TypeScript + Ant Design 5 + ECharts + React Router 6

---

### Task 1: Mock 数据

**Files:**
- Create: `src/pages/dashboard/data/mock-data.ts`
- Test: 在浏览器中 `console.log` 验证数据结构

- [ ] **Step 1: 编写 mock-data.ts**

```typescript
// src/pages/dashboard/data/mock-data.ts

export interface SmartAgent {
  name: string
  description: string
  metrics: { label: string; value: string }[]
}

export const smartAgents: SmartAgent[] = [
  {
    name: '预受理智能体',
    description: '智能整理理赔影像，自动归类不符案件，辅助审核录入',
    metrics: [
      { label: '案件代查率', value: '86.4%' },
      { label: '问题件自动率', value: '79.4%' },
    ],
  },
  {
    name: '数采智能体',
    description: '结构化医疗单据，复用AI能力，融合案件影像与数据',
    metrics: [
      { label: 'OCR识别准确率', value: '98.2%' },
      { label: '病历结构化准确率', value: '95.7%' },
    ],
  },
  {
    name: '立案智能体',
    description: '覆盖多险种医疗场景，自动完成理赔责任认定',
    metrics: [
      { label: '立案准确率', value: '97.1%' },
      { label: '责任认定率', value: '94.8%' },
    ],
  },
  {
    name: '扣费理智能体',
    description: '智能完成医保扣费与商保结算，复用风控规则能力',
    metrics: [
      { label: '控费准确率', value: '96.5%' },
      { label: '医保结算准确率', value: '98.3%' },
    ],
  },
  {
    name: '理算智能体',
    description: '处理多责任理算，校验超保额风险，拦截异常理算场景',
    metrics: [
      { label: '理赔准确率', value: '97.6%' },
      { label: '超额打款率', value: '0.2%' },
    ],
  },
  {
    name: '审核智能体',
    description: '整理案件信息与知识，评估风险，支持简易案件自动结案',
    metrics: [
      { label: '风险识别准确率', value: '95.3%' },
      { label: '高风险件自动拦截率', value: '92.1%' },
    ],
  },
]

// 自动化率趋势图数据（近14天）
export const automationRateData = {
  dates: Array.from({ length: 14 }, (_, i) => `2026-05-${String(i + 9).padStart(2, '0')}`),
  series: [
    { name: '预受理智能体', data: [85, 82, 78, 75, 70, 68, 65, 72, 78, 82, 85, 86, 86.4, 87] },
    { name: '数采智能体', data: [92, 90, 88, 85, 82, 80, 78, 82, 88, 92, 95, 96, 98, 98.2] },
    { name: '立案智能体', data: [90, 88, 86, 84, 82, 80, 78, 82, 86, 90, 94, 95, 97, 97.1] },
    { name: '扣费理智能体', data: [94, 93, 92, 90, 88, 86, 85, 88, 91, 94, 95, 96, 96.5, 97] },
    { name: '理算智能体', data: [96, 95, 94, 92, 90, 88, 86, 89, 92, 94, 96, 97, 97.6, 98] },
    { name: '审核智能体', data: [93, 92, 90, 88, 85, 82, 80, 84, 88, 91, 93, 94, 95.3, 96] },
  ],
}

// 案件处理情况趋势图数据
export const caseProcessingData = {
  dates: Array.from({ length: 14 }, (_, i) => `2026-05-${String(i + 9).padStart(2, '0')}`),
  summary: {
    totalCases: '13,604',
    dailyAverage: '1,125',
    pendingCases: '262',
    avgProcessingTime: '221 分钟',
    automationRate: '5.3%',
    manualInterventionRate: '0.5%',
  },
  series: [
    { name: '预受理智能体', data: [1200, 1150, 1100, 1050, 1000, 950, 900, 1050, 1150, 1200, 1250, 1280, 1300, 1320] },
    { name: '数采智能体', data: [2000, 1900, 1800, 1700, 1600, 1500, 1400, 1550, 1700, 1850, 1950, 2000, 2050, 2100] },
    { name: '立案智能体', data: [800, 750, 700, 680, 650, 620, 600, 680, 750, 800, 850, 880, 900, 920] },
    { name: '扣费理智能体', data: [1500, 1450, 1400, 1350, 1300, 1250, 1200, 1350, 1450, 1500, 1550, 1580, 1600, 1620] },
    { name: '理算智能体', data: [1000, 950, 900, 850, 800, 750, 720, 820, 900, 950, 1000, 1030, 1050, 1070] },
    { name: '审核智能体', data: [1800, 1700, 1600, 1500, 1400, 1300, 1250, 1400, 1550, 1700, 1800, 1850, 1900, 1950] },
  ],
}

// 数据资产 - 非结构化数据
export interface DataCategory {
  name: string
  total: string
  items: { name: string; count: number; daily: string; weekly: string; monthly: string }[]
}

export const unstructuredData = {
  summary: {
    total: '42,500 份影像/文件',
    activity: '高',
    cumulativeUsage: '158,200 次',
  },
  categories: [
    {
      name: '影像数据',
      total: '21,594 份影像/文件',
      items: [
        { name: '医疗发票照片', count: 10518, daily: '+12/日', weekly: '+85/周', monthly: '+320/月' },
        { name: '处方单复印件', count: 6510, daily: '+8/日', weekly: '+50/周', monthly: '+210/月' },
        { name: '病案首页截图', count: 4566, daily: '+5/日', weekly: '+32/周', monthly: '+150/月' },
      ],
    },
    {
      name: '体检报告',
      total: '10,825 份影像/文件',
      items: [
        { name: '入职体检报告', count: 6119, daily: '+9/日', weekly: '+62/周', monthly: '+280/月' },
        { name: '常规年度体检', count: 4378, daily: '+6/日', weekly: '+41/周', monthly: '+180/月' },
        { name: '专项筛查报告', count: 328, daily: '+1/日', weekly: '+3/周', monthly: '+15/月' },
      ],
    },
    {
      name: '其他非结构化',
      total: '10,081 份影像/文件',
      items: [
        { name: '客服沟通录音', count: 8500, daily: '+15/日', weekly: '+90/周', monthly: '+400/月' },
        { name: '查勘现场视频', count: 1581, daily: '+2/日', weekly: '+12/周', monthly: '+50/月' },
      ],
    },
  ] as DataCategory[],
}

// 数据资产 - 结构化数据
export const structuredData = {
  summary: {
    total: '45,000 条记录',
    activity: '高',
    cumulativeUsage: '342,000 次',
  },
  categories: [
    {
      name: '保单信息',
      total: '25,000 条记录',
      items: [
        { name: '寿险保单台账', count: 14000, daily: '+50/日', weekly: '+350/周', monthly: '+1500/月' },
        { name: '健康险保单库', count: 8000, daily: '+40/日', weekly: '+280/周', monthly: '+1200/月' },
        { name: '团险人员清单', count: 3000, daily: '+10/日', weekly: '+70/周', monthly: '+300/月' },
      ],
    },
    {
      name: '案件信息',
      total: '12,500 条记录',
      items: [
        { name: '立案基础信息', count: 6000, daily: '+25/日', weekly: '+160/周', monthly: '+700/月' },
        { name: '结案审批记录', count: 5500, daily: '+22/日', weekly: '+150/周', monthly: '+650/月' },
        { name: '案件轨迹日志', count: 1000, daily: '+80/日', weekly: '+500/周', monthly: '+2000/月' },
      ],
    },
    {
      name: '费用明细',
      total: '7,500 条记录',
      items: [
        { name: '门诊费用清单', count: 4000, daily: '+35/日', weekly: '+220/周', monthly: '+950/月' },
        { name: '住院费用清单', count: 3000, daily: '+18/日', weekly: '+110/周', monthly: '+480/月' },
        { name: '社保统筹结算', count: 500, daily: '+5/日', weekly: '+30/周', monthly: '+120/月' },
      ],
    },
  ] as DataCategory[],
}

// 核心来源分布 treemap 数据
export const coreSourceData = [
  { name: '医保直连接口(46%)', value: 46 },
  { name: '客户APP上传', value: 28 },
  { name: '第三方体检机构', value: 14 },
  { name: '柜面人工录入', value: 8 },
  { name: '外部渠道数据源', value: 4 },
]

// 知识&规则 - 知识库分类
export interface KnowledgeItem {
  name: string
  count: number
  daily: string
  weekly: string
  monthly: string
}

export interface KnowledgeGroup {
  name: string
  total: string
  items: KnowledgeItem[]
}

export const underwritingKnowledge = {
  header: { name: '核保知识库', total: '12,850 篇文档', activity: '中', cumulativeUsage: '56,200 次' },
  groups: [
    {
      name: '产品与责任',
      total: '6,428 篇文档',
      items: [
        { name: '重疾保险责任定义', count: 3200, daily: '+5/日', weekly: '+25/周', monthly: '+110/月' },
        { name: '医疗险免责条款', count: 2200, daily: '+2/日', weekly: '+15/周', monthly: '+60/月' },
        { name: '意外险保障范围', count: 1028, daily: '+1/日', weekly: '+8/周', monthly: '+30/月' },
      ],
    },
    {
      name: '核保规则参数',
      total: '3,423 篇文档',
      items: [
        { name: '疾病核保指南', count: 1700, daily: '+12/日', weekly: '+60/周', monthly: '+250/月' },
        { name: '财务核保标准', count: 1000, daily: '+3/日', weekly: '+18/周', monthly: '+80/月' },
        { name: '职业分类表', count: 723, daily: '+0/日', weekly: '+2/周', monthly: '+5/月' },
      ],
    },
    {
      name: '费率与险种规则',
      total: '3,000 篇文档',
      items: [
        { name: '基础费率表', count: 2000, daily: '+0/日', weekly: '+5/周', monthly: '+20/月' },
        { name: '加费计算逻辑', count: 1000, daily: '+1/日', weekly: '+10/周', monthly: '+45/月' },
      ],
    },
  ] as KnowledgeGroup[],
}

export const claimsKnowledge = {
  header: { name: '理赔知识库', total: '20,560 篇文档', activity: '高', cumulativeUsage: '198,000 次' },
  groups: [
    {
      name: '定责规则',
      total: '9,781 篇文档',
      items: [
        { name: '疾病释义匹配库', count: 5000, daily: '+20/日', weekly: '+150/周', monthly: '+600/月' },
        { name: '事故原因判定树', count: 3000, daily: '+15/日', weekly: '+80/周', monthly: '+300/月' },
        { name: '免赔额触发条件', count: 1781, daily: '+5/日', weekly: '+20/周', monthly: '+120/月' },
      ],
    },
    {
      name: '理算与扣费',
      total: '7,276 篇文档',
      items: [
        { name: '自费药剔除名录', count: 4800, daily: '+50/日', weekly: '+300/周', monthly: '+1200/月' },
        { name: '合理用药规则库', count: 1500, daily: '+18/日', weekly: '+120/周', monthly: '+480/月' },
        { name: '比例赔付计算式', count: 976, daily: '+2/日', weekly: '+15/周', monthly: '+50/月' },
      ],
    },
    {
      name: '审核与反欺诈',
      total: '3,503 篇文档',
      items: [
        { name: '疑似欺诈特征库', count: 1800, daily: '+25/日', weekly: '+180/周', monthly: '+700/月' },
        { name: '高危医院黑名单', count: 1000, daily: '+8/日', weekly: '+45/周', monthly: '+180/月' },
        { name: '异常就诊行为集', count: 703, daily: '+10/日', weekly: '+60/周', monthly: '+250/月' },
      ],
    },
  ] as KnowledgeGroup[],
}

// 覆盖场景分布 treemap 数据
export const coverageSceneData = [
  { name: '智选门诊非理赔', value: 35 },
  { name: '住院医疗保障', value: 28 },
  { name: '重疾大病保障', value: 18 },
  { name: '意外伤害责任/伤残', value: 12 },
  { name: '津贴赔付', value: 7 },
]

// 高频调用知识 & 规则 Top 10
export const topKnowledgeData = [
  { name: '甲状腺结节核保指南 v2.1', count: 45430 },
  { name: '2024版国家医保目录剔除规则', count: 38210 },
  { name: '急性阑尾炎标准住院天数限制', count: 35600 },
  { name: '高血压II期并发症判定逻辑', count: 26320 },
  { name: '门诊统筹起付线扣减规则', count: 15100 },
  { name: '骨折内固定器材合理费用标准', count: 14900 },
  { name: '重症确诊报告必须专项检查', count: 8200 },
  { name: '意外身故置方案件性质要求', count: 6500 },
  { name: '乳腺癌特定靶向药赔付目录', count: 5100 },
  { name: '异地就医结算比例换算公式', count: 4400 },
]

// 侧边栏菜单配置
export const sidebarMenuItems = [
  {
    key: 'panorama',
    label: '全景概览',
    icon: 'DashboardOutlined',
    children: [
      { key: '/', label: '智能服务' },
      { key: '/panorama/data', label: '数据资产' },
      { key: '/panorama/knowledge', label: '知识&规则' },
      { key: '/panorama/model', label: '模型能力' },
    ],
  },
  {
    key: 'agent-ops',
    label: 'Agent运营',
    icon: 'RobotOutlined',
    children: [
      { key: '/agent/workflow', label: '流程监控' },
      { key: '/agent/log', label: '操作日志' },
      { key: '/agent/badcase', label: 'badcase分析' },
      { key: '/agent/label', label: '标注&更新' },
    ],
  },
  {
    key: 'model-mgmt',
    label: '模型管理',
    icon: 'BlockOutlined',
    children: [
      { key: '/model/train', label: '训练调优' },
      { key: '/model/eval', label: '评估验证' },
      { key: '/model/deploy', label: '部署发布' },
      { key: '/model/version', label: '版本管理' },
    ],
  },
  {
    key: 'platform-mgmt',
    label: '平台管理',
    icon: 'SettingOutlined',
    children: [
      { key: '/platform/alert', label: '异常告警' },
      { key: '/platform/permission', label: '权限控制' },
      { key: '/platform/user', label: '用户管理' },
      { key: '/platform/config', label: '系统配置' },
    ],
  },
]
```

- [ ] **Step 2: 验证 mock 数据可导入**

在浏览器控制台验证:
```
访问 http://localhost:3000/，打开 DevTools Console
无报错即通过
```

---

### Task 2: 侧边栏改造

**Files:**
- Modify: `src/layouts/MainLayout.tsx`

- [ ] **Step 1: 替换侧边栏为二级可折叠菜单**

```typescript
// src/layouts/MainLayout.tsx（完整替换）
import React from 'react'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  RobotOutlined,
  FlowChartOutlined,
  BlockOutlined,
  DatabaseOutlined,
  BookOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { sidebarMenuItems } from '../pages/dashboard/data/mock-data'

const { Header, Sider, Content } = Layout

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  RobotOutlined: <RobotOutlined />,
  FlowChartOutlined: <FlowChartOutlined />,
  BlockOutlined: <BlockOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  BookOutlined: <BookOutlined />,
  SettingOutlined: <SettingOutlined />,
}

// 构建 Ant Design Menu items
const menuItems: MenuProps['items'] = sidebarMenuItems.map((group) => ({
  key: group.key,
  icon: iconMap[group.icon],
  label: group.label,
  type: 'group' as const,
  children: group.children.map((child) => ({
    key: child.key,
    label: child.label,
  })),
}))

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h1 style={{ color: '#fff', fontSize: 16, margin: 0, whiteSpace: 'nowrap' }}>
            两核智能体运营平台
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['panorama']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, color: '#666' }}>保险理赔 · 智能核保</span>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
```

- [ ] **Step 2: 验证侧边栏渲染**

访问 http://localhost:3000/ 确认：
- 「全景概览」组默认展开
- 「智能服务」高亮选中
- 其他三个组可折叠/展开

---

### Task 3: 智能服务模块 - 智能体卡片

**Files:**
- Create: `src/pages/dashboard/components/smart-services/index.tsx`
- Create: `src/pages/dashboard/components/smart-services/smart-agent-card.tsx`
- Create: `src/pages/dashboard/components/smart-services/style.css`

- [ ] **Step 1: 编写 smart-agent-card.tsx**

```typescript
// src/pages/dashboard/components/smart-services/smart-agent-card.tsx
import React from 'react'
import { Card, Typography } from 'antd'
import type { SmartAgent } from '../../data/mock-data'

const { Text } = Typography

interface Props {
  agent: SmartAgent
}

const SmartAgentCard: React.FC<Props> = ({ agent }) => {
  return (
    <Card size="small" style={{ height: '100%' }}>
      <Text strong style={{ fontSize: 14 }}>{agent.name}</Text>
      <div style={{
        height: 36,
        margin: '8px 0',
        fontSize: 12,
        color: '#999',
        lineHeight: '18px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {agent.description}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        {agent.metrics.map((m, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: i === 0 ? '#1677ff' : '#52c41a',
            }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SmartAgentCard
```

- [ ] **Step 2: 编写 smart-services/index.tsx**

```typescript
// src/pages/dashboard/components/smart-services/index.tsx
import React from 'react'
import { Row, Col, Typography } from 'antd'
import { smartAgents } from '../../data/mock-data'
import SmartAgentCard from './smart-agent-card'

const { Title } = Typography

const SmartServices: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>智能服务</Title>
      <Row gutter={[12, 12]}>
        {smartAgents.map((agent, i) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={4} key={i}>
            <SmartAgentCard agent={agent} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default SmartServices
```

- [ ] **Step 3: 验证智能体卡片渲染**

访问 http://localhost:3000/ 确认：
- 6 个智能体卡片水平排列
- 每个卡片显示名称、描述、两个指标
- 指标数字有颜色区分

---

### Task 4: 智能服务模块 - 趋势图表

**Files:**
- Create: `src/pages/dashboard/components/smart-services/automation-rate-chart.tsx`
- Create: `src/pages/dashboard/components/smart-services/case-processing-chart.tsx`
- Modify: `src/pages/dashboard/components/smart-services/index.tsx`

- [ ] **Step 1: 编写自动化率趋势图组件**

```typescript
// src/pages/dashboard/components/smart-services/automation-rate-chart.tsx
import React, { useRef, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { automationRateData } from '../../data/mock-data'

const colors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2']

const AutomationRateChart: React.FC = () => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: automationRateData.series.map((s) => s.name),
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: { top: 20, right: 20, bottom: 60, left: 50 },
    xAxis: {
      type: 'category',
      data: automationRateData.dates,
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLabel: { formatter: '{value}%', fontSize: 10 },
    },
    series: automationRateData.series.map((s, i) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: colors[i % colors.length] },
    })),
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#1677ff',
        borderLeft: '3px solid #1677ff',
        paddingLeft: 8,
        marginBottom: 12,
      }}>
        智能体自动化率变化趋势图
      </div>
      <ReactECharts option={option} style={{ height: 260 }} />
    </div>
  )
}

export default AutomationRateChart
```

- [ ] **Step 2: 编写案件处理情况趋势图组件**

```typescript
// src/pages/dashboard/components/smart-services/case-processing-chart.tsx
import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { Card, Statistic, Row, Col } from 'antd'
import { caseProcessingData } from '../../data/mock-data'

const colors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2']

const CaseProcessingChart: React.FC = () => {
  const summaryStats = [
    { label: '案件总量', value: caseProcessingData.summary.totalCases },
    { label: '日均案件', value: caseProcessingData.summary.dailyAverage },
    { label: '待处理', value: caseProcessingData.summary.pendingCases },
    { label: '平均处理时长', value: caseProcessingData.summary.avgProcessingTime },
    { label: '自动化率', value: caseProcessingData.summary.automationRate },
    { label: '人工干预率', value: caseProcessingData.summary.manualInterventionRate },
  ]

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: caseProcessingData.series.map((s) => s.name),
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: { top: 20, right: 20, bottom: 60, left: 55 },
    xAxis: {
      type: 'category',
      data: caseProcessingData.dates,
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10 },
    },
    series: caseProcessingData.series.map((s, i) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: colors[i % colors.length] },
    })),
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#1677ff',
        borderLeft: '3px solid #1677ff',
        paddingLeft: 8,
        marginBottom: 12,
      }}>
        智能体案件处理情况趋势图
      </div>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {summaryStats.map((stat, i) => (
          <Col span={4} key={i}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: '#999' }}>{stat.label}</span>}
                value={stat.value}
                valueStyle={{ fontSize: 18 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <ReactECharts option={option} style={{ height: 260 }} />
    </div>
  )
}

export default CaseProcessingChart
```

- [ ] **Step 3: 更新 smart-services/index.tsx 加入图表**

```typescript
// src/pages/dashboard/components/smart-services/index.tsx（完整替换）
import React from 'react'
import { Row, Col, Typography } from 'antd'
import { smartAgents } from '../../data/mock-data'
import SmartAgentCard from './smart-agent-card'
import AutomationRateChart from './automation-rate-chart'
import CaseProcessingChart from './case-processing-chart'

const { Title } = Typography

const SmartServices: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>智能服务</Title>
      <Row gutter={[12, 12]}>
        {smartAgents.map((agent, i) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={4} key={i}>
            <SmartAgentCard agent={agent} />
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <AutomationRateChart />
        </Col>
        <Col span={12}>
          <CaseProcessingChart />
        </Col>
      </Row>
    </div>
  )
}

export default SmartServices
```

- [ ] **Step 4: 验证趋势图表渲染**

访问 http://localhost:3000/ 确认：
- 两个折线图并排显示
- 图表下方有统计卡片
- hover tooltip 正常工作

---

### Task 5: 数据资产模块 - 分类与规模

**Files:**
- Create: `src/pages/dashboard/components/data-assets/index.tsx`
- Create: `src/pages/dashboard/components/data-assets/classification-overview.tsx`

- [ ] **Step 1: 编写分类与规模组件**

```typescript
// src/pages/dashboard/components/data-assets/classification-overview.tsx
import React from 'react'
import { Card, Row, Col, Typography, Divider } from 'antd'
import type { DataCategory } from '../../data/mock-data'

const { Text, Title } = Typography

interface SectionProps {
  title: string
  badgeColor: string
  summary: { total: string; activity: string; cumulativeUsage: string }
  categories: DataCategory[]
}

const DataSection: React.FC<SectionProps> = ({ title, badgeColor, summary, categories }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          background: badgeColor,
          color: '#fff',
          borderRadius: 20,
          padding: '2px 14px',
          fontSize: 13,
          fontWeight: 600,
          marginRight: 16,
        }}>
          {title}
        </div>
        <Text style={{ fontSize: 13, color: '#666' }}>{summary.total}</Text>
        <Divider type="vertical" style={{ height: 16, margin: '0 12px' }} />
        <Text style={{ fontSize: 12, color: '#999' }}>
          数据活跃度：<Text style={{
            color: summary.activity === '高' ? '#52c41a' : '#faad14',
            fontWeight: 600,
          }}>{summary.activity}</Text>
        </Text>
        <Divider type="vertical" style={{ height: 16, margin: '0 12px' }} />
        <Text style={{ fontSize: 12, color: '#999' }}>
          数据累计使用量：<Text style={{ color: '#1677ff', fontWeight: 600 }}>{summary.cumulativeUsage}</Text>
        </Text>
      </div>
      <Row gutter={[12, 12]}>
        {categories.map((cat, i) => (
          <Col span={8} key={i}>
            <Card
              size="small"
              title={<span style={{ fontSize: 13 }}>{cat.name} <Text type="secondary" style={{ fontSize: 12 }}>{cat.total}</Text></span>}
              style={{ marginBottom: 0 }}
            >
              {cat.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: j < cat.items.length - 1 ? '1px dashed #f0f0f0' : 'none',
                }}>
                  <Text style={{ fontSize: 12 }}>{item.name}</Text>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.count.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#52c41a' }}>
                      {item.daily} / {item.weekly} / {item.monthly}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const ClassificationOverview: React.FC = () => {
  return <DataSection
    title="非结构化数据"
    badgeColor="#1677ff"
    summary={summary}
    categories={categories}
  />
}

export default ClassificationOverview
```

让我修正，这个组件需要接收 props。重新写完整版本：

```typescript
// src/pages/dashboard/components/data-assets/classification-overview.tsx（完整版本）
import React from 'react'
import { Card, Row, Col, Typography, Divider } from 'antd'
import { unstructuredData, structuredData } from '../../data/mock-data'
import type { DataCategory } from '../../data/mock-data'

const { Text } = Typography

interface DataSectionProps {
  title: string
  badgeColor: string
  summary: { total: string; activity: string; cumulativeUsage: string }
  categories: DataCategory[]
}

const DataSection: React.FC<DataSectionProps> = ({ title, badgeColor, summary, categories }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{
          background: badgeColor,
          color: '#fff',
          borderRadius: 20,
          padding: '2px 14px',
          fontSize: 13,
          fontWeight: 600,
        }}>
          {title}
        </div>
        <Text style={{ fontSize: 13, color: '#666' }}>{summary.total}</Text>
        <Divider type="vertical" style={{ height: 16, margin: '0 8px' }} />
        <Text style={{ fontSize: 12, color: '#999' }}>
          数据活跃度：<Text style={{
            color: summary.activity === '高' ? '#52c41a' : '#faad14',
            fontWeight: 600,
          }}>{summary.activity}</Text>
        </Text>
        <Divider type="vertical" style={{ height: 16, margin: '0 8px' }} />
        <Text style={{ fontSize: 12, color: '#999' }}>
          数据累计使用量：<Text style={{ color: '#1677ff', fontWeight: 600 }}>{summary.cumulativeUsage}</Text>
        </Text>
      </div>
      <Row gutter={[12, 12]}>
        {categories.map((cat, i) => (
          <Col span={8} key={i}>
            <Card
              size="small"
              title={
                <span style={{ fontSize: 13 }}>
                  {cat.name}{' '}
                  <Text type="secondary" style={{ fontSize: 12 }}>{cat.total}</Text>
                </span>
              }
              style={{ marginBottom: 0 }}
            >
              {cat.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: j < cat.items.length - 1 ? '1px dashed #f0f0f0' : 'none',
                }}>
                  <Text style={{ fontSize: 12 }}>{item.name}</Text>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.count.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#52c41a' }}>
                      {item.daily} / {item.weekly} / {item.monthly}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const ClassificationOverview: React.FC = () => {
  return (
    <div>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#1677ff',
        borderLeft: '3px solid #1677ff',
        paddingLeft: 10,
        marginBottom: 16,
      }}>
        分类与规模
      </div>
      <DataSection
        title="非结构化数据"
        badgeColor="#1677ff"
        summary={unstructuredData.summary}
        categories={unstructuredData.categories}
      />
      <DataSection
        title="结构化数据"
        badgeColor="#722ed1"
        summary={structuredData.summary}
        categories={structuredData.categories}
      />
    </div>
  )
}

export default ClassificationOverview
```

- [ ] **Step 2: 编写 data-assets/index.tsx**

```typescript
// src/pages/dashboard/components/data-assets/index.tsx
import React from 'react'
import ClassificationOverview from './classification-overview'
import CoreSourceTreemap from './core-source-treemap'

const DataAssets: React.FC = () => {
  return (
    <div>
      <ClassificationOverview />
      <CoreSourceTreemap />
    </div>
  )
}

export default DataAssets
```

- [ ] **Step 3: 验证分类与规模渲染**

访问 http://localhost:3000/ 确认：
- 非结构化和结构化数据区域正确显示
- 每列卡片展示子项和增减趋势

---

### Task 6: 数据资产模块 - 核心来源分布 Treemap

**Files:**
- Create: `src/pages/dashboard/components/data-assets/core-source-treemap.tsx`

- [ ] **Step 1: 编写 treemap 组件**

```typescript
// src/pages/dashboard/components/data-assets/core-source-treemap.tsx
import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { coreSourceData } from '../../data/mock-data'

const treemapColors = ['#1677ff', '#4096ff', '#69b1ff', '#91caff', '#bae0ff']

const CoreSourceTreemap: React.FC = () => {
  const option: EChartsOption = {
    tooltip: {
      formatter: '{b}: {c}%',
    },
    series: [{
      type: 'treemap',
      data: coreSourceData.map((item, i) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: treemapColors[i % treemapColors.length] },
      })),
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 13,
        color: '#fff',
        fontWeight: 600,
      },
      levels: [{
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          gapWidth: 2,
        },
      }],
    }],
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#1677ff',
        borderLeft: '3px solid #1677ff',
        paddingLeft: 10,
        marginBottom: 16,
      }}>
        核心来源分布
      </div>
      <ReactECharts option={option} style={{ height: 280 }} />
      <div style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 4 }}>
        * 方块面积与颜色代表不同来源的数据沉淀规模
      </div>
    </div>
  )
}

export default CoreSourceTreemap
```

- [ ] **Step 2: 验证 treemap 渲染**

确认 treemap 图表正确显示 5 个色块。

---

### Task 7: 知识&规则模块 - 知识库分类卡片

**Files:**
- Create: `src/pages/dashboard/components/knowledge-rules/index.tsx`
- Create: `src/pages/dashboard/components/knowledge-rules/knowledge-base-cards.tsx`

- [ ] **Step 1: 编写知识库分类卡片组件**

```typescript
// src/pages/dashboard/components/knowledge-rules/knowledge-base-cards.tsx
import React from 'react'
import { Card, Row, Col, Typography, Divider } from 'antd'
import { underwritingKnowledge, claimsKnowledge } from '../../data/mock-data'
import type { KnowledgeGroup } from '../../data/mock-data'

const { Text } = Typography

interface KnowledgeSectionProps {
  header: { name: string; total: string; activity: string; cumulativeUsage: string }
  badgeColor: string
  groups: KnowledgeGroup[]
}

const KnowledgeSection: React.FC<KnowledgeSectionProps> = ({ header, badgeColor, groups }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{
          background: badgeColor,
          color: '#fff',
          borderRadius: 20,
          padding: '2px 14px',
          fontSize: 13,
          fontWeight: 600,
        }}>
          {header.name}
        </div>
        <Text style={{ fontSize: 13, color: '#666' }}>{header.total}</Text>
        <Divider type="vertical" style={{ height: 16, margin: '0 8px' }} />
        <Text style={{ fontSize: 12, color: '#999' }}>
          知识活跃度：<Text style={{
            color: header.activity === '高' ? '#52c41a' : '#faad14',
            fontWeight: 600,
          }}>{header.activity}</Text>
        </Text>
        <Divider type="vertical" style={{ height: 16, margin: '0 8px' }} />
        <Text style={{ fontSize: 12, color: '#999' }}>
          知识累计使用量：<Text style={{ color: '#1677ff', fontWeight: 600 }}>{header.cumulativeUsage}</Text>
        </Text>
      </div>
      <Row gutter={[12, 12]}>
        {groups.map((group, i) => (
          <Col span={8} key={i}>
            <Card
              size="small"
              title={
                <span style={{ fontSize: 13 }}>
                  {group.name}{' '}
                  <Text type="secondary" style={{ fontSize: 12 }}>{group.total}</Text>
                </span>
              }
              style={{ marginBottom: 0 }}
            >
              {group.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: j < group.items.length - 1 ? '1px dashed #f0f0f0' : 'none',
                }}>
                  <Text style={{ fontSize: 12 }}>{item.name}</Text>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.count.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#52c41a' }}>
                      {item.daily} / {item.weekly} / {item.monthly}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const KnowledgeBaseCards: React.FC = () => {
  return (
    <div>
      <KnowledgeSection
        header={underwritingKnowledge.header}
        badgeColor="#1677ff"
        groups={underwritingKnowledge.groups}
      />
      <KnowledgeSection
        header={claimsKnowledge.header}
        badgeColor="#722ed1"
        groups={claimsKnowledge.groups}
      />
    </div>
  )
}

export default KnowledgeBaseCards
```

- [ ] **Step 2: 验证知识库卡片渲染**

确认核保知识库和理赔知识库卡片正确显示。

---

### Task 8: 知识&规则模块 - 覆盖场景分布 + Top 10

**Files:**
- Create: `src/pages/dashboard/components/knowledge-rules/coverage-treemap.tsx`
- Create: `src/pages/dashboard/components/knowledge-rules/top-knowledge-list.tsx`
- Modify: `src/pages/dashboard/components/knowledge-rules/index.tsx`

- [ ] **Step 1: 编写覆盖场景 treemap**

```typescript
// src/pages/dashboard/components/knowledge-rules/coverage-treemap.tsx
import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { coverageSceneData } from '../../data/mock-data'

const sceneColors = ['#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']

const CoverageTreemap: React.FC = () => {
  const option: EChartsOption = {
    tooltip: {
      formatter: '{b}: {c}%',
    },
    series: [{
      type: 'treemap',
      data: coverageSceneData.map((item, i) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: sceneColors[i % sceneColors.length] },
      })),
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 12,
        color: '#fff',
        fontWeight: 600,
      },
      levels: [{
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          gapWidth: 2,
        },
      }],
    }],
  }

  return (
    <div>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#1677ff',
        borderLeft: '3px solid #1677ff',
        paddingLeft: 10,
        marginBottom: 16,
      }}>
        覆盖场景分布
      </div>
      <ReactECharts option={option} style={{ height: 280 }} />
    </div>
  )
}

export default CoverageTreemap
```

- [ ] **Step 2: 编写 Top 10 列表**

```typescript
// src/pages/dashboard/components/knowledge-rules/top-knowledge-list.tsx
import React from 'react'
import { Progress, Typography } from 'antd'
import { topKnowledgeData } from '../../data/mock-data'

const { Text } = Typography

const medalColors = ['#faad14', '#8c8c8c', '#cf1322']

const TopKnowledgeList: React.FC = () => {
  const maxCount = topKnowledgeData[0].count

  return (
    <div>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: '#1677ff',
        borderLeft: '3px solid #1677ff',
        paddingLeft: 10,
        marginBottom: 16,
      }}>
        高频调用知识 & 规则 Top 10
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {topKnowledgeData.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: i < 3 ? '#fff' : '#999',
              background: i < 3 ? medalColors[i] : 'transparent',
              border: i >= 3 ? '1px solid #d9d9d9' : 'none',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text ellipsis style={{ fontSize: 12 }}>{item.name}</Text>
            </div>
            <div style={{ width: 180, flexShrink: 0 }}>
              <Progress
                percent={Math.round((item.count / maxCount) * 100)}
                size="small"
                showInfo={false}
                strokeColor={i < 3 ? medalColors[i] : '#1677ff'}
              />
            </div>
            <div style={{ width: 60, textAlign: 'right', flexShrink: 0 }}>
              <Text style={{ fontSize: 12, fontWeight: 600 }}>
                {item.count.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 10, color: '#999' }}> 次</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopKnowledgeList
```

- [ ] **Step 3: 更新 knowledge-rules/index.tsx**

```typescript
// src/pages/dashboard/components/knowledge-rules/index.tsx（完整版本）
import React from 'react'
import { Row, Col } from 'antd'
import KnowledgeBaseCards from './knowledge-base-cards'
import CoverageTreemap from './coverage-treemap'
import TopKnowledgeList from './top-knowledge-list'

const KnowledgeRules: React.FC = () => {
  return (
    <div>
      <KnowledgeBaseCards />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <CoverageTreemap />
        </Col>
        <Col span={12}>
          <TopKnowledgeList />
        </Col>
      </Row>
    </div>
  )
}

export default KnowledgeRules
```

- [ ] **Step 4: 验证知识&规则模块渲染**

确认 treemap 和 Top 10 列表正确显示。

---

### Task 9: Tab 容器 + Dashboard 组装

**Files:**
- Create: `src/pages/dashboard/components/tab-container/index.tsx`
- Modify: `src/pages/dashboard/index.tsx`

- [ ] **Step 1: 编写 Tab 容器**

```typescript
// src/pages/dashboard/components/tab-container/index.tsx
import React from 'react'
import { Tabs } from 'antd'
import DataAssets from '../data-assets'
import KnowledgeRules from '../knowledge-rules'

const TabContainer: React.FC = () => {
  const items = [
    {
      key: 'data',
      label: '数据资产',
      children: <DataAssets />,
    },
    {
      key: 'knowledge',
      label: '知识&规则',
      children: <KnowledgeRules />,
    },
  ]

  return <Tabs defaultActiveKey="data" items={items} />
}

export default TabContainer
```

- [ ] **Step 2: 更新 Dashboard 主组件**

```typescript
// src/pages/dashboard/index.tsx（完整替换）
import React from 'react'
import SmartServices from './components/smart-services'
import TabContainer from './components/tab-container'

const Dashboard: React.FC = () => {
  return (
    <div>
      <SmartServices />
      <div style={{ marginTop: 24 }}>
        <TabContainer />
      </div>
    </div>
  )
}

export default Dashboard
```

- [ ] **Step 3: 验证完整页面**

访问 http://localhost:3000/ 逐项确认：
1. 侧边栏：4 组二级菜单，「全景概览」展开，「智能服务」高亮
2. 智能服务：6 张卡片 + 2 个折线图
3. 底部 Tab：默认显示「数据资产」，点击切换到「知识&规则」
4. 数据资产：分类与规模 + 核心来源分布 treemap
5. 知识&规则：知识库卡片 + 覆盖场景 treemap + Top 10 列表

---

## Spec 覆盖自查

| Spec 要求 | 对应 Task | 状态 |
|-----------|-----------|------|
| 侧边栏二级菜单 | Task 2 | ✅ |
| 智能体卡片 6 个 | Task 3 | ✅ |
| 自动化率趋势图 | Task 4 | ✅ |
| 案件处理趋势图 | Task 4 | ✅ |
| 数据资产分类与规模 | Task 5 | ✅ |
| 核心来源分布 treemap | Task 6 | ✅ |
| 知识&规则知识库卡片 | Task 7 | ✅ |
| 覆盖场景 treemap | Task 8 | ✅ |
| 高频调用 Top 10 | Task 8 | ✅ |
| Tab 切换 | Task 9 | ✅ |
| Mock 数据 | Task 1 | ✅ |

**Placeholder 扫描**: 无 TBD/TODO，所有代码完整。
**类型一致性**: mock-data.ts 中定义的类型在所有组件中一致使用。

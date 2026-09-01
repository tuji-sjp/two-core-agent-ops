import React, { useState, useEffect } from 'react'
import { Row, Col, Typography } from 'antd'
import DataOverview from './data-overview'

const { Text } = Typography

const AGENT_DATA_ITEMS = [
  {
    title: '案件核心',
    tableCount: 12,
    fieldCount: 156,
    totalCount: 186574,
    dailyCount: 1031,
    description: '理赔案件的"身份证"和主骨架。记录一次理赔从受理、报案到结案的基本信息：谁报的案、哪张保单、承担什么责任、案件类型标签、ICD 疾病编码等。所有其他数据都挂在这条主线上。',
  },
  {
    title: '账单费用',
    tableCount: 8,
    fieldCount: 94,
    totalCount: 328590,
    dailyCount: 2244,
    description: '案件花了多少钱的详细账本。从一张发票，到发票上的每项费用，再到按二/三级分类拆分（西药费、检查费等），以及免赔额、控费标签、按险种分摊的金额。理赔金额计算的数据基础。',
  },
  {
    title: '就医医疗',
    tableCount: 15,
    fieldCount: 203,
    totalCount: 241902,
    dailyCount: 1595,
    description: '客户看病的过程记录。住了几次院、做了什么手术、每次就诊的诊断和票据，以及重疾的分类认定。用于判断"医疗行为是否合理、是否属于保险责任"。',
  },
  {
    title: '支付领款',
    tableCount: 5,
    fieldCount: 42,
    totalCount: 156830,
    dailyCount: 892,
    description: '钱赔给谁、怎么赔。受益人是谁、领款人银行账户信息、支付渠道。理赔流程的最后一环——打款。',
  },
  {
    title: '流程处理',
    tableCount: 10,
    fieldCount: 78,
    totalCount: 198420,
    dailyCount: 1120,
    description: '案件审核过程中的人机交互痕迹。审核员之间的协谈沟通、案件回退重审、多人合议、向客户发照会要材料、问题件补充等。反映案件流转的完整过程。',
  },
  {
    title: '规则风控',
    tableCount: 6,
    fieldCount: 51,
    totalCount: 89230,
    dailyCount: 567,
    description: '自动化审核的"大脑"。定义了哪些规则、案件命中了什么风险规则、为什么被自动流程阻断。是智能理赔自动化的决策依据。',
  },
  {
    title: '影像材料',
    tableCount: 4,
    fieldCount: 28,
    totalCount: 421560,
    dailyCount: 3120,
    description: '理赔案件的所有单证影像。发票、病历等图片的切割、分组、存储位置。',
  },
  {
    title: '主数据维度',
    tableCount: 20,
    fieldCount: 312,
    totalCount: 75680,
    dailyCount: 245,
    description: '支撑性字典数据。医院名录、省市地区、机构、科室、职业、银行、产品条款、数据字典等。用于把业务表中的编码翻译成可读信息。',
  },
  {
    title: '调查任务',
    tableCount: 3,
    fieldCount: 18,
    totalCount: 34520,
    dailyCount: 156,
    description: '案件触发人工调查时的数据快照。初审、扣费、理算、审核等不同阶段发现疑点后，转交调查的客户数据和任务包。',
  },
]

function formatNumber(num: number): string {
  return num.toLocaleString()
}

const AgentDataCard: React.FC<{
  title: string
  tableCount: number
  fieldCount: number
  totalCount: number
  dailyCount: number
  description: string
}> = ({ title, tableCount, fieldCount, totalCount, dailyCount, description }) => {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      padding: 20, height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ marginBottom: 8, lineHeight: 1.6, fontSize: 14, display: 'flex', justifyContent: 'space-between', background: '#eff6ff', borderRadius: 6, padding: '4px 8px' }}>
        <div>
          <span style={{ color: '#3067b3', fontWeight: 600 }}>{tableCount}</span>
          <span style={{ color: '#1f2937', fontWeight: 400 }}> 张表，</span>
          <span style={{ color: '#3067b3', fontWeight: 600 }}>{fieldCount}</span>
          <span style={{ color: '#1f2937', fontWeight: 400 }}> 个字段</span>
        </div>
        <div>
          <span style={{ color: '#1f2937', fontWeight: 400 }}>累计 </span>
          <span style={{ color: '#3067b3', fontWeight: 600 }}>{formatNumber(totalCount)}</span>
          <span style={{ color: '#1f2937', fontWeight: 400 }}> 条数据，今日 </span>
          <span style={{ color: '#ea580c', fontWeight: 600 }}>↑ </span>
          <span style={{ color: '#ea580c', fontWeight: 600 }}>{formatNumber(dailyCount)}</span>
          <span style={{ color: '#1f2937', fontWeight: 400 }}> 条</span>
        </div>
      </div>
      <div style={{
        fontSize: 13, color: '#6b7280', lineHeight: 1.7, flex: 1,
      }}>
        {description}
      </div>
    </div>
  )
}

const INITIAL_DATA_SERVICE_ITEMS = [
  { name: '影像数据查询服务', totalCount: 38210, dailyCount: 275 },
  { name: '影像 ID 查询服务', totalCount: 35600, dailyCount: 198 },
  { name: '电子保单条款信息查询服务', totalCount: 26320, dailyCount: 156 },
  { name: '条款查询服务', totalCount: 15100, dailyCount: 89 },
  { name: '采集分组查询服务', totalCount: 14900, dailyCount: 72 },
]

const DataServiceList: React.FC = () => {
  const [items, setItems] = useState(INITIAL_DATA_SERVICE_ITEMS)
  const maxCalls = items[0]?.totalCount || 1

  useEffect(() => {
    const timer = setInterval(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        totalCount: item.totalCount + item.dailyCount,
        dailyCount: item.dailyCount + Math.floor(Math.random() * 5) + 1,
      })))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, index) => {
        const percentage = (item.totalCount / maxCalls) * 100
        // TOP 1-3 橙色，TOP 4-6 浅蓝色
        const isTop = index < 3
        const barColor = isTop ? '#fb923c' : '#60a5fa'
        return (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              background: isTop ? '#fff7ed' : '#f3f4f6',
              color: isTop ? '#ea580c' : '#6b7280',
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text ellipsis style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  {item.name}
                </Text>
                <span style={{ fontSize: 14, flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ color: '#1f2937', fontWeight: 400 }}>累计使用 </span>
                  <span style={{ color: '#3067b3', fontWeight: 600 }}>{item.totalCount.toLocaleString()}</span>
                  <span style={{ color: '#1f2937', fontWeight: 400 }}> 次，今日 </span>
                  <span style={{ color: '#ea580c', fontWeight: 600 }}>↑ </span>
                  <span style={{ color: '#ea580c', fontWeight: 600 }}>{item.dailyCount}</span>
                  <span style={{ color: '#1f2937', fontWeight: 400 }}> 次</span>
                </span>
              </div>
              <div style={{ height: 6, width: '100%', background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${percentage}%`, borderRadius: 10,
                  background: barColor,
                }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ClassificationOverview: React.FC = () => {
  const [agentItems, setAgentItems] = useState(AGENT_DATA_ITEMS)

  useEffect(() => {
    const timer = setInterval(() => {
      setAgentItems(prev => prev.map(item => ({
        ...item,
        totalCount: item.totalCount + item.dailyCount,
        dailyCount: item.dailyCount + Math.floor(Math.random() * 20) + 5,
      })))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      {/* 数据总览 + 数据服务 水平并列 */}
      <div style={{ display: 'flex', gap: 80, marginTop: 10 }}>
        {/* 左侧：数据总览 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <div style={{
              width: 4,
              height: 20,
              background: '#3b82f6',
              borderRadius: 10,
              marginRight: 10,
            }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>数据总览</span>
          </div>
          <DataOverview />
        </div>

        {/* 右侧：数据服务 */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 600, marginRight: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', marginBottom: 20,
          }}>
            <div style={{
              width: 4, height: 20, background: '#3b82f6', borderRadius: 10, marginRight: 10,
            }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>数据服务</span>
          </div>
          <DataServiceList />
        </div>
      </div>

      {/* 理赔智能体数据 */}
      <div style={{ marginTop: 40 }}>
        <div style={{
          display: 'flex', alignItems: 'center', marginBottom: 20,
        }}>
          <div style={{
            width: 4, height: 20, background: '#3b82f6', borderRadius: 10, marginRight: 10,
          }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>理赔智能体数据</span>
        </div>
        <Row gutter={[20, 20]}>
          {agentItems.map((item, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <AgentDataCard
                title={item.title}
                tableCount={item.tableCount}
                fieldCount={item.fieldCount}
                totalCount={item.totalCount}
                dailyCount={item.dailyCount}
                description={item.description}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default ClassificationOverview

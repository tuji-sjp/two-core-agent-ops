import React, { useState } from 'react'
import ChinaMapPanel from './components/ChinaMapPanel'
import CityStatsTable from './components/CityStatsTable'
import ScrollingCases from './components/ScrollingCases'

// ========== Mock: 数据资产总览（理赔&核保各4大类） ==========
const DATA_ASSETS = {
  claims: [
    { name: '病历类', total: '88,200', usage: '242,500' },
    { name: '票据类', total: '42,500', usage: '116,800' },
    { name: '费用结算类', total: '38,000', usage: '104,400' },
    { name: '辅助证明类', total: '55,000', usage: '151,200' },
    { name: '申请类', total: '18,000', usage: '49,500' },
  ],
  underwriting: [
    { name: '影像数据', total: '8,200', usage: '28,500' },
    { name: '体检报告', total: '15,600', usage: '72,000' },
    { name: '保单信息', total: '32,000', usage: '185,000' },
    { name: '案件信息', total: '5,800', usage: '42,000' },
  ],
}

// ========== Mock: 知识调用排行 Top 10（与"数据共享-知识&规则"的 TopKnowledgeList 数据完全一致 + 分类标签） ==========
interface KnowledgeRankingItem {
  name: string
  category: string
  count: number
}

// 理赔模式：与 TopKnowledgeList defaultData 完全一致
const TOP_CLAIMS_KNOWLEDGE: KnowledgeRankingItem[] = [
  { name: '甲状腺结节核保指南 v2.1', category: '医学知识', count: 45430 },
  { name: '2024版国家医保目录剔除规则', category: '免赔结算', count: 38210 },
  { name: '急性阑尾炎标准住院天数限制', category: '理算规则', count: 35600 },
  { name: '高血压II期并发症判定逻辑', category: '医学知识', count: 26320 },
  { name: '门诊统筹起付线扣减规则', category: '理算规则', count: 15100 },
  { name: '骨折内固定器材合理费用标准', category: '理算规则', count: 14900 },
  { name: '重症确诊报告必须专项检查', category: '产品责任', count: 8200 },
  { name: '意外身故置方案件性质要求', category: '立案规则', count: 6500 },
  { name: '乳腺癌特定靶向药赔付目录', category: '产品责任', count: 5100 },
  { name: '异地就医结算比例换算公式', category: '免赔结算', count: 4400 },
]

// 核保模式：与 shared/knowledge-rules 的 underwritingTopKnowledge 完全一致
const TOP_UNDERWRITING_KNOWLEDGE: KnowledgeRankingItem[] = [
  { name: '甲状腺结节核保指南 v2.1', category: '医学知识', count: 45430 },
  { name: '高血压III期拒保标准', category: '核保标准', count: 38210 },
  { name: '糖尿病并发症加费规则', category: '评点规则', count: 35600 },
  { name: '乳腺结节BI-RADS分级核保', category: '核保标准', count: 26320 },
  { name: 'BMI超重加费计算表', category: '评点规则', count: 15100 },
  { name: '既往症等待期认定规则', category: '操作规则', count: 14900 },
  { name: '职业分类风险等级对照表', category: '医学知识', count: 8200 },
  { name: '高保额财务核保指引', category: '核保标准', count: 6500 },
  { name: '未成年人身故保额限制', category: '操作规则', count: 5100 },
  { name: '境外人士核保政策说明', category: '操作规则', count: 4400 },
]

// ========== 白色主题 ==========
const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  background: '#fff',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

const sectionLabel = (text: string) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0px', marginBottom: 8 }}>
    <div style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 10 }} />
    <span style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{text}</span>
  </div>
)

const segTabStyle: React.CSSProperties = {
  display: 'inline-flex', borderRadius: 10, border: '1px solid #e5e7eb',
  background: '#f9fafb', overflow: 'hidden', flexShrink: 0,
}
const segTabBtn = (active: boolean): React.CSSProperties => ({
  padding: '3px 14px', border: 'none', background: active ? '#fff' : 'transparent',
  color: active ? '#3b82f6' : '#1d2937',
  fontSize: 12, fontWeight: active ? 600 : 400,
  cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
})

// ========== 板块：数据资产总览 ==========
const DataAssetsSection: React.FC = () => {
  const [domain, setDomain] = useState<'claims' | 'underwriting'>('claims')
  const data = DATA_ASSETS[domain]

  return (
    <div style={{ ...cardStyle, padding: '10px 14px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {sectionLabel('数据资产总览')}
        <div style={segTabStyle}>
          {(['claims', 'underwriting'] as const).map(d => (
            <button key={d} onClick={() => setDomain(d)} style={segTabBtn(domain === d)}>
              {d === 'claims' ? '理赔' : '核保'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {data.map((item, i) => (
          <div key={i} style={{
            background: '#f9fafb', borderRadius: 8, padding: '10px 12px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize:14, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>{item.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#1d2937' }}>总数量</span>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>{item.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
              <span style={{ color: '#1d2937' }}>使用量</span>
              <span style={{ color: '#fb923c', fontWeight: 600 }}>{item.usage}</span>
            </div>
          </div>
        ))}
        {data.length % 2 !== 0 && <div />}
      </div>
    </div>
  )
}

// ========== 板块：知识调用排行（1:1 复刻 TopKnowledgeList 进度条样式 + 分类标签） ==========
const KnowledgeSection: React.FC = () => {
  const [domain, setDomain] = useState<'claims' | 'underwriting'>('claims')
  const data = domain === 'claims' ? TOP_CLAIMS_KNOWLEDGE : TOP_UNDERWRITING_KNOWLEDGE
  const maxCalls = data[0]?.count || 1

  return (
    <div style={{ ...cardStyle, padding: '10px 14px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 10 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>知识调用排行</span>
        </div>
        <div style={segTabStyle}>
          {(['claims', 'underwriting'] as const).map(d => (
            <button key={d} onClick={() => setDomain(d)} style={segTabBtn(domain === d)}>
              {d === 'claims' ? '理赔' : '核保'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingRight: 6 }}>
        {data.map((item, idx) => {
          const percentage = (item.count / maxCalls) * 100
          const isTop = idx < 3
          return (
            <div key={item.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 10,
            }}>
              {/* 排名徽章 */}
              <span style={{
                width: 22, height: 22, borderRadius: 16, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isTop ? '#fff7ed' : '#f3f4f6',
                color: isTop ? '#ea580c' : '#6b7280',
                fontSize: 10, fontWeight: 700,
              }}>
                {idx + 1}
              </span>
              {/* 文档名称 + 进度条 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {/* 分类标签 pill（未选中态朴素样式） */}
                  <span style={{
                    flexShrink: 0, padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500,
                    background: '#fff', color: '#374151', border: '1px solid #d9d9d9',
                  }}>
                    {item.category}
                  </span>
                  <span style={{
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontSize: 12, fontWeight: 500, color: '#374151',
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    flexShrink: 0, fontSize: 12, color: '#6b7280', marginLeft: 4,
                  }}>
                    {item.count.toLocaleString()} 次
                  </span>
                </div>
                {/* 进度条 */}
                <div style={{
                  height: 5, width: '100%', background: '#f3f4f6', borderRadius: 10, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${percentage}%`, borderRadius: 10,
                    background: isTop ? '#fb923c' : '#60a5fa',
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DashboardHeader: React.FC = () => (
  <div style={{
    height: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderBottom: '1px solid #e5e7eb',
    position: 'relative', flexShrink: 0,
  }}>
    <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg, transparent, #3b82f6)' }} />
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6' }} />
    </div>
    <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', letterSpacing: 4, margin: 0 }}>
      两核智能体运营平台 · 业务全景看板
    </h1>
    <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6' }} />
      <div style={{ width: 24, height: 2, background: 'linear-gradient(270deg, transparent, #3b82f6)' }} />
    </div>
  </div>
)

const BusinessOverview: React.FC = () => {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      <DashboardHeader />

      {/* ===== 3 列布局 ===== */}
      <div style={{ flex: 1, display: 'flex', gap: 12, padding: '10px 12px 12px', minHeight: 0 }}>

        {/* 左列：地区案件统计 + 实时案件流 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {/* 左上：地区案件统计 */}
          <div style={{ ...cardStyle, flex: 1 }}>
            <CityStatsTable />
          </div>
          {/* 左下：实时案件流 */}
          <div style={{ ...cardStyle, flex: 1 }}>
            <ScrollingCases />
          </div>
        </div>

        {/* 中列：全国案件处理情况（最宽，占满全高） */}
        <div style={{ flex: 1.8, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
          <div style={{ ...cardStyle, flex: 1, padding: '10px 6px 6px' }}>
            {sectionLabel('全国案件处理情况')}
            <div style={{ flex: 1, minHeight: 0, padding: '0px 6px 6px' }}>
              <ChinaMapPanel />
            </div>
          </div>
        </div>

        {/* 右列：数据资产总览 + 知识调用排行 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {/* 右上：数据资产总览 */}
          <DataAssetsSection />
          {/* 右下：知识调用排行 */}
          <KnowledgeSection />
        </div>
      </div>
    </div>
  )
}

export default BusinessOverview

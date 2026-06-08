import React, { useState } from 'react'
import ChinaMapPanel from './components/ChinaMapPanel'
import CityStatsTable from './components/CityStatsTable'
import ScrollingCases from './components/ScrollingCases'
import { claimsKnowledge, underwritingKnowledge } from '../../dashboard/data/mock-data'

// ========== Mock: 数据资产总览（理赔&核保各4大类） ==========
const DATA_ASSETS = {
  claims: [
    { name: '影像数据', total: '21,594', usage: '62,400' },
    { name: '体检报告', total: '10,825', usage: '45,800' },
    { name: '保单信息', total: '25,000', usage: '142,000' },
    { name: '案件信息', total: '12,500', usage: '108,000' },
  ],
  underwriting: [
    { name: '影像数据', total: '8,200', usage: '28,500' },
    { name: '体检报告', total: '15,600', usage: '72,000' },
    { name: '保单信息', total: '32,000', usage: '185,000' },
    { name: '案件信息', total: '5,800', usage: '42,000' },
  ],
}

// ========== Mock: 高频知识 Top 10（带分类标签） ==========
const TOP_CLAIMS_KNOWLEDGE = claimsKnowledge.groups.flatMap(g =>
  g.items.slice(0, 2).map(item => ({ name: item.name, category: g.name, count: item.count }))
).slice(0, 10)

const TOP_UNDERWRITING_KNOWLEDGE = underwritingKnowledge.groups.flatMap(g =>
  g.items.slice(0, 2).map(item => ({ name: item.name, category: g.name, count: item.count }))
).slice(0, 10)

const CATEGORY_COLOR: Record<string, string> = {
  '产品责任': '#3b82f6',
  '立案规则': '#10b981',
  '理算规则': '#f59e0b',
  '免赔结算': '#ef4444',
  '风控审核': '#8b5cf6',
  '医学知识': '#3b82f6',
  '核保标准': '#10b981',
  '评点规则': '#f59e0b',
  '操作规则': '#ef4444',
}

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
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', marginBottom: 8 }}>
    <div style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 10 }} />
    <span style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{text}</span>
  </div>
)

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '2px 14px', borderRadius: 12, border: 'none',
  background: active ? '#eff6ff' : 'transparent',
  color: active ? '#3b82f6' : '#6b7280',
  fontSize: 11, fontWeight: active ? 600 : 400,
  cursor: 'pointer', transition: 'all 0.2s',
})

// ========== 板块：数据资产总览 ==========
const DataAssetsSection: React.FC = () => {
  const [domain, setDomain] = useState<'claims' | 'underwriting'>('claims')
  const data = DATA_ASSETS[domain]

  return (
    <div style={{ ...cardStyle, padding: '10px 14px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {sectionLabel('数据资产总览')}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['claims', 'underwriting'] as const).map(d => (
            <button key={d} onClick={() => setDomain(d)} style={tabBtnStyle(domain === d)}>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>{item.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: '#9ca3af' }}>总数量</span>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>{item.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 2 }}>
              <span style={{ color: '#9ca3af' }}>使用量</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{item.usage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========== 板块：知识调用排行 ==========
const KnowledgeSection: React.FC = () => {
  const [domain, setDomain] = useState<'claims' | 'underwriting'>('claims')
  const data = domain === 'claims' ? TOP_CLAIMS_KNOWLEDGE : TOP_UNDERWRITING_KNOWLEDGE

  return (
    <div style={{ ...cardStyle, padding: '10px 14px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {sectionLabel('知识调用排行')}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['claims', 'underwriting'] as const).map(d => (
            <button key={d} onClick={() => setDomain(d)} style={tabBtnStyle(domain === d)}>
              {d === 'claims' ? '理赔' : '核保'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 12px', borderRadius: 6,
            background: idx % 2 === 0 ? 'transparent' : '#f9fafb',
            fontSize: 12, color: '#374151',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: idx < 3 ? '#eff6ff' : '#f3f4f6',
              color: idx < 3 ? '#3b82f6' : '#9ca3af',
              fontSize: 11, fontWeight: 700,
            }}>
              {idx + 1}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {item.name}
            </span>
            <span style={{
              flexShrink: 0, padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500,
              background: `${CATEGORY_COLOR[item.category] || '#9ca3af'}15`,
              color: CATEGORY_COLOR[item.category] || '#9ca3af',
            }}>
              {item.category}
            </span>
            <span style={{ flexShrink: 0, color: '#9ca3af', fontSize: 11 }}>
              {item.count.toLocaleString()} 次
            </span>
          </div>
        ))}
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
    <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', letterSpacing: 4, margin: 0 }}>
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
        <div style={{ flex: 1.8, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '0px 6px 6px' }}>
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

import React, { useState } from 'react'
import { Row, Col } from 'antd'
import KnowledgeBaseCards from '../../dashboard/components/knowledge-rules/knowledge-base-cards'
import CoverageTreemap, { type CoverageSceneItem } from '../../dashboard/components/knowledge-rules/coverage-treemap'
import TopKnowledgeList, { type TopKnowledgeItem } from '../../dashboard/components/knowledge-rules/top-knowledge-list'

const underwritingCoverageData: CoverageSceneItem[] = [
  { name: '重疾险核保评估', value: 32 },
  { name: '医疗险健康告知', value: 26 },
  { name: '寿险身故核保', value: 18 },
  { name: '意外险职业类别', value: 14 },
  { name: '团险企业客户', value: 10 },
]

const underwritingTopKnowledge: TopKnowledgeItem[] = [
  { name: '甲状腺结节核保指南 v2.1', count: 45430 },
  { name: '高血压III期拒保标准', count: 38210 },
  { name: '糖尿病并发症加费规则', count: 35600 },
  { name: '乳腺结节BI-RADS分级核保', count: 26320 },
  { name: 'BMI超重加费计算表', count: 15100 },
  { name: '既往症等待期认定规则', count: 14900 },
  { name: '职业分类风险等级对照表', count: 8200 },
  { name: '高保额财务核保指引', count: 6500 },
  { name: '未成年人身故保额限制', count: 5100 },
  { name: '境外人士核保政策说明', count: 4400 },
]

const SharedKnowledgeRules: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'claims' | 'underwriting'>('claims')
  const isClaims = activeTab === 'claims'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      {/* 理赔/核保 tab 页签 */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 28,
        borderBottom: '1px solid #e8e8e8',
      }}>
        {(['claims', 'underwriting'] as const).map((tab) => {
          const active = (tab === 'claims' && isClaims) || (tab === 'underwriting' && !isClaims)
          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px',
                fontSize: 15,
                fontWeight: active ? 600 : 400,
                color: active ? '#1f2937' : '#8c8c8c',
                cursor: 'pointer',
                borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#595959'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#8c8c8c'
              }}
            >
              {tab === 'claims' ? '理赔' : '核保'}
            </div>
          )
        })}
      </div>

      {/* 知识库卡片 */}
      <KnowledgeBaseCards activeTab={activeTab} />

      {/* 覆盖场景 + 高频调用知识 */}
      <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
        <Col xs={24} lg={12}>
          <CoverageTreemap
            data={isClaims ? undefined : underwritingCoverageData}
          />
        </Col>
        <Col xs={24} lg={12}>
          <TopKnowledgeList
            data={isClaims ? undefined : underwritingTopKnowledge}
          />
        </Col>
      </Row>
    </div>
  )
}

export default SharedKnowledgeRules

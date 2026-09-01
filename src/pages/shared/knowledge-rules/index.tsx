import React, { useState } from 'react'
import KnowledgeBaseCards from '../../dashboard/components/knowledge-rules/knowledge-base-cards'

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
                fontSize: 16,
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
    </div>
  )
}

export default SharedKnowledgeRules

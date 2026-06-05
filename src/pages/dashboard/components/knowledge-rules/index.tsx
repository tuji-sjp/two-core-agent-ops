import React from 'react'
import { Row, Col } from 'antd'
import KnowledgeBaseCards from './knowledge-base-cards'
import CoverageTreemap from './coverage-treemap'
import TopKnowledgeList from './top-knowledge-list'

const KnowledgeRules: React.FC = () => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      borderTopLeftRadius: 0,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: 24,
    }}>
      <KnowledgeBaseCards activeTab="claims" />

      <>
        <div style={{ height: 24 }} />
        <div style={{ borderTop: '1px solid #f0f0f0', marginBottom: 24 }} />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <CoverageTreemap />
          </Col>
          <Col xs={24} lg={12}>
            <TopKnowledgeList />
          </Col>
        </Row>
      </>
    </div>
  )
}

export default KnowledgeRules

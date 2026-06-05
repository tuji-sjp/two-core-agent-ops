import React from 'react'
import { Row, Col } from 'antd'
import type { SmartAgent } from '../../data/mock-data'
import SmartAgentCard from './smart-agent-card'
import AutomationRateChart from './automation-rate-chart'
import CaseProcessingChart from './case-processing-chart'

const SmartServices: React.FC<{ agents?: SmartAgent[] }> = ({ agents }) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: '#3b82f6',
          borderRadius: 10,
          marginRight: 10,
        }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>智能服务</span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '2px 12px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 500,
          background: '#ecfdf5',
          color: '#059669',
          border: '1px solid #a7f3d0',
          marginLeft: 12,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 10, background: '#22c55e',
            animation: 'pulse 2s infinite',
          }} />
          实时监控运行中
        </span>
      </div>
      <Row gutter={[12, 12]}>
        {(agents || []).map((agent, i) => (
          <Col span={4} key={i}>
            <SmartAgentCard agent={agent} />
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 28 }}>
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

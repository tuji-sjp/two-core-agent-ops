import React from 'react'
import { Typography } from 'antd'
import type { SmartAgent } from '../../data/mock-data'

const { Text } = Typography

interface Props {
  agent: SmartAgent
}

function getMetricColor(value: string): string {
  const num = parseFloat(value.replace('%', ''))
  return num >= 90 ? '#fa8c16' : '#ff4d4f'
}

const SmartAgentCard: React.FC<Props> = ({ agent }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e8ecf0',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 上半栏：名称 + 功能简介 */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid #f5f7fa',
      }}>
        <Text strong style={{ fontSize: 14, color: '#1d2129' }}>{agent.name}</Text>
        <div style={{
          fontSize: 11,
          color: '#86909c',
          lineHeight: '16px',
          marginTop: 6,
          height: 32,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {agent.description}
        </div>
      </div>

      {/* 下半栏：指标 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px 14px',
      }}>
        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
          {agent.metrics.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                fontSize: 22,
                fontWeight: 700,
                color: getMetricColor(m.value),
                lineHeight: 1,
              }}>
                {m.value}
              </div>
              <div style={{ fontSize: 11, color: '#1f2937', marginTop: 4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SmartAgentCard

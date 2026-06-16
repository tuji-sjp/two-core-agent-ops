import React from 'react'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface MetricItem {
  label: string
  value: string
  change?: { direction: 'up' | 'down'; value: string }
}

interface Props {
  metric: MetricItem
}

const MetricCard: React.FC<Props> = ({ metric }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e8ecf0',
      padding: '16px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      {/* 指标名称 */}
      <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{metric.label}</div>
      {/* 指标数值 */}
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        lineHeight: 1,
        marginBottom: 10,
      }}>
        {metric.value}
      </div>
      {/* 较上周变化 */}
      {metric.change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
          <span style={{ color: '#9ca3af' }}>较上周</span>
          {metric.change.direction === 'up' ? (
            <>
              <ArrowUpOutlined style={{ color: '#ef4444', fontSize: 11 }} />
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{metric.change.value}</span>
            </>
          ) : (
            <>
              <ArrowDownOutlined style={{ color: '#22c55e', fontSize: 11 }} />
              <span style={{ color: '#22c55e', fontWeight: 600 }}>{metric.change.value}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default MetricCard

import React from 'react'

interface MetricItem {
  label: string
  value: string
}

interface Props {
  metric: MetricItem
}

function getValueColor(value: string): string {
  const num = parseFloat(value.replace(/[%,]/g, ''))
  if (value.includes('%')) {
    return num >= 90 ? '#22c55e' : num >= 70 ? '#f59e0b' : '#ef4444'
  }
  return '#3b82f6'
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
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color: getValueColor(metric.value),
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {metric.value}
      </div>
      <div style={{ fontSize: 14, color: '#1d2129', fontWeight: 700, textAlign: 'center' }}>{metric.label}</div>
    </div>
  )
}

export default MetricCard

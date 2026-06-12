import React from 'react'
import { Typography } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

const { Text } = Typography

interface SectionHeaderProps {
  title: string
  countLabel?: string
  countValue: string
  activityLevel?: string
  usageCount?: string
  activityPrefix?: string
  usagePrefix?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  countLabel = '累计数据量',
  countValue,
  activityLevel,
  usageCount,
  activityPrefix = '数据',
  usagePrefix = ''
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 24, flexWrap: 'wrap', gap: 20 }}>
      <div style={{
        background: '#2c3e50',
        color: '#fff',
        borderRadius: 20,
        padding: '8px 20px',
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        flexShrink: 0,
        minWidth: 120,
        textAlign: 'center',
      }}>
        {title}
      </div>
      <div style={{
        color: '#374151',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        <FileTextOutlined style={{ color: '#3b82f6', fontSize: 16 }} />
        {countLabel}：<span style={{ fontWeight: 700, color: '#f59e0b' }}>{countValue}</span>
      </div>
      {(activityLevel || usageCount) && (
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, gap: 20 }}>
          {usageCount && (
            <span style={{ color: '#4b5563' }}>
              {usagePrefix}累计使用量：<span style={{ fontWeight: 700, color: '#f59e0b', marginLeft: 4 }}>{usageCount} 次</span>
            </span>
          )}
          {activityLevel && (
            <span style={{ color: '#4b5563' }}>
              {activityPrefix}活跃度：<span style={{ fontWeight: 700, color: '#f59e0b', marginLeft: 4 }}>{activityLevel}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface DataCardProps {
  category: {
    name: string
    total: number
    items: { label: string; count: number; d: string; w: string; m: string }[]
  }
  unit?: string
  headerUnit?: string
  style?: React.CSSProperties
}

const DataCard: React.FC<DataCardProps> = ({ category, unit = '份', headerUnit, style }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        background: '#65A5FF',
        fontSize: 16,
        color: '#fff',
        padding: '8px 16px',
        textAlign: 'center',
        fontWeight: 600,
      }}>
        {category.name} <span style={{ marginLeft: 4, opacity: 0.9 }}>{category.total.toLocaleString()} {headerUnit || unit}</span>
      </div>
      <div style={{ padding: '16px', minHeight: 140 }}>
        {category.items.map((item, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            borderBottom: idx < category.items.length - 1 ? '1px solid #f3f4f6' : 'none',
            paddingBottom: 8,
            marginBottom: idx < category.items.length - 1 ? 12 : 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontSize: 14, color: '#374151', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 14, color: '#111827', fontWeight: 600, flexShrink: 0 }}>共 {item.count.toLocaleString()} {unit}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, fontSize: 12, color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ color: '#10b981' }}>{item.d}{unit}</span>/日</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ color: '#10b981' }}>{item.w}{unit}</span>/周</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><span style={{ color: '#10b981' }}>{item.m}{unit}</span>/月</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { SectionHeader, DataCard }

import React from 'react'
import { Typography } from 'antd'

export interface TopKnowledgeItem {
  name: string
  count: number
}

const defaultData: TopKnowledgeItem[] = [
  { name: '甲状腺结节核保指南 v2.1', count: 45430 },
  { name: '2024版国家医保目录剔除规则', count: 38210 },
  { name: '急性阑尾炎标准住院天数限制', count: 35600 },
  { name: '高血压II期并发症判定逻辑', count: 26320 },
  { name: '门诊统筹起付线扣减规则', count: 15100 },
  { name: '骨折内固定器材合理费用标准', count: 14900 },
  { name: '重症确诊报告必须专项检查', count: 8200 },
  { name: '意外身故置方案件性质要求', count: 6500 },
  { name: '乳腺癌特定靶向药赔付目录', count: 5100 },
  { name: '异地就医结算比例换算公式', count: 4400 },
]

const { Text } = Typography

const TopKnowledgeList: React.FC<{ data?: TopKnowledgeItem[] }> = ({ data: propData }) => {
  const listData = propData || defaultData
  const maxCalls = listData[0]?.count || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: '#3b82f6',
          borderRadius: 10,
          marginRight: 10,
        }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
          高频调用知识 & 规则 Top 10
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {listData.map((item, index) => {
          const percentage = (item.count / maxCalls) * 100
          const isTop = index < 3
          return (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                background: isTop ? '#fff7ed' : '#f3f4f6',
                color: isTop ? '#ea580c' : '#6b7280',
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text ellipsis style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    {item.name}
                  </Text>
                  <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0, marginLeft: 8 }}>
                    {item.count.toLocaleString()} 次
                  </span>
                </div>
                <div style={{ height: 6, width: '100%', background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      borderRadius: 10,
                      background: isTop ? '#fb923c' : '#60a5fa',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TopKnowledgeList

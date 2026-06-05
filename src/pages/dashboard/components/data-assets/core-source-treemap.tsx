import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

const dataSourceDistribution = [
  { name: '医院直连接口 (HIS)', size: 4500, color: '#3b82f6' },
  { name: '客户APP上传', size: 3200, color: '#60a5fa' },
  { name: '第三方体检机构', size: 1800, color: '#93c5fd' },
  { name: '柜面人工录入', size: 1200, color: '#2dd4bf' },
  { name: '外部医保局数据', size: 900, color: '#818cf8' },
]

const COLORS = ['#3b82f6', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf', '#818cf8']

const CoreSourceTreemap: React.FC = () => {
  const option: EChartsOption = {
    tooltip: {
      formatter: (params: any) => `${params.name}: ${params.value} 万条`,
    },
    series: [{
      type: 'treemap',
      data: dataSourceDistribution.map((item, i) => ({
        name: item.name,
        value: item.size,
        itemStyle: { color: item.color || COLORS[i % COLORS.length] },
      })),
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
      },
      levels: [{
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          gapWidth: 2,
        },
      }],
    }],
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 30,
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: '#3b82f6',
          borderRadius: 10,
          marginRight: 10,
        }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>
          核心来源分布
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 300 }} />
      <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 12 }}>
        * 方块面积与颜色代表不同来源的数据资产规模
      </div>
    </div>
  )
}

export default CoreSourceTreemap

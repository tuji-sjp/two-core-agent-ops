import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

export interface CoverageSceneItem {
  name: string
  value: number
}

const defaultData: CoverageSceneItem[] = [
  { name: '普通门急诊理赔', value: 35 },
  { name: '住院医疗保障', value: 28 },
  { name: '重疾大病保障', value: 18 },
  { name: '意外伤害责任/伤残', value: 12 },
  { name: '津贴赔付', value: 7 },
]

const COLORS = ['#3b82f6', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf', '#818cf8']

const CoverageTreemap: React.FC<{ data?: CoverageSceneItem[] }> = ({ data: propData }) => {
  const sceneData = propData || defaultData

  const option: EChartsOption = {
    tooltip: {
      formatter: (params: any) => `被调用 ${params.value} 万次`,
    },
    series: [{
      type: 'treemap',
      data: sceneData.map((item, i) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: COLORS[i % COLORS.length] },
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
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: '#3b82f6',
          borderRadius: 10,
          marginRight: 10,
        }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>
          覆盖场景分布
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 350 }} />
    </div>
  )
}

export default CoverageTreemap

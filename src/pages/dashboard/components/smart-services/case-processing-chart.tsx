import React, { useRef, useEffect, useState } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { DatePicker, Select } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)
import type { PickerMode } from 'rc-picker/lib/interface'

const agents = ['数采智能体', '定责智能体', '剔费智能体', '理算智能体', '审核智能体']

const metrics = [
  { id: 'tokens', name: 'Tokens使用量', unit: '万' },
  { id: 'totalCases', name: '处理案件数', unit: '件' },
  { id: 'totalCalls', name: '服务调用数', unit: '次' },
  { id: 'successRate', name: '调用成功率', unit: '%' },
  { id: 'avgTime', name: '平均处理时长', unit: '秒' },
  { id: 'autoRate', name: '自动化率', unit: '%' },
]

/** 每个智能体各指标的基准值（5个智能体） */
const baseValues: Record<string, number[]> = {
  tokens: [8.5, 3.2, 2.1, 5.8, 4.3],
  totalCases: [2800, 1800, 1400, 4800, 5000],
  totalCalls: [6200, 3500, 2800, 9100, 7600],
  successRate: [96.2, 94.8, 97.1, 95.5, 96.8],
  avgTime: [12, 45, 10, 20, 30],
  autoRate: [92.3, 87.5, 91.8, 85.6, 92.1],
}

const colorPalette = ['#c1c9d2', '#409eff', '#fa8c16', '#f5222d', '#722ed1', '#06b6d4', '#84cc16', '#f59e0b', '#ec4899', '#14b8a6']

/** 种子哈希 */
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/** 伪随机 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 137.3 + 271.9) * 43758.5453
  return x - Math.floor(x)
}

/** 根据粒度类型生成X轴标签 */
function generateLabels(period: PeriodType, start: Dayjs, end: Dayjs): string[] {
  const labels: string[] = []
  const diff = end.diff(start, 'day')

  if (period === 'day') {
    const maxDays = 30
    const days = Math.min(diff + 1, maxDays)
    const step = diff >= maxDays ? Math.ceil((diff + 1) / maxDays) : 1
    for (let i = 0; i < days; i++) {
      const d = start.add(i * step, 'day')
      labels.push(`${d.month() + 1}月${d.date()}日`)
    }
  } else if (period === 'week') {
    const weekStart = start.startOf('week')
    const weekEnd = end.endOf('week')
    const weeks = weekEnd.diff(weekStart, 'week') + 1
    const maxWeeks = 12
    const step = weeks > maxWeeks ? Math.ceil(weeks / maxWeeks) : 1
    for (let i = 0; i < weeks; i += step) {
      const w = weekStart.add(i, 'week')
      labels.push(`第${w.week()}周`)
      if (labels.length >= maxWeeks) break
    }
  } else {
    const months = end.diff(start, 'month') + 1
    const maxMonths = 12
    const step = months > maxMonths ? Math.ceil(months / maxMonths) : 1
    for (let i = 0; i < months; i += step) {
      const m = start.add(i, 'month')
      labels.push(`${m.month() + 1}月`)
    }
  }
  return labels
}

/** 生成mock数据矩阵 */
function generateMockData(metricId: string, period: PeriodType, start: Dayjs, end: Dayjs): number[][] {
  const labels = generateLabels(period, start, end)
  const count = labels.length
  const seed = hashSeed(`${metricId}-${period}-${start.format('YYYYMMDD')}-${end.format('YYYYMMDD')}`)
  const base = baseValues[metricId] || baseValues.total

  return labels.map((_, idx) => {
    const progress = count <= 1 ? 1 : idx / (count - 1)
    return base.map((val, agentIdx) => {
      const noise = (seededRandom(seed, idx * 5 + agentIdx) - 0.5) * val * 0.3
      const trend = val * (0.5 + progress * 0.5) + noise
      if (['totalCases', 'tokens', 'totalCalls'].includes(metricId)) {
        return Math.max(0, Math.round(trend))
      }
      return Math.max(0, Number(trend.toFixed(1)))
    })
  })
}

const periodLabels: Record<PeriodType, string> = { day: '按天', week: '按周', month: '按月' }
type PeriodType = 'day' | 'week' | 'month'

const CaseProcessingChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [currentMetric, setCurrentMetric] = useState('tokens')
  const [granularity, setGranularity] = useState<PeriodType>('day')
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs('2026-04-01'), dayjs('2026-04-30')])

  React.useEffect(() => {
    const defaults: Record<PeriodType, [Dayjs, Dayjs]> = {
      day: [dayjs('2026-04-01'), dayjs('2026-04-30')],
      week: [dayjs('2026-03-02'), dayjs('2026-04-05')],
      month: [dayjs('2026-01-01'), dayjs('2026-05-31')],
    }
    setDateRange(defaults[granularity])
  }, [granularity])

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)
    window.addEventListener('resize', () => chartInstance.current?.resize())
    return () => {
      window.removeEventListener('resize', () => chartInstance.current?.resize())
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!chartInstance.current) return

    const metric = metrics.find(m => m.id === currentMetric)
    const labels = generateLabels(granularity, dateRange[0], dateRange[1])
    const dataMatrix = generateMockData(currentMetric, granularity, dateRange[0], dateRange[1])

    // 转置数据：X轴=日期，每条线=一个智能体
    const seriesData: echarts.LineSeriesOption[] = agents.map((agent, agentIdx) => ({
      name: agent,
      type: 'line',
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: colorPalette[agentIdx % colorPalette.length] },
      lineStyle: { width: 2 },
      data: dataMatrix.map(row => row[agentIdx]),
      z: 2,
    }))

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: '#333' },
        extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 10px;',
      },
      legend: {
        data: agents,
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#64748b', fontSize: 13 },
        itemGap: 24,
      },
      grid: {
        top: '12%',
        left: 74,
        right: '4%',
        bottom: 80,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#000000e0', margin: 16, fontWeight: 500, rotate: labels.length > 15 ? 30 : 0 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        name: currentMetric === 'avgTime' ? '平均处理时长（秒）' : `${metric?.name} (${metric?.unit})`,
        nameTextStyle: { color: '#000000e0', fontSize: 13, padding: [0, 30, 10, 0] },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#000000e0',
          fontWeight: 500,
          formatter: ['successRate', 'autoRate'].includes(currentMetric) ? '{value}%' : undefined,
        },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      },
      series: seriesData,
    }

    chartInstance.current.setOption(option, true)
  }, [currentMetric, granularity, dateRange])

  const pickerMode: PickerMode = granularity === 'day' ? 'date' : granularity === 'week' ? 'week' : 'month'
  const displayFormat = granularity === 'day' ? 'YYYY-MM-DD' : granularity === 'week' ? 'YYYY-wo' : 'YYYY-MM'

  return (
    <div style={{
      border: '1px solid #f0f0f0',
      borderRadius: 12,
      padding: '20px 24px 16px',
      background: '#fff',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          background: '#2c3e50',
          color: '#fff',
          borderRadius: 20,
          padding: '8px 20px',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}>
          智能体案件处理情况趋势图
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Select
            value={granularity}
            onChange={setGranularity}
            options={[
              { label: '按天', value: 'day' },
              { label: '按周', value: 'week' },
              { label: '按月', value: 'month' },
            ]}
            style={{ width: 72 }}
            rootClassName="filter-select"
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(values) => {
              if (values && values[0] && values[1]) {
                setDateRange([values[0], values[1]])
              }
            }}
            picker={pickerMode}
            format={displayFormat}
            allowClear={false}
            style={{ fontSize: 13, color: '#64748b' }}
            placeholder={['开始日期', '结束日期']}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        {/* 右侧图表（左对齐） */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div ref={chartRef} style={{ width: '100%', height: 432 }} />
        </div>
        {/* 左侧指标选择器（右对齐） */}
        <div style={{
          width: 140,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
        }}>
          {metrics.map((metric) => {
            const isActive = metric.id === currentMetric
            return (
              <div
                key={metric.id}
                onClick={() => setCurrentMetric(metric.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid #3b82f6' : '1px solid transparent',
                  background: isActive ? '#eff6ff' : '#f3f4f6',
                  boxShadow: isActive ? '0 4px 6px -1px rgba(59,130,246,0.1), 0 2px 4px -1px rgba(59,130,246,0.06)' : 'none',
                  textAlign: 'center',
                  fontSize: 14,
                  color: isActive ? '#1d2937' : '#1d2937',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {metric.name}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CaseProcessingChart

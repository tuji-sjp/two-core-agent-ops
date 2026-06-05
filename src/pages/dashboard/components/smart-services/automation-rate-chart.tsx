import React, { useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { DatePicker } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)
import type { PickerMode } from 'rc-picker/lib/interface'

const agents = ['预受理智能体', '数采智能体', '定责智能体', '剔费智能体', '理算智能体', '审核智能体']
const targetValues = [100, 35, 15, 45, 55, 55]

/** 每个智能体的基准值（最新一期的数据） */
const agentBaseValues = [98, 35, 15, 45, 55, 55]

/** 种子哈希，根据日期范围生成确定性随机数 */
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/** 伪随机数生成器，基于种子 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** 根据粒度类型生成X轴标签 */
function generateLabels(period: PeriodType, start: Dayjs, end: Dayjs): string[] {
  const labels: string[] = []
  const diff = end.diff(start, 'day')

  if (period === 'day') {
    // 最多取30天，超出则采样
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
    let count = 0
    for (let i = 0; i < weeks; i += step) {
      const w = weekStart.add(i, 'week')
      const weekNum = w.week()
      labels.push(`第${weekNum}周`)
      count++
      if (count >= maxWeeks) break
    }
  } else {
    // month
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

/** 生成mock数据：每行一个X轴时间点，每列一个智能体 */
function generateMockData(period: PeriodType, start: Dayjs, end: Dayjs): number[][] {
  const labels = generateLabels(period, start, end)
  const count = labels.length
  const seed = hashSeed(`${period}-${start.format('YYYYMMDD')}-${end.format('YYYYMMDD')}`)

  // 根据时间远近，越近越接近基准值
  return labels.map((_, idx) => {
    const progress = count <= 1 ? 1 : idx / (count - 1) // 0~1，0最早，1最新
    return agentBaseValues.map((base, agentIdx) => {
      const noise = (seededRandom(seed, idx * 6 + agentIdx) - 0.5) * 30
      const trend = base * progress + noise * (1 - progress * 0.7)
      return Math.max(0, Math.min(100, Math.round(trend)))
    })
  })
}

const periodLabels: Record<PeriodType, string> = { day: '按天', week: '按周', month: '按月' }
type PeriodType = 'day' | 'week' | 'month'

const colorPalette = ['#cbd5e1', '#94a3b8', '#fb923c', '#f43f5e', '#6366f1', '#06b6d4', '#84cc16', '#f59e0b', '#ec4899', '#6366f1']

const AutomationRateChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [period, setPeriod] = React.useState<PeriodType>('day')
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<[Dayjs, Dayjs]>([dayjs('2026-04-01'), dayjs('2026-04-05')])

  React.useEffect(() => {
    const defaults: Record<PeriodType, [Dayjs, Dayjs]> = {
      day: [dayjs('2026-04-01'), dayjs('2026-04-05')],
      week: [dayjs('2026-03-02'), dayjs('2026-04-05')],
      month: [dayjs('2026-01-01'), dayjs('2026-05-31')],
    }
    setDateRange(defaults[period])
  }, [period])

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

    const labels = generateLabels(period, dateRange[0], dateRange[1])
    const dataMatrix = generateMockData(period, dateRange[0], dateRange[1])

    // 转置：按时间点建series，每条线一个时间点
    const widths = [2, 2, 3, 3, 3]
    const sizes = [6, 6, 8, 8, 10]

    const lines: echarts.LineSeriesOption[] = labels.map((label, idx) => ({
      name: label,
      type: 'line',
      smooth: true,
      data: dataMatrix[idx],
      lineStyle: { width: widths[idx % widths.length], color: colorPalette[idx % colorPalette.length] },
      itemStyle: idx === labels.length - 1
        ? { color: colorPalette[idx % colorPalette.length], borderWidth: 2, borderColor: '#fff' }
        : { color: colorPalette[idx % colorPalette.length] },
      symbol: 'circle',
      symbolSize: sizes[idx % sizes.length],
      z: idx + 2,
    }))

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(238, 242, 246, 0.4)' } },
        valueFormatter: (value: any) => value + '%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155' },
      },
      legend: {
        data: labels.length > 7
          ? [{ name: '年度目标值 (覆盖面积)', icon: 'rect', itemStyle: { color: '#7dd3fc', opacity: 1 } }]
          : [
              { name: '年度目标值 (覆盖面积)', icon: 'rect', itemStyle: { color: '#7dd3fc', opacity: 1 } },
              ...labels,
            ],
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 16,
        textStyle: { color: '#64748b', fontSize: 13 },
      },
      grid: { left: 74, right: '4%', bottom: 70, top: '8%' },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: agents,
        axisLabel: { interval: 0, color: '#475569', fontWeight: 500, margin: 16 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        name: '自动化率 (%)',
        max: 100,
        nameTextStyle: { color: '#64748b', fontSize: 13, padding: [0, 30, 10, 0] },
        axisLabel: { color: '#94a3b8', formatter: '{value}%' },
        splitLine: { lineStyle: { type: 'dashed' as const, color: '#f1f5f9' } },
      },
      series: [
        {
          name: '年度目标值 (覆盖面积)',
          type: 'line',
          step: 'middle' as const,
          data: targetValues,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(14, 165, 233, 0.35)' },
              { offset: 1, color: 'rgba(14, 165, 233, 0.05)' },
            ]),
          },
          lineStyle: { color: '#0ea5e9', width: 2, type: 'dashed' as const },
          itemStyle: { color: '#0ea5e9', opacity: 0 },
          symbol: 'none',
          z: 1,
        },
        ...lines,
      ],
    }

    chartInstance.current.setOption(option, true)
  }, [period, dateRange])

  const pickerMode: PickerMode = period === 'day' ? 'date' : period === 'week' ? 'week' : 'month'
  const displayFormat = period === 'day' ? 'YYYY-MM-DD' : period === 'week' ? 'YYYY-wo' : 'YYYY-MM'

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
        marginBottom: 12,
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
          智能体自动化率变化趋势图
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: 64, height: 32, padding: '0 10px',
                border: '1px solid #e2e8f0', borderRadius: 6,
                background: '#fff', fontSize: 13, color: '#334155',
                cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                boxSizing: 'border-box',
              }}
            >
              <span>{periodLabels[period]}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                width: 64, background: '#fff', border: '1px solid #f1f5f9',
                borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden', zIndex: 10,
              }}>
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setDropdownOpen(false) }}
                    style={{
                      width: '100%', padding: '6px 0', textAlign: 'center',
                      fontSize: 13, border: 'none', cursor: 'pointer',
                      background: period === p ? '#10b981' : 'transparent',
                      color: period === p ? '#fff' : '#475569',
                    }}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            )}
          </div>
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
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
        <span style={{
          display: 'inline-block', width: 12, height: 12,
          background: 'rgba(56, 189, 248, 0.5)', borderRadius: 10,
          marginRight: 4, verticalAlign: 'middle',
        }} />
        背景阶梯覆盖面积代表各智能体<strong style={{ color: '#334155' }}>年度目标值</strong>，彩色折线代表<strong style={{ color: '#334155' }}>每日实际达成趋势</strong>。
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 470 }} />
    </div>
  )
}

export default AutomationRateChart

import { useState, useEffect } from 'react'
import type { CityData } from './ChinaMapPanel'
import { MOCK_CITIES } from './ChinaMapPanel'

interface SortedCity extends CityData {
  rate: string
  rateValue: number
}

const CityStatsTable: React.FC = () => {
  const [data, setData] = useState<SortedCity[]>([])
  const [sortField, setSortField] = useState<'totalCases' | 'completedCases' | 'rateValue'>('totalCases')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const sorted = MOCK_CITIES.map((c) => ({
      ...c,
      rate: `${((c.completedCases / c.totalCases) * 100).toFixed(1)}%`,
      rateValue: (c.completedCases / c.totalCases) * 100,
    }))
      .sort((a, b) => {
        const av = a[sortField]
        const bv = b[sortField]
        return sortDir === 'desc'
          ? (bv as number) - (av as number)
          : (av as number) - (bv as number)
      })
    setData(sorted)
  }, [sortField, sortDir])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortIndicator = (field: typeof sortField) => {
    if (sortField !== field) return ' ↕'
    return sortDir === 'desc' ? ' ↓' : ' ↑'
  }

  const rateColor = (val: number) => {
    if (val >= 95) return '#52c41a'
    if (val >= 90) return '#1677ff'
    if (val >= 85) return '#faad14'
    return '#ff4d4f'
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
        fontSize: 14,
        fontWeight: 600,
        color: '#00d4ff',
        letterSpacing: 1,
      }}>
        城市案件统计
      </div>

      {/* 表头 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 1fr 1fr',
        padding: '8px 16px',
        background: 'rgba(0, 212, 255, 0.06)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
        fontSize: 12,
        color: 'rgba(224, 231, 255, 0.6)',
      }}>
        <span>城市</span>
        <span
          onClick={() => handleSort('totalCases')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          案件总数{sortIndicator('totalCases')}
        </span>
        <span
          onClick={() => handleSort('completedCases')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          已完成{sortIndicator('completedCases')}
        </span>
        <span
          onClick={() => handleSort('rateValue')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          解决率{sortIndicator('rateValue')}
        </span>
      </div>

      {/* 数据行 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {data.map((row, i) => (
          <div
            key={row.city}
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr 1fr 1fr',
              padding: '8px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              fontSize: 13,
              color: 'rgba(224, 231, 255, 0.85)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(0, 212, 255, 0.02)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(0, 212, 255, 0.02)' }}
          >
            <span style={{ fontWeight: 500 }}>{row.city}</span>
            <span style={{ color: '#e0e7ff', fontWeight: 600 }}>{row.totalCases.toLocaleString()}</span>
            <span style={{ color: '#52c41a' }}>{row.completedCases.toLocaleString()}</span>
            <span>
              <span
                style={{
                  color: rateColor(row.rateValue),
                  fontWeight: 600,
                  fontSize: 12,
                  background: `${rateColor(row.rateValue)}18`,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {row.rate}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* 底部汇总 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr 1fr 1fr',
        padding: '10px 16px',
        borderTop: '1px solid rgba(0, 212, 255, 0.2)',
        background: 'rgba(0, 212, 255, 0.04)',
        fontSize: 13,
        fontWeight: 600,
        color: '#00d4ff',
      }}>
        <span>合计</span>
        <span>{data.reduce((s, c) => s + c.totalCases, 0).toLocaleString()}</span>
        <span>{data.reduce((s, c) => s + c.completedCases, 0).toLocaleString()}</span>
        <span>{((data.reduce((s, c) => s + c.completedCases, 0) / data.reduce((s, c) => s + c.totalCases, 0)) * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default CityStatsTable

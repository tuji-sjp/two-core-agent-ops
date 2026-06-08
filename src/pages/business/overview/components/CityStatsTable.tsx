import { useState, useEffect } from 'react'
import type { CityData } from './ChinaMapPanel'
import { MOCK_CITIES } from './ChinaMapPanel'

interface SortedCity extends CityData { rate: string; rateValue: number }

const CityStatsTable: React.FC = () => {
  const [data, setData] = useState<SortedCity[]>([])
  const [sortField, setSortField] = useState<'totalCases' | 'completedCases' | 'rateValue'>('totalCases')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const sorted = MOCK_CITIES.map((c) => ({
      ...c, rate: `${((c.completedCases / c.totalCases) * 100).toFixed(1)}%`,
      rateValue: (c.completedCases / c.totalCases) * 100,
    })).sort((a, b) => sortDir === 'desc' ? (b[sortField] as number) - (a[sortField] as number) : (a[sortField] as number) - (b[sortField] as number))
    setData(sorted)
  }, [sortField, sortDir])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortField(field); setSortDir('desc') }
  }
  const sortIndicator = (field: typeof sortField) => sortField !== field ? ' ↕' : sortDir === 'desc' ? ' ↓' : ' ↑'
  const rateColor = (val: number) => val >= 95 ? '#52c41a' : val >= 90 ? '#1677ff' : val >= 85 ? '#faad14' : '#ff4d4f'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 15, fontWeight: 700, color: '#1f2937' }}>
        地区案件统计
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',  background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 11, color: '#9ca3af', padding: '7px 14px' }}>
        <span>城市</span>
        <span onClick={() => handleSort('totalCases')} style={{ cursor: 'pointer', userSelect: 'none' }}>案件总数{sortIndicator('totalCases')}</span>
        <span onClick={() => handleSort('completedCases')} style={{ cursor: 'pointer', userSelect: 'none' }}>已完成{sortIndicator('completedCases')}</span>
        <span onClick={() => handleSort('rateValue')} style={{ cursor: 'pointer', userSelect: 'none' }}>解决率{sortIndicator('rateValue')}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {data.map((row, i) => (
          <div key={row.city} style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', padding: '7px 14px',
            borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#374151',
            background: i % 2 === 0 ? '#fff' : '#fff',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fff' }}
          >
            <span style={{ fontWeight: 500 }}>{row.city}</span>
            <span style={{ color: '#1f2937', fontWeight: 600 }}>{row.totalCases.toLocaleString()}</span>
            <span style={{ color: '#10b981' }}>{row.completedCases.toLocaleString()}</span>
            <span><span style={{ color: rateColor(row.rateValue), fontWeight: 600, fontSize: 11, borderRadius: 4 }}>{row.rate}</span></span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', padding: '8px 14px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
        <span>合计</span>
        <span>{data.reduce((s, c) => s + c.totalCases, 0).toLocaleString()}</span>
        <span>{data.reduce((s, c) => s + c.completedCases, 0).toLocaleString()}</span>
        <span>{((data.reduce((s, c) => s + c.completedCases, 0) / data.reduce((s, c) => s + c.totalCases, 0)) * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default CityStatsTable

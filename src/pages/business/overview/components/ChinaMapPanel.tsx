import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from '@ant-design/icons'

export interface CityData {
  city: string
  province: string
  lat: number
  lng: number
  totalCases: number
  completedCases: number
}

const MOCK_CITIES: CityData[] = [
  { city: '北京', province: '北京', lat: 39.9042, lng: 116.4074, totalCases: 342, completedCases: 318 },
  { city: '上海', province: '上海', lat: 31.2304, lng: 121.4737, totalCases: 486, completedCases: 461 },
  { city: '广州', province: '广东', lat: 23.1291, lng: 113.2644, totalCases: 521, completedCases: 489 },
  { city: '深圳', province: '广东', lat: 22.5431, lng: 114.0579, totalCases: 398, completedCases: 372 },
  { city: '成都', province: '四川', lat: 30.5728, lng: 104.0668, totalCases: 267, completedCases: 245 },
  { city: '杭州', province: '浙江', lat: 30.2741, lng: 120.1551, totalCases: 312, completedCases: 298 },
  { city: '武汉', province: '湖北', lat: 30.5928, lng: 114.3055, totalCases: 234, completedCases: 212 },
  { city: '西安', province: '陕西', lat: 34.3416, lng: 108.9398, totalCases: 189, completedCases: 171 },
  { city: '重庆', province: '重庆', lat: 29.5630, lng: 106.5516, totalCases: 276, completedCases: 251 },
  { city: '南京', province: '江苏', lat: 32.0603, lng: 118.7969, totalCases: 298, completedCases: 281 },
  { city: '天津', province: '天津', lat: 39.3434, lng: 117.3616, totalCases: 167, completedCases: 152 },
  { city: '长沙', province: '湖南', lat: 28.2282, lng: 112.9388, totalCases: 198, completedCases: 179 },
  { city: '郑州', province: '河南', lat: 34.7466, lng: 113.6253, totalCases: 176, completedCases: 158 },
  { city: '济南', province: '山东', lat: 36.6512, lng: 117.1209, totalCases: 154, completedCases: 140 },
  { city: '沈阳', province: '辽宁', lat: 41.8057, lng: 123.4315, totalCases: 132, completedCases: 118 },
  { city: '哈尔滨', province: '黑龙江', lat: 45.8038, lng: 126.5340, totalCases: 98, completedCases: 87 },
  { city: '长春', province: '吉林', lat: 43.8171, lng: 125.3235, totalCases: 87, completedCases: 78 },
  { city: '昆明', province: '云南', lat: 25.0406, lng: 102.7125, totalCases: 143, completedCases: 129 },
  { city: '贵阳', province: '贵州', lat: 26.6470, lng: 106.6302, totalCases: 112, completedCases: 101 },
  { city: '南宁', province: '广西', lat: 22.8170, lng: 108.3665, totalCases: 126, completedCases: 113 },
  { city: '福州', province: '福建', lat: 26.0745, lng: 119.2965, totalCases: 167, completedCases: 152 },
  { city: '合肥', province: '安徽', lat: 31.8206, lng: 117.2272, totalCases: 145, completedCases: 131 },
  { city: '南昌', province: '江西', lat: 28.6829, lng: 115.8579, totalCases: 118, completedCases: 106 },
  { city: '石家庄', province: '河北', lat: 38.0428, lng: 114.5149, totalCases: 134, completedCases: 121 },
  { city: '太原', province: '山西', lat: 37.8706, lng: 112.5489, totalCases: 96, completedCases: 86 },
  { city: '呼和浩特', province: '内蒙古', lat: 40.8414, lng: 111.7519, totalCases: 67, completedCases: 59 },
  { city: '兰州', province: '甘肃', lat: 36.0611, lng: 103.8343, totalCases: 78, completedCases: 70 },
  { city: '西宁', province: '青海', lat: 36.6171, lng: 101.7782, totalCases: 43, completedCases: 38 },
  { city: '银川', province: '宁夏', lat: 38.4872, lng: 106.2309, totalCases: 52, completedCases: 47 },
  { city: '乌鲁木齐', province: '新疆', lat: 43.8256, lng: 87.6168, totalCases: 89, completedCases: 80 },
  { city: '拉萨', province: '西藏', lat: 29.6500, lng: 91.1409, totalCases: 31, completedCases: 27 },
  { city: '海口', province: '海南', lat: 20.0444, lng: 110.1999, totalCases: 76, completedCases: 69 },
]

function getCaseColor(count: number): string {
  if (count >= 400) return '#ff4d4f'
  if (count >= 300) return '#fa8c16'
  if (count >= 200) return '#fadb14'
  if (count >= 100) return '#52c41a'
  return '#1677ff'
}

const DEFAULT_CENTER = [104.5, 33.5]
const DEFAULT_ZOOM = 1.3
const ZOOM_STEP = 0.3
const MIN_ZOOM = 0.8
const MAX_ZOOM = 4.0

const btnBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, border: '1px solid #e5e7eb',
  borderRadius: 4, background: '#fff',
  color: '#6b7280', cursor: 'pointer', fontSize: 14,
  transition: 'all 0.15s',
}

const ChinaMapPanel: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const applyZoom = useCallback((newZoom: number) => {
    if (!chartInstance.current) return
    chartInstance.current.setOption({ geo: { zoom: newZoom, center: DEFAULT_CENTER } })
    setZoom(newZoom)
  }, [])

  const zoomIn = useCallback(() => applyZoom(Math.min(MAX_ZOOM, +(zoom + ZOOM_STEP).toFixed(2))), [applyZoom, zoom])
  const zoomOut = useCallback(() => applyZoom(Math.max(MIN_ZOOM, +(zoom - ZOOM_STEP).toFixed(2))), [applyZoom, zoom])
  const resetView = useCallback(() => applyZoom(DEFAULT_ZOOM), [applyZoom])

  const initChart = useCallback((geoJson: any) => {
    echarts.registerMap('china', geoJson)
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151', fontSize: 13 },
        formatter: (params: any) => {
          if (params.seriesName === '城市') {
            return `<div style="font-weight:600;font-size:14px;margin-bottom:6px">${params.name}</div><div>处理中案件: <b>${params.data.count}</b></div>`
          }
          if (params.seriesName === '涟漪') {
            return `<div style="font-weight:600;font-size:14px;margin-bottom:6px">${params.name}</div><div>处理中案件: <b>${params.data.value[2]}</b></div>`
          }
          return params.name ?? ''
        },
      },
      visualMap: {
        type: 'piecewise' as const, show: true, left: 16, bottom: 16,
        orient: 'vertical' as const,
        pieces: [
          { gte: 400, label: '>=400 件', color: '#ff4d4f' },
          { gte: 300, lt: 400, label: '300-399 件', color: '#fa8c16' },
          { gte: 200, lt: 300, label: '200-299 件', color: '#fadb14' },
          { gte: 100, lt: 200, label: '100-199 件', color: '#52c41a' },
          { lt: 100, label: '<100 件', color: '#1677ff' },
        ],
        textStyle: { color: '#6b7280', fontSize: 11 },
        itemWidth: 14, itemHeight: 14, itemGap: 8, borderColor: 'transparent',
      },
      geo: {
        map: 'china', roam: true, center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM,
        label: { show: true, color: '#9ca3af', fontSize: 9, fontWeight: 400 },
        itemStyle: {
          areaColor: '#f3f4f6', borderColor: '#d1d5db', borderWidth: 0.8,
        },
        emphasis: {
          itemStyle: { areaColor: '#dbeafe', borderColor: '#3b82f6', borderWidth: 1.2 },
          label: { show: true, color: '#1f2937', fontSize: 10 },
        },
      },
      series: [
        {
          name: '城市', type: 'scatter', coordinateSystem: 'geo',
          data: MOCK_CITIES.map((c) => ({ name: c.city, value: [c.lng, c.lat, c.totalCases], count: c.totalCases })),
          symbolSize: (val) => Math.max(5, Math.min(14, Math.sqrt(val[2]) * 0.8)),
          label: {
            show: true, formatter: (p: any) => `${p.data.count}\n${p.name}`,
            position: 'top', color: '#374151', fontSize: 11, fontWeight: 700, lineHeight: 14, align: 'center',
          },
          itemStyle: { color: (p: any) => getCaseColor(p.data.count) },
          emphasis: { scale: true, label: { show: true, color: '#1f2937', fontSize: 13, fontWeight: 700 } },
          zlevel: 1,
        },
        {
          name: '涟漪', type: 'effectScatter', coordinateSystem: 'geo',
          data: MOCK_CITIES.filter((c) => c.totalCases >= 200).map((c) => ({ name: c.city, value: [c.lng, c.lat, c.totalCases] })),
          symbolSize: 10, showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke', scale: 4, period: 3, number: 3 },
          label: { show: false },
          itemStyle: { color: 'rgba(59, 130, 246, 0.6)' },
          zlevel: 2,
        },
      ],
    }
    chartInstance.current?.setOption(option)
    setTimeout(() => chartInstance.current?.resize(), 50)
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then((r) => { if (!r.ok) throw new Error(`CDN ${r.status}`); return r.json() })
      .then((geoJson) => { initChart(geoJson) })
      .catch(() => {
        fetch('/china.json')
          .then((r) => { if (!r.ok) throw new Error(`Local ${r.status}`); return r.json() })
          .then((geoJson) => { initChart(geoJson) })
          .catch(() => { setError('地图数据加载失败') })
      })

    return () => { window.removeEventListener('resize', handleResize); chartInstance.current?.dispose(); chartInstance.current = null }
  }, [initChart])

  const btnHover = (e: React.MouseEvent) => { (e.currentTarget as HTMLDivElement).style.background = '#f0f7ff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6' }
  const btnLeave = (e: React.MouseEvent) => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb' }

  if (error) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4f', fontSize: 13 }}>{error}</div>
  }

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: "800px", height: '100%' }}>
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div onClick={zoomIn} style={btnBase} onMouseEnter={btnHover} onMouseLeave={btnLeave} title="放大"><ZoomInOutlined style={{ fontSize: 14 }} /></div>
        <div onClick={zoomOut} style={btnBase} onMouseEnter={btnHover} onMouseLeave={btnLeave} title="缩小"><ZoomOutOutlined style={{ fontSize: 14 }} /></div>
        <div onClick={resetView} style={{ ...btnBase, marginTop: 4 }} onMouseEnter={btnHover} onMouseLeave={btnLeave} title="重置"><ReloadOutlined style={{ fontSize: 12 }} /></div>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export { MOCK_CITIES }
export default ChinaMapPanel

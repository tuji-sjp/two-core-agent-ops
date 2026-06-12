import { useRef, useEffect, useState, useCallback } from 'react'

interface VirtualCase {
  id: string
  caseNo: string
  city: string
  scene: string
  status: string
  agent: string
  amount: string
  updatedAt: string
}

const SCENES = ['医疗险理赔', '重疾险理赔', '意外险理赔', '车险理赔', '新契约核保', '健康险二核质检', '欺诈识别']
const STATUSES = ['处理中', '待人工复核', '已完成', '异常']
const AGENTS = ['采集智能体', '立案智能体', '扣费智能体', '理算智能体', '审核智能体', '核保评估智能体', '核保质检智能体', '欺诈识别智能体']
const CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安', '重庆', '南京', '天津', '长沙', '郑州', '济南', '福州']
const AMOUNTS = ['¥1,280', '¥3,500', '¥8,920', '¥15,600', '¥22,300', '¥45,000', '¥67,800', '¥120,000', '¥5,200', '¥31,400']

let caseIdCounter = 0
function generateCase(): VirtualCase {
  caseIdCounter++
  const now = new Date()
  now.setSeconds(now.getSeconds() - Math.floor(Math.random() * 300))
  return {
    id: `vc-${caseIdCounter}`,
    caseNo: `${['CLS', 'UW', 'AF'][Math.floor(Math.random() * 3)]}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    city: CITIES[Math.floor(Math.random() * CITIES.length)],
    scene: SCENES[Math.floor(Math.random() * SCENES.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    agent: AGENTS[Math.floor(Math.random() * AGENTS.length)],
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    updatedAt: now.toLocaleTimeString('zh-CN'),
  }
}

const INITIAL_CASES = Array.from({ length: 50 }, () => generateCase())

const statusColor = (status: string) => {
  if (status.includes('完成') || status.includes('通过') || status.includes('结案')) return '#52c41a'
  if (status.includes('异常') || status.includes('驳回') || status.includes('预警')) return '#ff4d4f'
  if (status.includes('待') || status.includes('审核')) return '#faad14'
  return '#3b82f6'
}

const ScrollingCases: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [cases, setCases] = useState<VirtualCase[]>(INITIAL_CASES)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCases((prev) => { const nc = generateCase(); const u = [nc, ...prev]; return u.slice(0, 200) })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const startAutoScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const step = () => {
      if (el.scrollTop >= el.scrollHeight - el.clientHeight - 2) el.scrollTop = 0
      else el.scrollTop += 0.5
      // else el.scrollTop += 0
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => { startAutoScroll(); return () => cancelAnimationFrame(animRef.current) }, [startAutoScroll])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>实时案件流</span>
        <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52c41a', boxShadow: '0 0 4px #52c41a', animation: 'pulse 1.5s ease-in-out infinite' }} />
          实时更新中 · {cases.length} 条
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', padding: '8px 0', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#1d2937' }}>
        <span style={{ padding: '0 6px' }}>案件编号</span><span style={{ padding: '0 6px' }}>城市</span><span style={{ padding: '0 6px' }}>应用场景</span><span style={{ padding: '0 6px' }}>处理Agent</span><span style={{ padding: '0 6px' }}>状态</span><span style={{ textAlign: 'right', padding: '0 6px' }}>金额</span>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflow: 'hidden' }}>
        <div>{cases.map((c) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', padding: '8px 0',
            borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#6b7280',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
          >
            <span style={{ color: '#1f2937', fontFamily: 'monospace', padding: '0 6px', wordBreak: 'break-all' }}>{c.caseNo}</span>
            <span style={{ padding: '0 6px' }}>{c.city}</span>
            <span style={{ padding: '0 6px' }}>{c.scene}</span>
            <span style={{ color: '#3b82f6',padding: '0 6px' }}>{c.agent}</span>
            <span style={{ color: statusColor(c.status), padding: '0 6px' }}>{c.status}</span>
            <span style={{ textAlign: 'right', color: '#1f2937', fontWeight: 500, padding: '0 6px' }}>{c.amount}</span>
          </div>
        ))}</div>
      </div>
    </div>
  )
}

export default ScrollingCases

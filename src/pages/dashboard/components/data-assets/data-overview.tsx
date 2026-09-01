import React, { useState, useEffect, useRef, useCallback } from 'react'

// ========== Mock 数据 ==========
const INITIAL_DATA = {
  root: {
    title: '影像数据',
    categories: 4,
    subCategories: '95',
    daily: 1520,
  },
  policy: {
    title: '在线电子保单',
    total: 328500,
    daily: 2180,
  },
  cases: {
    title: '涉案数量',
    total: 186500,
    daily: 980,
  },
  bottom: [
    { title: '票据类', total: 42500, daily: 280 },
    { title: '病历类', total: 88200, daily: 520 },
    { title: '证件类', total: 55000, daily: 350 },
    { title: '其它类', total: 56000, daily: 370 },
  ],
}

// 计算影像数据总数（四类之和）
const getRootTotal = (bottom: typeof INITIAL_DATA.bottom) =>
  bottom.reduce((sum, item) => sum + item.total, 0)

// ========== 样式 ==========
const containerStyle: React.CSSProperties = {
  position: 'relative',
}

const treeWrapperStyle: React.CSSProperties = {
  position: 'relative',
}

const topAreaStyle: React.CSSProperties = {
  position: 'relative',
  height: 120,
  marginBottom: 50,
}

const mainCardStyle: React.CSSProperties = {
  background: '#eff6ff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '20px 32px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(48,103,179,0.12)',
  width: 220,
  margin: '0 auto',
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: 12,
}

const cardNumberStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  color: '#3067b3',
  lineHeight: 1.2,
}

const cardUnitStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: '#1f2937',
  marginLeft: 4,
}

const cardDailyStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#6b7280',
  marginTop: 10,
}

const cardDailyNumberStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#ea580c',
}

// 中间层：影像类别 + 涉案数量
const middleRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 80,
  marginBottom: 40,
  position: 'relative',
  zIndex: 2,
}

const middleCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '14px 24px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(48,103,179,0.12)',
  minWidth: 180,
}

const middleTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: 8,
}

const middleNumberStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  color: '#3067b3',
  lineHeight: 1.3,
}

const middleSubNumberStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  color: '#3067b3',
}

const middleLabelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: '#1f2937',
  marginLeft: 4,
}

const middleDailyStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#6b7280',
  marginTop: 6,
}

// 底层：四个子分类
const bottomRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 24,
  position: 'relative',
  zIndex: 1,
}

const bottomCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '20px 24px',
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  width: 180,
  flexShrink: 0,
}

const bottomTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: 12,
}

const bottomNumberStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  color: '#3067b3',
  lineHeight: 1.3,
}

const bottomDailyStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#6b7280',
  marginTop: 8,
}

// 在线电子保单卡片样式
const policyCardStyle: React.CSSProperties = {
  background: '#eff6ff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '20px 32px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(48,103,179,0.12)',
  width: 220,
  position: 'absolute',
  top: 0,
}

// ========== 组件 ==========
const DataOverview: React.FC = () => {
  const [data, setData] = useState(INITIAL_DATA)
  const treeRef = useRef<HTMLDivElement>(null)
  const rootCardRef = useRef<HTMLDivElement>(null)
  const bottomCardRefs = useRef<(HTMLDivElement | null)[]>([])

  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([])

  const calculateLines = useCallback(() => {
    if (!treeRef.current || !rootCardRef.current) return

    const treeRect = treeRef.current.getBoundingClientRect()
    const rootRect = rootCardRef.current.getBoundingClientRect()

    const rootCenterX = rootRect.left + rootRect.width / 2 - treeRect.left
    const rootBottomY = rootRect.bottom - treeRect.top

    const newLines = bottomCardRefs.current.map((cardRef) => {
      if (!cardRef) return { x1: 0, y1: 0, x2: 0, y2: 0 }
      const cardRect = cardRef.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2 - treeRect.left
      const cardTopY = cardRect.top - treeRect.top

      return {
        x1: rootCenterX,
        y1: rootBottomY,
        x2: cardCenterX,
        y2: cardTopY,
      }
    })

    setLines(newLines)
  }, [])

  useEffect(() => {
    calculateLines()
    window.addEventListener('resize', calculateLines)
    return () => window.removeEventListener('resize', calculateLines)
  }, [calculateLines])

  // 模拟数据增长
  useEffect(() => {
    const timer = setInterval(() => {
      setData(prev => ({
        ...prev,
        root: {
          ...prev.root,
          daily: prev.root.daily + Math.floor(Math.random() * 3) + 1,
        },
        policy: {
          ...prev.policy,
          total: prev.policy.total + Math.floor(Math.random() * 5) + 1,
          daily: prev.policy.daily + Math.floor(Math.random() * 3) + 1,
        },
        cases: {
          ...prev.cases,
          total: prev.cases.total + Math.floor(Math.random() * 3) + 1,
          daily: prev.cases.daily + Math.floor(Math.random() * 2) + 1,
        },
        bottom: prev.bottom.map(item => ({
          ...item,
          total: item.total + Math.floor(Math.random() * 2) + 1,
          daily: item.daily + Math.floor(Math.random() * 2) + 1,
        })),
      }))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => num.toLocaleString()
  const rootTotal = getRootTotal(data.bottom)

  return (
    <div style={containerStyle}>
      {/* 影像数据树状结构整体 */}
      <div ref={treeRef} style={treeWrapperStyle}>
        {/* SVG 连接线 */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#d1d5db" />
            </marker>
          </defs>
          {lines.map((line, index) => {
            const midY = (line.y1 + line.y2) / 2
            return (
              <path
                key={index}
                d={`M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`}
                stroke="#d1d5db"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            )
          })}
        </svg>

        {/* 顶部：影像数据 */}
        <div style={topAreaStyle}>
          <div ref={rootCardRef} style={mainCardStyle}>
            <div style={cardTitleStyle}>{data.root.title}</div>
            <div>
              <span style={cardNumberStyle}>{formatNumber(rootTotal)}</span>
              <span style={cardUnitStyle}>张</span>
            </div>
            <div style={cardDailyStyle}>
              今日 <span style={{ color: '#ea580c', fontWeight: 600 }}>↑</span> <span style={cardDailyNumberStyle}>{formatNumber(data.root.daily)}</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>张</span>
            </div>
          </div>
        </div>

        {/* 中间层：影像类别 + 涉案数量 */}
        <div style={middleRowStyle}>
          <div style={middleCardStyle}>
            <div style={middleTitleStyle}>影像类别</div>
            <div>
              <span style={middleNumberStyle}>{data.root.categories}</span>
              <span style={middleLabelStyle}>大类</span>
            </div>
            <div>
              <span style={middleSubNumberStyle}>{data.root.subCategories}</span>
              <span style={middleLabelStyle}>小类</span>
            </div>
          </div>
          <div style={middleCardStyle}>
            <div style={middleTitleStyle}>{data.cases.title}</div>
            <div>
              <span style={middleNumberStyle}>{formatNumber(data.cases.total)}</span>
              <span style={cardUnitStyle}>件</span>
            </div>
            <div style={middleDailyStyle}>
              今日 <span style={{ color: '#ea580c', fontWeight: 600 }}>↑</span> <span style={{ fontWeight: 600, color: '#ea580c' }}>{data.cases.daily}</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>件</span>
            </div>
          </div>
        </div>

        {/* 底层：四个子分类 */}
        <div style={bottomRowStyle}>
          {data.bottom.map((item, index) => (
            <div
              key={index}
              ref={(el) => { bottomCardRefs.current[index] = el }}
              style={bottomCardStyle}
            >
              <div style={bottomTitleStyle}>{item.title}</div>
              <div>
                <span style={bottomNumberStyle}>{formatNumber(item.total)}</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#1f2937', marginLeft: 2 }}>张</span>
              </div>
              <div style={bottomDailyStyle}>
                今日 <span style={{ color: '#ea580c', fontWeight: 600 }}>↑</span> <span style={{ fontWeight: 600, color: '#ea580c' }}>{item.daily}</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>张</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 在线电子保单（独立，不属于树状结构） */}
      <div style={{ position: 'absolute', left: '72%', top: 0 }}>
        <div style={policyCardStyle}>
          <div style={cardTitleStyle}>{data.policy.title}</div>
          <div>
            <span style={cardNumberStyle}>{formatNumber(data.policy.total)}</span>
            <span style={cardUnitStyle}>份</span>
          </div>
          <div style={cardDailyStyle}>
            今日 <span style={{ color: '#ea580c', fontWeight: 600 }}>↑</span> <span style={cardDailyNumberStyle}>{formatNumber(data.policy.daily)}</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280', marginLeft: 2 }}>份</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataOverview

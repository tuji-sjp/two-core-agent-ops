import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tag, Table, Pagination, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeftOutlined, CopyOutlined,
} from '@ant-design/icons'
import { getFeeItems, getBillHeader, getMbStandardize, getMbDeduct, getMbStandardizeData, getMbDeductData, getRuleData, getClauseData, getRiskData, getOutputData, getUnreasonableGroups, type FeeItem, type FeeResult, type NodeStatus, type DecisionChain, type StandardizeRow, type DeductRow, type RuleRow, type ClauseRow, type RiskRow, type OutputRow } from './deduction-log-detail-data'

import icoUnreasonable from '../../../assets/icons/不合理类型.svg?raw'
import icoEnd from '../../../assets/icons/结束.svg?raw'
import icoStart from '../../../assets/icons/开始.svg?raw'
import icoChain from '../../../assets/icons/扣费智能体判定决策链.svg?raw'
import icoRule from '../../../assets/icons/商保控费-规则知识判定模块.svg?raw'
import icoClause from '../../../assets/icons/商保控费-条款知识判定模块.svg?raw'
import icoOutput from '../../../assets/icons/输出标化模块.svg?raw'
import icoMbStd from '../../../assets/icons/医保剔费-项目标化模块.svg?raw'
import icoMbDed from '../../../assets/icons/医保剔费-项目剔费模块.svg?raw'
import icoAllItems from '../../../assets/icons/全部项目.svg?raw'
import icoRisk from '../../../assets/icons/风控模块.svg?raw'
import icoShareState from '../../../assets/icons/共享状态.svg?raw'

// SVG path 解析器：正确处理绝对/相对坐标、所有命令（M/L/H/V/C/S/Q/T/A/Z）和隐式重复
// 返回所有锚点（含控制点）的 x/y 数组，用于计算 bounding box
function parsePath(d: string): { xs: number[]; ys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  const tokens: (string | number)[] = []
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(d)) !== null) {
    if (m[1]) tokens.push(m[1])
    else tokens.push(parseFloat(m[2]))
  }
  let i = 0
  let curX = 0, curY = 0, startX = 0, startY = 0, cmd = ''
  const readNum = (): number => (i < tokens.length && typeof tokens[i] === 'number' ? tokens[i++] as number : 0)
  while (i < tokens.length) {
    if (typeof tokens[i] === 'string') { cmd = tokens[i++] as string }
    if (!cmd) break
    const upper = cmd.toUpperCase()
    const rel = cmd !== upper
    while (i < tokens.length && typeof tokens[i] === 'number') {
      if (upper === 'M') {
        const ox = readNum(), oy = readNum()
        curX = rel ? curX + ox : ox; curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
        startX = curX; startY = curY
        cmd = rel ? 'l' : 'L'
      } else if (upper === 'L' || upper === 'T') {
        const ox = readNum(), oy = readNum()
        curX = rel ? curX + ox : ox; curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
      } else if (upper === 'H') {
        const ox = readNum()
        curX = rel ? curX + ox : ox
        xs.push(curX); ys.push(curY)
      } else if (upper === 'V') {
        const oy = readNum()
        curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
      } else if (upper === 'C') {
        const ox1 = readNum(), oy1 = readNum(), ox2 = readNum(), oy2 = readNum(), ox = readNum(), oy = readNum()
        if (rel) {
          xs.push(curX + ox1, curX + ox2, curX + ox); ys.push(curY + oy1, curY + oy2, curY + oy)
          curX += ox; curY += oy
        } else {
          xs.push(ox1, ox2, ox); ys.push(oy1, oy2, oy)
          curX = ox; curY = oy
        }
      } else if (upper === 'S' || upper === 'Q') {
        const ox1 = readNum(), oy1 = readNum(), ox = readNum(), oy = readNum()
        if (rel) {
          xs.push(curX + ox1, curX + ox); ys.push(curY + oy1, curY + oy)
          curX += ox; curY += oy
        } else {
          xs.push(ox1, ox); ys.push(oy1, oy)
          curX = ox; curY = oy
        }
      } else if (upper === 'A') {
        readNum(); readNum(); readNum(); readNum(); readNum()
        const ox = readNum(), oy = readNum()
        curX = rel ? curX + ox : ox; curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
      } else if (upper === 'Z') {
        curX = startX; curY = startY
        xs.push(curX); ys.push(curY)
        break
      } else break
    }
  }
  return { xs, ys }
}

// Icon 组件：traced SVG 通过 ?raw 内联，颜色/大小通过 CSS 控制
// 自动解析 path 的真实内容 bounding box（支持绝对/相对坐标），重映射 viewBox 让内容充满容器
const Icon: React.FC<{ src: string; color: string; size?: number; fillRatio?: number }> = ({ src, color, size = 14, fillRatio = 0.95 }) => {
  const html = useMemo(() => {
    let s = src.replace(/^﻿/, '')

    // 用完整 path parser 计算所有 <path d="..."> 的内容边界框
    const allXs: number[] = []
    const allYs: number[] = []
    const dRegex = /\bd="([^"]+)"/g
    let m: RegExpExecArray | null
    while ((m = dRegex.exec(s)) !== null) {
      const { xs, ys } = parsePath(m[1])
      allXs.push(...xs)
      allYs.push(...ys)
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const x of allXs) { if (x < minX) minX = x; if (x > maxX) maxX = x }
    for (const y of allYs) { if (y < minY) minY = y; if (y > maxY) maxY = y }

    // 计算新 viewBox：让内容占容器的 fillRatio（默认 95%），保持正方形
    let finalViewBox: string | undefined
    if (isFinite(minX) && isFinite(maxX) && maxX > minX && maxY > minY) {
      const cw = maxX - minX
      const ch = maxY - minY
      const maxDim = Math.max(cw, ch)
      const half = maxDim / (2 * fillRatio)
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2
      const vbSize = maxDim / fillRatio
      finalViewBox = `${cx - half} ${cy - half} ${vbSize} ${vbSize}`
    }

    let svgAttrs = ''
    s = s.replace(/<svg\b([^>]*)>/, (_, attrs: string) => {
      svgAttrs = attrs
      return ''
    })
    if (svgAttrs) {
      let a = svgAttrs
        .replace(/\s*width="[^"]*"/, '')
        .replace(/\s*height="[^"]*"/, '')
        .replace(/\s*viewBox="[^"]*"/, '')
      const vb = finalViewBox ? ` viewBox="${finalViewBox}"` : ''
      s = `<svg${a}${vb} width="1em" height="1em">` + s
    }

    s = s.replace(/fill="[^"]+"/g, 'fill="currentColor"')
    s = s.replace(/stroke="[^"]+"/g, 'stroke="currentColor"')
    return s
  }, [src, fillRatio])
  return (
    <span
      style={{ fontSize: size, color, display: 'inline-flex', lineHeight: 1, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

type TabKey = 'items' | 'engine' | 'lic'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'items', label: '扣费项目展示' },
  { key: 'engine', label: '引擎结果' },
  { key: 'lic', label: 'LIC系统响应' },
]

type SidebarMode = 'unreasonable' | 'all'

const resultTagColor: Record<FeeResult, string> = {
  '扣费': 'warning',
  '通过': 'success',
  '转人工': 'error',
}

const DashedCircleIcon = (
  <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" />
  </svg>
)

function statusMeta(status: NodeStatus) {
  if (status === 'skip') return { label: '未执行', color: '#6a727d', bg: '#f3f4f6', border: '#d1d5db', icon: DashedCircleIcon }
  if (status === 'pass') return { label: '已通过', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✓' }
  return { label: '已触发', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', icon: '⚠' }
}

function subNodeStatusMeta(status: NodeStatus) {
  if (status === 'hit') return { label: '已命中', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', icon: '⚠' }
  return { label: '未命中', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✓' }
}

/* ───────── 弹窗全局关闭机制 ───────── */
const popupCloseCallbacks = new Set<() => void>()
function closeAllPopups() { popupCloseCallbacks.forEach(cb => cb()) }

/* ───────── 决策链节点组件 ───────── */

const ChainNodeCard: React.FC<{
  icon: React.ReactNode
  title: string
  subtitle?: string
  status: NodeStatus
  badges?: React.ReactNode
  popupContent?: React.ReactNode
  popupWidth?: number
  children?: React.ReactNode | ((onSubNodeClick: (sub: { name: string; status: NodeStatus; conclusion: string }) => void) => React.ReactNode)
}> = ({ icon, title, subtitle, status, badges, popupContent, popupWidth = 300, children }) => {
  const meta = statusMeta(status)
  const [open, setOpen] = useState(false)
  const [activeSubNode, setActiveSubNode] = useState<{ name: string; status: NodeStatus; conclusion: string } | null>(null)
  const hasPopup = !!popupContent
  useEffect(() => {
    const close = () => { setOpen(false); setActiveSubNode(null) }
    popupCloseCallbacks.add(close)
    return () => { popupCloseCallbacks.delete(close) }
  }, [])
  useEffect(() => {
    if (!open && !activeSubNode) return
    const close = () => { setOpen(false); setActiveSubNode(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open, activeSubNode])
  const handleSubNodeClick = (sub: { name: string; status: NodeStatus; conclusion: string }) => {
    closeAllPopups()
    setActiveSubNode(prev => prev?.name === sub.name ? null : sub)
  }
  return (
    <div style={{ position: 'relative', width: 340 }}>
      <div
        style={{
          cursor: hasPopup ? 'pointer' : 'default',
          borderRadius: 12, border: `1px solid ${meta.border}`, background: meta.bg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s',
        }}
        onClick={e => {
          if (!hasPopup) return
          e.stopPropagation()
          if (open) { setOpen(false) } else { closeAllPopups(); setOpen(true) }
        }}
      >
        <div style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)', flexShrink: 0,
          }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{title}</span>
              <span style={{
                fontSize: 12, fontWeight: 500, color: meta.color,
                background: '#fff', border: `1px solid ${meta.border}`,
                borderRadius: 12, padding: '1px 8px',
              }}>{meta.icon} {meta.label}</span>
            </div>
            {subtitle && <p style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>{subtitle}</p>}
            {badges && <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{badges}</div>}
          </div>
        </div>
        <div>
          {typeof children === 'function' ? children(handleSubNodeClick) : children}
        </div>
      </div>
      {/* 点击弹出信息卡（卡片自身） */}
      {open && hasPopup && (
        <div style={{
          position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
          marginRight: 12, zIndex: 100, width: popupWidth,
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{title}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: meta.color,
                background: meta.bg, border: `1px solid ${meta.border}`,
                borderRadius: 4, padding: '1px 6px',
              }}>{meta.label}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {popupContent}
            </div>
          </div>
        </div>
      )}
      {/* 子节点弹出信息卡（卡片左边上层） */}
      {activeSubNode && (
        <div style={{
          position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
          marginRight: 12, zIndex: 110, width: 280,
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: subNodeStatusMeta(activeSubNode.status).color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{activeSubNode.name}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 500,
                color: subNodeStatusMeta(activeSubNode.status).color,
                background: subNodeStatusMeta(activeSubNode.status).bg,
                border: `1px solid ${subNodeStatusMeta(activeSubNode.status).border}`,
                borderRadius: 4, padding: '1px 6px',
              }}>{subNodeStatusMeta(activeSubNode.status).label}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{activeSubNode.conclusion}</div>
          </div>
        </div>
      )}
    </div>
  )
}

const SubNodeRow: React.FC<{ name: string; status: NodeStatus; onClick?: () => void }> = ({ name, status, onClick }) => {
  const meta = subNodeStatusMeta(status)
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff',
        padding: '6px 10px', transition: 'border-color 0.15s',
      }}
      onClick={e => {
        e.stopPropagation()
        onClick?.()
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.border }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb' }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: '#1f2937', flex: 1 }}>{name}</span>
      <span style={{ fontSize: 12, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
    </div>
  )
}

const Connector: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
    <div style={{ width: 1, height: 28, background: '#3b82f640' }} />
    {label && (
      <span style={{
        position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
        marginLeft: 4, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap',
      }}>{label}</span>
    )}
    <span style={{ marginTop: -2, fontSize: 10, color: '#3b82f680' }}>▼</span>
  </div>
)

const EndPoint: React.FC<{ label: string; fillRatio?: number }> = ({ label, fillRatio }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: '1px solid #3b82f640', background: '#eff6ff',
    borderRadius: 20, padding: '6px 16px',
  }}>
    {<Icon src={label === '开始' ? icoStart : icoEnd} color="#3b82f6" fillRatio={fillRatio} />}
    <span style={{ fontSize: 14, fontWeight: 500, color: '#3b82f6' }}>{label}</span>
  </div>
)

/** 医保剔费-项目标化模块弹窗 */
const StandardizeTable: React.FC<{ row: StandardizeRow }> = ({ row }) => {
  const labelStyle: React.CSSProperties = { fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }
  const valueStyle: React.CSSProperties = { color: '#4b5563' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, lineHeight: 1.6 }}>
      <div><span style={labelStyle}>序号：</span><span style={valueStyle}>{String(row.no).padStart(4, '0')}</span></div>
      <div><span style={labelStyle}>原始清单项目：</span><span style={valueStyle}>{row.originalItem}</span></div>
      <div><span style={labelStyle}>泰康标准项编码：</span><span style={valueStyle}>{row.tkCode}</span></div>
      <div><span style={labelStyle}>泰康标准项名称：</span><span style={valueStyle}>{row.tkName}</span></div>
      <div><span style={labelStyle}>商保控费标签：</span><span style={valueStyle}>{row.controlTag}</span></div>
      <div><span style={labelStyle}>LLM择优说明：</span><span style={valueStyle}>{row.llmReason}</span></div>
      <div><span style={labelStyle}>置信度：</span><span style={valueStyle}>{(row.confidence * 100).toFixed(0)}%</span></div>
      <div>
        <span style={labelStyle}>HIDS标化推荐列表：</span>
        <div style={{ ...valueStyle, display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
          {row.hidsList.map((h, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: i === 0 ? '#dcfce7' : '#f3f4f6', color: i === 0 ? '#16a34a' : '#6b7280', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>{i + 1}</span>
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** 医保剔费-项目剔费模块弹窗 */
const DeductTable: React.FC<{ row: DeductRow }> = ({ row }) => {
  const labelStyle: React.CSSProperties = { fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }
  const valueStyle: React.CSSProperties = { color: '#4b5563' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, lineHeight: 1.6 }}>
      <div><span style={labelStyle}>序号：</span><span style={valueStyle}>{String(row.no).padStart(4, '0')}</span></div>
      <div><span style={labelStyle}>原始清单项目：</span><span style={valueStyle}>{row.originalItem}</span></div>
      <div><span style={labelStyle}>泰康标准项名称：</span><span style={valueStyle}>{row.tkName}</span></div>
      <div><span style={labelStyle}>自付比例：</span><span style={valueStyle}>{row.selfPayRatio}</span></div>
      <div><span style={labelStyle}>自费金额：</span><span style={valueStyle}>¥{row.selfPayAmount.toFixed(2)}</span></div>
      <div><span style={labelStyle}>医保属性：</span><span style={valueStyle}>{row.insuranceAttr}</span></div>
      <div><span style={labelStyle}>项目类型：</span><span style={valueStyle}>{row.projectType}</span></div>
    </div>
  )
}

/** 商保控费-规则知识判定模块弹窗 */
const RuleTable: React.FC<{ row: RuleRow }> = ({ row }) => {
  const labelStyle: React.CSSProperties = { fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }
  const valueStyle: React.CSSProperties = { color: '#4b5563' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, lineHeight: 1.6 }}>
      <div><span style={labelStyle}>序号：</span><span style={valueStyle}>{String(row.no).padStart(4, '0')}</span></div>
      <div><span style={labelStyle}>原始清单项目：</span><span style={valueStyle}>{row.originalItem}</span></div>
      <div><span style={labelStyle}>泰康标准项名称：</span><span style={valueStyle}>{row.tkName}</span></div>
      <div><span style={labelStyle}>命中知识名称：</span><span style={valueStyle}>{row.hitKnowledge}</span></div>
      <div><span style={labelStyle}>是否扣除：</span><span style={{ ...valueStyle, color: row.isDeducted ? '#d97706' : '#16a34a', fontWeight: 500 }}>{row.isDeducted ? '是' : '否'}</span></div>
      <div><span style={labelStyle}>不合理类型：</span><span style={valueStyle}>{row.unreasonableType}</span></div>
      <div><span style={labelStyle}>判定理由：</span><span style={valueStyle}>{row.reason}</span></div>
    </div>
  )
}

/** 商保控费-条款知识判定模块弹窗 */
const ClauseTable: React.FC<{ row: ClauseRow }> = ({ row }) => {
  const labelStyle: React.CSSProperties = { fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }
  const valueStyle: React.CSSProperties = { color: '#4b5563' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, lineHeight: 1.6 }}>
      <div><span style={labelStyle}>序号：</span><span style={valueStyle}>{String(row.no).padStart(4, '0')}</span></div>
      <div><span style={labelStyle}>原始清单项目：</span><span style={valueStyle}>{row.originalItem}</span></div>
      <div><span style={labelStyle}>泰康标准项名称：</span><span style={valueStyle}>{row.tkName}</span></div>
      <div><span style={labelStyle}>不合理类型：</span><span style={valueStyle}>{row.unreasonableType}</span></div>
      <div><span style={labelStyle}>条款分析摘要：</span><span style={valueStyle}>{row.clauseSummary}</span></div>
      <div>
        <span style={labelStyle}>判定逻辑：</span>
        <div style={{ ...valueStyle, marginTop: 2, whiteSpace: 'pre-line' }}>{row.logic}</div>
      </div>
      <div><span style={labelStyle}>引用条款内容：</span><span style={valueStyle}>{row.clauseContent}</span></div>
    </div>
  )
}

/** 风控模块弹窗 */
const RiskTable: React.FC<{ row: RiskRow }> = ({ row }) => {
  const labelStyle: React.CSSProperties = { fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }
  const valueStyle: React.CSSProperties = { color: '#4b5563' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, lineHeight: 1.6 }}>
      <div><span style={labelStyle}>序号：</span><span style={valueStyle}>{String(row.no).padStart(4, '0')}</span></div>
      <div><span style={labelStyle}>原始清单项目：</span><span style={valueStyle}>{row.originalItem}</span></div>
      <div><span style={labelStyle}>风控理由：</span><span style={valueStyle}>{row.riskReason}</span></div>
    </div>
  )
}

/** 输出标化模块弹窗 */
const OutputTable: React.FC<{ row: OutputRow }> = ({ row }) => {
  const labelStyle: React.CSSProperties = { fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }
  const valueStyle: React.CSSProperties = { color: '#4b5563' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, lineHeight: 1.6 }}>
      <div><span style={labelStyle}>序号：</span><span style={valueStyle}>{String(row.no).padStart(4, '0')}</span></div>
      <div><span style={labelStyle}>原始清单项目：</span><span style={valueStyle}>{row.originalItem}</span></div>
      <div><span style={labelStyle}>不合理类型：</span><span style={valueStyle}>{row.unreasonableType}</span></div>
      <div><span style={labelStyle}>判定依据：</span><span style={valueStyle}>{row.basis}</span></div>
    </div>
  )
}

const DecisionChainView: React.FC<{ item: FeeItem }> = ({ item }) => {
  const c: DecisionChain = item.chain
  const mbS = getMbStandardize(item)
  const mbD = getMbDeduct(item)

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 0 }}>
      {/* 共享状态侧节点 */}
      <div style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        border: '1px dashed #fecaca', background: '#fef2f2',
        borderRadius: 12, padding: 12, width: 160, textAlign: 'center',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          <Icon src={icoShareState} color="#dc2626" size={18} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>共享状态</div>
        <div style={{ fontSize: 12, color: '#dc2626cc', lineHeight: 1.5 }}>Shared State（记忆）<br />各节点读写中间结论</div>
      </div>

      <EndPoint label="开始" fillRatio={0.85} />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoMbStd} color="#1f2937" />} title="医保剔费-项目标化模块" subtitle="调用HIDS接口获取TopN推荐项，基于作业标化逻辑选择最优标化项目" status={mbS.status}
        popupContent={<StandardizeTable row={getMbStandardizeData(item)} />}
      />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoMbDed} color="#1f2937" />} title="医保剔费-项目剔费模块" subtitle="基于选择的最佳标化项目，调用MBE剔费接口获取医保剔费数据，结合案件信息识别特殊剔费场景并做针对性处理" status={mbD.status}
        popupContent={<DeductTable row={getMbDeductData(item)} />}
      />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoRule} color="#1f2937" />} title="商保控费-规则知识判定模块" subtitle="基于扣费知识体系，对费用项目进行合理性判定" status={c.rule.status}
        popupContent={<RuleTable row={getRuleData(item)} />}
      >
        {(handleSubNodeClick: (sub: { name: string; status: NodeStatus; conclusion: string }) => void) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px 12px' }}>
            {c.rule.sub.map(s => <SubNodeRow key={s.key} name={s.name} status={s.status} onClick={() => handleSubNodeClick(s)} />)}
          </div>
        )}
      </ChainNodeCard>
      <Connector label={c.rule.hasResult ? '有判定结果' : '无判定结果'} />

      <ChainNodeCard
        icon={<Icon src={icoClause} color="#1f2937" />} title="商保控费-条款知识判定模块"
        subtitle="结合条款知识，对费用项目进行合理性判定"
        status={c.clause.status}
        badges={c.clause.reflected ? <span style={{ fontSize: 12, fontWeight: 500, color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '2px 8px' }}> 触发反省 · 二次校验</span> : undefined}
        popupContent={<ClauseTable row={getClauseData(item)} />}
      />
      {c.clause.reflected && (
        <div style={{ marginTop: 4, fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🔄</span> 反省循环：结论回写共享状态后二次判定
        </div>
      )}
      <Connector />

      <ChainNodeCard
        icon={<Icon src={icoRisk} color="#1f2937" />} title="风控模块" subtitle="识别项目风险项、判定当前项目是否需要流转人工复核"
        status={c.risk.status}
        badges={c.risk.status === 'hit'
          ? <Tag color="error" style={{ borderRadius: 6, minWidth: 50, textAlign: 'center', fontSize: 12, fontWeight: 500 }}>转人工</Tag>
          : <Tag style={{ borderRadius: 6, minWidth: 50, textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#6a727d' }}>无风险</Tag>}
        popupContent={<RiskTable row={getRiskData(item)} />}
      />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoOutput} color="#1f2937" />} title="输出标化模块" subtitle="汇总前面所有模块判定数据，生成标准化扣费结论" status={c.output.status}
        popupContent={<OutputTable row={getOutputData(item)} />}
      />
      <Connector />
      <EndPoint label="结束" />
    </div>
  )
}

/* ───────── 主页面组件 ───────── */

const AgentClaimsDeductionLogDetail: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const taskNo = searchParams.get('taskId') || ''
  const caseNo = searchParams.get('caseNo') || ''

  const [tab, setTab] = useState<TabKey>('items')
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('unreasonable')
  const [selectedId, setSelectedId] = useState('f01')
  const groups = useMemo(() => getUnreasonableGroups(), [])
  const feeItems = useMemo(() => getFeeItems(), [])
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ [groups[0]?.category]: true })

  // 路由参数变化时滚动到页面顶部
  useEffect(() => {
    const el = document.querySelector('.ant-layout-content')
    if (el) {
      el.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [taskNo, caseNo])

  const bill = getBillHeader(taskNo, caseNo, 'BILL20260615000231')
  const selected = feeItems.find(i => i.id === selectedId) ?? feeItems[0]

  const toggleCat = (cat: string) => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }))

  const deductItems = feeItems.filter(i => i.result !== '通过')

  // 扣费日志数据（用于根据taskId获取执行状态）
  const DEDUCTION_LOG_STATUS: Record<string, 'success' | 'failed' | 'processing' | 'timeout'> = {
    '2044719741488838912': 'success',
    '2044719741388838912': 'processing',
    '2044719741288838912': 'timeout',
    '2044719741188838912': 'success',
    '2044719741088838912': 'failed',
    '2044719740988838912': 'failed',
    '2044719740888838912': 'success',
    '2044719740788838912': 'processing',
    '2044719740688838912': 'timeout',
    '2044719740588838912': 'success',
    '2044719740488838912': 'success',
    '2044719740388838912': 'failed',
    '2044719740288838912': 'success',
    '2044719740188838912': 'processing',
    '2044719740088838912': 'timeout',
    '2044719739988838912': 'success',
    '2044719739888838912': 'success',
    '2044719739788838912': 'failed',
    '2044719739688838912': 'success',
    '2044719739588838912': 'processing',
  }
  const execStatus = DEDUCTION_LOG_STATUS[taskNo] || 'success'

  // 扣费日志平台耗时数据（用于根据taskId获取响应时间）
  const DEDUCTION_LOG_TIME: Record<string, string> = {
    '2044719741488838912': '25s 137ms',
    '2044719741388838912': '32s 174ms',
    '2044719741288838912': '12m 35s 211ms',
    '2044719741188838912': '46s 248ms',
    '2044719741088838912': '18s 285ms',
    '2044719740988838912': '18s 322ms',
    '2044719740888838912': '1m 7s 359ms',
    '2044719740788838912': '1m 14s 396ms',
    '2044719740688838912': '15m 22s 433ms',
    '2044719740588838912': '1m 28s 470ms',
    '2044719740488838912': '1m 35s 507ms',
    '2044719740388838912': '22s 544ms',
    '2044719740288838912': '29s 581ms',
    '2044719740188838912': '36s 618ms',
    '2044719740088838912': '11m 48s 655ms',
    '2044719739988838912': '50s 692ms',
    '2044719739888838912': '57s 729ms',
    '2044719739788838912': '15s 766ms',
    '2044719739688838912': '1m 11s 803ms',
    '2044719739588838912': '1m 18s 840ms',
  }
  const responseTime = DEDUCTION_LOG_TIME[taskNo] || '142ms'

  // LIC响应状态配置
  const LIC_STATUS_MAP: Record<string, { text: string; code: string; bg: string; color: string; dotColor: string }> = {
    success: { text: '回写成功', code: '200 OK', bg: '#ecfdf5', color: '#059669', dotColor: '#059669' },
    failed: { text: '回写失败', code: '500 Error', bg: '#fef2f2', color: '#dc2626', dotColor: '#dc2626' },
    processing: { text: '处理中', code: '202 Accepted', bg: '#eff6ff', color: '#2563eb', dotColor: '#2563eb' },
    timeout: { text: '请求超时', code: '408 Timeout', bg: '#fffbeb', color: '#d97706', dotColor: '#d97706' },
  }
  const licStatus = LIC_STATUS_MAP[execStatus]

  // 引擎结果列定义
  const engineColumns: ColumnsType<{
    key: string
    name: string
    category: string
    amount: number
    deductAmount: number
    result: string
    conclusion: string
  }> = [
    { title: '费用项目', dataIndex: 'name', key: 'name', width: 180, ellipsis: true },
    { title: '不合理类型', dataIndex: 'category', key: 'category', width: 120 },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (val: number) => <span style={{ color: '#1f2937' }}>¥{val.toFixed(2)}</span>,
    },
    {
      title: '扣费金额',
      dataIndex: 'deductAmount',
      key: 'deductAmount',
      width: 110,
      render: (val: number) => <span style={{ fontWeight: 500, color: '#d97706' }}>¥{val.toFixed(2)}</span>,
    },
    {
      title: '判定结果',
      dataIndex: 'result',
      key: 'result',
      width: 90,
      render: (status: string) => (
        <Tag color={resultTagColor[status as FeeResult]} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center' }}>{status}</Tag>
      ),
    },
    { title: '扣费依据', dataIndex: 'conclusion', key: 'conclusion', width: 300, ellipsis: true },
  ]

  // LIC payload
  const licPayload = {
    code: '0000',
    message: 'success',
    taskNo: bill.taskNo,
    caseNo: bill.caseNo,
    billNo: bill.billNo,
    totalAmount: bill.totalAmount,
    totalDeduct: bill.totalDeduct,
    items: deductItems.map(i => ({
      name: i.name,
      result: i.result,
      deductAmount: i.deductAmount,
      reason: i.chain.output.conclusion.replace('标化输出：', ''),
    })),
  }

  const handleCopyLicJson = () => {
    navigator.clipboard.writeText(JSON.stringify(licPayload, null, 2)).then(() => {
      message.success('已复制到剪贴板')
    })
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      {/* 顶部导航栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            onClick={() => navigate('/agent/claims/logs?tab=扣费')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#595959', fontSize: 14 }}
          >
            <ArrowLeftOutlined /> 返回
          </span>
          <div style={{ width: 1, height: 16, background: '#e8e8e8' }} />
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>任务号：</span><span style={{ fontWeight: 400 }}>{bill.taskNo}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>案件号：</span><span style={{ fontWeight: 400 }}>{bill.caseNo}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>账单号：</span><span style={{ fontWeight: 400 }}>{bill.billNo}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>执行状态：</span>
            <Tag color={execStatus === 'success' ? 'success' : execStatus === 'processing' ? 'processing' : execStatus === 'timeout' ? 'warning' : 'error'} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center' }}>
              {execStatus === 'success' ? '成功' : execStatus === 'processing' ? '处理中' : execStatus === 'timeout' ? '超时' : '失败'}
            </Tag>
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>账单金额：</span><span style={{ fontWeight: 400 }}>¥{bill.totalAmount.toFixed(2)}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>扣费合计：</span><span style={{ fontWeight: 400, color: '#d97706' }}>¥{bill.totalDeduct.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* Tab 切换 */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 20,
        borderBottom: '1px solid #e8e8e8',
      }}>
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '0px 20px 8px',
                fontSize: 16,
                fontWeight: active ? 600 : 400,
                color: active ? '#1f2937' : '#8c8c8c',
                cursor: 'pointer',
                borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#595959'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#8c8c8c'
              }}
            >
              {t.label}
            </div>
          )
        })}
      </div>

      {/* 内容区 */}
      <div>
        {/* Tab 1: 扣费项目展示 */}
        {tab === 'items' && (
          <div style={{ display: 'flex', gap: 16, minHeight: 640 }}>
            <aside style={{
              width: 288, flexShrink: 0, borderRadius: 12,
              border: '1px solid #e5e7eb', background: '#fff',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
              {/* 模式切换 */}
              <div style={{
                display: 'flex',
                gap: 0,
                borderBottom: '1px solid #e5e7eb',
              }}>
                {(['unreasonable', 'all'] as SidebarMode[]).map(mode => (
                  <div
                    key={mode}
                    onClick={() => setSidebarMode(mode)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: sidebarMode === mode ? '#fff' : '#6b7280',
                      background: sidebarMode === mode ? '#65a5ff' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {mode === 'unreasonable'
                      ? <Icon src={icoUnreasonable} color={sidebarMode === mode ? '#fff' : '#6b7280'} />
                      : <Icon src={icoAllItems} color={sidebarMode === mode ? '#fff' : '#6b7280'} />}
                    {mode === 'unreasonable' ? '不合理类型' : '全部项目'}
                  </div>
                ))}
              </div>
              {/* 统计行 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #e5e7eb',
                padding: '8px 12px', fontSize: 12, color: '#6b7280',
              }}>
                <span>{sidebarMode === 'unreasonable' ? '不合理项目分类' : '全部费用项目'}</span>
                <span>共 {sidebarMode === 'unreasonable' ? groups.reduce((n, g) => n + g.items.length, 0) : feeItems.length} 项</span>
              </div>
              {/* 列表 */}
              <div style={{ flex: 1, overflow: 'auto', padding: 8, maxHeight: 560 }}>
                {sidebarMode === 'unreasonable' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {groups.map(g => {
                      const open = openCats[g.category]
                      return (
                        <div key={g.category}>
                          <div
                            onClick={() => toggleCat(g.category)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '8px 8px', borderRadius: 6, cursor: 'pointer',
                              fontSize: 14, fontWeight: 500, color: '#1f2937',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', color: '#6b7280', flexShrink: 0 }}>
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                            <span style={{ flex: 1 }}>{g.category}</span>
                            <span style={{
                              fontSize: 12, color: '#6b7280', background: '#f3f4f6',
                              borderRadius: 10, padding: '1px 8px',
                            }}>{g.items.length}</span>
                          </div>
                          {open && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                              {g.items.map(item => (
                                <ItemRow key={item.id} item={item} active={selectedId === item.id} onClick={() => setSelectedId(item.id)} indent />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {feeItems.map(item => (
                      <ItemRow key={item.id} item={item} active={selectedId === item.id} onClick={() => setSelectedId(item.id)} />
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* 右侧：项目概要 + 决策链 */}
            <section style={{
              flex: 1, minWidth: 0, borderRadius: 12,
              border: '1px solid #e5e7eb', background: '#fff',
            }}>
              {/* 项目概要 */}
              <div style={{ borderBottom: '1px solid #e5e7eb', padding: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: 0 }}>{selected.name}</h2>
                      <Tag color={resultTagColor[selected.result]} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center', fontSize: 12 }}>{selected.result}</Tag>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>所属分类：{selected.category}</p>
                  </div>
                  <dl style={{ marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '4px 24px' }}>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>单价</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>¥{selected.unitPrice}</dd></div>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>数量</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>{selected.quantity}{selected.spec}</dd></div>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>总金额</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>¥{selected.amount.toFixed(2)}</dd></div>
                  </dl>
                </div>
              </div>

              {/* 决策链标题 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 0', fontSize: 12, color: '#6b7280' }}>
                <Icon src={icoChain} color="#6b7280" />
                扣费智能体判定决策链（点击节点查看结论）
              </div>

              {/* 决策链图 */}
              <div style={{ padding: '16px 16px 16px 16px', minHeight: 500 }}>
                <DecisionChainView key={selected.id} item={selected} />
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: 引擎结果 */}
        {tab === 'engine' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              minHeight: 28,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: '22px' }}>
                引擎判定结果汇总
              </span>
            </div>
            <div className="table-scroll-wrapper">
              <div style={{ minWidth: 1100 }}>
                <Table
                  columns={engineColumns}
                  dataSource={deductItems.map(i => ({
                    key: i.id,
                    name: i.name,
                    category: i.category,
                    amount: i.amount,
                    deductAmount: i.deductAmount,
                    result: i.result,
                    conclusion: i.chain.output.conclusion.replace('标化输出：', ''),
                  }))}
                  pagination={false}
                  size="small"
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, color: '#000000e0' }}>共 {deductItems.length} 条数据</span>
                <button
                  onClick={() => console.log('导出引擎结果')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#65a5ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  结果导出
                </button>
              </div>
              <Pagination
                current={1}
                pageSize={10}
                total={deductItems.length}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={['10', '20', '50']}
                size="small"
              />
            </div>
          </div>
        )}

        {/* Tab 3: LIC系统响应 */}
        {tab === 'lic' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 16, lineHeight: '22px', minHeight: 28, display: 'flex', alignItems: 'center' }}>
              LIC系统响应
            </div>
            {/* 状态栏 + 复制按钮 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: licStatus.bg, borderRadius: 16, padding: '4px 12px',
                  fontSize: 12, fontWeight: 500, color: licStatus.color,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: licStatus.dotColor }} />
                  {licStatus.text} · {licStatus.code}
                </span>
                <span style={{ fontSize: 12, color: '#1f2937' }}>响应时间 {responseTime}</span>
              </div>
              <button
                onClick={handleCopyLicJson}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#65a5ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <CopyOutlined style={{ fontSize: 12 }} /> 复制JSON
              </button>
            </div>
            <pre style={{
              overflow: 'auto', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#f9fafb', padding: 16, fontSize: 12, lineHeight: 1.6,
              color: '#1f2937', fontFamily: 'monospace',
            }}>{JSON.stringify(licPayload, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────── 侧边栏项目行 ──────── */

const ItemRow: React.FC<{
  item: FeeItem
  active: boolean
  onClick: () => void
  indent?: boolean
}> = ({ item, active, onClick, indent }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: indent ? '6px 8px 6px 28px' : '6px 8px 6px 12px',
      borderRadius: 6, cursor: 'pointer', fontSize: 14,
      background: active ? '#65a5ff' : 'transparent',
      color: active ? '#fff' : '#1f2937',
      fontWeight: active ? 500 : 400,
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
  >
    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
    <Tag color={resultTagColor[item.result]} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{item.result}</Tag>
  </div>
)

export default AgentClaimsDeductionLogDetail

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tag, Table, Pagination, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons'
import { getFeeItems, getBillHeader, getMbStandardize, getMbDeduct, getUnreasonableGroups, type FeeItem, type FeeResult, type NodeStatus, type DecisionChain } from './deduction-log-detail-data'

import icoUnreasonable from '../../../assets/icons/不合理类型.svg'
import icoRisk from '../../../assets/icons/风控模块.svg'
import icoShared from '../../../assets/icons/共享状态.svg'
import icoEnd from '../../../assets/icons/结束.svg'
import icoStart from '../../../assets/icons/开始.svg'
import icoChain from '../../../assets/icons/扣费智能体判定决策链.svg'
import icoAll from '../../../assets/icons/全部项目.svg'
import icoRule from '../../../assets/icons/商保控费-规则知识判定模块.svg'
import icoClause from '../../../assets/icons/商保控费-条款知识判定模块.svg'
import icoOutput from '../../../assets/icons/输出标化模块.svg'
import icoMbStd from '../../../assets/icons/医保剔费-项目标化模块.svg'
import icoMbDed from '../../../assets/icons/医保剔费-项目剔费模块.svg'

const Icon: React.FC<{ src: string; color: string; size?: number }> = ({ src, color, size = 14 }) => {
  const [html, setHtml] = useState('')
  useEffect(() => {
    fetch(src).then(r => r.text()).then(text => {
      // 把 fill 值替换为 currentColor（保留 none），让 div 的 color 控制图标颜色
      let result = text.replace(/fill="[^"]+"/g, 'fill="currentColor"')
      setHtml(result)
    })
  }, [src])
  return (
    <div
      style={{ width: size, height: size, color, display: 'inline-flex', flexShrink: 0 }}
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
  children?: React.ReactNode
}> = ({ icon, title, subtitle, status, badges, popupContent, children }) => {
  const meta = statusMeta(status)
  const [open, setOpen] = useState(false)
  const hasPopup = !!popupContent
  useEffect(() => {
    const close = () => setOpen(false)
    popupCloseCallbacks.add(close)
    return () => { popupCloseCallbacks.delete(close) }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])
  return (
    <div style={{ position: 'relative', width: 340 }}>
      <div
        style={{
          cursor: hasPopup ? 'pointer' : 'default',
          borderRadius: 12, border: `1px solid ${meta.border}`, background: meta.bg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s',
          overflow: 'hidden',
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
          {children}
        </div>
      </div>
      {/* 点击弹出信息卡 */}
      {open && hasPopup && (
        <div style={{
          position: 'absolute', right: '100%', top: 0, marginRight: 12,
          zIndex: 100, width: 280,
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
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              {popupContent}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SubNodeRow: React.FC<{ name: string; status: NodeStatus; conclusion: string }> = ({ name, status, conclusion }) => {
  const meta = subNodeStatusMeta(status)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const close = () => setOpen(false)
    popupCloseCallbacks.add(close)
    return () => { popupCloseCallbacks.delete(close) }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])
  return (
    <div
      style={{ position: 'relative' }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          border: `1px solid ${open ? meta.border : '#e5e7eb'}`, borderRadius: 6, background: '#fff',
          padding: '6px 10px', transition: 'border-color 0.15s',
        }}
        onClick={e => {
          e.stopPropagation()
          if (open) { setOpen(false) } else { closeAllPopups(); setOpen(true) }
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#1f2937', flex: 1 }}>{name}</span>
        <span style={{ fontSize: 12, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
          marginRight: 8, zIndex: 100, width: 240,
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{name}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{conclusion}</div>
          </div>
        </div>
      )}
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

const EndPoint: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: '1px solid #3b82f640', background: '#eff6ff',
    borderRadius: 20, padding: '6px 16px',
  }}>
    {<Icon src={label === '开始' ? icoStart : icoEnd} color="#3b82f6" />}
    <span style={{ fontSize: 14, fontWeight: 500, color: '#3b82f6' }}>{label}</span>
  </div>
)

const DecisionChainView: React.FC<{ item: FeeItem }> = ({ item }) => {
  const c: DecisionChain = item.chain
  const mbS = getMbStandardize(item)
  const mbD = getMbDeduct(item)

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
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
          <Icon src={icoShared} color="#dc2626" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>共享状态</div>
        <div style={{ fontSize: 12, color: '#dc2626cc', lineHeight: 1.5 }}>Shared State（记忆）<br />各节点读写中间结论</div>
      </div>

      <EndPoint label="开始" />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoMbStd} color="#1f2937" />} title="医保剔费-项目标化模块" subtitle="调用HIDS接口获取TopN推荐项，基于作业标化逻辑选择最优标化项目" status={mbS.status}
        popupContent={mbS.conclusion}
      />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoMbDed} color="#1f2937" />} title="医保剔费-项目剔费模块" subtitle="基于选择的最佳标化项目，调用MBE剔费接口获取医保剔费数据，结合案件信息识别特殊剔费场景并做针对性处理" status={mbD.status}
        popupContent={mbD.conclusion}
      />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoRule} color="#1f2937" />} title="商保控费-规则知识判定模块" subtitle="基于扣费知识体系，对费用项目进行合理性判定" status={c.rule.status}
        popupContent={c.rule.conclusion}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px 12px' }}>
          {c.rule.sub.map(s => <SubNodeRow key={s.key} name={s.name} status={s.status} conclusion={s.conclusion} />)}
        </div>
      </ChainNodeCard>
      <Connector label={c.rule.hasResult ? '有判定结果' : '无判定结果'} />

      <ChainNodeCard
        icon={<Icon src={icoClause} color="#1f2937" />} title="商保控费-条款知识判定模块"
        subtitle="结合条款知识，对费用项目进行合理性判定"
        status={c.clause.status}
        badges={c.clause.reflected ? <span style={{ fontSize: 12, fontWeight: 500, color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '2px 8px' }}> 触发反省 · 二次校验</span> : undefined}
        popupContent={c.clause.conclusion}
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
        popupContent={c.risk.conclusion}
      />
      <Connector />

      <ChainNodeCard icon={<Icon src={icoOutput} color="#1f2937" />} title="输出标化模块" subtitle="汇总前面所有模块判定数据，生成标准化扣费结论" status={c.output.status}
        popupContent={c.output.conclusion}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            onClick={() => navigate('/agent/claims/logs?tab=扣费')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#595959', fontSize: 14 }}
          >
            <ArrowLeftOutlined /> 返回
          </span>
          <div style={{ width: 1, height: 16, background: '#e8e8e8' }} />
          <span style={{ fontSize: 16, marginRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>任务号：</span><span style={{ fontWeight: 400 }}>{bill.taskNo}</span>
          </span>
          <span style={{ fontSize: 16, marginRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>案件号：</span><span style={{ fontWeight: 400 }}>{bill.caseNo}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>账单号：</span><span style={{ fontWeight: 400 }}>{bill.billNo}</span>
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 24 }}>
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
                      : <Icon src={icoAll} color={sidebarMode === mode ? '#fff' : '#6b7280'} />}
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
                            <span style={{ fontSize: 10, color: '#6b7280' }}>{open ? '▼' : '▶'}</span>
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
                  <dl style={{ marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '4px 24px' }}>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>单价</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>¥{selected.unitPrice}</dd></div>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>数量</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>{selected.quantity}{selected.spec}</dd></div>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>金额</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>¥{selected.amount.toFixed(2)}</dd></div>
                    <div><dt style={{ fontSize: 12, color: '#6b7280' }}>扣费金额</dt><dd style={{ fontSize: 12, fontWeight: 600, color: selected.deductAmount > 0 ? '#d97706' : '#1f2937', margin: 0 }}>¥{selected.deductAmount.toFixed(2)}</dd></div>
                  </dl>
                </div>
              </div>

              {/* 决策链标题 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 0', fontSize: 12, color: '#6b7280' }}>
                <Icon src={icoChain} color="#6b7280" />
                扣费智能体判定决策链（点击节点查看结论）
              </div>

              {/* 决策链图 */}
              <div style={{ overflow: 'auto', padding: '16px 24px 32px 320px', minHeight: 500 }}>
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

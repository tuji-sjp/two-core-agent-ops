import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tag } from 'antd'
import { ArrowLeftOutlined, FilterOutlined, OrderedListOutlined, AlertOutlined, ExperimentOutlined, ScissorOutlined, BookOutlined, SafetyOutlined, SendOutlined } from '@ant-design/icons'
import { getFeeItems, getBillHeader, getMbStandardize, getMbDeduct, getUnreasonableGroups, type FeeItem, type FeeResult, type NodeStatus, type DecisionChain } from './deduction-log-detail-data'

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

function statusMeta(status: NodeStatus, danger = false) {
  if (status === 'skip') return { label: '未执行', color: '#9ca3af', bg: '#f3f4f6', border: '#d1d5db', icon: '○' }
  if (status === 'pass') return { label: '已通过', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✓' }
  if (danger) return { label: '已触发', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '⚠' }
  return { label: '已触发', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', icon: '⚠' }
}

/* ───────── 决策链节点组件 ───────── */

const ChainNodeCard: React.FC<{
  icon: React.ReactNode
  title: string
  subtitle?: string
  status: NodeStatus
  danger?: boolean
  badges?: React.ReactNode
  children?: React.ReactNode
  onHover?: (open: boolean) => void
}> = ({ icon, title, subtitle, status, danger, badges, children, onHover }) => {
  const meta = statusMeta(status, danger)
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ position: 'relative', width: 340 }}
      onMouseEnter={() => { setHover(true); onHover?.(true) }}
      onMouseLeave={() => { setHover(false); onHover?.(false) }}
    >
      <div style={{
        borderRadius: 12, border: `1px solid ${meta.border}`, background: meta.bg,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s',
        overflow: 'hidden',
      }}>
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
            {subtitle && <p style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>{subtitle}</p>}
            {badges && <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{badges}</div>}
          </div>
        </div>
        {children}
      </div>
      {/* 悬停信息卡 */}
      {hover && children && (
        <div style={{
          position: 'absolute', left: '50%', top: '100%', marginTop: 8,
          transform: 'translateX(-50%)', zIndex: 100, width: 280,
        }}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{title}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: meta.color,
                background: meta.bg, border: `1px solid ${meta.border}`,
                borderRadius: 4, padding: '1px 6px',
              }}>{meta.label}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              {typeof children === 'string' ? children : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SubNodeRow: React.FC<{ name: string; status: NodeStatus; conclusion: string }> = ({ name, status, conclusion }) => {
  const meta = statusMeta(status)
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'default',
        border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff',
        padding: '6px 10px',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#1f2937', flex: 1 }}>{name}</span>
        <span style={{ fontSize: 12, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
      </div>
      {hover && (
        <div style={{
          position: 'absolute', left: '50%', top: '100%', marginTop: 6,
          transform: 'translateX(-50%)', zIndex: 100, width: 260,
        }}>
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{name}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{conclusion}</div>
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
        marginLeft: 4, fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap',
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
    <span style={{ fontSize: 14 }}>{label === '开始' ? '▶' : ''}</span>
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
        }}>🗄</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>共享状态</div>
        <div style={{ fontSize: 11, color: '#dc2626cc', lineHeight: 1.5 }}>Shared State（记忆）<br />各节点读写中间结论</div>
      </div>

      <EndPoint label="开始" />
      <Connector />

      <ChainNodeCard icon={<ExperimentOutlined style={{ fontSize: 14, color: '#3b82f6' }} />} title="医保剔费-项目标化模块" subtitle="调用 HIDS 接口取 TopN 推荐项，作业标化选最优标化项目" status={mbS.status}>
        <div style={{ background: '#f9fafb', padding: '8px 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.6, }}>{mbS.conclusion}</div>
      </ChainNodeCard>
      <Connector />

      <ChainNodeCard icon={<ScissorOutlined style={{ fontSize: 14, color: '#3b82f6' }} />} title="医保剔费-项目剔费模块" subtitle="基于标化项调用 MBE 剔费接口，识别特殊剔费场景" status={mbD.status}>
        <div style={{ background: '#f9fafb', padding: '8px 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.6, }}>{mbD.conclusion}</div>
      </ChainNodeCard>
      <Connector />

      <ChainNodeCard icon={<BookOutlined style={{ fontSize: 14, color: '#3b82f6' }} />} title="商保控费-规则判定模块" subtitle="基于规则知识库逐级判定" status={c.rule.status}>
        <div style={{ background: '#f9fafb', padding: 12, }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {c.rule.sub.map(s => <SubNodeRow key={s.key} name={s.name} status={s.status} conclusion={s.conclusion} />)}
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{c.rule.conclusion}</p>
        </div>
      </ChainNodeCard>
      <Connector label={c.rule.hasResult ? '有判定结果' : '无判定结果'} />

      <ChainNodeCard
        icon={<BookOutlined style={{ fontSize: 14, color: '#3b82f6' }} />} title="商保控费-条款判定模块"
        subtitle={c.rule.hasResult ? '规则已出结果，本节点跳过' : '基于条款知识库进行判定'}
        status={c.clause.status}
        badges={c.clause.reflected ? <span style={{ fontSize: 12, fontWeight: 500, color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '2px 8px' }}> 触发反省 · 二次校验</span> : undefined}
      >
        <div style={{ background: '#f9fafb', padding: '8px 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.6, }}>{c.clause.conclusion}</div>
      </ChainNodeCard>
      {c.clause.reflected && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🔄</span> 反省循环：结论回写共享状态后二次判定
        </div>
      )}
      <Connector />

      <ChainNodeCard
        icon={<SafetyOutlined style={{ fontSize: 14, color: '#3b82f6' }} />} title="风控模块" subtitle="评估风险并判断是否转人工"
        status={c.risk.status} danger={c.risk.toHuman}
        badges={<>
          {c.risk.risks.length > 0 ? c.risk.risks.map((r, ri) => (
            <span key={ri} style={{ fontSize: 12, fontWeight: 500, color: '#dc2626', background: '#fee2e2', borderRadius: 4, padding: '2px 8px' }}>{r}</span>
          )) : <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', borderRadius: 4, padding: '2px 8px' }}>无风险</span>}
          {c.risk.toHuman && <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: '#dc2626', borderRadius: 4, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>👤 转人工</span>}
        </>}
      >
        <div style={{ background: '#f9fafb', padding: '8px 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.6, }}>{c.risk.conclusion}</div>
      </ChainNodeCard>
      <Connector />

      <ChainNodeCard icon={<SendOutlined style={{ fontSize: 14, color: '#3b82f6' }} />} title="输出标化模块" subtitle="生成标准化扣费结论" status={c.output.status}>
        <div style={{ background: '#f9fafb', padding: '8px 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.6, }}>{c.output.conclusion}</div>
      </ChainNodeCard>
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

  const bill = getBillHeader(taskNo, caseNo, 'BILL20260615000231')
  const selected = feeItems.find(i => i.id === selectedId) ?? feeItems[0]

  const toggleCat = (cat: string) => setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }))

  const deductItems = feeItems.filter(i => i.result !== '通过')

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
                    {mode === 'unreasonable' ? <FilterOutlined style={{ fontSize: 14 }} /> : <OrderedListOutlined style={{ fontSize: 14 }} />}
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
                              fontSize: 13, fontWeight: 500, color: '#1f2937',
                            }}
                          >
                            <span style={{ fontSize: 10, color: '#6b7280' }}>{open ? '▼' : '▶'}</span>
                            <span style={{ flex: 1 }}>{g.category}</span>
                            <span style={{
                              fontSize: 11, color: '#6b7280', background: '#f3f4f6',
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
                    <div><dt style={{ fontSize: 11, color: '#6b7280' }}>单价</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>¥{selected.unitPrice}</dd></div>
                    <div><dt style={{ fontSize: 11, color: '#6b7280' }}>数量</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>{selected.quantity}{selected.spec}</dd></div>
                    <div><dt style={{ fontSize: 11, color: '#6b7280' }}>金额</dt><dd style={{ fontSize: 12, fontWeight: 500, color: '#1f2937', margin: 0 }}>¥{selected.amount.toFixed(2)}</dd></div>
                    <div><dt style={{ fontSize: 11, color: '#6b7280' }}>扣费金额</dt><dd style={{ fontSize: 12, fontWeight: 600, color: selected.deductAmount > 0 ? '#d97706' : '#1f2937', margin: 0 }}>¥{selected.deductAmount.toFixed(2)}</dd></div>
                  </dl>
                </div>
              </div>

              {/* 决策链标题 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 0', fontSize: 12, color: '#6b7280' }}>
                <AlertOutlined style={{ fontSize: 14 }} />
                扣费智能体判定决策链（鼠标悬停在节点处查看结论）
              </div>

              {/* 决策链图 */}
              <div style={{ overflow: 'auto', padding: '16px 24px 32px', minHeight: 500 }}>
                <DecisionChainView key={selected.id} item={selected} />
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: 引擎结果 */}
        {tab === 'engine' && (
          <div style={{ borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 16 }}>引擎判定结果汇总</h3>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['费用项目', '不合理类型', '金额', '扣费金额', '判定结果', '扣费依据'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deductItems.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500, color: '#1f2937' }}>{i.name}</td>
                      <td style={{ padding: '10px 16px', color: '#6b7280' }}>{i.category}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#1f2937' }}>¥{i.amount.toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#d97706' }}>¥{i.deductAmount.toFixed(2)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <Tag color={resultTagColor[i.result]} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center', fontSize: 12 }}>{i.result}</Tag>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#6b7280', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {i.chain.output.conclusion.replace('标化输出：', '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: LIC系统响应 */}
        {tab === 'lic' && (
          <div style={{ borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#ecfdf5', borderRadius: 16, padding: '4px 12px',
                fontSize: 12, fontWeight: 500, color: '#059669',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
                回写成功 · 200 OK
              </span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>响应时间 142ms</span>
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
      borderRadius: 6, cursor: 'pointer', fontSize: 13,
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

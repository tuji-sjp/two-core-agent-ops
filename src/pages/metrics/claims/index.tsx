import React, { useState } from 'react'
import { Row, Col, Table, Tag, Pagination } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import MetricCard from '../../dashboard/components/smart-services/metric-card'
import CaseProcessingChart from '../../dashboard/components/smart-services/case-processing-chart'

const METRICS_CLAIMS: { label: string; value: string }[] = [
  { label: 'tokens使用量', value: '12.8万' },
  { label: '处理案件总数', value: '3,245' },
  { label: '服务调用总数', value: '8,712' },
  { label: '平均调用成功率', value: '96.3%' },
  { label: '平均处理时长', value: '4.2s' },
  { label: '采集环节自动化率', value: '94.5%' },
  { label: '立案环节自动化率', value: '87.2%' },
  { label: '扣费环节自动化率', value: '91.8%' },
  { label: '理算环节自动化率', value: '85.6%' },
  { label: '审核环节自动化率', value: '92.1%' },
]

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  processing: { color: 'processing', text: '处理中' },
  completed: { color: 'success', text: '已完成' },
  exception: { color: 'error', text: '异常' },
}

// ========== 流程轨迹类型 ==========
type NodeStatus = 'processing' | 'completed' | 'exception'

interface FlowTrajectory {
  nodes: { label: string; status: NodeStatus }[]
}

const STATUS_COLORS: Record<NodeStatus, string> = {
  processing: '#91caff',
  completed: '#95de64',
  exception: '#ff7875',
}

const NODE_LABELS = ['开始', '采集', '立案', '理算', '扣费', '审核', '结束']

// ========== 测试数据 ==========
const flowDataMap: Record<string, FlowTrajectory> = {
  'CLS-2026060301': {
    nodes: [
      { label: '开始', status: 'completed' },
      { label: '采集', status: 'processing' },
      { label: '立案', status: 'processing' },
      { label: '理算', status: 'processing' },
      { label: '扣费', status: 'processing' },
      { label: '审核', status: 'processing' },
      { label: '结束', status: 'processing' },
    ],
  },
  'CLS-2026060302': {
    nodes: [
      { label: '开始', status: 'completed' },
      { label: '采集', status: 'completed' },
      { label: '立案', status: 'completed' },
      { label: '理算', status: 'completed' },
      { label: '扣费', status: 'completed' },
      { label: '审核', status: 'completed' },
      { label: '结束', status: 'completed' },
    ],
  },
  'CLS-2026060303': {
    nodes: [
      { label: '开始', status: 'completed' },
      { label: '采集', status: 'completed' },
      { label: '立案', status: 'completed' },
      { label: '理算', status: 'completed' },
      { label: '扣费', status: 'completed' },
      { label: '审核', status: 'processing' },
      { label: '结束', status: 'processing' },
    ],
  },
  'CLS-2026060304': {
    nodes: [
      { label: '开始', status: 'completed' },
      { label: '采集', status: 'completed' },
      { label: '立案', status: 'completed' },
      { label: '理算', status: 'completed' },
      { label: '扣费', status: 'completed' },
      { label: '审核', status: 'completed' },
      { label: '结束', status: 'completed' },
    ],
  },
  'CLS-2026060305': {
    nodes: [
      { label: '开始', status: 'completed' },
      { label: '采集', status: 'completed' },
      { label: '立案', status: 'completed' },
      { label: '理算', status: 'completed' },
      { label: '扣费', status: 'completed' },
      { label: '审核', status: 'completed' },
      { label: '结束', status: 'completed' },
    ],
  },
}

// ========== 流程轨迹图组件 ==========
const NODE_R = 10
const NODE_GAP = 60
const SVG_W = NODE_LABELS.length * NODE_GAP + 20
const SVG_H = 60

const FlowTrajectoryGraph: React.FC<{ trajectory: FlowTrajectory }> = ({ trajectory }) => {
  return (
    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: 8 }}>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ overflow: 'visible' }}>
        {NODE_LABELS.map((label, i) => {
          const node = trajectory.nodes[i] || { label, status: 'processing' as NodeStatus }
          const cx = 20 + i * NODE_GAP
          const cy = SVG_H / 2
          const color = STATUS_COLORS[node.status]
          const icon = node.status === 'completed' ? '✓' : node.status === 'exception' ? '✗' : '·'

          return (
            <g key={i}>
              {i > 0 && (
                <line
                  x1={20 + (i - 1) * NODE_GAP + NODE_R}
                  y1={cy}
                  x2={cx - NODE_R}
                  y2={cy}
                  stroke="#d1d5db"
                  strokeWidth={2}
                />
              )}
              <circle cx={cx} cy={cy} r={NODE_R} fill={color} />
              <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fill="#fff" fontSize={10} fontWeight="bold">{icon}</text>
              <text x={cx} y={cy + NODE_R + 12} textAnchor="middle" fill="#6b7280" fontSize={10}>{node.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ========== 主组件 ==========
interface CaseRecord {
  key: string
  caseNo: string
  claimNo: string
  branch: string
  accidentDate: string
  claimDate: string
  currentNode: string
  status: string
}

const ALL_BRANCHES = [...new Set([
  '北京分公司', '上海分公司', '广州分公司', '深圳分公司', '杭州分公司',
  '成都分公司', '武汉分公司', '南京分公司', '重庆分公司', '天津分公司',
  '苏州分公司', '长沙分公司', '西安分公司', '郑州分公司', '合肥分公司',
])].sort()

const ALL_NODES = ['采集智能体', '立案智能体', '理算智能体', '扣费智能体', '审核智能体']
const ALL_STATUSES = [
  { text: '处理中', value: 'processing' },
  { text: '已完成', value: 'completed' },
  { text: '异常', value: 'exception' },
]

const MOCK_CASES: CaseRecord[] = [
  { key: '1', caseNo: 'CLS-2026060301', claimNo: 'CLM-2026060301', branch: '北京分公司', accidentDate: '2026-06-01', claimDate: '2026-06-02', currentNode: '采集智能体', status: 'processing' },
  { key: '2', caseNo: 'CLS-2026060302', claimNo: 'CLM-2026060302', branch: '上海分公司', accidentDate: '2026-05-30', claimDate: '2026-06-01', currentNode: '立案智能体', status: 'completed' },
  { key: '3', caseNo: 'CLS-2026060303', claimNo: 'CLM-2026060303', branch: '广州分公司', accidentDate: '2026-05-28', claimDate: '2026-05-30', currentNode: '理算智能体', status: 'processing' },
  { key: '4', caseNo: 'CLS-2026060304', claimNo: 'CLM-2026060304', branch: '深圳分公司', accidentDate: '2026-05-25', claimDate: '2026-05-27', currentNode: '扣费智能体', status: 'exception' },
  { key: '5', caseNo: 'CLS-2026060305', claimNo: 'CLM-2026060305', branch: '杭州分公司', accidentDate: '2026-05-22', claimDate: '2026-05-24', currentNode: '审核智能体', status: 'completed' },
  { key: '6', caseNo: 'CLS-2026060306', claimNo: 'CLM-2026060306', branch: '成都分公司', accidentDate: '2026-05-20', claimDate: '2026-05-22', currentNode: '采集智能体', status: 'processing' },
  { key: '7', caseNo: 'CLS-2026060307', claimNo: 'CLM-2026060307', branch: '武汉分公司', accidentDate: '2026-05-18', claimDate: '2026-05-20', currentNode: '立案智能体', status: 'completed' },
  { key: '8', caseNo: 'CLS-2026060308', claimNo: 'CLM-2026060308', branch: '南京分公司', accidentDate: '2026-05-15', claimDate: '2026-05-17', currentNode: '理算智能体', status: 'exception' },
  { key: '9', caseNo: 'CLS-2026060309', claimNo: 'CLM-2026060309', branch: '重庆分公司', accidentDate: '2026-05-14', claimDate: '2026-05-16', currentNode: '审核智能体', status: 'processing' },
  { key: '10', caseNo: 'CLS-2026060310', claimNo: 'CLM-2026060310', branch: '天津分公司', accidentDate: '2026-05-12', claimDate: '2026-05-14', currentNode: '扣费智能体', status: 'completed' },
  { key: '11', caseNo: 'CLS-2026060311', claimNo: 'CLM-2026060311', branch: '苏州分公司', accidentDate: '2026-05-10', claimDate: '2026-05-12', currentNode: '采集智能体', status: 'processing' },
  { key: '12', caseNo: 'CLS-2026060312', claimNo: 'CLM-2026060312', branch: '长沙分公司', accidentDate: '2026-05-08', claimDate: '2026-05-10', currentNode: '立案智能体', status: 'completed' },
  { key: '13', caseNo: 'CLS-2026060313', claimNo: 'CLM-2026060313', branch: '西安分公司', accidentDate: '2026-05-06', claimDate: '2026-05-08', currentNode: '理算智能体', status: 'exception' },
  { key: '14', caseNo: 'CLS-2026060314', claimNo: 'CLM-2026060314', branch: '郑州分公司', accidentDate: '2026-05-04', claimDate: '2026-05-06', currentNode: '扣费智能体', status: 'processing' },
  { key: '15', caseNo: 'CLS-2026060315', claimNo: 'CLM-2026060315', branch: '合肥分公司', accidentDate: '2026-05-02', claimDate: '2026-05-04', currentNode: '审核智能体', status: 'completed' },
  { key: '16', caseNo: 'CLS-2026060316', claimNo: 'CLM-2026060316', branch: '北京分公司', accidentDate: '2026-04-30', claimDate: '2026-05-02', currentNode: '采集智能体', status: 'processing' },
  { key: '17', caseNo: 'CLS-2026060317', claimNo: 'CLM-2026060317', branch: '上海分公司', accidentDate: '2026-04-28', claimDate: '2026-04-30', currentNode: '立案智能体', status: 'completed' },
  { key: '18', caseNo: 'CLS-2026060318', claimNo: 'CLM-2026060318', branch: '广州分公司', accidentDate: '2026-04-26', claimDate: '2026-04-28', currentNode: '理算智能体', status: 'processing' },
  { key: '19', caseNo: 'CLS-2026060319', claimNo: 'CLM-2026060319', branch: '深圳分公司', accidentDate: '2026-04-24', claimDate: '2026-04-26', currentNode: '扣费智能体', status: 'exception' },
  { key: '20', caseNo: 'CLS-2026060320', claimNo: 'CLM-2026060320', branch: '杭州分公司', accidentDate: '2026-04-22', claimDate: '2026-04-24', currentNode: '审核智能体', status: 'completed' },
]

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
  marginTop: 10,
}

const titleBarStyle: React.CSSProperties = {
  width: 4,
  height: 20,
  background: '#3b82f6',
  borderRadius: 10,
  marginRight: 10,
}

const titleTextStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: '#1f2937',
}

const CHEVRON_DOWN = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const MetricsClaims: React.FC = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // 筛选条件
  const [caseNoFilter, setCaseNoFilter] = useState<string | undefined>()
  const [claimNoFilter, setClaimNoFilter] = useState<string | undefined>()
  const [branchFilter, setBranchFilter] = useState<string | undefined>()
  const [accidentDateFilter, setAccidentDateFilter] = useState<string | undefined>()
  const [claimDateFilter, setClaimDateFilter] = useState<string | undefined>()
  const [nodeFilter, setNodeFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  // Dropdown open states
  const [ddCaseNo, setDdCaseNo] = useState(false)
  const [ddClaimNo, setDdClaimNo] = useState(false)
  const [ddBranch, setDdBranch] = useState(false)
  const [ddAccident, setDdAccident] = useState(false)
  const [ddClaim, setDdClaim] = useState(false)
  const [ddNode, setDdNode] = useState(false)
  const [ddStatus, setDdStatus] = useState(false)

  // Close all dropdowns on outside click
  React.useEffect(() => {
    const handler = () => {
      setDdCaseNo(false); setDdClaimNo(false); setDdBranch(false)
      setDdAccident(false); setDdClaim(false); setDdNode(false); setDdStatus(false)
    }
    if (ddCaseNo || ddClaimNo || ddBranch || ddAccident || ddClaim || ddNode || ddStatus) {
      setTimeout(() => document.addEventListener('click', handler), 0)
      return () => document.removeEventListener('click', handler)
    }
  }, [ddCaseNo, ddClaimNo, ddBranch, ddAccident, ddClaim, ddNode, ddStatus])

  const FilterDropdown: React.FC<{
    open: boolean; onToggle: () => void; onClose: () => void
    value: string | undefined; options: { label: string; value: string }[]
    onSelect: (v: string | undefined) => void; placeholder: string
  }> = ({ open, onToggle, onClose, value, options, onSelect, placeholder }) => {
    const displayLabel = value ? options.find(o => o.value === value)?.label : placeholder
    return (
      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: 120, height: 32, padding: '0 10px',
            border: '1px solid #e5e7eb', borderRadius: 10,
            background: '#fff', fontSize: 14,
            color: value ? '#374151' : '#374151',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{displayLabel}</span>
          {CHEVRON_DOWN}
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4,
            minWidth: 120, background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            maxHeight: 240, overflow: 'auto', zIndex: 10,
          }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onSelect(value === opt.value ? undefined : opt.value); onClose(); }}
                style={{
                  padding: '6px 14px', fontSize: 14, cursor: 'pointer',
                  background: value === opt.value ? '#e6f4ff' : 'transparent',
                  color: value === opt.value ? '#1677ff' : '#475569',
                  fontWeight: value === opt.value ? 600 : 400,
                }}
                onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const filteredData = React.useMemo(() => {
    return MOCK_CASES.filter(r =>
      (!caseNoFilter || r.caseNo === caseNoFilter) &&
      (!claimNoFilter || r.claimNo === claimNoFilter) &&
      (!branchFilter || r.branch === branchFilter) &&
      (!accidentDateFilter || r.accidentDate === accidentDateFilter) &&
      (!claimDateFilter || r.claimDate === claimDateFilter) &&
      (!nodeFilter || r.currentNode === nodeFilter) &&
      (!statusFilter || r.status === statusFilter)
    )
  }, [caseNoFilter, claimNoFilter, branchFilter, accidentDateFilter, claimDateFilter, nodeFilter, statusFilter])

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const clearFilters = () => {
    setCaseNoFilter(undefined)
    setClaimNoFilter(undefined)
    setBranchFilter(undefined)
    setAccidentDateFilter(undefined)
    setClaimDateFilter(undefined)
    setNodeFilter(undefined)
    setStatusFilter(undefined)
    setCurrentPage(1)
  }

  const columns: ColumnsType<CaseRecord> = [
    {
      title: '案件号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 160,
      render: (text: string, record: CaseRecord) => (
        <span
          style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            setExpandedRowKeys(prev => prev.includes(record.caseNo) ? prev.filter(k => k !== record.caseNo) : [...prev, record.caseNo])
          }}
        >
          {text}
        </span>
      ),
    },
    { title: '索赔号', dataIndex: 'claimNo', key: 'claimNo', width: 160 },
    { title: '分公司', dataIndex: 'branch', key: 'branch', width: 120 },
    { title: '出险日期', dataIndex: 'accidentDate', key: 'accidentDate', width: 120 },
    { title: '索赔日期', dataIndex: 'claimDate', key: 'claimDate', width: 120 },
    { title: '当前所处节点', dataIndex: 'currentNode', key: 'currentNode', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { color: 'default', text: status }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
  ]

  const expandedRowRender = (record: CaseRecord) => {
    const trajectory = flowDataMap[record.caseNo]
    if (!trajectory) return <div style={{ padding: '16px', color: '#999', textAlign: 'center' }}>暂无流程轨迹数据</div>
    return <FlowTrajectoryGraph trajectory={trajectory} />
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      {/* 指标看板标题 */}
      <div style={titleStyle}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>指标看板</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {METRICS_CLAIMS.map((m, i) => (
          <div key={i} style={{ flex: 1 }}>
            <MetricCard metric={m} />
          </div>
        ))}
      </div>
      <Row gutter={[16, 16]} style={{ marginTop: 28 }}>
        <Col span={24}>
          <CaseProcessingChart />
        </Col>
      </Row>

      {/* 案件清单标题 */}
      <div style={{ ...titleStyle, marginTop: 30 }}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>案件清单</span>
      </div>

      {/* 筛选区 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
      }}>
        <FilterDropdown
          open={ddCaseNo} onToggle={() => setDdCaseNo(!ddCaseNo)} onClose={() => setDdCaseNo(false)}
          value={caseNoFilter} options={MOCK_CASES.map(c => ({ label: c.caseNo, value: c.caseNo }))}
          onSelect={v => { setCaseNoFilter(v); setCurrentPage(1) }} placeholder="案件号"
        />
        <FilterDropdown
          open={ddClaimNo} onToggle={() => setDdClaimNo(!ddClaimNo)} onClose={() => setDdClaimNo(false)}
          value={claimNoFilter} options={MOCK_CASES.map(c => ({ label: c.claimNo, value: c.claimNo }))}
          onSelect={v => { setClaimNoFilter(v); setCurrentPage(1) }} placeholder="索赔号"
        />
        <FilterDropdown
          open={ddBranch} onToggle={() => setDdBranch(!ddBranch)} onClose={() => setDdBranch(false)}
          value={branchFilter} options={ALL_BRANCHES.map(b => ({ label: b, value: b }))}
          onSelect={v => { setBranchFilter(v); setCurrentPage(1) }} placeholder="分公司"
        />
        <FilterDropdown
          open={ddAccident} onToggle={() => setDdAccident(!ddAccident)} onClose={() => setDdAccident(false)}
          value={accidentDateFilter} options={[...new Set(MOCK_CASES.map(c => c.accidentDate))].map(d => ({ label: d, value: d }))}
          onSelect={v => { setAccidentDateFilter(v); setCurrentPage(1) }} placeholder="出险日期"
        />
        <FilterDropdown
          open={ddClaim} onToggle={() => setDdClaim(!ddClaim)} onClose={() => setDdClaim(false)}
          value={claimDateFilter} options={[...new Set(MOCK_CASES.map(c => c.claimDate))].map(d => ({ label: d, value: d }))}
          onSelect={v => { setClaimDateFilter(v); setCurrentPage(1) }} placeholder="索赔日期"
        />
        <FilterDropdown
          open={ddNode} onToggle={() => setDdNode(!ddNode)} onClose={() => setDdNode(false)}
          value={nodeFilter} options={ALL_NODES.map(n => ({ label: n, value: n }))}
          onSelect={v => { setNodeFilter(v); setCurrentPage(1) }} placeholder="当前节点"
        />
        <FilterDropdown
          open={ddStatus} onToggle={() => setDdStatus(!ddStatus)} onClose={() => setDdStatus(false)}
          value={statusFilter} options={ALL_STATUSES.map(s => ({ label: s.text, value: s.value }))}
          onSelect={v => { setStatusFilter(v); setCurrentPage(1) }} placeholder="状态"
        />
        <button
          onClick={clearFilters}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            height: 32,
            padding: '0 14px',
            fontSize: 14,
            cursor: 'pointer',
            background: '#fff',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          重置
        </button>
      </div>

      <Table
        columns={columns}
        dataSource={pagedData}
        pagination={false}
        size="small"
        rowKey="caseNo"
        expandable={{
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(prev => expanded ? [...prev, record.caseNo] : prev.filter(k => k !== record.caseNo))
          },
          expandedRowRender,
          expandIconColumnIndex: -1,
        }}
      />

      {/* 底部栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#000000e0' }}>共 {filteredData.length} 条数据</span>
          <button
            onClick={() => console.log('导出')}
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
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['10', '20', '50']}
          onChange={(page, size) => { setCurrentPage(page); if (size !== pageSize) { setPageSize(size); setCurrentPage(1) } }}
          size="small"
        />
      </div>
    </div>
  )
}

export default MetricsClaims

import React, { useState } from 'react'
import { Row, Col, Table, Tag, Pagination, Input, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import MetricCard from '../../dashboard/components/smart-services/metric-card'
import CaseProcessingChart from '../../dashboard/components/smart-services/case-processing-chart'

const METRICS_CLAIMS: { label: string; value: string }[] = [
  { label: 'Tokens使用量', value: '12.8万' },
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

// ========== 动态流程轨迹生成 ==========
function generateFlowTrajectory(caseNo: string, status: string): FlowTrajectory {
  const lastChar = parseInt(caseNo.slice(-2), 10)
  const nodes: { label: string; status: NodeStatus }[] = NODE_LABELS.map(label => ({ label, status: 'processing' as NodeStatus }))

  if (status === 'completed') {
    // 已完成：全部节点已完成
    for (let i = 0; i < nodes.length; i++) nodes[i].status = 'completed'
  } else if (status === 'processing') {
    // 处理中：前 N 个已完成，其余未执行
    const completedCount = 1 + (lastChar % 5) // 1~5 个已完成节点
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].status = i <= completedCount ? 'completed' : 'processing'
    }
  } else if (status === 'exception') {
    // 异常：前 N 个已完成 → 紧接着 1 个异常 → 之后全部未执行（顺序严格）
    const completedCount = 2 + (lastChar % 3) // 2~4 个已完成节点
    const exceptionIdx = completedCount // 异常节点紧跟在已完成节点之后
    for (let i = 0; i < nodes.length; i++) {
      if (i < completedCount) nodes[i].status = 'completed'
      else if (i === exceptionIdx) nodes[i].status = 'exception'
      else nodes[i].status = 'processing'
    }
  }

  return { nodes }
}

// ========== 流程轨迹图组件 ==========
const NODE_R = 14
const NODE_GAP = 74
const SVG_W = NODE_LABELS.length * NODE_GAP + 20
const SVG_H = 60
const PENDING_COLOR = '#9ca3af'

// mock 处理时长（秒级），keyed by caseNo -> nodeLabel，每个节点时长不同
const NODE_PROCESSING_TIMES: Record<string, Record<string, number>> = {
  'CLS-2026060301': { '开始': 0.5, '采集': 2.3, '立案': 1.8, '理算': 3.1, '扣费': 1.5, '审核': 4.2, '结束': 0.8 },
  'CLS-2026060302': { '开始': 0.3, '采集': 1.5, '立案': 2.0, '理算': 2.8, '扣费': 1.2, '审核': 3.5, '结束': 0.6 },
  'CLS-2026060303': { '开始': 0.7, '采集': 2.1, '立案': 1.5, '理算': 3.3, '扣费': 2.0, '审核': 4.8, '结束': 0.9 },
  'CLS-2026060304': { '开始': 0.4, '采集': 1.8, '立案': 2.5, '理算': 2.5, '扣费': 1.8, '审核': 3.2, '结束': 0.7 },
  'CLS-2026060305': { '开始': 0.6, '采集': 2.0, '立案': 1.2, '理算': 3.5, '扣费': 2.2, '审核': 3.8, '结束': 0.5 },
  'CLS-2026060306': { '开始': 0.8, '采集': 2.5, '立案': 1.9, '理算': 2.7, '扣费': 1.6, '审核': 4.0, '结束': 0.9 },
  'CLS-2026060307': { '开始': 0.2, '采集': 1.6, '立案': 2.2, '理算': 3.0, '扣费': 1.4, '审核': 3.6, '结束': 0.7 },
  'CLS-2026060308': { '开始': 0.5, '采集': 2.4, '立案': 1.7, '理算': 2.9, '扣费': 2.1, '审核': 4.5, '结束': 0.8 },
  'CLS-2026060309': { '开始': 0.9, '采集': 1.9, '立案': 2.3, '理算': 3.2, '扣费': 1.3, '审核': 3.9, '结束': 0.6 },
  'CLS-2026060310': { '开始': 0.3, '采集': 2.2, '立案': 1.6, '理算': 2.6, '扣费': 1.7, '审核': 4.1, '结束': 0.5 },
  'CLS-2026060311': { '开始': 0.7, '采集': 1.7, '立案': 2.4, '理算': 3.4, '扣费': 2.0, '审核': 3.7, '结束': 0.8 },
  'CLS-2026060312': { '开始': 0.4, '采集': 2.6, '立案': 1.3, '理算': 2.8, '扣费': 1.5, '审核': 4.3, '结束': 0.7 },
  'CLS-2026060313': { '开始': 0.6, '采集': 1.4, '立案': 2.1, '理算': 3.1, '扣费': 2.3, '审核': 3.4, '结束': 0.9 },
  'CLS-2026060314': { '开始': 0.8, '采集': 2.3, '立案': 1.8, '理算': 2.5, '扣费': 1.9, '审核': 4.6, '结束': 0.6 },
  'CLS-2026060315': { '开始': 0.2, '采集': 1.5, '立案': 2.6, '理算': 3.6, '扣费': 1.2, '审核': 3.3, '结束': 0.5 },
  'CLS-2026060316': { '开始': 0.5, '采集': 2.7, '立案': 1.4, '理算': 2.4, '扣费': 2.1, '审核': 4.0, '结束': 0.8 },
  'CLS-2026060317': { '开始': 0.9, '采集': 1.8, '立案': 2.0, '理算': 3.3, '扣费': 1.6, '审核': 3.8, '结束': 0.7 },
  'CLS-2026060318': { '开始': 0.3, '采集': 2.1, '立案': 1.7, '理算': 2.7, '扣费': 1.8, '审核': 4.4, '结束': 0.9 },
  'CLS-2026060319': { '开始': 0.6, '采集': 1.6, '立案': 2.5, '理算': 3.5, '扣费': 2.0, '审核': 3.5, '结束': 0.6 },
  'CLS-2026060320': { '开始': 0.4, '采集': 2.4, '立案': 1.3, '理算': 2.9, '扣费': 1.4, '审核': 4.7, '结束': 0.5 },
}

const FlowTrajectoryGraph: React.FC<{ trajectory: FlowTrajectory; caseNo?: string }> = ({ trajectory, caseNo }) => {
  const nodeTimes = caseNo ? NODE_PROCESSING_TIMES[caseNo] : undefined
  return (
    <div style={{ padding: '24px', background: '#f9fafb', borderRadius: 8 }}>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ overflow: 'visible' }}>
        {NODE_LABELS.map((label, i) => {
          const node = trajectory.nodes[i] || { label, status: 'processing' as NodeStatus }
          const cx = 20 + i * NODE_GAP
          const cy = SVG_H / 2
          const isCompleted = node.status === 'completed'
          const isException = node.status === 'exception'
          const color = isCompleted ? STATUS_COLORS.completed : isException ? STATUS_COLORS.exception : PENDING_COLOR
          const icon = isCompleted ? '✓' : isException ? '✗' : '·'
          const iconSize = isCompleted ? 16 : 10
          const nodeTime = isCompleted && nodeTimes ? nodeTimes[label] : undefined
          const labelText = nodeTime !== undefined ? `${label} (${nodeTime}s)` : label

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
              <circle cx={cx} cy={cy} r={NODE_R} fill={isCompleted || isException ? color : 'none'} stroke={color} strokeWidth={2} />
              <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fill={isCompleted || isException ? '#fff' : color} fontSize={iconSize} fontWeight="bold">{icon}</text>
              <text x={cx} y={cy + NODE_R + 20} textAnchor="middle" fill="#000000e0" fontSize={12}>{labelText}</text>
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

const MetricsClaims: React.FC = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // 筛选条件
  const [caseNoFilter, setCaseNoFilter] = useState('')
  const [claimNoFilter, setClaimNoFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [accidentDateFilter, setAccidentDateFilter] = useState('')
  const [claimDateFilter, setClaimDateFilter] = useState('')
  const [nodeFilter, setNodeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredData = React.useMemo(() => {
    return MOCK_CASES.filter(r =>
      (!caseNoFilter || r.caseNo.includes(caseNoFilter)) &&
      (!claimNoFilter || r.claimNo.includes(claimNoFilter)) &&
      (!branchFilter || r.branch.includes(branchFilter)) &&
      (!accidentDateFilter || r.accidentDate.includes(accidentDateFilter)) &&
      (!claimDateFilter || r.claimDate.includes(claimDateFilter)) &&
      (!nodeFilter || r.currentNode.includes(nodeFilter)) &&
      (!statusFilter || r.status.includes(statusFilter))
    )
  }, [caseNoFilter, claimNoFilter, branchFilter, accidentDateFilter, claimDateFilter, nodeFilter, statusFilter])

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const clearFilters = () => {
    setCaseNoFilter('')
    setClaimNoFilter('')
    setBranchFilter('')
    setAccidentDateFilter('')
    setClaimDateFilter('')
    setNodeFilter('')
    setStatusFilter('')
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
    const trajectory = generateFlowTrajectory(record.caseNo, record.status)
    return <FlowTrajectoryGraph trajectory={trajectory} caseNo={record.caseNo} />
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

      {/* 查询区 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
      }}>
        <Input
          placeholder="案件号"
          value={caseNoFilter}
          onChange={e => { setCaseNoFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 140 }}
        />
        <Input
          placeholder="索赔号"
          value={claimNoFilter}
          onChange={e => { setClaimNoFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 140 }}
        />
        <Input
          placeholder="分公司"
          value={branchFilter}
          onChange={e => { setBranchFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 130 }}
        />
        <Input
          placeholder="出险日期"
          value={accidentDateFilter}
          onChange={e => { setAccidentDateFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 120 }}
        />
        <Input
          placeholder="索赔日期"
          value={claimDateFilter}
          onChange={e => { setClaimDateFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 120 }}
        />
        <Input
          placeholder="当前节点"
          value={nodeFilter}
          onChange={e => { setNodeFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 130 }}
        />
        <Input
          placeholder="状态"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 100 }}
        />
        <Button onClick={clearFilters}>重置</Button>
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

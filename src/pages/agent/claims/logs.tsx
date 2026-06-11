import React, { useState } from 'react'
import { Table, Tag, Pagination, Input, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons'

const AGENT_TABS = ['采集', '立案', '扣费', '理算', '审核'] as const
type AgentTab = typeof AGENT_TABS[number]

interface LogRecord {
  key: string
  taskId: string
  requestId: string
  caseNo: string
  status: string
  createdAt: string
  platformTime: string
  engineTime: string
  engineMsg: string
  imageCount: number
}

const MOCK_LOGS: LogRecord[] = [
  { key: '1', taskId: '2044719745388838912', requestId: 'b7bc330fe0654f468c7663770a0d9f26', caseNo: 'GIC00037114', status: 'success', createdAt: '2026-04-16 18:09:11', platformTime: '25s 73ms', engineTime: '24s 899ms', engineMsg: '处理成功', imageCount: 21 },
  { key: '2', taskId: '2044719736878596096', requestId: '891bc433a4564a21b895580c67270164', caseNo: 'GIC00037113', status: 'success', createdAt: '2026-04-16 18:09:08', platformTime: '19s 543ms', engineTime: '19s 373ms', engineMsg: '处理成功', imageCount: 12 },
  { key: '3', taskId: '2044719603805908992', requestId: '227439a13388485a8766329fa42d1ffd', caseNo: 'GIC00037112', status: 'success', createdAt: '2026-04-16 18:08:37', platformTime: '38s 306ms', engineTime: '38s 151ms', engineMsg: '处理成功', imageCount: 13 },
  { key: '4', taskId: '2044719518950944768', requestId: '2facbc65ba7e482bbdeb4ad14069ca...', caseNo: '11011547871', status: 'success', createdAt: '2026-04-16 18:08:17', platformTime: '21s 125ms', engineTime: '20s 977ms', engineMsg: '处理成功', imageCount: 17 },
  { key: '5', taskId: '2044719300322852864', requestId: '99297ee286bf402089c31307b0992176', caseNo: '78011547858', status: 'success', createdAt: '2026-04-16 18:07:24', platformTime: '30s 727ms', engineTime: '30s 572ms', engineMsg: '处理成功', imageCount: 19 },
  { key: '6', taskId: '2044719261856886784', requestId: '2ba5a98ddd23457bb2c04a4cb014d...', caseNo: 'A1011547856', status: 'success', createdAt: '2026-04-16 18:07:15', platformTime: '1m 50s 148ms', engineTime: '1m 49s 766ms', engineMsg: '处理成功', imageCount: 55 },
  { key: '7', taskId: '2044719233176240128', requestId: 'c482fa584d1b47ada91103acdf0c981fa', caseNo: 'N1011547855', status: 'success', createdAt: '2026-04-16 18:07:08', platformTime: '41s 322ms', engineTime: '41s 166ms', engineMsg: '处理成功', imageCount: 21 },
  { key: '8', taskId: '2044719113193984000', requestId: '3433d280eaee4c669559eac4abcdcb898', caseNo: 'D4011547864', status: 'success', createdAt: '2026-04-16 18:06:40', platformTime: '2m 27s 84ms', engineTime: '2m 26s 507ms', engineMsg: '处理成功', imageCount: 104 },
  { key: '9', taskId: '2044719078137982976', requestId: 'a3a378cecf3f48fd9160a8f9c4fe0476', caseNo: '11011547853', status: 'success', createdAt: '2026-04-16 18:06:31', platformTime: '1m 40s 940ms', engineTime: '1m 40s 675ms', engineMsg: '处理成功', imageCount: 42 },
  { key: '10', taskId: '2044719058663837696', requestId: '47a0b640498143aab89f03d94e0756', caseNo: '11011547863', status: 'success', createdAt: '2026-04-16 18:06:27', platformTime: '2m 26s 667ms', engineTime: '2m 26s 348ms', engineMsg: '处理成功', imageCount: 40 },
  { key: '11', taskId: '2044719038925184512', requestId: 'b5d4e1a2c3f48790abcdef1234567890', caseNo: 'GIC00037115', status: 'success', createdAt: '2026-04-16 18:06:15', platformTime: '33s 210ms', engineTime: '33s 058ms', engineMsg: '处理成功', imageCount: 28 },
  { key: '12', taskId: '2044719018742386688', requestId: 'c6e5f2b3d4a59801bcdef23456789012', caseNo: 'GIC00037116', status: 'failed', createdAt: '2026-04-16 18:06:02', platformTime: '1m 12s 450ms', engineTime: '1m 12s 200ms', engineMsg: '引擎超时', imageCount: 35 },
  { key: '13', taskId: '2044718998560002048', requestId: 'd7f6a3c4e5b60912cdef345678901234', caseNo: 'E2011547870', status: 'success', createdAt: '2026-04-16 18:05:48', platformTime: '45s 890ms', engineTime: '45s 620ms', engineMsg: '处理成功', imageCount: 62 },
  { key: '14', taskId: '2044718978377617408', requestId: 'e8a7b4d5f6c71a23def4567890123456', caseNo: 'F3011547872', status: 'success', createdAt: '2026-04-16 18:05:35', platformTime: '28s 340ms', engineTime: '28s 180ms', engineMsg: '处理成功', imageCount: 15 },
  { key: '15', taskId: '2044718958195232768', requestId: 'f9b8c5e6a7d82b34ef56789012345678', caseNo: 'GIC00037117', status: 'success', createdAt: '2026-04-16 18:05:20', platformTime: '52s 770ms', engineTime: '52s 510ms', engineMsg: '处理成功', imageCount: 48 },
  { key: '16', taskId: '2044718938012848128', requestId: 'a0c9d6f7b8e93c45fa67890123456789', caseNo: 'GIC00037118', status: 'success', createdAt: '2026-04-16 18:05:08', platformTime: '1m 05s 200ms', engineTime: '1m 04s 950ms', engineMsg: '处理成功', imageCount: 73 },
  { key: '17', taskId: '2044718917830463488', requestId: 'b1d0e7a8c9f04d56ab78901234567890', caseNo: 'H4011547875', status: 'success', createdAt: '2026-04-16 18:04:55', platformTime: '37s 480ms', engineTime: '37s 320ms', engineMsg: '处理成功', imageCount: 22 },
  { key: '18', taskId: '2044718897648078848', requestId: 'c2e1f8b9d0a15e67bc89012345678901', caseNo: 'GIC00037119', status: 'failed', createdAt: '2026-04-16 18:04:42', platformTime: '2m 35s 600ms', engineTime: '2m 35s 300ms', engineMsg: '图片格式不支持', imageCount: 88 },
  { key: '19', taskId: '2044718877465694208', requestId: 'd3f2a9c0e1b26f78cd90123456789012', caseNo: 'I5011547878', status: 'success', createdAt: '2026-04-16 18:04:28', platformTime: '42s 160ms', engineTime: '41s 980ms', engineMsg: '处理成功', imageCount: 31 },
  { key: '20', taskId: '2044718857283309568', requestId: 'e4a3b0d1f2c37a89de01234567890123', caseNo: 'GIC00037120', status: 'success', createdAt: '2026-04-16 18:04:15', platformTime: '55s 930ms', engineTime: '55s 710ms', engineMsg: '处理成功', imageCount: 45 },
]

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 20,
  marginTop: 0,
}

const titleBarStyle: React.CSSProperties = {
  width: 4,
  height: 20,
  background: '#3b82f6',
  borderRadius: 10,
  marginRight: 10,
}

const titleTextStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1f2937',
}

const AgentClaimsLogs: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AgentTab>('采集')
  const [taskIdFilter, setTaskIdFilter] = useState('')
  const [caseNoFilter, setCaseNoFilter] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = React.useMemo(() => {
    return MOCK_LOGS.filter(r =>
      (!taskIdFilter || r.taskId.includes(taskIdFilter)) &&
      (!caseNoFilter || r.caseNo.includes(caseNoFilter))
    )
  }, [taskIdFilter, caseNoFilter])

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const clearFilters = () => {
    setTaskIdFilter('')
    setCaseNoFilter('')
    setCurrentPage(1)
  }

  const columns: ColumnsType<LogRecord> = [
    { title: '任务号', dataIndex: 'taskId', key: 'taskId', width: 180, ellipsis: true },
    { title: '请求ID', dataIndex: 'requestId', key: 'requestId', width: 220, ellipsis: true },
    { title: '案件号', dataIndex: 'caseNo', key: 'caseNo', width: 130 },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'} style={{ borderRadius: 6 }}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
    { title: '平台耗时', dataIndex: 'platformTime', key: 'platformTime', width: 120 },
    { title: '引擎耗时', dataIndex: 'engineTime', key: 'engineTime', width: 120 },
    { title: '引擎返回消息', dataIndex: 'engineMsg', key: 'engineMsg', width: 140, ellipsis: true },
    { title: '图片数量', dataIndex: 'imageCount', key: 'imageCount', width: 90, align: 'center' },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: unknown, record: LogRecord) => (
        <Space size={8}>
          <EyeOutlined
            onClick={() => navigate(`/agent/claims/task-detail?caseNo=${record.caseNo}&taskId=${record.taskId}`)}
            style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }}
          />
          <DownloadOutlined style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }} />
        </Space>
      ),
    },
  ]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      {/* Tab 标签 */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 28,
        borderBottom: '1px solid #e8e8e8',
      }}>
        {AGENT_TABS.map((tab) => {
          const active = tab === activeTab
          return (
            <div
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1) }}
              style={{
                padding: '10px 24px',
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
              {tab}
            </div>
          )
        })}
      </div>

      {/* 标题 */}
      <div style={titleStyle}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>日志清单</span>
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
          placeholder="任务号"
          value={taskIdFilter}
          onChange={e => { setTaskIdFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 200 }}
        />
        <Input
          placeholder="案件号"
          value={caseNoFilter}
          onChange={e => { setCaseNoFilter(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 200 }}
        />
        {/* <Button type="primary" style={{ background: '#3b82f6', border: 'none' }}>查询</Button> */}
        <Button onClick={clearFilters}>重置</Button>
      </div>

      <Table
        columns={columns}
        dataSource={pagedData}
        pagination={false}
        size="small"
        rowKey="key"
        scroll={{ x: 1400 }}
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
          onChange={(page, size) => {
            if (size !== pageSize) { setPageSize(size); setCurrentPage(1) } else { setCurrentPage(page) }
          }}
          size="small"
        />
      </div>
    </div>
  )
}

export default AgentClaimsLogs

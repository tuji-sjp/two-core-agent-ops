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
  { key: '1', taskId: '2044719745388838912', requestId: 'a001', caseNo: 'A1000000000', status: 'success', createdAt: '2026-06-02 10:23', platformTime: '25s 137ms', engineTime: '24s 882ms', engineMsg: '处理成功', imageCount: 23 },
  { key: '2', taskId: '2044719745288838912', requestId: 'a002', caseNo: 'A1000000000', status: 'success', createdAt: '2026-06-02 10:25', platformTime: '32s 174ms', engineTime: '31s 865ms', engineMsg: '处理成功', imageCount: 34 },
  { key: '3', taskId: '2044719745188838912', requestId: 'b003', caseNo: 'B1000000001', status: 'failed', createdAt: '2026-06-01 09:15', platformTime: '39s 211ms', engineTime: '38s 11ms', engineMsg: '引擎超时', imageCount: 45 },
  { key: '4', taskId: '2044719745088838912', requestId: 'b004', caseNo: 'B1000000001', status: 'success', createdAt: '2026-06-01 09:16', platformTime: '46s 248ms', engineTime: '45s 48ms', engineMsg: '处理成功', imageCount: 56 },
  { key: '5', taskId: '2044719744988838912', requestId: 'b005', caseNo: 'B1000000001', status: 'success', createdAt: '2026-06-01 09:17', platformTime: '53s 285ms', engineTime: '52s 85ms', engineMsg: '处理成功', imageCount: 67 },
  { key: '6', taskId: '2044719744888838912', requestId: 'b006', caseNo: 'B1000000001', status: 'failed', createdAt: '2026-06-01 09:18', platformTime: '1m 0s 322ms', engineTime: '59s 122ms', engineMsg: '引擎超时', imageCount: 78 },
  { key: '7', taskId: '2044719744788838912', requestId: 'c007', caseNo: 'C1000000002', status: 'success', createdAt: '2026-05-30 14:10', platformTime: '1m 7s 359ms', engineTime: '1m 6s 159ms', engineMsg: '处理成功', imageCount: 89 },
  { key: '8', taskId: '2044719744688838912', requestId: 'd008', caseNo: 'D1000000003', status: 'success', createdAt: '2026-05-27 11:00', platformTime: '1m 14s 396ms', engineTime: '1m 13s 196ms', engineMsg: '处理成功', imageCount: 20 },
  { key: '9', taskId: '2044719744588838912', requestId: 'd009', caseNo: 'D1000000003', status: 'failed', createdAt: '2026-05-27 11:01', platformTime: '1m 21s 433ms', engineTime: '1m 20s 233ms', engineMsg: '引擎超时', imageCount: 31 },
  { key: '10', taskId: '2044719744488838912', requestId: 'e010', caseNo: 'E1000000004', status: 'success', createdAt: '2026-05-24 08:30', platformTime: '1m 28s 470ms', engineTime: '1m 27s 270ms', engineMsg: '处理成功', imageCount: 42 },
  { key: '11', taskId: '2044719744388838912', requestId: 'e011', caseNo: 'E1000000004', status: 'success', createdAt: '2026-05-24 08:31', platformTime: '1m 35s 507ms', engineTime: '1m 34s 307ms', engineMsg: '处理成功', imageCount: 53 },
  { key: '12', taskId: '2044719744288838912', requestId: 'e012', caseNo: 'E1000000004', status: 'failed', createdAt: '2026-05-24 08:32', platformTime: '22s 544ms', engineTime: '21s 344ms', engineMsg: '引擎超时', imageCount: 64 },
  { key: '13', taskId: '2044719744188838912', requestId: 'f013', caseNo: 'F1000000005', status: 'success', createdAt: '2026-05-22 16:00', platformTime: '29s 581ms', engineTime: '28s 381ms', engineMsg: '处理成功', imageCount: 75 },
  { key: '14', taskId: '2044719744088838912', requestId: 'g014', caseNo: 'G1000000006', status: 'success', createdAt: '2026-05-20 13:00', platformTime: '36s 618ms', engineTime: '35s 418ms', engineMsg: '处理成功', imageCount: 86 },
  { key: '15', taskId: '2044719743988838912', requestId: 'g015', caseNo: 'G1000000006', status: 'failed', createdAt: '2026-05-20 13:01', platformTime: '43s 655ms', engineTime: '42s 455ms', engineMsg: '引擎超时', imageCount: 17 },
  { key: '16', taskId: '2044719743888838912', requestId: 'h016', caseNo: 'H1000000007', status: 'success', createdAt: '2026-05-17 10:00', platformTime: '50s 692ms', engineTime: '49s 492ms', engineMsg: '处理成功', imageCount: 28 },
  { key: '17', taskId: '2044719743788838912', requestId: 'i017', caseNo: 'I1000000008', status: 'success', createdAt: '2026-05-16 09:00', platformTime: '57s 729ms', engineTime: '56s 529ms', engineMsg: '处理成功', imageCount: 39 },
  { key: '18', taskId: '2044719743688838912', requestId: 'i018', caseNo: 'I1000000008', status: 'failed', createdAt: '2026-05-16 09:01', platformTime: '1m 4s 766ms', engineTime: '1m 3s 566ms', engineMsg: '引擎超时', imageCount: 50 },
  { key: '19', taskId: '2044719743588838912', requestId: 'j019', caseNo: 'J1000000009', status: 'success', createdAt: '2026-05-14 14:30', platformTime: '1m 11s 803ms', engineTime: '1m 10s 603ms', engineMsg: '处理成功', imageCount: 61 },
  { key: '20', taskId: '2044719743488838912', requestId: 'j020', caseNo: 'J1000000009', status: 'success', createdAt: '2026-05-14 14:31', platformTime: '1m 18s 840ms', engineTime: '1m 17s 640ms', engineMsg: '处理成功', imageCount: 72 },
  { key: '21', taskId: '2044719743388838912', requestId: 'j021', caseNo: 'J1000000009', status: 'failed', createdAt: '2026-05-14 14:32', platformTime: '1m 25s 877ms', engineTime: '1m 24s 677ms', engineMsg: '引擎超时', imageCount: 83 },
  { key: '22', taskId: '2044719743288838912', requestId: 'k022', caseNo: 'K1000000010', status: 'success', createdAt: '2026-05-13 10:00', platformTime: '1m 32s 914ms', engineTime: '1m 31s 714ms', engineMsg: '处理成功', imageCount: 14 },
  { key: '23', taskId: '2044719743188838912', requestId: 'k023', caseNo: 'K1000000010', status: 'success', createdAt: '2026-05-13 10:02', platformTime: '19s 951ms', engineTime: '18s 751ms', engineMsg: '处理成功', imageCount: 25 },
  { key: '24', taskId: '2044719743088838912', requestId: 'l024', caseNo: 'L1000000011', status: 'failed', createdAt: '2026-05-12 11:00', platformTime: '26s 988ms', engineTime: '25s 788ms', engineMsg: '引擎超时', imageCount: 36 },
  { key: '25', taskId: '2044719742988838912', requestId: 'm025', caseNo: 'M1000000012', status: 'success', createdAt: '2026-05-10 15:00', platformTime: '33s 126ms', engineTime: '32s 474ms', engineMsg: '处理成功', imageCount: 47 },
  { key: '26', taskId: '2044719742888838912', requestId: 'm026', caseNo: 'M1000000012', status: 'success', createdAt: '2026-05-10 15:01', platformTime: '40s 163ms', engineTime: '39s 457ms', engineMsg: '处理成功', imageCount: 58 },
  { key: '27', taskId: '2044719742788838912', requestId: 'n027', caseNo: 'N1000000013', status: 'failed', createdAt: '2026-05-08 09:30', platformTime: '47s 200ms', engineTime: '46s 440ms', engineMsg: '引擎超时', imageCount: 69 },
  { key: '28', taskId: '2044719742688838912', requestId: 'o028', caseNo: 'O1000000014', status: 'success', createdAt: '2026-05-06 10:00', platformTime: '54s 237ms', engineTime: '53s 37ms', engineMsg: '处理成功', imageCount: 80 },
  { key: '29', taskId: '2044719742588838912', requestId: 'o029', caseNo: 'O1000000014', status: 'success', createdAt: '2026-05-06 10:01', platformTime: '1m 1s 274ms', engineTime: '1m 0s 74ms', engineMsg: '处理成功', imageCount: 91 },
  { key: '30', taskId: '2044719742488838912', requestId: 'p030', caseNo: 'P1000000015', status: 'failed', createdAt: '2026-05-04 08:00', platformTime: '1m 8s 311ms', engineTime: '1m 7s 111ms', engineMsg: '引擎超时', imageCount: 22 },
  { key: '31', taskId: '2044719742388838912', requestId: 'q031', caseNo: 'Q1000000016', status: 'success', createdAt: '2026-05-02 12:00', platformTime: '1m 15s 348ms', engineTime: '1m 14s 148ms', engineMsg: '处理成功', imageCount: 33 },
  { key: '32', taskId: '2044719742288838912', requestId: 'q032', caseNo: 'Q1000000016', status: 'success', createdAt: '2026-05-02 12:01', platformTime: '1m 22s 385ms', engineTime: '1m 21s 185ms', engineMsg: '处理成功', imageCount: 44 },
  { key: '33', taskId: '2044719742188838912', requestId: 'q033', caseNo: 'Q1000000016', status: 'failed', createdAt: '2026-05-02 12:02', platformTime: '1m 29s 422ms', engineTime: '1m 28s 222ms', engineMsg: '引擎超时', imageCount: 55 },
  { key: '34', taskId: '2044719742088838912', requestId: 'r034', caseNo: 'R1000000017', status: 'success', createdAt: '2026-04-30 16:30', platformTime: '1m 36s 459ms', engineTime: '1m 35s 259ms', engineMsg: '处理成功', imageCount: 66 },
  { key: '35', taskId: '2044719741988838912', requestId: 's035', caseNo: 'S1000000018', status: 'success', createdAt: '2026-04-28 14:00', platformTime: '23s 496ms', engineTime: '22s 296ms', engineMsg: '处理成功', imageCount: 77 },
  { key: '36', taskId: '2044719741888838912', requestId: 's036', caseNo: 'S1000000018', status: 'failed', createdAt: '2026-04-28 14:01', platformTime: '30s 533ms', engineTime: '29s 333ms', engineMsg: '引擎超时', imageCount: 88 },
  { key: '37', taskId: '2044719741788838912', requestId: 't037', caseNo: 'T1000000019', status: 'success', createdAt: '2026-04-26 09:00', platformTime: '37s 570ms', engineTime: '36s 370ms', engineMsg: '处理成功', imageCount: 19 },
  { key: '38', taskId: '2044719741688838912', requestId: 'u038', caseNo: 'U1000000020', status: 'success', createdAt: '2026-04-24 11:30', platformTime: '44s 607ms', engineTime: '43s 407ms', engineMsg: '处理成功', imageCount: 30 },
  { key: '39', taskId: '2044719741588838912', requestId: 'u039', caseNo: 'U1000000020', status: 'failed', createdAt: '2026-04-24 11:31', platformTime: '51s 644ms', engineTime: '50s 444ms', engineMsg: '引擎超时', imageCount: 41 }
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
    { title: '调用时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
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

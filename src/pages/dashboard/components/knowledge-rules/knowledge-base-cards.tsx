import React, { useState } from 'react'
import { Table, Tag, Modal, Form, Input, Button, Select, Space, Pagination, Tabs, Popconfirm, message } from 'antd'
import { FileTextOutlined, EditOutlined, EyeOutlined, HistoryOutlined, TableOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { underwritingKnowledge, claimsKnowledge } from '../../data/mock-data'
import type { KnowledgeItem } from '../../data/mock-data'

const { TextArea } = Input

const statusMap: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '生效中' },
  updating: { color: 'orange', label: '修订中' },
  deprecated: { color: 'default', label: '已废弃' },
}

function buildColumns(
  tab: 'claims' | 'underwriting',
  onPreview: (doc: KnowledgeItem) => void,
  onEdit: (doc: KnowledgeItem) => void,
): ColumnsType<KnowledgeItem> {
  if (tab === 'underwriting') {
    // 核保知识库：原始 6 列表头
    return [
      {
        title: '文档名称',
        dataIndex: 'name',
        key: 'name',
        width: '30%',
        render: (text: string, record: KnowledgeItem) => (
          <span style={{ fontWeight: 500, color: '#1f2937' }}>
            {record.docType === 'sheet' ? (
              <TableOutlined style={{ marginRight: 6, color: '#22c55e', fontSize: 14 }} />
            ) : (
              <FileTextOutlined style={{ marginRight: 6, color: '#3b82f6', fontSize: 14 }} />
            )}
            {text}
          </span>
        ),
      },
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        width: '8%',
        align: 'center' as const,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        align: 'center' as const,
        render: (status: string) => {
          const s = statusMap[status] || statusMap.active
          return <Tag color={s.color} style={{ borderRadius: 6 }}>{s.label}</Tag>
        },
      },
      {
        title: '知识提供方',
        dataIndex: 'author',
        key: 'author',
        width: '14%',
      },
      {
        title: '最近更新',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: '12%',
        align: 'center' as const,
      },
      {
        title: '操作',
        key: 'actions',
        width: '12%',
        align: 'center' as const,
        render: (_: unknown, record: KnowledgeItem) => (
          <Space size={8}>
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => onPreview(record)} style={{ padding: 0 }}>预览</Button>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} style={{ padding: 0 }}>编辑</Button>
          </Space>
        ),
      },
    ]
  }

  // 理赔知识库：9 列表头
  const CELL_COLOR = '#000000e0'
  return [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: '14%',
      render: (text: string, record: KnowledgeItem) => (
        <span style={{ fontWeight: 500, color: CELL_COLOR }}>
          {record.docType === 'sheet' ? (
            <TableOutlined style={{ marginRight: 6, color: '#22c55e', fontSize: 14 }} />
          ) : (
            <FileTextOutlined style={{ marginRight: 6, color: '#3b82f6', fontSize: 14 }} />
          )}
          {text}
        </span>
      ),
    },
    {
      title: '知识分类',
      dataIndex: 'category',
      key: 'category',
      width: '8%',
      render: (text: string) => (
        <Tag color="blue" style={{ borderRadius: 6, margin: 0 }}>{text}</Tag>
      ),
    },
    {
      title: '内容简述',
      dataIndex: 'summary',
      key: 'summary',
      width: '16%',
      ellipsis: true,
      render: (text: string) => (
        <span style={{ color: CELL_COLOR, fontSize: 12 }}>{text}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '9%',
      render: (text: string) => <span style={{ color: CELL_COLOR }}>{text}</span>,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: '9%',
      render: (text: string) => <span style={{ color: CELL_COLOR }}>{text}</span>,
    },
    {
      title: '最新版本',
      dataIndex: 'version',
      key: 'version',
      width: '7%',
      render: (text: string) => <span style={{ color: CELL_COLOR }}>{text}</span>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '9%',
      render: (text: string) => <span style={{ color: CELL_COLOR }}>{text}</span>,
    },
    {
      title: '更新人',
      dataIndex: 'author',
      key: 'author',
      width: '9%',
      render: (text: string) => <span style={{ color: CELL_COLOR }}>{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '7%',
      render: (status: string) => {
        const s = statusMap[status] || statusMap.active
        return <Tag color={s.color} style={{ borderRadius: 6 }}>{s.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: '10%',
      render: (_: unknown, record: KnowledgeItem) => (
        <Space size={8}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onPreview(record)}
            style={{ padding: 0 }}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            style={{ padding: 0 }}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ]
}

// ========== 飞书风格 Word 文档查看器 ==========
const WordDocumentViewer: React.FC<{
  title: string
  version: string
  author: string
  date: string
  content: string
  editable?: boolean
  onContentChange?: (content: string) => void
}> = ({ title, version, author, date, content, editable = false, onContentChange }) => {
  if (editable) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 10,
        padding: '40px 48px',
        minHeight: 500,
        maxHeight: 600,
        overflowY: 'auto',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}>
        <TextArea
          value={content}
          onChange={e => onContentChange?.(e.target.value)}
          autoSize={{ minRows: 20, maxRows: 40 }}
          style={{
            border: 'none', outline: 'none', boxShadow: 'none',
            background: 'transparent', fontSize: 14, lineHeight: 2,
            color: '#333', resize: 'none', padding: 0,
          }}
        />
      </div>
    )
  }

  const lines = content.split('\n').filter(Boolean)

  return (
    <div style={{
      background: '#fff', border: '1px solid #d9d9d9', borderRadius: 10,
      padding: '40px 48px', minHeight: 500, maxHeight: 600,
      overflowY: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }}>
      <div style={{ borderBottom: '2px solid #1f2937', paddingBottom: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>{title}</h1>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#6b7280' }}>
          <span>版本：{version}</span><span>起草人：{author}</span><span>更新日期：{date}</span>
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 2, color: '#333' }}>
        {lines.map((line, idx) => {
          if (line.includes('第') && line.includes('章') && line.length < 20) {
            return <h2 key={idx} style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginTop: 24, marginBottom: 8 }}>{line}</h2>
          }
          if (line.includes('第') && line.includes('条') && line.length < 25) {
            return <h3 key={idx} style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginTop: 16, marginBottom: 6 }}>{line}</h3>
          }
          if (line.startsWith('-') || line.startsWith('•')) {
            return <div key={idx} style={{ paddingLeft: 20, marginBottom: 4 }}><span style={{ color: '#3b82f6', marginRight: 6 }}>●</span>{line.replace(/^[-•]\s*/, '')}</div>
          }
          if (/^\d+[.、]/.test(line)) {
            const num = line.match(/^\d+/)?.[0]
            return <div key={idx} style={{ paddingLeft: 20, marginBottom: 4 }}><span style={{ fontWeight: 600, color: '#374151', marginRight: 6 }}>{num}.</span>{line.replace(/^\d+[.、]\s*/, '')}</div>
          }
          if (line.trim() === '') return <div key={idx} style={{ height: 8 }} />
          return <p key={idx} style={{ margin: '0 0 8px', textIndent: '2em' }}>{line}</p>
        })}
      </div>
      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 32, paddingTop: 12, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        — 本文档由两核智能运营平台知识库管理 — 内部资料 注意保管 —
      </div>
    </div>
  )
}

// ========== 飞书风格表格查看器 ==========
const SpreadsheetViewer: React.FC<{
  title: string
  version: string
  author: string
  date: string
  sheetData: { headers: string[]; rows: string[][] }
  editable?: boolean
  onDataChange?: (data: { headers: string[]; rows: string[][] }) => void
}> = ({ title, version, author, date, sheetData, editable = false, onDataChange }) => {
  const [data, setData] = useState(sheetData)

  const updateData = (newData: { headers: string[]; rows: string[][] }) => {
    setData(newData)
    onDataChange?.(newData)
  }

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = data.rows.map((row, rIdx) =>
      rIdx === rowIdx ? row.map((cell, cIdx) => cIdx === colIdx ? value : cell) : row
    )
    updateData({ ...data, rows: newRows })
  }

  const handleDeleteRow = (rowIdx: number) => {
    const newRows = data.rows.filter((_, i) => i !== rowIdx)
    updateData({ ...data, rows: newRows })
    message.success(`已删除第 ${rowIdx + 1} 行`)
  }

  const handleDeleteColumn = (colIdx: number) => {
    const newHeaders = data.headers.filter((_, i) => i !== colIdx)
    const newRows = data.rows.map(row => row.filter((_, i) => i !== colIdx))
    updateData({ headers: newHeaders, rows: newRows })
    message.success(`已删除「${data.headers[colIdx]}」列`)
  }

  const handleAddRow = () => {
    const newRow = data.headers.map(() => '')
    updateData({ ...data, rows: [...data.rows, newRow] })
  }

  const handleAddColumn = () => {
    const newHeaders = [...data.headers, `列${data.headers.length + 1}`]
    const newRows = data.rows.map(row => [...row, ''])
    updateData({ headers: newHeaders, rows: newRows })
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #d9d9d9', borderRadius: 10,
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }}>
      {/* 表格顶部工具栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', background: '#f8f9fa', borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TableOutlined style={{ color: '#22c55e', fontSize: 18 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{title}</span>
          <Tag color="blue" style={{ margin: 0, borderRadius: 6 }}>v{version}</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {editable && (
            <Space size={8}>
              <Button size="small" icon={<PlusOutlined />} onClick={handleAddRow}>插入行</Button>
              <Button size="small" icon={<PlusOutlined />} onClick={handleAddColumn}>插入列</Button>
            </Space>
          )}
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {author} · {date}
          </div>
        </div>
      </div>
      {/* 表格主体 */}
      <div style={{ overflow: 'auto', maxHeight: 500 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{
                width: 40, background: '#f1f5f9', border: '1px solid #e5e7eb',
                padding: '8px 4px', fontSize: 12, color: '#6b7280', textAlign: 'center',
                position: 'sticky', top: 0, left: 0, zIndex: 2,
              }}>#</th>
              {data.headers.map((h, i) => (
                <th key={i} style={{
                  background: '#f1f5f9', border: '1px solid #e5e7eb',
                  padding: '8px 16px', fontWeight: 600, color: '#374151',
                  whiteSpace: 'nowrap', minWidth: 100, textAlign: 'left',
                  position: 'sticky', top: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span>{h}</span>
                    {editable && (
                      <Popconfirm
                        title="删除此列"
                        description={`确定删除「${h}」列？此操作不可撤销。`}
                        onConfirm={() => handleDeleteColumn(i)}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <DeleteOutlined
                          style={{ color: '#ef4444', cursor: 'pointer', fontSize: 12, opacity: 0.6 }}
                          onClick={e => e.stopPropagation()}
                        />
                      </Popconfirm>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ width: 40, background: '#f1f5f9', border: '1px solid #e5e7eb' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <td style={{
                  background: '#f8f9fa', border: '1px solid #e5e7eb',
                  padding: '6px 4px', fontSize: 11, color: '#9ca3af',
                  textAlign: 'center', position: 'sticky', left: 0,
                }}>{rowIdx + 1}</td>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} style={{
                    border: '1px solid #e5e7eb', padding: '6px 12px',
                    color: '#374151',
                  }}>
                    {editable ? (
                      <input
                        value={cell}
                        onChange={e => handleCellChange(rowIdx, colIdx, e.target.value)}
                        style={{
                          border: 'none', outline: 'none', width: '100%',
                          background: 'transparent', fontSize: 13, color: '#374151',
                        }}
                      />
                    ) : cell}
                  </td>
                ))}
                <td style={{ width: 40, border: '1px solid #e5e7eb', textAlign: 'center', padding: '4px' }}>
                  {editable && (
                    <Popconfirm
                      title="删除此行"
                      description={`确定删除第 ${rowIdx + 1} 行？此操作不可撤销。`}
                      onConfirm={() => handleDeleteRow(rowIdx)}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <DeleteOutlined
                        style={{ color: '#ef4444', cursor: 'pointer', fontSize: 12, opacity: 0.6 }}
                      />
                    </Popconfirm>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ========== 操作历史记录 ==========
const OperationHistory: React.FC<{ history: { time: string; author: string; action: string }[] }> = ({ history }) => (
  <div style={{ padding: '8px 0' }}>
    {history.map((h, i) => (
      <div key={i} style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '10px 16px',
        background: i % 2 === 0 ? '#fafbfc' : '#fff',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: '#3b82f6',
          marginTop: 6, flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{h.action}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {h.author} · {h.time}
          </div>
        </div>
      </div>
    ))}
  </div>
)

// ========== 文档预览/编辑弹窗 ==========
const DocModal: React.FC<{
  open: boolean
  mode: 'view' | 'edit'
  doc: KnowledgeItem | null
  onClose: () => void
  onSave: (doc: KnowledgeItem) => void
  onSwitchToEdit: () => void
}> = ({ open, mode, doc, onClose, onSave, onSwitchToEdit }) => {
  const [editedContent, setEditedContent] = useState('')
  const [editedSheetData, setEditedSheetData] = useState<{ headers: string[]; rows: string[][] } | undefined>()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('content')

  React.useEffect(() => {
    if (doc) {
      form.setFieldsValue({ name: doc.name, version: doc.version, status: doc.status, author: doc.author })
      setEditedContent(doc.content)
      setEditedSheetData(doc.sheetData)
      setActiveTab('content')
    }
  }, [doc, form])

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (!doc) return
      onSave({ ...doc, ...values, content: editedContent, sheetData: editedSheetData })
      onClose()
    })
  }

  if (!doc) return null

  const isSheet = doc.docType === 'sheet'

  return (
    <Modal
      title={
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'view' ? '文档预览' : '文档编辑'}
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={
        mode === 'edit'
          ? [
              <Button key="cancel" onClick={onClose}>取消</Button>,
              <Button key="save" type="primary" onClick={handleSave}>保存修改</Button>,
            ]
          : [
              <Button key="close" onClick={onClose}>关闭</Button>,
              <Button key="edit" type="primary" icon={<EditOutlined />} onClick={onSwitchToEdit}>进入编辑</Button>,
            ]
      }
      width={900}
      styles={{ body: { maxHeight: '70vh', overflow: 'hidden', padding: '16px 24px' } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'content',
            label: isSheet ? <span><TableOutlined /> 表格内容</span> : <span><FileTextOutlined /> 文档内容</span>,
            children: (
              <>
                {mode === 'view' && (
                  isSheet ? (
                    <SpreadsheetViewer
                      title={doc.name} version={doc.version} author={doc.author} date={doc.updatedAt}
                      sheetData={doc.sheetData || { headers: [], rows: [] }}
                    />
                  ) : (
                    <WordDocumentViewer
                      title={doc.name} version={doc.version} author={doc.author} date={doc.updatedAt}
                      content={doc.content}
                    />
                  )
                )}
                {mode === 'edit' && (
                  <Form form={form}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                          <span style={{ fontSize: 13, color: '#4b5563', whiteSpace: 'nowrap' }}>文档名称：</span>
                          <Form.Item name="name" style={{ flex: 1, marginBottom: 0 }} rules={[{ required: true, message: '请输入文档名称' }]}>
                            <Input />
                          </Form.Item>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, color: '#4b5563', whiteSpace: 'nowrap' }}>版本：</span>
                          <Form.Item name="version" style={{ width: 100, marginBottom: 0 }}>
                            <Input />
                          </Form.Item>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, color: '#4b5563', whiteSpace: 'nowrap' }}>状态：</span>
                          <Form.Item name="status" style={{ width: 120, marginBottom: 0 }}>
                            <Select rootClassName="filter-select">
                              <Select.Option value="active">生效中</Select.Option>
                              <Select.Option value="updating">修订中</Select.Option>
                              <Select.Option value="deprecated">已废弃</Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                      {isSheet ? (
                        <SpreadsheetViewer
                          title={doc.name} version={doc.version} author={doc.author} date={doc.updatedAt}
                          sheetData={editedSheetData || { headers: [], rows: [] }}
                          editable
                          onDataChange={setEditedSheetData}
                        />
                      ) : (
                        <WordDocumentViewer
                          title={doc.name} version={doc.version} author={doc.author} date={doc.updatedAt}
                          content={editedContent} editable
                          onContentChange={setEditedContent}
                        />
                      )}
                    </div>
                  </Form>
                )}
              </>
            ),
          },
          {
            key: 'history',
            label: <span><HistoryOutlined /> 操作历史</span>,
            children: <OperationHistory history={doc.history || []} />,
          },
        ]}
      />
    </Modal>
  )
}

// ========== DocTable ==========
function DocTable({ items, activeTab }: { items: KnowledgeItem[]; activeTab: 'claims' | 'underwriting' }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [currentDoc, setCurrentDoc] = useState<KnowledgeItem | null>(null)
  const [docs, setDocs] = useState(items)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  React.useEffect(() => {
    setDocs(items)
    setPage(1)
  }, [items])

  const paginatedDocs = docs.slice((page - 1) * pageSize, page * pageSize)

  const handlePreview = (doc: KnowledgeItem) => {
    setCurrentDoc(doc)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleEdit = (doc: KnowledgeItem) => {
    setCurrentDoc(doc)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleSave = (updatedDoc: KnowledgeItem) => {
    setDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d))
    setCurrentDoc(updatedDoc)
  }

  const minWidth = activeTab === 'claims' ? 1280 : 900
  return (
    <>
      <div className="table-scroll-wrapper">
        <div style={{ minWidth }}>
          <Table
            columns={buildColumns(activeTab, handlePreview, handleEdit)}
            dataSource={paginatedDocs}
            rowKey="id"
            size="middle"
            pagination={false}
            style={{ fontSize: 13 }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#000000e0' }}>共 {docs.length} 条数据</span>
          <button
            onClick={() => console.log('导出')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#65a5ff', color: '#fff', border: 'none', borderRadius: 6,
              padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
          current={page}
          pageSize={pageSize}
          total={docs.length}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['10', '20', '50']}
          onChange={(p, size) => {
            if (size !== pageSize) { setPageSize(size); setPage(1) } else { setPage(p) }
          }}
          size="small"
        />
      </div>
      <DocModal
        open={modalOpen}
        mode={modalMode}
        doc={currentDoc}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onSwitchToEdit={() => setModalMode('edit')}
      />
    </>
  )
}

/** 胶囊形分类筛选标签 */
const PillTag: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => {
  let bg = '#fff', color = '#000000e0', borderColor = '#d9d9d9'
  if (active) { bg = '#eff6ff'; color = '#3b82f6'; borderColor = '#3b82f6' }
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
      border: `1px solid ${borderColor}`, background: bg, color, cursor: 'pointer',
      transition: 'all 0.2s ease', lineHeight: 1.4, whiteSpace: 'nowrap', outline: 'none',
    }}>{label}</button>
  )
}

/** 知识库区块 */
const KnowledgeSection: React.FC<{ groups: { name: string; items: KnowledgeItem[] }[]; activeTab: 'claims' | 'underwriting' }> = ({ groups, activeTab }) => {
  const ALL_LABEL = '全部'
  const [activeGroup, setActiveGroup] = useState(ALL_LABEL)
  const [searchKeyword, setSearchKeyword] = useState('')

  React.useEffect(() => { setActiveGroup(ALL_LABEL); setSearchKeyword('') }, [groups])

  const allItems = groups.reduce<KnowledgeItem[]>((acc, g) => [...acc, ...g.items], [])
  const filteredItems = (searchKeyword
    ? allItems.filter(item => item.name.toLowerCase().includes(searchKeyword.toLowerCase()))
    : activeGroup === ALL_LABEL
      ? allItems
      : groups.find(g => g.name === activeGroup)?.items || []
  )
  // 按更新时间倒序（近→远）
  const currentItems = [...filteredItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <PillTag key={ALL_LABEL} label={ALL_LABEL} active={activeGroup === ALL_LABEL} onClick={() => setActiveGroup(ALL_LABEL)} />
          {groups.map(g => (
            <PillTag key={g.name} label={g.name} active={activeGroup === g.name} onClick={() => setActiveGroup(g.name)} />
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', width: 360, height: 34, borderRadius: 17,
          border: '1px solid #e5e7eb', background: '#fff', padding: '0 14px', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginRight: 8 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="搜索文档名称" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent' }} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <DocTable key={searchKeyword || activeGroup} items={currentItems} activeTab={activeTab} />
      </div>
    </div>
  )
}

const KnowledgeBaseCards: React.FC<{ activeTab: 'claims' | 'underwriting' }> = ({ activeTab }) => {
  const isClaims = activeTab === 'claims'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 4, height: 20, background: '#3b82f6', borderRadius: 10, marginRight: 10 }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{isClaims ? '理赔知识库' : '核保知识库'}</span>
      </div>
      {isClaims ? (
        <KnowledgeSection key="claims" groups={claimsKnowledge.groups} activeTab="claims" />
      ) : (
        <KnowledgeSection key="underwriting" groups={underwritingKnowledge.groups} activeTab="underwriting" />
      )}
    </div>
  )
}

export default KnowledgeBaseCards

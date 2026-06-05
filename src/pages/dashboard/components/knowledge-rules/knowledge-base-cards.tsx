import React, { useState } from 'react'
import { Table, Tag, Modal, Form, Input, Button, Select, Space, Pagination } from 'antd'
import { FileTextOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
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
  onPreview: (doc: KnowledgeItem) => void,
  onEdit: (doc: KnowledgeItem) => void,
): ColumnsType<KnowledgeItem> {
  return [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text: string) => (
        <span style={{ fontWeight: 500, color: '#1f2937' }}>
          <FileTextOutlined style={{ marginRight: 6, color: '#3b82f6', fontSize: 14 }} />
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
        return <Tag color={s.color}>{s.label}</Tag>
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

/** 模拟 Word 文档内容渲染 */
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
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            background: 'transparent',
            fontSize: 14,
            lineHeight: 2,
            color: '#333',
            resize: 'none',
            padding: 0,
          }}
        />
      </div>
    )
  }

  const lines = content.split('\n').filter(Boolean)

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
      <div style={{ borderBottom: '2px solid #1f2937', paddingBottom: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>{title}</h1>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#6b7280' }}>
          <span>版本：{version}</span>
          <span>起草人：{author}</span>
          <span>更新日期：{date}</span>
        </div>
      </div>

      <div style={{ fontSize: 14, lineHeight: 2, color: '#333' }}>
        {lines.map((line, idx) => {
          if (line.includes('第') && line.includes('章') && line.length < 20) {
            return <h2 key={idx} style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', marginTop: 24, marginBottom: 8 }}>{line}</h2>
          }
          if (line.includes('第') && line.includes('条') && line.length < 25) {
            return <h3 key={idx} style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginTop: 16, marginBottom: 6 }}>{line}</h3>
          }
          if (line.startsWith('-') || line.startsWith('•')) {
            return (
              <div key={idx} style={{ paddingLeft: 20, marginBottom: 4 }}>
                <span style={{ color: '#3b82f6', marginRight: 6 }}>●</span>{line.replace(/^[-•]\s*/, '')}
              </div>
            )
          }
          if (/^\d+[.、]/.test(line)) {
            const num = line.match(/^\d+/)?.[0]
            return (
              <div key={idx} style={{ paddingLeft: 20, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#374151', marginRight: 6 }}>{num}.</span>{line.replace(/^\d+[.、]\s*/, '')}
              </div>
            )
          }
          if (line.trim() === '') {
            return <div key={idx} style={{ height: 8 }} />
          }
          return <p key={idx} style={{ margin: '0 0 8px', textIndent: '2em' }}>{line}</p>
        })}
      </div>

      <div style={{
        borderTop: '1px solid #e5e7eb',
        marginTop: 32,
        paddingTop: 12,
        fontSize: 11,
        color: '#9ca3af',
        textAlign: 'center',
      }}>
        — 本文档由两核智能体运营平台知识库管理 — 内部资料 注意保管 —
      </div>
    </div>
  )
}

/** 文档预览/编辑弹窗 */
const DocModal: React.FC<{
  open: boolean
  mode: 'view' | 'edit'
  doc: KnowledgeItem | null
  onClose: () => void
  onSave: (doc: KnowledgeItem) => void
  onSwitchToEdit: () => void
}> = ({ open, mode, doc, onClose, onSave, onSwitchToEdit }) => {
  const [editedContent, setEditedContent] = useState('')
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (doc) {
      form.setFieldsValue({
        name: doc.name,
        version: doc.version,
        status: doc.status,
        author: doc.author,
      })
      setEditedContent(doc.content)
    }
  }, [doc, form])

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (!doc) return
      onSave({ ...doc, ...values, content: editedContent })
      onClose()
    })
  }

  if (!doc) return null

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
      width={860}
      styles={{ body: { maxHeight: '70vh', overflow: 'hidden', padding: '16px 24px' } }}
    >
      {mode === 'view' && (
        <WordDocumentViewer
          title={doc.name}
          version={doc.version}
          author={doc.author}
          date={doc.updatedAt}
          content={doc.content}
        />
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
                  <Select>
                    <Select.Option value="active">生效中</Select.Option>
                    <Select.Option value="updating">修订中</Select.Option>
                    <Select.Option value="deprecated">已废弃</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <WordDocumentViewer
              title={doc.name}
              version={doc.version}
              author={doc.author}
              date={doc.updatedAt}
              content={editedContent}
              editable
              onContentChange={setEditedContent}
            />
          </div>
        </Form>
      )}
    </Modal>
  )
}

function DocTable({ items }: { items: KnowledgeItem[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [currentDoc, setCurrentDoc] = useState<KnowledgeItem | null>(null)
  const [docs, setDocs] = useState(items)
  const [page, setPage] = useState(1)
  const pageSize = 5

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

  return (
    <>
      <Table
        columns={buildColumns(handlePreview, handleEdit)}
        dataSource={paginatedDocs}
        rowKey="id"
        size="middle"
        pagination={false}
        style={{ fontSize: 13 }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Pagination
          current={page}
          total={docs.length}
          pageSize={pageSize}
          size="small"
          onChange={setPage}
          showSizeChanger={false}
          showQuickJumper={false}
          showTotal={total => `共 ${total} 条`}
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
const PillTag: React.FC<{
  label: string
  active: boolean
  onClick: () => void
}> = ({ label, active, onClick }) => {

  let bg = '#fff'
  let color = '#000000e0'
  let borderColor = '#d9d9d9'

  if (active) {
    bg = '#eff6ff'
    color = '#3b82f6'
    borderColor = '#3b82f6'
  }

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        border: `1px solid ${borderColor}`,
        background: bg,
        color,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        outline: 'none',
      }}
    >
      {label}
    </button>
  )
}

/** 知识库区块：胶囊筛选 + 搜索 + 文档列表 */
const KnowledgeSection: React.FC<{
  groups: { name: string; items: KnowledgeItem[] }[]
}> = ({ groups }) => {
  const [activeGroup, setActiveGroup] = useState(groups[0].name)
  const [searchKeyword, setSearchKeyword] = useState('')

  // groups 变化时（切换理赔/核保 tab），重置分类和搜索
  React.useEffect(() => {
    setActiveGroup(groups[0].name)
    setSearchKeyword('')
  }, [groups])

  const allItems = groups.reduce<KnowledgeItem[]>((acc, g) => [...acc, ...g.items], [])
  const currentItems = (searchKeyword
    ? allItems.filter(item => item.name.toLowerCase().includes(searchKeyword.toLowerCase()))
    : groups.find(g => g.name === activeGroup)?.items || []
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {groups.map(g => (
            <PillTag
              key={g.name}
              label={g.name}
              active={activeGroup === g.name}
              onClick={() => setActiveGroup(g.name)}
            />
          ))}
        </div>
        {/* 搜索框 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: 360,
          height: 34,
          borderRadius: 17,
          border: '1px solid #e5e7eb',
          background: '#fff',
          padding: '0 14px',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginRight: 8 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="搜索文档名称"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#374151',
              background: 'transparent',
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <DocTable key={searchKeyword || activeGroup} items={currentItems} />
      </div>
    </div>
  )
}

const KnowledgeBaseCards: React.FC<{ activeTab: 'claims' | 'underwriting' }> = ({ activeTab }) => {
  const isClaims = activeTab === 'claims'

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: '#3b82f6',
          borderRadius: 10,
          marginRight: 10,
        }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>
          {isClaims ? '理赔知识库' : '核保知识库'}
        </span>
      </div>

      {isClaims ? (
        <KnowledgeSection key="claims" groups={claimsKnowledge.groups} />
      ) : (
        <KnowledgeSection key="underwriting" groups={underwritingKnowledge.groups} />
      )}
    </div>
  )
}

export default KnowledgeBaseCards

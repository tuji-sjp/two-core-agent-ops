import React, { useState, useMemo } from 'react'
import { Table, Tag, Pagination, Input, Button, Space, Select, Checkbox, Radio, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

// ── 类型定义 ──

const SPACES = ['公共', '理赔', '核保', '反欺诈'] as const

const ROLES = [
  { value: 'admin', label: '管理员' },
  { value: 'operator', label: '业务员' },
] as const
type RoleType = typeof ROLES[number]['value']

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  active: { color: 'success', text: '启用' },
  disabled: { color: 'default', text: '停用' },
}

const SPACE_COLOR_MAP: Record<string, string> = {
  '公共': 'purple',
  '理赔': 'blue',
  '核保': 'orange',
  '反欺诈': 'green',
}

const ROLE_MAP: Record<string, { color: string; text: string }> = {
  admin: { color: 'red', text: '管理员' },
  operator: { color: 'blue', text: '业务员' },
}

// ── 菜单权限树 ──

const MENU_TREE: Record<string, { key: string; label: string }[]> = {
  '公共': [
    { key: '/business/overview', label: '业务应用-全景概览' },
    { key: '/skills', label: '技能中心' },
    { key: '/data-share', label: '数据共享' },
  ],
  '理赔': [
    { key: '/business/claims', label: '业务应用-理赔场景' },
    { key: '/agent/claims', label: 'Agent运营-理赔' },
  ],
  '核保': [
    { key: '/business/underwriting', label: '业务应用-核保场景' },
    { key: '/agent/underwriting', label: 'Agent运营-核保' },
  ],
  '反欺诈': [
    { key: '/business/anti-fraud', label: '业务应用-反欺诈场景' },
    { key: '/agent/anti-fraud', label: 'Agent运营-反欺诈' },
  ],
  '平台管理': [
    { key: '/platform', label: '平台管理' },
  ],
}

// ── Mock 数据 ──

interface MenuPermission {
  key: string
  level: 'read' | 'write'
}

interface KnowledgePermission {
  space: string
  level: 'read' | 'write' | 'none'
}

interface UserRecord {
  key: string
  userId: string
  username: string
  realName: string
  department: string
  role: RoleType
  spaces: string[]
  menuPermissions: MenuPermission[]
  knowledgePermissions: KnowledgePermission[]
  status: 'active' | 'disabled'
  createdAt: string
  lastLogin: string
}

const INITIAL_USERS: UserRecord[] = [
  { key: '1', userId: 'zhangwy01', username: 'admin', realName: '张运维', department: '技术部', role: 'admin', spaces: ['理赔', '核保', '反欺诈'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/business/underwriting', level: 'write' }, { key: '/agent/underwriting', level: 'write' }, { key: '/business/anti-fraud', level: 'write' }, { key: '/agent/anti-fraud', level: 'write' }, { key: '/skills', level: 'write' }, { key: '/data-share', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }, { space: '核保', level: 'write' }, { space: '反欺诈', level: 'write' }], status: 'active', createdAt: '2025-01-15 09:00', lastLogin: '2026-07-27 10:23' },
  { key: '2', userId: 'liwei03', username: 'liwei', realName: '李伟', department: '理赔部', role: 'operator', spaces: ['理赔'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/skills', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }], status: 'active', createdAt: '2025-02-20 14:30', lastLogin: '2026-07-26 16:45' },
  { key: '3', userId: 'wangfa05', username: 'wangfang', realName: '王芳', department: '核保部', role: 'operator', spaces: ['核保'], menuPermissions: [{ key: '/business/underwriting', level: 'write' }, { key: '/agent/underwriting', level: 'write' }], knowledgePermissions: [{ space: '核保', level: 'write' }], status: 'active', createdAt: '2025-03-10 10:00', lastLogin: '2026-07-27 08:12' },
  { key: '4', userId: 'zhaomi08', username: 'zhaoming', realName: '赵明', department: '风控部', role: 'operator', spaces: ['反欺诈'], menuPermissions: [{ key: '/business/anti-fraud', level: 'write' }, { key: '/agent/anti-fraud', level: 'write' }, { key: '/skills', level: 'write' }], knowledgePermissions: [{ space: '反欺诈', level: 'write' }], status: 'active', createdAt: '2025-03-15 11:20', lastLogin: '2026-07-25 14:30' },
  { key: '5', userId: 'chenji12', username: 'chenjie', realName: '陈洁', department: '理赔部', role: 'operator', spaces: ['理赔'], menuPermissions: [{ key: '/business/claims', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'read' }], status: 'active', createdAt: '2025-04-01 09:30', lastLogin: '2026-07-20 11:00' },
  { key: '6', userId: 'sunli15', username: 'sunli', realName: '孙丽', department: '综合部', role: 'operator', spaces: ['理赔', '核保'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/business/underwriting', level: 'write' }, { key: '/skills', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }, { space: '核保', level: 'read' }], status: 'active', createdAt: '2025-04-10 13:45', lastLogin: '2026-07-27 09:15' },
  { key: '7', userId: 'zhouqi02', username: 'zhouqiang', realName: '周强', department: '技术部', role: 'admin', spaces: ['理赔', '核保', '反欺诈'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/business/underwriting', level: 'write' }, { key: '/agent/underwriting', level: 'write' }, { key: '/business/anti-fraud', level: 'write' }, { key: '/agent/anti-fraud', level: 'write' }, { key: '/skills', level: 'write' }, { key: '/data-share', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }, { space: '核保', level: 'write' }, { space: '反欺诈', level: 'write' }], status: 'active', createdAt: '2025-01-15 09:00', lastLogin: '2026-07-27 07:30' },
  { key: '8', userId: 'wuga20', username: 'wugang', realName: '吴刚', department: '核保部', role: 'operator', spaces: ['核保'], menuPermissions: [{ key: '/business/underwriting', level: 'write' }], knowledgePermissions: [{ space: '核保', level: 'read' }], status: 'disabled', createdAt: '2025-05-20 16:00', lastLogin: '2026-06-15 10:20' },
  { key: '9', userId: 'zhenhu22', username: 'zhenghui', realName: '郑慧', department: '理赔部', role: 'operator', spaces: ['理赔', '反欺诈'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/business/anti-fraud', level: 'write' }, { key: '/skills', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }, { space: '反欺诈', level: 'read' }], status: 'active', createdAt: '2025-06-01 10:30', lastLogin: '2026-07-26 15:40' },
  { key: '10', userId: 'huanpe25', username: 'huangpeng', realName: '黄鹏', department: '风控部', role: 'operator', spaces: ['反欺诈'], menuPermissions: [{ key: '/business/anti-fraud', level: 'write' }, { key: '/agent/anti-fraud', level: 'write' }], knowledgePermissions: [{ space: '反欺诈', level: 'write' }], status: 'active', createdAt: '2025-06-15 14:00', lastLogin: '2026-07-25 09:50' },
  { key: '11', userId: 'xuli28', username: 'xuli', realName: '许丽', department: '综合部', role: 'operator', spaces: ['理赔', '核保', '反欺诈'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/business/underwriting', level: 'write' }, { key: '/business/anti-fraud', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'read' }, { space: '核保', level: 'read' }, { space: '反欺诈', level: 'read' }], status: 'active', createdAt: '2025-07-01 09:00', lastLogin: '2026-07-24 16:20' },
  { key: '12', userId: 'yangbo30', username: 'yangbo', realName: '杨波', department: '理赔部', role: 'operator', spaces: ['理赔'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/skills', level: 'write' }, { key: '/data-share', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }], status: 'active', createdAt: '2025-07-20 11:30', lastLogin: '2026-07-27 11:05' },
  { key: '13', userId: 'liuyan33', username: 'liuyan', realName: '刘燕', department: '核保部', role: 'operator', spaces: ['核保'], menuPermissions: [{ key: '/business/underwriting', level: 'write' }, { key: '/agent/underwriting', level: 'write' }, { key: '/skills', level: 'write' }], knowledgePermissions: [{ space: '核保', level: 'write' }], status: 'disabled', createdAt: '2025-08-05 15:00', lastLogin: '2026-05-30 14:15' },
  { key: '14', userId: 'tangwe35', username: 'tangwei', realName: '唐伟', department: '风控部', role: 'operator', spaces: ['反欺诈'], menuPermissions: [{ key: '/business/anti-fraud', level: 'write' }], knowledgePermissions: [{ space: '反欺诈', level: 'read' }], status: 'active', createdAt: '2025-08-20 10:00', lastLogin: '2026-07-22 13:40' },
  { key: '15', userId: 'hanmei38', username: 'hanmei', realName: '韩梅', department: '理赔部', role: 'operator', spaces: ['理赔', '核保'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/business/underwriting', level: 'write' }, { key: '/skills', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }, { space: '核保', level: 'read' }], status: 'active', createdAt: '2025-09-01 09:30', lastLogin: '2026-07-26 10:30' },
  { key: '16', userId: 'fengl01', username: 'fenglei', realName: '冯磊', department: '技术部', role: 'admin', spaces: ['理赔', '核保', '反欺诈'], menuPermissions: [{ key: '/business/claims', level: 'write' }, { key: '/agent/claims', level: 'write' }, { key: '/business/underwriting', level: 'write' }, { key: '/agent/underwriting', level: 'write' }, { key: '/business/anti-fraud', level: 'write' }, { key: '/agent/anti-fraud', level: 'write' }, { key: '/skills', level: 'write' }, { key: '/data-share', level: 'write' }], knowledgePermissions: [{ space: '理赔', level: 'write' }, { space: '核保', level: 'write' }, { space: '反欺诈', level: 'write' }], status: 'active', createdAt: '2025-01-15 09:00', lastLogin: '2026-07-27 08:45' },
]

// ── 样式常量 ──

// 根据角色和空间获取菜单权限（按空间分组展示，每组最多3个，跳过全部无权限的空间）
const getUserMenus = (role: RoleType, spaces: string[], menuPermissions: MenuPermission[]) => {
  const result: { space: string; menus: { label: string; level: string }[]; hasMore: boolean }[] = []

  // 公共菜单
  const publicMenus = MENU_TREE['公共'].map(m => {
    const perm = menuPermissions.find(p => p.key === m.key)
    return { label: m.label, level: perm?.level === 'read' ? '只读' : perm?.level === 'write' ? '读写' : '无权限' }
  })
  if (publicMenus.some(m => m.level !== '无权限')) {
    result.push({ space: '公共', menus: publicMenus.slice(0, 3), hasMore: publicMenus.length > 3 })
  }

  // 各空间菜单（按理赔、核保、反欺诈顺序）
  const spaceOrder = ['理赔', '核保', '反欺诈']
  spaceOrder.forEach(space => {
    if (role === 'admin' || spaces.includes(space)) {
      const spaceMenus = MENU_TREE[space]?.map(m => {
        const perm = role === 'admin' ? { level: 'write' as const } : menuPermissions.find(p => p.key === m.key)
        return { label: m.label, level: perm?.level === 'read' ? '只读' : perm?.level === 'write' ? '读写' : '无权限' }
      }) || []
      // 跳过全部无权限的空间
      if (spaceMenus.some(m => m.level !== '无权限')) {
        result.push({ space, menus: spaceMenus.slice(0, 3), hasMore: spaceMenus.length > 3 })
      }
    }
  })

  return result
}

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

// ── 组件 ──

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // 筛选状态
  const [searchUsername, setSearchUsername] = useState('')
  const [filterSpace, setFilterSpace] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // 弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)

  // 编辑表单状态
  const [editRole, setEditRole] = useState<RoleType>('operator')
  const [editSpaces, setEditSpaces] = useState<string[]>([])
  const [editMenuPermissions, setEditMenuPermissions] = useState<MenuPermission[]>([])
  const [editKnowledgePermissions, setEditKnowledgePermissions] = useState<KnowledgePermission[]>([])
  const [editStatus, setEditStatus] = useState<'active' | 'disabled'>('active')

  // 新增表单状态
  const [newUser, setNewUser] = useState<Partial<UserRecord>>({
    userId: '',
    username: '',
    realName: '',
    department: '',
    role: 'operator',
    spaces: [],
    menuPermissions: [],
    knowledgePermissions: [],
    status: 'active',
  })

  // 筛选逻辑
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      (!searchUsername || u.userId.includes(searchUsername) || u.realName.includes(searchUsername)) &&
      (!filterSpace || u.spaces.includes(filterSpace)) &&
      (!filterRole || u.role === filterRole) &&
      (!filterStatus || u.status === filterStatus)
    )
  }, [users, searchUsername, filterSpace, filterRole, filterStatus])

  const pagedUsers = useMemo(
    () => filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredUsers, currentPage, pageSize]
  )

  // 清空筛选
  const clearFilters = () => {
    setSearchUsername('')
    setFilterSpace('')
    setFilterRole('')
    setFilterStatus('')
    setCurrentPage(1)
  }

  // 打开编辑弹窗
  const handleEdit = (user: UserRecord) => {
    setEditingUser(user)
    setEditRole(user.role)
    setEditSpaces([...user.spaces])
    setEditMenuPermissions([...user.menuPermissions])
    setEditKnowledgePermissions([...user.knowledgePermissions])
    setEditStatus(user.status)
    setEditModalVisible(true)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingUser) return
    setUsers(prev => prev.map(u => u.key === editingUser.key ? {
      ...u,
      role: editRole,
      spaces: editSpaces,
      menuPermissions: editMenuPermissions,
      knowledgePermissions: editKnowledgePermissions,
      status: editStatus,
    } : u))
    message.success('保存成功')
    setEditModalVisible(false)
    setEditingUser(null)
  }

  // 打开新增弹窗
  const handleAdd = () => {
    setNewUser({
      userId: '',
      username: '',
      realName: '',
      department: '',
      role: 'operator',
      spaces: [],
      menuPermissions: [],
      knowledgePermissions: [],
      status: 'active',
    })
    setAddModalVisible(true)
  }

  // 保存新增
  const handleSaveAdd = () => {
    if (!newUser.userId || !newUser.realName) {
      message.warning('请填写OA号和姓名')
      return
    }
    const newUserRecord: UserRecord = {
      key: String(Date.now()),
      userId: newUser.userId || '',
      username: newUser.username || '',
      realName: newUser.realName || '',
      department: newUser.department || '',
      role: newUser.role || 'operator',
      spaces: newUser.spaces || [],
      menuPermissions: newUser.menuPermissions || [],
      knowledgePermissions: newUser.knowledgePermissions || [],
      status: newUser.status || 'active',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastLogin: '-',
    }
    setUsers(prev => [...prev, newUserRecord])
    message.success('新增成功')
    setAddModalVisible(false)
  }

  // 删除用户
  const handleDelete = (user: UserRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${user.realName}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setUsers(prev => prev.filter(u => u.key !== user.key))
        message.success('删除成功')
      },
    })
  }

  // 停用/启用切换
  const handleToggleStatus = (user: UserRecord) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active'
    const actionText = nextStatus === 'disabled' ? '停用' : '启用'
    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText}用户「${user.realName}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setUsers(prev => prev.map(u => u.key === user.key ? { ...u, status: nextStatus } : u))
        message.success(`${actionText}成功`)
      },
    })
  }

  // 新增弹窗 - 空间变更时自动生成"只读"默认权限
  const handleAddSpaceChange = (spaces: string[]) => {
    const newMenus: MenuPermission[] = []
    // 所选空间（含公共）的菜单加入
    spaces.forEach(space => {
      MENU_TREE[space]?.forEach(m => {
        newMenus.push({ key: m.key, level: 'read' })
      })
    })
    const newKnowledge: KnowledgePermission[] = spaces.filter(s => s !== '公共').map(s => ({ space: s, level: 'read' }))
    setNewUser({ ...newUser, spaces, menuPermissions: newMenus, knowledgePermissions: newKnowledge })
  }
  // 空间变更时同步菜单权限和知识权限
  const handleSpaceChange = (spaces: string[]) => {
    setEditSpaces(spaces)
    const validMenuKeys = [...(MENU_TREE['公共']?.map(m => m.key) || []), ...spaces.flatMap(s => MENU_TREE[s]?.map(m => m.key) || [])]
    setEditMenuPermissions(prev => {
      // 保留已有的有效菜单权限
      const kept = prev.filter(p => validMenuKeys.includes(p.key))
      // 新增空间的菜单默认设为"只读"
      const keptKeys = new Set(kept.map(p => p.key))
      const added: MenuPermission[] = []
      validMenuKeys.forEach(key => {
        if (!keptKeys.has(key)) {
          added.push({ key, level: 'read' })
        }
      })
      return [...kept, ...added]
    })
    // 更新知识权限
    setEditKnowledgePermissions(prev => {
      const existing = prev.filter(p => spaces.includes(p.space))
      const added = spaces.filter(s => !prev.find(p => p.space === s)).map(s => ({ space: s, level: 'none' as const }))
      return [...existing, ...added]
    })
  }

  // 表格列定义
  const columns: ColumnsType<UserRecord> = [
    { title: 'OA号', dataIndex: 'userId', key: 'userId', width: 85 },
    { title: '姓名', dataIndex: 'realName', key: 'realName', width: 65 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 75 },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      render: (role: string) => ROLE_MAP[role]?.text || role,
    },
    {
      title: '所属空间',
      dataIndex: 'spaces',
      key: 'spaces',
      width: 120,
      render: (spaces: string[]) => (
        <Space size={4} wrap>
          {spaces.map(s => (
            <Tag key={s} color={SPACE_COLOR_MAP[s] || 'default'} style={{ borderRadius: 4, margin: 0 }}>{s}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '菜单权限',
      key: 'menuPermissions',
      width: 360,
      render: (_: unknown, record: UserRecord) => {
        const groupedMenus = getUserMenus(record.role, record.spaces, record.menuPermissions)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            {groupedMenus.map(({ space, menus, hasMore }) => (
              <div key={space} style={{ lineHeight: 1.6 }}>
                <span style={{ color: '#1f2937', fontWeight: 500 }}>{space}：</span>
                {menus.map((m, i) => (
                  <span key={i} style={{ color: '#4b5563', margin: '0 6px' }}>
                    {m.label}
                    <span style={{ color: m.level === '读写' ? '#1677ff' : m.level === '只读' ? '#8c8c8c' : '#d1d5db', marginLeft: 2 }}>({m.level})</span>
                    {i < menus.length - 1 && <span style={{ color: '#d1d5db', marginLeft: 8 }}>|</span>}
                  </span>
                ))}
                {hasMore && <span style={{ color: '#8c8c8c', marginLeft: 6 }}>...</span>}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 60,
      render: (status: string) => {
        const cfg = STATUS_MAP[status] || { color: 'default', text: status }
        return <Tag color={cfg.color} style={{ borderRadius: 6 }}>{cfg.text}</Tag>
      },
    },
    {
      title: '最近登录时间',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 130,
    },
    {
      title: '操作',
      key: 'actions',
      width: 110,
      render: (_: unknown, record: UserRecord) => (
        <Space size={12}>
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }}
          />
          <DeleteOutlined
            onClick={() => handleDelete(record)}
            style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 14 }}
          />
          <span
            onClick={() => handleToggleStatus(record)}
            style={{
              color: '#1677ff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {record.status === 'active' ? '停用' : '启用'}
          </span>
        </Space>
      ),
    },
  ]

  // 渲染编辑弹窗内容
  const renderEditModalContent = () => {
    if (!editingUser) return null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 基本信息 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
            基本信息
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>OA号</div>
                <Input value={editingUser.userId} disabled style={{ background: '#f5f5f5' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>姓名</div>
                <Input value={editingUser.realName} disabled style={{ background: '#f5f5f5' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>部门</div>
                <Input value={editingUser.department} disabled style={{ background: '#f5f5f5' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>角色</div>
                <Select
                  value={editRole}
                  onChange={val => setEditRole(val)}
                  options={ROLES.map(r => ({ label: r.label, value: r.value }))}
                  style={{ width: '100%' }}
                  rootClassName="filter-select"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>状态</div>
                <Select
                  value={editStatus}
                  onChange={val => setEditStatus(val)}
                  options={[
                    { label: '启用', value: 'active' },
                    { label: '停用', value: 'disabled' },
                  ]}
                  style={{ width: '100%' }}
                  rootClassName="filter-select"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 空间归属 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
            空间归属
          </div>
          <Checkbox.Group
            value={editSpaces}
            onChange={vals => handleSpaceChange(vals as string[])}
            style={{ display: 'flex', gap: 24 }}
          >
            {SPACES.map(s => (
              <Checkbox key={s} value={s}>{s}</Checkbox>
            ))}
          </Checkbox.Group>
        </div>

        {/* 菜单权限配置 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
            菜单权限配置
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 公共菜单 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>公共菜单</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 200 }}>菜单名称</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>只读</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>读写</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>无权限</th>
                  </tr>
                </thead>
                <tbody>
                  {MENU_TREE['公共'].map(m => {
                    const active = editSpaces.includes('公共')
                    const perm = editMenuPermissions.find(p => p.key === m.key)
                    const level = active ? (perm?.level || 'none') : 'none'
                    return (
                      <tr key={m.key} style={{ borderBottom: '1px solid #f0f0f0', opacity: active ? 1 : 0.45 }}>
                        <td style={{ padding: '8px 12px' }}>{m.label}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <Radio checked={level === 'read'} onChange={() => {
                            if (!active) return
                            setEditMenuPermissions(prev => {
                              const filtered = prev.filter(p => p.key !== m.key)
                              return [...filtered, { key: m.key, level: 'read' }]
                            })
                          }} />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <Radio checked={level === 'write'} onChange={() => {
                            if (!active) return
                            setEditMenuPermissions(prev => {
                              const filtered = prev.filter(p => p.key !== m.key)
                              return [...filtered, { key: m.key, level: 'write' }]
                            })
                          }} />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <Radio checked={level === 'none'} onChange={() => {
                            if (!active) return
                            setEditMenuPermissions(prev => prev.filter(p => p.key !== m.key))
                          }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* 各空间菜单 - 始终展示全部4个空间 */}
            {['理赔', '核保', '反欺诈'].map(space => {
              const active = editSpaces.includes(space)
              return (
                <div key={space}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>{space}空间</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 200 }}>菜单名称</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>只读</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>读写</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>无权限</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MENU_TREE[space]?.map(m => {
                        const perm = editMenuPermissions.find(p => p.key === m.key)
                        const level = active ? (perm?.level || 'none') : 'none'
                        return (
                          <tr key={m.key} style={{ borderBottom: '1px solid #f0f0f0', opacity: active ? 1 : 0.45 }}>
                            <td style={{ padding: '8px 12px' }}>{m.label}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <Radio checked={level === 'read'} onChange={() => {
                                if (!active) return
                                setEditMenuPermissions(prev => {
                                  const filtered = prev.filter(p => p.key !== m.key)
                                  return [...filtered, { key: m.key, level: 'read' }]
                                })
                              }} />
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <Radio checked={level === 'write'} onChange={() => {
                                if (!active) return
                                setEditMenuPermissions(prev => {
                                  const filtered = prev.filter(p => p.key !== m.key)
                                  return [...filtered, { key: m.key, level: 'write' }]
                                })
                              }} />
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <Radio checked={level === 'none'} onChange={() => {
                                if (!active) return
                                setEditMenuPermissions(prev => prev.filter(p => p.key !== m.key))
                              }} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      {/* 标题 */}
      <div style={titleStyle}>
        <div style={titleBarStyle} />
        <span style={titleTextStyle}>用户管理</span>
      </div>

      {/* 筛选区 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
      }}>
        <Input
          placeholder="OA号/姓名"
          value={searchUsername}
          onChange={e => { setSearchUsername(e.target.value); setCurrentPage(1) }}
          allowClear
          style={{ width: 130, height: 32 }}
        />
        <Select
          placeholder="角色"
          value={filterRole || undefined}
          onChange={val => { setFilterRole(val || ''); setCurrentPage(1) }}
          allowClear
          options={ROLES.map(r => ({ label: r.label, value: r.value }))}
          style={{ width: 130, height: 32 }}
          rootClassName="filter-select"
        />
        <Select
          placeholder="所属空间"
          value={filterSpace || undefined}
          onChange={val => { setFilterSpace(val || ''); setCurrentPage(1) }}
          allowClear
          options={SPACES.map(s => ({ label: s, value: s }))}
          style={{ width: 130, height: 32 }}
          rootClassName="filter-select"
        />
        <Select
          placeholder="状态"
          value={filterStatus || undefined}
          onChange={val => { setFilterStatus(val || ''); setCurrentPage(1) }}
          allowClear
          options={[
            { label: '启用', value: 'active' },
            { label: '停用', value: 'disabled' },
          ]}
          style={{ width: 130, height: 32 }}
          rootClassName="filter-select"
        />
        <Button onClick={clearFilters}>重置</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginLeft: 'auto' }}>新增用户</Button>
      </div>

      {/* 表格 */}
      <div className="table-scroll-wrapper">
        <Table
          columns={columns}
          dataSource={pagedUsers}
          pagination={false}
          size="small"
          rowKey="key"
        />
      </div>

      {/* 分页 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <span style={{ fontSize: 12, color: '#000000e0' }}>共 {filteredUsers.length} 条数据</span>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredUsers.length}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={['10', '20', '50']}
          onChange={(page, size) => {
            if (size !== pageSize) { setPageSize(size); setCurrentPage(1) } else { setCurrentPage(page) }
          }}
          size="small"
        />
      </div>

      {/* 编辑弹窗 */}
      <Modal
        title="用户权限配置"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => { setEditModalVisible(false); setEditingUser(null) }}
        width={720}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        {renderEditModalContent()}
      </Modal>

      {/* 新增弹窗 */}
      <Modal
        title="新增用户"
        open={addModalVisible}
        onOk={handleSaveAdd}
        onCancel={() => setAddModalVisible(false)}
        width={720}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 基本信息 */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}><span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>OA号</div>
              <Input value={newUser.userId} onChange={e => setNewUser({ ...newUser, userId: e.target.value })} placeholder="请输入OA号" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>姓名</div>
              <Input value={newUser.realName} onChange={e => setNewUser({ ...newUser, realName: e.target.value })} placeholder="请输入姓名" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>部门</div>
              <Input value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} placeholder="请输入部门" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>角色</div>
              <Select
                value={newUser.role}
                onChange={val => setNewUser({ ...newUser, role: val })}
                options={ROLES.map(r => ({ label: r.label, value: r.value }))}
                style={{ width: '100%' }}
                rootClassName="filter-select"
              />
            </div>
          </div>
          {/* 空间归属 */}
          <div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>所属空间</div>
            <Checkbox.Group
              value={newUser.spaces}
              onChange={vals => handleAddSpaceChange(vals as string[])}
              style={{ display: 'flex', gap: 24 }}
            >
              {SPACES.map(s => (
                <Checkbox key={s} value={s}>{s}</Checkbox>
              ))}
            </Checkbox.Group>
          </div>
          {/* 菜单权限配置 */}
          <div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 14, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
              菜单权限配置
            </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 公共菜单 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>公共菜单</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 200 }}>菜单名称</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>只读</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>读写</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>无权限</th>
                  </tr>
                </thead>
                <tbody>
                  {MENU_TREE['公共'].map(m => {
                    const active = (newUser.spaces || []).includes('公共')
                    const perm = (newUser.menuPermissions || []).find(p => p.key === m.key)
                    const level = active ? (perm?.level || 'none') : 'none'
                    return (
                      <tr key={m.key} style={{ borderBottom: '1px solid #f0f0f0', opacity: active ? 1 : 0.45 }}>
                        <td style={{ padding: '8px 12px' }}>{m.label}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <Radio checked={level === 'read'} onChange={() => {
                            if (!active) return
                            setNewUser(prev => {
                              const filtered = (prev.menuPermissions || []).filter(p => p.key !== m.key)
                              return { ...prev, menuPermissions: [...filtered, { key: m.key, level: 'read' }] }
                            })
                          }} />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <Radio checked={level === 'write'} onChange={() => {
                            if (!active) return
                            setNewUser(prev => {
                              const filtered = (prev.menuPermissions || []).filter(p => p.key !== m.key)
                              return { ...prev, menuPermissions: [...filtered, { key: m.key, level: 'write' }] }
                            })
                          }} />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <Radio checked={level === 'none'} onChange={() => {
                            if (!active) return
                            setNewUser(prev => ({ ...prev, menuPermissions: (prev.menuPermissions || []).filter(p => p.key !== m.key) }))
                          }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* 各空间菜单 - 始终展示全部3个业务空间 */}
            {['理赔', '核保', '反欺诈'].map(space => {
              const active = (newUser.spaces || []).includes(space)
              return (
                <div key={space}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>{space}空间</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 200 }}>菜单名称</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>只读</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>读写</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', width: 80 }}>无权限</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MENU_TREE[space]?.map(m => {
                        const perm = (newUser.menuPermissions || []).find(p => p.key === m.key)
                        const level = active ? (perm?.level || 'none') : 'none'
                        return (
                          <tr key={m.key} style={{ borderBottom: '1px solid #f0f0f0', opacity: active ? 1 : 0.45 }}>
                            <td style={{ padding: '8px 12px' }}>{m.label}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <Radio checked={level === 'read'} onChange={() => {
                                if (!active) return
                                setNewUser(prev => {
                                  const filtered = (prev.menuPermissions || []).filter(p => p.key !== m.key)
                                  return { ...prev, menuPermissions: [...filtered, { key: m.key, level: 'read' }] }
                                })
                              }} />
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <Radio checked={level === 'write'} onChange={() => {
                                if (!active) return
                                setNewUser(prev => {
                                  const filtered = (prev.menuPermissions || []).filter(p => p.key !== m.key)
                                  return { ...prev, menuPermissions: [...filtered, { key: m.key, level: 'write' }] }
                                })
                              }} />
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <Radio checked={level === 'none'} onChange={() => {
                                if (!active) return
                                setNewUser(prev => ({ ...prev, menuPermissions: (prev.menuPermissions || []).filter(p => p.key !== m.key) }))
                              }} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement

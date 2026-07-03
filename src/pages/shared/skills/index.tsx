import React, { useState, useRef } from 'react'
import { Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { skillContentMap } from '../skill-detail'
import {
  StarOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  LinkOutlined,
  PlusOutlined,
  CloseOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'

// ==================== 使用案例数据 ====================
const useCases = [
  {
    id: 1,
    title: '理赔案件自动化处理',
    solution: '通过组合票据OCR识别、理赔案件自动立案、理赔责任判定三个 Skills，实现理赔案件从影像采集到责任初判的全流程自动化处理',
    problem: '传统理赔依赖人工录入票据信息、手动匹配条款、逐项审核责任，处理周期长达5-7个工作日',
    skillsCount: 3,
  },
  {
    id: 2,
    title: '智能核保风控体系',
    solution: 'Agent 调用健康告知评估、体检报告解读、风险智能定价三个 Skills 依次完成告知项分析、体检指标解读和个性化保费定价',
    problem: '核保流程中健康告知审核耗时长、体检指标解读依赖专业医师经验、次标准体定价缺乏统一标准',
    skillsCount: 3,
  },
  {
    id: 3,
    title: '理赔反欺诈联动检测',
    solution: 'Agent 调用理赔欺诈检测、关联图谱分析、理赔责任判定三个 Skills，实现欺诈风险识别、关联案件挖掘和责任最终判定',
    problem: '理赔欺诈案件隐蔽性强、单案检测难以发现团伙欺诈、欺诈检测与责任判定割裂导致重复审核',
    skillsCount: 3,
  },
]

// ==================== Skills 数据 ====================
interface SkillItem {
  name: string
  description: string
  likes: number
  downloads: string
  updated: string
  category: string
  version: string
  publisher: string
}

export const allSkills: SkillItem[] = [
  { name: '票据OCR识别', description: '智能识别并提取发票、收据中的关键字段信息，支持多版式票据的自动识别与结构化输出', likes: 18, downloads: '1.2K', updated: '3天前更新', category: 'OCR识别', version: 'v1.2.0', publisher: '科技部-何军' },
  { name: '医疗文档OCR识别', description: '自动识别病历、检验报告等医疗文档内容，提取关键诊断指标和检验数据', likes: 32, downloads: '2.1K', updated: '5天前更新', category: 'OCR识别', version: 'v2.0.1', publisher: '科技部-张伟' },
  { name: '身份证OCR识别', description: '身份证正反面信息自动识别与校验，支持批量处理和真伪验证', likes: 45, downloads: '3.4K', updated: '2天前更新', category: 'OCR识别', version: 'v1.5.3', publisher: '科技部-何军' },
  { name: '网页数据采集', description: '基于规则的网页数据采集工具，支持增量抓取、去重和结构化存储', likes: 27, downloads: '1.8K', updated: '7天前更新', category: '数据采集', version: 'v1.0.8', publisher: '数据部-陈静' },
  { name: 'API数据同步', description: '多源 API 数据同步聚合，支持定时任务、数据转换和异常重试机制', likes: 15, downloads: '980', updated: '4天前更新', category: '数据采集', version: 'v0.9.2', publisher: '数据部-陈静' },
  { name: '日志采集', description: '分布式日志采集与聚合，支持多数据源接入、实时解析和异常检测', likes: 22, downloads: '1.5K', updated: '6天前更新', category: '数据采集', version: 'v1.1.0', publisher: '数据部-刘伟' },
  { name: '理赔案件自动立案', description: '理赔案件自动立案，根据报案信息智能匹配保险条款，完成责任初判', likes: 56, downloads: '4.2K', updated: '1天前更新', category: '立案定责', version: 'v2.3.0', publisher: '理赔部-马丽' },
  { name: '理赔责任判定', description: '基于知识图谱的理赔责任智能判定，覆盖多险种责任竞合场景', likes: 41, downloads: '2.8K', updated: '3天前更新', category: '立案定责', version: 'v1.8.4', publisher: '理赔部-何军' },
  { name: '理赔欺诈检测', description: '理赔欺诈风险智能检测，基于行为模式和关联分析识别可疑案件', likes: 63, downloads: '5.1K', updated: '2天前更新', category: '立案定责', version: 'v3.1.0', publisher: '风控部-杨刚' },
  { name: '健康告知评估', description: '健康告知智能评估，自动识别异常告知项并给出核保建议', likes: 38, downloads: '2.6K', updated: '4天前更新', category: '核保评估', version: 'v1.4.2', publisher: '核保部-赵强' },
  { name: '风险智能定价', description: '基于多维度风险因子的智能定价，支持次标准体加费计算和拒保决策', likes: 29, downloads: '1.9K', updated: '5天前更新', category: '核保评估', version: 'v0.7.5', publisher: '精算部-孙涛' },
  { name: '体检报告解读', description: '体检报告智能解读，对照核保手册自动给出风险评估和加费建议', likes: 47, downloads: '3.3K', updated: '3天前更新', category: '核保评估', version: 'v2.0.0', publisher: '核保部-王芳' },
]

// 个人 Skills mock 数据（公共 Skills 的子集）
export const mySkills: SkillItem[] = [
  { name: '理赔案件自动立案', description: '理赔案件自动立案，根据报案信息智能匹配保险条款，完成责任初判', likes: 56, downloads: '4.2K', updated: '1天前更新', category: '立案定责', version: 'v2.3.0', publisher: '理赔部-马丽' },
  { name: '体检报告解读', description: '体检报告智能解读，对照核保手册自动给出风险评估和加费建议', likes: 47, downloads: '3.3K', updated: '3天前更新', category: '核保评估', version: 'v2.0.0', publisher: '核保部-王芳' },
]

// 新 Skill 表单数据结构
interface NewSkillForm {
  name: string
  overview: string
  features: string[]
  categories: string[]
  skillMd: string
  apis: { api: string; desc: string; fields: string }[]
  errors: { code: string; desc: string; solution: string }[]
  versions: { version: string; date: string; changes: string }[]
}

const emptyNewSkill: NewSkillForm = {
  name: '',
  overview: '',
  features: [''],
  categories: [],
  skillMd: '',
  apis: [{ api: '', desc: '', fields: '' }],
  errors: [{ code: '', desc: '', solution: '' }],
  versions: [{ version: '', date: '', changes: '' }],
}

const LOAD_COUNT = 9
const categoryList = ['全部', 'OCR识别', '数据采集', '立案定责', '核保评估', '我的收藏']

// ==================== 使用案例卡片 ====================
const UseCaseCard: React.FC<{
  useCase: (typeof useCases)[0]
  active: boolean
  isLeft: boolean
  isRight: boolean
}> = ({ useCase, active, isLeft, isRight }) => {
  const opacity = isLeft || isRight ? 0.3 : 1
  const zIndex = active ? 10 : 5
  const scale = active ? 1 : 0.95

  return (
    <div style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.3s ease', zIndex, width: '100%' }}>
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
        boxShadow: active ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        padding: 24, minHeight: 280, height: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 16, lineHeight: 1.4 }}>{useCase.title}</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>解决方案</div>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>{useCase.solution}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>解决问题</div>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>{useCase.problem}</div>
        </div>
        <div style={{ fontSize: 13, color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <LinkOutlined style={{ fontSize: 12 }} /> 查看案例所用的 {useCase.skillsCount} 个 Skills
        </div>
      </div>
    </div>
  )
}

// ==================== 使用案例轮播（已隐藏） ====================
// @ts-ignore
const UseCaseCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0)
  const total = useCases.length
  const next = () => setCurrent((current + 1) % total)
  const prev = () => setCurrent((current - 1 + total) % total)
  const prevIdx = (current - 1 + total) % total
  const nextIdx = (current + 1) % total

  return (
    <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
      <Row gutter={16} align="middle">
        <Col span={7}><UseCaseCard useCase={useCases[prevIdx]} active={false} isLeft isRight={false} /></Col>
        <Col span={10}><UseCaseCard useCase={useCases[current]} active isLeft={false} isRight={false} /></Col>
        <Col span={7}><UseCaseCard useCase={useCases[nextIdx]} active={false} isLeft={false} isRight /></Col>
      </Row>
      <div onClick={prev} style={{
        position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)',
        width: 32, height: 32, borderRadius: 16, background: '#fff', border: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}>
        <LeftOutlined style={{ fontSize: 12, color: '#374151' }} />
      </div>
      <div onClick={next} style={{
        position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
        width: 32, height: 32, borderRadius: 16, background: '#fff', border: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}>
        <RightOutlined style={{ fontSize: 12, color: '#374151' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {useCases.map((_, idx) => (
          <div key={idx} onClick={() => setCurrent(idx)} style={{
            width: idx === current ? 20 : 8, height: 8, borderRadius: 4,
            background: idx === current ? '#3b82f6' : '#d1d5db', cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ==================== 个人 Skills 卡片 ====================
const MySkillCard: React.FC<{
  skill: SkillItem
}> = ({ skill }) => {
  const navigate = useNavigate()

  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
      padding: 20, height: '100%', display: 'flex', flexDirection: 'column',
      transition: 'all 0.2s ease', cursor: 'pointer',
    }}>
      <div onClick={() => navigate(`/skills/skill/${encodeURIComponent(skill.name)}`)} style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {skill.name}
        </div>
        <div style={{
          fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {skill.description}
        </div>
      </div>

      {/* 版本号 + 发布者 + 查看详情 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{skill.version}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{skill.publisher}</span>
        </div>
        <span onClick={() => navigate(`/skills/skill/${encodeURIComponent(skill.name)}`)} style={{ color: '#3b82f6', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
          查看详情 &gt;
        </span>
      </div>
    </div>
  )
}

// ==================== 公共Skills 卡片 ====================
const PublicSkillCard: React.FC<{
  skill: SkillItem
  liked: boolean
  onToggleLike: () => void
}> = ({ skill, liked, onToggleLike }) => {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
      padding: 20, height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {skill.name}
        </div>
        <div style={{
          fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {skill.description}
        </div>
      </div>

      {/* 版本号 + 发布者 + 收藏 + 更新时间 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{skill.version}</span>
          <span>{skill.publisher}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span onClick={(e) => { e.stopPropagation(); onToggleLike() }} style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
            <StarOutlined style={{ fontSize: 13, color: liked ? '#f59e0b' : '#9ca3af' }} />
            {liked ? skill.likes + 1 : skill.likes}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ClockCircleOutlined style={{ fontSize: 13 }} />
            {skill.updated}
          </span>
        </div>
      </div>
    </div>
  )
}

// ==================== 主页面 ====================
const SharedSkillsMarket: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [likedSkills, setLikedSkills] = useState<Set<string>>(new Set())
  const [displayCount, setDisplayCount] = useState(LOAD_COUNT)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [newSkill, setNewSkill] = useState<NewSkillForm>(emptyNewSkill)
  // 上次「保存」的草稿，重新打开弹窗时恢复；取消时回退到此状态
  const [savedDraft, setSavedDraft] = useState<NewSkillForm>(emptyNewSkill)
  // 保存成功提示弹窗
  const [showSaveToast, setShowSaveToast] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const toggleLike = (name: string) => {
    setLikedSkills(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  // 校验表单必填项
  const validateForm = (): boolean => {
    if (!newSkill.name.trim()) { alert('请填写Skill名称'); return false }
    if (allSkills.some(s => s.name === newSkill.name.trim())) { alert('已存在同名Skill，请修改名称'); return false }
    if (!newSkill.overview.trim()) { alert('请填写Skill概述'); return false }
    if (newSkill.features.filter(f => f.trim()).length === 0) { alert('请至少添加一个功能特性'); return false }
    if (newSkill.categories.length === 0) { alert('请选择至少一个分类标签'); return false }
    if (!newSkill.skillMd.trim()) { alert('请填写SKILL.md内容'); return false }
    if (newSkill.versions.filter(v => v.version.trim()).length === 0) { alert('请至少添加一个版本'); return false }
    if (newSkill.apis.filter(a => a.api.trim()).length === 0) { alert('请至少添加一个API接口'); return false }
    if (newSkill.errors.filter(e => e.code.trim()).length === 0) { alert('请至少添加一个错误码'); return false }
    return true
  }

  // 保存详情页内容（仅写入 skillContentMap，不创建卡片）
  const saveContent = () => {
    skillContentMap[newSkill.name] = {
      overview: newSkill.overview,
      features: newSkill.features.filter(f => f.trim()),
      category: newSkill.categories,
      publisher: '当前用户',
      versions: newSkill.versions.filter(v => v.version.trim()).map(v => ({ ...v, publisher: '当前用户' })),
      skillMd: newSkill.skillMd,
      apis: newSkill.apis.filter(a => a.api.trim()),
      errors: newSkill.errors.filter(e => e.code.trim()),
    }
  }

  // 创建 Skill 卡片（添加到公共列表 + 我的 Skills）
  const createCard = () => {
    const newItem = {
      name: newSkill.name,
      description: newSkill.overview.slice(0, 60) + '...',
      likes: 0,
      downloads: '0',
      updated: '刚刚发布',
      category: newSkill.categories[0] || '未分类',
      version: newSkill.versions[0]?.version || 'v1.0.0',
      publisher: '当前用户',
    }
    allSkills.push(newItem)
    mySkills.push(newItem)
  }

  // 取消：关闭弹窗，表单回退到上次保存的草稿
  const handleCancel = () => {
    setShowPublishModal(false)
    setNewSkill(savedDraft)
  }

  // 保存：校验 → 保存内容 + 显示提示弹窗 → 2.5秒后关闭所有弹窗（悬停暂停）
  const handleSave = () => {
    if (!newSkill.name.trim()) { alert('请填写Skill名称'); return }
    if (allSkills.some(s => s.name === newSkill.name.trim())) { alert('已存在同名Skill，请修改名称'); return }
    saveContent()
    setSavedDraft(newSkill)
    setShowSaveToast(true)
    timerRef.current = setTimeout(() => {
      setShowSaveToast(false)
      setShowPublishModal(false)
    }, 2500)
  }

  // 鼠标悬停暂停倒计时
  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // 鼠标离开恢复倒计时
  const handleMouseLeave = () => {
    if (showSaveToast && !timerRef.current) {
      timerRef.current = setTimeout(() => {
        setShowSaveToast(false)
        setShowPublishModal(false)
      }, 1500)
    }
  }

  // 提交审核：完整校验 → 保存内容 + 创建卡片 + 跳转详情页
  const handleSubmit = () => {
    if (!validateForm()) return
    saveContent()
    createCard()
    setShowPublishModal(false)
    setNewSkill(emptyNewSkill)
    setSavedDraft(emptyNewSkill)
    navigate(`/skills/skill/${newSkill.name}`)
  }

  const updateField = (field: keyof NewSkillForm, value: any) => {
    setNewSkill(prev => ({ ...prev, [field]: value }))
  }

  const filteredSkills = allSkills.filter(skill => {
    const matchSearch = searchKeyword
      ? skill.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchKeyword.toLowerCase())
      : true
    if (activeCategory === '全部') return matchSearch
    if (activeCategory === '我的收藏') return likedSkills.has(skill.name) && matchSearch
    return skill.category === activeCategory && matchSearch
  })

  const displayedSkills = filteredSkills.slice(0, displayCount)
  const hasMore = displayCount < filteredSkills.length

  const loadMore = () => setDisplayCount(prev => Math.min(prev + LOAD_COUNT, filteredSkills.length))

  const titleStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 10,
  }
  const titleBarStyle: React.CSSProperties = {
    width: 4, height: 20, background: '#3b82f6', borderRadius: 10, marginRight: 10,
  }
  const titleTextStyle: React.CSSProperties = {
    fontSize: 18, fontWeight: 700, color: '#1f2937',
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6', padding: '14px 24px 34px',
    }}>
      {/* ===== 最佳实践（已隐藏） ===== */}
      {/* <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
          <div style={titleBarStyle} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>最佳实践</span>
        </div>
        <UseCaseCarousel />
      </div> */}

      {/* ===== 我的Skills ===== */}
      <div style={{ marginTop: 10 }}>
        <div style={{ ...titleStyle, marginTop: 0 }}>
          <div style={titleBarStyle} />
          <span style={titleTextStyle}>我的Skills</span>
        </div>
        <button
          onClick={() => { setNewSkill(savedDraft); setShowPublishModal(true) }}
          style={{
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 16px', border: '1px solid #3b82f6', borderRadius: 6,
            background: '#fff', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
          <PlusOutlined style={{ fontSize: 12 }} /> 发布新Skill
        </button>
        <Row gutter={[20, 20]}>
          {mySkills.map((skill, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <MySkillCard skill={skill} />
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== 公共Skills ===== */}
      <div style={{ marginTop: 40 }}>
        <div style={{ ...titleStyle, marginTop: 0 }}>
          <div style={titleBarStyle} />
          <span style={titleTextStyle}>公共Skills</span>
        </div>

        {/* 分类标签 + 搜索框 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {categoryList.map((tag) => {
              const active = tag === activeCategory
              return (
                <div key={tag} onClick={() => { setActiveCategory(tag); setDisplayCount(LOAD_COUNT) }} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? '#3b82f6' : '#d9d9d9'}`, background: active ? '#eff6ff' : '#fff',
                  color: active ? '#3b82f6' : '#000000e0', cursor: 'pointer', transition: 'all 0.2s ease',
                  lineHeight: 1.4, whiteSpace: 'nowrap',
                }}>
                  {tag}
                </div>
              )
            })}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', width: 360, height: 34, borderRadius: 17,
            border: '1px solid #e5e7eb', background: '#fff', padding: '0 14px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0, marginRight: 8 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="搜索全部Skills" value={searchKeyword}
              onChange={e => { setSearchKeyword(e.target.value); setDisplayCount(LOAD_COUNT) }}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent' }}
            />
          </div>
        </div>

        <Row gutter={[20, 20]}>
          {displayedSkills.map((skill, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <PublicSkillCard skill={skill} liked={likedSkills.has(skill.name)} onToggleLike={() => toggleLike(skill.name)} />
            </Col>
          ))}
        </Row>

        {/* 查看更多按钮 */}
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <button onClick={loadMore} style={{
              padding: '8px 32px', border: '1px solid #e5e7eb', borderRadius: 20,
              background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer',
              fontWeight: 400,
            }}>
              查看更多
            </button>
          </div>
        )}
      </div>

      {/* 发布新Skill 弹窗 */}
      {showPublishModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, width: '90%', maxWidth: 700,
              maxHeight: '85vh', overflow: 'auto', padding: 24,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗标题 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>发布新Skill</span>
              <CloseOutlined onClick={handleCancel} style={{ fontSize: 18, color: '#6b7280', cursor: 'pointer' }} />
            </div>

            {/* Skill名称 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Skill名称 <span style={{ color: '#ff4d4f' }}>*</span></div>
              <input value={newSkill.name} onChange={e => updateField('name', e.target.value)} placeholder="请输入Skill名称" style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #d9d9d9', borderRadius: 8 }} />
            </div>

            {/* 概述 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>概述 <span style={{ color: '#ff4d4f' }}>*</span></div>
              <textarea value={newSkill.overview} onChange={e => updateField('overview', e.target.value)} placeholder="请输入Skill概述" style={{ width: '100%', minHeight: 60, padding: 12, fontSize: 14, border: '1px solid #d9d9d9', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            {/* 功能特性 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>功能特性 <span style={{ color: '#ff4d4f' }}>*</span></div>
              {newSkill.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                  <input value={f} onChange={e => { const nf = [...newSkill.features]; nf[i] = e.target.value; updateField('features', nf) }} placeholder={f === '' ? '输入功能描述' : ''} style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid #d9d9d9', borderRadius: 6 }} />
                  <button onClick={() => updateField('features', newSkill.features.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
                </div>
              ))}
              <button onClick={() => updateField('features', [...newSkill.features, ''])} style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12 }}>+ 添加功能</button>
            </div>

            {/* 分类标签 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>分类标签 <span style={{ color: '#ff4d4f' }}>*</span></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['OCR识别', '数据采集', '立案定责', '核保评估'].map(tag => {
                  const active = newSkill.categories.includes(tag)
                  return (
                    <div key={tag} onClick={() => {
                      const nc = active ? newSkill.categories.filter(c => c !== tag) : [...newSkill.categories, tag]
                      updateField('categories', nc)
                    }} style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
                      border: `1px solid ${active ? '#3b82f6' : '#d9d9d9'}`, background: active ? '#eff6ff' : '#fff',
                      color: active ? '#3b82f6' : '#000000e0', cursor: 'pointer', transition: 'all 0.2s ease',
                    }}>
                      {tag}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SKILL.md */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>SKILL.md <span style={{ color: '#ff4d4f' }}>*</span></div>
              <div style={{
                background: '#fff', borderRadius: 8, overflow: 'hidden',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{
                  background: '#f9fafb', padding: '6px 12px', fontSize: 12, color: '#6b7280',
                  borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>SKILL.md</span>
                </div>
                <textarea
                  value={newSkill.skillMd}
                  onChange={e => updateField('skillMd', e.target.value)}
                  placeholder="# 在此输入SKILL.md内容&#10;&#10;name: your-skill-name&#10;description: 描述你的Skill&#10;version: 1.0.0"
                  style={{
                    width: '100%', minHeight: 200, padding: 16, fontSize: 12,
                    border: 'none', borderRadius: 0, resize: 'vertical',
                    fontFamily: 'Consolas, Monaco, monospace', lineHeight: 1.8,
                    color: '#374151', background: '#fff', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 版本历史 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>版本历史 <span style={{ color: '#ff4d4f' }}>*</span></div>
              {newSkill.versions.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <input value={v.version} onChange={e => {
                    const nv = [...newSkill.versions]; nv[i] = { ...nv[i], version: e.target.value }; updateField('versions', nv)
                  }} placeholder="版本号" style={{ width: 140, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} />
                  <input value={v.date} onChange={e => {
                    const nv = [...newSkill.versions]; nv[i] = { ...nv[i], date: e.target.value }; updateField('versions', nv)
                  }} placeholder="日期" style={{ width: 160, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} />
                  <input value={v.changes} onChange={e => {
                    const nv = [...newSkill.versions]; nv[i] = { ...nv[i], changes: e.target.value }; updateField('versions', nv)
                  }} placeholder="更新内容" style={{ flex: 1, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} />
                  <button onClick={() => updateField('versions', newSkill.versions.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
                </div>
              ))}
            </div>

            {/* API 参考 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>API 参考 <span style={{ color: '#ff4d4f' }}>*</span></div>
              {newSkill.apis.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <input value={item.api} onChange={e => { const na = [...newSkill.apis]; na[i] = { ...na[i], api: e.target.value }; updateField('apis', na) }} placeholder="接口名" style={{ width: 140, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} />
                  <input value={item.desc} onChange={e => { const na = [...newSkill.apis]; na[i] = { ...na[i], desc: e.target.value }; updateField('apis', na) }} placeholder="功能描述" style={{ width: 160, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} />
                  <input value={item.fields} onChange={e => { const na = [...newSkill.apis]; na[i] = { ...na[i], fields: e.target.value }; updateField('apis', na) }} placeholder="返回字段" style={{ flex: 1, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} />
                  <button onClick={() => updateField('apis', newSkill.apis.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
                </div>
              ))}
              <button onClick={() => updateField('apis', [...newSkill.apis, { api: '', desc: '', fields: '' }])} style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12 }}>+ 添加接口</button>
            </div>

            {/* 错误码 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>错误码 <span style={{ color: '#ff4d4f' }}>*</span></div>
              {newSkill.errors.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <input value={item.code} onChange={e => { const ne = [...newSkill.errors]; ne[i] = { ...ne[i], code: e.target.value }; updateField('errors', ne) }} placeholder="错误码" style={{ width: 140, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} />
                  <input value={item.desc} onChange={e => { const ne = [...newSkill.errors]; ne[i] = { ...ne[i], desc: e.target.value }; updateField('errors', ne) }} placeholder="描述" style={{ width: 160, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} />
                  <input value={item.solution} onChange={e => { const ne = [...newSkill.errors]; ne[i] = { ...ne[i], solution: e.target.value }; updateField('errors', ne) }} placeholder="解决方案" style={{ flex: 1, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} />
                  <button onClick={() => updateField('errors', newSkill.errors.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
                </div>
              ))}
              <button onClick={() => updateField('errors', [...newSkill.errors, { code: '', desc: '', solution: '' }])} style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12 }}>+ 添加错误码</button>
            </div>

            {/* 按钮组 */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
              <button onClick={handleCancel} style={{ padding: '6px 16px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>取消</button>
              <button onClick={handleSave} style={{ padding: '6px 16px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>保存</button>
              <button onClick={handleSubmit} style={{ padding: '6px 16px', border: 'none', borderRadius: 6, background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>提交审核</button>
            </div>
          </div>
        </div>
      )}

      {/* 保存成功提示弹窗 */}
      {showSaveToast && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              background: '#fff', borderRadius: 16, padding: '24px 20px', width: 360,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
              textAlign: 'center',
              transform: 'translateY(-20px)',
              pointerEvents: 'auto',
            }}
          >
            <CheckCircleFilled style={{ fontSize: 36, color: '#52c41a', marginBottom: 10 }} />
            <div style={{ fontSize: 15, color: '#1f2937', fontWeight: 500, lineHeight: 1.6 }}>
              编辑内容已保存，即将关闭“发布新Skill”弹窗。
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SharedSkillsMarket

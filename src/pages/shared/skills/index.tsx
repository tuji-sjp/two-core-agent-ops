import React, { useState } from 'react'
import { Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  StarOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons'

// ==================== 使用案例数据 ====================
const useCases = [
  {
    id: 1,
    title: '阿里云官方解决方案一键自动部署',
    solution: '一键自动部署阿里云官方解决方案，包括 VPC、安全组、ECS、RDS 等资源的创建和配置',
    problem: '手动部署耗时长、配置易出错、重复操作多',
    skillsCount: 1,
  },
  {
    id: 2,
    title: '企业级运维',
    solution: 'Agent 调用 Agent Skills 依次完成告警规则配置、告警事件分析、故障根因定位',
    problem: '云资源告警配置复杂、告警根因难定位、人工排查效率低',
    skillsCount: 5,
  },
  {
    id: 3,
    title: 'OpenClaw 自动部署和安全加固',
    solution: 'Agent 调用 Agent Skills 自动批量部署 OpenClaw，并进行安全加固',
    problem: '人工部署慢、漏洞多、修复滞后、合规难达标',
    skillsCount: 2,
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
}

const allSkills: SkillItem[] = [
  { name: '票据OCR识别', description: '智能识别并提取发票、收据中的关键字段信息，支持多版式票据的自动识别与结构化输出', likes: 18, downloads: '1.2K', updated: '3天前更新', category: 'OCR识别', version: 'v1.2.0' },
  { name: '医疗文档OCR识别', description: '自动识别病历、检验报告等医疗文档内容，提取关键诊断指标和检验数据', likes: 32, downloads: '2.1K', updated: '5天前更新', category: 'OCR识别', version: 'v2.0.1' },
  { name: '身份证OCR识别', description: '身份证正反面信息自动识别与校验，支持批量处理和真伪验证', likes: 45, downloads: '3.4K', updated: '2天前更新', category: 'OCR识别', version: 'v1.5.3' },
  { name: '网页数据采集', description: '基于规则的网页数据采集工具，支持增量抓取、去重和结构化存储', likes: 27, downloads: '1.8K', updated: '7天前更新', category: '数据采集', version: 'v1.0.8' },
  { name: 'API数据同步', description: '多源 API 数据同步聚合，支持定时任务、数据转换和异常重试机制', likes: 15, downloads: '980', updated: '4天前更新', category: '数据采集', version: 'v0.9.2' },
  { name: '日志采集', description: '分布式日志采集与聚合，支持多数据源接入、实时解析和异常检测', likes: 22, downloads: '1.5K', updated: '6天前更新', category: '数据采集', version: 'v1.1.0' },
  { name: '理赔案件自动立案', description: '理赔案件自动立案，根据报案信息智能匹配保险条款，完成责任初判', likes: 56, downloads: '4.2K', updated: '1天前更新', category: '立案定责', version: 'v2.3.0' },
  { name: '理赔责任判定', description: '基于知识图谱的理赔责任智能判定，覆盖多险种责任竞合场景', likes: 41, downloads: '2.8K', updated: '3天前更新', category: '立案定责', version: 'v1.8.4' },
  { name: '理赔欺诈检测', description: '理赔欺诈风险智能检测，基于行为模式和关联分析识别可疑案件', likes: 63, downloads: '5.1K', updated: '2天前更新', category: '立案定责', version: 'v3.1.0' },
  { name: '健康告知评估', description: '健康告知智能评估，自动识别异常告知项并给出核保建议', likes: 38, downloads: '2.6K', updated: '4天前更新', category: '核保评估', version: 'v1.4.2' },
  { name: '风险智能定价', description: '基于多维度风险因子的智能定价，支持次标准体加费计算和拒保决策', likes: 29, downloads: '1.9K', updated: '5天前更新', category: '核保评估', version: 'v0.7.5' },
  { name: '体检报告解读', description: '体检报告智能解读，对照核保手册自动给出风险评估和加费建议', likes: 47, downloads: '3.3K', updated: '3天前更新', category: '核保评估', version: 'v2.0.0' },
]

// 个人 Skills mock 数据
const mySkills: SkillItem[] = [
  { name: '我的理赔规则引擎', description: '自定义理赔规则配置工具，支持可视化规则编排和实时生效', likes: 5, downloads: '120', updated: '1天前更新', category: '自定义', version: 'v0.1.0' },
  { name: '智能核保助手', description: '基于历史数据的智能核保建议生成器，支持多维度风险评估', likes: 8, downloads: '230', updated: '3天前更新', category: '自定义', version: 'v0.2.1' },
]

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

// ==================== 使用案例轮播 ====================
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
        <Col span={6}><UseCaseCard useCase={useCases[prevIdx]} active={false} isLeft isRight={false} /></Col>
        <Col span={12}><UseCaseCard useCase={useCases[current]} active isLeft={false} isRight={false} /></Col>
        <Col span={6}><UseCaseCard useCase={useCases[nextIdx]} active={false} isLeft={false} isRight /></Col>
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
      <div onClick={() => navigate(`/shared/skill/${encodeURIComponent(skill.name)}`)} style={{ flex: 1 }}>
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

      {/* 版本号 + 查看详情 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{skill.version}</span>
        <span onClick={() => navigate(`/shared/skill/${encodeURIComponent(skill.name)}`)} style={{ color: '#3b82f6', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
          查看详情 &gt;
        </span>
      </div>
    </div>
  )
}

// ==================== 公共 Skills 卡片 ====================
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

      {/* 版本号 + 收藏 + 更新时间 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
        <span>{skill.version}</span>
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

  const toggleLike = (name: string) => {
    setLikedSkills(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
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
    fontSize: 17, fontWeight: 700, color: '#1f2937',
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6', padding: '14px 24px 34px',
    }}>
      {/* ===== Skills 使用案例 ===== */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <div style={titleBarStyle} />
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>Skills 使用案例</span>
        </div>
        <UseCaseCarousel />
      </div>

      {/* ===== 我的 Skills ===== */}
      <div style={{ marginTop: 30 }}>
        <div style={{ ...titleStyle, marginTop: 0 }}>
          <div style={titleBarStyle} />
          <span style={titleTextStyle}>我的 Skills</span>
        </div>
        <button style={{
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 16px', border: '1px solid #3b82f6', borderRadius: 6,
          background: '#fff', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <PlusOutlined style={{ fontSize: 12 }} /> 发布新 Skill
        </button>
        <Row gutter={[20, 20]}>
          {mySkills.map((skill, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <MySkillCard skill={skill} />
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== 公共 Skills ===== */}
      <div style={{ marginTop: 48 }}>
        <div style={titleStyle}>
          <div style={titleBarStyle} />
          <span style={titleTextStyle}>公共 Skills</span>
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
            <input type="text" placeholder="搜索全部 Skills" value={searchKeyword}
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
              background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer',
              fontWeight: 500,
            }}>
              查看更多
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SharedSkillsMarket

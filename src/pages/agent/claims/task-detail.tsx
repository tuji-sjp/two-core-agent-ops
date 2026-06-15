import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tag, message } from 'antd'
import { ArrowLeftOutlined, FolderOutlined, AppstoreOutlined, CopyOutlined } from '@ant-design/icons'

const CATEGORIES = [
  { name: '全部', count: 91 },
  { name: '病案首页', count: 5 },
  { name: '居民身份证', count: 8 },
  { name: '费用清单', count: 15 },
  { name: '其他_自然场景', count: 3 },
  { name: '手术记录', count: 6 },
  { name: '诊断证明', count: 6 },
  { name: '超声检查报告', count: 8 },
  { name: 'MRI检查报告', count: 5 },
  { name: '血凝检查', count: 4 },
  { name: '出院小结', count: 5 },
  { name: '住院证', count: 2 },
  { name: '理赔申请书', count: 4 },
  { name: '其他化验检查', count: 6 },
  { name: '血生化检查', count: 3 },
  { name: '血常规检查', count: 4 },
  { name: '心电图', count: 3 },
  { name: '医疗票据', count: 4 },
]

// 分组结构（不含 count，count 由 IMAGES 动态计算）
const GROUPS_STRUCTURE = [
  {
    name: '住院组_1',
    children: [
      { name: '费用清单' },
      { name: '超声检查报告' },
      { name: '居民身份证' },
      { name: '手术记录' },
      { name: '其他化验检查' },
      { name: '血凝检查' },
      { name: '理赔申请书' },
      { name: 'MRI检查报告' },
      { name: '病案首页' },
      { name: '其他_自然场景' },
      { name: '出院小结' },
      { name: '住院证' },
      { name: '血常规检查' },
      { name: '血生化检查' },
      { name: '心电图' },
      { name: '医疗票据' },
    ],
  },
  {
    name: '门诊组_2',
    children: [
      { name: '诊断证明' },
    ],
  },
  {
    name: '住院组_3',
    children: [
      { name: '出院小结' },
    ],
  },
  {
    name: '未分组_4',
    children: [
      { name: '诊断证明' },
    ],
  },
]

const TABS = ['影像展示', '引擎结果', 'LIC系统响应']

// 模拟图片数据
const IMAGES: { name: string; category: string; group: string }[] = [
  { name: '病案首页', category: '病案首页', group: '住院组_1' },
  { name: '病案首页', category: '病案首页', group: '住院组_1' },
  { name: '病案首页', category: '病案首页', group: '住院组_1' },
  { name: '病案首页', category: '病案首页', group: '住院组_1' },
  { name: '病案首页', category: '病案首页', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '居民身份证', category: '居民身份证', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '费用清单', category: '费用清单', group: '住院组_1' },
  { name: '其他_自然场景', category: '其他_自然场景', group: '住院组_1' },
  { name: '其他_自然场景', category: '其他_自然场景', group: '住院组_1' },
  { name: '其他_自然场景', category: '其他_自然场景', group: '住院组_1' },
  { name: '手术记录', category: '手术记录', group: '住院组_1' },
  { name: '手术记录', category: '手术记录', group: '住院组_1' },
  { name: '手术记录', category: '手术记录', group: '住院组_1' },
  { name: '手术记录', category: '手术记录', group: '住院组_1' },
  { name: '手术记录', category: '手术记录', group: '住院组_1' },
  { name: '手术记录', category: '手术记录', group: '住院组_1' },
  { name: '诊断证明', category: '诊断证明', group: '门诊组_2' },
  { name: '诊断证明', category: '诊断证明', group: '未分组_4' },
  { name: '诊断证明', category: '诊断证明', group: '门诊组_2' },
  { name: '诊断证明', category: '诊断证明', group: '未分组_4' },
  { name: '诊断证明', category: '诊断证明', group: '门诊组_2' },
  { name: '诊断证明', category: '诊断证明', group: '未分组_4' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: '超声检查报告', category: '超声检查报告', group: '住院组_1' },
  { name: 'MRI检查报告', category: 'MRI检查报告', group: '住院组_1' },
  { name: 'MRI检查报告', category: 'MRI检查报告', group: '住院组_1' },
  { name: 'MRI检查报告', category: 'MRI检查报告', group: '住院组_1' },
  { name: 'MRI检查报告', category: 'MRI检查报告', group: '住院组_1' },
  { name: 'MRI检查报告', category: 'MRI检查报告', group: '住院组_1' },
  { name: '血凝检查', category: '血凝检查', group: '住院组_1' },
  { name: '血凝检查', category: '血凝检查', group: '住院组_1' },
  { name: '血凝检查', category: '血凝检查', group: '住院组_1' },
  { name: '血凝检查', category: '血凝检查', group: '住院组_1' },
  { name: '出院小结', category: '出院小结', group: '住院组_1' },
  { name: '出院小结', category: '出院小结', group: '住院组_1' },
  { name: '出院小结', category: '出院小结', group: '住院组_1' },
  { name: '出院小结', category: '出院小结', group: '住院组_1' },
  { name: '出院小结', category: '出院小结', group: '住院组_1' },
  { name: '住院证', category: '住院证', group: '住院组_1' },
  { name: '住院证', category: '住院证', group: '住院组_1' },
  { name: '理赔申请书', category: '理赔申请书', group: '住院组_1' },
  { name: '理赔申请书', category: '理赔申请书', group: '住院组_1' },
  { name: '理赔申请书', category: '理赔申请书', group: '住院组_1' },
  { name: '理赔申请书', category: '理赔申请书', group: '住院组_1' },
  { name: '其他化验检查', category: '其他化验检查', group: '住院组_1' },
  { name: '其他化验检查', category: '其他化验检查', group: '住院组_1' },
  { name: '其他化验检查', category: '其他化验检查', group: '住院组_1' },
  { name: '其他化验检查', category: '其他化验检查', group: '住院组_1' },
  { name: '其他化验检查', category: '其他化验检查', group: '住院组_1' },
  { name: '其他化验检查', category: '其他化验检查', group: '住院组_1' },
  { name: '血生化检查', category: '血生化检查', group: '住院组_1' },
  { name: '血生化检查', category: '血生化检查', group: '住院组_1' },
  { name: '血生化检查', category: '血生化检查', group: '住院组_1' },
  { name: '血常规检查', category: '血常规检查', group: '住院组_1' },
  { name: '血常规检查', category: '血常规检查', group: '住院组_1' },
  { name: '血常规检查', category: '血常规检查', group: '住院组_1' },
  { name: '血常规检查', category: '血常规检查', group: '住院组_1' },
  { name: '心电图', category: '心电图', group: '住院组_1' },
  { name: '心电图', category: '心电图', group: '住院组_1' },
  { name: '心电图', category: '心电图', group: '住院组_1' },
  { name: '医疗票据', category: '医疗票据', group: '住院组_1' },
  { name: '医疗票据', category: '医疗票据', group: '住院组_1' },
  { name: '医疗票据', category: '医疗票据', group: '住院组_1' },
  { name: '医疗票据', category: '医疗票据', group: '住院组_1' }
]

const ENGINE_RESULT_JSON = JSON.stringify({
  imageList: [
    {
      imageRect: { y1: 0, x1: 601, y2: 767, x2: 601, y3: 767, x3: 7, y4: 0, x4: 7 },
      imageId: 180647425,
      logId: '20447191119107231744',
      imageTypeTotal: '医疗材料',
      imageTypeTotalCode: 'medical_material',
      imageTypeDetail: '医疗票据',
      imageTypeDetailCode: 'medical_invoice',
      imageTypeDetailProb: '0.9998130202',
      imageIndex: '180647425_1',
      repeatIndex: '',
      imageAngle: 270,
      imageQuality: { isClear: '0.5755220652', isComplete: '0.9782338738', isReal: '0.9' },
    },
  ],
}, null, 2)

// 影像详情 mock 数据
const IMAGE_DETAIL_MOCK: Record<string, {
  logId: string
  category: string
  subCategory: string
  confidence: number
  clarity: number
  completeness: number
  authenticity: number
  fields: { name: string; value: string }[]
}> = {
  '医疗票据': {
    logId: '2044719119107231744',
    category: '医疗材料',
    subCategory: '医疗票据',
    confidence: 99.98,
    clarity: 57.55,
    completeness: 97.82,
    authenticity: 90.00,
    fields: [
      { name: '开票日期', value: '2026年05月25日' },
      { name: '住院日期', value: '2026年02月11日' },
      { name: '社保卡号', value: '412929196501161950' },
      { name: '校验码', value: '9f7a91' },
      { name: '其他医保支付', value: '587.7' },
      { name: '姓名', value: '刘兴' },
      { name: '个人账户支付', value: '0.00' },
    ],
  },
  '病案首页': {
    logId: '2044719119107231745',
    category: '病历材料',
    subCategory: '病案首页',
    confidence: 98.50,
    clarity: 82.30,
    completeness: 95.10,
    authenticity: 99.00,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '姓名', value: '刘兴' },
      { name: '性别', value: '男' },
      { name: '年龄', value: '61岁' },
      { name: '入院日期', value: '2026年02月11日' },
      { name: '出院日期', value: '2026年03月15日' },
      { name: '主诊医师', value: '王明华' },
    ],
  },
  '居民身份证': {
    logId: '2044719119107231746',
    category: '身份材料',
    subCategory: '居民身份证',
    confidence: 99.99,
    clarity: 91.20,
    completeness: 100.00,
    authenticity: 99.50,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '性别', value: '男' },
      { name: '民族', value: '汉' },
      { name: '出生日期', value: '1965年01月16日' },
      { name: '身份证号', value: '412929196501161950' },
      { name: '住址', value: '河南省南阳市唐河县' },
    ],
  },
}

const AgentClaimsTaskDetail: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const caseNo = searchParams.get('caseNo') || ''
  const taskId = searchParams.get('taskId') || ''

  // 路由参数变化时滚动到页面顶部
  useEffect(() => {
    // 找到最近的 overflow: auto 父容器并滚动到顶部
    const el = document.querySelector('.ant-layout-content')
    if (el) {
      el.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [caseNo, taskId])

  // 匹配采集日志获取对应状态和创建时间
  const CLAIMS_LOGS = [
    { taskId: '2044719745388838912', caseNo: 'A1000000000', status: 'success', createdAt: '2026-06-02 10:23', imageCount: 23 },
    { taskId: '2044719745288838912', caseNo: 'A1000000000', status: 'success', createdAt: '2026-06-02 10:25', imageCount: 34 },
    { taskId: '2044719745188838912', caseNo: 'B1000000001', status: 'failed', createdAt: '2026-06-01 09:15', imageCount: 45 },
    { taskId: '2044719745088838912', caseNo: 'B1000000001', status: 'success', createdAt: '2026-06-01 09:16', imageCount: 56 },
    { taskId: '2044719744988838912', caseNo: 'B1000000001', status: 'success', createdAt: '2026-06-01 09:17', imageCount: 67 },
    { taskId: '2044719744888838912', caseNo: 'B1000000001', status: 'failed', createdAt: '2026-06-01 09:18', imageCount: 78 },
    { taskId: '2044719744788838912', caseNo: 'C1000000002', status: 'success', createdAt: '2026-05-30 14:10', imageCount: 89 },
    { taskId: '2044719744688838912', caseNo: 'D1000000003', status: 'success', createdAt: '2026-05-27 11:00', imageCount: 20 },
    { taskId: '2044719744588838912', caseNo: 'D1000000003', status: 'failed', createdAt: '2026-05-27 11:01', imageCount: 31 },
    { taskId: '2044719744488838912', caseNo: 'E1000000004', status: 'success', createdAt: '2026-05-24 08:30', imageCount: 42 },
    { taskId: '2044719744388838912', caseNo: 'E1000000004', status: 'success', createdAt: '2026-05-24 08:31', imageCount: 53 },
    { taskId: '2044719744288838912', caseNo: 'E1000000004', status: 'failed', createdAt: '2026-05-24 08:32', imageCount: 64 },
    { taskId: '2044719744188838912', caseNo: 'F1000000005', status: 'success', createdAt: '2026-05-22 16:00', imageCount: 75 },
    { taskId: '2044719744088838912', caseNo: 'G1000000006', status: 'success', createdAt: '2026-05-20 13:00', imageCount: 86 },
    { taskId: '2044719743988838912', caseNo: 'G1000000006', status: 'failed', createdAt: '2026-05-20 13:01', imageCount: 17 },
    { taskId: '2044719743888838912', caseNo: 'H1000000007', status: 'success', createdAt: '2026-05-17 10:00', imageCount: 28 },
    { taskId: '2044719743788838912', caseNo: 'I1000000008', status: 'success', createdAt: '2026-05-16 09:00', imageCount: 39 },
    { taskId: '2044719743688838912', caseNo: 'I1000000008', status: 'failed', createdAt: '2026-05-16 09:01', imageCount: 50 },
    { taskId: '2044719743588838912', caseNo: 'J1000000009', status: 'success', createdAt: '2026-05-14 14:30', imageCount: 61 },
    { taskId: '2044719743488838912', caseNo: 'J1000000009', status: 'success', createdAt: '2026-05-14 14:31', imageCount: 72 },
    { taskId: '2044719743388838912', caseNo: 'J1000000009', status: 'failed', createdAt: '2026-05-14 14:32', imageCount: 83 },
    { taskId: '2044719743288838912', caseNo: 'K1000000010', status: 'success', createdAt: '2026-05-13 10:00', imageCount: 14 },
    { taskId: '2044719743188838912', caseNo: 'K1000000010', status: 'success', createdAt: '2026-05-13 10:02', imageCount: 25 },
    { taskId: '2044719743088838912', caseNo: 'L1000000011', status: 'failed', createdAt: '2026-05-12 11:00', imageCount: 36 },
    { taskId: '2044719742988838912', caseNo: 'M1000000012', status: 'success', createdAt: '2026-05-10 15:00', imageCount: 47 },
    { taskId: '2044719742888838912', caseNo: 'M1000000012', status: 'success', createdAt: '2026-05-10 15:01', imageCount: 58 },
    { taskId: '2044719742788838912', caseNo: 'N1000000013', status: 'failed', createdAt: '2026-05-08 09:30', imageCount: 69 },
    { taskId: '2044719742688838912', caseNo: 'O1000000014', status: 'success', createdAt: '2026-05-06 10:00', imageCount: 80 },
    { taskId: '2044719742588838912', caseNo: 'O1000000014', status: 'success', createdAt: '2026-05-06 10:01', imageCount: 91 },
    { taskId: '2044719742488838912', caseNo: 'P1000000015', status: 'failed', createdAt: '2026-05-04 08:00', imageCount: 22 },
    { taskId: '2044719742388838912', caseNo: 'Q1000000016', status: 'success', createdAt: '2026-05-02 12:00', imageCount: 33 },
    { taskId: '2044719742288838912', caseNo: 'Q1000000016', status: 'success', createdAt: '2026-05-02 12:01', imageCount: 44 },
    { taskId: '2044719742188838912', caseNo: 'Q1000000016', status: 'failed', createdAt: '2026-05-02 12:02', imageCount: 55 },
    { taskId: '2044719742088838912', caseNo: 'R1000000017', status: 'success', createdAt: '2026-04-30 16:30', imageCount: 66 },
    { taskId: '2044719741988838912', caseNo: 'S1000000018', status: 'success', createdAt: '2026-04-28 14:00', imageCount: 77 },
    { taskId: '2044719741888838912', caseNo: 'S1000000018', status: 'failed', createdAt: '2026-04-28 14:01', imageCount: 88 },
    { taskId: '2044719741788838912', caseNo: 'T1000000019', status: 'success', createdAt: '2026-04-26 09:00', imageCount: 19 },
    { taskId: '2044719741688838912', caseNo: 'U1000000020', status: 'success', createdAt: '2026-04-24 11:30', imageCount: 30 },
    { taskId: '2044719741588838912', caseNo: 'U1000000020', status: 'failed', createdAt: '2026-04-24 11:31', imageCount: 41 },
  ]
  const matchedLog = CLAIMS_LOGS.find(l => l.taskId === taskId && l.caseNo === caseNo)
  const logStatus = matchedLog?.status || 'success'
  const logCreatedAt = matchedLog?.createdAt || ''

  const [activeTab, setActiveTab] = useState('影像展示')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [viewMode, setViewMode] = useState<'group' | 'category'>('category')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [activeGroupForItem, setActiveGroupForItem] = useState('')
  const [activeSubItem, setActiveSubItem] = useState('')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(ENGINE_RESULT_JSON).then(() => {
      message.success('已复制到剪贴板')
    })
  }

  // 根据任务匹配获取图片数量
  const taskImageCount = matchedLog?.imageCount || 33
  const taskImages = IMAGES.slice(0, taskImageCount)

  const filteredImages = (() => {
    if (viewMode === 'group' && activeSubItem && activeGroupForItem) {
      return taskImages.filter(img => img.category === activeSubItem && img.group === activeGroupForItem)
    }
    if (activeCategory === '全部') return taskImages
    return taskImages.filter(img => img.category === activeCategory)
  })()

  // 动态计算 GROUPS count（基于 taskImages 数据）
  const dynamicGroups = GROUPS_STRUCTURE.map(group => ({
    ...group,
    children: group.children.map(child => ({
      ...child,
      count: taskImages.filter(img => img.category === child.name && img.group === group.name).length,
    })).filter(child => child.count > 0),
  })).filter(group => group.children.length > 0)

  // 动态计算 CATEGORIES count
  const dynamicCategories = CATEGORIES.map(cat => {
    if (cat.name === '全部') return { ...cat, count: taskImageCount }
    return { ...cat, count: taskImages.filter(img => img.category === cat.name).length }
  }).filter(cat => cat.count > 0)

  const openPreview = (index: number) => { setPreviewIndex(index); setSelectedImageIndex(index) }
  const closePreview = () => setPreviewIndex(null)
  const previewImage = previewIndex !== null ? filteredImages[previewIndex] : null
  const previewDetail = previewImage ? IMAGE_DETAIL_MOCK[previewImage.category] || IMAGE_DETAIL_MOCK['医疗票据'] : null
  const imageId = previewImage ? `180647${String(previewIndex).padStart(3, '0')}` : ''

  const groupTitle = viewMode === 'group' && activeGroupForItem ? `${activeGroupForItem} · ${activeSubItem}` : activeCategory
  const groupImageCount = filteredImages.length

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
            onClick={() => navigate('/agent/claims/logs')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#595959', fontSize: 14 }}
          >
            <ArrowLeftOutlined /> 返回
          </span>
          <div style={{ width: 1, height: 16, background: '#e8e8e8' }} />
          <span style={{ fontSize: 16, marginRight: 24 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>任务号：</span><span style={{ fontWeight: 400 }}>{taskId}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>案件号：</span><span style={{ fontWeight: 400 }}>{caseNo}</span>
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
        {TABS.map((tab) => {
          const active = tab === activeTab
          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
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
              {tab}
            </div>
          )
        })}
      </div>

      {/* 内容区域 */}
      {activeTab === '影像展示' && (
        <div style={{ display: 'flex', gap: 16 }}>
          {/* 左侧分类栏 */}
          <div style={{
            width: 220,
            flexShrink: 0,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {/* 顶部工具栏 */}
            <div style={{
              display: 'flex',
              gap: 0,
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div
                onClick={() => setViewMode('group')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: viewMode === 'group' ? '#fff' : '#6b7280',
                  background: viewMode === 'group' ? '#65a5ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <FolderOutlined style={{ fontSize: 14 }} /> 分组信息
              </div>
              <div
                onClick={() => setViewMode('category')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: viewMode === 'category' ? '#fff' : '#6b7280',
                  background: viewMode === 'category' ? '#65a5ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <AppstoreOutlined style={{ fontSize: 14 }} /> 全部分类
              </div>
            </div>

            {/* 列表区域 */}
            <div style={{ maxHeight: 600, overflowY: 'auto', padding: '8px 0' }}>
              {viewMode === 'group' ? (
                /* 分组树形列表 */
                <div>
                  {dynamicGroups.map((group) => {
                    const isExpanded = expandedGroups.has(group.name)
                    const groupTotal = group.children.reduce((sum, c) => sum + c.count, 0)
                    return (
                      <div key={group.name} style={{ marginBottom: 4 }}>
                        {/* 分组标题 */}
                        <div
                          onClick={() => toggleGroup(group.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            margin: '0 8px',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#000000e0',
                            background: isExpanded ? '#f0f7ff' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                            <span>{group.name}</span>
                          </div>
                          <span style={{
                            fontSize: 12,
                            color: '#9ca3af',
                            background: '#f3f4f6',
                            borderRadius: 10,
                            padding: '1px 8px',
                            minWidth: 20,
                            textAlign: 'center',
                          }}>
                            {groupTotal}
                          </span>
                        </div>
                        {/* 子项列表 */}
                        {isExpanded && (
                          <div style={{ padding: '2px 0' }}>
                            {group.children.map((child) => {
                              const isActive = activeGroupForItem === group.name && activeSubItem === child.name
                              return (
                                <div
                                  key={`${group.name}-${child.name}`}
                                  onClick={() => { setActiveSubItem(child.name); setActiveGroupForItem(group.name) }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 12px 6px 36px',
                                    margin: '0 8px',
                                    borderRadius: 6,
                                    fontSize: 13,
                                    color: isActive ? '#fff' : '#000000e0',
                                    background: isActive ? '#65a5ff' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  <span>{child.name}</span>
                                  <span style={{
                                    fontSize: 12,
                                    color: isActive ? '#fff' : '#9ca3af',
                                    background: isActive ? 'rgba(255,255,255,0.3)' : '#f3f4f6',
                                    borderRadius: 10,
                                    padding: '1px 8px',
                                    minWidth: 20,
                                    textAlign: 'center',
                                  }}>
                                    {child.count}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* 扁平分类列表 */
                dynamicCategories.map((cat) => {
                  const active = cat.name === activeCategory
                  return (
                    <div
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 16px',
                        margin: '0 8px',
                        borderRadius: 6,
                        fontSize: 13,
                        color: active ? '#fff' : '#000000e0',
                        background: active ? '#65a5ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{cat.name}</span>
                      <span style={{
                        fontSize: 12,
                        color: active ? '#fff' : '#9ca3af',
                        background: active ? 'rgba(255,255,255,0.3)' : '#f3f4f6',
                        borderRadius: 10,
                        padding: '1px 8px',
                        minWidth: 20,
                        textAlign: 'center',
                      }}>
                        {cat.count}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 右侧图片网格 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 当前分类标题 */}
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: 4,
            }}>
              {groupTitle}
            </div>
            <div style={{
              fontSize: 12,
              color: '#8C8C8C',
              marginBottom: 16,
            }}>
              共 {groupImageCount} 张图像
            </div>

            {/* 图片网格 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}>
              {filteredImages.map((img, i) => {
                const isSelected = selectedImageIndex === i
                return (
                  <div
                    key={i}
                    onClick={() => { setSelectedImageIndex(i); openPreview(i) }}
                    onMouseEnter={(e) => {
                      if (selectedImageIndex !== i) {
                        e.currentTarget.style.border = '1px solid #93c5fd'
                        e.currentTarget.style.background = '#f0f7ff'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.12)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedImageIndex !== i) {
                        e.currentTarget.style.border = '1px solid #e5e7eb'
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                    style={{
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: isSelected ? '#eff6ff' : '#f9fafb',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    background: `linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {/* 模拟图片模糊效果 */}
                    <div style={{
                      width: '80%',
                      height: '85%',
                      background: 'linear-gradient(180deg, #d1d5db 0%, #e5e7eb 100%)',
                      borderRadius: 2,
                      filter: 'blur(1px)',
                    }} />
                  </div>
                  <div style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    color: '#000000e0',
                    textAlign: 'center',
                    background: '#fff',
                    borderTop: '1px solid #f3f4f6',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {img.name}
                  </div>
                </div>
              );})}
            </div>
          </div>
        </div>
      )}

      {/* 影像预览弹窗 */}
      {previewIndex !== null && previewDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closePreview}
        >
          <div
            style={{
              width: '90vw',
              maxWidth: 1100,
              maxHeight: '90vh',
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                  {previewImage?.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {previewIndex + 1} / {filteredImages.length} - img_id: {imageId}
                </div>
              </div>
              <div
                onClick={closePreview}
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#9ca3af', fontSize: 18,
                }}
              >
                ✕
              </div>
            </div>

            {/* 弹窗主体 */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* 左侧图片预览 */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                borderRight: '1px solid #e5e7eb',
                position: 'relative',
              }}>
                {/* 上一张 */}
                {previewIndex > 0 && (
                  <div
                    onClick={() => { setPreviewIndex(previewIndex - 1); setSelectedImageIndex(previewIndex - 1) }}
                    style={{
                      position: 'absolute', left: 12,
                      width: 40, height: 40, borderRadius: 20,
                      background: '#fff', border: '1px solid #e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      color: '#374151', fontSize: 16,
                    }}
                  >
                    ‹
                  </div>
                )}
                {/* 图片占位 */}
                <div style={{
                  width: 320,
                  aspectRatio: '3/4',
                  background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: '80%',
                    height: '85%',
                    background: 'linear-gradient(180deg, #d1d5db 0%, #e5e7eb 100%)',
                    borderRadius: 2,
                    filter: 'blur(1px)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    display: 'flex', alignItems: 'center', gap: 4,
                    color: '#fff', fontSize: 14, fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    预览
                  </div>
                </div>
                {/* 下一张 */}
                {previewIndex < filteredImages.length - 1 && (
                  <div
                    onClick={() => { setPreviewIndex(previewIndex + 1); setSelectedImageIndex(previewIndex + 1) }}
                    style={{
                      position: 'absolute', right: 12,
                      width: 40, height: 40, borderRadius: 20,
                      background: '#fff', border: '1px solid #e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      color: '#374151', fontSize: 16,
                    }}
                  >
                    ›
                  </div>
                )}
              </div>

              {/* 右侧详情面板 */}
              <div style={{
                width: 360,
                flexShrink: 0,
                overflowY: 'auto',
                padding: 24,
              }}>
                {/* 图像分类 */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>图像分类</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{previewDetail.logId}</div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 16px', background: '#f9fafb', borderRadius: 8, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>大类</span>
                    <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{previewDetail.category}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 16px', background: '#f9fafb', borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>小类</span>
                    <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{previewDetail.subCategory}</span>
                  </div>
                </div>

                {/* 置信度 */}
                <div style={{
                  padding: '12px 16px', background: '#eff6ff', borderRadius: 8, marginBottom: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>置信度</span>
                    <span style={{ fontSize: 14, color: '#3b82f6', fontWeight: 600 }}>{previewDetail.confidence}%</span>
                  </div>
                  <div style={{ height: 6, background: '#dbeafe', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${previewDetail.confidence}%`, background: '#3b82f6', borderRadius: 3 }} />
                  </div>
                </div>

                {/* 图像质量 */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>图像质量</div>
                  {/* 清晰度 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>清晰度</span>
                      <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{previewDetail.clarity}%</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${previewDetail.clarity}%`, background: '#22c55e', borderRadius: 3 }} />
                    </div>
                  </div>
                  {/* 完整度 */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>完整度</span>
                      <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{previewDetail.completeness}%</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${previewDetail.completeness}%`, background: '#3b82f6', borderRadius: 3 }} />
                    </div>
                  </div>
                  {/* 真实性 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>真实性</span>
                      <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500 }}>{previewDetail.authenticity}%</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${previewDetail.authenticity}%`, background: '#a855f7', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>

                {/* 提取字段 */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>提取字段</div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    {previewDetail.fields.map((f, fi) => (
                      <div key={fi} style={{
                        display: 'flex',
                        padding: '10px 16px',
                        borderBottom: fi < previewDetail.fields.length - 1 ? '1px solid #f3f4f6' : 'none',
                        background: fi % 2 === 0 ? '#fff' : '#fafbfc',
                      }}>
                        <span style={{ fontSize: 14, color: '#6b7280', width: 100, flexShrink: 0 }}>{f.name}</span>
                        <span style={{ fontSize: 14, color: '#1f2937' }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === '引擎结果' && (
        <div>
          {/* 标题 + 复制按钮 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: '22px' }}>
              引擎返回结果
            </span>
            <button
              onClick={handleCopyJson}
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
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <CopyOutlined style={{ fontSize: 12 }} /> 复制JSON
            </button>
          </div>

          {/* 代码块 */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: 8,
            border: '1px solid rgb(229, 231, 235)',
            padding: '20px 24px',
            maxHeight: 600,
            overflow: 'auto',
          }}>
            <pre style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.8,
              color: '#1f2937',
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {ENGINE_RESULT_JSON}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'LIC系统响应' && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 16, lineHeight: '22px', minHeight: '28.5px', display: 'flex', alignItems: 'center' }}>
            LIC系统响应
          </div>

          {/* 响应信息卡片 */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            {/* 响应码行 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>响应码</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {logStatus === 'success' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" /><path d="m9 9 6 6" />
                    </svg>
                  )}
                  <span style={{ fontSize: 20, fontWeight: 600, color: logStatus === 'success' ? '#22c55e' : '#ff4d4f' }}>
                    {logStatus === 'success' ? '0' : '-1'}
                  </span>
                </div>
              </div>
              <Tag color={logStatus === 'success' ? 'success' : 'error'} style={{ borderRadius: 6, padding: '2px 12px', fontSize: 14 }}>
                {logStatus === 'success' ? '成功' : '失败'}
              </Tag>
            </div>

            {/* 响应时间行 */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>响应时间</div>
              <div style={{ fontSize: 14, color: '#1f2937' }}>{logCreatedAt}:00</div>
            </div>
          </div>

          {/* 说明卡片 */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 14,
            color: '#3b82f6',
          }}>
            <span style={{ fontWeight: 600 }}>说明：</span>处理成功
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentClaimsTaskDetail

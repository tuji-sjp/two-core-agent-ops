import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tag, message } from 'antd'
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons'
import icoGroupInfo from '../../../assets/icons/分组信息.svg?raw'
import icoAllItems from '../../../assets/icons/全部项目.svg?raw'

// SVG path 解析器：正确处理绝对/相对坐标、所有命令（M/L/H/V/C/S/Q/T/A/Z）和隐式重复
// 返回所有锚点（含控制点）的 x/y 数组，用于计算 bounding box
function parsePath(d: string): { xs: number[]; ys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  const tokens: (string | number)[] = []
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(d)) !== null) {
    if (m[1]) tokens.push(m[1])
    else tokens.push(parseFloat(m[2]))
  }
  let i = 0
  let curX = 0, curY = 0, startX = 0, startY = 0, cmd = ''
  const readNum = (): number => (i < tokens.length && typeof tokens[i] === 'number' ? tokens[i++] as number : 0)
  while (i < tokens.length) {
    if (typeof tokens[i] === 'string') { cmd = tokens[i++] as string }
    if (!cmd) break
    const upper = cmd.toUpperCase()
    const rel = cmd !== upper
    while (i < tokens.length && typeof tokens[i] === 'number') {
      if (upper === 'M') {
        const ox = readNum(), oy = readNum()
        curX = rel ? curX + ox : ox; curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
        startX = curX; startY = curY
        cmd = rel ? 'l' : 'L'
      } else if (upper === 'L' || upper === 'T') {
        const ox = readNum(), oy = readNum()
        curX = rel ? curX + ox : ox; curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
      } else if (upper === 'H') {
        const ox = readNum()
        curX = rel ? curX + ox : ox
        xs.push(curX); ys.push(curY)
      } else if (upper === 'V') {
        const oy = readNum()
        curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
      } else if (upper === 'C') {
        const ox1 = readNum(), oy1 = readNum(), ox2 = readNum(), oy2 = readNum(), ox = readNum(), oy = readNum()
        if (rel) {
          xs.push(curX + ox1, curX + ox2, curX + ox); ys.push(curY + oy1, curY + oy2, curY + oy)
          curX += ox; curY += oy
        } else {
          xs.push(ox1, ox2, ox); ys.push(oy1, oy2, oy)
          curX = ox; curY = oy
        }
      } else if (upper === 'S' || upper === 'Q') {
        const ox1 = readNum(), oy1 = readNum(), ox = readNum(), oy = readNum()
        if (rel) {
          xs.push(curX + ox1, curX + ox); ys.push(curY + oy1, curY + oy)
          curX += ox; curY += oy
        } else {
          xs.push(ox1, ox); ys.push(oy1, oy)
          curX = ox; curY = oy
        }
      } else if (upper === 'A') {
        readNum(); readNum(); readNum(); readNum(); readNum()
        const ox = readNum(), oy = readNum()
        curX = rel ? curX + ox : ox; curY = rel ? curY + oy : oy
        xs.push(curX); ys.push(curY)
      } else if (upper === 'Z') {
        curX = startX; curY = startY
        xs.push(curX); ys.push(curY)
        break
      } else break
    }
  }
  return { xs, ys }
}

// Icon 组件：traced SVG 通过 ?raw 内联，颜色/大小通过 CSS 控制
// 自动解析 path 的真实内容 bounding box（支持绝对/相对坐标），重映射 viewBox 让内容充满容器
const Icon: React.FC<{ src: string; color: string; size?: number; fillRatio?: number }> = ({ src, color, size = 14, fillRatio = 0.95 }) => {
  const html = useMemo(() => {
    let s = src.replace(/^﻿/, '')

    const allXs: number[] = []
    const allYs: number[] = []
    const dRegex = /\bd="([^"]+)"/g
    let m: RegExpExecArray | null
    while ((m = dRegex.exec(s)) !== null) {
      const { xs, ys } = parsePath(m[1])
      allXs.push(...xs)
      allYs.push(...ys)
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const x of allXs) { if (x < minX) minX = x; if (x > maxX) maxX = x }
    for (const y of allYs) { if (y < minY) minY = y; if (y > maxY) maxY = y }

    let finalViewBox: string | undefined
    if (isFinite(minX) && isFinite(maxX) && maxX > minX && maxY > minY) {
      const cw = maxX - minX
      const ch = maxY - minY
      const maxDim = Math.max(cw, ch)
      const half = maxDim / (2 * fillRatio)
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2
      const vbSize = maxDim / fillRatio
      finalViewBox = `${cx - half} ${cy - half} ${vbSize} ${vbSize}`
    }

    let svgAttrs = ''
    s = s.replace(/<svg\b([^>]*)>/, (_, attrs: string) => {
      svgAttrs = attrs
      return ''
    })
    if (svgAttrs) {
      let a = svgAttrs
        .replace(/\s*width="[^"]*"/, '')
        .replace(/\s*height="[^"]*"/, '')
        .replace(/\s*viewBox="[^"]*"/, '')
      const vb = finalViewBox ? ` viewBox="${finalViewBox}"` : ''
      s = `<svg${a}${vb} width="1em" height="1em">` + s
    }

    s = s.replace(/fill="[^"]+"/g, 'fill="currentColor"')
    s = s.replace(/stroke="[^"]+"/g, 'stroke="currentColor"')
    return s
  }, [src, fillRatio])
  return (
    <span
      style={{ fontSize: size, color, display: 'inline-flex', lineHeight: 1, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

const CATEGORIES = [
  { name: '全部', count: 91 },
  { name: '病案首页', count: 5 },
  { name: '病案首页附页', count: 3 },
  { name: '居民身份证', count: 8 },
  { name: '银行卡', count: 2 },
  { name: '费用清单', count: 15 },
  { name: '结算单', count: 10 },
  { name: '医疗票据', count: 4 },
  { name: '增值税发票', count: 7 },
  { name: '其他_自然场景', count: 3 },
  { name: '手术记录', count: 6 },
  { name: '诊断证明', count: 6 },
  { name: '门诊病历', count: 4 },
  { name: '超声检查报告', count: 8 },
  { name: 'MRI检查报告', count: 5 },
  { name: 'CT检查报告', count: 6 },
  { name: '血凝检查', count: 4 },
  { name: '出院小结', count: 5 },
  { name: '住院证', count: 2 },
  { name: '入院记录_住院记录', count: 3 },
  { name: '理赔申请书', count: 4 },
  { name: '理赔须知', count: 2 },
  { name: '其他化验检查', count: 6 },
  { name: '血生化检查', count: 3 },
  { name: '血常规检查', count: 4 },
  { name: '心电图', count: 3 },
]

// 分组结构：支持三级嵌套
// 已分组：住院组/门诊组 -> 病历组/票据组 -> 具体分类
// 待分组：平铺分类
// 无需分组：平铺分类
const GROUPS_STRUCTURE = [
  {
    name: '已分组',
    type: 'nested' as const,
    children: [
      {
        name: '住院组',
        children: [
          {
            name: '病历组',
            children: [
              { name: '出院小结' },
              { name: '诊断证明' },
            ],
          },
          {
            name: '票据组1',
            children: [
              { name: '医疗票据' },
              { name: '费用清单' },
              { name: '结算单' },
            ],
          },
          {
            name: '票据组2',
            children: [
              { name: '增值税发票' },
              { name: '费用清单' },
              { name: '结算单' },
            ],
          },
        ],
      },
      {
        name: '门诊组',
        children: [
          {
            name: '病历组',
            children: [
              { name: '门诊病历' },
            ],
          },
          {
            name: '票据组1',
            children: [
              { name: '医疗票据' },
              { name: '费用清单' },
              { name: '结算单' },
            ],
          },
          {
            name: '票据组2',
            children: [
              { name: '增值税发票' },
              { name: '费用清单' },
              { name: '结算单' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: '待分组',
    type: 'flat' as const,
    children: [
      { name: '出院小结' },
      { name: '诊断证明' },
      { name: '门诊病历' },
      { name: '医疗票据' },
      { name: '增值税发票' },
      { name: '费用清单' },
      { name: '结算单' },
    ],
  },
  {
    name: '无需分组',
    type: 'flat' as const,
    children: [
      { name: '病案首页' },
      { name: '病案首页附页' },
      { name: '手术记录' },
      { name: '超声检查报告' },
      { name: 'MRI检查报告' },
      { name: 'CT检查报告' },
      { name: '血凝检查' },
      { name: '血生化检查' },
      { name: '血常规检查' },
      { name: '心电图' },
      { name: '其他化验检查' },
      { name: '住院证' },
      { name: '入院记录_住院记录' },
      { name: '理赔申请书' },
      { name: '理赔须知' },
      { name: '居民身份证' },
      { name: '银行卡' },
      { name: '其他_自然场景' },
    ],
  },
]

const TABS = ['引擎结果', '影像展示']

// 标签类型与配色
const TAG_TYPES = ['重复', '切割', '矫正'] as const
type ImageTag = typeof TAG_TYPES[number]
const TAG_STYLES: Record<ImageTag, { bg: string; color: string }> = {
  '重复': { bg: 'rgba(255,152,0,0.9)', color: '#fff' },
  '切割': { bg: 'rgba(59,130,246,0.9)', color: '#fff' },
  '矫正': { bg: 'rgba(34,197,94,0.9)', color: '#fff' },
}

// 为每张图随机分配 0~2 个标签（种子化伪随机，保证刷新后稳定）
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function assignTags(images: { name: string; category: string; group: string }[]): { name: string; category: string; group: string; tags: ImageTag[] }[] {
  const rand = seededRandom(42)
  return images.map((img) => {
    const tagCount = rand() < 0.35 ? 0 : rand() < 0.65 ? 1 : 2
    const shuffled = [...TAG_TYPES].sort(() => rand() - 0.5)
    const tags = shuffled.slice(0, tagCount)
    return { ...img, tags }
  })
}

// 模拟图片数据
const IMAGES: { name: string; category: string; group: string }[] = [
  // 住院组
  { name: '出院小结', category: '出院小结', group: '住院组' },
  { name: '出院小结', category: '出院小结', group: '住院组' },
  { name: '出院小结', category: '出院小结', group: '住院组' },
  { name: '诊断证明', category: '诊断证明', group: '住院组' },
  { name: '诊断证明', category: '诊断证明', group: '住院组' },
  { name: '诊断证明', category: '诊断证明', group: '住院组' },
  { name: '诊断证明', category: '诊断证明', group: '住院组' },
  { name: '医疗票据', category: '医疗票据', group: '住院组' },
  { name: '医疗票据', category: '医疗票据', group: '住院组' },
  { name: '医疗票据', category: '医疗票据', group: '住院组' },
  { name: '增值税发票', category: '增值税发票', group: '住院组' },
  { name: '费用清单', category: '费用清单', group: '住院组' },
  { name: '费用清单', category: '费用清单', group: '住院组' },
  { name: '结算单', category: '结算单', group: '住院组' },
  { name: '结算单', category: '结算单', group: '住院组' },
  { name: '结算单', category: '结算单', group: '住院组' },
  { name: '结算单', category: '结算单', group: '住院组' },
  { name: '结算单', category: '结算单', group: '住院组' },
  // 门诊组
  { name: '门诊病历', category: '门诊病历', group: '门诊组' },
  { name: '门诊病历', category: '门诊病历', group: '门诊组' },
  { name: '门诊病历', category: '门诊病历', group: '门诊组' },
  { name: '医疗票据', category: '医疗票据', group: '门诊组' },
  { name: '增值税发票', category: '增值税发票', group: '门诊组' },
  { name: '增值税发票', category: '增值税发票', group: '门诊组' },
  { name: '增值税发票', category: '增值税发票', group: '门诊组' },
  { name: '费用清单', category: '费用清单', group: '门诊组' },
  { name: '结算单', category: '结算单', group: '门诊组' },
  { name: '结算单', category: '结算单', group: '门诊组' },
  // 待分组
  { name: '出院小结', category: '出院小结', group: '待分组' },
  { name: '诊断证明', category: '诊断证明', group: '待分组' },
  { name: '诊断证明', category: '诊断证明', group: '待分组' },
  { name: '门诊病历', category: '门诊病历', group: '待分组' },
  { name: '医疗票据', category: '医疗票据', group: '待分组' },
  { name: '医疗票据', category: '医疗票据', group: '待分组' },
  { name: '增值税发票', category: '增值税发票', group: '待分组' },
  { name: '费用清单', category: '费用清单', group: '待分组' },
  { name: '费用清单', category: '费用清单', group: '待分组' },
  { name: '结算单', category: '结算单', group: '待分组' },
  // 无需分组
  { name: '病案首页', category: '病案首页', group: '无需分组' },
  { name: '病案首页', category: '病案首页', group: '无需分组' },
  { name: '病案首页附页', category: '病案首页附页', group: '无需分组' },
  { name: '病案首页附页', category: '病案首页附页', group: '无需分组' },
  { name: '病案首页附页', category: '病案首页附页', group: '无需分组' },
  { name: '手术记录', category: '手术记录', group: '无需分组' },
  { name: '手术记录', category: '手术记录', group: '无需分组' },
  { name: '超声检查报告', category: '超声检查报告', group: '无需分组' },
  { name: '超声检查报告', category: '超声检查报告', group: '无需分组' },
  { name: '超声检查报告', category: '超声检查报告', group: '无需分组' },
  { name: '超声检查报告', category: '超声检查报告', group: '无需分组' },
  { name: 'MRI检查报告', category: 'MRI检查报告', group: '无需分组' },
  { name: 'CT检查报告', category: 'CT检查报告', group: '无需分组' },
  { name: 'CT检查报告', category: 'CT检查报告', group: '无需分组' },
  { name: 'CT检查报告', category: 'CT检查报告', group: '无需分组' },
  { name: '血凝检查', category: '血凝检查', group: '无需分组' },
  { name: '血生化检查', category: '血生化检查', group: '无需分组' },
  { name: '血生化检查', category: '血生化检查', group: '无需分组' },
  { name: '血常规检查', category: '血常规检查', group: '无需分组' },
  { name: '心电图', category: '心电图', group: '无需分组' },
  { name: '心电图', category: '心电图', group: '无需分组' },
  { name: '心电图', category: '心电图', group: '无需分组' },
  { name: '其他化验检查', category: '其他化验检查', group: '无需分组' },
  { name: '住院证', category: '住院证', group: '无需分组' },
  { name: '住院证', category: '住院证', group: '无需分组' },
  { name: '入院记录_住院记录', category: '入院记录_住院记录', group: '无需分组' },
  { name: '理赔申请书', category: '理赔申请书', group: '无需分组' },
  { name: '理赔须知', category: '理赔须知', group: '无需分组' },
  { name: '其他_自然场景', category: '其他_自然场景', group: '无需分组' },
]

const IMAGES_WITH_TAGS = assignTags(IMAGES)

const ENGINE_RESULT_DATA = {
  imageList: [
    { imageId: 180647000, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '费用清单', imageTypeDetailCode: '费用清单', imageTypeDetailProb: '0.95', imageIndex: '180647000_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647001, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '费用清单', imageTypeDetailCode: '费用清单', imageTypeDetailProb: '0.95', imageIndex: '180647001_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647002, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '费用清单', imageTypeDetailCode: '费用清单', imageTypeDetailProb: '0.95', imageIndex: '180647002_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647003, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647003_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647004, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647004_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647005, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647005_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647006, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647006_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647007, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647007_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647008, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647008_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647009, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '结算单', imageTypeDetailCode: '结算单', imageTypeDetailProb: '0.95', imageIndex: '180647009_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647010, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '医疗票据', imageTypeDetailCode: '医疗票据', imageTypeDetailProb: '0.95', imageIndex: '180647010_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647011, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '医疗票据', imageTypeDetailCode: '医疗票据', imageTypeDetailProb: '0.95', imageIndex: '180647011_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647012, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '医疗票据', imageTypeDetailCode: '医疗票据', imageTypeDetailProb: '0.95', imageIndex: '180647012_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647013, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '医疗票据', imageTypeDetailCode: '医疗票据', imageTypeDetailProb: '0.95', imageIndex: '180647013_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647014, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '医疗票据', imageTypeDetailCode: '医疗票据', imageTypeDetailProb: '0.95', imageIndex: '180647014_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647015, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '增值税发票', imageTypeDetailCode: '增值税发票', imageTypeDetailProb: '0.95', imageIndex: '180647015_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647016, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '增值税发票', imageTypeDetailCode: '增值税发票', imageTypeDetailProb: '0.95', imageIndex: '180647016_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647017, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '增值税发票', imageTypeDetailCode: '增值税发票', imageTypeDetailProb: '0.95', imageIndex: '180647017_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647018, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '增值税发票', imageTypeDetailCode: '增值税发票', imageTypeDetailProb: '0.95', imageIndex: '180647018_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647019, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '诊断证明', imageTypeDetailCode: '诊断证明', imageTypeDetailProb: '0.95', imageIndex: '180647019_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647020, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '诊断证明', imageTypeDetailCode: '诊断证明', imageTypeDetailProb: '0.95', imageIndex: '180647020_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647021, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '诊断证明', imageTypeDetailCode: '诊断证明', imageTypeDetailProb: '0.95', imageIndex: '180647021_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647022, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '诊断证明', imageTypeDetailCode: '诊断证明', imageTypeDetailProb: '0.95', imageIndex: '180647022_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647023, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '诊断证明', imageTypeDetailCode: '诊断证明', imageTypeDetailProb: '0.95', imageIndex: '180647023_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647024, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '诊断证明', imageTypeDetailCode: '诊断证明', imageTypeDetailProb: '0.95', imageIndex: '180647024_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647025, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '门诊病历', imageTypeDetailCode: '门诊病历', imageTypeDetailProb: '0.95', imageIndex: '180647025_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647026, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '门诊病历', imageTypeDetailCode: '门诊病历', imageTypeDetailProb: '0.95', imageIndex: '180647026_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647027, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '门诊病历', imageTypeDetailCode: '门诊病历', imageTypeDetailProb: '0.95', imageIndex: '180647027_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647028, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '门诊病历', imageTypeDetailCode: '门诊病历', imageTypeDetailProb: '0.95', imageIndex: '180647028_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647029, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '出院小结', imageTypeDetailCode: '出院小结', imageTypeDetailProb: '0.95', imageIndex: '180647029_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647030, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '出院小结', imageTypeDetailCode: '出院小结', imageTypeDetailProb: '0.95', imageIndex: '180647030_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647031, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '出院小结', imageTypeDetailCode: '出院小结', imageTypeDetailProb: '0.95', imageIndex: '180647031_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
    { imageId: 180647032, logId: '2044686737098563584', imageTypeTotal: '医疗材料', imageTypeTotalCode: 'medical_material', imageTypeDetail: '出院小结', imageTypeDetailCode: '出院小结', imageTypeDetailProb: '0.95', imageIndex: '180647032_1', repeatIndex: '', imageAngle: 0, imageRect: { y1: 0, x1: 0, y2: 100, x2: 100, y3: 100, x3: 0, y4: 0, x4: 0 }, imageQuality: { isClear: '0.9', isComplete: '0.9', isReal: '0.9' }, imageOcr: {} },
  ],
  medicalGroup: [
    {
      groupSeq: '1', groupType: '住院组',
      children: [
        {
          subGroupSeq: '1', subGroupType: '病历组',
          items: [
            { imageType: '出院小结', typeImageList: [{ typeImageId: '180647029_1' }, { typeImageId: '180647029_1' }] },
            { imageType: '诊断证明', typeImageList: [{ typeImageId: '180647019_1' }, { typeImageId: '180647019_1' }] },
          ],
        },
        {
          subGroupSeq: '2', subGroupType: '票据组1',
          items: [
            { imageType: '医疗票据', typeImageList: [{ typeImageId: '180647010_1' }, { typeImageId: '180647010_1' }] },
            { typeImageId: '180647000_1' },
            { imageType: '结算单', typeImageList: [{ typeImageId: '180647003_1' }, { typeImageId: '180647003_1' }] },
          ],
        },
        {
          subGroupSeq: '3', subGroupType: '票据组2',
          items: [
            { typeImageId: '180647015_1' },
          ],
        },
      ],
    },
    {
      groupSeq: '2', groupType: '门诊组',
      children: [
        {
          subGroupSeq: '1', subGroupType: '病历组',
          items: [
            { imageType: '门诊病历', typeImageList: [{ typeImageId: '180647025_1' }, { typeImageId: '180647025_1' }] },
          ],
        },
        {
          subGroupSeq: '2', subGroupType: '票据组1',
          items: [
            { typeImageId: '180647010_1' },
            { typeImageId: '180647000_1' },
            { typeImageId: '180647003_1' },
          ],
        },
        {
          subGroupSeq: '3', subGroupType: '票据组2',
          items: [
            { imageType: '增值税发票', typeImageList: [{ typeImageId: '180647015_1' }, { typeImageId: '180647015_1' }] },
          ],
        },
      ],
    },
    {
      groupSeq: '3', groupType: '待分组',
      items: [
        { typeImageId: '180647003_1' },
        { typeImageId: '180647029_1' },
      ],
    },
    {
      groupSeq: '4', groupType: '无需分组',
      items: [
        { imageType: '病案首页', typeImageList: [{ typeImageId: '180647000_1' }, { typeImageId: '180647000_1' }] },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
        { typeImageId: '180647000_1' },
      ],
    },
  ],
  claimInfo: {},
  verificationInfo: {},
  qualityInfo: {},
  // ── 理赔接收结果 ──
  claimResult: {
    receiveNo: 'R1',
    orderId: 'O1',
    result: '0',
    collectMode: '2',
    num: 2,
    groupList: [
      {
        groupNo: '1',
        groupId: '1234567890',
        groupName: '',
        medicalInfo: {
          name: '张三', nameImageId: '180647030',
          clicType: '住院',
          clicDate: '', clicDateImageId: '',
          inHosDate: '20260102', inHosDateImageId: '180647000',
          outHosDate: '20260110', outHosDateImageId: '180647000',
          hospCode: '协和', hospCodeImageId: '180647007',
          hosSubjectCode: '心内科', hosSubjectImageId: '180647003',
          outResult: '好转', outResultImageId: '180647003',
          doctorName: '李医生', doctorNameImageId: '180647003',
          isIcuTreatment: '', isIcuTreatImageId: '',
        },
        diagnosisInfoList: [
          { keyword: '高血压', imageId: '180647003', score: '1.00', icd6: 'I10.x00', icd6Name: '高血压', icd4: 'I10', icd4Name: '原发性高血压', licCode: 'I10', licName: '高血压', labels: [{ labelCode: 'ICD1/ICD3', labelName: '诊断/循环系统' }] },
        ],
        surgicalInfoList: [
          { surgKeyword: '冠脉支架植入术', surgName: '冠脉支架植入术', surgDate: '20260105', imageId: '180647003', surgCode: '', surgNameHids: '', surgCodeHids: '', score: '', labels: [] },
        ],
        historyInfoList: [
          { diseaseKeyword: '既往高血压病史10年', diseaseName: '高血压', historyDate: '', imageId: '180647003', score: '' },
        ],
        surgHistoryInfoList: [
          { surgKeyword: '阑尾切除术', surgName: '阑尾切除术', surgDate: '20180312', imageId: '180647003', surgCode: '', surgNameHids: '', surgCodeHids: '', score: '', labels: [] },
        ],
        medicalGroupImageList: [
          { imageType: '出院小结', imageTypeDesc: '', totalNum: '1', imageList: [{ imageId: '180647000', serialNum: '1' }] },
        ],
        billGroupInfoList: [
          {
            billGroupNo: '1', billGroupId: '9876543210',
            basicData: {
              billNo: 'INV001', billNoImageId: '180647007',
              billEleType: '02', billEleTypeImageId: '180647007',
              imageType: '电子住院发票', imageTypeImageId: '180647007',
              billType: '电子住院发票',
              billSourceType: '01',
              billTotalAmt: '2000.00', billTotalAmtImageId: '180647007',
              isSclPay: '01', isSclPayImageId: '180647007',
              insuredType: '01', insuredTypeImageId: '180647007',
            },
            accountData: {
              socialInsPayment: '1500.00', socialInsPaymentImageId: '180647007',
              allOwnPayment: '500.00', allOwnPaymentImageId: '180647007',
              yiOwnPayment: '50.00',
            },
            categoryData: [
              { chargeCategory: '西药费', chargeCategoryImageId: '180647007', chargeStandardName: '西药', chargeStandardCode: '01', categoryAmt: '800.00' },
            ],
            feeDtData: [
              { itemName: '阿莫西林', itemNameImageId: '180647007', totalAmt: '100.00', quantity: '4', unitPrice: '25.00', specification: '0.25g' },
            ],
            billGroupImageList: [
              { imageType: '电子住院发票', imageList: [{ imageId: '180647007', serialNum: '1' }] },
            ],
          },
        ],
      },
    ],
    noGroup: [],
  },
}

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
  '病案首页附页': {
    logId: '2044719119107231747',
    category: '病历材料',
    subCategory: '病案首页附页',
    confidence: 97.20,
    clarity: 80.10,
    completeness: 93.50,
    authenticity: 98.50,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '附页类型', value: '手术及操作信息' },
      { name: '手术名称', value: '冠状动脉支架植入术' },
      { name: '手术日期', value: '2026年02月15日' },
      { name: '术者', value: '李建国' },
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
  '银行卡': {
    logId: '2044719119107231748',
    category: '身份材料',
    subCategory: '银行卡',
    confidence: 98.70,
    clarity: 88.40,
    completeness: 96.20,
    authenticity: 97.80,
    fields: [
      { name: '银行名称', value: '中国工商银行' },
      { name: '卡号', value: '6222 0217 **** 1950' },
      { name: '持卡人', value: '刘兴' },
      { name: '卡类型', value: '借记卡' },
    ],
  },
  '费用清单': {
    logId: '2044719119107231749',
    category: '医疗材料',
    subCategory: '费用清单',
    confidence: 99.10,
    clarity: 75.30,
    completeness: 94.80,
    authenticity: 92.50,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '姓名', value: '刘兴' },
      { name: '费用类别', value: '西药费' },
      { name: '金额', value: '3,256.80' },
      { name: '记账日期', value: '2026年02月11日-03月15日' },
    ],
  },
  '结算单': {
    logId: '2044719119107231750',
    category: '医疗材料',
    subCategory: '结算单',
    confidence: 98.40,
    clarity: 79.60,
    completeness: 95.30,
    authenticity: 93.10,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '姓名', value: '刘兴' },
      { name: '总费用', value: '42,568.50' },
      { name: '医保支付', value: '35,200.00' },
      { name: '个人支付', value: '7,368.50' },
      { name: '结算日期', value: '2026年03月15日' },
    ],
  },
  '增值税发票': {
    logId: '2044719119107231751',
    category: '医疗材料',
    subCategory: '增值税发票',
    confidence: 99.50,
    clarity: 83.70,
    completeness: 97.10,
    authenticity: 95.20,
    fields: [
      { name: '发票代码', value: '044032100411' },
      { name: '发票号码', value: '38572914' },
      { name: '开票日期', value: '2026年03月20日' },
      { name: '金额', value: '1,280.00' },
      { name: '销售方', value: '某某医药有限公司' },
    ],
  },
  '出院小结': {
    logId: '2044719119107231752',
    category: '病历材料',
    subCategory: '出院小结',
    confidence: 98.80,
    clarity: 81.40,
    completeness: 96.50,
    authenticity: 97.30,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '姓名', value: '刘兴' },
      { name: '入院日期', value: '2026年02月11日' },
      { name: '出院日期', value: '2026年03月15日' },
      { name: '入院诊断', value: '冠心病' },
      { name: '出院诊断', value: '冠心病（支架术后）' },
      { name: '主治医师', value: '王明华' },
    ],
  },
  '诊断证明': {
    logId: '2044719119107231753',
    category: '病历材料',
    subCategory: '诊断证明',
    confidence: 97.90,
    clarity: 78.20,
    completeness: 94.60,
    authenticity: 96.10,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '性别', value: '男' },
      { name: '年龄', value: '61岁' },
      { name: '诊断', value: '冠状动脉粥样硬化性心脏病' },
      { name: '出具日期', value: '2026年03月15日' },
      { name: '医师', value: '王明华' },
    ],
  },
  '门诊病历': {
    logId: '2044719119107231754',
    category: '病历材料',
    subCategory: '门诊病历',
    confidence: 97.60,
    clarity: 76.50,
    completeness: 93.80,
    authenticity: 95.40,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '就诊日期', value: '2026年02月08日' },
      { name: '科室', value: '心血管内科' },
      { name: '主诉', value: '反复胸闷气促3月' },
      { name: '诊断', value: '冠心病' },
      { name: '医师', value: '张丽华' },
    ],
  },
  '手术记录': {
    logId: '2044719119107231755',
    category: '病历材料',
    subCategory: '手术记录',
    confidence: 98.20,
    clarity: 80.80,
    completeness: 95.90,
    authenticity: 96.80,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '姓名', value: '刘兴' },
      { name: '手术名称', value: '经皮冠状动脉介入治疗（PCI）' },
      { name: '手术日期', value: '2026年02月15日' },
      { name: '术者', value: '李建国' },
      { name: '麻醉方式', value: '局部麻醉' },
    ],
  },
  '超声检查报告': {
    logId: '2044719119107231756',
    category: '检验报告',
    subCategory: '超声检查报告',
    confidence: 98.60,
    clarity: 82.90,
    completeness: 96.10,
    authenticity: 97.50,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '检查部位', value: '心脏' },
      { name: '检查日期', value: '2026年02月12日' },
      { name: '超声所见', value: '左室壁节段性运动异常，EF 52%' },
      { name: '检查医师', value: '赵伟' },
    ],
  },
  'MRI检查报告': {
    logId: '2044719119107231757',
    category: '检验报告',
    subCategory: 'MRI检查报告',
    confidence: 98.10,
    clarity: 81.30,
    completeness: 95.50,
    authenticity: 97.10,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '检查部位', value: '颅脑' },
      { name: '检查日期', value: '2026年02月13日' },
      { name: '检查所见', value: '脑实质未见明显异常信号' },
      { name: '检查医师', value: '孙明' },
    ],
  },
  'CT检查报告': {
    logId: '2044719119107231758',
    category: '检验报告',
    subCategory: 'CT检查报告',
    confidence: 98.30,
    clarity: 83.20,
    completeness: 95.80,
    authenticity: 97.30,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '检查部位', value: '胸部' },
      { name: '检查日期', value: '2026年02月11日' },
      { name: '检查所见', value: '双肺纹理清晰，未见明显实质性病变' },
      { name: '检查医师', value: '孙明' },
    ],
  },
  '血凝检查': {
    logId: '2044719119107231759',
    category: '检验报告',
    subCategory: '血凝检查',
    confidence: 97.80,
    clarity: 79.40,
    completeness: 94.30,
    authenticity: 96.40,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '标本类型', value: '静脉血' },
      { name: '检验日期', value: '2026年02月12日' },
      { name: 'PT', value: '12.8s' },
      { name: 'APTT', value: '30.5s' },
      { name: 'INR', value: '1.05' },
    ],
  },
  '血生化检查': {
    logId: '2044719119107231760',
    category: '检验报告',
    subCategory: '血生化检查',
    confidence: 98.00,
    clarity: 80.60,
    completeness: 95.00,
    authenticity: 96.70,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '标本类型', value: '静脉血' },
      { name: '检验日期', value: '2026年02月12日' },
      { name: 'ALT', value: '28 U/L' },
      { name: 'AST', value: '32 U/L' },
      { name: '肌酐', value: '82 μmol/L' },
      { name: '总胆固醇', value: '5.8 mmol/L' },
    ],
  },
  '血常规检查': {
    logId: '2044719119107231761',
    category: '检验报告',
    subCategory: '血常规检查',
    confidence: 98.20,
    clarity: 81.80,
    completeness: 95.40,
    authenticity: 96.90,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '标本类型', value: '静脉血' },
      { name: '检验日期', value: '2026年02月12日' },
      { name: 'WBC', value: '6.8×10⁹/L' },
      { name: 'RBC', value: '4.5×10¹²/L' },
      { name: 'HGB', value: '138 g/L' },
      { name: 'PLT', value: '215×10⁹/L' },
    ],
  },
  '心电图': {
    logId: '2044719119107231762',
    category: '检验报告',
    subCategory: '心电图',
    confidence: 97.50,
    clarity: 77.30,
    completeness: 93.60,
    authenticity: 95.80,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '检查日期', value: '2026年02月11日' },
      { name: '心率', value: '72 bpm' },
      { name: '节律', value: '窦性心律' },
      { name: '诊断意见', value: 'ST-T段改变，建议结合临床' },
      { name: '检查医师', value: '周丽' },
    ],
  },
  '其他化验检查': {
    logId: '2044719119107231763',
    category: '检验报告',
    subCategory: '其他化验检查',
    confidence: 96.80,
    clarity: 76.10,
    completeness: 92.70,
    authenticity: 95.10,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '标本类型', value: '静脉血' },
      { name: '检验日期', value: '2026年02月13日' },
      { name: '检验项目', value: 'BNP' },
      { name: '结果', value: '356 pg/mL' },
    ],
  },
  '住院证': {
    logId: '2044719119107231764',
    category: '病历材料',
    subCategory: '住院证',
    confidence: 97.30,
    clarity: 78.90,
    completeness: 94.10,
    authenticity: 96.20,
    fields: [
      { name: '姓名', value: '刘兴' },
      { name: '性别', value: '男' },
      { name: '年龄', value: '61岁' },
      { name: '拟住科室', value: '心血管内科' },
      { name: '收治日期', value: '2026年02月11日' },
      { name: '门诊医师', value: '张丽华' },
    ],
  },
  '入院记录_住院记录': {
    logId: '2044719119107231765',
    category: '病历材料',
    subCategory: '入院记录_住院记录',
    confidence: 98.70,
    clarity: 82.50,
    completeness: 96.80,
    authenticity: 97.60,
    fields: [
      { name: '住院号', value: 'ZY20260301001' },
      { name: '姓名', value: '刘兴' },
      { name: '性别', value: '男' },
      { name: '年龄', value: '61岁' },
      { name: '入院日期', value: '2026年02月11日' },
      { name: '主诉', value: '反复胸闷气促3月' },
      { name: '现病史', value: '患者3月前无明显诱因出现胸闷气促...' },
      { name: '入院诊断', value: '冠心病' },
    ],
  },
  '理赔申请书': {
    logId: '2044719119107231766',
    category: '医疗材料',
    subCategory: '理赔申请书',
    confidence: 99.20,
    clarity: 85.30,
    completeness: 97.40,
    authenticity: 98.10,
    fields: [
      { name: '申请人', value: '刘兴' },
      { name: '保单号', value: 'P20240001568' },
      { name: '申请日期', value: '2026年04月01日' },
      { name: '理赔类型', value: '住院医疗' },
      { name: '事故日期', value: '2026年02月11日' },
    ],
  },
  '理赔须知': {
    logId: '2044719119107231767',
    category: '医疗材料',
    subCategory: '理赔须知',
    confidence: 97.80,
    clarity: 80.40,
    completeness: 94.90,
    authenticity: 96.50,
    fields: [
      { name: '文件名称', value: '理赔申请材料清单' },
      { name: '适用险种', value: '住院医疗保险' },
      { name: '发出日期', value: '2026年03月28日' },
    ],
  },
  '其他_自然场景': {
    logId: '2044719119107231768',
    category: '其他',
    subCategory: '其他_自然场景',
    confidence: 85.60,
    clarity: 68.40,
    completeness: 88.20,
    authenticity: 82.50,
    fields: [
      { name: '图片描述', value: '自然场景拍摄' },
      { name: '备注', value: '非标准医疗文档' },
    ],
  },
}

// 矫正前分类 mock（key = 矫正后分类）
const CORRECTION_BEFORE: Record<string, { category: string; subCategory: string; confidence: number }> = {
  '出院小结': { category: '病历材料', subCategory: '诊断证明', confidence: 72.30 },
  '诊断证明': { category: '病历材料', subCategory: '门诊病历', confidence: 68.50 },
  '医疗票据': { category: '病历材料', subCategory: '费用清单', confidence: 61.20 },
  '增值税发票': { category: '病历材料', subCategory: '医疗票据', confidence: 55.80 },
  '费用清单': { category: '病历材料', subCategory: '结算单', confidence: 74.10 },
  '结算单': { category: '病历材料', subCategory: '医疗票据', confidence: 66.40 },
  '病案首页': { category: '病历材料', subCategory: '出院小结', confidence: 58.90 },
  '病案首页附页': { category: '病历材料', subCategory: '病案首页', confidence: 63.20 },
  '居民身份证': { category: '病历材料', subCategory: '银行卡', confidence: 45.60 },
  '银行卡': { category: '病历材料', subCategory: '居民身份证', confidence: 52.30 },
  '门诊病历': { category: '病历材料', subCategory: '出院小结', confidence: 70.10 },
  '超声检查报告': { category: '病历材料', subCategory: 'CT检查报告', confidence: 63.40 },
  'MRI检查报告': { category: '病历材料', subCategory: '超声检查报告', confidence: 59.70 },
  'CT检查报告': { category: '病历材料', subCategory: 'MRI检查报告', confidence: 67.20 },
  '手术记录': { category: '病历材料', subCategory: '出院小结', confidence: 54.80 },
  '入院记录_住院记录': { category: '病历材料', subCategory: '门诊病历', confidence: 62.50 },
  '理赔申请书': { category: '病历材料', subCategory: '理赔须知', confidence: 71.30 },
  '血凝检查': { category: '病历材料', subCategory: '血常规检查', confidence: 58.40 },
  '住院证': { category: '病历材料', subCategory: '出院小结', confidence: 49.60 },
  '理赔须知': { category: '病历材料', subCategory: '理赔申请书', confidence: 66.80 },
  '其他化验检查': { category: '病历材料', subCategory: '血生化检查', confidence: 53.20 },
  '血生化检查': { category: '病历材料', subCategory: '血常规检查', confidence: 61.50 },
  '血常规检查': { category: '病历材料', subCategory: '血凝检查', confidence: 64.70 },
  '心电图': { category: '病历材料', subCategory: '超声检查报告', confidence: 47.90 },
  '其他_自然场景': { category: '病历材料', subCategory: '其他化验检查', confidence: 42.10 },
}

const AgentClaimsTaskDetail: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const caseNo = searchParams.get('caseNo') || ''
  const taskId = searchParams.get('taskId') || ''

  // caseNo → claimNo 映射（与业务应用-理赔场景案件清单保持一致）
  const CASE_TO_CLAIM_MAP: Record<string, string> = {
    'A1000000000': '0000000001',
    'B1000000001': '0000000002',
    'C1000000002': '0000000003',
    'D1000000003': '0000000004',
    'E1000000004': '0000000005',
    'F1000000005': '0000000006',
    'G1000000006': '0000000007',
    'H1000000007': '0000000008',
    'I1000000008': '0000000009',
    'J1000000009': '0000000010',
    'K1000000010': '0000000010',
    'L1000000011': '0000000011',
    'M1000000012': '0000000012',
    'N1000000013': '0000000013',
    'O1000000014': '0000000014',
    'P1000000015': '0000000015',
    'Q1000000016': '0000000016',
    'R1000000017': '0000000017',
    'S1000000018': '0000000018',
    'T1000000019': '0000000019',
    'U1000000020': '0000000020',
  }
  const claimNo = CASE_TO_CLAIM_MAP[caseNo] || caseNo

  // 路由参数变化时滚动到页面顶部
  useEffect(() => {
    // 找到最近的 overflow: auto 父容器并滚动到顶部
    const el = document.querySelector('.ant-layout-content')
    if (el) {
      el.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [caseNo, taskId])

  // 匹配采集日志获取对应状态和调用时间
  const CLAIMS_LOGS = [
    { taskId: '2044719745388838912', caseNo: 'A1000000000', status: 'success', createdAt: '2026-06-02 10:23', imageCount: 23 },
    { taskId: '2044719745288838912', caseNo: 'X1000000021', status: 'processing', createdAt: '2026-06-02 10:25', imageCount: 0 },
    { taskId: '2044719745188838912', caseNo: 'B1000000001', status: 'failed', createdAt: '2026-06-01 09:15', imageCount: 45 },
    { taskId: '2044719745088838912', caseNo: 'B1000000001', status: 'success', createdAt: '2026-06-01 09:16', imageCount: 56 },
    { taskId: '2044719744988838912', caseNo: 'B1000000001', status: 'success', createdAt: '2026-06-01 09:17', imageCount: 67 },
    { taskId: '2044719744888838912', caseNo: 'B1000000001', status: 'failed', createdAt: '2026-06-01 09:18', imageCount: 78 },
    { taskId: '2044719744788838912', caseNo: 'C1000000002', status: 'success', createdAt: '2026-05-30 14:10', imageCount: 89 },
    { taskId: '2044719744688838912', caseNo: 'X1000000022', status: 'processing', createdAt: '2026-05-27 11:00', imageCount: 0 },
    { taskId: '2044719744588838912', caseNo: 'D1000000003', status: 'failed', createdAt: '2026-05-27 11:01', imageCount: 31 },
    { taskId: '2044719744488838912', caseNo: 'E1000000004', status: 'success', createdAt: '2026-05-24 08:30', imageCount: 42 },
    { taskId: '2044719744388838912', caseNo: 'E1000000004', status: 'success', createdAt: '2026-05-24 08:31', imageCount: 53 },
    { taskId: '2044719744288838912', caseNo: 'E1000000004', status: 'failed', createdAt: '2026-05-24 08:32', imageCount: 64 },
    { taskId: '2044719744188838912', caseNo: 'F1000000005', status: 'success', createdAt: '2026-05-22 16:00', imageCount: 75 },
    { taskId: '2044719744088838912', caseNo: 'G1000000006', status: 'success', createdAt: '2026-05-20 13:00', imageCount: 86 },
    { taskId: '2044719743988838912', caseNo: 'G1000000006', status: 'failed', createdAt: '2026-05-20 13:01', imageCount: 17 },
    { taskId: '2044719743888838912', caseNo: 'H1000000007', status: 'success', createdAt: '2026-05-17 10:00', imageCount: 28 },
    { taskId: '2044719743788838912', caseNo: 'I1000000008', status: 'success', createdAt: '2026-05-16 09:00', imageCount: 39 },
    { taskId: '2044719743688838912', caseNo: 'X1000000023', status: 'processing', createdAt: '2026-05-16 09:01', imageCount: 0 },
    { taskId: '2044719743588838912', caseNo: 'J1000000009', status: 'success', createdAt: '2026-05-14 14:30', imageCount: 61 },
    { taskId: '2044719743488838912', caseNo: 'J1000000009', status: 'success', createdAt: '2026-05-14 14:31', imageCount: 72 },
    { taskId: '2044719743388838912', caseNo: 'J1000000009', status: 'failed', createdAt: '2026-05-14 14:32', imageCount: 83 },
    { taskId: '2044719743288838912', caseNo: 'K1000000010', status: 'success', createdAt: '2026-05-13 10:00', imageCount: 14 },
    { taskId: '2044719743188838912', caseNo: 'K1000000010', status: 'success', createdAt: '2026-05-13 10:02', imageCount: 25 },
    { taskId: '2044719743088838912', caseNo: 'L1000000011', status: 'failed', createdAt: '2026-05-12 11:00', imageCount: 36 },
    { taskId: '2044719742988838912', caseNo: 'M1000000012', status: 'success', createdAt: '2026-05-10 15:00', imageCount: 47 },
    { taskId: '2044719742888838912', caseNo: 'M1000000012', status: 'success', createdAt: '2026-05-10 15:01', imageCount: 58 },
    { taskId: '2044719742788838912', caseNo: 'N1000000013', status: 'failed', createdAt: '2026-05-08 09:30', imageCount: 69 },
    { taskId: '2044719742688838912', caseNo: 'X1000000024', status: 'processing', createdAt: '2026-05-06 10:00', imageCount: 0 },
    { taskId: '2044719742588838912', caseNo: 'O1000000014', status: 'success', createdAt: '2026-05-06 10:01', imageCount: 91 },
    { taskId: '2044719742488838912', caseNo: 'P1000000015', status: 'failed', createdAt: '2026-05-04 08:00', imageCount: 22 },
    { taskId: '2044719742388838912', caseNo: 'Q1000000016', status: 'success', createdAt: '2026-05-02 12:00', imageCount: 33 },
    { taskId: '2044719742288838912', caseNo: 'Q1000000016', status: 'success', createdAt: '2026-05-02 12:01', imageCount: 44 },
    { taskId: '2044719742188838912', caseNo: 'Q1000000016', status: 'failed', createdAt: '2026-05-02 12:02', imageCount: 55 },
    { taskId: '2044719742088838912', caseNo: 'X1000000025', status: 'processing', createdAt: '2026-04-30 16:30', imageCount: 0 },
    { taskId: '2044719741988838912', caseNo: 'S1000000018', status: 'success', createdAt: '2026-04-28 14:00', imageCount: 77 },
    { taskId: '2044719741888838912', caseNo: 'S1000000018', status: 'failed', createdAt: '2026-04-28 14:01', imageCount: 88 },
    { taskId: '2044719741788838912', caseNo: 'T1000000019', status: 'success', createdAt: '2026-04-26 09:00', imageCount: 19 },
    { taskId: '2044719741688838912', caseNo: 'U1000000020', status: 'success', createdAt: '2026-04-24 11:30', imageCount: 30 },
    { taskId: '2044719741588838912', caseNo: 'U1000000020', status: 'failed', createdAt: '2026-04-24 11:31', imageCount: 41 },
  ]
  const matchedLog = CLAIMS_LOGS.find(l => l.taskId === taskId && l.caseNo === caseNo)
  const logStatus = matchedLog?.status || 'success'
  const logCreatedAt = matchedLog?.createdAt || ''

  const [activeTab, setActiveTab] = useState('引擎结果')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [viewMode, setViewMode] = useState<'group' | 'category'>('group')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [activeGroupForItem, setActiveGroupForItem] = useState('')
  const [activeSubItem, setActiveSubItem] = useState('')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedDuplicateIndex, setSelectedDuplicateIndex] = useState<number>(0)
  const [jsonExpanded, setJsonExpanded] = useState(false)

  // 点击影像ID - 跳转到影像展示的预览弹窗
  const handleImageIdClick = (imageId: string) => {
    // 通过 imageId 计算索引（imageId = 180647000 + index）
    const idx = parseInt(imageId) - 180647000
    if (idx >= 0 && idx < filteredImages.length) {
      setActiveTab('影像展示')
      openPreview(idx)
    }
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupName)) next.delete(groupName)
      else next.add(groupName)
      return next
    })
  }

  // 根据任务匹配获取图片数量
  const taskImageCount = matchedLog?.imageCount || 33
  const taskImages = IMAGES_WITH_TAGS.slice(0, taskImageCount)

  const filteredImages = (() => {
    let result
    if (viewMode === 'group' && activeSubItem && activeGroupForItem) {
      // activeSubItem 格式为 "住院组 - 病历组 - 出院小结"，需提取分类名（最后一部分）
      const category = activeSubItem.split('-').pop() || activeSubItem
      result = taskImages.filter(img => img.category === category && img.group === activeGroupForItem)
    } else if (activeCategory === '全部') {
      result = taskImages
    } else {
      result = taskImages.filter(img => img.category === activeCategory)
    }
    // 按全部分类列表从上到下的顺序排序
    const categoryOrder = CATEGORIES.filter(c => c.name !== '全部').map(c => c.name)
    return [...result].sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
  })()

  // 动态计算 GROUPS count（基于 taskImages 数据）
  // 支持三级嵌套结构：已分组 (nested) -> 住院组/门诊组 -> 病历组/票据组 -> 具体分类
  // 支持二级平铺结构：待分组/无需分组 (flat) -> 具体分类
  const dynamicGroups = GROUPS_STRUCTURE.map(group => {
    if (group.type === 'nested') {
      // 三级嵌套：递归计算 count，根据父节点确定 group 过滤值
      const processNode = (node: any, parentGroup?: string): any => {
        // 住院组/门诊组 设置 group 过滤值
        const currentGroup = node.name === '住院组' || node.name === '门诊组' ? node.name : parentGroup
        if (node.children) {
          // 有子节点，递归处理
          const processedChildren = node.children.map((child: any) => processNode(child, currentGroup))
          // 过滤掉 count 为 0 的叶子节点，以及没有有效子节点的中间节点
          const filteredChildren = processedChildren.filter((child: any) =>
            child.children ? child.children.length > 0 : child.count > 0
          )
          return {
            ...node,
            children: filteredChildren,
          }
        } else {
          // 叶子节点：按 category + group 过滤
          return {
            ...node,
            count: taskImages.filter(img => img.category === node.name && img.group === currentGroup).length,
          }
        }
      }
      return { ...group, children: group.children.map(child => processNode(child)) }
    } else {
      // 平铺结构：按 group 名称过滤
      const groupFilter = group.name // "待分组" 或 "无需分组"
      return {
        ...group,
        children: group.children.map(child => ({
          ...child,
          count: taskImages.filter(img => img.category === child.name && img.group === groupFilter).length,
        })).filter(child => child.count > 0),
      }
    }
  }).filter(group =>
    group.type === 'nested'
      ? group.children.some((c: any) => c.children ? c.children.length > 0 : c.count > 0)
      : group.children.length > 0
  )

  // 动态计算 CATEGORIES count
  const dynamicCategories = CATEGORIES.map(cat => {
    if (cat.name === '全部') return { ...cat, count: taskImageCount }
    return { ...cat, count: taskImages.filter(img => img.category === cat.name).length }
  }).filter(cat => cat.count > 0)

  // 计算影像在同分类 duplicateGroup 中的位置，用于同步右图与缩略图选中态
  const getDuplicateIndex = (imageIndex: number): number => {
    const img = filteredImages[imageIndex]
    if (!img || !img.tags.includes('重复')) return 0
    const dupIdx = filteredImages
      .map((item, idx) => ({ img: item, idx }))
      .filter(item => item.img.category === img.category)
      .findIndex(item => item.idx === imageIndex)
    return dupIdx >= 0 ? dupIdx : 0
  }

  const openPreview = (index: number) => {
    setPreviewIndex(index)
    setSelectedImageIndex(index)
    setSelectedDuplicateIndex(getDuplicateIndex(index))
  }
  const closePreview = () => { setPreviewIndex(null); setSelectedDuplicateIndex(0) }
  const previewImage = previewIndex !== null ? filteredImages[previewIndex] : null
  const previewDetail = previewImage ? IMAGE_DETAIL_MOCK[previewImage.category] || IMAGE_DETAIL_MOCK['医疗票据'] : null
  const imageId = previewImage ? `180647${String(previewIndex).padStart(3, '0')}` : ''

  // 获取重复影像组：展示同分类下所有影像（保证缩略图 ≥2 张），保留原始 index 用于计算 img_id
  const duplicateGroup = useMemo(() => {
    if (!previewImage || !previewImage.tags.includes('重复')) return null
    return filteredImages
      .map((img, idx) => ({ img, idx }))
      .filter(item => item.img.category === previewImage.category)
  }, [previewImage, previewIndex, filteredImages])

  const groupTitle = (() => {
    if (viewMode !== 'group' || !activeGroupForItem || !activeSubItem) return activeCategory
    const parts = activeSubItem.split('-')
    const category = parts[parts.length - 1]
    // 嵌套分组（已分组）：activeSubItem 含 "-"（如 "住院组-病历组-出院小结"），展示 "已分组·一级·二级-分类名"
    if (parts.length > 1) {
      const path = parts.slice(0, -1).join(' · ')
      return `已分组 · ${path} - ${category}`
    }
    // 平铺分组（待分组/无需分组）：分组名 - 分类名
    return `${activeGroupForItem} - ${category}`
  })()
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            onClick={() => navigate('/agent/claims/logs')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#595959', fontSize: 14 }}
          >
            <ArrowLeftOutlined /> 返回
          </span>
          <div style={{ width: 1, height: 16, background: '#e8e8e8' }} />
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>任务号：</span><span style={{ fontWeight: 400 }}>{taskId}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>索赔号：</span><span style={{ fontWeight: 400 }}>{claimNo}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>案件号：</span><span style={{ fontWeight: 400 }}>{caseNo}</span>
          </span>
          <span style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>执行状态：</span>
            <Tag color={logStatus === 'success' ? 'success' : logStatus === 'processing' ? 'processing' : 'error'} style={{ borderRadius: 6, minWidth: 50, textAlign: 'center' }}>
              {logStatus === 'success' ? '成功' : logStatus === 'processing' ? '处理中' : '失败'}
            </Tag>
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
                <Icon src={icoGroupInfo} color={viewMode === 'group' ? '#fff' : '#6b7280'} /> 分组信息
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
                <Icon src={icoAllItems} color={viewMode === 'category' ? '#fff' : '#6b7280'} /> 全部分类
              </div>
            </div>

            {/* 列表区域 */}
            <div style={{ padding: '8px 0' }}>
              {viewMode === 'group' ? (
                /* 分组树形列表 */
                <div>
                  {dynamicGroups.map((group) => {
                    const isExpanded = expandedGroups.has(group.name)
                    // 计算总数
                    const countTotal = (node: any): number => {
                      if (node.children && node.children.length > 0) {
                        return node.children.reduce((sum: number, c: any) => sum + countTotal(c), 0)
                      }
                      return node.count || 0
                    }
                    const groupTotal = group.type === 'nested'
                      ? group.children.reduce((sum: number, c: any) => sum + countTotal(c), 0)
                      : group.children.reduce((sum: number, c: any) => sum + c.count, 0)

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
                            color: '#6b7280',
                            background: '#f3f4f6',
                            borderRadius: 10,
                            padding: '1px 8px',
                          }}>
                            {groupTotal}
                          </span>
                        </div>
                        {/* 子项列表 */}
                        {isExpanded && (
                          <div style={{ padding: '2px 0' }}>
                            {group.type === 'nested' ? (
                              /* 三级嵌套：住院组/门诊组 -> 病历组/票据组 -> 分类 */
                              group.children.map((subGroup: any) => {
                                const subExpanded = expandedGroups.has(subGroup.name)
                                const subTotal = countTotal(subGroup)
                                return (
                                  <div key={subGroup.name}>
                                    {/* 二级标题：住院组/门诊组 */}
                                    <div
                                      onClick={() => toggleGroup(subGroup.name)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '6px 12px 6px 24px',
                                        margin: '0 8px',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#000000e0',
                                        background: subExpanded ? '#f0f7ff' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                          style={{ transform: subExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                                          <path d="M9 18l6-6-6-6" />
                                        </svg>
                                        <span>{subGroup.name}</span>
                                      </div>
                                      <span style={{
                                        fontSize: 12,
                                        color: '#6b7280',
                                        background: '#f3f4f6',
                                        borderRadius: 10,
                                        padding: '1px 8px',
                                      }}>
                                        {subTotal}
                                      </span>
                                    </div>
                                    {subExpanded && (
                                      <div style={{ padding: '2px 0' }}>
                                        {subGroup.children.map((categoryGroup: any) => {
                                          // 使用组合 key 区分不同父组下的同名子组
                                          const catKey = `${subGroup.name}-${categoryGroup.name}`
                                          const catExpanded = expandedGroups.has(catKey)
                                          const catTotal = countTotal(categoryGroup)
                                          return (
                                            <div key={catKey}>
                                              {/* 三级标题：病历组/票据组 */}
                                              <div
                                                onClick={() => toggleGroup(catKey)}
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                                  padding: '6px 12px 6px 40px',
                                                  margin: '0 8px',
                                                  borderRadius: 6,
                                                  fontSize: 13,
                                                  fontWeight: 500,
                                                  color: '#000000e0',
                                                  background: catExpanded ? '#f0f7ff' : 'transparent',
                                                  cursor: 'pointer',
                                                  transition: 'all 0.15s',
                                                }}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                    style={{ transform: catExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                                                    <path d="M9 18l6-6-6-6" />
                                                  </svg>
                                                  <span>{categoryGroup.name}</span>
                                                </div>
                                                <span style={{
                                                  fontSize: 12,
                                                  color: '#6b7280',
                                                  background: '#f3f4f6',
                                                  borderRadius: 10,
                                                  padding: '1px 8px',
                                                }}>
                                                  {catTotal}
                                                </span>
                                              </div>
                                              {catExpanded && (
                                                <div style={{ padding: '2px 0' }}>
                                                  {categoryGroup.children.map((item: any) => {
                                                    // 使用完整路径 key 区分不同分组下的同名项目，并展示完整层级
                                                    const itemKey = `${subGroup.name}-${categoryGroup.name}-${item.name}`
                                                    const isActive = activeSubItem === itemKey
                                                    return (
                                                      <div
                                                        key={item.name}
                                                        onClick={() => { setActiveSubItem(itemKey); setActiveGroupForItem(subGroup.name) }}
                                                        style={{
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'space-between',
                                                          padding: '6px 12px 6px 56px',
                                                          margin: '0 8px',
                                                          borderRadius: 6,
                                                          fontSize: 13,
                                                          color: isActive ? '#fff' : '#000000e0',
                                                          background: isActive ? '#65a5ff' : 'transparent',
                                                          cursor: 'pointer',
                                                          transition: 'all 0.15s',
                                                        }}
                                                      >
                                                        <span>{item.name}</span>
                                                        <span style={{
                                                          fontSize: 12,
                                                          color: '#6b7280',
                                                          background: '#f3f4f6',
                                                          borderRadius: 10,
                                                          padding: '1px 8px',
                                                        }}>
                                                          {item.count}
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
                                    )}
                                  </div>
                                )
                              })
                            ) : (
                              /* 平铺结构：待分组/无需分组 */
                              group.children.map((child: any) => {
                                const isActive = activeSubItem === child.name && activeGroupForItem === group.name
                                return (
                                  <div
                                    key={`${group.name}-${child.name}`}
                                    onClick={() => { setActiveSubItem(child.name); setActiveGroupForItem(group.name) }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '6px 12px 6px 24px',
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
                                      color: '#6b7280',
                                      background: '#f3f4f6',
                                      borderRadius: 10,
                                      padding: '1px 8px',
                                    }}>
                                      {child.count}
                                    </span>
                                  </div>
                                )
                              })
                            )}
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
                        color: '#6b7280',
                        background: '#f3f4f6',
                        borderRadius: 10,
                        padding: '1px 8px',
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
                    {/* 右上角标签角标 */}
                    {img.tags.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        alignItems: 'flex-end',
                      }}>
                        {img.tags.map((tag) => {
                          const style = TAG_STYLES[tag]
                          return (
                            <span
                              key={tag}
                              style={{
                                display: 'inline-block',
                                padding: '1px 6px',
                                fontSize: 10,
                                fontWeight: 600,
                                lineHeight: '16px',
                                borderRadius: 3,
                                background: style.bg,
                                color: style.color,
                                letterSpacing: 1,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              }}
                            >
                              {tag}
                            </span>
                          )
                        })}
                      </div>
                    )}
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
              maxWidth: 1300,
              height: '85vh',
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
                  {previewImage?.category}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {`${previewIndex + 1} / ${filteredImages.length} - img_id: ${imageId}`}
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
              {/* 左侧图片区 */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e5e7eb',
                position: 'relative',
                overflow: 'auto',
              }}>
                {/* 上一张按钮（最左侧） */}
                {previewIndex > 0 && (
                  <div
                    onClick={() => { setPreviewIndex(previewIndex - 1); setSelectedImageIndex(previewIndex - 1); setSelectedDuplicateIndex(getDuplicateIndex(previewIndex - 1)) }}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
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
                {/* 下一张按钮（最右侧） */}
                {previewIndex < filteredImages.length - 1 && (
                  <div
                    onClick={() => { setPreviewIndex(previewIndex + 1); setSelectedImageIndex(previewIndex + 1); setSelectedDuplicateIndex(getDuplicateIndex(previewIndex + 1)) }}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
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

                {duplicateGroup ? (
                  /* 双图对比区（重复影像） */
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                  }}>
                    <div style={{
                      width: '90%',
                      height: '90%',
                      display: 'flex',
                      gap: 24,
                    }}>
                      {/* 左图：质量最好的重复影像 */}
                      <div style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          height: '100%',
                          aspectRatio: '3/4',
                          maxWidth: '100%',
                          background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
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
                          {/* 切割红框（左图） */}
                          {previewImage && previewImage.tags.includes('切割') && (() => {
                            const cutRand = seededRandom(previewIndex * 1000 + 7)
                            const blockCount = 1
                            const blocks = Array.from({ length: blockCount }, () => {
                              const w = 25 + cutRand() * 45
                              const h = 20 + cutRand() * 40
                              const x = cutRand() * (100 - w)
                              const y = cutRand() * (100 - h)
                              return { x: `${x}%`, y: `${y}%`, w: `${w}%`, h: `${h}%` }
                            })
                            return (
                              <svg style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 1,
                              }}>
                                {blocks.map((b, i) => (
                                  <rect
                                    key={i}
                                    x={b.x} y={b.y}
                                    width={b.w} height={b.h}
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    opacity="0.85"
                                  />
                                ))}
                              </svg>
                            )
                          })()}
                        </div>
                      </div>

                      {/* 右图：当前选中的重复影像 */}
                      <div style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          height: '100%',
                          aspectRatio: '3/4',
                          maxWidth: '100%',
                          background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
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
                          {/* 重复标签 */}
                          <div style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 2,
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              fontSize: 12,
                              fontWeight: 600,
                              lineHeight: '18px',
                              borderRadius: 4,
                              background: TAG_STYLES['重复'].bg,
                              color: TAG_STYLES['重复'].color,
                              letterSpacing: 1,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            }}>
                              重复
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 单图预览区（非重复影像） */
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    position: 'relative',
                  }}>
                    {/* 图片占位：80%容器，保持3:4比例 */}
                    <div style={{
                      width: '80%',
                      height: '80%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        height: '100%',
                        aspectRatio: '3/4',
                        maxWidth: '100%',
                        background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
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
                      {/* 预览大图角标 */}
                      {previewImage && previewImage.tags.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          alignItems: 'flex-end',
                          zIndex: 2,
                        }}>
                          {previewImage.tags.map((tag) => {
                            const style = TAG_STYLES[tag]
                            return (
                              <span
                                key={tag}
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  lineHeight: '18px',
                                  borderRadius: 4,
                                  background: style.bg,
                                  color: style.color,
                                  letterSpacing: 1,
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                }}
                              >
                                {tag}
                              </span>
                            )
                          })}
                        </div>
                      )}
                      {/* 切割红框 */}
                      {previewImage && previewImage.tags.includes('切割') && (() => {
                        const cutRand = seededRandom(previewIndex * 1000 + 7)
                    const blockCount = 1
                    const blocks = Array.from({ length: blockCount }, () => {
                      const w = 25 + cutRand() * 45 // 25%~70%
                      const h = 20 + cutRand() * 40 // 20%~60%
                      const x = cutRand() * (100 - w)
                      const y = cutRand() * (100 - h)
                      return { x: `${x}%`, y: `${y}%`, w: `${w}%`, h: `${h}%` }
                    })
                    return (
                      <svg style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}>
                        {blocks.map((b, i) => (
                          <rect
                            key={i}
                            x={b.x} y={b.y}
                            width={b.w} height={b.h}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            opacity="0.85"
                          />
                        ))}
                      </svg>
                    )
                  })()}
                      </div>
                    </div>
                  </div>
                  )}

              {/* 重复影像缩略图行 */}
              {duplicateGroup && (
                <div style={{
                  height: 130,
                  padding: '10px 24px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: 12,
                  overflowX: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#fafbfc',
                }}>
                  <div style={{
                    width: '80%',
                    display: 'flex',
                    gap: 12,
                    overflowX: 'auto',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {duplicateGroup.map((item, dupIdx) => {
                    const itemImageId = `180647${String(item.idx).padStart(3, '0')}`
                    const isSelected = selectedDuplicateIndex === dupIdx
                    return (
                    <div
                      key={dupIdx}
                      onClick={() => setSelectedDuplicateIndex(dupIdx)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        aspectRatio: '3/4',
                        height: 92,
                        borderRadius: 6,
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.2s',
                        overflow: 'hidden',
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: isSelected ? '#3b82f6' : '#9ca3af',
                        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                        transition: 'color 0.2s',
                      }}>
                        {itemImageId}
                      </div>
                    </div>
                    )
                  })}
                  </div>
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
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>图像分类</div>
                  {previewImage?.tags.includes('矫正') && CORRECTION_BEFORE[previewImage.category] && (() => {
                    const before = CORRECTION_BEFORE[previewImage.category]
                    return (
                      <div style={{ marginBottom: 12 }}>
                        {/* 矫正前 */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                        }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600, color: '#9ca3af',
                            //background: '#f3f4f6', borderRadius: 4, padding: '1px 6px',
                          }}>矫正前：</span>
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '8px 16px', background: '#f9fafb', borderRadius: 8, marginBottom: 8,
                          //border: '1px solid #fecaca'
                        }}>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>大类</span>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>{before.category}</span>
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '8px 16px', background: '#f9fafb', borderRadius: 8,
                          //border: '1px solid #fecaca'
                        }}>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>小类</span>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>{before.subCategory}</span>
                        </div>
                      </div>
                    )
                  })()}
                  {/* 矫正后 / 默认分类 */}
                  {previewImage?.tags.includes('矫正') && CORRECTION_BEFORE[previewImage.category] && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                    }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: '#16a34a',
                        //background: '#f0fdf4', borderRadius: 4, padding: '1px 6px',
                      }}>矫正后：</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: previewImage?.tags.includes('矫正') ? '#f0fdf4' : '#f9fafb',
                    borderRadius: 8, marginBottom: 8,
                    //border: previewImage?.tags.includes('矫正') ? '1px solid #bbf7d0' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>大类</span>
                    <span style={{ fontSize: 13, color: previewImage?.tags.includes('矫正') ? '#16a34a' : '#1f2937', fontWeight: 500 }}>{previewDetail.category}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: previewImage?.tags.includes('矫正') ? '#f0fdf4' : '#f9fafb',
                    borderRadius: 8, marginBottom: 8,
                    //border: previewImage?.tags.includes('矫正') ? '1px solid #bbf7d0' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>小类</span>
                    <span style={{ fontSize: 13, color: previewImage?.tags.includes('矫正') ? '#16a34a' : '#1f2937', fontWeight: 500 }}>{previewDetail.subCategory}</span>
                  </div>
                  {/* 置信度 */}
                  <div style={{
                    padding: '12px 16px', background: '#eff6ff', borderRadius: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>置信度</span>
                      <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600 }}>{previewDetail.confidence}%</span>
                    </div>
                    <div style={{ height: 6, background: '#dbeafe', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${previewDetail.confidence}%`, background: '#3b82f6', borderRadius: 3 }} />
                    </div>
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
        <>
          <div>
          {/* ── 端到端返回结果 ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
              端到端返回结果
            </div>
            {ENGINE_RESULT_DATA.claimResult.groupList.map((group) => {
              // 统一样式
              const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, border: '1px solid #f3f4f6', padding: 24, marginBottom: 16 }
              const titleStyle: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }
              const subTitleStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' }
              const labelStyle: React.CSSProperties = { color: '#6b7280', fontSize: 14, width: 100, flexShrink: 0 }
              const valueStyle: React.CSSProperties = { color: '#1f2937', fontSize: 14 }
              const rowStyle: React.CSSProperties = { display: 'flex', marginBottom: 16, alignItems: 'center' }
              const thStyle: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 13, borderBottom: '1px solid #f3f4f6', background: '#fafbfc' }
              const tdStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 13, color: '#1f2937' }
              const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }

              const FieldRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
                <div style={rowStyle}>
                  <span style={labelStyle}>{label}</span>
                  <span style={{...valueStyle, fontWeight: highlight ? 600 : 400, color: highlight ? '#16a34a' : '#1f2937'}}>{value || '-'}</span>
                </div>
              )

              return (
              <div key={group.groupNo}>
                {/* 就诊概览 - 单列竖直罗列 */}
                <div style={cardStyle}>
                  <div style={titleStyle}>就诊概览</div>
                  <div style={{ maxWidth: 400 }}>
                    <FieldRow label="姓名" value={group.medicalInfo.name} />
                    <FieldRow label="住院号" value={group.medicalInfo.inHosDate} />
                    <FieldRow label="科室" value={group.medicalInfo.hosSubjectCode} />
                    <FieldRow label="ICU 治疗" value={group.medicalInfo.isIcuTreatment || '无'} />
                    <FieldRow label="就诊类型" value={group.medicalInfo.clicType} />
                    <FieldRow label="入院日期" value={group.medicalInfo.inHosDate} />
                    <FieldRow label="出院日期" value={group.medicalInfo.outHosDate} />
                    <FieldRow label="医院" value={group.medicalInfo.hospCode} />
                    <FieldRow label="出院结果" value={group.medicalInfo.outResult} highlight={group.medicalInfo.outResult === '好转'} />
                    <FieldRow label="主治医生" value={group.medicalInfo.doctorName} />
                  </div>
                </div>

                {/* 诊疗详情 - 双栏 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {/* 左侧：诊断与病史 */}
                  <div style={cardStyle}>
                    <div style={titleStyle}>诊断信息</div>
                    {group.diagnosisInfoList.map((d, i) => (
                      <div key={i} style={{ marginBottom: i < group.diagnosisInfoList.length - 1 ? 16 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 500, color: '#1f2937', fontSize: 14 }}>{d.keyword}</span>
                          <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 12, padding: '2px 8px', borderRadius: 12 }}>置信度 {(parseFloat(d.score)*100).toFixed(0)}%</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>ICD编码：{d.icd6} {d.icd6Name}</div>
                      </div>
                    ))}
                    {group.historyInfoList.length > 0 && (
                      <>
                        <div style={subTitleStyle}>既往病史</div>
                        {group.historyInfoList.map((h, i) => (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <FieldRow label="疾病描述" value={h.diseaseKeyword} />
                            <FieldRow label="诊断名称" value={h.diseaseName} />
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* 右侧：手术记录 */}
                  <div style={cardStyle}>
                    <div style={titleStyle}>手术记录</div>
                    {group.surgicalInfoList.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>本次住院</div>
                        {group.surgicalInfoList.map((s, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ color: '#1f2937', fontSize: 13 }}>{s.surgName || s.surgKeyword}</span>
                            <span style={{ color: '#6b7280', fontSize: 13 }}>{s.surgDate || '-'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {group.surgHistoryInfoList.length > 0 && (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>既往手术史</div>
                        {group.surgHistoryInfoList.map((s, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ color: '#1f2937', fontSize: 13 }}>{s.surgName || s.surgKeyword}</span>
                            <span style={{ color: '#6b7280', fontSize: 13 }}>{s.surgDate || '-'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 住院费用结算 */}
                {group.billGroupInfoList.length > 0 && group.billGroupInfoList.map((billGroup) => (
                  <div key={billGroup.billGroupNo} style={cardStyle}>
                    <div style={titleStyle}>住院费用结算</div>
                    
                    {/* 核心金额高亮 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 16, background: '#eff6ff', borderRadius: 8, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>总金额</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#165DFF' }}>¥{billGroup.basicData.billTotalAmt || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>医保支付</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>¥{billGroup.accountData.socialInsPayment || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>个人支付</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#ea580c' }}>¥{billGroup.accountData.allOwnPayment || '-'}</div>
                      </div>
                    </div>

                    {/* 结算基础信息 - 单列竖直罗列 */}
                    <div style={{ maxWidth: 400, marginBottom: 20 }}>
                      <FieldRow label="发票号码" value={billGroup.basicData.billNo} />
                      <FieldRow label="票据类型" value={billGroup.basicData.billType} />
                      <FieldRow label="票据介质" value={billGroup.basicData.billEleType === '02' ? '电子' : billGroup.basicData.billEleType === '01' ? '纸质' : '-'} />
                      <FieldRow label="医保类型" value={billGroup.basicData.insuredType === '01' ? '城镇职工' : '-'} />
                      <FieldRow label="统筹支付" value={billGroup.basicData.isSclPay === '01' ? '是' : '否'} />
                      <FieldRow label="数据来源" value={billGroup.basicData.billSourceType === '01' ? '电票数据' : '非电票'} />
                    </div>

                    {/* 费用分类 */}
                    {billGroup.categoryData.length > 0 && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>费用分类</div>
                        <table style={tableStyle}>
                          <thead><tr>
                            <th style={thStyle}>费用类别</th>
                            <th style={thStyle}>标准名称 / 代码</th>
                            <th style={{...thStyle, textAlign: 'right'}}>金额</th>
                          </tr></thead>
                          <tbody>
                            {billGroup.categoryData.map((c, i) => (
                              <tr key={i}>
                                <td style={tdStyle}>{c.chargeCategory}</td>
                                <td style={{...tdStyle, color: '#6b7280'}}>{c.chargeStandardName} / {c.chargeStandardCode}</td>
                                <td style={{...tdStyle, textAlign: 'right'}}>¥{c.categoryAmt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}

                    {/* 费用明细 */}
                    {billGroup.feeDtData.length > 0 && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>费用明细</div>
                        <table style={tableStyle}>
                          <thead><tr>
                            <th style={thStyle}>项目名称</th>
                            <th style={thStyle}>规格 / 单价 / 数量</th>
                            <th style={{...thStyle, textAlign: 'right'}}>金额</th>
                          </tr></thead>
                          <tbody>
                            {billGroup.feeDtData.map((f, i) => (
                              <tr key={i}>
                                <td style={tdStyle}>{f.itemName}</td>
                                <td style={{...tdStyle, color: '#6b7280'}}>{f.specification} / ¥{f.unitPrice} × {f.quantity}</td>
                                <td style={{...tdStyle, textAlign: 'right'}}>¥{f.totalAmt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                ))}

                {/* 附件资料 */}
                {(group.medicalGroupImageList.length > 0 || group.billGroupInfoList.some(bg => bg.billGroupImageList.length > 0)) && (
                  <div style={cardStyle}>
                    <div style={titleStyle}>附件资料</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {group.medicalGroupImageList.map((mgi, i) => mgi.imageList.map((img, idx) => (
                        <div key={`${i}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f9fafb', borderRadius: 8 }}>
                          <div>
                            <div style={{ fontWeight: 500, color: '#1f2937', fontSize: 14, marginBottom: 4 }}>{mgi.imageType}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>影像ID：{img.imageId}</div>
                          </div>
                          <span onClick={() => handleImageIdClick(img.imageId)} style={{ color: '#165DFF', fontSize: 14, cursor: 'pointer' }}>查看</span>
                        </div>
                      )))}
                      {group.billGroupInfoList.map((bg) => bg.billGroupImageList.map((bgi, i) => bgi.imageList.map((img, idx) => (
                        <div key={`bg-${i}-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f9fafb', borderRadius: 8 }}>
                          <div>
                            <div style={{ fontWeight: 500, color: '#1f2937', fontSize: 14, marginBottom: 4 }}>{bgi.imageType}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>影像ID：{img.imageId}</div>
                          </div>
                          <span onClick={() => handleImageIdClick(img.imageId)} style={{ color: '#165DFF', fontSize: 14, cursor: 'pointer' }}>查看</span>
                        </div>
                      ))))}
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </div>

          {/* ── JSON代码 ── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setJsonExpanded(!jsonExpanded)}
            >
              <span style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
              JSON代码
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" strokeWidth="2"
                style={{ transform: jsonExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
            {jsonExpanded && (
            <>
            <div style={{ marginTop: 8, marginBottom: 12, display: 'flex' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(ENGINE_RESULT_DATA.claimResult, null, 2)).then(() => {
                    message.success('已复制到剪贴板')
                  })
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#65a5ff', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '6px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}
              >
                <CopyOutlined style={{ fontSize: 12 }} /> 复制JSON
              </button>
            </div>
            <div style={{
              background: '#F9FAFB', borderRadius: 8, border: '1px solid rgb(229, 231, 235)',
              padding: '20px 24px', maxHeight: 600, overflow: 'auto',
            }}>
              <pre style={{
                margin: 0, fontSize: 12, lineHeight: 1.8, color: '#1f2937',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {JSON.stringify(ENGINE_RESULT_DATA.claimResult, null, 2)}
              </pre>
            </div>
            </>
            )}
          </div>

          {/* ─ 结构化结果（已隐藏） ── */}
          {false && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
              结构化结果
              <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>共 {ENGINE_RESULT_DATA.imageList.length} 张影像</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ENGINE_RESULT_DATA.imageList.map((img, idx) => {
                const ocrEntries = Object.entries(img.imageOcr)
                const clarity = (parseFloat(img.imageQuality.isClear) * 100).toFixed(1)
                const completeness = (parseFloat(img.imageQuality.isComplete) * 100).toFixed(1)
                const authenticity = (parseFloat(img.imageQuality.isReal) * 100).toFixed(1)
                return (
                  <div key={img.imageId} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#fff',
                  }}>
                    {/* 图片头部：序号 + 分类 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600,
                        }}>{idx + 1}</span>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>img_id: {img.imageId}</span>
                        {img.repeatIndex && (
                          <span style={{ fontSize: 12, color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>
                            重复影像: {img.repeatIndex}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 图片内容区 */}
                    <div style={{ padding: '12px 16px' }}>
                      {/* 质量指标 */}
                      <div style={{ display: 'flex', gap: 24, marginBottom: ocrEntries.length > 0 ? 12 : 0 }}>
                        {[
                          { label: '清晰度', value: clarity, color: parseFloat(clarity) >= 80 ? '#52c41a' : parseFloat(clarity) >= 60 ? '#faad14' : '#ff4d4f' },
                          { label: '完整度', value: completeness, color: parseFloat(completeness) >= 80 ? '#52c41a' : parseFloat(completeness) >= 50 ? '#faad14' : '#ff4d4f' },
                          { label: '真实性', value: authenticity, color: parseFloat(authenticity) >= 80 ? '#52c41a' : '#faad14' },
                        ].map(q => (
                          <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>{q.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: q.color }}>{q.value}%</span>
                          </div>
                        ))}
                        {img.imageAngle !== 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>旋转角度</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{img.imageAngle}°</span>
                          </div>
                        )}
                      </div>
                      {/* OCR 识别字段 */}
                      {ocrEntries.length > 0 && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px 24px',
                          padding: '10px 12px',
                          background: '#fafbfc',
                          borderRadius: 6,
                          border: '1px solid #f0f0f0',
                        }}>
                          {ocrEntries.map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                              <span style={{ fontSize: 12, color: '#8c8c8c', whiteSpace: 'nowrap', flexShrink: 0 }}>{key}：</span>
                              <span style={{ fontSize: 13, color: '#1f2937', wordBreak: 'break-all', lineHeight: 1.5 }}>{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          )}

          {/* ── 医疗材料分组（已隐藏） ── */}
          {false && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 18, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
              分组结果
              <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>共 {ENGINE_RESULT_DATA.medicalGroup.length} 组</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ENGINE_RESULT_DATA.medicalGroup.map((group) => (
                <div key={group.groupSeq} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#fff',
                }}>
                  {/* 分组头部 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    background: group.groupType === '待分组' ? '#fef2f2' : '#f0fdf4',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '50%',
                        background: group.groupType === '待分组' ? '#ef4444' : '#22c55e',
                        color: '#fff', fontSize: 12, fontWeight: 600,
                      }}>{group.groupSeq}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{group.groupType}</span>
                    </div>
                  </div>
                  {/* 分组内容 */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {'children' in group && group.children ? (
                      // 嵌套结构：住院组/门诊组 → 病历组/票据组
                      group.children.map((sub: any) => (
                        <div key={sub.subGroupSeq}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>{sub.subGroupType}</div>
                          <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                              <div style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', fontSize: 13 }}>影像分类名称</div>
                              <div style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', fontSize: 13, gridColumn: 'span 1' }}>影像ID</div>
                              <div style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', fontSize: 13 }}>置信度</div>
                            </div>
                            {sub.items.map((imgType: any, idx: number) => {
                              const ids = imgType.typeImageList.map((img: any) => img.typeImageId.split('_')[0])
                              const imgIds = ids.join('、')
                              const probs = ids.map((id: string) => {
                                const found = ENGINE_RESULT_DATA.imageList.find(i => String(i.imageId) === id)
                                return found ? (parseFloat(found.imageTypeDetailProb) * 100).toFixed(2) + '%' : '-'
                              }).join('、')
                              const isLast = idx === sub.items.length - 1
                              return (
                                <div key={imgType.imageType} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: isLast ? 'none' : '1px solid #f0f0f0' }}>
                                  <div style={{ padding: '10px 16px', color: '#1f2937', fontWeight: 500, fontSize: 13, borderRight: '1px solid #f0f0f0' }}>{imgType.imageType}</div>
                                  <div style={{ padding: '10px 16px', color: '#3b82f6', fontSize: 13, borderRight: '1px solid #f0f0f0' }}>{imgIds}</div>
                                  <div style={{ padding: '10px 16px', color: '#1f2937', fontSize: 13 }}>{probs}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      // 平铺结构：待分组/无需分组
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <div style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', fontSize: 13 }}>影像分类名称</div>
                          <div style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', fontSize: 13 }}>影像ID</div>
                          <div style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', fontSize: 13 }}>置信度</div>
                        </div>
                        {(group as any).items.map((imgType: any, idx: number) => {
                          const ids = imgType.typeImageList.map((img: any) => img.typeImageId.split('_')[0])
                          const imgIds = ids.join('、')
                          const probs = ids.map((id: string) => {
                            const found = ENGINE_RESULT_DATA.imageList.find(i => String(i.imageId) === id)
                            return found ? (parseFloat(found.imageTypeDetailProb) * 100).toFixed(2) + '%' : '-'
                          }).join('、')
                          const isLast = idx === (group as any).items.length - 1
                          return (
                            <div key={imgType.imageType} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: isLast ? 'none' : '1px solid #f0f0f0' }}>
                              <div style={{ padding: '10px 16px', color: '#1f2937', fontWeight: 500, fontSize: 13, borderRight: '1px solid #f0f0f0' }}>{imgType.imageType}</div>
                              <div style={{ padding: '10px 16px', color: '#3b82f6', fontSize: 13, borderRight: '1px solid #f0f0f0' }}>{imgIds}</div>
                              <div style={{ padding: '10px 16px', color: '#1f2937', fontSize: 13 }}>{probs}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* ── 其他信息 ── */}
          {(Object.keys(ENGINE_RESULT_DATA.claimInfo).length > 0 ||
            Object.keys(ENGINE_RESULT_DATA.verificationInfo).length > 0 ||
            Object.keys(ENGINE_RESULT_DATA.qualityInfo).length > 0) && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
                其他信息
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { title: '理赔信息', data: ENGINE_RESULT_DATA.claimInfo },
                  { title: '核验信息', data: ENGINE_RESULT_DATA.verificationInfo },
                  { title: '质量信息', data: ENGINE_RESULT_DATA.qualityInfo },
                ].filter(s => Object.keys(s.data).length > 0).map(section => (
                  <div key={section.title} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 16,
                    background: '#fff',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 10 }}>{section.title}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {Object.entries(section.data).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#8c8c8c', flexShrink: 0 }}>{k}：</span>
                          <span style={{ fontSize: 13, color: '#1f2937' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </>
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

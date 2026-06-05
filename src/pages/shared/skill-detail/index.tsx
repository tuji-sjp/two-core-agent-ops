import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, StarOutlined, ClockCircleOutlined } from '@ant-design/icons'

const SkillDetail: React.FC = () => {
  const navigate = useNavigate()
  const { name } = useParams()
  const [activeSection, setActiveSection] = useState('overview')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const skillData = {
    name: name || '票据OCR识别',
    version: 'v1.0.0',
    downloads: '3.4万',
    likes: 632,
    rating: 4.8,
    author: '阿里云智能',
    license: 'Apache-2.0',
    category: 'OCR识别',
    updated: '2026-05-29',
    description: '智能识别并提取发票、收据中的关键字段信息，支持多版式票据的自动识别与结构化输出。覆盖增值税发票、定额发票、机打小票等主流票据类型。',
  }

  const sections = [
    { key: 'overview', label: '概述' },
    { key: 'installation', label: '安装配置' },
    { key: 'usage', label: '使用指南' },
    { key: 'api', label: 'API参考' },
    { key: 'best-practices', label: 'SKILL.md' },
    { key: 'version-history', label: '版本历史' },
  ]

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const contentEl = document.querySelector('.ant-layout-content')
      if (!contentEl) return
      const scrollTop = contentEl.scrollTop + 100
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[sections[i].key]
        if (el && el.offsetTop <= scrollTop) {
          setActiveSection(sections[i].key)
          break
        }
      }
    }
    const contentEl = document.querySelector('.ant-layout-content')
    contentEl?.addEventListener('scroll', handleScroll)
    return () => contentEl?.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (key: string) => {
    const el = sectionRefs.current[key]
    const contentEl = document.querySelector('.ant-layout-content')
    if (el && contentEl) {
      contentEl.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' })
    }
    setActiveSection(key)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', padding: '14px 24px 34px' }}>
      {/* 页面内锚点导航 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => navigate('/shared/skills')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#595959', fontSize: 14 }}
          >
            <ArrowLeftOutlined /> 返回Skills广场
          </div>
          <div style={{ width: 1, height: 16, background: '#e8e8e8' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{skillData.name}</span>
        </div>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {sections.map(s => (
            <div
              key={s.key}
              onClick={() => scrollToSection(s.key)}
              style={{
                fontSize: 14,
                color: activeSection === s.key ? '#3b82f6' : '#595959',
                fontWeight: activeSection === s.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </div>
          ))}
        </nav>
      </div>

      {/* 概述 */}
      <section
        id="overview"
        ref={el => { sectionRefs.current['overview'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          概述
        </h2>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          {skillData.name} 是一款面向保险理赔场景的智能OCR技能，能够自动识别各类票据图片并提取关键字段信息。底层基于阿里云视觉智能开放平台的OCR能力，结合领域知识实现高精度结构化输出。
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 20, color: '#374151', lineHeight: 2 }}>
          <li>增值税专票/普票自动识别与关键字段提取</li>
          <li>定额发票、机打小票、电子发票全覆盖</li>
          <li>支持批量票据处理与结构化输出</li>
          <li>内置票据真伪校验逻辑</li>
        </ul>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, maxWidth: '800px' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>✅ 适用场景</h3>
            <ul style={{ paddingLeft: 16, color: '#374151', lineHeight: 2, fontSize: 13 }}>
              <li>理赔影像批量处理与结构化</li>
              <li>财务报销票据自动识别</li>
              <li>多版式票据混合处理</li>
            </ul>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>❌ 不适用场景</h3>
            <ul style={{ paddingLeft: 16, color: '#374151', lineHeight: 2, fontSize: 13 }}>
              <li>非票据类文档识别（请使用通用OCR）</li>
              <li>模糊不清或严重损坏的票据图片</li>
              <li>手写票据识别</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 安装配置 */}
      <section
        id="installation"
        ref={el => { sectionRefs.current['installation'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          安装与配置
        </h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 10 }}>前置条件</h3>
        <ol style={{ paddingLeft: 20, color: '#374151', lineHeight: 2, marginBottom: 16 }}>
          <li>已开通阿里云视觉智能开放平台服务</li>
          <li>已配置 AccessKey 和 SecretKey</li>
          <li>已安装并配置好 AI 代理平台</li>
        </ol>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 10 }}>安装步骤</h3>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: 13,
          color: '#374151',
          maxWidth: '800px',
        }}>
          openclaw skills install {skillData.name}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 10 }}>环境配置</h3>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: 13,
          color: '#374151',
          maxWidth: '800px',
        }}>
          ALIBABACLOUD_ACCESS_KEY_ID=your_access_key_id<br />
          ALIBABACLOUD_ACCESS_KEY_SECRET=your_access_key_secret<br />
          ALIBABACLOUD_REGION=cn-shanghai
        </div>
      </section>

      {/* 使用指南 */}
      <section
        id="usage"
        ref={el => { sectionRefs.current['usage'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          使用指南
        </h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>快速开始</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20, maxWidth: '800px' }}>
          {[
            { title: '识别增值税发票', cmd: '帮我识别这张增值税发票，提取发票代码、号码、金额等关键字段' },
            { title: '批量处理收据', cmd: '将这10张收据图片批量识别并提取金额和日期信息' },
            { title: '校验票据真伪', cmd: '帮我校验这张发票的真伪，查询国家税务总局查验结果' },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
            }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{item.title}</h4>
              <pre style={{
                fontSize: 11,
                color: '#6b7280',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                padding: 6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.cmd}
              </pre>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>常见用例</h3>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>1. 单张票据识别</h4>
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 12,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 12,
            color: '#374151',
            marginBottom: 12,
            maxWidth: '800px',
          }}>
            识别增值税专票，输出结构化JSON格式，包含发票代码、发票号码、开票日期、购买方、销售方、金额、税额等字段
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>2. 批量票据处理</h4>
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 12,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 12,
            color: '#374151',
            marginBottom: 12,
            maxWidth: '800px',
          }}>
            将这50张理赔影像中的票据全部识别，按票据类型分类输出，并计算总金额
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>3. 票据真伪校验</h4>
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 12,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 12,
            color: '#374151',
            maxWidth: '800px',
          }}>
            根据识别出的发票代码和号码，调用国家税务总局发票查验接口进行真伪校验
          </div>
        </div>
      </section>

      {/* API参考 */}
      <section
        id="api"
        ref={el => { sectionRefs.current['api'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          API参考
        </h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>核心接口</h3>

        <table style={{
          width: '100%',
          maxWidth: '800px',
          borderCollapse: 'collapse',
          marginBottom: 20,
          fontSize: 13,
        }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>接口</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>功能描述</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>返回字段</th>
            </tr>
          </thead>
          <tbody>
            {[
              { api: 'recognize_vat_invoice', desc: '识别增值税发票', fields: 'invoice_code, invoice_no, date, buyer, seller, amount, tax_amount' },
              { api: 'recognize_receipt', desc: '识别定额/机打收据', fields: 'receipt_no, date, amount, payee, payer' },
              { api: 'batch_recognize', desc: '批量票据识别', fields: 'results[], total_count, success_count' },
              { api: 'verify_invoice', desc: '发票真伪校验', fields: 'is_valid, verify_source, verify_time' },
            ].map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>{item.api}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{item.desc}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: 11 }}>{item.fields}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>错误码</h3>
        <table style={{
          width: '100%',
          maxWidth: '800px',
          borderCollapse: 'collapse',
          fontSize: 13,
        }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>错误码</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>描述</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>解决方案</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: 'INVALID_IMAGE', desc: '图片格式不支持或图片损坏', solution: '检查图片格式是否为 JPG/PNG，文件大小不超过 10MB' },
              { code: 'RECOGNITION_FAILED', desc: 'OCR识别失败', solution: '确保图片清晰度足够，票据内容完整可见' },
              { code: 'API_LIMIT_EXCEEDED', desc: 'API调用频率超限', solution: '降低请求频率或使用批量接口减少调用次数' },
              { code: 'AUTH_FAILED', desc: '身份验证失败', solution: '检查 AccessKey 和 SecretKey 是否正确配置' },
            ].map((item, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>{item.code}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{item.desc}</td>
                <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{item.solution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 最佳实践 */}
      <section
        id="best-practices"
        ref={el => { sectionRefs.current['best-practices'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          SKILL.md 示例
        </h2>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: 12,
          lineHeight: 2,
          color: '#374151',
          whiteSpace: 'pre-wrap',
          maxWidth: '800px',
        }}>
{`---
name: ocr-receipt-extract
description: 智能识别并提取发票、收据中的关键字段信息
version: 1.0.0
---

# OCR Receipt Extract Skill

## 概述

本 Skill 基于阿里云视觉智能开放平台的 OCR 能力，实现对各类票据图片的自动识别与关键字段提取。

## 依赖

- GitHub CLI (\`gh\`) >= 2.0.0
- 阿里云 AccessKey / SecretKey
- Node.js >= 18.0.0

## 指令

### 识别单张票据

\`\`\`bash
gh ocr extract --image <image_path> --type <invoice|receipt|e-invoice>
\`\`\`

### 批量识别

\`\`\`bash
gh ocr extract --dir <image_directory> --type auto --output <json|csv>
\`\`\`

### 校验发票真伪

\`\`\`bash
gh ocr verify --code <invoice_code> --number <invoice_number>
\`\`\`

## 输出格式

\`\`\`json
{
  "invoice_code": "011002100311",
  "invoice_number": "12345678",
  "date": "2026-05-29",
  "buyer_name": "XX科技有限公司",
  "seller_name": "YY商贸有限公司",
  "amount": 1234.56,
  "tax_amount": 160.49,
  "total_amount": 1395.05
}
\`\`\`

## 最佳实践

1. **图片预处理**：识别前对图片进行旋转校正、去噪、增强对比度
2. **批量处理**：使用 \`--dir\` 参数批量处理，避免循环调用
3. **结果校验**：通过交叉校验（金额 = 单价 × 数量）验证准确性
4. **安全注意**：票据图片含敏感信息，处理后及时清理临时文件
5. **性能优化**：高并发场景接入消息队列异步处理

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| INVALID_IMAGE | 图片格式不支持或损坏 | 检查格式是否为 JPG/PNG，文件 ≤10MB |
| RECOGNITION_FAILED | OCR识别失败 | 确保图片清晰度足够 |
| API_LIMIT_EXCEEDED | 调用频率超限 | 降低频率或使用批量接口 |
| AUTH_FAILED | 身份验证失败 | 检查 AccessKey/SecretKey 配置 |`}
        </div>
      </section>

      {/* 版本历史 */}
      <section
        id="version-history"
        ref={el => { sectionRefs.current['version-history'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          版本历史
        </h2>
        <table style={{ width: '100%', maxWidth: '800px', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>版本</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>发布者</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>发布日期</th>
              <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', textAlign: 'left' }}>更新内容</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>v1.0.0</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>阿里云智能</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>2026-05-29</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>正式发布，支持增值税发票、定额发票、机打小票识别</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>v0.9.0</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>阿里云智能</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>2026-05-15</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>测试版本，收集用户反馈</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 相关技能推荐 */}
      <section style={{
        background: '#fff',
        borderRadius: 12,
        padding: 28,
        marginBottom: 20,
        border: '1px solid #e8e8e8',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          相关技能推荐
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { name: '通用文档OCR识别', description: '通用文档文字识别与结构化提取', likes: 156, updated: '5天前更新' },
            { name: '医疗文档OCR识别', description: '医疗文档OCR识别与病历结构化', likes: 89, updated: '3天前更新' },
            { name: '结构化数据提取', description: '从非结构化数据中提取结构化信息', likes: 64, updated: '7天前更新' },
          ].map((item, i) => (
            <SkillRecommendCard key={i} skill={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ==================== 推荐技能卡片（与"最热门Skills"一致） ====================
const SkillRecommendCard: React.FC<{
  skill: { name: string; description: string; likes: number; updated: string }
}> = ({ skill }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${hovered ? '#3b82f6' : '#e5e7eb'}`,
        padding: 20,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 4px 12px rgba(59,130,246,0.12)' : 'none',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: hovered ? '#3b82f6' : '#1f2937',
          marginBottom: 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.2s',
        }}>
          {skill.name}
        </div>
        <div style={{
          fontSize: 13,
          color: '#6b7280',
          lineHeight: 1.7,
          marginBottom: 16,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {skill.description}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 13,
        color: '#6b7280',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <StarOutlined style={{ fontSize: 14, color: '#9ca3af' }} />
            {skill.likes}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined style={{ fontSize: 14 }} />
            {skill.updated}
          </span>
        </div>
        <span style={{
          color: '#3b82f6',
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          查看详情 &gt;
        </span>
      </div>
    </div>
  )
}

export default SkillDetail

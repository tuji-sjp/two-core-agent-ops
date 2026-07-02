import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined, EditOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { allSkills, mySkills } from '../skills'

// ==================== Skill mock 数据 ====================
interface SkillContent {
  overview: string
  features: string[]
  category: string[]
  publisher: string
  versions: { version: string; publisher: string; date: string; changes: string }[]
  skillMd: string
  apis: { api: string; desc: string; fields: string }[]
  errors: { code: string; desc: string; solution: string }[]
}

const skillContentMap: Record<string, SkillContent> = {
  // ===== OCR识别 =====
  '票据OCR识别': {
    overview: '面向保险理赔场景的智能票据 OCR 技能，能够自动识别各类票据图片并提取关键字段信息。底层基于阿里云视觉智能开放平台的 OCR 能力，结合领域知识实现高精度结构化输出。',
    features: ['增值税专票/普票自动识别与关键字段提取', '定额发票、机打小票、电子发票全覆盖', '支持批量票据处理与结构化输出', '内置票据真伪校验逻辑'],
    category: ['OCR识别'],
    publisher: '阿里云智能',
    versions: [
      { version: 'v1.0.0', publisher: '阿里云智能', date: '2026-05-29', changes: '正式发布，支持增值税发票、定额发票、机打小票识别' },
      { version: 'v0.1.0', publisher: '阿里云智能', date: '2026-05-15', changes: '内测版本，内部试用验证核心能力' },
    ],
    skillMd: `---
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
| AUTH_FAILED | 身份验证失败 | 检查 AccessKey/SecretKey 配置 |`,
    apis: [
      { api: 'recognize_vat_invoice', desc: '识别增值税发票', fields: 'invoice_code, invoice_no, date, buyer, seller, amount, tax_amount' },
      { api: 'recognize_receipt', desc: '识别定额/机打收据', fields: 'receipt_no, date, amount, payee, payer' },
      { api: 'batch_recognize', desc: '批量票据识别', fields: 'results[], total_count, success_count' },
      { api: 'verify_invoice', desc: '发票真伪校验', fields: 'is_valid, verify_source, verify_time' },
    ],
    errors: [
      { code: 'INVALID_IMAGE', desc: '图片格式不支持或图片损坏', solution: '检查图片格式是否为 JPG/PNG，文件大小不超过 10MB' },
      { code: 'RECOGNITION_FAILED', desc: 'OCR识别失败', solution: '确保图片清晰度足够，票据内容完整可见' },
      { code: 'API_LIMIT_EXCEEDED', desc: 'API调用频率超限', solution: '降低请求频率或使用批量接口减少调用次数' },
      { code: 'AUTH_FAILED', desc: '身份验证失败', solution: '检查 AccessKey 和 SecretKey 是否正确配置' },
    ],
  },

  '医疗文档OCR识别': {
    overview: '面向医疗理赔场景的智能文档识别技能，能够自动识别病历、检验报告、处方笺等医疗文档内容并提取关键诊断指标。底层结合医学 NLP 模型实现医疗术语标准化。',
    features: ['病历、检验报告、处方笺等多类型医疗文档识别', '医学术语标准化与 ICD-10 编码映射', '支持检验指标异常值自动标注', '医疗隐私数据自动脱敏处理'],
    category: ['OCR识别'],
    publisher: '医疗智能团队',
    versions: [
      { version: 'v2.0.1', publisher: '医疗智能团队', date: '2026-05-27', changes: '新增医疗隐私脱敏功能，修复检验报告表格解析问题' },
      { version: 'v2.0.0', publisher: '医疗智能团队', date: '2026-05-10', changes: '架构升级，引入医学 NLP 模型，支持 ICD-10 编码映射' },
      { version: 'v0.1.0', publisher: '医疗智能团队', date: '2026-04-20', changes: '内测版本，验证病历识别准确率' },
    ],
    skillMd: `---
name: medical-doc-ocr
description: 自动识别病历、检验报告等医疗文档内容
version: 2.0.1
---

# Medical Document OCR Skill

## 概述

本 Skill 实现对医疗文档的自动识别与内容结构化，结合医学 NLP 模型实现术语标准化。

## 依赖

- 阿里云医疗 NLP 服务
- Node.js >= 18.0.0

## 指令

### 识别病历文档

\`\`\`bash
gh medical-ocr extract --image <image_path> --type <medical_record|lab_report|prescription>
\`\`\`

## 输出格式

\`\`\`json
{
  "doc_type": "lab_report",
  "patient_name": "***",
  "lab_results": [
    { "item": "白细胞计数", "value": 7.2, "unit": "×10^9/L", "normal_range": "3.5-9.5", "abnormal": false }
  ]
}
\`\`\`

## 最佳实践

1. 医疗文档识别前自动脱敏患者姓名和身份证号
2. 检验报告识别后自动比对正常范围并标注异常值
3. 批量处理时按文档类型预分类再识别

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| INVALID_DOC_TYPE | 非医疗文档类型 | 确认上传文档为病历/检验报告/处方笺 |
| OCR_LOW_CONFIDENCE | 识别置信度过低 | 检查图片清晰度，确保文字清晰可辨 |`,
    apis: [
      { api: 'recognize_medical_record', desc: '识别病历文档', fields: 'doc_type, patient_info, diagnosis, treatment_plan' },
      { api: 'recognize_lab_report', desc: '识别检验报告', fields: 'lab_items[], abnormal_flags, summary' },
      { api: 'recognize_prescription', desc: '识别处方笺', fields: 'drug_name, dosage, frequency, duration, prescriber' },
      { api: 'map_icd10', desc: 'ICD-10 编码映射', fields: 'diagnosis_text, icd10_codes[], confidence' },
    ],
    errors: [
      { code: 'INVALID_DOC_TYPE', desc: '非医疗文档类型', solution: '确认上传文档为病历/检验报告/处方笺' },
      { code: 'OCR_LOW_CONFIDENCE', desc: '识别置信度过低（<80%）', solution: '检查图片清晰度，确保文字清晰可辨' },
      { code: 'TERM_NOT_MAPPED', desc: '医学术语无法映射到 ICD-10', solution: '使用同义词表或人工标注辅助映射' },
    ],
  },

  '身份证OCR识别': {
    overview: '身份证正反面信息自动识别与校验技能，支持批量处理和真伪验证。底层基于公安系统接口对接，实现高准确率的身份证信息提取。',
    features: ['身份证正反面自动识别与字段提取', '支持批量身份证图片处理', '内置身份证校验码验证逻辑', '支持真伪验证与伪造检测'],
    category: ['OCR识别'],
    publisher: '身份认证团队',
    versions: [
      { version: 'v1.5.3', publisher: '身份认证团队', date: '2026-06-01', changes: '优化身份证防伪水印识别算法，提升伪造检测准确率' },
      { version: 'v1.5.0', publisher: '身份认证团队', date: '2026-05-18', changes: '新增批量处理接口，支持一次上传多张身份证' },
      { version: 'v0.1.0', publisher: '身份认证团队', date: '2026-04-10', changes: '内测版本，验证基础识别准确率' },
    ],
    skillMd: `---
name: id-card-ocr
description: 身份证正反面信息自动识别与校验
version: 1.5.3
---

# ID Card OCR Skill

## 概述

实现身份证正反面信息自动识别、校验与真伪验证。

## 依赖

- 阿里云身份证 OCR 服务
- Node.js >= 18.0.0

## 指令

### 识别身份证正面

\`\`\`bash
gh id-ocr extract --image <image_path> --side <front|back>
\`\`\`

## 输出格式

\`\`\`json
{
  "side": "front",
  "name": "张三",
  "id_number": "110101199001011234",
  "address": "北京市朝阳区XXX路XX号",
  "birth_date": "1990-01-01",
  "valid": true
}
\`\`\`

## 最佳实践

1. 识别后自动执行校验码验证（GB11643-1999）
2. 批量处理时先按正反面自动分类
3. 涉及敏感信息，处理完成后自动清理缓存

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| CARD_NOT_DETECTED | 未检测到身份证区域 | 确保图片中身份证完整、正面向上 |
| CHECKSUM_FAILED | 校验码验证失败 | 检查识别结果是否准确，必要时人工复核 |`,
    apis: [
      { api: 'recognize_id_front', desc: '识别身份证正面', fields: 'name, id_number, address, birth_date, gender' },
      { api: 'recognize_id_back', desc: '识别身份证反面', fields: 'issuing_authority, valid_from, valid_to' },
      { api: 'batch_recognize', desc: '批量身份证识别', fields: 'results[], total_count, success_count' },
      { api: 'verify_id', desc: '身份证校验码验证', fields: 'is_valid, check_digit' },
    ],
    errors: [
      { code: 'CARD_NOT_DETECTED', desc: '未检测到身份证区域', solution: '确保图片中身份证完整、正面向上、无遮挡' },
      { code: 'CHECKSUM_FAILED', desc: '校验码验证失败', solution: '检查识别结果是否准确，必要时人工复核' },
      { code: 'BLURRED_IMAGE', desc: '图片模糊无法识别', solution: '使用清晰度 ≥300dpi 的身份证照片' },
    ],
  },

  // ===== 数据采集 =====
  '网页数据采集': {
    overview: '基于规则的网页数据采集工具，支持增量抓取、去重和结构化存储。适用于保险条款、费率表、医院列表等公开数据的自动化采集。',
    features: ['支持自定义 XPath/CSS 选择器配置采集规则', '增量抓取与自动去重机制', '支持定时任务与异常重试', '采集结果自动结构化存储'],
    category: ['数据采集'],
    publisher: '数据采集团队',
    versions: [
      { version: 'v1.0.8', publisher: '数据采集团队', date: '2026-05-26', changes: '新增 XPath 选择器支持，优化增量去重逻辑' },
      { version: 'v0.1.0', publisher: '数据采集团队', date: '2026-04-05', changes: '内测版本，验证基础采集能力' },
    ],
    skillMd: `---
name: web-data-collect
description: 基于规则的网页数据采集工具
version: 1.0.8
---

# Web Data Collection Skill

## 概述

实现网页数据的自动化采集、去重和结构化存储。

## 依赖

- Playwright >= 1.40.0
- Node.js >= 18.0.0

## 指令

### 采集单个页面

\`\`\`bash
gh web-collect run --url <url> --selector <css_selector> --output <json|csv>
\`\`\`

## 输出格式

\`\`\`json
{
  "url": "https://example.com/rates",
  "data": [
    { "field1": "value1", "field2": "value2" }
  ],
  "total_count": 100,
  "new_count": 12
}
\`\`\`

## 最佳实践

1. 配置合理的采集间隔，避免目标站点限流
2. 使用增量模式减少重复数据
3. 定期清理过期采集缓存

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| PAGE_TIMEOUT | 页面加载超时 | 检查网络连接或目标站点是否可达 |
| SELECTOR_NOT_FOUND | 选择器未匹配到元素 | 检查 CSS 选择器是否正确 |`,
    apis: [
      { api: 'collect_single_page', desc: '采集单个页面数据', fields: 'url, data[], total_count, new_count' },
      { api: 'collect_incremental', desc: '增量采集去重', fields: 'new_items[], skipped_count, last_sync_time' },
      { api: 'schedule_task', desc: '定时采集任务', fields: 'task_id, schedule, next_run_time, status' },
    ],
    errors: [
      { code: 'PAGE_TIMEOUT', desc: '页面加载超时（>30s）', solution: '检查网络连接或目标站点是否可达' },
      { code: 'SELECTOR_NOT_FOUND', desc: '选择器未匹配到任何元素', solution: '检查 CSS/XPath 选择器是否与页面结构匹配' },
      { code: 'RATE_LIMITED', desc: '请求频率被限流', solution: '增加采集间隔或配置代理轮换' },
    ],
  },

  'API数据同步': {
    overview: '多源 API 数据同步聚合技能，支持定时任务、数据转换和异常重试机制。适用于保险核心系统与外部数据源之间的数据同步场景。',
    features: ['多数据源 API 并发同步', '支持数据转换与格式标准化', '自动重试与失败告警', '增量同步与全量同步两种模式'],
    category: ['数据采集'],
    publisher: '数据集成团队',
    versions: [
      { version: 'v0.9.2', publisher: '数据集成团队', date: '2026-05-29', changes: '新增数据转换管道，支持自定义字段映射规则' },
      { version: 'v0.1.0', publisher: '数据集成团队', date: '2026-04-15', changes: '内测版本，验证基础同步能力' },
    ],
    skillMd: `---
name: api-data-sync
description: 多源 API 数据同步聚合
version: 0.9.2
---

# API Data Sync Skill

## 概述

实现多源 API 数据的定时同步、转换与聚合。

## 依赖

- Node.js >= 18.0.0
- Redis（用于任务队列）

## 指令

### 执行同步任务

\`\`\`bash
gh api-sync run --config <config_file> --mode <incremental|full>
\`\`\`

## 输出格式

\`\`\`json
{
  "sync_id": "sync_20260605_001",
  "mode": "incremental",
  "records_synced": 1520,
  "records_failed": 3,
  "duration_ms": 4500
}
\`\`\`

## 最佳实践

1. 增量同步优先，全量同步用于定期数据校准
2. 配置失败告警通知，及时处理同步异常
3. 数据转换规则先行测试再上线

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| API_UNAVAILABLE | 源 API 不可达 | 检查 API 状态，稍后重试 |
| TRANSFORM_FAILED | 数据转换失败 | 检查字段映射规则是否匹配源数据 |`,
    apis: [
      { api: 'sync_incremental', desc: '增量数据同步', fields: 'sync_id, records_synced, records_failed, duration_ms' },
      { api: 'sync_full', desc: '全量数据同步', fields: 'sync_id, total_records, success_count, failed_count' },
      { api: 'transform_data', desc: '数据转换与标准化', fields: 'source_data, mapped_data, transform_rules' },
    ],
    errors: [
      { code: 'API_UNAVAILABLE', desc: '源 API 不可达', solution: '检查 API 状态和网络连接，稍后重试' },
      { code: 'TRANSFORM_FAILED', desc: '数据转换失败', solution: '检查字段映射规则是否与源数据格式匹配' },
    ],
  },

  '日志采集': {
    overview: '分布式日志采集与聚合技能，支持多数据源接入、实时解析和异常检测。适用于运营平台各智能体运行日志的统一采集与分析。',
    features: ['多数据源日志接入（文件/HTTP/消息队列）', '实时日志解析与结构化', '异常日志自动检测与告警', '支持日志压缩与归档'],
    category: ['数据采集'],
    publisher: '运维团队',
    versions: [
      { version: 'v1.1.0', publisher: '运维团队', date: '2026-05-27', changes: '新增消息队列接入支持，优化异常检测算法' },
      { version: 'v0.1.0', publisher: '运维团队', date: '2026-04-08', changes: '内测版本，验证基础日志采集能力' },
    ],
    skillMd: `---
name: log-collect
description: 分布式日志采集与聚合
version: 1.1.0
---

# Log Collection Skill

## 概述

实现分布式环境下多数据源日志的统一采集、解析与异常检测。

## 依赖

- Fluentd >= 1.16
- Node.js >= 18.0.0

## 指令

### 启动日志采集

\`\`\`bash
gh log-collect start --source <file|http|mq> --config <config_file>
\`\`\`

## 输出格式

\`\`\`json
{
  "log_id": "log_20260605_001",
  "source": "file",
  "parsed_fields": { "level": "ERROR", "service": "agent-ocr", "message": "timeout" },
  "anomaly_detected": true
}
\`\`\`

## 最佳实践

1. 按服务级别分离日志采集通道
2. 异常检测阈值根据业务高峰期动态调整
3. 日志定期归档，避免存储空间不足

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| SOURCE_NOT_FOUND | 日志源不存在 | 检查采集源配置是否正确 |
| PARSE_FAILED | 日志解析失败 | 检查日志格式是否符合预期 |`,
    apis: [
      { api: 'collect_from_file', desc: '从文件采集日志', fields: 'file_path, lines_read, parsed_count, error_count' },
      { api: 'collect_from_mq', desc: '从消息队列采集日志', fields: 'queue_name, messages_consumed, lag' },
      { api: 'detect_anomaly', desc: '异常日志检测', fields: 'anomalies[], severity, triggered_at' },
    ],
    errors: [
      { code: 'SOURCE_NOT_FOUND', desc: '日志源不存在或已过期', solution: '检查采集源配置是否正确' },
      { code: 'PARSE_FAILED', desc: '日志格式解析失败', solution: '确认日志格式与解析规则匹配' },
    ],
  },

  // ===== 立案定责 =====
  '理赔案件自动立案': {
    overview: '理赔案件自动立案技能，根据报案信息智能匹配保险条款，完成责任初判与自动立案。底层基于规则引擎和 NLP 技术实现报案信息的结构化解析。',
    features: ['报案信息自动解析与结构化', '保险条款智能匹配与责任初判', '支持多险种自动立案流程', '立案信息一键推送至理赔系统'],
    category: ['立案定责'],
    publisher: '理赔运营团队',
    versions: [
      { version: 'v2.3.0', publisher: '理赔运营团队', date: '2026-06-02', changes: '新增医疗险自动立案规则，优化责任判定准确率至 95%' },
      { version: 'v2.0.0', publisher: '理赔运营团队', date: '2026-05-10', changes: '规则引擎升级，支持多险种并发立案' },
      { version: 'v0.1.0', publisher: '理赔运营团队', date: '2026-04-01', changes: '内测版本，验证意外险自动立案流程' },
    ],
    skillMd: `---
name: auto-case-filing
description: 理赔案件自动立案，根据报案信息智能匹配保险条款
version: 2.3.0
---

# Auto Case Filing Skill

## 概述

实现理赔案件的自动立案处理，基于报案信息完成责任初判。

## 依赖

- 规则引擎 >= 3.0
- NLP 服务 >= 2.0

## 指令

### 自动立案

\`\`\`bash
gh auto-file --case <case_info_json> --insurance_type <accident|medical|critical>
\`\`\`

## 输出格式

\`\`\`json
{
  "case_no": "CLAIM20260605001",
  "insurance_type": "accident",
  "liability_match": { "matched": true, "confidence": 0.95, "clause": "意外险条款第3.2条" },
  "status": "filed",
  "next_step": "定责审核"
}
\`\`\`

## 最佳实践

1. 立案信息推送前人工复核责任判定结果
2. 多险种混合报案时按优先级依次立案
3. 立案信息推送失败时自动重试 3 次

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| MISSING_REQUIRED_FIELD | 缺少必填字段 | 补充报案信息中的必填字段后重试 |
| CLAUSE_NOT_MATCHED | 未匹配到保险条款 | 检查报案信息中的险种描述是否准确 |`,
    apis: [
      { api: 'auto_file_case', desc: '自动立案处理', fields: 'case_no, insurance_type, liability_match, status, next_step' },
      { api: 'match_clause', desc: '保险条款匹配', fields: 'matched_clause, confidence, liability_result' },
      { api: 'push_to_system', desc: '立案信息推送', fields: 'push_id, target_system, result, retry_count' },
    ],
    errors: [
      { code: 'MISSING_REQUIRED_FIELD', desc: '缺少必填字段', solution: '补充报案信息中的必填字段后重试' },
      { code: 'CLAUSE_NOT_MATCHED', desc: '未匹配到任何保险条款', solution: '检查报案信息中的险种描述是否准确' },
    ],
  },

  '理赔责任判定': {
    overview: '基于知识图谱的理赔责任智能判定技能，覆盖多险种责任竞合场景。底层融合保险条款图谱与历史判例库，实现高精度的责任判定。',
    features: ['基于知识图谱的责任推理', '支持多险种责任竞合场景分析', '融合历史判例辅助判定', '输出判定依据与解释说明'],
    category: ['立案定责'],
    publisher: '理赔智能团队',
    versions: [
      { version: 'v1.8.4', publisher: '理赔智能团队', date: '2026-06-01', changes: '新增重疾险责任判定规则，优化竞合场景处理逻辑' },
      { version: 'v1.5.0', publisher: '理赔智能团队', date: '2026-05-12', changes: '知识图谱节点扩展至 5000+，提升判定覆盖率' },
      { version: 'v0.1.0', publisher: '理赔智能团队', date: '2026-04-05', changes: '内测版本，验证意外险责任判定准确率' },
    ],
    skillMd: `---
name: liability-judgment
description: 基于知识图谱的理赔责任智能判定
version: 1.8.4
---

# Liability Judgment Skill

## 概述

基于知识图谱和历史判例，实现理赔责任的智能判定。

## 依赖

- 知识图谱服务 >= 2.0
- 判例库 >= 1.0

## 指令

### 执行责任判定

\`\`\`bash
gh liability judge --case <case_info_json> --insurance_type <accident|medical|critical>
\`\`\`

## 输出格式

\`\`\`json
{
  "case_no": "CLAIM20260605001",
  "liability": "covered",
  "confidence": 0.92,
  "reasoning": "根据知识图谱推理，事故原因属于意外伤害范畴...",
  "basis": ["意外险条款第3.2条", "历史判例 #H2025-0123"],
  "competing_clauses": []
}
\`\`\`

## 最佳实践

1. 责任竞合场景优先按保险金额高的条款处理
2. 判定置信度 <80% 时标记为人工复核
3. 每次判定后记录推理过程供审计使用

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| INSUFFICIENT_INFO | 案件信息不足以完成判定 | 补充案件详细信息后重试 |
| COMPETING_CLAUSE_CONFLICT | 责任条款存在竞合冲突 | 启动多条款竞合分析流程 |`,
    apis: [
      { api: 'judge_liability', desc: '执行责任判定', fields: 'case_no, liability, confidence, reasoning, basis' },
      { api: 'query_knowledge_graph', desc: '知识图谱推理查询', fields: 'query, matched_nodes[], inference_path' },
      { api: 'search_precedents', desc: '历史判例检索', fields: 'precedents[], similarity_scores, top_match' },
    ],
    errors: [
      { code: 'INSUFFICIENT_INFO', desc: '案件信息不足以完成判定', solution: '补充案件详细信息后重试' },
      { code: 'COMPETING_CLAUSE_CONFLICT', desc: '责任条款存在竞合冲突', solution: '启动多条款竞合分析流程' },
      { code: 'LOW_CONFIDENCE', desc: '判定置信度过低（<60%）', solution: '标记为人工复核，不自动判定' },
    ],
  },

  '理赔欺诈检测': {
    overview: '理赔欺诈风险智能检测技能，基于行为模式和关联分析识别可疑案件。底层融合图谱分析与机器学习模型，实现多维度欺诈风险识别。',
    features: ['基于行为模式的异常检测', '关联图谱发现团伙欺诈', '多维度风险评分与分级预警', '支持历史欺诈案例比对'],
    category: ['立案定责'],
    publisher: '风控团队',
    versions: [
      { version: 'v3.1.0', publisher: '风控团队', date: '2026-06-01', changes: '新增关联图谱欺诈检测模型，识别团伙欺诈准确率提升至 88%' },
      { version: 'v3.0.0', publisher: '风控团队', date: '2026-05-05', changes: '模型架构升级，引入行为模式分析引擎' },
      { version: 'v0.1.0', publisher: '风控团队', date: '2026-03-20', changes: '内测版本，验证基础欺诈检测规则' },
    ],
    skillMd: `---
name: fraud-detection
description: 理赔欺诈风险智能检测
version: 3.1.0
---

# Fraud Detection Skill

## 概述

基于行为模式和关联分析，实现理赔欺诈风险的智能检测与分级预警。

## 依赖

- 图谱分析引擎 >= 2.0
- 风控模型服务 >= 3.0

## 指令

### 执行欺诈检测

\`\`\`bash
gh fraud-detect analyze --case <case_info_json> --mode <full|quick>
\`\`\`

## 输出格式

\`\`\`json
{
  "case_no": "CLAIM20260605001",
  "fraud_risk_level": "high",
  "risk_score": 87,
  "risk_factors": [
    { "factor": "同一地址多次理赔", "weight": 0.35 },
    { "factor": "理赔时间异常集中", "weight": 0.28 }
  ],
  "related_cases": ["CLAIM20260501002", "CLAIM20260420005"],
  "recommendation": "转人工深度调查"
}
\`\`\`

## 最佳实践

1. 高风险案件（score>80）立即转人工深度调查
2. 关联图谱分析优先处理团伙欺诈线索
3. 欺诈检测结果作为理赔审核的参考项而非否决项

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| CASE_DATA_INCOMPLETE | 案件数据不完整 | 补充案件信息后重新检测 |
| MODEL_TIMEOUT | 模型推理超时 | 降级使用规则引擎快速检测 |`,
    apis: [
      { api: 'analyze_fraud_risk', desc: '执行欺诈风险检测', fields: 'case_no, risk_level, risk_score, risk_factors, recommendation' },
      { api: 'query_relation_graph', desc: '关联图谱分析', fields: 'related_entities[], clusters[], fraud_patterns' },
      { api: 'compare_historical', desc: '历史欺诈案例比对', fields: 'matched_cases[], similarity, pattern_match' },
    ],
    errors: [
      { code: 'CASE_DATA_INCOMPLETE', desc: '案件数据不完整', solution: '补充案件详细信息后重新检测' },
      { code: 'MODEL_TIMEOUT', desc: '模型推理超时（>10s）', solution: '自动降级使用规则引擎快速检测模式' },
    ],
  },

  // ===== 核保评估 =====
  '健康告知评估': {
    overview: '健康告知智能评估技能，自动识别异常告知项并给出核保建议。底层基于核保手册和医学知识，实现对健康告知的结构化分析与风险评估。',
    features: ['健康告知项自动解析与异常识别', '基于核保手册的风险评估', '支持标准体/次标准体/拒保三种结论', '输出加费建议与除外责任推荐'],
    category: ['核保评估'],
    publisher: '核保智能团队',
    versions: [
      { version: 'v1.4.2', publisher: '核保智能团队', date: '2026-05-29', changes: '新增甲状腺结节核保规则，优化次标准体加费计算' },
      { version: 'v1.0.0', publisher: '核保智能团队', date: '2026-05-01', changes: '正式发布，支持常见 20 种异常告知项评估' },
      { version: 'v0.1.0', publisher: '核保智能团队', date: '2026-04-10', changes: '内测版本，验证高血压、糖尿病核保规则' },
    ],
    skillMd: `---
name: health-declaration-assess
description: 健康告知智能评估，自动识别异常告知项
version: 1.4.2
---

# Health Declaration Assessment Skill

## 概述

基于核保手册，实现健康告知的结构化分析与风险评估。

## 依赖

- 核保知识库 >= 1.0
- 医学知识服务 >= 2.0

## 指令

### 执行健康告知评估

\`\`\`bash
gh health-assess evaluate --declaration <declaration_json> --product <product_code>
\`\`\`

## 输出格式

\`\`\`json
{
  "assessment_result": "substandard",
  "abnormal_items": [
    { "item": "高血压病史3年", "severity": "中度", "impact": "加费20%" }
  ],
  "recommendation": "加费承保",
  "premium_loading": "20%",
  "exclusions": []
}
\`\`\`

## 最佳实践

1. 评估结果作为核保辅助参考，最终结论由核保人确认
2. 次标准体加费比例参考核保手册最新标准
3. 拒保结论必须附带明确的拒保依据

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| DECLARATION_EMPTY | 健康告知为空 | 确认投保人已完成健康告知填写 |
| PRODUCT_NOT_FOUND | 产品代码不存在 | 检查产品代码是否正确 |`,
    apis: [
      { api: 'evaluate_declaration', desc: '健康告知评估', fields: 'assessment_result, abnormal_items, recommendation, premium_loading' },
      { api: 'query_underwriting_manual', desc: '核保手册查询', fields: 'condition, severity_levels, underwriting_guideline' },
      { api: 'calculate_loading', desc: '加费计算', fields: 'base_premium, loading_percentage, final_premium' },
    ],
    errors: [
      { code: 'DECLARATION_EMPTY', desc: '健康告知内容为空', solution: '确认投保人已完成健康告知填写' },
      { code: 'PRODUCT_NOT_FOUND', desc: '产品代码不存在', solution: '检查产品代码是否与当前销售产品一致' },
    ],
  },

  '风险智能定价': {
    overview: '基于多维度风险因子的智能定价技能，支持次标准体加费计算和拒保决策。底层融合精算模型与机器学习，实现个性化保费定价。',
    features: ['多维度风险因子评估（年龄/健康/职业等）', '次标准体自动加费计算', '支持拒保决策与建议', '精算模型与 ML 模型双引擎定价'],
    category: ['核保评估'],
    publisher: '精算团队',
    versions: [
      { version: 'v0.7.5', publisher: '精算团队', date: '2026-05-28', changes: '新增职业风险因子评估，优化加费计算模型' },
      { version: 'v0.1.0', publisher: '精算团队', date: '2026-04-15', changes: '内测版本，验证基础定价模型准确率' },
    ],
    skillMd: `---
name: risk-smart-pricing
description: 基于多维度风险因子的智能定价
version: 0.7.5
---

# Risk Smart Pricing Skill

## 概述

基于多维度风险因子，实现个性化保费智能定价。

## 依赖

- 精算模型服务 >= 2.0
- 风控模型服务 >= 1.0

## 指令

### 执行智能定价

\`\`\`bash
gh smart-price calculate --applicant <applicant_info_json> --product <product_code>
\`\`\`

## 输出格式

\`\`\`json
{
  "applicant_id": "APP20260605001",
  "risk_level": "substandard",
  "base_premium": 5000,
  "risk_loading": "25%",
  "final_premium": 6250,
  "decision": "accept_with_loading",
  "risk_factors": ["高血压病史", "BMI超标"]
}
\`\`\`

## 最佳实践

1. 定价结果与精算师人工定价交叉验证
2. 拒保决策需经过人工复核确认
3. 定价模型定期回测校准

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| INSUFFICIENT_DATA | 投保人信息不足 | 补充投保人详细信息后重新计算 |
| MODEL_CONFLICT | 精算模型与ML模型结果差异过大 | 启动人工定价复核流程 |`,
    apis: [
      { api: 'calculate_premium', desc: '智能保费计算', fields: 'risk_level, base_premium, risk_loading, final_premium, decision' },
      { api: 'assess_risk_factors', desc: '风险因子评估', fields: 'factors[], scores, weights, total_score' },
      { api: 'decision_engine', desc: '承保决策', fields: 'decision, reason, conditions, manual_review_required' },
    ],
    errors: [
      { code: 'INSUFFICIENT_DATA', desc: '投保人信息不足以完成定价', solution: '补充投保人详细信息后重新计算' },
      { code: 'MODEL_CONFLICT', desc: '精算模型与 ML 模型结果差异过大', solution: '启动人工定价复核流程' },
    ],
  },

  '体检报告解读': {
    overview: '体检报告智能解读技能，对照核保手册自动给出风险评估和加费建议。底层基于医学指标知识库与核保规则引擎，实现体检指标的结构化分析与核保决策。',
    features: ['体检报告自动解析与指标提取', '异常指标自动标注与分级', '对照核保手册给出风险评估', '输出加费/除外/延期/拒保建议'],
    category: ['核保评估'],
    publisher: '核保智能团队',
    versions: [
      { version: 'v2.0.0', publisher: '核保智能团队', date: '2026-05-30', changes: '新增 50+ 项体检指标解析，优化核保规则引擎' },
      { version: 'v1.0.0', publisher: '核保智能团队', date: '2026-04-25', changes: '正式发布，支持常规体检项目核保评估' },
      { version: 'v0.1.0', publisher: '核保智能团队', date: '2026-04-05', changes: '内测版本，验证血脂、肝功指标核保规则' },
    ],
    skillMd: `---
name: medical-report-interpret
description: 体检报告智能解读与核保评估
version: 2.0.0
---

# Medical Report Interpretation Skill

## 概述

基于体检报告和核保手册，实现体检指标的结构化分析与核保决策建议。

## 依赖

- 医学指标知识库 >= 2.0
- 核保规则引擎 >= 1.0

## 指令

### 执行体检报告解读

\`\`\`bash
gh medical-interpret analyze --report <report_json> --product <product_code>
\`\`\`

## 输出格式

\`\`\`json
{
  "report_id": "RPT20260605001",
  "abnormal_indicators": [
    { "item": "总胆固醇", "value": 6.8, "unit": "mmol/L", "normal_range": "3.1-5.2", "severity": "中度" }
  ],
  "risk_assessment": "substandard",
  "recommendation": "加费承保",
  "premium_loading": "15%",
  "exclusions": ["心血管相关疾病"]
}
\`\`\`

## 最佳实践

1. 异常指标解读后对照最新核保手册确认风险等级
2. 多项异常时综合评估，避免单一指标过度加费
3. 延期/拒保结论需人工核保人复核

## 错误处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| REPORT_FORMAT_UNSUPPORTED | 体检报告格式不支持 | 转换为标准 JSON 格式后重试 |
| INDICATOR_NOT_FOUND | 指标未在知识库中找到 | 记录新指标并联系维护团队更新 |`,
    apis: [
      { api: 'parse_medical_report', desc: '体检报告解析', fields: 'report_id, indicators[], normal_ranges, abnormal_flags' },
      { api: 'assess_risk', desc: '风险评估', fields: 'risk_level, abnormal_items, severity_scores, recommendation' },
      { api: 'suggest_loading', desc: '加费建议', fields: 'base_premium, loading_percentage, exclusions, final_decision' },
    ],
    errors: [
      { code: 'REPORT_FORMAT_UNSUPPORTED', desc: '体检报告格式不支持', solution: '转换为标准 JSON 格式后重试' },
      { code: 'INDICATOR_NOT_FOUND', desc: '指标未在医学知识库中找到', solution: '记录新指标并联系维护团队更新知识库' },
      { code: 'MULTIPLE_ABNORMAL', desc: '异常指标过多（>10项），综合评估困难', solution: '按严重程度排序，优先处理高风险指标' },
    ],
  },
}

const defaultSkill: SkillContent = skillContentMap['票据OCR识别']

const SkillDetail: React.FC = () => {
  const navigate = useNavigate()
  const { name } = useParams()
  const [activeSection, setActiveSection] = useState('overview')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const currentName = name || '票据OCR识别'
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 可编辑状态的本地副本
  const [editContent, setEditContent] = useState<SkillContent | null>(null)

  const content = isEditing && editContent ? editContent : (skillContentMap[currentName] || defaultSkill)

  const skillData = {
    name: currentName,
    version: content.versions[0]?.version || 'v1.0.0',
    category: content.category[0] || '',
    description: content.overview,
  }

  const sections = [
    { key: 'overview', label: '概述' },
    { key: 'version-history', label: '版本历史' },
    { key: 'best-practices', label: 'SKILL.md' },
    { key: 'api', label: 'API参考' },
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

  const handleEdit = () => {
    const sorted = { ...skillContentMap[currentName] || defaultSkill }
    sorted.versions = [...sorted.versions].sort((a, b) => {
      const va = a.version.replace(/[vV]/g, '').split('.').map(Number)
      const vb = b.version.replace(/[vV]/g, '').split('.').map(Number)
      for (let i = 0; i < Math.max(va.length, vb.length); i++) {
        const d = (va[i] || 0) - (vb[i] || 0); if (d !== 0) return d
      }
      return 0
    })
    setEditContent(sorted)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditContent(null)
    setIsEditing(false)
  }

  const handleDelete = () => {
    delete skillContentMap[currentName]
    const idx1 = allSkills.findIndex(s => s.name === currentName)
    if (idx1 >= 0) allSkills.splice(idx1, 1)
    const idx2 = mySkills.findIndex(s => s.name === currentName)
    if (idx2 >= 0) mySkills.splice(idx2, 1)
    setShowDeleteConfirm(false)
    navigate('/skills/market')
  }

  const handleSubmit = () => {
    if (editContent) {
      skillContentMap[currentName] = editContent
      setIsEditing(false)
      setEditContent(null)
    }
  }

  const updateField = (field: keyof SkillContent, value: SkillContent[typeof field]) => {
    if (editContent) {
      setEditContent({ ...editContent, [field]: value })
    }
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
            onClick={() => navigate('/skills/market')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#595959', fontSize: 14 }}
          >
            <ArrowLeftOutlined /> 返回Skills集市
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

      {/* 编辑/取消/删除按钮 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={handleEdit}
          disabled={isEditing}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 16px', border: '1px solid', borderRadius: 6,
            borderColor: isEditing ? '#d9d9d9' : '#3b82f6',
            background: '#fff',
            color: isEditing ? '#bfbfbf' : '#3b82f6',
            fontSize: 13, fontWeight: 600,
            cursor: isEditing ? 'not-allowed' : 'pointer',
            opacity: isEditing ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          <EditOutlined style={{ fontSize: 12 }} /> 编辑
        </button>
        {!isEditing && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 16px', border: '1px solid #9ca3af', borderRadius: 6,
              background: '#fff',
              color: '#9ca3af',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <DeleteOutlined style={{ fontSize: 12 }} /> 删除
          </button>
        )}
        {isEditing && (
          <button
            onClick={handleCancel}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 16px', border: '1px solid #3b82f6', borderRadius: 6,
              background: '#fff',
              color: '#3b82f6',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <CloseOutlined style={{ fontSize: 12 }} /> 取消
          </button>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 12, padding: 24, width: 360,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              确定要删除「{currentName}」Skill 吗？此操作不可恢复。
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '6px 16px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer' }}>取消</button>
              <button onClick={handleDelete} style={{ padding: '6px 16px', border: 'none', borderRadius: 6, background: '#ff4d4f', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 概述 */}
      <section
        id="overview"
        ref={el => { sectionRefs.current['overview'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          概述
        </h2>
        {isEditing ? (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={content.overview}
              onChange={e => updateField('overview', e.target.value)}
              style={{
                width: '100%', minHeight: 80, padding: 12, fontSize: 14,
                border: '1px solid #d9d9d9', borderRadius: 8, resize: 'vertical',
                fontFamily: 'inherit', color: '#374151', lineHeight: 1.8,
              }}
            />
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>功能特性：</div>
              {content.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                  <input
                    value={f}
                    onChange={e => {
                      const newFeatures = [...content.features]
                      newFeatures[i] = e.target.value
                      updateField('features', newFeatures)
                    }}
                    placeholder="输入新功能描述"
                    style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid #d9d9d9', borderRadius: 6 }}
                  />
                  <button
                    onClick={() => updateField('features', content.features.filter((_, j) => j !== i))}
                    style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
                  ><DeleteOutlined /></button>
                </div>
              ))}
              <button
                onClick={() => updateField('features', [...content.features, ''])}
                style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12, marginTop: 4 }}
              >+ 添加功能</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>分类标签：</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['OCR识别', '数据采集', '立案定责', '核保评估'].map(tag => {
                  const active = content.category.includes(tag)
                  return (
                    <div key={tag} onClick={() => {
                      const nc = active ? content.category.filter((c: string) => c !== tag) : [...content.category, tag]
                      updateField('category', nc)
                    }} style={{
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
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginTop: 12 }}>
              {content.overview}
            </p>
            {content.features.length > 0 && (
              <ul style={{ paddingLeft: 20, marginBottom: 10, color: '#374151', lineHeight: 2 }}>
                {content.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: '800px', marginTop: 12 }}>
              {content.category.map((c: string, ci: number) => (
                <span key={ci} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: '1px solid #3b82f6', background: '#eff6ff',
                  color: '#3b82f6', lineHeight: 1.4, whiteSpace: 'nowrap',
                }}>{c}</span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 版本历史 */}
      <section
        id="version-history"
        ref={el => { sectionRefs.current['version-history'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          版本历史
        </h2>
        {isEditing ? (
          <div>
            {content.versions.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-start' }}>
                <input value={v.version} onChange={e => {
                  const nv = [...content.versions]; nv[i] = { ...nv[i], version: e.target.value }; updateField('versions', nv)
                }} placeholder="版本号" style={{ width: 100, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} />
                <input value={v.date} onChange={e => {
                  const nv = [...content.versions]; nv[i] = { ...nv[i], date: e.target.value }; updateField('versions', nv)
                }} style={{ width: 130, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} placeholder="日期" />
                <input value={v.changes} onChange={e => {
                  const nv = [...content.versions]; nv[i] = { ...nv[i], changes: e.target.value }; updateField('versions', nv)
                }} style={{ flex: 1, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} placeholder="更新内容" />
                <button onClick={() => updateField('versions', content.versions.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
              </div>
            ))}
            <button onClick={() => updateField('versions', [...content.versions, { version: '', publisher: content.publisher, date: '', changes: '' }])} style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12 }}>+ 添加版本</button>
          </div>
        ) : (
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
              {(() => {
                const sv = [...content.versions].sort((a, b) => {
                  const va = a.version.replace(/[vV]/g, '').split('.').map(Number)
                  const vb = b.version.replace(/[vV]/g, '').split('.').map(Number)
                  for (let i = 0; i < Math.max(va.length, vb.length); i++) {
                    const d = (va[i] || 0) - (vb[i] || 0); if (d !== 0) return d
                  }
                  return 0
                })
                return sv.map((v, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>{v.version}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{content.publisher}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{v.date}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{v.changes}</td>
                </tr>
              ))})()}
            </tbody>
          </table>
        )}
      </section>

      {/* SKILL.md */}
      <section
        id="best-practices"
        ref={el => { sectionRefs.current['best-practices'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          SKILL.md
        </h2>
        {isEditing ? (
          <textarea
            value={content.skillMd}
            onChange={e => updateField('skillMd', e.target.value)}
            style={{
              width: '100%', minHeight: 400, padding: 16, fontSize: 12,
              border: '1px solid #d9d9d9', borderRadius: 8, resize: 'vertical',
              fontFamily: 'Consolas, Monaco, monospace', lineHeight: 2, color: '#374151',
              background: '#f9fafb',
            }}
          />
        ) : (
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
{content.skillMd}
          </div>
        )}
      </section>

      {/* API参考 */}
      <section
        id="api"
        ref={el => { sectionRefs.current['api'] = el }}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8',
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e8e8e8' }}>
          API参考
        </h2>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>核心接口</h3>

        {isEditing ? (
          <div style={{ marginBottom: 20 }}>
            {content.apis.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <input value={item.api} onChange={e => {
                  const na = [...content.apis]; na[i] = { ...na[i], api: e.target.value }; updateField('apis', na)
                }} style={{ width: 180, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} placeholder="接口名" />
                <input value={item.desc} onChange={e => {
                  const na = [...content.apis]; na[i] = { ...na[i], desc: e.target.value }; updateField('apis', na)
                }} style={{ width: 160, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} placeholder="功能描述" />
                <input value={item.fields} onChange={e => {
                  const na = [...content.apis]; na[i] = { ...na[i], fields: e.target.value }; updateField('apis', na)
                }} style={{ flex: 1, padding: '6px 10px', fontSize: 11, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} placeholder="返回字段" />
                <button onClick={() => updateField('apis', content.apis.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
              </div>
            ))}
            <button onClick={() => updateField('apis', [...content.apis, { api: '', desc: '', fields: '' }])} style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12 }}>+ 添加接口</button>
          </div>
        ) : (
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
              {content.apis.map((item, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>{item.api}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{item.desc}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace', fontSize: 11 }}>{item.fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>错误码</h3>
        {isEditing ? (
          <div>
            {content.errors.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <input value={item.code} onChange={e => {
                  const ne = [...content.errors]; ne[i] = { ...ne[i], code: e.target.value }; updateField('errors', ne)
                }} style={{ width: 140, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontFamily: 'monospace' }} placeholder="错误码" />
                <input value={item.desc} onChange={e => {
                  const ne = [...content.errors]; ne[i] = { ...ne[i], desc: e.target.value }; updateField('errors', ne)
                }} style={{ width: 180, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} placeholder="描述" />
                <input value={item.solution} onChange={e => {
                  const ne = [...content.errors]; ne[i] = { ...ne[i], solution: e.target.value }; updateField('errors', ne)
                }} style={{ flex: 1, padding: '6px 10px', fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 6 }} placeholder="解决方案" />
                <button onClick={() => updateField('errors', content.errors.filter((_, j) => j !== i))} style={{ padding: 4, border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}><DeleteOutlined /></button>
              </div>
            ))}
            <button onClick={() => updateField('errors', [...content.errors, { code: '', desc: '', solution: '' }])} style={{ padding: '4px 12px', border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa', color: '#8c8c8c', cursor: 'pointer', fontSize: 12 }}>+ 添加错误码</button>
          </div>
        ) : (
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
              {content.errors.map((item, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontFamily: 'Consolas, monospace' }}>{item.code}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{item.desc}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{item.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 保存 + 提交审核按钮 */}
      {isEditing && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 20px', border: '1px solid #d9d9d9', borderRadius: 8,
              background: '#fff', color: '#1f2937',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            保存
          </button>
          <button
            onClick={() => { handleSubmit(); alert('已提交审核') }}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 8,
              background: '#3b82f6', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(59,130,246,0.25)',
              transition: 'all 0.2s',
            }}
          >
            提交审核
          </button>
        </div>
      )}
    </div>
  )
}

export { skillContentMap }
export default SkillDetail

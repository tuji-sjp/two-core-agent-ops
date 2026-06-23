# Optimization Tasks

> 基于 git 历史梳理的已提出优化需求汇总，按模块分组。

## 一、技能中心（Skills）

### 1.1 技能发布功能 ✅ 已完成
- 新增"发布新 Skill"弹窗表单，包含名称/概述/功能特性/分类标签/SKILL.md/API参考/错误码字段
- 动态数组输入（功能特性/API/错误码支持增删）
- 分类标签多选（OCR识别/数据采集/立案定责/核保评估）
- 发布后同步更新 skillContentMap / allSkills / mySkills

### 1.2 技能详情页编辑功能 ✅ 已完成
- 支持 overview / features / versions / skillMd / apis / errors 字段内联编辑
- 编辑模式下章节边框蓝色高亮
- 版本自动按语义版本号排序（v0.x 内测在前，v1.x+ 正式在后）
- 分类标签从单值改为多选数组

### 1.3 技能删除功能 ✅ 已完成
- 导航栏右侧"删除"按钮 + 确认弹窗
- 确认后从 skillContentMap / allSkills / mySkills 中移除并跳转至 Skills 集市

### 1.4 待优化项
- **MCP服务页面**（`/skills/mcp`）尚未实现，当前为 PagePlaceholder stub

---

## 二、指标看板（Metrics）

### 2.1 理赔指标页面 ✅ 已完成
- 10 项硬编码指标 + MetricCard inline 渲染
- CaseProcessingChart 全宽 + 粒度切换（天/周/月）+ 日期范围选择
- 案件清单 Table（20 条 MOCK_CASES，7 列）
- 展开行渲染 FlowTrajectoryGraph SVG 流程轨迹图（动态生成，非静态 map）
- 列级模糊筛选（7 个 Input + 重置按钮）
- 自定义底部工具栏（数据计数 + 导出 + 分页）

### 2.2 核保 / 反欺诈指标页面 ⚠️ Stub
- 当前为"页面开发中"占位，未实现
- 不再复用 SmartServices 组件

### 2.3 指标卡片样式 ✅ 已优化
- MetricCard 数值颜色逻辑：百分比 ≥90% 绿色 / ≥70% 琥珀色 / <70% 红色；非百分比统一蓝色
- CaseProcessingChart 图表与指标选择器左右互换位置（图表左，指标右）
- 指标选择器未选中态背景色改为 #f3f4f6
- Y 轴标签 fontWeight 500 加粗

---

## 三、业务全景概览（Business Overview）

### 3.1 浅色主题重构 ✅ 已完成
- 从深色主题（gradient #0a0e27, cyan #00d4ff）完全迁移为浅色主题（bg #fff, blue #3b82f6）
- 3 列 flex 布局：左列 flex:1 / 中列 flex:1.8 / 右列 flex:1
- 5 大板块一屏展示无滚动

### 3.2 数据资产总览 ✅ 已优化
- 4 列 grid 改为 2 列 grid
- 新增理赔/核保 tab 切换

### 3.3 知识调用排行 ✅ 已优化
- 新增理赔/核保 tab 切换
- 数据源从 mock-data.ts 动态提取 Top 10 + category

### 3.4 地图组件 ✅ 已优化
- ChinaMapPanel ECharts 地图浅色主题（areaColor #f3f4f6, borderColor #d1d5db）
- 地图容器高度占满全列

### 3.5 地区案件统计表 ✅ 已优化
- 浅色主题：header bg #f9fafb, data rows 交替 #fff/#fafbfc, hover #f0f7ff
- 解决率彩色 badge（≥95% 绿 / ≥90% 蓝 / ≥85% 琥珀 / <85% 红）

### 3.6 实时案件流 ✅ 已优化
- 浅色主题：status default 从 cyan 改为 blue #3b82f6
- 每 2s 新案件生成 + requestAnimationFrame 平滑滚动

---

## 四、Agent 运营

### 4.1 菜单结构 ✅ 已完成
- 从 2 级扁平重构为 3 级嵌套（理赔/核保/反欺诈 × 概览/日志清单/错例分析，共 9 项）
- 路由从 `/agent/{domain}-{action}` 改为 `/agent/{domain}/{page}`

### 4.2 理赔采集智能体 ✅ 已实现
- 日志清单页面（`/agent/claims/logs`）
- 任务详情页（`/agent/claims/task-detail`），三 Tab 结构：
  - 影像展示（17 种医疗文档分类，104 张图像，左侧分类筛选栏 220px）
  - 引擎结果（JSON 代码块 + 复制按钮）
  - LIC 系统响应（响应码/响应时间/说明框）
- **影像卡片标签** ✅ 已实现：随机展示"重复"（橙）/ "切割"（蓝）/ "矫正"（绿）右上角角标，种子化随机保证刷新稳定
- **预览影像尺寸** ✅ 已优化：预览大图宽度 320px → 500px，弹窗 maxWidth 1100 → 1300
- **切割红框** ✅ 已实现：标签含"切割"的影像，预览大图上叠加 2~4 个红色矩形框模拟切割效果
- **矫正前后分类对比** ✅ 已实现：标签含"矫正"的影像，右侧面板"图像分类"区块展示矫正前（红底框）与矫正后（绿底框）的分类对比
- **图像分类数据对齐** ✅ 已修复：`IMAGE_DETAIL_MOCK` 从 3 条补全至 25 条，所有 `subCategory` 与侧边栏分类名严格一致，大类归属统一为病历材料/医疗材料/身份材料/检验报告/其他

### 4.3 待开发项 ⚠️
- **理赔**：概览（`/agent/claims/overview`）、错例分析（`/agent/claims/case-analysis`）— PagePlaceholder stub
- **核保**：概览/日志清单/错例分析（3 页）— 全部 PagePlaceholder stub
- **反欺诈**：概览/日志清单/错例分析（3 页）— 全部 PagePlaceholder stub
- **旧 Agent 组件**（AgentClaims / AgentUnderwriting / AgentAntiFraud）仍存在于磁盘但不再被路由引用

---

## 五、侧边栏菜单

### 5.1 结构优化 ✅ 已完成
- 共享中心拆分为"技能中心"和"数据共享"两个一级目录
- 路由前缀从 `/shared/` 改为 `/skills/` + `/data-share/`
- 5 组菜单：业务应用（4 项）、Agent 运营（9 项）、技能中心（2 项）、数据共享（2 项）、平台管理（3 项）

### 5.2 样式优化 ✅ 已完成
- 三级菜单层级背景色区分（Level 1 #fff / Level 2 #f3f4f6 / Level 3 #e5e7eb）
- 左内边距区分（10px / 24px / 36px）
- 纵向间距统一（margin-block: 4px，Level 3 margin: 0）
- 自定义 SVG 图标（AgentOpsIcon / DatabaseIcon）

---

## 六、知识规则模块

### 6.1 UI 优化 ✅ 已完成
- 区块标题统一左侧蓝色竖条装饰样式
- 搜索框统一规范（width 360px, height 34px, borderRadius 17）
- PillTag 分类筛选样式统一（padding 4px 12px, borderRadius 20）
- DocTable 底部栏重构（数据计数 + 导出 + 分页，space-between 布局）
- CoverageTreemap / TopKnowledgeList 支持可选 data prop 覆写

### 6.2 数据卡片 ✅ 已优化
- SectionHeader 数值统一橙色 #f59e0b
- 理赔影像数据分类调整（17 种医疗文档分类）

---

## 七、全局样式

### 7.1 已优化项 ✅
- Tabs 去除灰色底边
- 侧边栏选中态统一（bg #b3d1f7, color #1d2129）
- 菜单项统一 36px 高度
- Pagination 全局字号 12px + 尺寸选择器样式
- Filter select 统一样式（height 32px, borderRadius 6px）
- Input placeholder 颜色统一 #00000073
- pulse 动画预留状态指示器使用

---

## 八、待开发模块清单

| 模块 | 路由 | 状态 |
|------|------|------|
| MCP 服务 | `/skills/mcp` | PagePlaceholder stub |
| 核保指标 | `/business/underwriting/metrics` | Stub |
| 反欺诈指标 | `/business/anti-fraud/metrics` | Stub |
| 理赔运营-概览 | `/agent/claims/overview` | PagePlaceholder stub |
| 理赔运营-错例分析 | `/agent/claims/case-analysis` | PagePlaceholder stub |
| 核保运营（3 页） | `/agent/underwriting/*` | PagePlaceholder stub |
| 反欺诈运营（3 页） | `/agent/anti-fraud/*` | PagePlaceholder stub |
| 异常告警 | `/platform/alert` | 待开发 |
| 权限控制 | `/platform/permission` | 待开发 |
| 用户管理 | `/platform/user` | 待开发 |

---

## 九、已知技术债

1. **SmartServices 组件无外部消费**：AutomationRateChart / CaseProcessingChart / SmartAgentCard 仅组件内部自引用，无路由页面引用
2. **Dashboard 路由为 stub**：`/dashboard` 渲染 null，子组件已被其他页面消费
3. **旧 Agent 组件残留**：AgentClaims / AgentUnderwriting / AgentAntiFraud 不再被路由引用但仍存在于磁盘
4. **Mock 数据先行**：未接入真实 API，全部使用 mock-data.ts

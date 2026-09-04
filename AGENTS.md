# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

<!-- AUTO-MANAGED: project-description -->
## Overview

**两核智能体运营平台 (DualCore AI Ops Platform)** — 保险理赔与核保统一智能体运营平台前端。

核心能力：
- 智能体监控与管理
- 作业流程监控
- 模型与数据全生命周期管理
- 知识管理与规则覆盖分析

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: build-commands -->
## Build & Development Commands

Build configuration: `vite.config.ts` (port 3022, auto-open browser on dev start, `base: '/'`).

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (Vite, http://localhost:3022, 自动打开浏览器)
npm run build        # 类型检查 + 构建生产版本 (tsc -b && vite build)
npm run preview      # 预览构建结果
```

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: deployment -->
## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`):
- **Trigger**: push to `v3` branch, or manual `workflow_dispatch`
- **Build**: Node.js 20, `npm ci` + `npm run build`, uploads `./dist` as artifact
- **Deploy**: deploys to GitHub Pages via `actions/deploy-pages@v4`
- **Concurrency**: single `pages` group, no cancel-in-progress
- **Permissions**: `contents: read`, `pages: write`, `id-token: write`

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: architecture -->
## Architecture

```
src/
├── main.tsx                     # 入口文件
├── App.tsx                      # 路由配置 (React Router 6)
├── index.css                    # 全局样式重置 + Ant Design 主题覆盖
├── layouts/
│   ── MainLayout.tsx           # 主布局（侧边栏 + 用户设置 Popover）
── pages/
│   ├── business/                # 业务应用
│   │   ── overview/            # 业务全景概览（浅色主题大屏）
│   ├── metrics/                 # 指标中心
│   │   ├── claims/              # 理赔指标（独立实现）
│   │   ├── underwriting/        # 核保指标（stub）
│   │   └── anti-fraud/          # 反欺诈指标（stub）
│   ├── agent/                   # Agent 运营
│   │   └── claims/              # 理赔运营
│   │       ├── logs.tsx         # 扣费日志清单
│   │       ├── deduction-log-detail.tsx  # 扣费日志详情（决策链可视化）
│   │       └── deduction-log-detail-data.ts  # 详情页数据模型与 mock
│   ├── shared/                  # 共享中心
│   │   ├── skills/              # Skills 市场
│   │   └── skill-detail/        # Skill 详情页
│   ── data-share/              # 数据共享
│       └── data-assets/         # 数据资产页面
── assets/                      # 静态资源
├── components/                  # 公共组件
│   └── dashboard/               # Dashboard 组件
│       └── data-assets/         # 数据资产相关组件
│           ├── classification-overview.tsx  # 分类总览（理赔智能体数据 + 数据服务排行）
│           └── data-overview.tsx            # 数据总览树状可视化
│   └── shared/                  # 共享组件
│       └── data-card.tsx        # 数据卡片组件（SectionHeader + DataCard）
── services/                    # API 服务层
── store/                       # Zustand 状态管理
── hooks/                       # 自定义 Hooks
└── utils/                       # 工具函数
```

**已实现页面路由**：
- `/` → 重定向至 `/business/overview`
- `/business/overview` — 业务全景概览（浅色主题大屏，3 列 flex 布局）
- `/business/claims/metrics` — 理赔指标（10 项指标 + 案件清单 + 流程轨迹图）
- `/agent/claims/logs` — 扣费日志清单
- `/agent/claims/deduction-log-detail?taskId=&caseNo=` — 扣费日志详情（三 Tab：扣费项目展示/引擎结果/LIC 系统响应）
- `/skills/market` — Skills 市场（我的 Skills + 公共 Skills）
- `/skills/skill/:name/:version?` — Skill 详情页（支持版本历史查看/编辑）
- `/data-share/data-assets` — 数据资产
- `/data-share/knowledge-rules` — 知识&规则

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: conventions -->
## Code Conventions

- **文件/目录**：kebab-case
- **组件**：PascalCase
- **函数/变量**：camelCase
- **常量**：UPPER_SNAKE_CASE
- **类型/接口**：PascalCase，接口以 `I` 前缀（如 `IDashboardData`）
- **导入**：ES6 模块，按 React → 第三方库 → 本地模块排序
- **缩进**：2 空格，TypeScript strict mode

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: patterns -->
## Detected Patterns

### 布局与路由

- **MainLayout 三段式 Sider**：标题区（64px）+ 菜单区（flex:1）+ 底部用户区（账号展示 + 退出按钮）。菜单项在 MainLayout.tsx 内硬编码，选中态基于 `location.pathname`。
- **布局包裹路由**：MainLayout 作为 shell，子路由渲染在其 `<Outlet />` 内。
- **路由参数监听滚动复位**：useEffect 监听 [taskNo, caseNo] 依赖，同时调用 `.ant-layout-content` 的 scrollTo 和 window.scrollTo。
- **登录集成**：使用 `Auth.getAccount()` / `Auth.logout()` 管理登录态，退出时跳转 `/login`。

### 决策链组件架构（deduction-log-detail）

- **核心组件**：ChainNodeCard（宽度 340px, borderRadius 12）+ Connector（高度 28px 蓝色竖线 + ▼箭头）+ EndPoint（圆角胶囊）
- **状态映射**：statusMeta 函数（skip=灰色/pass=绿色/hit=橙色），子节点用 subNodeStatusMeta
- **弹窗管理**：全局 popupCloseCallbacks Set 实现点击外部关闭，支持主弹窗和子节点弹窗双层独立显示
- **6 个表格组件**：StandardizeTable/DeductTable/RuleTable/ClauseTable/RiskTable/OutputTable，通过 popupContent prop 传入，popupWidth 控制宽度（默认 300px）
- **数据模型**：FeeItem 含 `no` 字段（1001~1013），同项目 6 个模块共享相同序号

### 业务全景概览（/business/overview）

- **浅色主题**：bg #fff, blue #3b82f6 主色调，无页面滚动
- **3 列 flex 布局**：左列 flex:1（地区案件统计 + 实时案件流）、中列 flex:1.8（全国地图）、右列 flex:1（数据资产 + 知识排行）
- **cardStyle**：`background: '#fff'`, `border: '1px solid #e5e7eb'`, `boxShadow: '0 1px 3px rgba(0,0,0,0.05)'`, `borderRadius: 12`
- **sectionLabel**：4px 宽 × 18px 高蓝色竖条，borderRadius 10, marginRight 10

### 指标与案件清单（/business/claims/metrics）

- **独立实现**：自有 METRICS_CLAIMS 10 项硬编码指标 + MetricCard inline + CaseProcessingChart + FlowTrajectoryGraph SVG 流程轨迹图
- **FlowTrajectoryGraph**：7 固定节点线性 SVG，`generateFlowTrajectory(caseNo, status)` 动态生成，NODE_PROCESSING_TIMES 提供每节点时长
- **列级过滤**：7 个 Ant Design Input 输入框（allowClear）+ 重置按钮，.includes() 模糊匹配
- **自定义底部栏**：数据计数 + 导出按钮 + Pagination（showSizeChanger + showQuickJumper）

### 知识库文档浏览/编辑（knowledge-base-cards）

- **双类型支持**：WordDocumentViewer（自动分级标题/列表）+ SpreadsheetViewer（可编辑表格）
- **理赔/核保差异化**：buildColumns(tab, onPreview, onEdit) 按 tab 返回不同列数组，理赔 10 列/核保 6 列
- **分类筛选**：PillTag 组件（padding 4px 12px, borderRadius 20），「全部」标签默认选中

### Skills 市场与详情

- **市场页面**：我的 Skills（MySkillCard + 编辑/发布）+ 公共 Skills（分类过滤/搜索/分页，LOAD_COUNT=9）
- **点赞管理**：组件级 Set<string> 集中管理（likedSkills + toggleLike）
- **SkillDetail**：skillContentMap 动态内容架构（14 个技能 mock 数据），支持版本历史查看/内联编辑/回滚
- **编辑功能**：isEditing 状态控制，所有章节边框蓝色 2px 高亮，支持 overview/features/versions/skillMd/apis/errors 实时编辑

### 全局样式覆盖（index.css）

- **菜单层级**：Level 1/2/3 不同背景色/左内边距/纵向间距（margin-block: 4px）
- **Pagination**：全局字号 12px，尺寸选择器 height 24px，自定义 SVG 下箭头
- **Filter select**：height 32px, borderRadius 6px，选中项蓝色 #1677ff + font-weight 600

### 侧边栏菜单内联

菜单项在 MainLayout.tsx 内硬编码为 menuItems 数组（MenuProps['items']），五组：
- **业务应用**（4 项）：全景概览/理赔指标/核保指标/反欺诈指标
- **Agent 运营**（3 级嵌套，理赔/核保/反欺诈各 3 项共 9 项）
- **技能中心**（2 项）：Skills 集市/MCP 服务
- **数据共享**（2 项）：数据资产/知识&规则
- **平台管理**（2 项）：用户管理/异常告警

### 数据资产仪表盘组件（data-assets）

- **ClassificationOverview**：数据资产分类总览页，包含三大区块：数据总览树状可视化、数据服务 TOP6 排行、理赔智能体数据（9 类卡片网格布局）。导入 DataOverview 组件。
- **DataOverview**：影像数据树状结构可视化。顶部根节点（影像数据总量）、中间层（影像类别 + 涉案数量）、底层（4 个子分类卡片），使用 SVG 贝塞尔曲线连接各层级，带实时数据增长模拟。
- **DataServiceList**：数据服务排行榜，展示 TOP6 服务累计调用次数与今日增量，TOP1-3 橙色进度条、TOP4-6 浅蓝色进度条，每 10 秒自动更新计数。
- **AgentDataCard**：理赔智能体数据卡片，9 类数据描述（案件核心/账单费用/就医医疗/支付领款/流程处理/规则风控/影像材料/主数据维度/调查任务），白色圆角卡片布局。
- **SectionHeader / DataCard**：共享数据卡片组件。SectionHeader 显示标题 + 累计数据量 + 活跃度；DataCard 渲染分类表格含日/周/月统计。

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: git-insights -->
## Git Insights

<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: best-practices -->
## Best Practices

- 保持 AGENTS.md 简洁，聚焦可执行的指导
- 子目录 AGENTS.md 继承根文件内容，补充模块级上下文
- 使用 AUTO-MANAGED 标记需要自动更新的章节
- MANUAL 章节保留人工笔记，永不自动修改

<!-- END AUTO-MANAGED -->

<!-- MANUAL -->
## 更新日志

- 2026-06-02: 项目初始化
- 2026-06-08: 菜单重构为 3 级嵌套，共享中心拆分为技能中心 + 数据共享，路由前缀 /shared/ → /skills/ + /data-share/
- 2026-06-15: Skills 发布弹窗增强（保存草稿/提交审核三按钮），SkillDetail 编辑功能增强（版本历史右侧独立栏 + 回滚）
- 2026-06-15: /business/overview 从深色主题迁移为浅色主题，3 列 flex 布局
- 2026-07-06: 扣费日志详情页优化 — 右侧去掉"扣费金额"，"金额"改名"总金额"
- 2026-07-07: 决策链 6 个模块弹窗改为结构化字段展示，统一 300px 宽度，字段名加粗值不加粗；每个项目分配唯一序号（1001~1013），同项目模块共享序号
- 2026-07-31: MainLayout 简化用户设置区为账号展示 + 退出按钮（移除 Popover），集成登录态管理（Auth.getAccount/logout），平台名称更新为"两核智能运营平台"；菜单项调整为 2 项（用户管理/异常告警）；新增登录页组件

<!-- END MANUAL -->

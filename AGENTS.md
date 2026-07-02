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
│   └── MainLayout.tsx           # 主布局（侧边栏 + 用户设置Popover，无 Header Tab）
├── pages/
│   ├── dashboard/               # 总览仪表盘（stub，子组件已被其他页面消费）
│   │   ├── index.tsx
│   │   ├── data/
│   │   │   └── mock-data.ts     # Mock 数据（smartAgents/underwritingAgents/antifraudAgents/知识库/侧边栏菜单）
│   │   └── components/
│   │       ├── data-assets/     # 数据资产模块
│   │       │   ├── index.tsx
│   │       │   ├── classification-overview.tsx  # 分类概览（5类数据：病历类/票据类/费用结算类/辅助证明类/申请类，三列等高布局）
│   │       │   └── core-source-treemap.tsx      # 核心来源树图
│   │       ├── knowledge-rules/ # 知识规则模块
│   │       │   ├── index.tsx
│   │       │   ├── knowledge-base-cards.tsx   # 知识库卡片（activeTab prop 驱动，文档浏览/编辑）
│   │       │   ├── coverage-treemap.tsx       # 覆盖场景树图（ECharts treemap，可选 data prop，默认理赔数据）
│   │       │   └── top-knowledge-list.tsx     # 高频调用知识列表（进度条排名，可选 data prop，默认理赔数据）
│   │       ├── smart-services/  # 智能服务模块（SmartServices 接受可选 agents prop，渲染 SmartAgentCard 网格 + AutomationRateChart + CaseProcessingChart 双图表；含 MetricCard、SmartAgentCard 子组件；**当前无外部页面消费**，仅组件内部自引用。MetricsUnderwriting/MetricsAntiFraud/Agent运营页面均已简化为 stub）。CaseProcessingChart：6 项指标选择器（tokens/处理案件数/服务调用数/成功率/平均时长/自动化率）+ 粒度切换（按天/周/月，自定义下拉按钮 32px 高）+ DatePicker.RangePicker + 种子随机 mock 数据矩阵 + ECharts 多折线图 432px 高 + 5 智能体折线）
│   │       ├── shared/          # 共享组件
│   │       └── tab-container/   # Tab 容器（stub，渲染 null）
│   ├── business/                 # 业务应用
│   │   ├── overview/             # 业务全景概览（浅色主题大屏，5 大板块一屏展示无滚动）
│   │   │   ├── index.tsx         # 主入口：DashboardHeader + 3 列 flex 布局（左列 flex:1: 地区案件统计+实时案件流，中列 flex:1.8: 全国案件热力分布满高，右列 flex:1: 数据资产总览+知识调用排行），白色 bg #fff，蓝色 #3b82f6 主色调
│   │   │   └── components/
│   │   │       ├── ChinaMapPanel.tsx     # ECharts 中国地图（32 省会城市 scatter + effectScatter + 缩放控制）
│   │   │       ├── CityStatsTable.tsx    # 地区案件统计（可排序表格：城市/案件总数/已完成/解决率 + 合计行）
│   │   │       └── ScrollingCases.tsx    # 实时案件流（自动滚动 + 每 2s 新案件生成，requestAnimationFrame 滚动）
│   ├── metrics/                  # 指标中心（已实现）
│   │   ├── overview/             # 指标概览（简化为 MetricsClaims 的 card 包装器）
│   │   │   └── index.tsx
│   │   ├── claims/               # 理赔指标页面（独立实现：10 项 METRICS_CLAIMS 硬编码指标 + MetricCard inline + CaseProcessingChart + 案件清单 Table（20 MOCK_CASES + 7 列 + 状态 Tag 三色映射），支持展开行渲染 FlowTrajectoryGraph SVG 流程轨迹图。流程轨迹通过 `generateFlowTrajectory(caseNo, status)` 动态生成：completed=全部 7 节点绿色实心 ✓，processing=前 N 节点完成+其余灰色空心 ·（N 由 caseNo 末两位%5+1 决定），exception=前 N 节点完成+1 个红色 ✗ 异常节点+其余灰色空心（N 由 caseNo 末两位%3+2 决定）。不使用 SmartServices）
│   │   │   └── index.tsx
│   │   ├── underwriting/         # 核保指标页面（stub，页面开发中）
│   │   │   └── index.tsx
│   │   └── anti-fraud/           # 反欺诈指标页面（stub，页面开发中）
│   │       └── index.tsx
│   └── shared/                  # 共享中心（已实现）
│       ├── skills/              # Skills市场页面（已实现，最佳实践轮播已隐藏 + 我的Skills + 公共Skills分类过滤/搜索/分页加载 + 发布新Skill弹窗表单）
│       │   └── index.tsx
│       ├── skill-detail/        # Skill详情页（MainLayout 子路由，带侧边栏）
│       │   └── index.tsx
│       ├── knowledge-rules/     # 知识&规则页面（claims/underwriting tab 切换 + KnowledgeBaseCards/CoverageTreemap/TopKnowledgeList）
│       │   └── index.tsx
│       └── data-assets/         # 数据资产页面（claims/underwriting tab 切换 + ClassificationOverview）
│           └── index.tsx
├── assets/                      # 静态资源
├── components/                  # 公共组件
├── services/                    # API 服务层
├── store/                       # Zustand 状态管理
├── hooks/                       # 自定义 Hooks
├── utils/                       # 工具函数
└── types/                       # TypeScript 类型定义
```

数据流：Mock 数据 → MetricsClaims 独立实现（10 项 METRICS_CLAIMS 硬编码指标 + MetricCard inline + CaseProcessingChart + FlowTrajectoryGraph SVG 流程轨迹图（`generateFlowTrajectory(caseNo, status)` 动态生成，非静态 map）+ 案件清单 Table 带 Select 列级过滤/分页/自定义底部栏（MOCK_CASES 20 条），仅 claims metrics 页面使用）。**SmartServices 组件（含 AutomationRateChart、CaseProcessingChart）当前仅被 SmartServices 自身内部引用，无外部页面消费**。MetricsUnderwriting 和 MetricsAntiFraud 已简化为 stub。
路由：MainLayout 包裹子路由，根路径 `/` 重定向至 `/business/overview`；`/skills/skill/:name` 作为 MainLayout 子路由（SkillDetail），带侧边栏

已实现页面：
- `/` → 重定向至 `/business/overview`
- `/dashboard` — 路由占位（stub，渲染 null）。其子组件（pages/dashboard/components/）已被其他页面消费：SmartServices → 无外部页面消费（仅 SmartServices 自身内部引用），ClassificationOverview → shared/data-assets，KnowledgeBaseCards/CoverageTreemap/TopKnowledgeList → shared/knowledge-rules。
- `/business/overview` — 业务全景概览（BusinessOverview），浅色主题全景大屏（bg `#fff`，blue `#3b82f6` 主色调）。整体容器：`height: 100%`, flex column, 白色背景, borderRadius 16, border `1px solid #e5e7eb`, boxShadow `0 1px 3px rgba(0,0,0,0.05)`，无页面滚动。**5 大板块一屏 3 列 flex 分割展示**：
  - **3 列布局**：
    - **左列**（flex:1）：地区案件统计（上）+ 实时案件流（下），各 flex:1 均分
    - **中列**（flex:1.8）：全国案件热力分布（ChinaMapPanel，ECharts 中国地图，满高）
    - **右列**（flex:1）：数据资产总览（上，flex:1）+ 知识调用排行（下，flex:1）
  - **板块 1 数据资产总览**（DataAssetsSection，flex:1）：理赔/核保 tab 切换，5 类卡片（病历类/票据类/费用结算类/辅助证明类/申请类），每项展示总量（blue #3b82f6）+ 使用量（green #52c41a），**2 列 grid 布局**（含奇数项处理）。
  - **板块 2 全国案件热力分布**（ChinaMapPanel，中列满高）：ECharts 中国地图（32 省会城市 scatter + 高案量城市 effectScatter 涟漪 + 缩放控制），浅色主题：areaColor `#f3f4f6`, borderColor `#d1d5db`, emphasis areaColor `#dbeafe`, borderColor `#3b82f6`，tooltip 白色 bg 深色文字。
  - **板块 3 地区案件统计**（CityStatsTable，左列上）：可排序表格（城市/案件总数/已完成/解决率），支持多列排序切换，底部合计行，解决率彩色 badge（>=95% 绿，>=90% 蓝，>=85% 琥珀，<85% 红）。浅色主题：header row bg `#f9fafb`, data rows 交替 `#fff`/`#fafbfc`, hover `#f0f7ff`, borders `#e5e7eb`。
  - **板块 4 实时案件流**（ScrollingCases，左列下）：自动滚动案件列表（案件编号/城市/场景/处理智能体/状态/金额），每 2s 生成新案件，requestAnimationFrame 平滑滚动，顶部绿点 pulse 动画状态指示。浅色主题：header row bg `#f9fafb`, data rows `#fff`, hover `#f0f7ff`, borders `#f3f4f6`, status default blue `#3b82f6`。
  - **板块 5 知识调用排行**（KnowledgeSection，右列下）：从 mock-data 的 claimsKnowledge/underwritingKnowledge 提取 Top 10 + category，**理赔/核保 tab 切换**，每行含排名徽章（前 3 名 orange #ea580c 高亮）+ 文档名称 + 彩色分类标签 pill + 调用次数。
  - **DashboardHeader**：顶部标题栏，白色 bg + 蓝色（#3b82f6）左右装饰竖条 + "两核智能体 · 业务全景大屏"（fontSize 18）。
  - **sectionLabel** 装饰：4px 宽 × 18px 高蓝色（#3b82f6）竖条，borderRadius 10, marginRight 10，文字 fontSize 16 fontWeight 700。
  - **cardStyle**：`background: '#fff'`, `border: '1px solid #e5e7eb'`, `boxShadow: '0 1px 3px rgba(0,0,0,0.05)'`, `borderRadius: 12`。
  - **已移除**：深色主题（gradient #0a0e27, cyan #00d4ff）、深色常量（BG/CYAN/TEXT/TEXT_DIM/BORDER/CARD_BG）、cyan glow 装饰、4 列 grid 布局（DataAssetsSection 改为 2 列）。
- `/business/claims/metrics` — 理赔指标页面（独立实现：自有 METRICS_CLAIMS 硬编码 10 项指标 + MetricCard 渲染（flex 布局 gap 12）+ CaseProcessingChart（全宽 Col span=24）+ 案件清单 Table（MOCK_CASES 20 条，7 列：案件号/索赔号/分公司/出险日期/索赔日期/当前所处节点/状态 Tag 三色映射 processing/completed/exception），不使用 SmartServices 组件）。**案件列表支持展开行**：点击案件号可展开/收起，渲染 `FlowTrajectoryGraph` SVG 流程轨迹图。流程轨迹通过 `generateFlowTrajectory(caseNo, status)` 动态生成（非静态 map）：completed 状态=全部 7 节点 completed（绿色实心 ✓）；processing 状态=前 N 节点 completed + 其余 processing（灰色空心 ·），N 由 `caseNo` 末两位 `%5+1` 决定（1~5）；exception 状态=前 N 节点 completed + 1 个 exception 节点（红色 ✗）+ 其余 processing（灰色空心），N 由 `caseNo` 末两位 `%3+2` 决定（2~4）。`expandedRowRender` 实时调用 `generateFlowTrajectory`，无 fallback "暂无流程轨迹数据" 容器。**列级过滤**：7 个 Ant Design `<Input>` 输入框（`allowClear` + placeholder，宽度 100-140px 不等）+ "重置" `<Button>`，filter 逻辑为 `.includes()` 模糊匹配（非精确匹配），useState 管理各 filter state（类型 `string`，默认 `''`），useMemo 计算 filteredData + slice 实现 pagedData。**自定义底部栏**：左侧数据计数（"共 N 条数据"）+ 导出按钮（蓝色按钮，SVG 下载图标）+ 右侧 Pagination（showSizeChanger + showQuickJumper，pageSizeOptions ['10','20','50']）。expandIconColumnIndex: -1 隐藏默认展开图标，案件号文字为蓝色下划线可点击样式。Table rowKey 使用 `caseNo`。
- `/business/underwriting/metrics` — 核保指标页面（stub，"页面开发中"）
- `/business/anti-fraud/metrics` — 反欺诈指标页面（stub，"页面开发中"）
- `/business/claims/cases`、`/business/underwriting/cases`、`/business/anti-fraud/cases` — 已删除（BusinessCases 组件及 cases 目录已移除）
- `/agent/claims/overview`、`/agent/claims/case-analysis` — 理赔运营页面（PagePlaceholder stub，"页面开发中"）
- `/agent/claims/logs` — 扣费日志清单（DeductionLogList，Table + 7 列：任务号/案件号/账单号/医院/患者/执行状态/响应时间，STATUS_MAP 三色 Tag：success=绿色/completed=蓝色/failed=红色，点击行跳转至 `/agent/claims/deduction-log-detail?taskId={taskNo}&caseNo={caseNo}`）。**扣费日志详情页**（DeductionLogDetail，三Tab结构：扣费项目展示/引擎结果/LIC系统响应）：左侧分类筛选栏（288px宽，支持不合理类型/全部项目双模式切换，不合理类型按康复治疗/营养补充类/中草药/乙类传染病4类分组展示共13项，全部项目平铺13项）+ 右侧内容区。**扣费项目展示Tab**：顶部导航含返回按钮/任务号/案件号/账单号/账单金额/扣费合计，选中项目卡片展示单价/数量/金额/扣费金额，决策链可视化（7节点SVG流程图：开始→医保剔费-项目标化模块→医保剔费-项目剔费模块→商保控费-规则知识判定模块→商保控费-条款知识判定模块→风控模块→输出标化模块→结束，节点含图标/标题/副标题/状态徽章，规则模块含3个子节点可点击查看详情，共享状态侧节点固定右侧展示记忆读写机制）。**引擎结果Tab**：Table展示13条扣费项目判定结果汇总（7列：费用项目/不合理类型/金额/扣费金额/判定结果/扣费依据），自定义底部栏含数据计数+导出按钮+Pagination。**LIC系统响应Tab**：回写状态徽章（success=绿色"回写成功"/failed=红色"回写失败"/processing=蓝色"处理中"/timeout=琥珀色"请求超时"）+ 响应时间 + 复制JSON按钮，渲染LIC payload（taskNo/caseNo/billNo/totalAmount/totalDeduct/items数组）。涉及文件：`src/pages/agent/claims/deduction-log-detail.tsx`, `src/pages/agent/claims/deduction-log-detail-data.ts`。
- `/agent/claims/task-detail` — 理赔案件任务详情页（AgentClaimsTaskDetail），支持三个Tab切换：影像展示（左侧分类筛选栏220px宽含分组信息/全部分类双Tab + 右侧图片网格自适应布局，CATEGORIES常量定义17种医疗文档分类如病案首页/居民身份证/费用清单等共104张图像）、引擎结果（JSON代码块+复制按钮，ENGINE_RESULT_JSON含imageRect/imageId/logId/imageTypeTotal/imageTypeDetail/imageAngle/imageQuality字段）、LIC系统响应（响应码绿色成功徽章+响应时间卡片+蓝色说明框）。路由参数 `caseNo` + `taskId`，浅色主题白色card容器（borderRadius 16, border 1px solid #f3f4f6, boxShadow, padding '14px 24px 34px'），顶部导航含返回按钮 + 分隔线 + 任务号/案件号展示（fontSize 16, fontWeight 600 for labels, 400 for values）。Tab切换采用底部border高亮（active: 2px solid #3b82f6）+ fontSize 16 fontWeight 600，hover时非激活tab变灰。分类列表选中态蓝色高亮（#65a5ff背景+白色文字+半透明白色count badge），未选中态透明背景+深灰文字+浅灰badge。图片网格使用CSS Grid（repeat(auto-fill, minmax(160px, 1fr)) gap 12），aspectRatio 3/4模拟模糊图像预览（linear-gradient + blur(1px)滤镜），首图2px蓝色边框标识。**影像标签系统**：右上角角标随机展示"重复"（橙色 #ff9800）/"切割"（蓝色 #3b82f6）/"矫正"（绿色 #22c55e），种子化伪随机 seededRandom(42) 保证刷新稳定，每张图0~2个标签。**预览大图增强**：弹窗 maxWidth 1300px，宽度从320px优化至500px。**切割红框**：标签含"切割"的影像，预览大图上叠加2~4个红色矩形框模拟切割效果（SVG rect + stroke #ef4444）。**矫正前后分类对比**：标签含"矫正"的影像，右侧面板展示矫正前（红底框）与矫正后（绿底框）的分类对比数据。**IMAGE_DETAIL_MOCK数据对齐**：从3条补全至25条，所有 subCategory 与侧边栏分类名严格一致，大类归属统一为病历材料/医疗材料/身份材料/检验报告/其他。涉及文件：`src/pages/agent/claims/task-detail.tsx`
- `/agent/claims/task-detail` — 理赔案件任务详情页（AgentClaimsTaskDetail），支持三个Tab切换：影像展示（左侧分类筛选栏220px宽含分组信息/全部分类双Tab + 右侧图片网格自适应布局，CATEGORIES常量定义17种医疗文档分类如病案首页/居民身份证/费用清单等共104张图像）、引擎结果（JSON代码块+复制按钮，ENGINE_RESULT_JSON含imageRect/imageId/logId/imageTypeTotal/imageTypeDetail/imageAngle/imageQuality字段）、LIC系统响应（响应码绿色成功徽章+响应时间卡片+蓝色说明框）。路由参数 `caseNo` + `taskId`，浅色主题白色card容器（borderRadius 16, border 1px solid #f3f4f6, boxShadow, padding '14px 24px 34px'），顶部导航含返回按钮 + 分隔线 + 任务号/案件号展示（fontSize 16, fontWeight 600 for labels, 400 for values）。Tab切换采用底部border高亮（active: 2px solid #3b82f6）+ fontSize 16 fontWeight 600，hover时非激活tab变灰。分类列表选中态蓝色高亮（#65a5ff背景+白色文字+半透明白色count badge），未选中态透明背景+深灰文字+浅灰badge。图片网格使用CSS Grid（repeat(auto-fill, minmax(160px, 1fr)) gap 12），aspectRatio 3/4模拟模糊图像预览（linear-gradient + blur(1px)滤镜），首图2px蓝色边框标识。**影像标签系统**：右上角角标随机展示"重复"（橙色 #ff9800）/"切割"（蓝色 #3b82f6）/"矫正"（绿色 #22c55e），种子化伪随机 seededRandom(42) 保证刷新稳定，每张图0~2个标签。**预览大图增强**：弹窗 maxWidth 1300px，宽度从320px优化至500px。**切割红框**：标签含"切割"的影像，预览大图上叠加2~4个红色矩形框模拟切割效果（SVG rect + stroke #ef4444）。**矫正前后分类对比**：标签含"矫正"的影像，右侧面板展示矫正前（红底框）与矫正后（绿底框）的分类对比数据。**IMAGE_DETAIL_MOCK数据对齐**：从3条补全至25条，所有 subCategory 与侧边栏分类名严格一致，大类归属统一为病历材料/医疗材料/身份材料/检验报告/其他。涉及文件：`src/pages/agent/claims/task-detail.tsx`
- `/agent/underwriting/overview`、`/agent/underwriting/logs`、`/agent/underwriting/case-analysis` — 核保运营页面（PagePlaceholder stub，"页面开发中"）
- `/agent/anti-fraud/overview`、`/agent/anti-fraud/logs`、`/agent/anti-fraud/case-analysis` — 反欺诈运营页面（PagePlaceholder stub，"页面开发中"）
- `/skills/market` — Skills市场（SharedSkillsMarket），三大区块：1) 最佳实践轮播（已隐藏）；2) 我的Skills（"发布新 Skill"按钮 + MySkillCard网格，名称可点击跳转详情 + 描述 + 版本号 + 底部"查看详情 >"链接）；3) 公共Skills（PublicSkillCard网格，无导航点击，底部版本号 + 点赞/更新时间，有分类过滤/关键词搜索/分页加载，LOAD_COUNT=9每批，底部"查看更多"按钮）。**发布新Skill弹窗**：点击"发布新 Skill"按钮触发固定定位模态框（position: fixed, zIndex 1000, 半透明黑色遮罩 background rgba(0,0,0,0.5)，白色内容区 borderRadius 16 maxWidth 700px maxHeight 85vh overflow auto padding 24）。表单字段包含：Skill名称（必填红色星号标记）、概述（textarea）、功能特性（动态数组输入项，支持添加/删除，每项带序号 + 输入框 + DeleteOutlined删除按钮）、分类标签（4个可选tag：OCR识别/数据采集/立案定责/核保评估，点击切换选中状态，选中态蓝色背景#eff6ff + 蓝色边框#3b82f6）、SKILL.md（大文本框 monospace字体）、API参考（动态数组，每项含接口名monospace字体/描述/返回字段三个输入框 + 删除按钮，底部"+ 添加接口"虚线按钮）、错误码（动态数组，每项含错误码monospace/描述/解决方案三个输入框 + 删除按钮，底部"+ 添加错误码"虚线按钮）。底部按钮组：左侧"取消"按钮（灰色边框）+ 右侧"发布"按钮（蓝色背景#3b82f6）。表单数据由NewSkillForm接口定义（name/overview/features/categories/skillMd/apis/errors/versions），useState管理showPublishModal/newSkill状态，handlePublish提交后清空表单并跳转至新Skill详情页，updateField辅助函数更新嵌套字段。发布成功后将新Skill写入skillContentMap并同步到allSkills/mySkills数组。涉及文件：`src/pages/shared/skills/index.tsx`
- `/skills/skill/:name` — Skill 详情页（SkillDetail，MainLayout 子路由，有侧边栏）。**顶部导航栏**：白色背景（与外层 card 一致），左侧"返回Skills集市" + 分隔线 + 技能名称，右侧 4 项锚点导航（概述/版本历史/SKILL.md/API参考），scroll-spy 高亮当前章节 + 点击平滑滚动。**内容章节**：概述（简介 + 单个分类标签：仅显示当前 skill 的 category，蓝色背景 #eff6ff + 蓝色边框 #3b82f6 + fontWeight 600，maxWidth '800px'）、版本历史表（版本/发布者/发布日期/更新内容）、SKILL.md（mock SKILL.md 文件示例，代码块格式，含 frontmatter/依赖/指令/输出格式/最佳实践/错误处理）、API参考（核心接口表 + 错误码表）。**导航顺序**：概述 → 版本历史 → SKILL.md → API参考。**所有代码块、表格、标签容器统一 `maxWidth: '800px'`**。**skillContentMap 动态内容架构**：页面使用 `Record<string, SkillContent>` 数据结构驱动，包含 **14 个独立技能 mock 数据**，按 **4 个分类**组织：**OCR识别 3 个**（票据OCR识别/医疗文档OCR识别/身份证OCR识别）、**数据采集 3 个**（网页数据采集/API数据同步/日志采集）、**立案定责 3 个**（理赔案件自动立案/理赔责任判定/理赔欺诈检测）、**核保评估 3 个**（健康告知评估/风险智能定价/体检报告解读）。通过 `useParams()` 读取 URL 的 `name` 参数，在 `skillContentMap` 中查找对应内容，fallback 为默认技能 '票据OCR识别'。每个技能包含：overview 描述、features 列表（3-4 项）、category 数组标签、publisher、versions 数组（2-3 条，v0.x 为内测版本、v1.x+ 为正式版本）、SKILL.md 示例、API 接口（3-4 个）、错误码（2-3 个）。**已移除**：适用/不适用场景卡片、安装配置章节、使用指南章节、相关技能推荐章节、SkillRecommendCard 组件、StarOutlined/ClockCircleOutlined 导入。**内联编辑功能**：页面支持对 overview/features/versions/skillMd/apis/errors 字段进行实时编辑。状态管理：`isEditing` boolean 控制编辑模式开关，`editContent` 本地副本保存未提交修改（默认 null，进入编辑时深拷贝原数据）。编辑/取消按钮位于导航栏下方：左侧"编辑"按钮（EditOutlined 图标，蓝色边框 #3b82f6，disabled 状态下灰色背景），右侧"取消"按钮（CloseOutlined 图标，灰色边框 #d9d9d9，非编辑状态 disabled）。所有章节容器在编辑模式下边框变为蓝色 2px 高亮（`border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8'`）。**概述章节编辑**：overview 使用多行 textarea（minHeight 80px, resize vertical），features 提供列表编辑器（每项带序号输入框 + DeleteOutlined 删除按钮 + 底部"添加功能"虚线按钮），分类标签改为多选数组（点击切换选中状态，选中态蓝色背景#eff6ff + 蓝色边框#3b82f6 + fontWeight 600，未选中态白色背景 + 灰色边框#d9d9d9）。**版本历史章编辑**：每项三个输入框（版本 monospace 字体 width 100px / 日期 width 130px / 更新内容 flex 1）+ DeleteOutlined 删除按钮，底部"添加版本"按钮自动生成新版本条目；渲染时自动按语义版本号排序（v0.x 内测版在前，v1.x+ 正式版在后，移除 v/V 前缀后按 major.minor.patch 数值比较）。**SKILL.md 章节编辑**：大型 textarea（minHeight 400px, monospace 字体, background #f9fafb）编辑 markdown 源码。**API参考和错误码编辑**：每项四个输入框（接口名 monospace width 180px / 描述 width 160px / 返回字段 monospace flex 1 或 错误码 width 140px / 描述 width 180px / 解决方案 flex 1）+ DeleteOutlined 删除按钮，底部"添加接口"/"添加错误码"按钮新增空条目。**提交发布按钮**：仅在编辑模式显示于页面底部左侧（蓝色背景#3b82f6，box-shadow，padding '8px 20px'），onClick 将 editContent 写回 skillContentMap[currentName] 并退出编辑模式。handleSubmit 函数执行浅拷贝合并，updateField 辅助函数处理嵌套字段更新。**删除功能**：导航栏右侧新增"删除"按钮（DeleteOutlined 图标，灰色边框 #374151，非编辑状态显示），点击触发固定定位确认弹窗（半透明黑色遮罩 + 白色对话框，显示"确定要删除「{currentName}」吗？此操作不可恢复。"，底部"取消"/"确认删除"按钮）。确认后从 skillContentMap/allSkills/mySkills 中移除该技能并跳转至 Skills 集市。涉及文件：`src/pages/shared/skill-detail/index.tsx`
- `/data-share/data-assets` — 共享数据资产，本地 claims/underwriting tab 切换，包裹 ClassificationOverview 组件
- `/data-share/knowledge-rules` — 知识&规则，本地 claims/underwriting tab 切换，渲染 KnowledgeBaseCards + CoverageTreemap + TopKnowledgeList；理赔模式使用默认 mock 数据，核保模式使用自定义核保数据

MainLayout 三段式 Sider 布局：
- 标题区（64px，底部边框）：项目名称「两核智能体运营平台」
- 菜单区（flex: 1）：Menu 组件，选中态基于 `location.pathname`；当路径以 `/skills/skill/` 开头时自动选中 `/skills/market` 并展开 `['skill-center']` 分组。菜单项在 MainLayout.tsx 内硬编码（非从 mock-data.ts 读取）。默认展开 `['business-app']` 分组。当前包含五组：
  - **业务应用**（4 项）：全景概览（`/business/overview`）、理赔指标看板（`/business/claims/metrics`）、核保指标看板（`/business/underwriting/metrics`）、反欺诈指标看板（`/business/anti-fraud/metrics`）
  - **Agent运营**（3级嵌套，理赔/核保/反欺诈各2项共6项）：
    - 理赔 → 日志清单（`/agent/claims/logs`）、错例分析（`/agent/claims/case-analysis`）
    - 核保 → 日志清单（`/agent/underwriting/logs`）、错例分析（`/agent/underwriting/case-analysis`）
    - 反欺诈 → 日志清单（`/agent/anti-fraud/logs`）、错例分析（`/agent/anti-fraud/case-analysis`）
  - **技能中心**（2 级扁平，2 项）：Skills集市（`/skills/market`）、MCP服务（`/skills/mcp`）
  - **数据共享**（2 级扁平，2 项）：数据资产（`/data-share/data-assets`）、知识&规则（`/data-share/knowledge-rules`）
  - **平台管理**（2 级扁平，3 项）：异常告警（`/platform/alert`）、权限控制（`/platform/permission`）、用户管理（`/platform/user`）
  - 图标组件直接内联于菜单项（AppstoreOutlined/AgentOpsIcon/BranchesOutlined/SettingOutlined）；"Agent运营"使用自定义 AgentOpsIcon 组件（SVG 分支图：左侧输入线 → 上折线+菱形 / 下折线+矩形，空心描边 currentColor）；"数据共享"使用自定义 DatabaseIcon 组件（SVG 圆柱分层堆叠，3层圆盘+深色顶盖）
- 底部用户区（Divider + Popover）：Avatar + 用户名「管理员」+ 齿轮图标，点击弹出自定义 Popover（`placement="topLeft"`，`arrow={false}`，`rootClassName="user-popover"`）。Popover 内容：顶部系统设置标题栏（浅灰底背景，SettingOutlined + 「系统设置」文字）、账号设置项（UserOutlined，TODO 待接入真实逻辑）、分割线、退出登录项（LogoutOutlined 红色，TODO 待接入）。用户区行和 Popover 菜单项均有 hover 背景变色交互（`transition: background 0.2s`，退出项 hover 为 `#fff1f0`）。

MainLayout Header：空占位（无 Tab 切换 UI，已移除理赔/核保双Tab及 ActiveTabContext）

MainLayout Content：`<Outlet />` 渲染子路由页面，margin: 4, padding: 20, 可滚动

待开发模块（App.tsx 中已有路由占位）：
- `shared/mcp` — MCP服务
- `platform/alert` — 异常告警
- `platform/permission` — 权限控制
- `platform/user` — 用户管理

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

- **业务域组件拆分模式**：按业务域（business/claims、business/underwriting、business/anti-fraud、agent/claims 等）分目录，每个域包含 metrics/ 子目录（业务应用）或独立 index.tsx（Agent运营）。Dashboard 组件（pages/dashboard/）路由在 `/dashboard`，当前为 stub（渲染 null），其子组件（ClassificationOverview 等）已被其他页面（shared/data-assets 等）消费。**SmartServices、AutomationRateChart、CaseProcessingChart 当前无外部页面消费**（MetricsClaims 独立实现，MetricsUnderwriting 和 MetricsAntiFraud 已简化为 stub）。`/business/overview` 使用浅色主题大屏架构（bg #fff, blue #3b82f6 主色调），3 列 flex 布局（左列 flex:1: 地区案件统计+实时案件流，中列 flex:1.8: 全国案件热力分布满高，右列 flex:1: 数据资产总览+知识调用排行），内联组件（DataAssetsSection/KnowledgeSection/DashboardHeader）与独立文件组件（ChinaMapPanel/CityStatsTable/ScrollingCases）共存于 components/ 子目录。DataAssetsSection 使用 2 列 grid 布局，KnowledgeSection 包含理赔/核保 tab 切换。
- **ClassificationOverview 三列布局模式**：src/pages/dashboard/components/data-assets/classification-overview.tsx 采用左右三列 flex 布局（gap 20，高度统一 550px）。第1列（flex: '1 1 0'）渲染病历类 DataCard（FIVE_CATEGORIES[0]，88200 份，8 个子项），第2列（flex: '1 1 0'）竖向排列票据类（42500 份，2 个子项）和费用结算类 DataCard（38000 份，3 个子项），使用 flexDirection: 'column', gap: 20；第3列（flex: '1 1 0'）竖向排列辅助证明类（55000 份，3 个子项）和申请类 DataCard（18000 份，1 个子项）。分类数据为 FIVE_CATEGORIES（5 类），标题 fontSize 为 18。涉及文件：classification-overview.tsx，被 shared/data-assets/index.tsx 和 dashboard/components/data-assets/index.tsx 引入。
- **业务域路由架构**：业务应用路由按 scene 隔离，`/business/{scene}/metrics` 路由渲染对应业务域的指标页面。案件清单模块（BusinessCases 组件及 `src/pages/business/cases/` 目录）已移除，相关路由（`/business/claims/cases`、`/business/underwriting/cases`、`/business/anti-fraud/cases`）已从 App.tsx 中删除。**指标看板页面架构已分化**：claims 页面独立实现（自有 METRICS_CLAIMS + MetricCard + CaseProcessingChart + FlowTrajectoryGraph SVG 流程轨迹图 + Ant Design Input 列级模糊筛选 + 自定义底部工具栏），underwriting/anti-fraud 页面已简化为 stub（"页面开发中"），不再复用 SmartServices 组件。三个业务域结构不再完全一致。
- **Agent运营页面**：`/agent/{claims,underwriting,anti-fraud}/{overview,logs,case-analysis}` 共 9 条路由，当前全部渲染为 `PagePlaceholder`（stub，"页面开发中"）。**AgentClaims/AgentUnderwriting/AgentAntiFraud 组件**（位于 `src/pages/agent/{claims,underwriting,anti-fraud}/index.tsx`）仍存在于磁盘但不再被任何路由导入或消费，包含 4 项统计卡片 + SmartAgentCard 网格 + Progress bars 模式的旧实现已废弃。**新增 `/agent/claims/task-detail` 路由**：理赔案件任务详情页（AgentClaimsTaskDetail），三Tab结构（影像展示/引擎结果/LIC系统响应），17种医疗文档分类，104张图像，动态分组切换，图像预览弹窗。**影像标签功能**：每张图右上角角标随机展示"重复"（橙）/"切割"（蓝）/"矫正"（绿），种子化伪随机保证刷新稳定。**预览大图优化**：弹窗宽度从320px增至500px，maxWidth 1300px。**切割红框模拟**：标签含"切割"的影像预览时叠加红色矩形框。**矫正前后对比**：标签含"矫正"的影像右侧面板展示矫正前（红底框）与矫正后（绿底框）分类对比。涉及文件：`src/pages/agent/claims/task-detail.tsx`。
- **简化版指标概览架构**：MetricsOverview 组件（src/pages/metrics/overview/index.tsx）已简化为 MetricsClaims 的 card 包装器（统一白色 card 容器：bg #fff, borderRadius 16, boxShadow, border, padding '14px 24px 34px'），直接渲染 `<MetricsClaims />`，不再维护 tab 状态。实际业务域隔离由 App.tsx 路由层面处理：`/business/claims/metrics`、`/business/underwriting/metrics`、`/business/anti-fraud/metrics` 各自独立渲染对应业务域的 Metrics 组件。三个 metrics 页面内容**不再一致**：claims 页面已独立实现（自有 METRICS_CLAIMS 10 项硬编码指标 + MetricCard inline 渲染 + CaseProcessingChart 全宽 + 案件清单 Table（MOCK_CASES 20 条，7 列：案件号/索赔号/分公司/出险日期/索赔日期/当前所处节点/状态，STATUS_MAP 三色 Tag：processing=processing/completed=success/exception=error），不使用 SmartServices）。**案件列表支持展开行**：点击案件号展开/收起 `FlowTrajectoryGraph` SVG 流程轨迹图（内联组件，通过 `generateFlowTrajectory(caseNo, status)` 动态生成流程数据：completed=全部 7 节点 completed 绿色实心 ✓，processing=前 N 节点 completed+其余 processing 灰色空心 ·（N 由 caseNo 末两位%5+1 决定），exception=前 N 节点 completed+1 个 exception 节点红色 ✗+其余 processing 灰色空心（N 由 caseNo 末两位%3+2 决定），无 fallback "暂无流程轨迹数据" 容器。7 个固定节点（开始/采集/立案/理算/扣费/审核/结束）线性排列，圆形节点 radius 14 + 直线连接，状态颜色 processing=#91caff/completed=#95de64/exception=#ff7875，SVG viewBox 动态计算 538x60，外层 bg #f9fafb borderRadius 8）。NODE_PROCESSING_TIMES` mock 数据（`Record<string, Record<string, number>>`，keyed by caseNo then nodeLabel）覆盖全部 20 条 MOCK_CASES 条目，每个案件 7 个节点各有不同时长（0.2s~4.8s），仅 completed 节点在标签文字中内联显示处理时长，格式 "Label (Ns)" 如 "采集 (2.3s)"，pending/exception 节点仅显示标签文字。`FlowTrajectoryGraph` 接受可选 `caseNo` prop 查 `NODE_PROCESSING_TIMES[caseNo][label]` 获取时长。**列级过滤**：7 个 Ant Design `<Input>` 输入框（`allowClear`，placeholder 标注字段名，宽度 100-140px 不等）+ "重置" `<Button>`，filter 逻辑为 `.includes()` 模糊匹配，useState 管理 filter state（类型 `string`，默认 `''`）+ useMemo 计算 filteredData + slice pagedData。**自定义底部栏**：左侧数据计数（"共 N 条数据"）+ 导出按钮（蓝色按钮，SVG 下载图标）+ 右侧 Pagination（showSizeChanger + showQuickJumper，pageSizeOptions ['10','20','50']）。**underwriting/anti-fraud 页面已简化为 stub**（"页面开发中"），不再使用 SmartServices 组件。Table rowKey 使用 `caseNo`。
- **MetricCard 指标卡片模式**：MetricCard 组件（src/pages/dashboard/components/smart-services/metric-card.tsx）接受 `{ label: string, value: string }` 通过 metric prop，白色卡片（borderRadius 10, border 1px solid #e8ecf0, padding '16px 0'），居中显示大数值（fontSize 22, fontWeight 700）和小标签（fontSize 14, color #1d2129）。数值颜色逻辑：百分比 >=90% 绿色 (#22c55e)，>=70% 琥珀色 (#f59e0b)，<70% 红色 (#ef4444)；非百分比统一蓝色 (#3b82f6)。
- **SmartServices 组件**：src/pages/dashboard/components/smart-services/index.tsx 接受可选 `agents?: SmartAgent[]` prop，渲染流程：标题栏（"智能服务" + 实时监控运行中状态徽章（绿点 + pulse 动画））→ SmartAgentCard 网格（Row gutter, Col span=4, agents 为空时不渲染）→ 双图表行（AutomationRateChart + CaseProcessingChart, Row gutter 16, Col span=12）。**当前无外部页面消费**（MetricsClaims 已不再使用 SmartServices，MetricsUnderwriting/MetricsAntiFraud 已简化为 stub，Agent运营页面也已废弃为 PagePlaceholder）。组件保留但未被任何路由页面引用。
- **SmartAgentCard 使用范围**：在旧 agent/ 页面组件（AgentClaims/AgentUnderwriting/AgentAntiFraud，已废弃不再被路由引用）和 SmartServices 组件内部使用。mock-data.ts 中的 agents 数据（smartAgents/underwritingAgents/antifraudAgents）**当前无页面消费**（MetricsUnderwriting 和 MetricsAntiFraud 已简化为 stub，Agent运营路由为 PagePlaceholder stub）。
- **Mock 数据先行**：当前阶段使用 src/pages/dashboard/data/mock-data.ts 提供模拟数据，未接入真实 API。该文件导出：智能体列表（`smartAgents` 理赔6个、`underwritingAgents` 核保6个、`antifraudAgents` 反欺诈6个，**不再被任何页面消费**）、自动化率趋势（`automationRateData`，14天数据）、案件处理统计（`caseProcessingData`）、数据资产（`unstructuredData`/`structuredData`，含影像/结构化记录分类）、数据源分布（`coreSourceData`，饼图数据）、核保知识库（`underwritingKnowledge`，4个分组：医学知识/核保标准/评点规则/操作规则）、理赔知识库（`claimsKnowledge`，5个分组：产品责任/立案规则/理算规则/免赔结算/风控审核）、保障场景分布（`coverageSceneData`）、热门知识（`topKnowledgeData`）。包含 TypeScript 接口定义（`SmartAgent`、`DataCategory`、`KnowledgeItem`、`KnowledgeGroup`）及辅助函数（`makeItem` 创建知识条目、`genId` 生成 doc-XXXX ID、`rndStatus` 随机状态、`generateDocContent` 生成模拟 Word 文档内容，内置6种保险条款模板如重疾定义、免责条款等）。**`KnowledgeItem` 接口扩展**：新增 `docType: 'doc' | 'sheet'`（区分文档类型）、`sheetData?: { headers: string[]; rows: string[][] }`（表格数据结构）、`history?: { time: string; author: string; action: string }[]`（操作历史数组）、`category: string`（知识分类，理赔填分组名如「产品责任」，核保留空）、`summary: string`（内容简述，≤20 字）、`createdAt: string`（创建时间，YYYY-MM-DD）、`creator: string`（创建人，约 60% 与 author 相同，其余从 7 人创作者池中按 name 哈希取值）。`makeItem` 函数改为 **variadic 签名**：按第 2 个参数类型区分两种调用——第 2 参为 string 时视为理赔调用 `makeItem(分类名, 文档名, count, d, w, m, author, date, version, docType?, sheetData?)`（内部会交换 name 与 category 的实际取值），第 2 参为 number 时视为核保调用 `makeItem(文档名, count, d, w, m, author, date, version, docType?, sheetData?)`。自动生成 history 数组（创建/编辑/发布三条记录），summary 从 5 套模板按 name 哈希选取，createdAt 在 updatedAt 基础上前推 30~180 天，creator 由 name 哈希决定。mock 数据中新增两个 sheet 类型条目：`重大疾病核保费率表`（核保知识库-医学知识分组，含疾病名称/基础费率/年龄加成/性别系数/吸烟加成/最终费率六列）和 `理赔案件时效统计表`（理赔知识库-产品责任分组，含案件类型/平均时效/最快时效/最慢时效/超时率/环比变化六列）。`sidebarMenuItems` 仍在此文件导出但 menuItems 配置已迁移至 MainLayout.tsx 内硬编码。
- **组件共置**：页面级组件的私有组件放在 `components/` 子目录下，通过 index.tsx barrel export
- **布局包裹路由**：MainLayout 作为 shell，子路由渲染在其 `<Outlet />` 内
- **Prop 驱动 Tab 模式**：KnowledgeBaseCards 通过 `activeTab` prop（`'claims' | 'underwriting'`）接收业务域参数，不维护本地 tab 状态。SharedKnowledgeRules / SharedDataAssets 页面在页面级维护本地 tab 状态（`useState<'claims' | 'underwriting'>`），通过 `isClaims` 布尔值控制子组件的数据源（理赔模式使用组件默认 mock 数据，核保模式传入自定义核保数据数组）。MetricsOverview 已简化为 MetricsClaims 的包装器，直接渲染 `<MetricsClaims />`，不再维护 tab 状态，业务域隔离由 App.tsx 路由层面处理。MainLayout 不再导出 ActiveTabContext（已移除）。
- **可选 data prop 覆写模式**：CoverageTreemap 和 TopKnowledgeList 接受可选 `data` prop（类型分别为 `CoverageSceneItem[]` 和 `TopKnowledgeItem[]`），不传时使用内置理赔默认数据，传入时使用外部数据。接口通过 `export interface` 导出，供调用方（SharedKnowledgeRules）构造核保数据。
- **侧边栏菜单内联**：菜单项配置在 MainLayout.tsx 内硬编码为 `menuItems` 数组（`MenuProps['items']`），不再从 mock-data.ts 读取。当前包含五组：业务应用（4 项：全景概览/理赔指标看板/核保指标看板/反欺诈指标看板）、Agent运营（3 级嵌套，理赔/核保/反欺诈各 3 项共 9 项：概览/日志清单/错例分析）、技能中心（2 项：Skills集市/MCP服务）、数据共享（2 项：数据资产/知识&规则）、平台管理（3 项：异常告警/权限控制/用户管理）。布局组件内通过 Ant Design 图标组件直接内联（AppstoreOutlined/BranchesOutlined/SettingOutlined/LogoutOutlined/UserOutlined）；"Agent运营"使用自定义 AgentOpsIcon 组件（SVG 分支图：左侧输入线 → 上折线+菱形 / 下折线+矩形，空心描边 currentColor）；"数据共享"使用自定义 DatabaseIcon 组件（SVG 圆柱分层堆叠，3层圆盘+深色顶盖，MainLayout.tsx 内联定义）。`defaultOpenKeys` 根据当前路径动态计算（`/business/*` → `['business-app']`，`/agent/claims/*` → `['agent-ops', 'agent-claims']`，`/agent/underwriting/*` → `['agent-ops', 'agent-underwriting']`，`/agent/anti-fraud/*` → `['agent-ops', 'agent-anti-fraud']`，`/skills/*` → `['skill-center']`，`/data-share/*` → `['data-share']`）。
- **全局样式覆盖**：src/index.css 是 Ant Design 主题定制的唯一入口，使用 `!important` 覆盖默认样式：Tabs 去除灰色底边（`.ant-tabs-nav::before`）、侧边栏选中态（`.ant-menu-light .ant-menu-item-selected`: bg `#b3d1f7`, color `#1d2129`）、菜单项统一 36px 高度（`.ant-menu-light .ant-menu-item` 和 `.ant-menu-light .ant-menu-submenu-title`: `height/line-height 36px, margin 0`）、选中态移除右边框（`::after { border-right: none }`）。侧边栏固定布局（`.ant-layout-sider` 禁止滚动，`.ant-layout-sider-children` flex 列布局 `height: 100%` 使底部用户区贴底）。用户 Popover 样式（`.user-popover .ant-popover-inner`）去除默认边框/阴影/内边距，背景透明，由内层 div 自行控制样式。`@keyframes pulse` 绿色 box-shadow 动画预留状态指示器使用。**菜单层级背景色、左内边距与纵向间距区分**（通过 Ant Design 原生选择器，非自定义 class）：Level 1（`.ant-menu-light > .ant-menu-item` / `> .ant-menu-submenu > .ant-menu-submenu-title`）：bg `#ffffff`, `padding-left: 10px`, color `#1d2129`, `margin-block: 4px`；Level 2（`.ant-menu-light .ant-menu-sub > .ant-menu-item` / `.ant-menu-sub > .ant-menu-submenu > .ant-menu-submenu-title`）：bg `#f3f4f6`, `padding-left: 24px`, color `#1d2129`, `margin-inline: 0`, `width: 100%`, `margin-block: 4px`；Level 3（`.ant-menu-light .ant-menu-sub .ant-menu-sub > .ant-menu-item`）：bg `#e5e7eb`, `padding-left: 36px`, color `#1d2129`, `margin: 0`。**子菜单间隙移除**（`.ant-menu-light .ant-menu-submenu-popup` padding 0, `.ant-menu-light .ant-menu-sub` padding/margin 0, `.ant-menu-light .ant-menu-submenu-title` marginBottom/borderRadius 0, `.ant-menu-light .ant-menu-submenu` margin/borderRadius 0, `.ant-menu-light .ant-menu-item` borderRadius 0）。**Pagination 尺寸选择器**（`.ant-pagination-options-size-changer .ant-select-selection-item` + `.ant-select-item-option-selected`）：选中项蓝色 #1677ff + font-weight 600，未选中项黑色 #000000 + font-weight 400。**Pagination 选择器外壳**（`.ant-pagination-options-size-changer .ant-select-selector`）：height 24px, font-size 12px。**Pagination 自定义下拉箭头**（`.ant-pagination-options-size-changer .ant-select-arrow`）：隐藏默认箭头（`font-size: 0`），替换为自定义 SVG 下箭头图标（12x12, stroke #94a3b8，通过 `::before` 伪元素内联 data URI）。**Pagination 全局字号**（`.ant-pagination .ant-pagination-item` / `.ant-pagination-prev` / `.ant-pagination-next` / `.ant-pagination-jump-prev` / `.ant-pagination-jump-next` + `.ant-pagination-options-quick-jumper input`）：统一 font-size 12px。**Filter select 样式**（`.filter-select`）：height 32px, font-size 14px, border-radius 6px，自定义 SVG 下箭头（同 Pagination），选中项蓝色 #1677ff + font-weight 600。用于 MetricsClaims 和 CaseProcessingChart 的下拉筛选器。**Input placeholder 颜色**（`.ant-input::placeholder`）：统一 #00000073。
- **知识库文档浏览/编辑模式**：knowledge-base-cards.tsx 实现完整的文档管理流，支持 Word 文档和 Excel 表格两种类型。`WordDocumentViewer` 组件模拟 Word 文档渲染，根据文本结构自动分级（章标题 → h2，条标题 → h3，列表项 → 缩进 bullet，数字序号 → 缩进编号），支持预览和编辑两种模式。`SpreadsheetViewer` 组件渲染表格数据（headers + rows），支持可编辑模式（input 单元格）和只读模式，带行号列和 sticky 表头。编辑模式下使用 Ant Design Form + TextArea/Input，预览模式为只读渲染。`OperationHistory` 组件展示文档操作审计轨迹（创建/编辑/发布）。`DocModal` 弹窗封装文档操作，使用 Tabs 切换内容（content/history），支持查看/编辑/保存完整流程，编辑后可更新本地列表状态。`DocTable` 使用 Ant Design Table + 自定义底部栏（space-between flex 布局，marginTop 16）。左侧：数据计数（"共 N 条数据"）+ 导出按钮；右侧：Pagination 组件。`pageSize` 使用 useState 管理（默认 10）支持动态切换。表格列根据 docType 显示不同图标（sheet → TableOutlined 绿色，doc → FileTextOutlined 蓝色）。**表格横向滚动**：DocTable 外层包裹 `<div className="table-scroll-wrapper"><div style={{ minWidth }}>`，理赔 minWidth=1280、核保 minWidth=900，容器不足宽度时显示横向滚动条（CSS 在 index.css 中定义：10px 高滚动条、#d9d9d9 滚动块、白色轨道、`overflow-x: scroll` 常驻显示）。**理赔/核保差异化表头**：`buildColumns(tab, onPreview, onEdit)` 按 tab 条件分支返回不同列数组。理赔 10 列（文档名称/知识分类/内容简述/创建时间/创建人/最新版本/更新时间/更新人/状态/操作），核保保持原 6 列（文档名称/版本/状态/知识提供方/最近更新/操作）。理赔 7 列数据单元格统一 `color: '#000000e0'`（通过 `CELL_COLOR` 常量），知识分类保留蓝色 Tag 样式，所有列左对齐。`activeTab` prop 从 KnowledgeBaseCards → KnowledgeSection → DocTable → buildColumns 逐层透传。**分类筛选增强**：`KnowledgeSection` 提供 `PillTag` 分类筛选 + 搜索框（width 360px, height 34px, borderRadius 17），标签 gap 为 12px，最前面固定一个「全部」标签（默认选中），选中「全部」时展示所有分组合并数据（`activeGroup === '全部' ? allItems : ...`）。搜索时仍跨全部分组过滤。**倒序排列**：`currentItems` 计算末尾追加 `.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))`，按更新时间由近到远排序，用扩展运算符 `[...filteredItems]` 避免改动原数组。`KnowledgeSection` 标题与分类筛选行之间间距为 marginTop: 10。`PillTag` 样式统一：padding `4px 12px`, borderRadius `20`, border `1px solid #bfdbfe`；选中态 bg `#eff6ff` + color `#3b82f6`。
- **Skills 市场页面架构**：SharedSkillsMarket 分为两大可见区块（最佳实践轮播已隐藏）。**我的 Skills 区**："发布新 Skill"按钮（位于卡片网格上方）+ MySkillCard 渲染个人 skill 卡片（名称可点击跳转 `/skills/skill/:name` + 描述 + 版本号 + 底部"查看详情 >"链接）。mySkills 数据为 allSkills 的子集，当前包含 '理赔案件自动立案'（立案定责, v2.3.0）和 '体检报告解读'（核保评估, v2.0.0），不再使用 '自定义' 类别的独立技能。**公共 Skills 区**：搜索框（width 360px, height 34px, borderRadius 17, border 1px solid #e5e7eb, 左侧 SVG 搜索图标 + "搜索全部 Skills" placeholder input）。分类标签行 + 搜索框在同一行（`justifyContent: 'spaceBetween'`，左侧标签行 gap 12，右侧搜索框），六个标签（全部、OCR识别、数据采集、立案定责、核保评估、我的收藏，padding `4px 12px`, fontSize 12, borderRadius 20, transition `all 0.2s ease`；默认"全部"高亮为 bg `#eff6ff` + 蓝色文字 `#3b82f6` + border `#bfdbfe` + fontWeight 500，其余为 border `#d9d9d9` + 黑色文字 `#000000e0` + fontWeight 400）。PublicSkillCard 无导航点击交互（名称/描述不可点击，无编辑/发布按钮，底部渲染版本号 + 点赞/更新时间）。**点赞状态集中管理**：点赞状态在 SharedSkillsMarket 组件级用 `Set<string>` 维护（`likedSkills` state），通过 `toggleLike(name)` 函数切换，MySkillCard/PublicSkillCard 通过 `liked` boolean prop 和 `onToggleLike` callback prop 接收状态。**分类过滤 + 关键词搜索 + 分页**：`allSkills` 数组定义 12 个技能（含 category 字段），通过 `activeCategory` 匹配（`'全部'` 显示所有，`'我的收藏'` 过滤 `likedSkills.has(skill.name)`，其余按 category 精确匹配）+ `searchKeyword` 模糊匹配（name + description）组合过滤。`LOAD_COUNT=9` 控制每批展示数量，分类切换/搜索时 reset displayCount，底部"查看更多"按钮加载更多（当 filteredSkills 超出 displayCount 时显示）。外层统一 Card 容器（white bg, borderRadius 16, boxShadow `0 1px 2px rgba(0,0,0,0.05)`, border `1px solid #f3f4f6`, padding `'14px 24px 34px'`），与 MetricsOverview/SharedDataAssets/SharedKnowledgeRules 一致。**最佳实践轮播（已隐藏）**：UseCaseCarousel 组件及最佳实践区块已被 JSX 注释隐藏（`{/* ... */}`），UseCaseCarousel 组件上加了 `@ts-ignore`，useCases 数据和 UseCaseCard 组件仍保留在代码中但不再渲染。**三个使用案例数据仍保留**：(1) 理赔案件自动化处理 — 组合票据OCR识别/理赔案件自动立案/理赔责任判定，解决人工理赔5-7工作日周期问题；(2) 智能核保风控体系 — 组合健康告知评估/体检报告解读/风险智能定价，解决核保审核耗时长和次标准体定价缺乏标准问题；(3) 理赔反欺诈联动检测 — 组合理赔欺诈检测/关联图谱分析/理赔责任判定，解决隐蔽欺诈和团伙欺诈识别问题。
- **区块标题统一样式**：所有区块标题（智能服务、分类与规模、核心来源分布、覆盖场景分布、高频调用知识&规则 Top 10、理赔知识库/核保知识库、最佳实践（已隐藏）、我的 Skills、公共 Skills）统一使用左侧蓝色竖条装饰 + 文字的行内 flex 布局。容器：`display: flex`, `alignItems: center`, 蓝色竖条（`width: 4`, `height: 20`, `background: #3b82f6`, `borderRadius: 10`, `marginRight: 10`），文字（`fontSize: 17`, `fontWeight: 700`, `color: #1f2937`）。`marginBottom` 按层级区分：页面级区块（"分类与规模"、"最佳实践"、"公共 Skills"）为 20，子组件区块（"核心来源分布"、"覆盖场景分布"、"高频调用知识&规则 Top 10"、"智能服务"、"理赔知识库/核保知识库"）为 16。"我的 Skills" 和 "公共 Skills" 标题行均使用 `marginTop: 0` 覆写基础值。**区块 wrapper 间距**："我的 Skills" 和 "公共 Skills" wrapper 均为 `marginTop: 30`，"最佳实践" wrapper 无 marginBottom。涉及文件：smart-services/index.tsx, classification-overview.tsx, core-source-treemap.tsx, coverage-treemap.tsx, knowledge-base-cards.tsx, top-knowledge-list.tsx, shared/skills/index.tsx。SmartServices 标题行右侧内联"实时监控运行中"状态徽章（绿色圆点 + pulse 动画 + 浅绿底标签，`marginLeft: 12`, `gap: 6`），已从 AutomationRateChart 和 CaseProcessingChart 组件迁移至父容器 smart-services/index.tsx 头部，不再在子图表组件中重复渲染。
- **SkillDetail 内置布局模式**：`/skills/skill/:name` 路由渲染 SkillDetail 组件，作为 MainLayout 子路由，自带侧边栏和主布局。页面使用纯 inline styles。通过 `useParams()` 读取 `name` 参数，`useNavigate()` 处理返回按钮跳转至 `/skills/market`。**skillContentMap 动态内容架构**：页面定义 `SkillContent` 接口（overview/features/category/publisher/versions/skillMd/apis/errors），使用 `Record<string, SkillContent>` 数据结构存储 14 个独立技能 mock 数据，按 4 个分类组织（OCR识别 3 个：票据OCR识别/医疗文档OCR识别/身份证OCR识别；数据采集 3 个：网页数据采集/API数据同步/日志采集；立案定责 3 个：理赔案件自动立案/理赔责任判定/理赔欺诈检测；核保评估 3 个：健康告知评估/风险智能定价/体检报告解读）。通过 URL 的 `name` 参数在 map 中查找内容，未匹配时 fallback 为 `defaultSkill`（'票据OCR识别'）。每个技能版本数组遵循版本号规范：v0.x 为内测/beta 版本，v1.x+ 为正式版本，每条含 version/publisher/date/changes。**顶部导航栏**：外层白色背景（与 card 一致），左侧"返回Skills集市"链接（`ArrowLeftOutlined`）+ 分隔线 + 技能名称，右侧 4 项锚点导航（概述/版本历史/SKILL.md/API参考），当前章节 scroll-spy 高亮（蓝色 `#3b82f6` + fontWeight 600），点击平滑滚动至对应 section。**内容章节**均渲染为独立 `<section>`（白色 card: borderRadius 12, padding 20, marginBottom 20, border `1px solid #e8e8e8`），顺序为：概述（简介 + 单个分类标签：仅显示当前 skill 的 category，高亮为 bg `#eff6ff` + border `#3b82f6` + fontWeight 600；**概述章节内部元素间距**：描述段落 `<p>` `marginTop: 12` 与 h2 标题分隔，ul 列表 `marginBottom: 10` 与下方分类标签分隔，列表元素直接堆叠）、版本历史表（版本/发布者/发布日期/更新内容）、SKILL.md（mock SKILL.md 文件示例，h2 标题"SKILL.md"，代码块格式，含 frontmatter/依赖/指令/输出格式/最佳实践/错误处理）、API参考（核心接口表 + 错误码表）。每个章节标题为 h2（fontSize 20, fontWeight 700, 底部边框分隔）。**导航顺序**：概述 → 版本历史 → SKILL.md → API参考（SKILL.md 第3，API参考最后）。**所有代码块、表格、标签容器统一 `maxWidth: '800px'`**。**Scroll-spy 实现**：`useEffect` 监听 `.ant-layout-content` 滚动事件，遍历 `sectionRefs` 找到当前可视区域的 section，更新 `activeSection` state。**已移除**：适用/不适用场景卡片、安装配置章节、使用指南章节、相关技能推荐章节、`SkillRecommendCard` 组件、`StarOutlined`/`ClockCircleOutlined` 导入。**内联编辑功能**：页面支持对 overview/features/versions/skillMd/apis/errors 字段进行实时编辑。状态管理：`isEditing` boolean 控制编辑模式开关，`editContent` 本地副本保存未提交修改（默认 null，进入编辑时深拷贝原数据）。编辑/取消按钮位于导航栏下方：左侧"编辑"按钮（EditOutlined 图标，蓝色边框 #3b82f6，disabled 状态下灰色背景），右侧"取消"按钮（CloseOutlined 图标，灰色边框 #d9d9d9，非编辑状态 disabled）。所有章节容器在编辑模式下边框变为蓝色 2px 高亮（`border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8'`）。**概述章节编辑**：overview 使用多行 textarea（minHeight 80px, resize vertical），features 提供列表编辑器（每项带序号输入框 + DeleteOutlined 删除按钮 + 底部"添加功能"虚线按钮），分类标签改为多选数组（点击切换选中状态，选中态蓝色背景#eff6ff + 蓝色边框#3b82f6 + fontWeight 600，未选中态白色背景 + 灰色边框#d9d9d9）。**版本历史章编辑**：每项三个输入框（版本 monospace 字体 width 100px / 日期 width 130px / 更新内容 flex 1）+ DeleteOutlined 删除按钮，底部"添加版本"按钮自动生成新版本条目；渲染时自动按语义版本号排序（v0.x 内测版在前，v1.x+ 正式版在后，移除 v/V 前缀后按 major.minor.patch 数值比较）。**SKILL.md 章节编辑**：大型 textarea（minHeight 400px, monospace 字体, background #f9fafb）编辑 markdown 源码。**API参考和错误码编辑**：每项四个输入框（接口名 monospace width 180px / 描述 width 160px / 返回字段 monospace flex 1 或 错误码 width 140px / 描述 width 180px / 解决方案 flex 1）+ DeleteOutlined 删除按钮，底部"添加接口"/"添加错误码"按钮新增空条目。**提交发布按钮**：仅在编辑模式显示于页面底部左侧（SendOutlined 图标，蓝色渐变背景 #3b82f6，box-shadow，padding '8px 20px'），onClick 将 editContent 写回 skillContentMap[currentName] 并退出编辑模式。handleSubmit 函数执行浅拷贝合并，updateField 辅助函数处理嵌套字段更新。**排序逻辑**：进入编辑模式时自动对 versions 数组按语义版本号排序（移除 v/V 前缀后按 major.minor.patch 数值比较），确保版本列表有序展示。**category 字段类型变更**：从 `string` 改为 `string[]` 数组类型，支持多分类标记。涉及文件：`src/pages/shared/skill-detail/index.tsx`
- **SectionHeader 数据卡片颜色规范**：SectionHeader 组件（`dashboard/components/shared/data-card.tsx`）渲染区块头部指标数据，所有数值 span 统一使用橙色 `#f59e0b`：累计数据量值（countValue）、累计使用量值（usageCount）、活跃度值（activityLevel）。标签文字为 `#374151`，`FileTextOutlined` 图标为 `#3b82f6`。标题标签为深色背景白字（bg `#2c3e50`，color `#fff`，borderRadius 20）。涉及文件：`data-card.tsx`，被 `classification-overview.tsx` 引入使用。
- **搜索框统一规范**：Skills 市场（shared/skills/index.tsx）和知识规则（knowledge-base-cards.tsx）的搜索框使用完全相同的样式：外层 styled div（width 360px, height 34px, borderRadius 17, border 1px solid #e5e7eb, background #fff, padding '0 14px'），内嵌 SVG 搜索图标（14x14, stroke #9ca3af）+ 原生 `<input>`（border none, outline none, fontSize 13, background transparent）。无搜索按钮，实时过滤。
- **业务全景概览浅色主题大屏模式**：`/business/overview` 使用浅色主题（bg `#fff`，blue `#3b82f6` 主色调）。整体容器：`height: 100%`, flex column, borderRadius 16, border `1px solid #e5e7eb`, boxShadow `0 1px 3px rgba(0,0,0,0.05)`，overflow hidden，无页面滚动。**3 列 flex 布局**（gap 10, padding '10px 12px 12px'）：左列 flex:1（地区案件统计上 + 实时案件流下，各 flex:1），中列 flex:1.8（全国案件热力分布满高），右列 flex:1（数据资产总览上 flex:1 + 知识调用排行下 flex:1）。**cardStyle**：`background: '#fff'`, `border: '1px solid #e5e7eb'`, `boxShadow: '0 1px 3px rgba(0,0,0,0.05)'`, `borderRadius: 12`。**sectionLabel** 装饰：4px 宽 × 12px 高蓝色（#3b82f6）竖条，borderRadius 10, marginRight 10。**DashboardHeader**：白色 bg 容器，左右各蓝色装饰竖条 + 居中标题 "两核智能体 · 业务全景大屏"。**DataAssetsSection**：理赔/核保 tab 切换（`useState` 本地管理），4 类卡片（影像数据/体检报告/保单信息/案件信息），每项展示总量（blue #3b82f6）+ 使用量（green #52c41a），**2 列 grid 布局**（原 4 列）。**KnowledgeSection**：理赔/核保 tab 切换（`useState` 本地管理），数据源从 `mock-data.ts` 的 `claimsKnowledge` / `underwritingKnowledge` 动态提取 Top 10 + category。**ChinaMapPanel 浅色主题**：ECharts map areaColor `#f3f4f6`, borderColor `#d1d5db`, label `#9ca3af`, emphasis areaColor `#dbeafe` borderColor `#3b82f6`, tooltip 白色 bg 深色文字 `#1f2937`, visualMap text `#6b7280`, zoom 按钮白色 bg + `#e5e7eb` border + hover `#f0f7ff`。**CityStatsTable 浅色主题**：header 文字 15px `#1f2937`, table header row bg `#f9fafb` color `#9ca3af`, data rows 交替 `#fff`/`#fafbfc`, hover `#f0f7ff`, summary footer bg `#f9fafb`, borders `#e5e7eb`, 解决率 badge 颜色不变。**ScrollingCases 浅色主题**：header 文字 15px `#1f2937`, table header bg `#f9fafb` color `#9ca3af`, data rows `#fff`, hover `#f0f7ff`, border `#f3f4f6`, status default 从 cyan 改为 blue `#3b82f6`, caseNo/amount `#1f2937`, agent `#3b82f6`, 其他 `#6b7280`。涉及文件：`src/pages/business/overview/index.tsx`, `src/pages/business/overview/components/ChinaMapPanel.tsx`, `src/pages/business/overview/components/CityStatsTable.tsx`, `src/pages/business/overview/components/ScrollingCases.tsx`。
- **CaseProcessingChart 交互图表模式**：`src/pages/dashboard/components/smart-services/case-processing-chart.tsx` 是项目内交互式 ECharts 折线图组件。结构：顶部标题徽章（"智能体案件处理情况趋势图"，深蓝底白字 badge，右侧粒度切换自定义下拉按钮 + DatePicker.RangePicker）→ 主体左右分栏（左侧 flex: 1 为 ECharts 折线图容器高度 432px，右侧 140px 宽指标选择器，vertical flex 列布局 gap 8，6 项指标卡片选中态蓝边蓝底 + 阴影，未选中态 bg `#f3f4f6`，textAlign 'center' 居中对齐）。6 项指标：Tokens使用量（万）、处理案件数（件）、服务调用数（次）、调用成功率（%）、平均处理时长（秒）、自动化率（%）。**数据生成**：seeded random mock 矩阵（`hashSeed` + `seededRandom` 伪随机），根据粒度/日期范围动态生成 X 轴标签（`generateLabels`），5 个智能体（数采智能体/定责智能体/剔费智能体/理算智能体/审核智能体）各对应一条折线，颜色取自 `colorPalette`（10 色调板，首个为灰色 #c1c9d2）。**粒度自适应**：按天最多 30 个标签，按周最多 12 个，按月最多 12 个，超出时自动降采样（step）。**粒度切换时自动重置日期范围**（day: 2026-04-01~30, week: 2026-03-02~04-05, month: 2026-01-01~05-31）。X 轴为时间标签（category），Y 轴为当前选中指标的数值（axisLabel fontWeight 500 加粗），tooltip 显示 5 条线在同一 X 轴点的对比值。**粒度下拉按钮**：自定义 button + 绝对定位下拉面板（非 Ant Design Select），高度 32px + box-sizing: border-box，与 DatePicker.RangePicker 高度对齐。涉及文件：`case-processing-chart.tsx`，被 SmartServices 内部和 MetricsClaims（/business/claims/metrics）消费。SmartServices 当前无外部页面消费。
- **案件清单列级过滤模式**：MetricsClaims 页面使用自定义下拉筛选器（非 Ant Design FilterDropdown）作为列级筛选器。当前节点和状态字段使用自定义 button + 绝对定位下拉面板，宽度 100-140px，高度 32px，borderRadius 10，box-sizing: border-box，与 DatePicker.RangePicker 高度对齐。filter state 类型 `string`，默认 `''`。配合 "重置" `<Button>` 清空所有 filter 并重置页码。`useMemo` 计算 filteredData + `slice` 实现 pagedData。仅 MetricsClaims 使用。**（原 7 个 Input 输入框已移除）**
- **FlowTrajectoryGraph SVG 流程轨迹模式**：MetricsClaims 页面内联的 `FlowTrajectoryGraph` 组件（非独立文件），接受 `trajectory: FlowTrajectory` prop 和可选 `caseNo` prop。`FlowTrajectory` 接口含 `nodes` 数组（每个元素 `{ label: string; status: NodeStatus }`），`NodeStatus = 'processing' | 'completed' | 'exception'`。**流程数据由 `generateFlowTrajectory(caseNo, status)` 动态生成**（替代已删除的静态 `flowDataMap`）：completed=全部 7 节点 completed；processing=前 N 节点 completed+其余 processing（N=caseNo 末两位%5+1）；exception=前 N 节点 completed+1 个 exception 节点+其余 processing（N=caseNo 末两位%3+2）。SVG viewBox 动态计算：`NODE_LABELS.length * NODE_GAP + 20` x `60`（7 个固定节点：开始/采集/立案/理算/扣费/审核/结束，间距 74px，总宽 538px，`NODE_R=14`）。渲染：圆形节点（radius `NODE_R`）+ 状态图标（completed='✓'/exception='✗'/processing='·'）+ 文字标签（fontSize 12, color #000000e0, y 偏移 `cy + NODE_R + 20`）。**处理时长内联显示**：仅 completed 节点，标签文字格式为 "Label (Ns)"（如 "采集 (2.3s)"），从 `NODE_PROCESSING_TIMES`（`Record<string, Record<string, number>>`，keyed by caseNo then nodeLabel）读取，覆盖全部 20 条 MOCK_CASES 条目，每个案件 7 个节点各有不同时长（0.2s~4.8s）；pending/exception 节点仅显示标签文字。`FlowTrajectoryGraph` 接受可选 `caseNo` prop（`const nodeTimes = caseNo ? NODE_PROCESSING_TIMES[caseNo] : undefined`），按节点标签查 `nodeTimes[label]` 获取时长。已移除独立的处理时长文本元素（原为 fontSize 10, color #000000e0, fontWeight 500, y 偏移 `cy + NODE_R + 26`）。状态颜色 processing=#91caff（浅蓝）/completed=#95de64（浅绿）/exception=#ff7875（浅红）；pending/processing 节点渲染为空心灰色圆（fill="none", stroke="#9ca3af", strokeWidth=2），图标文字灰色 #9ca3af；completed/exception 节点填充对应状态色，图标白色 #fff。阶段间全部用直线连接（stroke #d1d5db, strokeWidth 2）。外层容器 bg #f9fafb borderRadius 8 padding 24。`expandedRowRender` 实时调用 `generateFlowTrajectory`，移除 fallback "暂无流程轨迹数据" 容器。仅 MetricsClaims 使用。

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
## Custom Notes

（以下为初始化前 CLAUDE.md 的原始内容）

# 两核智能体运营平台 (DualCore AI Ops Platform)

## 项目概述
保险理赔与核保统一智能体运营平台前端。
核心能力：智能体监控、作业流程管理、模型/数据/知识全生命周期管理。

## 技术栈
- **框架**: React 18 + TypeScript + Vite
- **UI库**: Ant Design 5
- **图表**: ECharts / AntV G2
- **路由**: React Router 6
- **状态管理**: Zustand
- **HTTP客户端**: Axios

## 目录结构约定
```
src/
├── assets/          # 静态资源（图片、字体、图标）
├── components/      # 公共组件
├── layouts/         # 页面布局
├── pages/           # 页面级组件
│   ├── dashboard/   # 总览仪表盘
│   ├── agent/       # 智能体管理
│   ├── workflow/    # 作业流程监控
│   ├── model/       # 模型生命周期
│   ├── data/        # 数据管理
│   └── knowledge/   # 知识管理
├── services/        # API服务层
├── store/           # Zustand状态管理
├── hooks/           # 自定义Hooks
├── utils/           # 工具函数
└── types/           # TypeScript类型定义
```

## 命名规范
- 文件/目录：kebab-case
- 组件：PascalCase
- 函数/变量：camelCase
- 常量：UPPER_SNAKE_CASE
- 类型/接口：PascalCase，接口以 `I` 前缀

## 开发命令
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

## 更新记录
- 2026-05-22: 项目初始化
- 2026-06-02: SharedDataAssets 外层卡片 padding 从 24 调整为 '14px 24px 34px'，减少顶部间距、增加底部间距
- 2026-06-02: SharedDataAssets tab 容器 marginBottom 从 24 调整为 34，增加 tab 标签与"分类与规模"区域间距
- 2026-06-02: SharedDataAssets tab 容器 marginBottom 从 34 调整为 29，减少 tab 标签与"分类与规模"区域间距 5px
- 2026-06-02: MetricsOverview 和 SharedKnowledgeRules 外层添加统一 card 容器包裹（background #fff, borderRadius 16, boxShadow 0 1px 2px rgba(0,0,0,0.05), border 1px solid #f3f4f6, padding '14px 24px 34px'），与 SharedDataAssets 样式保持一致
- 2026-06-02: MetricsOverview 和 SharedKnowledgeRules tab 容器 marginBottom 从 24 调整为 28，与 SharedDataAssets 样式保持一致
- 2026-06-02: 根路径 `/` 重定向目标从 `/metrics/underwriting` 改为 `/metrics/claims`；MetricsOverview tab 顺序调整为理赔/核保/反欺诈，默认 activeTab fallback 改为 `'claims'`
- 2026-06-02: SharedSkillsMarket 页面实现（/shared/skills），从 App.tsx 的 PagePlaceholder 占位改为真实路由；包含使用案例轮播（3 案例卡片 prev/current/next 布局）和最热门 Skills 2x3 网格（6 个 skill 卡片），外层 Card 样式与其他共享页面一致
- 2026-06-02: 全部区块标题统一样式（fontSize 28, fontWeight 700, color #1f2937, textAlign center, marginBottom 28），移除左侧蓝色竖条装饰。涉及组件：智能服务、分类与规模、核心来源分布、覆盖场景分布、高频调用知识&规则 Top 10、理赔知识库/核保知识库、Skills 使用案例、最热门 Skills。UseCaseCarousel 卡片固定高度 280px。移除 Skills 市场页面装饰性 '+' 图案。
- 2026-06-02: 全部区块标题样式回退至左侧蓝色竖条装饰（width 4, height 20, background #3b82f6, borderRadius 10, marginRight 10, fontSize 17, fontWeight 700, color #1f2937），页面级区块 marginBottom 20，子组件区块 marginBottom 16。涉及组件同上。
- 2026-06-02: SharedSkillsMarket "Skills 使用案例" 标题 wrapper marginTop 从 5 调整为 10；"最热门 Skills" 搜索栏从标题下方移至与标题同行（`justifyContent: 'spaceBetween'` 右侧对齐），width 360px（与单列卡片宽度一致），height 40px，borderRadius 20px，移除 "搜索" 按钮，保留左侧 SVG 搜索图标和输入框
- 2026-06-02: knowledge-base-cards.tsx 搜索框从 Ant Design Input.Search 替换为自定义 styled div 包裹原生 input（width 360px, height 40px, borderRadius 20, border 1px solid #e5e7eb, 左侧 SVG 搜索图标, placeholder "搜索文档名称"），与 Skills 页面搜索栏样式一致；mock-data.ts 侧边栏菜单项 "Skills市场" 更名为 "Skills广场"
- 2026-06-02: knowledge-base-cards.tsx KnowledgeSection 标题与分类筛选行之间 marginTop 从 24 调整为 10；shared/skills/index.tsx "最热门 Skills" 搜索栏与分类标签合并到同一行（`justifyContent: 'spaceBetween'`，左侧标签 + 右侧搜索框），标签 padding 从 8px 16px 调整为 4px 12px，fontSize 从 13 调整为 12，borderRadius 20，border 1px solid #bfdbfe，样式与 KnowledgeBaseCards PillTag 完全统一
- 2026-06-02: knowledge-base-cards.tsx PillTag padding 从 6px 12px 调整为 4px 12px，与 Skills 页面分类标签统一
- 2026-06-02: Skills 市场 + 知识规则搜索框高度统一为 34px（原 40px），borderRadius 统一为 17（原 20）；Skills 市场移除 "查看更多" 按钮；新增分类标签过滤（OCR识别/数据采集/立案定责/核保评估）+ 12 个 mock skills（每类 3 个）+ 关键词组合过滤；**SkillCard 导航**：卡片点击和"查看详情 >"链接均导航至 `/shared/skill/${encodeURIComponent(skill.name)}`；新增 skill-detail 页面（独立布局，不在 MainLayout 内）

- 2026-06-02: Skills市场分类标签新增"全部"选项并设为默认选中，点击展示所有skills；SkillCard底部区域重构：移除下载量统计和蓝色分类标签，新增左侧点赞+更新时间、右侧蓝色"查看详情 >"可点击链接
- 2026-06-02: Skills市场SkillCard点赞图标从ThunderboltOutlined改为StarOutlined（琥珀色#f59e0b）；12个skill名称从英文key改为中文显示名（如'票据OCR识别'、'医疗文档OCR识别'等），category字段同步为中文分类名

- 2026-06-02: Skills市场SkillCard点赞图标改为可交互切换：未点赞灰色#9ca3af，已点赞琥珀色#f59e0b，点击切换liked状态，显示数量=skill.likes+1（已赞）或skill.likes（未赞）；SectionHeader数据卡片所有数值（累计数据量、累计使用量、活跃度）统一改为橙色#f59e0b

- 2026-06-02: Skills市场新增"我的收藏"分类标签，点赞状态从 SkillCard 本地 state 提升至 SharedSkillsMarket 组件级 `Set<string>` 集中管理（`likedSkills` + `toggleLike`），点赞跨分类持久化，SkillCard 通过 `liked` prop 和 `onToggleLike` callback 接收状态

- 2026-06-02: Skill 详情页从独立路由 `/skill/:name` 迁移至 MainLayout 子路由 `/skills/skill/:name`，现在有侧边栏；MainLayout 新增 `/shared/skill/` 前缀自动识别（选中 Skills广场、展开共享中心分组）；Skill 详情页移除 FAQ 章节和页脚栏；SkillCard 导航路径同步更新为 `/skills/skill/:name`

<!-- 2026-06-02: SkillDetail "最佳实践" 章节更名为 "SKILL.md"：顶部导航锚点 + 内容章节标题均更新；内容从 5 条实践建议改为 mock SKILL.md 文件示例（代码块格式，含 frontmatter/依赖/指令/输出格式/最佳实践/错误处理） -->

<!-- 2026-06-02: SkillDetail 页面重构：1) 顶部导航栏背景改为白色（与card一致），锚点导航更新为6项（概述/安装配置/使用指南/API参考/最佳实践/版本历史），带scroll-spy高亮和点击平滑滚动；2) 移除顶部导航与概述之间所有内容（元数据卡片、状态标签、操作按钮、触发词）；3) 版本历史表新增"发布者"列（位于版本与发布日期之间）；4) 相关技能推荐卡片样式与"最热门Skills" SkillCard一致（名称+描述+星标/更新时间+"查看详情 >"） -->

<!-- 2026-06-02: SkillDetail 概述章节"适用场景"/"不适用场景"卡片容器 maxWidth 从默认 100% 调整为 66%，后统一调整为 800px；所有代码块、表格、grid 容器（安装命令/环境变量、使用指南快速开始+用例、API参考两张表、SKILL.md代码块）统一 maxWidth: '800px'，与概述卡片宽度对齐 -->

<!-- 2026-06-03: AutomationRateChart 和 CaseProcessingChart 的 Period 下拉按钮（"按天/按周/按月"）统一固定高度 32px + box-sizing: border-box，与 DatePicker.RangePicker 高度对齐，替代之前的 padding 自适应方案 -->

<!-- 2026-06-05: shared/skills/index.tsx 三大区块间距调整："最佳实践" wrapper marginBottom 移除（原 48px），"我的 Skills" wrapper marginTop 从 24 调整为 30，"公共 Skills" wrapper marginTop 从 24 调整为 30 -->

<!-- 2026-06-05: shared/skills/index.tsx 三大区块间距统一为 24px："最佳实践" wrapper marginBottom 从 48 调整为 24，"我的 Skills" wrapper marginTop 从 30 调整为 24，"公共 Skills" wrapper marginTop 从 48 调整为 24 -->

<!-- 2026-06-04: shared/skills/index.tsx 搜索框高度从 32px 修正为 34px（实际代码 height: 34）；knowledge-base-cards.tsx 搜索框也确认为 height: 34；AGENTS.md 搜索框统一规范 height 从 32px 修正为 34px -->

<!-- 2026-06-03: CaseProcessingChart 图表容器高度从 412px 调整为 432px；粒度切换下拉改为自定义 button + 绝对定位面板（非 Ant Design Select），高度 32px；5 个智能体明确为数采/定责/剔费/理算/审核智能体，colorPalette 首个为灰色 #c1c9d2；日期范围 day 默认从 2026-04-01~05 调整为 2026-04-01~30；X 轴为时间标签而非智能体名称 -->

<!-- 2026-06-02: SkillDetail 顶部导航栏移除底部边框分隔（borderBottom 和 paddingBottom） -->

<!-- 2026-06-02: SkillDetail 所有代码块、表格、grid 容器 maxWidth 从 '66%' 调整为 '800px'，概述场景卡片同步更新，共10处 -->

<!-- 2026-06-03: /business/overview 从浅色统计卡片+场景入口卡片布局完全重写为深色主题全景大屏（gradient bg #0a0e27, cyan #00d4ff 主色调），新增三个子组件：ChinaMapPanel（ECharts 中国地图，省份热力+城市散点+涟漪）、CityStatsTable（可排序城市案件统计表）、ScrollingCases（实时自动滚动案件流，2s 新案件生成，requestAnimationFrame 滚动），移除 Ant Design Row/Col 和白色 card 容器模式，改为 flex 比例分割布局 -->

<!-- 2026-06-03: MainLayout menuItems 更新：Agent运营从 3 项（理赔/核保/反欺诈智能体）拆分为 4 项（理赔-采集Agent/理赔-立案Agent/核保-新契约审核Agent/反欺诈-欺诈识别Agent），路由分别为 /agent/claims-collect、/agent/claims-case、/agent/underwriting-review、/agent/anti-fraud-detect；共享中心"Skills市场"更名为"Skills集市"并拆分为 3 级嵌套（公共Skills /shared/skills + 个人Skills /shared/my-skills）；平台管理新增"异常告警"（/platform/alert）。根路径重定向从 /business/claims/metrics 改为 /business/overview。注意：部分菜单路由（如 /agent/claims-collect、/agent/claims-case、/shared/my-skills）在 App.tsx 中尚未实现 -->

<!-- 2026-06-03: MetricsClaims 已独立实现（自有 METRICS_CLAIMS 10 项硬编码指标 + MetricCard inline 渲染 + CaseProcessingChart 全宽 Col span=24，不使用 SmartServices）。三个 metrics 页面内容不再一致 -->
<!-- 2026-06-03: SmartServices 组件仍保留 agents prop 驱动模式（SmartAgentCard 网格 + 双图表），被 metrics/underwriting 和 metrics/anti-fraud 使用；MetricsClaims 已独立实现（自有 METRICS_CLAIMS 10 项硬编码指标 + MetricCard inline 渲染 + CaseProcessingChart 全宽 Col span=24，不使用 SmartServices）。三个 metrics 页面内容不再一致 -->

<!-- 2026-06-03: MetricsOverview 从"三态 tab 容器"简化为 MetricsClaims 的 card 包装器，直接渲染 `<MetricsClaims />`，不再维护 tab 状态。业务域隔离完全由 App.tsx 路由层面处理（`/business/claims/metrics`、`/business/underwriting/metrics`、`/business/anti-fraud/metrics` 各自独立渲染）。注意：claims 页面已独立实现（10 项硬编码指标 + MetricCard + CaseProcessingChart），underwriting/anti-fraud 仍复用 SmartServices（agents prop 驱动），三者内容不再一致 -->

<!-- 2026-06-04: MetricsClaims 案件清单 Table 新增展开行功能：点击案件号展开/收起 FlowTrajectoryGraph SVG 流程轨迹图。内联组件（非独立文件），仅 MetricsClaims 使用。通过 flowDataMap（keyed by caseNo）提供 mock 数据，展示采集智能体节点链路（获取影像→OCR分类→OCR识别→脱敏）+ 汇总 + AI分析节点（AI看病历/AI核保评估/EM值评分）+ 完成。SVG viewBox 1000x260，圆形节点（radius 14）+ 贝塞尔/直线连接，状态颜色 done=#52c41a/processing=#faad14/pending=#d9d9d9，pending 节点用虚线，外层容器 bg #f9fafb borderRadius 8。使用 useState 管理 expandedRowKeys 状态 -->

<!-- 2026-06-04: MetricsClaims 案件清单 Table 新增列级过滤（filters + onFilter）：7 列均支持客户端筛选（案件号/索赔号/分公司/出险日期/索赔日期/当前所处节点/状态），MOCK_CASES 数据驱动 filter options。新增分页控制：useState 管理 pageSize（默认 10）/ currentPage / filters 状态，useMemo 计算 filteredData，slice 实现 pagedData。自定义底部栏：左侧数据计数（"共 N 条数据"）+ 导出按钮（蓝色按钮，SVG 下载图标，onClick 暂为 console.log）+ 右侧 Pagination 组件（showSizeChanger + showQuickJumper，pageSizeOptions ['10','20','50']）。expandIconColumnIndex: -1 隐藏默认展开图标，案件号文字改为蓝色下划线可点击样式。 -->

<!-- 2026-06-04: CaseProcessingChart 粒度下拉按钮高度确认为 32px（代码实际值），与 DatePicker.RangePicker 高度对齐；index.css 新增 Pagination 尺寸选择器全局样式覆盖（borderRadius 10, height 34, border 1px solid #e5e7eb） -->

<!-- 2026-06-04: index.css Pagination 尺寸选择器 borderRadius 从 16 调整为 10（修正文档漂移，实际代码一直为 10px） -->

<!-- 2026-06-04: AGENTS.md 文档校正：FilterDropdown 按钮高度从 34px 修正为 32px；MetricsClaims STATUS_MAP 从"四色映射"修正为"三色映射"（processing/completed/exception），与 BusinessCases 四色映射（processing/completed/pending/exception）区分 -->

<!-- 2026-06-04: index.css 新增 Pagination 全局字号覆盖（.ant-pagination-item / prev / next / jump-prev / jump-next / quick-jumper input 统一 font-size 12px）+ .ant-select-selector 样式（height 32px, font-size 12px）；AGENTS.md 全局样式覆盖章节同步补充 -->

<!-- 2026-06-04: index.css Pagination 尺寸选择器样式调整：.ant-select-selector height 从 32px 调整为 24px；新增自定义下拉箭头（隐藏默认箭头，替换为 SVG 下箭头图标 12x12 stroke #94a3b8）；未选中项样式改为 color #000000 + font-weight 400 -->

<!-- 2026-06-04: MetricsClaims FlowTrajectoryGraph 完全重写：从多行贝塞尔曲线复杂布局简化为 7 个固定节点（开始/采集/立案/理算/扣费/审核/结束）线性 SVG。NodeStatus 从 done/processing/pending 改为 processing/completed/exception；状态颜色从 done=#52c41a/processing=#faad14/pending=#d9d9d9 改为 processing=#91caff/completed=#95de64/exception=#ff7875（Ant Design 浅色变体）；节点图标从 ✓/✓/✓ 改为 ✓/✗/·（白色填充）；节点半径从 14 改为 10；SVG viewBox 从 1000x260 改为动态计算 440x60；连接全部用直线（移除贝塞尔曲线和虚线）；FlowTrajectory 接口从 stages（含 rows/single）改为 flat nodes 数组。Table rowKey 从 key 改为 caseNo。 -->

<!-- 2026-06-04: SharedSkillsMarket 页面重构：1) "最热门Skills"区拆分为"我的Skills"和"公共Skills"两个独立区块；2) 移除"我的收藏"分类标签（5个分类：全部/OCR识别/数据采集/立案定责/核保评估）；3) MySkillCard新增编辑+发布按钮行，PublicSkillCard无导航点击交互；4) 公共Skills新增分页加载机制（LOAD_COUNT=9，底部"查看更多"按钮，分类切换/搜索时重置）；5) 使用案例区新增"查看案例所用的X个Skills"链接 -->

<!-- 2026-06-04: MainLayout.tsx 菜单结构简化：从 2 级+3 级嵌套混合结构改为全部 2 级扁平。业务应用：6 项直接菜单项（全景概览/理赔指标看板/理赔案件清单/核保指标看板/核保案件清单/反欺诈指标看板/反欺诈案件清单），移除理赔场景/核保场景/反欺诈场景子分组。共享中心：4 项直接菜单项（Skills集市/MCP服务/数据资产/知识&规则），Skills集市不再嵌套公共Skills/个人Skills子项。defaultOpenKeys 简化为仅基于一级路径前缀（/business/* /agent/* /shared/*）。 -->

<!-- 2026-06-05: 新增 GitHub Actions 部署流程（.github/workflows/deploy.yml）：push 到 v3 分支触发，Node 20 + npm ci + npm run build，产物部署到 GitHub Pages。vite.config.ts 同步确认 base: '/两核智能体运营平台/' 匹配 GitHub Pages 仓库名 -->

<!-- 2026-06-05: 案件清单模块移除：删除 `src/pages/business/cases/` 目录（BusinessCases 组件），App.tsx 中移除 `/business/claims/cases`、`/business/underwriting/cases`、`/business/anti-fraud/cases` 三条路由。MainLayout 菜单中仍保留案件清单入口（待后续清理）。业务应用菜单实际有效路由从 7 项减至 4 项（全景概览 + 三个指标看板）。 -->

<!-- 2026-06-05: MetricsUnderwriting 和 MetricsAntiFraud 页面简化为 stub（"页面开发中"），不再使用 SmartServices 组件。SmartServices（含 AutomationRateChart、CaseProcessingChart）当前无外部页面消费，仅组件内部自引用。Agent 页面仍正常消费 SmartAgentCard 和 mock agents 数据。 -->

<!-- 2026-06-05: SkillDetail 页面 4 项调整：1) 导航锚点顺序从 概述/版本历史/API参考/SKILL.md 改为 概述/版本历史/SKILL.md/API参考（SKILL.md 第3，API参考最后）；2) SKILL.md 章节标题从 "SKILL.md 示例" 改为 "SKILL.md"；3) 概述章节移除适用/不适用场景卡片，替换为单个分类标签（仅显示当前 skill 的 category，蓝色高亮）；4) 返回链接从 "返回Skills广场" 改为 "返回Skills集市" -->

<!-- 2026-06-05: SkillDetail 概述章节进一步简化：4 分类标签行改为单个分类标签，仅显示当前 skill 的 category（蓝色高亮），不再展示全部 4 个分类；shared/skills/index.tsx mySkills mock 数据更新：移除自定义类别的 '我的理赔规则引擎' 和 '智能核保助手'，替换为 allSkills 子集中的 '理赔案件自动立案'（立案定责, v2.3.0）和 '体检报告解读'（核保评估, v2.0.0） -->

<!-- 2026-06-05: SkillDetail 页面 section 卡片 padding 从 28px 调整为 20px（4 处：概述/版本历史/SKILL.md/API参考）；概述章节分类标签容器移除 marginBottom: 16 -->

<!-- 2026-06-05: SkillDetail 概述章节内部元素间距调整：h2 标题和描述段落移除 marginBottom，ul 列表恢复 marginBottom: 10（功能列表与分类标签之间的视觉分隔），分类标签容器移除 marginBottom: 16 -->

<!-- 2026-06-05: SkillDetail 版本历史 mock 数据遵循版本号规范：beta/内测版本从 v0.1.0 起跳，formal/正式版本从 v1.0.0 起跳；第二行从 v0.9.0 改为 v0.1.0，描述改为"内测版本，内部试用验证核心能力" -->

<!-- 2026-06-05: SkillDetail 页面完全重构：从硬编码单一技能 mock 数据改为 `skillContentMap: Record<string, SkillContent>` 动态内容架构。14 个独立技能 mock 数据，按 4 个分类各 3 个组织（OCR识别：票据/医疗文档/身份证；数据采集：网页采集/API同步/日志；立案定责：自动立案/责任判定/欺诈检测；核保评估：健康告知/风险定价/体检解读）。每个技能含 overview/features/category/publisher/versions/skillMd/apis/errors。版本号规范：v0.x 内测、v1.x+ 正式。通过 URL `name` 参数动态查找内容，fallback 为 '票据OCR识别'。所有 4 个内容章节（概述/版本历史/SKILL.md/API参考）均由 content lookup 驱动渲染 -->

<!-- 2026-06-05: SkillDetail 概述章节描述段落 `<p>` marginTop 从 16 调整为 12，缩小与 h2 标题的间距；core-source-treemap.tsx 注释文本移除 `marginTop: 12` -->

<!-- 2026-06-05: knowledge-base-cards.tsx DocTable 底部栏完全重构（对齐 MetricsClaims 案件清单底部栏布局）：从简单右对齐 Pagination 改为 space-between flex 布局（marginTop 16）。左侧：数据计数（"共 N 条数据"）+ 蓝色导出按钮（SVG 下载图标）；右侧：Pagination（showSizeChanger + showQuickJumper，pageSizeOptions ['10','20','50']）。pageSize 从 const 改为 useState 管理，支持动态切换，切换时重置 page 为 1。 -->

<!-- 2026-06-05: shared/skills/index.tsx useCases 数组从通用云部署案例替换为三个保险专属场景：1) 理赔案件自动化处理（票据OCR识别+理赔案件自动立案+理赔责任判定，解决人工理赔5-7工作日周期）；2) 智能核保风控体系（健康告知评估+体检报告解读+风险智能定价，解决核保审核耗时和定价缺乏标准）；3) 理赔反欺诈联动检测（理赔欺诈检测+关联图谱分析+理赔责任判定，解决隐蔽欺诈和团伙欺诈识别） -->

<!-- 2026-06-05: shared/skills/index.tsx "Skills 使用案例" 标题更名为"最佳实践"；UseCaseCard 尺寸回退（高度从 340→280，padding 从 28→24）；内部间距恢复（标题 marginBottom 20→16，解决方案块 16→12，解决问题块 20→16）。轮播列比例从 6:12:6 改为 7:10:7，maxWidth 1200→1100 -->

<!-- 2026-06-08: Agent运营菜单从 2 级扁平（4 项：理赔-采集Agent/理赔-立案Agent/核保-新契约审核Agent/反欺诈-欺诈识别Agent）重构为 3 级嵌套结构：理赔/核保/反欺诈各作为二级目录，每个二级目录下包含概览/日志清单/错例分析 3 个三级页面，共 9 项。路由从 `/agent/{domain}-{action}` 改为 `/agent/{domain}/{page}`（如 `/agent/claims/overview`）。MainLayout.tsx menuItems 新增 3 级 children 嵌套，defaultOpenKeys 按业务域自动展开对应子分组。App.tsx 路由同步更新，旧路由全部废弃。AGENTS.md 文档同步更新（MainLayout 布局描述 + 侧边栏菜单内联模式）。 -->

<!-- 2026-06-08: 侧边栏"共享中心"拆分为"技能中心"和"数据共享"两个一级目录，同时路由前缀从 `/shared/` 改为 `/skills/`（技能中心：Skills集市→`/skills/market`、MCP服务→`/skills/mcp`、Skill详情→`/skills/skill/:name`）和 `/data-share/`（数据共享：数据资产→`/data-share/data-assets`、知识&规则→`/data-share/knowledge-rules`）。MainLayout.tsx menuItems key、selectedKey、defaultOpenKeys 同步更新。App.tsx 路由同步更新，旧 `/shared/` 路由全部废弃。AGENTS.md 同步更新（MainLayout 布局描述 + 侧边栏菜单内联模式 + 已实现页面路由列表）。 -->

<!-- 2026-06-08: shared/skills/index.tsx MySkillCard navigate paths 修复：从 `/shared/skill/` 改为 `/skills/skill/`（2 处：技能名称点击 + "查看详情 >" 链接），与 2026-06-08 路由前缀迁移文档一致 -->

<!-- 2026-06-08: shared/skills/index.tsx 最佳实践轮播区块隐藏：UseCaseCarousel 组件及最佳实践 JSX 区块被注释掉（`{/* ... */}`），UseCaseCarousel 上加 `@ts-ignore`。useCases 数据、UseCaseCard 组件仍保留在代码中未删除，页面仅渲染"我的 Skills"和"公共 Skills"两个可见区块 -->

<!-- 2026-06-08: MetricsClaims 案件清单列级过滤从 7 个自定义 FilterDropdown（button + 绝对定位面板，width 120, height 32, borderRadius 10，精确匹配）替换为 7 个 Ant Design `<Input>` 输入框（`allowClear`，placeholder 标注字段名，宽度 100-140px，`.includes()` 模糊匹配）。filter state 类型从 `string | undefined` 改为 `string`（默认 `''`）。移除未使用的常量：ALL_BRANCHES、ALL_NODES、ALL_STATUSES、CHEVRON_DOWN。FilterDropdown 组件已不复存在。 -->

<!-- 2026-06-08: src/index.css 侧边栏菜单三项层级均新增 `margin-block: 4px !important` 纵向间距（Level 1/2/3），Level 2 额外新增 `margin-inline: 0 !important` 和 `width: 100% !important` 消除横向偏移并撑满宽度 -->

<!-- 2026-06-08: src/index.css Level 3 菜单项新增 `margin: 0 !important`（移除所有 margin，消除从 Ant Design 继承的间距），Level 1/2 的 `margin-block: 4px`、Level 2 的 `margin-inline: 0` + `width: 100%` 已在之前添加。侧边栏菜单三项层级间距统一完成 -->

<!-- 2026-06-08: CaseProcessingChart Y 轴 axisLabel 新增 `fontWeight: 500`（加粗），使 Y 轴刻度标签更醒目。涉及文件：`case-processing-chart.tsx` -->

<!-- 2026-06-08: FlowTrajectoryGraph 视觉尺寸调整：NODE_R 从 10 调整为 16（节点更大），NODE_GAP 从 60 调整为 82（节点间距更宽），连接线长度变为 50px（82 - 16*2），SVG 总宽度变为 594px（7 * 82 + 20）。涉及文件：`src/pages/metrics/claims/index.tsx` -->

<!-- 2026-06-08: MetricsClaims 流程轨迹从静态 `flowDataMap`（5 条预定义 mock 数据）重构为动态 `generateFlowTrajectory(caseNo, status)` 函数。轨迹规则：completed=全部 7 节点 completed（绿色实心 ✓）；processing=前 N 节点 completed+其余 processing 灰色空心 ·（N=parseInt(caseNo.slice(-2))%5+1，范围 1~5）；exception=前 N 节点 completed+1 个 exception 节点红色 ✗+其余 processing 灰色空心（N=parseInt(caseNo.slice(-2))%3+2，范围 2~4，exceptionIdx=completedCount）。`PROCESSING_TIMES` mock 数据从 5 条扩展至全部 20 条 MOCK_CASES 条目。`expandedRowRender` 实时调用 `generateFlowTrajectory`，移除 fallback "暂无流程轨迹数据" 容器。NODE_R 最终值 14，NODE_GAP 74，SVG 总宽 538px。涉及文件：`src/pages/metrics/claims/index.tsx` -->

<!-- 2026-06-08: FlowTrajectoryGraph 节点标签 y 偏移从 `NODE_R + 14` 调整为 `NODE_R + 20`，增加圆形节点与文字标签之间的间距（约 14px → 20px），使视觉更宽松。涉及文件：`src/pages/metrics/claims/index.tsx` -->

<!-- 2026-06-08: CaseProcessingChart 布局左右互换：图表容器移至左侧（flex: 1, minWidth: 0），6 项指标选择器移至右侧（width 140px），textAlign 从 'center' 改为 'right' 使指标文字右对齐。之前图表在右、指标在左、居中对齐。涉及文件：`src/pages/dashboard/components/smart-services/case-processing-chart.tsx` -->

<!-- 2026-06-08: CaseProcessingChart 指标选择器未选中态背景色从 `#ecedef` 改为 `#f3f4f6`，与 Ant Design 浅色主题更一致。涉及文件：`src/pages/dashboard/components/smart-services/case-processing-chart.tsx` -->

<!-- 2026-06-08: FlowTrajectoryGraph 处理时长数据结构从 `PROCESSING_TIMES`（per-case 单值）重构为 `NODE_PROCESSING_TIMES`（`Record<string, Record<string, number>>`，keyed by caseNo then nodeLabel），每个案件 7 个节点各有独立时长（0.2s~4.8s），如 `NODE_PROCESSING_TIMES['CLS-2026060301']['采集'] = 2.3`。`FlowTrajectoryGraph` 新增可选 `caseNo` prop，按节点标签查 `nodeTimes[label]` 获取时长，格式 "Label (Ns)"（如 "采集 (2.3s)"）。覆盖全部 20 条 MOCK_CASES。涉及文件：`src/pages/metrics/claims/index.tsx` -->

<!-- 2026-06-08: `/business/overview` 从白灰色简洁风格完全重写为深色主题全景大屏。移除白色 card 容器、旧版 6 分类数据卡片（含"其他非结构化""费用明细"）、独立理赔/核保 KnowledgeSection 双区块。新增深色主题（gradient #0a0e27 → #0f1535，cyan #00d4ff 主色调），5 大板块一屏 flex 分割展示（无页面滚动）：板块 1 数据资产总览（4 类卡片 × 2，4 列 grid），板块 2 全国案件热力分布（ChinaMapPanel，ECharts 中国地图，flex 1.4），板块 3 城市案件统计（CityStatsTable，flex 1），板块 4 实时案件流（ScrollingCases，flex 1.4），板块 5 高频调用知识 Top 10（KnowledgeSection，flex 1）。新增组件：DataAssetsSection、KnowledgeSection、DashboardHeader（均内联于 index.tsx）。恢复组件：ChinaMapPanel.tsx（32 省会城市 scatter + effectScatter + 缩放控制）、CityStatsTable.tsx（可排序表格 + 解决率彩色 badge + 合计行）、ScrollingCases.tsx（每 2s 新案件生成 + requestAnimationFrame 自动滚动）。KnowledgeSection 数据源从 mock-data.ts 的 claimsKnowledge/underwritingKnowledge 动态提取 Top 10 + category。CATEGORY_COLOR 映射 9 种分类。涉及文件：`src/pages/business/overview/index.tsx`（完全重写），`src/pages/business/overview/components/ChinaMapPanel.tsx`（恢复），`src/pages/business/overview/components/CityStatsTable.tsx`（恢复），`src/pages/business/overview/components/ScrollingCases.tsx`（恢复）。 -->

<!-- 2026-06-08: `/business/overview` 布局从 2 行分割重构为 3 列 flex 布局。左列 flex:1（地区案件统计上 + 实时案件流下，各 flex:1 均分），中列 flex:1.8（全国案件热力分布，满高），右列 flex:1（数据资产总览上 flex:1 + 知识调用排行下 flex:1）。DataAssetsSection 从 flexShrink:0 改为 flex:1。板块标题变更："城市案件统计" → "地区案件统计"（index.tsx 注释 + CityStatsTable.tsx 头部文字），"高频调用知识" → "知识调用排行"（KnowledgeSection title prop）。涉及文件：`src/pages/business/overview/index.tsx`, `src/pages/business/overview/components/CityStatsTable.tsx`。 -->

<!-- 2026-06-08: `/business/overview` 从深色主题完全迁移为浅色/白色主题。主题常量从深色（gradient #0a0e27, cyan #00d4ff, BG/CYAN/TEXT/TEXT_DIM/BORDER/CARD_BG）改为白色（bg #fff, border #e5e7eb, text #1f2937）。cardStyle 改为白色 bg + 浅灰 border + 轻量 boxShadow。sectionLabel 从 3px cyan 竖条 + glow 改为 4px 蓝色（#3b82f6）竖条。DashboardHeader 从渐变光效装饰简化为白色 bg + 蓝色装饰竖条。DataAssetsSection grid 从 4 列改为 2 列，新增理赔/核保 tab 切换。KnowledgeSection 新增理赔/核保 tab 切换。ChinaMapPanel ECharts 地图：areaColor #f3f4f6, borderColor #d1d5db, emphasis #dbeafe/#3b82f6, tooltip 白色 bg 深色文字。CityStatsTable：header bg #f9fafb, data rows 交替 #fff/#fafbfc, hover #f0f7ff。ScrollingCases：status default 从 cyan #00d4ff 改为 blue #3b82f6。涉及文件：`src/pages/business/overview/index.tsx`, `src/pages/business/overview/components/ChinaMapPanel.tsx`, `src/pages/business/overview/components/CityStatsTable.tsx`, `src/pages/business/overview/components/ScrollingCases.tsx`。 -->

<!-- 2026-06-15: Skills市场"发布新 Skill"弹窗功能增强：点击"发布新 Skill"按钮触发固定定位模态框（position: fixed, zIndex 1000, 半透明黑色遮罩 background rgba(0,0,0,0.5)，白色内容区 borderRadius 16 maxWidth 700px maxHeight 85vh overflow auto padding 24）。表单字段包含：Skill名称（必填红色星号标记）、概述（textarea）、功能特性（动态数组输入项，支持添加/删除，每项带序号 + 输入框 + DeleteOutlined删除按钮）、分类标签（4个可选tag：OCR识别/数据采集/立案定责/核保评估，点击切换选中状态，选中态蓝色背景#eff6ff + 蓝色边框#3b82f6）、SKILL.md（大文本框 monospace字体）、API参考（动态数组，每项含接口名monospace字体/描述/返回字段三个输入框 + 删除按钮，底部"+ 添加接口"虚线按钮）、错误码（动态数组，每项含错误码monospace/描述/解决方案三个输入框 + 删除按钮，底部"+ 添加错误码"虚线按钮）。底部按钮组：左侧"取消"按钮（灰色边框）+ 右侧"发布"按钮（蓝色背景#3b82f6）。表单数据由NewSkillForm接口定义（name/overview/features/categories/skillMd/apis/errors/versions），useState管理showPublishModal/newSkill状态，handlePublish提交后清空表单并跳转至新Skill详情页，updateField辅助函数更新嵌套字段。涉及文件：`src/pages/shared/skills/index.tsx` -->

<!-- 2026-06-15: SkillDetail 页面编辑功能增强：顶部导航栏新增 EditOutlined/CloseOutlined/DeleteOutlined 图标导入，新增 isEditing/editContent 状态管理，实现 handleEdit/handleCancel/handleSubmit/updateField 编辑函数，添加编辑/取消按钮UI（位于导航栏下方），支持对 overview/features/versions/skillMd/apis/errors 字段的实时内联编辑。编辑模式下所有章节边框变为蓝色 2px 高亮（`border: isEditing ? '2px solid #3b82f6' : '1px solid #e8e8e8'`）。概述章节：overview 使用多行 textarea（minHeight 80px, resize vertical），features 提供列表编辑器（每项带序号输入框 + DeleteOutlined 删除按钮 + 底部"添加功能"虚线按钮），分类标签改为多选数组（点击切换选中状态，选中态蓝色背景#eff6ff + 蓝色边框#3b82f6 + fontWeight 600，未选中态白色背景 + 灰色边框#d9d9d9）。版本历史章：每项三个输入框（版本 monospace 字体 width 100px / 日期 width 130px / 更新内容 flex 1）+ DeleteOutlined 删除按钮，底部"添加版本"按钮自动生成新版本条目；渲染时自动按语义版本号排序（v0.x 内测版在前，v1.x+ 正式版在后，移除 v/V 前缀后按 major.minor.patch 数值比较）。SKILL.md 章节：大型 textarea（minHeight 400px, monospace 字体, background #f9fafb）编辑 markdown 源码。API参考和错误码章节：每项四个输入框（接口名 monospace width 180px / 描述 width 160px / 返回字段 monospace flex 1 或 错误码 width 140px / 描述 width 180px / 解决方案 flex 1）+ DeleteOutlined 删除按钮，底部"添加接口"/"添加错误码"按钮新增空条目。提交发布按钮：仅在编辑模式显示于页面底部左侧（蓝色背景#3b82f6，box-shadow，padding '8px 20px'），onClick 将 editContent 写回 skillContentMap[currentName] 并退出编辑模式。handleSubmit 函数执行浅拷贝合并，updateField 辅助函数处理嵌套字段更新。涉及文件：`src/pages/shared/skill-detail/index.tsx`, `src/pages/shared/skills/index.tsx` -->

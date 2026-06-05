# 全景概览页面设计文档

**日期**: 2026-05-22
**状态**: 待审批
**模块**: 智能服务 — 全景概览

---

## 架构

### 路由结构
```
/                              → MainLayout
  └─ /                         → Dashboard（全景概览页）
```

侧边栏菜单从当前 6 个一级菜单扩展为原型图的结构：

**全景概览**（展开默认选中）
- 智能服务
- 数据资产
- 知识&规则
- 模型能力

**Agent运营**
- 流程监控
- 操作日志
- badcase分析
- 标注&更新

**模型管理**
- 训练调优
- 评估验证
- 部署发布
- 版本管理

**平台管理**
- 异常告警
- 权限控制
- 用户管理
- 系统配置

### 页面布局

```
┌─────────────────────────────────────────────────┐
│  MainLayout (Sider + Header + Content)          │
│  └─ Content 区域 = Dashboard 组件                │
│     ├─ 模块 1: 智能服务                          │
│     │  ├─ 6 个智能体卡片 (Ant Design Card)       │
│     │  ├─ 趋势图 1: 自动化率变化趋势 (ECharts)   │
│     │  └─ 趋势图 2: 案件处理情况趋势 (ECharts)   │
│     ─ 模块 2: 底部 Tab 区域                     │
│        ├─ Tab 1: 数据资产                       │
│        │  ├─ 分类与规模（非结构化数据）           │
│        │  ├─ 分类与规模（结构化数据）             │
│        │  └─ 核心来源分布（ECharts Treemap）     │
│        └─ Tab 2: 知识&规则                      │
│           ├─ 知识库分类卡片                      │
│           ├─ 覆盖场景分布（ECharts Treemap）     │
│           └─ 高频调用知识&规则 Top 10            │
└─────────────────────────────────────────────────┘
```

---

## 组件设计

### 1. 侧边栏改造 (`src/layouts/MainLayout.tsx`)

**变更**: 将扁平 6 项菜单改为 4 组可折叠二级菜单，使用 Ant Design Menu `mode="inline"` 的 `items` 嵌套结构。默认展开「全景概览」组，选中「智能服务」。

### 2. 智能服务模块 (`src/pages/dashboard/components/smart-services/`)

#### 2.1 智能体卡片 (SmartAgentCard)

- 6 个卡片水平排列（超出换行），每个卡片包含：
  - 智能体名称（如"预受理智能体"）
  - 描述文字
  - 2 个指标（如案件代查率、问题件自动率），用不同颜色高亮
- 使用 Ant Design Card，size="small"

#### 2.2 自动化率趋势图 (AutomationRateChart)

- 多系列折线图（ECharts）
- X 轴：日期区间（近 N 天）
- Y 轴：自动化率 0-100%
- 多条线代表不同智能体
- 支持缩放、tooltip

#### 2.3 案件处理情况趋势图 (CaseProcessingChart)

- 多系列折线图（ECharts）
- X 轴：日期区间
- Y 轴：案件总量（数值）
- 多条线代表不同智能体
- 右侧附带统计数字卡片（案件总量、日均等）

### 3. 数据资产模块 (`src/pages/dashboard/components/data-assets/`)

#### 3.1 分类与规模 (ClassificationOverview)

**非结构化数据区域**:
- 顶部汇总条：总数 + 数据活跃度 + 累计使用量
- 3 列卡片组：影像数据 / 体检报告 / 其他非结构化
- 每列下方列出细分项（如"医疗发票照片 10,518"）+ 增减趋势

**结构化数据区域**:
- 同上结构
- 3 列卡片组：保单信息 / 案件信息 / 费用明细
- 每列下方列出细分项 + 增减趋势

#### 3.2 核心来源分布 (CoreSourceTreemap)

- ECharts treemap 图表
- 面积和颜色代表不同来源的数据沉淀规模
- 数据来源：医保直连接口 / 客户 APP 上传 / 第三方体检机构 / 柜面人工录入 / 外部渠道数据源

### 4. 知识&规则模块 (`src/pages/dashboard/components/knowledge-rules/`)

#### 4.1 知识库分类 (KnowledgeBaseCards)

- 4 组卡片，每组 3 列：
  - 核保知识库：产品与责任 / 核保规则参数 / 费率与险种规则
  - 理赔知识库：定责规则 / 理算与扣费 / 审核与反欺诈
- 每张卡片显示：文档数量 + 子项列表 + 增减趋势

#### 4.2 覆盖场景分布 (CoverageTreemap)

- ECharts treemap 图表
- 矩形代表不同保险场景：智选门诊非理赔 / 住院医疗保障 / 重疾大病保障 / 意外伤害责任/伤残 / 津贴赔付

#### 4.3 高频调用 Top 10 (TopKnowledgeList)

- 水平柱状图或进度条列表
- 排名 1-10，显示知识/规则名称 + 调用次数
- 前三名用不同颜色标识（金银铜）

### 5. Tab 容器 (`src/pages/dashboard/components/tab-container/`)

- 使用 Ant Design Tabs，两个 tab: "数据资产" / "知识&规则"
- 默认选中"数据资产"
- Tab 内部分别渲染对应子组件

---

## 数据流

### Mock 数据

当前无后端 API，所有数据使用 mock：
- `src/pages/dashboard/data/mock-data.ts` — 集中存放所有 mock 数据
- 数据结构与组件 props 对齐，后续接 API 时替换

### 状态管理

当前页面不需要复杂状态管理，使用 React `useState` 即可。Zustand 保留给后续跨页面共享状态。

---

## 文件清单

```
src/layouts/MainLayout.tsx                    # 改造侧边栏为二级菜单
src/pages/dashboard/index.tsx                 # Dashboard 主组件（组装各模块）
src/pages/dashboard/components/smart-services/
  ├── index.tsx                               # 智能服务模块入口
  ├── smart-agent-card.tsx                    # 单个智能体卡片
  ├── automation-rate-chart.tsx               # 自动化率趋势图
  └── case-processing-chart.tsx               # 案件处理趋势图
src/pages/dashboard/components/data-assets/
  ├── index.tsx                               # 数据资产模块入口
  ├── classification-overview.tsx             # 分类与规模
  ── core-source-treemap.tsx                 # 核心来源分布
src/pages/dashboard/components/knowledge-rules/
  ├── index.tsx                               # 知识&规则模块入口
  ├── knowledge-base-cards.tsx                # 知识库分类卡片
  ├── coverage-treemap.tsx                    # 覆盖场景分布
  └── top-knowledge-list.tsx                  # 高频调用 Top 10
src/pages/dashboard/components/tab-container/
  └── index.tsx                               # Tab 容器
src/pages/dashboard/data/
  └── mock-data.ts                            # Mock 数据
```

---

## 错误处理与边界

- 图表数据为空时展示 Ant Design Empty 组件
- 卡片内趋势数据缺失时显示 "--"
- 所有 ECharts 图表设置 `showLoading` 加载态（当前 mock 数据秒回，保留结构）

---

## 测试

- 页面加载后验证所有图表正常渲染
- Tab 切换验证数据正确切换
- 侧边栏折叠/展开验证

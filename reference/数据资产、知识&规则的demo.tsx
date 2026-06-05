import React, { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Database, BrainCircuit, TrendingUp, Activity, FileText, PieChart, ListOrdered } from 'lucide-react';

// --- 模拟数据 (Mock Data) ---

// 1. 数据资产数据
const dataAssetsMock = {
  unstructured: {
    title: "非结构化数据",
    totalCount: "42,500",
    categories: [
      {
        name: "影像数据", total: 21594,
        items: [
          { label: "医疗发票照片", count: 10518, d: "+12", w: "+85", m: "+320" },
          { label: "处方单影印件", count: 6510, d: "+8", w: "+50", m: "+210" },
          { label: "病案首页截图", count: 4566, d: "+5", w: "+32", m: "+150" },
        ]
      },
      {
        name: "体检报告", total: 10825,
        items: [
          { label: "入职体检报告", count: 6119, d: "+9", w: "+62", m: "+280" },
          { label: "常规年度体检", count: 4378, d: "+6", w: "+41", m: "+190" },
          { label: "专项筛查报告", count: 328, d: "+1", w: "+3", m: "+15" },
        ]
      },
      {
        name: "其他非结构化", total: 10081,
        items: [
          { label: "客服沟通录音", count: 8500, d: "+15", w: "+90", m: "+400" },
          { label: "查勘现场视频", count: 1581, d: "+2", w: "+12", m: "+50" },
        ]
      }
    ]
  },
  structured: {
    title: "结构化数据",
    totalCount: "45,000",
    categories: [
      {
        name: "保单信息", total: 25000,
        items: [
          { label: "寿险保单台账", count: 14000, d: "+50", w: "+350", m: "+1500" },
          { label: "健康险保单库", count: 8000, d: "+40", w: "+280", m: "+1200" },
          { label: "团险人员清单", count: 3000, d: "+10", w: "+70", m: "+300" },
        ]
      },
      {
        name: "案件信息", total: 12500,
        items: [
          { label: "立案基础信息", count: 6000, d: "+25", w: "+160", m: "+700" },
          { label: "结案审批记录", count: 5500, d: "+22", w: "+150", m: "+680" },
          { label: "案件轨迹日志", count: 1000, d: "+80", w: "+500", m: "+2000" },
        ]
      },
      {
        name: "费用明细", total: 7500,
        items: [
          { label: "门诊费用清单", count: 4000, d: "+35", w: "+220", m: "+950" },
          { label: "住院费用清单", count: 3000, d: "+18", w: "+110", m: "+480" },
          { label: "社保统筹结算", count: 500, d: "+5", w: "+30", m: "+120" },
        ]
      }
    ]
  }
};

const dataSourceDistribution = [
  { name: '医院直连接口 (HIS)', size: 4500, color: '#3b82f6' }, // blue-500
  { name: '客户APP上传', size: 3200, color: '#60a5fa' }, // blue-400
  { name: '第三方体检机构', size: 1800, color: '#93c5fd' }, // blue-300
  { name: '柜面人工录入', size: 1200, color: '#2dd4bf' }, // teal-400
  { name: '外部医保局数据', size: 900, color: '#818cf8' }, // indigo-400
];

// 2. 知识&规则数据
const knowledgeRulesMock = {
  underwriting: {
    title: "核保知识库",
    totalCount: "12,850",
    categories: [
      {
        name: "产品与责任", total: 6428,
        items: [
          { label: "重疾险责任定义", count: 3200, d: "+5", w: "+25", m: "+110" },
          { label: "医疗险免责条款", count: 2200, d: "+2", w: "+15", m: "+60" },
          { label: "意外险保障范围", count: 1028, d: "+1", w: "+8", m: "+30" },
        ]
      },
      {
        name: "核保规则参数", total: 3423,
        items: [
          { label: "疾病核保指南", count: 1700, d: "+12", w: "+60", m: "+250" },
          { label: "财务核保标准", count: 1000, d: "+3", w: "+18", m: "+80" },
          { label: "职业分类表", count: 723, d: "+0", w: "+2", m: "+5" },
        ]
      },
      {
        name: "费率与险种规则", total: 3000,
        items: [
          { label: "基础费率表", count: 2000, d: "+0", w: "+5", m: "+20" },
          { label: "加费计算逻辑", count: 1000, d: "+1", w: "+10", m: "+45" },
        ]
      }
    ]
  },
  claims: {
    title: "核赔知识库",
    totalCount: "20,560",
    categories: [
      {
        name: "定责规则", total: 9781,
        items: [
          { label: "疾病释义匹配库", count: 5000, d: "+20", w: "+150", m: "+600" },
          { label: "事故原因判定树", count: 3000, d: "+15", w: "+80", m: "+350" },
          { label: "免赔额触发条件", count: 1781, d: "+5", w: "+30", m: "+120" },
        ]
      },
      {
        name: "理算与扣费", total: 7276,
        items: [
          { label: "自费药剔除名录", count: 4800, d: "+50", w: "+300", m: "+1200" },
          { label: "合理用药规则库", count: 1500, d: "+18", w: "+120", m: "+480" },
          { label: "比例赔付计算式", count: 976, d: "+2", w: "+15", m: "+50" },
        ]
      },
      {
        name: "审核与反欺诈", total: 3503,
        items: [
          { label: "疑似欺诈特征库", count: 1800, d: "+25", w: "+180", m: "+700" },
          { label: "高危医院黑名单", count: 1000, d: "+8", w: "+45", m: "+180" },
          { label: "异常就诊行为集", count: 703, d: "+10", w: "+60", m: "+250" },
        ]
      }
    ]
  }
};

const scenarioDistribution = [
  { name: '普通门急诊理赔', size: 5000, color: '#34d399' }, // emerald-400
  { name: '重大疾病确诊', size: 3500, color: '#f87171' }, // red-400
  { name: '住院医疗报销', size: 4200, color: '#fbbf24' }, // amber-400
  { name: '意外伤害身故/伤残', size: 2100, color: '#a78bfa' }, // violet-400
  { name: '津贴型补偿', size: 1500, color: '#60a5fa' }, // blue-400
];

const topKnowledgeList = [
  { id: 1, name: "甲状腺结节核保指南 v2.1", calls: 45430 },
  { id: 2, name: "2024版国家医保目录剔除规则", calls: 38210 },
  { id: 3, name: "急性阑尾炎标准住院天数限制", calls: 35600 },
  { id: 4, name: "高血压Ⅱ期并发症判定逻辑", calls: 26320 },
  { id: 5, name: "门诊统筹起付线扣减规则", calls: 15100 },
  { id: 6, name: "骨折内固定器材合理费用标准", calls: 14900 },
  { id: 7, name: "重疾险确诊报告必须项检查", calls: 8200 },
  { id: 8, name: "意外身故警方案件性质要求", calls: 6500 },
  { id: 9, name: "乳腺癌特定靶向药赔付目录", calls: 5100 },
  { id: 10, name: "异地就医结算比例换算公式", calls: 4400 },
];


// --- UI 组件 ---

// Treemap 自定义渲染块
const CustomizedTreemapContent = (props) => {
  const { root, depth, x, y, width, height, index, payload, name } = props;
  
  // 提供一组默认的丰富调色板
  const COLORS = ['#3b82f6', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf', '#818cf8'];

  // 安全获取背景色：优先读取数据源自带的 color，如果 Recharts 嵌套层级导致拿不到，则通过 index 自动分配不同颜色
  const bgColor = props.color || payload?.color || COLORS[index % COLORS.length];
  const displayName = typeof name === 'string' ? name : payload?.name;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth === 1 ? bgColor : 'transparent',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && width > 50 && height > 30 && displayName && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
          {displayName}
        </text>
      )}
    </g>
  );
};

// 类别区块组件 (模仿图2深色头部区域)
const SectionHeader = ({ title, countText, activityLevel, usageCount, labelPrefix = "数据" }) => (
  <div className="flex items-center mb-4 mt-6">
    <div className="bg-[#2c3e50] text-white px-5 py-2 rounded-full font-bold shadow-md flex items-center gap-2 shrink-0">
      {title}
    </div>
    
    {/* 恢复文字和数据，仅删除背景框和边框 */}
    {countText && (
      <div className="text-gray-700 ml-4 text-sm font-medium flex items-center gap-2 shrink-0">
        <FileText size={16} className="text-blue-500" />
        {countText}
      </div>
    )}

    {(activityLevel || usageCount) && (
      <div className="flex items-center ml-6 text-sm font-medium">
        {activityLevel && (
          <span className="text-gray-600 mr-6">
            {labelPrefix}活跃度：
            <span className={`font-bold ml-1 ${activityLevel === '高' ? 'text-red-500' : activityLevel === '中' ? 'text-amber-500' : 'text-green-500'}`}>{activityLevel}</span>
          </span>
        )}
        {usageCount && (
          <span className="text-gray-600">
            {labelPrefix}累计使用量：
            <span className="font-bold text-blue-600 ml-1">{usageCount} 次</span>
          </span>
        )}
      </div>
    )}
  </div>
);

// 数据卡片组件 (模仿图2浅蓝色头部卡片)
const DataCard = ({ category, unit = "篇文档" }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
    {/* 卡片头部 */}
    <div className="bg-[#7fb3f5] text-white py-2 px-4 text-center font-medium">
      {category.name} <span className="ml-1 opacity-90">{category.total.toLocaleString()} {unit}</span>
    </div>
    {/* 卡片内容列表 */}
    <div className="p-4 space-y-3 min-h-[140px]">
      {category.items.map((item, idx) => (
        <div key={idx} className="flex flex-col border-b border-gray-100 last:border-0 pb-2 last:pb-0">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-700 font-medium truncate pr-2">{item.label}</span>
            <span className="text-gray-900 font-bold">{item.count.toLocaleString()}</span>
          </div>
          {/* 增量指标 */}
          <div className="flex justify-end gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-0.5"><span className="text-emerald-500">{item.d}</span>/日</span>
            <span className="flex items-center gap-0.5"><span className="text-emerald-500">{item.w}</span>/周</span>
            <span className="flex items-center gap-0.5"><span className="text-emerald-500">{item.m}</span>/月</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);


export default function ClaimsDashboard() {
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'knowledge'

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-6 font-sans">
      
      {/* 页面全局 Tabs (左上角) */}
      <div className="flex mb-6">
        <div className="flex bg-gray-200/80 p-1 rounded-lg shadow-inner">
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'data' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            数据资产
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-6 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'knowledge' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            知识&规则
          </button>
        </div>
      </div>

      {/* ==================== 2.2 数据资产模块 ==================== */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* 核心区域：数据资产目录 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-500 pl-3 mb-4">分类与规模</h2>
            
            {/* 非结构化数据区 */}
            <SectionHeader 
              title={dataAssetsMock.unstructured.title} 
              countText={`${dataAssetsMock.unstructured.totalCount} 份影像/文件`}
              activityLevel="高" 
              usageCount="158,200" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {dataAssetsMock.unstructured.categories.map((cat, i) => <DataCard key={i} category={cat} unit="份影像/文件" />)}
            </div>

            <div className="h-6"></div> {/* 间距 */}

            {/* 结构化数据区 */}
            <SectionHeader 
              title={dataAssetsMock.structured.title} 
              countText={`${dataAssetsMock.structured.totalCount} 条记录`}
              activityLevel="高" 
              usageCount="342,000" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {dataAssetsMock.structured.categories.map((cat, i) => <DataCard key={i} category={cat} unit="条记录" />)}
            </div>
          </div>

          {/* 底部：核心来源分布图 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-500 pl-3 mb-6 flex items-center gap-2">
              核心来源分布
            </h2>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={dataSourceDistribution}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  content={<CustomizedTreemapContent />}
                >
                  <RechartsTooltip formatter={(value) => [`${value} 万条`, '数据量']} />
                </Treemap>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">* 方块面积与颜色代表不同来源的数据沉淀规模</p>
          </div>
        </div>
      )}


      {/* ==================== 2.3 知识&规则模块 ==================== */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* 核心区域：知识规则目录 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">分类与规模</h2>
            
            {/* 核保知识区 */}
            <SectionHeader 
              title={knowledgeRulesMock.underwriting.title} 
              countText={`${knowledgeRulesMock.underwriting.totalCount} 篇文档`}
              activityLevel="中" 
              usageCount="56,200" 
              labelPrefix="知识"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {knowledgeRulesMock.underwriting.categories.map((cat, i) => <DataCard key={i} category={cat} />)}
            </div>

            <div className="h-6"></div>

            {/* 核赔知识区 */}
            <SectionHeader 
              title={knowledgeRulesMock.claims.title} 
              countText={`${knowledgeRulesMock.claims.totalCount} 篇文档`}
              activityLevel="高" 
              usageCount="198,000" 
              labelPrefix="知识"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {knowledgeRulesMock.claims.categories.map((cat, i) => <DataCard key={i} category={cat} />)}
            </div>
          </div>

          {/* 底部两列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 底部左侧：覆盖场景分布图 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-6 flex items-center gap-2">
                覆盖场景分布
              </h2>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={scenarioDistribution}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomizedTreemapContent />}
                  >
                    <RechartsTooltip formatter={(value) => [`被调用 ${value} 万次`, '覆盖热度']} />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 底部右侧：高频调用知识 Top10 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-6 flex items-center gap-2">
                高频调用知识 & 规则 Top 10
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {topKnowledgeList.map((item, index) => {
                  const maxCalls = topKnowledgeList[0].calls;
                  const percentage = (item.calls / maxCalls) * 100;
                  return (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0
                        ${index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">{item.name}</span>
                          <span className="text-gray-500 text-xs">{item.calls.toLocaleString()} 次</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${index < 3 ? 'bg-orange-400' : 'bg-blue-400'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
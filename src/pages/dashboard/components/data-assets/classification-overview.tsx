import React from 'react'
import { DataCard } from '../shared/data-card'
import CoreSourceTreemap from './core-source-treemap'

const FIVE_CATEGORIES = [
  {
    name: '病历类',
    total: 88200,
    items: [
      { label: '门诊病历', count: 18500, d: '180', w: '1200', m: '4800' },
      { label: '住院病历', count: 15200, d: '120', w: '800', m: '3200' },
      { label: '出院小结', count: 12800, d: '95', w: '650', m: '2800' },
      { label: '手术记录', count: 10500, d: '80', w: '550', m: '2200' },
      { label: '病理报告', count: 8200, d: '60', w: '420', m: '1800' },
      { label: '检验检查', count: 12000, d: '100', w: '680', m: '2700' },
      { label: '诊断证明', count: 6500, d: '50', w: '340', m: '1400' },
      { label: '处方笺', count: 4500, d: '35', w: '230', m: '950' },
    ],
  },
  {
    name: '票据类',
    total: 42500,
    items: [
      { label: '医疗票据', count: 28000, d: '220', w: '1500', m: '6000' },
      { label: '增值税发票', count: 14500, d: '110', w: '750', m: '3100' },
    ],
  },
  {
    name: '费用结算类',
    total: 38000,
    items: [
      { label: '费用清单', count: 22000, d: '170', w: '1100', m: '4600' },
      { label: '结算单', count: 10500, d: '80', w: '550', m: '2300' },
      { label: '第三方分割单', count: 5500, d: '40', w: '280', m: '1150' },
    ],
  },
  {
    name: '辅助证明类',
    total: 55000,
    items: [
      { label: '身份证件', count: 35000, d: '280', w: '1900', m: '7600' },
      { label: '支付证件', count: 12000, d: '90', w: '620', m: '2500' },
      { label: '事故证明', count: 8000, d: '60', w: '410', m: '1700' },
    ],
  },
  {
    name: '申请类',
    total: 18000,
    items: [
      { label: '理赔申请书', count: 18000, d: '140', w: '950', m: '3800' },
    ],
  },
]

const ClassificationOverview: React.FC = () => {
  return (
    <div>
      {/* 分类与规模标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: '#3b82f6',
          borderRadius: 10,
          marginRight: 10,
        }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>影像数据</span>
      </div>

      {/* 左右三列布局：左列病历类，中列票据类+费用结算类，右列辅助证明类+申请类，三列等高 */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* 第1列：病历类（8行内容，自然高度最大） */}
        <div style={{ flex: '1 1 0', height: 550 }}>
          <DataCard category={FIVE_CATEGORIES[0]} unit="份" headerUnit="份" style={{ height: '100%' }} />
        </div>
        {/* 第2列：票据类 + 费用结算类，上下均分 */}
        <div style={{ flex: '1 1 0', height: 550, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <DataCard category={FIVE_CATEGORIES[1]} unit="份" headerUnit="份" style={{ height: 265 }} />
          <DataCard category={FIVE_CATEGORIES[2]} unit="份" headerUnit="份" style={{ height: 265 }} />
        </div>
        {/* 第3列：辅助证明类 + 申请类，上下均分 */}
        <div style={{ flex: '1 1 0', height: 550, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <DataCard category={FIVE_CATEGORIES[3]} unit="份" headerUnit="份" style={{ height: 265 }} />
          <DataCard category={FIVE_CATEGORIES[4]} unit="份" headerUnit="份" style={{ height: 265 }} />
        </div>
      </div>

      {/* 核心来源分布 */}
      <CoreSourceTreemap />
    </div>
  )
}

export default ClassificationOverview

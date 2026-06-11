import React from 'react'
import { Row, Col } from 'antd'
import { DataCard } from '../shared/data-card'
import CoreSourceTreemap from './core-source-treemap'

const FOUR_CATEGORIES = [
  {
    name: '病历类数据',
    total: 56500,
    items: [
      { label: '住院病历', count: 15200, d: '120', w: '800', m: '3200' },
      { label: '门诊病历', count: 28500, d: '230', w: '1500', m: '6100' },
      { label: '出院小结', count: 12800, d: '95', w: '650', m: '2800' },
    ],
  },
  {
    name: '发票类数据',
    total: 60100,
    items: [
      { label: '医疗发票', count: 32000, d: '280', w: '1800', m: '7500' },
      { label: '药品发票', count: 18500, d: '150', w: '980', m: '4200' },
      { label: '检查发票', count: 9600, d: '75', w: '520', m: '2100' },
    ],
  },
  {
    name: '报告类数据',
    total: 75200,
    items: [
      { label: '检验报告', count: 42000, d: '350', w: '2200', m: '9500' },
      { label: '影像报告', count: 25000, d: '200', w: '1300', m: '5800' },
      { label: '病理报告', count: 8200, d: '60', w: '420', m: '1800' },
    ],
  },
  {
    name: '其它',
    total: 73800,
    items: [
      { label: '身份证明', count: 52000, d: '400', w: '2800', m: '12000' },
      { label: '保单信息', count: 15000, d: '110', w: '750', m: '3200' },
      { label: '其他材料', count: 6800, d: '50', w: '350', m: '1500' },
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
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>分类与规模</span>
      </div>

      {/* 4个数据卡片 */}
      <Row gutter={[20, 20]}>
        {FOUR_CATEGORIES.map((cat, i) => (
          <Col xs={24} sm={12} md={12} lg={6} key={i}>
            <DataCard category={cat} unit="份" headerUnit="份" />
          </Col>
        ))}
      </Row>

      {/* 核心来源分布 */}
      <CoreSourceTreemap />
    </div>
  )
}

export default ClassificationOverview

import React from 'react'
import { Card, Row, Col, Statistic, Progress } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { antifraudAgents } from '../../dashboard/data/mock-data'
import SmartAgentCard from '../../dashboard/components/smart-services/smart-agent-card'

const AgentAntiFraud: React.FC = () => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1d2129' }}>
        反欺诈智能体
      </h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃智能体"
              value={antifraudAgents.length}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日预警案件"
              value={156}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均响应时长"
              value={18}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高危案件"
              value={23}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="智能体运行状态" size="small">
        <Row gutter={[16, 16]}>
          {antifraudAgents.map((agent) => (
            <Col span={12} key={agent.name}>
              <SmartAgentCard agent={agent} />
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="检出率表现" style={{ marginTop: 16 }} size="small">
        <div style={{ padding: 16 }}>
          {antifraudAgents.map((agent) => (
            <div key={agent.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{agent.name}</span>
                <span style={{ fontSize: 13, color: '#ff4d4f', fontWeight: 500 }}>
                  {agent.metrics[0].value}
                </span>
              </div>
              <Progress
                percent={parseFloat(agent.metrics[0].value.replace(/[^0-9.]/g, ''))}
                strokeColor={parseFloat(agent.metrics[0].value) > 90 ? '#52c41a' : '#faad14'}
                size="small"
                showInfo={false}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default AgentAntiFraud

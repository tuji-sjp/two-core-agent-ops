import React from 'react'
import { Card, Row, Col, Statistic, Progress } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { underwritingAgents } from '../../dashboard/data/mock-data'
import SmartAgentCard from '../../dashboard/components/smart-services/smart-agent-card'

const AgentUnderwriting: React.FC = () => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#1d2129' }}>
        核保智能体
      </h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃智能体"
              value={underwritingAgents.length}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日核保案件"
              value={892}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均核保时长"
              value={45}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待人工复核"
              value={28}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="智能体运行状态" size="small">
        <Row gutter={[16, 16]}>
          {underwritingAgents.map((agent) => (
            <Col span={12} key={agent.name}>
              <SmartAgentCard agent={agent} />
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="自动化率趋势" style={{ marginTop: 16 }} size="small">
        <div style={{ padding: 16 }}>
          {underwritingAgents.map((agent) => (
            <div key={agent.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{agent.name}</span>
                <span style={{ fontSize: 13, color: '#1677ff', fontWeight: 500 }}>
                  {agent.metrics[0].value}
                </span>
              </div>
              <Progress
                percent={parseFloat(agent.metrics[0].value)}
                strokeColor="#1677ff"
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

export default AgentUnderwriting

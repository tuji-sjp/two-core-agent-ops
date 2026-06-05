import React from 'react'
import ChinaMapPanel from './components/ChinaMapPanel'
import CityStatsTable from './components/CityStatsTable'
import ScrollingCases from './components/ScrollingCases'

const DashboardHeader: React.FC = () => (
  <div style={{
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
    background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.06), transparent)',
    position: 'relative',
  }}>
    {/* 左侧装饰线 */}
    <div style={{
      position: 'absolute',
      left: 24,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{
        width: 32,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #00d4ff)',
      }} />
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        border: '1px solid #00d4ff',
        boxShadow: '0 0 6px rgba(0, 212, 255, 0.5)',
      }} />
    </div>

    <h1 style={{
      fontSize: 18,
      fontWeight: 700,
      color: '#e0e7ff',
      letterSpacing: 4,
      margin: 0,
      textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
    }}>
      两核智能体 · 业务全景大屏
    </h1>

    {/* 右侧装饰线 */}
    <div style={{
      position: 'absolute',
      right: 24,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        border: '1px solid #00d4ff',
        boxShadow: '0 0 6px rgba(0, 212, 255, 0.5)',
      }} />
      <div style={{
        width: 32,
        height: 2,
        background: 'linear-gradient(270deg, transparent, #00d4ff)',
      }} />
    </div>
  </div>
)

const SectionLabel: React.FC<{ text: string; color?: string }> = ({ text, color = '#00d4ff' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    marginBottom: 8,
  }}>
    <div style={{
      width: 3,
      height: 14,
      background: color,
      borderRadius: 2,
      boxShadow: `0 0 8px ${color}60`,
    }} />
    <span style={{
      fontSize: 13,
      fontWeight: 600,
      color,
      letterSpacing: 1,
    }}>
      {text}
    </span>
  </div>
)

const BusinessOverview: React.FC = () => {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0e27 0%, #0f1535 50%, #0a0e27 100%)',
      borderRadius: 16,
      border: '1px solid rgba(0, 212, 255, 0.15)',
      boxShadow: '0 0 40px rgba(0, 212, 255, 0.05), inset 0 0 60px rgba(0, 212, 255, 0.02)',
      overflow: 'hidden',
    }}>
      {/* 全局 CSS 动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>

      <DashboardHeader />

      {/* 上部：地图 + 城市统计 (flex: 3) */}
      <div style={{
        flex: 3,
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        minHeight: 0,
      }}>
        {/* 左上：中国地图 */}
        <div style={{
          flex: 1.6,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(0, 212, 255, 0.12)',
          borderRadius: 12,
          background: 'rgba(10, 14, 39, 0.4)',
          overflow: 'hidden',
        }}>
          <SectionLabel text="全国案件热力分布" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 8px 8px', display: 'flex' }}>
            <ChinaMapPanel />
          </div>
        </div>

        {/* 右上：城市统计表格 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(0, 212, 255, 0.12)',
          borderRadius: 12,
          background: 'rgba(10, 14, 39, 0.4)',
          overflow: 'hidden',
        }}>
          <CityStatsTable />
        </div>
      </div>

      {/* 下部：滚动案件流 (flex: 2) */}
      <div style={{
        flex: 2,
        padding: '0 16px 16px',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          flex: 1,
          border: '1px solid rgba(0, 212, 255, 0.12)',
          borderRadius: 12,
          background: 'rgba(10, 14, 39, 0.4)',
          overflow: 'hidden',
        }}>
          <ScrollingCases />
        </div>
      </div>
    </div>
  )
}

export default BusinessOverview

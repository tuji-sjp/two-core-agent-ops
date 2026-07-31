import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [account, setAccount] = useState(() => localStorage.getItem('remembered_account') || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  // 登录
  const handleLogin = () => {
    if (!account) { message.warning('请输入账号'); return }
    if (!password) { message.warning('请输入密码'); return }

    // 记住用户名（30天）
    if (remember) {
      localStorage.setItem('remembered_account', account)
    } else {
      localStorage.removeItem('remembered_account')
    }

    // 写入登录态
    localStorage.setItem('auth_token', 'mock_token_' + Date.now())
    localStorage.setItem('auth_account', account)
    localStorage.setItem('auth_login_time', String(Date.now()))

    message.success('登录成功')
    navigate('/business/overview', { replace: true })
  }

  // 输入框通用样式
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '0 16px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fafafa',
    transition: 'border-color 0.2s',
    color: '#262626',
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <div style={{
        width: 440,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '32px 36px 40px',
        position: 'relative',
      }}>
        {/* 欢迎标题 */}
        <h2 style={{
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 700,
          color: '#1d2129',
          marginBottom: 28,
          marginTop: 0,
        }}>
          欢迎来到两核运营平台
        </h2>

        {/* 表单 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 账号 */}
          <input
            type="text"
            placeholder="请输入账号"
            value={account}
            onChange={e => setAccount(e.target.value)}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#f5a623' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e0e0e0' }}
          />

          {/* 密码 */}
          <input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#f5a623' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e0e0e0' }}
          />

          {/* 记住用户名 */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: '#f5a623',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: 14, color: '#595959' }}>记住用户名（30天）</span>
          </label>

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              height: 48,
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #f5c842 0%, #f5a623 100%)',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'opacity 0.2s',
              letterSpacing: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            登 录
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

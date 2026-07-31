// 认证工具 - localStorage 登录态管理
// 前端 mock 登录，生产环境替换为后端 API 调用

export const Auth = {
  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    // 24 小时过期
    const loginTime = Number(localStorage.getItem('auth_login_time') || 0)
    return Date.now() - loginTime < 24 * 60 * 60 * 1000
  },

  getAccount(): string {
    return localStorage.getItem('auth_account') || ''
  },

  login(token: string, account: string) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_account', account)
    localStorage.setItem('auth_login_time', String(Date.now()))
  },

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_account')
    localStorage.removeItem('auth_login_time')
  },
}

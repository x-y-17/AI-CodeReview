import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    console.error('API请求错误:', error)

    if (error.response) {
      // 服务器响应了错误状态码
      const message = error.response.data?.message || `请求失败: ${error.response.status}`
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // 请求发出但没有收到响应
      return Promise.reject(new Error('网络连接失败，请检查网络状态'))
    } else {
      // 其他错误
      return Promise.reject(new Error(error.message || '未知错误'))
    }
  }
)

export default api

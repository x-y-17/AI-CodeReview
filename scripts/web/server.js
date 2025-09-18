import express from 'express'
import path from 'path'
import cors from 'cors'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { execSync } from 'child_process'
import open from 'open'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class WebServer {
  constructor(options = {}) {
    this.port = options.port || 3000
    this.autoOpen = options.autoOpen !== false
    this.reviewData = null

    this.app = express()
    this.setupMiddleware()
    this.setupRoutes()
  }

  setupMiddleware() {
    // 基础中间件
    this.app.use(cors())
    this.app.use(compression())
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // 静态文件服务
    const publicPath = path.join(__dirname, 'public')
    console.log('🚀 ~ WebServer ~ setupMiddleware ~ publicPath:', publicPath)
    const frontendPath = path.join(__dirname, 'frontend')
    console.log('🚀 ~ WebServer ~ setupMiddleware ~ frontendPath:', frontendPath)

    // 检查是否存在构建后的public目录
    if (existsSync(publicPath)) {
      console.log('📁 使用构建后的生产版本：', publicPath)
      this.app.use(express.static(publicPath))
    } else {
      console.log('📦 首次运行，正在自动构建前端应用...')
      try {
        const frontendDir = path.join(__dirname, 'frontend')
        process.chdir(frontendDir)

        // 检查是否已安装依赖
        if (!existsSync(path.join(frontendDir, 'node_modules'))) {
          console.log('📥 安装前端依赖...')
          execSync('npm install', { stdio: 'inherit' })
        }

        console.log('🔨 构建前端应用...')
        execSync('npm run build', { stdio: 'inherit' })

        // 恢复工作目录
        process.chdir(path.dirname(path.dirname(__dirname)))

        console.log('✅ 前端构建完成！')
        this.app.use(express.static(publicPath))
      } catch (error) {
        console.error('❌ 前端构建失败:', error.message)
        throw new Error('无法构建前端应用，请检查 Node.js 和 npm 是否正确安装')
      }
    }

    // 开发模式下的代理设置（如果前端在开发服务器上）
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        next()
      })
    }
  }

  setupRoutes() {
    // API路由
    this.app.get('/api/review-data', this.getReviewData.bind(this))
    this.app.get('/api/config', this.getConfig.bind(this))
    this.app.post('/api/export', this.exportReport.bind(this))
    this.app.post('/api/commit', this.handleCommit.bind(this))

    // SPA路由 - 所有非API请求都返回index.html
    this.app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        const indexPath = path.join(__dirname, 'public', 'index.html')
        res.sendFile(indexPath)
      } else {
        res.status(404).json({ error: 'API endpoint not found' })
      }
    })
  }

  // API处理方法
  getReviewData(req, res) {
    try {
      console.log('🔍 API调用: /review-data')
      console.log('📊 审查数据状态:', this.reviewData ? '有数据' : '无数据')

      if (!this.reviewData) {
        console.log('⚠️ 没有审查数据，返回404')
        return res.status(404).json({
          error: '没有可用的审查数据',
          message: '请先运行代码审查'
        })
      }

      console.log('✅ 返回审查数据，文件数量:', this.reviewData.files?.length || 0)
      res.json({
        success: true,
        data: this.reviewData,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ 获取审查数据失败:', error)
      res.status(500).json({
        error: '服务器内部错误',
        message: error.message
      })
    }
  }

  getConfig(req, res) {
    try {
      res.json({
        success: true,
        config: {
          version: '1.5.2',
          features: ['export', 'theme-toggle', 'real-time'],
          supportedFormats: ['markdown', 'pdf', 'json']
        }
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  async exportReport(req, res) {
    try {
      const { format = 'markdown', data } = req.body

      if (!data && !this.reviewData) {
        return res.status(400).json({
          error: '没有可导出的数据'
        })
      }

      const exportData = data || this.reviewData
      const content = this.generateExportContent(exportData, format)
      const filename = this.generateFilename(format)

      res.json({
        success: true,
        content,
        filename,
        format
      })
    } catch (error) {
      console.error('导出报告失败:', error)
      res.status(500).json({
        error: '导出失败',
        message: error.message
      })
    }
  }

  handleCommit(req, res) {
    try {
      // 这里可以集成到现有的git提交流程
      // 目前返回确认信息
      res.json({
        success: true,
        message: '提交请求已处理',
        action: 'continue-commit'
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // 工具方法
  generateExportContent(data, format) {
    switch (format) {
      case 'markdown':
        return this.generateMarkdownReport(data)
      case 'json':
        return JSON.stringify(data, null, 2)
      default:
        return this.generateMarkdownReport(data)
    }
  }

  generateMarkdownReport(data) {
    const { summary, files, timestamp } = data

    let content = `# AI 代码审查报告\n\n`
    content += `**生成时间**: ${new Date(timestamp).toLocaleString('zh-CN')}\n`
    content += `**审查文件数**: ${summary.total}\n`
    content += `**通过文件**: ${summary.passed}\n`
    content += `**需要注意**: ${summary.hasIssues}\n\n`

    if (files.length === 0) {
      content += `## 审查结果\n\n✅ **代码分析完成，未发现问题**\n\n`
    } else {
      content += `## 详细分析结果\n\n`

      files.forEach((file, index) => {
        const statusIcon = file.status === 'success' ? '✅' : '⚠️'
        content += `### ${index + 1}. ${statusIcon} ${file.fullPath}\n\n`
        content += `${file.analysis}\n\n`
        content += `---\n\n`
      })
    }

    content += `## 说明\n\n`
    content += `本报告由 AI 代码审查工具自动生成，用于辅助代码质量检查。\n`
    content += `请结合实际情况判断建议的合理性。\n\n`
    content += `*生成工具*: @x648525845/ai-codereview\n`

    return content
  }

  generateFilename(format) {
    const timestamp = new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(/\//g, '-')
      .replace(/\s/g, '_')
      .replace(/:/g, '-')

    const extension = format === 'json' ? 'json' : 'md'
    return `AI_CODE_REVIEW-${timestamp}.${extension}`
  }

  // 设置审查数据
  setReviewData(data) {
    this.reviewData = data
  }

  // 启动服务器
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          const url = `http://localhost:${this.port}`
          console.log(`\n🌐 AI代码审查Web界面已启动`)
          console.log(`📍 访问地址: ${url}`)
          console.log(`⚙️  端口: ${this.port}`)

          if (this.autoOpen) {
            console.log(`🚀 正在打开浏览器...`)
            open(url).catch((err) => {
              console.warn('⚠️  自动打开浏览器失败:', err.message)
              console.log(`💡 请手动访问: ${url}`)
            })
          }

          resolve(this.server)
        })

        this.server.on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`❌ 端口 ${this.port} 已被占用，请尝试其他端口`)
          } else {
            console.error('❌ 服务器启动失败:', error.message)
          }
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // 停止服务器
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Web服务器已停止')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}

export default WebServer

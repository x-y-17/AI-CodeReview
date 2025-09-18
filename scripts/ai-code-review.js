// scripts/ai-code-review.js
import OpenAI from 'openai'
import VcsUtils from './vcs-utils.js'

class AICodeReviewer {
  constructor(options = {}) {
    this.vcsUtils = new VcsUtils(options)

    // 设置系统提示词
    this.systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt()

    // 配置 AI 模型参数 - 支持环境变量和构造函数参数
    this.config = {
      apiKey: options.apiKey || process.env.API_KEY || process.env.DEEPSEEK_API_KEY || process.env.MOONSHOT_API_KEY,
      baseURL: options.baseURL || process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
      model: options.model || process.env.AI_MODEL || 'deepseek-chat',
      maxTokens: options.maxTokens || parseInt(process.env.AI_MAX_TOKENS) || 2000,
      temperature: options.temperature || parseFloat(process.env.AI_TEMPERATURE) || 0.3,
      // 输出模式配置：'web' Web界面（默认），'file' 生成文件, 'console' 控制台输出
      outputMode: options.outputMode || process.env.AI_OUTPUT_MODE || 'web',
      // Web界面配置
      webUI: options.webUI !== false && process.env.WEB_UI_ENABLED !== 'false',
      webPort: options.webPort || parseInt(process.env.WEB_UI_PORT) || 3000,
      autoOpenBrowser: options.autoOpenBrowser !== false && process.env.WEB_UI_AUTO_OPEN !== 'false'
    }

    // 尝试初始化AI客户端
    try {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL
      })
    } catch (error) {
      console.warn('⚠️  AI 客户端初始化失败:', error.message)
      this.openai = null
    }
  }

  /**
   * 获取默认系统提示词
   */
  getDefaultSystemPrompt() {
    return `你是一个专业的代码审查专家。请分析提供的代码变更，重点关注：
1. 代码质量和最佳实践
2. 潜在的bug和安全问题
3. 性能优化建议
4. 代码可读性和维护性
5. 测试覆盖率建议

请用中文回复，格式简洁明了。如果没有问题，请简单确认代码看起来不错。`
  }

  /**
   * 获取当前配置信息
   */
  getConfig() {
    return {
      baseURL: this.config.baseURL,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      hasApiKey: !!this.config.apiKey
    }
  }

  /**
   * 显示当前配置信息
   */
  displayConfig() {
    const config = this.getConfig()
    console.log('🔧 当前 AI 配置:')
    console.log(`   Base URL: ${config.baseURL}`)
    console.log(`   Model: ${config.model}`)
    console.log(`   Max Tokens: ${config.maxTokens}`)
    console.log(`   Temperature: ${config.temperature}`)
    console.log(`   API Key: ${config.hasApiKey ? '已配置' : '未配置'}`)
    console.log(`   Output Mode: ${this.config.outputMode}`)

    // 显示Web界面配置
    if (this.config.webUI) {
      console.log('🌐 Web界面配置:')
      console.log(`   启用状态: ${this.config.webUI ? '已启用' : '未启用'}`)
      console.log(`   端口: ${this.config.webPort}`)
      console.log(`   自动打开浏览器: ${this.config.autoOpenBrowser ? '是' : '否'}`)
    }

    // 显示VCS信息
    this.vcsUtils.displayVcsInfo()
  }

  /**
   * 分析代码变更
   */
  async analyzeChanges() {
    console.log('🔍 正在分析代码变更...')

    const stagedFiles = this.vcsUtils.getStagedFiles()

    if (stagedFiles.length === 0) {
      console.log('ℹ️  没有检测到代码变更')
      return { success: true, feedback: [] }
    }

    const relevantFiles = this.vcsUtils.filterRelevantFiles(stagedFiles)

    if (relevantFiles.length === 0) {
      console.log('ℹ️  没有需要分析的代码文件')
      return { success: true, feedback: [] }
    }

    console.log(`📁 分析文件: ${relevantFiles.join(', ')}`)

    const feedback = []

    for (const file of relevantFiles) {
      try {
        const fileFeedback = await this.analyzeFile(file)
        if (fileFeedback) {
          feedback.push(fileFeedback)
        }
      } catch (error) {
        console.error(`❌ 分析文件 ${file} 时出错:`, error.message)
      }
    }

    return { success: true, feedback }
  }

  /**
   * 分析单个文件
   */
  async analyzeFile(filename) {
    const diff = this.vcsUtils.getFileDiff(filename)
    const fullContent = this.vcsUtils.getFileContent(filename)

    if (!diff) {
      return null
    }

    const prompt = this.buildAnalysisPrompt(filename, diff, fullContent)

    try {
      // 检查 OpenAI 客户端是否可用
      if (!this.openai) {
        throw new Error('OpenAI 客户端未初始化或初始化失败')
      }

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return {
        filename,
        analysis: response.choices[0].message.content,
        hasIssues: this.detectIssues(response.choices[0].message.content),
        diff: diff // 添加diff信息
      }
    } catch (error) {
      console.error(`AI分析失败 (${filename}):`, error.message)
      return null
    }
  }

  /**
   * 构建分析提示词
   */
  buildAnalysisPrompt(filename, diff, fullContent) {
    return `
文件: ${filename}

代码变更:
\`\`\`diff
${diff}
\`\`\`

${
  fullContent
    ? `完整文件内容（仅供上下文参考）:
\`\`\`
${fullContent.length > 2000 ? fullContent.substring(0, 2000) + '...' : fullContent}
\`\`\`
`
    : ''
}

请分析这些变更并提供反馈意见。
`
  }

  /**
   * 检测是否有严重问题
   */
  detectIssues(analysis) {
    const issueKeywords = ['错误', '问题', 'bug', '安全', '性能', '建议修改', '需要注意']
    return issueKeywords.some((keyword) => analysis.toLowerCase().includes(keyword.toLowerCase()))
  }

  /**
   * 生成代码审查报告文件
   */
  async generateReportFile(feedback) {
    const fs = await import('fs')
    const path = await import('path')

    // 获取当前时间戳
    const now = new Date()
    const timestamp = now
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(/\//g, '-') // 只替换斜杠为短横线，保留空格和冒号
      .replace(/\s/g, '_') // 将空格替换为下划线，避免文件名问题

    // 生成文件名
    const filename = `AI_CODE_REVIEW-${timestamp}.md`
    const filepath = path.join(process.cwd(), filename)

    // 构建报告内容
    let reportContent = `# AI 代码审查报告\n\n`
    reportContent += `**生成时间**: ${now.toLocaleString('zh-CN')}\n`
    reportContent += `**审查文件数**: ${feedback.length}\n\n`

    if (feedback.length === 0) {
      reportContent += `## 审查结果\n\n✅ **代码分析完成，未发现问题**\n\n`
      reportContent += `所有代码变更都符合质量标准，可以安全提交。\n`
    } else {
      // 统计问题
      const hasIssuesCount = feedback.filter((item) => item.hasIssues).length

      reportContent += `## 审查概览\n\n`
      reportContent += `- 🔍 **分析文件**: ${feedback.length} 个\n`
      reportContent += `- ⚠️ **发现问题的文件**: ${hasIssuesCount} 个\n`
      reportContent += `- ✅ **无问题文件**: ${feedback.length - hasIssuesCount} 个\n\n`

      reportContent += `## 详细分析结果\n\n`

      feedback.forEach((item, index) => {
        const statusIcon = item.hasIssues ? '⚠️' : '✅'
        reportContent += `### ${index + 1}. ${statusIcon} ${item.filename}\n\n`
        reportContent += `${item.analysis}\n\n`
        reportContent += `---\n\n`
      })
    }

    reportContent += `## 说明\n\n`
    reportContent += `本报告由 AI 代码审查工具自动生成，用于辅助代码质量检查。\n`
    reportContent += `请结合实际情况判断建议的合理性。\n\n`
    reportContent += `*生成工具*: @x648525845/ai-codereview\n`

    try {
      await fs.promises.writeFile(filepath, reportContent, 'utf-8')
      return { success: true, filepath, filename }
    } catch (error) {
      console.error('生成报告文件失败:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * 显示分析结果
   */
  async displayFeedback(feedback) {
    let hasIssues = false

    // 检查是否有问题
    if (feedback.length > 0) {
      hasIssues = feedback.some((item) => item.hasIssues)
    }

    // 根据配置选择输出方式，默认为Web界面
    if (this.config.outputMode === 'web' && this.config.webUI) {
      await this.displayFeedbackAsWeb(feedback, hasIssues)
      return hasIssues
    } else if (this.config.outputMode === 'file') {
      return await this.displayFeedbackAsFile(feedback, hasIssues)
    } else {
      return this.displayFeedbackInConsole(feedback, hasIssues)
    }
  }

  /**
   * 在控制台显示分析结果（原有方式）
   */
  displayFeedbackInConsole(feedback, hasIssues) {
    if (feedback.length === 0) {
      console.log('✅ 代码分析完成，未发现问题')
      return false
    }

    console.log('\n📋 AI代码审查反馈:')
    console.log('='.repeat(50))

    feedback.forEach((item, index) => {
      console.log(`\n${index + 1}. 📄 ${item.filename}`)
      console.log('-'.repeat(30))
      console.log(item.analysis)
    })

    console.log('\n' + '='.repeat(50))

    return hasIssues
  }

  /**
   * 生成文件并显示结果
   */
  async displayFeedbackAsFile(feedback, hasIssues) {
    // 如果没有反馈内容，只在控制台显示，不生成文件
    if (feedback.length === 0) {
      console.log('✅ 代码分析完成，无修改，未发现问题')
      return false
    }

    // 有反馈内容时才生成报告文件
    const result = await this.generateReportFile(feedback)

    if (result.success) {
      const hasIssuesCount = feedback.filter((item) => item.hasIssues).length
      console.log(`\n📋 AI代码审查完成！`)
      console.log(`📁 分析文件: ${feedback.length} 个`)
      if (hasIssuesCount > 0) {
        console.log(`⚠️  发现问题的文件: ${hasIssuesCount} 个`)
      }
      console.log(`✅ 无问题文件: ${feedback.length - hasIssuesCount} 个`)
      console.log(`\n📄 详细报告已生成: ${result.filename}`)
      console.log(`📍 文件位置: ${result.filepath}`)
    } else {
      console.error(`❌ 生成报告文件失败: ${result.error}`)
      console.log('\n⚠️  降级到控制台输出:')
      return this.displayFeedbackInConsole(feedback, hasIssues)
    }

    return hasIssues
  }

  /**
   * 启动Web界面显示结果
   */
  async displayFeedbackAsWeb(feedback, hasIssues) {
    try {
      console.log('\n🌐 启动Web界面...')

      // 动态导入Web模块
      const { WebServer } = await import('./web/server.js')
      const { DataProcessor } = await import('./web/data-processor.js')

      // 处理数据
      const processedData = DataProcessor.processReviewResults(feedback, {
        version: '1.5.2',
        timestamp: new Date().toISOString(),
        hasIssues
      })

      // 创建并启动Web服务器
      const server = new WebServer({
        port: this.config.webPort,
        autoOpen: this.config.autoOpenBrowser
      })

      // 设置审查数据
      server.setReviewData(processedData)

      // 启动服务器
      await server.start()

      console.log('\n💡 提示:')
      console.log('   - 在Web界面中查看详细的审查结果')
      console.log('   - 可以导出报告或继续提交代码')
      console.log('   - 关闭浏览器标签页不会停止服务器')
      console.log('   - 按 Ctrl+C 可停止服务器\n')

      // 保存服务器引用以便后续停止
      this.webServer = server
    } catch (error) {
      console.error('❌ 启动Web界面失败:', error.message)
      console.log('⚠️  降级到文件输出模式')

      // 降级到文件输出
      return await this.displayFeedbackAsFile(feedback, hasIssues)
    }
  }

  /**
   * 停止Web服务器
   */
  async stopWebServer() {
    if (this.webServer) {
      await this.webServer.stop()
      this.webServer = null
    }
  }

  /**
   * 询问用户是否继续提交
   */
  async askUserConfirmation(hasIssues = false) {
    const readline = await import('readline')
    const fs = await import('fs')

    // 在 Git hooks 中，需要明确使用终端
    const input = fs.createReadStream('/dev/tty')
    const rl = readline.createInterface({
      input: input,
      output: process.stdout,
      terminal: true
    })

    const message = hasIssues ? '\n❓ 发现一些建议，是否继续提交？(y/N): ' : '\n❓ 代码审查完成，是否继续提交？(y/N): '

    return new Promise((resolve) => {
      rl.question(message, (answer) => {
        rl.close()
        input.destroy() // 确保完全关闭输入流
        const shouldContinue = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
        resolve(shouldContinue)
      })
    })
  }
}

export default AICodeReviewer

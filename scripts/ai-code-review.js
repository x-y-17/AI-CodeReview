// scripts/ai-code-review.js
import OpenAI from 'openai'
import GitUtils from './git-utils.js'

class AICodeReviewer {
  constructor() {
    this.gitUtils = new GitUtils()

    // 初始化国内AI客户端 (Moonshot Kimi)
    this.openai = new OpenAI({
      apiKey: process.env.MOONSHOT_API_KEY,
      baseURL: 'https://api.moonshot.cn/v1'
    })
  }

  /**
   * 分析代码变更
   */
  async analyzeChanges() {
    console.log('🔍 正在分析代码变更...')

    const stagedFiles = this.gitUtils.getStagedFiles()

    if (stagedFiles.length === 0) {
      console.log('ℹ️  没有检测到代码变更')
      return { success: true, feedback: [] }
    }

    const relevantFiles = this.gitUtils.filterRelevantFiles(stagedFiles)

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
    const diff = this.gitUtils.getFileDiff(filename)
    const fullContent = this.gitUtils.getFileContent(filename)

    if (!diff) {
      return null
    }

    const prompt = this.buildAnalysisPrompt(filename, diff, fullContent)

    try {
      const response = await this.openai.chat.completions.create({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的代码审查专家。请分析提供的代码变更，重点关注：
1. 代码质量和最佳实践
2. 潜在的bug和安全问题
3. 性能优化建议
4. 代码可读性和维护性
5. 测试覆盖率建议

请用中文回复，格式简洁明了。如果没有问题，请简单确认代码看起来不错。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      return {
        filename,
        analysis: response.choices[0].message.content,
        hasIssues: this.detectIssues(response.choices[0].message.content)
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
   * 显示分析结果
   */
  displayFeedback(feedback) {
    if (feedback.length === 0) {
      console.log('✅ 代码分析完成，未发现问题')
      return false
    }

    let hasIssues = false

    console.log('\n📋 AI代码审查反馈:')
    console.log('='.repeat(50))

    feedback.forEach((item, index) => {
      console.log(`\n${index + 1}. 📄 ${item.filename}`)
      console.log('-'.repeat(30))
      console.log(item.analysis)

      if (item.hasIssues) {
        hasIssues = true
      }
    })

    console.log('\n' + '='.repeat(50))

    return hasIssues
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
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
      })
    })
  }
}

export default AICodeReviewer

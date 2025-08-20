// scripts/pre-commit-ai-review.js
import dotenv from 'dotenv'
import AICodeReviewer from './ai-code-review.js'

dotenv.config()

async function main() {
  const reviewer = new AICodeReviewer()

  try {
    console.log('🚀 开始AI代码审查...\n')

    // 分析代码变更
    const result = await reviewer.analyzeChanges()

    if (!result.success) {
      console.error('❌ 代码分析失败')
      process.exit(1)
    }

    // 显示反馈
    const hasIssues = reviewer.displayFeedback(result.feedback)

    // 总是询问用户是否继续提交
    const shouldContinue = await reviewer.askUserConfirmation(hasIssues)

    if (!shouldContinue) {
      console.log('⏹️  提交已取消')
      process.exit(1)
    }

    console.log('✅ 代码审查通过，继续提交...')
    process.exit(0)
  } catch (error) {
    console.error('❌ 执行过程中出错:', error.message)

    // 如果AI服务不可用，询问是否跳过
    const readline = await import('readline')
    const fs = await import('fs')
    const input = fs.createReadStream('/dev/tty')
    const rl = readline.createInterface({
      input: input,
      output: process.stdout,
      terminal: true
    })

    rl.question('AI服务不可用，是否跳过审查继续提交？(y/N): ', (answer) => {
      rl.close()
      input.destroy() // 确保完全关闭输入流
      if (answer.toLowerCase() === 'y') {
        console.log('⚠️  跳过AI审查，继续提交')
        process.exit(0)
      } else {
        console.log('⏹️  提交已取消')
        process.exit(1)
      }
    })
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default main

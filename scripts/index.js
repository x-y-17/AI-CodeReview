#!/usr/bin/env node

// scripts/pre-commit-ai-review.js
import AICodeReviewer from './ai-code-review.js'
import EnvLoader from './env-loader.js'

// 初始化环境变量加载器
const envLoader = new EnvLoader()

// 检查命令行参数
const args = process.argv.slice(2)
const command = args[0]

// 处理特殊命令
if (command === 'init-config') {
  try {
    const globalConfigPath = envLoader.createGlobalConfigTemplate()
    console.log('✅ 用户全局配置文件创建成功!')
    console.log(`📍 文件位置: ${globalConfigPath}`)
    console.log('\n💡 请编辑该文件，填入你的API密钥和配置')
    process.exit(0)
  } catch (error) {
    console.error('❌ 创建用户全局配置文件失败:', error.message)
    process.exit(1)
  }
}

if (command === 'init-node-config') {
  try {
    const nodeGlobalConfigPath = envLoader.createNodeGlobalConfigTemplate()
    console.log('✅ Node.js 全局配置文件创建成功!')
    console.log(`📍 文件位置: ${nodeGlobalConfigPath}`)
    console.log('\n💡 请编辑该文件，填入你的API密钥和配置')
    console.log('⚠️  注意: 此配置需要管理员权限才能修改')
    process.exit(0)
  } catch (error) {
    console.error('❌ 创建 Node.js 全局配置文件失败:', error.message)
    process.exit(1)
  }
}

if (command === 'config-help') {
  envLoader.displayConfigHelp()
  process.exit(0)
}

// 加载环境变量配置
envLoader.loadConfig({
  silent: false, // 显示加载信息
  debug: args.includes('--debug') // 支持调试模式
})

async function main() {
  // 支持自定义系统提示词
  const customPrompt = process.env.AI_REVIEW_SYSTEM_PROMPT
  const options = customPrompt ? { systemPrompt: customPrompt } : {}
  let reviewer
  try {
    reviewer = new AICodeReviewer(options)
  } catch (error) {
    console.error('❌ 初始化AI代码审查器失败:', error.message)
    await handleError(error)
    return
  }
  try {
    console.log('🚀 开始AI代码审查...\n')

    // 分析代码变更
    const result = await reviewer.analyzeChanges()

    if (!result.success) {
      console.error('❌ 代码分析失败')
      process.exit(1)
    }

    // 显示反馈
    const hasIssues = await reviewer.displayFeedback(result.feedback)

    // 总是询问用户是否继续提交
    const shouldContinue = await reviewer.askUserConfirmation(hasIssues)

    if (!shouldContinue) {
      console.log('⏹️  提交已取消')
      await forceExit(1)
    }

    console.log('✅ 代码审查通过，继续提交...')
    await forceExit(0)
  } catch (error) {
    console.error('❌ 执行过程中出错:', error.message)
    await handleError(error)
  }
}

async function handleError(_error) {
  // 如果AI服务不可用，询问是否跳过
  const readline = await import('readline')
  const fs = await import('fs')
  const input = fs.createReadStream('/dev/tty')
  const rl = readline.createInterface({
    input: input,
    output: process.stdout,
    terminal: true
  })

  return new Promise((resolve) => {
    rl.question('AI服务不可用，是否跳过审查继续提交？(y/N): ', (answer) => {
      rl.close()
      input.destroy() // 确保完全关闭输入流
      if (answer.toLowerCase() === 'y') {
        console.log('⚠️  跳过AI审查，继续提交')
        forceExit(0)
      } else {
        console.log('⏹️  提交已取消')
        forceExit(1)
      }
      resolve()
    })
  })
}

/**
 * 强制退出进程，确保在所有环境下都能正确设置退出码
 */
async function forceExit(code) {
  // 设置多重退出机制确保在所有环境下都能正确退出
  process.exitCode = code
  // 刷新所有输出流
  try {
    if (process.stdout && typeof process.stdout.write === 'function') {
      process.stdout.write('')
    }
    if (process.stderr && typeof process.stderr.write === 'function') {
      process.stderr.write('')
    }
  } catch {
    // 忽略输出流错误
  }

  // 等待一小段时间确保输出完成
  await new Promise((resolve) => setTimeout(resolve, 150))
  // 多重退出策略，确保在任何环境下都能正确退出
  try {
    process.exit(code)
  } catch {
    // 如果process.exit失败，尝试其他方法
    try {
      process.kill(process.pid, 'SIGTERM')
    } catch {
      // 最后手段
      process.abort()
    }
  }
}

// 处理未捕获的 Promise 拒绝
process.on('unhandledRejection', async (reason, _promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason)
  await handleError(reason)
})

main().catch(async (error) => {
  console.error('❌ main 函数执行失败:', error)
  await handleError(error)
})

export default main

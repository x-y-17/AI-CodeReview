#!/usr/bin/env node

// scripts/pre-commit-ai-review.js
import AICodeReviewer from './ai-code-review.js'
import EnvLoader from './env-loader.js'

// 初始化环境变量加载器
const envLoader = new EnvLoader()

// 检查命令行参数
const args = process.argv.slice(2)
const command = args[0]

// 解析CLI参数
const parseArgs = (args) => {
  const options = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--web') {
      options.outputMode = 'web'
      options.webUI = true
    } else if (arg === '--file') {
      options.outputMode = 'file'
      options.webUI = false
    } else if (arg === '--console') {
      options.outputMode = 'console'
      options.webUI = false
    } else if (arg === '--web-port') {
      options.webPort = parseInt(args[++i])
    } else if (arg === '--no-browser') {
      options.autoOpenBrowser = false
    } else if (arg === '--output-mode') {
      options.outputMode = args[++i]
    } else if (arg === '--debug') {
      options.debug = true
    }
  }
  return options
}

const cliOptions = parseArgs(args)

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

if (command === 'help' || command === '--help' || command === '-h') {
  console.log('🤖 AI代码审查工具 - 使用说明\n')
  console.log('基本用法:')
  console.log('  ai-codereview                    # 运行代码审查（默认Web界面）')
  console.log('  ai-codereview --file             # 生成Markdown报告文件')
  console.log('  ai-codereview --console          # 控制台输出')
  console.log('')
  console.log('输出模式选项:')
  console.log('  --web                           # Web界面输出（默认）')
  console.log('  --file                          # 生成Markdown报告文件')
  console.log('  --console                       # 控制台输出')
  console.log('  --output-mode <mode>            # 指定输出模式: web, file, console')
  console.log('')
  console.log('Web界面选项:')
  console.log('  --web-port <port>               # 指定Web服务器端口 (默认: 3000)')
  console.log('  --no-browser                    # 不自动打开浏览器')
  console.log('')
  console.log('配置命令:')
  console.log('  ai-codereview init-config       # 创建用户配置文件')
  console.log('  ai-codereview config-help       # 显示配置帮助')
  console.log('')
  console.log('其他选项:')
  console.log('  --debug                         # 启用调试模式')
  console.log('  --help, -h                      # 显示帮助信息')
  console.log('')
  console.log('示例:')
  console.log('  ai-codereview                           # 使用默认Web界面')
  console.log('  ai-codereview --file                    # 生成报告文件')
  console.log('  ai-codereview --web --web-port 8080     # 在端口8080启动Web界面')
  console.log('  ai-codereview --console                 # 控制台输出结果')
  console.log('')
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
  const options = {
    ...(customPrompt ? { systemPrompt: customPrompt } : {}),
    ...cliOptions // 合并CLI选项
  }

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

    // 如果使用Web界面，不需要询问用户确认，让用户在Web界面中操作
    if (reviewer.config.outputMode === 'web' && reviewer.config.webUI) {
      // Web界面模式下，保持服务器运行
      console.log('💡 请在Web界面中选择是否继续提交，或按 Ctrl+C 退出')

      // 监听退出信号
      process.on('SIGINT', async () => {
        console.log('\n🛑 正在停止Web服务器...')
        await reviewer.stopWebServer()
        process.exit(0)
      })

      process.on('SIGTERM', async () => {
        await reviewer.stopWebServer()
        process.exit(0)
      })

      // 保持进程运行
      return
    }

    // 传统模式：询问用户是否继续提交
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

// scripts/env-loader.js
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

/**
 * 环境变量加载器
 * 支持多级配置查找，优先级从高到低：
 * 1. 项目根目录的 .env 文件
 * 2. 用户主目录的 .ai-codereview.env 文件（全局配置）
 * 3. 包目录的 .env 文件（默认配置）
 */
class EnvLoader {
  constructor() {
    this.currentDir = path.dirname(fileURLToPath(import.meta.url))
    this.projectRoot = process.cwd()
    this.userHome = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
    this.nodeDir = this.getNodeDirectory()
  }

  /**
   * 获取 Node.js 安装目录
   */
  getNodeDirectory() {
    // 方法1: 从 process.execPath 获取
    const execPath = process.execPath
    const nodeDir = path.dirname(execPath)

    // 方法2: 从 process.argv[0] 获取
    const argv0 = process.argv[0]
    const nodeDirFromArgv = path.dirname(argv0)

    // 优先使用 execPath，如果相同则使用 argv0
    return nodeDir === nodeDirFromArgv ? nodeDir : nodeDirFromArgv
  }

  /**
   * 加载环境变量配置
   * @param {Object} options - 配置选项
   * @param {boolean} options.silent - 是否静默加载（不输出日志）
   * @param {boolean} options.debug - 是否输出调试信息
   * @returns {Object} 加载结果
   */
  loadConfig(options = {}) {
    const { silent = false, debug = false } = options
    const loadedFiles = []
    const configPaths = this.getConfigPaths()

    if (debug) {
      console.log('🔍 环境变量配置查找路径:')
      configPaths.forEach((config, index) => {
        console.log(`  ${index + 1}. ${config.path} (${config.type})`)
      })
    }

    // 按优先级加载配置文件
    for (const config of configPaths) {
      if (this.loadEnvFile(config.path, config.type, { silent, debug })) {
        loadedFiles.push(config)
      }
    }

    const result = {
      loadedFiles,
      hasProjectConfig: this.hasProjectConfig(),
      hasGlobalConfig: this.hasGlobalConfig(),
      hasNodeGlobalConfig: this.hasNodeGlobalConfig(),
      hasPackageConfig: this.hasPackageConfig()
    }

    if (!silent && loadedFiles.length > 0) {
      this.displayLoadResult(result)
    }

    return result
  }

  /**
   * 获取配置文件的查找路径（按优先级排序）
   */
  getConfigPaths() {
    const paths = []

    // 1. 项目根目录的 .env 文件（最高优先级）
    const projectEnvPath = path.join(this.projectRoot, '.env')
    paths.push({
      path: projectEnvPath,
      type: '项目配置',
      priority: 1
    })

    // 2. 用户主目录的全局配置文件
    if (this.userHome) {
      const globalConfigPath = path.join(this.userHome, '.ai-codereview.env')
      paths.push({
        path: globalConfigPath,
        type: '全局配置',
        priority: 2
      })
    }

    // 3. Node.js 安装目录的全局配置文件
    if (this.nodeDir) {
      const nodeGlobalConfigPath = path.join(this.nodeDir, '.ai-codereview.env')
      paths.push({
        path: nodeGlobalConfigPath,
        type: 'Node.js全局配置',
        priority: 3
      })
    }

    // 4. 包目录的 .env 文件（默认配置）
    const packageEnvPath = path.join(this.currentDir, '../.env')
    paths.push({
      path: packageEnvPath,
      type: '默认配置',
      priority: 4
    })

    return paths
  }

  /**
   * 加载单个环境变量文件
   */
  loadEnvFile(filePath, type, options = {}) {
    const { debug = false } = options

    try {
      if (fs.existsSync(filePath)) {
        const result = dotenv.config({ path: filePath })
        if (result.error) {
          if (debug) {
            console.warn(`⚠️  加载 ${type} 文件失败: ${filePath}`, result.error.message)
          }
          return false
        }

        if (debug) {
          console.log(`✅ 成功加载 ${type}: ${filePath}`)
        }
        return true
      } else {
        if (debug) {
          console.log(`ℹ️  ${type} 文件不存在: ${filePath}`)
        }
        return false
      }
    } catch (error) {
      if (debug) {
        console.warn(`⚠️  加载 ${type} 文件时出错: ${filePath}`, error.message)
      }
      return false
    }
  }

  /**
   * 检查是否存在项目配置
   */
  hasProjectConfig() {
    return fs.existsSync(path.join(this.projectRoot, '.env'))
  }

  /**
   * 检查是否存在全局配置
   */
  hasGlobalConfig() {
    if (!this.userHome) return false
    return fs.existsSync(path.join(this.userHome, '.ai-codereview.env'))
  }

  /**
   * 检查是否存在 Node.js 全局配置
   */
  hasNodeGlobalConfig() {
    if (!this.nodeDir) return false
    return fs.existsSync(path.join(this.nodeDir, '.ai-codereview.env'))
  }

  /**
   * 检查是否存在包配置
   */
  hasPackageConfig() {
    return fs.existsSync(path.join(this.currentDir, '../.env'))
  }

  /**
   * 显示加载结果
   */
  displayLoadResult(result) {
    const { loadedFiles, hasProjectConfig, hasGlobalConfig, hasNodeGlobalConfig } = result

    if (loadedFiles.length === 0) {
      console.log('ℹ️  未找到任何配置文件，将使用默认配置')
      return
    }

    console.log('🔧 环境变量配置加载完成:')

    loadedFiles.forEach((file) => {
      const icon =
        file.type === '项目配置'
          ? '📁'
          : file.type === '全局配置'
            ? '🌐'
            : file.type === 'Node.js全局配置'
              ? '🔧'
              : '📦'
      console.log(`  ${icon} ${file.type}: ${file.path}`)
    })

    // 显示配置优先级说明
    if (hasProjectConfig && (hasGlobalConfig || hasNodeGlobalConfig)) {
      console.log('💡 提示: 项目配置优先于全局配置')
    } else if ((hasGlobalConfig || hasNodeGlobalConfig) && !hasProjectConfig) {
      console.log('💡 提示: 使用全局配置，可在项目根目录创建 .env 文件进行覆盖')
    }
  }

  /**
   * 获取全局配置文件路径
   */
  getGlobalConfigPath() {
    if (!this.userHome) return null
    return path.join(this.userHome, '.ai-codereview.env')
  }

  /**
   * 获取 Node.js 全局配置文件路径
   */
  getNodeGlobalConfigPath() {
    if (!this.nodeDir) return null
    return path.join(this.nodeDir, '.ai-codereview.env')
  }

  /**
   * 创建全局配置文件模板
   */
  createGlobalConfigTemplate() {
    const globalConfigPath = this.getGlobalConfigPath()
    if (!globalConfigPath) {
      throw new Error('无法确定用户主目录，无法创建全局配置文件')
    }

    return this.createConfigTemplate(globalConfigPath, '用户主目录')
  }

  /**
   * 创建 Node.js 全局配置文件模板
   */
  createNodeGlobalConfigTemplate() {
    const nodeGlobalConfigPath = this.getNodeGlobalConfigPath()
    if (!nodeGlobalConfigPath) {
      throw new Error('无法确定 Node.js 安装目录，无法创建全局配置文件')
    }

    return this.createConfigTemplate(nodeGlobalConfigPath, 'Node.js 安装目录')
  }

  /**
   * 创建配置文件模板的通用方法
   */
  createConfigTemplate(configPath, location) {
    const templateContent = `# AI-CodeReview 全局配置文件
# 此文件位于${location}，所有项目都会使用此配置
# 如果项目根目录有 .env 文件，则项目配置优先

# ===========================================
# 必须配置 - API密钥
# ===========================================

# DeepSeek API密钥（推荐使用）
API_KEY=你的API密钥

# ===========================================
# AI服务配置（可选）
# ===========================================

# DeepSeek API 配置（默认推荐）
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
# AI_MAX_TOKENS=2000
# AI_TEMPERATURE=0.3

# 输出模式配置（可选）
# file: 生成Markdown报告文件（默认）
# console: 控制台输出
AI_OUTPUT_MODE=file

# 版本控制系统类型（可选）
# git: Git版本控制（默认）
# svn: SVN版本控制
VCS_TYPE=git

# 自定义AI审查提示词（可选）
# AI_REVIEW_SYSTEM_PROMPT=你是一个专业的代码审查专家。请分析提供的代码变更，重点关注代码质量、安全问题、性能优化和最佳实践。请用中文回复。

`

    try {
      fs.writeFileSync(configPath, templateContent, 'utf-8')
      return configPath
    } catch (error) {
      throw new Error(`创建全局配置文件失败: ${error.message}`)
    }
  }

  /**
   * 显示配置帮助信息
   */
  displayConfigHelp() {
    console.log('\n📖 AI-CodeReview 配置说明:')
    console.log('='.repeat(50))

    console.log('\n🔧 配置文件优先级（从高到低）:')
    console.log('  1. 📁 项目根目录的 .env 文件')
    console.log('  2. 🌐 用户主目录的 .ai-codereview.env 文件（全局配置）')
    console.log('  3. 🔧 Node.js 安装目录的 .ai-codereview.env 文件（Node.js全局配置）')
    console.log('  4. 📦 包目录的 .env 文件（默认配置）')

    console.log('\n💡 推荐使用方式:')
    console.log('  • 在用户主目录创建全局配置文件，设置通用的API密钥和配置')
    console.log('  • 在 Node.js 安装目录创建全局配置文件，系统级配置')
    console.log('  • 在特定项目中创建 .env 文件，覆盖全局配置')

    const globalConfigPath = this.getGlobalConfigPath()
    if (globalConfigPath) {
      console.log(`\n🌐 用户全局配置文件路径: ${globalConfigPath}`)
    }

    const nodeGlobalConfigPath = this.getNodeGlobalConfigPath()
    if (nodeGlobalConfigPath) {
      console.log(`🔧 Node.js 全局配置文件路径: ${nodeGlobalConfigPath}`)
    }

    console.log(`📁 当前项目根目录: ${this.projectRoot}`)
    console.log(`🔧 Node.js 安装目录: ${this.nodeDir}`)

    console.log('\n🚀 快速开始:')
    console.log('  1. 创建用户全局配置: ai-codereview init-config')
    console.log('  2. 创建 Node.js 全局配置: ai-codereview init-node-config')
    console.log('  3. 编辑配置文件，填入你的API密钥')
    console.log('  4. 在项目中使用: ai-codereview')
  }
}

export default EnvLoader

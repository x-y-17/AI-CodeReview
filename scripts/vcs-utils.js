// scripts/vcs-utils.js
import fs from 'fs'
import GitUtils from './git-utils.js'
import SvnUtils from './svn-utils.js'

class VcsUtils {
  constructor(options = {}) {
    // 从环境变量或构造函数参数获取VCS类型
    this.vcsType = options.vcsType || process.env.VCS_TYPE || this.detectVcsType()

    // 根据VCS类型创建相应的工具实例
    if (this.vcsType.toLowerCase() === 'svn') {
      this.utils = new SvnUtils()
      console.log('🔧 使用 SVN 版本控制系统')
    } else {
      this.utils = new GitUtils()
      console.log('🔧 使用 Git 版本控制系统')
    }
  }

  /**
   * 自动检测版本控制系统类型
   */
  detectVcsType() {
    if (fs.existsSync('.git')) {
      return 'git'
    }
    if (fs.existsSync('.svn')) {
      return 'svn'
    }
    // 默认返回git，保持向后兼容
    console.warn('⚠️  未检测到版本控制系统，默认使用 Git')
    return 'git'
  }

  /**
   * 获取VCS类型
   */
  getVcsType() {
    return this.vcsType
  }

  /**
   * 代理所有方法到具体的VCS工具类
   */
  getStagedFiles() {
    return this.utils.getStagedFiles()
  }

  getFileDiff(filename) {
    return this.utils.getFileDiff(filename)
  }

  getAllStagedDiff() {
    return this.utils.getAllStagedDiff()
  }

  getFileContent(filename) {
    return this.utils.getFileContent(filename)
  }

  filterRelevantFiles(files) {
    return this.utils.filterRelevantFiles(files)
  }

  getCommitMessage() {
    return this.utils.getCommitMessage()
  }

  /**
   * 显示VCS配置信息
   */
  displayVcsInfo() {
    console.log(`📋 版本控制系统: ${this.vcsType.toUpperCase()}`)

    if (this.vcsType === 'svn') {
      console.log('ℹ️  SVN模式: 分析所有修改的文件（M/A/D状态）')
    } else {
      console.log('ℹ️  Git模式: 分析暂存区文件（git add后的文件）')
    }
  }
}

export default VcsUtils

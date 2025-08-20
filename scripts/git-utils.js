// scripts/git-utils.js
import { execSync } from 'child_process'
import fs from 'fs'

class GitUtils {
  /**
   * 获取已暂存的文件列表
   */
  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      return output
        .trim()
        .split('\n')
        .filter((file) => file)
    } catch (error) {
      console.error('Error getting staged files:', error.message)
      return []
    }
  }

  /**
   * 获取文件的变更内容
   */
  getFileDiff(filename) {
    try {
      return execSync(`git diff --cached "${filename}"`, { encoding: 'utf8' })
    } catch (error) {
      console.error(`Error getting diff for ${filename}:`, error.message)
      return ''
    }
  }

  /**
   * 获取所有已暂存的变更
   */
  getAllStagedDiff() {
    try {
      return execSync('git diff --cached', { encoding: 'utf8' })
    } catch (error) {
      console.error('Error getting staged diff:', error.message)
      return ''
    }
  }

  /**
   * 获取文件的完整内容（变更后的版本）
   */
  getFileContent(filename) {
    try {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf8')
      }
      return ''
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error.message)
      return ''
    }
  }

  /**
   * 过滤需要分析的文件（排除二进制文件、配置文件等）
   */
  filterRelevantFiles(files) {
    const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.java', '.go', '.php', '.rb']
    const ignoredPaths = ['node_modules/', 'dist/', 'build/', '.git/', 'coverage/']

    return files.filter((file) => {
      // 检查文件扩展名
      const hasRelevantExtension = relevantExtensions.some((ext) => file.endsWith(ext))

      // 检查是否在忽略路径中
      const isIgnored = ignoredPaths.some((path) => file.includes(path))

      return hasRelevantExtension && !isIgnored
    })
  }

  /**
   * 获取提交信息（如果存在）
   */
  getCommitMessage() {
    try {
      // 尝试从.git/COMMIT_EDITMSG读取
      const commitMsgPath = '.git/COMMIT_EDITMSG'
      if (fs.existsSync(commitMsgPath)) {
        return fs.readFileSync(commitMsgPath, 'utf8').trim()
      }
      return ''
    } catch (error) {
      return ''
    }
  }
}

export default GitUtils

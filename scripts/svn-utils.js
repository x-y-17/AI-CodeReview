// scripts/svn-utils.js
import { execSync } from 'child_process'
import fs from 'fs'

class SvnUtils {
  /**
   * 获取修改的文件列表（SVN没有暂存区概念）
   */
  getStagedFiles() {
    try {
      const output = execSync('svn status', { encoding: 'utf8' })
      return output
        .trim()
        .split('\n')
        .filter((line) => line)
        .map((line) => {
          // SVN status 格式: "M      filename" 或 "A      filename"
          const match = line.match(/^[MAD]\s+(.+)$/)
          return match ? match[1].trim() : null
        })
        .filter((file) => file)
    } catch (error) {
      console.error('Error getting SVN modified files:', error.message)
      return []
    }
  }

  /**
   * 获取文件的变更内容
   */
  getFileDiff(filename) {
    try {
      return execSync(`svn diff "${filename}"`, { encoding: 'utf8' })
    } catch (error) {
      console.error(`Error getting SVN diff for ${filename}:`, error.message)
      return ''
    }
  }

  /**
   * 获取所有修改文件的变更
   */
  getAllStagedDiff() {
    try {
      return execSync('svn diff', { encoding: 'utf8' })
    } catch (error) {
      console.error('Error getting SVN diff:', error.message)
      return ''
    }
  }

  /**
   * 获取文件的完整内容（当前工作副本版本）
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
    const relevantExtensions = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.vue',
      '.py',
      '.java',
      '.go',
      '.php',
      '.rb',
      '.c',
      '.cpp',
      '.h',
      '.hpp'
    ]
    const ignoredPaths = ['node_modules/', 'dist/', 'build/', '.svn/', 'coverage/', 'target/', 'bin/', 'obj/']

    return files.filter((file) => {
      // 检查文件扩展名
      const hasRelevantExtension = relevantExtensions.some((ext) => file.endsWith(ext))

      // 检查是否在忽略路径中
      const isIgnored = ignoredPaths.some((path) => file.includes(path))

      return hasRelevantExtension && !isIgnored
    })
  }

  /**
   * 获取提交信息（SVN没有类似Git的COMMIT_EDITMSG）
   */
  getCommitMessage() {
    // SVN的提交信息通常在提交时通过-m参数指定
    // 这里返回空字符串，因为无法预先获取
    return ''
  }
}

export default SvnUtils

import path from 'path'
import crypto from 'crypto'

export class DataProcessor {
  /**
   * 处理AI代码审查结果，转换为Web界面所需的格式
   */
  static processReviewResults(feedback, options = {}) {
    const processedData = {
      summary: this.generateSummary(feedback),
      files: this.processFiles(feedback),
      timestamp: new Date().toISOString(),
      stats: this.calculateStats(feedback),
      config: options
    }

    return processedData
  }

  /**
   * 生成审查摘要
   */
  static generateSummary(feedback) {
    const total = feedback.length
    const hasIssues = feedback.filter((f) => f.hasIssues).length
    const passed = total - hasIssues

    return {
      total,
      hasIssues,
      passed,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 100
    }
  }

  /**
   * 处理文件列表
   */
  static processFiles(feedback) {
    return feedback.map((item) => {
      const fileInfo = this.extractFileInfo(item.filename)

      return {
        id: this.generateFileId(item.filename),
        filename: fileInfo.basename,
        fullPath: item.filename,
        directory: fileInfo.dirname,
        extension: fileInfo.extension,
        status: item.hasIssues ? 'warning' : 'success',
        analysis: item.analysis,
        hasIssues: item.hasIssues,
        diff: item.diff || '', // 添加diff信息
        icon: this.getFileIcon(fileInfo.extension),
        issues: this.extractIssues(item.analysis),
        suggestions: this.extractSuggestions(item.analysis),
        severity: this.calculateSeverity(item.analysis),
        size: this.estimateFileComplexity(item.analysis)
      }
    })
  }

  /**
   * 提取文件信息
   */
  static extractFileInfo(filepath) {
    const basename = path.basename(filepath)
    const dirname = path.dirname(filepath)
    const extension = path.extname(filepath)

    return {
      basename,
      dirname: dirname === '.' ? '' : dirname,
      extension
    }
  }

  /**
   * 生成文件唯一ID
   */
  static generateFileId(filename) {
    return crypto.createHash('md5').update(filename).digest('hex').substring(0, 8)
  }

  /**
   * 获取文件图标配置
   */
  static getFileIcon(extension) {
    const iconMap = {
      '.js': 'fab fa-js-square',
      '.jsx': 'fab fa-react',
      '.ts': 'fab fa-js-square',
      '.tsx': 'fab fa-react',
      '.vue': 'fab fa-vuejs',
      '.css': 'fab fa-css3-alt',
      '.scss': 'fab fa-sass',
      '.sass': 'fab fa-sass',
      '.less': 'fab fa-css3-alt',
      '.html': 'fab fa-html5',
      '.htm': 'fab fa-html5',
      '.json': 'fas fa-file-code',
      '.xml': 'fas fa-file-code',
      '.yaml': 'fas fa-file-code',
      '.yml': 'fas fa-file-code',
      '.md': 'fab fa-markdown',
      '.py': 'fab fa-python',
      '.java': 'fab fa-java',
      '.go': 'fas fa-code',
      '.php': 'fab fa-php',
      '.rb': 'fas fa-gem',
      '.swift': 'fab fa-swift',
      '.kt': 'fas fa-code',
      '.rs': 'fas fa-code',
      '.c': 'fas fa-file-code',
      '.cpp': 'fas fa-file-code',
      '.h': 'fas fa-file-code',
      '.cs': 'fas fa-file-code',
      '.sql': 'fas fa-database',
      '.sh': 'fas fa-terminal',
      '.bat': 'fas fa-terminal',
      '.ps1': 'fas fa-terminal'
    }

    return iconMap[extension] || 'fas fa-file-code'
  }

  /**
   * 从分析文本中提取问题
   */
  static extractIssues(analysis) {
    const issues = []
    const lines = analysis.split('\n')

    for (const line of lines) {
      if (line.includes('问题') || line.includes('错误') || line.includes('bug') || line.includes('安全')) {
        issues.push({
          type: this.classifyIssueType(line),
          description: line.trim(),
          severity: this.getIssueSeverity(line)
        })
      }
    }

    return issues
  }

  /**
   * 从分析文本中提取建议
   */
  static extractSuggestions(analysis) {
    const suggestions = []
    const lines = analysis.split('\n')

    for (const line of lines) {
      if (line.includes('建议') || line.includes('推荐') || line.includes('优化') || line.includes('改进')) {
        suggestions.push({
          type: 'improvement',
          description: line.trim(),
          priority: this.getSuggestionPriority(line)
        })
      }
    }

    return suggestions
  }

  /**
   * 分类问题类型
   */
  static classifyIssueType(text) {
    if (text.includes('安全') || text.includes('SQL注入') || text.includes('XSS')) {
      return 'security'
    } else if (text.includes('性能') || text.includes('优化')) {
      return 'performance'
    } else if (text.includes('bug') || text.includes('错误')) {
      return 'bug'
    } else if (text.includes('可读性') || text.includes('维护')) {
      return 'maintainability'
    }
    return 'general'
  }

  /**
   * 获取问题严重程度
   */
  static getIssueSeverity(text) {
    if (text.includes('严重') || text.includes('安全') || text.includes('SQL注入')) {
      return 'high'
    } else if (text.includes('重要') || text.includes('性能')) {
      return 'medium'
    }
    return 'low'
  }

  /**
   * 获取建议优先级
   */
  static getSuggestionPriority(text) {
    if (text.includes('强烈建议') || text.includes('必须')) {
      return 'high'
    } else if (text.includes('建议') && text.includes('尽快')) {
      return 'medium'
    }
    return 'low'
  }

  /**
   * 计算整体严重程度
   */
  static calculateSeverity(analysis) {
    if (analysis.includes('严重') || analysis.includes('安全风险')) {
      return 'high'
    } else if (analysis.includes('建议修改') || analysis.includes('需要注意')) {
      return 'medium'
    }
    return 'low'
  }

  /**
   * 估算文件复杂度
   */
  static estimateFileComplexity(analysis) {
    const wordCount = analysis.length
    if (wordCount > 500) return 'large'
    if (wordCount > 200) return 'medium'
    return 'small'
  }

  /**
   * 计算统计信息
   */
  static calculateStats(feedback) {
    const stats = {
      totalIssues: 0,
      securityIssues: 0,
      performanceIssues: 0,
      maintainabilityIssues: 0,
      byLanguage: {},
      bySeverity: { high: 0, medium: 0, low: 0 }
    }

    feedback.forEach((item) => {
      if (item.hasIssues) {
        stats.totalIssues++

        // 按类型统计
        if (item.analysis.includes('安全')) stats.securityIssues++
        if (item.analysis.includes('性能')) stats.performanceIssues++
        if (item.analysis.includes('维护') || item.analysis.includes('可读性')) {
          stats.maintainabilityIssues++
        }

        // 按严重程度统计
        const severity = this.calculateSeverity(item.analysis)
        stats.bySeverity[severity]++

        // 按语言统计
        const ext = path.extname(item.filename)
        if (!stats.byLanguage[ext]) {
          stats.byLanguage[ext] = { total: 0, issues: 0 }
        }
        stats.byLanguage[ext].total++
        stats.byLanguage[ext].issues++
      } else {
        // 无问题的文件也要统计
        const ext = path.extname(item.filename)
        if (!stats.byLanguage[ext]) {
          stats.byLanguage[ext] = { total: 0, issues: 0 }
        }
        stats.byLanguage[ext].total++
      }
    })

    return stats
  }

  /**
   * 生成趋势数据（用于图表展示）
   */
  static generateTrendData(feedback) {
    // 这里可以根据历史数据生成趋势
    // 目前返回模拟数据
    return {
      daily: [],
      weekly: [],
      monthly: []
    }
  }

  /**
   * 格式化为报告数据
   */
  static formatForReport(processedData) {
    return {
      title: 'AI代码审查报告',
      summary: processedData.summary,
      files: processedData.files.map((file) => ({
        path: file.fullPath,
        status: file.status,
        issues: file.issues.length,
        analysis: file.analysis
      })),
      generatedAt: processedData.timestamp,
      version: '1.5.2'
    }
  }
}

export default DataProcessor

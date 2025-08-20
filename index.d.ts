// Type definitions for ai-codereview
// Project: https://github.com/x-y-17/AI-CodeReview
// Definitions by: x-y-17

export interface AnalysisResult {
  success: boolean
  feedback: FileFeedback[]
}

export interface FileFeedback {
  filename: string
  analysis: string
  hasIssues: boolean
}

export interface GitUtilsOptions {
  // 可以在未来扩展配置选项
}

export class AICodeReviewer {
  constructor()

  /**
   * 分析代码变更
   */
  analyzeChanges(): Promise<AnalysisResult>

  /**
   * 分析单个文件
   */
  analyzeFile(filename: string): Promise<FileFeedback | null>

  /**
   * 显示分析结果
   */
  displayFeedback(feedback: FileFeedback[]): boolean

  /**
   * 询问用户是否继续提交
   */
  askUserConfirmation(hasIssues?: boolean): Promise<boolean>
}

export class GitUtils {
  constructor(options?: GitUtilsOptions)

  /**
   * 获取暂存区文件列表
   */
  getStagedFiles(): string[]

  /**
   * 获取文件的diff
   */
  getFileDiff(filename: string): string | null

  /**
   * 获取文件完整内容
   */
  getFileContent(filename: string): string | null

  /**
   * 过滤相关的代码文件
   */
  filterRelevantFiles(files: string[]): string[]
}

/**
 * 预提交审查主函数
 */
export function preCommitReview(): Promise<void>

export default AICodeReviewer

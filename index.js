#!/usr/bin/env node

// AI-CodeReview npm包的主入口文件
import AICodeReviewer from './scripts/ai-code-review.js'
import GitUtils from './scripts/git-utils.js'
import preCommitReview from './scripts/index.js'

// 导出主要类和函数供其他项目使用
export { AICodeReviewer, GitUtils, preCommitReview }

// 默认导出主要的代码审查器类
export default AICodeReviewer

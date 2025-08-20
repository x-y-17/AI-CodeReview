# AI-CodeReview

🤖 AI驱动的代码审查工具，支持Git hooks集成，提供智能代码质量分析和反馈

## 功能特性

- 🔍 **智能代码分析**: 使用AI模型分析代码变更，识别潜在问题
- 🚀 **Git Hooks集成**: 无缝集成到Git工作流，在提交前自动执行代码审查
- 🌟 **支持多种AI服务**: 默认支持Moonshot Kimi，可扩展其他OpenAI兼容服务
- 📋 **详细反馈报告**: 提供代码质量、安全性、性能等多维度分析
- 🛠️ **高度可配置**: 支持自定义分析规则和反馈格式
- 💬 **中文友好**: 完整的中文界面和反馈

## 安装

### 全局安装

```bash
npm install -g ai-codereview
```

### 项目本地安装

```bash
npm install --save-dev ai-codereview
```

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件并添加你的API密钥：

```env
MOONSHOT_API_KEY=你的Moonshot API密钥
```

### 2. 设置Git Hook

在项目根目录运行：

```bash
# 初始化husky
npx husky install

# 添加pre-commit hook
npx husky add .husky/pre-commit "npx ai-codereview"
```

### 3. 使用

现在每次提交代码时，AI会自动分析你的变更：

```bash
git add .
git commit -m "你的提交信息"
# AI代码审查会自动执行
```

## 编程方式使用

你也可以在代码中直接使用：

```javascript
import { AICodeReviewer } from 'ai-codereview'

const reviewer = new AICodeReviewer()

// 分析代码变更
const result = await reviewer.analyzeChanges()

// 显示反馈
reviewer.displayFeedback(result.feedback)
```

## API 文档

### AICodeReviewer

主要的代码审查器类。

#### 方法

- `analyzeChanges()`: 分析Git暂存区的代码变更
- `analyzeFile(filename)`: 分析单个文件
- `displayFeedback(feedback)`: 显示分析反馈
- `askUserConfirmation(hasIssues)`: 询问用户是否继续提交

### GitUtils

Git操作工具类。

#### 方法

- `getStagedFiles()`: 获取暂存区文件列表
- `getFileDiff(filename)`: 获取文件的diff
- `getFileContent(filename)`: 获取文件完整内容
- `filterRelevantFiles(files)`: 过滤相关的代码文件

## 配置

### 支持的文件类型

默认分析以下类型的文件：

- JavaScript (`.js`, `.jsx`, `.mjs`)
- TypeScript (`.ts`, `.tsx`)
- Vue (`.vue`)
- Python (`.py`)
- Java (`.java`)
- C/C++ (`.c`, `.cpp`, `.h`, `.hpp`)

### 环境变量

- `MOONSHOT_API_KEY`: Moonshot API密钥（必需）
- `OPENAI_API_KEY`: OpenAI API密钥（可选，如果使用OpenAI）
- `AI_REVIEW_MODEL`: 使用的模型名称（默认：moonshot-v1-8k）

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0

- 初始发布
- 支持基本的AI代码审查功能
- Git hooks集成
- Moonshot API支持

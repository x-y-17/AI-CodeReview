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
npm install -g @x648525845/ai-codereview
```

### 项目本地安装

```bash
npm install --save-dev @x648525845/ai-codereview
```

## node版本

需要>=18

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件并添加你的API密钥：

```env
# 必有!
MOONSHOT_API_KEY=你的Moonshot API密钥
# 可选：自定义AI审查提示词
AI_REVIEW_SYSTEM_PROMPT=你的自定义提示词内容
```

### 2. 设置Git Hook

在项目根目录运行：

```bash
# 初始化husky
npx husky install

# 添加pre-commit hook
npx husky add .husky/pre-commit "npx @x648525845/ai-codereview"
```

**重要提示：** 确保 hook 脚本具有正确的退出码处理。如果你遇到提交无法被阻止的问题，可以在 `.husky/pre-commit` 文件中添加：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx @x648525845/ai-codereview
exit $?
```

### 3. 使用

现在每次提交代码时，AI会自动分析你的变更：

```bash
git add .
git commit -m "你的提交信息"
# AI代码审查会自动执行
```

## 默认的提示词

你是一个专业的代码审查专家。请分析提供的代码变更，重点关注：

1. 代码质量和最佳实践
2. 潜在的bug和安全问题
3. 性能优化建议
4. 代码可读性和维护性
5. 测试覆盖率建议

请用中文回复，格式简洁明了。如果没有问题，请简单确认代码看起来不错。`

## 编程方式使用

你也可以在代码中直接使用：

```javascript
import { AICodeReviewer } from 'ai-codereview'

// 使用默认提示词
const reviewer = new AICodeReviewer()

// 或者使用自定义提示词
const customReviewer = new AICodeReviewer({
  systemPrompt: '你是一个专注于安全性的代码审查专家，请特别关注安全漏洞和潜在威胁...'
})

// 分析代码变更
const result = await reviewer.analyzeChanges()

// 显示反馈
reviewer.displayFeedback(result.feedback)
```

## API 文档

### AICodeReviewer

主要的代码审查器类。

#### 构造函数

```javascript
new AICodeReviewer(options)
```

**参数：**

- `options` (Object, 可选): 配置选项
  - `systemPrompt` (String, 可选): 自定义系统提示词。如果不提供，将使用默认的代码审查提示词。

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
- `AI_REVIEW_SYSTEM_PROMPT`: 自定义AI审查提示词（可选，如不设置则使用默认提示词）

## 故障排除

### 提交无法被阻止

如果遇到选择"N"后提交仍然继续的问题，请尝试以下解决方案：

1. **检查 Git Hook 配置**：
   确保 `.husky/pre-commit` 文件内容正确：

   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"

   npx @x648525845/ai-codereview
   exit $?
   ```

2. **使用绝对路径**：
   如果 `npx` 有问题，可以使用全局安装：

   ```bash
   npm install -g @x648525845/ai-codereview

   # 然后在 .husky/pre-commit 中使用
   ai-codereview
   exit $?
   ```

3. **手动测试**：
   可以手动运行来测试退出码：

   ```bash
   echo "n" | npx @x648525845/ai-codereview
   echo "退出码: $?"
   ```

4. **环境变量问题**：
   确保项目根目录有 `.env` 文件，且包含正确的 API 密钥。

### AI 服务不可用

如果 AI 服务不可用（如网络问题或 API 密钥错误），工具会询问是否跳过审查。选择 "N" 会阻止提交，选择 "Y" 会跳过审查继续提交。

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

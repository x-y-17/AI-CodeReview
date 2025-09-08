# AI-CodeReview

🤖 AI驱动的代码审查工具，支持Git hooks集成，提供智能代码质量分析和反馈

## 功能特性

- 🔍 **智能代码分析**: 使用AI模型分析代码变更，识别潜在问题
- 🚀 **Git Hooks集成**: 无缝集成到Git工作流，在提交前自动执行代码审查
- 🌟 **支持多种AI服务**: 默认支持Moonshot Kimi，可扩展其他OpenAI兼容服务
- 📋 **详细反馈报告**: 提供代码质量、安全性、性能等多维度分析
- 📄 **多种输出方式**: 支持生成Markdown报告文件或控制台输出
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

## Node.js 版本要求

需要 Node.js >= 18

## 配置 Git Hooks (Husky)

本工具推荐使用 [Husky](https://typicode.github.io/husky/) 来管理 Git hooks。

### 初始化 Husky

如果项目还没有配置 Husky，请先初始化：

```bash
# 安装 husky
npm install --save-dev husky

# 初始化 husky
npx husky install

# 设置 package.json 脚本（可选，用于自动安装）
npm pkg set scripts.prepare="husky install"
```

### 添加 pre-commit hook

```bash
# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx @x648525845/ai-codereview"
```

**重要提示：** 确保 hook 脚本具有正确的退出码处理。如果你遇到提交无法被阻止的问题，可以在 `.husky/pre-commit` 文件中添加：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx @x648525845/ai-codereview
exit $?
```

更多 Husky 配置和使用方法，请参考：[Husky 官方文档](https://typicode.github.io/husky/)

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件并添加你的API密钥和配置：

```env
# 必须配置 - API密钥 (优先使用 API_KEY，如未设置则使用 MOONSHOT_API_KEY)
API_KEY=你的AI服务API密钥
# 或者使用 Moonshot 专用的环境变量
MOONSHOT_API_KEY=你的Moonshot API密钥

# 可选配置 - AI模型参数
AI_BASE_URL=https://api.moonshot.cn/v1          # AI服务基础URL
AI_MODEL=moonshot-v1-8k                         # 使用的模型名称
AI_MAX_TOKENS=1000                              # 最大token数量
AI_TEMPERATURE=0.3                              # 温度参数 (0-1)

# 可选：自定义AI审查提示词
AI_REVIEW_SYSTEM_PROMPT=你的自定义提示词内容

# 可选：输出模式配置
AI_OUTPUT_MODE=file                             # 输出方式：file(生成文件，默认) 或 console(控制台输出)
```

> **配置优先级说明：**
>
> - API密钥优先级：构造函数参数 > `API_KEY` 环境变量 > `MOONSHOT_API_KEY` 环境变量
> - 其他配置参数优先级：构造函数参数 > 对应环境变量 > 默认值

### 2. 使用

现在每次提交代码时，AI会自动分析你的变更：

```bash
git add .
git commit -m "你的提交信息"
# AI代码审查会自动执行
```

### 输出方式

工具支持两种输出方式：

#### 📄 文件输出（默认）

默认会在项目根目录生成详细的Markdown报告文件：

```bash
# 默认行为，生成报告文件
git commit -m "feat: 添加新功能"
# 会生成类似 ai-code-review-2024-01-15-14-30-25.md 的报告文件
```

生成的报告文件包含：

- 📊 审查概览和统计信息
- 📋 每个文件的详细分析结果
- ⚠️ 问题标识和建议
- 🕒 时间戳和工具信息

#### 💻 控制台输出

如需在控制台直接查看结果：

```bash
# 通过环境变量设置
AI_OUTPUT_MODE=console

# 或者在 .env 文件中设置
# AI_OUTPUT_MODE=console
```

## 默认的提示词

你是一个专业的代码审查专家。请分析提供的代码变更，重点关注：

1. 代码质量和最佳实践
2. 潜在的bug和安全问题
3. 性能优化建议
4. 代码可读性和维护性
5. 测试覆盖率建议

请用中文回复，格式简洁明了。如果没有问题，请简单确认代码看起来不错。`

## 环境变量配置总结

- `API_KEY`: 通用AI服务API密钥（推荐使用）
- `MOONSHOT_API_KEY`: Moonshot API密钥（如果未设置 API_KEY 则使用此项）
- `AI_BASE_URL`: AI服务基础URL（可选，默认：https://api.moonshot.cn/v1）
- `AI_MODEL`: 使用的模型名称（可选，默认：moonshot-v1-8k）
- `AI_MAX_TOKENS`: 最大token数量（可选，默认：1000）
- `AI_TEMPERATURE`: 温度参数（可选，默认：0.3）
- `AI_REVIEW_SYSTEM_PROMPT`: 自定义AI审查提示词（可选，如不设置则使用默认提示词）
- `AI_OUTPUT_MODE`: 输出方式（可选，默认：file，可选值：file/console）

## 编程方式使用

你也可以在代码中直接使用：

```javascript
import { AICodeReviewer } from 'ai-codereview'

// 使用默认配置
const reviewer = new AICodeReviewer()

// 自定义配置
const customReviewer = new AICodeReviewer({
  systemPrompt: '你是一个专注于安全性的代码审查专家，请特别关注安全漏洞和潜在威胁...',
  baseURL: 'https://api.openai.com/v1', // 使用其他AI服务
  model: 'gpt-4', // 使用不同模型
  maxTokens: 2000, // 增加token限制
  temperature: 0.1, // 降低随机性
  outputMode: 'console' // 设置输出方式：'file' 或 'console'
})

// 显示当前配置
customReviewer.displayConfig()

// 分析代码变更
const result = await reviewer.analyzeChanges()

// 显示反馈（现在是异步方法）
await reviewer.displayFeedback(result.feedback)
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
  - `apiKey` (String, 可选): AI服务API密钥。如果不提供，将使用环境变量 `API_KEY`。
  - `baseURL` (String, 可选): AI服务基础URL。默认: `https://api.moonshot.cn/v1`
  - `model` (String, 可选): 使用的AI模型名称。默认: `moonshot-v1-8k`
  - `maxTokens` (Number, 可选): 最大token数量。默认: `1000`
  - `temperature` (Number, 可选): 温度参数 (0-1)。默认: `0.3`
  - `outputMode` (String, 可选): 输出方式。可选值: `'file'`(生成文件，默认) 或 `'console'`(控制台输出)

#### 方法

- `analyzeChanges()`: 分析Git暂存区的代码变更
- `analyzeFile(filename)`: 分析单个文件
- `displayFeedback(feedback)`: 显示分析反馈（异步方法，根据配置选择文件或控制台输出）
- `generateReportFile(feedback)`: 生成Markdown格式的审查报告文件
- `askUserConfirmation(hasIssues)`: 询问用户是否继续提交
- `getConfig()`: 获取当前配置信息
- `displayConfig()`: 显示当前配置信息

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

### v1.1.0

- 支持自定义配置提示词

### v1.2.0

- 支持自定义配置模型
- 支持自定义配置maxTokens && temperature

### v1.3.0

- 🆕 **新增多种输出方式**: 支持生成Markdown报告文件或控制台输出
- 📄 **文件输出功能**: 默认在根目录生成详细的代码审查报告文件
- ⚙️ **新增配置选项**: `outputMode` 和 `AI_OUTPUT_MODE` 环境变量
- 🎨 **优化报告格式**: 包含统计信息、问题标识和时间戳
- 🔧 **改进API**: `displayFeedback` 方法现在是异步的，支持文件生成

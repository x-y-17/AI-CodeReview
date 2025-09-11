# AI-CodeReview

🤖 AI驱动的代码审查工具，支持Git hooks集成，提供智能代码质量分析和反馈

## 功能特性

- 🔍 **智能代码分析**: 使用AI模型分析代码变更，识别潜在问题(注意！！分析的是代码变更->git add选择的所有文件)
- 🚀 **多版本控制系统支持**: 支持Git和SVN版本控制系统，Git可集成hooks自动化
- 🌟 **支持多种AI服务**: 默认推荐DeepSeek（性价比高），同时支持Moonshot、OpenAI等兼容服务
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

## 快速开始

### 1. 配置环境变量

#### 方式一：全局配置（推荐）

为了在所有项目中复用配置，建议使用全局配置：

```bash
# 创建全局配置文件
ai-codereview init-config
```

这会在你的用户主目录创建 `.ai-codereview.env` 文件，编辑该文件填入你的API密钥：

```bash
# 编辑全局配置文件
nano ~/.ai-codereview.env
```

#### 方式二：项目配置

如果需要在特定项目中覆盖全局配置，可以在项目根目录创建 `.env` 文件：

```bash
# 复制配置模板到项目根目录
cp env.template .env
```

#### 配置优先级

配置文件按以下优先级加载（高优先级覆盖低优先级）：

1. **项目根目录的 `.env` 文件**（最高优先级）
2. **用户主目录的 `.ai-codereview.env` 文件**（全局配置）
3. **包目录的 `.env` 文件**（默认配置）

#### 配置帮助

```bash
# 查看配置说明
ai-codereview config-help

# 调试模式查看配置加载过程
ai-codereview --debug
```

推荐使用 **DeepSeek** 配置（性价比高，效果好）：

```env
# 必须配置 - API密钥
API_KEY=你的API密钥

# DeepSeek API 配置（推荐）
AI_BASE_URL=https://api.deepseek.com/v1         # DeepSeek API地址
AI_MODEL=deepseek-chat                          # DeepSeek 模型
AI_MAX_TOKENS=2000                              # 最大token数量
AI_TEMPERATURE=0.3                              # 温度参数 (0-1)

# 可选：自定义AI审查提示词
AI_REVIEW_SYSTEM_PROMPT=你的自定义提示词内容

# 可选：版本控制系统配置
VCS_TYPE=git                                    # 版本控制系统：git(默认) 或 svn

# 可选：输出模式配置
AI_OUTPUT_MODE=file                             # 输出方式：file(生成文件，默认) 或 console(控制台输出)
```

**其他支持的AI服务：**

```env
# Moonshot 配置
# AI_BASE_URL=https://api.moonshot.cn/v1
# AI_MODEL=moonshot-v1-8k
# MOONSHOT_API_KEY=你的Moonshot_API密钥

# OpenAI 配置
# AI_BASE_URL=https://api.openai.com/v1
# AI_MODEL=gpt-4
# OPENAI_API_KEY=你的OpenAI_API密钥
```

> **配置优先级说明：**
>
> - API密钥优先级：构造函数参数 > `API_KEY` 环境变量 > 服务专用环境变量（如 `DEEPSEEK_API_KEY`、`MOONSHOT_API_KEY`）
> - 其他配置参数优先级：构造函数参数 > 对应环境变量 > 默认值
>
> **获取API密钥：**
>
> - DeepSeek: [https://platform.deepseek.com/](https://platform.deepseek.com/)
> - Moonshot: [https://platform.moonshot.cn/](https://platform.moonshot.cn/)
> - OpenAI: [https://platform.openai.com/](https://platform.openai.com/)

### 2. 使用方式

#### 方式一：直接命令行使用（推荐）

直接在终端使用 npx 命令进行代码审查：

```bash
# 在项目目录下直接运行
npx @x648525845/ai-codereview

# 或者全局安装后使用
npm install -g @x648525845/ai-codereview
ai-codereview
```

这种方式适合：

- 手动触发代码审查
- 在CI/CD流水线中使用
- 临时性的代码质量检查

#### 方式二：Git Hooks 自动化集成

通过 Git hooks 实现自动化代码审查，每次提交时自动触发。

##### 使用 Husky 管理 Git Hooks（推荐）

本工具推荐使用 [Husky](https://typicode.github.io/husky/) 来管理 Git hooks。

**1. 初始化 Husky**

如果项目还没有配置 Husky，请先初始化：

```bash
# 安装 husky
npm install --save-dev husky

# 初始化 husky
npx husky install

# 设置 package.json 脚本（可选，用于自动安装）
npm pkg set scripts.prepare="husky install"
```

**2. 添加 pre-commit hook**

```bash
# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx @x648525845/ai-codereview"
```

**3. 确保正确的退出码处理**

如果遇到提交无法被阻止的问题，请在 `.husky/pre-commit` 文件中添加正确的退出码处理：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx @x648525845/ai-codereview
exit $?
```

**4. 使用效果**

配置完成后，每次提交代码时会自动执行AI审查：

```bash
git add .
git commit -m "你的提交信息"
# AI代码审查会自动执行，有问题时会阻止提交
```

更多 Husky 配置和使用方法，请参考：[Husky 官方文档](https://typicode.github.io/husky/)

## 全局配置详解

### 为什么使用全局配置？

全局配置让你可以在所有项目中使用相同的API密钥和基础配置，避免在每个项目中重复配置：

- ✅ **一次配置，到处使用**：在用户主目录配置一次，所有项目都能使用
- ✅ **项目级覆盖**：特定项目可以创建 `.env` 文件覆盖全局配置
- ✅ **配置优先级**：项目配置 > 全局配置 > 默认配置
- ✅ **安全性**：全局配置文件位于用户主目录，不会被意外提交到代码仓库

### 创建全局配置

```bash
# 创建全局配置文件模板
ai-codereview init-config
```

这会在你的用户主目录创建 `.ai-codereview.env` 文件，内容如下：

```env
# AI-CodeReview 全局配置文件
# 此文件位于用户主目录，所有项目都会使用此配置
# 如果项目根目录有 .env 文件，则项目配置优先

# ===========================================
# 必须配置 - API密钥
# ===========================================

# DeepSeek API密钥（推荐使用）
API_KEY=你的DeepSeek_API密钥
# 或者使用 DeepSeek 专用的环境变量
DEEPSEEK_API_KEY=你的DeepSeek_API密钥

# 也可以使用其他AI服务的API密钥
# MOONSHOT_API_KEY=你的Moonshot_API密钥
# OPENAI_API_KEY=你的OpenAI_API密钥

# ===========================================
# AI服务配置（可选）
# ===========================================

# DeepSeek API 配置（默认推荐）
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.3

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
```

### 编辑全局配置

```bash
# 使用你喜欢的编辑器编辑全局配置文件
nano ~/.ai-codereview.env
# 或者
code ~/.ai-codereview.env
# 或者
vim ~/.ai-codereview.env
```

### 配置优先级示例

假设你有以下配置：

**全局配置** (`~/.ai-codereview.env`):

```env
API_KEY=global_api_key
AI_MODEL=deepseek-chat
AI_MAX_TOKENS=2000
```

**项目配置** (`项目根目录/.env`):

```env
API_KEY=project_specific_api_key
AI_TEMPERATURE=0.5
```

**最终生效的配置**:

```env
API_KEY=project_specific_api_key  # 来自项目配置
AI_MODEL=deepseek-chat            # 来自全局配置
AI_MAX_TOKENS=2000                # 来自全局配置
AI_TEMPERATURE=0.5                # 来自项目配置
```

### 配置调试

```bash
# 查看配置加载过程
ai-codereview --debug

# 查看配置帮助信息
ai-codereview config-help
```

#### 使用SVN版本控制

如果您的项目使用SVN版本控制系统，请按以下步骤配置：

**1. 配置环境变量**

在 `.env` 文件中设置：

```env
VCS_TYPE=svn
```

**2. 使用方式**

SVN模式下，工具会分析所有修改状态的文件（包括M、A、D状态）：

```bash
# 修改文件后直接运行分析
svn status  # 查看修改的文件
npx @x648525845/ai-codereview  # 分析修改的文件

# 或者全局安装后使用
ai-codereview
```

**注意事项：**

- SVN模式下不支持hooks自动化（SVN hooks机制与Git不同）
- 工具会分析所有处于修改状态的文件，无需手动添加到暂存区
- 建议在提交前手动运行代码审查

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
- `AI_BASE_URL`: AI服务基础URL（可选，默认：https://api.deepseek.com/v1）
- `AI_MODEL`: 使用的模型名称（可选，默认：deepseek-chat）
- `AI_MAX_TOKENS`: 最大token数量（可选，默认：2000）
- `AI_TEMPERATURE`: 温度参数（可选，默认：0.3）
- `AI_REVIEW_SYSTEM_PROMPT`: 自定义AI审查提示词（可选，如不设置则使用默认提示词）
- `VCS_TYPE`: 版本控制系统类型（可选，默认：git，可选值：git/svn）
- `AI_OUTPUT_MODE`: 输出方式（可选，默认：file，可选值：file/console）

## 编程方式使用

你也可以在代码中直接使用：

```javascript
import { AICodeReviewer } from 'ai-codereview'

// 使用默认配置（自动检测Git/SVN）
const reviewer = new AICodeReviewer()

// 自定义配置（使用DeepSeek + SVN）
const customReviewer = new AICodeReviewer({
  systemPrompt: '你是一个专注于安全性的代码审查专家，请特别关注安全漏洞和潜在威胁...',
  baseURL: 'https://api.deepseek.com/v1', // 使用DeepSeek服务
  model: 'deepseek-chat', // DeepSeek模型
  maxTokens: 2000, // token限制
  temperature: 0.1, // 降低随机性
  outputMode: 'console', // 设置输出方式：'file' 或 'console'
  vcsType: 'svn' // 指定使用SVN版本控制
})

// 使用其他AI服务的示例
const openaiReviewer = new AICodeReviewer({
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4',
  apiKey: 'your-openai-key',
  vcsType: 'git' // 明确指定Git
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
  - `baseURL` (String, 可选): AI服务基础URL。默认: `https://api.deepseek.com/v1`
  - `model` (String, 可选): 使用的AI模型名称。默认: `deepseek-chat`
  - `maxTokens` (Number, 可选): 最大token数量。默认: `2000`
  - `temperature` (Number, 可选): 温度参数 (0-1)。默认: `0.3`
  - `outputMode` (String, 可选): 输出方式。可选值: `'file'`(生成文件，默认) 或 `'console'`(控制台输出)
  - `vcsType` (String, 可选): 版本控制系统类型。可选值: `'git'`(默认) 或 `'svn'`

#### 方法

- `analyzeChanges()`: 分析版本控制系统中的代码变更（Git暂存区或SVN修改文件）
- `analyzeFile(filename)`: 分析单个文件
- `displayFeedback(feedback)`: 显示分析反馈（异步方法，根据配置选择文件或控制台输出）
- `generateReportFile(feedback)`: 生成Markdown格式的审查报告文件
- `askUserConfirmation(hasIssues)`: 询问用户是否继续提交
- `getConfig()`: 获取当前配置信息
- `displayConfig()`: 显示当前配置信息（包括VCS信息）

### VcsUtils

版本控制系统工具类，支持Git和SVN。

#### 方法

- `getStagedFiles()`: 获取需要分析的文件列表（Git暂存区或SVN修改文件）
- `getFileDiff(filename)`: 获取文件的差异内容
- `getFileContent(filename)`: 获取文件完整内容
- `filterRelevantFiles(files)`: 过滤相关的代码文件
- `getVcsType()`: 获取当前使用的版本控制系统类型
- `displayVcsInfo()`: 显示版本控制系统信息

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

### v1.4.0

- 未检测到修改文件时不会输出review结果文件
- 支持svn

### v1.5.0

- 支持全局配置

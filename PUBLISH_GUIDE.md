# 📦 npm包发布指南

## 发布前准备

### 1. 确保所有文件已提交

```bash
git add .
git commit -m "feat: 准备发布npm包"
git push origin main
```

### 2. 登录npm账号

```bash
npm login
# 或者如果使用npm官方registry
npm login --registry=https://registry.npmjs.org/
```

### 3. 检查包配置

```bash
# 检查包的内容（试运行）
npm pack --dry-run

# 验证包的基本信息
npm run prepublishOnly
```

### 4. 运行测试（如果有）

```bash
npm test
```

## 发布包

### 首次发布

```bash
# 发布到npm
npm publish

# 如果包名已被占用，可以使用作用域包名
npm publish --access=public
```

### 更新版本发布

#### 补丁版本 (1.0.0 -> 1.0.1)

```bash
npm version patch
npm publish
```

#### 次要版本 (1.0.0 -> 1.1.0)

```bash
npm version minor
npm publish
```

#### 主要版本 (1.0.0 -> 2.0.0)

```bash
npm version major
npm publish
```

## 发布后验证

### 1. 检查包是否已发布

```bash
npm view ai-codereview
```

### 2. 测试安装

```bash
# 在临时目录测试全局安装
mkdir /tmp/test-install
cd /tmp/test-install
npm install -g ai-codereview

# 测试命令是否可用
ai-codereview --help
```

### 3. 测试本地安装

```bash
# 创建测试项目
mkdir /tmp/test-project
cd /tmp/test-project
npm init -y
npm install ai-codereview

# 测试编程方式使用
echo "import { AICodeReviewer } from 'ai-codereview'; console.log('OK');" > test.mjs
node test.mjs
```

## 版本管理最佳实践

### 语义化版本控制

- **补丁版本 (x.y.Z)**: 向后兼容的错误修复
- **次要版本 (x.Y.z)**: 向后兼容的新功能
- **主要版本 (X.y.z)**: 不向后兼容的API更改

### 发布标签

```bash
# 发布测试版本
npm publish --tag beta

# 发布预发布版本
npm version prerelease --preid=alpha
npm publish --tag alpha
```

## 故障排除

### 包名冲突

如果包名被占用，可以：

1. 使用作用域包名：`@yourusername/ai-codereview`
2. 选择不同的包名

### 权限问题

确保你有发布权限：

```bash
npm whoami
npm owner ls ai-codereview
```

### 网络问题

如果发布失败，检查网络和registry：

```bash
npm config get registry
npm ping
```

## 维护包

### 定期更新依赖

```bash
npm audit
npm update
```

### 添加标签

```bash
git tag v1.0.0
git push --tags
```

### 撤销发布（仅限72小时内）

```bash
npm unpublish ai-codereview@1.0.0
```

## 注意事项

1. 一旦发布，该版本号就不能再次使用
2. 发布后72小时内可以撤销，之后只能弃用
3. 确保README.md和package.json信息准确
4. 遵循npm的使用条款和社区准则

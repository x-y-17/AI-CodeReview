#!/bin/bash

# AI代码审查退出码测试脚本
# 用于验证在您的项目中退出码是否正确工作

echo "🧪 AI代码审查退出码测试"
echo "=========================="
echo ""

# 检查是否有暂存的文件
if ! git diff --cached --quiet; then
    echo "✅ 检测到暂存的文件，开始测试..."
    echo ""
    
    echo "测试 1: 选择取消提交 (应该返回退出码 1)"
    echo "--------------------------------------"
    echo "n" | npx @x648525845/ai-codereview
    exit_code=$?
    echo ""
    echo "退出码: $exit_code"
    if [ $exit_code -eq 1 ]; then
        echo "✅ 测试 1 通过 - 选择 'n' 正确返回退出码 1"
    else
        echo "❌ 测试 1 失败 - 预期退出码 1，实际得到 $exit_code"
    fi
    
    echo ""
    echo "测试 2: 选择继续提交 (应该返回退出码 0)"
    echo "--------------------------------------"
    echo "y" | npx @x648525845/ai-codereview
    exit_code=$?
    echo ""
    echo "退出码: $exit_code"
    if [ $exit_code -eq 0 ]; then
        echo "✅ 测试 2 通过 - 选择 'y' 正确返回退出码 0"
    else
        echo "❌ 测试 2 失败 - 预期退出码 0，实际得到 $exit_code"
    fi
    
else
    echo "⚠️  没有检测到暂存的文件"
    echo "请先添加一些文件到暂存区："
    echo "  git add <文件名>"
    echo "然后重新运行此测试脚本"
fi

echo ""
echo "测试完成！"
echo ""
echo "如果测试失败，请参考文档中的故障排除部分："
echo "https://github.com/x-y-17/AI-CodeReview#故障排除"

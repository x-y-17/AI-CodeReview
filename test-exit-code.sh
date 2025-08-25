#!/bin/bash

echo "测试AI代码审查的退出码..."
echo "当选择 'n' 时，应该返回退出码 1（阻止提交）"
echo ""

# 模拟选择 'n' 的输入
echo "n" | node scripts/index.js
exit_code=$?

echo ""
echo "脚本退出码: $exit_code"
if [ $exit_code -eq 1 ]; then
    echo "✅ 退出码正确 - 提交被阻止"
else
    echo "❌ 退出码错误 - 提交未被阻止"
fi

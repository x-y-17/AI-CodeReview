#!/usr/bin/env node

import readline from 'readline'
import fs from 'fs'

console.log('开始简单测试...')

const input = fs.createReadStream('/dev/tty')
const rl = readline.createInterface({
  input: input,
  output: process.stdout,
  terminal: true
})

rl.question('请输入 y 或 n: ', (answer) => {
  console.log(`你输入的是: "${answer}"`)
  rl.close()
  input.destroy()

  if (answer.toLowerCase() === 'y') {
    console.log('✅ 检测到 y，退出码 0')
    process.exit(0)
  } else {
    console.log('❌ 检测到其他，退出码 1')
    process.exit(1)
  }
})

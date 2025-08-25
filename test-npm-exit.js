#!/usr/bin/env node

// 测试作为npm包执行时的退出码
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const scriptPath = path.join(currentDir, 'scripts/index.js')

async function testExitCode(input, expectedCode) {
  return new Promise((resolve) => {
    console.log(`\n测试输入: "${input}", 期望退出码: ${expectedCode}`)

    const child = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: currentDir
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
      process.stdout.write(data)
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
      process.stderr.write(data)
    })

    // 发送输入
    child.stdin.write(input + '\n')
    child.stdin.end()

    child.on('close', (code) => {
      console.log(`\n实际退出码: ${code}`)
      if (code === expectedCode) {
        console.log('✅ 测试通过')
      } else {
        console.log('❌ 测试失败')
      }
      resolve(code === expectedCode)
    })

    // 设置超时
    setTimeout(() => {
      child.kill('SIGKILL')
      console.log('❌ 测试超时')
      resolve(false)
    }, 30000)
  })
}

async function runTests() {
  console.log('🧪 测试npm包退出码功能...')

  // 创建测试文件
  const testFile = path.join(currentDir, 'test-npm-file.js')
  await import('fs').then((fs) => fs.writeFileSync(testFile, 'console.log("test")'))

  // 添加到git
  const { execSync } = await import('child_process')
  try {
    execSync(`git add ${testFile}`, { stdio: 'inherit' })
  } catch (e) {
    // 忽略git错误
  }

  const results = []

  // 测试取消提交
  results.push(await testExitCode('n', 1))

  // 测试继续提交
  results.push(await testExitCode('y', 0))

  // 清理
  try {
    execSync(`git reset HEAD ${testFile}`, { stdio: 'inherit' })
    await import('fs').then((fs) => fs.unlinkSync(testFile))
  } catch (e) {
    // 忽略清理错误
  }

  const allPassed = results.every((result) => result)
  console.log(`\n总结: ${allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败'}`)
  process.exit(allPassed ? 0 : 1)
}

runTests().catch(console.error)

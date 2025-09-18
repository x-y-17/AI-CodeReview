<template>
  <div class="code-diff">
    <div class="diff-header">
      <div class="diff-title">
        <i class="fas fa-code-branch" />
        代码变更
      </div>
      <div v-if="diffStats" class="diff-stats">
        <span class="additions">+{{ diffStats.additions }}</span>
        <span class="deletions">-{{ diffStats.deletions }}</span>
      </div>
    </div>

    <div class="diff-content">
      <div v-if="!diffLines || diffLines.length === 0" class="no-diff">
        <i class="fas fa-info-circle" />
        <span>没有代码变更信息</span>
      </div>

      <div v-else class="diff-lines">
        <div v-for="(line, index) in diffLines" :key="index" :class="getDiffLineClass(line)" class="diff-line">
          <span class="line-number">{{ line.lineNumber || '' }}</span>
          <span class="line-content">{{ line.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  diff: {
    type: String,
    default: ''
  },
  file: {
    type: Object,
    default: () => ({})
  }
})

// 解析diff内容
const diffLines = computed(() => {
  if (!props.diff) return []

  const lines = props.diff.split('\n')
  const parsedLines = []

  lines.forEach((line, index) => {
    if (line.startsWith('@@')) {
      // 位置信息行
      parsedLines.push({
        type: 'hunk',
        content: line,
        lineNumber: null
      })
    } else if (line.startsWith('+')) {
      // 添加的行
      parsedLines.push({
        type: 'addition',
        content: line.substring(1),
        lineNumber: null
      })
    } else if (line.startsWith('-')) {
      // 删除的行
      parsedLines.push({
        type: 'deletion',
        content: line.substring(1),
        lineNumber: null
      })
    } else if (line.startsWith(' ')) {
      // 上下文行
      parsedLines.push({
        type: 'context',
        content: line.substring(1),
        lineNumber: null
      })
    } else if (line.trim()) {
      // 其他非空行
      parsedLines.push({
        type: 'context',
        content: line,
        lineNumber: null
      })
    }
  })

  return parsedLines
})

// 计算diff统计信息
const diffStats = computed(() => {
  if (!diffLines.value) return null

  const additions = diffLines.value.filter((line) => line.type === 'addition').length
  const deletions = diffLines.value.filter((line) => line.type === 'deletion').length

  return { additions, deletions }
})

// 获取diff行的CSS类
const getDiffLineClass = (line) => {
  return {
    'diff-addition': line.type === 'addition',
    'diff-deletion': line.type === 'deletion',
    'diff-context': line.type === 'context',
    'diff-hunk': line.type === 'hunk'
  }
}
</script>

<style scoped>
.code-diff {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--light-bg);
  border-bottom: 1px solid var(--border-color);
}

.diff-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.diff-title i {
  color: var(--primary-color);
}

.diff-stats {
  display: flex;
  gap: 0.75rem;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
}

.additions {
  color: var(--success-color);
  font-weight: 600;
}

.deletions {
  color: var(--danger-color);
  font-weight: 600;
}

.diff-content {
  max-height: 400px;
  overflow-y: auto;
}

.no-diff {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--text-secondary);
  font-style: italic;
}

.diff-lines {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.diff-line {
  display: flex;
  min-height: 1.5rem;
  align-items: center;
}

.line-number {
  width: 60px;
  padding: 0 0.5rem;
  text-align: right;
  color: var(--text-muted);
  background: var(--light-bg);
  border-right: 1px solid var(--border-color);
  user-select: none;
  flex-shrink: 0;
}

.line-content {
  padding: 0 0.75rem;
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Diff类型样式 */
.diff-addition {
  background-color: rgba(40, 167, 69, 0.1);
  border-left: 3px solid var(--success-color);
}

.diff-addition .line-content {
  color: var(--success-color);
}

.diff-deletion {
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 3px solid var(--danger-color);
}

.diff-deletion .line-content {
  color: var(--danger-color);
}

.diff-context {
  background-color: transparent;
}

.diff-context .line-content {
  color: var(--text-primary);
}

.diff-hunk {
  background-color: rgba(108, 117, 125, 0.1);
  border-left: 3px solid var(--text-muted);
}

.diff-hunk .line-content {
  color: var(--text-muted);
  font-weight: 600;
}

/* 暗黑主题适配 */
[data-theme='dark'] .diff-addition {
  background-color: rgba(40, 167, 69, 0.2);
}

[data-theme='dark'] .diff-deletion {
  background-color: rgba(220, 53, 69, 0.2);
}

[data-theme='dark'] .diff-hunk {
  background-color: rgba(108, 117, 125, 0.2);
}
</style>

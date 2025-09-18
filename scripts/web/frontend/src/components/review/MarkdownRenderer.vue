<template>
  <div class="markdown-container">
    <div class="markdown-content" v-html="renderedMarkdown" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// 配置marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.warn('代码高亮失败:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const renderedMarkdown = computed(() => {
  if (!props.content) return ''

  try {
    return marked.parse(props.content)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return `<pre>${props.content}</pre>`
  }
})
</script>

<style scoped>
.markdown-container {
  padding: 1.5rem;
}

.markdown-content {
  line-height: 1.6;
  font-size: 18px;
}

/* Markdown样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 1em 0 0.5em 0;
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-content :deep(h1) {
  font-size: 1.75em;
}
.markdown-content :deep(h2) {
  font-size: 1.5em;
}
.markdown-content :deep(h3) {
  font-size: 1.25em;
}
.markdown-content :deep(h4) {
  font-size: 1.1em;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
  color: var(--text-primary);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
  color: var(--text-primary);
}

.markdown-content :deep(code) {
  background: var(--code-bg, #f6f8fa);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
  color: var(--code-color, #e83e8c);
}

.markdown-content :deep(pre) {
  background: var(--code-bg, #f6f8fa);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
  border: 1px solid var(--border-color);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-primary);
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 0.5em 0;
  padding: 0 0 0 1em;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-content :deep(strong),
.markdown-content :deep(b) {
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-content :deep(em),
.markdown-content :deep(i) {
  font-style: italic;
}

/* 代码高亮样式 */
.markdown-content :deep(.hljs) {
  background: var(--code-bg, #f6f8fa) !important;
  color: var(--text-primary) !important;
}

.markdown-content :deep(.hljs-keyword) {
  color: #d73a49;
  font-weight: bold;
}

.markdown-content :deep(.hljs-string) {
  color: #032f62;
}

.markdown-content :deep(.hljs-comment) {
  color: #6a737d;
  font-style: italic;
}

.markdown-content :deep(.hljs-number) {
  color: #005cc5;
}

.markdown-content :deep(.hljs-function) {
  color: #6f42c1;
}
</style>

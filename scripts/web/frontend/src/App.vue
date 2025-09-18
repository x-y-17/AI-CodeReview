<template>
  <div class="app" :data-theme="theme">
    <div class="container">
      <!-- 侧边栏 -->
      <Sidebar :review-data="reviewData" :current-file="currentFile" @file-select="handleFileSelect" />

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 临时简化的头部 -->
        <div class="header">
          <h1 class="header-title">代码审查详情</h1>
          <div class="header-actions">
            <button class="btn btn-secondary" @click="handleExport">
              <i class="fas fa-download" />
              导出报告
            </button>
            <!-- <button class="btn btn-primary" @click="handleCommit">
              <i class="fas fa-check" />
              继续提交
            </button> -->
            <button class="btn-ghost" @click="toggleTheme">
              <i id="theme-icon" class="fas fa-moon" />
            </button>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="content-area">
          <div v-if="currentFile" class="review-card">
            <div class="review-header">
              <div class="review-title">
                <FileIcon :file="currentFile" />
                {{ currentFile.filename }}
              </div>
              <StatusBadge :status="currentFile.status" />
            </div>

            <div class="review-content">
              <!-- 代码差异显示 -->
              <CodeDiff v-if="currentFile.diff" :diff="currentFile.diff" :file="currentFile" />

              <!-- AI审查结果 -->
              <div class="feedback-section">
                <div class="feedback-title">
                  <i class="fas fa-lightbulb" />
                  AI 审查结果
                </div>
                <MarkdownRenderer :content="currentFile.analysis" />
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-file-code" />
            <h3>没有选择文件</h3>
            <p>请从左侧选择一个文件查看审查结果</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading">
        <div class="spinner" />
        <p>正在加载审查数据...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useReviewStore } from '@/stores/review'
import { useThemeStore } from '@/stores/theme'
import Sidebar from '@/components/layout/Sidebar.vue'
import MarkdownRenderer from '@/components/review/MarkdownRenderer.vue'
import CodeDiff from '@/components/review/CodeDiff.vue'
import FileIcon from '@/components/common/FileIcon.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const reviewStore = useReviewStore()
const themeStore = useThemeStore()

const loading = ref(true)
const currentFile = ref(null)

// 计算属性
const reviewData = computed(() => reviewStore.data)
const theme = computed(() => themeStore.current)

// 方法
const handleFileSelect = (file) => {
  currentFile.value = file
}

const handleExport = () => {
  reviewStore.exportReport()
}

const handleCommit = () => {
  if (confirm('确定要继续提交代码吗？\n\n建议先处理标记为"需注意"的问题。')) {
    // 集成到现有的git流程
    console.log('继续提交...')
  }
}

const toggleTheme = () => {
  themeStore.toggle()
}

// 生命周期
onMounted(async () => {
  try {
    await reviewStore.loadData()
    if (reviewData.value?.files?.length > 0) {
      currentFile.value = reviewData.value.files[0]
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--light-bg);
  color: var(--text-primary);
  line-height: 1.6;
  transition: all 0.3s ease;
}

.container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--light-bg);
}

.review-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.review-content {
  padding: 1.5rem;
}

.feedback-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.feedback-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: var(--light-bg);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.feedback-title i {
  color: var(--primary-color);
}

.review-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 0.75rem;
  text-align: center;
  min-width: 200px;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div class="sidebar">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-robot" />
        AI CodeReview
      </div>
    </div>

    <!-- 统计卡片 -->
    <StatCards :summary="reviewData?.summary" />

    <!-- 文件列表 -->
    <div class="file-list">
      <div class="file-list-header">
        <span>审查文件 ({{ reviewData?.files?.length || 0 }})</span>
        <i class="fas fa-filter" />
      </div>

      <div class="file-items">
        <div
          v-for="file in reviewData?.files"
          :key="file.id"
          class="file-item"
          :class="{ active: currentFile?.id === file.id }"
          @click="$emit('file-select', file)"
        >
          <FileIcon :file="file" />

          <div class="file-details">
            <div class="file-name" :title="file.fullPath">
              {{ file.filename }}
            </div>
            <div class="file-path">{{ file.directory }}/</div>
            <div class="file-status">{{ getStatusText(file) }}</div>
          </div>

          <StatusBadge :status="file.status" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatCards from '@/components/review/StatCards.vue'
import FileIcon from '@/components/common/FileIcon.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

defineProps({
  reviewData: {
    type: Object,
    default: null
  },
  currentFile: {
    type: Object,
    default: null
  }
})

defineEmits(['file-select'])

const getStatusText = (file) => {
  if (file.status === 'success') return '无问题'
  if (file.hasIssues) {
    const issueCount = file.analysis?.match(/建议|问题|错误/g)?.length || 1
    return `${issueCount}个问题`
  }
  return '需要注意'
}
</script>

<style scoped>
.sidebar {
  width: 350px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-color), #4f46e5);
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.file-list {
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
}

.file-items {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}

.file-item {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: var(--light-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 4.5rem;
}

.file-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.file-item.active {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.1);
}

.file-details {
  flex: 1;
  min-width: 0;
  margin-left: 0.75rem;
}

.file-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.125rem;
}

.file-path {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.file-status {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    z-index: 1000;
    height: 100vh;
    width: 100%;
  }

  .sidebar.open {
    left: 0;
  }
}
</style>

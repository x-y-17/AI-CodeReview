<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-title">总文件数</span>
        <i class="fas fa-file-code" />
      </div>
      <div class="stat-value">{{ summary?.total || 0 }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-title">通过检查</span>
        <i class="fas fa-check-circle stat-success" />
      </div>
      <div class="stat-value stat-success">{{ summary?.passed || 0 }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-title">需要注意</span>
        <i class="fas fa-exclamation-triangle stat-warning" />
      </div>
      <div class="stat-value stat-warning">{{ summary?.hasIssues || 0 }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.stats-grid {
  padding: 1.5rem;
  display: grid;
  gap: 0.75rem;
}

.stat-card {
  padding: 1.25rem 1rem;
  background: var(--light-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-success {
  color: var(--success-color);
}

.stat-warning {
  color: var(--warning-color);
}

.stat-danger {
  color: var(--danger-color);
}
</style>

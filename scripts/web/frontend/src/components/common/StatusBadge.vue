<template>
  <span class="status-badge" :class="badgeClass">
    {{ badgeText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['success', 'warning', 'error'].includes(value)
  }
})

const badgeConfig = {
  success: { text: '通过', class: 'badge-success' },
  warning: { text: '需注意', class: 'badge-warning' },
  error: { text: '错误', class: 'badge-error' }
}

const badgeText = computed(() => {
  return badgeConfig[props.status]?.text || '未知'
})

const badgeClass = computed(() => {
  return badgeConfig[props.status]?.class || 'badge-default'
})
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  position: absolute;
  top: 1rem;
  right: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.badge-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.badge-default {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-secondary);
}
</style>

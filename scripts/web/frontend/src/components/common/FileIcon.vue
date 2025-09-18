<template>
  <div class="file-icon">
    <i :class="iconClass" :style="{ color: iconColor }" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  file: {
    type: Object,
    required: true
  }
})

const iconConfig = {
  '.js': { class: 'fab fa-js-square', color: '#f7df1e' },
  '.jsx': { class: 'fab fa-react', color: '#61dafb' },
  '.ts': { class: 'fab fa-js-square', color: '#3178c6' },
  '.tsx': { class: 'fab fa-react', color: '#61dafb' },
  '.vue': { class: 'fab fa-vuejs', color: '#4fc08d' },
  '.css': { class: 'fab fa-css3-alt', color: '#1572b6' },
  '.scss': { class: 'fab fa-sass', color: '#cc6699' },
  '.html': { class: 'fab fa-html5', color: '#e34f26' },
  '.json': { class: 'fas fa-file-code', color: '#f39c12' },
  '.md': { class: 'fab fa-markdown', color: '#083fa1' },
  '.py': { class: 'fab fa-python', color: '#3776ab' },
  '.java': { class: 'fab fa-java', color: '#f89820' },
  '.go': { class: 'fas fa-code', color: '#00add8' },
  '.php': { class: 'fab fa-php', color: '#777bb4' },
  '.rb': { class: 'fas fa-gem', color: '#cc342d' },
  '.swift': { class: 'fab fa-swift', color: '#fa7343' },
  '.kt': { class: 'fas fa-code', color: '#7f52ff' },
  '.rs': { class: 'fas fa-code', color: '#dea584' },
  default: { class: 'fas fa-file-code', color: '#6b7280' }
}

const iconClass = computed(() => {
  const config = iconConfig[props.file.extension] || iconConfig.default
  return config.class
})

const iconColor = computed(() => {
  const config = iconConfig[props.file.extension] || iconConfig.default
  return config.color
})
</script>

<style scoped>
.file-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 1.25rem;
}

[data-theme='dark'] .file-icon {
  background: var(--darker-bg);
}
</style>

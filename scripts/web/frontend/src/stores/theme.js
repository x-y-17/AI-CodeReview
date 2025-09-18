import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const current = ref(localStorage.getItem('theme') || 'light')

  // 方法
  const setTheme = (theme) => {
    current.value = theme
    localStorage.setItem('theme', theme)
    document.body.setAttribute('data-theme', theme)
  }

  const toggle = () => {
    const newTheme = current.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const initTheme = () => {
    // 检查系统偏好
    if (current.value === 'auto') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPrefersDark ? 'dark' : 'light')
    } else {
      setTheme(current.value)
    }
  }

  // 监听主题变化
  watch(
    current,
    (newTheme) => {
      document.body.setAttribute('data-theme', newTheme)
    },
    { immediate: true }
  )

  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (current.value === 'auto') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  return {
    current,
    setTheme,
    toggle,
    initTheme
  }
})

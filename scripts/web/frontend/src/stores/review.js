import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useReviewStore = defineStore('review', () => {
  // 状态
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const summary = computed(() => {
    if (!data.value) return null
    return {
      total: data.value.files?.length || 0,
      passed: data.value.files?.filter((f) => f.status === 'success').length || 0,
      hasIssues: data.value.files?.filter((f) => f.status === 'warning').length || 0
    }
  })

  const filesByStatus = computed(() => {
    if (!data.value?.files) return { success: [], warning: [] }

    return data.value.files.reduce(
      (acc, file) => {
        acc[file.status].push(file)
        return acc
      },
      { success: [], warning: [] }
    )
  })

  // 方法
  const loadData = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 开始加载审查数据...')
      const response = await api.get('/review-data')
      console.log('📥 API响应:', response)
      console.log('📊 审查数据:', response.data)

      if (response.data && response.data.success) {
        data.value = response.data.data
        console.log('✅ 数据加载成功，文件数量:', data.value?.files?.length || 0)
      } else {
        console.log('⚠️ API响应格式异常:', response.data)
        data.value = response.data
      }
    } catch (err) {
      error.value = err.message || '加载数据失败'
      console.error('❌ 加载审查数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  const exportReport = async (format = 'markdown') => {
    try {
      const response = await api.post('/export', {
        format,
        data: data.value
      })

      if (response.data.success) {
        // 创建下载链接
        const blob = new Blob([response.data.content], {
          type: format === 'pdf' ? 'application/pdf' : 'text/markdown'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('导出报告失败:', err)
      error.value = '导出报告失败'
    }
  }

  const getFileById = (id) => {
    return data.value?.files?.find((file) => file.id === id)
  }

  const updateFileStatus = (fileId, status) => {
    const file = getFileById(fileId)
    if (file) {
      file.status = status
    }
  }

  return {
    // 状态
    data,
    loading,
    error,

    // 计算属性
    summary,
    filesByStatus,

    // 方法
    loadData,
    exportReport,
    getFileById,
    updateFileStatus
  }
})

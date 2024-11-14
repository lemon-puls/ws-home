<template>
  <el-dialog
    v-model="dialogVisible"
    title="相册统计"
    width="900px"
    :show-close="true"
    class="stats-dialog"
  >
    <div class="stats-container">
      <div class="stats-item">
        <div class="stats-icon">
          <el-icon><Picture /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ stats.totalPhotos }}</div>
          <div class="stats-label">总照片数</div>
        </div>
      </div>

      <div class="stats-item">
        <div class="stats-icon">
          <el-icon><Collection /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ stats.totalAlbums }}</div>
          <div class="stats-label">总相册数</div>
        </div>
      </div>

      <div class="stats-item">
        <div class="stats-icon">
          <el-icon><Files /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-value">{{ formatMBToReadableString(stats.totalSize)  }}</div>
          <div class="stats-label">总存储空间</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Picture, Collection, Files } from '@element-plus/icons-vue'
import { formatMBToReadableString, formatSize } from '@/utils/ByteUtils'
import { Service } from '../../../generated'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 统计数据
const stats = ref({
  totalPhotos: 0,
  totalAlbums: 0,
  totalSize: 0
})

// 获取统计数据
const getStats = async () => {
  try {
    const res = await Service.getAlbumStats()
    if (res.code === 0) {
      stats.value = {
        ...stats.value,
        ...res.data
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

defineExpose({
  getStats
})
</script>

<style lang="scss" scoped>
.stats-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
}

.stats-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .stats-icon {
    padding: 12px;
    border-radius: 50%;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);

    .el-icon {
      font-size: 24px;
    }
  }

  .stats-content {
    .stats-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      white-space: nowrap;
    }

    .stats-label {
      font-size: 14px;
      color: #909399;
      margin-top: 5px;
    }
  }
}
</style>

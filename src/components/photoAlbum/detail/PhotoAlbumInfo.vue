<script setup lang="ts">
import { defineProps, ref, watch, nextTick } from 'vue'
import SvgIcon from '@/icons/SvgIcon'
import { formatDate } from '../../../utils/TimeUtils'
import { Service } from '../../../../generated'
import { ElMessage } from 'element-plus'
import { useAlbumStore } from '@/stores/album'

const albumStore = useAlbumStore()

interface Author {
  avatar: string
  username: string
}

interface AlbumInfo {
  title: string
  description: string
  createTime: string
  author: Author
  photoCount: number
}

const props = defineProps<{
  albumInfo: AlbumInfo
}>()

// 编辑状态
const isTitleEditing = ref(false)
const isDescEditing = ref(false)

// 编辑表单数据
const editForm = ref({
  title: props.albumInfo.title,
  description: props.albumInfo.description
})

// 保存编辑
const saveEdit = async () => {
  try {
    const res = await Service.postAlbum({
      id: albumStore.currentAlbumId,
      name: editForm.value.title,
      description: editForm.value.description
    })

    if (res.code == 0) {
      ElMessage.success('更新成功')
      // 触发父组件重新获取相册信息
      emit('update')
    } else {
      ElMessage.error('更新失败:' + res.msg)
    }
  } catch (error) {
    console.error('保存编辑失败:', error)
    ElMessage.error('保存失败')
  }
}

const emit = defineEmits(['update'])

// 监听 props 变化更新表单数据
watch(
  () => props.albumInfo,
  (newVal) => {
    editForm.value = {
      title: newVal.title,
      description: newVal.description
    }
  },
  { deep: true }
)

// 处理标题失焦
const handleTitleBlur = () => {
  isTitleEditing.value = false
  saveEdit()
}

// 处理描述失焦
const handleDescBlur = () => {
  isDescEditing.value = false
  saveEdit()
}

const titleInput = ref<HTMLInputElement | null>(null)
const descInput = ref<HTMLInputElement | null>(null)

const handleTitleClick = async () => {
  isTitleEditing.value = true
  await nextTick()
  titleInput.value?.focus()
}

const handleDescClick = async () => {
  isDescEditing.value = true
  await nextTick()
  descInput.value?.focus()
}
</script>

<template>
  <div class="album-info">
    <!-- 作者信息 -->
    <div class="album-info-header">
      <div class="album-info-author">
        <el-avatar :size="50" :src="albumInfo.author.avatar" />
        <div class="album-info-author-name">{{ albumInfo.author.username }}</div>
      </div>
    </div>

    <!-- 相册内容 -->
    <div class="album-info-content">
      <div class="album-info-title" @click="handleTitleClick">
        <template v-if="!isTitleEditing">
          <div class="title-text">{{ albumInfo.title }}</div>
        </template>
        <el-input
          v-else
          ref="titleInput"
          v-model="editForm.title"
          @blur="handleTitleBlur"
          @keyup.enter="handleTitleBlur"
        />
      </div>

      <div class="album-info-stats">
        <span
          ><span class="photo-count">{{ albumInfo.photoCount }}</span> 张照片</span
        >
        <span class="create-time">{{ formatDate(albumInfo.createTime) }}</span>
      </div>

      <div class="album-info-desc" @click="handleDescClick">
        <template v-if="!isDescEditing">
          <div style="white-space: pre-line">{{ albumInfo.description }}</div>
        </template>
        <el-input
          v-else
          ref="descInput"
          v-model="editForm.description"
          type="textarea"
          :rows="20"
          :autosize="{ minRows: 20, maxRows: 50 }"
          @blur="handleDescBlur"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.album-info {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-image: linear-gradient(#e6f3ff 1px, transparent 1px),
    linear-gradient(90deg, #e6f3ff 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  margin: 0;
  box-sizing: border-box;
  overflow-y: auto;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &-author-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }

  &-title {
    cursor: pointer;
    margin-bottom: 16px;

    .title-text {
      font-size: 24px;
      font-weight: bold;
    }

    &:hover {
      background-color: #f5f7fa;
    }

    .el-input {
      font-size: 24px;
    }
  }

  &-stats {
    font-size: 14px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .photo-count {
      color: #ff4757;
      font-weight: 600;
    }

    .create-time {
      color: #999;
      font-size: 12px;
    }
  }

  &-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }

  &-title,
  &-desc {
    cursor: pointer;
  }
}
</style>

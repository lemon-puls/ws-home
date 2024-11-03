<script setup lang="ts">
import { defineProps } from 'vue'
import SvgIcon from '@/icons/SvgIcon'
import { formatDate } from '../../../utils/TimeUtils'

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
      <h1 class="album-info-title">{{ albumInfo.title }}</h1>
      <div class="album-info-stats">
        <span
          ><span class="photo-count">{{ albumInfo.photoCount }}</span> 张照片</span
        >
        <span class="create-time">{{ formatDate(albumInfo.createTime) }}</span>
      </div>
      <div class="album-info-desc" style="white-space: pre-line">{{ albumInfo.description }}</div>
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
  }

  &-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
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
}
</style>

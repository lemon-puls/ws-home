<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '@/icons/SvgIcon'

// 模拟数据，实际应该通过props传入
const albumInfo = ref({
  title: '广州一日游',
  description: `广州之旅 - 2024年春天\n这是一次难忘的广州之行。我们漫步在沙面老街，感受着独特的欧陆建筑风情；
在陈家祠堂，欣赏精美的岭南建筑艺术；
登上广州塔，俯瞰珠江两岸的繁华景象。

午后，我们品尝了地道的早茶，感受了广州人的生活情调。
傍晚时分，在珠江夜游的游船上，看着两岸霓虹闪烁，为这次旅程画上了完美的句点。

这些照片记录下了我们每一个精彩的瞬间，希望能让这些美好的回忆永远保存。`,
  createTime: '2024-03-20 12:00:00',
  author: {
    avatar: 'https://example.com/avatar.jpg',
    username: '小霜'
  },
  photoCount: 14
})
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
        <span class="create-time">{{ albumInfo.createTime }}</span>
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

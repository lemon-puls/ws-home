<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  // 视频URL
  src: string
  // 是否处于编辑模式
  isEditing?: boolean
}>()

const dialogVisible = ref(false)

// 打开预览
const showPreview = () => {
  dialogVisible.value = true
}

// 处理右键点击
const handleContextMenu = (e: MouseEvent) => {
  if (props.isEditing) {
    e.preventDefault() // 阻止默认的右键菜单
    showPreview()
  }
}

// 处理左键点击
const handleClick = () => {
  if (props.isEditing) {
    emit('select')
  } else {
    showPreview()
  }
}

const emit = defineEmits(['select'])
</script>

<template>
  <div class="video-player">
    <!-- 缩略图容器 -->
    <div class="video-thumbnail" @click="handleClick" @contextmenu="handleContextMenu">
      <video :src="props.src" class="preview-video">您的浏览器不支持 video 标签。</video>
      <div class="play-icon">
        <el-icon><VideoPlay /></el-icon>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog v-model="dialogVisible" width="80%" :close-on-click-modal="true" :show-close="true">
      <video controls :src="props.src" style="width: 100%">您的浏览器不支持 video 标签。</video>
    </el-dialog>
  </div>
</template>

<style scoped>
.video-player {
  display: inline-block;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.video-thumbnail {
  position: relative;
  cursor: pointer;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon .el-icon {
  font-size: 24px;
  color: white;
}

.video-thumbnail:hover .play-icon {
  background: rgba(0, 0, 0, 0.7);
}
</style>

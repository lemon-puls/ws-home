<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  // 视频URL
  src: string
  // 视频列表
  previewSrcList?: string[]
  // 当前索引
  initialIndex?: number
  // 是否处于编辑模式
  isEditing?: boolean
}>()

const dialogVisible = ref(false)
const currentIndex = ref(props.initialIndex || 0)
const videoRef = ref<HTMLVideoElement>()

// 监听对话框关闭
watch(dialogVisible, (newVal) => {
  if (!newVal && videoRef.value) {
    // 对话框关闭时暂停视频
    videoRef.value.pause()
  }
})

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

// 切换到上一个视频
const prevVideo = () => {
  if (!props.previewSrcList?.length) return
  if (videoRef.value) {
    videoRef.value.pause() // 暂停当前视频
  }
  currentIndex.value =
    (currentIndex.value - 1 + props.previewSrcList.length) % props.previewSrcList.length
  playVideo()
}

// 切换到下一个视频
const nextVideo = () => {
  if (!props.previewSrcList?.length) return
  if (videoRef.value) {
    videoRef.value.pause() // 暂停当前视频
  }
  currentIndex.value = (currentIndex.value + 1) % props.previewSrcList.length
  playVideo()
}

// 播放视频
const playVideo = async () => {
  if (videoRef.value) {
    await videoRef.value.load()
    videoRef.value.play()
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
      <div class="video-container">
        <!-- 左切换按钮 -->
        <div v-if="props.previewSrcList?.length > 1" class="switch-btn prev" @click="prevVideo">
          <el-icon><ArrowLeft /></el-icon>
        </div>

        <video
          ref="videoRef"
          controls
          :src="props.previewSrcList?.[currentIndex] || props.src"
          style="width: 100%"
        >
          您的浏览器不支持 video 标签。
        </video>

        <!-- 右切换按钮 -->
        <div v-if="props.previewSrcList?.length > 1" class="switch-btn next" @click="nextVideo">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
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

.video-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.switch-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1;
}

.switch-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.switch-btn .el-icon {
  font-size: 24px;
  color: white;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}
</style>

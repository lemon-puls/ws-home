<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  // 图片URL
  src: string
  // 预览图片列表
  previewSrcList?: string[]
  // 初始预览索引
  initialIndex?: number
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
  <div class="img-previewer">
    <!-- 缩略图 -->
    <img
      :src="props.src"
      class="preview-img"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    />

    <!-- 预览弹窗 -->
    <el-image-viewer
      v-if="dialogVisible"
      :url-list="props.previewSrcList || [props.src]"
      :initial-index="props.initialIndex || 0"
      @close="dialogVisible = false"
    />
  </div>
</template>

<style scoped>
.img-previewer {
  display: inline-block;
  border-radius: 10px;
  overflow: hidden; /* 确保内部图片不会溢出圆角边框 */
  position: relative; /* 为选中效果提供定位上下文 */
}

.preview-img {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block; /* 消除图片底部间隙 */
  object-fit: cover; /* 保持图片比例并填充容器 */
}

.preview-img:hover {
  transform: scale(1.05);
}
</style>

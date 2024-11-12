<template>
  <el-popover
    v-model:visible="showDropdown"
    placement="bottom"
    :width="100"
    trigger="contextmenu"
    popper-class="context-menu-popover"
  >
    <template #reference>
      <div id="courseItemId" @click="$emit('click')">
        <div :class="{ container: true }">
          <img :src="album.cover_img" />
          <span>{{ album.photo_count || 0 }} p</span>
        </div>
        <div class="title">
          <span>{{ album.name }}</span>
        </div>
        <div class="footer">
          <div class="footer-author">
            <SvgIcon class="footer-author-icon" icon="author"></SvgIcon>
            <span class="footer-author-name">{{ album.user?.userName }}</span>
          </div>
          <span class="footer-date">{{ formatDate(album?.create_time ?? '') }}</span>
        </div>
      </div>
    </template>

    <div class="context-menu-content">
      <div class="menu-item delete" @click="handleDelete">
        <el-icon><Delete /></el-icon>
        <span>删除相册</span>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import SvgIcon from '@/icons/SvgIcon'
import type { vo_AlbumVO } from '../../../generated'
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Service } from '../../../generated'

const emit = defineEmits(['update', 'click'])

const props = defineProps<{
  album: vo_AlbumVO
}>()

// 右键菜单相关
const showDropdown = ref(false)

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该相册吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (!props.album?.id) {
      ElMessage.error('相册不存在')
      return
    }

    const res = await Service.deleteAlbum(props.album.id.toString())
    if (res.code === 0) {
      ElMessage.success('删除成功')
      emit('update') // 通知父组件更新列表
    } else {
      ElMessage.error('删除失败:' + res.msg)
    }
  } catch (error) {
    // 用户取消删除
    console.log('取消删除')
  } finally {
    showDropdown.value = false
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.context-menu-content {
  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    &.delete {
      color: #ff4757;

      &:hover {
        background-color: #fff1f0;
      }
    }
  }
}

:deep(.context-menu-popover) {
  padding: 0;
  min-width: 100px;
}

#courseItemId {
  position: relative;
  cursor: pointer;
  user-select: none;
  max-width: 250px;
  width: 20vw;
  height: auto;
  border-radius: 10px;
  background-color: #f1f2f5;
  padding: 10px;

  .container {
    width: 100%; /* 设置容器宽度 */
    max-width: 250px; /* 设置最大宽度，可根据需要调整 */
    width: 20vw;
    position: relative;
    padding-top: calc(378 / 672 * 100%); /* 设置容器的 padding-top 为宽高比例 */
    overflow: hidden;

    img {
      position: absolute;
      width: 100%; /* 图片宽度为容器宽度 */
      height: auto; /* 让高度自适应，保持图片比例 */
      top: 0;
      left: 0;
      border-radius: 10px;
    }

    span {
      position: absolute;
      bottom: 0;
      right: 0;
      color: white;
      margin-right: 5px;
      margin-bottom: 5px;
      font-size: min(1vw, 14px);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      border-radius: 10px;

      .overlay-content {
        color: white; /* 文字颜色 */
        font-size: 12px; /* 文字大小 */
        text-align: center; /* 文字居中 */
        padding: 5px; /* 内边距 */
        border-radius: 5px; /* 圆角 */
        background-color: rgba(0, 0, 0, 0.7); /* 遮罩层背景 */
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        row-gap: 3px;

        span {
          position: initial;
          bottom: initial;
          right: initial;
          margin-right: initial;
          margin-bottom: initial;
        }

        .remark {
          font-size: 10px;
          color: #ffffff;
        }
      }
    }
  }

  .title {
    padding: 5px;
    font-size: min(1vw, 15px);
    color: #383434;
  }

  .footer {
    color: #979797;
    display: flex;
    justify-content: space-between;
    font-size: min(0.8vw, 12px);

    &-author {
      &-name {
        margin-left: 5px;
      }

      &-icon {
        margin-left: 5px;
      }
    }
  }

  // 添加这个样式以防止文本被选中
  user-select: none;
}
</style>

<template>
  <div class="overlay" v-if="true" @click="handleClickOutside"></div>
  <transition
    enter-active-class="animate__animated animate__backInLeft"
    leave-active-class="animate__animated animate__backOutRight"
  >
    <div
      id="photoAlbumDetailId"
      style="display: flex; align-items: center; justify-content: center"
      v-if="true"
    >
      <div style="flex: 1; height: 100%" class="">
        <PhotoAlbumInfo
          :album-info="albumInfo"
          @update="() => getAlbumDetail(albumStore.currentAlbumId)"
        />
      </div>
      <el-divider direction="vertical" style="height: 100%" />
      <div
        style="
          flex: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          position: relative;
        "
        class=""
      >
        <div class="top-bar">
          <div style="display: flex; align-items: center; gap: 20px">
            <el-radio-group v-model="filterType" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="image">图片</el-radio-button>
              <el-radio-button label="video">视频</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="imageType" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="compressed">压缩</el-radio-button>
              <el-radio-button label="raw">原图</el-radio-button>
            </el-radio-group>
            <el-switch
              v-if="isEditing"
              v-model="isCompress"
              class="mt-2"
              inactive-text="开启压缩"
            />
          </div>
          <div>
            <el-button v-if="isEditing" @click="deleteImgs" type="danger" round
              >删除选定图片
            </el-button>
            <el-button @click="photoItemRef.toggleEdit()" type="success" round
              >{{ isEditing ? '完成' : '编辑' }}
            </el-button>
          </div>
        </div>
        <PhotoItem
          v-model="isEditing"
          :is-compress="isCompress"
          @onUpdate="() => getAlbumDetail(albumStore.currentAlbumId)"
          ref="photoItemRef"
        />
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
/*聊天框*/
#photoAlbumDetailId {
  --width: min(95vw, 1400px);
  --height: min(90vh, 800px);
  width: var(--width);
  height: var(--height);
  background-color: white;
  position: fixed;
  left: calc(50% - var(--width) / 2);
  top: calc(50% - var(--height) / 2);
  /*transform: translateX(-50%);*/
  /*transform: translateX(-50%);*/
  z-index: 10001;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;

  .top-bar {
    width: 100%;
    height: 45px;
    background-color: white;
    position: sticky;
    top: 0;
    left: 0;
    //z-index: 10002;
    border-top-right-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 水平偏移量，垂直偏移量，模糊半径，颜色 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;

    /* 添加响应式样式 */
    @media (max-width: 768px) {
      height: auto;
      padding: 10px;
      flex-direction: column;
      gap: 10px;

      .el-button {
        font-size: 12px;
        padding: 8px 15px;
      }

      .el-switch {
        transform: scale(0.8);
        margin-left: 0 !important;
      }
    }

    /* 添加中等屏幕的样式 */
    @media (min-width: 769px) and (max-width: 1024px) {
      padding: 0 15px;

      .el-button {
        font-size: 13px;
        padding: 9px 18px;
      }
    }
  }

  .el-divider--vertical {
    margin: 0;
    width: 0;
  }

  /* 移动端布局切换为纵向 */
  @media (max-width: 768px) {
    flex-direction: column;
    height: 95vh;

    .el-divider--vertical {
      display: none;
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}
</style>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import PhotoItem from '@/components/photoAlbum/PhotoItem.vue'
import PhotoAlbumInfo from '@/components/photoAlbum/detail/PhotoAlbumInfo.vue'
import { useAlbumStore } from '@/stores/album'
import { Service } from '../../../generated'

const albumStore = useAlbumStore()

// 相册详情数据
const albumInfo = ref({
  title: '',
  description: '',
  createTime: '',
  author: {
    avatar: '',
    username: ''
  },
  startTime: '',
  totalSize: 0,
  photoCount: 0
})

// 获取相册详情
const getAlbumDetail = async (albumId: number) => {
  try {
    const res = await Service.getAlbum(albumId.toString())
    if (res.code === 0) {
      const data = res.data
      console.log('相册详情数据:', data)
      // 更新相册信息
      albumInfo.value = {
        title: data.name,
        description: data.description,
        createTime: data.create_time,
        author: {
          avatar: data.user?.avatar || '', // 这里可以设置默认头像
          username: data.user?.userName || '未知用户'
        },
        photoCount: data.photo_count || 0,
        videoCount: data.video_count || 0,
        totalSize: data.total_size || 0,
        startTime: data.start_time || ''
      }
    }
  } catch (error) {
    console.error('获取相册详情失败:', error)
  }
}

// 监听相册ID变化
watch(
  () => albumStore.currentAlbumId,
  async (newId) => {
    if (newId) {
      await getAlbumDetail(newId)
    }
  },
  { immediate: true }
)

const handleClickOutside = () => {
  albumStore.showAlbumDetail(0)
}

let photoItemRef = ref()
// photoItemRef.value.deleteSelectedImages()

// 是否编辑状态
let isEditing = ref(false)
// 是否开启压缩
let isCompress = ref(true)

const deleteImgs = () => {
  photoItemRef.value.deleteSelectedImages()
}

// 媒体类型筛选
const filterType = ref('all')
// 图片类型筛选
const imageType = ref('compressed')

// 监听筛选类型变化
watch([filterType, imageType], ([newFilterType, newImageType]) => {
  if (photoItemRef.value) {
    const params = {
      type: newFilterType === 'image' ? 0 : newFilterType === 'video' ? 1 : undefined,
      isRaw: newImageType === 'raw' ? true : newImageType === 'compressed' ? false : undefined
    }
    photoItemRef.value.resetAndRefresh(params)
  }
})
</script>

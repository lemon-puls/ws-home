<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import PhotoAlbumItem from '@/components/photoAlbum/PhotoAlbumItem.vue'
import SvgIcon from '@/icons/SvgIcon'
import { useAlbumStore } from '@/stores/album'
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { dto_GetPresignedURLReq, Service, type vo_AlbumVO } from '../../generated'
import PhotoStatsDialog from '@/components/photoAlbum/PhotoStatsDialog.vue'

const albumStore = useAlbumStore()

// 从环境变量获取轮播图配置
let imgList = ref<string[]>([])

// 相册列表
const albumList = ref<vo_AlbumVO[]>([])
// 分页参数
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 搜索关键词
const searchKeyword = ref('')

// 统计弹窗相关
const statsDialogVisible = ref(false)
const statsDialogRef = ref()

// 获取相册列表
const getAlbumList = async () => {
  try {
    const res = await Service.getAlbumList(
      currentPage.value,
      pageSize.value,
      undefined,
      'start_time',
      'desc',
      searchKeyword.value
    )
    if (res.code === 0) {
      albumList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error('获取相册列表失败:' + res.msg)
    }
  } catch (error: any) {
    ElMessage.error(error.message)
  }
}

// 打开相册
const handleOpenAlbum = (item: any) => {
  albumStore.showAlbumDetail(item.id)
}

const handleCreate = () => {
  albumStore.updateShowAddDialog(true)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  getAlbumList()
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
  getAlbumList()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getAlbumList()
}

// 监听添加相册对话框状态 当关闭时重新获取相册列表
watch(
  () => albumStore.isShowAddDialog,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      // 从 true 变为 false
      getAlbumList() // 重新获取相册列表
    }
  }
)

const showStats = async () => {
  statsDialogVisible.value = true
  await nextTick()
  statsDialogRef.value?.getStats()
}

onMounted(async () => {
  getAlbumList()

  imgList.value = import.meta.env.VITE_CAROUSEL_IMAGES?.split(',') || []

  if (imgList.value.length > 0) {
    // 轮播图需要向后端请求带签名的访问链接，否则无法正常显示
    for (let i = 0; i < imgList.value.length; i++) {
      const res = await Service.postCosPresignedUrl({
        key: imgList.value[i],
        type: dto_GetPresignedURLReq.type.DOWNLOAD
      })

      if (res.code === 0) {
        imgList.value[i] = res.data.url
      }
    }
  }
})
</script>

<template>
  <div id="photo-manager">
    <el-carousel :interval="4000" type="card" height="400px">
      <el-carousel-item v-for="item in imgList" :key="item">
        <img :src="item" class="carousel-img" />
      </el-carousel-item>
    </el-carousel>
    <div class="photo-manager">
      <el-card class="photo-manager-content">
        <div class="photo-manager-content-search">
          <div class="photo-manager-content-search-left">
            <el-input
              v-model="searchKeyword"
              style="width: 240px; border-radius: 10px"
              placeholder="搜索相册..."
              :suffix-icon="Search"
              @keyup.enter="handleSearch"
            />
            <div class="create-btn" @click="handleCreate">
              <SvgIcon icon="create" size="40px" />
            </div>
            <div class="stats-btn" @click="showStats">
              <SvgIcon icon="stats" size="35px" />
            </div>
          </div>
          <div class="photo-manager-content-search-right">
            <!--            <el-switch-->
            <!--              v-model="value1"-->
            <!--              class="mb-2"-->
            <!--              active-text="相册视图"-->
            <!--              inactive-text="相片视图"-->
            <!--            />-->
          </div>
        </div>
        <div class="photo-manager-content-list">
          <PhotoAlbumItem
            v-for="album in albumList"
            :key="album.id"
            :album="album"
            @click="handleOpenAlbum(album)"
            @update="getAlbumList"
          />
        </div>
        <div class="photo-manager-content-page">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
    <PhotoStatsDialog v-model="statsDialogVisible" ref="statsDialogRef" />
  </div>
</template>

<style scoped lang="scss">
.carousel-img {
  width: 100%; /* 使图片宽度为100% */
  height: 100%; /* 使图片高度为100% */
  object-fit: cover; /* 保持比例填充容器 */
}

#photo-manager {
  .photo-manager {
    display: flex;
    justify-content: center;

    &-content {
      margin-top: 10px;
      background-color: #fefcfc;
      max-width: 1280px;
      width: 100%;
      height: auto;
      border-radius: 20px;

      &-search {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f0f2f5;
        border-radius: 10px;

        &-left {
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 10px;

          .create-btn {
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: rotate(90deg) scale(1.1);
              filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.5));
            }

            &:active {
              transform: scale(0.95);
            }
          }

          .stats-btn {
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: rotate(360deg) scale(1.1);
              filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.5));
            }

            &:active {
              transform: scale(0.95);
            }
          }
        }
      }

      &-list {
        width: 92%;
        margin: 0 auto;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 30px;
        display: flex;
        justify-content: left;
        align-items: center;
        flex-wrap: wrap;
        column-gap: 20px;
        row-gap: 25px;
      }

      &-page {
        display: flex;
        align-items: center;
        justify-content: right;
        margin: 20px 20px 0 0;
      }
    }
  }
}
</style>

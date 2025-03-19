<template>
  <div id="basicLayout" class="common-layout">
    <el-container class="layout-container">
      <el-header :class="{ header: true, hide: shouldHide }">
        <GlobalHeader />
      </el-header>
      <el-main class="content">
        <!--        Main-->
        <router-view></router-view>
        <!--                <PhotoManager />-->
      </el-main>
      <StatementFooter />
    </el-container>

    <LoginOrRegister v-if="!isLogin" />
    <PhotoAlbumAdd v-if="isShowAddAlbumDialog" />
    <PhotoAlbumDetail v-if="isShowAlbumDetailDialog" />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
import LoginOrRegister from '@/components/loginOrRegister/LoginOrRegister.vue'
import { useUserStore } from '@/stores/user'
import PhotoAlbumAdd from '@/components/photoAlbum/PhotoAlbumAdd.vue'
import { useAlbumStore } from '@/stores/album'
import PhotoAlbumDetail from '@/components/photoAlbum/PhotoAlbumDetail.vue'
import StatementFooter from '@/components/StatementFooter.vue'

const userStore = useUserStore()
const albumStore = useAlbumStore()

// 是否已登录
let isLogin = computed(() => {
  return userStore.isSign
})
// 是否显示添加相册弹窗
let isShowAddAlbumDialog = computed(() => {
  return albumStore.isShowAddDialog
})
// 是否打开相册详情弹窗
let isShowAlbumDetailDialog = computed(() => {
  return albumStore.isShowAlbumDetail
})

const handleScroll = () => {
  if (window.pageYOffset > 300) {
    shouldHide.value = true
  } else {
    shouldHide.value = false
  }
}

// 注册滚动事件监听器
window.addEventListener('scroll', handleScroll)

// 在组件卸载前移除滚动事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const shouldHide = ref<boolean>(false)
</script>

<style scoped>
#basicLayout .header {
  background: #ffffff;
  box-shadow: #eee 1px 1px 5px;
  position: sticky;
  top: 0px;
  transition: top 0.3s;
  left: 0;
  right: 0;
  z-index: 5000;
}

.hide {
  top: -70px !important;
}

#basicLayout .content {
  background-color: #f1f2f5;
  background-size: cover;
  background-attachment: fixed;
  min-height: calc(100vh - 120px);
  padding: 20px;
  box-sizing: border-box;
}

.layout-container {
  min-height: 100vh;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>

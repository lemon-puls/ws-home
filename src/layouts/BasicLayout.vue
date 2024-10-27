<template>
  <div id="basicLayout" class="common-layout">
    <el-container style="height: 100vh">
      <el-header :class="{ header: true, hide: shouldHide }">
        <GlobalHeader />
      </el-header>
      <el-main class="content">
        <!--        Main-->
        <router-view></router-view>
        <!--                <PhotoManager />-->
      </el-main>
    </el-container>

    <LoginOrRegister v-if="!isLogin" />
    <PhotoAlbumAdd v-if="isShowAddAlbumDialog" />
    <PhotoAlbumDetail />
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
  /*margin-bottom: 16px;*/
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
  //background: linear-gradient(to right, #eee, #fff);
  //background: url('../assets/背景1.png') 0% 0% / 100% 100%;
  background-color: #f1f2f5;
  background-size: cover;
  background-attachment: fixed;
  /*filter: blur(10px);*/
  /*margin-bottom: 16px;*/
  /*padding: 20px;*/
  /*自己加的*/
  //display: flex;
  //flex-direction: column;
  /*justify-content: center;*/
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

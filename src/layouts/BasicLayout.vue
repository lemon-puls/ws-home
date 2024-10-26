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
    <!--    <PhotoAlbumDetail />-->
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import SvgIcon from '@/icons/SvgIcon'
import PhotoManager from '@/views/PhotoManagerView.vue'
import PhotoAlbumDetail from '@/components/photoAlbum/PhotoAlbumDetail.vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
import LoginOrRegister from '@/components/loginOrRegister/LoginOrRegister.vue'
import { useUserStore } from '@/stores/user'
import ACCESS_ENUM from '@/access/accessEnum'

const userStore = useUserStore()

let isLogin = computed(() => {
  return userStore.isSign
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

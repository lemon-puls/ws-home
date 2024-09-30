<template>
  <div id="basicLayout" class="common-layout">
    <el-container style="height: 100vh">
      <el-header :class="{ header: true, hide: shouldHide }">
        <el-row style="height: 100%" :gutter="20">
          <el-col :span="4">
            <div style="display: flex; align-items: center; column-gap: 10px">
              <SvgIcon icon="xdl" size="45px" />
              <img src="../assets/img.png" height="35px" />
            </div>
          </el-col>
          <el-col :span="16">
            <!--            <div style="background-color: yellow" class="grid-content ep-bg-purple" />-->
            <el-menu
              :default-active="activeIndex"
              class="el-menu-demo"
              mode="horizontal"
              @select="handleSelect"
            >
              <el-menu-item index="1">相册</el-menu-item>
              <el-menu-item index="2">理财</el-menu-item>
<!--              <el-sub-menu index="2">-->
<!--                <template #title>Workspace</template>-->
<!--                <el-menu-item index="2-1">item one</el-menu-item>-->
<!--                <el-menu-item index="2-2">item two</el-menu-item>-->
<!--                <el-menu-item index="2-3">item three</el-menu-item>-->
<!--                <el-sub-menu index="2-4">-->
<!--                  <template #title>item four</template>-->
<!--                  <el-menu-item index="2-4-1">item one</el-menu-item>-->
<!--                  <el-menu-item index="2-4-2">item two</el-menu-item>-->
<!--                  <el-menu-item index="2-4-3">item three</el-menu-item>-->
<!--                </el-sub-menu>-->
<!--              </el-sub-menu>-->
<!--              <el-menu-item index="3" disabled>Info</el-menu-item>-->
<!--              <el-menu-item index="4">Orders</el-menu-item>-->
            </el-menu>
          </el-col>
          <el-col :span="4">
            <div class="block" style="display: flex; align-items: center; justify-content: flex-end; column-gap: 10px">
              <el-avatar :size="50" :src="circleUrl" />
              <el-text class="w-150px mb-2" truncated>
                小霜
              </el-text>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main class="content">
<!--        Main-->
        <!--        <router-view></router-view>-->
        <PhotoManager />
      </el-main>
    </el-container>

<!--    <PhotoAlbumDetail />-->
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import SvgIcon from '@/icons/SvgIcon'
import PhotoManager from '@/views/photoManager/index.vue'
import PhotoAlbumDetail from '@/components/photoAlbum/PhotoAlbumDetail.vue'

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

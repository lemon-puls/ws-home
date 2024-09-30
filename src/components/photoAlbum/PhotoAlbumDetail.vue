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
      <div style="flex: 1; height: 100%" class=""></div>
      <el-divider direction="vertical" style="height: 100%" />
      <div style="flex: 3; height: 100%; display: flex; align-items: center; padding: 20px; box-sizing: border-box" class="">
        <PhotoItem />
      </div>
    </div>
  </transition>
</template>

<style scoped>
/*聊天框*/
#photoAlbumDetailId {
  --width: 80vw;
  --hight: 40vw;
  width: var(--width);
  height: var(--hight);
  background-color: white;
  position: fixed;
  left: calc(50% - var(--width) / 2);
  top: calc(50% - var(--hight) / 2);
  /*transform: translateX(-50%);*/
  /*transform: translateX(-50%);*/
  z-index: 10001;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
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
import { ref } from 'vue'
import PhotoItem from '@/components/photoAlbum/PhotoItem.vue'
// 聊天框显隐
// const handleClickOutside = () => {
//   useChatStore().showModal = false;
// };
</script>

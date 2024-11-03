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
        <PhotoAlbumInfo />
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
          /*padding: 20px;*/
          box-sizing: border-box;
          position: relative;
        "
        class=""
      >
        <div class="top-bar">
          <div>
            <el-switch
              v-if="isEditing"
              v-model="isCompress"
              class="mt-2"
              style="margin-left: 24px"
              inactive-text="开启压缩"
            />
          </div>
          <div>
            <el-button v-if="isEditing" @click="deleteImgs" type="danger" round
              >删除选定图片</el-button
            >
            <el-button @click="photoItemRef.toggleEdit()" type="success" round
              >{{ isEditing ? '完成' : '编辑' }}
            </el-button>
          </div>
        </div>
        <PhotoItem v-model="isEditing" :is-compress="isCompress" ref="photoItemRef" />
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
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

  .top-bar {
    width: 100%;
    height: 45px;
    background-color: white;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10002;
    border-top-right-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 水平偏移量，垂直偏移量，模糊半径，颜色 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 20px;
    box-sizing: border-box;
  }

  .el-divider--vertical {
    margin: 0;
    width: 0;
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
import { computed, ref } from 'vue'
import PhotoItem from '@/components/photoAlbum/PhotoItem.vue'
import PhotoAlbumInfo from '@/components/photoAlbum/detail/PhotoAlbumInfo.vue'
import { useAlbumStore } from '@/stores/album'

const albumStore = useAlbumStore()

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
  alert(photoItemRef.value.isEditing)
}
</script>

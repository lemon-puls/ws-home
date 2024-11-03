import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlbumStore = defineStore('album', () => {
  const isShowAddDialog = ref(false)

  const isShowAlbumDetail = ref(false)

  const currentAlbumId = ref(0)

  const updateShowAddDialog = (isShow: boolean) => {
    isShowAddDialog.value = isShow
  }

  const showAlbumDetail = (albumId: number) => {
    currentAlbumId.value = albumId
    if (albumId) {
      isShowAlbumDetail.value = true
    } else {
      isShowAlbumDetail.value = false
    }
  }
  return {
    isShowAddDialog,
    updateShowAddDialog,
    showAlbumDetail,
    isShowAlbumDetail,
    currentAlbumId
  }
})

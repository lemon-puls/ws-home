import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlbumStore = defineStore('album', () => {
  const isShowAddDialog = ref(false)
  const isShowAlbumDetail = ref(false)
  const currentAlbumId = ref(0)
  const editAlbumData = ref(null)

  const updateShowAddDialog = (show: boolean) => {
    isShowAddDialog.value = show
    if (!show) {
      // 关闭弹窗时清空编辑数据
      editAlbumData.value = null
    }
  }

  const updateEditAlbumData = (data: any) => {
    editAlbumData.value = data
  }

  const showAlbumDetail = (albumId: number) => {
    currentAlbumId.value = albumId
    isShowAlbumDetail.value = !!albumId
  }

  return {
    isShowAddDialog,
    isShowAlbumDetail,
    currentAlbumId,
    editAlbumData,
    updateShowAddDialog,
    showAlbumDetail,
    updateEditAlbumData
  }
})

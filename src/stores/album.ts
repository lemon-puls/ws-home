import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlbumStore = defineStore("album", () => {

  const isShowAddDialog = ref(false);

  
  const updateShowAddDialog = (isShow: boolean) => {
    isShowAddDialog.value = isShow;
  };

  return { isShowAddDialog, updateShowAddDialog };
});

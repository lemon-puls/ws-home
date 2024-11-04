<script setup lang="ts">
import SvgIcon from '@/icons/SvgIcon'
import { computed, ref } from 'vue'
import { routes } from '@/router'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserInfoEdit from '@/components/user/UserInfoEdit.vue'

const router = useRouter()

const userStore = useUserStore()
let loginUser = computed(() => userStore.loginUser)

const visibleRoutes = computed(() => {
  return routes.filter((item, index) => {
    if (item.meta?.hideInMenu) {
      return false
    }
    return true
  })
})

const handleSelect = (key: string) => {
  router.push({ path: key })
}

const showUserEdit = ref(false)
</script>

<template>
  <div class="global-header">
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
          :default-active="routes[0].path"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
        >
          <el-menu-item v-for="item in visibleRoutes" :key="item.path" :index="item.path">
            {{ item.name }}
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="4">
        <div
          class="block"
          style="display: flex; align-items: center; justify-content: flex-end; column-gap: 10px"
        >
          <el-avatar
            :size="40"
            :src="loginUser.userAvatar"
            @click="showUserEdit = true"
            style="cursor: pointer"
          />
          <el-text class="w-150px mb-2" truncated>{{ loginUser.userName }} </el-text>
        </div>
      </el-col>
    </el-row>
  </div>
  <UserInfoEdit v-model:show="showUserEdit" />
</template>

<style scoped></style>

<script setup lang="ts">
import SvgIcon from '@/icons/SvgIcon'
import { computed, ref } from 'vue'
import { routes } from '@/router'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserInfoEdit from '@/components/user/UserInfoEdit.vue'
import { SwitchButton } from '@element-plus/icons-vue'

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

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    window.location.reload()
  }
}
</script>

<template>
  <div class="global-header">
    <el-row style="height: 100%" :gutter="20">
      <el-col :span="4">
        <div class="logo-container">
          <SvgIcon icon="xdl" size="45px" />
          <img src="../assets/img.png" height="35px" />
        </div>
      </el-col>
      <el-col :span="16">
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
        <div class="user-info">
          <el-dropdown trigger="contextmenu" @command="handleCommand">
            <div class="avatar-wrapper">
              <el-avatar
                :size="40"
                :src="loginUser.avatar"
                @click="showUserEdit = true"
                style="cursor: pointer"
              />
              <el-text class="w-150px mb-2" truncated>{{ loginUser.userName }}</el-text>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-col>
    </el-row>
  </div>
  <UserInfoEdit v-model:show="showUserEdit" />
</template>

<style scoped lang="scss">
.global-header {
  height: 60px;

  .logo-container {
    display: flex;
    align-items: center;
    column-gap: 10px;
    height: 100%;
  }

  .user-info {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 10px;
    height: 100%;
    padding-right: 20px;

    .avatar-wrapper {
      display: flex;
      align-items: center;
      column-gap: 10px;
    }
  }

  // 设置了也不生效，不设置也没影响
  // :deep(.el-menu) 和 :deep(.el-menu-item) 是Vue 3中的深度选择器语法，用于修改组件内部的Element Plus组件样式。
  // :deep(.el-menu) {
  //   height: 100%;
  //   border-bottom: none;
  // }

  // :deep(.el-menu-item) {
  //   display: flex;
  //   align-items: center;
  // }

  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>

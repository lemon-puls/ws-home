import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import ACCESS_ENUM from '@/access/accessEnum'
import { Service } from '../../generated'

export const useUserStore = defineStore(
  'user',
  () => {
    const unLoginUser = {
      userRole: ACCESS_ENUM.NOT_LOGIN,
      accessToken: '',
      refreshToken: '',
      userId: -1,
      userName: '未登录',
      avatar:
        'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp',
      phone: '',
      email: '',
      gender: 0,
      age: 18,
    }
    // 注意这里不要直接 ref(unLoginUser)，因为这样会导致 loginUser 和 unLoginUser 共享同一个引用。
    // 当我们修改 loginUser 的值时，unLoginUser 的值也会被修改。
    // 使用展开运算符 {...unLoginUser} 创建一个新对象，这样可以避免引用共享的问题。
    const loginUser = ref({
      ...unLoginUser
    })
    const isSign = computed({
      get: () => {
        return loginUser.value.userRole !== ACCESS_ENUM.NOT_LOGIN && loginUser.value.userId > 0
      },
      set: (val) => {
        if (!val) {
          Object.assign(loginUser.value, unLoginUser)
        }
      }
    })

    const getLoginUser = async () => {
      // 请求后端 获取登录信息
      const res = await Service.getUserCurrent()
      if (res.code === 0) {
        const data = res.data
        updateUser({
          userRole: ACCESS_ENUM.USER,
          ...data
        })
      } else {
        updateUser({ ...loginUser.value, userRole: ACCESS_ENUM.NOT_LOGIN })
      }
    }

    const updateUser = (payload: any) => {
      Object.assign(loginUser.value, payload)
    }

    // 退出登陆
    const logout = () => {
      // 这种整体赋值的方式会破坏响应式引用，因为它创建了一个新的引用，而持久化的数据可能无法正确追踪这个新的引用
      // updateUser(unLoginUser)
      // loginUser.value = unLoginUser

      // 这种方式是直接修改现有响应式对象的属性，保持了原有的响应式引用，因此能够正确触发更新并被持久化存储系统追踪。
      // loginUser.value.userRole = ACCESS_ENUM.NOT_LOGIN

      // 这样可以保持原有的响应式引用，同时更新所有属性。
      Object.assign(loginUser.value, unLoginUser)

      localStorage.removeItem('ACCESS_TOKEN')
      localStorage.removeItem('REFRESH_TOKEN')
    }

    return { loginUser, getLoginUser, updateUser, isSign, logout }
  },
  {
    persist: true
  }
)

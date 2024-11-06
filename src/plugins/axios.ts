import axios from 'axios'
import { BACKEND_RESPONSE_CODE } from '@/enume'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 创建一个获取 store 的函数
let storeGetter: () => ReturnType<typeof useUserStore>
// 由 main.ts 执行完 app.use(pinia) 后调用设置值
// 设置获取 store 的函数
export const setStoreGetter = (getter: () => ReturnType<typeof useUserStore>) => {
  storeGetter = getter
}

axios.defaults.withCredentials = true

// 请求拦截器
axios.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('ACCESS_TOKEN')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    const data = response.data

    // 如果返回未登录状态码
    if (data.code === BACKEND_RESPONSE_CODE.NotLogin) {
      // 使用 getter 函数获取 store
      const userStore = storeGetter?.()
      if (userStore) {
        userStore.logout()
      }
      // 明确返回 rejected promise
      return Promise.reject({
        code: BACKEND_RESPONSE_CODE.NotLogin,
        message: '请先登录'
      })
    }
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

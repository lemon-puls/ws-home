import axios from 'axios'
import { BACKEND_RESPONSE_CODE } from '@/enume'
import { useUserStore } from '@/stores/user'
import { Service } from '../../generated'

// 创建一个获取 store 的函数
let storeGetter: () => ReturnType<typeof useUserStore>
// 由 main.ts 执行完 app.use(pinia) 后调用设置值
// 设置获取 store 的函数
export const setStoreGetter = (getter: () => ReturnType<typeof useUserStore>) => {
  storeGetter = getter
}

axios.defaults.withCredentials = true

// 标记是否正在刷新token
let isRefreshing = false
// 存储等待刷新token的请求
let requests: Array<(token: string) => void> = []

// 请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 如果是刷新token的请求，请求头已经设置了 Authorization （REFRESH_TOKEN）,
    // 这里不需要再设置 Authorization
    if (!config.url?.includes('/user/refresh')) {
      const token = localStorage.getItem('ACCESS_TOKEN')
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token
      }
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
      const userStore = storeGetter?.()
      const refreshToken = localStorage.getItem('REFRESH_TOKEN')

      // 如果有刷新令牌，尝试刷新
      if (refreshToken && !isRefreshing) {
        isRefreshing = true

        return Service.postUserRefresh(refreshToken)
          .then((res) => {
            if (res.code === 0) {
              // 更新token
              const { accessToken, refreshToken } = res.data
              localStorage.setItem('ACCESS_TOKEN', accessToken)
              localStorage.setItem('REFRESH_TOKEN', refreshToken)

              // 重新发送之前失败的请求
              requests.forEach((cb) => cb(accessToken))
              requests = []

              // 重试当前请求
              // 注意：这里无需再设置 Authorization 头，因为会在请求拦截器中进行设置
              return axios(response.config)
            } else {
              // 刷新失败，清除用户信息
              if (userStore) {
                userStore.logout()
              }
              return Promise.reject({
                code: BACKEND_RESPONSE_CODE.NotLogin,
                message: '请重新登录'
              })
            }
          })
          .catch((error) => {
            if (userStore) {
              userStore.logout()
            }
            return Promise.reject(error)
          })
          .finally(() => {
            isRefreshing = false
          })
      } else if (isRefreshing) {
        // 正在刷新token，将请求暂存
        // Promise 的解析是可以链式传递的。当在一个 Promise 的 resolve 中传入另一个 Promise 时，
        // 外层 Promise 会等待内层 Promise 解析完成，并直接传递内层 Promise 的解析值
        return new Promise((resolve) => {
          requests.push((token) => {
            resolve(axios(response.config))
          })
        })
      } else {
        // 没有刷新令牌，执行登出
        if (userStore) {
          userStore.logout()
        }
        return Promise.reject({
          code: BACKEND_RESPONSE_CODE.NotLogin,
          message: '请先登录'
        })
      }
    }
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

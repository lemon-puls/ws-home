import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import PhotoManagerView from '@/views/PhotoManagerView.vue'

interface RouteMetaType {
  hideInMenu?: boolean
}

interface RouteType {
  path: string
  name: string
  component: any
  meta?: RouteMetaType
  redirect?:
    | string
    | {
        name?: string
        path?: string
      }
  children?: RouteType[]
}

const routes: RouteType[] = [
  {
    path: '/',
    name: '相册',
    component: PhotoManagerView,
    meta: {
      hideInMenu: false
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes as any
})

// export routes 和类型
export { routes }
export type { RouteType }

export default router

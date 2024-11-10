import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import PhotoManagerView from '@/views/PhotoManagerView.vue'

const routes =  [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: HomeView
  // },
  {
    path: '/',
    name: '相册',
    component: PhotoManagerView
  }
]



const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes
})

// export routes
export { routes}

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },

    {
      path: '/periodEdit/:id',
      name: 'period-edit',
      component: () => import('../views/Period/EditView.vue'),
    },
    {
      path: '/periods/:id', // :id 就是動態參數，會去比對網址上的數字
      name: 'period',
      component: () => import('../views/Period/HomeView.vue'),
      children: [
        {
          path: 'items',
          name: 'period-items',
          component: () => import('../views/Period/ItemsView.vue'),
          alias: '/periods/:id',
        },
        {
          path: 'locations',
          name: 'period-locations',
          component: () => import('../views/Period/LocationsView.vue'),
        },
      ],
    },
    {
      path: '/periods/:periodId/items/:itemId/count',
      name: 'period-items-count',
      component: () => import('../views/Period/CountView.vue'),
      meta: { scrollToTop: true }, // 只有這個頁面強制置頂
    },
    {
      path: '/periods/:periodId/items/:itemId/distribute',
      name: 'period-items-distribute',
      component: () => import('../views/Period/ItemsDistributeView.vue'),
      meta: { scrollToTop: true }, // 只有這個頁面強制置頂
    },
    {
      path: '/periods/:periodId/locations/:locationId/distribute',
      name: 'period-locations-distribute',
      component: () => import('../views/Period/LocationsDistributeView.vue'),
      meta: { scrollToTop: true }, // 只有這個頁面強制置頂
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // 若目標路由設定了 scrollToTop，強制滾回頂端
    if (to.meta.scrollToTop) {
      return { top: 0, left: 0, behavior: 'instant' }
    }

    // 如果使用者按上一頁/下一頁，還原上一頁的滾動位置（若無則不變動）
    if (savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(savedPosition)
        }, 300)
      })
    }

    // 其他頁面不強制作任何滾動
    return false
  },
})

export default router

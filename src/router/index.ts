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
    },
    {
      path: '/periods/:periodId/items/:itemId/distribute',
      name: 'period-items-distribute',
      component: () => import('../views/Period/ItemsDistributeView.vue'),
    },
    {
      path: '/periods/:periodId/locations/:locationId/distribute',
      name: 'period-locations-distribute',
      component: () => import('../views/Period/LocationsDistributeView.vue'),
    },
  ],
})

export default router

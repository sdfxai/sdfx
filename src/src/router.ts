import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Layout from '@/layout/Layout.vue'
import LayoutGraph from '@/layout/LayoutGraph.vue'
import LayoutEditor from '@/layout/LayoutEditor.vue'

const router = createRouter({
//  history: import.meta.env.PROD ? createWebHashHistory() : createWebHistory(),
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      meta: { needAuth: false },
      children: [
        {
          path: '/',
          name: 'appview',
          meta: { leftpane:'app', rightpane:'app' },
          component: Home
        },

        {
          path: '/graph',
          name: 'graphview',
          meta: { leftpane:'graph', rightpane:'graph' },
          component: Home
        }
      ]
    },

    {
      path: '/gallery',
      component: LayoutGraph,
      meta: { needAuth: false, leftpane:false, rightpane:false },
      children: [
        {
          path: '/gallery',
          component: () => import('@/views/ImageGallery/Index.vue')
        }
      ]
    },

    {
      path: '/editor',
      component: LayoutEditor,
      meta: { needAuth: false, leftpane:false, rightpane:false },
      children: [
        {
          path: '/editor',
          component: () => import('@/views/ImageEditor/Index.vue')
        },
      ]
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router

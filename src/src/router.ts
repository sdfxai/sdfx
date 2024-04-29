import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

import Layout from '@/layout/Layout.vue'
import LayoutEmbed from '@/layout/LayoutEmbed.vue'
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
          path: '',
          name: 'appview',
          meta: { leftpane:'app', rightpane:'app' },
          component: () => import('@/views/Home.vue')
        },

        {
          path: 'graph',
          name: 'graphview',
          meta: { leftpane:'graph', rightpane:'graph' },
          component: () => import('@/views/Home.vue')
        }
      ]
    },

    {
      path: '/embed',
      component: LayoutEmbed,
      meta: { needAuth: false },
      children: [
        {
          path: '',
          name: 'embedview',
          meta: { leftpane:'app', rightpane:'app' },
          component: () => import('@/views/Embed.vue')
        }
      ]
    },

    {
      path: '/gallery',
      component: LayoutGraph,
      meta: { needAuth: false, leftpane:false, rightpane:false },
      children: [
        {
          path: '',
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
          path: '',
          component: () => import('@/views/ImageEditor/Index.vue')
        }
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

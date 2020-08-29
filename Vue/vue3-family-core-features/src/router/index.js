import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/ReactivityApis'
  },
  {
    path: '/ReactivityApis',
    component: () => import('../views/ReactivityApis.vue')
  },
  {
    path: '/LifecycleHooks',
    component: () => import('../views/LifecycleHooks.vue')
  },
  {
    path: '/DependencyInjection',
    component: () => import('../views/DependencyInjection.vue')
  },
  {
    path: '/TemplateRefs',
    component: () => import('../views/TemplateRefs.vue')
  },
  {
    path: '/ReactivityUtilities',
    component: () => import('../views/ReactivityUtilities.vue')
  },
  {
    path: '/AdvancedReactivityAPIs',
    component: () => import('../views/AdvancedReactivityAPIs.vue')
  },
  {
    path: '/RouterNext',
    component: () => import('../views/RouterNext.vue')
  },
  {
    path: '/VuexNext',
    component: () => import('../views/VuexNext.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

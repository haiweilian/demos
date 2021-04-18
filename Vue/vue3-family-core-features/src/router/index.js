import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/ReactivityTodo'
  },
  {
    path: '/ReactivityTodo',
    component: () => import('../views/ReactivityTodo.vue')
  },
  {
    path: '/ReactivityApi',
    component: () => import('../views/ReactivityApi.vue')
  },
  {
    path: '/LifecycleHooks',
    component: () => import('../views/LifecycleHooks.vue')
  },
  {
    path: '/ProvideInject',
    component: () => import('../views/ProvideInject.vue')
  },
  {
    path: '/Teleport',
    component: () => import('../views/Teleport.vue')
  },
  {
    path: '/Suspense',
    component: () => import('../views/Suspense.vue')
  },
  {
    path: '/MultipleModel',
    component: () => import('../views/MultipleModel.vue')
  },
  {
    path: '/ScriptSetup',
    component: () => import('../views/ScriptSetup.vue')
  },
  {
    path: '/RouterNext',
    component: () => import('../views/RouterNext.vue'),
    children: [
      {
        path: 'Slot',
        component: () => import('../views/RouterNext/Slot.vue')
      }
    ]
  },
  {
    path: '/VuexNext',
    name: '/VuexNext',
    component: () => import('../views/VuexNext.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

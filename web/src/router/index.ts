import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import GameView from '../modules/pinyin/GameView.vue'
import StatsView from '../modules/pinyin/StatsView.vue'
import WrongItemsView from '../modules/pinyin/WrongItemsView.vue'
import MathHomeView from '../modules/math/MathHomeView.vue'
import MathGameView from '../modules/math/MathGameView.vue'
import MathPracticeView from '../modules/math/MathPracticeView.vue'
import MathWrongQuestionsView from '../modules/math/MathWrongQuestionsView.vue'
import MathAnalysisView from '../modules/math/MathAnalysisView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import { useAuthStore } from '../store/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_SOME_KEY_BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      component: LoginView,
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      component: RegisterView,
      meta: { guestOnly: true }
    },
    {
      path: '/pinyin',
      component: () => import('../views/pinyin/PinYinView.vue'),
      meta: { requiresAuth: false }
    },
    { path: '/game', component: GameView, meta: { requiresAuth: false } },
    { path: '/stats', component: StatsView, meta: { requiresAuth: false } },
    {
      path: '/wrong',
      component: WrongItemsView,
      meta: { requiresAuth: false }
    },
    { path: '/math', component: MathHomeView, meta: { requiresAuth: false } },
    {
      path: '/math/game',
      component: MathGameView,
      meta: { requiresAuth: false }
    },
    {
      path: '/math/practice',
      component: MathPracticeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/math/wrong-questions',
      component: MathWrongQuestionsView,
      meta: { requiresAuth: false }
    },
    {
      path: '/math/analysis',
      component: MathAnalysisView,
      meta: { requiresAuth: false }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 如果页面明确需要认证且用户未登录（目前全部改为可选，除了可能的个人中心）
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // 如果是访客页面（登录/注册）且用户已登录
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

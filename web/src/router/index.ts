import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/home/HomeView.vue';
import GameView from '../modules/pinyin/GameView.vue';
import StatsView from '../modules/pinyin/StatsView.vue';
import WrongItemsView from '../modules/pinyin/WrongItemsView.vue';
import MathHomeView from '../modules/math/MathHomeView.vue';
import MathGameView from '../modules/math/MathGameView.vue';
import MathPracticeView from '../modules/math/MathPracticeView.vue';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import { useAuthStore } from '../store/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      component: HomeView,
      meta: { requiresAuth: true }
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
      meta: { requiresAuth: true }
    },
    { path: '/game', component: GameView, meta: { requiresAuth: true } },
    { path: '/stats', component: StatsView, meta: { requiresAuth: true } },
    { path: '/wrong', component: WrongItemsView, meta: { requiresAuth: true } },
    { path: '/math', component: MathHomeView, meta: { requiresAuth: true } },
    { path: '/math/game', component: MathGameView, meta: { requiresAuth: true } },
    { path: '/math/practice', component: MathPracticeView, meta: { requiresAuth: true } },
  ],
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // 如果页面需要认证且用户未登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } 
  // 如果是访客页面（登录/注册）且用户已登录
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/');
  } 
  else {
    next();
  }
});

export default router;

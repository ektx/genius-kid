import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@src/views/home/HomeView.vue';
import GameView from '../modules/pinyin/GameView.vue';
import StatsView from '../modules/pinyin/StatsView.vue';
import WrongItemsView from '../modules/pinyin/WrongItemsView.vue';
import MathHomeView from '../modules/math/MathHomeView.vue';
import MathGameView from '../modules/math/MathGameView.vue';
import MathPracticeView from '../modules/math/MathPracticeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/pinyin', component: () => import('@src/views/pinyin/PinYinView.vue') },
    { path: '/game', component: GameView },
    { path: '/stats', component: StatsView },
    { path: '/wrong', component: WrongItemsView },
    { path: '/math', component: MathHomeView },
    { path: '/math/game', component: MathGameView },
    { path: '/math/practice', component: MathPracticeView },
  ],
});

export default router;

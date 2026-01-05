<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGameStore, GameMode, PinyinCategory } from '../store/gameStore';
import { ref } from 'vue';

const router = useRouter();
const gameStore = useGameStore();

// 响应式状态：选中的模式、时长、拼音类别
const selectedMode = ref<GameMode>('hanzi-to-pinyin');
const selectedTime = ref(60);
const selectedCategory = ref<PinyinCategory>('all');

/**
 * 开始游戏：初始化 Store 状态并跳转到游戏界面
 */
const startGame = () => {
  gameStore.initGame(selectedMode.value, selectedTime.value, selectedCategory.value);
  router.push('/game');
};
</script>

<template>
  <div class="home-container">
    <h1 class="title">✨ 拼音小达人 ✨</h1>
    
    <div class="card settings-card">
      <div class="setting-group">
        <h3>🎮 选择模式</h3>
        <div class="btn-group">
          <button 
            :class="{ active: selectedMode === 'hanzi-to-pinyin' }" 
            @click="selectedMode = 'hanzi-to-pinyin'"
          >看汉字写拼音</button>
          <button 
            :class="{ active: selectedMode === 'pinyin-to-hanzi' }" 
            @click="selectedMode = 'pinyin-to-hanzi'"
          >看拼音选汉字</button>
          <button 
            :class="{ active: selectedMode === 'pinyin-category' }" 
            @click="selectedMode = 'pinyin-category'"
          >拼音分类练习</button>
        </div>
      </div>

      <div class="setting-group" v-if="selectedMode === 'pinyin-category'">
        <h3>📚 拼音类别</h3>
        <div class="btn-group">
          <button :class="{ active: selectedCategory === 'all' }" @click="selectedCategory = 'all'">全部</button>
          <button :class="{ active: selectedCategory === 'initial' }" @click="selectedCategory = 'initial'">声母</button>
          <button :class="{ active: selectedCategory === 'final' }" @click="selectedCategory = 'final'">韵母</button>
          <button :class="{ active: selectedCategory === 'overall' }" @click="selectedCategory = 'overall'">整体认读</button>
        </div>
      </div>

      <div class="setting-group">
        <h3>⏰ 时间限制</h3>
        <div class="btn-group">
          <button :class="{ active: selectedTime === 30 }" @click="selectedTime = 30">30秒</button>
          <button :class="{ active: selectedTime === 60 }" @click="selectedTime = 60">60秒</button>
          <button :class="{ active: selectedTime === 90 }" @click="selectedTime = 90">90秒</button>
        </div>
      </div>

      <button class="start-btn" @click="startGame">开始挑战 🚀</button>
    </div>

    <div class="footer-btns">
      <button class="math-btn" @click="router.push('/math')">🧮 数学游戏</button>
      <button class="secondary-btn" @click="router.push('/stats')">🏆 排行榜</button>
      <button class="secondary-btn" @click="router.push('/wrong')">📖 错题集</button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background-color: #f0f9ff;
  min-height: 100vh;
}

.title {
  font-size: 3rem;
  color: #0ea5e9;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.settings-card {
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.setting-group {
  margin-bottom: 25px;
}

.setting-group h3 {
  color: #64748b;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.btn-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  color: #475569;
}

button:hover {
  border-color: #38bdf8;
  color: #0ea5e9;
}

button.active {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.4);
}

.start-btn {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
  background: #10b981;
  color: white;
  border: none;
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);
}

.start-btn:hover {
  background: #059669;
  transform: translateY(-2px);
}

.footer-btns {
  display: flex;
  gap: 15px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.secondary-btn, .math-btn {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.math-btn {
  border-color: #f59e0b;
  color: #d97706;
  background-color: #fffbeb;
}

.secondary-btn:hover, .math-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  .title { font-size: 2rem; margin-bottom: 20px; }
  .settings-card { padding: 20px; }
  .btn-group button { padding: 8px 15px; font-size: 0.9rem; }
}
</style>

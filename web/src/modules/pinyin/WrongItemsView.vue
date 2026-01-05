<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGameStore } from '../../store/gameStore';

const router = useRouter();
const gameStore = useGameStore();

/**
 * 清空错题集：需要用户二次确认
 */
const clearWrong = () => {
  if (confirm('确定要清空错题集吗？')) {
    gameStore.wrongItems = [];
    localStorage.removeItem('pinyin-wrong');
  }
};
</script>

<template>
  <div class="wrong-container">
    <div class="header">
      <button class="back-btn" @click="router.push('/')">⬅ 返回主页</button>
      <h1>📖 错题集锦</h1>
      <button class="clear-btn" @click="clearWrong" v-if="gameStore.wrongItems.length > 0">清空</button>
    </div>

    <div class="wrong-grid">
      <div v-for="(item, index) in gameStore.wrongItems" :key="index" class="wrong-card" @click="gameStore.speak(item.hanzi || item.value)">
        <div class="item-main">{{ item.hanzi || item.value }}</div>
        <div class="item-pinyin">{{ item.pinyin || item.value }}</div>
        <div class="speaker">🔊</div>
      </div>
    </div>

    <div v-if="gameStore.wrongItems.length === 0" class="empty-state">
      <div class="empty-icon">🎉</div>
      <p>太棒了，目前还没有错题！</p>
    </div>
  </div>
</template>

<style scoped>
.wrong-container {
  padding: 40px 20px;
  background-color: #fff1f2;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto 40px;
}

.back-btn, .clear-btn {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
}

.clear-btn {
  margin-left: auto;
  color: #ef4444;
  border-color: #fecaca;
}

.wrong-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.wrong-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.wrong-card:hover {
  transform: translateY(-5px);
}

.item-main {
  font-size: 2.5rem;
  margin-bottom: 5px;
  color: #1e293b;
}

.item-pinyin {
  font-size: 1.2rem;
  color: #0ea5e9;
  font-weight: bold;
}

.speaker {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.8rem;
  opacity: 0.5;
}

.empty-state {
  text-align: center;
  margin-top: 100px;
}

.empty-icon { font-size: 5rem; margin-bottom: 20px; }
.empty-state p { color: #64748b; font-size: 1.2rem; }
</style>

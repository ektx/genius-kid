<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMathStore } from '../../store/mathStore'
import { mathLevels } from '../../data/mathData'

const router = useRouter()
const mathStore = useMathStore()

onMounted(() => {
  mathStore.syncProgress()
})

const selectLevel = (levelId: number) => {
  if (mathStore.levelProgress[levelId]?.unlocked) {
    mathStore.startLevel(levelId)
    router.push('/math/game')
  }
}
</script>

<template>
  <div class="math-home">
    <div class="header">
      <button class="back-btn" @click="router.push('/')">🏠</button>
      <h1 class="title">🧮 数学大冒险</h1>
    </div>
    <div class="level-grid">
      <div
        v-for="level in mathLevels"
        :key="level.id"
        class="level-card"
        :class="{
          locked: !mathStore.levelProgress[level.id]?.unlocked,
          completed: mathStore.levelProgress[level.id]?.stars > 0
        }"
        @click="selectLevel(level.id)"
      >
        <div class="level-number">{{ level.id }}</div>
        <div class="stars">
          <span
            v-for="s in 3"
            :key="s"
            class="star"
            :class="{
              active: s <= (mathStore.levelProgress[level.id]?.stars || 0)
            }"
            >⭐</span
          >
        </div>
        <div
          v-if="!mathStore.levelProgress[level.id]?.unlocked"
          class="lock-icon"
        >
          🔒
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.math-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff9c4 0%, #ffecb3 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.title {
  font-size: 3rem;
  color: #f57c00;
  text-shadow: 2px 2px 0px white;
}

.back-btn {
  font-size: 2rem;
  background: white;
  border: 4px solid #f57c00;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: transform 0.2s;
}

.back-btn:hover {
  transform: scale(1.1);
}

.practice-entry {
  background: #db2777;
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 0 #9d174d;
  transition: all 0.2s;
}

.practice-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #9d174d;
}

.practice-entry:active {
  transform: translateY(2px);
  box-shadow: 0 0 0 #9d174d;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 25px;
  max-width: 800px;
  width: 100%;
}

.level-card {
  aspect-ratio: 1;
  background: white;
  border: 6px solid #ffb300;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  box-shadow: 0 8px 0 #f57c00;
}

.level-card:hover:not(.locked) {
  transform: translateY(-5px);
  box-shadow: 0 13px 0 #f57c00;
}

.level-card.locked {
  background: #e0e0e0;
  border-color: #9e9e9e;
  box-shadow: 0 8px 0 #757575;
  cursor: not-allowed;
  opacity: 0.8;
}

.level-card.completed {
  background: #fffde7;
}

.level-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #f57c00;
}

.stars {
  margin-top: 5px;
  font-size: 1rem;
}

.star {
  filter: grayscale(1);
  opacity: 0.3;
}

.star.active {
  filter: grayscale(0);
  opacity: 1;
}

.lock-icon {
  position: absolute;
  font-size: 1.5rem;
  bottom: 10px;
}

@media (max-width: 600px) {
  .title {
    font-size: 2rem;
  }
  .level-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

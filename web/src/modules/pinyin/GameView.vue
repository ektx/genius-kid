<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../../store/gameStore';
import { commonHanzi } from '../../data/hanziData';
import { allPinyinData } from '../../data/pinyinData';

const router = useRouter();
const gameStore = useGameStore();

// 游戏核心状态
const currentQuestion = ref<any>(null); // 当前题目数据
const options = ref<any[]>([]);        // 选项（仅用于选择题模式）
const userInput = ref('');             // 用户输入的拼音
const timer = ref<any>(null);           // 定时器引用
const feedback = ref<{ type: 'correct' | 'wrong', message: string } | null>(null); // 回馈提示

/**
 * 随机生成题目
 */
const generateQuestion = () => {
  feedback.value = null;
  userInput.value = '';
  
  if (gameStore.currentMode === 'hanzi-to-pinyin') {
    // 汉字转拼音模式：随机选一个汉字
    const item = commonHanzi[Math.floor(Math.random() * commonHanzi.length)];
    currentQuestion.value = { ...item, type: 'hanzi' };
  } else if (gameStore.currentMode === 'pinyin-to-hanzi') {
    // 拼音转汉字模式：随机选一个汉字并生成干扰项
    const item = commonHanzi[Math.floor(Math.random() * commonHanzi.length)];
    currentQuestion.value = { ...item, type: 'pinyin' };
    
    // 生成3个随机错误选项
    const otherOptions = commonHanzi
      .filter(h => h.hanzi !== item.hanzi)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    // 合并并打乱选项顺序
    options.value = [...otherOptions, item].sort(() => 0.5 - Math.random());
  } else if (gameStore.currentMode === 'pinyin-category') {
    // 拼音分类模式：根据选定类别随机出题
    const filtered = allPinyinData.filter(p => 
      gameStore.currentCategory === 'all' || p.type === gameStore.currentCategory
    );
    const item = filtered[Math.floor(Math.random() * filtered.length)];
    currentQuestion.value = { ...item, type: 'category' };
  }

  // 自动朗读题目
  nextTick(() => {
    if (currentQuestion.value) {
      const textToSpeak = currentQuestion.value.hanzi || 
                          currentQuestion.value.pinyin || 
                          currentQuestion.value.value;
      gameStore.speak(textToSpeak);
    }
  });
};

/**
 * 处理输入框输入事件（自动触发校验）
 */
const handleInput = () => {
  if (gameStore.currentMode === 'hanzi-to-pinyin') {
    if (userInput.value.toLowerCase() === currentQuestion.value.pinyin) {
      checkAnswer(true);
    }
  } else if (gameStore.currentMode === 'pinyin-category') {
    if (userInput.value.toLowerCase() === currentQuestion.value.value) {
      checkAnswer(true);
    }
  }
};

/**
 * 校验答案并处理反馈
 */
const checkAnswer = (isCorrect: boolean) => {
  if (isCorrect) {
    feedback.value = { type: 'correct', message: '太棒了！✨' };
    gameStore.addScore(true, currentQuestion.value);
    // 朗读正确项
    gameStore.speak(currentQuestion.value.hanzi || currentQuestion.value.value);
    // 1秒后自动下一题
    setTimeout(generateQuestion, 1000);
  } else {
    feedback.value = { 
      type: 'wrong', 
      message: `加油！正确答案是: ${currentQuestion.value.pinyin || currentQuestion.value.hanzi || currentQuestion.value.value}` 
    };
    gameStore.addScore(false, currentQuestion.value);
    // 朗读错误答案
    gameStore.speak(currentQuestion.value.pinyin || currentQuestion.value.hanzi || currentQuestion.value.value);
    // 2秒后自动下一题
    setTimeout(generateQuestion, 2000);
  }
};

/**
 * 启动倒计时
 */
const startTimer = () => {
  timer.value = setInterval(() => {
    if (gameStore.timeLeft > 0) {
      gameStore.timeLeft--;
    } else {
      // 时间到，结束游戏
      clearInterval(timer.value);
      gameStore.endGame();
      router.push('/stats');
    }
  }, 1000);
};

onMounted(() => {
  generateQuestion();
  startTimer();
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

const progressWidth = computed(() => {
  return (gameStore.timeLeft / gameStore.totalTime) * 100 + '%';
});
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <div class="stats-item">
        <span class="label">分数:</span>
        <span class="value score">{{ gameStore.score }}</span>
      </div>
      <div class="timer-container">
        <div class="timer-bar" :style="{ width: progressWidth }"></div>
        <span class="timer-text">{{ gameStore.timeLeft }}s</span>
      </div>
      <div class="stats-item">
        <span class="label">连击:</span>
        <span class="value combo">x{{ gameStore.combo }}</span>
      </div>
    </div>

    <div class="question-card" v-if="currentQuestion">
      <div class="question-content">
        <template v-if="gameStore.currentMode === 'hanzi-to-pinyin'">
          <div class="hanzi-display">{{ currentQuestion.hanzi }}</div>
          <input 
            v-model="userInput" 
            type="text" 
            placeholder="输入拼音..." 
            @input="handleInput"
            autofocus
          />
        </template>

        <template v-else-if="gameStore.currentMode === 'pinyin-to-hanzi'">
          <div class="pinyin-display" @click="gameStore.speak(currentQuestion.pinyin)">
            {{ currentQuestion.pinyin }} 🔊
          </div>
          <div class="options-grid">
            <button 
              v-for="opt in options" 
              :key="opt.hanzi" 
              @click="checkAnswer(opt.hanzi === currentQuestion.hanzi, opt)"
            >
              {{ opt.hanzi }}
            </button>
          </div>
        </template>

        <template v-else-if="gameStore.currentMode === 'pinyin-category'">
          <div class="pinyin-display" @click="gameStore.speak(currentQuestion.value)">
            {{ currentQuestion.value }} 🔊
          </div>
          <input 
            v-model="userInput" 
            type="text" 
            placeholder="重复这个拼音..." 
            @input="handleInput"
            autofocus
          />
        </template>
      </div>

      <div v-if="feedback" :class="['feedback', feedback.type]">
        {{ feedback.message }}
      </div>
    </div>

    <button class="quit-btn" @click="router.push('/')">退出游戏</button>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #fffbeb;
  min-height: 100vh;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 40px;
  padding: 15px 25px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.9rem;
  color: #94a3b8;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
}

.score { color: #f59e0b; }
.combo { color: #ef4444; }

.timer-container {
  flex: 1;
  margin: 0 30px;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: #10b981;
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: #1e293b;
}

.question-card {
  background: white;
  padding: 40px;
  border-radius: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  text-align: center;
  position: relative;
}

.hanzi-display {
  font-size: 6rem;
  margin-bottom: 30px;
  color: #1e293b;
}

.pinyin-display {
  font-size: 4rem;
  margin-bottom: 30px;
  color: #0ea5e9;
  cursor: pointer;
}

input {
  width: 100%;
  padding: 15px;
  font-size: 2rem;
  border: 4px solid #e2e8f0;
  border-radius: 16px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #38bdf8;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.options-grid button {
  padding: 20px;
  font-size: 2.5rem;
  background: #f8fafc;
  border: 3px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.options-grid button:hover {
  background: #f1f5f9;
  border-color: #38bdf8;
  transform: scale(1.05);
}

.feedback {
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 10px;
  border-radius: 12px;
}

.feedback.correct { color: #10b981; background: #ecfdf5; }
.feedback.wrong { color: #ef4444; background: #fef2f2; }

.quit-btn {
  margin-top: 40px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .hanzi-display { font-size: 4rem; }
  .pinyin-display { font-size: 3rem; }
  .options-grid button { font-size: 1.8rem; padding: 15px; }
  .game-header { padding: 10px 15px; }
  .timer-container { margin: 0 15px; }
}
</style>

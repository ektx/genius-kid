<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMathStore } from '../../store/mathStore';

const router = useRouter();
const mathStore = useMathStore();

const currentIndex = ref(0);
const userInput = ref('');
const feedback = ref<'correct' | 'wrong' | null>(null);
const showResult = ref(false);

const handleKeyDown = (e: KeyboardEvent) => {
  if (showResult.value) return;
  
  if (e.key >= '0' && e.key <= '9') {
    handleKeypad(e.key);
  } else if (e.key === 'Backspace') {
    handleKeypad('DEL');
  } else if (e.key === 'Enter') {
    checkAnswer();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const currentQuestion = computed(() => {
  return mathStore.currentLevel.questions[currentIndex.value];
});

const handleKeypad = (num: string) => {
  if (feedback.value) return;
  if (num === 'DEL') {
    userInput.value = userInput.value.slice(0, -1);
  } else if (userInput.value.length < 3) {
    userInput.value += num;
  }
};

const checkAnswer = () => {
  if (userInput.value === '' || feedback.value) return;
  
  const isCorrect = mathStore.submitAnswer(currentQuestion.value, parseInt(userInput.value));
  feedback.value = isCorrect ? 'correct' : 'wrong';

  setTimeout(() => {
    feedback.value = null;
    userInput.value = '';
    
    if (currentIndex.value < mathStore.currentLevel.questions.length - 1) {
      currentIndex.value++;
    } else {
      showResult.value = true;
    }
  }, 1000);
};

const finishLevel = () => {
  router.push('/math');
};

const restartLevel = () => {
  mathStore.startLevel(mathStore.currentLevelId);
  currentIndex.value = 0;
  showResult.value = false;
  userInput.value = '';
};
</script>

<template>
  <div class="math-game">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <button class="exit-btn" @click="router.push('/math')">退出</button>
      <div class="progress">{{ currentIndex + 1 }} / {{ mathStore.currentLevel.questions.length }}</div>
      <div class="score">得分: {{ mathStore.score }}</div>
    </div>

    <!-- 题目显示区 -->
    <div class="question-container" :class="feedback">
      <div class="expression">
        {{ currentQuestion.display }}
        <span class="answer-box">{{ userInput || '?' }}</span>
      </div>
      
      <!-- 反馈动画 -->
      <div v-if="feedback === 'correct'" class="feedback-icon animate-bounce">✨ 太棒了！ ✨</div>
      <div v-if="feedback === 'wrong'" class="feedback-icon animate-shake">❌ 再试一次 ❌</div>
    </div>

    <!-- 数字键盘 -->
    <div class="keypad" role="group" aria-label="数字输入键盘">
      <div class="keys">
        <button 
          v-for="n in 9" 
          :key="n" 
          @click="handleKeypad(n.toString())"
          :aria-label="'数字 ' + n"
        >{{ n }}</button>
        <button @click="handleKeypad('0')" aria-label="数字 0">0</button>
        <button class="del-btn" @click="handleKeypad('DEL')" aria-label="退格键">退格</button>
        <button class="submit-btn" @click="checkAnswer" aria-label="提交答案">确定</button>
      </div>
    </div>

    <!-- 结算弹窗 -->
    <div v-if="showResult" class="modal-overlay">
      <div class="result-modal">
        <h2>🎉 关卡完成！ 🎉</h2>
        <div class="final-stars">
          <span v-for="s in 3" :key="s" class="star" :class="{ active: s <= (mathStore.levelProgress[mathStore.currentLevelId]?.stars || 0) }">⭐</span>
        </div>
        <p>正确数: {{ mathStore.correctCount }} / {{ mathStore.totalAnswered }}</p>
        <p>获得积分: {{ mathStore.score }}</p>
        
        <div class="modal-btns">
          <button @click="restartLevel">重玩本关</button>
          <button class="next-btn" @click="finishLevel">返回地图</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.math-game {
  min-height: 100vh;
  background: #e0f7fa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.status-bar {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 25px;
  border-radius: 20px;
  border: 4px solid #00acc1;
  margin-bottom: 30px;
  font-weight: bold;
}

.exit-btn {
  background: #ff5252;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 10px;
  cursor: pointer;
}

.question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 40px;
  border: 8px solid #00acc1;
  box-shadow: 0 10px 0 #00838f;
  margin-bottom: 30px;
  position: relative;
  transition: all 0.3s;
}

.question-container.correct { border-color: #4caf50; box-shadow: 0 10px 0 #2e7d32; }
.question-container.wrong { border-color: #f44336; box-shadow: 0 10px 0 #c62828; }

.expression {
  font-size: 4rem;
  font-weight: bold;
  color: #37474f;
  display: flex;
  align-items: center;
  gap: 15px;
}

.answer-box {
  min-width: 80px;
  height: 90px;
  border-bottom: 6px solid #00acc1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #00acc1;
}

.feedback-icon {
  position: absolute;
  top: -40px;
  font-size: 2rem;
  font-weight: bold;
}

.keypad {
  width: 100%;
  max-width: 400px;
}

.keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.keys button {
  height: 70px;
  font-size: 1.8rem;
  font-weight: bold;
  background: white;
  border: 4px solid #00acc1;
  border-radius: 15px;
  box-shadow: 0 5px 0 #00838f;
  cursor: pointer;
  transition: all 0.1s;
}

.keys button:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #00838f;
}

.del-btn { background: #ffecb3 !important; }
.submit-btn { 
  background: #00acc1 !important; 
  color: white; 
}

/* 结算弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.result-modal {
  background: white;
  padding: 40px;
  border-radius: 30px;
  text-align: center;
  border: 8px solid #ffb300;
  max-width: 400px;
  width: 90%;
}

.final-stars {
  font-size: 3rem;
  margin: 20px 0;
}

.modal-btns {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.modal-btns button {
  flex: 1;
  padding: 12px;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

.next-btn { background: #00acc1; color: white; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-bounce { animation: bounce 0.5s infinite; }
.animate-shake { animation: shake 0.2s 3; }

@media (max-width: 600px) {
  .expression { font-size: 2.5rem; }
  .answer-box { min-width: 60px; height: 70px; }
  .keys button { height: 60px; font-size: 1.5rem; }
}
</style>

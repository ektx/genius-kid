<template>
  <div class="practice-container">
    <div class="header">
      <button class="back-btn" @click="router.back()">🏠</button>
      <h1 class="title">🎯 数学自由练</h1>
    </div>

    <!-- 1. 设置区域 -->
    <div
      v-if="store.status === 'settings'"
      class="settings-card card animate-fade-in"
    >
      <div class="setting-item">
        <label>运算类型 (多选)</label>
        <div class="options-group">
          <button
            :class="{ active: store.settings.operations.includes('add') }"
            @click="toggleOp('add')"
          >
            加法
          </button>
          <button
            :class="{ active: store.settings.operations.includes('sub') }"
            @click="toggleOp('sub')"
          >
            减法
          </button>
        </div>
      </div>

      <div class="setting-item">
        <label>数值范围</label>
        <select v-model="store.settings.range">
          <option :value="10">10 以内</option>
          <option :value="20">20 以内</option>
          <option :value="100">100 以内</option>
        </select>
      </div>

      <div class="setting-item">
        <label>题目类型</label>
        <div class="options-group">
          <button
            :class="{ active: store.settings.type === '2-num' }"
            @click="store.settings.type = '2-num'"
          >
            2个数运算
          </button>
          <button
            :class="{ active: store.settings.type === '3-num' }"
            @click="store.settings.type = '3-num'"
          >
            3个数运算
          </button>
          <button
            :class="{ active: store.settings.type === 'priority' }"
            @click="store.settings.type = 'priority'"
          >
            带优先级
          </button>
        </div>
      </div>

      <div class="setting-item">
        <label>题目数量</label>
        <select v-model="store.settings.count">
          <option :value="10">10 道</option>
          <option :value="20">20 道</option>
          <option :value="50">50 道</option>
          <option :value="100">100 道</option>
        </select>
      </div>

      <button class="start-btn" @click="handleStart">开始练习 🚀</button>

      <div class="settings-footer">
        <button class="text-btn" @click="router.push('/math/wrong-questions')">
          📖 错题本 ({{ store.wrongQuestions.length }})
        </button>
        <div class="divider"></div>
        <button class="text-btn" @click="router.push('/math/analysis')">
          📊 练习分析
        </button>
        <div class="divider"></div>
        <button class="text-btn" @click="showHistory = true">
          🕒 练习记录
        </button>
      </div>
    </div>

    <!-- 1.1 历史记录抽屉/弹窗 (可选) - 这里我们先简单处理，直接在设置页下方显示最近记录 -->
    <div
      v-if="
        store.status === 'settings' && store.history.length > 0 && showHistory
      "
      class="history-overlay animate-fade-in"
    >
      <div class="history-modal card">
        <div class="modal-header">
          <h3>🕒 最近练习记录</h3>
          <button class="close-btn" @click="showHistory = false">×</button>
        </div>
        <div class="history-list">
          <div
            v-for="rec in store.history.slice(0, 10)"
            :key="rec.id"
            class="history-item"
          >
            <div class="info">
              <div class="date">{{ new Date(rec.date).toLocaleString() }}</div>
              <div class="config">
                {{ rec.settings.range }}以内 | {{ rec.settings.type }}
              </div>
            </div>
            <div class="stats">
              <span class="acc">{{ rec.accuracy }}%</span>
              <span class="time">{{ rec.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 答题区域 -->
    <div v-if="store.status === 'practicing'" class="game-area animate-fade-in">
      <div class="stats-bar">
        <div class="timer">{{ timerDisplay }}</div>
        <div class="progress">
          <span>已答: {{ store.currentIndex }}</span>
          <span>剩余: {{ store.progress.remaining + 1 }}</span>
          <span>总计: {{ store.progress.total }}</span>
        </div>
      </div>

      <div class="question-box" v-if="store.currentQuestion">
        <div class="expression">
          {{ store.currentQuestion.display }}
          <span class="answer-box">{{ userInput || '?' }}</span>
        </div>
      </div>

      <Keypad v-model="userInput" @submit-answer="submitAnswer"></Keypad>
    </div>

    <!-- 3. 结算区域 -->
    <div v-if="store.status === 'result'" class="result-area animate-fade-in">
      <div class="result-card card">
        <h2>✨ 练习完成 ✨</h2>
        <div class="final-stats">
          <div class="stat">
            <span class="label">总用时</span>
            <span class="value">{{ timerDisplay }}</span>
          </div>
          <div class="stat">
            <span class="label">正确率</span>
            <span class="value">{{ store.accuracy }}%</span>
          </div>
        </div>
        <div class="actions">
          <button class="primary-btn" @click="handleStart">再来一局</button>
          <button @click="router.push('/math/analysis')">分析报告</button>
          <button
            @click="router.push('/math/wrong-questions')"
            v-if="store.wrongQuestions.length > 0"
          >
            查看错题 ({{ store.wrongQuestions.length }})
          </button>
          <button @click="store.resetToSettings()">返回设置</button>
        </div>
      </div>

      <div class="history-section card">
        <h3>🏆 最近记录</h3>
        <div class="history-list">
          <div v-for="rec in store.history" :key="rec.id" class="history-item">
            <div class="info">
              <div class="date">{{ rec.date }}</div>
              <div class="config">
                {{ rec.settings.range }}以内 | {{ rec.settings.type }}
              </div>
            </div>
            <div class="stats">
              <span class="acc">{{ rec.accuracy }}%</span>
              <span class="time">{{ rec.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useMathPracticeStore } from '../../store/mathPracticeStore'
import type {
  MathOp,
  MathRange,
  MathType,
  QuestionCount
} from '../../utils/mathGenerator'
import Keypad from '@src/components/Keypad/keypadIndex.vue'

const router = useRouter()
const store = useMathPracticeStore()

const userInput = ref('')
const timerDisplay = ref('00:00:00.000')
const showHistory = ref(false)
let timerInterval: number | null = null

const startTimer = () => {
  stopTimer() // 启动前先停止旧的计时器
  const start = Date.now()
  timerInterval = window.setInterval(() => {
    const now = Date.now()
    timerDisplay.value = store.formatDuration(now - start)
  }, 10)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const handleStart = () => {
  if (store.settings.operations.length === 0) {
    alert('请至少选择一种运算类型！')
    return
  }
  userInput.value = ''
  timerDisplay.value = '00:00:00.000'
  store.startPractice()
  startTimer()
}

const handleKeypad = (num: string) => {
  if (num === 'DEL') {
    userInput.value = userInput.value.slice(0, -1)
  } else if (userInput.value.length < 5) {
    userInput.value += num
  }
}

const submitAnswer = () => {
  if (userInput.value === '') return
  const answer = parseInt(userInput.value)
  const currentQ = store.currentQuestion

  if (currentQ && answer !== currentQ.answer) {
    store.recordWrongQuestion(currentQ, answer)
  }

  store.submitAnswer(answer)
  userInput.value = ''

  if (store.status === 'result') {
    stopTimer()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (store.status !== 'practicing') return
  if (e.key >= '0' && e.key <= '9') handleKeypad(e.key)
  else if (e.key === 'Backspace') handleKeypad('DEL')
  else if (e.key === 'Enter') submitAnswer()
}

// 路由离开时确认
onBeforeRouteLeave((to, from, next) => {
  if (from.path === '/math/practice') {
    if (store.status !== 'practicing') {
      next()
    } else {
      next(confirm('确定要离开当前页面吗？'))
    }
  } else {
    next()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // 确保每次进入页面都回到设置界面
  store.resetToSettings()
  store.syncHistory()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  stopTimer()
})

const toggleOp = (op: MathOp) => {
  const ops = [...store.settings.operations]
  const index = ops.indexOf(op)
  if (index > -1) {
    if (ops.length > 1) ops.splice(index, 1)
  } else {
    ops.push(op)
  }
  store.settings.operations = ops
}
</script>

<style scoped>
.practice-container {
  min-height: 100vh;
  background: #fdf2f8;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
}

.title {
  font-size: 2.5rem;
  color: #db2777;
}

.back-btn {
  font-size: 1.5rem;
  background: white;
  border: 3px solid #db2777;
  border-radius: 50%;
  width: 50px;
  height: 50px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #64748b;
}

.options-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.options-group button {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  transition: all 0.2s;
}

.options-group button.active {
  background: #db2777;
  color: white;
  border-color: #db2777;
}

select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
}

.start-btn {
  width: 100%;
  padding: 15px;
  background: #db2777;
  color: white;
  border-radius: 16px;
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 10px;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
}

.settings-footer {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.text-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.text-btn:hover {
  color: #db2777;
  background-color: #fdf2f8;
}

.divider {
  width: 1px;
  height: 14px;
  background-color: #e2e8f0;
}

.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.history-modal {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
}

.close-btn:hover {
  color: #64748b;
}

.history-modal .history-list {
  flex: 1;
  margin-top: 0;
  padding: 0 20px;
}

/* 答题区域 */
.game-area {
  width: 100%;
  max-width: 800px;
  container-type: inline-size;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-family: monospace;
  font-size: 1.2rem;
  background: white;
  padding: 15px;
  border-radius: 15px;
  border: 3px solid #db2777;
}

@container (max-width: 400px) {
  .stats-bar {
    flex-direction: column;
    text-align: center;
  }
}

.timer {
  color: #db2777;
  font-weight: bold;
}

.progress {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #64748b;
}

@container (max-width: 400px) {
  .progress {
    align-items: center;
    justify-content: center;
  }
}

.question-box {
  background: white;
  padding: 40px;
  border-radius: 30px;
  border: 6px solid #db2777;
  text-align: center;
  margin-bottom: 30px;
}

.expression {
  font-size: 3.5rem;
  font-weight: bold;
  color: #37474f;
}

.answer-box {
  color: #db2777;
  border-bottom: 4px solid #db2777;
  min-width: 60px;
  display: inline-block;
}

.submit-btn {
  grid-column: span 3;
  background: #db2777 !important;
  color: white;
}

.del-btn {
  background: #fdf2f8 !important;
}

/* 结果区域 */
.final-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat {
  text-align: center;
}

.stat .label {
  display: block;
  color: #64748b;
}

.stat .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #db2777;
}

.actions {
  display: flex;
  gap: 15px;
}

.actions button {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.primary-btn {
  background: #db2777;
  color: white;
  border: none !important;
}

.history-section {
  max-width: 500px;
}

.history-list {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.history-item .date {
  font-size: 0.8rem;
  color: #64748b;
}

.history-item .stats {
  text-align: right;
}

.history-item .acc {
  display: block;
  font-weight: bold;
  color: #db2777;
}

.history-item .time {
  font-size: 0.8rem;
  font-family: monospace;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

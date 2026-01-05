<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMathPracticeStore } from '../../store/mathPracticeStore';

const router = useRouter();
const store = useMathPracticeStore();

const sortBy = ref<'count' | 'time'>('time');

const sortedWrongQuestions = computed(() => {
  return [...store.wrongQuestions].sort((a, b) => {
    if (sortBy.value === 'count') {
      return b.errorCount - a.errorCount;
    } else {
      return new Date(b.lastPracticedAt).getTime() - new Date(a.lastPracticedAt).getTime();
    }
  });
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleRemove = (display: string) => {
  if (confirm('确定要删除这道错题吗？')) {
    store.removeWrongQuestion(display);
  }
};

const handleClear = () => {
  if (confirm('确定要清空所有错题记录吗？')) {
    store.clearWrongQuestions();
  }
};
</script>

<template>
  <div class="wrong-questions-container">
    <div class="header">
      <button class="back-btn" @click="router.back()">⬅️</button>
      <h1 class="title">📖 错题本</h1>
      <button class="clear-btn" @click="handleClear" v-if="store.wrongQuestions.length > 0">清空</button>
    </div>

    <div class="controls" v-if="store.wrongQuestions.length > 0">
      <div class="sort-options">
        <span>排序方式:</span>
        <button 
          :class="{ active: sortBy === 'time' }" 
          @click="sortBy = 'time'"
        >最近时间</button>
        <button 
          :class="{ active: sortBy === 'count' }" 
          @click="sortBy = 'count'"
        >错误次数</button>
      </div>
      <div class="summary">
        共 {{ store.wrongQuestions.length }} 道错题
      </div>
    </div>

    <div v-if="store.wrongQuestions.length === 0" class="empty-state card animate-fade-in">
      <div class="icon">🎉</div>
      <p>太棒了！目前没有错题记录。</p>
      <button class="primary-btn" @click="router.push('/math/practice')">去练习</button>
    </div>

    <div v-else class="questions-list">
      <div 
        v-for="q in sortedWrongQuestions" 
        :key="q.display" 
        class="question-card card animate-fade-in"
      >
        <div class="card-header">
          <span class="error-badge">错误 {{ q.errorCount }} 次</span>
          <span class="date">{{ formatDate(q.lastPracticedAt) }}</span>
          <button class="remove-btn" @click="handleRemove(q.display)">×</button>
        </div>
        <div class="card-body">
          <div class="expression">{{ q.display }}</div>
          <div class="answers">
            <div class="answer wrong">
              <span class="label">你的答案:</span>
              <span class="value">{{ q.userAnswer }}</span>
            </div>
            <div class="answer correct">
              <span class="label">正确答案:</span>
              <span class="value">{{ q.correctAnswer }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrong-questions-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #e9ecef;
}

.title {
  flex: 1;
  font-size: 24px;
  margin: 0;
  color: #2c3e50;
}

.clear-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background: #fff1f0;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.sort-options button {
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.sort-options button.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.summary {
  font-size: 14px;
  color: #888;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  margin-top: 40px;
}

.empty-state .icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  font-size: 18px;
  margin-bottom: 24px;
}

.question-card {
  border-left: 4px solid #ff4d4f;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.error-badge {
  background-color: #fff1f0;
  color: #ff4d4f;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.date {
  color: #999;
  flex: 1;
}

.remove-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
}

.remove-btn:hover {
  color: #ff4d4f;
}

.expression {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 12px;
  text-align: center;
}

.answers {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 12px;
  background-color: #fcfcfc;
  border-radius: 8px;
}

.answer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.answer .label {
  font-size: 12px;
  color: #888;
}

.answer .value {
  font-size: 18px;
  font-weight: bold;
}

.answer.wrong .value {
  color: #ff4d4f;
  text-decoration: line-through;
}

.answer.correct .value {
  color: #52c41a;
}

.primary-btn {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

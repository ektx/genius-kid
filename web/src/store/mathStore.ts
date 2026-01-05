import { defineStore } from 'pinia';
import { mathLevels } from '../data/mathData';
import type { MathLevel, MathQuestion } from '../data/mathData';
import { api } from '../utils/api';

interface MathState {
  currentLevelId: number;
  score: number;
  correctCount: number;
  totalAnswered: number;
  gameStatus: 'idle' | 'playing' | 'level-complete' | 'game-over';
  levelProgress: Record<number, { stars: number, unlocked: boolean }>;
}

export const useMathStore = defineStore('math', {
  state: (): MathState => ({
    currentLevelId: 1,
    score: 0,
    correctCount: 0,
    totalAnswered: 0,
    gameStatus: 'idle',
    levelProgress: { 1: { stars: 0, unlocked: true } }
  }),

  actions: {
    // 从后端同步进度
    async syncProgress() {
      try {
        const res = await api.get('/math/progress');
        if (res.success && res.data.length > 0) {
          const progress: Record<number, { stars: number, unlocked: boolean }> = {};
          res.data.forEach((item: any) => {
            progress[item.level_id] = { stars: item.stars, unlocked: item.unlocked === 1 };
          });
          this.levelProgress = progress;
        }
      } catch (err) {
        console.warn('Failed to sync from server, using local data:', err);
        const localData = localStorage.getItem('math-progress');
        if (localData) this.levelProgress = JSON.parse(localData);
      }
    },

    startLevel(levelId: number) {
      this.currentLevelId = levelId;
      this.score = 0;
      this.correctCount = 0;
      this.totalAnswered = 0;
      this.gameStatus = 'playing';
    },

    submitAnswer(question: MathQuestion, userAnswer: number) {
      this.totalAnswered++;
      const isCorrect = question.answer === userAnswer;
      
      if (isCorrect) {
        this.correctCount++;
        this.score += 10;
      }

      // 如果当前关卡题目全部答完
      if (this.totalAnswered >= this.currentLevel.questions.length) {
        this.completeLevel();
      }

      return isCorrect;
    },

    async completeLevel() {
      this.gameStatus = 'level-complete';
      
      const accuracy = this.correctCount / this.totalAnswered;
      let stars = 0;
      if (accuracy >= 1) stars = 3;
      else if (accuracy >= 0.8) stars = 2;
      else if (accuracy >= 0.6) stars = 1;

      // 更新本地状态
      if (!this.levelProgress[this.currentLevelId] || stars > this.levelProgress[this.currentLevelId].stars) {
        this.levelProgress[this.currentLevelId] = { stars, unlocked: true };
        // 同步到后端
        try {
          await api.post('/math/progress', { levelId: this.currentLevelId, stars, unlocked: true });
        } catch (err) {
          console.error('Failed to save progress to server:', err);
        }
      }

      // 解锁下一关
      if (stars >= 1 && !this.isLastLevel) {
        const nextId = this.currentLevelId + 1;
        if (!this.levelProgress[nextId]) {
          this.levelProgress[nextId] = { stars: 0, unlocked: true };
          // 同步解锁到后端
          try {
            await api.post('/math/progress', { levelId: nextId, stars: 0, unlocked: true });
          } catch (err) {
            console.error('Failed to unlock next level on server:', err);
          }
        }
      }

      // 备份到 localStorage
      localStorage.setItem('math-progress', JSON.stringify(this.levelProgress));
    },

    nextLevel() {
      if (!this.isLastLevel) {
        this.startLevel(this.currentLevelId + 1);
      }
    }
  },

  getters: {
    currentLevel: (state): MathLevel => {
      return mathLevels.find(l => l.id === state.currentLevelId) || mathLevels[0];
    },
    isLastLevel: (state) => state.currentLevelId === mathLevels.length
  }
});

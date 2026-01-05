import { defineStore } from 'pinia';
import { mathLevels } from '../data/mathData';
import type { MathLevel, MathQuestion } from '../data/mathData';
import { api } from '../utils/api';
import { useAuthStore } from './authStore';

interface MathState {
  currentLevelId: number;
  score: number;
  correctCount: number;
  totalAnswered: number;
  gameStatus: 'idle' | 'playing' | 'level-complete' | 'game-over';
  levelProgress: Record<number, { stars: number, unlocked: boolean }>;
  isSyncing: boolean;
}

export const useMathStore = defineStore('math', {
  state: (): MathState => ({
    currentLevelId: 1,
    score: 0,
    correctCount: 0,
    totalAnswered: 0,
    gameStatus: 'idle',
    levelProgress: JSON.parse(localStorage.getItem('math-progress') || '{ "1": { "stars": 0, "unlocked": true } }'),
    isSyncing: false
  }),

  getters: {
    currentLevel: (state): MathLevel => {
      return mathLevels.find(l => l.id === state.currentLevelId) || mathLevels[0];
    },
    isLastLevel: (state) => state.currentLevelId === mathLevels[mathLevels.length - 1].id
  },

  actions: {
    // 从后端同步进度
    async syncProgress() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.isSyncing = true;
      try {
        // 1. 先尝试获取远程进度
        const res: any = await api.get('/math/progress');
        if (res.success && res.data) {
          const remoteProgress: Record<number, { stars: number, unlocked: boolean }> = {};
          res.data.forEach((item: any) => {
            remoteProgress[item.level_id] = { stars: item.stars, unlocked: item.unlocked === 1 };
          });

          // 2. 合并本地和远程进度（取最大星星数和解锁状态）
          const mergedProgress = { ...this.levelProgress };
          let hasChanges = false;

          Object.keys(remoteProgress).forEach(id => {
            const levelId = parseInt(id);
            const remote = remoteProgress[levelId];
            const local = mergedProgress[levelId];

            if (!local || remote.stars > local.stars || remote.unlocked !== local.unlocked) {
              mergedProgress[levelId] = {
                stars: Math.max(remote.stars, local?.stars || 0),
                unlocked: remote.unlocked || local?.unlocked || false
              };
              hasChanges = true;
            }
          });

          // 3. 如果本地有更多进度，同步给远程
          for (const id in this.levelProgress) {
            const levelId = parseInt(id);
            if (!remoteProgress[levelId] || this.levelProgress[levelId].stars > remoteProgress[levelId].stars) {
              await api.post('/math/progress', { 
                levelId, 
                stars: this.levelProgress[levelId].stars, 
                unlocked: this.levelProgress[levelId].unlocked 
              });
            }
          }

          this.levelProgress = mergedProgress;
          this.saveToLocal();
        }
      } catch (err) {
        console.warn('Sync failed, using local data:', err);
      } finally {
        this.isSyncing = false;
      }
    },

    saveToLocal() {
      localStorage.setItem('math-progress', JSON.stringify(this.levelProgress));
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
      }

      // 解锁下一关
      if (stars >= 1 && !this.isLastLevel) {
        const nextId = this.currentLevelId + 1;
        if (!this.levelProgress[nextId]) {
          this.levelProgress[nextId] = { stars: 0, unlocked: true };
        }
      }

      this.saveToLocal();
      
      // 尝试同步到后端
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        try {
          await api.post('/math/progress', { 
            levelId: this.currentLevelId, 
            stars, 
            unlocked: true 
          });
          if (stars >= 1 && !this.isLastLevel) {
            await api.post('/math/progress', { 
              levelId: this.currentLevelId + 1, 
              stars: 0, 
              unlocked: true 
            });
          }
        } catch (err) {
          console.warn('Background sync failed, will retry later');
        }
      }
    }
  }
});

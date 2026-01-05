import { defineStore } from 'pinia';
import { generatePracticeQuestions } from '../utils/mathGenerator';
import type { PracticeSettings, PracticeQuestion } from '../utils/mathGenerator';
import { api } from '../utils/api';

export interface PracticeRecord {
  id: string;
  date: string;
  duration: string; // HH:MM:SS.ms
  accuracy: number;
  settings: PracticeSettings;
  score: number;
}

interface MathPracticeState {
  settings: PracticeSettings;
  currentQuestions: PracticeQuestion[];
  currentIndex: number;
  userAnswers: (number | null)[];
  startTime: number | null;
  endTime: number | null;
  history: PracticeRecord[];
  status: 'settings' | 'practicing' | 'result';
}

export const useMathPracticeStore = defineStore('mathPractice', {
  state: (): MathPracticeState => ({
    settings: {
      operations: ['add', 'sub'],
      range: 20,
      type: '2-num',
      count: 20
    },
    currentQuestions: [],
    currentIndex: 0,
    userAnswers: [],
    startTime: null,
    endTime: null,
    history: JSON.parse(localStorage.getItem('math-practice-history') || '[]'),
    status: 'settings'
  }),

  getters: {
    currentQuestion: (state) => state.currentQuestions[state.currentIndex],
    isFinished: (state) => state.currentIndex >= state.currentQuestions.length,
    progress: (state) => ({
      current: state.currentIndex + 1,
      total: state.currentQuestions.length,
      remaining: state.currentQuestions.length - state.currentIndex - 1
    }),
    accuracy: (state) => {
      if (state.currentQuestions.length === 0) return 0;
      let correct = 0;
      state.userAnswers.forEach((ans, i) => {
        if (ans === state.currentQuestions[i].answer) correct++;
      });
      return Math.round((correct / state.currentQuestions.length) * 100);
    }
  },

  actions: {
    startPractice() {
      this.currentQuestions = generatePracticeQuestions(this.settings);
      this.currentIndex = 0;
      this.userAnswers = new Array(this.settings.count).fill(null);
      this.startTime = Date.now();
      this.endTime = null;
      this.status = 'practicing';
    },

    submitAnswer(answer: number) {
      this.userAnswers[this.currentIndex] = answer;
      if (this.currentIndex < this.currentQuestions.length - 1) {
        this.currentIndex++;
      } else {
        this.finishPractice();
      }
    },

    finishPractice() {
      this.endTime = Date.now();
      this.status = 'result';
      this.saveRecord();
    },

    async syncHistory() {
      try {
        const res = await api.get('/math/practice');
        if (res.success && res.data.rows) {
          this.history = res.data.rows.map((row: any) => ({
            ...row,
            settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings
          }));
        }
      } catch (err) {
        console.warn('Failed to sync history, using local data:', err);
      }
    },

    async saveRecord() {
      if (!this.startTime || !this.endTime) return;
      
      const durationMs = this.endTime - this.startTime;
      const record: PracticeRecord = {
        id: `rec-${Date.now()}`,
        date: new Date().toLocaleString(),
        duration: this.formatDuration(durationMs),
        accuracy: this.accuracy,
        settings: { ...this.settings },
        score: this.accuracy // Simplified score
      };

      // 保存到本地
      this.history.unshift(record);
      if (this.history.length > 50) this.history.pop();
      localStorage.setItem('math-practice-history', JSON.stringify(this.history));

      // 同步到后端
      try {
        await api.post('/math/practice', record);
      } catch (err) {
        console.error('Failed to save record to server:', err);
      }
    },

    formatDuration(ms: number): string {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const milli = ms % 1000;
      
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${milli.toString().padStart(3, '0')}`;
    },

    resetToSettings() {
      this.status = 'settings';
      this.currentIndex = 0;
      this.userAnswers = [];
    }
  }
});

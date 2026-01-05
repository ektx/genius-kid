import { defineStore } from 'pinia'
import { generatePracticeQuestions } from '../utils/mathGenerator'
import type { PracticeSettings, PracticeQuestion } from '../utils/mathGenerator'
import { api } from '../utils/api'
import { useAuthStore } from './authStore'

export interface PracticeRecord {
  id: string
  date: string
  duration: string // HH:MM:SS.ms
  accuracy: number
  total_questions?: number
  wrong_count?: number
  wrong_details?: WrongQuestion[]
  settings: PracticeSettings
  score: number
  synced?: boolean
}

export interface WrongQuestion {
  questionId: string
  expression: string
  display: string
  userAnswer: number
  correctAnswer: number
  errorCount: number
  lastPracticedAt: string
}

interface MathPracticeState {
  settings: PracticeSettings
  currentQuestions: PracticeQuestion[]
  currentIndex: number
  userAnswers: (number | null)[]
  startTime: number | null
  endTime: number | null
  history: PracticeRecord[]
  wrongQuestions: WrongQuestion[]
  status: 'settings' | 'practicing' | 'result'
  isSyncing: boolean
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
    wrongQuestions: JSON.parse(
      localStorage.getItem('math-wrong-questions') || '[]'
    ),
    status: 'settings',
    isSyncing: false
  }),

  getters: {
    currentQuestion: state => state.currentQuestions[state.currentIndex],
    isFinished: state => state.currentIndex >= state.currentQuestions.length,
    progress: state => ({
      current: state.currentIndex + 1,
      total: state.currentQuestions.length,
      remaining: state.currentQuestions.length - state.currentIndex - 1
    }),
    accuracy: state => {
      if (state.currentQuestions.length === 0) return 0
      let correct = 0
      state.userAnswers.forEach((ans, i) => {
        if (ans === state.currentQuestions[i].answer) correct++
      })
      return Math.round((correct / state.currentQuestions.length) * 100)
    }
  },

  actions: {
    formatDuration(ms: number) {
      const hours = Math.floor(ms / 3600000)
      const minutes = Math.floor((ms % 3600000) / 60000)
      const seconds = Math.floor((ms % 60000) / 1000)
      const milliseconds = ms % 1000
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds
        .toString()
        .padStart(3, '0')}`
    },

    resetToSettings() {
      this.status = 'settings'
      this.currentQuestions = []
      this.currentIndex = 0
      this.userAnswers = []
      this.startTime = null
      this.endTime = null
    },

    recordWrongQuestion(question: PracticeQuestion, userAnswer: number) {
      const existing = this.wrongQuestions.find(
        q => q.display === question.display
      )
      if (existing) {
        existing.errorCount++
        existing.lastPracticedAt = new Date().toISOString()
        existing.userAnswer = userAnswer
      } else {
        this.wrongQuestions.unshift({
          questionId: question.id,
          expression: question.expression,
          display: question.display,
          userAnswer: userAnswer,
          correctAnswer: question.answer,
          errorCount: 1,
          lastPracticedAt: new Date().toISOString()
        })
      }
      this.saveWrongQuestions()
    },

    saveWrongQuestions() {
      localStorage.setItem(
        'math-wrong-questions',
        JSON.stringify(this.wrongQuestions)
      )
    },

    removeWrongQuestion(display: string) {
      this.wrongQuestions = this.wrongQuestions.filter(
        q => q.display !== display
      )
      this.saveWrongQuestions()
    },

    clearWrongQuestions() {
      this.wrongQuestions = []
      this.saveWrongQuestions()
    },

    startPractice() {
      this.currentQuestions = generatePracticeQuestions(this.settings)
      this.currentIndex = 0
      this.userAnswers = new Array(this.settings.count).fill(null)
      this.startTime = Date.now()
      this.endTime = null
      this.status = 'practicing'
    },

    submitAnswer(answer: number) {
      this.userAnswers[this.currentIndex] = answer
      if (this.currentIndex < this.currentQuestions.length - 1) {
        this.currentIndex++
      } else {
        this.finishPractice()
      }
    },

    finishPractice() {
      this.endTime = Date.now()
      this.status = 'result'
      this.saveRecord()
    },

    async syncHistory() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isSyncing = true
      try {
        // 1. 获取远程记录
        const res: any = await api.get('/math/practice')
        if (res.success && res.data.rows) {
          const remoteRecords = res.data.rows.map((row: any) => ({
            ...row,
            settings:
              typeof row.settings === 'string'
                ? JSON.parse(row.settings)
                : row.settings,
            wrong_details:
              typeof row.wrong_details === 'string'
                ? JSON.parse(row.wrong_details)
                : row.wrong_details,
            synced: true
          }))

          // 2. 合并：保留远程有的，加上本地未同步的
          const localUnsynced = this.history.filter(r => !r.synced)

          // 避免重复同步：检查 ID
          const remoteIds = new Set(remoteRecords.map((r: any) => r.id))
          const filteredLocal = localUnsynced.filter(r => !remoteIds.has(r.id))

          // 3. 同步本地未同步的到远程
          for (const record of filteredLocal) {
            try {
              await api.post('/math/practice', record)
              record.synced = true
            } catch (err) {
              console.warn(`Failed to sync record ${record.id}`, err)
            }
          }

          // 最终合并
          this.history = [
            ...remoteRecords,
            ...filteredLocal.filter(r => r.synced)
          ]
          this.saveToLocal()
        }
      } catch (err) {
        console.warn('Sync history failed, using local data:', err)
      } finally {
        this.isSyncing = false
      }
    },

    saveToLocal() {
      localStorage.setItem(
        'math-practice-history',
        JSON.stringify(this.history)
      )
    },

    async saveRecord() {
      const durationMs = this.endTime! - this.startTime!
      const durationStr = this.formatDuration(durationMs)

      // Get wrong questions for this session
      const currentWrongQuestions = this.currentQuestions
        .map((q, i) => ({ q, ans: this.userAnswers[i] }))
        .filter(item => item.ans !== null && item.ans !== item.q.answer)
        .map(item => ({
          questionId: item.q.id,
          expression: item.q.expression,
          display: item.q.display,
          userAnswer: item.ans as number,
          correctAnswer: item.q.answer,
          errorCount: 1,
          lastPracticedAt: new Date().toISOString()
        }))

      const newRecord: PracticeRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: durationStr,
        accuracy: this.accuracy,
        total_questions: this.currentQuestions.length,
        wrong_count: currentWrongQuestions.length,
        wrong_details: currentWrongQuestions,
        settings: { ...this.settings },
        score: this.accuracy, // 简单以正确率为分
        synced: false
      }

      this.history.unshift(newRecord)
      this.saveToLocal()

      // 尝试同步
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        try {
          await api.post('/math/practice', newRecord)
          newRecord.synced = true
          this.saveToLocal()
        } catch (err) {
          console.warn('Failed to sync new record, will retry later')
        }
      }
    }
  }
})

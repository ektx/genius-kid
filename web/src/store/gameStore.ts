import { defineStore } from 'pinia';
import { getPinyinAudioText } from '../utils/pinyinAudio';
import { api } from '../utils/api';
import { useAuthStore } from './authStore';

export type GameMode = 'pinyin-to-hanzi' | 'hanzi-to-pinyin' | 'pinyin-category';
export type PinyinCategory = 'initial' | 'final' | 'overall' | 'all';

export interface ScoreRecord {
  id: string;
  score: number;
  date: string;
  mode: GameMode;
  synced?: boolean;
}

/**
 * 游戏全局状态管理
 */
export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,             // 当前得分
    combo: 0,             // 连击次数
    timeLeft: 60,         // 剩余时间 (秒)
    totalTime: 60,        // 总限时 (用于进度条计算)
    isGameOver: false,    // 游戏是否结束
    currentMode: 'hanzi-to-pinyin' as GameMode, // 当前练习模式
    currentCategory: 'all' as PinyinCategory,   // 拼音分类过滤
    // 从本地存储初始化历史记录
    records: JSON.parse(localStorage.getItem('pinyin-records') || '[]') as ScoreRecord[],
    // 从本地存储初始化错题集
    wrongItems: JSON.parse(localStorage.getItem('pinyin-wrong') || '[]') as any[],
    isSyncing: false
  }),

  getters: {
    // 获取历史最高分
    highScore: (state) => {
      if (state.records.length === 0) return 0;
      return Math.max(...state.records.map(r => r.score));
    },
  },

  actions: {
    // 初始化游戏状态
    initGame(mode: GameMode, time: number, category: PinyinCategory = 'all') {
      this.score = 0;
      this.combo = 0;
      this.timeLeft = time;
      this.totalTime = time;
      this.isGameOver = false;
      this.currentMode = mode;
      this.currentCategory = category;
    },

    // 处理得分逻辑
    addScore(isCorrect: boolean, item: any) {
      if (isCorrect) {
        let points = 10;
        this.combo++;
        // 连击奖励：连续正确3次及以上，积分翻倍
        if (this.combo >= 3) {
          points *= 2;
        }
        this.score += points;
      } else {
        // 错误惩罚：扣5分，连击清零
        this.score = Math.max(0, this.score - 5);
        this.combo = 0;
        this.recordWrongItem(item);
      }
    },

    // 处理超时逻辑
    handleTimeout() {
      this.score = Math.max(0, this.score - 2);
      this.combo = 0;
    },

    // 游戏结束处理
    async endGame() {
      this.isGameOver = true;
      const record: ScoreRecord = {
        id: Date.now().toString(),
        score: this.score,
        date: new Date().toISOString(),
        mode: this.currentMode,
        synced: false
      };
      
      // 保存成绩到本地存储
      this.records.push(record);
      this.saveToLocal();

      // 尝试同步
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        try {
          await api.post('/pinyin/records', record);
          record.synced = true;
          this.saveToLocal();
        } catch (err) {
          console.warn('Failed to sync pinyin record');
        }
      }
    },

    // 从后端同步历史记录
    async syncRecords() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.isSyncing = true;
      try {
        const res: any = await api.get('/pinyin/records');
        if (res.success && res.data) {
          const remoteRecords = res.data.map((r: any) => ({ ...r, synced: true }));
          
          const localUnsynced = this.records.filter(r => !r.synced);
          const remoteIds = new Set(remoteRecords.map((r: any) => r.id));
          const filteredLocal = localUnsynced.filter(r => !remoteIds.has(r.id));

          for (const record of filteredLocal) {
            try {
              await api.post('/pinyin/records', record);
              record.synced = true;
            } catch (err) {
              console.warn(`Failed to sync record ${record.id}`);
            }
          }

          this.records = [...remoteRecords, ...filteredLocal.filter(r => r.synced)];
          this.saveToLocal();
        }
      } catch (err) {
        console.warn('Sync pinyin records failed');
      } finally {
        this.isSyncing = false;
      }
    },

    saveToLocal() {
      localStorage.setItem('pinyin-records', JSON.stringify(this.records));
      localStorage.setItem('pinyin-wrong', JSON.stringify(this.wrongItems));
    },

    // 记录错题
    recordWrongItem(item: any) {
      const exists = this.wrongItems.find(i => 
        (i.hanzi && i.hanzi === item.hanzi) || (i.value && i.value === item.value)
      );
      if (!exists) {
        this.wrongItems.push(item);
        this.saveToLocal();
      }
    },

    // TTS 语音合成功能
    speak(text: string) {
      if (!window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }
});

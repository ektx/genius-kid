import { defineStore } from 'pinia';
import { getPinyinAudioText } from '../utils/pinyinAudio';

export type GameMode = 'pinyin-to-hanzi' | 'hanzi-to-pinyin' | 'pinyin-category';
export type PinyinCategory = 'initial' | 'final' | 'overall' | 'all';

interface ScoreRecord {
  score: number;
  date: string;
  mode: GameMode;
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
    endGame() {
      this.isGameOver = true;
      const record: ScoreRecord = {
        score: this.score,
        date: new Date().toISOString(),
        mode: this.currentMode,
      };
      // 保存成绩到本地存储
      this.records.push(record);
      localStorage.setItem('pinyin-records', JSON.stringify(this.records));
    },

    // 记录错题
    recordWrongItem(item: any) {
      const exists = this.wrongItems.find(i => 
        (i.hanzi && i.hanzi === item.hanzi) || (i.value && i.value === item.value)
      );
      if (!exists) {
        this.wrongItems.push(item);
        localStorage.setItem('pinyin-wrong', JSON.stringify(this.wrongItems));
      }
    },

    // TTS 语音合成功能
    speak(text: string) {
      if (!window.speechSynthesis) return;
      
      // 取消当前正在播放的语音
      window.speechSynthesis.cancel();

      // 清理文本
      const cleanText = text ? text.trim() : '';
      if (!cleanText) return;

      // 如果是拼音（包含字母且不包含汉字），转换为对应的同音汉字以获取标准发音
      const hasLetters = /[a-zA-Z]/.test(cleanText);
      const hasChinese = /[\u4e00-\u9fa5]/.test(cleanText);
      
      let audioText = cleanText;
      if (hasLetters && !hasChinese) {
        audioText = getPinyinAudioText(cleanText);
      }

      console.log(`TTS Speaking: "${cleanText}" -> "${audioText}"`);

      const utterance = new SpeechSynthesisUtterance(audioText);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8; // 稍微降低语速，让发音更清晰

      // 强制选择中文语音（如果可用）
      const loadVoicesAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(v => v.lang.includes('zh') || v.name.includes('Chinese') || v.name.includes('Huihui') || v.name.includes('Xiaoxiao'));
        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
      } else {
        loadVoicesAndSpeak();
      }
    }
  }
});

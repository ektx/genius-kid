import { commonHanzi } from '../data/hanziData';

/**
 * 拼音音节与同音汉字的映射表
 * 用于解决浏览器 TTS 引擎无法正确读出孤立拼音字母的问题
 */
export const pinyinToHanziMap: Record<string, string> = {
  // 声母
  'b': '玻', 'p': '坡', 'm': '摸', 'f': '佛',
  'd': '得', 't': '特', 'n': '讷', 'l': '勒',
  'g': '哥', 'k': '科', 'h': '喝',
  'j': '鸡', 'q': '七', 'x': '西',
  'zh': '知', 'ch': '吃', 'sh': '狮', 'r': '日',
  'z': '资', 'c': '雌', 's': '思',
  'y': '衣', 'w': '乌',

  // 韵母
  'a': '啊', 'o': '喔', 'e': '鹅', 'i': '衣', 'u': '乌', 'v': '迂', 'ü': '迂',
  'ai': '哀', 'ei': '欸', 'ui': '威', 'ao': '熬', 'ou': '欧', 'iu': '优',
  'ie': '耶', 've': '约', 'er': '儿',
  'an': '安', 'en': '恩', 'in': '因', 'un': '温', 'vn': '晕',
  'ang': '昂', 'eng': '鞥', 'ing': '英', 'ong': '翁',

  // 整体认读音节
  'zhi': '知', 'chi': '吃', 'shi': '狮', 'ri': '日',
  'zi': '资', 'ci': '雌', 'si': '思',
  'yi': '衣', 'wu': '乌', 'yu': '迂',
  'ye': '耶', 'yue': '约', 'yuan': '冤',
  'yin': '因', 'yun': '晕', 'ying': '英'
};

/**
 * 获取拼音的标准发音文本（同音汉字）
 */
export const getPinyinAudioText = (pinyin: string): string => {
  if (!pinyin) return '';
  
  const normalized = pinyin.toLowerCase().trim().replace(/[1-4]/g, ''); // 移除声调数字
  
  // 1. 先从预设映射表找（主要针对声母、韵母、整体认读）
  if (pinyinToHanziMap[normalized]) {
    return pinyinToHanziMap[normalized];
  }

  // 2. 如果是完整的音节（如 'wo', 'ni'），尝试从常用汉字表中找一个同音字
  const match = commonHanzi.find(h => h.pinyin.replace(/[1-4]/g, '') === normalized);
  if (match) {
    return match.hanzi;
  }

  return pinyin;
};

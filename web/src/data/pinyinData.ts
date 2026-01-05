/**
 * 拼音基础数据定义
 */

// 声母表
export const initials = [
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x',
  'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'
];

// 韵母表
export const finals = [
  'a', 'o', 'e', 'i', 'u', 'v', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 've', 'er',
  'an', 'en', 'in', 'un', 'vn', 'ang', 'eng', 'ing', 'ong'
];

// 整体认读音节
export const overallSyllables = [
  'zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu',
  'ye', 'yue', 'yuan', 'yin', 'yun', 'ying'
];

export interface PinyinItem {
  type: 'initial' | 'final' | 'overall';
  value: string;
}

// 聚合所有拼音数据用于练习
export const allPinyinData: PinyinItem[] = [
  ...initials.map(v => ({ type: 'initial', value: v } as PinyinItem)),
  ...finals.map(v => ({ type: 'final', value: v } as PinyinItem)),
  ...overallSyllables.map(v => ({ type: 'overall', value: v } as PinyinItem))
];

export interface MathQuestion {
  id: string;
  type: 'basic' | 'triple' | 'missing-operand' | 'equation';
  expression: string; // 例如: "12 - 3"
  answer: number;    // 正确答案
  display: string;    // 显示格式，例如: "12 - 3 = ?" 或 "8 + ( ) = 15"
  options?: number[]; // 选择题选项（可选）
}

export interface MathLevel {
  id: number;
  name: string;
  difficulty: number;
  questions: MathQuestion[];
  targetStars: number;
}

/**
 * 自动生成数学题目的工具函数
 */
export const generateQuestions = (levelId: number): MathQuestion[] => {
  const questions: MathQuestion[] = [];
  const count = 10; // 每关10道题

  for (let i = 0; i < count; i++) {
    const id = `${levelId}-${i}`;
    let q: MathQuestion;

    if (levelId <= 3) {
      // 基础加减法 (20以内)
      const isAdd = Math.random() > 0.5;
      const a = Math.floor(Math.random() * 15) + 5;
      const b = Math.floor(Math.random() * 10) + 1;
      if (isAdd) {
        q = { id, type: 'basic', expression: `${a} + ${b}`, answer: a + b, display: `${a} + ${b} = ` };
      } else {
        const max = a + b;
        q = { id, type: 'basic', expression: `${max} - ${b}`, answer: a, display: `${max} - ${b} = ` };
      }
    } else if (levelId <= 6) {
      // 三个数加减混合 (如 3 + 5 + 8, 90 + 10 - 20)
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * 10) + 5;
      const c = Math.floor(Math.random() * 10) + 2;
      const op1 = Math.random() > 0.5 ? '+' : '-';
      const op2 = Math.random() > 0.5 ? '+' : '-';
      
      let res = a;
      if (op1 === '+') res += b; else res -= b;
      if (op2 === '+') res += c; else res -= c;
      
      q = { id, type: 'triple', expression: `${a} ${op1} ${b} ${op2} ${c}`, answer: res, display: `${a} ${op1} ${b} ${op2} ${c} = ` };
    } else if (levelId <= 10) {
      // 填空题 (如 8 + ( ) = 15, ( ) - 8 = 13)
      const a = Math.floor(Math.random() * 10) + 5;
      const b = Math.floor(Math.random() * 10) + 5;
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const sum = a + b;
        const missingFirst = Math.random() > 0.5;
        if (missingFirst) {
          q = { id, type: 'missing-operand', expression: `x + ${b} = ${sum}`, answer: a, display: `( ) + ${b} = ${sum}` };
        } else {
          q = { id, type: 'missing-operand', expression: `${a} + x = ${sum}`, answer: b, display: `${a} + ( ) = ${sum}` };
        }
      } else {
        const diff = a;
        const total = a + b;
        const missingFirst = Math.random() > 0.5;
        if (missingFirst) {
          q = { id, type: 'missing-operand', expression: `x - ${b} = ${diff}`, answer: total, display: `( ) - ${b} = ${diff}` };
        } else {
          q = { id, type: 'missing-operand', expression: `${total} - x = ${diff}`, answer: b, display: `${total} - ( ) = ${diff}` };
        }
      }
    } else {
      // 复杂等式 (如 10 + ( ) = 7 + 7, ( ) + 9 = 16 - 6)
      const leftA = Math.floor(Math.random() * 10) + 5;
      const rightA = Math.floor(Math.random() * 10) + 5;
      const rightB = Math.floor(Math.random() * 10) + 5;
      const opRight = Math.random() > 0.5 ? '+' : '-';
      
      let rightRes = rightA;
      if (opRight === '+') rightRes += rightB; else rightRes -= rightB;
      
      // 确保结果为正且有解
      const answer = Math.abs(rightRes - leftA);
      const isAdd = rightRes >= leftA;
      
      if (isAdd) {
        q = { id, type: 'equation', expression: `${leftA} + x = ${rightA} ${opRight} ${rightB}`, answer: answer, display: `${leftA} + ( ) = ${rightA} ${opRight} ${rightB}` };
      } else {
        q = { id, type: 'equation', expression: `${leftA} - x = ${rightA} ${opRight} ${rightB}`, answer: leftA - rightRes, display: `${leftA} - ( ) = ${rightA} ${opRight} ${rightB}` };
      }
    }
    questions.push(q);
  }
  return questions;
};

export const mathLevels: MathLevel[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `第 ${i + 1} 关`,
  difficulty: i + 1,
  questions: generateQuestions(i + 1),
  targetStars: 3
}));

export type MathOp = 'add' | 'sub';
export type MathRange = 10 | 20 | 100;
export type MathType = '2-num' | '3-num' | 'priority';
export type QuestionCount = 10 | 20 | 50 | 100;

export interface PracticeQuestion {
  id: string;
  expression: string;
  display: string;
  answer: number;
}

export interface PracticeSettings {
  operations: MathOp[];
  range: MathRange;
  type: MathType;
  count: QuestionCount;
}

export const generatePracticeQuestions = (settings: PracticeSettings): PracticeQuestion[] => {
  const questions: PracticeQuestion[] = [];
  const { operations, range, type, count } = settings;

  const getRandomNum = (max: number) => Math.floor(Math.random() * max) + 1;
  const getRandomOp = () => operations[Math.floor(Math.random() * operations.length)];

  for (let i = 0; i < count; i++) {
    let expression = '';
    let display = '';
    let answer = 0;

    if (type === '2-num') {
      const op = getRandomOp();
      let a = getRandomNum(range);
      let b = getRandomNum(range);
      
      if (op === 'add') {
        // Ensure sum is within range if needed, or just allow it
        answer = a + b;
        display = `${a} + ${b} = `;
      } else {
        // Ensure no negative results for kids
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        display = `${a} - ${b} = `;
      }
    } else if (type === '3-num') {
      const op1 = getRandomOp();
      const op2 = getRandomOp();
      let a = getRandomNum(range);
      let b = getRandomNum(range / 2);
      let c = getRandomNum(range / 2);

      let res = a;
      if (op1 === 'add') res += b; else res -= b;
      
      // Prevent negative mid-results
      if (res < 0) {
        res = a + b;
        display = `${a} + ${b} `;
      } else {
        display = `${a} ${op1 === 'add' ? '+' : '-'} ${b} `;
      }

      if (op2 === 'add') res += c; else res -= c;
      
      // Final negative check
      if (res < 0) {
        res += c * 2;
        display += `+ ${c} = `;
      } else {
        display += `${op2 === 'add' ? '+' : '-'} ${c} = `;
      }
      answer = res;
    } else if (type === 'priority') {
      // a + (b - c) or a - (b + c)
      // Requirement: mix different operators
      const opOuter = getRandomOp();
      const opInner = opOuter === 'add' ? 'sub' : 'add';
      
      let b = getRandomNum(range / 2);
      let c = getRandomNum(range / 2);
      if (opInner === 'sub' && b < c) [b, c] = [c, b];
      
      const innerVal = opInner === 'add' ? b + c : b - c;
      let a = getRandomNum(range);
      
      if (opOuter === 'sub' && a < innerVal) a = innerVal + getRandomNum(10);
      
      answer = opOuter === 'add' ? a + innerVal : a - innerVal;
      display = `${a} ${opOuter === 'add' ? '+' : '-'} (${b} ${opInner === 'add' ? '+' : '-'} ${c}) = `;
    }

    questions.push({
      id: `practice-${Date.now()}-${i}`,
      expression,
      display,
      answer
    });
  }

  return questions;
};

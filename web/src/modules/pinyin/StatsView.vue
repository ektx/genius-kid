<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../../store/gameStore';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const router = useRouter();
const gameStore = useGameStore();

// 图表数据计算：提取最近10次比赛的分数
const chartData = computed(() => {
  const last10 = gameStore.records.slice(-10);
  return {
    labels: last10.map((_, i) => `第${i + 1}次`),
    datasets: [
      {
        label: '分数趋势',
        backgroundColor: '#38bdf8',
        borderColor: '#0ea5e9',
        data: last10.map(r => r.score),
        tension: 0.4 // 曲线平滑度
      }
    ]
  };
});

// 图表配置项
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true }
  }
};

// 成就系统逻辑：根据最高分计算解锁状态
const medals = computed(() => {
  const high = gameStore.highScore;
  return [
    { name: '铜牌达人', icon: '🥉', unlocked: high >= 100, target: 100 },
    { name: '银牌小将', icon: '🥈', unlocked: high >= 300, target: 300 },
    { name: '金牌霸主', icon: '🥇', unlocked: high >= 500, target: 500 },
  ];
});

// 排行榜：总榜
const topScores = computed(() => {
  return [...gameStore.records]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
});

// 排行榜：本周
const weeklyScores = computed(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return gameStore.records
    .filter(r => new Date(r.date) >= weekAgo)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
});

// 排行榜：本月
const monthlyScores = computed(() => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return gameStore.records
    .filter(r => new Date(r.date) >= monthAgo)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
});

// 当前选中的排行榜标签
const activeTab = ref('total');
</script>

<template>
  <div class="stats-container">
    <div class="header">
      <button class="back-btn" @click="router.push('/')">⬅ 返回主页</button>
      <h1>🏆 个人中心</h1>
    </div>

    <div class="grid">
      <!-- High Score Card -->
      <div class="card score-card">
        <h3>最高分</h3>
        <div class="high-score">{{ gameStore.highScore }}</div>
      </div>

      <!-- Medals Card -->
      <div class="card medals-card">
        <h3>我的成就</h3>
        <div class="medals-list">
          <div v-for="m in medals" :key="m.name" :class="['medal', { locked: !m.unlocked }]">
            <div class="medal-icon">{{ m.icon }}</div>
            <div class="medal-name">{{ m.name }}</div>
            <div class="medal-target" v-if="!m.unlocked">需达 {{ m.target }}分</div>
          </div>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="card chart-card">
        <h3>进步曲线 (近10次)</h3>
        <div class="chart-wrapper">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Leaderboard Card -->
      <div class="card leaderboard-card">
        <div class="card-header">
          <h3>排行榜</h3>
          <div class="tab-group">
            <span :class="{ active: activeTab === 'total' }" @click="activeTab = 'total'">总</span>
            <span :class="{ active: activeTab === 'week' }" @click="activeTab = 'week'">周</span>
            <span :class="{ active: activeTab === 'month' }" @click="activeTab = 'month'">月</span>
          </div>
        </div>
        <div class="rank-list">
          <div v-for="(record, index) in (activeTab === 'total' ? topScores : activeTab === 'week' ? weeklyScores : monthlyScores)" :key="index" class="rank-item">
            <span class="rank-num">{{ index + 1 }}</span>
            <span class="rank-date">{{ new Date(record.date).toLocaleDateString() }}</span>
            <span class="rank-score">{{ record.score }}分</span>
          </div>
          <div v-if="(activeTab === 'total' ? topScores : activeTab === 'week' ? weeklyScores : monthlyScores).length === 0" class="empty-rank">
            暂无记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  padding: 40px 20px;
  background-color: #f0fdf4;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto 40px;
}

.back-btn {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h3 {
  color: #64748b;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.card-header h3 { margin-bottom: 0; }

.high-score {
  font-size: 4rem;
  font-weight: bold;
  color: #f59e0b;
  text-align: center;
}

.medals-list {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.medal {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.3s;
}

.medal.locked {
  opacity: 0.3;
  filter: grayscale(1);
}

.medal-icon { font-size: 3rem; margin-bottom: 8px; }
.medal-name { font-size: 0.9rem; font-weight: bold; }
.medal-target { font-size: 0.7rem; color: #94a3b8; }

.chart-wrapper {
  height: 250px;
}

.tab-group {
  display: flex;
  gap: 10px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.tab-group span {
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 6px;
  color: #64748b;
}

.tab-group span.active {
  background: white;
  color: #0ea5e9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.rank-num {
  width: 24px;
  height: 24px;
  background: #0ea5e9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.rank-date { color: #64748b; font-size: 0.9rem; }
.rank-score { font-weight: bold; color: #1e293b; }

.empty-rank {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}
</style>

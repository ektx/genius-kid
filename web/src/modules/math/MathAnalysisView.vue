<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMathPracticeStore } from '../../store/mathPracticeStore'
import { api } from '../../utils/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const router = useRouter()
const store = useMathPracticeStore()
const loading = ref(true)
const analysisData = ref<any[]>([])

const fetchAnalysisData = async () => {
  try {
    const res: any = await api.get('/math/analysis')
    if (res.success) {
      analysisData.value = res.data.map((row: any) => ({
        ...row,
        settings:
          typeof row.settings === 'string'
            ? JSON.parse(row.settings)
            : row.settings,
        wrong_details:
          typeof row.wrong_details === 'string'
            ? JSON.parse(row.wrong_details)
            : row.wrong_details
      }))
    }
  } catch (err) {
    console.error('Fetch analysis data failed:', err)
    // Fallback to local history if API fails
    analysisData.value = store.history
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalysisData()
})

// 1. 错误率变化曲线数据
const trendChartData = computed(() => {
  const last10 = analysisData.value.slice(-10)
  return {
    labels: last10.map(d =>
      d.date ? new Date(d.date).toLocaleDateString() : ''
    ),
    datasets: [
      {
        label: '错误率 (%)',
        data: last10.map(d => 100 - (d.accuracy || 0)),
        borderColor: '#db2777',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

// 2. 错误题目分布数据 (按运算类型)
const distributionChartData = computed(() => {
  const counts: Record<string, number> = { 加法: 0, 减法: 0, 混合: 0 }

  analysisData.value.forEach(record => {
    if (record && record.wrong_details) {
      record.wrong_details.forEach((w: any) => {
        if (w.display && w.display.includes('+') && w.display.includes('-'))
          counts['混合']++
        else if (w.display && w.display.includes('+')) counts['加法']++
        else if (w.display && w.display.includes('-')) counts['减法']++
      })
    }
  })

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: '错误次数',
        data: Object.values(counts),
        backgroundColor: ['#4a90e2', '#db2777', '#f59e0b']
      }
    ]
  }
})

// 3. 常见错误题目
const topWrongQuestions = computed(() => {
  const questions: Record<
    string,
    { display: string; count: number; correctAnswer: number }
  > = {}

  analysisData.value.forEach(record => {
    if (record && record.wrong_details) {
      record.wrong_details.forEach((w: any) => {
        if (w.display) {
          if (!questions[w.display]) {
            questions[w.display] = {
              display: w.display,
              count: 0,
              correctAnswer: w.correctAnswer
            }
          }
          questions[w.display].count++
        }
      })
    }
  })

  return Object.values(questions)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const exportData = () => {
  if (analysisData.value.length === 0) return

  const mappedData = analysisData.value
    .map(d => {
      if (!d) return null
      return {
        日期: d.date ? new Date(d.date).toLocaleString() : '',
        总题数: d.total_questions || 0,
        错误数: d.wrong_count || 0,
        正确率: `${d.accuracy || 0}%`,
        用时: d.duration || ''
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (mappedData.length === 0) return

  const headers = Object.keys(mappedData[0])
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    '\ufeff' + // Add BOM for Excel
    headers.join(',') +
    '\n' +
    mappedData
      .map(row => headers.map(h => (row as any)[h]).join(','))
      .join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    `math_practice_analysis_${new Date().toISOString().split('T')[0]}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}
</script>

<template>
  <div class="analysis-container">
    <div class="header">
      <button class="back-btn" @click="router.back()">⬅️</button>
      <h1 class="title">📊 练习分析报告</h1>
      <button
        class="export-btn"
        @click="exportData"
        v-if="analysisData.length > 0"
      >
        导出数据
      </button>
    </div>

    <div v-if="loading" class="loading card">加载中...</div>

    <div v-else-if="analysisData.length === 0" class="empty-state card">
      <div class="icon">📈</div>
      <p>暂无练习数据，快去练习吧！</p>
      <button class="primary-btn" @click="router.push('/math/practice')">
        去练习
      </button>
    </div>

    <div v-else class="analysis-content">
      <!-- 趋势图 -->
      <div class="chart-card card">
        <h3>📈 错误率变化趋势 (最近10次)</h3>
        <div class="chart-wrapper">
          <Line :data="trendChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- 分布图 -->
      <div class="chart-card card">
        <h3>🧩 错误题目分布 (按运算类型)</h3>
        <div class="chart-wrapper">
          <Bar :data="distributionChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- 常见错误 -->
      <div class="top-wrong-card card">
        <h3>⚠️ 常见错误题目</h3>
        <div class="wrong-list">
          <div v-for="(q, i) in topWrongQuestions" :key="i" class="wrong-item">
            <div class="q-display">{{ q.display }}</div>
            <div class="q-info">
              <span class="q-ans">正确答案: {{ q.correctAnswer }}</span>
              <span class="q-count">错误 {{ q.count }} 次</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史统计概览 -->
      <div class="stats-overview">
        <div class="stat-box card">
          <span class="label">累计练习</span>
          <span class="value">{{ analysisData.length }} 次</span>
        </div>
        <div class="stat-box card">
          <span class="label">平均正确率</span>
          <span class="value">
            {{
              Math.round(
                analysisData.reduce((acc, curr) => acc + curr.accuracy, 0) /
                  analysisData.length
              )
            }}%
          </span>
        </div>
        <div class="stat-box card">
          <span class="label">累计错题</span>
          <span class="value">
            {{
              analysisData.reduce(
                (acc, curr) => acc + (curr.wrong_count || 0),
                0
              )
            }}
            道
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.title {
  flex: 1;
  font-size: 24px;
  margin: 0;
  color: #2c3e50;
}

.export-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #4a90e2;
  color: #4a90e2;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.chart-card h3,
.top-wrong-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #2c3e50;
  border-left: 4px solid #db2777;
  padding-left: 12px;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrong-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fdf2f8;
  border-radius: 12px;
}

.q-display {
  font-size: 1.2rem;
  font-weight: bold;
  color: #37474f;
}

.q-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.q-ans {
  font-size: 0.9rem;
  color: #059669;
}

.q-count {
  font-size: 0.8rem;
  color: #db2777;
  font-weight: bold;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-box .label {
  font-size: 0.9rem;
  color: #64748b;
}

.stat-box .value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #db2777;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.primary-btn {
  background: #db2777;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>

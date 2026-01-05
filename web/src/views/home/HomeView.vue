<template>
  <div class="home-container">
    <div class="user-info" v-if="authStore.user">
      <span>欢迎, {{ authStore.user.username }}!</span>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
    <h1 class="title">✨ Genius Kid ✨</h1>
    
   
    <div class="footer-btns">
      <button class="secondary-btn" @click="router.push('/pinyin')">✨ 拼音小达人</button>
      <button class="secondary-btn" @click="router.push('/math')">🧮 数学游戏</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
<style scoped>
.user-info {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.logout-btn {
  padding: 4px 12px !important;
  font-size: 0.8rem !important;
  color: #ef4444 !important;
  border-color: #fee2e2 !important;
}

.logout-btn:hover {
  background: #fef2f2 !important;
  border-color: #fca5a5 !important;
}

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background-color: #f0f9ff;
  min-height: 100vh;
}

.title {
  font-size: 3rem;
  color: #0ea5e9;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

button {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  color: #475569;
}

button:hover {
  border-color: #38bdf8;
  color: #0ea5e9;
}

button.active {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.4);
}



.footer-btns {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.secondary-btn, .math-btn {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.5s;
  color: #64748b;
  transition-delay: calc(0.1s * (sibling-index() - 1));
	
  @starting-style {
    opacity: 0;
    translate: 0 2em;
  }
}

.secondary-btn:hover, .math-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}


</style>

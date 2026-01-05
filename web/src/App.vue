<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from './store/authStore';

const authStore = useAuthStore();
const deferredPrompt = ref<any>(null);
const showInstallBtn = ref(false);

onMounted(async () => {
  // 检查登录状态
  if (authStore.token) {
    await authStore.fetchCurrentUser();
  }

  // PWA 安装逻辑
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallBtn.value = true;
  });

  window.addEventListener('appinstalled', () => {
    showInstallBtn.value = false;
    deferredPrompt.value = null;
    console.log('PWA 已安装');
  });
});

const installPWA = async () => {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    showInstallBtn.value = false;
  }
  deferredPrompt.value = null;
};
</script>

<template>
  <div class="app-container">
    <button v-if="showInstallBtn" class="install-pwa-btn" @click="installPWA">
      📥 安装应用到桌面
    </button>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.app-container {
  position: relative;
  min-height: 100vh;
}

.install-pwa-btn {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-5px);}
  60% {transform: translateY(-3px);}
}

body {
  overflow-x: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Common Cartoon Styles */
button {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

button:active {
  transform: scale(0.95);
}
</style>

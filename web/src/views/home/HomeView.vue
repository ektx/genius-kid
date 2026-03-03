<template>
  <div class="home-container">
    <div class="user-info" v-if="authStore.user">
      <span>欢迎, {{ authStore.user.username }}!</span>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
    <h1 class="title">✨ Genius Kid ✨</h1>

    <div class="footer-btns">
      <button class="secondary-btn" @click="router.push('/pinyin')">
        ✨ 拼音小达人
      </button>
      <button class="secondary-btn" @click="router.push('/math')">
        ✈️ 数学大冒险
      </button>
      <button class="secondary-btn" @click="router.push('/math/practice')">
        🎯 数学自由练习
      </button>

      <!-- <input type="text" v-model="codeInner" />

      <button class="secondary-btn" @click="generate">生成</button>

      <img class="code-img" :src="codeSrc" />
      <div id="reader"></div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { Html5Qrcode } from 'html5-qrcode'

import { useAuthStore } from '../../store/authStore'

const router = useRouter()
const authStore = useAuthStore()
const codeInner = ref('123')
const codeSrc = ref('')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 方式1：CDN 用法
function generate() {
  // 最简单一行代码方式
  QRCode.toDataURL(codeInner.value)
    .then(url => {
      console.log(url)
      codeSrc.value = url
    })
    .catch(err => {
      console.error(err)
    })
}

generate()

// Html5Qrcode.getCameras().then(cameras => {
//   console.log('cameras', cameras)
//   const config = { fps: 10, qrbox: { width: 280, height: 280 } }
//   const html5QrCode = new Html5Qrcode('reader')

//   // 启动扫描
//   html5QrCode
//     .start(
//       { facingMode: 'environment' }, // 后置摄像头
//       config,
//       (decodedText, decodedResult) => {
//         // 成功识别

//         // do something when code is read
//         console.log('decodedText', decodedText)
//         console.log('decodedResult', decodedResult)
//         // 可选：识别一次就停止
//         html5QrCode.stop()

//         // 可选：自动跳转
//         // if (decodedText.startsWith("http")) window.location.href = decodedText;
//       },
//       errorMessage => {
//         // 扫描中持续报错（忽略大多数无码情况）
//         // console.log(`扫描中... ${errorMessage}`)
//       }
//     )
//     .catch(err => {
//       alert('启动摄像头失败：' + err)
//     })
// })
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  container-type: inline-size;
}

.title {
  font-size: clamp(1rem, calc(100cqw / 10), 3rem);
  color: #0ea5e9;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

button {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: clamp(1rem, calc(100cqw / 15), 2rem);
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

.secondary-btn,
.math-btn {
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

.secondary-btn:hover,
.math-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.code-img {
  width: 300px;
  height: 300px;
}
</style>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>加入我们</h1>
        <p>创建您的账号开始学习之旅</p>
      </div>

      <form @submit.prevent="handleRegister" class="login-form">
        <!-- 用户名 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper" :class="{ 'error': v$.username.$error }">
            <span class="icon">👤</span>
            <input 
              id="username"
              v-model="form.username" 
              type="text" 
              placeholder="请输入用户名"
              @blur="v$.username.$touch()"
            />
          </div>
          <span v-if="v$.username.$error" class="error-text">
            {{ v$.username.required.$invalid ? '请输入用户名' : (v$.username.minLength.$invalid ? '用户名长度至少为3位' : '') }}
          </span>
        </div>

        <!-- 邮箱 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-wrapper" :class="{ 'error': v$.email.$error }">
            <span class="icon">📧</span>
            <input 
              id="email"
              v-model="form.email" 
              type="email" 
              placeholder="请输入邮箱"
              @blur="v$.email.$touch()"
            />
          </div>
          <span v-if="v$.email.$error" class="error-text">
            {{ v$.email.required.$invalid ? '请输入邮箱' : (v$.email.email.$invalid ? '邮箱格式不正确' : '') }}
          </span>
        </div>

        <!-- 密码 -->
        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper" :class="{ 'error': v$.password.$error }">
            <span class="icon">🔒</span>
            <input 
              id="password"
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="请输入密码"
              @blur="v$.password.$touch()"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="v$.password.$error" class="error-text">
            {{ v$.password.required.$invalid ? '请输入密码' : (v$.password.minLength.$invalid ? '密码长度至少为6位' : '') }}
          </span>
        </div>

        <!-- 注册按钮 -->
        <button 
          type="submit" 
          class="login-btn" 
          :disabled="authStore.loading || v$.$invalid"
        >
          <span v-if="!authStore.loading">立即注册</span>
          <span v-else class="loader"></span>
        </button>

        <!-- 登录链接 -->
        <div class="login-footer">
          已有账号？ 
          <router-link to="/login">立即登录</router-link>
        </div>
      </form>

      <!-- 全局提示 -->
      <div v-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/authStore';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email } from '@vuelidate/validators';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  email: '',
  password: ''
});

const showPassword = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const rules = {
  username: { required, minLength: minLength(3) },
  email: { required, email },
  password: { required, minLength: minLength(6) }
};

const v$ = useVuelidate(rules, form);

const handleRegister = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  errorMessage.value = '';
  successMessage.value = '';
  try {
    await authStore.register(form);
    successMessage.value = '注册成功！即将跳转至登录页面...';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error: any) {
    errorMessage.value = error.error || '注册失败，请稍后再试';
  }
};
</script>

<style scoped>
/* 复用 LoginView 的样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.login-header p {
  color: #666;
  margin-top: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 0 12px;
  transition: border-color 0.3s;
}

.input-wrapper.error {
  border-color: #ff4d4f;
}

.input-wrapper:focus-within {
  border-color: #4a90e2;
}

.input-wrapper .icon {
  margin-right: 10px;
  color: #888;
}

.input-wrapper input {
  border: none;
  outline: none;
  padding: 12px 0;
  flex: 1;
  font-size: 16px;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 18px;
}

.error-text {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn:hover:not(:disabled) {
  background: #357abd;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 600;
}

.alert {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.alert-error {
  background: #fff1f0;
  border: 1px solid #ffa39e;
  color: #cf1322;
}

.alert-success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

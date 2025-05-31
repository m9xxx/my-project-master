<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Агрегатор курсов</h1>
        <p>Войдите в систему или зарегистрируйтесь</p>
      </div>
      
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'login' }]" 
          @click="activeTab = 'login'"
        >
          Вход
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'register' }]" 
          @click="activeTab = 'register'"
        >
          Регистрация
        </button>
      </div>
      
      <!-- Кнопка входа как гость -->
      <div class="guest-section">
        <button @click="handleGuestLogin" class="guest-btn" :disabled="isLoading">
          Войти как гость
        </button>
      </div>
      
      <!-- Форма входа -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <input 
            type="email" 
            id="email" 
            v-model="loginForm.email" 
            required 
            placeholder="yy@yy" 
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            required 
            placeholder="••"
          />
        </div>
        
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="loginForm.remember" />
            <span>Запомнить меня</span>
          </label>
          <a href="#" class="forgot-password">Забыли пароль?</a>
        </div>
        
        <button type="submit" class="auth-btn" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <!-- Форма регистрации -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <input 
            type="text" 
            id="register-name" 
            v-model="registerForm.name" 
            required 
            placeholder="Введите имя" 
          />
        </div>
        
        <div class="form-group">
          <input 
            type="email" 
            id="register-email" 
            v-model="registerForm.email" 
            required 
            placeholder="Введите email" 
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            id="register-password" 
            v-model="registerForm.password" 
            required 
            placeholder="Введите пароль" 
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            id="register-password-confirm" 
            v-model="registerForm.passwordConfirm" 
            required 
            placeholder="Подтвердите пароль" 
          />
        </div>
        
        <button type="submit" class="auth-btn" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'AuthPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const activeTab = ref('login');
    const isLoading = ref(false);
    const errorMessage = ref('');
    
    const loginForm = reactive({
      email: '',
      password: '',
      remember: false
    });
    
    const registerForm = reactive({
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    });
    
    const handleLogin = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = '';
        
        await authStore.login({
          email: loginForm.email,
          password: loginForm.password
        });
        
        // После успешной авторизации перенаправляем на главную
        router.push('/');
      } catch (error) {
        errorMessage.value = error.message || 'Ошибка при входе. Пожалуйста, проверьте данные.';
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleRegister = async () => {
      try {
        // Проверка совпадения паролей
        if (registerForm.password !== registerForm.passwordConfirm) {
          errorMessage.value = 'Пароли не совпадают';
          return;
        }
        
        isLoading.value = true;
        errorMessage.value = '';
        
        await authStore.register({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password
        });
        
        // После успешной регистрации перенаправляем на главную
        router.push('/');
      } catch (error) {
        errorMessage.value = error.message || 'Ошибка при регистрации. Пожалуйста, проверьте данные.';
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleGuestLogin = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = '';
        
        // Проверяем, есть ли метод loginAsGuest в store
        if (typeof authStore.loginAsGuest === 'function') {
          await authStore.loginAsGuest();
        } else {
          // Если метода нет, устанавливаем гостевой режим напрямую
          authStore.isGuest = true;
          authStore.user = null;
        }
        
        // Перенаправляем на главную страницу
        router.push('/');
      } catch (error) {
        errorMessage.value = error.message || 'Ошибка при входе как гость.';
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      activeTab,
      loginForm,
      registerForm,
      isLoading,
      errorMessage,
      handleLogin,
      handleRegister,
      handleGuestLogin
    };
  }
};
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 1.25rem;
}

.auth-card {
  width: 100%;
  max-width: 28rem;
  background-color: white;
  border-radius: 0.625rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
    color: #1f2937;
    margin-bottom: 0.625rem;
  }
  
  p {
    color: #6b7280;
    font-size: 1rem;
  }
}

.auth-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  .tab-btn {
    flex: 1;
    background: none;
    border: none;
    padding: 0.75rem 0;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    color: #6b7280;
    transition: color 0.2s;
    
    &.active {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
    }
    
    &:hover:not(.active) {
      color: #4b5563;
    }
  }
}

.guest-section {
  margin-bottom: 1.5rem;
  
  .guest-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
    
    &:disabled {
      background-color: #93c5fd;
      cursor: not-allowed;
    }
  }
}

.auth-form {
  .form-group {
    margin-bottom: 1.25rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #4b5563;
    }
    
    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.938rem;
      transition: border 0.2s;
      box-sizing: border-box;
      
      &:focus {
        border-color: #2563eb;
        outline: none;
      }
      
      &::placeholder {
        color: #9ca3af;
      }
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    font-size: 0.875rem;
    
    .remember-me {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      input {
        margin-right: 0.5rem;
        width: auto;
      }
    }
    
    .forgot-password {
      color: #2563eb;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.auth-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
  
  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
}

.error-message {
  margin-top: 1.25rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-header {
    h1 {
      font-size: 1.5rem;
    }
  }
}
</style>
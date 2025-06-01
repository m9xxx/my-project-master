<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="container">
        <div class="breadcrumbs">
          <router-link to="/">Главная</router-link> / 
          <span>Профиль</span>
        </div>
      </div>
    </header>
    
    <div class="container">
      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="profile-card">
            <h2 class="profile-name">{{ user?.name || '—' }}</h2>
            <p class="profile-email">{{ user?.email || '—' }}</p>
            <div class="profile-menu">
              <div v-for="(menuItem, index) in menuItems" :key="index" class="menu-item" :class="{ active: activeTab === menuItem.id }" @click="setActiveTab(menuItem.id)">
                <i :class="['fas', menuItem.icon]"></i>
                <span>{{ menuItem.title }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-main">
          <!-- Недавно просмотренные -->
          <div v-if="activeTab === 'recent'" class="tab-content">
            <div class="tab-header">
              <h2>Недавно просмотренные</h2>
            </div>
            <div class="courses-list">
              <div v-if="recentlyViewedCourses.length === 0" class="empty-state">
                <i class="fas fa-history"></i>
                <p>Вы ещё не просматривали курсы</p>
                <router-link to="/courses" class="btn btn-primary">Найти курсы</router-link>
              </div>
              <div v-for="(course, index) in recentlyViewedCourses" :key="index" class="course-card">
                <div class="course-image">
                  <img :src="course.image" alt="Course preview">
                </div>
                <div class="course-info">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <div class="course-meta">
                    <span class="author">{{ course.author }}</span>
                  </div>
                  <div class="course-actions">
                    <router-link :to="'/course/' + course.id" class="btn btn-primary">Открыть</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Избранное -->
          <div v-if="activeTab === 'favorites'" class="tab-content">
            <div class="tab-header">
              <h2>Избранное</h2>
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Поиск в избранном" v-model="favoritesSearchQuery">
              </div>
            </div>
            <div class="favorites-list">
              <div v-if="filteredFavorites.length === 0" class="empty-state">
                <i class="fas fa-heart"></i>
                <p>В избранном пока ничего нет</p>
                <router-link to="/" class="btn btn-primary">Найти курсы</router-link>
              </div>
              <div v-for="course in filteredFavorites" :key="course.id" class="course-card">
                <button
                  class="favorite-btn"
                  @click="removeFromFavorites(course.id)"
                  aria-label="Убрать из избранного"
                >
                  <i class="fas fa-heart" style="color: #ef4444;"></i>
                </button>
                <div class="course-platform">{{ course.platform }}</div>
                <div class="course-info">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <div class="course-meta">
                    <span class="course-rating">
                      <span class="stars">★★★★★</span>
                      <span class="rating-value">{{ course.rating }}</span>
                    </span>
                    <span class="course-students">{{ formatStudentCount(course.reviewsCount) }} отзывов</span>
                  </div>
                  <div class="course-price" :class="{ 'free': course.price === 0 }">
                    {{ course.price === 0 ? 'Бесплатно' : `${course.price} ₽` }}
                  </div>
                  <a :href="course.url" target="_blank" class="btn btn-primary">Перейти к курсу</a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Подборки -->
          <div v-if="activeTab === 'collections'" class="tab-content">
            <div class="tab-header">
              <h2>Подборки</h2>
            </div>
            <div class="empty-state">
              <i class="fas fa-layer-group"></i>
              <p>Здесь появятся ваши подборки курсов</p>
            </div>
          </div>
          
          <!-- Настройки -->
          <div v-if="activeTab === 'settings'" class="tab-content">
            <div class="tab-header">
              <h2>Настройки профиля</h2>
            </div>
            <form class="settings-form">
              <div class="form-section">
                <h3>Основные настройки</h3>
                <div class="form-group" :class="{ 'has-error': profileErrors.nickname }">
                  <label for="nickname">Отображаемое имя <span class="required">*</span></label>
                  <input 
                    type="text" 
                    id="nickname" 
                    v-model="profileForm.nickname" 
                    placeholder="Как вас будут видеть другие пользователи"
                    required
                    @input="clearProfileError('nickname')"
                  >
                  <span class="error-message" v-if="profileErrors.nickname">{{ profileErrors.nickname }}</span>
                </div>
                <div class="form-group" :class="{ 'has-error': profileErrors.email }">
                  <label for="email">Email <span class="required">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="profileForm.email" 
                    required
                    @input="clearProfileError('email')"
                  >
                  <span class="error-message" v-if="profileErrors.email">{{ profileErrors.email }}</span>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-primary" @click="updateProfile">Сохранить профиль</button>
                  <button type="button" class="btn btn-outline" @click="resetProfileForm">Отменить</button>
                </div>
              </div>
              
              <div class="form-section">
                <h3>Изменение пароля</h3>
                <div class="form-group">
                  <label for="currentPassword">Текущий пароль</label>
                  <input 
                    type="password" 
                    id="currentPassword" 
                    v-model="passwordForm.currentPassword"
                    placeholder="Введите текущий пароль"
                  >
                </div>
                <div class="form-group">
                  <label for="newPassword">Новый пароль</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    v-model="passwordForm.newPassword"
                    placeholder="Введите новый пароль"
                  >
                </div>
                <div class="form-group">
                  <label for="confirmPassword">Подтвердите пароль</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    v-model="passwordForm.confirmPassword"
                    placeholder="Подтвердите новый пароль"
                  >
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-primary" @click="updatePassword">Изменить пароль</button>
                  <button type="button" class="btn btn-outline" @click="resetPasswordForm">Отменить</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import http from '@/services/http';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';

export default {
  name: 'ProfilePage',
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);
    const toast = useToast();
    
    // Разделяем формы на две
    const profileForm = ref({
      nickname: user.value?.name || '',
      email: user.value?.email || ''
    });

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const favoritesSearchQuery = ref('');
    const favorites = ref([]);
    const activeTab = ref('recent');
    const recentlyViewedCourses = ref([]);

    const profileErrors = ref({
      nickname: '',
      email: ''
    });

    const clearProfileError = (field) => {
      profileErrors.value[field] = '';
    };

    const validateProfileForm = () => {
      let isValid = true;
      profileErrors.value = {
        nickname: '',
        email: ''
      };

      if (!profileForm.value.nickname.trim()) {
        profileErrors.value.nickname = 'Отображаемое имя обязательно для заполнения';
        isValid = false;
      }

      if (!profileForm.value.email.trim()) {
        profileErrors.value.email = 'Email обязателен для заполнения';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
        profileErrors.value.email = 'Введите корректный email адрес';
        isValid = false;
      }

      return isValid;
    };

    const menuItems = [
      { id: 'recent', title: 'Недавно просмотренные', icon: 'fa-history' },
      { id: 'favorites', title: 'Избранное', icon: 'fa-heart' },
      { id: 'collections', title: 'Подборки', icon: 'fa-layer-group' },
      { id: 'settings', title: 'Настройки', icon: 'fa-cog' }
    ];

    const formatStudentCount = (count) => {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
      } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
      }
      return count;
    };

    const fetchFavorites = async () => {
      if (!user.value?.id) return;
      try {
        const res = await fetch(`http://localhost/stepik_parser_test/public/api/v1/favorites?user_id=${user.value.id}`);
        const data = await res.json();
        favorites.value = data.favorites || [];
      } catch (e) {
        console.error('Error fetching favorites:', e);
        favorites.value = [];
      }
    };

    const removeFromFavorites = async (courseId) => {
      if (!user.value?.id) return;

      // Оптимистичное обновление UI
      const originalFavorites = [...favorites.value];
      favorites.value = favorites.value.filter(fav => Number(fav.id) !== Number(courseId));

      try {
        const response = await fetch('http://localhost/stepik_parser_test/public/api/v1/favorites/remove', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            user_id: user.value.id, 
            course_id: courseId 
          })
        });

        const data = await response.json();
        
        if (!data.success) {
          // Если ошибка - возвращаем как было
          favorites.value = originalFavorites;
          console.error('Failed to remove from favorites:', data.error);
        }
      } catch (e) {
        // При ошибке сети - тоже возвращаем
        favorites.value = originalFavorites;
        console.error('Network error:', e);
      }
    };

    const filteredFavorites = computed(() => {
      if (!favoritesSearchQuery.value.trim()) {
        return favorites.value;
      }
      const query = favoritesSearchQuery.value.toLowerCase();
      return favorites.value.filter(
        course => course.title.toLowerCase().includes(query) ||
                 course.platform.toLowerCase().includes(query)
      );
    });

    const setActiveTab = (tabId) => {
      activeTab.value = tabId;
    };

    // Отдельные методы сброса для каждой формы
    const resetProfileForm = () => {
      profileForm.value = {
        nickname: user.value?.name || '',
        email: user.value?.email || ''
      };
    };

    const resetPasswordForm = () => {
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    };

    // Отдельный метод для обновления профиля
    const updateProfile = async () => {
      if (!validateProfileForm()) {
        toast.error('Пожалуйста, заполните все обязательные поля');
        return;
      }

      try {
        if (profileForm.value.nickname !== user.value?.name || 
            profileForm.value.email !== user.value?.email) {
          const profileResponse = await fetch('http://localhost/stepik_parser_test/public/api/v1/user/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              nickname: profileForm.value.nickname,
              email: profileForm.value.email
            })
          });
          
          const profileData = await profileResponse.json();
          if (profileData.success) {
            user.value.name = profileForm.value.nickname;
            user.value.email = profileForm.value.email;
            toast.success('Профиль успешно обновлен');
          } else {
            if (profileData.errors) {
              // Обработка ошибок валидации с сервера
              Object.keys(profileData.errors).forEach(field => {
                profileErrors.value[field] = profileData.errors[field][0];
              });
              toast.error('Пожалуйста, исправьте ошибки в форме');
            } else {
              toast.error(profileData.message || 'Ошибка при обновлении профиля');
            }
          }
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Произошла ошибка при обновлении профиля');
      }
    };

    // Отдельный метод для обновления пароля
    const updatePassword = async () => {
      try {
        // Проверяем наличие всех полей
        if (!passwordForm.value.currentPassword || 
            !passwordForm.value.newPassword || 
            !passwordForm.value.confirmPassword) {
          toast.error('Заполните все поля для смены пароля');
          return;
        }

        // Проверяем совпадение паролей
        if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
          toast.error('Новый пароль и подтверждение не совпадают');
          return;
        }

        const passwordResponse = await fetch('http://localhost/stepik_parser_test/public/api/v1/user/password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            current_password: passwordForm.value.currentPassword,
            new_password: passwordForm.value.newPassword,
            confirm_password: passwordForm.value.confirmPassword
          })
        });
        
        const passwordData = await passwordResponse.json();
        if (passwordData.success) {
          resetPasswordForm(); // Очищаем форму при успехе
          toast.success('Пароль успешно изменен');
        } else {
          toast.error(passwordData.message || 'Ошибка при смене пароля');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        toast.error('Произошла ошибка при смене пароля');
      }
    };

    onMounted(() => {
      fetchFavorites();
      const tabFromUrl = route.query.tab;
      if (tabFromUrl && ['recent', 'favorites', 'collections', 'settings'].includes(tabFromUrl)) {
        activeTab.value = tabFromUrl;
      }
    });

    return {
      user,
      activeTab,
      menuItems,
      favoritesSearchQuery,
      filteredFavorites,
      recentlyViewedCourses,
      setActiveTab,
      removeFromFavorites,
      formatStudentCount,
      updateProfile,
      updatePassword,
      resetProfileForm,
      resetPasswordForm,
      profileForm,
      passwordForm,
      profileErrors,
      clearProfileError
    };
  }
};
</script>

<style scoped>
.profile-page {
  font-family: 'Roboto', sans-serif;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-header {
  background-color: #f5f7fa;
  padding: 30px 0;
  margin-bottom: 30px;
}

.breadcrumbs {
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumbs a {
  color: #4a90e2;
  text-decoration: none;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 30px;
}

/* Sidebar */
.profile-sidebar {
  position: sticky;
  top: 20px;
}

.profile-card {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow: hidden;
  padding: 20px;
  background-color: #fff;
}

.profile-avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4a90e2;
  border: 3px solid #fff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profile-name {
  text-align: center;
  margin: 0 0 5px 0;
  font-size: 22px;
}

.profile-email {
  text-align: center;
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e4e8;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #4a90e2;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.profile-menu {
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #f0f7ff;
}

.menu-item.active {
  background-color: #e6f0fd;
  color: #4a90e2;
}

.menu-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #4a90e2;
  color: #4a90e2;
}

.btn-primary:hover {
  background-color: #3a7bc8;
}

.btn-outline:hover {
  background-color: #f0f7ff;
}

.btn-block {
  display: block;
  width: 100%;
}

.btn i {
  margin-right: 8px;
}

/* Main Content */
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h2 {
  margin: 0;
  font-size: 24px;
}

.tab-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-options {
  display: flex;
  gap: 10px;
}

.filter-option {
  padding: 6px 15px;
  border-radius: 20px;
  background-color: #f0f0f0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-option.active {
  background-color: #4a90e2;
  color: white;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  padding: 8px 10px 8px 35px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  width: 250px;
}

/* Courses List */
.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-card {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.course-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.course-image {
  position: relative;
  height: 160px;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.in-progress {
  background-color: #ffc107;
  color: #fff;
}

.completed {
  background-color: #4caf50;
  color: #fff;
}

.course-info {
  padding: 15px;
}

.course-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  line-height: 1.3;
}

.course-meta {
  margin-bottom: 15px;
}

.author {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex-grow: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4a90e2;
}

.progress-text {
  font-size: 14px;
  color: #666;
}

.course-actions {
  display: flex;
  gap: 10px;
}

/* Favorites List */
.favorites-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.course-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .course-platform {
    position: absolute;
    bottom: 10%;
    right: 0%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 2;
  }
  
  .course-info {
    padding: 15px;
    
    .course-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #1f2937;
    }
    
    .course-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      
      .course-rating {
        display: flex;
        align-items: center;
        
        .stars {
          color: #f59e0b;
          margin-right: 5px;
        }
        
        .rating-value {
          color: #4b5563;
        }
      }
    }
    
    .course-price {
      font-weight: 600;
      font-size: 16px;
      color: #111827;
      margin-bottom: 15px;
      
      &.free {
        color: #059669;
      }
    }
  }
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
}

/* Certificates List */
.certificates-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.certificate-card {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.certificate-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.certificate-preview {
  position: relative;
}

.certificate-preview img {
  width: 100%;
  display: block;
}

.certificate-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.certificate-card:hover .certificate-overlay {
  opacity: 1;
}

.certificate-info {
  padding: 15px;
}

.certificate-title {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.certificate-date {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* Settings Form */
.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e4e8;
  margin-top: 0;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-check input[type="checkbox"] {
  margin-right: 10px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.empty-state i {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 15px;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.empty-state-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr 2fr;
  }
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    position: static;
  }
  
  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .courses-list,
  .favorites-list,
  .certificates-list {
    grid-template-columns: 1fr;
  }
}

.form-group.has-error input {
  border-color: #ef4444;
  background-color: #fff5f5;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}
</style>
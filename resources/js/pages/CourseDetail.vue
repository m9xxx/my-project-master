<template>
  <div class="course-detail">
    <header class="course-header">
      <div class="container">
        <div class="breadcrumbs">
          <router-link to="/">Главная</router-link> / 
          <router-link to="/courses">Курсы</router-link> / 
          <span>{{ course.title }}</span>
        </div>
        
        <div class="course-main-info">
          <h1>{{ course.title }}</h1>
          <div class="course-meta">
            <span class="rating">
              <i class="fas fa-star"></i> {{ course.rating }} ({{ course.reviewsCount }} отзывов)
            </span>
            <span class="students">
              <i class="fas fa-user"></i> {{ course.studentsCount }} учащихся
            </span>
            <span class="duration">
              <i class="fas fa-clock"></i> {{ course.duration }}
            </span>
          </div>
          
          <div class="course-author">
            <img :src="course.author.avatar" alt="Author avatar" class="author-avatar">
            <span>Автор: {{ course.author.name }}</span>
          </div>
          
          <div class="course-tags">
            <span v-for="(tag, index) in course.tags" :key="index" class="tag">{{ tag }}</span>
          </div>
          
          <div class="course-actions">
            <button class="btn btn-primary">Записаться на курс</button>
            <button class="btn btn-outline" @click="toggleFavorite">
              <i :class="['fas', isFavorite ? 'fa-heart' : 'fa-heart-o']"></i> 
              {{ isFavorite ? 'В избранном' : 'Добавить в избранное' }}
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <div class="container">
      <div class="course-content">
        <div class="course-description">
          <h2>О курсе</h2>
          <p>{{ course.description }}</p>
          
          <h2>Чему вы научитесь</h2>
          <ul class="learning-objectives">
            <li v-for="(objective, index) in course.learningObjectives" :key="index">
              <i class="fas fa-check"></i> {{ objective }}
            </li>
          </ul>
          
          <h2>Программа курса</h2>
          <div class="course-modules">
            <div v-for="(module, index) in course.modules" :key="index" class="module">
              <div class="module-header" @click="toggleModule(index)">
                <h3>{{ module.title }}</h3>
                <span class="module-lessons">{{ module.lessons.length }} уроков • {{ module.duration }}</span>
                <i :class="['fas', expandedModules.includes(index) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </div>
              
              <div v-if="expandedModules.includes(index)" class="module-lessons">
                <div v-for="(lesson, lessonIndex) in module.lessons" :key="lessonIndex" class="lesson">
                  <i class="fas fa-play-circle"></i>
                  <span class="lesson-title">{{ lesson.title }}</span>
                  <span class="lesson-duration">{{ lesson.duration }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <h2>Отзывы</h2>
          <div class="course-reviews">
            <div v-for="(review, index) in course.reviews" :key="index" class="review">
              <div class="review-header">
                <img :src="review.user.avatar" alt="User avatar" class="review-avatar">
                <div class="review-meta">
                  <h4>{{ review.user.name }}</h4>
                  <div class="review-rating">
                    <i v-for="i in 5" :key="i" :class="['fas', 'fa-star', i <= review.rating ? 'active' : '']"></i>
                  </div>
                  <span class="review-date">{{ review.date }}</span>
                </div>
              </div>
              <p class="review-text">{{ review.text }}</p>
            </div>
          </div>
        </div>
        
        <div class="course-sidebar">
          <div class="course-card">
            <div class="course-video">
              <img :src="course.previewImage" alt="Course preview" class="preview-image">
              <div class="play-button">
                <i class="fas fa-play"></i>
              </div>
            </div>
            
            <div class="course-price">
              <span class="current-price">{{ course.price }} ₽</span>
              <span v-if="course.originalPrice" class="original-price">{{ course.originalPrice }} ₽</span>
            </div>
            
            <button class="btn btn-primary btn-block">Записаться на курс</button>
            
            <div class="course-features">
              <div class="feature">
                <i class="fas fa-calendar"></i>
                <span>Доступ: {{ course.accessPeriod }}</span>
              </div>
              <div class="feature">
                <i class="fas fa-certificate"></i>
                <span>{{ course.certificate ? 'Сертификат по окончании' : 'Без сертификата' }}</span>
              </div>
              <div class="feature">
                <i class="fas fa-graduation-cap"></i>
                <span>{{ course.level }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseDetail',
  data() {
    return {
      isFavorite: false,
      expandedModules: [0], // По умолчанию открыт первый модуль
      course: {
        id: 1,
        title: 'Полное руководство по Vue.js',
        rating: 4.8,
        reviewsCount: 256,
        studentsCount: 1240,
        duration: '24 часа',
        description: 'Этот курс научит вас всему необходимому для создания современных веб-приложений с использованием Vue.js. От основ до продвинутых техник, вы изучите все аспекты этого популярного фреймворка.',
        learningObjectives: [
          'Понимание основ Vue.js и реактивности',
          'Работа с компонентами и их жизненным циклом',
          'Управление состоянием с помощью Vuex',
          'Маршрутизация с Vue Router',
          'Работа с API и асинхронными запросами',
          'Оптимизация производительности приложения'
        ],
        price: '5 990',
        originalPrice: '7 990',
        accessPeriod: '6 месяцев',
        certificate: true,
        level: 'Средний уровень',
        previewImage: '/resources/images/course-preview.jpg',
        author: {
          name: 'Иван Петров',
          avatar: '/resources/images/author-avatar.jpg'
        },
        tags: ['Vue.js', 'Frontend', 'JavaScript', 'SPA'],
        modules: [
          {
            title: 'Введение в Vue.js',
            duration: '3 часа',
            lessons: [
              { title: 'Что такое Vue.js', duration: '15 минут' },
              { title: 'Установка и настройка окружения', duration: '25 минут' },
              { title: 'Первое приложение на Vue', duration: '30 минут' },
              { title: 'Работа с директивами', duration: '45 минут' },
              { title: 'Обработка событий', duration: '35 минут' }
            ]
          },
          {
            title: 'Компоненты Vue',
            duration: '4 часа',
            lessons: [
              { title: 'Основы компонентов', duration: '40 минут' },
              { title: 'Передача данных между компонентами', duration: '45 минут' },
              { title: 'Слоты и скопы', duration: '30 минут' },
              { title: 'Динамические компоненты', duration: '35 минут' },
              { title: 'Асинхронные компоненты', duration: '40 минут' }
            ]
          },
          {
            title: 'Vuex и управление состоянием',
            duration: '5 часов',
            lessons: [
              { title: 'Введение в Vuex', duration: '30 минут' },
              { title: 'State и Getters', duration: '45 минут' },
              { title: 'Mutations и Actions', duration: '50 минут' },
              { title: 'Модули и пространства имен', duration: '35 минут' },
              { title: 'Продвинутые техники Vuex', duration: '60 минут' }
            ]
          }
        ],
        reviews: [
          {
            user: {
              name: 'Мария С.',
              avatar: '/resources/images/user1-avatar.jpg'
            },
            rating: 5,
            date: '15.04.2025',
            text: 'Отличный курс! Все объяснено очень подробно и понятно. После прохождения смогла с уверенностью создать свое первое приложение на Vue.'
          },
          {
            user: {
              name: 'Алексей К.',
              avatar: '/resources/images/user2-avatar.jpg'
            },
            rating: 4,
            date: '02.03.2025',
            text: 'Хороший курс, много полезной информации. Единственное, хотелось бы больше практических заданий.'
          }
        ]
      }
    };
  },
  methods: {
    toggleFavorite() {
      this.isFavorite = !this.isFavorite;
      // В реальном приложении здесь был бы запрос к API
    },
    toggleModule(index) {
      if (this.expandedModules.includes(index)) {
        this.expandedModules = this.expandedModules.filter(i => i !== index);
      } else {
        this.expandedModules.push(index);
      }
    }
  }
};
</script>

<style scoped>
.course-detail {
  font-family: 'Roboto', sans-serif;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.course-header {
  background-color: #f5f7fa;
  padding: 40px 0;
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

.course-main-info h1 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 32px;
}

.course-meta {
  display: flex;
  margin-bottom: 20px;
}

.course-meta span {
  margin-right: 20px;
  display: flex;
  align-items: center;
}

.course-meta i {
  margin-right: 5px;
  color: #ffc107;
}

.course-author {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.course-tags {
  margin-bottom: 20px;
}

.tag {
  display: inline-block;
  background-color: #e9ecef;
  padding: 5px 10px;
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 5px;
  font-size: 14px;
}

.course-actions {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
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

.course-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.course-description h2 {
  font-size: 24px;
  margin-top: 30px;
  margin-bottom: 20px;
}

.learning-objectives {
  list-style: none;
  padding: 0;
}

.learning-objectives li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.learning-objectives i {
  color: #4caf50;
  margin-right: 10px;
  margin-top: 4px;
}

.course-modules {
  margin-bottom: 30px;
}

.module {
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  margin-bottom: 15px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  background-color: #f8f9fa;
}

.module-header h3 {
  margin: 0;
  font-size: 18px;
}

.module-lessons {
  padding: 15px 20px;
  border-top: 1px solid #e1e4e8;
}

.lesson {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.lesson:last-child {
  border-bottom: none;
}

.lesson i {
  color: #4a90e2;
  margin-right: 10px;
}

.lesson-title {
  flex-grow: 1;
}

.lesson-duration {
  color: #666;
  font-size: 14px;
}

.course-reviews {
  margin-top: 20px;
}

.review {
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.review:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  margin-bottom: 10px;
}

.review-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.review-meta h4 {
  margin: 0 0 5px 0;
}

.review-rating i {
  color: #ffc107;
  margin-right: 2px;
}

.review-rating i:not(.active) {
  color: #e1e4e8;
}

.review-date {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}

.course-sidebar {
  position: sticky;
  top: 20px;
}

.course-card {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow: hidden;
}

.course-video {
  position: relative;
  height: 200px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.play-button i {
  color: #4a90e2;
  font-size: 24px;
}

.course-price {
  padding: 20px;
  display: flex;
  align-items: center;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  margin-right: 15px;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
}

.btn-block {
  display: block;
  width: calc(100% - 40px);
  margin: 0 20px 20px 20px;
}

.course-features {
  padding: 0 20px 20px 20px;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.feature i {
  margin-right: 10px;
  color: #666;
}

/* Медиа-запросы для адаптивности */
@media (max-width: 768px) {
  .course-content {
    grid-template-columns: 1fr;
  }
  
  .course-sidebar {
    margin-top: 30px;
    position: static;
  }
}
</style>
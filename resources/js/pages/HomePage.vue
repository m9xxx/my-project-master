<template>
  <div class="home-container">
    <!-- Оверлей и расширенная карточка -->
    <div v-if="selectedCourse" class="overlay" @click.self="closeExpanded">
      <div class="expanded-card">
        <h3 class="expanded-title">{{ selectedCourse.title }}</h3>
        <p class="expanded-description">{{ selectedCourse.description }}</p>
        <a :href="selectedCourse.url" class="expanded-link" target="_blank">Перейти к курсу</a>
        <div class="expanded-meta">
          <span class="expanded-rating">Рейтинг: {{ selectedCourse.rating }}</span>
          <span class="expanded-price" :class="{ 'free': selectedCourse.price === 0 }">
            {{ selectedCourse.price === 0 ? 'Бесплатно' : `${selectedCourse.price} ₽` }}
          </span>
        </div>
        <button class="close-btn" @click="closeExpanded">×</button>
      </div>
    </div>

    <!-- Верхний баннер -->
    <section class="hero-banner">
      <div class="hero-content">
        <h1>Агрегатор образовательных курсов</h1>
        <p>Найдите идеальный курс для вашего профессионального развития</p>
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Что вы хотите изучать?" 
            @keyup.enter="searchCourses"
          />
          <button @click="searchCourses">Поиск</button>
        </div>
      </div>
    </section>

    <!-- Популярные курсы -->
    <section class="featured-courses">
      <div class="section-header">
        <h2>Популярные курсы</h2>
        <span class="view-all">Смотреть все</span>
      </div>
      
      <div class="courses-carousel">
        <div 
          v-for="course in courses" 
          :key="course.id" 
          class="course-card"
          @click="expandCourse(course)"
          style="position: relative;"
        >
          <!-- Кнопка избранного -->
          <button
            class="favorite-btn"
            @click.stop="isFavorite(course.id) ? removeFromFavorites(course.id) : addToFavorites(course.id)"
            :aria-label="isFavorite(course.id) ? 'Убрать из избранного' : 'В избранное'"
          >
            <i :class="[isFavorite(course.id) ? 'fas' : 'far', 'fa-heart']" :style="{ color: isFavorite(course.id) ? '#ef4444' : '#aaa' }"></i>
          </button>

          <!-- Добавляем компонент выпадающего списка подборок -->
          <PlaylistDropdown 
            v-if="user"
            :course-id="course.id"
            @click.stop
          />

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
          </div>
        </div>
      </div>
    </section>

    <!-- Статистика платформы -->
    
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import http from '@/services/http';
import { useAuthStore } from '@/store/auth';
import PlaylistDropdown from '@/components/PlaylistDropdown.vue';

export default {
  name: 'HomePage',
  components: {
    PlaylistDropdown
  },
  setup() {
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);

    const searchQuery = ref('');
    const selectedCourse = ref(null);
    const courses = ref([]);
    const favorites = ref([]);
    const popularCategories = ref([
      { id: 1, name: 'Программирование', icon: 'fa-code', coursesCount: 1245 },
      { id: 6, name: 'Наука о данных', icon: 'fa-chart-bar', coursesCount: 856 },
      { id: 2, name: 'Дизайн', icon: 'fa-palette', coursesCount: 932 },
      { id: 3, name: 'Маркетинг', icon: 'fa-bullhorn', coursesCount: 712 },
      { id: 4, name: 'Бизнес', icon: 'fa-briefcase', coursesCount: 645 },
      { id: 5, name: 'Иностранные языки', icon: 'fa-language', coursesCount: 532 },
    ]);

    const formatStudentCount = (count) => {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
      } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
      }
      return count;
    };

    const searchCourses = () => {
      console.log('Поиск курсов:', searchQuery.value);
    };

    // --- Избранное ---
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

    const isFavorite = (courseId) => {
      return favorites.value.some(fav => Number(fav.id) === Number(courseId));
    };

    const addToFavorites = async (courseId) => {
      if (!user.value?.id) return;

      // Оптимистичное обновление UI
      favorites.value.push({ id: courseId });
    
      try {
        const response = await fetch('http://localhost/stepik_parser_test/public/api/v1/favorites/add', {
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
          // Если ошибка - откатываем оптимистичное обновление
          favorites.value = favorites.value.filter(fav => Number(fav.id) !== Number(courseId));
          console.error('Failed to add to favorites:', data.error);
        }
      } catch (e) {
        // При ошибке сети - тоже откатываем
        favorites.value = favorites.value.filter(fav => Number(fav.id) !== Number(courseId));
        console.error('Network error:', e);
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

    const expandCourse = (course) => {
      selectedCourse.value = course;
      // Сохраняем курс в историю просмотров
      if (user.value?.id) {
        const storageKey = `recently_viewed_${user.value.id}`;
        let recentlyViewed = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Удаляем курс из истории, если он там уже есть
        recentlyViewed = recentlyViewed.filter(item => item.id !== course.id);
        
        // Добавляем курс в начало массива
        recentlyViewed.unshift({
          id: course.id,
          title: course.title,
          rating: course.rating,
          reviewsCount: course.reviewsCount,
          price: course.price,
          url: course.url,
          description: course.description,
          platform: course.platform
        });
        
        // Ограничиваем список 20 последними курсами
        recentlyViewed = recentlyViewed.slice(0, 20);
        
        localStorage.setItem(storageKey, JSON.stringify(recentlyViewed));
      }
    };
    const closeExpanded = () => {
      selectedCourse.value = null;
    };

    // Загрузка курсов с API
    const fetchCourses = async () => {
      try {
        const response = await http.get('http://localhost/stepik_parser_test/public/api/v1/courses');
        // Если API возвращает массив напрямую
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        courses.value = data.map(item => ({
          id: item.id,
          title: item.title,
          rating: Number(item.rating),
          reviewsCount: item.additional_data?.review_count ?? 0,
          price: item.additional_data?.price === "Бесплатно" ? 0 : item.additional_data?.price,
          url: item.url,
          description: item.description,
          source: item.source,
          platform: item.additional_data?.platform_name || item.source,
        }));
      } catch (e) {
        courses.value = [];
        // Можно добавить обработку ошибки
      }
    };

    onMounted(() => {
      fetchCourses();
      fetchFavorites();
    });

    return {
      searchQuery,
      popularCategories,
      courses,
      formatStudentCount,
      searchCourses,
      selectedCourse,
      expandCourse,
      closeExpanded,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      user
    };
  }
};
</script>

<style lang="scss" scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expanded-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  padding: 32px 32px 24px 32px;
  max-width: 420px;
  width: 90vw;
  position: relative;
  animation: expandIn 0.25s cubic-bezier(0.4,0,0.2,1);
}

@keyframes expandIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.expanded-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
}
.expanded-description {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1.2rem;
}
.expanded-link {
  display: inline-block;
  margin-bottom: 1.2rem;
  color: #2563eb;
  text-decoration: underline;
  font-weight: 500;
}
.expanded-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.2rem;
}
.expanded-rating {
  color: #f59e0b;
  font-weight: 600;
}
.expanded-price {
  font-weight: 600;
  font-size: 1.1rem;
  color: #111827;
}
.expanded-price.free {
  color: #059669;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #111827;
}

.hero-banner {
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 10px;
  padding: 60px 40px;
  margin: 20px 0 40px;
  color: white;
  text-align: center;
  
  h1 {
    font-size: 32px;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 18px;
    margin-bottom: 30px;
    opacity: 0.9;
  }
  
  .search-bar {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    
    input {
      flex: 1;
      padding: 15px 20px;
      border-radius: 6px 0 0 6px;
      border: none;
      font-size: 16px;
      
      &:focus {
        outline: none;
      }
    }
    
    button {
      padding: 15px 30px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 0 6px 6px 0;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
      
      &:hover {
        background: #1e3a8a;
      }
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  
  h2 {
    font-size: 24px;
    color: #1f2937;
  }
  
  .view-all {
    color: #2563eb;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.categories-section {
  margin-bottom: 50px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  
  .category-card {
    background: #f9fafb;
    border-radius: 8px;
    padding: 25px 15px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
    }
    
    .category-icon {
      font-size: 32px;
      color: #3b82f6;
      margin-bottom: 15px;
    }
    
    h3 {
      font-size: 16px;
      margin-bottom: 10px;
      color: #1f2937;
    }
    
    p {
      font-size: 14px;
      color: #6b7280;
    }
  }
}

.featured-courses {
  margin-bottom: 50px;
}

.courses-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  
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
        
        &.free {
          color: #059669;
        }
      }
    }
  }
}

.platform-stats {
  display: flex;
  justify-content: space-between;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 60px;
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 16px;
      color: #4b5563;
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
}
.favorite-btn:hover {
  background: #f3f4f6;
}

@media (max-width: 768px) {
  .hero-banner {
    padding: 40px 20px;
    
    h1 {
      font-size: 26px;
    }
    
    p {
      font-size: 16px;
    }
  }
  
  .platform-stats {
    flex-wrap: wrap;
    gap: 20px;
    
    .stat-item {
      width: 45%;
    }
  }
}
</style> 
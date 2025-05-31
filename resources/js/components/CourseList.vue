<template>
  <div class="course-list">
    <!-- Поиск -->
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        @input="handleSearch"
        placeholder="Поиск курсов..."
        class="search-input"
      />
    </div>

    <!-- Загрузка -->
    <div v-if="courseStore.loading" class="loading">
      Загрузка курсов...
    </div>

    <!-- Ошибка -->
    <div v-else-if="courseStore.error" class="error">
      {{ courseStore.error }}
    </div>

    <!-- Список курсов -->
    <div v-else class="courses-grid">
      <div v-for="course in filteredCourses" 
           :key="course.id" 
           class="course-card">
        <div class="course-info">
          <h3 class="course-title">{{ course.title }}</h3>
          <p class="course-description">{{ course.description }}</p>
          <div class="course-meta">
            <div class="course-price-rating">
              <span class="course-price">{{ formatPrice(course.price) }}</span>
              <div class="rating">
                <span class="stars">★ {{ course.rating.toFixed(1) }}</span>
                <span class="rating-count">({{ course.rating_count }})</span>
              </div>
            </div>
            <span class="course-platform">{{ course.platform }}</span>
          </div>
          <a :href="course.url" target="_blank" class="enroll-button">
            Перейти к курсу
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/store/courses';
import debounce from 'lodash/debounce';

export default {
  name: 'CourseList',
  
  props: {
    filterPlatform: {
      type: String,
      default: null
    }
  },
  
  setup(props) {
    const router = useRouter();
    const courseStore = useCourseStore();
    const searchQuery = ref('');

    // Фильтрованный список курсов
    const filteredCourses = computed(() => {
      let courses = courseStore.courses;
      
      // Фильтрация по платформе
      if (props.filterPlatform) {
        courses = courses.filter(course => course.platform === props.filterPlatform);
      }
      
      // Фильтрация по поисковому запросу
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        courses = courses.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.platform.toLowerCase().includes(query)
        );
      }
      
      return courses;
    });

    // Загрузка курсов при монтировании компонента
    onMounted(async () => {
      try {
        await courseStore.fetchCourses();
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    });

    // Дебаунс поиска для предотвращения частых запросов
    const handleSearch = debounce(async () => {
      if (searchQuery.value.trim()) {
        await courseStore.searchCourses(searchQuery.value);
      } else {
        await courseStore.fetchCourses();
      }
    }, 300);

    const navigateToCourse = (courseId) => {
      router.push(`/course/${courseId}`);
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(price);
    };

    return {
      courseStore,
      searchQuery,
      handleSearch,
      navigateToCourse,
      formatPrice,
      filteredCourses
    };
  }
};
</script>

<style lang="scss" scoped>
.course-list {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  
  .search-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: #2563eb;
    }
  }
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #dc2626;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  padding: 20px;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .course-info {
    .course-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1f2937;
    }
    
    .course-description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .course-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .course-price-rating {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .course-price {
          font-weight: 600;
          color: #2563eb;
          font-size: 18px;
        }
        
        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          
          .stars {
            color: #fbbf24;
            font-weight: 600;
          }
          
          .rating-count {
            color: #6b7280;
            font-size: 14px;
          }
        }
      }
      
      .course-platform {
        font-size: 14px;
        color: #6b7280;
        padding: 4px 8px;
        background: #f3f4f6;
        border-radius: 4px;
      }
    }
    
    .enroll-button {
      display: block;
      width: 100%;
      padding: 8px 16px;
      background-color: #2563eb;
      color: white;
      text-align: center;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #1d4ed8;
      }
    }
  }
}
</style> 
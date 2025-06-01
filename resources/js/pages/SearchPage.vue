<template>
  <div class="search-page-container">
    <!-- Оверлей и расширенная карточка -->
    <div v-if="selectedCourse" class="overlay" @click.self="closeExpanded">
      <div class="expanded-card">
        <h3 class="expanded-title">{{ selectedCourse.title }}</h3>
        <p class="expanded-description">{{ selectedCourse.description }}</p>
        <a :href="selectedCourse.url" class="expanded-link" target="_blank">Перейти к курсу</a>
        <div class="expanded-meta">
          <span class="expanded-rating">Рейтинг: {{ selectedCourse.rating }}</span>
          <span class="expanded-price" :class="{ 'free': selectedCourse.price === 0 }">
            {{ selectedCourse.price === 0 ? 'Бесплатно' : `${formatPrice(selectedCourse.price)} ₽` }}
          </span>
        </div>
        <button class="close-btn" @click="closeExpanded">×</button>
      </div>
    </div>

    <!-- Верхняя панель поиска -->
    <section class="search-header">
      <div class="search-container">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Что вы хотите изучать?" 
            @keyup.enter="performSearch"
            ref="searchInput"
            :class="{ 'search-focus-glow': searchInputGlow }"
          />
          <button @click="performSearch">Поиск</button>
        </div>
      </div>
    </section>
    
    <!-- Результаты поиска и фильтры -->
    <div class="search-content">
      <!-- Боковая панель с фильтрами -->
      <div class="filters-sidebar">
        <h2>Фильтры</h2>
        
        <!-- Фильтр по платформам -->
        <div class="filter-group">
          <h3>Платформы</h3>
          <div class="filter-options">
            <div v-for="platform in platforms" :key="platform.id" class="filter-option">
              <input 
                type="checkbox" 
                :id="'platform-' + platform.id" 
                v-model="selectedPlatforms" 
                :value="platform.id"
                @change="applyFilters"
              />
              <label :for="'platform-' + platform.id">{{ platform.name }}</label>
            </div>
          </div>
        </div>
        
        <!-- Фильтр по ценам -->
        <div class="filter-group">
          <h3>Цена</h3>
          <div class="filter-options">
            <div class="filter-option">
              <input 
                type="checkbox" 
                id="price-free" 
                v-model="priceFilters.free"
                @change="applyFilters"
              />
              <label for="price-free">Бесплатные</label>
            </div>
            <div class="price-range">
              <div class="price-inputs">
                <input 
                  type="number" 
                  v-model="priceFilters.min" 
                  placeholder="от" 
                  @change="applyFilters"
                />
                <span>—</span>
                <input 
                  type="number" 
                  v-model="priceFilters.max" 
                  placeholder="до" 
                  @change="applyFilters"
                />
              </div>
              <button class="apply-price" @click="applyFilters">Применить</button>
            </div>
          </div>
        </div>
        
        <!-- Фильтр по рейтингу -->
        <div class="filter-group">
          <h3>Рейтинг</h3>
          <div class="filter-options">
            <div class="filter-option">
              <input 
                type="radio" 
                id="rating-any" 
                name="rating" 
                value="0" 
                v-model="selectedRating"
                @change="applyFilters"
              />
              <label for="rating-any">Любой</label>
            </div>
            <div class="filter-option">
              <input 
                type="radio" 
                id="rating-4plus" 
                name="rating" 
                value="4" 
                v-model="selectedRating"
                @change="applyFilters"
              />
              <label for="rating-4plus">4.0 и выше</label>
            </div>
            <div class="filter-option">
              <input 
                type="radio" 
                id="rating-45plus" 
                name="rating" 
                value="4.5" 
                v-model="selectedRating"
                @change="applyFilters"
              />
              <label for="rating-45plus">4.5 и выше</label>
            </div>
          </div>
        </div>
        
        <button class="reset-filters" @click="resetFilters">Сбросить все фильтры</button>
      </div>
      
      <!-- Основная область с результатами -->
      <div class="search-results">
        <div class="results-header">
          <h2>Результаты поиска{{ searchQuery ? ': ' + searchQuery : '' }}</h2>
          <div class="results-count">Найдено: {{ filteredCourses.length }} курсов</div>
          <div class="sorting-options">
            <label for="sort-select">Сортировать:</label>
            <select id="sort-select" v-model="sortOption" @change="applySorting">
              <option value="relevance">По релевантности</option>
              <option value="popular">По популярности</option>
              <option value="rating">По рейтингу</option>
              <option value="price-asc">По цене (возрастание)</option>
              <option value="price-desc">По цене (убывание)</option>
              <option value="new">Сначала новые</option>
            </select>

            <label for="per-page-select">Показывать по:</label>
            <select id="per-page-select" v-model="coursesPerPage" @change="changeItemsPerPage">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
              <option :value="48">48</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Ищем курсы...</p>
        </div>
        
        <div v-else-if="filteredCourses.length === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Курсы не найдены</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
        </div>
        
        <div v-else class="courses-grid">
          <div 
            v-for="course in paginatedCourses" 
            :key="course.id" 
            class="course-card"
            @click="expandCourse(course)"
          >
            <button
              class="favorite-btn"
              @click.stop="isFavorite(course.id) ? removeFromFavorites(course.id) : addToFavorites(course.id)"
              :aria-label="isFavorite(course.id) ? 'Убрать из избранного' : 'В избранное'"
            >
              <i :class="[isFavorite(course.id) ? 'fas' : 'far', 'fa-heart']" :style="{ color: isFavorite(course.id) ? '#ef4444' : '#aaa' }"></i>
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
                {{ course.price === 0 ? 'Бесплатно' : `${formatPrice(course.price)} ₽` }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredCourses.length > 0" class="pagination">
          <button 
            class="pagination-prev" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            &laquo; Предыдущая
          </button>
          
          <div class="pagination-numbers">
            <button 
              v-for="page in totalPages" 
              :key="page" 
              :class="{ 'active': page === currentPage }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="pagination-next" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Следующая &raquo;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import http from '@/services/http';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'SearchPage',
  setup() {
    // Состояние поиска
    const searchQuery = ref('');
    const allCourses = ref([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const coursesPerPage = ref(12);
    
    // Состояние фильтров
    const selectedPlatforms = ref([]);
    const priceFilters = ref({
      free: false,
      min: null,
      max: null
    });
    const selectedRating = ref('0');
    const sortOption = ref('relevance');
    
    // Данные платформ
    const platforms = ref([]);
    const isLoadingPlatforms = ref(false);
    
    // В setup() добавляем новое состояние для выбранного курса
    const selectedCourse = ref(null);
    
    // В setup() добавляем состояние и методы для избранного
    const favorites = ref([]);

    // Функции для работы с избранным
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
          favorites.value = favorites.value.filter(fav => Number(fav.id) !== Number(courseId));
          console.error('Failed to add to favorites:', data.error);
        }
      } catch (e) {
        favorites.value = favorites.value.filter(fav => Number(fav.id) !== Number(courseId));
        console.error('Network error:', e);
      }
    };

    const removeFromFavorites = async (courseId) => {
      if (!user.value?.id) return;

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
          favorites.value = originalFavorites;
          console.error('Failed to remove from favorites:', data.error);
        }
      } catch (e) {
        favorites.value = originalFavorites;
        console.error('Network error:', e);
      }
    };

    // Загрузка избранного при монтировании
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

    // Импортируем хранилище авторизации
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);

    // Загрузка всех курсов
    const fetchAllCourses = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost/stepik_parser_test/public/api/v1/courses');
        const responseData = await response.json();
        
        if (responseData.success && Array.isArray(responseData.data)) {
          // Преобразуем данные в нужный формат
          allCourses.value = responseData.data.map(item => ({
            id: item.id,
            title: item.title,
            rating: Number(item.rating),
            reviewsCount: item.additional_data?.review_count ?? 0,
            price: item.additional_data?.price === "Бесплатно" ? 0 : 
                   parseFloat(item.additional_data?.price?.replace(/[^\d.]/g, '')) || 0,
            url: item.url,
            description: item.description,
            platform: item.additional_data?.platform_name || item.source
          }));
        } else {
          console.error('Неверный формат данных:', responseData);
          allCourses.value = [];
        }
      } catch (e) {
        console.error('Ошибка при загрузке курсов:', e);
        allCourses.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Загрузка курсов
    const fetchCourses = async () => {
      isLoading.value = true;
      try {
        let url = 'http://localhost/stepik_parser_test/public/api/v1/courses';
        
        if (selectedPlatforms.value.length > 0) {
          const platformSources = selectedPlatforms.value
            .map(id => {
              const platform = platforms.value.find(p => p.id === id);
              return platform ? platform.source : null;
            })
            .filter(Boolean)
            .join(',');
          
          if (platformSources) {
            url += `?source=${platformSources}`;
          }
        }

        console.log('Fetching courses with URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          allCourses.value = data.data.map(item => ({
            id: item.id,
            title: item.title,
            rating: Number(item.rating),
            reviewsCount: item.additional_data?.review_count ?? 0,
            price: item.additional_data?.price === "Бесплатно" ? 0 : 
                   parseFloat(item.additional_data?.price?.replace(/[^\d.]/g, '')) || 0,
            url: item.url,
            description: item.description,
            platform: item.source,
            platformId: item.additional_data?.platform_id
          }));
        }
      } catch (e) {
        console.error('Ошибка при загрузке курсов:', e);
        allCourses.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Поиск курсов
    const performSearch = async () => {
      isLoading.value = true;
      try {
        let url = `http://localhost/stepik_parser_test/public/api/v1/courses/search?search=${encodeURIComponent(searchQuery.value.trim())}`;
        
        if (selectedPlatforms.value.length > 0) {
          const platformSources = selectedPlatforms.value
            .map(id => {
              const platform = platforms.value.find(p => p.id === id);
              return platform ? platform.source : null;
            })
            .filter(Boolean)
            .join(',');
          
          if (platformSources) {
            url += `&source=${platformSources}`;
          }
        }

        console.log('Search URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          allCourses.value = data.data.map(item => ({
            id: item.id,
            title: item.title,
            rating: Number(item.rating),
            reviewsCount: item.additional_data?.review_count ?? 0,
            price: item.additional_data?.price === "Бесплатно" ? 0 : 
                   parseFloat(item.additional_data?.price?.replace(/[^\d.]/g, '')) || 0,
            url: item.url,
            description: item.description,
            platform: item.source,
            platformId: item.additional_data?.platform_id
          }));
        }
      } catch (e) {
        console.error('Ошибка при поиске курсов:', e);
        allCourses.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Загрузка платформ
    const fetchPlatforms = async () => {
      isLoadingPlatforms.value = true;
      try {
        const response = await fetch('http://localhost/stepik_parser_test/public/api/v1/platforms');
        const data = await response.json();
        if (data.success) {
          platforms.value = data.data.map(platform => ({
            id: platform.id,
            name: platform.name, // Оставляем оригинальное имя
            source: platform.name.toLowerCase() // Добавляем source для API запросов
          }));
          console.log('Loaded platforms:', platforms.value);
          // Выбираем все платформы по умолчанию
          selectedPlatforms.value = platforms.value.map(p => p.id);
        }
      } catch (e) {
        console.error('Ошибка при загрузке платформ:', e);
      } finally {
        isLoadingPlatforms.value = false;
      }
    };
    
    // Методы для форматирования данных
    const formatStudentCount = (count) => {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
      } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
      }
      return count;
    };
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU').format(price);
    };
    
    const getPlatformName = (platformId) => {
      const platform = platforms.value.find(p => p.id === platformId);
      return platform ? platform.name : 'Неизвестно';
    };
    
    // Вычисляемые свойства
    const filteredCourses = computed(() => {
      let result = [...allCourses.value];
      
      // Фильтрация по платформам
      if (selectedPlatforms.value.length > 0) {
        result = result.filter(course => 
          selectedPlatforms.value.includes(course.platformId)
        );
      }
      
      // Фильтрация по цене
      if (priceFilters.value.free) {
        result = result.filter(course => course.price === 0);
      } else {
        if (priceFilters.value.min !== null && priceFilters.value.min !== '') {
          result = result.filter(course => course.price >= Number(priceFilters.value.min));
        }
        if (priceFilters.value.max !== null && priceFilters.value.max !== '') {
          result = result.filter(course => course.price <= Number(priceFilters.value.max));
        }
      }
      
      // Фильтрация по рейтингу
      if (selectedRating.value !== '0') {
        result = result.filter(course => 
          course.rating >= Number(selectedRating.value)
        );
      }
      
      // Сортировка результатов
      switch (sortOption.value) {
        case 'popular':
          result.sort((a, b) => b.studentCount - a.studentCount);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'new':
          result.sort((a, b) => b.isNew ? 1 : (a.isNew ? -1 : 0));
          break;
        case 'relevance':
        default:
          // По умолчанию результаты уже отсортированы по релевантности
          break;
      }
      
      return result;
    });
    
    const paginatedCourses = computed(() => {
      const startIndex = (currentPage.value - 1) * coursesPerPage.value;
      const endIndex = startIndex + coursesPerPage.value;
      return filteredCourses.value.slice(startIndex, endIndex);
    });
    
    const totalPages = computed(() => {
      return Math.max(1, Math.ceil(filteredCourses.value.length / coursesPerPage.value));
    });
    
    // Методы
    const applyFilters = async () => {
      currentPage.value = 1;
      await performSearch();
    };
    
    const resetFilters = () => {
      selectedPlatforms.value = [];
      priceFilters.value = {
        free: false,
        min: null,
        max: null
      };
      selectedRating.value = '0';
      sortOption.value = 'relevance';
      currentPage.value = 1;
    };
    
    const applySorting = () => {
      currentPage.value = 1;
    };
    
    const changePage = (page) => {
      currentPage.value = page;
      // Прокрутка страницы вверх при смене страницы
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const changeItemsPerPage = () => {
      currentPage.value = 1; // Сбрасываем на первую страницу при изменении количества элементов
    };
    
    // Наблюдатель за изменением поискового запроса
    watch(searchQuery, (newValue, oldValue) => {
      if (newValue !== oldValue && oldValue) {
        performSearch();
      }
    });
    
    // Загрузка данных при монтировании компонента
    onMounted(async () => {
      await fetchAllCourses();
      await fetchPlatforms();
      await fetchFavorites();
    });
    
    const searchInput = ref(null);
    const searchInputGlow = ref(false);
    
    // Фокусировка и подсветка поля поиска по внешнему событию
    const focusSearchInput = () => {
      if (searchInput.value) {
        searchInput.value.focus();
        searchInputGlow.value = true;
        setTimeout(() => {
          searchInputGlow.value = false;
        }, 600);
      }
    };
    
    onMounted(() => {
      // ... existing code ...
      window.addEventListener('focus-search-input', focusSearchInput);
    });
    
    const expandCourse = (course) => {
      selectedCourse.value = course;
    };

    const closeExpanded = () => {
      selectedCourse.value = null;
    };
    
    return {
      // Состояние
      searchQuery,
      allCourses,
      isLoading,
      currentPage,
      selectedPlatforms,
      priceFilters,
      selectedRating,
      sortOption,
      platforms,
      
      // Вычисляемые свойства
      filteredCourses,
      paginatedCourses,
      totalPages,
      
      // Методы
      formatStudentCount,
      formatPrice,
      getPlatformName,
      performSearch,
      applyFilters,
      resetFilters,
      applySorting,
      changePage,
      searchInput,
      searchInputGlow,
      selectedCourse,
      expandCourse,
      closeExpanded,
      isFavorite,
      addToFavorites,
      removeFromFavorites,
      favorites,
      coursesPerPage,
      changeItemsPerPage
    };
  }
};
</script>

<style lang="scss" scoped>
.search-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-header {
  background: #f9fafb;
  border-radius: 10px;
  padding: 30px;
  margin: 20px 0;
  
  .search-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .search-bar {
    display: flex;
    
    input {
      flex: 1;
      padding: 15px 20px;
      border-radius: 6px 0 0 6px;
      border: 1px solid #e5e7eb;
      font-size: 16px;
      transition: box-shadow 0.2s, border-color 0.2s;
      
      &:focus {
        outline: none;
        border-color: #2563eb;
      }
      &.search-focus-glow {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 2px #2563eb44;
      }
    }
    
    button {
      padding: 15px 30px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0 6px 6px 0;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
      
      &:hover {
        background: #1d4ed8;
      }
    }
  }
}

.search-content {
  display: flex;
  gap: 30px;
  margin-bottom: 50px;
}

.filters-sidebar {
  width: 280px;
  flex-shrink: 0;
  
  h2 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #1f2937;
  }
  
  .filter-group {
    margin-bottom: 25px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 20px;
    
    &:last-of-type {
      border-bottom: none;
    }
    
    h3 {
      font-size: 16px;
      margin-bottom: 15px;
      color: #374151;
    }
  }
  
  .filter-options {
    .filter-option {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      
      input[type="checkbox"],
      input[type="radio"] {
        margin-right: 10px;
      }
      
      label {
        color: #4b5563;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
  
  .price-range {
    margin-top: 15px;
    
    .price-inputs {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      
      input {
        width: 80px;
        padding: 8px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-size: 14px;
        
        &:focus {
          outline: none;
          border-color: #2563eb;
        }
      }
      
      span {
        margin: 0 10px;
        color: #6b7280;
      }
    }
    
    .apply-price {
      padding: 8px 12px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      color: #4b5563;
      font-size: 14px;
      cursor: pointer;
      
      &:hover {
        background: #e5e7eb;
      }
    }
  }
  
  .reset-filters {
    width: 100%;
    padding: 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #4b5563;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  }
}

.search-results {
  flex: 1;
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
    
    h2 {
      font-size: 22px;
      color: #1f2937;
      margin-right: auto;
    }
    
    .results-count {
      color: #6b7280;
      font-size: 14px;
      margin-right: 20px;
    }
    
    .sorting-options {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      
      label {
        color: #4b5563;
        font-size: 14px;
        white-space: nowrap;
      }
      
      select {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-size: 14px;
        color: #374151;
        cursor: pointer;
        min-width: 100px;
        background: white;
        
        &:focus {
          outline: none;
          border-color: #2563eb;
        }
        
        &:hover {
          border-color: #d1d5db;
        }
      }
    }
  }
  
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px 0;
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #2563eb;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 20px;
    }
    
    p {
      color: #6b7280;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
  
  .no-results {
    text-align: center;
    padding: 50px 0;
    
    .no-results-icon {
      font-size: 40px;
      margin-bottom: 15px;
    }
    
    h3 {
      font-size: 18px;
      color: #374151;
      margin-bottom: 10px;
    }
    
    p {
      color: #6b7280;
    }
  }
  
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    max-width: 100%;
    
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
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    flex-wrap: wrap;
    
    .pagination-numbers {
      display: flex;
      margin: 0 10px;
      flex-wrap: wrap;
      
      button {
        width: 40px;
        height: 40px;
        margin: 0 5px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e5e7eb;
        background: white;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover:not(:disabled) {
          background: #f3f4f6;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        &.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
      }
    }
    
    .pagination-prev,
    .pagination-next {
      padding: 8px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background: white;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        background: #f3f4f6;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
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

  &.free {
    color: #059669;
  }
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

  &:hover {
    color: #111827;
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
  .search-content {
    flex-direction: column;
  }
  
  .filters-sidebar {
    width: 100%;
  }
  
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .pagination {
    .pagination-numbers {
      button {
        width: 35px;
        height: 35px;
        margin: 0 3px;
      }
    }
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    
    .sorting-options {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
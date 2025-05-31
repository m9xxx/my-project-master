<template>
  <div class="search-page-container">
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
        
        <!-- Фильтр по категориям -->
        <div class="filter-group">
          <h3>Категории</h3>
          <div class="filter-options">
            <div v-for="category in categories" :key="category.id" class="filter-option">
              <input 
                type="checkbox" 
                :id="'category-' + category.id" 
                v-model="selectedCategories" 
                :value="category.id"
                @change="applyFilters"
              />
              <label :for="'category-' + category.id">{{ category.name }}</label>
            </div>
          </div>
        </div>
        
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
            v-for="course in filteredCourses" 
            :key="course.id" 
            class="course-card"
          >
            <div class="course-image">
              <img :src="course.imageUrl || '/placeholder-course.jpg'" :alt="course.title" />
              <div class="course-platform">{{ getPlatformName(course.platformId) }}</div>
              <div v-if="course.isNew" class="new-badge">New</div>
            </div>
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <div class="course-meta">
                <span class="course-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-value">{{ course.rating }}</span>
                </span>
                <span class="course-students">{{ formatStudentCount(course.studentCount) }} студентов</span>
              </div>
              <div class="course-category">{{ getCategoryName(course.categoryId) }}</div>
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

export default {
  name: 'SearchPage',
  setup() {
    // Состояние поиска
    const searchQuery = ref('');
    const isLoading = ref(false);
    const allCourses = ref([]);
    const currentPage = ref(1);
    const coursesPerPage = ref(12);
    
    // Состояние фильтров
    const selectedCategories = ref([]);
    const selectedPlatforms = ref([]);
    const priceFilters = ref({
      free: false,
      min: null,
      max: null
    });
    const selectedRating = ref('0');
    const sortOption = ref('relevance');
    
    // Данные категорий и платформ
    const categories = ref([
      { id: 1, name: 'Программирование' },
      { id: 6, name: 'Наука о данных' },
      { id: 2, name: 'Дизайн' },
      { id: 3, name: 'Маркетинг' },
      { id: 4, name: 'Бизнес' },
      { id: 5, name: 'Иностранные языки' },
      { id: 7, name: 'Искусство' },
      { id: 8, name: 'Личная эффективность' }
    ]);
    
    const platforms = ref([
      { id: 1, name: 'Coursera' },
      { id: 2, name: 'Udemy' },
      { id: 3, name: 'Stepik' },
      { id: 4, name: 'Skillbox' },
      { id: 5, name: 'Нетология' },
      { id: 6, name: 'edX' },
      { id: 7, name: 'GeekBrains' }
    ]);
    
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
    
    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId);
      return category ? category.name : 'Без категории';
    };
    
    const getPlatformName = (platformId) => {
      const platform = platforms.value.find(p => p.id === platformId);
      return platform ? platform.name : 'Неизвестно';
    };
    
    // Вычисляемые свойства
    const filteredCourses = computed(() => {
      let result = [...allCourses.value];
      
      // Фильтрация по поисковому запросу
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(course => 
          course.title.toLowerCase().includes(query) ||
          getCategoryName(course.categoryId).toLowerCase().includes(query)
        );
      }
      
      // Фильтрация по категориям
      if (selectedCategories.value.length > 0) {
        result = result.filter(course => 
          selectedCategories.value.includes(course.categoryId)
        );
      }
      
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
    const performSearch = () => {
      isLoading.value = true;
      currentPage.value = 1;
      
      // В реальном приложении здесь был бы API запрос
      setTimeout(() => {
        isLoading.value = false;
      }, 800);
    };
    
    const applyFilters = () => {
      currentPage.value = 1;
    };
    
    const resetFilters = () => {
      selectedCategories.value = [];
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
    
    // Наблюдатель за изменением поискового запроса
    watch(searchQuery, (newValue, oldValue) => {
      if (newValue !== oldValue && oldValue) {
        performSearch();
      }
    });
    
    // Загрузка данных при монтировании компонента
    onMounted(async () => {
      isLoading.value = true;
      
      try {
        // Имитация загрузки данных
        setTimeout(() => {
          // Моковые данные для примера
          allCourses.value = [
            {
              id: 1,
              title: 'Основы программирования на Python',
              platformId: 3,
              categoryId: 1,
              price: 0,
              rating: 4.8,
              studentCount: 154000,
              imageUrl: '/images/courses/python-basics.jpg',
              isNew: false
            },
            {
              id: 2,
              title: 'UX/UI дизайн: с нуля до PRO',
              platformId: 4,
              categoryId: 2,
              price: 45000,
              rating: 4.7,
              studentCount: 32500,
              imageUrl: '/images/courses/ux-ui-design.jpg',
              isNew: false
            },
            {
              id: 3,
              title: 'Маркетинг в социальных сетях',
              platformId: 2,
              categoryId: 3,
              price: 12000,
              rating: 4.6,
              studentCount: 87300,
              imageUrl: '/images/courses/social-marketing.jpg',
              isNew: false
            },
            {
              id: 4,
              title: 'Анализ данных в Excel и Power BI',
              platformId: 1,
              categoryId: 6,
              price: 8000,
              rating: 4.9,
              studentCount: 65800,
              imageUrl: '/images/courses/data-analysis.jpg',
              isNew: false
            },
            {
              id: 5,
              title: 'React для начинающих: полное руководство',
              platformId: 2,
              categoryId: 1,
              price: 3500,
              rating: 4.7,
              studentCount: 1200,
              imageUrl: '/images/courses/react-beginners.jpg',
              isNew: true
            },
            {
              id: 6,
              title: 'Финансовая грамотность для всех',
              platformId: 5,
              categoryId: 4,
              price: 0,
              rating: 4.5,
              studentCount: 3500,
              imageUrl: '/images/courses/finance.jpg',
              isNew: true
            },
            {
              id: 7,
              title: 'Промышленный дизайн от А до Я',
              platformId: 4,
              categoryId: 2,
              price: 56000,
              rating: 4.8,
              studentCount: 750,
              imageUrl: '/images/courses/industrial-design.jpg',
              isNew: true
            },
            {
              id: 8,
              title: 'Английский для IT-специалистов',
              platformId: 3,
              categoryId: 5,
              price: 9900,
              rating: 4.6,
              studentCount: 2100,
              imageUrl: '/images/courses/english-it.jpg',
              isNew: true
            },
            {
              id: 9,
              title: 'Машинное обучение для начинающих',
              platformId: 1,
              categoryId: 6,
              price: 18000,
              rating: 4.9,
              studentCount: 5600,
              imageUrl: '/images/courses/machine-learning.jpg',
              isNew: false
            },
            {
              id: 10,
              title: 'JavaScript: полный курс',
              platformId: 2,
              categoryId: 1,
              price: 7500,
              rating: 4.7,
              studentCount: 42000,
              imageUrl: '/images/courses/javascript.jpg',
              isNew: false
            },
            {
              id: 11,
              title: 'Основы веб-дизайна',
              platformId: 5,
              categoryId: 2,
              price: 15000,
              rating: 4.4,
              studentCount: 8500,
              imageUrl: '/images/courses/web-design.jpg',
              isNew: false
            },
            {
              id: 12,
              title: 'MySQL для разработчиков',
              platformId: 7,
              categoryId: 1,
              price: 11000,
              rating: 4.5,
              studentCount: 6800,
              imageUrl: '/images/courses/mysql.jpg',
              isNew: false
            },
            {
              id: 13,
              title: 'Искусство фотографии',
              platformId: 2,
              categoryId: 7,
              price: 5500,
              rating: 4.8,
              studentCount: 15600,
              imageUrl: '/images/courses/photography.jpg',
              isNew: false
            },
            {
              id: 14,
              title: 'Тайм-менеджмент: управление временем',
              platformId: 5,
              categoryId: 8,
              price: 4000,
              rating: 4.6,
              studentCount: 21000,
              imageUrl: '/images/courses/time-management.jpg',
              isNew: false
            },
            {
              id: 15,
              title: 'Испанский язык для начинающих',
              platformId: 3,
              categoryId: 5,
              price: 6500,
              rating: 4.4,
              studentCount: 9200,
              imageUrl: '/images/courses/spanish.jpg',
              isNew: false
            },
            {
              id: 16,
              title: 'Искусство публичных выступлений',
              platformId: 4,
              categoryId: 8,
              price: 13500,
              rating: 4.7,
              studentCount: 11500,
              imageUrl: '/images/courses/public-speaking.jpg',
              isNew: false
            },
            {
              id: 17,
              title: 'Data Science: основы и практика',
              platformId: 6,
              categoryId: 6,
              price: 22000,
              rating: 4.9,
              studentCount: 7800,
              imageUrl: '/images/courses/data-science.jpg',
              isNew: true
            },
            {
              id: 18,
              title: 'Контент-маркетинг в соцсетях',
              platformId: 2,
              categoryId: 3,
              price: 8900,
              rating: 4.3,
              studentCount: 3800,
              imageUrl: '/images/courses/content-marketing.jpg',
              isNew: true
            }
          ];
          
          isLoading.value = false;
          
          // Если пришли со страницы с поисковым запросом, выполним поиск
          const urlParams = new URLSearchParams(window.location.search);
          const queryParam = urlParams.get('q');
          if (queryParam) {
            searchQuery.value = queryParam;
            performSearch();
          }
        }, 1000);
        
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        isLoading.value = false;
      }
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
    
    return {
      // Состояние
      searchQuery,
      isLoading,
      allCourses,
      currentPage,
      selectedCategories,
      selectedPlatforms,
      priceFilters,
      selectedRating,
      sortOption,
      categories,
      platforms,
      
      // Вычисляемые свойства
      filteredCourses,
      paginatedCourses,
      totalPages,
      
      // Методы
      formatStudentCount,
      formatPrice,
      getCategoryName,
      getPlatformName,
      performSearch,
      applyFilters,
      resetFilters,
      applySorting,
      changePage,
      searchInput,
      searchInputGlow
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
    }
    
    .results-count {
      color: #6b7280;
      font-size: 14px;
    }
    
    .sorting-options {
      display: flex;
      align-items: center;
      
      label {
        margin-right: 10px;
        color: #4b5563;
        font-size: 14px;
      }
      
      select {
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-size: 14px;
        color: #374151;
        cursor: pointer;
        
        &:focus {
          outline: none;
          border-color: #2563eb;
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
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 25px;
    
    .course-card {
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }
      
      .course-image {
        position: relative;
        height: 160px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .course-platform {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
        }
        
        .new-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #dc2626;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
        }
      }
      
      .course-info {
        padding: 15px;
        
.course-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1f2937;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* стандартное свойство для будущей поддержки */
  overflow: hidden;
}

        .course-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
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
          
          .course-students {
            color: #6b7280;
          }
        }
        
        .course-category {
          color: #4b5563;
          font-size: 14px;
          margin-bottom: 8px;
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
    
    button {
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        background: #f3f4f6;
        border-color: #d1d5db;
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
    
    .pagination-prev,
    .pagination-next {
      border-radius: 4px;
    }
    
    .pagination-numbers {
      display: flex;
      margin: 0 10px;
      
      button {
        width: 40px;
        height: 40px;
        margin: 0 5px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
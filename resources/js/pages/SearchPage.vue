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

      <!-- Подборки справа -->
      <div class="playlists-sidebar" v-if="user">
        <div class="playlists-header">
          <h2>Подборки</h2>
          <div class="playlists-count" v-if="filteredPlaylists.length">
            Найдено: {{ filteredPlaylists.length }} {{ getNoun(filteredPlaylists.length, 'подборка', 'подборки', 'подборок') }}
          </div>
        </div>

        <div v-if="filteredPlaylists.length > 0" class="playlists-list">
          <div 
            v-for="playlist in filteredPlaylists" 
            :key="playlist.id" 
            class="playlist-card"
            @click="showPlaylistDetails(playlist)"
          >
            <h3 class="playlist-title">{{ playlist.name }}</h3>
            <p class="playlist-description">{{ playlist.description || 'Без описания' }}</p>
            <div class="playlist-meta">
              <span class="courses-count">
                <i class="fas fa-book"></i>
                {{ playlist.course_count }} {{ getNoun(playlist.course_count, 'курс', 'курса', 'курсов') }}
              </span>
              <span class="author" v-if="playlist.author_name">
                <i class="fas fa-user"></i>
                {{ playlist.author_name }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="no-playlists">
          <p>Подборок не найдено</p>
        </div>

        <!-- Модальное окно с деталями подборки -->
        <div v-if="selectedPlaylist" class="overlay" @click.self="closePlaylistDetails">
          <div class="expanded-playlist">
            <button class="close-btn" @click="closePlaylistDetails">×</button>
            
            <div class="playlist-header">
              <h3 class="expanded-title">{{ selectedPlaylist.name }}</h3>
              <div class="playlist-meta-info">
                <span class="courses-count">
                  <i class="fas fa-book"></i>
                  {{ selectedPlaylist.course_count }} {{ getNoun(selectedPlaylist.course_count, 'курс', 'курса', 'курсов') }}
                </span>
                <span class="author" v-if="selectedPlaylist.author_name">
                  <i class="fas fa-user"></i>
                  {{ selectedPlaylist.author_name }}
                </span>
              </div>
              <p class="expanded-description">{{ selectedPlaylist.description || 'Без описания' }}</p>
            </div>
            
            <div class="playlist-courses">
              <h4>Курсы в подборке</h4>
              <div v-if="selectedPlaylist.courses && selectedPlaylist.courses.length > 0" class="playlist-courses-list">
                <!-- Expanded course card -->
                <div v-if="selectedPlaylistCourse" class="expanded-playlist-course">
                  <button class="back-btn" @click="selectedPlaylistCourse = null">
                    <i class="fas fa-arrow-left"></i> Назад к списку
                  </button>
                  <h3 class="expanded-title">{{ selectedPlaylistCourse.title }}</h3>
                  <p class="expanded-description">{{ selectedPlaylistCourse.description }}</p>
                  <div class="expanded-meta">
                    <div class="meta-item">
                      <i class="fas fa-star"></i>
                      <span>{{ selectedPlaylistCourse.rating }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-comment"></i>
                      <span>{{ formatStudentCount(selectedPlaylistCourse.reviewsCount) }} отзывов</span>
                    </div>
                    <div class="meta-item price" :class="{ 'free': selectedPlaylistCourse.price === 0 }">
                      {{ selectedPlaylistCourse.price === 0 ? 'Бесплатно' : `${formatPrice(selectedPlaylistCourse.price)} ₽` }}
                    </div>
                  </div>
                  <div class="expanded-actions">
                    <button
                      class="action-btn favorite"
                      @click="isFavorite(selectedPlaylistCourse.id) ? removeFromFavorites(selectedPlaylistCourse.id) : addToFavorites(selectedPlaylistCourse.id)"
                    >
                      <i :class="[isFavorite(selectedPlaylistCourse.id) ? 'fas' : 'far', 'fa-heart']"></i>
                      {{ isFavorite(selectedPlaylistCourse.id) ? 'В избранном' : 'В избранное' }}
                    </button>
                    <a :href="selectedPlaylistCourse.url" target="_blank" class="action-btn primary">
                      <i class="fas fa-external-link-alt"></i>
                      Перейти к курсу
                    </a>
                  </div>
                </div>
                
                <!-- Course list -->
                <div v-else class="playlist-courses-grid">
                  <div 
                    v-for="course in selectedPlaylist.courses" 
                    :key="course.id" 
                    class="playlist-course-item"
                  >
                    <div class="course-main-info" @click="selectedPlaylistCourse = course">
                      <div class="course-basic-info">
                        <div class="platform-badge">{{ course.platform }}</div>
                        <h3 class="course-title">{{ course.title }}</h3>
                      </div>
                      <div class="course-stats">
                        <span class="rating">
                          <i class="fas fa-star"></i>
                          {{ course.rating }}
                        </span>
                        <span class="reviews">
                          <i class="fas fa-comment"></i>
                          {{ formatStudentCount(course.reviewsCount) }}
                        </span>
                        <span class="price" :class="{ 'free': course.price === 0 }">
                          {{ course.price === 0 ? 'Бесплатно' : `${formatPrice(course.price)} ₽` }}
                        </span>
                      </div>
                    </div>
                    <div class="course-actions">
                      <button
                        class="favorite-btn"
                        @click.stop="isFavorite(course.id) ? removeFromFavorites(course.id) : addToFavorites(course.id)"
                        :aria-label="isFavorite(course.id) ? 'Убрать из избранного' : 'В избранное'"
                      >
                        <i :class="[isFavorite(course.id) ? 'fas' : 'far', 'fa-heart']" :style="{ color: isFavorite(course.id) ? '#ef4444' : '#aaa' }"></i>
                      </button>
                      <a :href="course.url" target="_blank" class="btn-link">
                        <i class="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>В этой подборке пока нет курсов</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import http from '@/services/http';
import { useAuthStore } from '@/store/auth';
import PlaylistDropdown from '@/components/PlaylistDropdown.vue';

export default {
  name: 'SearchPage',
  components: {
    PlaylistDropdown
  },
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
      if (newValue !== oldValue) {
        performSearch(); // Поиск курсов
        if (newValue.trim()) { // Ищем подборки только если есть поисковый запрос
          fetchPlaylists();
        } else {
          playlists.value = []; // Очищаем список подборок если поисковая строка пуста
        }
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

    const playlists = ref([]);
    const selectedPlaylist = ref(null);
    const selectedPlaylistCourse = ref(null);
    const filteredPlaylists = computed(() => {
      return playlists.value;  // Убираем локальную фильтрацию, так как теперь фильтрация происходит на бэкенде
    });

    const showPlaylistDetails = async (playlist) => {
      try {
        // Получаем актуальную информацию о пользователе
        const userResponse = await fetch(`http://localhost/stepik_parser_test/public/api/v1/users/${playlist.user_id}`);
        const userData = await userResponse.json();
        
        selectedPlaylist.value = {
          ...playlist,
          author_name: userData.success ? userData.data.name : 'Пользователь не найден'
        };
        selectedPlaylistCourse.value = null;
        
        if (!playlist.courses) {
          const response = await fetch(`http://localhost/stepik_parser_test/public/api/v1/playlists/${playlist.id}/courses?user_id=${user.value.id}`);
          const data = await response.json();
          if (data.success) {
            const courses = Array.isArray(data.data) ? data.data : [];
            selectedPlaylist.value = {
              ...selectedPlaylist.value,
              courses: courses.map(course => ({
                id: course.id,
                title: course.title,
                rating: Number(course.rating),
                reviewsCount: course.review_count,
                price: course.price === "Бесплатно" ? 0 : 
                       parseFloat(course.price?.replace(/[^\d.]/g, '')) || 0,
                url: course.url,
                description: course.description,
                platform: course.platform_name
              }))
            };
          }
        }
      } catch (error) {
        console.error('Error loading playlist details:', error);
        selectedPlaylist.value = {
          ...playlist,
          author_name: 'Ошибка загрузки',
          courses: []
        };
        toast.error('Не удалось загрузить детали подборки');
      }
    };

    const closePlaylistDetails = () => {
      selectedPlaylist.value = null;
      selectedPlaylistCourse.value = null; // Reset selected course when closing playlist
    };

    const fetchPlaylists = async () => {
      try {
        const searchParam = searchQuery.value.trim() ? `?search=${encodeURIComponent(searchQuery.value.trim())}` : '';
        const response = await fetch(`http://localhost/stepik_parser_test/public/api/v1/playlists/search${searchParam}`);
        const data = await response.json();
        if (data.success) {
          // Сначала получаем все уникальные user_id из плейлистов
          const userIds = [...new Set((data.data || []).map(playlist => playlist.user_id))];
          
          // Получаем информацию о пользователях
          const usersResponse = await fetch(`http://localhost/stepik_parser_test/public/api/v1/users?ids=${userIds.join(',')}`);
          const usersData = await usersResponse.json();
          const users = usersData.success ? usersData.data : [];
          
          // Создаем мапу пользователей для быстрого доступа
          const usersMap = new Map(users.map(user => [user.id, user]));
          
          // Маппим плейлисты с информацией о пользователях
          playlists.value = (data.data || []).map(playlist => ({
            ...playlist,
            author_name: usersMap.get(playlist.user_id)?.name || 'Пользователь не найден',
            course_count: playlist.course_count || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        playlists.value = [];
      }
    };

    const getNoun = (number, one, two, five) => {
      let n = Math.abs(number);
      n %= 100;
      if (n >= 5 && n <= 20) {
        return five;
      }
      n %= 10;
      if (n === 1) {
        return one;
      }
      if (n >= 2 && n <= 4) {
        return two;
      }
      return five;
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
      changeItemsPerPage,
      user,
      filteredPlaylists,
      selectedPlaylist,
      selectedPlaylistCourse,
      showPlaylistDetails,
      closePlaylistDetails,
      getNoun
    };
  }
};
</script>

<style lang="scss" scoped>
.search-page-container {
  max-width: 1400px;
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
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 300px;
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

.playlists-sidebar {
  .playlists-header {
    margin-bottom: 20px;
    h2 {
      font-size: 20px;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .playlists-count {
      font-size: 14px;
      color: #6b7280;
    }
  }

  .playlist-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 120px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .playlist-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .playlist-description {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    .playlist-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #6b7280;
      margin-top: auto;

      .courses-count {
        display: flex;
        align-items: center;
        gap: 4px;
        
        i {
          font-size: 14px;
        }
      }

      .author {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #4b5563;
        
        i {
          font-size: 12px;
        }
      }
    }
  }

  .no-playlists {
    text-align: center;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
  }
}

@media (max-width: 1200px) {
  .search-content {
    grid-template-columns: 280px 1fr;
    .playlists-sidebar {
      display: none;
    }
  }
}

@media (max-width: 768px) {
  .search-content {
    grid-template-columns: 1fr;
  }
  
  .filters-sidebar {
    display: none;
  }
}

.expanded-playlist {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 1000px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 28px;
    color: #6b7280;
    cursor: pointer;
    z-index: 10;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #111827;
    }
  }

  .playlist-header {
    padding: 30px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;

    .expanded-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 12px;
    }

    .playlist-meta-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #6b7280;

      .courses-count, .author {
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          font-size: 14px;
        }
      }

      .author {
        color: #4b5563;
        font-weight: 500;
      }
    }

    .expanded-description {
      font-size: 16px;
      line-height: 1.5;
      color: #4b5563;
      margin: 0;
    }
  }

  .playlist-courses {
    padding: 30px;

    .expanded-playlist-course {
      background: white;
      border-radius: 8px;
      padding: 24px;
      border: 1px solid #e5e7eb;

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        background: none;
        border: none;
        color: #6b7280;
        font-size: 14px;
        cursor: pointer;
        margin-bottom: 16px;
        transition: color 0.2s;

        &:hover {
          color: #111827;
        }
      }

      .expanded-title {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 12px;
      }

      .expanded-description {
        font-size: 14px;
        line-height: 1.6;
        color: #4b5563;
        margin-bottom: 20px;
      }

      .expanded-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 24px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;

          &.price {
            font-weight: 600;
            color: #111827;

            &.free {
              color: #059669;
            }
          }

          i {
            font-size: 14px;
          }
        }
      }

      .expanded-actions {
        display: flex;
        gap: 12px;

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;

          &.favorite {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            color: #6b7280;

            &:hover {
              background: #e5e7eb;
              color: #111827;
            }
          }

          &.primary {
            background: #2563eb;
            border: 1px solid #2563eb;
            color: white;

            &:hover {
              background: #1d4ed8;
            }
          }
        }
      }
    }

    .playlist-courses-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .playlist-course-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .course-main-info {
        flex: 1;
        min-width: 0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .course-basic-info {
        flex: 1;
        min-width: 0;

        .course-author {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;

          i {
            font-size: 10px;
          }
        }
      }

      .course-stats {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 13px;
        color: #6b7280;
        white-space: nowrap;

        span {
          display: flex;
          align-items: center;
          gap: 4px;

          i {
            font-size: 12px;
          }
        }

        .price {
          font-weight: 600;
          color: #111827;

          &.free {
            color: #059669;
          }
        }
      }

      .course-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 16px;

        .favorite-btn, .btn-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #f3f4f6;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #e5e7eb;
            color: #111827;
          }
        }

        .favorite-btn {
          &:hover i {
            color: #ef4444 !important;
          }
        }

        .btn-link {
          text-decoration: none;

          &:hover {
            color: #2563eb;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      background: #f9fafb;
      border-radius: 8px;
      color: #6b7280;
    }
  }
}

@media (max-width: 640px) {
  .expanded-playlist {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;

    .playlist-header {
      padding: 20px;
    }

    .playlist-courses {
      padding: 20px;

      .playlist-courses-grid {
        grid-template-columns: 1fr;
      }
    }

    .expanded-playlist-course {
      .expanded-actions {
        flex-direction: column;
      }
    }
  }
}
</style>
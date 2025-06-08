<!-- Dropdown menu for playlists -->
<template>
  <div class="playlist-dropdown" ref="dropdownContainer">
    <!-- Add to playlist button -->
    <button
      class="playlist-btn"
      @click.stop="toggleDropdown"
      :aria-label="isOpen ? 'Close playlist menu' : 'Add to playlist'"
    >
      <i class="fas fa-plus"></i>
    </button>

    <!-- Используем телепорт для выпадающего меню -->
    <Teleport to="body">
      <!-- Оверлей для закрытия по клику вне -->
      <div v-if="isOpen" class="playlist-overlay" @click="closeDropdown"></div>
      
      <!-- Dropdown menu -->
      <div 
        v-if="isOpen" 
        class="dropdown-menu"
        :style="dropdownPosition"
        @click.stop
      >
        <div class="dropdown-header">
          <h3>Добавить в подборку</h3>
          <button class="close-btn" @click="closeDropdown">×</button>
        </div>

        <!-- Create new playlist form -->
        <div v-if="showCreateForm" class="create-playlist-form">
          <input
            v-model="newPlaylist.name"
            type="text"
            placeholder="Название подборки"
            @keyup.enter="createNewPlaylist"
            class="form-input"
          >
          <textarea
            v-model="newPlaylist.description"
            placeholder="Описание (необязательно)"
            rows="2"
            class="form-input"
          ></textarea>
          <div class="form-actions">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newPlaylist.isPublic">
              <span>Публичная подборка</span>
            </label>
            <div class="form-buttons">
              <button class="btn btn-secondary" @click="cancelCreate">Отмена</button>
              <button 
                class="btn btn-primary" 
                @click="createNewPlaylist"
                :disabled="!newPlaylist.name.trim()"
              >
                Создать
              </button>
            </div>
          </div>
        </div>

        <!-- Existing playlists -->
        <div v-else class="playlists-list">
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск подборок"
            >
          </div>

          <div class="playlists-scroll">
            <div v-if="playlistsStore.isLoading" class="loading">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <template v-else>
              <div
                v-for="playlist in filteredPlaylists"
                :key="playlist.id"
                class="playlist-item"
                @click="addToPlaylist(playlist)"
              >
                <div class="playlist-info">
                  <span class="playlist-name">{{ playlist.name }}</span>
                  <span class="course-count">{{ playlist.course_count }} курсов</span>
                </div>
                <i class="fas fa-plus add-icon"></i>
              </div>
            </template>

            <button class="create-new-btn" @click="showCreateForm = true">
              <i class="fas fa-plus"></i>
              Создать новую подборку
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { usePlaylistsStore } from '@/store/playlists';
import { useToast } from 'vue-toastification';

export default {
  name: 'PlaylistDropdown',
  
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },

  setup(props) {
    const playlistsStore = usePlaylistsStore();
    const toast = useToast();
    const isOpen = ref(false);
    const showCreateForm = ref(false);
    const searchQuery = ref('');
    const dropdownContainer = ref(null);
    const dropdownPosition = ref({
      position: 'fixed',
      top: '0px',
      left: '0px',
      zIndex: 9999
    });
    
    const newPlaylist = ref({
      name: '',
      description: '',
      isPublic: false
    });

    const filteredPlaylists = computed(() => {
      const query = searchQuery.value.toLowerCase().trim();
      return playlistsStore.playlists.filter(playlist => 
        playlist.name.toLowerCase().includes(query)
      );
    });

    const updateDropdownPosition = async () => {
      if (!dropdownContainer.value || !isOpen.value) return;
      
      await nextTick();
      const rect = dropdownContainer.value.getBoundingClientRect();
      const dropdownWidth = 300;
      const dropdownHeight = 400;
      
      // Определяем, достаточно ли места справа и снизу
      const spaceRight = window.innerWidth - rect.right;
      const spaceBottom = window.innerHeight - rect.top;
      
      let left = rect.left;
      let top = rect.bottom + 5;
      
      // Если справа недостаточно места, позиционируем слева
      if (spaceRight < dropdownWidth) {
        left = rect.right - dropdownWidth;
      }
      
      // Если снизу недостаточно места, позиционируем сверху
      if (spaceBottom < dropdownHeight) {
        top = rect.top - dropdownHeight - 5;
      }
      
      dropdownPosition.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999
      };
    };

    const toggleDropdown = async () => {
      isOpen.value = !isOpen.value;
      if (isOpen.value) {
        await updateDropdownPosition();
        playlistsStore.fetchUserPlaylists();
      }
    };

    const closeDropdown = () => {
      isOpen.value = false;
      showCreateForm.value = false;
      resetForm();
    };

    const resetForm = () => {
      newPlaylist.value = {
        name: '',
        description: '',
        isPublic: false
      };
      searchQuery.value = '';
    };

    const cancelCreate = () => {
      showCreateForm.value = false;
      resetForm();
    };

    const createNewPlaylist = async () => {
      if (!newPlaylist.value.name.trim()) return;

      try {
        const playlist = await playlistsStore.createPlaylist({
          name: newPlaylist.value.name,
          description: newPlaylist.value.description,
          isPublic: newPlaylist.value.isPublic
        });
        
        // Automatically add the course to the new playlist
        await addToPlaylist(playlist);
        
        toast.success('Подборка создана');
        showCreateForm.value = false;
        resetForm();
      } catch (error) {
        toast.error('Не удалось создать подборку');
      }
    };

    const addToPlaylist = async (playlist) => {
      try {
        await playlistsStore.addCourseToPlaylist(playlist.id, props.courseId);
        toast.success(`Курс добавлен в подборку "${playlist.name}"`);
        closeDropdown();
      } catch (error) {
        toast.error('Не удалось добавить курс в подборку');
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    });

    return {
      isOpen,
      showCreateForm,
      searchQuery,
      newPlaylist,
      playlistsStore,
      filteredPlaylists,
      dropdownPosition,
      dropdownContainer,
      toggleDropdown,
      closeDropdown,
      cancelCreate,
      createNewPlaylist,
      addToPlaylist
    };
  }
};
</script>

<style lang="scss" scoped>
.playlist-dropdown {
  position: relative;
}

.playlist-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: background-color 0.2s;
  z-index: 2;

  &:hover {
    background: #f3f4f6;
  }

  i {
    color: #6b7280;
    font-size: 14px;
  }
}

.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 9998;
}

.dropdown-menu {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #1f2937;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background: #f3f4f6;
    }
  }
}

.create-playlist-form {
  padding: 16px;

  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #4b5563;
    cursor: pointer;

    input[type="checkbox"] {
      margin: 0;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }

  .form-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 12px;

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      min-width: 80px;

      &.btn-primary {
        background: #3b82f6;
        color: white;

        &:hover:not(:disabled) {
          background: #2563eb;
        }

        &:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #e5e7eb;

        &:hover {
          background: #e5e7eb;
        }
      }
    }
  }
}

.playlists-list {
  .search-box {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;

    input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #3b82f6;
      }
    }
  }
}

.playlists-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
  background: white;
  border-radius: 0 0 8px 8px;

  .loading {
    padding: 20px;
    text-align: center;
    color: #6b7280;
  }
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  .playlist-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .playlist-name {
    font-size: 14px;
    color: #1f2937;
  }

  .course-count {
    font-size: 12px;
    color: #6b7280;
  }

  .add-icon {
    color: #3b82f6;
    font-size: 14px;
  }
}

.create-new-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-top: 1px solid #e5e7eb;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  i {
    font-size: 12px;
  }
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.btn-primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }

    &:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background: #f3f4f6;
    color: #4b5563;

    &:hover {
      background: #e5e7eb;
    }
  }
}
</style> 
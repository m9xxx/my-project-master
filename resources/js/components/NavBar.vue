<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/">
          <h1>Агрегатор курсов</h1>
        </router-link>
      </div>
      <div class="navbar-menu">
        <div class="nav-links">
          <router-link to="/" class="nav-link" exact-active-class="active">Главная</router-link>
          <router-link to="/search" class="nav-link" active-class="active">Поиск</router-link>
          <router-link to="/favorites" class="nav-link" active-class="active">Избранное</router-link>
        </div>
        <div class="user-menu">
          <div class="search-icon" @click="goToSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div class="dropdown"
            v-click-outside="closeDropdown"
            @mouseenter="cancelCloseDropdown"
            @mouseleave="delayedCloseDropdown"
          >
            <button class="dropdown-btn" @click="toggleDropdown">
              <div class="user-avatar">{{ getUserInitials }}</div>
              <span class="user-name">{{ user?.name || 'Пользователь' }}</span>
              <svg v-if="!isDropdownOpen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 15 12 9 18 15"></polyline>
              </svg>
            </button>
            <div class="dropdown-content" v-if="isDropdownOpen">
              <router-link to="/profile" class="dropdown-item">Личный кабинет</router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="logout">Выйти</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'NavBar',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);
    const getUserInitials = computed(() => {
      if (!user.value || !user.value.name) return '?';
      const names = user.value.name.split(' ');
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    });
    const isSearchPage = computed(() => {
      return router.currentRoute.value.path === '/search';
    });
    const logout = () => {
      authStore.logout();
      router.push('/auth');
    };
    // Dropdown logic
    const isDropdownOpen = ref(false);
    const isDropdownHovered = ref(false);
    let closeTimeout = null;
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };
    const closeDropdown = () => {
      isDropdownOpen.value = false;
    };
    const delayedCloseDropdown = () => {
      closeTimeout = setTimeout(() => {
        isDropdownOpen.value = false;
      }, 500);
    };
    const cancelCloseDropdown = () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
    };
    const goToSearch = () => {
      if (router.currentRoute.value.path !== '/search') {
        router.push('/search');
      } else {
        window.dispatchEvent(new CustomEvent('focus-search-input'));
      }
    };
    return {
      user,
      getUserInitials,
      isSearchPage,
      logout,
      isDropdownOpen,
      isDropdownHovered,
      toggleDropdown,
      closeDropdown,
      delayedCloseDropdown,
      cancelCloseDropdown,
      goToSearch
    };
  }
};
</script>
<style lang="scss" scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .navbar-brand {
    h1 {
      font-size: 22px;
      color: #2563eb;
      margin: 0;
    }
    
    a {
      text-decoration: none;
    }
  }
  
  .navbar-menu {
    display: flex;
    align-items: center;
  }
  
  .nav-links {
    display: flex;
    margin-right: 30px;
    
    .nav-link {
      text-decoration: none;
      color: #555;
      font-weight: 500;
      padding: 8px 15px;
      border-radius: 5px;
      margin: 0 5px;
      transition: all 0.2s;
      
      &:hover {
        color: #2563eb;
        background-color: rgba(37, 99, 235, 0.05);
      }
      
      &.active {
        color: #2563eb;
        background-color: rgba(37, 99, 235, 0.1);
      }
    }
  }
  
  .user-menu {
    display: flex;
    align-items: center;
    
    .search-icon {
      margin-right: 20px;
      cursor: pointer;
      color: #555;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: #2563eb;
      }
    }
  }
  
  .dropdown {
    position: relative;
    
    .dropdown-btn {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 20px;
      transition: all 0.2s;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .user-avatar {
        width: 32px;
        height: 32px;
        background-color: #2563eb;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        margin-right: 10px;
      }
      
      .user-name {
        margin-right: 8px;
        font-weight: 500;
        color: #333;
      }
      
      svg {
        color: #555;
      }
    }
    
    .dropdown-content {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      background-color: white;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      min-width: 180px;
      overflow: hidden;
      z-index: 10;
      
      .dropdown-item {
        display: block;
        padding: 12px 15px;
        text-decoration: none;
        color: #333;
        font-size: 14px;
        transition: all 0.2s;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.03);
        }
      }
      
      .dropdown-divider {
        height: 1px;
        background-color: #eee;
      }
      
      .logout-btn {
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #ef4444;
        
        &:hover {
          background-color: rgba(239, 68, 68, 0.05);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar {
    .nav-links {
      display: none;
    }
    
    .user-menu {
      .user-name {
        display: none;
      }
    }
  }
}
</style>
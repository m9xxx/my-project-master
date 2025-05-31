// import { createRouter, createWebHistory } from 'vue-router';
// import AuthPage from '../pages/AuthPage.vue';
// import HomePage from '../pages/HomePage.vue';
// import CourseDetailPage from '../pages/CourseDetail.vue';
// import ProfilePage from '../pages/ProfilePage.vue';
// //import FavoritesPage from '../pages/FavoritesPage.vue';
// import SearchPage from '../pages/SearchPage.vue';
// import { useAuthStore } from '../store/auth';

// const routes = [
//     {
//         path: '/',
//         component: HomePage,
//         meta: { requiresAuth: true }
//     },
//     {
//         path: '/auth',
//         component: AuthPage,
//         meta: { guest: true }
//     },
//     {
//          path: '/courses',
//          component: CourseDetailPage,
//          meta: { guest: true }
//     },
//      {
//          path: '/profile',
//          component: ProfilePage,
//          meta: { guest: true }
//      },
//     // {
//     //     path: '/favorites',
//     //     component: FavoritesPage,
//     //     meta: { requiresAuth: true }
//     // },
//      {
//          path: '/search',
//          component: SearchPage,
//          meta: { guest: true }
//      }
// ];

// const router = createRouter({
//     history: createWebHistory(),
//     routes
// });

// // Защита маршрутов
// router.beforeEach((to, from, next) => {
//     const authStore = useAuthStore();
//     const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//     const isGuestRoute = to.matched.some(record => record.meta.guest);

//     if (requiresAuth && !authStore.isAuthenticated) {
//         next('/auth');
//     } else if (isGuestRoute && authStore.isAuthenticated) {
//         next('/');
//     } else {
//         next();
//     }
// });

// export default router;
// resources/js/router/index.js
// resources/js/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import AuthPage from '../pages/AuthPage.vue';
import HomePage from '../pages/HomePage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
//import FavoritesPage from '../pages/FavoritesPage.vue';
import SearchPage from '../pages/SearchPage.vue';
import { useAuthStore } from '../store/auth';

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '',
                component: HomePage,
                meta: { requiresAuth: true }
            },
            {
                path: 'profile',
                component: ProfilePage,
                meta: { requiresAuth: true, guestRestricted: true }
            },
            {
                path: 'search',
                component: SearchPage,
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/auth',
        component: AuthPage,
        meta: { guest: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Защита маршрутов
router.beforeEach(async (to, from, next) => {
    try {
        const authStore = useAuthStore();
        
        // Проверяем авторизацию при первом заходе (только если метод существует)
        if (typeof authStore.checkAuth === 'function' && !authStore.isAuthenticated && !authStore.isGuest) {
            await authStore.checkAuth();
        }
        
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
        const isGuestRoute = to.matched.some(record => record.meta.guest);
        const guestRestricted = to.matched.some(record => record.meta.guestRestricted);
        
        // Проверяем доступ (с fallback на базовую проверку)
        const hasAccess = authStore.hasAccess ?? (authStore.isAuthenticated || authStore.isGuest);
        const isLoggedIn = authStore.isLoggedIn ?? (authStore.isAuthenticated && !authStore.isGuest);

        if (requiresAuth && !hasAccess) {
            // Нет доступа - перенаправляем на авторизацию
            next('/auth');
        } else if (isGuestRoute && hasAccess) {
            // Уже авторизован/в гостевом режиме - перенаправляем на главную
            next('/');
        } else if (guestRestricted && !isLoggedIn) {
            // Страница недоступна для гостей - перенаправляем на авторизацию
            next('/auth');
        } else {
            // Доступ разрешен
            next();
        }
    } catch (error) {
        console.error('Ошибка в navigation guard:', error);
        // В случае ошибки разрешаем переход
        next();
    }
});

export default router;
import { defineStore } from 'pinia';

export const useCoursesStore = defineStore('courses', {
    state: () => ({
        courses: [
            {
                id: 1,
                title: 'ЕГЭ по математике 2025: уравнения',
                description: 'Курс посвящен решению уравнений. Основные цели – устранение пробелов в знаниях, а также подготовка учеников к сдаче профильного ЕГЭ по математике.',
                price: 1990,
                platform: 'Stepik',
                rating: 4.8,
                reviewsCount: 1990,
                courseUrl: 'https://stepik.org/course/4938/promo',
                imageUrl: '/images/courses/python.jpg'
            },
            {
                id: 2,
                title: 'UX/UI дизайн: с нуля до PRO',
                description: 'Профессиональный курс по дизайну интерфейсов. Научитесь создавать красивые и удобные интерфейсы, работать с Figma и Sketch.',
                price: 45000,
                platform: 'Skillbox',
                rating: 4.7,
                reviewsCount: 32500,
                courseUrl: 'https://skillbox.ru/course/uxui-design',
                imageUrl: '/images/courses/design.jpg'
            },
            {
                id: 3,
                title: 'JavaScript: полное руководство',
                description: 'Изучите JavaScript от основ до продвинутых тем. Включает ES6+, асинхронное программирование, работу с DOM и многое другое.',
                price: 12000,
                platform: 'Udemy',
                rating: 4.9,
                reviewsCount: 87300,
                courseUrl: 'https://udemy.com/course/javascript-complete',
                imageUrl: '/images/courses/javascript.jpg'
            }
        ],
        collections: [],
        favorites: []
    }),

    getters: {
        allCourses: (state) => state.courses,
        getFavorites: (state) => state.courses.filter(course => state.favorites.includes(course.id)),
        getCollections: (state) => state.collections,
        isFavorite: (state) => (courseId) => state.favorites.includes(courseId)
    },

    actions: {
        toggleFavorite(courseId) {
            const index = this.favorites.indexOf(courseId);
            if (index === -1) {
                this.favorites.push(courseId);
            } else {
                this.favorites.splice(index, 1);
            }
        },

        createCollection(name, description) {
            const collection = {
                id: Date.now(),
                name,
                description,
                courses: []
            };
            this.collections.push(collection);
            return collection;
        },

        addToCollection(courseId, collectionId) {
            const collection = this.collections.find(c => c.id === collectionId);
            if (collection && !collection.courses.includes(courseId)) {
                collection.courses.push(courseId);
            }
        },

        removeFromCollection(courseId, collectionId) {
            const collection = this.collections.find(c => c.id === collectionId);
            if (collection) {
                const index = collection.courses.indexOf(courseId);
                if (index !== -1) {
                    collection.courses.splice(index, 1);
                }
            }
        }
    }
});
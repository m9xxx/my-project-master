import axios from 'axios';

const API_URL = '/api';

export const courseService = {
    // Получить все курсы
    async getAllCourses() {
        return axios.get(`${API_URL}/courses`);
    },

    // Получить курс по ID
    async getCourse(id) {
        return axios.get(`${API_URL}/courses/${id}`);
    },

    // Поиск курсов
    async searchCourses(query) {
        return axios.get(`${API_URL}/courses/search`, { params: { q: query } });
    },

    // Получить курсы по категории
    getCoursesByCategory(categoryId) {
        return axios.get(`${API_URL}/courses/category/${categoryId}`);
    }
}; 
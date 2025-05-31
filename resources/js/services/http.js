import axios from 'axios';

const http = axios.create({
    baseURL: 'http://127.0.0.1/stepik_parser_test/public/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Добавляем перехватчик для обработки ошибок
http.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Можно добавить редирект на страницу логина при необходимости
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default http; 
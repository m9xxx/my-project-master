import axios from 'axios';

const http = axios.create({
    baseURL: 'http://127.0.0.1/stepik_parser_test/public/api/v1',
    withCredentials: true, // Это включит передачу cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Добавляем интерцептор для установки CSRF-токена
http.interceptors.request.use(config => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// Добавляем перехватчик для обработки ошибок
http.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.error('Unauthorized request:', error);
        }
        return Promise.reject(error);
    }
);

export default http; 
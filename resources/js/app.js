import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import clickOutside from './directives/click-outside';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.directive('click-outside', clickOutside);

// Добавляем опции для Toast
const toastOptions = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
};

// Добавляем Toast в use
app.use(Toast, toastOptions);

app.mount('#app');
<template>
    <div class="app-container">
        <NavBar v-if="!isAuthPage" />
        <router-view></router-view>
        <Footer v-if="!isAuthPage" />
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
export default {
    name: 'App',
    components: {
        NavBar,
        Footer
    },
    setup() {
        const route = useRoute();
        const isAuthPage = computed(() => route.path.startsWith('/auth'));
        return { isAuthPage };
    }
}
</script>

<style>
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}
.app-container {
    width: 100%;
    min-height: 100vh;
}
</style>
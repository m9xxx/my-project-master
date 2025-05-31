<template>
  <div class="main-layout">
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
};
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  padding-top: 64px; // Высота навбара
  min-height: calc(100vh - 64px);
}
</style> 
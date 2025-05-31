<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <span class="footer-title">Агрегатор курсов</span>
        <span class="footer-copy">© 2025 Все права защищены</span>
      </div>
      <div class="footer-links">
        <a href="/platforms" class="footer-link">Платформы</a>
        <a href="/categories" class="footer-link">Категории</a>
        <a href="/courses" class="footer-link">Все курсы</a>
      </div>
      <div class="footer-contact">
        <span>Связаться: <a href="mailto:support@courses-aggregator.ru">support@courses-aggregator.ru</a></span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
};
</script>

<style lang="scss" scoped>
.footer {
  background: #f3f4f6;
  padding: 32px 0 24px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 40px;
  font-size: 15px;
}
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 0 20px;
}
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 6px;
  .footer-title {
    font-weight: 700;
    color: #2563eb;
    font-size: 1.2rem;
  }
  .footer-copy {
    color: #6b7280;
    font-size: 0.95rem;
  }
}
.footer-links {
  display: flex;
  gap: 20px;
  .footer-link {
    color: #374151;
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: #2563eb;
      text-decoration: underline;
    }
  }
}
.footer-contact {
  color: #4b5563;
  a {
    color: #2563eb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .footer-links {
    gap: 12px;
  }
}
</style> 
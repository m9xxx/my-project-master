import { test, expect } from '@playwright/test';

// Уникальный email для каждого запуска
const randomEmail = `testuser_${Date.now()}@example.com`;
const testUser = {
  name: 'AlexUstinov',
  email: randomEmail,
  password: 'test1234'
};

test('Регистрация нового пользователя через UI', async ({ page }) => {
  // Открываем страницу аутентификации
  await page.goto('http://127.0.0.1:8000/auth');

  // Переключаемся на вкладку "Регистрация"
  await page.getByRole('button', { name: 'Регистрация' }).click();

  // Заполняем поля регистрации
  await page.getByPlaceholder('Введите имя').fill(testUser.name);
  await page.getByPlaceholder('Введите email').fill(testUser.email);
  await page.getByPlaceholder('Введите пароль').fill(testUser.password);
  await page.getByPlaceholder('Подтвердите пароль').fill(testUser.password);

  // Отправляем форму
  await page.getByRole('button', { name: /Зарегистрироваться/ }).click();

  // Ожидаем редирект на главную ("/"), где должен быть виден никнейм пользователя
  await page.waitForURL('http://127.0.0.1:8000/');
  await expect(page.locator('text=Playwright User')).toBeVisible();
}); 
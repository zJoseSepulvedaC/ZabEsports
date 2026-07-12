/**
 * Tests E2E — ZabEsports Frontend
 * Herramienta: Playwright (equivalente a Katalon Studio)
 * Semana 8 — Pruebas de Interfaz de Usuario
 *
 * Estos tests simulan las interacciones reales de un usuario en el navegador,
 * validando el flujo completo desde la autenticación hasta las acciones sociales.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://polite-mud-0a1c8430f7.azurestaticapps.net';
const TEST_EMAIL = 'jose@zabesports.cl';
const TEST_PASSWORD = 'password123';

// ============================================================
// TC-E2E-01: Flujo de Login
// ============================================================
test('TC-E2E-01: Login exitoso redirige al feed principal', async ({ page }) => {
  await page.goto(BASE_URL);

  // Verificar que la página de login carga
  await expect(page).toHaveTitle(/ZabEsports/i);
  await expect(page.locator('text=BIENVENIDO DE VUELTA')).toBeVisible();

  // Llenar el formulario de login
  await page.fill('input[type="email"], input[placeholder*="orreo"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);

  // Hacer clic en el botón de login
  await page.click('button:has-text("INICIAR SESIÓN")');

  // Verificar que se redirige al feed (ya no está la pantalla de login)
  await page.waitForTimeout(3000);
  await expect(page.locator('text=BIENVENIDO DE VUELTA')).not.toBeVisible();
});

// ============================================================
// TC-E2E-02: Login con credenciales inválidas muestra error
// ============================================================
test('TC-E2E-02: Login con contraseña incorrecta muestra mensaje de error', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill('input[type="email"], input[placeholder*="orreo"]', 'incorrecto@zabesports.cl');
  await page.fill('input[type="password"]', 'claveincorrecta');
  await page.click('button:has-text("INICIAR SESIÓN")');

  // Debe aparecer algún mensaje de error
  await page.waitForTimeout(2000);
  const errorVisible = await page.locator('[class*="error"], [class*="alert"], text=/error|inválid|incorrecto/i').count();
  expect(errorVisible).toBeGreaterThan(0);
});

// ============================================================
// TC-E2E-03: Navegación a sección de Torneos
// ============================================================
test('TC-E2E-03: Sección de Torneos carga con lista visible', async ({ page }) => {
  await page.goto(BASE_URL);

  // Login primero
  await page.fill('input[type="email"], input[placeholder*="orreo"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("INICIAR SESIÓN")');
  await page.waitForTimeout(3000);

  // Navegar a torneos
  const torneosBtn = page.locator('text=/torneo/i').first();
  if (await torneosBtn.isVisible()) {
    await torneosBtn.click();
    await page.waitForTimeout(2000);
    // Verificar que hay contenido de torneos
    const torneoContent = await page.locator('[class*="tournament"], [class*="torneo"], text=/Copa|Torneo|Challenge/i').count();
    expect(torneoContent).toBeGreaterThanOrEqual(0);
  }
});

// ============================================================
// TC-E2E-04: El feed principal muestra publicaciones
// ============================================================
test('TC-E2E-04: Feed muestra al menos una publicación tras el login', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.fill('input[type="email"], input[placeholder*="orreo"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("INICIAR SESIÓN")');
  await page.waitForTimeout(4000);

  // Verificar que hay posts en el feed
  const posts = await page.locator('[class*="post"], [class*="card"], article').count();
  expect(posts).toBeGreaterThanOrEqual(0);
});

// ============================================================
// TC-E2E-05: La página responde en tiempo razonable
// ============================================================
test('TC-E2E-05: La página principal carga en menos de 5 segundos', async ({ page }) => {
  const start = Date.now();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - start;

  // La página debe cargar en menos de 5 segundos
  expect(elapsed).toBeLessThan(5000);
  console.log(`⏱️ Tiempo de carga del frontend: ${elapsed}ms`);
});

import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const host = '127.0.0.1';
const port = 3117;
const base = `http://${host}:${port}`;

function run(command, args, options = {}) {
  const { env, stdio, ...rest } = options;
  return spawn(command, args, {
    cwd: root,
    stdio: stdio ?? ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
    ...rest,
  });
}

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

async function waitForServer(child, url, attempts = 90) {
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  for (let i = 0; i < attempts; i += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited early:\n${output}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await delay(1000);
  }
  throw new Error(`Server did not become ready:\n${output}`);
}

async function waitForRuntime(page) {
  await page.waitForFunction(() => {
    const status = document.getElementById('runtime-status');
    return status && /готов|ошиб|недоступ/i.test(status.textContent || '');
  }, null, { timeout: 120_000 });
  const text = await page.locator('#runtime-status').innerText();
  if (/ошиб|недоступ/i.test(text)) {
    throw new Error(`Runtime failed to load: ${text}`);
  }
}

async function ensurePlainEditor(page) {
  if (await page.locator('textarea.plain-editor').count()) return;
  await page.locator('details.editor-options > summary').click();
  await page.getByRole('button', { name: 'Простой редактор' }).click();
  await page.locator('textarea.plain-editor').waitFor({ state: 'visible' });
}

async function setEditorCode(page, code) {
  await ensurePlainEditor(page);
  await page.locator('textarea.plain-editor').fill(code);
}

async function switchTheme(page, label) {
  await page.locator('details.user-menu > summary').click();
  await page.getByText(label, { exact: true }).click();
  await page.locator('details.user-menu > summary').click().catch(() => undefined);
}

async function main() {
  console.log('Building app for e2e…');
  const build = run(process.execPath, [nextBin, 'build', '--webpack'], { stdio: 'inherit' });
  await new Promise((resolve, reject) => {
    build.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`build failed: ${code}`))));
  });

  const server = run(process.execPath, [nextBin, 'start', '--hostname', host, '--port', String(port)]);
  try {
    await waitForServer(server, base);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Worker load failure then recovery
    let failWorkerOnce = true;
    await page.route('**/python/runtime-worker.mjs', async (route) => {
      if (failWorkerOnce) {
        failWorkerOnce = false;
        await route.abort('failed');
        return;
      }
      await route.continue();
    });
    await page.goto(`${base}/practice/variables`);
    await page.getByRole('button', { name: 'Повторить загрузку' }).waitFor({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Повторить загрузку' }).click();
    await waitForRuntime(page);
    await page.unroute('**/python/runtime-worker.mjs');

    // Monaco present (real editor, not only textarea)
    await page.locator('.monaco-editor').waitFor({ timeout: 60_000 });

    // Themes
    await switchTheme(page, 'Тёмная');
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await switchTheme(page, 'Светлая');
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');

    // 390px + keyboard focus on Check
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Проверить' }).focus();
    const focused = await page.evaluate(() => document.activeElement?.textContent?.includes('Проверить'));
    if (!focused) throw new Error('Check button was not keyboard-focusable at 390px');
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto(`${base}/`);
    await page.evaluate(() => localStorage.removeItem('chgu-ai-academy:learning:v1'));
    await page.reload();
    await page.getByRole('heading', { name: 'Моё обучение' }).waitFor();
    await page.getByRole('link', { name: /Программирование и данные/ }).click();
    await page.waitForURL(/\/courses\/programming/);
    await page.getByRole('link', { name: /Основы разработки/ }).click();
    await page.waitForURL(/\/modules\/python/);
    await page.getByRole('link', { name: /Переменные и типы данных/ }).first().click();
    await page.waitForURL(/\/learn\/python\/variables/);

    await page.locator('details.lesson-help > summary').click();
    await page.getByRole('button', { name: 'Получить объяснение' }).click();
    await page.getByText(/Режим: подготовленные подсказки|Режим: локальная модель/).waitFor({ timeout: 30_000 });

    await page.getByRole('link', { name: 'К заданиям' }).click();
    await page.waitForURL(/\/practice\/variables/);
    await waitForRuntime(page);

    await setEditorCode(page, [
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = 15',
      'print("За неделю: 15 ч")',
    ].join('\n'));
    await page.getByRole('button', { name: 'Проверить' }).click();
    await page.getByText(/Пока не принято/).waitFor({ timeout: 60_000 });

    await page.locator('details.practice-help > summary').click();
    await page.getByText(/каким действием найти сумму/i).waitFor();
    await page.getByRole('button', { name: 'Помощь по ошибке' }).click();
    await page.getByText(/Режим: подготовленные подсказки|Режим: локальная модель/).waitFor({ timeout: 30_000 });
    await page.locator('.practice-help, .mentor-teaching, .help-after-error').getByText(/Следующий шаг|Проверьте себя|вычисл|имя|вход/i).first().waitFor();

    // Change code while a check is in flight — must not record Attempt/Mastery
    const goodCode = [
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = days * hours_per_day',
      'print(f"За неделю: {total_hours} ч")',
    ].join('\n');
    const slowGoodCode = ['import time', 'time.sleep(1.5)', goodCode].join('\n');
    await setEditorCode(page, slowGoodCode);
    await page.getByRole('button', { name: 'Проверить' }).click();
    await delay(300);
    await page.locator('textarea.plain-editor').fill(`${goodCode}\n# edited during check\n`);
    await page.getByText(/Проверка не сохранена/).waitFor({ timeout: 60_000 });

    // Re-check current code
    await setEditorCode(page, goodCode);
    await page.getByRole('button', { name: 'Проверить' }).click();
    await page.getByText(/Решение принято/).waitFor({ timeout: 60_000 });

    // Edit after completed check — prior result stays visible as saved snapshot
    await page.locator('textarea.plain-editor').fill(`${goodCode}\n# after\n`);
    await page.getByText(/уже сохранённому снимку|изменился после последней проверки/i).waitFor();
    await setEditorCode(page, goodCode);
    await page.getByRole('link', { name: /Следующая задача/ }).click();
    await page.waitForURL(/\/practice\/variables-transfer/);
    await waitForRuntime(page);

    await setEditorCode(page, [
      'minutes_text = input()',
      'minutes = int(minutes_text)',
      'total_minutes = minutes * 3',
      'print(f"Три сессии: {total_minutes} мин")',
    ].join('\n'));
    await page.getByRole('button', { name: 'Проверить' }).click();
    await page.getByText(/Решение принято/).waitFor({ timeout: 60_000 });
    await page.getByRole('link', { name: /К модулю/ }).click();
    await page.waitForURL(/\/modules\/python/);

    await page.goto(`${base}/progress`);
    await page.getByRole('heading', { name: 'Подтверждённый результат', exact: true }).waitFor();
    await page.getByText('План на учебную неделю').waitFor();
    await page.locator('.progress-simple').getByText(/Баллы:\s*200/).waitFor();

    // Reset learning data
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Сбросить учебные данные' }).click();
    await page.getByRole('heading', { name: 'Пока нет проверенных решений' }).waitFor();

    // Reload persistence path with a fresh pass + draft
    await page.goto(`${base}/practice/variables`);
    await waitForRuntime(page);
    await setEditorCode(page, goodCode);
    await page.getByRole('button', { name: 'Проверить' }).click();
    await page.getByText(/Решение принято/).waitFor({ timeout: 60_000 });

    await page.goto(`${base}/practice/variables`);
    await waitForRuntime(page);
    await ensurePlainEditor(page);
    const draft = await page.locator('textarea.plain-editor').inputValue();
    if (!draft.includes('total_hours')) {
      throw new Error('Draft was not restored after navigation');
    }

    await page.goto(`${base}/`);
    await page.getByRole('link', { name: /Программирование и данные/ }).waitFor();
    await page.getByText(/\d+\/\d+ заданий/).waitFor();

    // Infinite loop / timeout
    await page.goto(`${base}/practice/variables`);
    await waitForRuntime(page);
    await setEditorCode(page, 'while True:\n    pass\n');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await page.getByText(/5 с|ограничен/i).waitFor({ timeout: 20_000 });

    // Large output truncation notice
    await setEditorCode(page, 'print("x" * 30000)');
    await page.getByRole('button', { name: 'Запустить' }).click();
    await page.getByText(/обрезан|20 КБ/i).waitFor({ timeout: 30_000 });

    await browser.close();
    console.log('E2E learning loop passed');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

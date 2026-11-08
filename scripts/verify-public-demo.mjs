import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'competition', 'evidence');
const base = process.env.PUBLIC_DEMO_URL || 'https://chgu-ai-academy.vercel.app';
mkdirSync(evidence, { recursive: true });

const log = [];
function note(msg) {
  console.log(msg);
  log.push(msg);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: undefined,
  });
  const page = await context.newPage();

  const home = await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
  note(`HOME status=${home?.status()}`);
  await page.getByRole('heading', { name: 'Моё обучение' }).waitFor();
  await page.screenshot({ path: path.join(evidence, 'home.png'), fullPage: true });

  await page.getByRole('link', { name: /Основы Python/ }).first().click();
  await page.waitForURL(/\/learn\/python\/variables/, { timeout: 30000 });
  note('LESSON opened');
  await page.screenshot({ path: path.join(evidence, 'lesson.png') });

  // Pyodide assets over HTTPS
  const worker = await page.request.get(base + '/python/runtime-worker.mjs');
  const pyodide = await page.request.get(base + '/python/pyodide.mjs');
  note(`PYODIDE worker=${worker.status()} pyodide.mjs=${pyodide.status()} https=${base.startsWith('https')}`);

  await page.goto(base + '/practice/variables', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const text = document.getElementById('runtime-status')?.textContent || '';
    return /Python готов|Не удалось|недоступ|ошибк/i.test(text) && !/Подготовка/i.test(text);
  }, null, { timeout: 180000 });
  const runtime = await page.locator('#runtime-status').innerText();
  note(`RUNTIME ${runtime}`);
  if (/Не удалось|недоступ|ошибк/i.test(runtime) && !/Python готов/i.test(runtime)) {
    throw new Error('Runtime failed on public site');
  }

  await page.locator('details.editor-options > summary').click();
  const switchBtn = page.getByRole('button', { name: 'Простой редактор' });
  if (await switchBtn.count()) await switchBtn.click();
  await page.locator('textarea.plain-editor').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('textarea.plain-editor').fill([
    'days = int(input())',
    'hours_per_day = int(input())',
    'total_hours = 15',
    'print("За неделю: 15 ч")',
  ].join('\n'));
  await page.getByRole('button', { name: 'Проверить' }).click();
  await page.getByText(/Пока не принято/).waitFor({ timeout: 90000 });
  note('WRONG attempt rejected');

  await page.locator('details.practice-help > summary').click();
  await page.getByRole('button', { name: 'Помощь по ошибке' }).click();
  await page.getByText(/Режим: подготовленные подсказки/).waitFor({ timeout: 30000 });
  note('PREPARED help shown');
  await page.screenshot({ path: path.join(evidence, 'practice-error.png') });

  await page.locator('textarea.plain-editor').fill([
    'days = int(input())',
    'hours_per_day = int(input())',
    'total_hours = days * hours_per_day',
    'print(f"За неделю: {total_hours} ч")',
  ].join('\n'));
  await page.getByRole('button', { name: 'Проверить' }).click();
  await page.getByText(/Решение принято/).waitFor({ timeout: 90000 });
  note('CORRECT attempt accepted');
  await page.screenshot({ path: path.join(evidence, 'practice-success.png') });

  await page.goto(base + '/progress');
  await page.getByText(/План на учебную неделю|Принятые задачи/).first().waitFor();
  note('PROGRESS shows accepted task');
  await page.screenshot({ path: path.join(evidence, 'progress.png') });

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText(/План на учебную неделю|Принятые задачи/).first().waitFor();
  note('PROGRESS persists after reload');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/');
  await page.getByRole('heading', { name: 'Моё обучение' }).waitFor();
  await page.screenshot({ path: path.join(evidence, 'home-mobile.png'), fullPage: true });
  note('MOBILE 390px home ok');

  await page.goto(base + '/practice/variables');
  await page.waitForFunction(() => {
    const text = document.getElementById('runtime-status')?.textContent || '';
    return /Python готов/i.test(text);
  }, null, { timeout: 180000 });
  note('MOBILE practice runtime ready');

  await browser.close();
  writeFileSync(path.join(evidence, 'public-verify.log'), log.join('\n') + '\n');
  note('DONE ' + base);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

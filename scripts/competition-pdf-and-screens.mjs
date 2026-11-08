import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdirSync } from 'node:fs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const competition = path.join(root, 'competition');
const evidence = path.join(competition, 'evidence');
mkdirSync(evidence, { recursive: true });

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const host = '127.0.0.1';
const port = 3127;
const base = `http://${host}:${port}`;

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (c) => { output += c.toString(); });
  child.stderr.on('data', (c) => { output += c.toString(); });
  for (let i = 0; i < 90; i += 1) {
    if (child.exitCode !== null) throw new Error(`server exited\n${output}`);
    try {
      if ((await fetch(base)).ok) return;
    } catch { /* retry */ }
    await delay(1000);
  }
  throw new Error(`server timeout\n${output}`);
}

async function htmlToPdf(browser, htmlName, pdfName) {
  const page = await browser.newPage();
  const fileUrl = pathToFileURL(path.join(competition, htmlName)).href;
  await page.goto(fileUrl);
  await page.pdf({
    path: path.join(competition, pdfName),
    format: 'A4',
    margin: { top: '18mm', bottom: '18mm', left: '18mm', right: '18mm' },
    printBackground: true,
  });
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  await htmlToPdf(browser, 'CHGU_AI_Academy_Zayavka.html', 'CHGU_AI_Academy_Zayavka.pdf');
  await htmlToPdf(browser, 'CHGU_AI_Academy_Pasport.html', 'CHGU_AI_Academy_Pasport.pdf');

  const server = spawn(process.execPath, [nextBin, 'start', '--hostname', host, '--port', String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production', MENTOR_DISABLE_OLLAMA: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer(server);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    await page.goto(`${base}/`);
    await page.screenshot({ path: path.join(evidence, 'home.png'), fullPage: true });

    await page.goto(`${base}/learn/python/variables`);
    await page.locator('h1').waitFor();
    await page.screenshot({ path: path.join(evidence, 'lesson.png'), fullPage: false });

    await page.goto(`${base}/practice/variables`);
    await page.waitForFunction(() => /готов|ошиб/i.test(document.getElementById('runtime-status')?.textContent || ''), null, { timeout: 120000 });
    if (!(await page.locator('textarea.plain-editor').count())) {
      await page.locator('details.editor-options > summary').click();
      await page.getByRole('button', { name: 'Простой редактор' }).click();
    }
    await page.locator('textarea.plain-editor').fill([
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = 15',
      'print("За неделю: 15 ч")',
    ].join('\n'));
    await page.getByRole('button', { name: 'Проверить' }).click();
    await page.getByText(/Пока не принято/).waitFor({ timeout: 60000 });
    await page.locator('details.practice-help > summary').click();
    await page.getByRole('button', { name: 'Помощь по ошибке' }).click();
    await page.getByText(/подготовленные подсказки/i).waitFor({ timeout: 30000 });
    await page.screenshot({ path: path.join(evidence, 'practice-error.png'), fullPage: false });

    await page.locator('textarea.plain-editor').fill([
      'days = int(input())',
      'hours_per_day = int(input())',
      'total_hours = days * hours_per_day',
      'print(f"За неделю: {total_hours} ч")',
    ].join('\n'));
    await page.getByRole('button', { name: 'Проверить' }).click();
    await page.getByText(/Решение принято/).waitFor({ timeout: 60000 });
    await page.screenshot({ path: path.join(evidence, 'practice-success.png'), fullPage: false });

    await page.goto(`${base}/progress`);
    await page.getByRole('heading', { name: /Принятые задачи|Пока нет/ }).waitFor();
    await page.screenshot({ path: path.join(evidence, 'progress.png'), fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/`);
    await page.screenshot({ path: path.join(evidence, 'home-mobile.png'), fullPage: true });

    await page.close();
    console.log('PDF and screenshots written to competition/');
  } finally {
    server.kill('SIGTERM');
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

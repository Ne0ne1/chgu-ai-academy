import { cpSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'pyodide');
const target = join(root, 'public', 'python');
const workerSource = join(root, 'src', 'workers', 'python-runtime.worker.mjs');

if (!existsSync(source)) {
  console.warn('prepare-pyodide: node_modules/pyodide missing; skip');
  process.exit(0);
}

mkdirSync(target, { recursive: true });

const files = [
  'pyodide.mjs',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
  'package.json',
];

for (const file of files) {
  cpSync(join(source, file), join(target, file));
}

writeFileSync(join(target, 'runtime-worker.mjs'), readFileSync(workerSource));
console.log('prepare-pyodide: copied runtime to public/python');

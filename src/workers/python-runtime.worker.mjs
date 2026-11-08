/// Public module worker: loads local Pyodide and runs student code in a fresh namespace.

const MAX_OUTPUT_BYTES = 20 * 1024;
const indexURL = new URL('./', import.meta.url).href;

/** @type {import('pyodide').PyodideInterface | null} */
let pyodide = null;
/** @type {Promise<import('pyodide').PyodideInterface> | null} */
let loading = null;

function truncateText(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  if (bytes.length <= MAX_OUTPUT_BYTES) {
    return { text, truncated: false };
  }
  const slice = bytes.slice(0, MAX_OUTPUT_BYTES);
  return { text: new TextDecoder().decode(slice), truncated: true };
}

function appendOutput(current, chunk) {
  return truncateText(current + chunk);
}

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (!loading) {
    loading = (async () => {
      const { loadPyodide } = await import('./pyodide.mjs');
      const instance = await loadPyodide({ indexURL });
      pyodide = instance;
      return instance;
    })();
  }
  return loading;
}

/**
 * @param {string} stdin
 */
function makeStdin(stdin) {
  const raw = stdin ?? '';
  const normalized = raw.replace(/\r\n/g, '\n');
  const lines = normalized.length === 0 ? [] : normalized.split('\n');
  if (lines.length > 0 && normalized.endsWith('\n')) lines.pop();
  let index = 0;
  return () => {
    if (index >= lines.length) return null;
    const line = lines[index];
    index += 1;
    return line;
  };
}

/**
 * @param {import('pyodide').PyodideInterface} runtime
 * @param {import('pyodide').PyProxy} globals
 * @param {string[]} names
 */
async function readVariables(runtime, globals, names) {
  globals.set('__chgu_names__', names);
  await runtime.runPythonAsync(
    [
      '__chgu_out__ = {}',
      'for __chgu_name in __chgu_names__:',
      '    if __chgu_name not in globals():',
      '        __chgu_out__[__chgu_name] = {"present": False, "typeName": "", "value": None}',
      '    else:',
      '        __chgu_val = globals()[__chgu_name]',
      '        __chgu_out__[__chgu_name] = {',
      '            "present": True,',
      '            "typeName": type(__chgu_val).__name__,',
      '            "value": __chgu_val if isinstance(__chgu_val, (bool, int, float, str)) else None,',
      '        }',
    ].join('\n'),
    { globals },
  );

  const proxy = globals.get('__chgu_out__');
  try {
    const raw = proxy.toJs({ dict_converter: Object.fromEntries });
    /** @type {Record<string, { typeName: string, value: unknown, present: boolean }>} */
    const result = {};
    for (const name of names) {
      const entry = raw[name] ?? { present: false, typeName: '', value: null };
      let value = entry.value;
      if (typeof value === 'bigint') value = Number(value);
      result[name] = {
        present: Boolean(entry.present),
        typeName: String(entry.typeName ?? ''),
        value: value ?? null,
      };
    }
    return result;
  } finally {
    proxy.destroy();
  }
}

self.onmessage = async (event) => {
  const message = event.data;
  if (!message || typeof message !== 'object') return;

  if (message.type === 'init') {
    try {
      await ensurePyodide();
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({
        type: 'load-error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (message.type !== 'run') return;

  const { requestId, code, stdin = '', inspectVariables = [] } = message;
  let stdout = '';
  let stderr = '';
  let truncated = false;

  try {
    const runtime = await ensurePyodide();
    const dict = runtime.globals.get('dict');
    const globals = dict();
    dict.destroy();

    runtime.setStdout({
      batched: (text) => {
        const next = appendOutput(stdout, `${text}\n`);
        stdout = next.text;
        truncated = truncated || next.truncated;
      },
    });
    runtime.setStderr({
      batched: (text) => {
        const next = appendOutput(stderr, `${text}\n`);
        stderr = next.text;
        truncated = truncated || next.truncated;
      },
    });
    runtime.setStdin({ stdin: makeStdin(stdin), error: false, isatty: false });

    try {
      await runtime.runPythonAsync(code, { globals });
      const variables = inspectVariables.length
        ? await readVariables(runtime, globals, inspectVariables)
        : {};
      self.postMessage({
        type: 'result',
        requestId,
        ok: true,
        stdout,
        stderr,
        truncated,
        variables,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      self.postMessage({
        type: 'result',
        requestId,
        ok: false,
        stdout,
        stderr: stderr || errorMessage,
        truncated,
        variables: {},
        errorKind: 'python',
        errorMessage,
      });
    } finally {
      globals.destroy();
    }
  } catch (error) {
    self.postMessage({
      type: 'result',
      requestId,
      ok: false,
      stdout,
      stderr,
      truncated,
      variables: {},
      errorKind: pyodide ? 'worker' : 'load',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
};

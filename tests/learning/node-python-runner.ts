import { loadPyodide, type PyodideInterface } from 'pyodide';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { RuntimeRunResult } from '../../src/lib/runtime/contracts';

const require = createRequire(import.meta.url);
const indexURL = path.dirname(require.resolve('pyodide/package.json')) + path.sep;

let runtimePromise: Promise<PyodideInterface> | null = null;

function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = loadPyodide({ indexURL });
  }
  return runtimePromise;
}

function makeStdin(stdin: string) {
  const normalized = (stdin ?? '').replace(/\r\n/g, '\n');
  const lines = normalized.length === 0 ? [] : normalized.split('\n');
  if (lines.length > 0 && normalized.endsWith('\n')) lines.pop();
  let index = 0;
  return () => {
    if (index >= lines.length) return '';
    const line = lines[index];
    index += 1;
    return line;
  };
}

export async function runPythonNode(input: {
  code: string;
  stdin?: string;
  inspectVariables?: string[];
}): Promise<RuntimeRunResult> {
  const runtime = await getRuntime();
  const dict = runtime.globals.get('dict');
  const globals = dict();
  dict.destroy();

  let stdout = '';
  let stderr = '';
  runtime.setStdout({ batched: (text: string) => { stdout += `${text}\n`; } });
  runtime.setStderr({ batched: (text: string) => { stderr += `${text}\n`; } });
  runtime.setStdin({ stdin: makeStdin(input.stdin ?? ''), isatty: false, error: false });

  try {
    await runtime.runPythonAsync(input.code, { globals });
    const names = input.inspectVariables ?? [];
    const variables: RuntimeRunResult['variables'] = {};
    if (names.length) {
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
      const raw = proxy.toJs({ dict_converter: Object.fromEntries }) as Record<
        string,
        { present: boolean; typeName: string; value: unknown }
      >;
      proxy.destroy();
      for (const name of names) {
        const entry = raw[name] ?? { present: false, typeName: '', value: null };
        variables[name] = {
          present: Boolean(entry.present),
          typeName: String(entry.typeName ?? ''),
          value: typeof entry.value === 'bigint' ? Number(entry.value) : entry.value,
        };
      }
    }
    return {
      requestId: 'node',
      ok: true,
      stdout,
      stderr,
      truncated: false,
      variables,
    };
  } catch (error) {
    return {
      requestId: 'node',
      ok: false,
      stdout,
      stderr: stderr || (error instanceof Error ? error.message : String(error)),
      truncated: false,
      variables: {},
      errorKind: 'python',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  } finally {
    globals.destroy();
  }
}

export type RuntimeStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error' | 'unavailable';

export type RuntimeErrorKind =
  | 'load'
  | 'python'
  | 'worker'
  | 'timeout'
  | 'cancelled'
  | 'truncated_output'
  | 'mismatch'
  | 'unavailable';

export interface InspectedVariable {
  present: boolean;
  typeName: string;
  value: unknown;
}

export interface RuntimeRunInput {
  code: string;
  stdin?: string;
  inspectVariables?: string[];
  timeoutMs?: number;
}

export interface RuntimeRunResult {
  requestId: string;
  ok: boolean;
  stdout: string;
  stderr: string;
  truncated: boolean;
  variables: Record<string, InspectedVariable>;
  errorKind?: RuntimeErrorKind;
  errorMessage?: string;
}

export const RUNTIME_TIMEOUT_MS = 5_000;
export const RUNTIME_OUTPUT_LIMIT_BYTES = 20 * 1024;
export const RUNTIME_WORKER_URL = '/python/runtime-worker.mjs';

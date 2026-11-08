'use client';

import {
  RUNTIME_TIMEOUT_MS,
  RUNTIME_WORKER_URL,
  type RuntimeRunInput,
  type RuntimeRunResult,
  type RuntimeStatus,
} from '@/lib/runtime/contracts';

type StatusListener = (status: RuntimeStatus, detail?: string) => void;

let requestCounter = 0;

function nextRequestId() {
  requestCounter += 1;
  return `req-${Date.now()}-${requestCounter}`;
}

export class PythonRuntimeClient {
  private worker: Worker | null = null;
  private status: RuntimeStatus = 'idle';
  private detail = '';
  private listeners = new Set<StatusListener>();
  private readyPromise: Promise<void> | null = null;
  private runReject: ((reason: Error) => void) | null = null;
  private activeRequestId: string | null = null;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  getStatus() {
    return this.status;
  }

  getDetail() {
    return this.detail;
  }

  subscribe(listener: StatusListener) {
    this.listeners.add(listener);
    listener(this.status, this.detail);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(status: RuntimeStatus, detail = '') {
    this.status = status;
    this.detail = detail;
    for (const listener of this.listeners) listener(status, detail);
  }

  private clearTimeoutHandle() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  private terminateWorker(nextStatus: RuntimeStatus, detail = '', rejectPending = true) {
    this.clearTimeoutHandle();
    if (this.worker) {
      this.worker.onmessage = null;
      this.worker.onerror = null;
      this.worker.terminate();
      this.worker = null;
    }
    this.readyPromise = null;
    this.activeRequestId = null;
    if (rejectPending && this.runReject) {
      const reject = this.runReject;
      this.runReject = null;
      reject(new Error(detail || 'runtime terminated'));
    } else {
      this.runReject = null;
    }
    this.setStatus(nextStatus, detail);
  }

  private createWorker() {
    const worker = new Worker(RUNTIME_WORKER_URL, { type: 'module', name: 'chgu-python-runtime' });
    worker.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'ready') {
        this.setStatus('ready');
        return;
      }
      if (data.type === 'load-error') {
        this.terminateWorker('error', String(data.message ?? 'Не удалось загрузить Python runtime'));
        return;
      }
      if (data.type === 'result') {
        // Results are handled by the awaiting run() promise via a one-shot listener below.
      }
    };
    worker.onerror = (event) => {
      this.terminateWorker('error', event.message || 'Ошибка Python Worker');
    };
    this.worker = worker;
    return worker;
  }

  async ensureReady() {
    if (this.disposed) {
      this.setStatus('unavailable', 'Runtime остановлен');
      throw new Error('Runtime остановлен');
    }
    if (this.status === 'ready' && this.worker) return;
    if (this.status === 'running') return;
    if (this.readyPromise) return this.readyPromise;

    this.setStatus('loading', 'Загрузка Python…');
    const worker = this.worker ?? this.createWorker();

    this.readyPromise = new Promise<void>((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        const data = event.data;
        if (data?.type === 'ready') {
          cleanup();
          this.setStatus('ready');
          resolve();
        } else if (data?.type === 'load-error') {
          cleanup();
          this.terminateWorker('error', String(data.message ?? 'Ошибка загрузки Pyodide'));
          reject(new Error(this.detail));
        }
      };
      const onError = (event: ErrorEvent) => {
        cleanup();
        this.terminateWorker('error', event.message || 'Ошибка Worker');
        reject(new Error(this.detail));
      };
      const cleanup = () => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
      };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage({ type: 'init' });
    });

    return this.readyPromise;
  }

  async retryLoad() {
    this.terminateWorker('idle');
    await this.ensureReady();
  }

  async run(input: RuntimeRunInput): Promise<RuntimeRunResult> {
    if (this.status === 'running') {
      throw new Error('Запрос уже выполняется');
    }

    await this.ensureReady();
    if (!this.worker) throw new Error('Worker недоступен');

    const requestId = nextRequestId();
    const timeoutMs = input.timeoutMs ?? RUNTIME_TIMEOUT_MS;
    this.activeRequestId = requestId;
    this.setStatus('running');

    return new Promise<RuntimeRunResult>((resolve, reject) => {
      const worker = this.worker;
      if (!worker) {
        reject(new Error('Worker недоступен'));
        return;
      }

      this.runReject = reject;

      const finish = (result: RuntimeRunResult) => {
        this.clearTimeoutHandle();
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        this.runReject = null;
        this.activeRequestId = null;
        if (this.status === 'running') this.setStatus('ready');
        resolve(result);
      };

      const onMessage = (event: MessageEvent) => {
        const data = event.data;
        if (data?.type !== 'result') return;
        if (data.requestId !== requestId) return;
        if (this.activeRequestId !== requestId) return;
        finish({
          requestId,
          ok: Boolean(data.ok),
          stdout: String(data.stdout ?? ''),
          stderr: String(data.stderr ?? ''),
          truncated: Boolean(data.truncated),
          variables: data.variables ?? {},
          errorKind: data.errorKind,
          errorMessage: data.errorMessage,
        });
      };

      const onError = (event: ErrorEvent) => {
        if (this.activeRequestId !== requestId) return;
        this.terminateWorker('error', event.message || 'Ошибка Worker', false);
        resolve({
          requestId,
          ok: false,
          stdout: '',
          stderr: event.message || 'Ошибка Worker',
          truncated: false,
          variables: {},
          errorKind: 'worker',
          errorMessage: event.message || 'Ошибка Worker',
        });
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      this.timeoutHandle = setTimeout(() => {
        if (this.activeRequestId !== requestId) return;
        this.terminateWorker('ready', 'Превышено ограничение времени 5 с', false);
        // Recreate worker in background for the next run.
        void this.ensureReady().catch(() => undefined);
        resolve({
          requestId,
          ok: false,
          stdout: '',
          stderr: 'Превышено ограничение времени выполнения (5 с).',
          truncated: false,
          variables: {},
          errorKind: 'timeout',
          errorMessage: 'Превышено ограничение времени выполнения (5 с).',
        });
      }, timeoutMs);

      worker.postMessage({
        type: 'run',
        requestId,
        code: input.code,
        stdin: input.stdin ?? '',
        inspectVariables: input.inspectVariables ?? [],
      });
    });
  }

  cancel(reason = 'Отменено') {
    if (!this.activeRequestId && this.status !== 'running' && this.status !== 'loading') return;
    const requestId = this.activeRequestId ?? nextRequestId();
    this.terminateWorker('ready', reason);
    void this.ensureReady().catch(() => undefined);
    return {
      requestId,
      ok: false,
      stdout: '',
      stderr: reason,
      truncated: false,
      variables: {},
      errorKind: 'cancelled' as const,
      errorMessage: reason,
    };
  }

  dispose() {
    this.disposed = true;
    this.terminateWorker('unavailable', 'Runtime остановлен');
    this.listeners.clear();
  }
}

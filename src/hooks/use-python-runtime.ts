'use client';

import { useEffect, useRef, useState } from 'react';
import { PythonRuntimeClient } from '@/lib/runtime/client';
import type { RuntimeRunInput, RuntimeRunResult, RuntimeStatus } from '@/lib/runtime/contracts';

export function usePythonRuntime() {
  const clientRef = useRef<PythonRuntimeClient | null>(null);
  const [status, setStatus] = useState<RuntimeStatus>('idle');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const client = new PythonRuntimeClient();
    clientRef.current = client;
    const unsubscribe = client.subscribe((next, message) => {
      setStatus(next);
      setDetail(message ?? '');
    });
    void client.ensureReady().catch(() => undefined);
    return () => {
      unsubscribe();
      client.dispose();
      clientRef.current = null;
    };
  }, []);

  async function run(input: RuntimeRunInput): Promise<RuntimeRunResult> {
    const client = clientRef.current;
    if (!client) {
      return {
        requestId: 'none',
        ok: false,
        stdout: '',
        stderr: 'Runtime недоступен',
        truncated: false,
        variables: {},
        errorKind: 'unavailable',
        errorMessage: 'Runtime недоступен',
      };
    }
    return client.run(input);
  }

  async function retryLoad() {
    await clientRef.current?.retryLoad();
  }

  function cancel() {
    return clientRef.current?.cancel('Выполнение отменено');
  }

  const busy = status === 'loading' || status === 'running';

  return { status, detail, busy, run, retryLoad, cancel };
}

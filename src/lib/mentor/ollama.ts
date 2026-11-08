import { getMentorConfig } from '@/lib/mentor/config';
import { MENTOR_LIMITS } from '@/lib/mentor/contracts';

export class MentorModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MentorModelError';
  }
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new MentorModelError(`Таймаут запроса к модели (${timeoutMs} мс)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function isConfiguredModelAvailable(): Promise<{ ok: boolean; model: string; detail?: string }> {
  const { baseUrl, model, timeoutMs } = getMentorConfig();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/tags`, { method: 'GET' }, Math.min(timeoutMs, 5_000));
    if (!response.ok) {
      return { ok: false, model, detail: `Ollama /api/tags: HTTP ${response.status}` };
    }
    const data = (await response.json()) as { models?: { name?: string; model?: string }[] };
    const names = (data.models ?? []).map((item) => item.name || item.model || '');
    const base = model.split(':')[0];
    const found = names.some((name) => name === model || name === base || name.startsWith(`${base}:`));
    if (!found) {
      return {
        ok: false,
        model,
        detail: `Модель «${model}» не найдена в Ollama. Доступны: ${names.slice(0, 8).join(', ') || 'нет'}`,
      };
    }
    return { ok: true, model };
  } catch (error) {
    return {
      ok: false,
      model,
      detail: error instanceof Error ? error.message : 'Ollama недоступна',
    };
  }
}

export async function chatWithOllama(system: string, user: string): Promise<{ text: string; model: string }> {
  const { baseUrl, model, timeoutMs } = getMentorConfig();
  const availability = await isConfiguredModelAvailable();
  if (!availability.ok) {
    throw new MentorModelError(availability.detail || 'Локальная модель недоступна');
  }

  const response = await fetchWithTimeout(
    `${baseUrl}/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        options: { temperature: 0.2 },
      }),
    },
    timeoutMs,
  );

  if (!response.ok) {
    throw new MentorModelError(`Ollama /api/chat: HTTP ${response.status}`);
  }

  const data = (await response.json()) as { message?: { content?: string }; response?: string };
  const text = (data.message?.content ?? data.response ?? '').trim();
  if (!text) {
    throw new MentorModelError('Пустой ответ модели');
  }
  return {
    text: text.slice(0, MENTOR_LIMITS.answerChars),
    model,
  };
}

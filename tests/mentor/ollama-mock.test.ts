import { afterEach, describe, expect, it, vi } from 'vitest';
import { chatWithOllama, isConfiguredModelAvailable, MentorModelError } from '../../src/lib/mentor/ollama';
import { answerMentorRequest } from '../../src/lib/mentor/service';

const BASE = 'http://ollama.mock';
const MODEL = 'llama3.2:3b';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('mentor Ollama path (mocked — not a live model check)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function stubEnv(timeoutMs = '2000') {
    vi.stubEnv('OLLAMA_BASE_URL', BASE);
    vi.stubEnv('OLLAMA_MODEL', MODEL);
    vi.stubEnv('OLLAMA_TIMEOUT_MS', timeoutMs);
  }

  it('reports available model when /api/tags lists it', async () => {
    stubEnv();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(String(url)).toBe(`${BASE}/api/tags`);
        return jsonResponse({ models: [{ name: MODEL }] });
      }),
    );
    const result = await isConfiguredModelAvailable();
    expect(result.ok).toBe(true);
    expect(result.model).toBe(MODEL);
  });

  it('reports missing model when tags omit the configured name', async () => {
    stubEnv();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ models: [{ name: 'other:latest' }] })),
    );
    const result = await isConfiguredModelAvailable();
    expect(result.ok).toBe(false);
    expect(result.detail).toMatch(/не найдена/i);
  });

  it('surfaces /api/chat HTTP errors', async () => {
    stubEnv();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/api/tags')) return jsonResponse({ models: [{ name: MODEL }] });
        return new Response('boom', { status: 500 });
      }),
    );
    await expect(chatWithOllama('sys', 'user')).rejects.toBeInstanceOf(MentorModelError);
    await expect(chatWithOllama('sys', 'user')).rejects.toThrow(/HTTP 500/);
  });

  it('surfaces timeout on hung /api/chat', async () => {
    stubEnv('80');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (String(url).endsWith('/api/tags')) return jsonResponse({ models: [{ name: MODEL }] });
        await new Promise<void>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
        return jsonResponse({});
      }),
    );
    await expect(chatWithOllama('sys', 'user')).rejects.toThrow(/Таймаут/i);
  });

  it('answerMentorRequest uses local_model on mocked success and validates anchors', async () => {
    stubEnv();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/api/tags')) return jsonResponse({ models: [{ name: MODEL }] });
        return jsonResponse({
          message: { content: 'Разберите тип значения. Следующий шаг: проверьте кавычки. Раздел #not-real-anchor.' },
        });
      }),
    );
    const result = await answerMentorRequest({
      context: 'practice',
      lessonId: 'variables',
      exerciseId: 'study-plan',
      hasAttempt: true,
      includeCode: false,
      lastIssue: {
        kind: 'variable_type',
        message: 'У «days» тип str, ожидался int.',
        lessonAnchor: '#types',
      },
    });
    expect(result.mode).toBe('local_model');
    expect(result.modelName).toBe(MODEL);
    expect(result.lessonAnchor).toBe('#types');
  });

  it('answerMentorRequest falls back on mocked chat error', async () => {
    stubEnv();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/api/tags')) return jsonResponse({ models: [{ name: MODEL }] });
        return new Response('nope', { status: 503 });
      }),
    );
    const result = await answerMentorRequest({
      context: 'lesson',
      lessonId: 'variables',
      sectionId: 'names',
    });
    expect(result.mode).toBe('prepared');
    expect(result.notice).toMatch(/недоступна|HTTP 503/i);
    expect(result.lessonAnchor).toBe('#names');
  });
});

/** Server-only settings. Browser must never supply the model URL. */
export function getMentorConfig() {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(/\/$/, '');
  const model = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS ?? 20_000);
  /**
   * Public/production hosts must not wait on unreachable local Ollama.
   * Opt in explicitly with MENTOR_ENABLE_OLLAMA=1 (e.g. private server with Ollama).
   * Local development keeps the optional Ollama attempt unless MENTOR_DISABLE_OLLAMA=1.
   */
  const publicHost = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
  const ollamaEnabled =
    process.env.MENTOR_DISABLE_OLLAMA === '1'
      ? false
      : process.env.MENTOR_ENABLE_OLLAMA === '1'
        ? true
        : !publicHost;
  return {
    baseUrl,
    model,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 20_000,
    ollamaEnabled,
  };
}

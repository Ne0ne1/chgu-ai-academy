'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import type { Lesson } from '@/lib/contracts';

export function CodeBlock({ code, output }: { code: string; output?: string }) {
  const [message, setMessage] = useState('');
  return <div className="code-block"><div className="code-header"><span>Python</span>
    <button onClick={async () => {
      try { await navigator.clipboard.writeText(code); setMessage('Скопировано'); }
      catch { setMessage('Выделите код и скопируйте вручную.'); }
    }} aria-label="Скопировать код"><Copy size={13}/>{message || 'Копировать'}</button>
  </div><pre><code>{code}</code></pre>
    {output && <details className="code-output"><summary>Сначала предположите результат. Показать вывод</summary><pre>{output}</pre></details>}
    <span className="sr-only" role="status">{message}</span>
  </div>;
}

export function SelfCheck({ check, reviewHref }: { check: Lesson['selfCheck']; reviewHref?: string }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return <section className="self-check" id="self-check"><h2>Проверьте понимание</h2><p className="check-question">{check.question}</p>
    <fieldset><legend className="sr-only">Выберите ответ</legend>
      {check.choices.map((option, index) => <label className={`choice ${choice === index ? 'selected' : ''}`} key={option}>
        <input type="radio" name="self-check" checked={choice === index} onChange={() => { setChoice(index); setSubmitted(false); }}/>{option}
      </label>)}
    </fieldset>
    <button className="button secondary" disabled={choice === null} onClick={() => setSubmitted(true)}>Проверить ответ</button>
    {submitted && <div className="feedback" role="status"><strong>{choice === check.correctIndex ? 'Верно.' : 'Разберём ошибку.'}</strong> {check.explanation}
      {choice !== check.correctIndex && reviewHref && <p><a className="text-link" href={reviewHref}>Вернуться к объяснению и попробовать снова</a></p>}
      <p className="small muted">Это самопроверка, а не подтверждение освоения темы.</p>
    </div>}
  </section>;
}

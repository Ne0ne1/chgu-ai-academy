/** One concrete sentence per module for course cards. */
export const moduleBlurbs: Record<string, string> = {
  python: 'Python, переменные, условия, циклы и первые небольшие программы.',
  math: 'Векторы, вероятность и работа с таблицами данных.',
  ml: 'Обучение моделей, метрики качества и честная проверка.',
  dl: 'Нейронные сети, PyTorch и работа с изображениями.',
  llm: 'Языковые модели, поиск по документам и оценка ответов.',
  production: 'API, развёртывание и наблюдение за моделью.',
  capstone: 'Собственный проект: от постановки задачи до защиты.',
};

/** Demo progress fractions for presentation (not student data). */
export const moduleDemoProgress: Record<string, { accepted: number; total: number }> = {
  python: { accepted: 2, total: 12 },
  math: { accepted: 0, total: 8 },
  ml: { accepted: 1, total: 8 },
  dl: { accepted: 0, total: 8 },
  llm: { accepted: 1, total: 8 },
  production: { accepted: 0, total: 6 },
  capstone: { accepted: 0, total: 4 },
};

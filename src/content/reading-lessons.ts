import type { Lesson } from '@/lib/contracts';

function readingLesson(
  id: string,
  slug: string,
  title: string,
  summary: string,
  sections: Lesson['sections'],
): Lesson {
  return {
    id,
    slug,
    title,
    summary,
    estimatedMinutes: 20,
    difficulty: 'beginner',
    prerequisites: ['Предыдущие модули программы'],
    objectives: [summary],
    sections,
    exercises: [],
    references: [],
    selfCheck: {
      question: 'Готовы ли вы перейти к практике, когда она откроется?',
      choices: ['Да', 'Нужно перечитать', 'Пока рано'],
      correctIndex: 0,
      explanation: 'Практика по этой теме появится после публикации заданий.',
    },
  };
}

/** Curriculum-aligned reading lessons (practice may still be closed). */
export const readingLessons: Record<string, Lesson> = {
  'python/conditions': readingLesson(
    'conditions',
    'python/conditions',
    'Условия и логика',
    'Как программа выбирает действие с помощью if, elif и else.',
    [
      {
        id: 'if',
        title: 'Ветвление',
        paragraphs: [
          'Условие отвечает на вопрос «верно ли утверждение?». Если да — выполняется один блок кода, иначе — другой.',
          'В Python после if пишут выражение и двоеточие. Отступ показывает, какие строки относятся к ветке.',
        ],
        code: 'score = 80\nif score >= 60:\n    print("Зачёт")\nelse:\n    print("Ещё попытка")',
        output: 'Зачёт',
      },
      {
        id: 'and-or',
        title: 'and и or',
        paragraphs: [
          'and требует, чтобы оба условия были истинны. or достаточно одного истинного.',
        ],
      },
    ],
  ),
  'python/loops': readingLesson(
    'loops',
    'python/loops',
    'Циклы и коллекции',
    'Повтор шагов и обход списков.',
    [
      {
        id: 'for',
        title: 'Цикл for',
        paragraphs: [
          'for берёт элементы по очереди. Так удобно обрабатывать списки чисел или строк.',
        ],
        code: 'for n in [1, 2, 3]:\n    print(n)',
        output: '1\n2\n3',
      },
    ],
  ),
  'python/functions': readingLesson(
    'functions',
    'python/functions',
    'Функции и декомпозиция',
    'Как выделить повторяющуюся логику в функцию.',
    [
      {
        id: 'def',
        title: 'def',
        paragraphs: [
          'Функция получает аргументы, считает результат и может вернуть его через return.',
        ],
        code: 'def double(x):\n    return x * 2\n\nprint(double(5))',
        output: '10',
      },
    ],
  ),
  'python/tools': readingLesson(
    'tools',
    'python/tools',
    'Git, SQL и API',
    'Краткий обзор инструментов вокруг кода.',
    [
      {
        id: 'overview',
        title: 'Зачем нужны инструменты',
        paragraphs: [
          'Git хранит историю изменений. SQL спрашивает данные у таблиц. API отдаёт данные другим программам.',
          'Практические задания по этой теме появятся позже.',
        ],
      },
    ],
  ),
  'math/vectors': readingLesson(
    'vectors',
    'math/vectors',
    'Векторы и матрицы',
    'Как числа складываются в векторы и таблицы.',
    [
      {
        id: 'vec',
        title: 'Вектор',
        paragraphs: [
          'Вектор — упорядоченный набор чисел. В ML им часто кодируют признаки объекта.',
        ],
      },
    ],
  ),
  'math/stats': readingLesson(
    'stats',
    'math/stats',
    'Статистика и анализ данных',
    'Среднее, разброс и чтение таблиц.',
    [
      {
        id: 'mean',
        title: 'Среднее',
        paragraphs: ['Среднее показывает типичное значение, но чувствительно к выбросам.'],
      },
    ],
  ),
  'ml/models': readingLesson(
    'ml-models',
    'ml/models',
    'Регрессия и классификация',
    'Чем отличаются задачи предсказания числа и класса.',
    [
      {
        id: 'diff',
        title: 'Два типа задач',
        paragraphs: [
          'Регрессия предсказывает число. Классификация выбирает метку из набора.',
        ],
      },
    ],
  ),
  'ml/metrics': readingLesson(
    'ml-metrics',
    'ml/metrics',
    'Метрики, утечки и кросс-валидация',
    'Как честно оценить качество модели.',
    [
      {
        id: 'leak',
        title: 'Утечка данных',
        paragraphs: [
          'Если в обучение попала информация из будущего теста, метрики будут обманчиво высокими.',
        ],
      },
    ],
  ),
  'dl/torch': readingLesson(
    'dl-torch',
    'dl/torch',
    'Нейронные сети с PyTorch',
    'Слои, тензоры и обучение сети.',
    [
      {
        id: 'tensor',
        title: 'Тензор',
        paragraphs: [
          'Тензор — многомерный массив чисел, с которым работает PyTorch.',
          'Практическая проверка кода по этой теме ещё не опубликована — сейчас доступен учебный текст.',
        ],
      },
    ],
  ),
  'dl/vision': readingLesson(
    'dl-vision',
    'dl/vision',
    'Компьютерное зрение и основы NLP',
    'Изображения и текст как входы модели.',
    [
      {
        id: 'img',
        title: 'Изображение как данные',
        paragraphs: ['Картинка для модели — массив пикселей. Текст — последовательность токенов.'],
      },
    ],
  ),
  'llm/embeddings': readingLesson(
    'llm-emb',
    'llm/embeddings',
    'Embeddings и поиск',
    'Как превратить текст в вектор и искать похожие фрагменты.',
    [
      {
        id: 'emb',
        title: 'Близость смыслов',
        paragraphs: [
          'Похожие по смыслу фразы получают близкие векторы. На этом строится поиск по документам.',
        ],
      },
    ],
  ),
  'llm/rag': readingLesson(
    'llm-rag',
    'llm/rag',
    'RAG и оценка LLM',
    'Ответ модели с опорой на найденные источники.',
    [
      {
        id: 'rag',
        title: 'Retrieve → Augment → Generate',
        paragraphs: [
          'Сначала находим фрагменты, затем даём их модели, потом проверяем ответ на точность.',
        ],
      },
    ],
  ),
  'production/api': readingLesson(
    'prod-api',
    'production/api',
    'API и контейнеризация',
    'Как упаковать модель в сервис.',
    [
      {
        id: 'api',
        title: 'Сервис',
        paragraphs: ['API принимает запрос и возвращает предсказание. Контейнер упрощает запуск.'],
      },
    ],
  ),
  'production/monitor': readingLesson(
    'prod-mon',
    'production/monitor',
    'Мониторинг и безопасность',
    'Наблюдение за качеством и доступом.',
    [
      {
        id: 'mon',
        title: 'Что смотреть',
        paragraphs: ['Задержки, ошибки и дрейф данных помогают вовремя заметить проблемы.'],
      },
    ],
  ),
  'capstone/brief': readingLesson(
    'cap-brief',
    'capstone/brief',
    'Постановка задачи и эксперимент',
    'Как сформулировать цель выпускного проекта.',
    [
      {
        id: 'brief',
        title: 'Цель',
        paragraphs: ['Сначала договоритесь о критерии успеха, затем планируйте эксперименты.'],
      },
    ],
  ),
  'capstone/defense': readingLesson(
    'cap-def',
    'capstone/defense',
    'Разработка и защита проекта',
    'Сборка результата и понятный рассказ о нём.',
    [
      {
        id: 'def',
        title: 'Защита',
        paragraphs: ['Покажите задачу, метод, ограничения и что ещё не сделано.'],
      },
    ],
  ),
};

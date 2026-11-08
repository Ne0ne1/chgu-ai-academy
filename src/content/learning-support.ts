export const academicReferences = [
  { title: 'Harvard CS50 Python', url: 'https://cs50.harvard.edu/python/', purpose: 'основы программирования, задачи после объяснений' },
  { title: 'Harvard CS50 AI', url: 'https://cs50.harvard.edu/ai/', purpose: 'поиск, знания, обзор ML и ввод в NLP/LLM после Python' },
  { title: 'MIT 6.036', url: 'https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020/', purpose: 'постановка ML-задач, обобщение и оценка моделей' },
  { title: 'fast.ai', url: 'https://course.fast.ai/', purpose: 'практическая работа с моделями после освоения Python' },
  { title: 'Hugging Face LLM Course', url: 'https://huggingface.co/learn/llm-course/chapter1/1', purpose: 'Transformers и инструменты работы с языковыми моделями' },
];

export interface LessonSupportTopic {
  sectionId: string;
  title: string;
  explanation: string;
  example: string;
  checkQuestion: string;
}

export const lessonSupport: Record<string, LessonSupportTopic[]> = {
  variables: [
    {
      sectionId: 'names',
      title: 'Присваивание',
      explanation:
        'Читайте присваивание справа налево: сначала вычислить значение, затем дать ему имя. В записи tasks = 2 + 1 сначала получается число 3. С ним и связывается имя tasks.',
      example: 'score = 4\nprint(score)',
      checkQuestion: 'Что будет связано с именем value после строк value = 1 и value = value + 2?',
    },
    {
      sectionId: 'reassignment',
      title: 'Изменение значения',
      explanation:
        'Запишите значения имён после каждой строки на бумаге. Когда a = 3, b = a, а потом a = 4, имя b всё ещё связано с числом 3. Это не формула, которая пересчитывается вслед за a.',
      example: 'a = 3\nb = a\na = 4\nprint(b)',
      checkQuestion: 'Почему print(b) не показывает 4?',
    },
    {
      sectionId: 'types',
      title: 'Числа и строки',
      explanation:
        'Посмотрите на кавычки. Без кавычек 2 + 3 означает сложение чисел. С кавычками "2" + "3" означает соединение текста. Тип относится к значению, а не к имени.',
      example: 'print(2 + 3)\nprint("2" + "3")',
      checkQuestion: 'Какой результат у выражения "10" + "2" и почему это не 12?',
    },
    {
      sectionId: 'conversion',
      title: 'Преобразование типов',
      explanation:
        'input() всегда возвращает строку. Если число пришло текстом, арифметике нужно числовое значение: int() для целой записи, float() — для дробной. Спросите себя: можно ли прочитать эту строку как нужное число?',
      example: 'text = "5"\nnumber = int(text)\nprint(number * 2)',
      checkQuestion: 'Что нужно сделать со строкой "8", чтобы умножить её на 3 как число?',
    },
    {
      sectionId: 'mistakes',
      title: 'Как читать ошибку',
      explanation:
        'Начните с последней строки сообщения: тип ошибки и описание. NameError — проверьте имя и порядок строк. TypeError — проверьте типы операндов. Это ориентиры: без вашего результата проверки нельзя назвать точную причину.',
      example: '# Сначала создайте имя, затем используйте его\npoints = 1\nprint(points)',
      checkQuestion: 'Если видите NameError для total, что проверить раньше: формулу или порядок строк?',
    },
  ],
};

export const practiceErrorSupport: Record<
  string,
  { explanation: string; nextStep: string; checkQuestion: string; lessonAnchor: string }
> = {
  runtime: {
    explanation:
      'Программа остановилась с ошибкой выполнения. Чаще всего это неинициализированное имя (NameError), несовместимые типы (TypeError) или синтаксис.',
    nextStep: 'Прочитайте последнюю строку traceback и найдите первое место, где используется проблемное имя или операция.',
    checkQuestion: 'Какой тип ошибки указан в конце сообщения?',
    lessonAnchor: '#mistakes',
  },
  variable_missing: {
    explanation:
      'Проверка смотрит на исполненное состояние: нужное имя после запуска отсутствует. Без этого имени дальше нельзя честно проверить вычисление.',
    nextStep: 'Создайте переменную с требуемым именем до вывода и сохраните в неё результат нужного действия.',
    checkQuestion: 'Какое имя требует условие задачи и в какой строке вы его создаёте?',
    lessonAnchor: '#names',
  },
  variable_type: {
    explanation:
      'Значение есть, но тип другой. Например, строка вместо int: тогда арифметика и сравнение с числом ведут себя иначе.',
    nextStep: 'Посмотрите, откуда пришло значение. Если из input() или из кавычек — преобразуйте подходящей функцией до вычислений.',
    checkQuestion: 'Это значение пришло текстом или уже числом?',
    lessonAnchor: '#types',
  },
  variable_value: {
    explanation:
      'Тип подходит, но число не совпало с входом теста. Часто печатают константу вместо вычисления или путают операцию.',
    nextStep: 'Возьмите один набор входных данных с листа и вручную посчитайте ожидаемый результат, затем сравните с вашей формулой.',
    checkQuestion: 'Каким действием из двух входных чисел получается нужный итог?',
    lessonAnchor: '#names',
  },
  stdout: {
    explanation:
      'Вычисление могло быть верным, но текст вывода не совпал: слова, пробелы, число или формат f-строки.',
    nextStep: 'Сверьте одну готовую фразу из условия посимвольно и подставьте в неё вычисленное значение через f-строку.',
    checkQuestion: 'Совпадают ли пробелы и единицы измерения с образцом?',
    lessonAnchor: '#conversion',
  },
  truncated: {
    explanation: 'Вывод слишком большой и был обрезан. Для учебной задачи нужен короткий осмысленный print.',
    nextStep: 'Уберите циклы, которые печатают огромный текст, и оставьте одну итоговую строку.',
    checkQuestion: 'Сколько строк вы реально хотите показать проверяющему?',
    lessonAnchor: '#mistakes',
  },
  default: {
    explanation:
      'Проверка не приняла решение. Разберите сообщение об ошибке или расхождение вывода — оценка ставится только тестами, не подсказкой.',
    nextStep: 'Выберите одно несовпадение (имя, тип, значение или текст) и исправьте только его, затем проверьте снова.',
    checkQuestion: 'Какой один факт из результата проверки вы можете подтвердить?',
    lessonAnchor: '#mistakes',
  },
};

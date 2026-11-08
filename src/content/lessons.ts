import type { Lesson, Exercise, DiagnosticQuestion } from '@/lib/contracts';

export const variablesLesson: Lesson = {
  id: 'variables',
  slug: 'python/variables',
  title: 'Переменные и типы данных',
  summary: 'Научитесь сохранять значения, выбирать понятные имена и понимать, с какими данными работает Python.',
  estimatedMinutes: 25,
  difficulty: 'beginner',
  prerequisites: ['Опыт программирования не требуется'],
  objectives: [
    'Создать переменную и изменить её значение',
    'Различать int, float, str и bool',
    'Преобразовать строку в число и объяснить результат',
  ],
  sections: [
    {
      id: 'names',
      title: 'Имя для значения',
      paragraphs: [
        'В программе нужно запоминать данные: имя студента, число задач, средний балл. Переменная связывает имя со значением. Потом это имя можно использовать в вычислениях и выводе.',
        'Знак = означает присваивание. Python сначала вычисляет выражение справа, затем связывает результат с именем слева. Это не математическое равенство.',
      ],
      code: 'student_name = "Амина"\nsolved_tasks = 3\n\nprint(student_name)\nprint(solved_tasks)',
      output: 'Амина\n3',
      note: 'Выбирайте понятные имена в snake_case: solved_tasks понятнее, чем x. Имя не начинается с цифры и не содержит пробелов.',
    },
    {
      id: 'reassignment',
      title: 'Как меняется значение',
      paragraphs: [
        'Присваивание можно повторить. В следующем примере Python берёт текущее значение solved_tasks, прибавляет единицу и сохраняет результат под тем же именем.',
        'Присваивание одного имени другому не создаёт живую формулу. Переменная previous остаётся связана со старым числом.',
      ],
      code: 'solved_tasks = 3\nprevious = solved_tasks\nsolved_tasks = solved_tasks + 1\n\nprint(previous)\nprint(solved_tasks)',
      output: '3\n4',
    },
    {
      id: 'types',
      title: 'Четыре базовых типа',
      paragraphs: [
        'int — целое число: 12. float — число с дробной частью: 3.5. str — строка, записанная в кавычках. bool — логическое значение True или False. Регистр этих слов имеет значение.',
        'Тип относится к значению. Python определяет его автоматически. Функция type() позволяет узнать тип, а одна и та же операция может вести себя по-разному для разных типов.',
      ],
      code: 'weeks = 12            # int\nhours = 2.5           # float\ntrack = "Python"      # str\nis_ready = True       # bool\n\nprint(2 + 3)\nprint("2" + "3")\nprint(type(weeks))',
      output: "5\n23\n<class 'int'>",
      note: 'Кавычки меняют смысл: 12 — число, "12" — текст. Оператор + складывает числа, но соединяет строки.',
    },
    {
      id: 'conversion',
      title: 'Из текста в число',
      paragraphs: [
        'input() всегда возвращает строку. Чтобы использовать введённое значение в арифметике, преобразуйте его с помощью int() или float().',
        'Преобразование возможно только для подходящей строки. int("три") и int("3.5") вызовут ValueError. Для дробной записи с точкой используйте float().',
        'Буква f перед кавычками создаёт форматированную строку: Python вычисляет выражения в фигурных скобках и вставляет их значения в текст. Например, f"Баллы: {2 + 3}" даст строку "Баллы: 5".',
      ],
      code: 'hours_text = "3"\nhours = int(hours_text)\nweekly_hours = hours * 5\n\nprint(f"За неделю: {weekly_hours} ч")',
      output: 'За неделю: 15 ч',
    },
    {
      id: 'mistakes',
      title: 'Ошибки — часть обучения',
      paragraphs: [
        'NameError означает, что имя ещё не определено: проверьте порядок строк и опечатки. Имена score и Score различаются.',
        'TypeError может возникнуть при сложении строки и числа: "Баллы: " + 5. Используйте f-строку или явное преобразование str(5).',
        'Не называйте переменную print, str или int: эти имена уже используются встроенными функциями. Присваивание не запрещено, но после него вызвать функцию привычным способом не получится.',
      ],
      code: 'score = 5\nprint(f"Баллы: {score}")\n\n# Сначала определяем имя, затем используем\nnext_score = score + 1\nprint(next_score)',
      output: 'Баллы: 5\n6',
    },
  ],
  exercises: ['study-plan', 'session-minutes'],
  references: [
    {
      title: 'Python Tutorial · An Informal Introduction',
      url: 'https://docs.python.org/3/tutorial/introduction.html',
      attribution:
        'Дополнительное чтение. Текст урока и примеры написаны для этого проекта; материал источника не воспроизводится.',
    },
  ],
  selfCheck: {
    question: 'Что выведет print(count), если count = "3", а следующая строка — count = count + "1"?',
    choices: ['4', '31', 'Будет ошибка'],
    correctIndex: 1,
    explanation:
      'Оба значения — строки. Оператор + соединяет их, поэтому получается строка "31". Для сложения чисел понадобится int(count) + 1.',
  },
};

export const conditionsLesson: Lesson = {
  id: 'conditions',
  slug: 'python/conditions',
  title: 'Условия и логика',
  summary:
    'Научитесь сравнивать значения, строить ветвления if/elif/else и комбинировать условия с and, or и not — чтобы программа выбирала разные действия.',
  estimatedMinutes: 30,
  difficulty: 'beginner',
  prerequisites: ['Урок «Переменные и типы данных» или знакомство с int, str и input()'],
  objectives: [
    'Сравнить два значения и получить True или False',
    'Записать ветку if / elif / else с отступами',
    'Объединить условия через and / or / not и объяснить результат',
  ],
  sections: [
    {
      id: 'compare',
      title: 'Сравнение — вопрос к данным',
      paragraphs: [
        'Условие отвечает на вопрос о данных: больше ли балл порога, равна ли строка ожидаемой. Операторы сравнения: == (равно), != (не равно), <, >, <=, >=.',
        'Результат сравнения — значение типа bool: True или False. Его можно сохранить в переменную или сразу поставить после if.',
      ],
      code: 'score = 72\npassed = score >= 60\nprint(passed)\nprint(score == 100)',
      output: 'True\nFalse',
      note: 'Один знак = — присваивание. Два знака == — сравнение. Путать их — частая причина SyntaxError или неожиданной логики.',
    },
    {
      id: 'bool',
      title: 'True, False и смысл «да/нет»',
      paragraphs: [
        'True и False пишутся с заглавной буквы. Это не строки: "True" в кавычках — текст, а True без кавычек — логическое значение.',
        'В учебных задачах часто кодируют да/нет числом 1 или 0, а затем сравнивают. Главное — явно решить, что означает каждый вход.',
      ],
      code: 'is_ready = True\nflag = 1\nprint(is_ready)\nprint(flag == 1)',
      output: 'True\nTrue',
    },
    {
      id: 'branch',
      title: 'Ветвление if и else',
      paragraphs: [
        'Конструкция if запускает блок кода только когда условие истинно. После условия обязательно двоеточие. Тело блока пишется с отступом (обычно 4 пробела).',
        'else срабатывает, когда условие if ложно. Так программа выбирает ровно одну из двух веток.',
      ],
      code: 'score = 55\nif score >= 60:\n    decision = "Допуск"\nelse:\n    decision = "Повторить"\nprint(decision)',
      output: 'Повторить',
      note: 'Без отступа Python не поймёт, какие строки относятся к ветке. Смешивать табы и пробелы в одном файле нельзя.',
    },
    {
      id: 'elif',
      title: 'Несколько вариантов: elif',
      paragraphs: [
        'Когда вариантов больше двух, используйте elif («иначе если»). Python проверяет условия сверху вниз и выполняет только первую подходящую ветку.',
        'Порядок важен: сначала более узкие или приоритетные случаи, затем общий else.',
      ],
      code: 'score = 83\nif score >= 90:\n    level = "отлично"\nelif score >= 60:\n    level = "зачёт"\nelse:\n    level = "работа над ошибками"\nprint(level)',
      output: 'зачёт',
    },
    {
      id: 'logic',
      title: 'and, or и not',
      paragraphs: [
        'and истинен, только если истинны оба условия. or — если истинно хотя бы одно. not меняет True на False и наоборот.',
        'Скобки помогают читать сложные выражения. Сначала сформулируйте правило словами, затем переведите его в код.',
      ],
      code: 'temperature = 12\nis_rainy = 0\noutdoor = temperature >= 10 and is_rainy == 0\nprint(outdoor)\nprint(not outdoor)',
      output: 'True\nFalse',
    },
    {
      id: 'mistakes',
      title: 'Типичные ошибки в условиях',
      paragraphs: [
        'Забыли двоеточие после if — SyntaxError. Неверный отступ — IndentationError. Сравнение строки и числа («60» >= 60) ведёт себя иначе, чем сравнение двух чисел: сначала преобразуйте вход через int().',
        'Если все тесты ждут разный вывод, не печатайте одну константу: пересчитайте решение для каждого входа. Подсказка не засчитывает задачу — засчитывает только успешная проверка.',
      ],
      code: 'value = int("60")\nif value >= 60:\n    print("ок")\nelse:\n    print("мало")',
      output: 'ок',
    },
  ],
  exercises: ['practice-pass', 'study-mode'],
  references: [
    {
      title: 'Python Tutorial · More Control Flow Tools',
      url: 'https://docs.python.org/3/tutorial/controlflow.html',
      attribution:
        'Дополнительное чтение. Текст урока и задачи написаны для этого проекта; материал источника не воспроизводится.',
    },
  ],
  selfCheck: {
    question: 'Что выведет программа, если x = 5: if x > 10: print("A") elif x > 3: print("B") else: print("C")?',
    choices: ['A', 'B', 'C'],
    correctIndex: 1,
    explanation:
      'Условие x > 10 ложно, поэтому ветка A не выполняется. Следующее условие x > 3 истинно, печатается B. else не нужен.',
  },
};

export const lessons: Record<string, Lesson> = {
  'python/variables': variablesLesson,
  'python/conditions': conditionsLesson,
};

export const exercises: Record<string, Exercise> = {
  variables: {
    id: 'study-plan',
    lessonId: 'variables',
    title: 'План на учебную неделю',
    statement:
      'Программа читает два целых числа через input(): сначала число учебных дней, затем число часов в день (каждое значение — на своей строке). Сохраните их в переменные days и hours_per_day. Вычислите total_hours как произведение этих чисел и выведите строку вида «За неделю: 15 ч» с помощью f-строки. Для проверки будут разные наборы входных данных — не подставляйте ответ константой.',
    starterCode:
      '# Сколько времени выделим на обучение?\ndays = int(input())\nhours_per_day = int(input())\n\n# Вычислите total_hours и выведите результат\n',
    expectedSkillIds: ['python.variables', 'python.arithmetic', 'python.fstrings'],
    visibleTests: [
      {
        id: 'case-5-3',
        description: 'Ввод 5 и 3 → итог 15 часов',
        stdin: '5\n3\n',
        expectedStdout: 'За неделю: 15 ч',
        variableChecks: [
          { name: 'days', expectedType: 'int', expectedValue: 5 },
          { name: 'hours_per_day', expectedType: 'int', expectedValue: 3 },
          { name: 'total_hours', expectedType: 'int', expectedValue: 15 },
        ],
      },
      {
        id: 'case-4-2',
        description: 'Ввод 4 и 2 → итог 8 часов',
        stdin: '4\n2\n',
        expectedStdout: 'За неделю: 8 ч',
        variableChecks: [
          { name: 'days', expectedType: 'int', expectedValue: 4 },
          { name: 'hours_per_day', expectedType: 'int', expectedValue: 2 },
          { name: 'total_hours', expectedType: 'int', expectedValue: 8 },
        ],
      },
    ],
    hiddenTests: [],
    hints: [
      'Сначала решите без кода: если каждый день вы занимаетесь одинаковое время, каким действием найти сумму за все дни?',
      'Прочитайте оба числа через input() и int(), сохраните их под именами days и hours_per_day, затем вычислите произведение.',
      'Чтобы подставить значение в текст, используйте f-строку и имя переменной в фигурных скобках. Сверьте пробелы с ожидаемым выводом.',
    ],
  },
  'variables-transfer': {
    id: 'session-minutes',
    lessonId: 'variables',
    title: 'Минуты из текста',
    statement:
      'Программа получает одну строку через input() — длительность учебной сессии в минутах, записанную текстом (она уже читается в minutes_text). Преобразуйте её в целое число minutes, вычислите total_minutes как длительность трёх таких сессий и выведите строку вида «Три сессии: 75 мин» с помощью f-строки. Проверка смотрит на исполненные значения и вывод при разных входах, а не на дословное копирование примера из урока.',
    starterCode:
      '# Длительность одной сессии приходит текстом\nminutes_text = input()\n\n# Преобразуйте в число, вычислите три сессии и выведите результат\n',
    expectedSkillIds: ['python.conversion', 'python.variables', 'python.fstrings'],
    visibleTests: [
      {
        id: 'case-25',
        description: 'Ввод "25" → три сессии 75 минут',
        stdin: '25\n',
        expectedStdout: 'Три сессии: 75 мин',
        variableChecks: [
          { name: 'minutes_text', expectedType: 'str', expectedValue: '25' },
          { name: 'minutes', expectedType: 'int', expectedValue: 25 },
          { name: 'total_minutes', expectedType: 'int', expectedValue: 75 },
        ],
      },
      {
        id: 'case-10',
        description: 'Ввод "10" → три сессии 30 минут',
        stdin: '10\n',
        expectedStdout: 'Три сессии: 30 мин',
        variableChecks: [
          { name: 'minutes_text', expectedType: 'str', expectedValue: '10' },
          { name: 'minutes', expectedType: 'int', expectedValue: 10 },
          { name: 'total_minutes', expectedType: 'int', expectedValue: 30 },
        ],
      },
    ],
    hiddenTests: [],
    hints: [
      'Вход уже лежит в minutes_text как строка. Какая функция делает из подходящей текстовой записи целое число?',
      'После преобразования посчитайте длительность трёх одинаковых сессий и сохраните её под отдельным именем.',
      'Соберите итоговую фразу через f-строку. Проверьте слова, пробелы и единицы измерения в образце вывода.',
    ],
  },
  conditions: {
    id: 'practice-pass',
    lessonId: 'conditions',
    title: 'Допуск к практике',
    statement:
      'Программа читает одно целое число score — балл самопроверки. Если score >= 60, сохраните в decision строку «Допуск», иначе — «Повторить». Выведите decision одной строкой. Проверка подаёт разные баллы: не подставляйте ответ константой.',
    starterCode:
      '# Балл самопроверки\nscore = int(input())\n\n# Заполните decision через if/else и выведите его\n',
    expectedSkillIds: ['python.conditions', 'python.comparisons'],
    visibleTests: [
      {
        id: 'case-75',
        description: 'Ввод 75 → Допуск',
        stdin: '75\n',
        expectedStdout: 'Допуск',
        variableChecks: [
          { name: 'score', expectedType: 'int', expectedValue: 75 },
          { name: 'decision', expectedType: 'str', expectedValue: 'Допуск' },
        ],
      },
      {
        id: 'case-60',
        description: 'Ввод 60 → Допуск (граница)',
        stdin: '60\n',
        expectedStdout: 'Допуск',
        variableChecks: [
          { name: 'score', expectedType: 'int', expectedValue: 60 },
          { name: 'decision', expectedType: 'str', expectedValue: 'Допуск' },
        ],
      },
      {
        id: 'case-59',
        description: 'Ввод 59 → Повторить',
        stdin: '59\n',
        expectedStdout: 'Повторить',
        variableChecks: [
          { name: 'score', expectedType: 'int', expectedValue: 59 },
          { name: 'decision', expectedType: 'str', expectedValue: 'Повторить' },
        ],
      },
    ],
    hiddenTests: [],
    hints: [
      'Сформулируйте правило словами: при каком балле студент получает допуск, а когда — повтор?',
      'После чтения score сравните его с порогом 60 через >= и запишите ветки if/else.',
      'В обеих ветках создайте одно и то же имя decision, затем один раз выведите его.',
    ],
  },
  'conditions-logic': {
    id: 'study-mode',
    lessonId: 'conditions',
    title: 'Где заниматься',
    statement:
      'Программа читает два целых числа: temperature (температура) и is_rainy (1 — дождь, 0 — без дождя). Если temperature >= 10 и is_rainy == 0, сохраните в mode строку «На улице», иначе — «В помещении». Выведите mode. Проверка использует несколько наборов входов.',
    starterCode:
      '# Погода для учебной прогулки\ntemperature = int(input())\nis_rainy = int(input())\n\n# Заполните mode через условие с and и выведите его\n',
    expectedSkillIds: ['python.conditions', 'python.bool', 'python.comparisons'],
    visibleTests: [
      {
        id: 'case-warm-dry',
        description: '15 и 0 → На улице',
        stdin: '15\n0\n',
        expectedStdout: 'На улице',
        variableChecks: [
          { name: 'temperature', expectedType: 'int', expectedValue: 15 },
          { name: 'is_rainy', expectedType: 'int', expectedValue: 0 },
          { name: 'mode', expectedType: 'str', expectedValue: 'На улице' },
        ],
      },
      {
        id: 'case-warm-rain',
        description: '15 и 1 → В помещении',
        stdin: '15\n1\n',
        expectedStdout: 'В помещении',
        variableChecks: [
          { name: 'temperature', expectedType: 'int', expectedValue: 15 },
          { name: 'is_rainy', expectedType: 'int', expectedValue: 1 },
          { name: 'mode', expectedType: 'str', expectedValue: 'В помещении' },
        ],
      },
      {
        id: 'case-cold-dry',
        description: '5 и 0 → В помещении',
        stdin: '5\n0\n',
        expectedStdout: 'В помещении',
        variableChecks: [
          { name: 'temperature', expectedType: 'int', expectedValue: 5 },
          { name: 'is_rainy', expectedType: 'int', expectedValue: 0 },
          { name: 'mode', expectedType: 'str', expectedValue: 'В помещении' },
        ],
      },
    ],
    hiddenTests: [],
    hints: [
      'Правило словами: на улице только если достаточно тепло и нет дождя. Иначе — в помещении.',
      'Соедините два сравнения через and: temperature >= 10 и is_rainy == 0.',
      'Сохраните результат выбора в mode в обеих ветках и выведите одно имя.',
    ],
  },
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'types-1',
    skillId: 'python.types',
    prompt: 'Какое значение получится у выражения "2" + "3"?',
    choices: [
      { id: 'a', text: 'Число 5' },
      { id: 'b', text: 'Строка "23"' },
      { id: 'c', text: 'Ошибка' },
      { id: 'skip', text: 'Пока не знаю' },
    ],
    correctChoiceId: 'b',
    explanation: 'Оператор + соединяет две строки.',
  },
];

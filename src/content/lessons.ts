import type { Lesson, Exercise, DiagnosticQuestion } from '@/lib/contracts';
import { readingLessons } from '@/content/reading-lessons';

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
  exercises: ['study-plan', 'session-minutes', 'name-greeting', 'next-year', 'two-average'],
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

export const lessons: Record<string, Lesson> = {
  'python/variables': variablesLesson,
  ...readingLessons,
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
  'variables-greeting': {
    id: 'name-greeting',
    lessonId: 'variables',
    title: 'Приветствие',
    statement:
      'Программа читает одно слово — имя — через input() в переменную name. Выведите строку вида «Привет, Амина!» с помощью f-строки. Имя должно браться из ввода, а не из константы.',
    starterCode: 'name = input()\n\n# Выведите приветствие\n',
    expectedSkillIds: ['python.variables', 'python.fstrings'],
    visibleTests: [
      {
        id: 'case-amina',
        description: 'Ввод Амина',
        stdin: 'Амина\n',
        expectedStdout: 'Привет, Амина!',
        variableChecks: [{ name: 'name', expectedType: 'str', expectedValue: 'Амина' }],
      },
      {
        id: 'case-isa',
        description: 'Ввод Иса',
        stdin: 'Иса\n',
        expectedStdout: 'Привет, Иса!',
        variableChecks: [{ name: 'name', expectedType: 'str', expectedValue: 'Иса' }],
      },
    ],
    hiddenTests: [],
    hints: [
      'Сохраните результат input() в name.',
      'Соберите фразу через f-строку: f"Привет, {name}!"',
      'Проверьте пробел после запятой и восклицательный знак в конце.',
    ],
  },
  'variables-next-year': {
    id: 'next-year',
    lessonId: 'variables',
    title: 'Следующий год',
    statement:
      'Программа читает возраст текстом в age_text через input(). Преобразуйте в целое age, вычислите next_age = age + 1 и выведите «Через год: 19» с помощью f-строки.',
    starterCode: 'age_text = input()\n\n# Преобразуйте, прибавьте 1 и выведите результат\n',
    expectedSkillIds: ['python.conversion', 'python.variables', 'python.fstrings'],
    visibleTests: [
      {
        id: 'case-18',
        description: 'Ввод 18',
        stdin: '18\n',
        expectedStdout: 'Через год: 19',
        variableChecks: [
          { name: 'age_text', expectedType: 'str', expectedValue: '18' },
          { name: 'age', expectedType: 'int', expectedValue: 18 },
          { name: 'next_age', expectedType: 'int', expectedValue: 19 },
        ],
      },
      {
        id: 'case-20',
        description: 'Ввод 20',
        stdin: '20\n',
        expectedStdout: 'Через год: 21',
        variableChecks: [
          { name: 'age', expectedType: 'int', expectedValue: 20 },
          { name: 'next_age', expectedType: 'int', expectedValue: 21 },
        ],
      },
    ],
    hiddenTests: [],
    hints: [
      'age_text — строка. Для арифметики нужен int(age_text).',
      'Сохраните age + 1 в next_age.',
      'Выведите f"Через год: {next_age}" без лишних пробелов.',
    ],
  },
  'variables-average': {
    id: 'two-average',
    lessonId: 'variables',
    title: 'Среднее двух чисел',
    statement:
      'Программа читает два целых числа a и b (каждое на своей строке). Вычислите average как (a + b) / 2 — это будет float — и выведите «Среднее: 4.5» с помощью f-строки.',
    starterCode: 'a = int(input())\nb = int(input())\n\n# Вычислите average и выведите результат\n',
    expectedSkillIds: ['python.variables', 'python.arithmetic', 'python.fstrings'],
    visibleTests: [
      {
        id: 'case-3-6',
        description: 'Ввод 3 и 6',
        stdin: '3\n6\n',
        expectedStdout: 'Среднее: 4.5',
        variableChecks: [
          { name: 'a', expectedType: 'int', expectedValue: 3 },
          { name: 'b', expectedType: 'int', expectedValue: 6 },
          { name: 'average', expectedType: 'float', expectedValue: 4.5 },
        ],
      },
      {
        id: 'case-2-2',
        description: 'Ввод 2 и 2',
        stdin: '2\n2\n',
        expectedStdout: 'Среднее: 1.0',
        variableChecks: [{ name: 'average', expectedType: 'float', expectedValue: 1.0 }],
      },
    ],
    hiddenTests: [],
    hints: [
      'Деление / в Python даёт float даже для целых.',
      'average = (a + b) / 2',
      'Формат вывода: f"Среднее: {average}"',
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

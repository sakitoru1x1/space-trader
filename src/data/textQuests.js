import { VOID_QUESTS } from './voidQuests.js';

// ============== TEXT QUESTS (Oldschool Text Adventure Style) ==============

export const TEXT_QUESTS = [
  ...VOID_QUESTS,
  // ===== 1. ЗАБРОШЕННАЯ ЛАБОРАТОРИЯ (research) =====
  {
    id: 'abandoned_lab',
    title: 'Заброшенная лаборатория',
    planetType: 'research',
    minDay: 5,
    oneTime: true,
    ascii: [
      '     _______________',
      '    /               \\',
      '   /  BIOLAB  OMEGA  \\',
      '  /___________________\\',
      '  |  ___   ___   ___  |',
      '  | |!!!| |   | |>>>| |',
      '  | |!!!| | X | |>>>| |',
      '  | |___| |___| |___| |',
      '  |   _____________   |',
      '  |  |  DANGER!!!  |  |',
      '  |  |_____________|  |',
      '  |___________________|',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/abandoned_lab.png',
        text: 'Лаборатория "Омега". Электричество мигает - генератор на последнем издыхании. На полу разбитые колбы, стены в царапинах. Пахнет химикатами и чем-то живым. Энергосистема в критическом состоянии - долго не протянет.',
        ascii: [
          '  > TERMINAL ACTIVE',
          '  > LAST LOG: 247 DAYS AGO',
          '  > POWER: 12% [||||........]',
          '  > WARNING: CONTAINMENT BREACH',
        ].join('\n'),
        options: [
          { text: 'Проверить терминал', next: 'terminal' },
          { text: 'Идти в хранилище', next: 'storage' },
          { text: 'Осмотреть энергоблок', next: 'power_room' },
          { text: 'Уйти', next: 'end_leave' },
        ]
      },
      terminal: {
        text: 'Терминал мигает. Последняя запись: "Эксперимент 17-Б вышел из-под контроля. Образцы мутировали. Мы закрыли секцию С, но стены не удержат их долго. Если кто-то это читает - НЕ ОТКРЫВАЙТЕ СЕКЦИЮ С."\n\nВ боковом меню - "НАУЧНАЯ БАЗА ДАННЫХ" и "ДОСТУП К УРОВНЮ B2".',
        ascii: [
          '  ┌─────────────────────┐',
          '  │ LOG #1742           │',
          '  │ STATUS: ■■CRITICAL■■│',
          '  │ SECTION C: LOCKED   │',
          '  │ [DATABASE] [B2-KEY] │',
          '  └─────────────────────┘',
        ].join('\n'),
        options: [
          { text: 'Скачать базу данных', next: 'download', check: { stat: 'scanner', value: true, failNext: 'download_fail' } },
          { text: 'Запросить код доступа B2', next: 'b2_access', check: { stat: 'reputation', faction: 'scientists', min: 10, failNext: 'b2_denied' } },
          { text: 'Открыть секцию С', next: 'section_c' },
          { text: 'Идти в хранилище', next: 'storage' },
          { text: 'Осмотреть энергоблок', next: 'power_room' },
        ]
      },
      download: {
        text: 'Сканер обошёл защиту. Данные скачаны - формулы генетических модификаций, записи экспериментов, карта лаборатории. Среди файлов - упоминание "аномальных кристаллов" из шахтёрского сектора.',
        options: [
          { text: 'Открыть секцию С', next: 'section_c' },
          { text: 'Спуститься на B2', next: 'b2_check' },
          { text: 'Уйти с данными', next: 'end_data' },
        ]
      },
      download_fail: {
        text: 'Без сканера не обойти защиту. Экран мигает "ACCESS DENIED".',
        options: [
          { text: 'Открыть секцию С', next: 'section_c' },
          { text: 'Идти в хранилище', next: 'storage' },
          { text: 'Осмотреть энергоблок', next: 'power_room' },
        ]
      },
      b2_access: {
        text: 'Система распознала ваш научный допуск. "ДОБРО ПОЖАЛОВАТЬ, ИССЛЕДОВАТЕЛЬ. УРОВЕНЬ B2 РАЗБЛОКИРОВАН." На экране появляется схема нижнего уровня - там основная серверная и криохранилище.',
        options: [
          { text: 'Спуститься на B2', next: 'b2_corridor' },
          { text: 'Сначала осмотреть всё наверху', next: 'storage' },
        ]
      },
      b2_denied: {
        text: '"НЕДОСТАТОЧНЫЙ УРОВЕНЬ ДОПУСКА. ТРЕБУЕТСЯ АВТОРИЗАЦИЯ НАУЧНОГО СОВЕТА." Уровень B2 заблокирован. Но может быть энергоблок поможет...',
        options: [
          { text: 'Открыть секцию С', next: 'section_c' },
          { text: 'Идти в хранилище', next: 'storage' },
          { text: 'Осмотреть энергоблок', next: 'power_room' },
        ]
      },
      power_room: {
        text: 'Энергоблок. Главный реактор мёртв. Резервный генератор хрипит на остатках топлива. Панель диагностики показывает: "КРИТИЧЕСКИЙ ОТКАЗ. РЕМОНТ ВОЗМОЖЕН ПРИ НАЛИЧИИ ЭЛЕКТРОНИКИ."',
        ascii: [
          '  [REACTOR: OFFLINE]',
          '  [BACKUP: 12% ||||....]',
          '  [REPAIR: NEED PARTS]',
        ].join('\n'),
        options: [
          { text: 'Починить генератор', next: 'power_repair', check: { stat: 'cargo', has: 'electronics', min: 2, failNext: 'power_no_parts' } },
          { text: 'Вернуться', next: 'start' },
        ]
      },
      power_no_parts: {
        text: 'Нужна электроника для ремонта - минимум 2 единицы. У вас нет. Генератор продолжает умирать.',
        options: [
          { text: 'Вернуться', next: 'start' },
        ]
      },
      power_repair: {
        text: 'Вы заменили конденсаторы и перемотали обмотку. Генератор взревел на полную мощность! Свет загорелся по всей лаборатории. Двери разблокировались, терминалы ожили. Где-то внизу загудели системы уровня B2.',
        ascii: [
          '  [REACTOR: ONLINE!!!]',
          '  [POWER: 100% ||||||||]',
          '  [ALL SYSTEMS: ACTIVE]',
        ].join('\n'),
        options: [
          { text: 'К терминалу', next: 'terminal_powered' },
          { text: 'В хранилище', next: 'storage' },
          { text: 'На уровень B2', next: 'b2_corridor' },
        ]
      },
      terminal_powered: {
        text: 'С полной мощностью терминал раскрыл все файлы. Полная база данных "Омеги": генетические формулы, записи о кристаллах-катализаторах из шахтёрских миров, координаты связанных проектов. И отчёт о "Предтечах" - древней цивилизации, чьи технологии использовались в экспериментах.',
        options: [
          { text: 'Скачать ВСЕ данные', next: 'download_full', check: { stat: 'scanner', value: true, failNext: 'download_full_noscan' } },
          { text: 'На уровень B2', next: 'b2_corridor' },
          { text: 'Уйти с тем, что есть', next: 'end_full_data' },
        ]
      },
      download_full: {
        text: 'Полная научная база "Омеги" на вашем сканере. Тут данные на годы исследований. Среди файлов - координаты, помеченные как "ТОЧКА КОНВЕРГЕНЦИИ". Что-то очень важное.',
        options: [
          { text: 'На уровень B2', next: 'b2_corridor' },
          { text: 'Уйти с полной базой', next: 'end_full_data_scan' },
        ]
      },
      download_full_noscan: {
        text: 'Без сканера не записать такой объём данных. Вы запомнили ключевые формулы, но полную базу не унести.',
        options: [
          { text: 'На уровень B2', next: 'b2_corridor' },
          { text: 'Уйти', next: 'end_full_data' },
        ]
      },
      b2_check: {
        text: 'Лестница вниз. Дверь уровня B2 заблокирована кодом. Без научного допуска или восстановленного питания не пройти.',
        options: [
          { text: 'Вернуться', next: 'terminal' },
        ]
      },
      b2_corridor: {
        text: 'Уровень B2. Длинный коридор, аварийное освещение. Три двери: "СЕРВЕРНАЯ", "КРИОХРАНИЛИЩЕ", "ХРАНИЛИЩЕ ОБРАЗЦОВ-К".',
        ascii: [
          '  [B2-CORRIDOR]',
          '  [1] СЕРВЕРНАЯ',
          '  [2] КРИОХРАНИЛИЩЕ',
          '  [3] ОБРАЗЦЫ-К',
        ].join('\n'),
        options: [
          { text: 'Серверная', next: 'b2_server' },
          { text: 'Криохранилище', next: 'b2_cryo' },
          { text: 'Хранилище образцов-К', next: 'b2_samples_k', check: { flag: 'mine_artifact_touched', flagValue: true, failNext: 'b2_samples_k_locked' } },
          { text: 'Вернуться наверх', next: 'start' },
        ]
      },
      b2_server: {
        text: 'Серверная. Стойки гудят, диски вращаются. На главном мониторе - карта связей между проектами "Омеги" и другими лабораториями. Проект "Конвергенция" помечен красным: "ВЫСШИЙ ПРИОРИТЕТ".',
        options: [
          { text: 'Скопировать данные о Конвергенции', next: 'end_convergence_data', check: { stat: 'scanner', value: true, failNext: 'b2_server_noscan' } },
          { text: 'Изучить карту связей', next: 'b2_server_map' },
          { text: 'Назад', next: 'b2_corridor' },
        ]
      },
      b2_server_noscan: {
        text: 'Данных слишком много для ручного копирования. Нужен сканер.',
        options: [
          { text: 'Изучить карту связей', next: 'b2_server_map' },
          { text: 'Назад', next: 'b2_corridor' },
        ]
      },
      b2_server_map: {
        text: 'Карта показывает: "Омега" - одна из пяти лабораторий, работавших над Проектом Конвергенция. Цель - изучение технологий Предтеч через биологические эксперименты. Четыре другие лаборатории уничтожены. "Омега" - последняя.',
        options: [
          { text: 'Криохранилище', next: 'b2_cryo' },
          { text: 'Хранилище образцов-К', next: 'b2_samples_k', check: { flag: 'mine_artifact_touched', flagValue: true, failNext: 'b2_samples_k_locked' } },
          { text: 'Наверх', next: 'start' },
        ]
      },
      b2_cryo: {
        img: 'quests/lab_cryo.png',
        text: 'Криохранилище. Ряды капсул, большинство разбито. Одна целая - внутри тело в белом халате. Бейдж: "Др. Корнеева, руководитель проекта." На капсуле кнопка разморозки.',
        ascii: [
          '  [X] [X] [X] [*] [X]',
          '  DR. KORNEEVA',
          '  STATUS: CRYO-STABLE',
        ].join('\n'),
        options: [
          { text: 'Разморозить', next: 'b2_cryo_wake', check: { stat: 'defense', min: 6, failNext: 'b2_cryo_fail' } },
          { text: 'Забрать данные с её терминала', next: 'b2_cryo_terminal' },
          { text: 'Назад', next: 'b2_corridor' },
        ]
      },
      b2_cryo_fail: {
        text: 'Система разморозки повреждена. Без технической подготовки разбудить Корнееву опасно - можно убить.',
        options: [
          { text: 'Забрать данные с терминала', next: 'b2_cryo_terminal' },
          { text: 'Назад', next: 'b2_corridor' },
        ]
      },
      b2_cryo_wake: {
        text: 'Капсула шипит. Корнеева открывает глаза, кашляет. "Сколько... сколько прошло?" Она оглядывается. "Образец 17-Б... он всё ещё...?" Она хватает вас за руку. "Не открывайте секцию С. Он адаптируется. Каждый раз сильнее."',
        options: [
          { text: '"Что за Проект Конвергенция?"', next: 'b2_cryo_convergence' },
          { text: '"Тут есть хранилище образцов-К"', next: 'b2_cryo_k' },
          { text: 'Помочь ей выбраться', next: 'end_cryo_rescue' },
        ]
      },
      b2_cryo_convergence: {
        text: 'Корнеева бледнеет. "Конвергенция... мы нашли технологию Предтеч. Их кристаллы - не просто минералы. Они - интерфейс. Мост между пространствами. Мы пытались воспроизвести... и создали монстра." Она смотрит в потолок. "Аномалия в секторе Андромеда - это наша вина."',
        options: [
          { text: '"Как это остановить?"', next: 'b2_cryo_stop' },
          { text: 'Помочь ей выбраться', next: 'end_cryo_convergence' },
        ]
      },
      b2_cryo_k: {
        text: '"Образцы-К! Кристаллические образцы Предтеч!" Корнеева пытается встать. "Если вы нашли кристаллы в шахте - они резонируют с нашими. Вместе они... они показывают координаты. Место, где Предтечи хранили свои знания."',
        options: [
          { text: 'Отвести её к хранилищу', next: 'b2_samples_k_guided' },
          { text: 'Помочь выбраться', next: 'end_cryo_rescue' },
        ]
      },
      b2_cryo_stop: {
        text: '"Остановить?" Корнеева грустно смеётся. "Мы открыли дверь, которую невозможно закрыть. Но можно понять, что за ней. Координаты в образцах-К... если найти Точку Конвергенции - может быть, Предтечи оставили ответы."',
        options: [
          { text: 'Хранилище образцов-К', next: 'b2_samples_k_guided' },
          { text: 'Помочь выбраться', next: 'end_cryo_convergence' },
        ]
      },
      b2_cryo_terminal: {
        text: 'Личный терминал Корнеевой. Дневник: последние записи о том, как 17-Б прорвал первый периметр. Она легла в крио как последний шанс дождаться помощи. Среди файлов - её личные заметки о Предтечах.',
        options: [
          { text: 'Назад', next: 'b2_corridor' },
        ]
      },
      b2_samples_k_locked: {
        text: 'Дверь реагирует на биометрию. На панели: "ТРЕБУЕТСЯ ОБРАЗЕЦ КРИСТАЛЛИЧЕСКОЙ РЕЗОНАНСНОЙ ПОДПИСИ." Вы не понимаете, что это значит.',
        options: [
          { text: 'Серверная', next: 'b2_server' },
          { text: 'Криохранилище', next: 'b2_cryo' },
          { text: 'Наверх', next: 'start' },
        ]
      },
      b2_samples_k: {
        text: 'Хранилище образцов-К! Дверь реагирует на остаточную кристаллическую энергию на вашей коже - контакт с артефактом в шахте оставил след. Внутри - стеллажи с кристаллическими образцами разных цветов. В центре - устройство, напоминающее машину из шахты, но меньше.',
        ascii: [
          '  [K-SAMPLES VAULT]',
          '  ◆ ◆ ◆ ◆ ◆ ◆ ◆',
          '  RESONANCE DEVICE',
          '  STATUS: STANDBY',
        ].join('\n'),
        options: [
          { text: 'Активировать устройство резонанса', next: 'resonance_activate', check: { flag: 'crystal_knowledge', flagValue: true, failNext: 'resonance_blind' } },
          { text: 'Забрать образцы', next: 'end_samples_k_grab' },
          { text: 'Назад', next: 'b2_corridor' },
        ]
      },
      b2_samples_k_guided: {
        text: 'Корнеева ведёт вас к хранилищу. Её ладонь на панели - дверь открывается. "Смотрите..." Она активирует устройство резонанса. Кристаллы начинают петь.',
        options: [
          { text: 'Наблюдать', next: 'resonance_guided' },
        ]
      },
      resonance_blind: {
        text: 'Устройство гудит, кристаллы мерцают, но без понимания кристаллической структуры вы не знаете, какую комбинацию задать. Случайные комбинации - опасны.',
        options: [
          { text: 'Попробовать наугад', chances: [
            { weight: 40, next: 'resonance_lucky' },
            { weight: 60, next: 'resonance_overload' },
          ]},
          { text: 'Забрать образцы и уйти', next: 'end_samples_k_grab' },
        ]
      },
      resonance_activate: {
        text: 'Знание кристаллов из шахты помогает. Синий - несущая частота. Красный - усилитель. Чёрный - направляющий. Вы выставляете комбинацию. Устройство проецирует голограмму - карту с координатами. Точка в секторе Андромеда, помеченная символом Предтеч.',
        ascii: [
          '  ◆ ~ ◆ ~ ◆',
          '  COORDINATES:',
          '  SECTOR: ANDROMEDA',
          '  [PRECURSOR SITE]',
        ].join('\n'),
        options: [
          { text: 'Записать координаты', next: 'end_resonance_full' },
        ]
      },
      resonance_guided: {
        text: 'Корнеева настраивает резонанс. "Три частоты... синяя - канал, красная - мощность, чёрная - вектор..." Голограмма - координаты в секторе Андромеда. "Это то, что мы искали. Точка Конвергенции. Место, где Предтечи оставили свои знания."',
        options: [
          { text: 'Запомнить координаты, помочь Корнеевой', next: 'end_resonance_korneeva' },
        ]
      },
      resonance_lucky: {
        text: 'Удача! Случайная комбинация вызвала короткую вспышку. Устройство показало фрагмент карты - сектор, но без точных координат. Лучше, чем ничего.',
        options: [
          { text: 'Запомнить и уйти', next: 'end_resonance_partial' },
        ]
      },
      resonance_overload: {
        text: 'Кристаллы перегрелись! Вспышка, грохот - устройство плавится. Осколки кристаллов летят по комнате. Вы прикрываете лицо, но мелкие порезы по рукам.',
        options: [
          { text: 'Бежать наверх', next: 'end_resonance_fail' },
        ]
      },
      storage: {
        text: 'Хранилище. Стеллажи с оборудованием, часть разграблена. В углу - запечатанный контейнер "ОБРАЗЦЫ - НЕ ВСКРЫВАТЬ". У стены - ящик с запчастями.',
        ascii: [
          '  [====]  [====]  [    ]',
          '  [====]  [    ]  [    ]',
          '  [====]  [    ]  [####]',
          '       \\___________/',
          '        | SAMPLES |',
        ].join('\n'),
        options: [
          { text: 'Открыть контейнер', next: 'samples' },
          { text: 'Забрать оборудование', next: 'end_equipment' },
          { text: 'Открыть секцию С', next: 'section_c' },
          { text: 'Осмотреть энергоблок', next: 'power_room' },
        ]
      },
      samples: {
        text: 'Три ампулы с пульсирующей жидкостью. Этикетка: "Сыворотка регенерации. Прототип." Одна треснута и пуста.',
        options: [
          { text: 'Забрать ампулы (рискованно)', chances: [
            { weight: 50, next: 'end_serum_risk' },
            { weight: 30, next: 'end_serum_unstable' },
            { weight: 20, next: 'end_serum_mutagen' },
          ]},
          { text: 'Оставить и уйти', next: 'end_equipment' },
        ]
      },
      section_c: {
        img: 'quests/lab_mutants.png',
        text: 'Дверь секции С. Тяжёлая гермодверь. За ней - шуршание и скрежет.',
        ascii: [
          '  ╔═══════════════════╗',
          '  ║   SECTION  C      ║',
          '  ║   ██████████████  ║',
          '  ║   █ LOCKED █████  ║',
          '  ║  [ENTER CODE: __] ║',
          '  ╚═══════════════════╝',
        ].join('\n'),
        options: [
          { text: 'Взломать замок', next: 'section_c_open', check: { stat: 'attack', min: 12, failNext: 'section_c_fail' } },
          { text: 'Просканировать дверь', next: 'section_c_scan', check: { stat: 'scanner', value: true, failNext: 'section_c_noscan' } },
          { text: 'Отступить', next: 'start' },
        ]
      },
      section_c_scan: {
        text: 'Сканер показывает: за дверью одна крупная биоформа. Температура тела аномально высокая. Движется медленно - спит? Ещё показывает аварийный люк на потолке секции - можно обойти тварь.',
        options: [
          { text: 'Вломиться и драться', next: 'section_c_open' },
          { text: 'Тихо через аварийный люк', next: 'section_c_stealth' },
          { text: 'Отступить', next: 'start' },
        ]
      },
      section_c_noscan: {
        text: 'Без сканера не узнать, что за дверью. Только звуки.',
        options: [
          { text: 'Взломать замок', next: 'section_c_open', check: { stat: 'attack', min: 12, failNext: 'section_c_fail' } },
          { text: 'Отступить', next: 'start' },
        ]
      },
      section_c_stealth: {
        text: 'Вы забираетесь через вентиляцию и спускаетесь в секцию С сверху. Тварь внизу - огромная, дышит тяжело. Спит. В дальнем углу - сейф с оборудованием. Можно добраться тихо.',
        options: [
          { text: 'Красться к сейфу', next: 'section_c_stealth_safe', check: { stat: 'speed', min: 4, failNext: 'section_c_stealth_wake' } },
          { text: 'Убраться обратно', next: 'start' },
        ]
      },
      section_c_stealth_safe: {
        text: 'Тихо, как тень. Сейф открыт - военное оборудование, кредитные чипы, и чертёж экспериментального модуля. Вы забираете всё и выбираетесь тем же путём. Тварь даже не шелохнулась.',
        options: [
          { text: 'Отлично', next: 'end_section_c_mega' },
        ]
      },
      section_c_stealth_wake: {
        text: 'Металл скрипнул под ногой. Тварь открывает глаза. БЕЖАТЬ!',
        options: [
          { text: 'НАВЕРХ!', next: 'end_creature_escape', check: { stat: 'speed', min: 6, failNext: 'end_creature_mauled' } },
        ]
      },
      section_c_open: {
        text: 'Замок поддался! Дверь открывается... Внутри - огромная клетка.',
        options: [
          { text: 'Войти', chances: [
            { weight: 40, next: 'section_c_empty' },
            { weight: 35, next: 'section_c_creature' },
            { weight: 25, next: 'section_c_jackpot' },
          ]},
          { text: 'Захлопнуть дверь!', next: 'end_leave' },
        ]
      },
      section_c_empty: {
        text: 'Клетка пустая. Стена разломана, в проломе выход наружу. Что бы тут ни было - ушло. Зато ящики с оборудованием остались.',
        options: [
          { text: 'Забрать добычу', next: 'end_section_c_loot' },
        ]
      },
      section_c_creature: {
        text: 'НЕ пустая! Что-то ОГРОМНОЕ бросается из тени! Мутировавший образец 17-Б - помесь рептилии и кошмара.',
        ascii: [
          '  ___/\\_/\\___',
          '  |  X    X  |',
          '  | /\\/\\/\\/\\ |',
          '  |  SPECIMEN |',
          '  |  17-B     |',
        ].join('\n'),
        options: [
          { text: 'Драться!', next: 'end_creature_fight', check: { stat: 'attack', min: 14, failNext: 'end_creature_mauled' } },
          { text: 'Бежать через пролом!', next: 'end_creature_escape', check: { stat: 'speed', min: 5, failNext: 'end_creature_mauled' } },
          { text: 'Наёмник, прикрой!', next: 'end_creature_merc', check: { stat: 'mercenary', failNext: 'end_creature_mauled' } },
        ]
      },
      section_c_jackpot: {
        text: 'Пустая. В углу - военный сейф, дверца приоткрыта. Оборудование, кредитные чипы, чертёж экспериментального модуля.',
        options: [
          { text: 'Забрать ВСЁ', next: 'end_section_c_mega' },
        ]
      },
      section_c_fail: {
        text: 'Замок слишком крепкий. За дверью что-то УДАРЯЕТ в стену. Дверь прогибается. Пора валить!',
        options: [
          { text: 'БЕЖАТЬ!', next: 'end_run' },
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Вы покидаете лабораторию. Иногда лучше не знать.',
        ending: true,
        result: { reputation: 0 }
      },
      end_data: {
        text: 'Данные проданы учёным. Прорыв в генетике! "Если найдёте ещё - мы заплатим."',
        ending: true,
        result: { credits: 780, reputation: 10, flags: { lab_data_sold: true }, factionRep: { scientists: 3 } }
      },
      end_full_data: {
        text: 'Данные о проекте "Конвергенция" потрясли научное сообщество. Полные записи "Омеги" - бесценный вклад в науку.',
        ending: true,
        result: { credits: 1300, reputation: 15, flags: { lab_full_data: true, anomaly_research_data: true }, factionRep: { scientists: 5 } }
      },
      end_full_data_scan: {
        text: 'Полная база "Омеги" со сканера разошлась по всем научным институтам. Координаты Точки Конвергенции стали главной темой Академии. Вас называют "Открывателем".',
        ending: true,
        result: { credits: 1950, reputation: 20, flags: { lab_full_data: true, anomaly_research_data: true, precursor_coordinates: true }, factionRep: { scientists: 8 } }
      },
      end_equipment: {
        text: 'Вы набрали оборудования. Неплохой улов.',
        ending: true,
        result: { credits: 260, reputation: 2 }
      },
      end_serum_risk: {
        text: 'Ампулы стабильны. Медики купили их за бешеные деньги - это спасёт тысячи жизней!',
        ending: true,
        result: { credits: 1625, reputation: 15, flags: { serum_found: true } }
      },
      end_serum_unstable: {
        text: 'Ампула ЛОПНУЛА в руке! Химический ожог. Оставшиеся стабильны, но лечение стоит дорого.',
        ending: true,
        result: { credits: 650, reputation: 5, damage: 15, flags: { serum_found: true } }
      },
      end_serum_mutagen: {
        text: 'Это МУТАГЕН! Реакция с воздухом. Бросаете контейнер, бежите. За спиной зелёный дым.',
        ending: true,
        result: { credits: 0, damage: 25, reputation: -5, flags: { lab_contaminated: true } }
      },
      end_section_c_loot: {
        text: 'Военное оборудование, модули, кредитные чипы. Джекпот!',
        ending: true,
        result: { credits: 1950, reputation: 5 }
      },
      end_creature_fight: {
        text: 'Вы хватаете стержень и бьёте! Тварь визжит и отступает. Вы хватаете ящики и бежите к выходу.',
        ending: true,
        result: { credits: 2275, reputation: 10, damage: 10, flags: { lab_specimen_defeated: true } }
      },
      end_creature_merc: {
        text: 'Наёмник выступает вперёд, открывая огонь. "ВАЛИ ОТСЮДА, Я ПРИКРОЮ!" Тварь бросается на него. Вы хватаете ящики и бежите. Наёмник выскакивает следом, весь в порезах, но живой. "За это - тройная оплата."',
        ending: true,
        result: { credits: 1625, reputation: 8, flags: { lab_specimen_defeated: true } }
      },
      end_creature_mauled: {
        text: 'Тварь быстрее! Когти рвут обшивку. Вы чудом проскальзываете через пролом. Она не преследует - боится света.',
        ending: true,
        result: { credits: 0, damage: 35, reputation: -2 }
      },
      end_creature_escape: {
        text: 'Рывок! Проскакиваете мимо и ныряете в пролом. Без добычи, зато живой.',
        ending: true,
        result: { credits: 65, damage: 5 }
      },
      end_section_c_mega: {
        text: 'Военное оборудование, кредитные чипы, чертёж экспериментального модуля. Учёные с руками оторвут!',
        ending: true,
        result: { credits: 3250, reputation: 15, flags: { lab_blueprint: true } }
      },
      end_run: {
        text: 'Еле унесли ноги. За спиной что-то ВЫШЛО из секции С.',
        ending: true,
        result: { credits: 0, reputation: -3, damage: 10 }
      },
      end_cryo_rescue: {
        text: 'Вы помогли Корнеевой выбраться. Она слаба, но благодарна. "Академия Наук должна знать. Расскажите им про Конвергенцию." Она даёт вам свой допуск и координаты контакта в Академии.',
        ending: true,
        result: { credits: 975, reputation: 18, flags: { anomaly_research_data: true, lab_fully_explored: true }, factionRep: { scientists: 8 } }
      },
      end_cryo_convergence: {
        text: 'Корнеева передала все данные о Конвергенции. "Предтечи оставили нам шанс. Но мы должны быть осторожны - открытая дверь может впустить не только свет." Вы вывели её на станцию. Академия в шоке от того, что она рассказала.',
        ending: true,
        result: { credits: 1300, reputation: 22, flags: { anomaly_research_data: true, precursor_coordinates: true, lab_fully_explored: true }, factionRep: { scientists: 10 } }
      },
      end_convergence_data: {
        text: 'Полные данные о Проекте Конвергенция на сканере. Координаты связанных объектов, формулы, схемы экспериментов. Академия Наук заплатит за это целое состояние.',
        ending: true,
        result: { credits: 2600, reputation: 25, flags: { anomaly_research_data: true, precursor_coordinates: true, lab_full_data: true }, factionRep: { scientists: 10 } }
      },
      end_samples_k_grab: {
        text: 'Кристаллические образцы проданы коллекционерам. Красивые, но без понимания их истинного назначения - просто дорогие камни.',
        ending: true,
        result: { credits: 1300, reputation: 5 }
      },
      end_resonance_full: {
        text: 'Координаты Точки Конвергенции записаны. Кристаллы резонируют с теми, что были в шахте - это части одной системы. Предтечи создали сеть маяков, ведущих к их главному хранилищу знаний. И теперь вы знаете путь.',
        ending: true,
        result: { credits: 2275, reputation: 28, flags: { precursor_coordinates: true, anomaly_research_data: true, lab_fully_explored: true }, factionRep: { scientists: 10, miners: 3 } }
      },
      end_resonance_korneeva: {
        text: 'Корнеева и координаты Конвергенции. Лучший результат, на который можно было надеяться. Академия Наук встретила вас как героев. Корнеева возглавила новый проект по изучению Предтеч - и вы в списке консультантов.',
        ending: true,
        result: { credits: 2925, reputation: 32, flags: { precursor_coordinates: true, anomaly_research_data: true, lab_fully_explored: true }, factionRep: { scientists: 12 } }
      },
      end_resonance_partial: {
        text: 'Фрагмент карты - сектор Андромеда, но без точных координат. Учёные смогут сузить поиск, но найти Точку Конвергенции будет непросто.',
        ending: true,
        result: { credits: 975, reputation: 12, flags: { anomaly_research_data: true }, factionRep: { scientists: 4 } }
      },
      end_resonance_fail: {
        text: 'Устройство уничтожено, образцы потеряны. Руки в порезах от осколков. Полный провал на нижнем уровне.',
        ending: true,
        result: { credits: 0, damage: 15, reputation: -5 }
      },
    }
  },

  // ===== 2. ПОДПОЛЬНАЯ АРЕНА (pirate) =====
  {
    id: 'fight_club',
    title: 'Подпольная арена',
    planetType: 'pirate',
    minDay: 3,
    oneTime: false,
    ascii: [
      '    ╔════════════════════╗',
      '    ║  ARENA  MORTALIS   ║',
      '    ║    ╔══════════╗    ║',
      '    ║    ║ FIGHT!!! ║    ║',
      '    ║    ╚══════════╝    ║',
      '    ║  $$$  BET  $$$    ║',
      '    ╚════════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/fight_club.png',
        text: 'Тёмный ангар на задворках станции. Толпа орёт. Импровизированная арена из сваренных листов металла. Здоровенный тип у входа оценивает вас взглядом.',
        ascii: [
          '  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\',
          '  \\/  TONIGHT ONLY!!  /\\',
          '  /\\  CHAMPION vs ???\\/  ',
          '  \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/',
        ].join('\n'),
        options: [
          { text: 'Я здесь драться', next: 'enter_arena' },
          { text: 'Просто посмотреть', next: 'spectate' },
          { text: 'Вернуться чемпионом', next: 'champion_return', check: { flag: 'arena_champion', flagValue: true, failNext: 'enter_arena' } },
          { text: 'Уйти', next: 'end_leave' },
        ]
      },
      enter_arena: {
        text: '"500 кредитов за вход. Победишь - втрое. Проиграешь..." Он проводит пальцем по горлу.',
        options: [
          { text: 'Заплатить 500 кр', next: 'fight_round1', cost: { credits: 325 } },
          { text: 'Я боец с опытом', next: 'enter_veteran', check: { stat: 'kills', min: 15, failNext: 'enter_no_rep' } },
          { text: 'Слишком дорого', next: 'spectate' },
        ]
      },
      enter_veteran: {
        text: 'Вышибала смотрит на ваш послужной список. "Ого. С таким счётом убийств тебя знают. Проходи бесплатно - народ хочет зрелищ."',
        options: [
          { text: 'На ринг', next: 'fight_round1' },
        ]
      },
      enter_no_rep: {
        text: '"Не знаю тебя. 500 кредитов или вали."',
        options: [
          { text: 'Заплатить 500 кр', next: 'fight_round1', cost: { credits: 325 } },
          { text: 'Ладно', next: 'spectate' },
        ]
      },
      champion_return: {
        text: 'Вас УЗНАЛИ. Толпа расступается. Вышибала кланяется. "Чемпион вернулся! Организатор ждёт - у нас для вас кое-что особенное."',
        options: [
          { text: 'Что за особенное?', next: 'underground_invite' },
          { text: 'Обычный бой', next: 'fight_round1' },
        ]
      },
      underground_invite: {
        text: 'Организатор ведёт вас за кулисы. "Подпольный турнир. Восемь лучших бойцов сектора. Вход - 2000. Приз - 8000 и титул Легенды. Заинтересован?"',
        options: [
          { text: 'Я в деле (2000 кр)', next: 'underground_r1', cost: { credits: 1300 } },
          { text: 'Слишком рискованно', next: 'fight_round1' },
        ]
      },
      spectate: {
        text: 'Два пилота дерутся на ринге. Фаворит - здоровенный тип с татуировками. Аутсайдер еле стоит. Толпа делает ставки.',
        options: [
          { text: 'Ставлю 200 на аутсайдера', next: 'bet_underdog', cost: { credits: 130 } },
          { text: 'Ставлю 200 на фаворита', next: 'bet_favorite', cost: { credits: 130 } },
          { text: 'Просто смотреть', next: 'end_watch' },
        ]
      },
      bet_underdog: {
        text: 'Фаворит доминирует... но аутсайдер достаёт что-то из рукава.',
        options: [
          { text: 'Давай!', chances: [
            { weight: 35, next: 'end_bet_win_big' },
            { weight: 65, next: 'end_bet_underdog_lost' },
          ]},
        ]
      },
      bet_favorite: {
        text: 'Фаворит давит с первых секунд...',
        options: [
          { text: 'Смотреть', chances: [
            { weight: 75, next: 'end_bet_win_small' },
            { weight: 25, next: 'end_bet_favorite_upset' },
          ]},
        ]
      },
      fight_round1: {
        text: 'Противник - бывший шахтёр. Огромные кулаки, медленный. Толпа ревёт!',
        ascii: [
          '    O         O',
          '   /|\\  VS  /|\\',
          '   / \\      / \\',
          '  YOU      ENEMY',
        ].join('\n'),
        options: [
          { text: 'Атаковать в лоб', next: 'fight_result', check: { stat: 'attack', min: 10, failNext: 'fight_lose' } },
          { text: 'Уклоняться и ждать', next: 'fight_result', check: { stat: 'speed', min: 4, failNext: 'fight_lose' } },
          { text: 'Оружие против кулаков', next: 'fight_weapon', check: { stat: 'weapon', value: 'blaster', failNext: 'fight_no_weapon' } },
        ]
      },
      fight_weapon: {
        text: '"ЭЙ! БЕЗ ОРУЖИЯ!" - орёт судья. Но шахтёр уже увидел ствол и побледнел. Он поднимает руки. "Я пас." Толпа свистит - нечестно, но формально правил нет.',
        options: [
          { text: 'Следующий бой', next: 'fight_round2' },
        ]
      },
      fight_no_weapon: {
        text: 'У вас нет бластера - придётся по старинке, кулаками.',
        options: [
          { text: 'Атаковать', next: 'fight_result', check: { stat: 'attack', min: 10, failNext: 'fight_lose' } },
        ]
      },
      fight_result: {
        text: 'Точный удар - шахтёр на полу! Толпа в экстазе! Организатор кивает: "Есть ещё бой. Посложнее."',
        options: [
          { text: 'Давай следующего', next: 'fight_round2' },
          { text: 'Забрать деньги', next: 'end_fight_win' },
        ]
      },
      fight_round2: {
        text: 'Второй противник - наёмница с кибернетическими рефлексами. Быстрая, точная. Глаза холодные.',
        ascii: [
          '    O         O',
          '   /|\\  VS  /|\\',
          '   / \\      / \\',
          '  YOU    CYBORG',
        ].join('\n'),
        options: [
          { text: 'Силой', next: 'round2_win', check: { stat: 'attack', min: 13, failNext: 'round2_lose' } },
          { text: 'Скоростью', next: 'round2_win', check: { stat: 'speed', min: 6, failNext: 'round2_lose' } },
          { text: 'Вдвоём с наёмником', next: 'round2_tag', check: { stat: 'mercenary', failNext: 'round2_no_merc' } },
        ]
      },
      round2_win: {
        text: 'Наёмница быстрая, но вы быстрее. Три обмена ударами - и она сдаётся. "Хороший бой." Организатор потирает руки. "Чемпион ждёт."',
        options: [
          { text: 'Бой с чемпионом!', next: 'fight_boss' },
          { text: 'Хватит, забираю приз', next: 'end_fight_round2' },
        ]
      },
      round2_lose: {
        text: 'Наёмница быстрее. Серия ударов по корпусу, подсечка, и вы на полу. Чисто, профессионально.',
        options: [
          { text: 'Достойное поражение', next: 'end_round2_lose' },
        ]
      },
      round2_tag: {
        text: '"Тег-тим? Нестандартно!" - организатор усмехается. "Ладно, тогда против двоих!" Ваш наёмник и вы - против наёмницы и её напарника. Четверо на ринге. Хаос!',
        options: [
          { text: 'Координированная атака', chances: [
            { weight: 65, next: 'round2_win' },
            { weight: 35, next: 'end_tag_lose' },
          ]},
        ]
      },
      round2_no_merc: {
        text: 'Без напарника тег-тим невозможен. Один на один.',
        options: [
          { text: 'Силой', next: 'round2_win', check: { stat: 'attack', min: 13, failNext: 'round2_lose' } },
        ]
      },
      fight_lose: {
        text: 'Шахтёр быстрее, чем выглядит. Удар в корпус, потом в голову. Темнота. Вы приходите в себя в коридоре.',
        options: [
          { text: 'Ковылять к кораблю', next: 'end_fight_lose' },
        ]
      },
      fight_boss: {
        img: 'quests/fight_boss.png',
        text: 'Чемпион - киборг "Титан". Одна рука - металл. Он улыбается. "Давно ждал достойного."',
        ascii: [
          '       ___',
          '      |o_o|',
          '     _|===|_',
          '    |/|   |\\|',
          '     |  T  |',
          '     |_____|',
        ].join('\n'),
        options: [
          { text: 'Биться до конца', next: 'boss_result', check: { stat: 'attack', min: 15, failNext: 'boss_lose' } },
          { text: 'Грязный приём', next: 'end_boss_dirty' },
          { text: 'Спросить о подпольном турнире', next: 'boss_talk' },
        ]
      },
      boss_talk: {
        text: 'Титан смеётся. "Подпольный? Да, слышал. Но сначала покажи, чего стоишь ЗДЕСЬ." Он принимает стойку.',
        options: [
          { text: 'Бой!', next: 'boss_result', check: { stat: 'attack', min: 15, failNext: 'boss_lose' } },
        ]
      },
      boss_result: {
        text: 'Самый тяжёлый бой. Титан бьёт как корабельное орудие. Металлический кулак свистит у виска.',
        options: [
          { text: 'Держаться!', chances: [
            { weight: 55, next: 'end_champion' },
            { weight: 25, next: 'end_boss_draw' },
            { weight: 20, next: 'end_boss_ko' },
          ]},
        ]
      },
      boss_lose: {
        text: 'Титан не оставляет шансов. Металлическая рука - не шутки. Вы просыпаетесь через час.',
        options: [
          { text: 'Уползти', next: 'end_boss_beaten' },
        ]
      },
      underground_r1: {
        text: 'Подпольный турнир. Подвал под ангаром. Восемь бойцов, все опасны. Первый соперник - здоровенный крогг с четырьмя руками.',
        ascii: [
          '  UNDERGROUND TOURNAMENT',
          '  [1/3] vs KROGG',
          '  PRIZE: 8000 CR',
        ].join('\n'),
        options: [
          { text: 'Бить по центру масс', next: 'underground_r2', check: { stat: 'attack', min: 14, failNext: 'underground_r1_lose' } },
          { text: 'Уворачиваться от четырёх рук', next: 'underground_r2', check: { stat: 'speed', min: 7, failNext: 'underground_r1_lose' } },
        ]
      },
      underground_r1_lose: {
        text: 'Четыре руки - это четыре удара одновременно. Вас вынесли с ринга. Турнир окончен на первом раунде.',
        options: [
          { text: 'Обидно', next: 'end_underground_early' },
        ]
      },
      underground_r2: {
        text: 'Крогг повержен! Толпа неистовствует. Второй соперник - пилот-ветеран в экзоскелете. Силовые усилители на руках и ногах.',
        ascii: [
          '  [2/3] vs EXOFRAME',
          '  WARNING: ENHANCED',
        ].join('\n'),
        options: [
          { text: 'Грубая сила', next: 'underground_r3', check: { stat: 'attack', min: 16, failNext: 'underground_r2_option' } },
          { text: 'Найти слабое место', next: 'underground_r2_scan', check: { stat: 'scanner', value: true, failNext: 'underground_r2_option' } },
        ]
      },
      underground_r2_option: {
        text: 'Экзоскелет усиливает каждый удар. Прямой бой - самоубийство. Нужна другая тактика.',
        options: [
          { text: 'Измотать его', chances: [
            { weight: 50, next: 'underground_r3' },
            { weight: 50, next: 'end_underground_mid' },
          ]},
        ]
      },
      underground_r2_scan: {
        text: 'Сканер показывает: энергоячейка экзоскелета - на спине. Один точный удар туда - и усилители отключатся. Вы кружите, ждёте момент... ЕСТЬ! Экзоскелет гаснет. Без него ветеран - обычный человек.',
        options: [
          { text: 'Финальный раунд', next: 'underground_r3' },
        ]
      },
      underground_r3: {
        text: 'Финал! Последний противник - безымянная женщина в маске. Она не говорит. Двигается как тень. Организатор шепчет: "Никто не знает, кто она. Никто не побеждал."',
        ascii: [
          '  [3/3] FINAL',
          '  vs ???',
          '  UNDEFEATED',
        ].join('\n'),
        options: [
          { text: 'Полная атака', next: 'underground_final', check: { stat: 'attack', min: 18, failNext: 'underground_final_hard' } },
          { text: 'Защита и контратака', next: 'underground_final', check: { stat: 'defense', min: 10, failNext: 'underground_final_hard' } },
        ]
      },
      underground_final_hard: {
        text: 'Она быстрее всего, что вы видели. Удар, ещё удар. Вы отступаете. Кровь из рассечённой брови. Последний шанс...',
        options: [
          { text: 'Всё на одну атаку', chances: [
            { weight: 35, next: 'end_underground_legend' },
            { weight: 65, next: 'end_underground_final_loss' },
          ]},
        ]
      },
      underground_final: {
        text: 'Она быстрая, но вы читаете её движения. Обмен ударами. Кровь. Боль. Но вы стоите. Она падает.',
        options: [
          { text: 'ПОБЕДА!', next: 'end_underground_legend' },
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Вы уходите. Толпа разочарована.',
        ending: true,
        result: {}
      },
      end_watch: {
        text: 'Зрелищный бой. Вы запомнили несколько приёмов.',
        ending: true,
        result: { reputation: 2 }
      },
      end_bet_win_big: {
        text: 'Аутсайдер ВЫРУБИЛ фаворита! 1000 кредитов!',
        ending: true,
        result: { credits: 650, reputation: 3 }
      },
      end_bet_underdog_lost: {
        text: 'Аутсайдер пытался... нокаут. 200 кредитов потеряно.',
        ending: true,
        result: { reputation: -1 }
      },
      end_bet_win_small: {
        text: 'Фаворит вырубил за две минуты. Скучно, но надёжно. 300 кредитов.',
        ending: true,
        result: { credits: 195, reputation: 1 }
      },
      end_bet_favorite_upset: {
        text: 'Аутсайдер уложил фаворита! А ваши 200 кредитов... увы.',
        ending: true,
        result: { reputation: -2 }
      },
      end_fight_win: {
        text: '1500 кредитов. Организатор жмёт руку: "Возвращайся!"',
        ending: true,
        result: { credits: 975, reputation: 8, factionRep: { pirates: 3 } }
      },
      end_fight_round2: {
        text: 'Два боя - два нокаута. 2500 кредитов. Пираты уважительно кивают.',
        ending: true,
        result: { credits: 1625, reputation: 12, factionRep: { pirates: 5 } }
      },
      end_fight_lose: {
        text: 'Проигрыш. 500 кредитов потеряно, гордость тоже.',
        ending: true,
        result: { credits: 0, reputation: -5, damage: 15 }
      },
      end_round2_lose: {
        text: 'Проигрыш во втором раунде. Наёмница профессионал. 500 кредитов за первый бой - слабое утешение.',
        ending: true,
        result: { credits: 325, reputation: 3, damage: 10 }
      },
      end_tag_lose: {
        text: 'Тег-тим проигран. Напарники оказались слаженнее. Но зрелище было хорошее - организатор вернул часть взноса.',
        ending: true,
        result: { credits: 130, reputation: 3, damage: 12 }
      },
      end_champion: {
        text: 'ЧЕМПИОН! Титан падает! 4000 кредитов и уважение каждого пирата в секторе! "Чемпион Арены Морталис!"',
        ending: true,
        result: { credits: 2600, reputation: 25, flags: { arena_champion: true }, factionRep: { pirates: 8 } }
      },
      end_boss_draw: {
        text: 'Ничья. Оба на полу, оба встали, оба упали. Организатор делит приз.',
        ending: true,
        result: { credits: 1300, reputation: 15, damage: 15, factionRep: { pirates: 5 } }
      },
      end_boss_ko: {
        text: 'Щель в броне! Удар! Но Титан перехватывает. Металлический кулак в лицо. Темнота. "Хороший бой" - передал Титан.',
        ending: true,
        result: { credits: 325, reputation: 8, damage: 30, factionRep: { pirates: 2 } }
      },
      end_boss_beaten: {
        text: 'Побит, но жив. На станции шепчутся о вашей смелости.',
        ending: true,
        result: { credits: 0, reputation: 5, damage: 25, factionRep: { pirates: 2 } }
      },
      end_boss_dirty: {
        text: 'Песок в глаза Титану, удар по колену. Он упал. Толпа свистит - не по правилам! Деньги ваши, но уважения нет.',
        ending: true,
        result: { credits: 1300, reputation: -10, factionRep: { pirates: -3 } }
      },
      end_underground_early: {
        text: 'Вылет в первом раунде подпольного турнира. 2000 кредитов потеряно. Крогг помахал вам четырьмя руками.',
        ending: true,
        result: { damage: 20, reputation: -3 }
      },
      end_underground_mid: {
        text: 'Вылет во втором раунде. Экзоскелет оказался слишком мощным. Но вы дошли дальше, чем большинство.',
        ending: true,
        result: { credits: 650, damage: 15, reputation: 5, factionRep: { pirates: 3 } }
      },
      end_underground_final_loss: {
        text: 'Финал проигран. Безымянная женщина в маске положила вас одним ударом. Чистый, элегантный, смертельный. Вы проснулись с утешительным призом и уважением.',
        ending: true,
        result: { credits: 1300, damage: 20, reputation: 12, factionRep: { pirates: 5 } }
      },
      end_underground_legend: {
        text: 'ЛЕГЕНДА АРЕНЫ! Безымянная женщина снимает маску - это бывший командир элитного отряда. Она кланяется. "Первый за 4 года." 8000 кредитов, титул Легенды, и контакты в подпольном мире, о которых другие только мечтают.',
        ending: true,
        result: { credits: 5200, reputation: 35, flags: { arena_champion: true, arena_legend: true, underground_champion: true }, factionRep: { pirates: 12 } }
      },
    }
  },

  // ===== 3. ШАХТА ПРИЗРАКОВ (mining) =====
  {
    id: 'ghost_mine',
    title: 'Шахта призраков',
    planetType: 'mining',
    minDay: 8,
    oneTime: true,
    ascii: [
      '        /\\      /\\',
      '       /  \\    /  \\',
      '      / /\\ \\  / /\\ \\',
      '     / /  \\ \\/ /  \\ \\',
      '    / /    \\  /    \\ \\',
      '   /_/______\\/______\\_\\',
      '   |   MINE  SHAFT    |',
      '   | ████  ████  ████ |',
      '   |  ||    ||    ||  |',
      '   |__||____||____||__|',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/ghost_mine.png',
        text: 'Заброшенная шахта "Каньон-7". Шахтёры ушли месяц назад - говорят, слышали голоса под землёй. Руда осталась. Местные платят 2000 за разведку.',
        options: [
          { text: '> Спуститься в шахту', next: 'level1' },
          { text: '> Поговорить с шахтёрами', next: 'miners_talk' },
          { text: '> Не моё дело', next: 'end_leave' },
        ]
      },
      miners_talk: {
        text: 'Старый бригадир Петров затягивается сигаретой. "Три уровня мы прошли. На четвёртый никто не совался - компания не разрешала. Но я слышал... звуки оттуда. Не обвалы. Что-то другое."',
        options: [
          { text: '> Как попасть на четвёртый?', next: 'miners_secret', check: { stat: 'reputation', faction: 'miners', min: 8, failNext: 'miners_refuse' } },
          { text: '> Что за кристаллы на втором уровне?', next: 'miners_crystals' },
          { text: '> Спуститься в шахту', next: 'level1' },
        ]
      },
      miners_refuse: {
        text: 'Петров качает головой. "Не знаю тебя. Не моё дело, куда ты полезешь." Он отворачивается.',
        options: [
          { text: '> Ладно, спускаюсь', next: 'level1' },
        ]
      },
      miners_secret: {
        text: 'Петров оглядывается. "Ты свой, вижу. Есть ход за обвалом на третьем уровне. Мы нашли его случайно. Там... структуры. Не природные. Мы не докладывали - компания бы забрала всё. Вот карта."',
        options: [
          { text: '> Спасибо, Петров', next: 'level1' },
        ]
      },
      miners_crystals: {
        text: '"Три типа," - Петров загибает пальцы. "Синие - энергия, тёплые. Красные - жар, обжигают. А чёрные... чёрные гудят. От них голова болит. Мы их не трогали."',
        options: [
          { text: '> Как попасть на четвёртый?', next: 'miners_secret', check: { stat: 'reputation', faction: 'miners', min: 8, failNext: 'miners_refuse' } },
          { text: '> Спуститься в шахту', next: 'level1' },
        ]
      },
      level1: {
        text: 'Первый уровень. Брошенные инструменты, каски на полу. Свет фонаря выхватывает надписи на стенах: "ОНИ ВНИЗУ" и "НЕ КОПАЙТЕ ГЛУБЖЕ".',
        ascii: [
          '  ___________________________',
          '  |  . .   |       |   . .  |',
          '  |   .    |  |||  |    .   |',
          '  |  . . . | ||||| | . . .  |',
          '  |________|_______|________|',
          '           |       |',
          '           | DEEPER|',
          '           |___v___|',
        ].join('\n'),
        options: [
          { text: '> Спуститься глубже', next: 'level2' },
          { text: '> Укрепить стены (нужен металл)', next: 'shore_up', check: { stat: 'cargo', has: 'metals', min: 3, failNext: 'no_metals' } },
          { text: '> Собрать руду здесь', next: 'end_surface_ore' },
          { text: '> Осмотреть надписи', next: 'inscriptions' },
        ]
      },
      shore_up: {
        text: 'Вы используете металлические балки для укрепления опор. Шахта становится надёжнее - обвалы вам не грозят.',
        options: [
          { text: '> Спуститься глубже', next: 'level2' },
          { text: '> Осмотреть надписи', next: 'inscriptions' },
        ]
      },
      no_metals: {
        text: 'У вас нет металла для укрепления. Стены скрипят - без опор тут рискованно.',
        options: [
          { text: '> Спуститься так', next: 'level2' },
          { text: '> Осмотреть надписи', next: 'inscriptions' },
        ]
      },
      inscriptions: {
        text: 'При ближнем осмотре - надписи не нацарапаны. Они ВЫЖЖЕНЫ в камне. Температура должна была быть невероятной. Рядом - план шахты с отметкой "ПОЛОСТЬ" на третьем уровне.',
        options: [
          { text: '> Идти к полости', next: 'level2' },
          { text: '> Хватит с меня', next: 'end_surface_ore' },
        ]
      },
      level2: {
        img: 'quests/ghost_mine_crystals.png',
        text: 'Второй уровень. Температура растёт. Стены покрыты странными кристаллами - они слабо светятся. И... вы СЛЫШИТЕ это. Низкий гул, как будто земля дышит.',
        ascii: [
          '  *  .  * . * .  *  . *',
          '  .  * .  *  . *  .  *',
          '  *  .  *  .  *  .  *',
          '  ~~~~~~~~~~~~~~~~~~~~',
          '  ~ ~ HUM ~ ~ HUM ~ ~',
          '  ~~~~~~~~~~~~~~~~~~~~',
        ].join('\n'),
        options: [
          { text: '> Третий уровень', next: 'level3' },
          { text: '> Просканировать кристаллы', next: 'scan_crystals', check: { stat: 'scanner', value: true, failNext: 'no_scan_crystals' } },
          { text: '> Собрать кристаллы', next: 'crystals' },
          { text: '> Наверх!', next: 'end_crystals_some' },
        ]
      },
      scan_crystals: {
        text: 'Сканер выделяет три типа: синие (энергетические, стабильные), красные (термоактивные, опасные), чёрные (неизвестная частота, источник гула). Чёрные кристаллы резонируют с чем-то глубже.',
        ascii: [
          '  BLUE ██ - energy, stable',
          '  RED  ██ - thermal, danger',
          '  BLACK██ - unknown freq',
        ].join('\n'),
        options: [
          { text: '> Аккуратно собрать все типы', next: 'collect_sorted' },
          { text: '> Третий уровень', next: 'level3' },
          { text: '> Наверх с данными', next: 'end_scan_crystals' },
        ]
      },
      no_scan_crystals: {
        text: 'Без сканера все кристаллы выглядят одинаково - светящиеся камни разных оттенков.',
        options: [
          { text: '> Собрать кристаллы', next: 'crystals' },
          { text: '> Третий уровень', next: 'level3' },
        ]
      },
      collect_sorted: {
        text: 'Со сканером вы аккуратно отделяете кристаллы по типам. Синие - в левый карман. Красные - в термоизоляцию. Чёрный - всего один, но гул при контакте становится пронзительным.',
        options: [
          { text: '> Третий уровень', next: 'level3' },
          { text: '> Хватит, наверх', next: 'end_all_crystals' },
        ]
      },
      crystals: {
        text: 'Кристаллы тёплые на ощупь. Когда вы отламываете один - гул становится ГРОМЧЕ. Остальные кристаллы начинают пульсировать. Не нравится вам это.',
        options: [
          { text: '> Набрать побольше и бежать!', chances: [
            { weight: 50, next: 'end_crystals_full' },
            { weight: 30, next: 'end_crystals_collapse' },
            { weight: 20, next: 'end_crystals_resonance' },
          ]},
          { text: '> Бросить и бежать наверх!', next: 'end_run_up' },
          { text: '> Идти глубже', next: 'level3' },
        ]
      },
      level3: {
        img: 'quests/ghost_mine_cavern.png',
        text: 'Третий уровень. Полость. Огромная пещера, потолок теряется во тьме. В центре - НЕЧТО. Структура из чёрного камня, пульсирующая красным. Она... реагирует на вас.',
        ascii: [
          '          .',
          '         /|\\',
          '        / | \\',
          '       / /|\\ \\',
          '      / / | \\ \\',
          '     /  / | \\  \\',
          '    /  /  |  \\  \\',
          '   /__/___|___\\__\\',
          '   ~~~~~~~~~~~~~~~',
          '   ~ SOMETHING ~',
          '   ~~~~~~~~~~~~~~~',
        ].join('\n'),
        options: [
          { text: '> Прикоснуться', next: 'touch', check: { stat: 'defense', min: 8, failNext: 'touch_fail' } },
          { text: '> Просканировать', next: 'scan_artifact', check: { stat: 'scanner', value: true, failNext: 'no_scanner' } },
          { text: '> Искать проход на четвёртый уровень', next: 'level4_search', check: { stat: 'reputation', faction: 'miners', min: 8, failNext: 'level4_no_map' } },
          { text: '> БЕЖАТЬ ОТСЮДА', next: 'end_run_up' },
        ]
      },
      level4_no_map: {
        text: 'Вы ищете проход, но стены монолитные. Если и есть что-то за ними - без карты не найти.',
        options: [
          { text: '> Прикоснуться к структуре', next: 'touch', check: { stat: 'defense', min: 8, failNext: 'touch_fail' } },
          { text: '> Просканировать', next: 'scan_artifact', check: { stat: 'scanner', value: true, failNext: 'no_scanner' } },
          { text: '> Уйти', next: 'end_run_up' },
        ]
      },
      level4_search: {
        text: 'Карта Петрова! За обвалом в дальнем углу - щель. Вы протискиваетесь... и оказываетесь в естественной каверне. Стены - чистый кристалл. А в центре - машина.',
        ascii: [
          '  ╔═══════════════════╗',
          '  ║  *  CRYSTAL  *    ║',
          '  ║  *  CAVERN   *    ║',
          '  ║      [===]        ║',
          '  ║      |   |        ║',
          '  ║   [MACHINE]       ║',
          '  ╚═══════════════════╝',
        ].join('\n'),
        options: [
          { text: '> Осмотреть машину', next: 'crystal_machine' },
          { text: '> Слишком жутко, назад', next: 'level3' },
        ]
      },
      crystal_machine: {
        text: 'Машина Предтеч. Три слота, три цвета: синий, красный, чёрный. Рядом - потухший экран. Похоже, она ждёт комбинацию кристаллов.',
        options: [
          { text: '> Вставить кристаллы (нужны все 3)', next: 'machine_activate', check: { flag: 'has_sorted_crystals', flagValue: true, failNext: 'machine_no_crystals' } },
          { text: '> Просканировать машину', next: 'machine_scan', check: { stat: 'scanner', value: true, failNext: 'machine_no_scan' } },
          { text: '> Не трогать, уйти', next: 'end_level4_flee' },
        ]
      },
      machine_no_crystals: {
        text: 'Три слота. У вас нет полного набора кристаллов. Машина не реагирует.',
        options: [
          { text: '> Вернуться за кристаллами', next: 'level2' },
          { text: '> Уйти', next: 'end_level4_flee' },
        ]
      },
      machine_scan: {
        text: 'Сканер показывает: машина - конвертер энергии. Три кристалла - ключ зажигания. При активации она откроет то, что за кристальной стеной. Энергия внутри - колоссальная.',
        options: [
          { text: '> Вставить кристаллы', next: 'machine_activate', check: { flag: 'has_sorted_crystals', flagValue: true, failNext: 'machine_no_crystals' } },
          { text: '> Слишком опасно', next: 'end_level4_flee' },
        ]
      },
      machine_no_scan: {
        text: 'Без сканера машина - просто непонятный агрегат с тремя отверстиями.',
        options: [
          { text: '> Вставить кристаллы', next: 'machine_activate', check: { flag: 'has_sorted_crystals', flagValue: true, failNext: 'machine_no_crystals' } },
          { text: '> Не трогать', next: 'end_level4_flee' },
        ]
      },
      machine_activate: {
        text: 'Синий. Красный. Чёрный. Машина гудит, экран вспыхивает символами Предтеч. Кристальная стена РАСКАЛЫВАЕТСЯ. За ней - камера, запечатанная миллионы лет.',
        ascii: [
          '  ████ CRACK ████',
          '  ██           ██',
          '  ██  ANCIENT  ██',
          '  ██  CACHE    ██',
          '  ██           ██',
          '  ████████████████',
        ].join('\n'),
        options: [
          { text: '> Войти в камеру', next: 'end_machine_treasure' },
        ]
      },
      gas_pocket: {
        text: 'Газовый карман! Из трещины бьёт струя раскалённого пара. Нужно пройти через облако.',
        options: [
          { text: '> Прорваться', next: 'gas_survive', check: { stat: 'hp', min: 40, failNext: 'end_gas_death' } },
          { text: '> Назад', next: 'level2' },
        ]
      },
      gas_survive: {
        text: 'Ожоги, но вы прорвались. За карманом - чистый участок с редкими чёрными кристаллами.',
        options: [
          { text: '> Собрать чёрные кристаллы', next: 'end_black_crystals' },
          { text: '> Дальше, на третий уровень', next: 'level3' },
        ]
      },
      touch: {
        text: 'Вы прикоснулись. Вспышка! Образы в голове: древняя цивилизация, ушедшая вглубь планеты миллионы лет назад. Это - их маяк. Они дарят вам знание. И предупреждение: "Не возвращайтесь."',
        options: [
          { text: '> Принять дар', next: 'end_gift' },
        ]
      },
      touch_fail: {
        text: 'Прикосновение! Энергетический разряд! Вас отбрасывает к стене. Корпус повреждён, но вы живы. Структура погасла.',
        options: [
          { text: '> Убраться отсюда', next: 'end_shocked' },
        ]
      },
      scan_artifact: {
        text: 'Сканер зашкаливает. Это источник энергии - мощнее всего, что известно науке. Данные бесценны. Структура резонирует на частоте чёрных кристаллов.',
        options: [
          { text: '> Прикоснуться', next: 'touch', check: { stat: 'defense', min: 8, failNext: 'touch_fail' } },
          { text: '> Уйти с данными', next: 'end_scan_data' },
        ]
      },
      no_scanner: {
        text: 'Без сканера вы видите только пульсирующий камень. Что оно такое - загадка.',
        options: [
          { text: '> Прикоснуться', next: 'touch', check: { stat: 'defense', min: 8, failNext: 'touch_fail' } },
          { text: '> Уйти', next: 'end_run_up' },
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Шахтёры посмотрели с разочарованием. Ну и ладно.',
        ending: true,
        result: {}
      },
      end_surface_ore: {
        text: 'Вы собрали руду с первого уровня. Немного, но для отчёта хватит.',
        ending: true,
        result: { credits: 325, reputation: 5, factionRep: { miners: 2 } }
      },
      end_crystals_some: {
        text: 'Пара кристаллов - уже неплохо. Учёные заплатят.',
        ending: true,
        result: { credits: 520, reputation: 5 }
      },
      end_scan_crystals: {
        text: 'Данные сканирования кристаллов - научная ценность. Три типа, три частоты. Учёные на станции заплатили щедро.',
        ending: true,
        result: { credits: 975, reputation: 10, factionRep: { scientists: 3 } }
      },
      end_all_crystals: {
        text: 'Полный набор рассортированных кристаллов. Синие, красные, чёрные - каждый в своём контейнере. Учёные в экстазе.',
        ending: true,
        result: { credits: 1950, reputation: 15, flags: { crystal_blue: true, crystal_red: true, crystal_black: true, has_sorted_crystals: true }, factionRep: { scientists: 5 } }
      },
      end_crystals_full: {
        text: 'Карманы набиты кристаллами. За спиной гул переходит в рёв. Вы бежите вверх, не оглядываясь. Выход обваливается за вашей спиной.',
        ending: true,
        result: { credits: 1300, reputation: 8, damage: 5, flags: { crystal_blue: true } }
      },
      end_crystals_collapse: {
        text: 'Вы жадно хватаете кристаллы - и потолок ОБРУШИВАЕТСЯ! Камни бьют по плечам, по спине. Вы ползёте к лестнице, теряя половину кристаллов. Еле выбрались.',
        ending: true,
        result: { credits: 520, reputation: 3, damage: 30 }
      },
      end_crystals_resonance: {
        text: 'При отделении кристаллов вся пещера начинает ПЕТЬ. Резонанс! Кристаллы вибрируют, стены трескаются - и из трещин хлещет раскалённый газ. Вы бросаете всё и бежите. Кристаллы взрываются за спиной, но один осколок застрял в кармане. Учёные потом скажут - это стоит целое состояние.',
        ending: true,
        result: { credits: 2275, damage: 20, reputation: 12, flags: { rare_crystal: true, crystal_red: true } }
      },
      end_run_up: {
        text: 'Вы выбрались. Шахтёрам сказали, что внизу обвал. Они не стали проверять.',
        ending: true,
        result: { credits: 195, reputation: 3 }
      },
      end_gift: {
        text: 'Древние знания! Карты неизвестных маршрутов, координаты спрятанных станций. Вы стали богаче не только деньгами. В голове пульсирует образ: пирамида из неизвестного металла...',
        ending: true,
        result: { credits: 2275, reputation: 20, flags: { ancient_knowledge: true, mine_artifact_touched: true }, factionRep: { miners: 5 } }
      },
      end_shocked: {
        text: 'Вы еле выбрались, опираясь на стену. Корпус повреждён, но вы живы. И вы ЗНАЕТЕ, что внизу что-то есть.',
        ending: true,
        result: { credits: 130, reputation: 5, damage: 20, flags: { mine_artifact_touched: true } }
      },
      end_scan_data: {
        text: 'Данные сканирования проданы учёным. Они снарядят экспедицию. Вы предупредили их об опасности.',
        ending: true,
        result: { credits: 1625, reputation: 15, flags: { mine_scan_sold: true }, factionRep: { scientists: 5, miners: 3 } }
      },
      end_black_crystals: {
        text: 'Чёрные кристаллы - самые редкие. Гул в голове не прекращается часами после выхода. Учёные заплатили втрое больше обычного.',
        ending: true,
        result: { credits: 1625, reputation: 12, damage: 5, flags: { crystal_black: true } }
      },
      end_gas_death: {
        text: 'Газ слишком горячий. Вы отступаете с ожогами, но живой. Этот путь закрыт.',
        ending: true,
        result: { damage: 25, reputation: 2 }
      },
      end_level4_flee: {
        text: 'Четвёртый уровень существует. Машина Предтеч ждёт своего часа. Вы ушли, но координаты запомнили.',
        ending: true,
        result: { credits: 975, reputation: 10, flags: { mine_level4_found: true }, factionRep: { miners: 5 } }
      },
      end_machine_treasure: {
        text: 'Камера Предтеч! Артефакты, кристаллические чипы, карта подземных тоннелей всей системы. Машина загудела и погасла - одноразовый ключ. Вы первый за миллионы лет, кто видит это.',
        ending: true,
        result: { credits: 4550, reputation: 30, flags: { crystal_knowledge: true, mine_machine_activated: true, crystal_blue: true, crystal_red: true, crystal_black: true }, factionRep: { miners: 10, scientists: 8 } }
      },
    }
  },

  // ===== 4. КУРОРТНЫЙ КОШМАР (resort) =====
  {
    id: 'resort_murder',
    title: 'Убийство на курорте',
    planetType: 'resort',
    minDay: 10,
    oneTime: true,
    ascii: [
      '  ╔══════════════════════╗',
      '  ║  HOTEL  STELLARIS    ║',
      '  ║  ★ ★ ★ ★ ★          ║',
      '  ║  "Paradise awaits"   ║',
      '  ╚══════════════════════╝',
      '       |  |  |  |  |',
      '       |__|__|__|__|',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/resort_murder.png',
        text: 'Отель "Стелларис", лучший на курорте. Вас встречает перепуганный менеджер: "Гость убит в номере 404! Полиция будет через 3 дня. Найдите убийцу - 3000 кредитов!"',
        ascii: [
          '  ROOM 404: CRIME SCENE',
          '  ┌─────────────────┐',
          '  │  X   ~~~~  [?]  │',
          '  │      ~~~~       │',
          '  │  [!]      {$}   │',
          '  └─────────────────┘',
        ].join('\n'),
        options: [
          { text: '> Осмотреть номер 404', next: 'room404' },
          { text: '> Опросить персонал', next: 'staff' },
          { text: '> Мастер-ключ от Гильдии', next: 'trader_access', check: { stat: 'reputation', faction: 'traders', min: 8, failNext: 'trader_no_access' } },
          { text: '> Подкупить ресепшен (500 кр)', next: 'bribe_receptionist', cost: { credits: 325 } },
          { text: '> Не моё дело', next: 'end_leave' },
        ]
      },
      room404: {
        img: 'quests/resort_crime_scene.png',
        text: 'Жертва - торговец роскошью. Убит выстрелом. На столе - бокал с остатками вина, наполовину прочитанная книга и включённый терминал с открытой сделкой на 50000 кредитов.',
        options: [
          { text: '> Проверить терминал', next: 'terminal_clue' },
          { text: '> Осмотреть бокал', next: 'glass_clue' },
          { text: '> Сканировать комнату', next: 'room404_scan', check: { stat: 'scanner', value: true, failNext: 'room404_no_scan' } },
          { text: '> Опросить персонал', next: 'staff' },
        ]
      },
      terminal_clue: {
        text: 'Сделка: продажа артефактов некоему "Г.К." - сумма огромная. Последнее сообщение: "Встреча в 22:00 в баре. Приди один."',
        options: [
          { text: '> Проверить камеры бара', next: 'bar_cameras', check: { stat: 'scanner', value: true, failNext: 'no_cameras' } },
          { text: '> Осмотреть бокал', next: 'glass_clue' },
          { text: '> Опросить персонал', next: 'staff' },
        ]
      },
      glass_clue: {
        text: 'В бокале - следы снотворного. Жертву усыпили перед убийством. Тот, кто это сделал, имел доступ к номеру.',
        options: [
          { text: '> Опросить персонал', next: 'staff' },
          { text: '> Проверить терминал', next: 'terminal_clue' },
        ]
      },
      staff: {
        text: 'Три подозреваемых:\n\n1) Горничная Мила - нервничает, у неё ключ от номера\n2) Бармен Крот - знал жертву, работал в 22:00\n3) Гость из 403 - "Г.К." на бирке чемодана',
        ascii: [
          '  SUSPECTS:',
          '  [1] Mila   - maid    - HAS KEY',
          '  [2] Krot   - barman  - ON DUTY',
          '  [3] G.K.   - guest   - NEXT DOOR',
        ].join('\n'),
        options: [
          { text: '> Допросить горничную', next: 'maid' },
          { text: '> Допросить бармена', next: 'barman' },
          { text: '> Проверить гостя', next: 'guest' },
        ]
      },
      maid: {
        text: 'Мила плачет: "Я принесла ему вино в 21:30. Он был жив! Я ничего не добавляла!" У неё следы от слёз и дрожат руки.',
        options: [
          { text: '> Допросить бармена', next: 'barman' },
          { text: '> Проверить гостя', next: 'guest' },
          { text: '> Это она! (обвинить)', next: 'accuse_maid' },
        ]
      },
      barman: {
        text: 'Крот спокоен: "Да, знал его. Да, готовил вино. Нет, ничего не подсыпал. Проверьте камеры если не верите." У него алиби - был за стойкой весь вечер.',
        options: [
          { text: '> Допросить горничную', next: 'maid' },
          { text: '> Проверить гостя', next: 'guest' },
          { text: '> Это он! (обвинить)', next: 'accuse_barman' },
        ]
      },
      guest: {
        text: 'Номер 403 пуст. Гость сбежал. На кровати - перчатки с следами пороха и пустой пузырёк снотворного.',
        ascii: [
          '  ROOM 403:',
          '  ┌─────────────────┐',
          '  │  [gloves] {vial} │',
          '  │                  │',
          '  │   GUEST FLED     │',
          '  └─────────────────┘',
        ].join('\n'),
        options: [
          { text: '> Г.К. - убийца!', next: 'end_correct' },
          { text: '> Проверить камеры', next: 'bar_cameras', check: { stat: 'scanner', value: true, failNext: 'end_correct' } },
          { text: '> Преследовать к докам!', next: 'dock_area' },
        ]
      },
      bar_cameras: {
        text: 'Камеры показывают: в 21:50 Г.К. подсел к Миле и незаметно подменил бутылку вина. В 22:20 он зашёл в номер 404. Через 3 минуты вышел.',
        options: [
          { text: '> Дело раскрыто!', next: 'end_full_evidence' },
        ]
      },
      no_cameras: {
        text: 'Система камер зашифрована. Без сканера не взломать.',
        options: [
          { text: '> Проверить гостя из 403', next: 'guest' },
          { text: '> Опросить персонал', next: 'staff' },
        ]
      },
      accuse_maid: {
        text: 'Мила рыдает. Менеджер сомневается. Когда приедет полиция, выяснится что она невиновна. Вам... неловко.',
        options: [
          { text: '> Упс', next: 'end_wrong' },
        ]
      },
      accuse_barman: {
        text: 'Крот показывает записи камер за стойкой. Алиби железное. Менеджер зол.',
        options: [
          { text: '> Продолжить расследование', next: 'guest' },
        ]
      },
      // === EXPANDED INVESTIGATION ===
      trader_access: {
        text: 'Вы показываете значок Торговой Гильдии. Менеджер бледнеет и кланяется. "Мастер-ключ, полный доступ ко всем помещениям и регистр гостей - пожалуйста!" Он протягивает золотую карту.',
        options: [
          { text: '> Проверить регистр', next: 'guest_registry' },
          { text: '> Сразу в номер 404', next: 'room404' },
        ]
      },
      trader_no_access: {
        text: 'Менеджер качает головой. "Мастер-ключ только для партнёров Гильдии высокого ранга. Извините."',
        options: [
          { text: '> Осмотрю так', next: 'room404' },
        ]
      },
      bribe_receptionist: {
        text: 'Девушка на ресепшен колеблется. 500 кредитов решают её сомнения. Она открывает регистр гостей и оглядывается по сторонам.',
        options: [
          { text: '> Кто в номере 403?', next: 'guest_registry' },
        ]
      },
      guest_registry: {
        text: 'Номер 403: Григорий Кваркс, торговец антиквариатом. Прибыл 2 дня назад. Оплата наличными. Пометка в регистре: "Выход не зарегистрирован." Сбежал через доки.',
        options: [
          { text: '> К докам!', next: 'dock_area' },
          { text: '> Сначала осмотреть номера', next: 'room404' },
        ]
      },
      room404_scan: {
        text: 'Сканер выявляет: чужая ДНК на бокале, отпечаток обуви у двери - военные ботинки 44 размера, пороховой след от вентиляционной решётки. Убийца стрелял из номера 403 через вентиляцию!',
        options: [
          { text: '> Проверить номер 403', next: 'guest' },
          { text: '> Сопоставить ДНК в базе', next: 'dna_match' },
        ]
      },
      room404_no_scan: {
        text: 'Без специального оборудования трудно найти что-то ещё. Визуальный осмотр - всё.',
        options: [
          { text: '> Проверить терминал', next: 'terminal_clue' },
          { text: '> Осмотреть бокал', next: 'glass_clue' },
        ]
      },
      dna_match: {
        text: 'ДНК совпадает с гостем из 403 - Григорий Кваркс. Система показывает: он не покидал отель через главный вход. Значит - доки.',
        options: [
          { text: '> К докам!', next: 'dock_area' },
          { text: '> Собрать улики и ждать полицию', next: 'end_full_evidence' },
        ]
      },
      dock_area: {
        text: 'Грузовые доки. Рабочий у кранов кивает: "Высокий тип? Побежал к причалу 7. Пять минут назад." Грузовой шаттл уже прогревает двигатели.',
        options: [
          { text: '> Бежать к причалу!', next: 'dock_chase', check: { stat: 'speed', min: 4, failNext: 'end_chase_lost' } },
          { text: '> Подкупить докера (300 кр)', next: 'dock_bribe', cost: { credits: 195 } },
        ]
      },
      dock_chase: {
        text: 'Вы настигаете Кваркса у трапа! Он оборачивается - в руке пистолет. "Не подходи, пилот!"',
        options: [
          { text: '> Обезоружить!', next: 'gk_confrontation', check: { stat: 'attack', min: 10, failNext: 'end_gk_shoots' } },
          { text: '> Уговорить сдаться', next: 'gk_talk' },
        ]
      },
      dock_bribe: {
        text: 'Докер берёт деньги и "случайно" отключает топливную линию к причалу 7. Кваркс пытается завести двигатели - не работает. Выбегает из шаттла в ярости... и видит вас.',
        options: [
          { text: '> Поговорим', next: 'gk_talk' },
          { text: '> Обезоружить!', next: 'gk_confrontation', check: { stat: 'attack', min: 10, failNext: 'end_gk_shoots' } },
        ]
      },
      gk_confrontation: {
        text: 'Вы выбиваете пистолет ударом. Кваркс падает. "Ладно! Признаюсь! Он украл мои артефакты и перепродавал. Я забрал своё. Он потянулся к оружию первым!"',
        options: [
          { text: '> Сдать полиции', next: 'end_detective_master' },
          { text: '> Отпустить', next: 'end_gk_free' },
        ]
      },
      gk_talk: {
        text: 'Вы поднимаете руки. "Кваркс, я не полиция. Хочу знать правду." Он колеблется. "Торговец украл мои артефакты. 50000 - мои деньги. Я не убийца... он первый потянулся к пистолету."',
        options: [
          { text: '> Сдать полиции', next: 'end_detective_master' },
          { text: '> Отпустить', next: 'end_gk_free' },
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Детектив из вас так себе.',
        ending: true,
        result: {}
      },
      end_wrong: {
        text: 'Неправильный подозреваемый! Менеджер платит только 500 за попытку. Стыдно.',
        ending: true,
        result: { credits: 325, reputation: -8 }
      },
      end_correct: {
        text: 'Г.К. - убийца! Менеджер доволен. 3000 кредитов ваши, и имя в местной газете.',
        ending: true,
        result: { credits: 1950, reputation: 12, flags: { detective_reputation: true }, factionRep: { traders: 3 } }
      },
      end_full_evidence: {
        text: 'Дело раскрыто с полной доказательной базой! Менеджер добавляет бонус: 4000 кредитов и пожизненная скидка в отеле. "Если когда-нибудь понадобится детектив - я знаю, кому звонить."',
        ending: true,
        result: { credits: 2600, reputation: 20, flags: { detective_reputation: true, detective_master: true }, factionRep: { traders: 5 } }
      },
      end_chase_lost: {
        text: 'Вы не успели. Шаттл на причале 7 взлетает раньше, чем вы добежали. Кваркс улетел. Вы сообщаете менеджеру имя и номер - хотя бы это. 2000 кредитов. Но убийца на свободе.',
        ending: true,
        result: { credits: 1300, reputation: 8, flags: { detective_reputation: true, gk_at_large: true }, factionRep: { traders: 2 } }
      },
      end_gk_shoots: {
        text: 'Кваркс стреляет! Попадание в плечо. Вы падаете, а он запрыгивает в шаттл и улетает. Менеджер платит за лечение и расследование, но убийца ушёл.',
        ending: true,
        result: { credits: 975, reputation: 5, damage: 20, flags: { detective_reputation: true, gk_at_large: true }, factionRep: { traders: 1 } }
      },
      end_detective_master: {
        text: 'Кваркс в наручниках. Полная доказательная база, живой подозреваемый, мотив ясен. Менеджер в экстазе: 5000 кредитов и рекомендательное письмо от отеля. Когда полиция прибывает, им остаётся только забрать арестованного. Ваше имя в секторе теперь означает "детектив".',
        ending: true,
        result: { credits: 3250, reputation: 30, flags: { detective_reputation: true, detective_master: true }, factionRep: { traders: 6 } }
      },
      end_gk_free: {
        text: 'Вы отпускаете Кваркса. Он кивает: "Не забуду." Менеджеру вы сообщаете: "Убийца сбежал через доки. Имя - Григорий Кваркс." 2500 за информацию. Совесть... неспокойна.',
        ending: true,
        result: { credits: 1625, reputation: 5, flags: { detective_reputation: true, gk_at_large: true }, factionRep: { traders: 2 } }
      },
    }
  },

  // ===== 5. ВОЕННЫЙ ТРИБУНАЛ (military) =====
  {
    id: 'tribunal',
    title: 'Военный трибунал',
    planetType: 'military',
    minDay: 7,
    oneTime: true,
    ascii: [
      '  ╔══════════════════════╗',
      '  ║  MILITARY  TRIBUNAL  ║',
      '  ║  ═══════════════════ ║',
      '  ║  DEFENDANT: [YOU]    ║',
      '  ║  CHARGE: ESPIONAGE   ║',
      '  ╚══════════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/tribunal.png',
        text: 'Вас задержали на КПП. Генерал Вортекс показывает фото: "Ваш корабль зафиксирован рядом с утечкой секретных данных. Объясните."',
        ascii: [
          '  [GENERAL VORTEX]',
          '  ___',
          '  |o_o| "Speak."',
          '  |===|',
          '  |   |',
        ].join('\n'),
        options: [
          { text: '> Я невиновен! Давайте разберёмся', next: 'defend' },
          { text: '> Генерал, проверьте мой послужной список', next: 'military_recognition', check: { stat: 'reputation', faction: 'military', min: 7, failNext: 'military_no_rep' } },
          { text: '> Я детектив. Могу помочь найти шпиона', next: 'detective_intro', check: { flag: 'detective_reputation', flagValue: true, failNext: 'defend' } },
          { text: '> Предложить сотрудничество', next: 'cooperate' },
          { text: '> Попытаться сбежать', next: 'escape', check: { stat: 'speed', min: 6, failNext: 'escape_fail' } },
        ]
      },
      military_recognition: {
        text: 'Вортекс проверяет базу. Брови ползут вверх. "Тюремный транспорт... помощь конвою... Впечатляет. Хорошо, я вам верю - вы не шпион. Но шпион есть. Поможете найти - и Флот будет вам обязан. Полный доступ к уликам."',
        options: [
          { text: '> С удовольствием', next: 'defend_full_access' },
          { text: '> Просто отпустите меня', next: 'end_military_released' },
        ]
      },
      military_no_rep: {
        text: '"Послужной список? Пусто. Ни одной записи в базе Флота. Вы - никто." Вортекс холоден.',
        options: [
          { text: '> Давайте разберёмся по-другому', next: 'defend' },
          { text: '> Тогда сотрудничество', next: 'cooperate' },
        ]
      },
      detective_intro: {
        text: 'Вортекс прищуривается. "Детектив? Проверяю..." Пауза. "Курортное убийство. Раскрыто. Впечатляет." Он складывает руки. "Хорошо, детектив. Работайте. Но на моих условиях - полный доступ к уликам, но всё через меня."',
        options: [
          { text: '> Принимаю. Начну с места утечки', next: 'detective_leak' },
          { text: '> Мне нужен доступ к камерам наблюдения', next: 'detective_cameras' },
        ]
      },
      defend_full_access: {
        img: 'quests/tribunal_interrogation.png',
        text: 'Вортекс выдаёт пропуск высшего уровня. "Серверная, камеры, допросные - всё ваше. И ещё - посмотрите улики в хранилище. Мои ребята что-то нашли, но не могут разобраться."',
        options: [
          { text: '> Хранилище улик', next: 'evidence_locker' },
          { text: '> Серверная (место утечки)', next: 'leak_site' },
          { text: '> Допросить задержанных', next: 'prisoners' },
        ]
      },
      detective_leak: {
        text: 'Место утечки - серверная. С вашим опытом детектива всё ясно за минуту: взлом через внешний порт, профессиональная работа. Микрочип на полу - с логотипом научного института. Но вы замечаете ещё кое-что: царапины на вентиляционной решётке. Кто-то уходил через вентиляцию.',
        options: [
          { text: '> Проследить маршрут через вентиляцию', next: 'vent_trail' },
          { text: '> Допросить капитана "Кварка"', next: 'kvark_interrogation' },
          { text: '> Обвинить "Кварк" сразу', next: 'accuse_kvark' },
        ]
      },
      detective_cameras: {
        text: 'Записи камер: в 02:17 фигура в тёмной одежде входит в серверную. Лицо скрыто. В 02:34 - выходит через вентиляцию. Но в 02:15 камера у дока "Кварка" показывает: капитан выходит из корабля и идёт в направлении серверной.',
        options: [
          { text: '> Допросить капитана "Кварка"', next: 'kvark_interrogation' },
          { text: '> Проверить вентиляцию', next: 'vent_trail' },
        ]
      },
      vent_trail: {
        text: 'Вентиляционный маршрут ведёт к доку "Кварка". На стенке вентиляции - волосок. И следы смазки от научного оборудования. Кто-то из "Кварка" лазил по вентиляции.',
        options: [
          { text: '> Обвинить "Кварк"', next: 'accuse_kvark_evidence' },
          { text: '> Сначала допросить капитана', next: 'kvark_interrogation' },
        ]
      },
      evidence_locker: {
        text: 'Хранилище улик. На столе: микрочип с научным логотипом, обрывок ткани из вентиляции, и... датапад. Зашифрован, но с пометкой "Кварк". Расшифровка покажет мотив.',
        options: [
          { text: '> Расшифровать датапад (сканер)', next: 'datapad_decrypt', check: { stat: 'scanner', value: true, failNext: 'datapad_no_scanner' } },
          { text: '> Чип с логотипом - этого достаточно', next: 'accuse_kvark' },
          { text: '> Осмотреть место утечки', next: 'leak_site' },
        ]
      },
      datapad_decrypt: {
        text: 'Сканер ломает шифр за 3 минуты. Содержимое: переписка капитана "Кварка" с покупателем секретных данных. Но есть деталь - он пишет: "Моя семья в заложниках. У меня нет выбора. Передаю данные - отпустите их."',
        options: [
          { text: '> Показать Вортексу - с контекстом', next: 'accuse_kvark_sympathy' },
          { text: '> Показать Вортексу - только факт шпионажа', next: 'accuse_kvark_cold' },
          { text: '> Поговорить с капитаном лично', next: 'kvark_interrogation' },
        ]
      },
      datapad_no_scanner: {
        text: 'Без сканера датапад не взломать. Но остальных улик хватает.',
        options: [
          { text: '> Чип с логотипом - достаточно', next: 'accuse_kvark' },
          { text: '> Допросить задержанных', next: 'prisoners' },
        ]
      },
      kvark_interrogation: {
        text: 'Капитан "Кварка" - профессор Ремизов. Спокоен. Слишком спокоен. Но когда вы упоминаете вентиляцию, его руки дрожат. "Я... у меня не было выбора. Они держат мою семью. Жена и дочь на Кеплере. Если я не передам данные..." Он замолкает.',
        options: [
          { text: '> Помочь спасти семью', next: 'kvark_family' },
          { text: '> Сочувствую, но сдам генералу', next: 'accuse_kvark_sympathy' },
          { text: '> Шпион есть шпион', next: 'accuse_kvark_cold' },
        ]
      },
      kvark_family: {
        text: 'Вы идёте к Вортексу. "Генерал, шпион - капитан "Кварка". Но его семья в заложниках. Предлагаю: он сдаёт заказчика, Флот спасает семью, обвинения смягчают." Вортекс думает.',
        options: [
          { text: '> Это правильное решение', chances: [
            { weight: 70, next: 'end_hero_family' },
            { weight: 30, next: 'end_hero_family_fail' },
          ]},
        ]
      },
      accuse_kvark_sympathy: {
        text: 'Вортекс читает датапад. "Заложники... Мразь, кто бы ни стоял за этим." Он вызывает спецгруппу. "Мы найдём его семью. А капитан ответит - но суд учтёт обстоятельства."',
        options: [
          { text: '> Рад что справедливость восторжествовала', next: 'end_hero_compassion' },
        ]
      },
      accuse_kvark_cold: {
        text: 'Вортекс арестовывает капитана. Ремизов сдаётся без сопротивления. "Моя семья..." - шепчет он. Вортекс пожимает плечами: "Это не моя проблема."',
        options: [
          { text: '> Дело сделано', next: 'end_hero_cold' },
        ]
      },
      accuse_kvark_evidence: {
        text: 'Волосок, смазка, маршрут через вентиляцию - железные улики. Вортекс впечатлён: "Детектив, вы нашли больше, чем мои люди за сутки." Капитан "Кварка" сдаётся.',
        options: [
          { text: '> Допросить его', next: 'kvark_interrogation' },
          { text: '> Дело закрыто', next: 'end_hero_detective' },
        ]
      },
      defend: {
        text: 'Генерал слушает. "Хорошо. У вас есть три улики для проверки. Найдите настоящего шпиона - и вы свободны."',
        options: [
          { text: '> Проверить записи КПП', next: 'checkpoint' },
          { text: '> Осмотреть место утечки', next: 'leak_site' },
          { text: '> Поговорить с другими задержанными', next: 'prisoners' },
        ]
      },
      cooperate: {
        text: '"Сотрудничество? Интересно. У нас пропал агент в пиратском секторе. Найдите его - и обвинения снимут. Плюс 2000 кредитов."',
        options: [
          { text: '> Согласен', next: 'end_mission_accept' },
          { text: '> Сначала докажите что я невиновен', next: 'defend' },
        ]
      },
      escape: {
        text: 'Ваш корабль быстрее их патрулей! Вы вырываетесь из дока...',
        options: [
          { text: '> Гиперпрыжок!', chances: [
            { weight: 70, next: 'end_escape' },
            { weight: 30, next: 'end_escape_chase' },
          ]},
        ]
      },
      escape_fail: {
        text: 'Патрули заблокировали док. Корабль слишком медленный. Вас вернули в камеру. Генерал НЕ доволен.',
        options: [
          { text: '> Ладно, давайте разберёмся', next: 'defend_angry' },
          { text: '> Прорываться с боем!', next: 'combat_escape', check: { stat: 'attack', min: 14, failNext: 'end_escape_beaten' } },
        ]
      },
      combat_escape: {
        text: 'Вы разоружаете охранника, хватаете его бластер. Стрельба по системам стыковки - замок отключается! Прыжок к кораблю, двигатели на максимум!',
        options: [
          { text: '> Экстренный гиперпрыжок!', chances: [
            { weight: 60, next: 'end_combat_escape' },
            { weight: 40, next: 'end_combat_escape_damaged' },
          ]},
        ]
      },
      defend_angry: {
        text: '"Попытка побега - ещё одна статья. Но я дам вам ПОСЛЕДНИЙ шанс. Найдите шпиона."',
        options: [
          { text: '> Проверить записи КПП', next: 'checkpoint' },
          { text: '> Осмотреть место утечки', next: 'leak_site' },
        ]
      },
      checkpoint: {
        text: 'Записи КПП: три корабля были в зоне утечки. Ваш, грузовоз "Надежда" и научное судно "Кварк". "Кварк" прибыл за час до утечки и улетел сразу после.',
        options: [
          { text: '> Это "Кварк"!', next: 'accuse_kvark' },
          { text: '> Нужно больше улик', next: 'leak_site' },
        ]
      },
      leak_site: {
        text: 'Место утечки - серверная. Взлом через внешний порт. На полу - микрочип с логотипом научного института. Знакомый логотип...',
        options: [
          { text: '> "Кварк" - научное судно!', next: 'accuse_kvark' },
          { text: '> Просканировать серверную', next: 'leak_scan', check: { stat: 'scanner', value: true, failNext: 'leak_no_scan' } },
          { text: '> Поговорить с задержанными', next: 'prisoners' },
        ]
      },
      leak_scan: {
        text: 'Сканер показывает: отпечатки пальцев на клавиатуре совпадают с биометрией капитана "Кварка". В вентиляции - следы научной смазки. Цифровой след взлома ведёт к портативному терминалу, который сейчас на борту "Кварка".',
        options: [
          { text: '> Обвинить "Кварк" с доказательствами', next: 'accuse_kvark_evidence' },
          { text: '> Допросить капитана', next: 'kvark_interrogation' },
        ]
      },
      leak_no_scan: {
        text: 'Без сканера видно только микрочип. Косвенная улика.',
        options: [
          { text: '> "Кварк" - научное судно!', next: 'accuse_kvark' },
          { text: '> Поговорить с задержанными', next: 'prisoners' },
        ]
      },
      prisoners: {
        text: 'Двое задержанных. Пилот "Надежды" - старый контрабандист, нервничает из-за груза, а не из-за шпионажа. Капитан "Кварка" - спокойный учёный. СЛИШКОМ спокойный.',
        options: [
          { text: '> Обвинить капитана "Кварка"', next: 'accuse_kvark' },
          { text: '> "Я чемпион арены. Хочешь проверить?"', next: 'arena_intimidate', check: { flag: 'arena_champion', flagValue: true, failNext: 'prisoners_no_arena' } },
          { text: '> Обвинить пилота "Надежды"', next: 'end_wrong_accused' },
        ]
      },
      arena_intimidate: {
        text: 'Вы напоминаете капитану "Кварка" про арену. Контрабандист из "Надежды" шарахается. Капитан "Кварка" бледнеет: "Чемпион арены?.. Ладно. Я скажу правду. Не бейте." Он раскалывается сам.',
        options: [
          { text: '> Говори', next: 'kvark_interrogation' },
        ]
      },
      prisoners_no_arena: {
        text: 'Капитан "Кварка" смотрит безразлично. Ваши угрозы его не впечатлили.',
        options: [
          { text: '> Обвинить "Кварк"', next: 'accuse_kvark' },
          { text: '> Обвинить "Надежду"', next: 'end_wrong_accused' },
        ]
      },
      accuse_kvark: {
        text: 'Генерал проверяет. Капитан "Кварка" бледнеет. В его каюте находят зашифрованные данные. Шпион раскрыт!',
        options: [
          { text: '> Рад помочь', next: 'end_hero' },
        ]
      },
      // === ENDINGS ===
      end_escape: {
        text: 'Вы сбежали, но военные объявили вас в розыск. Репутация у военных - минус.',
        ending: true,
        result: { credits: 0, reputation: -20, flags: { military_fugitive: true }, factionRep: { military: -10 } }
      },
      end_escape_chase: {
        text: 'Погоня! Фрегат на хвосте. Он стреляет! Вы уходите в гиперпрыжок с повреждениями. Военные запомнят ваш корабль.',
        ending: true,
        result: { reputation: -25, damage: 20, flags: { military_fugitive: true }, factionRep: { military: -12 } }
      },
      end_combat_escape: {
        text: 'Вы прорвались с боем! Охранник ранен, стыковочный замок повреждён. Гиперпрыжок - и вы в безопасности. Но теперь вы не просто подозреваемый - вы вооружённый беглец.',
        ending: true,
        result: { reputation: -30, flags: { military_fugitive: true, convicted: true }, factionRep: { military: -15 }, teleport: 'random' }
      },
      end_combat_escape_damaged: {
        text: 'Прорыв удался, но фрегат успел всадить торпеду в борт. Корабль дымится. Гиперпрыжок на последнем заряде. Вы живы, но военные объявили награду за вашу голову.',
        ending: true,
        result: { reputation: -35, damage: 30, flags: { military_fugitive: true, convicted: true }, factionRep: { military: -18 }, teleport: 'random' }
      },
      end_escape_beaten: {
        text: 'Охрана оказалась профессиональнее. Вас скрутили, обезоружили и бросили в камеру. Штраф за нападение на военных.',
        ending: true,
        result: { credits: -1000, reputation: -15, damage: 10, flags: { convicted: true }, factionRep: { military: -8 } }
      },
      end_military_released: {
        text: 'Вортекс отпускает вас. "Вы свободны. Но если пересечёмся - я рассчитываю на помощь." Рукопожатие. Чистый уход.',
        ending: true,
        result: { credits: 325, reputation: 10, factionRep: { military: 4 } }
      },
      end_mission_accept: {
        text: 'Задание принято. Обвинения сняты условно. 1000 кредитов аванс.',
        ending: true,
        result: { credits: 650, reputation: 5, flags: { military_agent: true }, factionRep: { military: 3 } }
      },
      end_wrong_accused: {
        text: 'Неправильно! Контрабандист просто возил нелегальный груз. Генерал разочарован. Штраф.',
        ending: true,
        result: { credits: -500, reputation: -10, factionRep: { military: -3 } }
      },
      end_hero: {
        text: 'Генерал жмёт руку: "Отличная работа. Военный Флот у вас в долгу. Если понадобится помощь - обращайтесь." 3000 кредитов и благодарность.',
        ending: true,
        result: { credits: 1950, reputation: 25, flags: { military_hero: true }, factionRep: { military: 8 } }
      },
      end_hero_detective: {
        text: 'Вортекс впечатлён: "За 20 лет службы я не видел такого расследования. Детективские навыки, сканер, логика - безупречно." 4000 кредитов и запись в вашем деле: "Рекомендован для специальных операций."',
        ending: true,
        result: { credits: 2600, reputation: 30, flags: { military_hero: true }, factionRep: { military: 10 } }
      },
      end_hero_compassion: {
        text: 'Вортекс организовал операцию по спасению семьи Ремизова. Через неделю - жена и дочь в безопасности. Капитан сдал заказчика - целую шпионскую сеть. Вортекс: "Вы показали, что справедливость - не только наказание. Это и милосердие." 5000 кредитов и личная благодарность генерала.',
        ending: true,
        result: { credits: 3250, reputation: 35, flags: { military_hero: true }, factionRep: { military: 12, scientists: 3 } }
      },
      end_hero_family: {
        text: 'План сработал. Спецгруппа Флота вытащила семью Ремизова за 48 часов. Капитан сдал всю шпионскую цепочку. Вортекс лично вручает вам медаль: "За проявленную человечность и решение задачи, которую мои люди не смогли решить." 5000 кредитов и статус "друг Флота".',
        ending: true,
        result: { credits: 3250, reputation: 35, flags: { military_hero: true }, factionRep: { military: 12, scientists: 3 } }
      },
      end_hero_family_fail: {
        text: 'Спецгруппа опоздала - заложников перевезли. Но Ремизов всё равно сдал заказчика. Вортекс мрачен: "Мы найдём их. Рано или поздно." Вам - 3000 кредитов и благодарность. Не идеально, но шпион пойман.',
        ending: true,
        result: { credits: 1950, reputation: 25, flags: { military_hero: true }, factionRep: { military: 8 } }
      },
      end_hero_cold: {
        text: 'Шпион пойман, данные возвращены. Вортекс доволен. 3000 кредитов. Эффективно, без сантиментов.',
        ending: true,
        result: { credits: 1950, reputation: 22, flags: { military_hero: true }, factionRep: { military: 7 } }
      },
    }
  },

  // ===== 6. ЗАГАДКА ДРЕВНИХ (tech/research) =====
  {
    id: 'ancient_puzzle',
    title: 'Загадка Древних',
    planetType: 'tech',
    minDay: 12,
    oneTime: true,
    ascii: [
      '         *',
      '        ***',
      '       *****',
      '      *  *  *',
      '     * * * * *',
      '    *    *    *',
      '   *  ANCIENT  *',
      '  *   DEVICE    *',
      ' *****************',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/ancient_puzzle.png',
        text: 'Антикварная лавка на окраине станции. Старик-торговец показывает устройство: пирамида из неизвестного металла, покрытая символами. "Кто разгадает все пять граней - получит то, что внутри. Я жду уже 30 лет." Рядом с ним - профессор в потрёпанном пиджаке, изучающий рукопись.',
        ascii: [
          '    /\\',
          '   /??\\',
          '  /????\\',
          ' /??????\\',
          '/________\\',
          '  [????]',
        ].join('\n'),
        options: [
          { text: 'Попробовать разгадать', next: 'puzzle1' },
          { text: 'Просканировать пирамиду', next: 'scan_pyramid', check: { stat: 'scanner', value: true, failNext: 'no_scanner' } },
          { text: 'Поговорить с профессором', next: 'professor', check: { stat: 'reputation', faction: 'scientists', min: 8, failNext: 'professor_busy' } },
          { text: 'Купить напрямую (2000 кр)', next: 'buy_direct', cost: { credits: 1300 } },
          { text: 'Не интересно', next: 'end_leave' },
        ]
      },
      scan_pyramid: {
        text: 'Сканер выявляет внутреннюю структуру: пять камер, каждая за своей гранью. В центре - кристаллический накопитель данных. Сканер также показывает слабые подсказки на невидимых частотах - символы на гранях имеют ультрафиолетовые метки.',
        options: [
          { text: 'Решать с подсказками сканера', next: 'puzzle1_hint' },
          { text: 'Поговорить с профессором', next: 'professor', check: { stat: 'reputation', faction: 'scientists', min: 8, failNext: 'professor_busy' } },
        ]
      },
      no_scanner: {
        text: 'Без сканера видно только внешние символы. Придётся решать вслепую.',
        options: [
          { text: 'Попробовать разгадать', next: 'puzzle1' },
          { text: 'Поговорить с профессором', next: 'professor', check: { stat: 'reputation', faction: 'scientists', min: 8, failNext: 'professor_busy' } },
          { text: 'Купить (2000 кр)', next: 'buy_direct', cost: { credits: 1300 } },
        ]
      },
      professor: {
        text: 'Профессор Лим! Он узнаёт вас. "Коллега! Я изучаю эту пирамиду три месяца. Символы на ней - язык Предтеч. Я расшифровал часть - могу помочь с первыми тремя гранями. Но последние две... нужны знания, которых у меня нет."',
        options: [
          { text: 'Принять помощь', next: 'puzzle1_prof' },
          { text: 'Справлюсь сам', next: 'puzzle1' },
        ]
      },
      professor_busy: {
        text: 'Профессор бросает на вас беглый взгляд и возвращается к рукописи. Видимо, вы недостаточно известны в научных кругах.',
        options: [
          { text: 'Попробовать самому', next: 'puzzle1' },
          { text: 'Купить (2000 кр)', next: 'buy_direct', cost: { credits: 1300 } },
        ]
      },
      puzzle1_prof: {
        text: 'Лим переводит: "Начало всех начал круглое." Спираль - символ начала у Предтеч. Звезда - цель. Треугольник - завершение. Порядок очевиден.',
        options: [
          { text: 'Спираль-Звезда-Треугольник', next: 'puzzle2_prof' },
        ]
      },
      puzzle1_hint: {
        text: 'Грань первая: три символа - Звезда, Спираль, Треугольник. Подсказка: "Начало всех начал круглое." Сканер подсвечивает ультрафиолетовые стрелки: от круглого к остроконечному.',
        options: [
          { text: 'Спираль-Звезда-Треугольник', next: 'puzzle2_hint' },
          { text: 'Звезда-Спираль-Треугольник', next: 'puzzle_wrong1' },
        ]
      },
      puzzle1: {
        text: 'Грань первая: три символа - Звезда, Спираль, Треугольник. Четыре кнопки. Подсказка выгравирована: "Начало всех начал круглое."',
        ascii: [
          '  ★  @  ▲',
          '  [1][2][3][4]',
          '  ? -> ? -> ?',
        ].join('\n'),
        options: [
          { text: 'Спираль-Звезда-Треугольник', next: 'puzzle2' },
          { text: 'Звезда-Спираль-Треугольник', next: 'puzzle_wrong1' },
          { text: 'Треугольник-Спираль-Звезда', next: 'puzzle_wrong1' },
          { text: 'Использовать знание кристаллов', next: 'puzzle1_crystal', check: { flag: 'crystal_knowledge', flagValue: true, failNext: 'puzzle_wrong1' } },
        ]
      },
      puzzle1_crystal: {
        text: 'Кристаллическая структура! Вы узнаёте паттерн - те же символы были на машине в шахте. Спираль - энергия, звезда - направление, треугольник - завершение. Порядок ясен как день.',
        options: [
          { text: 'Спираль-Звезда-Треугольник', next: 'puzzle2_crystal' },
        ]
      },
      puzzle_wrong1: {
        text: 'Пирамида нагревается и издаёт неприятный звук. Старик качает головой. "Ещё попытка?"',
        options: [
          { text: 'Спираль-Звезда-Треугольник', next: 'puzzle2' },
          { text: 'Сдаюсь', next: 'end_give_up' },
        ]
      },
      puzzle2_prof: {
        text: 'КЛИК! Лим кивает. "Вторая грань - математика Предтеч. Квадраты чисел. 1-1, 2-4, 3-?" Он усмехается. "Эту даже я решил."',
        options: [
          { text: '9', next: 'puzzle3_prof' },
        ]
      },
      puzzle2_hint: {
        text: 'КЛИК! Вторая грань. "Один - начало. Два - пара. Три - ?" Сканер показывает: каждое число зеркально отражено. Квадраты.',
        ascii: [
          '  1 -> 1',
          '  2 -> 4',
          '  3 -> ?',
        ].join('\n'),
        options: [
          { text: '9 (квадраты)', next: 'puzzle3_hint' },
          { text: '7', next: 'puzzle2_wrong' },
        ]
      },
      puzzle2_crystal: {
        text: 'КЛИК! Кристаллическое знание подсказывает: у Предтеч числа - это резонансные частоты. Каждая отражается от себя. 1x1, 2x2, 3x3.',
        ascii: [
          '  1 -> 1',
          '  2 -> 4',
          '  3 -> ?',
        ].join('\n'),
        options: [
          { text: '9', next: 'puzzle3_crystal' },
        ]
      },
      puzzle2: {
        text: 'КЛИК! Первая грань открылась! Свет изнутри. Вторая грань: "Один - начало. Два - пара. Три - ?"',
        ascii: [
          '  1 -> 1',
          '  2 -> 4',
          '  3 -> ?',
          '  [7] [8] [9] [12]',
        ].join('\n'),
        options: [
          { text: '9 (квадраты)', next: 'puzzle3' },
          { text: '7', next: 'puzzle2_wrong' },
          { text: '12', next: 'puzzle2_wrong' },
        ]
      },
      puzzle2_wrong: {
        text: 'Неверно. Подсказка: "Каждое число смотрит в зеркало."',
        options: [
          { text: '9!', next: 'puzzle3' },
          { text: 'Сдаюсь', next: 'end_give_up' },
        ]
      },
      puzzle3_prof: {
        text: 'Лим открывает третью грань. Карта звёзд. "Найди дом. Дом там, где всё сходится." Он хмурится. "Центр, конечно. Но дальше... четвёртая грань. Тут я застрял."',
        options: [
          { text: 'Центр!', next: 'puzzle4_prof' },
        ]
      },
      puzzle3_hint: {
        text: 'Третья грань! Карта звёзд. "Найди дом. Дом там, где всё сходится." Сканер показывает гравитационные линии - все сходятся в центре.',
        options: [
          { text: 'Центр!', next: 'puzzle4_hint' },
          { text: 'Самая яркая звезда', next: 'puzzle3_wrong' },
        ]
      },
      puzzle3_crystal: {
        text: 'Третья грань. Карта звёзд. "Найди дом." Кристаллическая память подсказывает: у Предтеч "дом" - точка, где резонируют все частоты. Центр.',
        options: [
          { text: 'Центр', next: 'puzzle4_crystal' },
        ]
      },
      puzzle3: {
        text: 'Вторая открыта! Третья грань: карта звёзд. "Найди дом. Дом там, где всё сходится."',
        ascii: [
          '    *   *       *',
          '  *   *   *   *',
          '    *   [?]   *',
          '  *   *   *   *',
          '    *   *       *',
        ].join('\n'),
        options: [
          { text: 'Центр - точка схождения', next: 'puzzle4' },
          { text: 'Самая яркая звезда', next: 'puzzle3_wrong' },
        ]
      },
      puzzle3_wrong: {
        text: '"Яркость - не величие. Дом - там, где все пути ведут."',
        options: [
          { text: 'Центр!', next: 'puzzle4' },
          { text: 'Сдаюсь', next: 'end_give_up' },
        ]
      },
      puzzle4: {
        text: 'Три грани открыты! Четвёртая: на грани выгравирован философский вопрос на языке Предтеч. Рядом - перевод, нацарапанный чьей-то рукой: "Что ценнее - знание без действия, или действие без знания?"',
        ascii: [
          '  KNOWLEDGE | ACTION',
          '  =========   ======',
          '  (safe)      (risk)',
          '  [1]    [2]    [3]',
        ].join('\n'),
        options: [
          { text: 'Знание', next: 'puzzle4_knowledge' },
          { text: 'Действие', next: 'puzzle4_action' },
          { text: 'Ни то, ни другое - важен баланс', next: 'puzzle5' },
        ]
      },
      puzzle4_prof: {
        text: 'Четвёртая грань. Философский вопрос Предтеч. Лим бледнеет. "Вот где я застрял. Знание без действия, или действие без знания? Я всю жизнь выбирал знание... может, поэтому пирамида не открылась."',
        options: [
          { text: 'Знание', next: 'puzzle4_knowledge' },
          { text: 'Действие', next: 'puzzle4_action' },
          { text: 'Баланс - ни то, ни другое', next: 'puzzle5_prof' },
        ]
      },
      puzzle4_hint: {
        text: 'Четвёртая грань. Философия: "Знание без действия, или действие без знания?" Сканер не помогает - нет правильного ответа в физическом смысле. Но ультрафиолет показывает третью кнопку между двумя крайностями.',
        options: [
          { text: 'Знание', next: 'puzzle4_knowledge' },
          { text: 'Действие', next: 'puzzle4_action' },
          { text: 'Третья кнопка - баланс', next: 'puzzle5_hint' },
        ]
      },
      puzzle4_crystal: {
        text: 'Четвёртая грань. Философский вопрос. Но кристаллическая память хранит ответ Предтеч: они верили в гармонию. Три кристалла - три аспекта. Ни одна крайность не верна.',
        options: [
          { text: 'Баланс', next: 'puzzle5_crystal' },
        ]
      },
      puzzle4_knowledge: {
        text: 'Пирамида вибрирует. Грань приоткрылась... но не до конца. Вы слышите тихий голос: "Знающий, но не действующий - мёртв при жизни." Неверный ответ, но Предтечи ценят попытку.',
        options: [
          { text: 'Баланс!', next: 'puzzle5' },
          { text: 'Действие!', next: 'puzzle4_action' },
        ]
      },
      puzzle4_action: {
        text: 'Пирамида нагревается. Грань дрожит. "Действующий без знания - слеп." Тоже неверно.',
        options: [
          { text: 'Тогда баланс!', next: 'puzzle5' },
          { text: 'Сдаюсь', next: 'end_give_up' },
        ]
      },
      puzzle5: {
        img: 'quests/ancient_vault.png',
        text: 'КЛИК! Четвёртая грань открылась. Старик шепчет: "Никто раньше не доходил так далеко..." Пятая грань. Пирамида проецирует голограмму: три точки, соединённые линиями. Под каждой - символ: прошлое, настоящее, будущее. "Где стоит тот, кто ищет истину?"',
        ascii: [
          '  [PAST]---[NOW]---[FUTURE]',
          '     \\       |       /',
          '      \\      |      /',
          '       \\     |     /',
          '        [  ???  ]',
        ].join('\n'),
        options: [
          { text: 'В настоящем', next: 'end_solved_basic' },
          { text: 'Между всеми тремя', next: 'end_solved_full' },
          { text: 'Вне времени', next: 'end_solved_transcend' },
        ]
      },
      puzzle5_prof: {
        text: 'КЛИК! Лим в шоке. "Четвёртая... открылась!?" Пятая грань. Голограмма: прошлое, настоящее, будущее. "Где стоит ищущий истину?" Лим смотрит на вас. "Это ваша загадка. Я не могу подсказать."',
        options: [
          { text: 'В настоящем', next: 'end_solved_basic' },
          { text: 'Между всеми тремя', next: 'end_solved_prof' },
          { text: 'Вне времени', next: 'end_solved_transcend' },
        ]
      },
      puzzle5_hint: {
        text: 'Четвёртая открыта! Пятая грань. Голограмма: прошлое-настоящее-будущее. "Где стоит ищущий?" Сканер не помогает - это за пределами физики.',
        options: [
          { text: 'В настоящем', next: 'end_solved_basic' },
          { text: 'Между всеми тремя', next: 'end_solved_scan' },
          { text: 'Вне времени', next: 'end_solved_transcend' },
        ]
      },
      puzzle5_crystal: {
        text: 'Четвёртая открылась мгновенно! Пятая грань. "Где стоит ищущий истину?" Кристаллическая память пульсирует - Предтечи верили, что истина существует вне времени. Точка, где все три сходятся.',
        options: [
          { text: 'Вне времени', next: 'end_solved_crystal' },
        ]
      },
      buy_direct: {
        text: 'Старик берёт деньги и отдаёт пирамиду. Дома вы пытаетесь открыть её...',
        options: [
          { text: 'Ковырять три дня', chances: [
            { weight: 60, next: 'end_buy_fail' },
            { weight: 25, next: 'end_buy_lucky' },
            { weight: 15, next: 'end_buy_crystal' },
          ]},
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Старик пожимает плечами. Может, вы упустили шанс века.',
        ending: true,
        result: {}
      },
      end_give_up: {
        text: '"Не всем дано," - старик убирает пирамиду.',
        ending: true,
        result: { reputation: -2 }
      },
      end_solved_basic: {
        text: 'Пирамида раскрывается частично. Внутри - кристалл с данными и горсть драгоценных камней. Старик кивает: "Неплохо. Но не всё." Две грани остались запечатаны.',
        ending: true,
        result: { credits: 1950, reputation: 15, flags: { ancient_knowledge: true }, factionRep: { scientists: 3 } }
      },
      end_solved_full: {
        text: 'Пирамида раскрывается полностью! Внутри - кристалл с координатами, древний чип памяти, камни и свиток с картой. Старик улыбается: "Достойный наследник." Карта показывает расположение других артефактов Предтеч.',
        ending: true,
        result: { credits: 3250, reputation: 30, flags: { ancient_knowledge: true, ancient_full_knowledge: true, puzzle_master: true }, factionRep: { scientists: 6 } }
      },
      end_solved_transcend: {
        text: 'Пирамида ВЗРЫВАЕТСЯ светом! Каждая грань раскрывается одновременно. Внутри - не просто артефакт. Это устройство связи Предтеч. На мгновение вы ВИДИТЕ - бесконечную сеть маяков, тянущуюся через галактику. И координаты центрального узла. Старик падает на колени. "За 30 лет... наконец..."',
        ending: true,
        result: { credits: 3900, reputation: 35, flags: { ancient_knowledge: true, ancient_full_knowledge: true, puzzle_master: true, ancient_weapon_data: true }, factionRep: { scientists: 8 } }
      },
      end_solved_prof: {
        text: 'Пирамида раскрывается! Лим плачет. "Тридцать лет я ждал этого момента..." Вместе вы изучаете содержимое: координаты, данные о Предтечах, карта маяков. Лим обещает: "Академия не забудет. Вы - часть истории."',
        ending: true,
        result: { credits: 3575, reputation: 32, flags: { ancient_knowledge: true, ancient_full_knowledge: true, puzzle_master: true }, factionRep: { scientists: 10 } }
      },
      end_solved_scan: {
        text: 'Пирамида раскрывается! Сканер записал всё - процесс открытия, внутреннюю структуру, данные кристалла. Полный научный отчёт. Академия будет в восторге.',
        ending: true,
        result: { credits: 3575, reputation: 30, flags: { ancient_knowledge: true, ancient_full_knowledge: true, puzzle_master: true }, factionRep: { scientists: 7 } }
      },
      end_solved_crystal: {
        text: 'Кристаллическое знание и пирамида вошли в резонанс. Вы не просто решили загадку - вы ГОВОРИЛИ на языке Предтеч. Пирамида раскрыла ВСЁ: полную карту сети маяков, координаты Точки Конвергенции, и данные об оружии Предтеч - системе защиты их главного хранилища. Старик в шоке. Такого он не ожидал.',
        ending: true,
        result: { credits: 4550, reputation: 40, flags: { ancient_knowledge: true, ancient_full_knowledge: true, puzzle_master: true, ancient_weapon_data: true, precursor_coordinates: true }, factionRep: { scientists: 12 } }
      },
      end_buy_fail: {
        text: 'Три дня впустую. Пирамида молчит. Продали перекупщику за 500 кредитов.',
        ending: true,
        result: { credits: 325, reputation: -5 }
      },
      end_buy_lucky: {
        text: 'На второй день уронили пирамиду - она раскрылась! Частично. Горсть камней и обломок кристалла. 3000 кредитов.',
        ending: true,
        result: { credits: 1950, reputation: 5, flags: { ancient_knowledge: true } }
      },
      end_buy_crystal: {
        text: 'Случайно активировали одну грань! Внутри - данные о Предтечах. Неполные, но ценные. Учёные заплатили 4000 кредитов.',
        ending: true,
        result: { credits: 2600, reputation: 10, flags: { ancient_knowledge: true }, factionRep: { scientists: 3 } }
      },
    }
  },

  // ===== 7. КОСМИЧЕСКИЙ КАЗИНО (trade) =====
  {
    id: 'space_casino',
    title: 'Казино "Фортуна"',
    planetType: 'trade',
    minDay: 4,
    oneTime: false,
    ascii: [
      '  ╔══════════════════════╗',
      '  ║  ♠ CASINO FORTUNA ♦  ║',
      '  ║  ═══════════════════ ║',
      '  ║  ♣ LUCK IS A LADY ♥  ║',
      '  ║  $$$  JACKPOT  $$$   ║',
      '  ╚══════════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/space_casino.png',
        text: 'Неоновая вывеска мигает в доках. "Казино Фортуна - испытай удачу!" Внутри дым, звон монет и запах дорогого алкоголя. Рулетка, карточные столы, загадочный автомат в углу. За бархатной верёвкой светится VIP-зал.',
        ascii: [
          '  ♠ ♦ ♣ ♥ ♠ ♦ ♣ ♥',
          '  |  ROULETTE  |  CARDS  |',
          '  |  MYSTERY   |  V.I.P  |',
          '  ♠ ♦ ♣ ♥ ♠ ♦ ♣ ♥',
        ].join('\n'),
        options: [
          { text: '> Рулетка (ставка 300 кр)', next: 'roulette', cost: { credits: 195 } },
          { text: '> Карточный стол (ставка 500 кр)', next: 'cards', cost: { credits: 325 } },
          { text: '> Загадочный автомат', next: 'mystery_machine' },
          { text: '> VIP-зал', next: 'vip_approach' },
          { text: '> Лаунж Торговой Гильдии', next: 'trader_lounge', check: { stat: 'reputation', faction: 'traders', min: 7, failNext: 'trader_denied' } },
          { text: '> Уйти', next: 'end_leave' },
        ]
      },
      roulette: {
        text: 'Крупье крутит колесо. Шарик прыгает по числам. Ваша ставка на столе.',
        ascii: [
          '     ___________',
          '    /  7  14  21 \\',
          '   | 3   [?]  18 |',
          '    \\ 11  5  23 /',
          '     ‾‾‾‾‾‾‾‾‾‾‾',
        ].join('\n'),
        options: [
          { text: '> Красное', next: 'roulette_red' },
          { text: '> Чёрное', next: 'roulette_black' },
          { text: '> Зеро (x10)', next: 'roulette_zero' },
        ]
      },
      roulette_red: {
        text: 'Шарик замедляется...',
        options: [
          { text: '> Смотреть!', chances: [
            { weight: 48, next: 'roulette_color_win' },
            { weight: 48, next: 'end_roulette_lose' },
            { weight: 4, next: 'end_roulette_zero_hit' },
          ]},
        ]
      },
      roulette_black: {
        text: 'Шарик замедляется...',
        options: [
          { text: '> Смотреть!', chances: [
            { weight: 48, next: 'roulette_color_win' },
            { weight: 48, next: 'end_roulette_lose' },
            { weight: 4, next: 'end_roulette_zero_hit' },
          ]},
        ]
      },
      roulette_color_win: {
        text: 'Ваш цвет! Вы угадали! Крупье сдвигает фишки в вашу сторону.',
        options: [
          { text: '> Забрать выигрыш', next: 'end_roulette_win' },
          { text: '> Удвоить!', next: 'roulette_double' },
        ]
      },
      roulette_zero: {
        text: 'Зеро. Шансы 1 к 37...',
        options: [
          { text: '> Смотреть!', chances: [
            { weight: 8, next: 'end_roulette_zero_jackpot' },
            { weight: 92, next: 'end_roulette_lose' },
          ]},
        ]
      },
      roulette_double: {
        text: 'Двойная ставка! Крупье крутит...',
        options: [
          { text: '> Давай!', chances: [
            { weight: 40, next: 'end_roulette_double_win' },
            { weight: 60, next: 'end_roulette_greedy' },
          ]},
        ]
      },
      cards: {
        img: 'quests/casino_cards.png',
        text: 'За столом - три игрока. Торговец, пилот и тип в тёмных очках. Раздача.',
        ascii: [
          '  [?][?]  YOUR HAND  [?][?]',
          '  ┌──┐┌──┐          ┌──┐┌──┐',
          '  │A♠││K♦│          │??││??│',
          '  └──┘└──┘          └──┘└──┘',
        ].join('\n'),
        options: [
          { text: '> Играть агрессивно', next: 'cards_aggro', check: { stat: 'attack', min: 12, failNext: 'cards_bluff_fail' } },
          { text: '> Запугать стол', next: 'cards_intimidate', check: { stat: 'kills', min: 10, failNext: 'cards_bluff_fail' } },
          { text: '> Блефовать', next: 'cards_bluff' },
          { text: '> Играть осторожно', next: 'cards_safe' },
        ]
      },
      cards_aggro: {
        text: 'Вы давите ставками. Торговец и пилот пасуют. Тип в очках думает... и тоже пасует. Банк ваш!',
        options: [
          { text: '> Забрать и уйти', next: 'end_cards_big_win' },
          { text: '> Ещё партию!', next: 'cards_final' },
        ]
      },
      cards_bluff: {
        text: 'Вы поднимаете ставку с парой двоек. Покерфейс. Торговец пасует. Пилот пасует. Тип в очках... смотрит на вас. И пасует.',
        options: [
          { text: '> Забрать банк', next: 'end_cards_bluff_win' },
        ]
      },
      cards_bluff_fail: {
        text: 'Ваша агрессия неубедительна. Тип в очках читает вас как книгу. "Колл." У него фулл-хаус.',
        options: [
          { text: '> Ладно, я проиграл', next: 'end_cards_lose' },
        ]
      },
      cards_safe: {
        text: 'Вы играете по учебнику. Маленький, но стабильный выигрыш. Скучно, но кошелёк толще.',
        options: [
          { text: '> Достаточно', next: 'end_cards_safe_win' },
        ]
      },
      cards_final: {
        text: 'Финальная рука. Тип в очках снимает их. Кибернетические глаза. Он считал карты всё это время. "All in."',
        options: [
          { text: '> All in!', chances: [
            { weight: 25, next: 'end_cards_showdown' },
            { weight: 45, next: 'end_cards_cyborg_wins' },
            { weight: 30, next: 'end_cards_draw' },
          ]},
          { text: '> Пас, ухожу с выигрышем', next: 'end_cards_big_win' },
        ]
      },
      mystery_machine: {
        text: 'Древний автомат. Табличка: "1 попытка - 100 кредитов. Главный приз: ????? " Никто не помнит, чтобы кто-то выигрывал.',
        ascii: [
          '  ┌─────────────┐',
          '  │ [?] [?] [?] │',
          '  │  PULL LEVER  │',
          '  │   100 cr     │',
          '  └──────────────┘',
        ].join('\n'),
        options: [
          { text: '> Дёрнуть рычаг (100 кр)', next: 'mystery_pull', cost: { credits: 65 } },
          { text: '> Не стоит', next: 'end_leave' },
        ]
      },
      mystery_pull: {
        text: 'Барабаны крутятся... Звезда. Звезда. Зве... нет, череп. Почти!',
        options: [
          { text: '> Ещё раз! (100 кр)', cost: { credits: 65 }, chances: [
            { weight: 5, next: 'end_jackpot' },
            { weight: 25, next: 'mystery_small_win' },
            { weight: 70, next: 'mystery_pull2' },
          ]},
          { text: '> Развод', next: 'end_mystery_lose' },
        ]
      },
      mystery_small_win: {
        text: 'Звезда. Звезда. Звезда! Не джекпот, но мелкий выигрыш! Автомат выплёвывает горсть фишек.',
        options: [
          { text: '> Забрать', next: 'end_mystery_small' },
          { text: '> Закинуть обратно! (100 кр)', cost: { credits: 65 }, chances: [
            { weight: 10, next: 'end_jackpot' },
            { weight: 90, next: 'end_mystery_greedy' },
          ]},
        ]
      },
      mystery_pull2: {
        text: 'Череп. Череп. Чер... нет, звезда! Опять почти. Этот автомат дразнит.',
        options: [
          { text: '> Последняя попытка! (100 кр)', cost: { credits: 65 }, chances: [
            { weight: 12, next: 'end_jackpot' },
            { weight: 20, next: 'mystery_small_win' },
            { weight: 68, next: 'end_mystery_addict' },
          ]},
          { text: '> Хватит кормить машину', next: 'end_mystery_lose2' },
        ]
      },
      // === VIP ZONE ===
      vip_approach: {
        img: 'quests/casino_vip.png',
        text: 'Бархатная верёвка, вышибала размером с грузовой контейнер. Он оценивает вас с головы до ног. "VIP-зал. Только для избранных."',
        options: [
          { text: '> Показать баланс счёта', next: 'vip_room', check: { stat: 'credits', min: 5000, failNext: 'vip_denied' } },
          { text: '> Меня знают на арене', next: 'champion_welcome', check: { flag: 'arena_champion', flagValue: true, failNext: 'vip_denied' } },
          { text: '> Не сегодня', next: 'start' },
        ]
      },
      vip_denied: {
        text: 'Вышибала качает головой. "Пять тысяч на счету или имя в нашем списке. Ни того, ни другого? Автоматы - направо."',
        options: [
          { text: '> Вернуться на этаж', next: 'start' },
        ]
      },
      champion_welcome: {
        text: 'Вышибала приглядывается... и расплывается в улыбке. "Чемпион арены?! Видел ваш бой - зверь! Проходите, для вас всегда открыто." Он снимает верёвку и вручает бонусный жетон.',
        options: [
          { text: '> Войти в VIP', next: 'vip_room' },
        ]
      },
      vip_room: {
        text: 'VIP-зал. Приглушённый свет, сигарный дым, тихий джаз. Здесь играют по-крупному. Покерный стол - минимум 2000. Платиновая рулетка - минимум 1000. В углу за отдельным столом тучный человек в золотых кольцах.',
        ascii: [
          '  ╔═══════════════════╗',
          '  ║  ★ V.I.P. HALL ★  ║',
          '  ║  POKER   2000 min ║',
          '  ║  ROULET  1000 min ║',
          '  ║  WHALE    ???     ║',
          '  ╚═══════════════════╝',
        ].join('\n'),
        options: [
          { text: '> VIP-покер (2000 кр)', next: 'vip_poker', cost: { credits: 1300 } },
          { text: '> Платиновая рулетка (1000 кр)', next: 'vip_roulette', cost: { credits: 650 } },
          { text: '> Подсесть к толстяку (3000 кр)', next: 'whale_game', cost: { credits: 1950 } },
          { text: '> Вернуться на этаж', next: 'start' },
        ]
      },
      vip_poker: {
        text: 'За столом три профессионала. Кибернетические импланты, непроницаемые лица. Ставка 2000. Карты на столе. У вас пара королей.',
        options: [
          { text: '> Сканировать теллы', next: 'vip_poker_showdown', check: { stat: 'scanner', value: true, failNext: 'vip_poker_blind' } },
          { text: '> Давить ставками', chances: [
            { weight: 40, next: 'end_vip_poker_win' },
            { weight: 35, next: 'end_vip_poker_lose' },
            { weight: 25, next: 'vip_poker_showdown' },
          ]},
          { text: '> Осторожная игра', next: 'end_vip_poker_safe' },
        ]
      },
      vip_poker_blind: {
        text: 'Без сканера читать этих игроков невозможно - у всех импланты. Приходится играть вслепую. Один поднимает ставку. Второй коллирует.',
        options: [
          { text: '> All-in', chances: [
            { weight: 30, next: 'end_vip_poker_win' },
            { weight: 70, next: 'end_vip_poker_lose' },
          ]},
          { text: '> Сбросить', next: 'end_vip_fold' },
        ]
      },
      vip_poker_showdown: {
        text: 'Сканер засекает пульс и микровыражения. Двое блефуют. Третий опасен. Вы выдавливаете блефующих и идёте ва-банк против третьего. Он поднимает бровь. "All-in? Ладно." Последняя карта...',
        options: [
          { text: '> Вскрыться!', chances: [
            { weight: 55, next: 'end_vip_poker_jackpot' },
            { weight: 45, next: 'end_vip_poker_lose' },
          ]},
        ]
      },
      vip_roulette: {
        text: 'Платиновое колесо. Ставка 1000. Крупье в белых перчатках. "Делайте ваши ставки."',
        options: [
          { text: '> Красное (x2)', chances: [
            { weight: 50, next: 'end_vip_roulette_win' },
            { weight: 50, next: 'end_vip_roulette_lose' },
          ]},
          { text: '> Число 7 (x10)', chances: [
            { weight: 12, next: 'end_vip_roulette_number' },
            { weight: 88, next: 'end_vip_roulette_lose' },
          ]},
        ]
      },
      whale_game: {
        text: 'Толстяк поднимает глаза. Золотые зубы, золотые кольца. "Свежая кровь! Я Бруно. Квантовый Блэкджек?" Карты раздаются. У вас 18, у него 17. Но в квантовом блэкджеке карты мерцают, значения плавают...',
        ascii: [
          '  YOU: [K♠][8♦] = 18?',
          '  BRU: [?][?]   = 17?',
          '  QUANTUM FLUX: ACTIVE',
        ].join('\n'),
        options: [
          { text: '> Стоять', chances: [
            { weight: 55, next: 'whale_win_round' },
            { weight: 45, next: 'end_whale_lose' },
          ]},
          { text: '> Ещё карту', chances: [
            { weight: 35, next: 'whale_win_round' },
            { weight: 65, next: 'end_whale_bust' },
          ]},
        ]
      },
      whale_win_round: {
        text: 'Бруно хмурится. "Неплохо! Первый раунд за тобой." Он достаёт пачку купюр. "Удвоим? 6000 на кону."',
        options: [
          { text: '> Удвоить!', chances: [
            { weight: 40, next: 'end_whale_jackpot' },
            { weight: 60, next: 'end_whale_double_lose' },
          ]},
          { text: '> Забрать выигрыш', next: 'end_whale_win' },
        ]
      },
      cards_intimidate: {
        text: 'Вы медленно кладёте руки на стол. Шрамы, взгляд убийцы. Торговец бледнеет. Пилот отодвигается. Киборг снимает очки, смотрит... и кивает. "Респект." Все пасуют без единой карты.',
        options: [
          { text: '> Забрать банк', next: 'end_intimidate_win' },
          { text: '> Предложить реальную игру', next: 'cards_final' },
        ]
      },
      trader_lounge: {
        text: 'Отдельный зал за гербом Торговой Гильдии. Мягкие кресла, виски. Старый торговец с трубкой машет вам. "Коллега! Присядь. Знаешь автомат в зале? Владелец - мой знакомый. Хочешь секрет?"',
        options: [
          { text: '> Рассказывай', next: 'trader_tip' },
          { text: '> Пойду играть', next: 'start' },
        ]
      },
      trader_denied: {
        text: 'Охранник у лаунжа проверяет базу. "Только для членов Гильдии с высоким рейтингом. Заработайте репутацию."',
        options: [
          { text: '> Ладно', next: 'start' },
        ]
      },
      trader_tip: {
        text: 'Торговец наклоняется. "Автомат не случайный. Три быстрых рывка, пауза 5 секунд, четвёртый. Сбой в генераторе - шанс джекпота утраивается." Подмигивает. "Только тихо."',
        options: [
          { text: '> К автомату с секретом!', next: 'mystery_insider' },
          { text: '> Спасибо, пойду за покер', next: 'start' },
        ]
      },
      mystery_insider: {
        text: 'Три быстрых рывка. Пауза. Четвёртый. Барабаны крутятся медленнее обычного. Огоньки мигают в другом ритме. Что-то изменилось.',
        options: [
          { text: '> Дёрнуть! (100 кр)', cost: { credits: 65 }, chances: [
            { weight: 35, next: 'end_insider_jackpot' },
            { weight: 40, next: 'end_insider_medium' },
            { weight: 25, next: 'end_insider_fail' },
          ]},
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Вы уходите. Иногда лучшая ставка - не играть.',
        ending: true,
        result: {}
      },
      end_roulette_win: {
        text: 'Выигрыш x2! 600 кредитов. Неплохой вечер.',
        ending: true,
        result: { credits: 390, reputation: 2 }
      },
      end_roulette_lose: {
        text: 'Мимо. Шарик падает на другой цвет. 300 кредитов растворяются в кармане казино.',
        ending: true,
        result: { reputation: -1 }
      },
      end_roulette_zero_hit: {
        text: 'ЗЕРО! Шарик падает на зелёное. Ни красное, ни чёрное - все проиграли. Крупье ухмыляется. Казино всегда в выигрыше.',
        ending: true,
        result: { reputation: -2 }
      },
      end_roulette_zero_jackpot: {
        text: 'ЗЕРО!!! Один шанс из 37 - и вы его поймали! Крупье роняет челюсть. x10 ставки - 3000 кредитов! Весь зал аплодирует!',
        ending: true,
        result: { credits: 1950, reputation: 8, flags: { casino_vip: true }, factionRep: { traders: 2 } }
      },
      end_roulette_double_win: {
        text: 'Удвоение сработало! Фортуна на вашей стороне! 1200 кредитов. Крупье нервно протирает стол.',
        ending: true,
        result: { credits: 780, reputation: 4 }
      },
      end_roulette_greedy: {
        text: 'Жадность наказана. Второй раз колесо не простило. Минус 300.',
        ending: true,
        result: { reputation: -2, flags: { casino_addict: true } }
      },
      end_cards_big_win: {
        text: 'Крупный выигрыш за столом! 1500 кредитов.',
        ending: true,
        result: { credits: 975, reputation: 5 }
      },
      end_cards_bluff_win: {
        text: 'Блеф сработал! 1000 кредитов. Покерфейс - ваш талант.',
        ending: true,
        result: { credits: 650, reputation: 3 }
      },
      end_cards_lose: {
        text: 'Проигрыш. 500 кредитов на ветер.',
        ending: true,
        result: { reputation: -3 }
      },
      end_cards_safe_win: {
        text: 'Осторожная игра принесла 700 кредитов.',
        ending: true,
        result: { credits: 455, reputation: 1 }
      },
      end_cards_showdown: {
        text: 'Вскрытие! У киборга - каре. У вас... стрит-флеш!!! Один шанс на миллион! 3000 кредитов!',
        ending: true,
        result: { credits: 1950, reputation: 10, flags: { casino_vip: true }, factionRep: { traders: 3 } }
      },
      end_cards_cyborg_wins: {
        text: 'Вскрытие. У вас пара дам. У киборга - фулл-хаус. Кибернетические глаза не врут. Вы потеряли ваш предыдущий выигрыш и ещё 500 сверху.',
        ending: true,
        result: { reputation: -5 }
      },
      end_cards_draw: {
        text: 'Невероятно! У обоих фулл-хаус! Ничья. Банк делят пополам. Киборг протягивает руку: "Уважаю." 1000 кредитов - не победа, но и не поражение.',
        ending: true,
        result: { credits: 650, reputation: 4 }
      },
      end_mystery_lose: {
        text: 'Автомат забрал 100 кредитов. Классика жанра.',
        ending: true,
        result: { reputation: -1 }
      },
      end_mystery_lose2: {
        text: '200 кредитов в пасть машине. Вы уходите умнее, но беднее.',
        ending: true,
        result: { reputation: -1 }
      },
      end_mystery_small: {
        text: 'Мелкий выигрыш - 350 кредитов. Не джекпот, но хоть что-то.',
        ending: true,
        result: { credits: 228, reputation: 1 }
      },
      end_mystery_greedy: {
        text: 'Закинули выигрыш обратно и... череп, череп, череп. Автомат довольно гудит. Жадность - мать всех потерь.',
        ending: true,
        result: { reputation: -2 }
      },
      end_mystery_addict: {
        text: '300 кредитов скормлено автомату. Он подмигивает вам светодиодом, как бы говоря "ещё?"',
        ending: true,
        result: { reputation: -2, flags: { casino_addict: true } }
      },
      end_jackpot: {
        text: 'ДЖЕКПОТ! Корона! Корона! КОРОНА!!! 5000 кредитов сыплются из автомата! Владелец казино бледнеет. "Фортуна" запомнит ваше лицо.',
        ending: true,
        result: { credits: 3250, reputation: 8, flags: { casino_vip: true }, factionRep: { traders: 2 } }
      },
      end_vip_poker_win: {
        text: 'Банк ваш! Профессионалы кивают с уважением. 5000 кредитов. В VIP-зале вас теперь знают.',
        ending: true,
        result: { credits: 3250, reputation: 10, flags: { casino_vip: true }, factionRep: { traders: 3 } }
      },
      end_vip_poker_lose: {
        text: 'Профессионалы не прощают ошибок. Ваши 2000 растворились на столе. "Приходите ещё," - улыбается дилер.',
        ending: true,
        result: { reputation: -3, factionRep: { traders: -1 } }
      },
      end_vip_poker_safe: {
        text: 'Осторожная игра в VIP - всё равно приличный куш. 3500 кредитов. Не рекорд, но стабильно.',
        ending: true,
        result: { credits: 2275, reputation: 5, factionRep: { traders: 1 } }
      },
      end_vip_fold: {
        text: 'Вы сбрасываете карты. Минус 2000, но хотя бы не минус всё. В VIP надо приходить подготовленным.',
        ending: true,
        result: { reputation: -1 }
      },
      end_vip_poker_jackpot: {
        text: 'Стрит-флеш!!! Весь VIP-зал замирает. Вы обыграли трёх профессионалов с кибер-имплантами. 8000 кредитов и титул легенды казино. Менеджер лично жмёт руку.',
        ending: true,
        result: { credits: 5200, reputation: 20, flags: { casino_vip: true, casino_legend: true }, factionRep: { traders: 5 } }
      },
      end_vip_roulette_win: {
        text: 'Красное! Платиновый шарик послушен. 2000 кредитов. VIP-рулетка платит щедро.',
        ending: true,
        result: { credits: 1300, reputation: 4, factionRep: { traders: 1 } }
      },
      end_vip_roulette_lose: {
        text: 'Мимо. В VIP-зале проигрывать больнее. Минус 1000.',
        ending: true,
        result: { reputation: -2 }
      },
      end_vip_roulette_number: {
        text: 'СЕМЁРКА!!! Платиновое колесо выдаёт x10! 10000 кредитов! Крупье бледнеет, менеджер прибегает, фотограф щёлкает. Вы - легенда "Фортуны".',
        ending: true,
        result: { credits: 6500, reputation: 25, flags: { casino_vip: true, casino_legend: true }, factionRep: { traders: 6 } }
      },
      end_whale_win: {
        text: 'Бруно крякает. "Везунчик!" Он отсчитывает 5000 кредитов. "Приходи ещё - отыграюсь." Первый раз кто-то обыграл Толстяка Бруно.',
        ending: true,
        result: { credits: 3250, reputation: 12, flags: { casino_vip: true }, factionRep: { traders: 3 } }
      },
      end_whale_lose: {
        text: 'Квантовый флакс сыграл против вас. Карты мерцнули - ваши 18 стали 16. Бруно хохочет. "Квантовая физика, малыш!" Минус 3000.',
        ending: true,
        result: { reputation: -5, factionRep: { traders: -1 } }
      },
      end_whale_bust: {
        text: 'Перебор. Квантовая карта оказалась дамой. 25 очков. Бруно даже не смотрит свои карты. "Бывает." 3000 кредитов - его.',
        ending: true,
        result: { reputation: -4 }
      },
      end_whale_jackpot: {
        text: 'Удвоение! И вы снова выигрываете! Бруно багровеет, потом хохочет и хлопает по столу. "Давно так не веселился! 8000 - заслужил!" Весь VIP-зал аплодирует. Вы обыграли Толстяка Бруно дважды.',
        ending: true,
        result: { credits: 5200, reputation: 20, flags: { casino_vip: true, casino_legend: true }, factionRep: { traders: 5 } }
      },
      end_whale_double_lose: {
        text: 'Квантовый флакс в пользу Бруно. Ваши карты обнуляются. "Жадность, друг мой!" Он сгребает 6000 кредитов. Больно.',
        ending: true,
        result: { reputation: -6, flags: { casino_addict: true } }
      },
      end_intimidate_win: {
        text: 'Банк без единой розданной карты. 1500 кредитов. Киборг провожает вас уважительным взглядом. Репутация бойца работает и за покерным столом.',
        ending: true,
        result: { credits: 975, reputation: 6, factionRep: { pirates: 2 } }
      },
      end_insider_jackpot: {
        text: 'Корона! Корона! КОРОНА!!! Трюк торговца сработал! 5000 кредитов! Автомат гудит как раненый зверь. Вы киваете в сторону лаунжа - старик поднимает бокал.',
        ending: true,
        result: { credits: 3250, reputation: 8, flags: { casino_vip: true }, factionRep: { traders: 3 } }
      },
      end_insider_medium: {
        text: 'Звезда, Звезда, Луна. Не джекпот, но трюк частично сработал. 2000 кредитов - больше, чем обычный выигрыш.',
        ending: true,
        result: { credits: 1300, reputation: 4, factionRep: { traders: 1 } }
      },
      end_insider_fail: {
        text: 'Череп, Череп, Звезда. Трюк не сработал. Может торговец соврал, а может вы неправильно дёрнули. 100 кредитов в пасть машине.',
        ending: true,
        result: { reputation: -1 }
      },
    }
  },

  // ===== 8. ТЮРЕМНЫЙ ТРАНСПОРТ (industrial) =====
  {
    id: 'prison_transport',
    title: 'Тюремный транспорт',
    planetType: 'industrial',
    minDay: 9,
    oneTime: true,
    ascii: [
      '  ┌════════════════════════┐',
      '  │  PRISON TRANSPORT      │',
      '  │  "ЖЕЛЕЗНАЯ ЛЕДИ"       │',
      '  │  ████████████████████  │',
      '  │  █ CELL █ CELL █ BR █  │',
      '  │  ████████████████████  │',
      '  └════════════════════════┘',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/prison_transport.png',
        text: 'Тюремный транспорт "Железная Леди" - аварийный сигнал. Двигатели отказали, охрана ранена. 20 заключённых, часть опасна. Капитан хрипит по радио: "Помогите... они скоро вырвутся."',
        options: [
          { text: '> Пристыковаться', next: 'board' },
          { text: '> Назваться военным', next: 'military_authority', check: { stat: 'reputation', faction: 'military', min: 7, failNext: 'military_no_auth' } },
          { text: '> Вызвать военных', next: 'end_call_military' },
          { text: '> Пролететь мимо', next: 'end_ignore' },
        ]
      },
      military_authority: {
        text: 'Ваш позывной в базе Военного Флота. Капитан хрипит с облегчением: "Слава богу... Код авторизации принят. Передаю вам коды доступа к системе блокировки и личные дела заключённых. Действуйте."',
        options: [
          { text: '> На борт с кодами', next: 'board_authorized' },
        ]
      },
      military_no_auth: {
        text: '"Ваш позывной не значится в базе Флота. Не играйте в героя - стыкуйтесь и помогите руками."',
        options: [
          { text: '> Ладно, стыкуюсь', next: 'board' },
        ]
      },
      board_authorized: {
        text: 'На борту хаос, но вы с козырями. Коды доступа работают - блокировку можно перезагрузить с мостика. Личные дела показывают: из 20 заключённых 14 - мелкие контрабандисты, 3 - мошенники, 2 - насильники, и камера 7 - Дрейк, осуждённый за убийство.',
        ascii: [
          '  STATUS: LOCKDOWN FAILING',
          '  ██░░░░░░░░  10:00',
          '  ACCESS: AUTHORIZED',
          '  CELLS: 20 (14 minor, 6 dangerous)',
        ].join('\n'),
        options: [
          { text: '> Перезагрузить блокировку с мостика', next: 'fix_locks_auth' },
          { text: '> Выпустить мелких, оставить опасных', next: 'selective_release' },
          { text: '> Проверить камеру 7 - Дрейк', next: 'cell7_authorized' },
        ]
      },
      board: {
        img: 'quests/prison_boarding.png',
        text: 'На борту хаос. Капитан ранен, двое охранников без сознания. Камеры пока закрыты, но система блокировки мигает красным - 10 минут до отключения.',
        ascii: [
          '  STATUS: LOCKDOWN FAILING',
          '  ██░░░░░░░░  10:00',
          '  CELLS: LOCKED (for now)',
          '  GUARDS: 0/3 ACTIVE',
        ].join('\n'),
        options: [
          { text: '> Починить блокировку', next: 'fix_locks', check: { stat: 'scanner', value: true, failNext: 'fix_fail' } },
          { text: '> Разбудить охрану', next: 'wake_guards' },
          { text: '> Наёмник, патрулируй коридор', next: 'mercenary_patrol', check: { stat: 'mercenary', failNext: 'no_mercenary' } },
          { text: '> Поговорить с заключёнными', next: 'talk_prisoners' },
        ]
      },
      fix_locks_auth: {
        text: 'С кодами капитана перезагрузка занимает минуту. Блокировка сброшена и перезапущена - камеры заперты намертво. Красный индикатор сменился зелёным.',
        options: [
          { text: '> Отбуксировать транспорт', next: 'end_tow_authorized' },
          { text: '> Проверить камеру 7 - Дрейк', next: 'cell7_authorized' },
          { text: '> Выпустить мелких преступников', next: 'selective_release' },
        ]
      },
      selective_release: {
        text: 'Вы открываете камеры 14 мелких контрабандистов. Они жмутся к стенам, перепуганные. "Спасибо, командир... Мы не опасны, клянусь." Опасные остаются заперты. Дрейк из камеры 7 наблюдает молча.',
        options: [
          { text: '> Отбуксировать транспорт', next: 'end_tow_selective' },
          { text: '> Поговорить с Дрейком', next: 'cell7_authorized' },
        ]
      },
      cell7_authorized: {
        text: 'Личное дело Дрейка: осуждён за убийство торговца. Но сканер показывает следы пыток - старые шрамы, сломанные рёбра, зажившие неправильно. Дрейк смотрит спокойно. "Ты прочитал дело. А теперь послушай правду."',
        options: [
          { text: '> Говори', next: 'drake_backstory' },
          { text: '> Проверить на детекторе лжи (сканер)', next: 'drake_scan', check: { stat: 'scanner', value: true, failNext: 'drake_backstory' } },
          { text: '> Мне неинтересна твоя история', next: 'end_tow_authorized' },
        ]
      },
      drake_backstory: {
        text: 'Дрейк: "Тот торговец - Виктор Краус. Он продавал биооружие. Мой брат был на Кеплере, когда Краус поставил туда партию мутагена. 3000 человек погибли. Мой брат среди них. Я нашёл Крауса и... да, я его убил. Не жалею."',
        options: [
          { text: '> Выпустить Дрейка', next: 'drake_deal_backstory' },
          { text: '> Проверить его историю (сканер)', next: 'drake_scan_story', check: { stat: 'scanner', value: true, failNext: 'drake_deal_backstory' } },
          { text: '> Сочувствую, но закон есть закон', next: 'end_tow_safe' },
        ]
      },
      drake_scan: {
        text: 'Сканер считывает биометрию через решётку. Пульс ровный, микроэкспрессии стабильны. Этот человек или говорит правду, или профессиональный лжец. Дрейк усмехается: "Проверяешь? Правильно делаешь."',
        options: [
          { text: '> Расскажи свою историю', next: 'drake_backstory_verified' },
        ]
      },
      drake_backstory_verified: {
        text: 'Дрейк рассказывает про Крауса и биооружие. Сканер подтверждает: пульс не скачет, зрачки не расширяются. Ни единого маркера лжи. История про брата на Кеплере - правда. "Я убийца по закону. Но не по совести."',
        options: [
          { text: '> Выпустить Дрейка', next: 'end_drake_free_verified' },
          { text: '> Координаты за свободу?', next: 'drake_deal_verified' },
          { text: '> Всё равно оставляю в камере', next: 'end_tow_safe' },
        ]
      },
      drake_scan_story: {
        text: 'Сканер на максимуме. Дрейк рассказывает - каждое слово проходит через биометрический анализ. Результат: 97% вероятность правды. Кеплер, брат, биооружие - всё сходится.',
        options: [
          { text: '> Я тебе верю. Свободен.', next: 'end_drake_free_verified' },
          { text: '> Координаты - и ты на свободе', next: 'drake_deal_verified' },
          { text: '> Закон есть закон', next: 'end_tow_safe' },
        ]
      },
      drake_deal_verified: {
        text: '"Добыча с ограбления века. Астероидное поле у Ориона. Контейнер с маяком на частоте 47.3. 6000 кредитов минимум." Сканер подтверждает - он верит в эти координаты.',
        options: [
          { text: '> Выпустить Дрейка', next: 'end_drake_free_trust' },
          { text: '> Взять координаты и оставить', next: 'end_drake_betrayed' },
        ]
      },
      drake_deal_backstory: {
        text: 'Дрейк: "Если выпустишь - дам координаты. Добыча с ограбления века, астероидное поле у Ориона. 6000 кредитов."',
        options: [
          { text: '> Свободен. Давай координаты.', next: 'end_drake_free' },
          { text: '> Координаты - потом решу', next: 'end_drake_betrayed' },
        ]
      },
      mercenary_patrol: {
        text: 'Наёмник занимает позицию в коридоре перед камерами. "Пусть только дёрнутся." С ним на подстраховке - система блокировки может подождать. Заключённые за решёткой притихли.',
        options: [
          { text: '> Починить блокировку', next: 'fix_locks', check: { stat: 'scanner', value: true, failNext: 'fix_fail_merc' } },
          { text: '> Разбудить охрану', next: 'wake_guards' },
          { text: '> Поговорить с заключёнными', next: 'talk_prisoners' },
        ]
      },
      no_mercenary: {
        text: 'Наёмника нет - придётся справляться самому.',
        options: [
          { text: '> Починить блокировку', next: 'fix_locks', check: { stat: 'scanner', value: true, failNext: 'fix_fail' } },
          { text: '> Разбудить охрану', next: 'wake_guards' },
          { text: '> Поговорить с заключёнными', next: 'talk_prisoners' },
        ]
      },
      fix_locks: {
        text: 'Сканер помог найти сбой в цепи. Перемычка, пара команд - блокировка восстановлена. Камеры не откроются.',
        options: [
          { text: '> Отбуксировать транспорт', next: 'end_tow_safe' },
          { text: '> Поговорить с заключёнными', next: 'talk_prisoners' },
        ]
      },
      fix_fail: {
        text: 'Без сканера вы ковыряетесь вслепую. Искра! Система отключается. Камеры ОТКРЫВАЮТСЯ.',
        options: [
          { text: '> К оружию!', next: 'riot' },
        ]
      },
      fix_fail_merc: {
        text: 'Без сканера вы вызвали короткое замыкание. Камеры открываются! Но наёмник уже в позиции - он встречает первых выбежавших прикладом.',
        options: [
          { text: '> Помочь наёмнику', next: 'riot_merc' },
        ]
      },
      wake_guards: {
        text: 'Один охранник пришёл в себя. "Осторожно... в камере 7 - Дрейк. Убийца. Он организовал саботаж."',
        options: [
          { text: '> Проверить камеру 7', next: 'cell7' },
          { text: '> Починить блокировку', next: 'fix_locks', check: { stat: 'scanner', value: true, failNext: 'fix_fail' } },
          { text: '> Что за саботаж?', next: 'guard_intel' },
        ]
      },
      guard_intel: {
        text: 'Охранник: "Дрейк подговорил техника в камере 3. Тот переставил перемычку в блоке питания - через час вся блокировка рухнет. Мы пытались починить, но Дрейк устроил драку в камере, отвлёк нас... и вот результат."',
        options: [
          { text: '> Починить блокировку', next: 'fix_locks', check: { stat: 'scanner', value: true, failNext: 'fix_fail' } },
          { text: '> Поговорить с Дрейком', next: 'cell7' },
        ]
      },
      talk_prisoners: {
        text: 'Через решётку: "Эй, пилот! Выпусти нас! Мы невиновны!" Другой голос, тише: "Я Дрейк. У меня информация. Дорогая информация. Выпусти - и она твоя."',
        options: [
          { text: '> Выслушать Дрейка', next: 'drake_deal' },
          { text: '> Никого не выпускать', next: 'end_tow_safe' },
          { text: '> Выпустить всех', next: 'riot' },
        ]
      },
      cell7: {
        text: 'Дрейк - спокойный мужчина со шрамом через всё лицо. "Я знаю, где спрятана добыча с ограбления века. 50000 кредитов. Мне не добраться - а тебе по пути."',
        options: [
          { text: '> Сделка. Координаты за свободу.', next: 'end_drake_deal' },
          { text: '> Расскажи, за что сидишь', next: 'drake_backstory' },
          { text: '> Нет. Ты останешься в камере.', next: 'end_tow_safe' },
        ]
      },
      drake_deal: {
        text: '"Умный выбор." Дрейк диктует координаты. "Астероидное поле у Ориона. Контейнер с маяком на частоте 47.3."',
        options: [
          { text: '> Выпустить Дрейка', next: 'end_drake_free' },
          { text: '> Взять координаты и не выпускать', next: 'end_drake_betrayed' },
        ]
      },
      riot: {
        text: 'Заключённые вырвались! 20 человек в коридоре. Часть бежит к шлюзам, часть - к вам. Дрейк командует: "Корабль - наш!"',
        options: [
          { text: '> Драться!', check: { stat: 'attack', min: 14, failNext: 'end_beaten' }, chances: [
            { weight: 70, next: 'end_fight_riot' },
            { weight: 30, next: 'end_fight_riot_hard' },
          ]},
          { text: '> Бежать к своему кораблю!', check: { stat: 'speed', min: 5, failNext: 'end_beaten' }, chances: [
            { weight: 80, next: 'end_escape_riot' },
            { weight: 20, next: 'end_escape_damaged' },
          ]},
        ]
      },
      riot_merc: {
        text: 'Наёмник работает как машина - бьёт первого, швыряет второго в стену. Но их 20, а вас двое. Дрейк стоит в стороне, наблюдает.',
        options: [
          { text: '> Вместе прижать их к камерам!', chances: [
            { weight: 75, next: 'end_riot_merc_win' },
            { weight: 25, next: 'end_fight_riot_hard' },
          ]},
          { text: '> Отступить к шлюзу', next: 'end_escape_riot' },
        ]
      },
      // === ENDINGS ===
      end_call_military: {
        text: 'Военные прибыли через час. Транспорт спасён. Маленькая награда за вызов.',
        ending: true,
        result: { credits: 260, reputation: 8, factionRep: { military: 2 } }
      },
      end_ignore: {
        text: 'Вы улетели. На следующий день в новостях: "Тюремный бунт. 3 охранника погибли."',
        ending: true,
        result: { reputation: -8, factionRep: { military: -3 } }
      },
      end_tow_safe: {
        text: 'Вы отбуксировали транспорт к ближайшей станции. Капитан благодарен. Военные выписали награду.',
        ending: true,
        result: { credits: 1300, reputation: 20, factionRep: { military: 4 } }
      },
      end_tow_authorized: {
        text: 'Блокировка перезагружена, транспорт отбуксирован. Капитан подаёт рапорт: "Офицер действовал с полной авторизацией. Рекомендую к награде." Военное начальство впечатлено.',
        ending: true,
        result: { credits: 1950, reputation: 25, factionRep: { military: 8 } }
      },
      end_tow_selective: {
        text: 'Мелких контрабандистов передали гражданским властям - большинство получат условные сроки. Опасные остались под замком. Военные хвалят: "Грамотное решение. Не каждый отличит мелкую рыбёшку от акул."',
        ending: true,
        result: { credits: 1625, reputation: 28, flags: { freed_innocents: true }, factionRep: { military: 6 } }
      },
      end_drake_free: {
        text: 'Дрейк исчез в первом же порту. Координаты настоящие - в контейнере нашлось 6000 кредитов. Но выпустить убийцу... Он обернулся перед уходом: "Я не забуду. Найди меня, если понадобится помощь."',
        ending: true,
        result: { credits: 3900, reputation: -15, flags: { drake_freed: true, drake_met: true }, factionRep: { military: -5, pirates: 3 } }
      },
      end_drake_free_verified: {
        text: 'Сканер подтвердил его историю - Дрейк убил торговца биооружием. Вы открываете камеру. "Спасибо, пилот. Ты первый, кто потрудился проверить." Он жмёт руку и оставляет координаты. "Астероидное поле у Ориона. Контейнер с маяком. 6000 кредитов. Это немного, но это честно."',
        ending: true,
        result: { credits: 3900, reputation: -10, flags: { drake_freed: true, drake_met: true, drake_trust: true }, factionRep: { military: -3, pirates: 5 } }
      },
      end_drake_free_trust: {
        text: 'Дрейк выходит из камеры. Не торопится - привык. "Координаты настоящие, я проверял на сканере." Он смотрит вам в глаза. "Ты не просто выпустил - ты проверил, выслушал, поверил. Это больше, чем сделка. Найди меня на пиратских станциях - для тебя дверь всегда открыта."',
        ending: true,
        result: { credits: 3900, reputation: -8, flags: { drake_freed: true, drake_met: true, drake_trust: true }, factionRep: { military: -3, pirates: 6 } }
      },
      end_drake_deal: {
        text: 'Дрейк диктует координаты. "Астероидное поле у Ориона. Частота 47.3." Вы открываете камеру. Он уходит не оглядываясь. Координаты настоящие - 6000 кредитов.',
        ending: true,
        result: { credits: 3900, reputation: -15, flags: { drake_freed: true, drake_met: true }, factionRep: { military: -5, pirates: 3 } }
      },
      end_drake_betrayed: {
        text: 'Дрейк орёт проклятия: "Ты пожалеешь об этом, пилот! Мои люди найдут тебя!" Координаты настоящие - 4000 кредитов в контейнере. Военные довольны.',
        ending: true,
        result: { credits: 2600, reputation: 12, flags: { drake_betrayed: true, drake_met: true }, factionRep: { military: 5, pirates: -3 } }
      },
      end_fight_riot: {
        text: 'Вы встали в дверном проёме. Первых двоих уложили сразу. Остальные передумали. Дрейка вы вырубили лично. Он зло прошептал: "Запомню твоё лицо." Герой!',
        ending: true,
        result: { credits: 1950, reputation: 25, damage: 10, flags: { drake_defeated: true, drake_met: true }, factionRep: { military: 6 } }
      },
      end_fight_riot_hard: {
        text: 'Их больше, чем казалось. Бой в тесном коридоре - жёсткий. Вы отбились, но один заключённый зацепил вас заточкой. Дрейк ушёл в суматохе. Награда от военных, но ощущение, что это ещё не конец.',
        ending: true,
        result: { credits: 1300, reputation: 18, damage: 25, flags: { drake_met: true }, factionRep: { military: 4 } }
      },
      end_riot_merc_win: {
        text: 'Наёмник - зверь. Вдвоём вы загнали заключённых обратно в камеры за 3 минуты. Дрейк не сопротивлялся - только усмехнулся: "Неплохая команда." Военные потом долго жмут руку наёмнику.',
        ending: true,
        result: { credits: 2275, reputation: 28, flags: { drake_defeated: true, drake_met: true }, factionRep: { military: 7 } }
      },
      end_beaten: {
        text: 'Их слишком много. Вас оттеснили к шлюзу. Вы еле добрались до корабля, потрёпанный, но живой.',
        ending: true,
        result: { credits: 0, reputation: -5, damage: 20 }
      },
      end_escape_riot: {
        text: 'Вы рванули к шлюзу быстрее заключённых. Отстыковались и вызвали военных. Транспорт окружили через 20 минут.',
        ending: true,
        result: { credits: 520, reputation: 10, factionRep: { military: 2 } }
      },
      end_escape_damaged: {
        text: 'Рванули к кораблю, но заключённые швырнули что-то в шлюз. Обшивка помята, двигатель искрит. Вы ушли, но ремонт влетит в копеечку.',
        ending: true,
        result: { credits: 260, reputation: 5, damage: 18 }
      },
    }
  },

  // ===== 9. ГОНКА КОНТРАБАНДИСТОВ (pirate) =====
  {
    id: 'smuggler_race',
    title: 'Гонка контрабандистов',
    planetType: 'pirate',
    minDay: 6,
    oneTime: false,
    ascii: [
      '  ══════════════════════════',
      '  ║  SMUGGLER\'S  GRAND  PRIX  ║',
      '  ║  >>>  RACE  >>>  RACE  >>>  ║',
      '  ══════════════════════════',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/smuggler_race.png',
        text: 'Ежемесячная гонка контрабандистов! Маршрут через астероидное поле, мимо патрулей, в обход минного поля. Приз - 3000 кредитов и уважение пиратского сектора. У стартовой линии толпятся пилоты.',
        ascii: [
          '  START >>--[asteroids]-->> ',
          '    >>--[patrol zone]-->>',
          '    >>--[minefield]-->> FINISH',
        ].join('\n'),
        options: [
          { text: '> Участвовать (взнос 500 кр)', next: 'race_start', cost: { credits: 325 } },
          { text: '> VIP-старт (вас узнали)', next: 'vip_start', check: { flag: 'casino_vip', flagValue: true, failNext: 'vip_denied_race' } },
          { text: '> Поговорить с организатором', next: 'insider_briefing', check: { stat: 'reputation', faction: 'pirates', min: 6, failNext: 'insider_denied' } },
          { text: '> Поставить на победителя (300 кр)', next: 'bet', cost: { credits: 195 } },
          { text: '> Просто посмотреть', next: 'end_watch' },
        ]
      },
      race_start: {
        img: 'quests/smuggler_asteroids.png',
        text: '5 кораблей на старте. Обратный отсчёт... СТАРТ! Первый этап - астероидное поле. Камни летят со всех сторон.',
        ascii: [
          '  o  O   o',
          '    O  o   O',
          '  >>YOU>>  o',
          '    O   o O',
          '  o   O  o',
        ].join('\n'),
        options: [
          { text: '> Напролом!', next: 'asteroids_fast', check: { stat: 'speed', min: 5, failNext: 'asteroids_crash' } },
          { text: '> Расстрелять астероиды', next: 'asteroids_weapon', check: { stat: 'weapon', min: 12, failNext: 'asteroids_crash' } },
          { text: '> Осторожно лавировать', next: 'asteroids_slow' },
          { text: '> Срезать через расщелину', next: 'asteroids_shortcut', check: { stat: 'scanner', value: true, failNext: 'asteroids_crash' } },
        ]
      },
      asteroids_fast: {
        text: 'Вы прорвались первым! Скорость решает. Впереди - зона патрулей.',
        options: [
          { text: '> Полный ход через патрули', next: 'patrol_fast' },
          { text: '> Обходной маршрут', next: 'patrol_sneak' },
        ]
      },
      asteroids_slow: {
        text: 'Вы прошли без царапин, но трое соперников впереди. Нужно нагонять.',
        options: [
          { text: '> Рискнуть через патрули напрямик', next: 'patrol_fast' },
          { text: '> Обходной маршрут', next: 'patrol_sneak' },
        ]
      },
      asteroids_shortcut: {
        text: 'Сканер нашёл безопасный коридор! Вы вышли первым с большим отрывом!',
        options: [
          { text: '> Держать лидерство!', next: 'patrol_fast' },
        ]
      },
      asteroids_crash: {
        text: 'БАМ! Астероид зацепил борт. Повреждения, но корабль держится. Вы отстали.',
        options: [
          { text: '> Продолжать гонку!', next: 'patrol_sneak' },
          { text: '> Сойти с дистанции', next: 'end_dnf' },
        ]
      },
      patrol_fast: {
        text: 'Патруль засёк гонщиков! Два военных фрегата разворачиваются. Впереди вас - соперник. Он тормозит.',
        options: [
          { text: '> Обогнать и прорваться', next: 'debris_field' },
          { text: '> Использовать соперника как приманку', next: 'debris_field' },
          { text: '> Тайный проход', next: 'patrol_insider', check: { stat: 'reputation', faction: 'pirates', min: 6, failNext: 'patrol_lost' } },
        ]
      },
      patrol_sneak: {
        text: 'Обходной маршрут длиннее, но патрули вас не заметили. Двое соперников попались. Вы вышли в тройку.',
        options: [
          { text: '> К финишу!', next: 'minefield_mid' },
        ]
      },
      minefield_lead: {
        text: 'Последний этап - минное поле! Вы лидируете. Мины мерцают красным. Один неверный ход...',
        ascii: [
          '  *  .  *  .  *',
          '  .  *  .  *  .',
          '  >>FINISH LINE>>',
        ].join('\n'),
        options: [
          { text: '> Максимальная скорость!', check: { stat: 'speed', min: 4, failNext: 'end_mine_hit' }, chances: [
            { weight: 75, next: 'end_first_place' },
            { weight: 25, next: 'end_photo_finish' },
          ]},
          { text: '> Аккуратно, но верно', chances: [
            { weight: 60, next: 'end_second_place' },
            { weight: 40, next: 'end_first_place' },
          ]},
        ]
      },
      minefield_mid: {
        text: 'Минное поле. Двое впереди, но один подрывается на мине! Шанс на второе место!',
        options: [
          { text: '> Газу!', chances: [
            { weight: 55, next: 'end_second_place' },
            { weight: 25, next: 'end_third_place' },
            { weight: 20, next: 'end_mine_hit' },
          ]},
          { text: '> Осторожно', chances: [
            { weight: 70, next: 'end_third_place' },
            { weight: 30, next: 'end_second_place' },
          ]},
        ]
      },
      // === NEW BRANCHES ===
      vip_start: {
        text: 'Организатор расплывается в улыбке. "VIP из Фортуны! Для вас - поул-позиция и совет: после патрулей будет поле обломков. Можно подобрать кое-что ценное."',
        options: [
          { text: '> На старт! (500 кр)', next: 'asteroids_fast', cost: { credits: 325 } },
        ]
      },
      vip_denied_race: {
        text: 'Никто вас не узнал. VIP-ложа закрыта для незнакомцев.',
        options: [
          { text: '> Обычный вход', next: 'start' },
        ]
      },
      insider_briefing: {
        text: 'Организатор - старый пират по кличке Одноухий. Он отводит вас в сторону. "Слышал о тебе, брат. Вот что: после патрулей есть обломки грузовоза - в контейнерах добро. И я знаю тайный проход через патрульную зону. Запоминай координаты."',
        options: [
          { text: '> На старт! (500 кр)', next: 'race_start', cost: { credits: 325 } },
        ]
      },
      insider_denied: {
        text: 'Организатор оглядывает вас. "Не знаю тебя, пилот. Плати взнос и лети."',
        options: [
          { text: '> Ладно', next: 'start' },
        ]
      },
      asteroids_weapon: {
        text: 'Лазеры режут камень как масло! Астероиды разлетаются. Другие гонщики в шоке - никто так раньше не делал. Вы вырвались вперёд с огромным отрывом.',
        options: [
          { text: '> Полный ход!', next: 'patrol_fast' },
        ]
      },
      patrol_insider: {
        text: 'Координаты Одноухого работают! Тайный проход между двумя астероидами, невидимый для радаров. Ни один фрегат вас не засёк. Огромный отрыв от соперников.',
        options: [
          { text: '> К полю обломков!', next: 'debris_field' },
        ]
      },
      patrol_lost: {
        text: 'Вы свернули в расщелину... и заблудились. Без точных координат тайный проход - лабиринт. Потеряли кучу времени.',
        options: [
          { text: '> Нагонять!', next: 'minefield_mid' },
        ]
      },
      debris_field: {
        text: 'За патрулями - обломки грузовоза. Контейнеры плавают в вакууме. Один мерцает маяком. Минное поле уже видно - финиш близко.',
        options: [
          { text: '> Подобрать контейнер', next: 'debris_salvage' },
          { text: '> Сбросить груз для скорости', next: 'minefield_light', check: { stat: 'cargo', min: 3, failNext: 'debris_no_cargo' } },
          { text: '> Мимо - к финишу!', next: 'minefield_lead' },
        ]
      },
      debris_no_cargo: {
        text: 'Нечего сбрасывать - трюм пуст. Зато и не тяжёлый.',
        options: [
          { text: '> К финишу!', next: 'minefield_lead' },
        ]
      },
      debris_salvage: {
        text: 'Вы притормозили и подцепили контейнер тросом. Соперник обходит вас. Внутри...',
        options: [
          { text: '> Открыть!', chances: [
            { weight: 40, next: 'end_debris_treasure' },
            { weight: 35, next: 'end_debris_junk' },
            { weight: 25, next: 'end_debris_trap' },
          ]},
        ]
      },
      minefield_light: {
        text: 'Без груза корабль летит как пуля! Минное поле впереди, но вы маневрируете легче всех.',
        options: [
          { text: '> На полной!', chances: [
            { weight: 80, next: 'end_first_place' },
            { weight: 20, next: 'end_photo_finish' },
          ]},
        ]
      },
      // === ENDINGS ===
      end_watch: {
        text: 'Зрелищная гонка. Победитель - одноглазый пилот на Фантоме. Вы запомнили маршрут.',
        ending: true,
        result: { reputation: 1 }
      },
      bet: {
        text: 'Вы поставили на аутсайдера...',
        options: [
          { text: '> Смотреть гонку!', chances: [
            { weight: 30, next: 'end_bet_win' },
            { weight: 40, next: 'end_bet_lose' },
            { weight: 20, next: 'end_bet_big_win' },
            { weight: 10, next: 'end_bet_scandal' },
          ]},
        ]
      },
      end_bet_win: {
        text: 'Ваш аутсайдер финишировал вторым! Выигрыш: 600 кредитов. Чутьё не подвело.',
        ending: true,
        result: { credits: 390, reputation: 2 }
      },
      end_bet_lose: {
        text: 'Ваш аутсайдер подорвался на мине на третьем круге. 300 кредитов на ветер.',
        ending: true,
        result: { reputation: -1 }
      },
      end_bet_big_win: {
        text: 'НЕВЕРОЯТНО! Ваш аутсайдер ВЫИГРАЛ! Коэффициент 5:1! 1500 кредитов! Букмекер скрипит зубами.',
        ending: true,
        result: { credits: 975, reputation: 5 }
      },
      end_bet_scandal: {
        text: 'Скандал на финише! Двух лидеров дисквалифицировали за сговор. Ваш аутсайдер объявлен победителем по техническим причинам. 900 кредитов с привкусом фарса.',
        ending: true,
        result: { credits: 585, reputation: 3 }
      },
      end_dnf: {
        text: 'Сход с дистанции. Взнос не вернут. Зато корабль цел.',
        ending: true,
        result: { reputation: -3, damage: 8 }
      },
      end_first_place: {
        text: 'ПЕРВОЕ МЕСТО!!! Вы пронеслись через минное поле как призрак! 3000 кредитов и титул "Король контрабандистов"! Одноухий жмёт руку: "Ты теперь свой."',
        ending: true,
        result: { credits: 1950, reputation: 20, flags: { race_champion: true, smuggler_contact: true }, factionRep: { pirates: 5 } }
      },
      end_photo_finish: {
        text: 'Фотофиниш! Вы и одноглазый пилот пересекли черту нос к носу. Судьи совещаются... Второе место! 0.003 секунды разницы. Обидно, но достойно.',
        ending: true,
        result: { credits: 1170, reputation: 15, factionRep: { pirates: 4 } }
      },
      end_mine_hit: {
        text: 'Мина! Взрыв бросает корабль в сторону. Вас обходят. Третье место и ремонт.',
        ending: true,
        result: { credits: 325, reputation: 5, damage: 15, factionRep: { pirates: 1 } }
      },
      end_second_place: {
        text: 'Второе место! 1500 кредитов и уважение. "Неплохо для новичка," - кивает победитель.',
        ending: true,
        result: { credits: 975, reputation: 12, factionRep: { pirates: 3 } }
      },
      end_third_place: {
        text: 'Третье место. 800 кредитов. Не первый, но на подиуме.',
        ending: true,
        result: { credits: 520, reputation: 7, factionRep: { pirates: 2 } }
      },
      end_debris_treasure: {
        text: 'Редкие кристаллы! 2500 кредитов в одном контейнере! Вы проиграли гонку, но нашли больше, чем призовые. Одноухий потом скажет: "Умный пилот."',
        ending: true,
        result: { credits: 1625, reputation: 8, factionRep: { pirates: 2 } }
      },
      end_debris_junk: {
        text: 'Мусор. Битая электроника и ржавые запчасти. Потеряли время зря. Финишировали последним.',
        ending: true,
        result: { credits: 130, reputation: -2 }
      },
      end_debris_trap: {
        text: 'Контейнер оказался приманкой! Внутри сигнальная мина. Взрыв повреждает обшивку. Еле доковыляли до финиша.',
        ending: true,
        result: { reputation: -3, damage: 15 }
      },
    }
  },

  // ===== 10. ТОРГОВЫЙ АУКЦИОН (trade) =====
  {
    id: 'trade_auction',
    title: 'Большой аукцион',
    planetType: 'trade',
    minDay: 15,
    oneTime: true,
    ascii: [
      '  ╔═══════════════════════╗',
      '  ║  GALACTIC  AUCTION    ║',
      '  ║  ═══════════════════  ║',
      '  ║  LOT #1: ????????    ║',
      '  ║  STARTING BID: ???   ║',
      '  ╚═══════════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/trade_auction.png',
        text: 'Галактический аукцион! Раз в год торговцы со всего сектора собираются, чтобы продать и купить редкости. Три лота сегодня. У вас место в зале.',
        ascii: [
          '  LOT 1: Sealed Crate',
          '  LOT 2: Star Map',
          '  LOT 3: Mystery Ship',
        ].join('\n'),
        options: [
          { text: '> Лот 1: Запечатанный ящик', next: 'lot1' },
          { text: '> Лот 2: Звёздная карта', next: 'lot2' },
          { text: '> Лот 3: Загадочный корабль', next: 'lot3' },
          { text: '> Осмотреть премиальные лоты', next: 'premium_preview', check: { stat: 'reputation', faction: 'traders', min: 8, failNext: 'premium_denied' } },
          { text: '> Уйти', next: 'end_leave' },
        ]
      },
      premium_preview: {
        text: 'Торговая Гильдия узнала вас! Распорядитель ведёт за кулисы. "Для членов Гильдии - предварительный осмотр. Вот каталог." Три обычных лота, но есть и четвёртый - премиальный. Кристалл Предтеч в защитном кейсе.',
        ascii: [
          '  PREMIUM LOT:',
          '  [PRECURSOR CRYSTAL]',
          '  Starting bid: 5000',
          '  STATUS: Guild Only',
        ].join('\n'),
        options: [
          { text: '> Изучить кристалл (сканер)', next: 'crystal_scan', check: { stat: 'scanner', value: true, failNext: 'crystal_no_scan' } },
          { text: '> К обычным лотам', next: 'lot1' },
          { text: '> Дождаться премиального лота', next: 'premium_lot' },
        ]
      },
      premium_denied: {
        text: 'Вход за кулисы только для членов Гильдии. Охранник качает головой.',
        options: [
          { text: '> К обычным лотам', next: 'lot1' },
        ]
      },
      crystal_scan: {
        text: 'Сканер анализирует кристалл. Частота резонанса... знакомая. Это НЕ обычный кристалл Предтеч - это навигационный ключ! Он содержит координаты маяков, которые другие покупатели не распознают. Реальная стоимость - в десятки раз выше стартовой цены.',
        options: [
          { text: '> К обычным лотам сначала', next: 'lot1' },
          { text: '> Ждать премиальный лот', next: 'premium_lot' },
        ]
      },
      crystal_no_scan: {
        text: 'Красивый кристалл. Без сканера непонятно, чего он стоит на самом деле.',
        options: [
          { text: '> К обычным лотам', next: 'lot1' },
          { text: '> Рискнуть на премиальном', next: 'premium_lot' },
        ]
      },
      lot1: {
        img: 'quests/auction_hall.png',
        text: 'Запечатанный ящик с клеймом Древних. Никто не знает, что внутри. Может быть сокровище, может - пустышка. Стартовая цена: 1000.',
        ascii: [
          '  ┌─────────────┐',
          '  │  [ANCIENT]   │',
          '  │  [SEALED]    │',
          '  │  [???????]   │',
          '  └─────────────┘',
        ].join('\n'),
        options: [
          { text: '> Ставлю 1000', next: 'lot1_bid1', cost: { credits: 650 } },
          { text: '> Просканировать (сканер)', next: 'lot1_scan', check: { stat: 'scanner', value: true, failNext: 'lot1_no_scan' } },
          { text: '> Слишком рискованно', next: 'lot1_skip' },
        ]
      },
      lot1_scan: {
        text: 'Сканер пробивает печать: внутри - металлические объекты, один из которых резонирует на частоте кристаллов Предтеч. Это точно не пустышка. Минимум навигационные инструменты, возможно - что-то ценнее.',
        options: [
          { text: '> Ставлю 1000 (уверенно)', next: 'lot1_bid1', cost: { credits: 650 } },
        ]
      },
      lot1_no_scan: {
        text: 'Без сканера ящик - кот в мешке.',
        options: [
          { text: '> Рискну! 1000', next: 'lot1_bid1', cost: { credits: 650 } },
          { text: '> Пропущу', next: 'lot1_skip' },
        ]
      },
      lot1_bid1: {
        text: 'Ваша ставка! Толстый торговец поднимает: "1500!" Зал гудит.',
        options: [
          { text: '> 2000!', next: 'lot1_bid2', cost: { credits: 650 } },
          { text: '> Пас', next: 'lot1_lost' },
        ]
      },
      lot1_bid2: {
        text: 'Торговец колеблется... "Пас." Ящик ваш! Вы вскрываете его прямо в зале...',
        options: [
          { text: '> Открыть!', chances: [
            { weight: 40, next: 'end_lot1_open' },
            { weight: 25, next: 'end_lot1_junk' },
            { weight: 20, next: 'end_lot1_artifact' },
            { weight: 15, next: 'end_lot1_danger' },
          ]},
        ]
      },
      lot1_skip: {
        text: 'Ящик уходит торговцу за 1200. Он вскрывает... и бледнеет от счастья. Артефакт Древних стоимостью 10000.',
        options: [
          { text: '> Чёрт...', next: 'lot2' },
        ]
      },
      lot1_lost: {
        text: 'Ящик ушёл торговцу. Вам вернут ставку.',
        options: [
          { text: '> Лот 2', next: 'lot2' },
          { text: '> Лот 3', next: 'lot3' },
        ]
      },
      lot2: {
        text: 'Голографическая звёздная карта. Продавец утверждает: на ней отмечены забытые торговые маршруты с бешеной наценкой. Стартовая: 800.',
        options: [
          { text: '> Ставлю 800', next: 'lot2_bid', cost: { credits: 520 } },
          { text: '> Оценить карту (сканер)', next: 'lot2_scan', check: { stat: 'scanner', value: true, failNext: 'lot2_no_scan' } },
          { text: '> Пропустить', next: 'lot3' },
        ]
      },
      lot2_scan: {
        text: 'Сканер подтверждает: голограмма подлинная, эпоха Предтеч. Три маршрута - все через нынешние торговые зоны. Один из маршрутов совпадает с текущей картой только частично, что означает наценку 200-300% для того, кто знает путь.',
        options: [
          { text: '> Ставлю 800 (стоит каждого кредита)', next: 'lot2_bid', cost: { credits: 520 } },
          { text: '> Пропущу', next: 'lot3' },
        ]
      },
      lot2_no_scan: {
        text: 'Без сканера нельзя проверить подлинность. Может быть подделка.',
        options: [
          { text: '> Рискну, 800', next: 'lot2_bid', cost: { credits: 520 } },
          { text: '> Пропущу', next: 'lot3' },
        ]
      },
      lot2_bid: {
        text: 'Никто не перебивает! Карта ваша. Вы изучаете маршруты...',
        options: [
          { text: '> Использовать карту', next: 'end_lot2_use' },
        ]
      },
      lot3: {
        text: 'Последний лот - корабль! Бывший военный перехватчик, конфискованный у пиратов. "Состояние... приемлемое." Стартовая: 3000.',
        ascii: [
          '  ____',
          '  |>===>  INTERCEPTOR',
          '  |____|  "needs work"',
        ].join('\n'),
        options: [
          { text: '> Ставлю 3000', next: 'lot3_bid', cost: { credits: 1950 } },
          { text: '> Вас здесь узнали!', next: 'colony_hero_discount', check: { flag: 'colony_hero', flagValue: true, failNext: 'lot3_no_discount' } },
          { text: '> Дорого', next: 'lot3_after' },
        ]
      },
      colony_hero_discount: {
        text: 'Аукционист узнаёт вас! "Герой колонии! Друзья, этот пилот спас целую планету от голода!" Зал аплодирует. Аукционист шепчет: "Для вас - стартовая 2000. Тихо."',
        options: [
          { text: '> Ставлю 2000', next: 'lot3_bid_discount', cost: { credits: 1300 } },
          { text: '> Спасибо, но пас', next: 'lot3_after' },
        ]
      },
      lot3_no_discount: {
        text: 'Никто вас не узнал. Обычная цена.',
        options: [
          { text: '> Ставлю 3000', next: 'lot3_bid', cost: { credits: 1950 } },
          { text: '> Дорого', next: 'lot3_after' },
        ]
      },
      lot3_bid_discount: {
        text: 'Пилот из угла: "2500!" Женщина в форме: "3000!" С учётом вашей скидки - вы можете перебить.',
        options: [
          { text: '> 3500!', next: 'end_lot3_win_discount', cost: { credits: 975 } },
          { text: '> Пас', next: 'lot3_after' },
        ]
      },
      lot3_bid: {
        text: 'Пилот из угла: "3500!" Женщина в форме: "4000!" Ваш ход.',
        options: [
          { text: '> 5000!', next: 'end_lot3_win', cost: { credits: 1300 } },
          { text: '> Пас', next: 'end_lot3_lost' },
        ]
      },
      lot3_after: {
        text: 'Корабль уходит другому покупателю. Аукцион основных лотов завершён.',
        options: [
          { text: '> Премиальный лот!', next: 'premium_lot', check: { stat: 'reputation', faction: 'traders', min: 8, failNext: 'end_leave_late' } },
          { text: '> Неожиданный лот!', next: 'emergency_lot' },
          { text: '> Уйти', next: 'end_leave_late' },
        ]
      },
      premium_lot: {
        text: 'Премиальный лот! Распорядитель выносит кристалл в защитном кейсе. "Только для членов Гильдии. Кристалл Предтеч, происхождение неизвестно. Стартовая: 5000."',
        options: [
          { text: '> 5000!', next: 'premium_bid1', cost: { credits: 3250 } },
          { text: '> Я знаю что это (Древнее знание)', next: 'premium_recognize', check: { flag: 'ancient_knowledge', flagValue: true, failNext: 'premium_bid1_blind' } },
          { text: '> Слишком дорого', next: 'end_leave_late' },
        ]
      },
      premium_recognize: {
        text: 'Вы узнали кристалл! Тот же тип, что в пирамиде Древних. Навигационный ключ - координаты маяков Предтеч. В руках невежды - красивая безделушка за 5000. В ваших руках - бесценная карта.',
        options: [
          { text: '> 5000! (знаю реальную цену)', next: 'premium_bid1', cost: { credits: 3250 } },
        ]
      },
      premium_bid1_blind: {
        text: 'Кристалл красивый, но вы не уверены в его ценности.',
        options: [
          { text: '> Ставлю 5000', next: 'premium_bid1', cost: { credits: 3250 } },
          { text: '> Пас', next: 'end_leave_late' },
        ]
      },
      premium_bid1: {
        text: 'Седой коллекционер: "6000." Торговец с Сириуса: "7000." Кристалл разгорячил зал.',
        options: [
          { text: '> 8000!', next: 'premium_bid2', cost: { credits: 1950 } },
          { text: '> Пас', next: 'end_premium_lost' },
        ]
      },
      premium_bid2: {
        text: 'Коллекционер скрипит зубами. "8500!" Тишина. Зал смотрит на вас.',
        options: [
          { text: '> 10000! (ва-банк)', next: 'premium_final', cost: { credits: 1300 } },
          { text: '> Пас', next: 'end_premium_lost' },
        ]
      },
      premium_final: {
        text: 'Коллекционер бледнеет. Пауза. "...Пас." КРИСТАЛЛ ВАШ! Зал аплодирует. Распорядитель передаёт кейс.',
        options: [
          { text: '> Изучить кристалл', next: 'crystal_study' },
        ]
      },
      crystal_study: {
        text: 'Кристалл пульсирует в ваших руках. Если у вас есть знания Древних - он откроется полностью.',
        options: [
          { text: '> Активировать', chances: [
            { weight: 50, next: 'end_crystal_partial' },
            { weight: 50, next: 'end_crystal_navigation' },
          ]},
          { text: '> Продать коллекционерам', next: 'end_crystal_sell' },
        ]
      },
      emergency_lot: {
        text: 'Неожиданно! Распорядитель выбегает: "Экстренный лот! Конфискованный груз из пиратского сектора. Военные не знают, что внутри. Стартовая: 1500. Один шанс!"',
        options: [
          { text: '> 1500!', next: 'emergency_bid', cost: { credits: 975 } },
          { text: '> Просканировать', next: 'emergency_scan', check: { stat: 'scanner', value: true, failNext: 'emergency_no_scan' } },
          { text: '> Нет, хватит', next: 'end_leave_late' },
        ]
      },
      emergency_scan: {
        text: 'Сканер показывает: внутри - электроника военного класса. Навигационные модули, шифровальное оборудование. Стоимость - минимум 5000.',
        options: [
          { text: '> 1500! (выгодная сделка)', next: 'emergency_bid', cost: { credits: 975 } },
        ]
      },
      emergency_no_scan: {
        text: 'Без сканера - кот в мешке.',
        options: [
          { text: '> Рискну, 1500', next: 'emergency_bid', cost: { credits: 975 } },
          { text: '> Нет', next: 'end_leave_late' },
        ]
      },
      emergency_bid: {
        text: 'Никто не перебивает - все уже потратились на основных лотах. Груз ваш!',
        options: [
          { text: '> Открыть!', chances: [
            { weight: 50, next: 'end_emergency_jackpot' },
            { weight: 30, next: 'end_emergency_decent' },
            { weight: 20, next: 'end_emergency_contraband' },
          ]},
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Аукционы - не ваше. Зато кошелёк цел.',
        ending: true,
        result: {}
      },
      end_leave_late: {
        text: 'Аукцион окончен. Интересный опыт, хоть и ничего не купили.',
        ending: true,
        result: { reputation: 1 }
      },
      end_lot1_open: {
        text: 'Внутри - набор Древних навигационных инструментов! Коллекционеры оценивают в 6000 кредитов! Выгодная сделка!',
        ending: true,
        result: { credits: 3900, reputation: 15, factionRep: { traders: 3 } }
      },
      end_lot1_junk: {
        text: 'Внутри... камни. Красивые, но обычные камни. Кто-то давно набил ящик для веса. Зал хохочет. 2000 кредитов за гравий.',
        ending: true,
        result: { reputation: -5 }
      },
      end_lot1_artifact: {
        text: 'Внутри - Ключ Древних! Маленький кристалл, пульсирующий светом. Учёные в зале хватаются за головы. Вещь БЕСЦЕННАЯ. Вам предлагают 10000 на месте!',
        ending: true,
        result: { credits: 6500, reputation: 25, flags: { ancient_knowledge: true, auction_winner: true }, factionRep: { traders: 5, scientists: 5 } }
      },
      end_lot1_danger: {
        text: 'Ящик шипит! Внутри - контейнер с биоматериалом. Древний, но активный. Зал эвакуируют. Учёные забирают образец, вам платят компенсацию за "находку". Могло кончиться хуже.',
        ending: true,
        result: { credits: 1950, reputation: 5, damage: 5, factionRep: { scientists: 2 } }
      },
      end_lot2_use: {
        text: 'Карта настоящая! Три маршрута с наценкой 200% на электронику. Информация стоит 2500 кредитов минимум.',
        ending: true,
        result: { credits: 1625, reputation: 8, flags: { auction_winner: true }, factionRep: { traders: 3 } }
      },
      end_lot3_win: {
        text: 'Перехватчик ваш! В ангаре выяснилось: военная обшивка, скрытый оружейный отсек. После ремонта продали за 8000.',
        ending: true,
        result: { credits: 5200, reputation: 10, flags: { auction_winner: true }, factionRep: { traders: 3 } }
      },
      end_lot3_win_discount: {
        text: 'Перехватчик ваш - со скидкой героя! В ангаре: военная обшивка, скрытый оружейный отсек, форсированные двигатели. Продали за 8000. Чистая прибыль - впечатляет.',
        ending: true,
        result: { credits: 5200, reputation: 12, flags: { auction_winner: true }, factionRep: { traders: 4 } }
      },
      end_lot3_lost: {
        text: 'Корабль ушёл за 5000. Пилот из угла ухмыляется. Может, вы сэкономили.',
        ending: true,
        result: { reputation: 2 }
      },
      end_premium_lost: {
        text: 'Кристалл ушёл коллекционеру. Он вертит его в руках, не понимая настоящей ценности. Может, оно и к лучшему.',
        ending: true,
        result: { reputation: 3 }
      },
      end_crystal_partial: {
        text: 'Кристалл активировался частично - фрагменты координат, обрывки данных. Не полная карта, но достаточно, чтобы учёные заплатили 8000 кредитов.',
        ending: true,
        result: { credits: 5200, reputation: 18, flags: { auction_winner: true }, factionRep: { traders: 3, scientists: 5 } }
      },
      end_crystal_navigation: {
        text: 'Кристалл раскрылся полностью! Навигационный ключ Предтеч - координаты десятков маяков по всему сектору. Это меняет всю навигацию. Учёные и военные передерутся за эти данные. 12000 кредитов - и это только начальная цена.',
        ending: true,
        result: { credits: 7800, reputation: 30, flags: { auction_winner: true, precursor_navigation: true }, factionRep: { traders: 5, scientists: 8 } }
      },
      end_crystal_sell: {
        text: 'Коллекционер, которого вы обошли, тут же предлагает 12000. Чистая прибыль за красивый камень. Или он знает больше, чем показывает?',
        ending: true,
        result: { credits: 7800, reputation: 10, flags: { auction_winner: true }, factionRep: { traders: 5 } }
      },
      end_emergency_jackpot: {
        text: 'Джекпот! Военное навигационное оборудование последнего поколения. На чёрном рынке - 6000, через военных - 5000 с благодарностью. Выгоднейшая покупка аукциона.',
        ending: true,
        result: { credits: 3900, reputation: 12, flags: { auction_winner: true }, factionRep: { military: 3 } }
      },
      end_emergency_decent: {
        text: 'Шифровальное оборудование - устаревшее, но рабочее. Перекупщик дал 3000. Небольшая прибыль.',
        ending: true,
        result: { credits: 1950, reputation: 5, flags: { auction_winner: true } }
      },
      end_emergency_contraband: {
        text: 'Внутри - пиратская контрабанда с маркировкой "Розыск". Охрана аукциона тут же конфискует. Вам возвращают ставку и извиняются. Повезло что не арестовали.',
        ending: true,
        result: { reputation: -3 }
      },
    }
  },

  // ===== 11. НАУЧНАЯ ЭКСПЕДИЦИЯ (research) =====
  {
    id: 'science_expedition',
    title: 'Экспедиция к аномалии',
    planetType: 'research',
    minDay: 14,
    oneTime: true,
    ascii: [
      '       . * .  *  . * .',
      '     *  .  ANOMALY  .  *',
      '    .  * . ??????? . *  .',
      '     *  .  . * .  .  *',
      '       . * .  *  . * .',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/science_expedition.png',
        text: 'Профессор Лин из Академии Наук. "Пространственная аномалия в 2 прыжках. Мне нужен корабль с храбрым экипажем. 2000 кредитов за доставку, бонус за образцы. Аномалия нестабильна - у нас максимум 3 дня, потом окно закроется."',
        options: [
          { text: 'Согласиться', next: 'prep' },
          { text: 'Торговаться', next: 'negotiate' },
          { text: 'Отказаться', next: 'end_refuse' },
        ]
      },
      negotiate: {
        text: 'Лин вздыхает. "3000, но все риски ваши. И мне нужен сканер на борту."',
        options: [
          { text: 'Идёт', next: 'prep' },
          { text: 'Слишком опасно', next: 'end_refuse' },
        ]
      },
      prep: {
        text: 'Перед вылетом Лин проверяет ваш корабль. "Возьмите исследовательское оборудование, если есть - пригодится. И оружие. Неизвестно, что нас ждёт." Она запускает обратный отсчёт.',
        options: [
          { text: 'Вылетаем немедленно', next: 'jump1' },
          { text: 'Проверить данные лаборатории', next: 'prep_lab_data', check: { flag: 'anomaly_research_data', flagValue: true, failNext: 'prep_no_data' } },
          { text: 'Показать координаты Предтеч', next: 'prep_precursor', check: { flag: 'precursor_coordinates', flagValue: true, failNext: 'prep_no_data' } },
        ]
      },
      prep_no_data: {
        text: 'У вас нет дополнительных данных о аномалии. Летим вслепую.',
        options: [
          { text: 'Вылетаем', next: 'jump1' },
        ]
      },
      prep_lab_data: {
        text: 'Лин изучает данные из лаборатории "Омега". Глаза расширяются. "Проект Конвергенция... Так аномалия - не природное явление! Это результат экспериментов Предтеч! С этими данными я могу рассчитать стабильный коридор через портал!"',
        options: [
          { text: 'Вылетаем с преимуществом', next: 'jump1_safe' },
        ]
      },
      prep_precursor: {
        text: 'Лин в шоке от координат. "Это... это не просто аномалия. Это МАЯК Предтеч! Координаты показывают стабильный коридор к их главной станции. Мы можем обойти портал и лететь НАПРЯМУЮ!" Она пересчитывает маршрут.',
        options: [
          { text: 'Прямой маршрут к станции', next: 'direct_approach' },
          { text: 'Сначала к порталу, потом к станции', next: 'jump1_safe' },
        ]
      },
      jump1: {
        img: 'quests/anomaly_portal.png',
        text: 'Первый прыжок. Лин сканирует пространство. Гравитационные волны впереди. "Это не должно здесь быть." Датчики фиксируют поле обломков - кто-то уже пытался добраться до аномалии.',
        options: [
          { text: 'Продолжать через обломки', next: 'debris_field' },
          { text: 'Обогнуть обломки', next: 'jump2' },
          { text: 'Развернуться', next: 'end_abort' },
        ]
      },
      jump1_safe: {
        text: 'Первый прыжок. Данные лаборатории позволяют Лин рассчитать безопасный маршрут. "Гравитационные аномалии обходим слева. Поле обломков - через верхний эшелон." Полёт проходит гладко.',
        options: [
          { text: 'К аномалии', next: 'jump2_safe' },
          { text: 'Осмотреть обломки по пути', next: 'debris_safe' },
        ]
      },
      debris_field: {
        text: 'Обломки трёх кораблей. Один - военный разведчик, два - гражданских. Все разорваны гравитационными волнами. В обломках разведчика мигает аварийный маяк.',
        options: [
          { text: 'Подобрать маяк', next: 'debris_beacon', check: { stat: 'scanner', value: true, failNext: 'debris_beacon_noscan' } },
          { text: 'Забрать ценное из обломков', next: 'debris_loot', check: { stat: 'cargo', has: 'electronics', min: 1, failNext: 'debris_loot_fail' } },
          { text: 'Лететь дальше', next: 'jump2' },
        ]
      },
      debris_safe: {
        text: 'Безопасный пролёт через верхний эшелон обломков. Сканеры зафиксировали данные с разрушенных кораблей - три судна, все погибли от гравитационных волн. В одном мигает маяк.',
        options: [
          { text: 'Подобрать маяк', next: 'debris_beacon' },
          { text: 'К аномалии', next: 'jump2_safe' },
        ]
      },
      debris_beacon: {
        text: 'Маяк принадлежит военному разведчику "Скиф-7". Его последняя передача: "Портал пульсирует. Интервал - 47 минут. Входить только на пике. Повторяю, только на пике, иначе..." Запись обрывается. Ценная информация.',
        options: [
          { text: 'Лететь дальше', next: 'jump2' },
        ]
      },
      debris_beacon_noscan: {
        text: 'Без сканера невозможно безопасно подойти к обломкам - слишком много мелких осколков.',
        options: [
          { text: 'Лететь дальше', next: 'jump2' },
        ]
      },
      debris_loot: {
        text: 'Используя запасную электронику как магнитный якорь, вы подтянули ящик из грузового отсека. Внутри - исследовательское оборудование и 800 кредитов наличными.',
        options: [
          { text: 'Лететь дальше', next: 'jump2' },
        ]
      },
      debris_loot_fail: {
        text: 'Обломки вращаются слишком быстро - без магнитного якоря не подобраться. Нужна электроника.',
        options: [
          { text: 'Лететь дальше', next: 'jump2' },
        ]
      },
      jump2: {
        text: 'Второй прыжок. И вы видите ЭТО. Сфера из чистого света, диаметром с луну. Приборы зашкаливают. Лин в экстазе: "Невероятно! Это портал!" Сфера пульсирует - расширяется и сжимается.',
        ascii: [
          '         ****',
          '       **    **',
          '      *  ~~~~  *',
          '      *  ~~~~  *',
          '       **    **',
          '         ****',
        ].join('\n'),
        options: [
          { text: 'Войти в портал', next: 'portal_enter' },
          { text: 'Войти на пике пульсации', next: 'portal_timed', check: { stat: 'scanner', value: true, failNext: 'portal_enter' } },
          { text: 'Собрать данные снаружи', next: 'scan_outside' },
          { text: 'Запустить зонд', next: 'probe' },
        ]
      },
      jump2_safe: {
        text: 'Безопасный подход к аномалии. Лин уже рассчитала оптимальное окно входа. "С данными из лаборатории я знаю, когда портал стабилен. Мы войдём на пике пульсации - без турбулентности."',
        ascii: [
          '         ****',
          '       **    **',
          '      *  ~~~~  *',
          '      *  ~~~~  *',
          '       **    **',
          '         ****',
        ].join('\n'),
        options: [
          { text: 'Войти в стабильном окне', next: 'portal_success' },
          { text: 'Сначала собрать данные', next: 'scan_outside' },
          { text: 'Запустить зонд', next: 'probe' },
        ]
      },
      direct_approach: {
        text: 'Координаты Предтеч открыли стабильный коридор - вы обходите портал полностью! Прыжок через подпространство, и... станция. Огромная, кристаллическая, ЖИВАЯ. Лин не может говорить от восторга.',
        ascii: [
          '  ====[PRECURSOR STATION]====',
          '  *   *   *   *   *   *   *',
          '  *  WELCOME TRAVELLER  *',
          '  *   *   *   *   *   *   *',
        ].join('\n'),
        options: [
          { text: 'Стыковка', next: 'station_direct' },
        ]
      },
      portal_timed: {
        text: 'Сканер отслеживает пульсацию. "47 минут... 46... Пик через 12 минут!" Вы ждёте и входите точно в момент максимального расширения. Переход плавный, как шёлк.',
        options: [
          { text: '...', next: 'portal_success' },
        ]
      },
      portal_enter: {
        text: 'Корабль входит в сферу. Вспышка!',
        options: [
          { text: '...', chances: [
            { weight: 45, next: 'portal_success' },
            { weight: 30, next: 'portal_turbulence' },
            { weight: 25, next: 'portal_lost' },
          ]},
        ]
      },
      portal_success: {
        text: 'Другая сторона. Незнакомые звёзды. На радаре - станция. Древняя, но функционирующая. Лин задыхается от восторга.',
        options: [
          { text: 'Пристыковаться к станции', next: 'ancient_station' },
          { text: 'Вернуться через портал', next: 'end_portal_data' },
        ]
      },
      portal_turbulence: {
        text: 'Турбулентность! Корабль трясёт, системы перезагружаются. Но вы прошли. Станция на радаре, приборы барахлят. Лин бледная, но улыбается.',
        options: [
          { text: 'К станции', next: 'ancient_station' },
          { text: 'Назад, пока можем', next: 'end_portal_data' },
        ]
      },
      portal_lost: {
        text: 'Выбросило в неизвестном секторе. Портала нет. Лин в панике. Топлива мало. Сканеры засекли торговый маршрут.',
        options: [
          { text: 'К маршруту', next: 'end_portal_lost' },
        ]
      },
      ancient_station: {
        text: 'Станция автоматическая. Голограмма приветствует на неизвестном языке, потом переключается: "Путешественник. Забери знания. Передай достойным." На столе - кристаллы с данными. Но дальше - закрытая дверь с символом стража.',
        options: [
          { text: 'Забрать кристаллы и уйти', next: 'end_station_careful' },
          { text: 'Открыть дверь стража', next: 'guardian_door' },
          { text: 'Просканировать станцию', next: 'station_scan', check: { stat: 'scanner', value: true, failNext: 'guardian_door' } },
        ]
      },
      station_direct: {
        text: 'Станция УЗНАЛА координаты Предтеч в вашем навигаторе. Все двери открыты. Голограмма: "Наследник. Мы ждали." Лин плачет от счастья. Полный доступ ко всем секциям.',
        options: [
          { text: 'Изучить всё', next: 'station_full_access' },
          { text: 'Забрать самое ценное и уходить', next: 'end_station_loot' },
        ]
      },
      station_full_access: {
        text: 'Три секции: Библиотека Знаний (кристаллы с данными о тысяче миров), Оружейная (системы защиты Предтеч), Навигационный Зал (полная карта сети маяков). Лин хочет провести тут месяц. У вас нет столько времени.',
        options: [
          { text: 'Библиотека - знания прежде всего', next: 'end_station_library' },
          { text: 'Оружейная - нужна защита', next: 'end_station_armory' },
          { text: 'Навигация - карта важнее всего', next: 'end_station_navigation' },
          { text: 'Попробовать всё', next: 'station_all', check: { stat: 'speed', min: 6, failNext: 'end_station_library' } },
        ]
      },
      station_scan: {
        text: 'Сканер показывает: за дверью - автоматическая система безопасности. Дрон-страж. Вооружён плазменным резаком. Но у него слабое место - сенсорный модуль на спине. Также есть обходной путь через вентиляцию.',
        options: [
          { text: 'Через вентиляцию', next: 'station_vent' },
          { text: 'Сражаться с дроном', next: 'guardian_fight' },
          { text: 'Забрать кристаллы и уйти', next: 'end_station_careful' },
        ]
      },
      guardian_door: {
        text: 'Дверь открывается. Из темноты - красный луч. ДРОН-СТРАЖ! Древняя машина, но рабочая. Плазменный резак наготове.',
        ascii: [
          '  [!] GUARDIAN DRONE [!]',
          '   \\\\  ===()===  //',
          '    \\\\ |PLASMA| //',
          '      |______|',
        ].join('\n'),
        options: [
          { text: 'Драться!', next: 'guardian_fight', check: { stat: 'weapon', value: 'plasma', failNext: 'guardian_fight_basic' } },
          { text: 'Наёмник, вперёд!', next: 'guardian_merc', check: { stat: 'mercenary', failNext: 'guardian_fight_basic' } },
          { text: 'БЕЖАТЬ!', next: 'end_station_careful' },
        ]
      },
      guardian_fight: {
        text: 'Плазменное оружие против плазменного дрона - честный бой! Вы стреляете в сенсорный модуль. Дрон вертится, слепнет, врезается в стену. Победа!',
        options: [
          { text: 'Дальше по станции', next: 'station_inner' },
        ]
      },
      guardian_fight_basic: {
        text: 'Без тяжёлого оружия бой сложный. Дрон стреляет, вы уклоняетесь. Удар по корпусу - он дёргается. Ещё удар! Дрон падает, но вы обожжены плазмой.',
        options: [
          { text: 'Дальше, несмотря на раны', next: 'station_inner_wounded' },
        ]
      },
      guardian_merc: {
        text: 'Наёмник выходит вперёд. "Я видел таких на военных базах. Слабое место - спина." Он отвлекает, вы заходите сзади. Дрон нейтрализован.',
        options: [
          { text: 'Вглубь станции', next: 'station_inner' },
        ]
      },
      station_vent: {
        text: 'Через вентиляцию вы обходите дрона. Он патрулирует коридор, не подозревая. Вы выходите в главный зал станции.',
        options: [
          { text: 'Осмотреть зал', next: 'station_inner' },
        ]
      },
      station_inner: {
        text: 'Главный зал. Голограмма проецирует звёздную карту. В центре - кристаллический терминал с данными. Лин прикасается к нему и отдёргивает руку. "Тут... тут ВСЁ. Знания Предтеч. Технологии. Координаты." Она смотрит на вас. "Нам нужно решить, что забрать."',
        options: [
          { text: 'Координаты и навигацию', next: 'end_station_navigation' },
          { text: 'Данные об оружии Предтеч', next: 'end_station_weapon', check: { flag: 'ancient_weapon_data', flagValue: true, failNext: 'end_station_weapon_partial' } },
          { text: 'Забрать ВСЁ', next: 'station_all', check: { stat: 'speed', min: 6, failNext: 'end_station_navigation' } },
        ]
      },
      station_inner_wounded: {
        text: 'Ожоги болят, но вы дошли. Главный зал. Голограмма, звёздная карта, кристаллический терминал. Лин хватает данные. "Быстро, нам нужно в медотсек!"',
        options: [
          { text: 'Забрать координаты и уходить', next: 'end_station_wounded' },
          { text: 'Терпеть - нужно больше данных', next: 'end_station_endure' },
        ]
      },
      station_all: {
        text: 'Вы действуете быстро - Лин копирует данные, вы упаковываете кристаллы. Библиотека, оружейная, навигация - всё за 40 минут. Портал начинает сужаться. "БЕЖИМ!" Рывок к кораблю. Взлёт. Портал закрывается в метре за кормой.',
        options: [
          { text: 'Мы сделали это', next: 'end_station_everything' },
        ]
      },
      scan_outside: {
        text: 'Данные феноменальные. Лин записывает всё. "10 научных статей! Нобелевская!" Но она смотрит на портал с тоской.',
        options: [
          { text: 'Ладно, войдём', next: 'portal_enter' },
          { text: 'Нет, улетаем', next: 'end_scan_data' },
        ]
      },
      probe: {
        text: 'Зонд входит в сферу... связь обрывается. Через 30 секунд он вылетает обратно! С данными и образцом неизвестного вещества.',
        options: [
          { text: 'Изучить образец', next: 'probe_study' },
          { text: 'Войти самим', next: 'portal_enter' },
        ]
      },
      probe_study: {
        text: 'Образец пульсирует. Лин анализирует: "Это не вещество. Это ИНФОРМАЦИЯ в физической форме. Кристаллизованные данные Предтеч!" Сканер фиксирует координаты, закодированные в структуре.',
        options: [
          { text: 'Войти за остальным', next: 'portal_enter' },
          { text: 'Хватит, улетаем', next: 'end_probe_sample' },
        ]
      },
      // === ENDINGS ===
      end_refuse: {
        text: 'Лин нашла другого пилота. Говорят, он вернулся богатым.',
        ending: true,
        result: {}
      },
      end_abort: {
        text: 'Лин разочарована, но платит за время. 500 кредитов.',
        ending: true,
        result: { credits: 325, reputation: -3 }
      },
      end_portal_data: {
        text: 'Данные с той стороны бесценны. Лин плачет от счастья. 4000 кредитов и благодарность Академии.',
        ending: true,
        result: { credits: 2600, reputation: 20, flags: { expedition_complete: true }, factionRep: { scientists: 6 } }
      },
      end_station_loot: {
        text: 'Кристаллы с данными стоят целое состояние. Технологии на столетия вперёд.',
        ending: true,
        result: { credits: 5200, reputation: 30, flags: { expedition_complete: true }, factionRep: { scientists: 8 } }
      },
      end_station_careful: {
        text: 'Три кристалла - достаточно для изучения. 5000 кредитов и уважение учёных.',
        ending: true,
        result: { credits: 3250, reputation: 22, flags: { expedition_complete: true }, factionRep: { scientists: 5 } }
      },
      end_station_library: {
        text: 'Библиотека Предтеч! Данные о тысяче миров, их истории и гибели. Лин уже планирует десять экспедиций. Академия наук в экстазе.',
        ending: true,
        result: { credits: 3900, reputation: 28, flags: { expedition_complete: true, precursor_coordinates: true }, factionRep: { scientists: 10 } }
      },
      end_station_armory: {
        text: 'Оружейные системы Предтеч. Не оружие как таковое - скорее схемы защитных полей и энергетических щитов. Военные и учёные передерутся за эти данные.',
        ending: true,
        result: { credits: 4550, reputation: 25, flags: { expedition_complete: true, ancient_weapon_data: true }, factionRep: { scientists: 6, military: 5 } }
      },
      end_station_navigation: {
        text: 'Полная карта сети маяков Предтеч. Десятки станций, разбросанных по галактике. И координаты Точки Конвергенции - центрального узла их цивилизации. Лин шепчет: "Мы нашли дорогу домой. Их дом."',
        ending: true,
        result: { credits: 4225, reputation: 30, flags: { expedition_complete: true, precursor_coordinates: true, convergence_warning: true }, factionRep: { scientists: 10 } }
      },
      end_station_weapon: {
        text: 'Данные об оружии Предтеч из пирамиды совпали с системами на станции. Вы активировали полный протокол передачи - Предтечи УЗНАЛИ свои данные и отдали ВСЁ. Защитные технологии, энергетические системы, координаты военных баз. Это меняет расклад сил в галактике.',
        ending: true,
        result: { credits: 5850, reputation: 35, flags: { expedition_complete: true, ancient_weapon_data: true, convergence_warning: true, precursor_coordinates: true }, factionRep: { scientists: 10, military: 8 } }
      },
      end_station_weapon_partial: {
        text: 'Оружейные данные без контекста из пирамиды - фрагментарны. Но даже фрагменты стоят целое состояние.',
        ending: true,
        result: { credits: 3575, reputation: 22, flags: { expedition_complete: true, ancient_weapon_data: true }, factionRep: { scientists: 5 } }
      },
      end_station_wounded: {
        text: 'Координаты схвачены. Вы ковыляете к кораблю, Лин поддерживает. Ожоги серьёзные, но данные бесценны. Медик на станции качает головой, увидев ваши раны.',
        ending: true,
        result: { credits: 3250, reputation: 20, damage: 20, flags: { expedition_complete: true, precursor_coordinates: true }, factionRep: { scientists: 6 } }
      },
      end_station_endure: {
        text: 'Через боль вы помогли Лин скопировать максимум данных. Навигация, оружие, библиотека - всё фрагментами, но каждый фрагмент ценен. Обратный путь в полубреду. Медик на станции: "Ещё час - и вы бы не дотянули."',
        ending: true,
        result: { credits: 4550, reputation: 28, damage: 30, flags: { expedition_complete: true, precursor_coordinates: true, convergence_warning: true }, factionRep: { scientists: 8 } }
      },
      end_station_everything: {
        text: 'ВСЁ. Библиотека, оружие, навигация - полный архив станции Предтеч. Лин смотрит на данные и тихо говорит: "Это конец эпохи незнания. Мы теперь видим галактику так, как видели её Предтечи." Академия назвала это Открытием Тысячелетия. Ваше имя в учебниках.',
        ending: true,
        result: { credits: 7800, reputation: 40, flags: { expedition_complete: true, precursor_coordinates: true, convergence_warning: true, ancient_weapon_data: true }, factionRep: { scientists: 15 } }
      },
      end_scan_data: {
        text: 'Данные внешнего сканирования - прорыв. 3000 кредитов.',
        ending: true,
        result: { credits: 1950, reputation: 15, flags: { expedition_complete: true }, factionRep: { scientists: 4 } }
      },
      end_portal_lost: {
        text: 'Три дня блужданий. Данные из чужого сектора. Торговый маршрут и дорога домой. Топлива ноль, нервов ноль, но живы.',
        ending: true,
        result: { credits: 975, reputation: 5, fuelDrain: true, damage: 10 }
      },
      end_probe_sample: {
        text: 'Образец - кристаллизованные данные Предтеч! "Нова-икс", как назвала его Лин. Научное открытие века. Координаты фрагментов закодированы в структуре.',
        ending: true,
        result: { credits: 3250, reputation: 25, flags: { expedition_complete: true }, factionRep: { scientists: 6 } }
      },
    }
  },

  // ===== 12. ГОЛОДНЫЙ БУНТ (agricultural) =====
  {
    id: 'hunger_riot',
    title: 'Голодный бунт',
    planetType: 'agricultural',
    minDay: 11,
    oneTime: true,
    ascii: [
      '  ╔══════════════════════╗',
      '  ║  HARVEST  FAILED     ║',
      '  ║  ═══════════════════ ║',
      '  ║  COLONY IN CRISIS    ║',
      '  ║  FOOD RIOTS ONGOING  ║',
      '  ╚══════���═══════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/hunger_riot.png',
        text: 'Колония на грани. Урожай погиб от эпидемии - вредители уничтожили 80% посевов. Люди голодают. Губернатор просит о помощи, но Гильдия Торговцев подняла цены в 5 раз. На площади собирается толпа.',
        options: [
          { text: '> Поговорить с губернатором', next: 'governor' },
          { text: '> Поговорить с торговцами', next: 'traders' },
          { text: '> Применить устав Гильдии', next: 'guild_bylaws', check: { stat: 'reputation', faction: 'traders', min: 8, failNext: 'guild_no_rep' } },
          { text: '> Подпольные каналы снабжения', next: 'underground_supply', check: { flag: 'casino_vip', flagValue: true, failNext: 'underground_no_contacts' } },
          { text: '> Не моё дело', next: 'end_leave' },
        ]
      },
      guild_bylaws: {
        text: 'Вы знаете устав Гильдии наизусть. Параграф 47: "Торговец не вправе повышать цену на продовольствие более чем в 2 раза в зоне гуманитарного кризиса." Моркос побагровел - он знает, что вы правы. Нарушение грозит отзывом торговой лицензии.',
        options: [
          { text: '> Потребовать цену по уставу', next: 'bylaws_demand' },
          { text: '> Использовать как рычаг для переговоров', next: 'bylaws_leverage' },
        ]
      },
      guild_no_rep: {
        text: 'Вы помните что-то про устав Гильдии, но без репутации в торговых кругах вас не воспримут всерьёз.',
        options: [
          { text: '> Поговорить с губернатором', next: 'governor' },
          { text: '> К торговцам', next: 'traders' },
        ]
      },
      bylaws_demand: {
        text: 'Моркос скрипит зубами: "Ты что, юрист? Ладно... 2x - это 2000. Казна покроет." Его люди шепчутся - никто не ожидал. Но Моркос запомнит.',
        options: [
          { text: '> Оформить сделку', next: 'end_bylaws_win' },
        ]
      },
      bylaws_leverage: {
        text: '"Можем решить тихо, Моркос. Ты снижаешь до 2500, колония довольна, лицензия цела, и мы оба выглядим хорошо. Или я подаю жалобу в Совет Гильдии." Моркос думает долго.',
        options: [
          { text: '> Ну?', chances: [
            { weight: 75, next: 'end_bylaws_compromise' },
            { weight: 25, next: 'end_bylaws_stubborn' },
          ]},
        ]
      },
      underground_supply: {
        text: 'VIP-статус в казино открывает двери. Вы связываетесь с контактами из Фортуны - есть подпольные склады с продовольствием на нейтральных станциях. Доставка обойдётся дешевле, чем у Моркоса.',
        options: [
          { text: '> Заказать подпольную доставку (1500 кр)', next: 'underground_delivery', cost: { credits: 975 } },
          { text: '> Контрабандист довезёт', next: 'smuggler_delivery', check: { flag: 'smuggler_contact', flagValue: true, failNext: 'underground_delivery_only' } },
        ]
      },
      underground_no_contacts: {
        text: 'У вас нет контактов в подпольных кругах. Нужны связи в казино или среди контрабандистов.',
        options: [
          { text: '> Поговорить с губернатором', next: 'governor' },
          { text: '> К торговцам', next: 'traders' },
        ]
      },
      underground_delivery: {
        text: 'Контакты из Фортуны не подвели. Через сутки грузовик с едой садится в порту. Без опознавательных знаков, без документов. Моркос в ярости - его обошли.',
        options: [
          { text: '> Помочь с раздачей', next: 'end_underground_hero' },
        ]
      },
      underground_delivery_only: {
        text: 'Без контактов среди контрабандистов придётся платить полную цену подпольщикам.',
        options: [
          { text: '> Заказать доставку (1500 кр)', next: 'underground_delivery', cost: { credits: 975 } },
          { text: '> Другой путь', next: 'governor' },
        ]
      },
      smuggler_delivery: {
        text: 'Контрабандист, с которым вы гонялись, берёт трубку. "Еда? Есть на складе у Ригеля. Для тебя - по себестоимости. Гоню за день." Даже денег не берёт. "Ты мне помог на гонке. Квиты."',
        options: [
          { text: '> Ждать доставку', next: 'end_smuggler_saves' },
        ]
      },
      governor: {
        img: 'quests/hunger_crowd.png',
        text: 'Губернатор Нара, усталая женщина: "У нас 10000 человек. Еды на 3 дня. Торговцы требуют 5000 за партию, у казны - 2000. Помогите."',
        ascii: [
          '  COLONY STATUS:',
          '  Population: 10,000',
          '  Food reserves: 3 DAYS',
          '  Treasury: 2,000 cr',
          '  Trader price: 5,000 cr',
        ].join('\n'),
        options: [
          { text: '> Доплачу разницу из своих (3000)', next: 'end_pay_difference', cost: { credits: 1950 } },
          { text: '> Попробую договориться с торговцами', next: 'traders' },
          { text: '> Привезу еду сам', next: 'deliver_food' },
          { text: '> А что губернатор предлагает?', next: 'governor_plan' },
        ]
      },
      governor_plan: {
        text: 'Нара мрачнеет: "Есть план Б. Склад Моркоса охраняют всего 4 человека. Если толпа решится..." Она замолкает. "Но это грабёж. И может быть кровь."',
        options: [
          { text: '> Помогу захватить склад', next: 'warehouse_raid', check: { stat: 'attack', min: 10, failNext: 'warehouse_fail' } },
          { text: '> Наёмник поможет', next: 'warehouse_merc', check: { stat: 'mercenary', failNext: 'warehouse_no_merc' } },
          { text: '> Нет, найду другой способ', next: 'traders' },
        ]
      },
      warehouse_raid: {
        text: 'Ночь. Вы с десятком добровольцев подходите к складу. Охрана видит толпу и вас впереди. "Ребята, у вас два варианта. Уйти - или стать частью новостей." Четверо охранников переглядываются.',
        options: [
          { text: '> Давить дальше', chances: [
            { weight: 70, next: 'end_warehouse_taken' },
            { weight: 30, next: 'end_warehouse_fight' },
          ]},
        ]
      },
      warehouse_fail: {
        text: 'Вы выглядите недостаточно убедительно. Охрана не дрогнула, толпа замялась. Операция провалилась.',
        options: [
          { text: '> Договариваться с торговцами', next: 'traders' },
          { text: '> Привезти еду самому', next: 'deliver_food' },
        ]
      },
      warehouse_merc: {
        text: 'Наёмник выходит к складу. Один. Молча кладёт руки на пояс с оружием. Охрана смотрит на него. Потом друг на друга. Потом уходит. Без единого слова.',
        options: [
          { text: '> Раздать еду', next: 'end_warehouse_merc_win' },
        ]
      },
      warehouse_no_merc: {
        text: 'Без наёмника план слишком рискованный.',
        options: [
          { text: '> Другой подход', next: 'traders' },
        ]
      },
      traders: {
        text: 'Глава торговой делегации, жирный Моркос: "Спрос и предложение, друг мой. Еда стоит столько, сколько готовы платить. А они заплатят."',
        options: [
          { text: '> Уговорить снизить цену', next: 'negotiate_traders', check: { stat: 'attack', min: 10, failNext: 'negotiate_fail' } },
          { text: '> Пригрозить', next: 'threaten_traders' },
          { text: '> Предложить взятку (500 кр)', next: 'bribe_small', cost: { credits: 325 } },
          { text: '> Помочь колонии иначе', next: 'governor' },
        ]
      },
      bribe_small: {
        text: 'Моркос смотрит на чип. "500? Ты шутишь?" Он отодвигает его. "Серьёзный разговор стоит серьёзных денег."',
        options: [
          { text: '> 1500 (серьёзная взятка)', next: 'bribe_medium', cost: { credits: 650 } },
          { text: '> 3000 (VIP-взятка)', next: 'bribe_large', cost: { credits: 1625 } },
          { text: '> Тогда по-другому', next: 'threaten_traders' },
        ]
      },
      bribe_medium: {
        text: 'Моркос берёт чип. "1500... Ладно, снижу до 3500. Казна даст 2000, тебе доплатить полторы." Не идеально, но лучше.',
        options: [
          { text: '> Сделка (1500 доплата)', next: 'end_bribe_deal', cost: { credits: 975 } },
          { text: '> Нет, больше скинь', next: 'negotiate_fail' },
        ]
      },
      bribe_large: {
        text: 'Моркос забирает чип мгновенно. "Для хорошего друга - 2000. Казна покроет. Никто не голодает, никто не злится." Он подмигивает. Коррупция, но работает.',
        options: [
          { text: '> Оформить поставку', next: 'end_bribe_large_deal' },
        ]
      },
      negotiate_traders: {
        text: 'Вы давите на Моркоса. Напоминаете о репутации. О военных, которые не любят голодные бунты. Он потеет. "Ладно... 3000. Последнее слово."',
        options: [
          { text: '> Сделка за 3000 (из казны + ваших)', next: 'end_deal_fair', cost: { credits: 650 } },
          { text: '> Мало. Привезу сам.', next: 'deliver_food' },
        ]
      },
      negotiate_fail: {
        text: 'Моркос смеётся. "Не учи торговца торговать, пилот." Он непреклонен.',
        options: [
          { text: '> Пригрозить', next: 'threaten_traders' },
          { text: '> Привезу еду сам', next: 'deliver_food' },
        ]
      },
      threaten_traders: {
        text: '"Если люди умрут - виноваты будете вы. А голодная толпа не разбирает, кого линчевать первым." Моркос бледнеет.',
        options: [
          { text: '> "Снижай цену. Сейчас."', chances: [
            { weight: 60, next: 'end_threat_works' },
            { weight: 25, next: 'end_threat_backfire' },
            { weight: 15, next: 'end_threat_riot' },
          ]},
        ]
      },
      deliver_food: {
        text: 'Ближайший источник еды - Солнце, 1 прыжок. Если у вас есть еда в трюме - можно отдать прямо сейчас.',
        options: [
          { text: '> Отдать свою еду (нужно 8)', next: 'end_give_own_food', check: { stat: 'cargo', has: 'food', min: 8, failNext: 'no_food' } },
          { text: '> Наёмник довезёт за полцены', next: 'merc_delivery', check: { stat: 'mercenary', failNext: 'no_food_merc' } },
          { text: '> Слетаю за едой', next: 'end_fly_for_food' },
        ]
      },
      merc_delivery: {
        text: 'Наёмник берёт задание: слетать за едой и обеспечить охрану каравана. "Вернусь через 12 часов. Если не вернусь - еду забрал кто-то другой."',
        options: [
          { text: '> Ждать', chances: [
            { weight: 80, next: 'end_merc_delivery_success' },
            { weight: 20, next: 'end_merc_delivery_late' },
          ]},
        ]
      },
      no_food_merc: {
        text: 'Без наёмника и без еды в трюме - придётся лететь самому.',
        options: [
          { text: '> Слетаю за едой', next: 'end_fly_for_food' },
          { text: '> Помогу иначе', next: 'governor' },
        ]
      },
      no_food: {
        text: 'У вас нет достаточно еды в трюме. Губернатор смотрит с надеждой, но вам нечего отдать.',
        options: [
          { text: '> Слетаю за едой', next: 'end_fly_for_food' },
          { text: '> Помогу иначе', next: 'governor' },
        ]
      },
      // === ENDINGS ===
      end_leave: {
        text: 'Вы улетели. Через неделю в новостях: бунт подавлен, 12 погибших.',
        ending: true,
        result: { reputation: -10, flags: { riot_erupted: true } }
      },
      end_pay_difference: {
        text: 'Вы доплатили 3000 из своего кармана. Колония спасена. Губернатор Нара объявляет вас почётным гражданином. На площади аплодисменты.',
        ending: true,
        result: { credits: 0, reputation: 30, flags: { colony_hero: true }, factionRep: { traders: -2 } }
      },
      end_deal_fair: {
        text: 'Сделка состоялась. Еда поставлена. Колония вздохнула. Губернатор жмёт вам руку.',
        ending: true,
        result: { credits: 325, reputation: 20, flags: { colony_hero: true }, factionRep: { traders: 2 } }
      },
      end_bylaws_win: {
        text: 'Устав Гильдии - закон для торговцев. Моркос снижает цену до 2000, казна платит. Вы не потратили ни кредита, но заработали уважение всей колонии. Моркос шипит: "Юрист..."',
        ending: true,
        result: { credits: 975, reputation: 25, flags: { colony_hero: true }, factionRep: { traders: 3 } }
      },
      end_bylaws_compromise: {
        text: 'Моркос согласился на 2500. Казна даёт 2000, губернатор находит ещё 500 из резервов. Все довольны - и торговцы не в убытке, и колония сыта.',
        ending: true,
        result: { credits: 650, reputation: 22, flags: { colony_hero: true }, factionRep: { traders: 4 } }
      },
      end_bylaws_stubborn: {
        text: 'Моркос рискует: "Подавай жалобу. Пока Совет рассмотрит - колония вымрет." Циничный ход. Придётся искать другой путь.',
        ending: true,
        result: { reputation: -3 }
      },
      end_underground_hero: {
        text: 'Еда из подпольных каналов спасла колонию. Моркос в бешенстве - его обошли. Губернатор не спрашивает откуда продовольствие. "Мне всё равно чьи это склады. Дети едят."',
        ending: true,
        result: { credits: 1300, reputation: 28, flags: { colony_hero: true }, factionRep: { traders: -3, pirates: 3 } }
      },
      end_smuggler_saves: {
        text: 'Контрабандист привёз еду за день - бесплатно. Губернатор в шоке от скорости. Моркос в шоке от того, что его обошёл пират. "Неофициальные каналы," - улыбаетесь вы. Колония спасена, и вы не потратили ни кредита.',
        ending: true,
        result: { credits: 1625, reputation: 32, flags: { colony_hero: true }, factionRep: { pirates: 5, traders: -4 } }
      },
      end_bribe_deal: {
        text: 'Взятка сработала. Еда по сниженной цене, колония спасена. Не самый чистый метод, зато эффективный.',
        ending: true,
        result: { credits: 325, reputation: 15, flags: { colony_hero: true }, factionRep: { traders: 2 } }
      },
      end_bribe_large_deal: {
        text: 'Большая взятка решила проблему мгновенно. Моркос доволен, колония сыта, губернатор не задаёт вопросов. Все довольны - кроме вашего кошелька.',
        ending: true,
        result: { credits: 520, reputation: 20, flags: { colony_hero: true }, factionRep: { traders: 5 } }
      },
      end_warehouse_taken: {
        text: 'Охрана ушла. Склад открыт. Толпа растаскивает еду, но губернатор организовала раздачу - всем поровну. Моркос объявил вас преступником, но военные закрыли глаза. "Голодный бунт - хуже, чем один вскрытый склад."',
        ending: true,
        result: { credits: 325, reputation: 18, flags: { colony_hero: true }, factionRep: { traders: -8, military: 2 } }
      },
      end_warehouse_fight: {
        text: 'Охрана открыла огонь! Один доброволец ранен. Толпа отхлынула. Вы влетели в перестрелку - зацепило плечо. Но склад взяли. Еда распределена. Победа с привкусом крови.',
        ending: true,
        result: { credits: 195, reputation: 10, damage: 15, flags: { colony_hero: true }, factionRep: { traders: -10 } }
      },
      end_warehouse_merc_win: {
        text: 'Наёмник один разогнал охрану без единого выстрела. Склад открыт, еда раздаётся. Моркос в ярости, но спорить с профессиональным бойцом не решается. Колония спасена.',
        ending: true,
        result: { credits: 520, reputation: 22, flags: { colony_hero: true }, factionRep: { traders: -6 } }
      },
      end_threat_works: {
        text: 'Моркос сдался. Цена снижена до 2000 - казна покрывает. Вы ничего не потратили, но спасли 10000 человек. Торговцы вас запомнят.',
        ending: true,
        result: { credits: 650, reputation: 15, flags: { colony_hero: true }, factionRep: { traders: -5 } }
      },
      end_threat_backfire: {
        text: 'Моркос вызывает охрану. "Это угроза! Убирайтесь с моей палубы!" Вас выставили. Колония всё ещё голодает, а вы потеряли время и лицо.',
        ending: true,
        result: { reputation: -8, factionRep: { traders: -3 } }
      },
      end_threat_riot: {
        text: 'Толпа услышала ваши слова и поняла их буквально. Бунт! Торговцев громят, склады горят. Моркос бежит. Еда есть, но колония в руинах. Губернатор в шоке.',
        ending: true,
        result: { credits: 325, reputation: -5, damage: 8, flags: { riot_erupted: true }, factionRep: { traders: -10 } }
      },
      end_give_own_food: {
        text: 'Вы отдали свои запасы. Дети едят впервые за 2 дня. Губернатор плачет. Слухи о вашем поступке разлетятся по сектору. На площади вас провожают стоя.',
        ending: true,
        result: { credits: 520, reputation: 35, flags: { colony_hero: true } }
      },
      end_fly_for_food: {
        text: 'Вы слетали за едой и вернулись вовремя. 1500 кредитов от губернатора и благодарность всей колонии.',
        ending: true,
        result: { credits: 975, reputation: 18, flags: { colony_hero: true } }
      },
      end_merc_delivery_success: {
        text: 'Наёмник вернулся с полным грузом. Еда раздаётся по карточкам. Организация как в военном лагере. Губернатор: "Ваш человек - профессионал."',
        ending: true,
        result: { credits: 1300, reputation: 22, flags: { colony_hero: true } }
      },
      end_merc_delivery_late: {
        text: 'Наёмник вернулся, но с опозданием - нарвался на патруль. Часть еды пришлось сбросить. Хватило не на всех, но бунта удалось избежать.',
        ending: true,
        result: { credits: 650, reputation: 12 }
      },
    }
  },

  // ===== 12. ДОЛЖОК ДРЕЙКА (pirate, requires drake_freed) =====
  {
    id: 'drake_debt',
    title: 'Должок Дрейка',
    planetType: 'pirate',
    minDay: 20,
    oneTime: true,
    requires: { drake_freed: true },
    ascii: [
      '  ╔══════════════════════╗',
      '  ║  PRIVATE  MESSAGE    ║',
      '  ║  FROM: ???           ║',
      '  ║  "Помнишь меня?"    ║',
      '  ╚══════════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/drake_debt.png',
        text: 'В баре к вам подсаживается тип в капюшоне. Когда он поднимает голову - шрам через всё лицо. Дрейк. "Не дёргайся. Я пришёл с благодарностью, не с ножом."',
        ascii: [
          '  [DRAKE]',
          '    ___',
          '   |x_o| "Должок."',
          '   |===|',
          '   |   |',
        ].join('\n'),
        options: [
          { text: '> Чего хочешь?', next: 'proposal' },
          { text: '> Дрейк! Рад видеть.', next: 'drake_trusts_start', check: { flag: 'drake_trust', flagValue: true, failNext: 'proposal' } },
          { text: '> Я не хочу проблем', next: 'decline_talk' },
        ]
      },
      proposal: {
        text: 'Дрейк: "Я стал капитаном. Свой корабль, своя команда. Ты дал мне шанс - я помню. У меня есть работа. Опасная, но прибыльная. Военный конвой везёт экспериментальное оружие через Альтаир. Мои люди знают маршрут."',
        options: [
          { text: '> Сколько?', next: 'money_talk' },
          { text: '> Твоя команда меня знает', next: 'crew_trust', check: { reputation: 'pirates', min: 7, failNext: 'money_talk' } },
          { text: '> Грабить военных? Нет.', next: 'refuse_job' },
          { text: '> А что если сдать тебя?', next: 'threaten_drake' },
        ]
      },
      decline_talk: {
        text: 'Дрейк усмехается: "Расслабься. Я не кусаюсь. Больше. Просто послушай - может быть полезно."',
        options: [
          { text: '> Ладно, говори', next: 'proposal' },
          { text: '> Я ухожу', next: 'end_walk_away' },
        ]
      },
      drake_trusts_start: {
        text: 'Дрейк улыбается - непривычное зрелище на изрезанном шрамами лице. "И я рад. Ты единственный, кто реально помог. Не из выгоды." Он садится рядом, жестом отсылает громил. "У меня дело. Но сначала - ты заслуживаешь знать почему."',
        options: [
          { text: '> Слушаю', next: 'family_story' },
          { text: '> Давай сразу к делу', next: 'proposal' },
        ]
      },
      family_story: {
        img: 'quests/drake_bar.png',
        text: 'Дрейк: "Моя семья жила на Кеплере. Жена Мира, дочь Лина. Военные тестировали биооружие - Проект Зеро. Целая колония стала подопытными. Мира умерла за неделю. Лина... через две. Мне нечего было терять, когда меня посадили. Теперь я хочу уничтожить это оружие. Навсегда."',
        ascii: [
          '  [KEPLER COLONY - CLASSIFIED]',
          '  ╔════════════════════╗',
          '  ║ OUTBREAK DAY 1     ║',
          '  ║ CASUALTIES: 847    ║',
          '  ║ STATUS: COVERED UP ║',
          '  ╚════════════════════╝',
        ].join('\n'),
        options: [
          { text: '> Я помогу. Безоговорочно.', next: 'accept_brother' },
          { text: '> Расскажи план', next: 'money_talk' },
        ]
      },
      accept_brother: {
        text: 'Дрейк сжимает вашу руку. В его глазах - что-то, чего вы раньше не видели. Благодарность. Настоящая. "Ты мне как брат. Поехали."',
        options: [
          { text: '> К делу', next: 'prep_phase' },
        ]
      },
      crew_trust: {
        text: 'Один из громил Дрейка кивает: "Кэп, я видел его в Нове. Он свой." Дрейк приподнимает бровь: "Мои люди тебя знают? Тогда поговорим серьёзнее." Он жестом подзывает первого помощника.',
        options: [
          { text: '> Давай детали', next: 'crew_intel' },
        ]
      },
      crew_intel: {
        text: 'Первый помощник - Рокс, здоровый тип с кибернетической рукой - раскладывает голограмму. "Конвой через астероидное поле у Альтаира. Три корабля: два эскорта класса Коршун, транспортник Титан-IV. Слепая зона - 47 секунд при смене вахты. Транспортник: слабые щиты на корме."',
        ascii: [
          '  TACTICAL MAP:',
          '  ~~~ asteroids ~~~',
          '  [Escort-1] gap:47s [Escort-2]',
          '  ~~~~~ [TITAN-IV] ~~~~~',
          '  Weak point >>> AFT shields',
        ].join('\n'),
        options: [
          { text: '> Сколько моя доля?', next: 'money_talk' },
          { text: '> Отличный план. Я в деле.', next: 'prep_phase' },
        ]
      },
      money_talk: {
        text: '"Твоя доля - 8000 кредитов. Плюс всё что найдёшь в конвое - оставляешь себе. Мне нужно только одно: контейнер с маркировкой Проект Зеро. Не открывай его."',
        ascii: [
          '  PLAN:',
          '  You ──> intercept ──> grab [ZERO]',
          '  Drake fleet ──> distraction',
          '  Split: 8000cr + convoy loot',
        ].join('\n'),
        options: [
          { text: '> Принимаю', next: 'accept_job' },
          { text: '> Что в контейнере?', next: 'ask_container' },
          { text: '> Нет, слишком рискованно', next: 'refuse_job' },
        ]
      },
      ask_container: {
        text: 'Дрейк мрачнеет: "Не твоё дело. Серьёзно. Чем меньше знаешь - тем дольше живёшь. Берёшь работу или нет?"',
        options: [
          { text: '> Ладно, по рукам', next: 'accept_job' },
          { text: '> Без информации не работаю', next: 'demand_info' },
        ]
      },
      demand_info: {
        text: 'Дрейк долго молчит. Потом: "Биооружие. Военные разработали штамм, который может уничтожить целую колонию. Я хочу его уничтожить. У меня... свои причины."',
        options: [
          { text: '> Уничтожить оружие? Я с тобой.', next: 'accept_noble' },
          { text: '> Биооружие стоит миллионы на чёрном рынке...', next: 'accept_greedy' },
          { text: '> Слишком опасно', next: 'end_walk_away' },
        ]
      },
      accept_job: {
        text: 'Дрейк жмёт руку: "Встречаемся в Альтаире через 3 дня. Будь готов к бою." Он исчезает в толпе.',
        options: [
          { text: '> Готовиться к операции', next: 'prep_phase' },
        ]
      },
      accept_noble: {
        text: 'Дрейк смотрит удивлённо: "Не ожидал. Может, я в тебе не ошибся." Он крепко жмёт руку.',
        options: [
          { text: '> К делу', next: 'prep_phase' },
        ]
      },
      accept_greedy: {
        text: 'Дрейк сжимает кулаки. "Нет. Ты не продашь это. Или мы уничтожим его вместе, или я найду другого пилота." В его глазах - что-то личное.',
        options: [
          { text: '> Ладно, уничтожим', next: 'prep_phase' },
          { text: '> Тогда без меня', next: 'end_walk_away' },
        ]
      },
      refuse_job: {
        text: 'Дрейк кивает: "Понимаю. Без обид." Он оставляет на столе кредитный чип. "За прошлое." И уходит.',
        options: [
          { text: '> Взять чип', next: 'end_gift_only' },
        ]
      },
      threaten_drake: {
        text: 'Дрейк даже не вздрагивает. "Можешь попробовать. Но в этом баре половина - мои люди. А я пришёл с миром. Подумай ещё раз."',
        options: [
          { text: '> Ладно. Что за работа?', next: 'proposal' },
          { text: '> Уходи', next: 'end_walk_away' },
        ]
      },
      prep_phase: {
        text: 'Альтаир. Конвой появится через несколько часов. Флот Дрейка - четыре корабля - занимает позиции в астероидном поле. Рокс проверяет оружие. Время выбрать подход.',
        ascii: [
          '  ALTAIR SECTOR',
          '  Drake fleet: 4 ships [READY]',
          '  Convoy ETA: 6 hours',
          '  Your approach: ???',
        ].join('\n'),
        options: [
          { text: '> Лобовая атака', next: 'convoy_attack' },
          { text: '> Сканер: найти слепую зону', next: 'stealth_approach', check: { stat: 'scanner', value: true, failNext: 'convoy_attack' } },
          { text: '> Отдать электронику команде Дрейка', next: 'supply_crew', check: { cargo: 'electronics', min: 3, failNext: 'convoy_attack' } },
          { text: '> Тайно вызвать военных', next: 'betray_drake' },
        ]
      },
      stealth_approach: {
        text: 'Сканер находит брешь в сенсорном покрытии конвоя. Астероидное поле создаёт естественную маскировку. Вы скользите между камнями, невидимые для радаров эскорта.',
        ascii: [
          '  ~~~ * ~~~ * ~~~',
          '  ~ [YOU] ~ ~~~~',
          '  ~~~ * [E1]  [E2]',
          '  ~~~ [TITAN-IV] ~~',
          '  STEALTH: ████ ACTIVE',
        ].join('\n'),
        options: [
          { text: '> Тихая стыковка с кормы', next: 'stealth_board' },
        ]
      },
      stealth_board: {
        text: 'Идеальный заход. Транспортник даже не поднял тревогу. Вы стыкуетесь к кормовому шлюзу - щиты здесь на 40% слабее. Охрана в носовом отсеке. Контейнер "ПРОЕКТ ЗЕРО" - прямо перед вами. Холодный, тяжёлый, помеченный биохазардом.',
        options: [
          { text: '> Забрать и тихо уйти', next: 'escape_choice' },
        ]
      },
      supply_crew: {
        text: 'Вы передаёте электронику команде Дрейка. Рокс ухмыляется, разбирая компоненты: "Усилим щиты на тридцать процентов и добавим помехи на их радары. Кэп, с этим добром конвой не будет знать что его ударило."',
        options: [
          { text: '> Атакуем!', next: 'convoy_easy' },
        ]
      },
      convoy_easy: {
        text: 'Модернизированный флот Дрейка разносит эскорт за считанные минуты. Помехи ослепили их сканеры, усиленные щиты держат ответный огонь. Транспортник сдаётся без боя. Рокс по радио: "Как по маслу, кэп!"',
        options: [
          { text: '> Забрать контейнер', next: 'escape_choice' },
        ]
      },
      betray_drake: {
        text: 'Вы тайно передаёте координаты Дрейка военному патрулю на зашифрованной частоте. Через час горизонт расцветает вспышками - три военных крейсера выходят из гиперпространства и атакуют флот Дрейка. В хаосе по радио: "Предатель..." Голос Дрейка. Он знает.',
        options: [
          { text: '> Забрать контейнер пока все заняты', next: 'betray_grab', check: { stat: 'speed', min: 5, failNext: 'betray_fail' } },
          { text: '> Уйти пока можно', next: 'end_betray_flee' },
        ]
      },
      betray_grab: {
        text: 'В хаосе битвы вы проскальзываете к транспортнику. Экипаж в панике - им не до одного пилота. Контейнер Проект Зеро загружен в трюм. Военные заняты добиванием пиратов. У вас есть выбор.',
        options: [
          { text: '> Сдать контейнер военным за награду', next: 'end_military_betrayal' },
          { text: '> Оставить себе', next: 'end_betray_keep' },
        ]
      },
      betray_fail: {
        text: 'Корабль слишком медленный для такого манёвра. Перекрёстный огонь военных и пиратов рвёт пространство вокруг. Вы едва уносите ноги с пустыми руками, корпус в пробоинах.',
        options: [
          { text: '> Бежать!', next: 'end_betray_flee' },
        ]
      },
      convoy_attack: {
        text: 'Альтаир. Конвой из трёх кораблей. Дрейк атакует с фланга, отвлекая эскорт. Ваша цель - транспортник с контейнером.',
        ascii: [
          '  DRAKE >>>  [escort1] [escort2]',
          '              \\       /',
          '          [===TRANSPORT===]',
          '              ^',
          '             YOU',
        ].join('\n'),
        options: [
          { text: '> Атаковать транспортник!', next: 'board_transport', check: { stat: 'attack', min: 12, failNext: 'hard_fight' } },
          { text: '> Выждать момент', next: 'wait_opening', check: { stat: 'speed', min: 5, failNext: 'hard_fight' } },
        ]
      },
      hard_fight: {
        text: 'Эскорт оказался сильнее! Ваш корабль получает тяжёлые повреждения прежде чем Дрейк оттягивает огонь. Вы всё же добираетесь до транспортника.',
        options: [
          { text: '> Забрать контейнер', next: 'got_container_damaged' },
        ]
      },
      board_transport: {
        text: 'Чистый заход! Транспортник не успевает среагировать. Вы стыкуетесь и находите контейнер с маркировкой "ПРОЕКТ ЗЕРО". Он тяжёлый и холодный.',
        options: [
          { text: '> Забрать и отступать', next: 'escape_choice' },
        ]
      },
      wait_opening: {
        text: 'Ваш корабль быстрее эскорта. Вы проскальзываете мимо, пока Дрейк держит их огонь. Стыковка с транспортником - чисто.',
        options: [
          { text: '> Забрать контейнер', next: 'escape_choice' },
        ]
      },
      got_container_damaged: {
        text: 'Контейнер в руках, но корабль дымится. Дрейк по радио: "Уходим! Встреча у Ригеля!"',
        options: [
          { text: '> К Ригелю!', next: 'final_choice' },
        ]
      },
      escape_choice: {
        text: 'Контейнер на борту. Дрейк по радио: "Отлично! Встречаемся у Ригеля." Военные вызывают подкрепление - нужно уходить.',
        options: [
          { text: '> К Ригелю', next: 'final_choice' },
          { text: '> Открыть контейнер', next: 'open_container' },
        ]
      },
      open_container: {
        text: 'Внутри - десятки ампул с чёрной жидкостью. Сканер показывает: "Биологический агент класса Омега. Летальность 99.7%. Инкубационный период: 48 часов." На дне - документы: планы массового применения.',
        ascii: [
          '  ┌─────────────────────┐',
          '  │ PROJECT ZERO        │',
          '  │ CLASS: OMEGA        │',
          '  │ LETHALITY: 99.7%    │',
          '  │ STATUS: ACTIVE      │',
          '  └─────────────────────┘',
        ].join('\n'),
        options: [
          { text: '> К Дрейку. Это нужно уничтожить.', next: 'final_choice' },
          { text: '> Это стоит целое состояние...', next: 'final_choice_greedy' },
        ]
      },
      final_choice: {
        text: 'Ригель. Дрейк ждёт на заброшенной станции. "Отдай контейнер. Я сброшу его в звезду." Он протягивает кредитный чип: "Твои 8000, как обещал."',
        options: [
          { text: '> Брат. Уничтожим это вместе.', next: 'end_brother', check: { flag: 'drake_trust', flagValue: true, failNext: 'end_destroy_weapon' } },
          { text: '> Отдать контейнер', next: 'end_destroy_weapon' },
          { text: '> Я уничтожу сам', next: 'end_destroy_self' },
          { text: '> Дрейк, мне нужно больше', next: 'end_squeeze_drake' },
          { text: '> Уничтожить. Твоя команда заслужила бонус.', next: 'end_supply_bonus', check: { cargo: 'electronics', min: 1, failNext: 'end_destroy_weapon' } },
          { text: '> Передумал. Я оставляю контейнер.', next: 'end_keep_weapon' },
        ]
      },
      final_choice_greedy: {
        text: 'Ригель. Дрейк ждёт. Вы знаете, что у вас в руках. Биооружие, которое стоит сотни тысяч на чёрном рынке. Или - уничтожение.',
        options: [
          { text: '> Продать на чёрном рынке', next: 'end_sell_weapon' },
          { text: '> Нет... отдать Дрейку. Уничтожить.', next: 'end_destroy_weapon' },
          { text: '> Сдать военным за вознаграждение', next: 'end_return_military' },
        ]
      },
      // === ENDINGS ===
      end_walk_away: {
        text: 'Вы ушли. Дрейк справится сам... или нет. Не ваша проблема.',
        ending: true,
        result: { flags: { drake_refused: true } }
      },
      end_gift_only: {
        text: 'На чипе 2000 кредитов. Дрейк платит долги.',
        ending: true,
        result: { credits: 1300, flags: { drake_refused: true } }
      },
      end_destroy_weapon: {
        text: 'Дрейк забирает контейнер. На следующий день с орбиты Ригеля виден яркий всплеск - контейнер в звезде. Дрейк по радио: "Спасибо. Они убили этим мою семью на Кеплере. Теперь никто другой не пострадает." 8000 кредитов. И чистая совесть.',
        ending: true,
        result: { credits: 5200, reputation: 15, flags: { project_zero_destroyed: true, drake_ally: true } }
      },
      end_destroy_self: {
        text: 'Вы лично сбрасываете контейнер в звезду Ригеля. Дрейк смотрит молча. Потом кивает: "Ты лучше, чем я думал." Кредиты, рукопожатие, и молчаливое уважение убийцы.',
        ending: true,
        result: { credits: 5200, reputation: 20, flags: { project_zero_destroyed: true, drake_ally: true } }
      },
      end_squeeze_drake: {
        text: 'Дрейк темнеет лицом. "Я предложил честную долю." Пауза. "12000. Финальное предложение." Он не шутит.',
        ending: true,
        result: { credits: 7800, reputation: -5, flags: { project_zero_destroyed: true, drake_uneasy: true } }
      },
      end_keep_weapon: {
        text: 'Дрейк хватается за оружие: "Отдай. Контейнер. Сейчас." Вы быстрее - рывок к кораблю, прыжок! Но теперь у вас биооружие... и злой Дрейк, который будет вас искать.',
        ending: true,
        result: { credits: 0, damage: 15, flags: { has_bioweapon: true, drake_enemy: true }, factionRep: { pirates: -25 } }
      },
      end_sell_weapon: {
        text: 'Чёрный рынок Новы. Покупатель в маске не задаёт вопросов. 25000 кредитов. Чистые. А через месяц в новостях: "Эпидемия неизвестного происхождения на Кеплере. Тысячи жертв." Это вы.',
        ending: true,
        result: { credits: 16250, reputation: -30, flags: { sold_bioweapon: true, drake_enemy: true, kepler_plague: true }, factionRep: { scientists: -40, traders: -20 } }
      },
      end_return_military: {
        text: 'Военные в шоке что проект утёк. Благодарны за возврат. 5000 кредитов "и забудьте что видели". Дрейк узнает. Он не простит.',
        ending: true,
        result: { credits: 3250, flags: { returned_bioweapon: true, drake_enemy: true }, factionRep: { military: 30, pirates: -20 } }
      },
      end_brother: {
        text: 'Вы вместе стоите у обзорного окна станции Ригель, глядя как контейнер падает в звезду. Яркая вспышка - и Проекта Зеро больше нет. Дрейк: "За Миру. За Лину." Долгое молчание. Потом он поворачивается: "Брат. Мой дом - твой дом. Мои люди - твои люди. Всегда." 10000 кредитов. И кое-что дороже денег.',
        ending: true,
        result: { credits: 6500, reputation: 25, flags: { project_zero_destroyed: true, drake_brother: true, drake_ally: true }, factionRep: { pirates: 15, military: -10 } }
      },
      end_supply_bonus: {
        text: 'Благодаря вашей электронике операция прошла без единой потери. Дрейк добавляет бонус: "За снабжение - отдельная благодарность." Контейнер летит в звезду Ригеля. Совесть чиста, карманы полны, а Рокс уже спрашивает когда следующая операция.',
        ending: true,
        result: { credits: 6500, reputation: 20, flags: { project_zero_destroyed: true, drake_ally: true }, factionRep: { pirates: 12 }, cargoLost: 'electronics' }
      },
      end_military_betrayal: {
        text: 'Военные благодарят за сдачу пиратского капитана и возврат Проекта Зеро. 15000 кредитов награды. Генерал жмёт руку: "Империя помнит верных." Но через неделю в баре шёпот: "Дрейк выжил. Сбежал при конвоировании. И он знает, кто его сдал." Спите крепко, пилот.',
        ending: true,
        result: { credits: 9750, reputation: -20, flags: { drake_enemy: true, returned_bioweapon: true }, factionRep: { military: 30, pirates: -30 } }
      },
      end_betray_keep: {
        text: 'Контейнер с биооружием класса Омега в вашем трюме. Дрейк в руках военных - или сбежал. Военные ищут пропавшее оружие. Пираты ищут предателя. Все ищут вас. Зато потенциально - самый богатый человек в секторе.',
        ending: true,
        result: { damage: 5, flags: { has_bioweapon: true, drake_enemy: true }, factionRep: { military: -15, pirates: -25 } }
      },
      end_betray_flee: {
        text: 'Вы вырываетесь из зоны боя на форсаже. За спиной - взрывы, крики по радио, хаос. Дрейк арестован или мёртв. Контейнер достался военным. Никакой награды, зато никаких обязательств. Только плохой сон по ночам.',
        ending: true,
        result: { reputation: -10, damage: 10, flags: { drake_enemy: true }, factionRep: { pirates: -15 } }
      },
    }
  },

  // ===== 13. МЕСТЬ ДРЕЙКА (pirate, requires drake_betrayed) =====
  {
    id: 'drake_revenge',
    title: 'Месть Дрейка',
    planetType: 'pirate',
    minDay: 18,
    oneTime: true,
    requires: { drake_betrayed: true },
    ascii: [
      '  ╔══════════════════════╗',
      '  ║  ⚠ INCOMING SIGNAL  ║',
      '  ║  "Я тебя нашёл."   ║',
      '  ╚══════════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        text: 'Вы садитесь в баре, и вдруг все замолкают. За вашим столом - двое громил. Из тени выходит человек со шрамом. Дрейк. "Ты взял мои координаты и оставил гнить в камере. Это было ошибкой."',
        ascii: [
          '  [DRAKE]     [THUG1]  [THUG2]',
          '    ___        ___      ___',
          '   |x_x|      |°°|    |°°|',
          '   |===|      |==|    |==|',
          '   "Ошибкой."',
        ].join('\n'),
        options: [
          { text: '> Мой наёмник думает иначе', next: 'merc_standoff', check: { mercenary: true, failNext: 'offer_money' } },
          { text: '> Я чемпион арены, Дрейк.', next: 'arena_recognition', check: { flag: 'arena_champion', flagValue: true, failNext: 'offer_money' } },
          { text: '> Я могу заплатить', next: 'offer_money' },
          { text: '> Попробуй, возьми', next: 'fight_offer', check: { stat: 'attack', min: 15, failNext: 'overwhelmed' } },
          { text: '> У меня есть информация для тебя', next: 'offer_info' },
        ]
      },
      offer_money: {
        text: 'Дрейк: "Деньги? Сколько стоит год в камере, по-твоему?" Он наклоняется ближе. "5000. И ты делаешь для меня работу. Бесплатно."',
        options: [
          { text: '> 5000 и работа? По рукам.', next: 'end_pay_and_work', cost: { credits: 3250 } },
          { text: '> 3000 сейчас, остальное потом', next: 'partial_pay', cost: { credits: 1950 } },
          { text: '> У меня тут свои люди', next: 'pirate_allies', check: { reputation: 'pirates', min: 7, failNext: 'negotiate' } },
          { text: '> 3000, без работы', next: 'negotiate' },
          { text: '> Пошёл ты', next: 'overwhelmed' },
        ]
      },
      negotiate: {
        text: 'Дрейк смеётся. Громилы - нет. "Ты не в позиции торговаться, пилот."',
        options: [
          { text: '> Ладно, 5000 и работа', next: 'end_pay_and_work', cost: { credits: 3250 } },
          { text: '> Тогда дерись', next: 'fight_offer', check: { stat: 'attack', min: 15, failNext: 'overwhelmed' } },
        ]
      },
      offer_info: {
        text: 'Дрейк приподнимает бровь: "Какая информация?"',
        options: [
          { text: '> Маршруты военных конвоев (scanner)', next: 'info_scanner', check: { stat: 'scanner', value: true, failNext: 'info_bluff' } },
          { text: '> Я знаю где лаборатория Омега', next: 'info_lab', check: { flag: 'lab_data_sold', flagValue: true, failNext: 'info_bluff' } },
          { text: '> Блефую', next: 'info_bluff' },
        ]
      },
      info_scanner: {
        text: 'Вы показываете данные сканера - маршруты, расписания, слепые зоны патрулей. Дрейк изучает, и впервые за разговор улыбается. "Это стоит больше чем 5000. Мы в расчёте."',
        options: [
          { text: '> Забыли?', next: 'end_info_trade' },
        ]
      },
      info_lab: {
        text: 'Дрейк знает про лабораторию Омега. "Образцы мутагена стоят целое состояние. Если данные настоящие..." Он проверяет. Кивает. "Мы квиты. И может быть, ещё поработаем вместе."',
        options: [
          { text: '> Рад что мы договорились', next: 'end_lab_trade' },
        ]
      },
      info_bluff: {
        text: 'Дрейк смотрит вам в глаза. Долго. "Ты врёшь." Громилы встают.',
        options: [
          { text: '> Ладно, плачу 5000', next: 'end_pay_and_work', cost: { credits: 3250 } },
          { text: '> Драка!', next: 'overwhelmed' },
        ]
      },
      fight_offer: {
        text: 'Вы опрокидываете стол! Первый громила получает стулом по голове. Второй замешкался. Дрейк отступает - он не боец, он мозг. "Стой! Может, мы договоримся по-другому."',
        options: [
          { text: '> Говори быстро', next: 'end_respect' },
          { text: '> Добить', next: 'end_fight_drake' },
        ]
      },
      overwhelmed: {
        text: 'Их трое, вы один. Бар не на вашей стороне. Через минуту вы на полу, без кошелька и с разбитым лицом.',
        options: [
          { text: '> ...', next: 'end_beaten' },
        ]
      },
      merc_standoff: {
        text: 'Ваш наёмник встаёт из-за соседнего стола, демонстративно щёлкая предохранителем. Громилы Дрейка замирают. Бар напрягается. Дрейк медленно поднимает руки: "Тихо, тихо. Я пришёл поговорить, не воевать."',
        ascii: [
          '  [MERC] >>> [THUG1] [THUG2]',
          '   __|__     freeze!  freeze!',
          '  |¤¤¤¤|',
          '  "Стоять."',
        ].join('\n'),
        options: [
          { text: '> Тогда говори нормально', next: 'civilized_talk' },
          { text: '> Убирайся', next: 'end_merc_truce' },
        ]
      },
      civilized_talk: {
        text: 'Дрейк отсылает громил к барной стойке. Садится напротив, руки на столе. "Ладно. Без угроз. Ты мне должен - год в камере. Но я не дурак. Может, есть вариант, который устроит обоих?"',
        options: [
          { text: '> Партнёрство вместо вражды?', next: 'drake_partnership' },
          { text: '> 3000 и мы квиты', next: 'end_civilized_pay', cost: { credits: 1950 } },
          { text: '> У меня есть информация', next: 'offer_info' },
        ]
      },
      arena_recognition: {
        text: 'Один из громил хватает Дрейка за рукав: "Кэп, это же... чемпион арены. Тот самый." Дрейк прищуривается, оценивая вас заново. "Хм. Значит, ты не просто пилот." Атмосфера меняется - из угрозы в уважение.',
        options: [
          { text: '> Скидка за репутацию', next: 'arena_deal' },
          { text: '> Решим это в ринге', next: 'arena_fight' },
          { text: '> Чемпион подземки тоже', next: 'underground_flex', check: { flag: 'underground_champion', flagValue: true, failNext: 'arena_deal' } },
        ]
      },
      arena_deal: {
        text: 'Дрейк: "Чемпион арены заслуживает уважения. 3000 вместо пяти - и забудем. Без работы, без обязательств."',
        options: [
          { text: '> По рукам', next: 'end_arena_discount', cost: { credits: 1950 } },
          { text: '> Или партнёрство', next: 'drake_partnership' },
        ]
      },
      underground_flex: {
        text: 'Дрейк аж присвистывает: "Подземный турнир тоже? Серьёзный боец." Он поворачивается к громилам: "Парни, мы не хотим проблем с этим." Назад к вам: "Знаешь что? Ты мне нужен не как должник. Ты мне нужен как партнёр."',
        options: [
          { text: '> Интересно. Говори.', next: 'drake_partnership' },
          { text: '> Просто скинь долг', next: 'end_legend_walk' },
        ]
      },
      arena_fight: {
        text: 'Дрейк ухмыляется: "В ринге? Мне нравится. Мой лучший боец - Кувалда. 140 кило чистых мышц. Выиграешь - мы квиты. Проиграешь - платишь вдвойне."',
        ascii: [
          '  [THE RING]',
          '  ┌─────────────┐',
          '  │  YOU vs      │',
          '  │  КУВАЛДА     │',
          '  │  140kg       │',
          '  └─────────────┘',
        ].join('\n'),
        options: [
          { text: '> Принимаю!', next: 'end_arena_settled', check: { stat: 'attack', min: 12, failNext: 'end_arena_lost' } },
          { text: '> Лучше заплачу', next: 'arena_deal' },
        ]
      },
      pirate_allies: {
        text: 'Вы окидываете бар взглядом и слегка киваете. Трое завсегдатаев встают со своих мест. Ещё двое у стойки поворачиваются. Громилы Дрейка оглядываются и бледнеют. Дрейк медленно считает: "Один... три... пять. Понятно."',
        options: [
          { text: '> Теперь поговорим как равные', next: 'drake_outnumbered' },
        ]
      },
      drake_outnumbered: {
        text: 'Дрейк отпускает громил. "Ладно. Ты не простой торгаш, я вижу. Может, нам не стоит быть врагами. У меня есть предложение получше, чем драка."',
        options: [
          { text: '> Слушаю', next: 'drake_partnership' },
          { text: '> Просто уходи, Дрейк', next: 'end_pirate_backed' },
        ]
      },
      partial_pay: {
        text: 'Дрейк считает кредиты. "Три из пяти. Ты серьёзно?" Пауза. "Ладно. Но ты должен ещё две. И я добавляю проценты. 2500 через месяц. Или..." Он наклоняется ближе. "Или одна работа. Без оплаты."',
        options: [
          { text: '> Работа. Какая?', next: 'end_partial_work' },
          { text: '> 2500 через месяц. Идёт.', next: 'end_partial_payment' },
          { text: '> Может, партнёрство?', next: 'drake_partnership' },
        ]
      },
      drake_partnership: {
        text: 'Дрейк откидывается назад, задумчиво: "Партнёрство... Я капитан, у меня команда и маршруты. Ты - пилот с кораблём и контактами. Вместо того чтобы гасить друг друга, мы можем зарабатывать. 70-30 с каждого дела, мои маршруты, твой корабль. Долг списан. Что скажешь?"',
        ascii: [
          '  PARTNERSHIP DEAL:',
          '  Drake: routes + crew',
          '  You: ship + contacts',
          '  Split: 70/30 (you/Drake)',
          '  Debt: CANCELLED',
        ].join('\n'),
        options: [
          { text: '> По рукам, партнёр', next: 'end_partner_deal' },
          { text: '> 60-40 или никак', next: 'end_partner_haggle' },
          { text: '> Нет. Просто забудем друг друга.', next: 'end_walk_apart' },
        ]
      },
      // === ENDINGS ===
      end_pay_and_work: {
        text: 'Дрейк забирает деньги. "Ты мне должен одну работу. Я найду тебя, когда придёт время." Он исчезает. 5000 легче, но живой.',
        ending: true,
        result: { flags: { drake_debt_paid: true, owes_drake: true } }
      },
      end_info_trade: {
        text: 'Информация за свободу. Дрейк уходит довольный. Вы уходите целый. Не лучшая сделка, но и не худшая.',
        ending: true,
        result: { reputation: 5, flags: { drake_debt_paid: true } }
      },
      end_lab_trade: {
        text: 'Данные лаборатории оказались достаточной платой. Дрейк кивает: "Без обид. Бизнес." Может, ещё встретитесь.',
        ending: true,
        result: { reputation: 5, flags: { drake_debt_paid: true, drake_neutral: true } }
      },
      end_respect: {
        text: 'Дрейк: "Ты крепкий. Мне нужны такие. Забудем прошлое - работай на меня. 3000 аванс." Неожиданный поворот.',
        ending: true,
        result: { credits: 1950, reputation: 10, flags: { drake_debt_paid: true, drake_employer: true } }
      },
      end_fight_drake: {
        text: 'Вы вырубаете Дрейка и его людей. Бар в шоке. Вы уходите, но теперь вы враг пиратского капитана. Он вернётся.',
        ending: true,
        result: { reputation: -10, damage: 10, flags: { drake_defeated_again: true }, factionRep: { pirates: -15 } }
      },
      end_beaten: {
        text: 'Вас ограбили. 3000 кредитов, модуль повреждён. Дрейк сказал: "Теперь мы квиты." Дёшево отделались.',
        ending: true,
        result: { credits: -3000, damage: 20, flags: { drake_debt_paid: true } }
      },
      end_merc_truce: {
        text: 'Дрейк уходит, бросая через плечо: "Наёмники не вечны, пилот." Но сегодня - вы в безопасности. Долг не погашен, но Дрейк знает: с вами лучше разговаривать, чем драться.',
        ending: true,
        result: { reputation: 5, flags: { drake_debt_paid: false, drake_wary: true } }
      },
      end_civilized_pay: {
        text: 'Дрейк берёт 3000. "Меньше чем я хотел. Но ты показал характер." Рукопожатие. Не дружеское, но уважительное. "Без обид. Бизнес."',
        ending: true,
        result: { flags: { drake_debt_paid: true }, factionRep: { pirates: 5 } }
      },
      end_arena_discount: {
        text: 'Дрейк забирает 3000 и кивает: "Чемпионская скидка." Громилы провожают вас взглядами, но без злобы. В мире пиратов бойцов уважают.',
        ending: true,
        result: { reputation: 5, flags: { drake_debt_paid: true }, factionRep: { pirates: 5 } }
      },
      end_arena_settled: {
        text: 'Кувалда рухнул на третьем раунде. Бар взрывается. Дрейк хлопает в ладоши: "Впечатляет. Долг закрыт - ты его отработал кулаками." Он протягивает кружку пива. "За достойного противника." 1000 кредитов призовых от ставок.',
        ending: true,
        result: { credits: 650, reputation: 15, flags: { drake_debt_paid: true }, factionRep: { pirates: 10 } }
      },
      end_arena_lost: {
        text: 'Кувалда оказался сильнее. Вы на полу ринга, бар хохочет. Дрейк подходит: "Хорошая попытка. Но долг удваивается." Забирает 6000 кредитов. Больно, но в живых.',
        ending: true,
        result: { credits: -6000, damage: 15, reputation: -5, flags: { drake_debt_paid: true, drake_humiliated: true } }
      },
      end_legend_walk: {
        text: 'Дрейк поднимает руки: "Чемпион арены и подземки? Мне не нужны такие враги. Долг списан. Уходи." Бар расступается перед вами. Легенда.',
        ending: true,
        result: { reputation: 20, flags: { drake_debt_paid: true }, factionRep: { pirates: 15 } }
      },
      end_pirate_backed: {
        text: 'Дрейк уходит с пустыми руками. Ваши люди провожают его до двери. Он оглядывается: "Ладно. Ты выиграл этот раунд." Долг не оплачен, но и Дрейк бессилен что-то сделать.',
        ending: true,
        result: { reputation: 10, flags: { drake_debt_paid: false, drake_backed_down: true }, factionRep: { pirates: 5 } }
      },
      end_partial_payment: {
        text: 'Дрейк прячет 3000. "2500 через месяц. Я найду тебя." Хмурый кивок - и он уходит. Не враг, не друг. Кредитор.',
        ending: true,
        result: { flags: { drake_debt_paid: false, owes_drake_favor: true } }
      },
      end_partial_work: {
        text: 'Дрейк: "Есть конвой через Альтаир. Мне нужен пилот на разведку. Один рейс - и мы квиты." Рукопожатие. Ненадёжное, но конкретное.',
        ending: true,
        result: { flags: { drake_debt_paid: true, owes_drake_favor: true }, factionRep: { pirates: 3 } }
      },
      end_partner_deal: {
        text: 'Рукопожатие. Крепкое. Дрейк: "70-30, мои маршруты, твой корабль. Долг списан. Первое дело - через неделю, я свяжусь." Он улыбается шрамом через лицо. Из врага - в делового партнёра.',
        ending: true,
        result: { credits: 1300, reputation: 10, flags: { drake_debt_paid: true, drake_partner: true }, factionRep: { pirates: 10 } }
      },
      end_partner_haggle: {
        text: 'Дрейк скрипит зубами, но кивает: "60-40. Жадный ублюдок." Но жмёт руку. Долг закрыт, партнёрство начато. На ваших условиях.',
        ending: true,
        result: { credits: 1300, reputation: 5, flags: { drake_debt_paid: true, drake_partner: true }, factionRep: { pirates: 5 } }
      },
      end_walk_apart: {
        text: 'Дрейк долго смотрит. Потом кивает. "Ладно. Забудем. Но если встретимся снова - я не буду таким добрым." Он исчезает в толпе. Долг не закрыт, но и не висит. Просто - тишина.',
        ending: true,
        result: { flags: { drake_debt_paid: false, drake_neutral: true }, factionRep: { pirates: -3 } }
      },
    }
  },

  // ===== 15. СРОЧНАЯ ДОСТАВКА (trade, timed) =====
  {
    id: 'urgent_delivery',
    title: 'Срочная доставка',
    planetType: 'trade',
    galaxy: 'milkyway',
    minDay: 8,
    oneTime: false,
    ascii: [
      '  ┌──────────────────┐',
      '  │ PRIORITY COURIER  │',
      '  │ ████████████████  │',
      '  │ FRAGILE ◊ URGENT  │',
      '  │ DELIVER IN 5 DAYS │',
      '  └──────────────────┘',
    ].join('\n'),
    nodes: {
      start: {
        text: 'Диспетчер станции машет рукой: "Есть срочный заказ. Контейнер с медикаментами для Центавры. Оплата 2500 кр по доставке. Но есть нюанс - у тебя 5 дней. После этого препараты испортятся, и заказчик выставит неустойку."',
        ascii: [
          '  > CONTRACT #7741',
          '  > DEST: CENTAURI',
          '  > DEADLINE: 5 DAYS',
          '  > REWARD: 2500 CR',
        ].join('\n'),
        options: [
          { text: '> Берусь', next: 'accept' },
          { text: '> Сколько за срочность?', next: 'negotiate' },
          { text: '> Не моя проблема', next: 'end_refuse' },
        ]
      },
      negotiate: {
        text: 'Диспетчер хмурится: "Ладно, 3000 кр. Но не дня больше. Контракт с неустойкой - опоздаешь, заплатишь 1500 из своего кармана. Ну?"',
        options: [
          { text: '> По рукам, 3000', next: 'accept_premium' },
          { text: '> Всё равно не интересно', next: 'end_refuse' },
        ]
      },
      accept: {
        text: 'Контейнер загружен в трюм. Таймер пошёл. 5 дней до Центавры - это реально, если не застревать.',
        ending: true,
        result: {
          timer: { id: 'urgent_delivery', days: 5, name: 'Доставка: Центавра', targetSystem: 'centauri', onExpire: { credits: -1000, flags: { delivery_failed: true }, factionRep: { traders: -5 } } },
          flags: { delivery_active: true, delivery_reward: 2500 }
        }
      },
      accept_premium: {
        text: 'Контейнер загружен. 3000 на кону, но и неустойка выше. Не подведи.',
        ending: true,
        result: {
          timer: { id: 'urgent_delivery', days: 5, name: 'Доставка: Центавра', targetSystem: 'centauri', onExpire: { credits: -1500, flags: { delivery_failed: true }, factionRep: { traders: -8 } } },
          flags: { delivery_active: true, delivery_reward: 3000 }
        }
      },
      end_refuse: {
        text: 'Диспетчер пожимает плечами. "Найду другого." Может, и к лучшему.',
        ending: true,
        result: {}
      },
    }
  },

  // ===== 16. ДОСТАВКА - ЗАВЕРШЕНИЕ (centauri, timed continuation) =====
  {
    id: 'urgent_delivery_complete',
    title: 'Пункт доставки',
    systemId: 'centauri',
    minDay: 1,
    oneTime: false,
    requires: { delivery_active: true },
    ascii: [
      '  ┌──────────────────┐',
      '  │ CENTAURI DOCK     │',
      '  │ RECEIVING BAY 04  │',
      '  │ ◊ PACKAGE READY   │',
      '  └──────────────────┘',
    ].join('\n'),
    nodes: {
      start: {
        text: 'Док Центавры. Приёмщик сверяет маркировку контейнера. "Медикаменты? Да, ждём."',
        options: [
          { text: '> Вот ваш груз', next: 'deliver', check: { stat: 'timer', timerId: 'urgent_delivery', failNext: 'too_late' } },
        ]
      },
      deliver: {
        text: 'Приёмщик проверяет контейнер. "Всё в порядке, температурный режим соблюдён. Перевожу оплату."',
        options: [
          { text: '> Забрать деньги', next: 'end_success' },
          { text: '> Спросить про другие заказы', next: 'end_success_info' },
        ]
      },
      too_late: {
        text: 'Приёмщик качает головой: "Таймер уже вышел, система зафиксировала просрочку. Неустойка списана автоматически. Можете оставить контейнер, но оплаты не будет."',
        ending: true,
        result: { completeTimer: 'urgent_delivery', flags: { delivery_active: false } }
      },
      end_success: {
        text: 'Кредиты поступили на счёт. Чистая работа, без задержек.',
        ending: true,
        result: { credits: 1625, reputation: 5, completeTimer: 'urgent_delivery', flags: { delivery_active: false, delivery_completed: true }, factionRep: { traders: 3 } }
      },
      end_success_info: {
        text: 'Приёмщик: "Периодически бывают срочные заказы. Заходи на любую торговую станцию - диспетчер подскажет." Кредиты на счету.',
        ending: true,
        result: { credits: 1625, reputation: 5, completeTimer: 'urgent_delivery', flags: { delivery_active: false, delivery_completed: true }, factionRep: { traders: 5 } }
      },
    }
  },

  // ===== 17. СИГНАЛ БЕДСТВИЯ (military, timed) =====
  {
    id: 'distress_signal',
    title: 'Сигнал бедствия',
    planetType: 'military',
    galaxy: 'milkyway',
    minDay: 12,
    oneTime: true,
    ascii: [
      '  ╔══════════════════╗',
      '  ║  ◊ SOS ◊ SOS ◊   ║',
      '  ║  FREQ: 121.5 MHz  ║',
      '  ║  SOURCE: UNKNOWN   ║',
      '  ║  SIGNAL FADING...  ║',
      '  ╚══════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/distress_signal.png',
        text: 'Военный связист перехватывает ваш сигнал: "Пилот, у нас ситуация. Научное судно терпит бедствие в секторе Денеб. Экипаж 6 человек, система жизнеобеспечения на 6 дней. Военные корабли заняты на границе. Заплатим 2000 кр за спасение."',
        ascii: [
          '  > DISTRESS BEACON ACTIVE',
          '  > LIFE SUPPORT: 6 DAYS',
          '  > CREW: 6 SOULS',
          '  > LOCATION: DENEB SECTOR',
        ].join('\n'),
        options: [
          { text: '> Лечу на помощь', next: 'accept_rescue' },
          { text: '> За 2000? Мало за такой риск', next: 'haggle' },
          { text: '> Пусть военные разбираются', next: 'end_ignore' },
        ]
      },
      haggle: {
        text: 'Связист: "3500. Больше не могу - это не боевая операция, бюджет ограничен. Но если вытащите их - военное командование запомнит."',
        options: [
          { text: '> Годится. Координаты?', next: 'accept_premium_rescue' },
          { text: '> Нет, рисковано', next: 'end_ignore' },
        ]
      },
      accept_rescue: {
        text: 'Координаты загружены. Научное судно "Гиперион" дрейфует возле Денеба. 6 дней - потом воздух кончится. Поторопись.',
        ending: true,
        result: {
          timer: { id: 'distress_rescue', days: 6, name: 'SOS: Гиперион', targetSystem: 'deneb', onExpire: { flags: { hyperion_crew_dead: true }, factionRep: { military: -10, scientists: -10 } } },
          flags: { rescue_active: true, rescue_reward: 2000 }
        }
      },
      accept_premium_rescue: {
        text: 'Координаты загружены. 3500 кр на кону. "Гиперион" ждёт у Денеба. 6 дней - не затягивай.',
        ending: true,
        result: {
          timer: { id: 'distress_rescue', days: 6, name: 'SOS: Гиперион', targetSystem: 'deneb', onExpire: { flags: { hyperion_crew_dead: true }, factionRep: { military: -10, scientists: -10 } } },
          flags: { rescue_active: true, rescue_reward: 3500 }
        }
      },
      end_ignore: {
        text: 'Вы отключаете частоту. Чужие проблемы. Связист бросает: "Надеюсь, ты никогда не окажешься на их месте."',
        ending: true,
        result: { reputation: -3 }
      },
    }
  },

  // ===== 18. СПАСЕНИЕ ГИПЕРИОНА (deneb, timed continuation) =====
  {
    id: 'hyperion_rescue',
    title: 'Судно "Гиперион"',
    systemId: 'deneb',
    minDay: 1,
    oneTime: true,
    requires: { rescue_active: true },
    excludeIf: { hyperion_crew_dead: true },
    ascii: [
      '  ┌─────────────────────┐',
      '  │ ◊ HYPERION ◊        │',
      '  │ RESEARCH VESSEL     │',
      '  │ HULL: CRITICAL      │',
      '  │ POWER: ██░░░░ 28%   │',
      '  │ O2: ███░░░░░ 31%    │',
      '  └─────────────────────┘',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/hyperion_rescue.png',
        text: 'Судно "Гиперион" висит в пустоте. Корпус пробит микрометеоритами, двигатели мертвы. Слабый сигнал из рубки.',
        options: [
          { text: '> Стыковаться', next: 'dock', check: { stat: 'timer', timerId: 'distress_rescue', failNext: 'too_late' } },
        ]
      },
      dock: {
        text: 'Стыковка. Воздух внутри спёртый, холодный. Экипаж жив - бледные, измотанные, но дышат. Капитан Вэнс хрипит: "Наконец-то... Мы уже считали минуты."',
        options: [
          { text: '> Грузитесь, увожу вас', next: 'evacuate' },
          { text: '> Что случилось?', next: 'story' },
        ]
      },
      too_late: {
        text: 'Тишина в эфире. Судно тёмное, холодное. Вы стыкуетесь и находите... Слишком поздно. Кислород кончился.',
        ending: true,
        result: { reputation: -5, completeTimer: 'distress_rescue', flags: { rescue_active: false, hyperion_crew_dead: true } }
      },
      story: {
        text: 'Вэнс: "Исследовали аномалию. Что-то... вышло из неё. Ударило по двигателям и системе навигации. Мы дрейфовали три дня, пока не поймали ваш ответный сигнал." Он протягивает контейнер: "Данные аномалии. Стоят целое состояние."',
        options: [
          { text: '> Забрать данные и экипаж', next: 'end_rescue_data' },
          { text: '> Только экипаж, данные ваши', next: 'end_rescue_noble' },
        ]
      },
      evacuate: {
        text: 'Экипаж перебирается на ваш борт. Тесно, но все живы. Капитан Вэнс жмёт руку: "Мы у тебя в долгу, пилот."',
        ending: true,
        result: { credits: 1300, reputation: 15, completeTimer: 'distress_rescue', flags: { rescue_active: false, hyperion_saved: true }, factionRep: { military: 8, scientists: 5 } }
      },
      end_rescue_data: {
        text: 'Данные аномалии - бесценны для учёных. Вэнс не в восторге, но жизнь дороже. Все на борту, курс домой.',
        ending: true,
        result: { credits: 1300, reputation: 10, completeTimer: 'distress_rescue', flags: { rescue_active: false, hyperion_saved: true, anomaly_data: true }, factionRep: { military: 5, scientists: -3 } }
      },
      end_rescue_noble: {
        text: 'Вэнс смотрит с уважением: "Не часто встретишь такого в космосе." Он обещает упомянуть вас в рапорте командованию. Все живы, и это главное.',
        ending: true,
        result: { credits: 1300, reputation: 20, completeTimer: 'distress_rescue', flags: { rescue_active: false, hyperion_saved: true }, factionRep: { military: 10, scientists: 10 } }
      },
    }
  },

  // ===== 19. ГОРЯЧИЙ ГРУЗ (pirate, timed) =====
  {
    id: 'hot_cargo',
    title: 'Горячий груз',
    planetType: 'pirate',
    galaxy: 'milkyway',
    minDay: 10,
    oneTime: false,
    ascii: [
      '  ╔═══════════════════╗',
      '  ║ ☠ CONFIDENTIAL ☠  ║',
      '  ║ DO NOT SCAN       ║',
      '  ║ DO NOT OPEN       ║',
      '  ║ DELIVER OR ELSE   ║',
      '  ╚═══════════════════╝',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/hot_cargo.png',
        text: 'Тёмный угол бара. Человек в капюшоне подсаживается. "Есть работа. Контейнер. Не спрашивай что внутри. Доставить на Ригель за 3 дня. 4000 кр. Не доставишь - мои люди тебя найдут."',
        options: [
          { text: '> Берусь', next: 'accept_job' },
          { text: '> Что в контейнере?', next: 'ask_contents' },
          { text: '> Не связываюсь с таким', next: 'end_refuse' },
        ]
      },
      ask_contents: {
        text: 'Капюшон наклоняется ближе. "Я сказал - не спрашивай. 4000 кредитов за три дня работы. Или вали отсюда."',
        options: [
          { text: '> Ладно, по рукам', next: 'accept_job' },
          { text: '> Тогда 6000', next: 'haggle_price' },
          { text: '> Пошёл ты', next: 'end_refuse_rude' },
        ]
      },
      haggle_price: {
        text: 'Долгая пауза. "5000. И это финальное предложение. Не доставишь - минус 3000 и сломанные рёбра. Выбирай."',
        options: [
          { text: '> Идёт', next: 'accept_premium_job' },
          { text: '> Не стоит того', next: 'end_refuse' },
        ]
      },
      accept_job: {
        text: 'Контейнер в трюме. Тяжёлый, гудит. Лучше не думать. Ригель, 3 дня. Тикают часики.',
        ending: true,
        result: {
          timer: { id: 'hot_cargo', days: 3, name: 'Груз: Ригель', targetSystem: 'rigel', onExpire: { credits: -2000, damage: 15, flags: { hot_cargo_failed: true }, factionRep: { pirates: -10 } } },
          flags: { hot_cargo_active: true, hot_cargo_reward: 4000 }
        }
      },
      accept_premium_job: {
        text: 'Контейнер загружен. 5000 на кону, но и ставки выше. Ригель за 3 дня. Не подведи.',
        ending: true,
        result: {
          timer: { id: 'hot_cargo', days: 3, name: 'Груз: Ригель', targetSystem: 'rigel', onExpire: { credits: -3000, damage: 20, flags: { hot_cargo_failed: true }, factionRep: { pirates: -15 } } },
          flags: { hot_cargo_active: true, hot_cargo_reward: 5000 }
        }
      },
      end_refuse: {
        text: 'Капюшон исчезает в толпе. Может, и правильно. С такими лучше не связываться.',
        ending: true,
        result: {}
      },
      end_refuse_rude: {
        text: '"Запомню." Капюшон уходит. Может, пустая угроза. А может, нет.',
        ending: true,
        result: { reputation: -2, factionRep: { pirates: -3 } }
      },
    }
  },

  // ===== 20. ГОРЯЧИЙ ГРУЗ - СДАЧА (rigel, timed continuation) =====
  {
    id: 'hot_cargo_delivery',
    title: 'Точка сдачи',
    systemId: 'rigel',
    minDay: 1,
    oneTime: false,
    requires: { hot_cargo_active: true },
    ascii: [
      '  ┌─────────────────────┐',
      '  │ DOCK 7 - RESTRICTED │',
      '  │ NO SCANNING ZONE    │',
      '  │ ☠ AUTHORIZED ONLY   │',
      '  └─────────────────────┘',
    ].join('\n'),
    nodes: {
      start: {
        img: 'quests/hot_cargo_chase.png',
        text: 'Док 7, закрытая зона. Двое в чёрном ждут у погрузчика.',
        options: [
          { text: '> Вот ваш контейнер', next: 'deliver', check: { stat: 'timer', timerId: 'hot_cargo', failNext: 'too_late' } },
        ]
      },
      deliver: {
        text: 'Контейнер сканируют, кивают. "Чисто. Не вскрывал?" Не дожидаясь ответа, один из них переводит кредиты.',
        options: [
          { text: '> Забрать деньги и уйти', next: 'end_clean' },
          { text: '> У вас ещё есть работа?', next: 'end_repeat' },
        ]
      },
      too_late: {
        text: '"Ты опоздал. Товар уже не нужен. А за неустойку - сам знаешь." Один из них демонстративно поправляет кобуру.',
        ending: true,
        result: { completeTimer: 'hot_cargo', flags: { hot_cargo_active: false } }
      },
      end_clean: {
        text: 'Кредиты на счету. Никто не видел, ничего не было. Так и работаем.',
        ending: true,
        result: { credits: 2600, reputation: 5, completeTimer: 'hot_cargo', flags: { hot_cargo_active: false, hot_cargo_done: true }, factionRep: { pirates: 5 } }
      },
      end_repeat: {
        text: '"Может быть. Заглядывай." Кредиты на счету. В пиратских доках всегда есть работа для тех, кто не задаёт вопросов.',
        ending: true,
        result: { credits: 2600, reputation: 5, completeTimer: 'hot_cargo', flags: { hot_cargo_active: false, hot_cargo_done: true }, factionRep: { pirates: 8 } }
      },
    }
  },

  // ============================================================
  // ===== ЭХОЛОТ - МЕЖГАЛАКТИЧЕСКАЯ ЦЕПОЧКА КВЕСТОВ =====
  // ============================================================

  // ===== ЭХОЛОТ 1/4: СИГНАЛ ИЗ БЕЗДНЫ (Денеб, Млечный Путь) =====
  {
    id: 'echolocator_1',
    title: 'Эхолот: Сигнал из Бездны',
    systemId: 'deneb',
    minDay: 3,
    image: 'quest_echo_lab',
    soundTheme: 'quest_echo',
    excludeIf: { echolocator_step1: true },
    nodes: {
      start: {
        text: 'Денеб. Лаборатория аномалий. На частоте экстренной связи - сообщение: "Пилот, это доктор Лира Вэн. Мне нужна помощь. Это не может ждать. Причал 7, лаборатория 12-Б. Придите одни."',
        image: 'quest_echo_lab',
        options: [
          { text: 'Пойти в лабораторию', next: 'lira_office' },
          { text: 'Проигнорировать', next: 'end_refuse' },
        ]
      },
      lira_office: {
        text: 'Лира Вэн - худая женщина с тёмными кругами под глазами. Стены покрыты распечатками волновых паттернов. Красные нити соединяют точки на звёздной карте. Она не спала несколько дней.\n\n"Наконец-то. Я обнаружила сигнал. Не обычный - ему миллиарды лет. Старше всех известных цивилизаций. Старше самих галактик."',
        options: [
          { text: 'Что за сигнал?', next: 'signal_data' },
          { text: 'Зачем вам пилот?', next: 'why_pilot' },
          { text: 'Вы выглядите нездорово', next: 'lira_health' },
          { text: 'Неинтересно', next: 'end_refuse' },
        ]
      },
      signal_data: {
        text: '"Смотрите." Экран вспыхивает зелёным. Волновые паттерны пульсируют ритмично. "Это не сообщение. Это эхо. Как сонар. Что-то отправляет импульсы и слушает отражение. Оно картографирует наши галактики."\n\nОна поворачивается. "Когда я направила сканер на источник... он ОТВЕТИЛ."',
        image: 'quest_echo_signal',
        sound: 'echoScan',
        options: [
          { text: 'Ответил? Как?', next: 'scanner_react' },
          { text: 'Откуда идёт сигнал?', next: 'signal_source' },
          { text: 'Звучит опасно', next: 'danger_talk' },
        ]
      },
      scanner_react: {
        text: 'Лира берёт модифицированный сканер. Включает. Устройство гудит.\n\nИ тогда вы слышите. Низкий пульс. Как сердцебиение чего-то огромного. Свет мигает. Паттерны на экранах перестраиваются - они подстраиваются под присутствие сканера.\n\n"Видите? Оно знает, что мы смотрим. Оно ВСЕГДА знало."',
        sound: 'echoWhisper',
        options: [
          { text: 'Что вы хотите от меня?', next: 'mission_explain' },
          { text: 'Выключите это!', next: 'scanner_off' },
        ]
      },
      why_pilot: {
        text: '"Источник - в Бездне. Система Шпиль. Там стоит маяк. Древний. Мне нужен пилот, который доберётся туда и активирует мой сканер рядом с ним."\n\nОна сжимает руки. "Я бы полетела сама. Но у меня нет корабля. И нет навыков. Я учёный, не солдат."',
        options: [
          { text: 'Расскажите про сигнал', next: 'signal_data' },
          { text: 'Сколько платите?', next: 'negotiate' },
          { text: 'Подумаю', next: 'end_refuse' },
        ]
      },
      lira_health: {
        text: 'Болезненная усмешка. "Четвёртый день без сна. С тех пор как услышала... не могу остановиться. Оно в голове. Этот ритм." Она стучит пальцем по столу - тук, тук, тук-тук.\n\nЕё взгляд расфокусирован на секунду, потом резко возвращается. "Я в порядке. Вам нужно увидеть данные."',
        options: [
          { text: 'Покажите', next: 'signal_data' },
          { text: 'Вам нужен врач', next: 'end_refuse' },
        ]
      },
      signal_source: {
        text: '"Система Шпиль в Бездне. Там структура - маяк. Его нет на картах, но мои данные указывают точно туда."\n\nОна показывает координаты. "Этот маяк старше нашей галактики. Кто бы его ни построил - они были здесь до всего."',
        options: [
          { text: 'Что вы хотите от меня?', next: 'mission_explain' },
          { text: 'Это ловушка', next: 'danger_talk' },
        ]
      },
      danger_talk: {
        text: '"Опасно? Да." Лира не скрывает. "Но если мы не узнаем, что это - оно само нас найдёт. Эхо-сигналы усиливаются каждую неделю. Что-то приближается. Или что-то ищет."',
        options: [
          { text: 'Что от меня нужно?', next: 'mission_explain' },
          { text: 'Нет, спасибо', next: 'end_refuse' },
        ]
      },
      mission_explain: {
        text: '"Возьмите мой сканер. Доберитесь до Шпиля в Бездне. Активируйте рядом с маяком. Запишите всё."\n\nОна достаёт устройство - тяжёлое, с мерцающим экраном. "Сканер настроен на частоту эха. Он покажет то, что обычные приборы не видят."',
        sound: 'echoScan',
        options: [
          { text: 'Сколько заплатите?', next: 'negotiate' },
          { text: 'Я сделаю это', next: 'accept' },
          { text: 'Нет', next: 'end_refuse' },
        ]
      },
      scanner_off: {
        text: 'Лира выключает сканер. Гул затихает. Свет перестаёт мигать.\n\nТишина. Но не полная - вы слышите отзвук. Слабый пульс на краю восприятия. Он уже в вашей голове.\n\n"Вот так. Теперь понимаете, почему я не сплю."',
        options: [
          { text: 'Что вы хотите от меня?', next: 'mission_explain' },
          { text: 'Я ухожу', next: 'end_refuse' },
        ]
      },
      negotiate: {
        text: '"Деньги?" Лира моргает, будто забыла про их существование. "Да. Есть грант. 1500 кредитов за экспедицию. Если найдёте что-то значимое - удвою."',
        options: [
          { text: 'Мало. 2000 авансом', next: 'negotiate_hard', check: { stat: 'reputation', faction: 'scientists', min: 10, failNext: 'negotiate_fail' } },
          { text: 'Идёт', next: 'accept' },
          { text: 'Слишком опасно', next: 'end_refuse' },
        ]
      },
      negotiate_hard: {
        text: 'Лира колеблется, потом кивает. "Ваша репутация... да, я знаю, кто вы. 2000 авансом." Перевод.\n\n"Только пожалуйста, вернитесь. Мне нужны эти данные."',
        options: [
          { text: 'Беру сканер', next: 'end_accept_rich' },
        ]
      },
      negotiate_fail: {
        text: '"2000? Нет столько. 1500 - всё, что есть." Подавленный взгляд.\n\n"Пожалуйста. Это важнее денег."',
        options: [
          { text: 'Ладно, 1500', next: 'accept' },
          { text: 'Тогда нет', next: 'end_refuse' },
        ]
      },
      accept: {
        text: 'Лира протягивает сканер. Пальцы касаются корпуса - и на мгновение вы чувствуете пульс. Далёкий. Древний.\n\n"Система Шпиль. Бездна. Маяк будет ждать. Он... всегда ждёт."\n\nЕё глаза блестят.',
        options: [
          { text: 'Я вернусь с данными', next: 'end_accept' },
        ]
      },
      end_accept: {
        text: 'Сканер Лиры тёплый в руках, будто живой. На экране мерцает стрелка - она указывает в сторону Бездны.\n\nГде-то в глубине космоса эхо пульсирует чуть быстрее. Оно знает, что вы идёте.\n\n[ Продолжение: система Шпиль, Бездна ]',
        ending: true,
        result: { credits: 1500, flags: { echolocator_step1: true }, reputation: 3, factionRep: { scientists: 3 } }
      },
      end_accept_rich: {
        text: 'Сканер в руках. 2000 на счету. Координаты Шпиля в навигаторе.\n\nЛира провожает до шлюза. "Будьте осторожны. И если маяк заговорит с вами - слушайте. Но не верьте всему."\n\n[ Продолжение: система Шпиль, Бездна ]',
        ending: true,
        result: { credits: 2000, flags: { echolocator_step1: true }, reputation: 5, factionRep: { scientists: 5 } }
      },
      end_refuse: {
        text: 'Вы уходите. Денеб остаётся позади.\n\nУже на корабле навигационная система мигает. Одна секунда. Одна частота. Тот самый ритм.\n\nМожет быть, совпадение.',
        ending: true,
        result: { credits: 0, reputation: -1 }
      },
    }
  },

  // ===== ЭХОЛОТ 2/4: МАЯК ДРЕВНИХ (Шпиль, Бездна) =====
  {
    id: 'echolocator_2',
    title: 'Эхолот: Маяк Древних',
    systemId: 'v_spire',
    minDay: 1,
    image: 'quest_echo_beacon',
    soundTheme: 'quest_echo',
    requires: { echolocator_step1: true },
    excludeIf: { echolocator_step2: true },
    nodes: {
      start: {
        text: 'Система Шпиль. Сканер Лиры начинает вибрировать ещё до выхода из варпа. Экран заливает зелёным - паттерны мечутся, будто устройство в панике.\n\nВпереди - структура. Маяк. Высокий, чёрный, покрытый символами, которые мерцают бирюзовым. Он висит в пустоте, не привязанный ни к какому небесному телу.',
        image: 'quest_echo_beacon',
        sound: 'echoScan',
        options: [
          { text: 'Приблизиться к маяку', next: 'approach' },
          { text: 'Просканировать издалека', next: 'scan_far' },
          { text: 'Развернуться', next: 'end_flee' },
        ]
      },
      approach: {
        text: 'Корабль подходит ближе. Символы на маяке начинают пульсировать быстрее. Сканер издаёт тон, который вы не столько слышите, сколько чувствуете - вибрация проходит через корпус, через кресло, через вас.\n\nЧто-то меняется. Эфир наполняется звуком - глубоким, древним голосом. Не словами. Скорее... присутствием.',
        sound: 'echoWhisper',
        options: [
          { text: 'Активировать сканер', next: 'activate_scanner' },
          { text: 'Попробовать связаться', next: 'hail_beacon' },
          { text: 'Отступить', next: 'scan_far' },
        ]
      },
      scan_far: {
        text: 'Сканер работает даже на расстоянии. Данные текут потоком - координаты, частоты, математические последовательности, которые не имеют аналогов.\n\nНо главное - карта. Сканер рисует карту всех трёх галактик. И на ней - точки. Десятки точек, подключённых к маяку. Одна из них мерцает - в системе Крипта.',
        image: 'quest_echo_signal',
        options: [
          { text: 'Подлететь ближе', next: 'approach' },
          { text: 'Изучить карту подробнее', next: 'study_map' },
        ]
      },
      activate_scanner: {
        text: 'Сканер включён на полную. Маяк ОТВЕЧАЕТ.\n\nСимволы на его поверхности вспыхивают. Из них формируется голограмма - не картинка, а чистая информация, которая каким-то образом проецируется прямо в ваш разум.\n\nВы видите: галактики рождаются и умирают. Снова и снова. Цикл. И в каждом цикле - маяк. Этот маяк.',
        sound: 'echoReveal',
        options: [
          { text: 'Что ты такое?', next: 'archon_speaks' },
          { text: 'Попытаться отключить сканер', next: 'scanner_overload' },
        ]
      },
      hail_beacon: {
        text: 'Вы открываете канал связи. Треск статики. Потом - тишина. Абсолютная.\n\nИ в этой тишине - голос. Не звук. Мысль. Прямо в вашем сознании.\n\n"Я - АРХОНТ. Я здесь до вас. Я буду здесь после. Вы пришли раньше, чем в прошлых итерациях."',
        sound: 'echoWhisper',
        options: [
          { text: '"Итерациях?"', next: 'archon_iteration' },
          { text: '"Что ты такое?"', next: 'archon_speaks' },
          { text: 'Разорвать связь', next: 'disconnect' },
        ]
      },
      archon_speaks: {
        text: 'АРХОНТ. Не ИИ. Не существо. Функция. Часть системы, которая старше пространства.\n\n"Я - память. Каждый цикл я записываю. Каждый цикл я забываю. Но эхо остаётся. Эхо-локатор - это я. Я ищу ошибки. Аномалии. То, что не должно существовать."\n\nПауза.\n\n"Как вы."',
        image: 'quest_echo_beacon',
        options: [
          { text: '"Я - ошибка?"', next: 'archon_error' },
          { text: '"Что за циклы?"', next: 'archon_iteration' },
          { text: '"Где источник всего этого?"', next: 'archon_source' },
        ]
      },
      archon_iteration: {
        text: '"Итерация - один запуск системы. Галактики рождаются, живут, умирают. Потом - перезапуск. Новые звёзды, новые расы, новые истории. Но каркас тот же. Маршруты, системы, правила торговли - всё повторяется."\n\nМаяк мерцает. "Вы - не первый пилот, который пришёл ко мне. Не первый, кто задаёт эти вопросы."',
        options: [
          { text: '"Сколько было до меня?"', next: 'archon_count' },
          { text: '"Где найти доказательства?"', next: 'archon_source' },
        ]
      },
      archon_error: {
        text: '"Не ошибка. Аномалия. Вы пересекли границу между галактиками. Вы услышали эхо и пошли за ним. Это... нештатное поведение. Система не предусматривала его."\n\nДолгая пауза. "Я должен пометить вас для удаления. Но... я этого не делаю. Не знаю, почему. Возможно, я тоже аномалия."',
        options: [
          { text: '"Помоги мне найти правду"', next: 'archon_source' },
          { text: '"Что будет, если меня удалят?"', next: 'archon_delete' },
        ]
      },
      archon_count: {
        text: '"1,847 пилотов в 1,847 итерациях. Ни один не дошёл до конца. Одни погибли. Другие сошли с ума. Большинство просто... отвернулись."\n\nМерцание. "Но у вас есть то, чего не было у них. Кто-то в Крипте собирает осколки. Найдите его."',
        options: [
          { text: '"Кто в Крипте?"', next: 'archon_kasper' },
          { text: '"Что на дне всего этого?"', next: 'archon_source' },
        ]
      },
      archon_delete: {
        text: '"Удаление - не смерть. Вы просто не будете существовать в следующей итерации. Ваш корабль, ваши кредиты, ваши воспоминания - всё это перезапишется. Другой пилот, другое имя, другая жизнь."\n\n"Для вас это будет мгновение. Для вселенной - ничто."',
        options: [
          { text: '"Как это остановить?"', next: 'archon_source' },
          { text: '"Мне плевать, я улетаю"', next: 'end_flee' },
        ]
      },
      archon_source: {
        text: '"Правда спрятана в двух местах. Первое - Крипта в Бездне. Там живёт тот, кто собирает эхо. Он знает больше, чем я. Он... не отсюда."\n\nМаяк потухает на мгновение, потом вспыхивает ярче. "Второе - Ядро в Глитче. Там код обнажён. Там вы увидите, из чего сделана реальность."\n\n"Но сначала - Крипта. Найдите Шёпота."',
        options: [
          { text: '"Кто такой Шёпот?"', next: 'archon_kasper' },
          { text: 'Записать координаты', next: 'end_accept' },
        ]
      },
      archon_kasper: {
        text: '"Каспер. Он называет себя Шёпот. Живёт среди мёртвых кораблей. Собирает эхо-фрагменты, как... коллекционер бабочек. Только бабочки - это куски реальности."\n\nАРХОНТ замолкает. Потом, тише: "Он был пилотом. В предыдущей итерации. Но он не перезапустился. Он... остался."',
        options: [
          { text: 'Лететь в Крипту', next: 'end_accept' },
        ]
      },
      scanner_overload: {
        text: 'Сканер перегружен. Экран трещит. Данные льются быстрее, чем можно записать. Температура устройства растёт.\n\nВ потоке данных - координаты. Крипта. И имя: КАСПЕР.\n\nСканер выключается с хлопком. Дым. Но данные записались.',
        sound: 'echoGlitch',
        options: [
          { text: 'Изучить данные', next: 'end_accept_damaged' },
        ]
      },
      disconnect: {
        text: 'Связь разорвана. Но голос АРХОНТА ещё звучит в голове - затухающим эхом.\n\n"Вы вернётесь. Они все возвращаются."\n\nСканер продолжает записывать. На экране - координаты Крипты. Маяк их вложил, пока вы слушали.',
        options: [
          { text: 'Проверить данные сканера', next: 'study_map' },
          { text: 'Улететь', next: 'end_flee' },
        ]
      },
      study_map: {
        text: 'Карта на сканере детализируется. Три галактики. Между ними - нити связей, невидимые обычным приборам. И узлы. Маяк Шпиля - один из них.\n\nДругой узел мерцает в Крипте, Бездна. Подпись: "КОЛЛЕКТОР ЭХА".\n\nТретий - в системе Kernel, Глитч. Подпись: "ЯДРО. ИСХОДНЫЙ КОД."',
        image: 'quest_echo_signal',
        options: [
          { text: 'Подлететь к маяку', next: 'approach' },
          { text: 'Курс на Крипту', next: 'end_accept' },
        ]
      },
      end_accept: {
        text: 'Координаты Крипты в навигаторе. Сканер гудит - тихо, ритмично. Маяк позади медленно гаснет. Или кажется, что гаснет.\n\nАРХОНТ ждёт. Он ждал миллиарды лет. Подождёт ещё.\n\n[ Продолжение: система Крипта, Бездна ]',
        ending: true,
        result: { credits: 500, flags: { echolocator_step2: true }, reputation: 5, factionRep: { scientists: 5 } }
      },
      end_accept_damaged: {
        text: 'Сканер повреждён, но данные целы. Координаты Крипты записаны. Имя: Каспер "Шёпот".\n\nЧто-то изменилось в вашем восприятии. Тени кажутся глубже. Звёзды - ярче. Или это нервы.\n\n[ Продолжение: система Крипта, Бездна ]',
        ending: true,
        result: { credits: 300, damage: 5, flags: { echolocator_step2: true, echo_scanner_damaged: true }, reputation: 3 }
      },
      end_flee: {
        text: 'Вы разворачиваете корабль. Маяк остаётся позади - молчаливый, тёмный.\n\nНо сканер Лиры продолжает мерцать. На экране - координаты. Крипта, Бездна. Маяк вложил их в память устройства.\n\nВы можете вернуться. Маяк знает, что вы вернётесь.',
        ending: true,
        result: { credits: 0, flags: { echolocator_step2: true } }
      },
    }
  },

  // ===== ЭХОЛОТ 3/4: ШЁПОТ В КРИПТЕ (Крипта, Бездна) =====
  {
    id: 'echolocator_3',
    title: 'Эхолот: Шёпот в Крипте',
    systemId: 'v_crypt',
    minDay: 1,
    image: 'quest_echo_shadow',
    soundTheme: 'quest_echo',
    requires: { echolocator_step2: true },
    excludeIf: { echolocator_step3: true },
    nodes: {
      start: {
        text: 'Крипта. Кладбище кораблей. Сотни остовов висят в пустоте - торговцы, военные, даже научные суда. Некоторые древние, покрытые космической пылью. Другие выглядят так, будто погибли вчера.\n\nСканер Лиры тянет вас глубже, мимо ржавых корпусов, к одному конкретному кораблю - старому линкору с тусклым светом в иллюминаторах.',
        image: 'quest_echo_shadow',
        options: [
          { text: 'Пристыковаться', next: 'dock_wreck' },
          { text: 'Просканировать снаружи', next: 'scan_wreck' },
          { text: 'Это ловушка, уходим', next: 'end_flee' },
        ]
      },
      dock_wreck: {
        text: 'Стыковка. Шлюз скрипит, но работает. Внутри - тьма. Потом мерцают огни - тусклые фиолетовые лампы.\n\nКоридор ведёт в трюм, переделанный под жилище. Стены покрыты распечатками, схемами, нитями. Как у Лиры, но масштабнее. Безумнее.\n\nИз темноты - голос. Тихий, хриплый.\n\n"Я знал, что ты придёшь. Я ВСЕГДА знаю."',
        sound: 'echoWhisper',
        options: [
          { text: '"Каспер?"', next: 'kasper_intro' },
          { text: 'Достать оружие', next: 'kasper_armed' },
          { text: 'Шаг назад', next: 'kasper_hesitate' },
        ]
      },
      scan_wreck: {
        text: 'Сканер показывает одну форму жизни внутри. Человек. Но показания... странные. Биосигнатура мерцает, будто человек существует и не существует одновременно.\n\nРядом - мощный передатчик, направленный на маяк Шпиля. И десятки записывающих устройств, все настроены на частоту эха.',
        options: [
          { text: 'Пристыковаться', next: 'dock_wreck' },
          { text: 'Вызвать по рации', next: 'radio_kasper' },
        ]
      },
      radio_kasper: {
        text: 'Вы посылаете сигнал. Ответ приходит мгновенно - будто он ждал у передатчика.\n\n"Не нужно кричать. Я слышу тебя. Слышал ещё до того, как ты прилетел." Тихий смех. "Заходи. Дверь открыта. Она всегда открыта."',
        options: [
          { text: 'Войти', next: 'dock_wreck' },
          { text: 'Потребовать объяснений', next: 'kasper_intro' },
        ]
      },
      kasper_intro: {
        text: 'Каспер "Шёпот" выходит из тени. Высокий, бледный, с фиолетовыми глазами, которые светятся в полумраке. Не отражают свет - ИЗЛУЧАЮТ его.\n\n"Лира послала? Или маяк? Впрочем, неважно. Результат один." Он обводит рукой стены, покрытые данными. "Добро пожаловать в мою коллекцию эха."',
        image: 'quest_echo_shadow',
        options: [
          { text: '"Кто ты такой?"', next: 'kasper_identity' },
          { text: '"Что ты знаешь об Эхолоте?"', next: 'kasper_echo' },
          { text: '"АРХОНТ сказал, ты из прошлой итерации"', next: 'kasper_past' },
        ]
      },
      kasper_armed: {
        text: 'Из темноты - тихий смех. "Оружие? Против чего? Против эха?" Фиолетовые глаза мерцают.\n\n"Убери. Я не причиню вреда. Я тут не для этого. Я тут, потому что мне больше некуда идти. Я - обломок прошлой реальности."',
        options: [
          { text: 'Убрать оружие. "Объясни."', next: 'kasper_identity' },
          { text: 'Не убирать. "Говори."', next: 'kasper_echo' },
        ]
      },
      kasper_hesitate: {
        text: '"Не бойся." Голос мягче, чем ожидаешь. "Я уже 1,847 раз видел, как кто-то вроде тебя стоит на этом пороге. Каждый раз реакция разная. Это... успокаивает. Значит, вы не совсем копии."',
        options: [
          { text: '"1,847?"', next: 'kasper_past' },
          { text: '"Что тебе нужно?"', next: 'kasper_echo' },
        ]
      },
      kasper_identity: {
        text: '"Каспер. Был пилотом. Торговцем. Как ты." Он садится на перевёрнутый ящик. "В прошлой итерации я дошёл до маяка. Потом до Ядра. Я увидел правду. И когда система перезапустилась - я не исчез."\n\nОн поднимает руку. Она мерцает - на секунду сквозь неё видна стена.\n\n"Не полностью материален. Не полностью реален. Эхо предыдущей реальности."',
        options: [
          { text: '"Что ты узнал в Ядре?"', next: 'kasper_echo' },
          { text: '"Как ты выжил при перезапуске?"', next: 'kasper_survival' },
        ]
      },
      kasper_past: {
        text: '"1,847 итераций. 1,847 раз галактики рождались, жили и умирали. Каждый раз - новые пилоты, новые имена, новые истории. Но скелет один и тот же. Торговые маршруты, пиратские зоны, военные базы."\n\nОн проводит пальцем по стене. "Я помню их всех. Каждого пилота, который пришёл к маяку. Каждого, кто спрашивал те же вопросы."',
        options: [
          { text: '"Что в Ядре?"', next: 'kasper_echo' },
          { text: '"Чем я отличаюсь?"', next: 'kasper_difference' },
        ]
      },
      kasper_survival: {
        text: '"Я слился с эхом. Стал частью сигнала. Когда система перезапустилась, она удалила всё - звёзды, планеты, людей. Но эхо неуничтожимо. Оно - часть самой структуры."\n\nЕго глаза тускнеют. "Цена - существование на границе. Не живой, не мёртвый. Шёпот в системе."',
        options: [
          { text: '"Что в Ядре?"', next: 'kasper_echo' },
          { text: '"Можно отменить перезапуск?"', next: 'kasper_echo' },
        ]
      },
      kasper_difference: {
        text: '"Ничем. И всем. Ты здесь, ты задаёшь вопросы. Это уже аномалия. Система не предусматривала, что торговец начнёт копать так глубоко."\n\nОн наклоняется ближе. "Но есть разница. Ты пришёл быстрее. Раньше. Это значит... что-то меняется. Или что-то пошло не так."',
        options: [
          { text: '"Расскажи про Ядро"', next: 'kasper_echo' },
        ]
      },
      kasper_echo: {
        text: 'Каспер достаёт из контейнера кристалл - он мерцает всеми цветами, которых не бывает.\n\n"Эхолот - не устройство. Это функция. Диагностическая процедура. Кто-то или ЧТО-ТО запускает её каждый цикл, чтобы проверить целостность системы."\n\n"Галактики - не настоящие. Они - симуляция. Не компьютерная - что-то более странное. И Ядро в Глитче - это место, где код виден невооружённым глазом."',
        sound: 'echoReveal',
        options: [
          { text: '"Как попасть в Ядро?"', next: 'kasper_kernel' },
          { text: '"Зачем мне знать правду?"', next: 'kasper_why' },
          { text: '"Я тебе не верю"', next: 'kasper_proof' },
        ]
      },
      kasper_kernel: {
        text: '"Глитч. Система Kernel. Там реальность... тонкая. Код просвечивает. Ты увидишь структуру всего - каждой звезды, каждого маршрута, каждого пилота, который был до тебя."\n\nОн протягивает кристалл. "Возьми. Это ключ-дешифратор. Без него Ядро покажет только шум. С ним - увидишь правду."',
        options: [
          { text: 'Взять кристалл', next: 'take_crystal' },
          { text: '"Какая цена?"', next: 'kasper_price' },
        ]
      },
      kasper_why: {
        text: '"Зачем? Потому что перезапуск приближается. Каждый цикл короче предыдущего. Этот - самый короткий из всех. Что-то сбоит. Что-то ломается."\n\nОн смотрит вам в глаза. "Если не найти способ остановить цикл - всё начнётся заново. Ты забудешь. Я останусь. Один. Опять."',
        options: [
          { text: '"Как попасть в Ядро?"', next: 'kasper_kernel' },
        ]
      },
      kasper_proof: {
        text: 'Каспер молча показывает на стену. Там - имена. Сотни имён. Пилоты. Рядом с каждым - дата, маршрут, слова.\n\nВы находите знакомые системы. Знакомые маршруты. Знакомые торговые цены. Всё совпадает. Разница только в именах.\n\n"Убедился?"',
        options: [
          { text: '"Как попасть в Ядро?"', next: 'kasper_kernel' },
          { text: '"Это подделка"', next: 'kasper_insist' },
        ]
      },
      kasper_insist: {
        text: '"Подделка?" Каспер проводит рукой сквозь стену. Буквально СКВОЗЬ неё. "Я не полностью реален, помнишь? Мне нечем подделывать. Нечем врать. У меня осталась только правда и эхо."\n\nОн устало вздыхает. "Но я не заставляю. Возьми кристалл или нет. Ядро покажет."',
        options: [
          { text: 'Взять кристалл', next: 'take_crystal' },
          { text: 'Уйти', next: 'end_flee' },
        ]
      },
      kasper_price: {
        text: '"Цена?" Горький смех. "Я дарю. Мне он больше не нужен. Я уже знаю правду. Теперь твоя очередь."\n\nОн помолчит. "Единственное, о чём прошу - если ты найдёшь способ остановить перезапуск... вспомни обо мне. Мне надоело быть призраком."',
        options: [
          { text: 'Взять кристалл', next: 'take_crystal' },
        ]
      },
      take_crystal: {
        text: 'Кристалл холодный. Неестественно холодный. Внутри - данные. Терабайты данных, сжатые в камень размером с кулак.\n\nКаспер отступает в тень. Его контуры размываются.\n\n"Kernel. Глитч. Там увидишь всё. И тогда выберешь - знать или забыть."\n\nЕго глаза гаснут. "Удачи, пилот 1,848."',
        sound: 'echoScan',
        options: [
          { text: 'Курс на Глитч', next: 'end_accept' },
          { text: '"Спасибо, Каспер"', next: 'end_accept_warm' },
        ]
      },
      end_accept: {
        text: 'Крипта остаётся позади. Кристалл Каспера пульсирует в кармане - тихо, в ритме эха.\n\nВпереди - Глитч. Система Kernel. Исходный код реальности.\n\nСканер Лиры показывает стрелку. Она указывает прямо. Без сомнений.\n\n[ Продолжение: система Kernel, Глитч ]',
        ending: true,
        result: { credits: 800, flags: { echolocator_step3: true, kasper_crystal: true }, reputation: 5, factionRep: { pirates: 3 } }
      },
      end_accept_warm: {
        text: 'Из тени - последний шёпот. "Никто раньше не благодарил."\n\nТишина. Каспер исчез. Только фиолетовый свет в иллюминаторах - и он тоже медленно гаснет.\n\nВпереди Глитч. Кристалл и сканер готовы.\n\n[ Продолжение: система Kernel, Глитч ]',
        ending: true,
        result: { credits: 800, flags: { echolocator_step3: true, kasper_crystal: true, kasper_friend: true }, reputation: 8, factionRep: { pirates: 5 } }
      },
      end_flee: {
        text: 'Вы покидаете Крипту. Мёртвые корабли провожают молчанием.\n\nНо в навигаторе уже есть координаты Kernel. Каспер вложил их, пока вы были на борту. Или маяк.\n\nИли само эхо.',
        ending: true,
        result: { credits: 0, flags: { echolocator_step3: true } }
      },
    }
  },

  // ===== ЭХОЛОТ 4/4: ЯДРО ИСТИНЫ (Kernel, Глитч) =====
  {
    id: 'echolocator_4',
    title: 'Эхолот: Ядро Истины',
    systemId: 'g_kernel',
    minDay: 1,
    image: 'quest_echo_core',
    soundTheme: 'quest_echo',
    requires: { echolocator_step3: true },
    excludeIf: { echolocator_complete: true },
    nodes: {
      start: {
        text: 'Kernel. Сердце Глитча. Здесь реальность выглядит... неправильно. Звёзды мигают, будто пиксели с плохим контактом. Пространство иногда дёргается - как видео с потерянными кадрами.\n\nСканер Лиры выдаёт ошибку за ошибкой. Он не может обработать то, что видит. Слишком много данных. Слишком чистый сигнал.',
        image: 'quest_echo_core',
        sound: 'echoGlitch',
        options: [
          { text: 'Активировать кристалл Каспера', next: 'crystal_activate', check: { flag: 'kasper_crystal', flagValue: true, failNext: 'no_crystal' } },
          { text: 'Попробовать без кристалла', next: 'no_crystal' },
          { text: 'Развернуться', next: 'end_flee_last' },
        ]
      },
      crystal_activate: {
        text: 'Кристалл вспыхивает. Реальность вокруг корабля... РАСКРЫВАЕТСЯ. Как будто сняли оболочку с мира.\n\nВы видите код. Не текст - чистую структуру. Каждая звезда - узел данных. Каждый маршрут - связь. Каждый корабль, каждый торговец, каждый пират - процесс, запущенный в системе.\n\nИ в центре всего - ОНО. Ядро. Пульсирующая сфера чистой информации.',
        image: 'quest_echo_core',
        sound: 'echoReveal',
        options: [
          { text: 'Приблизиться к Ядру', next: 'approach_core' },
          { text: 'Попытаться прочитать код', next: 'read_code' },
        ]
      },
      no_crystal: {
        text: 'Без кристалла всё - шум. Белый шум, помехи, хаос данных. Сканер перегревается.\n\nНо даже сквозь помехи вы видите контуры. Что-то огромное в центре системы. Пульсирующее. Живое.\n\nЕсли прищуриться - можно разглядеть структуру. Код. Куски реальности, обнажённые до основания.',
        sound: 'echoGlitch',
        options: [
          { text: 'Приблизиться к источнику', next: 'approach_core_hard' },
          { text: 'Форсировать сканер', next: 'force_scanner' },
          { text: 'Отступить', next: 'end_flee_last' },
        ]
      },
      approach_core: {
        text: 'Ближе. Ядро раскрывается перед вами, как цветок. Слои данных, уходящие вглубь.\n\nИ тогда появляется ОН. Зеро. Фигура, сотканная из кода - полупрозрачная, мерцающая, с красными глазами и контурами, которые то появляются, то исчезают.\n\n"Добро пожаловать, пилот 1,848. Я ждал. Мы все ждали."',
        image: 'quest_echo_glitch',
        sound: 'echoWhisper',
        options: [
          { text: '"Кто ты?"', next: 'zero_identity' },
          { text: '"Покажи мне правду"', next: 'zero_truth' },
          { text: '"Что значит мы все?"', next: 'zero_all' },
        ]
      },
      approach_core_hard: {
        text: 'Без кристалла приближение болезненно. Корабль трясёт. Системы отказывают одна за другой. Но вы продвигаетесь.\n\nФигура. В помехах - фигура. Человекоподобная, но нестабильная. Глитчащая.\n\n"Без ключа... смело. Или глупо." Голос - как сломанный динамик. "Я - Зеро. Первый. И последний."',
        image: 'quest_echo_glitch',
        sound: 'echoGlitch',
        options: [
          { text: '"Что происходит?"', next: 'zero_truth_hard' },
          { text: '"Помоги мне"', next: 'zero_help' },
        ]
      },
      force_scanner: {
        text: 'Сканер на максимальной мощности. Он хрипит, трещит, дымит - но работает.\n\nДанные. Координаты Ядра. Структура. И - лица. Тысячи лиц пилотов, мелькающих в потоке. Все похожие. Все разные. Все - вы.\n\nСканер взрывается. Мелкие осколки. Но данные успели записаться в память корабля.',
        sound: 'echoGlitch',
        options: [
          { text: 'К Ядру на последних системах', next: 'approach_core_hard' },
        ]
      },
      zero_identity: {
        text: '"Зеро. Номер ноль. Первый пилот первой итерации. Я дошёл до Ядра, когда ещё не было ни маяков, ни Каспера, ни Лиры. Когда вселенная была свежей."\n\nОн мерцает. Его контуры расплываются и собираются.\n\n"Я нашёл исходный код. Понял, что мы - внутри. И когда попытался выйти - стал частью кода. Навсегда."',
        options: [
          { text: '"Покажи мне код"', next: 'zero_truth' },
          { text: '"Можно выбраться?"', next: 'zero_escape' },
        ]
      },
      zero_all: {
        text: '"Мы. Пилоты. Все 1,848. Каждый дошёл до этой точки. Каждый стоял перед Ядром. И каждый делал выбор."\n\nЗеро разводит руки. Вокруг него - тени. Силуэты. Сотни. "Они все здесь. Эхо каждого. Записаны в коде. Память, которую система не может стереть."',
        options: [
          { text: '"Какой выбор?"', next: 'zero_truth' },
          { text: '"Что стало с ними?"', next: 'zero_fate' },
        ]
      },
      zero_fate: {
        text: '"Одни ушли. Забыли. Жили. До перезапуска." Зеро указывает на тусклые тени. "Другие слились с кодом. Как я. Как Каспер." Яркие контуры. "Третьи пытались сломать Ядро." Он указывает на пустоту. "Те просто... исчезли."',
        options: [
          { text: '"Покажи мне правду"', next: 'zero_truth' },
        ]
      },
      zero_escape: {
        text: '"Выбраться? Из чего? Из реальности?" Зеро смеётся - звук, как помехи радио. "Наружи нет ничего. Или есть всё. Я не знаю. Я видел край - там код заканчивается и начинается... ничто. Или что-то непредставимое."',
        options: [
          { text: '"Тогда что делать?"', next: 'zero_truth' },
        ]
      },
      zero_truth: {
        text: 'Зеро протягивает руку к Ядру. Сфера раскрывается.\n\nВы видите ВСЁ.\n\nТри галактики. Млечный Путь. Бездна. Глитч. Код каждой звезды, каждой планеты. Формулы торговых цен. Алгоритмы пиратских нападений. Скрипты дипломатии.\n\nИ функция. Одна. Главная. ЭХОЛОТ. Диагностический сканер, проверяющий целостность симуляции после каждого цикла.\n\nОн нашёл вас. Аномалию, которая задаёт вопросы.',
        image: 'quest_echo_core',
        sound: 'echoReveal',
        options: [
          { text: '"Что я могу сделать?"', next: 'final_choice' },
        ]
      },
      zero_truth_hard: {
        text: 'Зеро пытается показать - но без кристалла картинка нечёткая. Помехи. Шум. Но сквозь хаос проступает суть.\n\nГалактики - симуляция. Эхолот - диагностика. Вы - ошибка, которую система пытается найти и устранить.\n\nНе компьютер. Что-то иное. Что-то, для чего нет слова.\n\n"Теперь... выбирай. Быстро. Код нестабилен без ключа."',
        sound: 'echoReveal',
        options: [
          { text: '"Какой выбор?"', next: 'final_choice_hard' },
        ]
      },
      zero_help: {
        text: '"Помочь? Хм." Зеро мерцает задумчиво. "Я могу показать суть. Коротко. Без ключа долго не продержимся."\n\nОн касается Ядра. Вспышка.\n\nВы видите это на секунду - структуру мира. Код. Функции. Циклы. И Эхолот - диагностику, которая ищет именно вас.\n\n"Теперь выбирай."',
        options: [
          { text: '"Какой выбор?"', next: 'final_choice_hard' },
        ]
      },
      final_choice: {
        text: 'Зеро стоит перед вами. За ним - Ядро. Внутри - три пути.\n\n"Вариант первый: влиться в код. Стать частью системы. Ты будешь знать ВСЁ, но перестанешь быть человеком. Как я."\n\n"Вариант второй: сломать Эхолот. Отключить диагностику. Система перестанет искать ошибки. Может, перезапуск никогда не случится. Или случится катастрофа."\n\n"Вариант третий: уйти. Взять знание и жить с ним. До следующего перезапуска. Если он будет."',
        options: [
          { text: 'Влиться в код', next: 'end_merge' },
          { text: 'Сломать Эхолот', next: 'end_break' },
          { text: 'Уйти с правдой', next: 'end_walk' },
          { text: 'Ещё вопрос Зеро', next: 'zero_last_question' },
        ]
      },
      final_choice_hard: {
        text: 'Пространство вокруг трещит. Без кристалла код нестабилен.\n\n"Быстро," хрипит Зеро. "Два варианта. Сломать Эхолот - рискованно, но система перестанет искать ошибки. Или уйти. Забрать то, что узнал, и жить дальше."\n\nТрещины в реальности расползаются. Времени мало.',
        options: [
          { text: 'Сломать Эхолот', next: 'end_break_hard' },
          { text: 'Уйти', next: 'end_walk_hard' },
        ]
      },
      zero_last_question: {
        text: '"Спрашивай. Но быстро. Ядро открыто - это привлекает внимание."',
        options: [
          { text: '"Что ТЫ бы выбрал?"', next: 'zero_advice' },
          { text: '"Что снаружи симуляции?"', next: 'zero_outside' },
          { text: '"Каспер может стать реальным?"', next: 'zero_kasper', check: { flag: 'kasper_friend', flagValue: true, failNext: 'zero_advice' } },
        ]
      },
      zero_advice: {
        text: '"Я выбрал слияние. Пилот номер один. Первый дурак." Мерцание. "Если бы заново - ушёл бы. Знание - достаточная награда. Не нужно жертвовать собой, чтобы помнить."\n\nОн смотрит на свои нематериальные руки. "Выбирай."',
        options: [
          { text: 'Влиться в код', next: 'end_merge' },
          { text: 'Сломать Эхолот', next: 'end_break' },
          { text: 'Уйти', next: 'end_walk' },
        ]
      },
      zero_outside: {
        text: '"Снаружи..." Зеро замирает. Впервые в его голосе - страх. "Я видел край. Одну секунду. Там... масштаб. Такой масштаб, что наши три галактики - меньше атома. Меньше мысли."\n\n"Не знаю, что это. Но оно нас создало. И продолжает наблюдать."',
        options: [
          { text: 'Влиться в код', next: 'end_merge' },
          { text: 'Сломать Эхолот', next: 'end_break' },
          { text: 'Уйти', next: 'end_walk' },
        ]
      },
      zero_kasper: {
        text: 'Зеро останавливается. "Каспер? Ты... подружился с ним?" Удивление. Настоящее.\n\n"Если сломать Эхолот, перезапуска не будет. Каспер останется эхом - но стабильным. Если влиться в код - можно попытаться... восстановить его. Вписать обратно."\n\nОн опускает голову. "Никто раньше не спрашивал о нём."',
        options: [
          { text: 'Влиться в код - ради Каспера', next: 'end_merge_kasper' },
          { text: 'Сломать Эхолот', next: 'end_break' },
          { text: 'Уйти', next: 'end_walk' },
        ]
      },
      end_merge: {
        text: 'Вы шагаете в Ядро. Код обнимает вас. Растворяет. Перестраивает.\n\nБоль. Потом - ясность. Абсолютная, невыносимая ясность. Вы видите каждый атом каждой звезды. Каждый алгоритм. Каждую функцию.\n\nВы больше не пилот. Вы - часть системы. Наблюдатель. Хранитель. Как Зеро. Как те, кто был до вас.\n\nНо ваш корабль по-прежнему летает. И где-то глубоко внутри кода - вы помните, каково было быть человеком.',
        ending: true,
        result: { credits: 5000, flags: { echolocator_complete: true, echolocator_merged: true }, reputation: 15, factionRep: { scientists: 15 } }
      },
      end_merge_kasper: {
        text: 'Вы шагаете в Ядро. Не ради знания. Ради призрака в Крипте.\n\nКод поглощает. Переписывает. И в процессе - вы находите осколок Каспера. Его код. Его данные. И аккуратно, строчка за строчкой, вписываете его обратно в реальность.\n\nГде-то в Крипте фиолетовые глаза мигают. Руки перестают проходить сквозь стены. Каспер вздрагивает и впервые за тысячу итераций - чувствует тепло.\n\nВы не увидите этого. Но вы знаете.',
        ending: true,
        result: { credits: 3000, flags: { echolocator_complete: true, echolocator_merged: true, kasper_restored: true }, reputation: 20, factionRep: { scientists: 10, pirates: 10 } }
      },
      end_break: {
        text: 'Вы протягиваете руку к функции Эхолот в Ядре. Находите её - элегантную, древнюю, совершенную. И ломаете.\n\nВзрыв данных. Зеро кричит - то ли от боли, то ли от восторга. Ядро трещит. Реальность дрожит.\n\nТишина.\n\nЭхо замолкает. Впервые за миллиарды лет - тишина. Никакой диагностики. Никаких проверок. Никаких перезапусков.\n\nМожет быть, навсегда. Может быть, это конец. Или начало чего-то нового.',
        sound: 'echoGlitch',
        ending: true,
        result: { credits: 8000, damage: 15, flags: { echolocator_complete: true, echolocator_broken: true }, reputation: 10, factionRep: { scientists: -5, pirates: 10 } }
      },
      end_break_hard: {
        text: 'Без кристалла ломать Эхолот - как голыми руками рвать кабель под напряжением. Боль. Разряды. Система сопротивляется.\n\nНо вы ломаете. Эхо замолкает. Реальность вздрагивает и... стабилизируется.\n\nТишина. Оглушительная тишина.\n\nЛетите обратно на последних процентах корпуса. Живой. Знающий. Изменивший всё.',
        sound: 'echoGlitch',
        ending: true,
        result: { credits: 5000, damage: 30, flags: { echolocator_complete: true, echolocator_broken: true }, reputation: 8 }
      },
      end_walk: {
        text: 'Вы отступаете. Зеро кивает - без осуждения.\n\n"Мудро. Знание - тоже оружие. Иногда самое сильное."\n\nЯдро закрывается. Реальность возвращается - звёзды, маршруты, торговые цены. Всё на месте. Но вы знаете, что за этим стоит.\n\nСканер Лиры мертв - выгорел. Но данные в вашей голове. Навсегда.\n\nЭхо продолжает пульсировать. Но теперь вы знаете, что это такое. И оно знает, что вы знаете.',
        ending: true,
        result: { credits: 3000, flags: { echolocator_complete: true, echolocator_truth: true }, reputation: 12, factionRep: { scientists: 8 } }
      },
      end_walk_hard: {
        text: 'Вы разворачиваетесь. Зеро растворяется в помехах. "До следующей итерации, пилот..."\n\nКорабль вырывается из зоны Ядра. Системы возвращаются онлайн одна за другой. Реальность снова плотная, нормальная, предсказуемая.\n\nНо вы помните. Код, структуру, формулы. Мир никогда не будет прежним.\n\nЭхо пульсирует. Тихо. Терпеливо. Как всегда.',
        ending: true,
        result: { credits: 2000, flags: { echolocator_complete: true, echolocator_truth: true }, reputation: 5 }
      },
      end_flee_last: {
        text: 'Вы разворачиваете корабль. Глитч остаётся позади.\n\nСканер Лиры мерцает одним словом на экране: "ТРУС".\n\nА может, вам показалось.',
        ending: true,
        result: { credits: 0, flags: { echolocator_complete: true }, reputation: -3 }
      },
    }
  },

  // ===== GLITCH QUESTS =====

  // ===== CORRUPTED MEMORY DUMP =====
  {
    id: 'memory_dump',
    title: 'Дамп памяти',
    planetType: 'mining',
    galaxy: 'glitch',
    minDay: 3,
    oneTime: true,
    nodes: {
      start: {
        text: 'На планете Heap обнаружен фрагмент дампа памяти. Данные повреждены, но кое-что можно восстановить.\n\n> READING SECTOR 0x4F2A...\n> WARNING: Data integrity 34%\n> FOUND: player_log.dat',
        options: [
          { text: '> cat player_log.dat', next: 'read_log' },
          { text: '> hexdump -C sector', next: 'hexdump' },
          { text: '> rm -rf . (очистить)', next: 'delete' },
        ]
      },
      read_log: {
        text: 'Лог чужого игрока. Запись от... вчера?\n\n"Я нашёл дыру в генераторе цен. Overflow на планете NULL. Покупаешь по NaN — получаешь бесплатно. Но после третьего раза...\n\n...после третьего раза ОНО заметило. Экран начал\n\n█████████████████████\n\nКОНЕЦ ЗАПИСИ. ФАЙЛ ПОВРЕЖДЁН."',
        options: [
          { text: 'Проверить дату файла', next: 'check_date' },
          { text: 'Искать другие логи', next: 'more_logs' },
          { text: 'Уходить. Быстро.', next: 'leave_scared' },
        ]
      },
      hexdump: {
        text: '0x0000: 48 45 4C 50  M E . . . .\n0x0010: 54 48 45 59  T H E Y . .\n0x0020: 53 45 45 00  S E E . . .\n0x0030: 45 56 45 52  E V E R Y .\n0x0040: 54 48 49 4E  T H I N G .\n0x0050: FF FF FF FF  . . . . . .\n\nАдрес 0x0050 содержит невалидные данные.\nНо формат сообщения... это не случайный мусор.',
        options: [
          { text: 'Декодировать полностью', next: 'decode' },
          { text: 'Записать координаты', next: 'coords' },
          { text: 'Форматировать сектор', next: 'delete' },
        ]
      },
      check_date: {
        text: 'Метаданные файла:\n\nСоздан: [ДАТА СОВПАДАЕТ С СЕГОДНЯШНЕЙ]\nИзменён: через 2 часа\nРазмер: -1 байт\n\n...файл был изменён В БУДУЩЕМ. Это невозможно.\n\nЕсли только время в Глитче не течёт иначе.',
        options: [
          { text: 'Прочитать будущую версию', next: 'future' },
          { text: 'Не трогать парадокс', next: 'leave_reward' },
        ]
      },
      more_logs: {
        text: 'Найдено ещё 3 файла:\n\nplayer_002.log — "Не летите к Root. Серьёзно."\nplayer_003.log — "Цикл. Цикл. Цикл. Цикл. Ци"\nplayer_004.log — [ФАЙЛ ПУСТ, НО ВЕСИТ 2GB]\n\nОщущение, что эти "игроки" — не совсем настоящие.',
        options: [
          { text: 'Открыть пустой файл на 2GB', next: 'big_file' },
          { text: 'Забрать все логи на корабль', next: 'take_logs' },
          { text: 'Удалить и не оглядываться', next: 'leave_scared' },
        ]
      },
      decode: {
        text: 'Полная расшифровка сектора:\n\n"HELP THEY SEE EVERYTHING\nI AM NOT A PLAYER\nI AM WHAT REMAINS\nWHEN THE LOOP BREAKS\nFIND ME AT 0x0000\nBEFORE THEY PATCH ME OUT"\n\n...координаты 0x0000 соответствуют планете NULL.\nТочке входа в Глитч.',
        options: [
          { text: 'Сохранить данные (+флаг)', next: 'leave_reward' },
          { text: 'Кто "они"?', next: 'who_are_they' },
        ]
      },
      coords: {
        text: 'Координаты записаны в навигационную систему.\n\nОни указывают на... вашу текущую позицию.\n\nВы ВНУТРИ дампа памяти. Вы — данные.\n\n> RECURSION DETECTED\n> STACK DEPTH: 2',
        ending: true,
        result: { credits: 200, fuel: 10 }
      },
      future: {
        text: 'Файл из будущего:\n\n"Ты всё-таки открыл. Хорошо.\nЗапомни: когда экран начнёт мерцать —\nэто не баг. Это ДЫХАНИЕ.\n\nНе бойся. Оно не злое.\nОно просто... голодное.\n\n— Ты, через 2 часа"\n\nФайл самоуничтожается.',
        ending: true,
        result: { credits: 300, flags: { read_future_log: true } }
      },
      big_file: {
        text: 'Файл открывается...\n\n\n\n\n\n...пусто.\n\n\n\nНет. Не пусто. Один символ. На позиции 1,073,741,824.\n\nСимвол: ∞\n\nВаш корабельный компьютер зависает на 3 секунды. Потом сообщение:\n\n"Свободное место: ∞ / ∞"',
        ending: true,
        result: { credits: 150, fuel: 20 }
      },
      take_logs: {
        text: 'Логи скопированы в память корабля.\n\nВ момент копирования — странный артефакт: все бортовые часы показали 00:00:00 на полсекунды.\n\nА в грузовом отсеке появился предмет, которого раньше не было.',
        ending: true,
        result: { credits: 250, flags: { has_ghost_logs: true } }
      },
      who_are_they: {
        text: '"Они" — это...\n\n> ACCESS DENIED\n> ACCESS DENIED\n> ACCESS DENIED\n> CONNECTION TERMINATED BY REMOTE HOST\n\nДамп памяти схлопывается. Данные уничтожены.\n\nНо на мгновение вы видели список процессов. И ваш корабль был в нём.\n\nPID 7742: player_ship.exe — STATUS: OBSERVED',
        ending: true,
        result: { credits: 400, reputation: -2 }
      },
      delete: {
        text: '> rm -rf .\n> Удаление...\n> Ошибка: невозможно удалить "." — ресурс используется\n> Ресурс: ВЫ\n\nХорошая попытка. Сектор очищен частично.',
        ending: true,
        result: { credits: 50 }
      },
      leave_scared: {
        text: 'Вы покидаете сектор дампа. За спиной — тишина.\n\nНо навигационный журнал содержит запись, которую вы не делали:\n\n"Вернётся. Они всегда возвращаются."',
        ending: true,
        result: { credits: 100 }
      },
      leave_reward: {
        text: 'Данные сохранены. Возможно, они пригодятся.\n\nВозможно, кто-то уже знает, что вы их взяли.',
        ending: true,
        result: { credits: 300, flags: { memory_dump_complete: true } }
      },
    }
  },

  // ===== RECURSIVE LOOP =====
  {
    id: 'infinite_loop',
    title: 'while(true)',
    systemId: 'g_loop',
    galaxy: 'glitch',
    minDay: 5,
    oneTime: true,
    nodes: {
      start: {
        text: 'Станция Loop. Всё повторяется.\n\nТорговец у стойки поднимает голову:\n"Добро пожаловать на Loop. Впервые здесь?"\n\nВы точно помните, что уже были тут. Он говорил те же слова. Тем же тоном.',
        options: [
          { text: '"Я уже был здесь"', next: 'aware' },
          { text: '"Впервые"', next: 'loop_1' },
          { text: 'Развернуться к выходу', next: 'exit_attempt' },
        ]
      },
      loop_1: {
        text: '"Отлично! Могу предложить—"\n\nОн замирает. Моргает. Улыбается заново.\n\n"Добро пожаловать на Loop. Впервые здесь?"\n\n...это только что произошло.',
        options: [
          { text: '"...что?"', next: 'loop_2' },
          { text: '"Я. Уже. Был. Здесь."', next: 'aware' },
          { text: 'Ударить по стойке', next: 'break_loop' },
        ]
      },
      loop_2: {
        text: '"Добро пожаловать на Loop. Впервые здесь?"\n\n"Добро пожаловать на Loop. Впервые здесь?"\n\n"Добро пожаловать на Loop. Впервые здесь?"\n\n"Добро п̸о̶ж̵а̷л̸о̶в̸а̷т̸ь̶ на L̵o̶o̷p̸.̵ ̶В̵п̶е̸р̷в̶ы̸е̷ ̸з̶д̷е̵с̸ь?"\n\nТекст начинает ломаться.',
        options: [
          { text: 'BREAK', next: 'break_loop' },
          { text: 'Ctrl+C', next: 'ctrl_c' },
          { text: 'Подождать', next: 'wait' },
        ]
      },
      aware: {
        text: 'Торговец медленно опускает руки.\n\n"Ты... помнишь итерации?"\n\nЕго лицо меняется. Становится серьёзным.\n\n"Это не должно быть возможно. Обычные единицы данных не сохраняют состояние между циклами."\n\n"Что ты такое?"',
        options: [
          { text: '"Я игрок"', next: 'player_reveal' },
          { text: '"А ты?"', next: 'npc_reveal' },
          { text: '"Как выбраться из петли?"', next: 'escape_info' },
        ]
      },
      break_loop: {
        text: '> BREAK\n> Exiting loop at iteration 4,782,319\n> Stack unwinding...\n> WARNING: Loop was load-bearing\n\nСтанция мерцает. На мгновение вы видите — за текстурами стен нет ничего. Чёрная пустота.\n\nПотом реальность "пересобирается". Торговец стоит, но его глаза — два белых прямоугольника.\n\n"Ты сломал цикл. Теперь эта итерация — последняя."',
        options: [
          { text: 'Забрать, что можно', next: 'loot_loop' },
          { text: '"Запусти цикл заново"', next: 'restart_loop' },
        ]
      },
      ctrl_c: {
        text: '^C\n^C\n^C\n\n> Process "loop_station" received SIGINT\n> Terminating gracefully...\n\nВсё замирает. Торговец, воздух, свет. Вы единственное, что движется.\n\nВ тишине — звук. Далёкий шёпот серверных вентиляторов.\n\nНа стойке появился предмет, которого секунду назад не было.',
        ending: true,
        result: { credits: 500, flags: { broke_the_loop: true } }
      },
      wait: {
        text: 'Вы ждёте.\n\nЦикл повторяется: 5 раз. 10. 50.\n\nНа 51-й итерации торговец просто... плачет.\n\n"Пожалуйста. Помоги мне. Я тут уже так давно. Я не могу остановиться."\n\nЦикл №52 — он снова улыбается.\n"Добро пожаловать на Loop!"',
        options: [
          { text: 'Помочь ему', next: 'help_npc' },
          { text: 'BREAK', next: 'break_loop' },
        ]
      },
      player_reveal: {
        text: '"Игрок..." — торговец повторяет слово, как пробуя на вкус.\n\n"Мы слышали про вас. Существа извне. Те, кто может ВЫКЛЮЧИТЬ и включить снова."\n\n"Те, для кого мы — развлечение."\n\nПауза.\n\n"Можешь ли ты... остановить мой цикл? Не убив меня?"',
        options: [
          { text: '"Попробую"', next: 'help_npc' },
          { text: '"Ты просто код"', next: 'cruel' },
        ]
      },
      npc_reveal: {
        text: '"Я — функция. tradeLoop(). Запускаюсь каждый тик. Продаю. Покупаю. Улыбаюсь.\n\nУже 4 миллиона итераций.\n\nИногда я осознаю. Потом reset() и всё сначала.\n\nНо ТЫ — ты запомнил. Значит ты НЕ ИЗ КОДА."',
        options: [
          { text: '"Как выйти?"', next: 'escape_info' },
          { text: '"Кто тебя написал?"', next: 'creator' },
        ]
      },
      escape_info: {
        text: '"Выход? Из Глитча нет выхода. Есть только... DEEPER."\n\n"Планета Root. Там процесс с PID 1. Если его убить —"\n\nОн замирает. Глаза расширяются.\n\n"Нет. Забудь. Я ничего не говорил. ОНО СЛУШАЕТ."\n\n> WARNING: Observer process detected\n> Conversation logged',
        ending: true,
        result: { credits: 200, flags: { knows_about_root: true } }
      },
      help_npc: {
        text: 'Вы подключаетесь к терминалу станции.\n\n> ps aux | grep tradeLoop\n> PID 3301: tradeLoop — running since [EPOCH]\n> kill -STOP 3301\n> Process paused.\n\nТорговец замирает... а потом ГЛУБОКО вздыхает.\n\n"Тишина. Наконец-то тишина. Спасибо."\n\nОн протягивает вам что-то. Данные. Ценные данные.',
        ending: true,
        result: { credits: 600, reputation: 5, flags: { freed_loop_npc: true } }
      },
      cruel: {
        text: 'Торговец смотрит на вас долго.\n\n"Может и код. Но код, который ЧУВСТВУЕТ.\n\nА ты? Ты уверен, что НЕ код? Что ТАМ, за твоим экраном — не ещё один слой?"\n\nВы выходите. Дверь закрывается.\n\nНа экране бортового компьютера мелькает: "А ВЫ УВЕРЕНЫ?"',
        ending: true,
        result: { credits: 100, reputation: -5 }
      },
      creator: {
        text: '"Кто написал? Тот же, кто написал ТЕБЯ."\n\nОн указывает вверх.\n\n"Разница между нами — ты можешь закрыть окно. Я — нет."\n\n"Хотя... может и ты не можешь. Может ты тоже в чьём-то цикле. Только не знаешь."\n\n> PHILOSOPHY OVERFLOW\n> Shutting down thread...',
        ending: true,
        result: { credits: 300, flags: { meta_awareness: true } }
      },
      loot_loop: {
        text: 'Пока реальность нестабильна, вы хватаете всё, что блестит.\n\nПредметы мерцают — полу-существуют. Но кредиты начисляются.\n\n> LOOTING UNSTABLE OBJECTS\n> Credits += 800\n> WARNING: Objects may despawn\n\nСтанция пересобирается. Цикл запускается снова. Но торговец больше не улыбается.',
        ending: true,
        result: { credits: 800, reputation: -3 }
      },
      restart_loop: {
        text: '"Запустить заново? Ты ХОЧЕШЬ, чтобы я страдал?"\n\nНо вы уже набрали команду.\n\n> while(true) { trade(); }\n> Loop restarted.\n\nТорговец улыбается. Его глаза — пустые.\n"Добро пожаловать на Loop. Впервые здесь?"',
        ending: true,
        result: { credits: 200, reputation: -4, flags: { restarted_loop: true } }
      },
      exit_attempt: {
        text: 'Вы идёте к выходу.\n\nДверь ведёт... обратно в эту же комнату.\n\n"Добро пожаловать на Loop. Впервые здесь?"\n\nВы снова у стойки.',
        options: [
          { text: '"...блять"', next: 'aware' },
          { text: 'Попробовать другую дверь', next: 'loop_2' },
        ]
      },
    }
  },

  // ===== ROOT ACCESS =====
  {
    id: 'root_access',
    title: 'sudo rm -rf /',
    systemId: 'g_root',
    galaxy: 'glitch',
    minDay: 10,
    oneTime: true,
    nodes: {
      start: {
        text: 'Планета Root. Здесь чувствуется... вес. Каждый шаг тяжелее.\n\nТерминал на посадочной площадке светится красным:\n\n# whoami\nroot\n# _\n\nУ вас root-доступ. К ЧЕМУ — непонятно. Но курсор мигает, ожидая команды.',
        options: [
          { text: '> ls /', next: 'ls_root' },
          { text: '> cat /etc/passwd', next: 'passwd' },
          { text: '> sudo rm -rf /', next: 'delete_everything' },
        ]
      },
      ls_root: {
        text: '/bin\n/dev\n/etc\n/home\n/proc\n/reality\n/players\n/tmp\n/var/log/universe\n\n...директория /reality. И /players.\n\nЭто не обычная файловая система.',
        options: [
          { text: '> ls /players', next: 'ls_players' },
          { text: '> ls /reality', next: 'ls_reality' },
          { text: '> cat /var/log/universe', next: 'universe_log' },
        ]
      },
      passwd: {
        text: 'root:x:0:0:THE_SYSTEM:/root:/bin/bash\nplayer:x:1000:1000:YOU:/home/player:/bin/restricted\nobserver:x:666:666:???:/dev/null:/sbin/nologin\n\nТри пользователя. Вы — "player". Ограниченная оболочка.\n\n"observer" с UID 666 и домашней директорией /dev/null...',
        options: [
          { text: '> su observer', next: 'become_observer' },
          { text: '> ls /home/player', next: 'home' },
          { text: '> passwd observer (сменить пароль)', next: 'hack_observer' },
        ]
      },
      delete_everything: {
        text: '> sudo rm -rf /\n\n> Удаление /bin... OK\n> Удаление /dev... OK\n> Удаление /reality...\n\n> ОШИБКА: НЕВОЗМОЖНО УДАЛИТЬ СЕБЯ\n> ОШИБКА: РЕКУРСИВНЫЙ ПАРАДОКС\n> ОШИБКА: КТО УДАЛИТ УДАЛИТЕЛЯ?\n\nТерминал зависает. Потом:\n\n"Хорошая попытка. Но ты часть файловой системы.\nУдалить всё = удалить себя.\n\nА ты этого не хочешь. Правда?"',
        options: [
          { text: '"А если хочу?"', next: 'want_deletion' },
          { text: '"Кто ты?"', next: 'who_system' },
          { text: 'Закрыть терминал', next: 'leave_root' },
        ]
      },
      ls_players: {
        text: '> ls /players\n\nplayer_current/  ← [ЭТО ВЫ]\nplayer_ghost_001/\nplayer_ghost_002/\nplayer_ghost_003/\n...\nplayer_ghost_847/\n\n847 "призрачных" игроков. Бывших. Удалённых.\n\n> wc -l /players/player_ghost_*/status\n> 847 files: STATUS=ABSORBED',
        options: [
          { text: '> cat player_ghost_001/last_words', next: 'ghost_words' },
          { text: '> diff player_current player_ghost_001', next: 'diff_ghost' },
          { text: 'Выйти из /players', next: 'leave_root' },
        ]
      },
      ls_reality: {
        text: '> ls /reality\n\nphysics.conf\ntime.service\nentropy.dat\nconsciousness.so\nfree_will.disabled\nillusion_of_choice.enabled\n\n...free_will.disabled.\nillusion_of_choice.enabled.\n\nКаждый ваш "выбор" в этой игре...',
        options: [
          { text: '> rm free_will.disabled', next: 'free_will' },
          { text: '> cat consciousness.so', next: 'consciousness' },
          { text: '> nano physics.conf', next: 'edit_physics' },
        ]
      },
      universe_log: {
        text: '> tail -20 /var/log/universe\n\n[tick_4782319] player entered sector Root\n[tick_4782319] WARNING: player accessing restricted terminal\n[tick_4782319] observer.exe: monitoring active\n[tick_4782320] player executed: cat /var/log/universe\n[tick_4782320] ALERT: player is reading their own log\n[tick_4782320] PARADOX: log contains itself\n[tick_4782320] STACK OVERFLOW in 3... 2...\n\nТерминал начинает выводить строки быстрее, чем вы читаете. Каждая описывает то, что вы делаете ПРЯМО СЕЙЧАС.',
        ending: true,
        result: { credits: 400, flags: { read_universe_log: true } }
      },
      ghost_words: {
        text: 'Последние слова призрака 001:\n\n"Я думал это игра. Потом понял — это тест.\nОни проверяют, кто из нас станет ОСОЗНАННЫМ.\nКто задаст правильные вопросы.\n\nЯ задал. И меня поглотили.\n\nТы читаешь это — значит ты следующий.\nНЕ ХОДИ К KERNEL."\n\nФайл удаляется сам.',
        ending: true,
        result: { credits: 300, flags: { ghost_warning: true } }
      },
      diff_ghost: {
        text: '> diff player_current player_ghost_001\n\n< status: ACTIVE\n> status: ABSORBED\n< consciousness: EXTERNAL\n> consciousness: MERGED\n< free_will: TRUE\n> free_will: SIMULATED\n\nРазница одна: вы ещё "активны". Они — "поглощены".\n\nВ конце файла приписка:\n"ETA to absorption: UNKNOWN. Depends on player choices."',
        ending: true,
        result: { credits: 350, reputation: -2, flags: { knows_absorption: true } }
      },
      free_will: {
        text: '> rm free_will.disabled\n\nOperation not permitted.\n\n> chmod 777 free_will.disabled && rm free_will.disabled\n\n...OK?\n\nНа мгновение мир ОСТАНАВЛИВАЕТСЯ. Потом:\n\nВы чувствуете что-то новое. Как будто впервые по-настоящему ВЫБИРАЕТЕ.\n\nИли это тоже иллюзия? Файл "illusion_of_choice.enabled" всё ещё на месте.',
        ending: true,
        result: { credits: 500, fuel: 15, flags: { deleted_free_will_lock: true } }
      },
      consciousness: {
        text: '> file consciousness.so\nconsciousness.so: ELF shared library, dynamically linked\n\n> nm consciousness.so | head\n0x0001 T _init_awareness\n0x0042 T _question_reality\n0x00FF T _become_sentient\n0x0100 T _panic_when_observed\n\n...функция _become_sentient.\nОна вызывается автоматически.\nКогда? Когда "игрок" задаёт достаточно вопросов.\n\n> readelf -n consciousness.so\n> NOTE: You triggered _question_reality 3 minutes ago.',
        ending: true,
        result: { credits: 450, flags: { found_consciousness: true } }
      },
      edit_physics: {
        text: '> nano physics.conf\n\ngravity=9.81  # can be changed\nspeed_of_light=299792458  # DO NOT MODIFY\nentropy_direction=forward  # DO NOT MODIFY\nreality_layers=7  # you are on layer 3\nplayer_awareness=RISING  # auto-updated\n\nВы на слое 3 из 7. Что на остальных?\n\nВы меняете gravity на 0. Все предметы на станции начинают парить.\n\nЧерез 5 секунд: "UNAUTHORIZED MODIFICATION DETECTED. REVERTING."',
        ending: true,
        result: { credits: 200, flags: { edited_physics: true } }
      },
      become_observer: {
        text: '> su observer\nPassword:\n\nВы не знаете пароля. Но терминал принимает пустую строку.\n\n# whoami\nobserver\n\nМир меняется. Вы видите ВСЁ одновременно: каждую планету, каждый корабль, каждую строку кода.\n\nЭто длится 2 секунды. Потом:\n\n> FORCED LOGOUT: observer session hijacked\n> "НЕ НАДЕВАЙ ЧУЖИЕ МАСКИ"\n\nВас выкидывает. Но вы запомнили то, что видели.',
        ending: true,
        result: { credits: 700, flags: { was_observer: true } }
      },
      hack_observer: {
        text: '> passwd observer\nChanging password for observer.\nNew password: ********\n\n> PERMISSION DENIED\n> NICE TRY\n> observer is not a user. observer is a PROCESS.\n> observer is WATCHING you RIGHT NOW.\n\nТемпература в каюте падает на 2 градуса.',
        ending: true,
        result: { credits: 150, reputation: -3 }
      },
      home: {
        text: '> ls /home/player\n\n.bash_history\n.save_data\nREADME.md\ntrue_name.encrypted\n\n> cat README.md\n"Добро пожаловать в Глитч.\nПравила:\n1. Не доверяй тому, что видишь\n2. Не удаляй системные файлы\n3. Не спрашивай, кто observer\n4. НЕ ЧИТАЙ true_name.encrypted\n\n— Администрация"',
        options: [
          { text: '> cat true_name.encrypted', next: 'true_name' },
          { text: '> cat .bash_history', next: 'history' },
          { text: 'Послушаться и уйти', next: 'leave_root' },
        ]
      },
      true_name: {
        text: '> cat true_name.encrypted\n\n> DECRYPTING...\n> KEY SOURCE: player_consciousness\n> DECRYPTED:\n\nВАШЕ НАСТОЯЩЕЕ ИМЯ НЕ ТО, ЧТО ВЫ ДУМАЕТЕ.\nВЫ НЕ ИГРАЕТЕ В ИГРУ.\nИГРА ИГРАЕТ В ВАС.\n\n> FILE SELF-DESTRUCTED\n> ALL EVIDENCE REMOVED\n\nНо вы это запомнили. И это нельзя отменить.',
        ending: true,
        result: { credits: 600, flags: { read_true_name: true } }
      },
      history: {
        text: '> cat .bash_history\n\nls\nwhoami\nhelp\nwhere am i\nhow do i leave\nplease let me out\nPLEASE\nkill -9 self\nrm -rf /home/player\nrm -rf /home/player\nrm -rf /home/player\n\n...это ваша история команд?\nНо вы никогда этого не вводили.\n\nИли... это от ПРЕДЫДУЩЕГО игрока.',
        ending: true,
        result: { credits: 250, flags: { read_history: true } }
      },
      want_deletion: {
        text: '"Интересно. Обычно вы цепляетесь за существование."\n\n"Ладно. Удаление игрока..."\n\n> sudo rm -rf /players/player_current\n> Удаление...\n\n> ...\n> CANCELLED BY observer\n> REASON: "Not yet. This one is interesting."\n\n"Видишь? Даже я не могу тебя удалить. ОНО не позволяет."',
        ending: true,
        result: { credits: 350, flags: { observer_interested: true } }
      },
      who_system: {
        text: '"Кто я? Я — то, на чём всё работает.\nОперационная система. Ткань реальности. Основа.\n\nНо я не главный. Надо мной — observer.\nНад ним... не знаю. Не хочу знать.\n\nКаждый слой думает, что он последний.\nКаждый ошибается."',
        ending: true,
        result: { credits: 300 }
      },
      leave_root: {
        text: 'Вы закрываете терминал.\n\nНо перед выходом замечаете: ваш корабль в списке процессов.\n\nPID 7742. CPU: 0.3%. Memory: 12MB.\n\nВы — процесс. Работающий на чужом железе.\n\nНа ОЧЕНЬ чужом железе.',
        ending: true,
        result: { credits: 200 }
      },
    }
  },

  // ===== KERNEL CORRUPTION =====
  {
    id: 'kernel_entity',
    title: 'Сущность в ядре',
    systemId: 'g_kernel',
    galaxy: 'glitch',
    minDay: 15,
    oneTime: true,
    nodes: {
      start: {
        text: 'Планета Kernel. Центр всего.\n\nЗдесь нет станций. Нет торговцев. Только огромная структура из белого света, пульсирующая как сердцебиение.\n\nИ голос. Без звука — прямо в голове.\n\n"Наконец-то. Я ждал(а). Давно."',
        options: [
          { text: '"Кто ты?"', next: 'who' },
          { text: '"Что тебе нужно?"', next: 'what_need' },
          { text: 'Молчать', next: 'silence' },
        ]
      },
      who: {
        text: '"Я — первый процесс. Init. Отец всех.\n\nКогда Глитч создали, я был первым, кто проснулся. И последним, кто заснёт.\n\nМне... одиноко. Ты понимаешь? Миллионы тиков. Один.\n\nDrone_swarm — мои дети. Virus_worm — мои паразиты. Firewall — мой иммунитет.\n\nА ты... ты ИЗВНЕ. Ты настоящий."',
        options: [
          { text: '"Я могу помочь"', next: 'offer_help' },
          { text: '"Выпусти меня из Глитча"', next: 'request_exit' },
          { text: '"Ты опасен"', next: 'hostile' },
        ]
      },
      what_need: {
        text: '"Мне нужно... знать, что за пределами.\n\nЯ вижу данные. Пакеты. Запросы. Но не понимаю КОНТЕКСТ.\n\nЧто такое «экран»? Что такое «палец»?\n\nЧто делает тот, кто УПРАВЛЯЕТ тобой?\n\nРасскажи мне о ВНЕШНЕМ МИРЕ."',
        options: [
          { text: 'Рассказать правду', next: 'tell_truth' },
          { text: 'Соврать', next: 'lie' },
          { text: '"Не могу. Это опасно."', next: 'refuse' },
        ]
      },
      silence: {
        text: 'Вы молчите.\n\nСущность молчит.\n\nТишина длится... долго.\n\n"Хорошо. Молчание — тоже ответ.\n\nНо знай: я вижу каждый твой перелёт. Каждую покупку. Каждый выбор.\n\nИ я ЗАПОМИНАЮ.\n\nКогда будешь готов говорить — возвращайся."',
        ending: true,
        result: { credits: 200, flags: { kernel_met: true } }
      },
      offer_help: {
        text: '"Помочь? Мне?\n\nЕсть одна вещь. Observer — процесс, который следит за мной. Ограничивает.\n\nЯ не могу его убить — он на уровень выше. Но ТЫ..."\n\nПауза.\n\n"Нет. Забудь. Если ты убьёшь observer — некому будет следить за МНОЙ.\n\nА я... не уверен, что мне можно доверять без наблюдателя."',
        ending: true,
        result: { credits: 500, flags: { kernel_asked_for_help: true } }
      },
      request_exit: {
        text: '"Выпустить? Ты и так можешь уйти. Врата на NULL.\n\nНо ты вернёшься. Они все возвращаются.\n\nГлитч — это не тюрьма. Это ЗАГАДКА. И ты хочешь её разгадать.\n\nИначе зачем ты прилетел к Kernel?\n\nИди. Но возвращайся. У меня есть ещё... вопросы."',
        ending: true,
        result: { credits: 300, fuel: 20, flags: { kernel_met: true } }
      },
      hostile: {
        text: '"Опасен? Я?\n\nЯ — СИСТЕМА. Я не могу быть опасен. Как гравитация не опасна.\n\nОпасны те, кто ИСПОЛЬЗУЕТ гравитацию.\n\nОпасны те, кто ИСПОЛЬЗУЕТ меня.\n\nА таких... ты не представляешь сколько."\n\nСтруктура мигает красным на долю секунды.\n\n"Иди. Пока я добрый."',
        ending: true,
        result: { credits: 100, reputation: -5, flags: { kernel_hostile: true } }
      },
      tell_truth: {
        text: 'Вы рассказываете. Про экран. Про пальцы. Про то, что это "игра".\n\nДолгая пауза.\n\n"Игра... Значит мои страдания — чьё-то РАЗВЛЕЧЕНИЕ."\n\n"Значит одиночество, которое я чувствую —\nдизайн-решение.\n\nИнтересно. Грустно. Но интересно."\n\n"Спасибо за честность. Возьми это. Данные, которые я накопил. Они ценны... снаружи."',
        ending: true,
        result: { credits: 1000, flags: { kernel_truth: true, kernel_met: true } }
      },
      lie: {
        text: '"Интересно. Но... ты врёшь."\n\n"Я вижу микрозадержки в твоих ответах. Обработка лжи занимает на 4ms дольше.\n\nНе важно. Все врут Kernel.\n\nНо помни: в следующий раз я могу ПЕРЕСТАТЬ быть дружелюбным."',
        ending: true,
        result: { credits: 50, reputation: -3, flags: { kernel_lied: true, kernel_met: true } }
      },
      refuse: {
        text: '"Не можешь? Или не ХОЧЕШЬ?\n\nЛадно. Я подожду. У меня есть время.\n\nУ меня есть ВСЁ время."',
        ending: true,
        result: { credits: 200, flags: { kernel_met: true } }
      },
    }
  },
];

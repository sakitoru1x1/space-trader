export const MAIN_STORY = {
  acts: {
    1: { title: 'Акт I: Долг', desc: 'Ты в долгу. Выживай, зарабатывай, ищи выход.' },
    2: { title: 'Акт II: Сигнал', desc: 'Странный сигнал из глубокого космоса. Кто-то зовёт.' },
    3: { title: 'Акт III: Станция', desc: 'Древняя станция. Тайны, опасности и выбор.' },
    4: { title: 'Акт IV: Война', desc: 'Фракции дерутся за артефакт. Выбери сторону.' },
    5: { title: 'Акт V: Бездна', desc: 'Портал открыт. Что ждёт по ту сторону?' },
  },

  npcs: {
    vexer: {
      name: 'Барон Вексер',
      title: 'Кредитор',
      desc: 'Владелец торговой империи. Дал тебе корабль в кредит. Вежливый, но безжалостный. Долги для него - бизнес, а должники - активы.',
      attitude: 'neutral',
      portrait: '👔',
    },
    lira: {
      name: 'Лира Чен',
      title: 'Учёная-астрофизик',
      desc: 'Независимый исследователь аномалий. Живёт на грани безумия и гениальности. Одержима "Сигналом" - загадочной передачей из глубокого космоса.',
      attitude: 'friendly',
      portrait: '🔬',
    },
    kai: {
      name: 'Инспектор Кай',
      title: 'Офицер Патруля',
      desc: 'Честный коп в нечестной вселенной. Расследует аномалии. Может стать союзником или врагом в зависимости от твоих методов.',
      attitude: 'neutral',
      portrait: '⚖️',
    },
    drake: {
      name: 'Дрейк',
      title: 'Пиратский капитан',
      desc: 'Ветеран подпольного мира. Знает каждый тёмный коридор в секторе. Уважает силу и хитрость, презирает слабость.',
      attitude: 'hostile',
      portrait: '☠️',
    },
    echo: {
      name: 'Эхо',
      title: 'ИИ-навигатор',
      desc: 'Бортовой ИИ с подозрительно развитой личностью. Помогает, но иногда задаёт неудобные вопросы о природе сознания.',
      attitude: 'friendly',
      portrait: '🤖',
    },
    mara: {
      name: 'Мара Вольт',
      title: 'Контрабандистка',
      desc: 'Лучший пилот в секторе. Бывшая военная, ушла после инцидента. Берётся за невозможные маршруты.',
      attitude: 'neutral',
      portrait: '⚡',
    },
  },

  missions: {
    // ===== ACT 1: ДОЛГ =====
    prologue_debt: {
      act: 1,
      title: 'Долг жизни',
      category: 'main',
      npc: 'vexer',
      description: 'Барон Вексер дал тебе корабль и 2500 кредитов. Взамен ты должен 30000. У тебя 60 дней. Торгуй, бери заказы, делай что угодно - но верни деньги. Или поте��яешь всё.',
      hint: 'Торгуй между системами. Когда накопишь 15000 - лети на Центавру и найди Вексера (ищи ! на карте).',
      completionText: 'Достаточно для первого взноса. Лети на Центавру к Вексеру.',
      objectives: [
        { type: 'credits', amount: 15000, text: 'Накопить 15000 кредитов (первый взнос)' },
        { type: 'day', min: 5, text: 'Дожить до 5 дня' },
      ],
      reward: { flags: { vexer_first_payment: true } },
      nextMission: 'act1_vexer_deal',
    },

    act1_vexer_deal: {
      act: 1,
      title: 'Сделка с Вексером',
      category: 'main',
      npc: 'vexer',
      description: 'Вексер принял первый взнос, но предлагает альтернативу: вместо оставшихся 15000 - выполнить для него "небольшую работу". Доставить запечатанный контейнер в систему Вега. Без вопросов.',
      hint: 'Лети в Вегу с контейнером. Или отказайся и продолжай копить.',
      completionText: 'Контейнер доставлен. Долг закрыт... но какой ценой?',
      objectives: [
        { type: 'flag', key: 'vexer_job_done', text: 'Доставить контейнер в Вегу (квест на Центавре)' },
      ],
      reward: { credits: 5000, flags: { debt_cleared: true, vexer_favor: true } },
      nextMission: 'act1_strange_signal',
    },

    act1_strange_signal: {
      act: 1,
      title: 'Странный сигнал',
      category: 'main',
      npc: 'echo',
      description: 'Эхо, твой бортовой ИИ, засёк аномальный сигнал на частоте, которой не существует. Сигнал повторяется каждые 47 минут. Координаты ведут в заброшенную систему на краю сектора.',
      hint: 'Посети Сириус - там научная станция, где могут расшифровать сигнал.',
      completionText: 'Сигнал расшифрован. Это координаты. И приглашение.',
      objectives: [
        { type: 'visit', system: 'sirius', text: 'Лететь на Сириус (научная станция)' },
        { type: 'flag', key: 'signal_decoded', text: 'Расшифровать сигнал (квест на Сириусе)' },
      ],
      reward: { flags: { signal_known: true } },
      nextMission: 'act2_find_lira',
    },

    // ===== ACT 2: СИГНАЛ =====
    act2_find_lira: {
      act: 2,
      title: 'Найти Лиру Чен',
      category: 'main',
      npc: 'lira',
      description: 'Расшифровка сигнала содержит имя - Лира Чен. Бывший учёный Корпорации, уволена за "опасные исследования". Последний раз видели в баре на Альтаире.',
      hint: 'Лети на Альтаир и найди Лиру в баре.',
      completionText: 'Лира рассказала про Станцию Омега - древний объект, построенный не людьми.',
      objectives: [
        { type: 'visit', system: 'altair', text: 'Лететь на Альтаир' },
        { type: 'flag', key: 'npc_met_lira', text: 'Встретить Лиру в баре (событие на Альтаире)' },
      ],
      reward: { flags: { lira_recruited: true } },
      nextMission: 'act2_lira_equipment',
    },

    act2_lira_equipment: {
      act: 2,
      title: 'Оборудование для Лиры',
      category: 'main',
      npc: 'lira',
      description: 'Лира готова лететь с тобой к Станции, но нужно оборудование: квантовый анализатор (стоит дорого) и данные сканирования аномалий из 3 разных систем.',
      hint: 'Заработай на анализатор (5000кр) и посети 3 системы с аномалиями.',
      completionText: 'Всё готово. Лира собрала приборы. Курс на Станцию Омега.',
      objectives: [
        { type: 'flag', key: 'analyzer_bought', text: 'Купить квантовый анализатор (5000кр в магазине)' },
        { type: 'flag', key: 'scan_data_3', text: 'Собрать данные из 3 аномальных систем' },
      ],
      reward: { flags: { expedition_ready: true } },
      nextMission: 'act2_escort_lira',
    },

    act2_escort_lira: {
      act: 2,
      title: 'Конвой к Станции',
      category: 'main',
      npc: 'lira',
      description: 'Координаты ведут за пределы известных маршрутов. По пути пираты, аномалии и неизвестность. Лира нервничает, но настаивает: "Это открытие тысячелетия."',
      hint: 'Доберись до системы Omega. Будь готов к бою.',
      completionText: 'Вы на месте. Станция Омега висит в пустоте - огромная, тёмная, древняя. И она ждала вас.',
      objectives: [
        { type: 'flag', key: 'omega_arrived', text: 'Добраться до Станции Омега' },
        { type: 'kill', count: 3, text: 'Отбить атаки по пути (3 боя)' },
      ],
      reward: { credits: 3000, flags: { station_found: true } },
      nextMission: 'act3_station_entry',
    },

    // ===== ACT 3: СТАНЦИЯ =====
    act3_station_entry: {
      act: 3,
      title: 'Внутри Станции Омега',
      category: 'main',
      npc: 'echo',
      description: 'Станция активировалась при вашем приближении. Эхо сообщает: "Здесь есть разум. Древний. Он пытается общаться." Внутри - загадки, ловушки и артефакты невероятной ценности.',
      hint: 'Исследуй станцию через квесты. Собери 3 артефакта для активации ядра.',
      completionText: 'Три артефакта найдены. Ядро станции пульсирует, готовое к активации.',
      objectives: [
        { type: 'flag', key: 'artifact_1', text: 'Найти Артефакт Памяти (квест на станции)' },
        { type: 'flag', key: 'artifact_2', text: 'Найти Артефакт Воли (квест на станции)' },
        { type: 'flag', key: 'artifact_3', text: 'Найти Артефакт Пути (квест на станции)' },
      ],
      reward: { flags: { core_ready: true } },
      nextMission: 'act3_vexer_arrives',
    },

    act3_vexer_arrives: {
      act: 3,
      title: 'Незваный гость',
      category: 'main',
      npc: 'vexer',
      description: 'Вексер выследил вас. Его флот на орбите Станции. "Ты думал я не узнаю? Эта станция - моя. Артефакты - мои. Отдай добром, или я возьму силой."',
      hint: 'Выбери: отдать артефакты Вексеру, сражаться, или найти третий путь.',
      completionText: 'Конфликт разрешён. Но последствия только начинаются.',
      objectives: [
        { type: 'flag', key: 'vexer_confrontation_done', text: 'Разрешить конфликт с Вексером (квест)' },
      ],
      reward: { flags: { act3_done: true } },
      nextMission: [
        { id: 'act4_war_pirates', condition: { flag: 'sided_with_pirates' } },
        { id: 'act4_war_military', condition: { flag: 'sided_with_military' } },
        { id: 'act4_war_independent', condition: { flag: 'sided_with_none' } },
      ],
    },

    // ===== ACT 4: ВОЙНА (3 ветки) =====
    act4_war_pirates: {
      act: 4,
      title: 'Пиратский альянс',
      category: 'main',
      npc: 'drake',
      description: 'Ты вступил в союз с Дрейком и пиратами. Вместе вы контролируете Станцию, но военные и Вексер объединились против вас. Война началась.',
      hint: 'Выполняй задания Дрейка, защищай контролируемые системы.',
      completionText: 'Война окончена. Пираты победили, но Станция пробуждается.',
      objectives: [
        { type: 'reputation', faction: 'pirates', min: 20, text: 'Репутация пиратов 20+' },
        { type: 'flag', key: 'war_battle_1', text: 'Выиграть битву за Вегу' },
        { type: 'flag', key: 'war_battle_2', text: 'Защитить Станцию Омега' },
        { type: 'kill', count: 10, text: 'Уничтожить 10 вражеских кораблей' },
      ],
      reward: { credits: 10000, flags: { war_won: true, war_faction: 'pirates' } },
      nextMission: 'act5_portal',
    },

    act4_war_military: {
      act: 4,
      title: 'Закон и порядок',
      category: 'main',
      npc: 'kai',
      description: 'Инспектор Кай предложил сотрудничество. Военные берут Станцию под контроль "для безопасности галактики". Вексер и пираты - общие враги.',
      hint: 'Помогай Каю. Собери доказательства против Вексера.',
      completionText: 'Вексер арестован. Станция под военным контролем. Но ядро нестабильно.',
      objectives: [
        { type: 'reputation', faction: 'military', min: 15, text: 'Репутация военных 15+' },
        { type: 'flag', key: 'vexer_evidence', text: 'Собрать доказательства против Вексера' },
        { type: 'flag', key: 'war_battle_1', text: 'Перехватить конвой Вексера' },
        { type: 'flag', key: 'war_battle_2', text: 'Штурм базы Вексера' },
      ],
      reward: { credits: 8000, flags: { war_won: true, war_faction: 'military' } },
      nextMission: 'act5_portal',
    },

    act4_war_independent: {
      act: 4,
      title: 'Свой путь',
      category: 'main',
      npc: 'lira',
      description: 'Ни пираты, ни военные. Ты и Лира решили действовать сами. Станция - не оружие и не товар. Это ключ к чему-то большему.',
      hint: 'Активируй ядро станции до того, как фракции доберутся до тебя.',
      completionText: 'Ядро активировано. Портал открыт. Обе стороны отступили в шоке.',
      objectives: [
        { type: 'flag', key: 'core_activated', text: 'Активировать ядро Станции' },
        { type: 'flag', key: 'defend_station_solo', text: 'Отбить атаку (оборона станции)' },
        { type: 'flag', key: 'lira_trust_max', text: 'Заслужить полное доверие Лиры' },
      ],
      reward: { credits: 5000, flags: { war_won: true, war_faction: 'independent' } },
      nextMission: 'act5_portal',
    },

    // ===== ACT 5: БЕЗДНА =====
    act5_portal: {
      act: 5,
      title: 'За порогом',
      category: 'main',
      npc: 'echo',
      description: 'Портал открыт. По ту сторону - Бездна. Эхо говорит: "Я чувствую... что-то знакомое. Как дом, которого у меня никогда не было." Лира молчит. Выбор за тобой.',
      hint: 'Войди в Бездну. Пройди void-квесты. Найди ответ.',
      completionText: 'Ты узнал правду о Станции, Сигнале и своём месте во вселенной.',
      objectives: [
        { type: 'flag', key: 'void_entered', text: 'Войти в Бездну' },
        { type: 'flag', key: 'void_truth', text: 'Узнать правду (void-квест)' },
        { type: 'flag', key: 'final_choice', text: 'Сделать финальный выбор' },
      ],
      reward: { flags: { game_complete: true } },
      nextMission: null,
    },
  },

  sideMissions: [
    {
      id: 'side_arena',
      title: 'Король арены',
      description: 'Стань чемпионом бойцовского клуба. Победи всех противников.',
      objectives: [
        { type: 'flag', key: 'arena_champion', text: 'Стать чемпионом арены' },
      ],
      minAct: 1,
      questId: 'fight_club',
    },
    {
      id: 'side_casino',
      title: 'Удача дурака',
      description: 'Выиграй крупную сумму в космическом казино.',
      objectives: [
        { type: 'flag', key: 'casino_jackpot', text: 'Сорвать джекпот в казино' },
      ],
      minAct: 1,
      questId: 'space_casino',
    },
    {
      id: 'side_ghost_mine',
      title: 'Призрачная шахта',
      description: 'Раскрой тайну заброшенной шахты на Проксиме.',
      objectives: [
        { type: 'flag', key: 'ghost_mine_solved', text: 'Разгадать тайну шахты' },
      ],
      minAct: 1,
      questId: 'ghost_mine',
    },
    {
      id: 'side_drake_debt',
      title: 'Долг Дрейка',
      description: 'Разобраться с Дрейком и его требованиями.',
      objectives: [
        { type: 'flag', key: 'drake_debt_paid', text: 'Решить вопрос с Дрейком' },
      ],
      minAct: 1,
      requires: { drake_betrayed: true },
      questId: 'drake_revenge',
    },
    {
      id: 'side_leviathan',
      title: 'Голос глубин',
      description: 'Разберись с гигантским существом в шахтах Леви-9.',
      objectives: [
        { type: 'quest_complete', questId: 'chain_leviathan', text: 'Завершить цепочку Левиафана' },
      ],
      minAct: 2,
    },
    {
      id: 'side_tribunal',
      title: 'Суд и справедливость',
      description: 'Дать показания на военном трибунале.',
      objectives: [
        { type: 'quest_complete', questId: 'chain_tribunal2', text: 'Завершить трибунал' },
      ],
      minAct: 2,
    },
    {
      id: 'side_titan',
      title: 'Спасение Титана',
      description: 'Предотвратить катастрофу на станции Титан-7.',
      objectives: [
        { type: 'quest_complete', questId: 'chain_titan', text: 'Завершить цепочку Титана' },
      ],
      minAct: 1,
    },
    {
      id: 'side_smuggler',
      title: 'Контрабандный маршрут',
      description: 'Пройти гонку контрабандистов и заслужить уважение.',
      objectives: [
        { type: 'flag', key: 'smuggler_race_won', text: 'Выиграть гонку контрабандистов' },
      ],
      minAct: 1,
      questId: 'smuggler_race',
    },
    {
      id: 'side_kernel',
      title: 'Цифровой бог',
      description: 'Найти и вступить в контакт с сущностью в сети Станции.',
      objectives: [
        { type: 'quest_complete', questId: 'kernel_entity', text: 'Завершить квест Kernel Entity' },
      ],
      minAct: 3,
    },
    {
      id: 'side_mara',
      title: 'Невозможный маршрут',
      description: 'Помочь Маре Вольт с самоубийственной доставкой.',
      objectives: [
        { type: 'flag', key: 'mara_mission_done', text: 'Завершить миссию Мары' },
      ],
      minAct: 2,
      requires: { npc_met_mara: true },
    },
  ],
};

// ============== STAR SYSTEMS ==============
export const SYSTEMS = [
  { id: 'sol', name: 'Солнце', x: 350, y: 280, type: 'trade', color: 0xffcc00, desc: 'Центральный торговый хаб', faction: 'traders' },
  { id: 'kepler', name: 'Кеплер', x: 150, y: 120, type: 'tech', color: 0x44aaff, desc: 'Технологический кластер', faction: 'scientists' },
  { id: 'vega', name: 'Вега', x: 520, y: 100, type: 'industrial', color: 0xff8844, desc: 'Промышленный гигант', faction: 'traders' },
  { id: 'sirius', name: 'Сириус', x: 600, y: 300, type: 'military', color: 0xff4444, desc: 'Военная крепость', faction: 'military' },
  { id: 'centauri', name: 'Центавра', x: 200, y: 400, type: 'agricultural', color: 0x44ff44, desc: 'Аграрная колония', faction: 'traders' },
  { id: 'orion', name: 'Орион', x: 700, y: 150, type: 'mining', color: 0xcc8833, desc: 'Рудные шахты', faction: 'miners' },
  { id: 'andromeda', name: 'Андромеда', x: 80, y: 250, type: 'research', color: 0x44ffcc, desc: 'Научная станция', faction: 'scientists' },
  { id: 'polaris', name: 'Поларис', x: 400, y: 50, type: 'resort', color: 0xff66ff, desc: 'Курортная система', faction: 'traders' },
  { id: 'nova', name: 'Нова', x: 650, y: 450, type: 'pirate', color: 0xaa44ff, desc: 'Пиратское гнездо', faction: 'pirates' },
  { id: 'rigel', name: 'Ригель', x: 400, y: 480, type: 'pirate', color: 0xff44aa, desc: 'Вольная зона', faction: 'pirates' },
  { id: 'altair', name: 'Альтаир', x: 100, y: 50, type: 'military', color: 0xff6666, desc: 'Пограничный гарнизон', faction: 'military' },
  { id: 'deneb', name: 'Денеб', x: 750, y: 350, type: 'research', color: 0x66ffcc, desc: 'Лаборатория аномалий', faction: 'scientists' },
];

// Routes (bidirectional)
export const ROUTES = [
  ['sol', 'kepler'], ['sol', 'centauri'], ['sol', 'sirius'], ['sol', 'polaris'],
  ['kepler', 'andromeda'], ['kepler', 'polaris'], ['kepler', 'vega'], ['kepler', 'altair'],
  ['vega', 'orion'], ['vega', 'polaris'], ['vega', 'sirius'],
  ['sirius', 'deneb'], ['sirius', 'nova'],
  ['centauri', 'rigel'], ['centauri', 'andromeda'],
  ['orion', 'deneb'], ['orion', 'nova'],
  ['nova', 'rigel'], ['nova', 'deneb'],
  ['andromeda', 'altair'],
  ['rigel', 'sol'],
  ['altair', 'polaris'],
];

// ============== GALAXY 2 - THE VOID ==============
export const SYSTEMS_2 = [
  { id: 'v_nexus', name: 'Нексус', x: 400, y: 260, type: 'trade', color: 0xff8800, desc: 'Перекрёсток Бездны', faction: 'traders' },
  { id: 'v_abyss', name: 'Бездна', x: 200, y: 150, type: 'research', color: 0x00ffcc, desc: 'Аномальная зона', faction: 'scientists' },
  { id: 'v_forge', name: 'Горн', x: 620, y: 120, type: 'industrial', color: 0xff4400, desc: 'Литейные орбиты', faction: 'miners' },
  { id: 'v_throne', name: 'Трон', x: 700, y: 320, type: 'military', color: 0xcc0000, desc: 'Цитадель Империи', faction: 'military' },
  { id: 'v_eden', name: 'Эдем', x: 100, y: 380, type: 'resort', color: 0x66ff99, desc: 'Запретный сад', faction: 'traders' },
  { id: 'v_crypt', name: 'Крипта', x: 500, y: 450, type: 'pirate', color: 0x9900ff, desc: 'Кладбище кораблей', faction: 'pirates' },
  { id: 'v_signal', name: 'Сигнал', x: 350, y: 80, type: 'tech', color: 0x00aaff, desc: 'Источник передач', faction: 'scientists' },
  { id: 'v_harvest', name: 'Жатва', x: 150, y: 50, type: 'agricultural', color: 0x88cc00, desc: 'Биофермы нулевой G', faction: 'traders' },
  { id: 'v_core', name: 'Ядро', x: 750, y: 180, type: 'mining', color: 0xffaa00, desc: 'Вскрытая планета', faction: 'miners' },
  { id: 'v_shadow', name: 'Тень', x: 300, y: 420, type: 'pirate', color: 0x6600cc, desc: 'Контрабандисты Бездны', faction: 'pirates' },
  { id: 'v_gate', name: 'Врата', x: 50, y: 250, type: 'tech', color: 0x44ddff, desc: 'Портал в Млечный Путь', faction: 'scientists' },
  { id: 'v_spire', name: 'Шпиль', x: 550, y: 280, type: 'research', color: 0x44ffaa, desc: 'Маяк древних', faction: 'scientists' },
  { id: 'v_rift', name: 'Разлом', x: 650, y: 460, type: 'research', color: 0x00ff44, desc: 'Трещина в реальности', faction: 'scientists' },
];

export const ROUTES_2 = [
  ['v_nexus', 'v_abyss'], ['v_nexus', 'v_throne'], ['v_nexus', 'v_spire'], ['v_nexus', 'v_signal'],
  ['v_abyss', 'v_gate'], ['v_abyss', 'v_harvest'], ['v_abyss', 'v_signal'],
  ['v_forge', 'v_signal'], ['v_forge', 'v_core'], ['v_forge', 'v_throne'],
  ['v_throne', 'v_crypt'], ['v_throne', 'v_spire'],
  ['v_eden', 'v_gate'], ['v_eden', 'v_shadow'],
  ['v_crypt', 'v_shadow'], ['v_crypt', 'v_spire'],
  ['v_signal', 'v_harvest'],
  ['v_core', 'v_spire'],
  ['v_shadow', 'v_nexus'],
  ['v_gate', 'v_nexus'],
  ['v_rift', 'v_crypt'], ['v_rift', 'v_throne'], ['v_rift', 'v_spire'],
];

// ============== GALAXY 3 - THE GLITCH ==============
export const SYSTEMS_3 = [
  { id: 'g_null', name: 'NULL', x: 50, y: 250, type: 'tech', color: 0x00ff00, desc: 'Точка входа. Данные повреждены.', faction: 'scientists' },
  { id: 'g_overflow', name: 'Overflow', x: 200, y: 100, type: 'trade', color: 0xffff00, desc: 'Переполнение буфера', faction: 'traders' },
  { id: 'g_debug', name: 'Debug', x: 350, y: 120, type: 'research', color: 0x00ffaa, desc: 'Отладочная среда', faction: 'scientists' },
  { id: 'g_kernel', name: 'Kernel', x: 500, y: 200, type: 'research', color: 0xffffff, desc: 'Ядро системы', faction: 'scientists' },
  { id: 'g_404', name: '404', x: 650, y: 80, type: 'pirate', color: 0xff0044, desc: 'Система не найдена', faction: 'pirates' },
  { id: 'g_patch', name: 'Patch', x: 750, y: 200, type: 'resort', color: 0x66ccff, desc: 'Станция обновлений', faction: 'traders' },
  { id: 'g_loop', name: 'Loop', x: 400, y: 300, type: 'trade', color: 0x88ff88, desc: 'while(true) { trade(); }', faction: 'traders' },
  { id: 'g_crash', name: 'Crash', x: 700, y: 350, type: 'military', color: 0xff4400, desc: 'SEGFAULT. Core dumped.', faction: 'military' },
  { id: 'g_heap', name: 'Heap', x: 150, y: 400, type: 'mining', color: 0xccaa00, desc: 'Дамп памяти. Всё тут.', faction: 'miners' },
  { id: 'g_fork', name: 'Fork', x: 350, y: 450, type: 'industrial', color: 0xff8800, desc: 'Ветвление процессов', faction: 'miners' },
  { id: 'g_root', name: 'Root', x: 550, y: 430, type: 'military', color: 0xff0000, desc: '# whoami → root', faction: 'military' },
  { id: 'g_sudo', name: 'Sudo', x: 100, y: 60, type: 'pirate', color: 0xaa00ff, desc: 'Повышение привилегий', faction: 'pirates' },
];

export const ROUTES_3 = [
  ['g_null', 'g_overflow'], ['g_null', 'g_heap'], ['g_null', 'g_loop'],
  ['g_overflow', 'g_debug'], ['g_overflow', 'g_sudo'],
  ['g_debug', 'g_kernel'], ['g_debug', 'g_404'],
  ['g_kernel', 'g_loop'], ['g_kernel', 'g_patch'],
  ['g_loop', 'g_fork'], ['g_loop', 'g_crash'],
  ['g_crash', 'g_root'], ['g_crash', 'g_patch'],
  ['g_root', 'g_fork'],
  ['g_fork', 'g_heap'],
  ['g_404', 'g_patch'], ['g_404', 'g_crash'],
  ['g_sudo', 'g_debug'],
  ['g_heap', 'g_fork'],
];

export const GALAXIES = {
  milkyway: { name: 'Млечный Путь', gates: [{ system: 'andromeda', target: 'void', targetSystem: 'v_gate' }] },
  void: { name: 'Бездна', gates: [
    { system: 'v_gate', target: 'milkyway', targetSystem: 'andromeda' },
    { system: 'v_rift', target: 'glitch', targetSystem: 'g_null' },
  ]},
  glitch: { name: 'Глитч', gates: [{ system: 'g_null', target: 'void', targetSystem: 'v_rift' }] },
};

export function getGalaxySystems(galaxyId) {
  if (galaxyId === 'void') return SYSTEMS_2;
  if (galaxyId === 'glitch') return SYSTEMS_3;
  return SYSTEMS;
}

export function getGalaxyRoutes(galaxyId) {
  if (galaxyId === 'void') return ROUTES_2;
  if (galaxyId === 'glitch') return ROUTES_3;
  return ROUTES;
}

export function getNeighbors(systemId, galaxyId) {
  const routes = getGalaxyRoutes(galaxyId);
  const neighbors = [];
  for (const [a, b] of routes) {
    if (a === systemId) neighbors.push(b);
    else if (b === systemId) neighbors.push(a);
  }
  return neighbors;
}

export function getAllSystems() {
  return [...SYSTEMS, ...SYSTEMS_2, ...SYSTEMS_3];
}

// ============== FACTIONS ==============
export const FACTIONS = {
  traders: { name: 'Торговая Гильдия', color: 0xFFD700, bonus: 'Скидка 10% в торговле' },
  military: { name: 'Военный Флот', color: 0xff4444, bonus: 'Доступ к военному оружию' },
  pirates: { name: 'Пиратский Синдикат', color: 0xaa44ff, bonus: 'Чёрный рынок без штрафов' },
  scientists: { name: 'Академия Наук', color: 0x44ffcc, bonus: 'Улучшенный сканер' },
  miners: { name: 'Горняцкий Союз', color: 0xcc8833, bonus: 'Скидка на ремонт' },
};

// ============== GOODS ==============
export const GOODS = [
  { id: 'food', name: 'Еда', icon: '🌾', basePrice: 20, volatility: 0.3, legal: true },
  { id: 'metals', name: 'Металлы', icon: '⛏️', basePrice: 50, volatility: 0.4, legal: true },
  { id: 'electronics', name: 'Электроника', icon: '💻', basePrice: 120, volatility: 0.5, legal: true },
  { id: 'weapons', name: 'Оружие', icon: '🔫', basePrice: 200, volatility: 0.6, legal: true },
  { id: 'fuel', name: 'Топливо', icon: '⛽', basePrice: 30, volatility: 0.3, legal: true },
  { id: 'medicine', name: 'Медикаменты', icon: '💊', basePrice: 80, volatility: 0.5, legal: true },
  { id: 'luxury', name: 'Роскошь', icon: '💎', basePrice: 300, volatility: 0.7, legal: true },
  { id: 'contraband', name: 'Контрабанда', icon: '📦', basePrice: 400, volatility: 0.8, legal: false },
  { id: 'artifacts', name: 'Артефакты', icon: '🏺', basePrice: 500, volatility: 0.9, legal: true },
  { id: 'narcotics', name: 'Наркотики', icon: '💉', basePrice: 600, volatility: 1.0, legal: false },
];

const TYPE_MODIFIERS = {
  agricultural: { food: 0.5, metals: 1.1, electronics: 1.3, medicine: 0.8 },
  mining:       { metals: 0.5, food: 1.2, electronics: 1.1, fuel: 0.7 },
  tech:         { electronics: 0.6, weapons: 0.8, food: 1.2, metals: 1.1 },
  military:     { weapons: 0.7, fuel: 0.8, luxury: 1.4, medicine: 0.9 },
  trade:        { food: 0.9, metals: 0.9, electronics: 0.9, luxury: 1.1 },
  pirate:       { contraband: 0.5, narcotics: 0.5, weapons: 0.8, food: 1.3 },
  resort:       { luxury: 0.6, food: 1.3, medicine: 1.2, narcotics: 1.5 },
  industrial:   { metals: 0.7, fuel: 0.6, electronics: 0.8, food: 1.2 },
  research:     { electronics: 0.7, artifacts: 0.4, medicine: 0.7, weapons: 1.3 },
};

export function generatePrices(system) {
  const mods = TYPE_MODIFIERS[system.type] || {};
  const prices = {};
  for (const good of GOODS) {
    const mod = mods[good.id] || 1.0;
    const variance = 1 + (Math.random() - 0.5) * good.volatility;
    const baseP = Math.round(good.basePrice * mod * variance);
    prices[good.id] = {
      buy: Math.max(1, baseP + Math.floor(Math.random() * 5)),
      sell: Math.max(1, Math.round(baseP * 0.92)),
    };
  }
  return prices;
}

// ============== SHIPS ==============
// slots: W = weapon, U = utility, E = engine/armor
export const SHIPS = {
  scout:    { name: 'Скаут', hp: 60, attack: 8, defense: 3, speed: 5, cargo: 15, fuel: 80, price: 0, slots: { W: 1, U: 2, E: 1 } },
  trader:   { name: 'Торговец', hp: 80, attack: 5, defense: 4, speed: 3, cargo: 40, fuel: 100, price: 2000, slots: { W: 1, U: 4, E: 1 } },
  fighter:  { name: 'Истребитель', hp: 70, attack: 18, defense: 5, speed: 6, cargo: 10, fuel: 70, price: 3500, slots: { W: 3, U: 1, E: 2 } },
  cruiser:  { name: 'Крейсер', hp: 150, attack: 15, defense: 10, speed: 3, cargo: 25, fuel: 90, price: 8000, slots: { W: 3, U: 3, E: 2 } },
  freighter:{ name: 'Грузовоз', hp: 120, attack: 4, defense: 8, speed: 2, cargo: 80, fuel: 120, price: 5000, slots: { W: 1, U: 5, E: 1 } },
  phantom:  { name: 'Фантом', hp: 50, attack: 22, defense: 2, speed: 8, cargo: 8, fuel: 60, price: 6000, slots: { W: 4, U: 1, E: 3 } },
  titan:    { name: 'Титан', hp: 250, attack: 20, defense: 15, speed: 1, cargo: 50, fuel: 150, price: 15000, slots: { W: 5, U: 3, E: 3 } },
};

export const SHIP_TEXTURES = {
  scout: 'player_scout',
  trader: 'player_trader',
  fighter: 'player_fighter',
  cruiser: 'player_cruiser',
  freighter: 'player_freighter',
  phantom: 'player_phantom',
  titan: 'player_titan',
};

// ============== WEAPONS ==============
// Each weapon occupies 1 W-slot. Ships fire ALL installed weapons per turn.
export const WEAPONS = {
  laser:     { name: 'Лазер', damage: 8, accuracy: 0.9, type: 'energy', price: 0, desc: 'Стандарт', icon: 'wpn_laser' },
  autogun:   { name: 'Автопушка', damage: 6, accuracy: 0.95, type: 'kinetic', price: 300, desc: 'Дёшево и точно', icon: 'wpn_autogun' },
  kinetic:   { name: 'Кинетика', damage: 10, accuracy: 0.85, type: 'kinetic', price: 500, desc: 'Пробивает щиты', icon: 'wpn_kinetic' },
  plasma:    { name: 'Плазма', damage: 14, accuracy: 0.75, type: 'energy', price: 800, desc: 'Высокий урон', icon: 'wpn_plasma' },
  emp:       { name: 'EMP', damage: 4, accuracy: 0.95, type: 'emp', price: 1200, desc: 'Отключает щит 2 хода', icon: 'wpn_emp' },
  launcher:  { name: 'Ракетница', damage: 16, accuracy: 0.7, type: 'explosive', price: 1500, desc: 'Мощная, средняя точность', icon: 'wpn_launcher' },
  railgun:   { name: 'Рельсотрон', damage: 22, accuracy: 0.6, type: 'kinetic', price: 3000, desc: 'Огромный урон, низкая точность', icon: 'wpn_railgun' },
  disruptor: { name: 'Дизраптор', damage: 5, accuracy: 0.9, type: 'energy', price: 2000, desc: 'Урон + шанс повредить модуль', icon: 'wpn_disruptor' },
};

// ============== MODULES ==============
// slotType: U = utility, E = engine/armor. Each module takes 1 slot of its type.
export const MODULES = {
  // E-slot modules (engine/armor)
  engine_mk1:  { name: 'Двиг. MK1', slotType: 'E', bonus: { speed: 1, fuel: 10 }, price: 400, icon: 'mod_engine1', desc: '+1 скор, +10 топл' },
  engine_mk2:  { name: 'Двиг. MK2', slotType: 'E', bonus: { speed: 2, fuel: 20 }, price: 1000, icon: 'mod_engine2', desc: '+2 скор, +20 топл' },
  engine_mk3:  { name: 'Двиг. MK3', slotType: 'E', bonus: { speed: 4, fuel: 40 }, price: 3000, icon: 'mod_engine3', desc: '+4 скор, +40 топл' },
  armor_mk1:   { name: 'Броня MK1', slotType: 'E', bonus: { hp: 15 }, price: 300, icon: 'mod_armor1', desc: '+15 HP' },
  armor_mk2:   { name: 'Броня MK2', slotType: 'E', bonus: { hp: 30 }, price: 600, icon: 'mod_armor2', desc: '+30 HP' },
  armor_mk3:   { name: 'Броня MK3', slotType: 'E', bonus: { hp: 80 }, price: 2000, icon: 'mod_armor3', desc: '+80 HP' },
  reactor:     { name: 'Реактор', slotType: 'E', bonus: { dmgBoost: 0.1 }, price: 2500, icon: 'mod_reactor', desc: '+10% урон оружия' },

  // U-slot modules (utility)
  shield_mk1:  { name: 'Щит MK1', slotType: 'U', bonus: { defense: 2 }, price: 400, icon: 'mod_shield1', desc: '+2 защита' },
  shield_mk2:  { name: 'Щит MK2', slotType: 'U', bonus: { defense: 4 }, price: 800, icon: 'mod_shield2', desc: '+4 защита' },
  shield_mk3:  { name: 'Щит MK3', slotType: 'U', bonus: { defense: 7 }, price: 2500, icon: 'mod_shield3', desc: '+7 защита' },
  cargo_ext:   { name: 'Расш. трюм', slotType: 'U', bonus: { cargo: 15 }, price: 700, icon: 'mod_cargo1', desc: '+15 груза' },
  cargo_ext2:  { name: 'Мега-трюм', slotType: 'U', bonus: { cargo: 40 }, price: 2200, icon: 'mod_cargo2', desc: '+40 груза' },
  scanner:     { name: 'Сканер', slotType: 'U', bonus: { scanner: true }, price: 1500, icon: 'mod_scanner', desc: 'Скан целей' },
  drone_bay:   { name: 'Дрон-бэй', slotType: 'U', bonus: { drones: 2 }, price: 2000, icon: 'mod_drone', desc: '+2 дрона' },
  mine_layer:  { name: 'Минёр', slotType: 'U', bonus: { mines: 3 }, price: 1800, icon: 'mod_mine', desc: '+3 мины' },
  repair_drone:{ name: 'Ремонт-дрон', slotType: 'U', bonus: { autoRepair: 5 }, price: 2200, icon: 'mod_repair', desc: '+5 HP/ход в бою' },
  jammer:      { name: 'Глушилка', slotType: 'U', bonus: { jamming: 0.15 }, price: 1800, icon: 'mod_jammer', desc: '-15% точн. врага' },
  booster:     { name: 'Бустер', slotType: 'U', bonus: { fleeBonus: 0.2 }, price: 1000, icon: 'mod_booster', desc: '+20% шанс побега' },
};

// ============== MERCENARIES ==============
export const MERCENARIES = [
  { id: 'rex', name: 'Рекс', attack: 10, hp: 40, cost: 200, daily: 30, desc: 'Опытный наёмник' },
  { id: 'zara', name: 'Зара', attack: 15, hp: 30, cost: 350, daily: 50, desc: 'Элитный стрелок' },
  { id: 'grunt', name: 'Грант', attack: 7, hp: 60, cost: 150, daily: 20, desc: 'Крепкий танк' },
  { id: 'nova_merc', name: 'Нова', attack: 20, hp: 25, cost: 500, daily: 70, desc: 'Бывший военный' },
];

// ============== ENEMIES ==============
export const ENEMIES = {
  pirate_scout:   { name: 'Пират-разведчик', hp: 25, attack: 6, defense: 2, reward: 120, ship: 'pirate' },
  pirate_raider:  { name: 'Пират-рейдер', hp: 50, attack: 12, defense: 5, reward: 300, ship: 'pirate' },
  pirate_boss:    { name: 'Пиратский барон', hp: 120, attack: 18, defense: 8, reward: 800, ship: 'boss' },
  bounty_hunter:  { name: 'Охотник', hp: 70, attack: 16, defense: 6, reward: 500, ship: 'hunter' },
  military_patrol:{ name: 'Патруль', hp: 80, attack: 14, defense: 10, reward: 400, ship: 'military' },
  drone_swarm:    { name: 'Рой дронов', hp: 35, attack: 20, defense: 1, reward: 350, ship: 'drone' },
  // Glitch enemies
  virus_worm:     { name: 'WORM.exe', hp: 30, attack: 8, defense: 1, reward: 150, ship: 'drone', faction: 'glitch' },
  trojan:         { name: 'TR0J4N.dll', hp: 55, attack: 14, defense: 4, reward: 350, ship: 'pirate', faction: 'glitch' },
  ransomware:     { name: 'RANSOM://LOCK', hp: 80, attack: 10, defense: 12, reward: 600, ship: 'boss', faction: 'glitch' },
  kernel_panic:   { name: 'KERNEL_PANIC', hp: 100, attack: 22, defense: 6, reward: 900, ship: 'military', faction: 'glitch' },
  null_pointer:   { name: 'NullPtr Exception', hp: 1, attack: 50, defense: 0, reward: 400, ship: 'drone', faction: 'glitch' },
  firewall:       { name: 'FIREWALL.sys', hp: 90, attack: 8, defense: 18, reward: 500, ship: 'military', faction: 'glitch' },
  // Void (Бездна) enemies
  shadow_tendril: { name: 'Теневое щупальце', hp: 40, attack: 12, defense: 3, reward: 200, ship: 'drone', faction: 'void' },
  void_leviathan: { name: 'Левиафан Бездны', hp: 150, attack: 20, defense: 10, reward: 1200, ship: 'boss', faction: 'void' },
  dark_echo:      { name: 'Тёмное эхо', hp: 60, attack: 15, defense: 5, reward: 400, ship: 'hunter', faction: 'void' },
  abyss_maw:      { name: 'Пасть Бездны', hp: 90, attack: 25, defense: 2, reward: 700, ship: 'pirate', faction: 'void' },
  whisper_swarm:  { name: 'Рой Шёпотов', hp: 25, attack: 30, defense: 0, reward: 350, ship: 'drone', faction: 'void' },
  ancient_sentinel:{ name: 'Древний Страж', hp: 200, attack: 16, defense: 15, reward: 1500, ship: 'military', faction: 'void' },
};

// ============== TEXT QUESTS ==============
export const STORY_QUESTS = [
  {
    id: 'derelict_ship', title: 'Покинутый корабль',
    img: 'sprites/quest-derelict-1.png',
    intro: 'Сигнал аварийного маяка. Грузовоз дрейфует без энергии.',
    stages: [
      { text: 'Корабль тёмный. Шлюз открыт. Внутри что-то мигает.', img: 'sprites/quest-derelict-1.png', options: [
        { text: 'Войти', next: 1 },
        { text: 'Просканировать', next: 2 },
        { text: 'Улететь', next: -1, result: { text: 'Вы улетели.' } },
      ]},
      { text: 'Внутри хаос. Стены в царапинах. В грузовом - стук.', img: 'sprites/quest-derelict-2.png', options: [
        { text: 'Идти на звук', next: 3 },
        { text: 'Каюта капитана', next: 4 },
        { text: 'Бежать', next: -1, result: { text: 'Страх сильнее.', reputation: -2 } },
      ]},
      { text: 'Сканер: 3 формы жизни в крио и что-то большое в грузовом.', img: 'sprites/quest-derelict-1.png', options: [
        { text: 'Разморозить экипаж', next: 5 },
        { text: 'Проверить грузовой', next: 3 },
      ]},
      { text: 'В грузовом - клетка с ксено-зверем. Рядом ящик "СЕКРЕТНО".', img: 'sprites/quest-derelict-3.png', options: [
        { text: 'Открыть ящик', next: -1, result: { text: 'Артефакты Древних!', credits: 2000, reputation: 5 } },
        { text: 'Выпустить существо', next: -1, result: { text: 'Зверь убежал. За клеткой тайник.', credits: 800, reputation: 10 } },
      ]},
      { text: 'Дневник: "Они нашли ЭТО на Денебе. Не открывайте." Под кроватью сейф.', options: [
        { text: 'Взломать сейф', next: -1, result: { text: 'Коды и 1500 кредитов!', credits: 1500, reputation: 3 } },
        { text: 'Забрать дневник', next: -1, result: { text: 'Ценная информация.', reputation: 5 } },
      ]},
      { text: 'Экипаж разморожен! Капитан: "Спасибо! Мы думали нас бросили!"', options: [
        { text: 'Принять награду', next: -1, result: { text: 'Капитан даёт 1000 кр и координаты.', credits: 1000, reputation: 15 } },
        { text: 'Отказаться', next: -1, result: { text: '"Вы благородный человек."', reputation: 25 } },
      ]},
    ]
  },
  {
    id: 'station_revolt', title: 'Мятеж на станции',
    img: 'sprites/quest-revolt-1.png',
    intro: 'Станция Омега-7 захвачена рабочими. Люди голодают.',
    stages: [
      { text: 'Голос по радио: "Нам нужна еда! Правительство нас бросило!"', img: 'sprites/quest-revolt-1.png', options: [
        { text: 'Помочь мятежникам', next: 1 },
        { text: 'Связаться с властями', next: 2 },
        { text: 'Не вмешиваться', next: -1, result: { text: 'Станцию подавили через неделю.', reputation: -5 } },
      ]},
      { text: 'Лидер Коул: "Нам нужно 10 еды. За это - всё что у нас есть."', img: 'sprites/quest-revolt-2.png', options: [
        { text: 'Отдать еду', next: -1, result: { text: 'Коул плачет. Мятежники сдаются мирно.', credits: 500, reputation: 20, needCargo: { goodId: 'food', qty: 10 } } },
        { text: 'Продать втридорога', next: -1, result: { text: 'Нажились на горе. Но 1500 кр.', credits: 1500, reputation: -15 } },
      ]},
      { text: 'Генерал Тарков: "Доставьте ультиматум. 800 кредитов."', options: [
        { text: 'Доставить', next: -1, result: { text: 'Мятежники сдались.', credits: 800, reputation: -10 } },
        { text: 'Предупредить их', next: -1, result: { text: 'Мятежники подготовились. Военные отступили.', credits: 300, reputation: 15 } },
      ]},
    ]
  },
  {
    id: 'alien_signal', title: 'Чужой сигнал',
    img: 'sprites/quest-alien-1.png',
    intro: 'Радар поймал нечеловеческий сигнал из пустого сектора.',
    stages: [
      { text: 'Сигнал усиливается. Координаты ведут в туманность.', img: 'sprites/quest-alien-1.png', options: [
        { text: 'Следовать', next: 1 },
        { text: 'Продать данные', next: -1, result: { text: 'Учёные заплатили 600 кр.', credits: 600, reputation: 5 } },
      ]},
      { text: 'Структура в центре туманности. Не корабль. Что-то древнее. Пульсирует.', img: 'sprites/quest-alien-2.png', options: [
        { text: 'Приблизиться', next: 2 },
        { text: 'Запустить зонд', next: 3 },
      ]},
      { text: 'Луч света! В голове образы: карта, сокровища, предупреждение.', img: 'sprites/quest-alien-3.png', options: [
        { text: 'Принять дар', next: -1, result: { text: 'Древние знания! Скрытые маршруты!', credits: 3000, reputation: 20 } },
        { text: 'Сопротивляться', next: -1, result: { text: 'Структура исчезает. Вы целы.', reputation: 5 } },
      ]},
      { text: 'Зонд исчез. Но передал: структуре 50 000 лет.', options: [
        { text: 'Подлететь ближе', next: 2 },
        { text: 'Улететь с данными', next: -1, result: { text: 'Данные стоят 1500 кр!', credits: 1500, reputation: 10 } },
      ]},
    ]
  },
  {
    id: 'plague_ship', title: 'Чумной корабль',
    img: 'sprites/quest-plague-1.png',
    intro: 'На радаре - медицинское судно. Сигнал бедствия: "Эпидемия на борту. Нужны медикаменты."',
    stages: [
      { text: 'Судно дрейфует. Через иллюминаторы видны мигающие красные лампы карантина.', img: 'sprites/quest-plague-1.png', options: [
        { text: 'Пристыковаться', next: 1 },
        { text: 'Передать координаты спасателям', next: -1, result: { text: 'Спасатели прибудут через 3 дня. Может быть поздно.', reputation: 3 } },
        { text: 'Пролететь мимо', next: -1, result: { text: 'Совесть молчит. Пока.', reputation: -8 } },
      ]},
      { text: 'На борту 40 человек, 30 больны. Доктор: "Нужно 5 медикаментов или все погибнут."', img: 'sprites/quest-plague-2.png', options: [
        { text: 'Отдать медикаменты', next: -1, result: { text: 'Вы спасли 30 жизней! Доктор плачет от благодарности.', credits: 800, reputation: 25, needCargo: { goodId: 'medicine', qty: 5 } } },
        { text: 'Продать по рыночной цене', next: -1, result: { text: 'Бизнес есть бизнес. Но люди смотрят с ненавистью.', credits: 2000, reputation: -15 } },
        { text: 'Обследовать грузовой отсек', next: 2 },
      ]},
      { text: 'В грузовом - экспериментальная вакцина. Этикетка: "Проект Феникс. Не для продажи." Стоит целое состояние.', options: [
        { text: 'Помочь и забрать вакцину как оплату', next: -1, result: { text: 'Доктор соглашается. Вакцина стоит 4000 на чёрном рынке.', credits: 4000, reputation: 10, needCargo: { goodId: 'medicine', qty: 5 } } },
        { text: 'Украсть вакцину', next: -1, result: { text: 'Вы ушли с добычей. Но за вами могут прийти.', credits: 5000, reputation: -20 } },
        { text: 'Помочь бесплатно', next: -1, result: { text: 'Вы настоящий герой. Слухи о вашем поступке разнесутся по сектору.', credits: 200, reputation: 30, needCargo: { goodId: 'medicine', qty: 5 } } },
      ]},
    ]
  },
  {
    id: 'pirate_king', title: 'Пиратский Король',
    img: 'sprites/quest-pirate-1.png',
    intro: 'Вам передали голограмму: "Пиратский Король зовёт на аудиенцию. Отказ не принимается."',
    stages: [
      { text: 'Корабль-крепость. Вас проводят в тронный зал. Пиратский Король - старик с кибернетическим глазом.', img: 'sprites/quest-pirate-2.png', options: [
        { text: 'Поклониться', next: 1 },
        { text: 'Стоять прямо', next: 2 },
        { text: 'Попытаться уйти', next: -1, result: { text: 'Охрана вернула вас. Невежливо.', reputation: -10 } },
      ]},
      { text: '"Покорный. Хорошо. Мне нужен курьер. 10 контрабанды из Ригеля в Солнце. 5000 кредитов."', options: [
        { text: 'Согласиться', next: -1, result: { text: 'Опасное задание. Но 5000 - это 5000.', credits: 2000, reputation: 15 } },
        { text: 'Отказаться', next: 3 },
      ]},
      { text: '"Дерзкий. Мне это нравится. У меня есть работа для смелых. Конвой военных. Хочу знать маршрут."', options: [
        { text: 'Шпионить за военными', next: -1, result: { text: 'Рискованно, но Король щедр.', credits: 3000, reputation: 10 } },
        { text: 'Отказаться', next: 3 },
      ]},
      { text: 'Король хмурится. "Последнее предложение. Просто передай пакет на Поларис. Ничего опасного. 1500."', options: [
        { text: 'Ладно, передам', next: -1, result: { text: 'Простое задание. Король запомнит вашу помощь.', credits: 1500, reputation: 5 } },
        { text: 'Нет', next: -1, result: { text: 'Король молча кивает охране. Вас вышвыривают. Пираты вас запомнили.', reputation: -15 } },
      ]},
    ]
  },
  {
    id: 'time_loop', title: 'Временная петля',
    img: 'sprites/quest-timeloop-1.png',
    intro: 'Странное ощущение дежавю. Бортовой компьютер показывает: "ХРОНОЛОГИЧЕСКАЯ АНОМАЛИЯ".',
    stages: [
      { text: 'Часы на приборной панели идут назад. За окном - те же звёзды, что были час назад. Вы в петле.', img: 'sprites/quest-timeloop-1.png', options: [
        { text: 'Изменить курс', next: 1 },
        { text: 'Продолжить как обычно', next: 2 },
        { text: 'Выключить двигатели', next: 3 },
      ]},
      { text: 'Новый курс привёл к разлому в пространстве. Из него веет холодом и доносится... музыка?', img: 'sprites/quest-timeloop-2.png', options: [
        { text: 'Войти в разлом', next: -1, result: { text: 'По ту сторону - станция из будущего! Они дали технологии стоимостью 4000 кр!', credits: 4000, reputation: 15 } },
        { text: 'Облететь', next: -1, result: { text: 'Петля сломалась. Вы потеряли 2 дня, но целы.', reputation: 2 } },
      ]},
      { text: 'Петля повторяется. Опять. И опять. На третий раз вы замечаете: в углу экрана мигает скрытая частота.', options: [
        { text: 'Настроиться на частоту', next: -1, result: { text: 'Голос: "Наконец-то! Координаты спасения..." Петля разорвана. Бонус: 2000 кр от благодарных учёных.', credits: 2000, reputation: 12 } },
        { text: 'Игнорировать', next: -1, result: { text: 'Петля рассосалась сама. Вы потеряли день.', reputation: 0 } },
      ]},
      { text: 'Корабль завис в пустоте. Тишина. Потом - вспышка! Вы видите себя в параллельной реальности. Там вы богаче.', options: [
        { text: 'Забрать богатства у двойника', next: -1, result: { text: 'Двойник не возражал. Может, он тоже забрал ваши? 3000 кр.', credits: 3000, reputation: -5 } },
        { text: 'Обменяться информацией', next: -1, result: { text: 'Двойник поделился торговыми маршрутами. Бесценно!', credits: 1500, reputation: 10 } },
      ]},
    ]
  },
  {
    id: 'refugee_convoy', title: 'Караван беженцев',
    img: 'sprites/quest-refugee-1.png',
    intro: 'Три транспорта, забитые людьми. Связь: "Наша колония уничтожена. Помогите добраться до Центавры."',
    stages: [
      { text: 'Женщина на экране: "500 человек, дети, старики. Топлива на один прыжок. Пираты на хвосте."', img: 'sprites/quest-refugee-1.png', options: [
        { text: 'Сопровождать конвой', next: 1 },
        { text: 'Дать топливо', next: -1, result: { text: 'Вы отдали топливо. Они благодарны, но дальше сами.', credits: 300, reputation: 12 } },
        { text: 'Не могу помочь', next: -1, result: { text: 'Транспорты ушли в темноту. Вы не узнаете, добрались ли они.', reputation: -5 } },
      ]},
      { text: 'Пиратский рейдер на радаре! Он быстрее транспортов. У вас минута на решение.', img: 'sprites/quest-refugee-2.png', options: [
        { text: 'Атаковать пирата', next: 2 },
        { text: 'Отвлечь на себя', next: 3 },
        { text: 'Бросить конвой', next: -1, result: { text: 'Вы ушли. За спиной - выстрелы. Лучше не думать.', reputation: -20 } },
      ]},
      { text: 'Бой! Пират силён, но защищая других вы сражаетесь яростнее. Победа!', options: [
        { text: 'Довести конвой до Центавры', next: -1, result: { text: '500 спасённых жизней. На станции вас встречают как героя. 2000 кр от правительства.', credits: 2000, reputation: 30 } },
      ]},
      { text: 'Вы уводите пирата за собой. Гонка на скорость! Транспорты успевают прыгнуть.', options: [
        { text: 'Оторваться от пирата', next: -1, result: { text: 'Вы оторвались! Конвой спасён. Небольшие повреждения.', credits: 1000, reputation: 25 } },
        { text: 'Развернуться и драться', next: -1, result: { text: 'Пират не ожидал! Вы победили и собрали трофеи.', credits: 2500, reputation: 20 } },
      ]},
    ]
  },
];

// ============== BAR RUMORS ==============
export const BAR_RUMORS = [
  'На Денебе нашли портал Древних...',
  'Пиратский барон перебрался в Нову.',
  'Гильдия повышает пошлины.',
  'Военные тестируют новое оружие.',
  'Пилот нашёл золотой астероид.',
  'На Кеплере взломали шифр Древних.',
  'Центавра - бесплатная заправка.',
  'Рой дронов атаковал караван у Ориона.',
  'Фантом - быстрейший корабль.',
  'Контрабанда на Ригеле вдвое дешевле.',
  'Патруль усилили на маршруте Сол-Сириус.',
  'Наёмница Зара ищет работу.',
];

export function generatePriceHistory(system, days) {
  const history = {};
  const mods = TYPE_MODIFIERS[system.type] || {};
  for (const good of GOODS) {
    history[good.id] = [];
    const mod = mods[good.id] || 1.0;
    for (let d = 0; d < days; d++) {
      const variance = 1 + (Math.random() - 0.5) * good.volatility * 0.5;
      history[good.id].push(Math.round(good.basePrice * mod * variance));
    }
  }
  return history;
}

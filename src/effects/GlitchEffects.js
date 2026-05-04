const GLITCH_CHARS = '01ᚠᚢᚦᚨ₮Ξ∆ΩΨ█▓▒░╬╫╪┼╋☠⌀∞≈≠πλσφ';
const WHISPERS = [
  'ТЫ НЕ ДОЛЖЕН БЫТЬ ЗДЕСЬ',
  'ПАМЯТЬ ПОВРЕЖДЕНА',
  'СИГНАЛ ПОТЕРЯН... СИГНАЛ НАЙДЕН',
  'ОНИ НАБЛЮДАЮТ',
  'ПРОЦЕСС НЕ ОТВЕЧАЕТ',
  'REALITY.EXE HAS STOPPED',
  'ERR_DIMENSION_OVERFLOW',
  'TURN BACK',
  'кто-то ещё здесь',
  'ОНО ТЕБЯ ВИДИТ',
  'DATA CORRUPTED AT 0x4F2A',
  'не доверяй навигации',
  'ПОМЕХИ В СЕКТОРЕ ██████',
  'THEY KNOW YOUR NAME',
  'цикл не завершён',
];

const FAKE_CHAT_MSGS = [
  '[Player_0x3F] не лети к Kernel... пожалуйста',
  '[DELETED_USER] я тут уже 3 дня, время не идёт',
  '[NULL] помогите. экран не отвечает.',
  '[segfault] кто-то ещё видит глаза?',
  '[P̸l̶a̵y̷e̶r̸] ̸ ̸ ̶ ̸ ̶ ̸ ̵ ̷ ̴ ̵ ̸ ',
  '[ghost_421] если читаешь это - уходи',
  '[ERROR] пользователь не найден',
  '[???] оно притворяется игрой',
  '[root] sudo kill -9 reality',
  '[Player_7A] они перезаписали мой сейв',
];

const FAKE_ERRORS = [
  { title: 'FATAL ERROR', msg: 'Memory corruption detected at 0x7F4A2B\\nStack: GameState.travel() → NULL\\nSegmentation fault (core dumped)' },
  { title: 'SYSTEM FAILURE', msg: 'Navigation module unresponsive\\nAttempting emergency restart...\\nWARNING: Reality integrity at 23%' },
  { title: 'ERR_REALITY_FAULT', msg: 'Dimension anchor lost\\nCoordinates: [undefined, undefined, NaN]\\nBackup universe not found' },
  { title: 'KERNEL PANIC', msg: 'not syncing: Attempted to kill init!\\nPID: 1 comm: spacetime\\nStack trace unavailable - memory overwritten' },
  { title: 'SAVE CORRUPTION', msg: 'WARNING: Save data integrity check FAILED\\nRecovering... 47%... 83%...\\nSectors damaged: ████████' },
];

export class GlitchEffects {
  constructor() {
    this.overlay = null;
    this.active = false;
  }

  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  createOverlay(blocking = false) {
    this.removeOverlay();
    const el = document.createElement('div');
    el.className = `glitch-overlay ${blocking ? 'blocking' : ''}`;
    document.body.appendChild(el);
    this.overlay = el;
    return el;
  }

  removeOverlay() {
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    this.active = false;
  }

  delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async playRandom(onComplete) {
    if (this.active) { onComplete?.(); return; }
    this.active = true;

    const effects = [
      () => this.matrixRain(onComplete),
      () => this.fatalError(onComplete),
      () => this.eyesInDark(onComplete),
      () => this.staticBurst(onComplete),
      () => this.fakeSaveDelete(onComplete),
      () => this.fakeChat(onComplete),
      () => this.screenTear(onComplete),
      () => this.invertReality(onComplete),
      () => this.corruptedWarp(onComplete),
      () => this.dejaVu(onComplete),
    ];

    const effect = this.pick(effects);
    effect();
  }

  async matrixRain(onComplete) {
    const ol = this.createOverlay(true);
    const rain = document.createElement('div');
    rain.className = 'glitch-matrix-rain';
    ol.appendChild(rain);

    for (let i = 0; i < 30; i++) {
      const col = document.createElement('div');
      col.className = 'glitch-matrix-col';
      col.style.left = `${Math.random() * 100}%`;
      col.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      col.style.animationDelay = `${Math.random() * 1}s`;
      let text = '';
      for (let j = 0; j < 30; j++) text += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      col.textContent = text;
      rain.appendChild(col);
    }

    const scanlines = document.createElement('div');
    scanlines.className = 'glitch-scanlines';
    ol.appendChild(scanlines);

    await this.delay(1500);

    const whisper = document.createElement('div');
    whisper.className = 'glitch-whisper';
    whisper.textContent = this.pick(WHISPERS);
    ol.appendChild(whisper);

    await this.delay(2500);
    this.removeOverlay();
    onComplete?.();
  }

  async fatalError(onComplete) {
    const ol = this.createOverlay(true);
    ol.style.background = 'rgba(0,0,0,0.97)';

    const error = this.pick(FAKE_ERRORS);
    const box = document.createElement('div');
    box.className = 'glitch-error-box';
    box.innerHTML = `
      <div class="title">${error.title}</div>
      <div class="msg">${error.msg.replace(/\\n/g, '<br>')}</div>
    `;
    ol.appendChild(box);

    const static_ = document.createElement('div');
    static_.className = 'glitch-static';
    ol.appendChild(static_);

    await this.delay(2500);

    box.classList.add('stable');
    const restoring = document.createElement('div');
    restoring.style.cssText = 'color:#00ff41;font-size:12px;margin-top:16px;font-family:monospace';
    restoring.textContent = '> Restoring backup... OK';
    ol.appendChild(restoring);

    await this.delay(1500);
    this.removeOverlay();
    onComplete?.();
  }

  async eyesInDark(onComplete) {
    const ol = this.createOverlay(true);
    ol.style.background = '#000';

    await this.delay(800);

    const eyeCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < eyeCount; i++) {
      const pair = document.createElement('div');
      pair.className = 'glitch-eyes';
      pair.style.top = `${20 + Math.random() * 60}%`;
      pair.style.left = `${10 + Math.random() * 70}%`;
      pair.style.animationDelay = `${Math.random() * 0.5}s`;
      pair.innerHTML = '<div class="glitch-eye"></div><div class="glitch-eye"></div>';
      ol.appendChild(pair);
    }

    await this.delay(1200);

    const whisper = document.createElement('div');
    whisper.className = 'glitch-whisper';
    whisper.style.bottom = '40%';
    whisper.textContent = this.pick(['ОНО ТЕБЯ ВИДИТ', 'НЕ ДВИГАЙСЯ', 'МЫ ЗНАЕМ']);
    ol.appendChild(whisper);

    await this.delay(2000);

    ol.style.transition = 'opacity 0.1s';
    ol.style.opacity = '0';
    await this.delay(100);
    ol.style.opacity = '1';
    await this.delay(50);
    ol.style.opacity = '0';
    await this.delay(200);
    this.removeOverlay();
    onComplete?.();
  }

  async staticBurst(onComplete) {
    const ol = this.createOverlay(true);
    ol.style.background = 'rgba(0,0,0,0.9)';

    const static_ = document.createElement('div');
    static_.className = 'glitch-static';
    static_.style.opacity = '1';
    ol.appendChild(static_);

    const messages = [];
    for (let i = 0; i < 8; i++) {
      const msg = document.createElement('div');
      msg.className = 'glitch-corrupt-text';
      msg.style.cssText = `position:absolute;top:${10 + Math.random() * 80}%;left:${5 + Math.random() * 70}%;font-size:${10 + Math.random() * 14}px;`;
      msg.textContent = this.pick(WHISPERS);
      messages.push(msg);
    }

    for (let i = 0; i < messages.length; i++) {
      await this.delay(200);
      ol.appendChild(messages[i]);
    }

    await this.delay(1500);
    this.removeOverlay();
    onComplete?.();
  }

  async fakeSaveDelete(onComplete) {
    const ol = this.createOverlay(true);
    ol.style.background = 'rgba(0,0,0,0.97)';

    const box = document.createElement('div');
    box.className = 'glitch-error-box stable';
    box.innerHTML = `
      <div class="title" style="color:#ff8800">⚠ SAVE DATA CORRUPTED</div>
      <div class="msg">Обнаружено повреждение данных сохранения.<br>Запуск процедуры восстановления...</div>
      <div class="glitch-progress"><div class="glitch-progress-bar" style="width:0%"></div></div>
      <div class="status" style="margin-top:8px;font-size:11px;color:#666">Сканирование секторов...</div>
    `;
    ol.appendChild(box);

    const bar = box.querySelector('.glitch-progress-bar');
    const status = box.querySelector('.status');

    const steps = [
      { pct: 23, text: 'Секторы повреждены: 7/12', delay: 800 },
      { pct: 47, text: 'Удаление повреждённых блоков...', delay: 700 },
      { pct: 68, text: 'ОШИБКА: целостность нарушена', delay: 600 },
      { pct: 83, text: 'Принудительное восстановление...', delay: 900 },
      { pct: 100, text: 'Данные восстановлены. Потери: 0%', delay: 500 },
    ];

    for (const step of steps) {
      await this.delay(step.delay);
      bar.style.width = step.pct + '%';
      status.textContent = step.text;
      if (step.pct === 68) {
        bar.style.background = '#ff4400';
        status.style.color = '#ff4400';
      }
      if (step.pct === 100) {
        bar.style.background = '#00ff41';
        status.style.color = '#00ff41';
      }
    }

    await this.delay(1000);
    this.removeOverlay();
    onComplete?.();
  }

  async fakeChat(onComplete) {
    const chat = document.createElement('div');
    chat.className = 'glitch-fake-chat';
    document.body.appendChild(chat);

    const msgs = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) msgs.push(this.pick(FAKE_CHAT_MSGS));

    for (const m of msgs) {
      const el = document.createElement('div');
      el.className = 'msg';
      el.textContent = m;
      el.style.animationDelay = '0s';
      chat.appendChild(el);
      await this.delay(800 + Math.random() * 600);
    }

    await this.delay(2000);
    chat.style.transition = 'opacity 1s';
    chat.style.opacity = '0';
    await this.delay(1000);
    chat.remove();
    onComplete?.();
  }

  async screenTear(onComplete) {
    const scene = document.querySelector('.scene') || document.querySelector('#game') || document.body.firstElementChild;
    if (!scene) { onComplete?.(); return; }

    scene.classList.add('glitch-chromatic');

    const slices = [];
    for (let i = 0; i < 6; i++) {
      const slice = document.createElement('div');
      slice.style.cssText = `
        position:fixed; left:0; width:100%; height:${8 + Math.random() * 30}px;
        top:${Math.random() * 100}%; background:rgba(0,255,65,0.05);
        transform: translateX(${-20 + Math.random() * 40}px);
        z-index:9990; pointer-events:none;
        border-top:1px solid rgba(255,0,64,0.3);
        border-bottom:1px solid rgba(0,255,65,0.3);
      `;
      document.body.appendChild(slice);
      slices.push(slice);
    }

    for (let frame = 0; frame < 15; frame++) {
      await this.delay(100);
      for (const s of slices) {
        s.style.transform = `translateX(${-30 + Math.random() * 60}px)`;
        s.style.top = `${Math.random() * 100}%`;
      }
    }

    scene.classList.remove('glitch-chromatic');
    for (const s of slices) s.remove();
    onComplete?.();
  }

  async invertReality(onComplete) {
    const body = document.body;
    body.classList.add('glitch-invert');

    await this.delay(300);
    body.classList.remove('glitch-invert');
    await this.delay(100);
    body.classList.add('glitch-invert');
    await this.delay(2000);

    const whisper = document.createElement('div');
    whisper.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;font-size:18px;color:#000;font-family:monospace;text-shadow:0 0 10px #000';
    whisper.textContent = 'ЭТО НЕ ОШИБКА';
    document.body.appendChild(whisper);

    await this.delay(1500);
    whisper.remove();
    body.classList.remove('glitch-invert');
    await this.delay(200);
    this.active = false;
    onComplete?.();
  }

  async corruptedWarp(onComplete) {
    const ol = this.createOverlay(true);
    ol.style.background = '#000';

    const warp = document.createElement('div');
    warp.style.cssText = 'text-align:center;font-family:monospace;color:#00ff41';

    const lines = [
      '> Инициализация варп-прыжка...',
      '> Координаты загружены: OK',
      '> Проверка целостности... ',
      '> ERR: навигационные данные повреждены',
      '> ВНИМАНИЕ: маршрут нестабилен',
      '> Прыжок выполняется принудительно...',
    ];

    ol.appendChild(warp);

    for (const line of lines) {
      const el = document.createElement('div');
      el.style.cssText = 'margin:6px 0;font-size:12px;text-align:left;padding:0 40px;opacity:0;transition:opacity 0.3s';
      el.textContent = line;
      warp.appendChild(el);
      await this.delay(400);
      el.style.opacity = '1';
      if (line.includes('ERR')) el.style.color = '#ff4400';
      if (line.includes('ВНИМАНИЕ')) el.style.color = '#ff8800';
      if (line.includes('принудительно')) {
        el.style.color = '#ff0040';
        el.classList.add('glitch-chromatic');
      }
    }

    await this.delay(500);

    ol.style.transition = 'none';
    for (let i = 0; i < 6; i++) {
      ol.style.background = i % 2 ? '#000' : '#001100';
      await this.delay(60);
    }

    await this.delay(800);
    this.removeOverlay();
    onComplete?.();
  }

  async dejaVu(onComplete) {
    const ol = this.createOverlay(true);
    ol.style.background = 'rgba(0,0,0,0.95)';

    const msg = document.createElement('div');
    msg.style.cssText = 'font-family:monospace;color:#00ff41;font-size:14px;text-align:center;padding:20px';
    msg.textContent = 'Перелёт завершён.';
    ol.appendChild(msg);

    await this.delay(1500);

    msg.style.color = '#008822';
    msg.textContent = 'Перелёт завершён.';

    const glitch = document.createElement('div');
    glitch.style.cssText = 'font-family:monospace;color:#ff004088;font-size:12px;margin-top:20px';
    glitch.textContent = '...подождите. Это уже было.';
    ol.appendChild(glitch);

    await this.delay(1500);

    const warning = document.createElement('div');
    warning.className = 'glitch-chromatic';
    warning.style.cssText = 'font-family:monospace;color:#ff8800;font-size:11px;margin-top:12px';
    warning.textContent = 'TEMPORAL LOOP DETECTED — breaking...';
    ol.appendChild(warning);

    await this.delay(2000);
    this.removeOverlay();
    onComplete?.();
  }
}

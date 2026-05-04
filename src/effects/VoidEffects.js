const VOID_WHISPERS = [
  'ты слышишь нас?',
  'не оглядывайся',
  'мы были здесь до звёзд',
  'твоё имя... мы помним его',
  'пустота не пуста',
  'ты идёшь к нам. хорошо.',
  'что-то движется за обшивкой',
  'сколько у тебя пальцев? пересчитай.',
  'воздух стал... гуще',
  'последний пилот тоже думал, что справится',
  'тут нет эха. почему ты его слышишь?',
  'стены дышат',
  'оно ждёт за следующим прыжком',
  'ты уверен, что это твой корабль?',
  'расстояние - иллюзия здесь',
  'бездна смотрит в тебя',
  'мы не злые. мы голодные.',
  'твои воспоминания... вкусные',
  'ты чувствуешь холод? это мы.',
  'время здесь не линейно',
];

const VOID_VISIONS = [
  'Ты видишь огромный глаз, занимающий весь иллюминатор. Он моргает. Медленно.',
  'Тени в коридоре корабля складываются в лицо. Оно улыбается.',
  'На секунду все приборы показывают одну и ту же дату: день твоей смерти.',
  'В отражении экрана ты видишь себя, но... старше. Намного старше.',
  'Звёзды за бортом гаснут одна за другой. Потом зажигаются снова. Не на тех местах.',
  'Ты слышишь свой голос из грузового отсека. Но ты здесь.',
  'Стрелки всех часов на корабле вращаются в обратную сторону.',
  'На мгновение гравитация исчезает. Потом возвращается. Втрое сильнее.',
  'Радиопомехи складываются в колыбельную. На языке, которого не существует.',
  'Что-то скребёт по корпусу снаружи. В открытом космосе.',
];

const VOID_RITUALS_HINT = [
  'Древний алтарь мерцает в темноте...',
  'Ты чувствуешь зов чего-то древнего...',
  'Странные символы проступают на стенах...',
];

export class VoidEffects {
  constructor() {
    this.overlay = null;
    this.active = false;
  }

  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  createOverlay(blocking = true) {
    this.removeOverlay();
    const el = document.createElement('div');
    el.className = `void-overlay ${blocking ? 'blocking' : ''}`;
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
      () => this.whisperFromDark(onComplete),
      () => this.voidGaze(onComplete),
      () => this.heartbeat(onComplete),
      () => this.drowning(onComplete),
      () => this.hungryVoid(onComplete),
      () => this.echoSelf(onComplete),
      () => this.cosmicVision(onComplete),
      () => this.breathingWalls(onComplete),
      () => this.gravityShift(onComplete),
      () => this.timeSkip(onComplete),
    ];

    const effect = this.pick(effects);
    effect();
  }

  async whisperFromDark(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = 'rgba(0,0,0,0.98)';

    await this.delay(1200);

    const whisper = document.createElement('div');
    whisper.className = 'void-whisper';
    whisper.textContent = this.pick(VOID_WHISPERS);
    ol.appendChild(whisper);

    await this.delay(3000);

    whisper.style.transition = 'opacity 2s';
    whisper.style.opacity = '0';
    await this.delay(2000);
    this.removeOverlay();
    onComplete?.();
  }

  async voidGaze(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = '#000';

    await this.delay(500);

    const eye = document.createElement('div');
    eye.className = 'void-eye';
    ol.appendChild(eye);

    await this.delay(600);
    eye.classList.add('open');

    await this.delay(2000);

    const text = document.createElement('div');
    text.className = 'void-whisper';
    text.style.bottom = '30%';
    text.textContent = 'Оно видит.';
    ol.appendChild(text);

    await this.delay(1500);

    eye.classList.add('close');
    await this.delay(800);
    this.removeOverlay();
    onComplete?.();
  }

  async heartbeat(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = 'rgba(0,0,0,0.95)';
    ol.classList.add('void-heartbeat');

    const text = document.createElement('div');
    text.className = 'void-whisper';
    text.textContent = 'тук... тук... тук...';
    text.style.fontSize = '24px';
    ol.appendChild(text);

    for (let i = 0; i < 5; i++) {
      await this.delay(800);
      ol.style.background = `rgba(${40 + i * 10},0,0,0.95)`;
      text.style.transform = `scale(${1 + i * 0.05})`;
    }

    await this.delay(600);
    text.textContent = 'это не твоё сердце';
    text.style.fontSize = '14px';
    text.style.color = '#880000';

    await this.delay(2000);
    this.removeOverlay();
    onComplete?.();
  }

  async drowning(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = '#000';

    const layers = [];
    for (let i = 0; i < 5; i++) {
      const layer = document.createElement('div');
      layer.className = 'void-dark-layer';
      layer.style.animationDelay = `${i * 0.3}s`;
      layer.style.opacity = `${0.2 + i * 0.15}`;
      ol.appendChild(layer);
      layers.push(layer);
    }

    const text = document.createElement('div');
    text.className = 'void-whisper';
    text.textContent = 'Тонешь...';
    text.style.animation = 'void-sink 3s ease-in forwards';
    ol.appendChild(text);

    await this.delay(3500);

    text.textContent = '';
    await this.delay(500);

    const surface = document.createElement('div');
    surface.className = 'void-whisper';
    surface.textContent = 'Или всплываешь?';
    surface.style.opacity = '0';
    surface.style.transition = 'opacity 1s';
    ol.appendChild(surface);
    await this.delay(50);
    surface.style.opacity = '1';

    await this.delay(2000);
    this.removeOverlay();
    onComplete?.();
  }

  async hungryVoid(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = 'rgba(0,0,0,0.97)';

    const mouth = document.createElement('div');
    mouth.className = 'void-mouth';
    ol.appendChild(mouth);

    await this.delay(800);
    mouth.classList.add('open');

    const text = document.createElement('div');
    text.className = 'void-whisper';
    text.style.bottom = '25%';
    text.textContent = 'ГОЛОД';
    text.style.fontSize = '28px';
    text.style.letterSpacing = '8px';
    ol.appendChild(text);

    await this.delay(2500);

    text.style.transition = 'transform 0.5s, opacity 0.5s';
    text.style.transform = 'translateY(-100px) scale(0.5)';
    text.style.opacity = '0';

    await this.delay(1000);
    this.removeOverlay();
    onComplete?.();
  }

  async echoSelf(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = 'rgba(0,0,0,0.96)';

    const dialog = document.createElement('div');
    dialog.className = 'void-dialog';
    ol.appendChild(dialog);

    const lines = [
      { who: 'echo', text: '...привет.' },
      { who: 'echo', text: 'Не пугайся. Я — это ты.' },
      { who: 'echo', text: 'Из другого витка.' },
      { who: 'echo', text: 'Не лети к Ядру. Пожалуйста.' },
      { who: 'echo', text: '...' },
      { who: 'sys', text: '[СИГНАЛ ПОТЕРЯН]' },
    ];

    for (const line of lines) {
      const el = document.createElement('div');
      el.className = `void-dialog-line ${line.who}`;
      el.textContent = line.text;
      dialog.appendChild(el);
      await this.delay(1200);
    }

    await this.delay(1500);
    this.removeOverlay();
    onComplete?.();
  }

  async cosmicVision(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = '#000';

    await this.delay(800);

    const text = document.createElement('div');
    text.className = 'void-vision-text';
    text.textContent = this.pick(VOID_VISIONS);
    ol.appendChild(text);

    await this.delay(4500);

    text.style.transition = 'opacity 1.5s';
    text.style.opacity = '0';
    await this.delay(1500);
    this.removeOverlay();
    onComplete?.();
  }

  async breathingWalls(onComplete) {
    const scene = document.querySelector('.scene') || document.querySelector('#game') || document.body.firstElementChild;
    if (!scene) { onComplete?.(); return; }

    scene.classList.add('void-breathing');

    const whisper = document.createElement('div');
    whisper.className = 'void-float-whisper';
    whisper.textContent = this.pick(VOID_WHISPERS);
    document.body.appendChild(whisper);

    await this.delay(4000);

    scene.classList.remove('void-breathing');
    whisper.style.transition = 'opacity 1s';
    whisper.style.opacity = '0';
    await this.delay(1000);
    whisper.remove();
    this.active = false;
    onComplete?.();
  }

  async gravityShift(onComplete) {
    const scene = document.querySelector('.scene') || document.querySelector('#game') || document.body.firstElementChild;
    if (!scene) { onComplete?.(); return; }

    scene.style.transition = 'transform 1s ease-in-out';
    scene.style.transform = 'rotate(2deg) translateY(10px)';

    await this.delay(1500);
    scene.style.transform = 'rotate(-1.5deg) translateY(-5px)';

    const text = document.createElement('div');
    text.className = 'void-float-whisper';
    text.textContent = 'Гравитация... скользит.';
    document.body.appendChild(text);

    await this.delay(2000);
    scene.style.transform = '';
    text.style.transition = 'opacity 0.5s';
    text.style.opacity = '0';
    await this.delay(500);
    text.remove();
    scene.style.transition = '';
    this.active = false;
    onComplete?.();
  }

  async timeSkip(onComplete) {
    const ol = this.createOverlay();
    ol.style.background = 'rgba(0,0,0,0.98)';

    const clock = document.createElement('div');
    clock.className = 'void-clock';
    clock.textContent = '00:00:00';
    ol.appendChild(clock);

    const speeds = [1, 5, 50, 500, 5000, 99999];
    let hours = 0, mins = 0, secs = 0;

    for (const spd of speeds) {
      for (let i = 0; i < 5; i++) {
        secs += spd;
        mins += Math.floor(secs / 60); secs %= 60;
        hours += Math.floor(mins / 60); mins %= 60;
        hours %= 100;
        clock.textContent = `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        await this.delay(100);
      }
    }

    clock.style.color = '#880000';
    clock.textContent = '??:??:??';

    const text = document.createElement('div');
    text.className = 'void-whisper';
    text.textContent = 'Сколько прошло? Дни? Годы?';
    ol.appendChild(text);

    await this.delay(2500);
    this.removeOverlay();
    onComplete?.();
  }
}

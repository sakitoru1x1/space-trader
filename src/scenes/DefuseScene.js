import { Scene } from '../engine/SceneManager.js';

export class DefuseScene extends Scene {
  init(data) {
    super.init(data);
    this.timer = 15;
    this.phase = 'play';
    this._actionTaken = false;
    this.sequence = [];
    this.playerSeq = [];
    this.seqLen = 4;
    this.showIdx = 0;
    this.showing = true;
    this.wireColors = ['#ff4444', '#4488ff', '#44ff44', '#ffcc44'];
    this.wireNames = ['Красный', 'Синий', 'Зелёный', 'Жёлтый'];
    this.generateSequence();
  }

  generateSequence() {
    this.sequence = [];
    for (let i = 0; i < this.seqLen; i++) {
      this.sequence.push(Math.floor(Math.random() * 4));
    }
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('combat');
    this.render();
    this.startShowSequence();

    this._timerInterval = this.interval(1000, () => {
      if (this.phase !== 'play') return;
      this.timer--;
      this.updateTimerDisplay();
      if (this.timer <= 0) {
        this.phase = 'exploded';
        this.endGame(false);
      }
    });
  }

  startShowSequence() {
    this.showing = true;
    this.showIdx = 0;
    this.render();

    const show = () => {
      if (this.showIdx >= this.sequence.length) {
        this.showing = false;
        this.render();
        return;
      }
      this.highlightWire(this.sequence[this.showIdx]);
      this.showIdx++;
      this.delayed(600, () => {
        this.clearHighlight();
        this.delayed(200, show);
      });
    };
    this.delayed(500, show);
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Мина!';
    content.appendChild(title);

    this.timerEl = this.el('div', '');
    this.timerEl.style.cssText = `font-size:36px;font-weight:bold;color:${this.timer <= 5 ? '#ff4444' : '#FFD700'};margin:8px 0;font-family:monospace`;
    this.timerEl.textContent = this.timer;
    content.appendChild(this.timerEl);

    const desc = this.el('div', 'text-center text-small text-gray mb-8');
    desc.textContent = this.showing
      ? 'Запоминай последовательность!'
      : `Повтори последовательность (${this.playerSeq.length}/${this.seqLen})`;
    content.appendChild(desc);

    const gs = this.gameState;
    if (gs.bonuses.scanner && this.showing) {
      const hint = this.el('div', 'text-center text-small text-cyan mb-8');
      hint.textContent = `Сканер: первый провод - ${this.wireNames[this.sequence[0]]}`;
      content.appendChild(hint);
    }

    this.btnsWrap = this.el('div', '');
    this.btnsWrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px';
    for (let i = 0; i < 4; i++) {
      const btn = this.el('button', '');
      btn.style.cssText = `padding:20px;border-radius:12px;background:${this.wireColors[i]}22;border:3px solid ${this.wireColors[i]};color:${this.wireColors[i]};cursor:pointer;font-size:14px;font-weight:bold;min-height:60px;transition:all 0.15s;opacity:${this.showing ? '0.5' : '1'}`;
      btn.textContent = this.wireNames[i];
      btn.dataset.idx = i;
      if (!this.showing) {
        this.listen(btn, 'click', () => this.pressWire(i));
      }
      this.btnsWrap.appendChild(btn);
    }
    content.appendChild(this.btnsWrap);

    const skipBtn = this.btn('Улететь (-10HP)', () => {
      if (this._actionTaken) return;
      this._actionTaken = true;
      const gs = this.gameState;
      gs.hp = Math.max(1, gs.hp - 10);
      gs.save();
      this.startScene('Galaxy');
    }, 'btn btn-wide');
    skipBtn.style.marginTop = '16px';
    content.appendChild(skipBtn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  highlightWire(idx) {
    if (!this.btnsWrap) return;
    const btns = this.btnsWrap.children;
    if (btns[idx]) {
      btns[idx].style.background = this.wireColors[idx] + '66';
      btns[idx].style.transform = 'scale(1.1)';
    }
  }

  clearHighlight() {
    if (!this.btnsWrap) return;
    for (let i = 0; i < 4; i++) {
      const btn = this.btnsWrap.children[i];
      if (btn) {
        btn.style.background = this.wireColors[i] + '22';
        btn.style.transform = 'scale(1)';
      }
    }
  }

  pressWire(idx) {
    if (this.phase !== 'play' || this.showing || this._actionTaken) return;
    if (this.sfx) this.sfx.click();

    const expected = this.sequence[this.playerSeq.length];
    this.playerSeq.push(idx);

    this.highlightWire(idx);
    this.delayed(200, () => this.clearHighlight());

    if (idx !== expected) {
      this._actionTaken = true;
      this.phase = 'exploded';
      this.delayed(300, () => this.endGame(false));
      return;
    }

    if (this.playerSeq.length >= this.seqLen) {
      this._actionTaken = true;
      this.phase = 'defused';
      this.delayed(300, () => this.endGame(true));
    } else {
      this.updateProgress();
    }
  }

  updateProgress() {
    const desc = this.container.querySelector('.text-gray');
    if (desc) desc.textContent = `Повтори последовательность (${this.playerSeq.length}/${this.seqLen})`;
  }

  updateTimerDisplay() {
    if (this.timerEl) {
      this.timerEl.textContent = this.timer;
      this.timerEl.style.color = this.timer <= 5 ? '#ff4444' : '#FFD700';
    }
  }

  endGame(defused) {
    const gs = this.gameState;
    let msg;
    if (defused) {
      const reward = 100 + Math.floor(Math.random() * 200);
      gs.credits += reward;
      gs.save();
      msg = `Обезврежено! +${reward}кр`;
    } else {
      const dmg = 20 + Math.floor(Math.random() * 30);
      gs.hp = Math.max(1, gs.hp - dmg);
      gs.save();
      msg = `Взрыв! -${dmg}HP`;
    }

    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = defused ? 'Обезврежено!' : 'Взрыв!';
    title.style.color = defused ? '#44ff44' : '#ff4444';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.style.color = defused ? '#44ff44' : '#ff4444';
    desc.textContent = msg;
    content.appendChild(desc);

    const btn = this.btn('Продолжить', () => this.startScene('Galaxy'), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }
}

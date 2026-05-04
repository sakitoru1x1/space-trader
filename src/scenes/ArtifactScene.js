import { Scene } from '../engine/SceneManager.js';

const SYMBOLS = ['◆', '★', '◈', '▲', '●', '✦'];

export class ArtifactScene extends Scene {
  init(data) {
    super.init(data);
    this._actionTaken = false;
    this.sequence = [];
    this.playerSeq = [];
    this.seqLen = 4;
    this.phase = 'intro';
    this.showIdx = 0;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');
    this.renderIntro();
  }

  renderIntro() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Артефакт древних';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.textContent = 'Артефакт покрыт символами. Они мерцают в определённой последовательности. Повторите её, чтобы активировать.';
    content.appendChild(desc);

    const options = this.el('div', 'event-options');

    const activateBtn = this.el('button', 'event-option');
    activateBtn.textContent = 'Попробовать активировать';
    this.listen(activateBtn, 'click', () => this.startPuzzle());
    options.appendChild(activateBtn);

    const gs = this.gameState;
    if (gs.bonuses.scanner) {
      const scanBtn = this.el('button', 'event-option');
      scanBtn.textContent = 'Просканировать (безопасно)';
      this.listen(scanBtn, 'click', () => {
        if (this._actionTaken) return;
        this._actionTaken = true;
        const reward = 200 + Math.floor(Math.random() * 300);
        gs.credits += reward;
        gs.save();
        this.showResult(`Сканер определил безопасный способ. +${reward}кр`, true);
      });
      options.appendChild(scanBtn);
    }

    const skipBtn = this.el('button', 'event-option');
    skipBtn.textContent = 'Пролететь мимо';
    this.listen(skipBtn, 'click', () => {
      if (this._actionTaken) return;
      this._actionTaken = true;
      this.startScene('Galaxy');
    });
    options.appendChild(skipBtn);

    content.appendChild(options);
    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  startPuzzle() {
    if (this._actionTaken) return;
    this._actionTaken = true;
    this.phase = 'showing';

    this.sequence = [];
    for (let i = 0; i < this.seqLen; i++) {
      this.sequence.push(Math.floor(Math.random() * SYMBOLS.length));
    }
    this.playerSeq = [];

    this.renderPuzzle();
    this.showSequence();
  }

  renderPuzzle() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Артефакт древних';
    content.appendChild(title);

    const desc = this.el('div', 'text-center text-small mb-8');
    desc.style.color = this.phase === 'showing' ? '#ffcc00' : '#88ccee';
    desc.textContent = this.phase === 'showing'
      ? 'Запоминайте...'
      : `Повторите (${this.playerSeq.length}/${this.seqLen})`;
    this.descEl = desc;
    content.appendChild(desc);

    const grid = this.el('div', '');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:240px;margin:16px 0';
    this.symbolBtns = [];

    for (let i = 0; i < SYMBOLS.length; i++) {
      const btn = this.el('button', '');
      btn.style.cssText = `width:68px;height:68px;border-radius:10px;background:rgba(20,20,50,0.9);border:2px solid #334;color:#aa88ff;font-size:28px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;opacity:${this.phase === 'showing' ? '0.5' : '1'}`;
      btn.textContent = SYMBOLS[i];
      if (this.phase !== 'showing') {
        this.listen(btn, 'click', () => this.pressSymbol(i));
      }
      grid.appendChild(btn);
      this.symbolBtns.push(btn);
    }
    content.appendChild(grid);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  showSequence() {
    this.showIdx = 0;
    const show = () => {
      if (this.showIdx >= this.sequence.length) {
        this.phase = 'input';
        this._actionTaken = false;
        this.renderPuzzle();
        return;
      }
      this.highlightSymbol(this.sequence[this.showIdx]);
      this.showIdx++;
      this.delayed(500, () => {
        this.clearHighlights();
        this.delayed(200, show);
      });
    };
    this.delayed(600, show);
  }

  highlightSymbol(idx) {
    if (!this.symbolBtns || !this.symbolBtns[idx]) return;
    this.symbolBtns[idx].style.background = '#aa88ff44';
    this.symbolBtns[idx].style.borderColor = '#aa88ff';
    this.symbolBtns[idx].style.transform = 'scale(1.15)';
  }

  clearHighlights() {
    if (!this.symbolBtns) return;
    for (const btn of this.symbolBtns) {
      btn.style.background = 'rgba(20,20,50,0.9)';
      btn.style.borderColor = '#334';
      btn.style.transform = 'scale(1)';
    }
  }

  pressSymbol(idx) {
    if (this.phase !== 'input' || this._actionTaken) return;
    if (this.sfx) this.sfx.click();

    this.highlightSymbol(idx);
    this.delayed(200, () => this.clearHighlights());

    const expected = this.sequence[this.playerSeq.length];
    this.playerSeq.push(idx);

    if (idx !== expected) {
      this._actionTaken = true;
      this.delayed(300, () => this.endPuzzle(false));
      return;
    }

    if (this.descEl) {
      this.descEl.textContent = `Повторите (${this.playerSeq.length}/${this.seqLen})`;
    }

    if (this.playerSeq.length >= this.seqLen) {
      this._actionTaken = true;
      this.delayed(300, () => this.endPuzzle(true));
    }
  }

  endPuzzle(success) {
    const gs = this.gameState;
    if (success) {
      const roll = Math.random();
      if (roll < 0.4) {
        const reward = 300 + Math.floor(Math.random() * 500);
        gs.credits += reward;
        gs.save();
        this.showResult(`Артефакт активирован! +${reward}кр`, true);
      } else if (roll < 0.65) {
        const fuel = 15 + Math.floor(Math.random() * 15);
        gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + fuel);
        gs.save();
        this.showResult(`Энергетический кристалл! +${fuel} топлива`, true);
      } else {
        const heal = 20 + Math.floor(Math.random() * 20);
        gs.hp = Math.min(gs.ship.hp + (gs.bonuses.hp || 0), gs.hp + heal);
        gs.save();
        this.showResult(`Артефакт восстановил корпус! +${heal}HP`, true);
      }
    } else {
      if (Math.random() < 0.5) {
        const dmg = 10 + Math.floor(Math.random() * 20);
        gs.hp = Math.max(1, gs.hp - dmg);
        gs.save();
        this.showResult(`Неверная последовательность! Артефакт ударил энергией. -${dmg}HP`, false);
      } else {
        this.showResult('Артефакт погас. Может, в следующий раз.', false);
      }
    }
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Находка' : 'Неудача';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.style.color = positive ? '#44ff44' : '#ff4444';
    desc.textContent = message;
    content.appendChild(desc);

    const btn = this.btn('Продолжить', () => this.startScene('Galaxy'), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }
}

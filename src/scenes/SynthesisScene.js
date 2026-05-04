import { Scene } from '../engine/SceneManager.js';

export class SynthesisScene extends Scene {
  init(data) {
    super.init(data);
    this.reagents = [
      { name: 'Водород', color: '#44aaff' },
      { name: 'Гелий', color: '#ffcc44' },
      { name: 'Литий', color: '#ff4444' },
      { name: 'Ксенон', color: '#aa44ff' },
    ];
    this.recipe = [];
    for (let i = 0; i < 3; i++) {
      this.recipe.push(Math.floor(Math.random() * this.reagents.length));
    }
    this.playerMix = [];
    this.phase = 'mix';
    this.attempts = 3;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('station');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Синтез топлива';
    content.appendChild(title);

    if (this.phase === 'mix') {
      const hint = this.el('div', 'text-center text-small text-gray mb-8');
      hint.textContent = `Подберите формулу (${this.playerMix.length}/3). Попыток: ${this.attempts}`;
      content.appendChild(hint);

      const mixDisplay = this.el('div', '');
      mixDisplay.style.cssText = 'display:flex;gap:8px;margin:12px 0;min-height:40px;justify-content:center';
      for (let i = 0; i < 3; i++) {
        const slot = this.el('div', '');
        if (i < this.playerMix.length) {
          const r = this.reagents[this.playerMix[i]];
          slot.style.cssText = `width:40px;height:40px;border-radius:50%;background:${r.color};display:flex;align-items:center;justify-content:center;font-size:10px;color:#000;font-weight:bold`;
          slot.textContent = r.name.substring(0, 2);
        } else {
          slot.style.cssText = 'width:40px;height:40px;border-radius:50%;border:2px dashed #334;display:flex;align-items:center;justify-content:center;font-size:20px;color:#334';
          slot.textContent = '?';
        }
        mixDisplay.appendChild(slot);
      }
      content.appendChild(mixDisplay);

      if (this.lastResult) {
        const fb = this.el('div', 'text-center text-small');
        fb.style.cssText = 'margin:8px 0;color:#ffcc44';
        fb.textContent = this.lastResult;
        content.appendChild(fb);
      }

      const btns = this.el('div', '');
      btns.style.cssText = 'display:flex;gap:8px;margin:12px 0;flex-wrap:wrap;justify-content:center';
      for (let i = 0; i < this.reagents.length; i++) {
        const r = this.reagents[i];
        const btn = this.el('button', '');
        btn.style.cssText = `padding:8px 16px;border-radius:6px;background:${r.color}33;border:1px solid ${r.color};color:${r.color};cursor:pointer;font-size:12px`;
        btn.textContent = r.name;
        this.listen(btn, 'click', () => this.addReagent(i));
        btns.appendChild(btn);
      }
      content.appendChild(btns);

      if (this.playerMix.length > 0) {
        const undoBtn = this.btn('Сброс', () => { this.playerMix = []; this.render(); }, 'btn btn-small');
        undoBtn.style.marginTop = '8px';
        content.appendChild(undoBtn);
      }
    } else {
      this.renderResult(content);
    }

    const back = this.btn('Уйти', () => this.startScene('Station', { tab: 'services' }), 'btn btn-wide');
    back.style.marginTop = '12px';
    content.appendChild(back);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  addReagent(idx) {
    if (this.phase !== 'mix') return;
    if (this.sfx) this.sfx.click();
    this.playerMix.push(idx);

    if (this.playerMix.length === 3) {
      this.checkMix();
    } else {
      this.render();
    }
  }

  checkMix() {
    let exact = 0;
    let partial = 0;
    const recipeCopy = [...this.recipe];
    const mixCopy = [...this.playerMix];

    for (let i = 0; i < 3; i++) {
      if (mixCopy[i] === recipeCopy[i]) {
        exact++;
        recipeCopy[i] = -1;
        mixCopy[i] = -2;
      }
    }
    for (let i = 0; i < 3; i++) {
      if (mixCopy[i] < 0) continue;
      const idx = recipeCopy.indexOf(mixCopy[i]);
      if (idx >= 0) {
        partial++;
        recipeCopy[idx] = -1;
      }
    }

    if (exact === 3) {
      this.phase = 'success';
      this.render();
      return;
    }

    this.attempts--;
    this.lastResult = `Точно: ${exact} | На месте: ${partial}`;
    this.playerMix = [];

    if (this.attempts <= 0) {
      this.phase = 'fail';
    }
    this.render();
  }

  renderResult(content) {
    const success = this.phase === 'success';
    const gs = this.gameState;

    const msg = this.el('div', 'event-title');
    msg.textContent = success ? 'Синтез успешен!' : 'Формула не найдена';
    msg.style.color = success ? '#44ff44' : '#ff4444';
    content.appendChild(msg);

    if (success) {
      const fuelGain = 15 + Math.floor(Math.random() * 10);
      gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + fuelGain);
      gs.save();
      const info = this.el('div', 'text-center text-green');
      info.textContent = `+${fuelGain} топлива!`;
      content.appendChild(info);
    }
  }
}

import { Scene } from '../engine/SceneManager.js';

export class RepairScene extends Scene {
  init(data) {
    super.init(data);
    this.damageAmount = data.damageAmount || 20;
    this.progress = 0;
    this.target = 100;
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.phase = 'play';
    this.sequence = this.generateSequence();
    this.currentIdx = 0;
  }

  generateSequence() {
    const symbols = ['🔧', '⚡', '🔩', '💡'];
    const seq = [];
    for (let i = 0; i < 8; i++) {
      seq.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    return seq;
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
    title.textContent = 'Аварийный ремонт';
    content.appendChild(title);

    if (this.phase === 'play') {
      const info = this.el('div', 'text-center text-small text-gray mb-8');
      info.textContent = `Прогресс: ${this.progress}% | Ошибки: ${this.mistakes}/${this.maxMistakes}`;
      content.appendChild(info);

      const seqDisplay = this.el('div', 'text-center');
      seqDisplay.style.cssText = 'font-size:24px;margin:12px 0;letter-spacing:4px';
      let html = '';
      for (let i = 0; i < this.sequence.length; i++) {
        const color = i < this.currentIdx ? '#44ff44' : i === this.currentIdx ? '#FFD700' : '#334';
        html += `<span style="color:${color}">${this.sequence[i]}</span>`;
      }
      seqDisplay.innerHTML = html;
      content.appendChild(seqDisplay);

      const symbols = ['🔧', '⚡', '🔩', '💡'];
      const btns = this.el('div', '');
      btns.style.cssText = 'display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;justify-content:center';
      for (const sym of symbols) {
        const btn = this.el('button', '');
        btn.style.cssText = 'width:56px;height:56px;font-size:24px;background:rgba(20,20,50,0.8);border:2px solid #334;border-radius:8px;cursor:pointer';
        btn.textContent = sym;
        this.listen(btn, 'click', () => this.tap(sym));
        btns.appendChild(btn);
      }
      content.appendChild(btns);
    } else {
      this.renderResult(content);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  tap(symbol) {
    if (this.phase !== 'play') return;
    if (this.sfx) this.sfx.click();

    if (symbol === this.sequence[this.currentIdx]) {
      this.currentIdx++;
      if (this.currentIdx >= this.sequence.length) {
        this.progress += Math.floor(100 / 3);
        if (this.progress >= 100) {
          this.phase = 'success';
        } else {
          this.sequence = this.generateSequence();
          this.currentIdx = 0;
        }
      }
    } else {
      this.mistakes++;
      if (this.mistakes >= this.maxMistakes) {
        this.phase = 'fail';
      }
    }
    this.render();
  }

  renderResult(content) {
    const success = this.phase === 'success';
    const title = this.el('div', 'event-title');
    title.textContent = success ? 'Ремонт завершён!' : 'Ремонт провален';
    title.style.color = success ? '#44ff44' : '#ff4444';
    content.appendChild(title);

    const gs = this.gameState;
    if (success) {
      const healed = this.damageAmount;
      gs.hp = Math.min(gs.ship.hp + (gs.bonuses.hp || 0), gs.hp + healed);
      gs.save();
      const msg = this.el('div', 'text-center text-green');
      msg.textContent = `+${healed} HP`;
      content.appendChild(msg);
    } else {
      const msg = this.el('div', 'text-center text-red');
      msg.textContent = 'Слишком много ошибок.';
      content.appendChild(msg);
    }

    const btn = this.btn('Продолжить', () => this.startScene('Station', { tab: 'services' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }
}

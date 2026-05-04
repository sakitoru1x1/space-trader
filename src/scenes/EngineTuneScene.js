import { Scene } from '../engine/SceneManager.js';

export class EngineTuneScene extends Scene {
  init(data) {
    super.init(data);
    this.bars = [];
    this.targets = [];
    this.barCount = 4;
    this.phase = 'play';
    this.score = 0;
    for (let i = 0; i < this.barCount; i++) {
      this.bars.push(0);
      this.targets.push(30 + Math.floor(Math.random() * 40));
    }
    this.activeBar = 0;
    this.direction = 1;
    this.speed = 2;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('station');
    this.render();
    this.startAnimation();
  }

  startAnimation() {
    const tick = () => {
      if (this.phase !== 'play') return;
      this.bars[this.activeBar] += this.direction * this.speed;
      if (this.bars[this.activeBar] >= 100) {
        this.bars[this.activeBar] = 100;
        this.direction = -1;
      } else if (this.bars[this.activeBar] <= 0) {
        this.bars[this.activeBar] = 0;
        this.direction = 1;
      }
      this.updateDisplay();
      this._animFrame = this.raf(tick);
    };
    this._animFrame = this.raf(tick);
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Настройка двигателя';
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = `Остановите индикатор на зелёной зоне (${this.activeBar + 1}/${this.barCount})`;
    content.appendChild(info);

    this._barsContainer = this.el('div', '');
    this._barsContainer.style.cssText = 'width:100%;max-width:280px;margin:12px 0';

    for (let i = 0; i < this.barCount; i++) {
      const barWrap = this.el('div', '');
      barWrap.style.cssText = 'margin:8px 0';

      const label = this.el('div', '');
      label.style.cssText = `font-size:11px;color:${i < this.activeBar ? '#44ff44' : i === this.activeBar ? '#FFD700' : '#334'};margin-bottom:2px`;
      label.textContent = `Цилиндр ${i + 1}`;
      barWrap.appendChild(label);

      const track = this.el('div', '');
      track.style.cssText = 'height:20px;background:#1a1a3e;border-radius:4px;position:relative;overflow:hidden';

      const target = this.el('div', '');
      target.style.cssText = `position:absolute;left:${this.targets[i] - 5}%;width:10%;height:100%;background:rgba(68,255,68,0.3);border-left:2px solid #44ff44;border-right:2px solid #44ff44`;
      track.appendChild(target);

      const indicator = this.el('div', `bar-indicator-${i}`);
      indicator.style.cssText = `position:absolute;left:${this.bars[i]}%;width:4px;height:100%;background:#FFD700;border-radius:2px;transition:none`;
      track.appendChild(indicator);

      barWrap.appendChild(track);
      this._barsContainer.appendChild(barWrap);
    }
    content.appendChild(this._barsContainer);

    if (this.phase === 'play') {
      const stopBtn = this.btn('СТОП!', () => this.stop(), 'btn btn-wide btn-green');
      stopBtn.style.cssText += ';font-size:18px;padding:12px 24px;margin-top:16px';
      content.appendChild(stopBtn);
    } else {
      this.renderResult(content);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  updateDisplay() {
    const indicator = this.container.querySelector(`.bar-indicator-${this.activeBar}`);
    if (indicator) indicator.style.left = `${this.bars[this.activeBar]}%`;
  }

  stop() {
    if (this.phase !== 'play') return;
    if (this.sfx) this.sfx.click();

    const val = this.bars[this.activeBar];
    const target = this.targets[this.activeBar];
    const diff = Math.abs(val - target);
    if (diff <= 5) this.score += 3;
    else if (diff <= 10) this.score += 2;
    else if (diff <= 20) this.score += 1;

    this.activeBar++;
    this.speed += 0.5;
    this.direction = 1;

    if (this.activeBar >= this.barCount) {
      this.phase = 'done';
      this.render();
    } else {
      this.bars[this.activeBar] = 0;
      this.render();
      this.startAnimation();
    }
  }

  renderResult(content) {
    const maxScore = this.barCount * 3;
    const pct = Math.round(this.score / maxScore * 100);
    const gs = this.gameState;

    const msg = this.el('div', 'event-title');
    msg.style.color = pct >= 50 ? '#44ff44' : '#ff8844';
    msg.textContent = pct >= 80 ? 'Отлично!' : pct >= 50 ? 'Нормально' : 'Плохо';
    content.appendChild(msg);

    const scoreText = this.el('div', 'text-center text-gold');
    scoreText.style.fontSize = '14px';
    scoreText.textContent = `Результат: ${this.score}/${maxScore} (${pct}%)`;
    content.appendChild(scoreText);

    if (pct >= 50) {
      const fuelBonus = Math.floor(pct / 10);
      gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + fuelBonus);
      gs.save();
      const info = this.el('div', 'text-center text-green');
      info.textContent = `Эффективность повышена! +${fuelBonus} топлива`;
      content.appendChild(info);
    }

    const btn = this.btn('Продолжить', () => this.startScene('Station', { tab: 'services' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }
}

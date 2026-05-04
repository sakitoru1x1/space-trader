import { Scene } from '../engine/SceneManager.js';

export class DefenseScene extends Scene {
  init(data) {
    super.init(data);
    this.difficulty = data.difficulty || 1;
    this.wave = 0;
    this.maxWaves = 3 + this.difficulty;
    this.stationHp = 100;
    this.kills = 0;
    this.phase = 'play';
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('combat');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Оборона станции';
    content.appendChild(title);

    if (this.phase === 'play' && this.wave === 0 && this.stationHp === 100) {
      const hint = this.el('div', 'text-center text-small text-gray mb-8');
      hint.textContent = 'Выбирай тактику: фокус бьёт сильно одного, веер - всех, щит защищает станцию. Не дай HP станции упасть до 0!';
      content.appendChild(hint);
    }

    if (this.phase === 'play') {
      const hpBar = this.el('div', '');
      hpBar.style.cssText = 'width:200px;margin:8px auto';
      const hpColor = this.stationHp > 50 ? '#44ff44' : this.stationHp > 25 ? '#ffaa00' : '#ff4444';
      hpBar.innerHTML = `
        <div style="font-size:11px;color:${hpColor};text-align:center">Станция: ${this.stationHp}%</div>
        <div style="height:8px;background:#1a1a3e;border-radius:4px"><div style="height:100%;width:${this.stationHp}%;background:${hpColor};border-radius:4px"></div></div>
      `;
      content.appendChild(hpBar);

      const info = this.el('div', 'text-center text-small text-gray mb-8');
      info.textContent = `Волна ${this.wave + 1}/${this.maxWaves} | Уничтожено: ${this.kills}`;
      content.appendChild(info);

      const enemies = 2 + this.wave + this.difficulty;
      const desc = this.el('div', 'text-center text-orange');
      desc.style.margin = '8px 0';
      desc.textContent = `${enemies} пиратских кораблей приближаются!`;
      content.appendChild(desc);

      const options = this.el('div', 'event-options');

      const focusBtn = this.el('button', 'event-option');
      focusBtn.textContent = 'Сфокусировать огонь';
      this.listen(focusBtn, 'click', () => this.action('focus', enemies));
      options.appendChild(focusBtn);

      const spreadBtn = this.el('button', 'event-option');
      spreadBtn.textContent = 'Рассредоточить огонь';
      this.listen(spreadBtn, 'click', () => this.action('spread', enemies));
      options.appendChild(spreadBtn);

      const shieldBtn = this.el('button', 'event-option');
      shieldBtn.textContent = 'Усилить щиты';
      this.listen(shieldBtn, 'click', () => this.action('shield', enemies));
      options.appendChild(shieldBtn);

      content.appendChild(options);
    } else {
      this.renderResult(content);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  action(type, enemies) {
    if (this.sfx) this.sfx.click();
    const gs = this.gameState;
    const atk = gs.ship.attack + (gs.bonuses.dmgBoost ? Math.floor(gs.ship.attack * gs.bonuses.dmgBoost) : 0);

    let killed = 0;
    let dmgToStation = 0;

    if (type === 'focus') {
      killed = Math.min(enemies, Math.floor(atk / 5) + 1);
      dmgToStation = Math.max(0, enemies - killed) * (3 + this.difficulty);
    } else if (type === 'spread') {
      killed = Math.min(enemies, Math.floor(atk / 7) + 2);
      dmgToStation = Math.max(0, enemies - killed) * (2 + this.difficulty);
    } else {
      killed = Math.min(enemies, Math.floor(atk / 10));
      dmgToStation = Math.max(0, Math.floor((enemies - killed) * (1 + this.difficulty) * 0.5));
    }

    this.kills += killed;
    this.stationHp = Math.max(0, this.stationHp - dmgToStation);
    this.wave++;

    if (this.stationHp <= 0) {
      this.phase = 'lost';
    } else if (this.wave >= this.maxWaves) {
      this.phase = 'won';
    }

    this.render();
  }

  renderResult(content) {
    const won = this.phase === 'won';
    const gs = this.gameState;

    const msg = this.el('div', 'event-title');
    msg.textContent = won ? 'Станция спасена!' : 'Станция уничтожена...';
    msg.style.color = won ? '#44ff44' : '#ff4444';
    content.appendChild(msg);

    if (won) {
      const reward = 200 + this.kills * 30;
      gs.credits += reward;
      const sys = gs.getSystem();
      if (sys.faction && gs.factionRep[sys.faction] !== undefined) gs.factionRep[sys.faction] += 5;
      gs.save();
      const info = this.el('div', 'text-center text-green');
      info.textContent = `+${reward}кр, репутация +5`;
      content.appendChild(info);
    }

    const btn = this.btn('Продолжить', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }
}

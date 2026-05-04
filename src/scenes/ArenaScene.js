import { Scene } from '../engine/SceneManager.js';

const OPPONENTS = [
  { name: 'Пьяный пилот', hp: 30, atk: 5, reward: 80 },
  { name: 'Наёмник-ветеран', hp: 50, atk: 10, reward: 200 },
  { name: 'Боевой дроид', hp: 70, atk: 14, reward: 400 },
  { name: 'Чемпион арены', hp: 100, atk: 18, reward: 800 },
];

export class ArenaScene extends Scene {
  init(data) {
    super.init(data);
    this.opponent = null;
    this.playerHp = 0;
    this.opponentHp = 0;
    this.log = [];
    this.phase = 'select';
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
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:16px';

    if (this.phase === 'select') {
      const title = this.el('div', 'event-title');
      title.textContent = 'Арена';
      content.appendChild(title);

      const desc = this.el('div', 'text-center text-small text-gray mb-8');
      desc.textContent = 'Выберите противника:';
      content.appendChild(desc);

      for (const opp of OPPONENTS) {
        const row = this.el('div', 'equip-item');
        row.innerHTML = `
          <div style="flex:1">
            <div style="color:#ff8844">${opp.name}</div>
            <div class="equip-desc">HP:${opp.hp} ATK:${opp.atk} | Награда: ${opp.reward}кр</div>
          </div>
        `;
        const btn = this.el('button', 'btn btn-small btn-green', 'Бой');
        this.listen(btn, 'click', () => this.startFight(opp));
        row.appendChild(btn);
        content.appendChild(row);
      }

      const back = this.btn('Уйти', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide');
      back.style.marginTop = '16px';
      content.appendChild(back);
    } else if (this.phase === 'fight') {
      this.renderFight(content);
    } else {
      this.renderResult(content);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  startFight(opp) {
    if (this.sfx) this.sfx.click();
    this.opponent = opp;
    this.playerHp = 50 + Math.floor(this.gameState.ship.attack * 2);
    this.opponentHp = opp.hp;
    this.log = [];
    this.phase = 'fight';
    this.render();
  }

  renderFight(content) {
    const title = this.el('div', 'event-title');
    title.textContent = `vs ${this.opponent.name}`;
    content.appendChild(title);

    const bars = this.el('div', '');
    bars.style.cssText = 'width:100%;max-width:300px;margin:12px 0';
    const pPct = Math.max(0, Math.round(this.playerHp / (50 + this.gameState.ship.attack * 2) * 100));
    const oPct = Math.max(0, Math.round(this.opponentHp / this.opponent.hp * 100));
    bars.innerHTML = `
      <div style="margin-bottom:8px">
        <div style="color:#44aaff;font-size:12px">Вы: ${this.playerHp}HP</div>
        <div style="height:8px;background:#1a1a3e;border-radius:4px"><div style="height:100%;width:${pPct}%;background:#44aaff;border-radius:4px"></div></div>
      </div>
      <div>
        <div style="color:#ff4444;font-size:12px">${this.opponent.name}: ${this.opponentHp}HP</div>
        <div style="height:8px;background:#1a1a3e;border-radius:4px"><div style="height:100%;width:${oPct}%;background:#ff4444;border-radius:4px"></div></div>
      </div>
    `;
    content.appendChild(bars);

    for (const msg of this.log.slice(-4)) {
      const line = this.el('div', 'text-center text-small');
      line.style.cssText = `color:${msg.color || '#888'};margin:2px 0;font-size:11px`;
      line.textContent = msg.text;
      content.appendChild(line);
    }

    const btns = this.el('div', '');
    btns.style.cssText = 'display:flex;gap:8px;margin-top:12px';

    const atkBtn = this.btn('Атака', () => this.attack(), 'btn btn-green');
    btns.appendChild(atkBtn);

    const defBtn = this.btn('Защита', () => this.defend(), 'btn');
    btns.appendChild(defBtn);

    const fleeBtn = this.btn('Сдаться', () => { this.phase = 'lost'; this.render(); }, 'btn');
    fleeBtn.style.color = '#ff4444';
    btns.appendChild(fleeBtn);

    content.appendChild(btns);
  }

  attack() {
    if (this.sfx) this.sfx.click();
    const gs = this.gameState;
    const pDmg = Math.floor(8 + gs.ship.attack * 0.8 + Math.random() * 6);
    this.opponentHp -= pDmg;
    this.log.push({ text: `Вы нанесли ${pDmg} урона`, color: '#44aaff' });

    if (this.opponentHp <= 0) {
      this.phase = 'won';
      this.render();
      return;
    }

    const oDmg = Math.floor(this.opponent.atk * (0.7 + Math.random() * 0.6));
    this.playerHp -= oDmg;
    this.log.push({ text: `${this.opponent.name} нанёс ${oDmg} урона`, color: '#ff4444' });

    if (this.playerHp <= 0) {
      this.phase = 'lost';
    }
    this.render();
  }

  defend() {
    if (this.sfx) this.sfx.click();
    const oDmg = Math.max(1, Math.floor(this.opponent.atk * (0.3 + Math.random() * 0.3)));
    this.playerHp -= oDmg;
    this.log.push({ text: `Блок! Получено ${oDmg} урона`, color: '#ffaa00' });

    const counter = Math.floor(4 + Math.random() * 4);
    this.opponentHp -= counter;
    this.log.push({ text: `Контрудар: ${counter}`, color: '#44aaff' });

    if (this.opponentHp <= 0) { this.phase = 'won'; }
    else if (this.playerHp <= 0) { this.phase = 'lost'; }
    this.render();
  }

  renderResult(content) {
    const won = this.phase === 'won';
    const title = this.el('div', 'event-title');
    title.textContent = won ? 'Победа!' : 'Поражение';
    title.style.color = won ? '#FFD700' : '#ff4444';
    content.appendChild(title);

    if (won) {
      this.gameState.credits += this.opponent.reward;
      this.gameState.save();
      const reward = this.el('div', 'text-center text-gold');
      reward.style.fontSize = '16px';
      reward.textContent = `+${this.opponent.reward}кр`;
      content.appendChild(reward);
    } else {
      const msg = this.el('div', 'text-center text-red');
      msg.textContent = 'Вас вынесли с арены.';
      content.appendChild(msg);
    }

    const btn = this.btn('Продолжить', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }
}

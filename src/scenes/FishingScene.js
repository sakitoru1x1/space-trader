import { Scene } from '../engine/SceneManager.js';
import { GOODS } from '../data/galaxy.js';

const CATCHES = [
  { name: 'Космический мусор', value: 5, weight: 30, goodId: 'metals', qty: 1 },
  { name: 'Обломок корабля', value: 20, weight: 25, goodId: 'metals', qty: 2 },
  { name: 'Контейнер с топливом', value: 0, fuel: 10, weight: 20 },
  { name: 'Редкий минерал', value: 80, weight: 12, goodId: 'artifacts', qty: 1 },
  { name: 'Чёрный ящик', value: 150, weight: 8, goodId: 'electronics', qty: 2 },
  { name: 'Артефакт древних', value: 300, weight: 4, goodId: 'artifacts', qty: 3 },
  { name: 'Ничего', value: 0, weight: 15 },
];

export class FishingScene extends Scene {
  init(data) {
    super.init(data);
    this.attempts = 3;
    this.totalValue = 0;
    this.totalFuel = 0;
    this.pendingCargo = [];
    this.log = [];
    this.phase = 'ready';
    this.barPos = 0;
    this.barDir = 1;
    this.barSpeed = 2.5;
    this.greenStart = 0;
    this.greenEnd = 0;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('space');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Сбор обломков';
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = `Попыток: ${this.attempts} | Собрано: ${this.totalValue}кр${this.totalFuel ? ` +${this.totalFuel}F` : ''}`;
    content.appendChild(info);

    for (const entry of this.log) {
      const line = this.el('div', 'text-center text-small');
      line.style.cssText = `color:${entry.color};margin:2px 0`;
      line.textContent = entry.text;
      content.appendChild(line);
    }

    if (this.attempts > 0 && this.phase !== 'done') {
      const desc = this.el('div', 'text-center text-small text-cyan mb-8');
      desc.textContent = 'Нажмите в зелёной зоне!';
      content.appendChild(desc);

      const canvas = this.el('canvas', 'minigame-canvas');
      canvas.width = 300;
      canvas.height = 60;
      canvas.style.cssText = 'margin:8px 0;border-radius:6px;cursor:pointer;touch-action:none';
      content.appendChild(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.listen(canvas, 'click', () => this.strike());
      this.listen(canvas, 'touchstart', (e) => { e.preventDefault(); this.strike(); });

      this.randomizeGreenZone();
      this.phase = 'moving';
      this.barPos = 0;
      this.barDir = 1;
      this.animateBar();

      const leaveBtn = this.btn('Улететь', () => this.finish(), 'btn btn-wide');
      leaveBtn.style.marginTop = '12px';
      content.appendChild(leaveBtn);
    } else {
      if (this.attempts <= 0) {
        const desc = this.el('div', 'text-center text-gold');
        desc.style.marginTop = '12px';
        desc.textContent = 'Тросы закончились!';
        content.appendChild(desc);
      }
      const btn = this.btn('Продолжить', () => this.finish(), 'btn btn-wide btn-green');
      btn.style.marginTop = '12px';
      content.appendChild(btn);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  randomizeGreenZone() {
    const w = 300;
    const zoneWidth = 40 + Math.random() * 30;
    this.greenStart = 30 + Math.random() * (w - zoneWidth - 60);
    this.greenEnd = this.greenStart + zoneWidth;
    this.barSpeed = 2.5 + (3 - this.attempts) * 0.8;
  }

  animateBar() {
    if (this.phase !== 'moving') return;
    this.barPos += this.barDir * this.barSpeed;
    if (this.barPos >= 296) { this.barPos = 296; this.barDir = -1; }
    if (this.barPos <= 0) { this.barPos = 0; this.barDir = 1; }
    this.drawBar();
    this.raf(() => this.animateBar());
  }

  drawBar() {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = 300, h = 60;
    ctx.fillStyle = '#111122';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#332200';
    ctx.fillRect(0, 15, w, 30);

    ctx.fillStyle = '#224422';
    ctx.fillRect(this.greenStart, 15, this.greenEnd - this.greenStart, 30);

    const yellowPad = 15;
    ctx.fillStyle = '#443300';
    ctx.fillRect(this.greenStart - yellowPad, 15, yellowPad, 30);
    ctx.fillRect(this.greenEnd, 15, yellowPad, 30);

    ctx.fillStyle = '#ff4444';
    ctx.fillRect(this.barPos - 2, 8, 4, 44);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.barPos - 1, 12, 2, 36);
  }

  strike() {
    if (this.phase !== 'moving') return;
    this.phase = 'struck';
    if (this.sfx) this.sfx.click();
    this.attempts--;

    const pos = this.barPos;
    const yellowPad = 15;
    let quality;

    if (pos >= this.greenStart && pos <= this.greenEnd) {
      quality = 'green';
    } else if (pos >= this.greenStart - yellowPad && pos <= this.greenEnd + yellowPad) {
      quality = 'yellow';
    } else {
      quality = 'red';
    }

    let c;
    if (quality === 'green') {
      const good = CATCHES.filter(x => x.value >= 80 || x.fuel > 0);
      c = good[Math.floor(Math.random() * good.length)];
    } else if (quality === 'yellow') {
      const mid = CATCHES.filter(x => x.value > 0 && x.value <= 80);
      c = mid.length > 0 ? mid[Math.floor(Math.random() * mid.length)] : CATCHES[0];
    } else {
      c = Math.random() < 0.5 ? CATCHES[0] : CATCHES[6];
    }

    if (c.value > 0 || c.fuel > 0) {
      this.totalValue += c.value;
      this.totalFuel += (c.fuel || 0);
      if (c.goodId) this.pendingCargo.push({ goodId: c.goodId, qty: c.qty });
      const text = c.fuel ? `${c.name}: +${c.fuel}F` : `${c.name}: +${c.value}кр`;
      const color = quality === 'green' ? '#44ff44' : '#ffcc44';
      this.log.push({ text, color });
    } else {
      this.log.push({ text: c.name === 'Ничего' ? 'Пусто...' : `${c.name}: ничего ценного`, color: '#888' });
    }

    this.delayed(300, () => {
      this.phase = 'ready';
      this.render();
    });
  }

  finish() {
    const gs = this.gameState;
    if (this.totalValue > 0) gs.credits += this.totalValue;
    if (this.totalFuel > 0) gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + this.totalFuel);
    for (const item of this.pendingCargo) {
      const added = gs.addCargo(item.goodId, item.qty);
      if (added > 0) {
        const good = GOODS.find(g => g.id === item.goodId);
        if (good) this.toast(`+${added} ${good.icon}${good.name}`, 'positive');
      }
    }
    gs.save();
    this.startScene('Galaxy');
  }
}

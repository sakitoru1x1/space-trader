import { Scene } from '../engine/SceneManager.js';
import { GOODS } from '../data/galaxy.js';

export class BriberyScene extends Scene {
  init(data) {
    super.init(data);
    this.phase = 'negotiate';
    this.markerPos = 0;
    this.markerDir = 1;
    this.markerSpeed = 2;
    this.sweetStart = 0;
    this.sweetEnd = 0;
    this.bribeBase = 50 + Math.floor(Math.random() * 100);
    this._actionTaken = false;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');
    this.renderNegotiation();
  }

  renderNegotiation() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Блокпост';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.textContent = 'Офицер намекает на взятку. Остановите маркер в зелёной зоне - правильная сумма. Слишком мало - откажет, слишком много - подозрит��льно.';
    content.appendChild(desc);

    const canvas = this.el('canvas', 'minigame-canvas');
    canvas.width = 300;
    canvas.height = 60;
    canvas.style.cssText = 'margin:12px 0;border-radius:6px;cursor:pointer;touch-action:none';
    content.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.sweetStart = 90 + Math.random() * 80;
    this.sweetEnd = this.sweetStart + 50;
    this.markerPos = 0;
    this.markerDir = 1;
    this.markerSpeed = 2.5;
    this.phase = 'moving';

    this.listen(canvas, 'click', () => this.stopMarker());
    this.listen(canvas, 'touchstart', (e) => { e.preventDefault(); this.stopMarker(); });

    const costInfo = this.el('div', 'text-center text-small text-gold mb-8');
    costInfo.textContent = `Базовая ставка: ~${this.bribeBase}кр`;
    content.appendChild(costInfo);

    const altBtns = this.el('div', 'event-options');

    const submitBtn = this.el('button', 'event-option');
    submitBtn.textContent = 'Пройти досмотр';
    this.listen(submitBtn, 'click', () => this.submitToSearch());
    altBtns.appendChild(submitBtn);

    const fleeBtn = this.el('button', 'event-option');
    fleeBtn.textContent = 'Сбежат��';
    this.listen(fleeBtn, 'click', () => this.flee());
    altBtns.appendChild(fleeBtn);

    content.appendChild(altBtns);

    scene.appendChild(content);
    this.container.appendChild(scene);

    this.animateMarker();
  }

  animateMarker() {
    if (this.phase !== 'moving') return;
    this.markerPos += this.markerDir * this.markerSpeed;
    if (this.markerPos >= 296) { this.markerPos = 296; this.markerDir = -1; }
    if (this.markerPos <= 0) { this.markerPos = 0; this.markerDir = 1; }
    this.drawBar();
    this.raf(() => this.animateMarker());
  }

  drawBar() {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = 300, h = 60;
    ctx.fillStyle = '#111122';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#442222';
    ctx.fillRect(0, 15, w, 30);

    ctx.fillStyle = '#224422';
    ctx.fillRect(this.sweetStart, 15, this.sweetEnd - this.sweetStart, 30);

    ctx.fillStyle = '#443300';
    ctx.fillRect(this.sweetStart - 20, 15, 20, 30);
    ctx.fillRect(this.sweetEnd, 15, 20, 30);

    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(this.markerPos - 2, 8, 4, 44);
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.markerPos - 1, 12, 2, 36);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('МАЛО', 40, 55);
    ctx.fillText('НОРМ', (this.sweetStart + this.sweetEnd) / 2, 55);
    ctx.fillText('МНОГО', 260, 55);
  }

  stopMarker() {
    if (this.phase !== 'moving' || this._actionTaken) return;
    this._actionTaken = true;
    this.phase = 'stopped';
    if (this.sfx) this.sfx.click();

    const gs = this.gameState;
    const pos = this.markerPos;

    if (pos >= this.sweetStart && pos <= this.sweetEnd) {
      gs.credits -= Math.min(gs.credits, this.bribeBase);
      gs.save();
      this.showResult(`Взятка принята. -${this.bribeBase}кр`, true);
    } else if (pos < this.sweetStart - 20) {
      this.showResult('Слишком мало! Офицер оскорблён. Досмотр.', false);
      this.doSearch(gs);
    } else if (pos > this.sweetEnd + 20) {
      const fine = this.bribeBase * 2;
      gs.credits = Math.max(0, gs.credits - fine);
      gs.save();
      this.showResult(`Подозрительно щедро! Арест за подкуп. -${fine}к��`, false);
    } else {
      gs.credits -= Math.min(gs.credits, Math.floor(this.bribeBase * 0.7));
      gs.save();
      this.showResult(`Почти... Офицер кивнул, но без энтузиазма. -${Math.floor(this.bribeBase * 0.7)}кр`, true);
    }
  }

  submitToSearch() {
    if (this._actionTaken) return;
    this._actionTaken = true;
    this.phase = 'stopped';
    if (this.sfx) this.sfx.click();
    this.doSearch(this.gameState);
  }

  doSearch(gs) {
    const hasIllegal = gs.cargo.some(c => {
      const g = GOODS.find(g => g.id === c.goodId);
      return g && !g.legal;
    });
    if (hasIllegal && Math.random() < 0.6) {
      const fine = 200;
      gs.credits = Math.max(0, gs.credits - fine);
      gs.save();
      this.showResult(`Контрабанда обнаружена! Штраф ${fine}кр`, false);
    } else {
      this.showResult('Досмотр пройден без проблем.', true);
    }
  }

  flee() {
    if (this._actionTaken) return;
    this._actionTaken = true;
    this.phase = 'stopped';
    if (this.sfx) this.sfx.click();

    const gs = this.gameState;
    const speed = gs.ship.speed + (gs.bonuses.speed || 0);
    if (Math.random() < 0.3 + speed * 0.05) {
      this.showResult('Удалось уйти от патруля!', true);
    } else {
      const dmg = 10 + Math.floor(Math.random() * 15);
      gs.hp = Math.max(1, gs.hp - dmg);
      gs.save();
      this.showResult(`Патруль открыл огонь! -${dmg}HP`, false);
    }
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Пронесло' : 'Проблемы';
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

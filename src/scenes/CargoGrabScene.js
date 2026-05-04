import { Scene } from '../engine/SceneManager.js';

export class CargoGrabScene extends Scene {
  init(data) {
    super.init(data);
    this.gameOver = false;
    this.shipX = 150;
    this.crates = [];
    this.caught = 0;
    this.missed = 0;
    this.maxMissed = 5;
    this.elapsed = 0;
    this.duration = 15000;
    this.spawnTimer = 0;
    this.lastTime = 0;
    this.touchSide = null;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');

    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:12px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Дрейфующий груз';
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = 'Лови контейнеры!';
    content.appendChild(info);

    this.hud = this.el('div', 'text-center text-small');
    this.hud.style.cssText = 'color:#88ccee;margin:4px 0';
    content.appendChild(this.hud);

    const canvas = this.el('canvas', 'minigame-canvas');
    const cw = Math.min(this.w - 24, 360);
    canvas.width = cw;
    canvas.height = Math.min(this.h - 200, 400);
    canvas.style.cssText = 'touch-action:none;cursor:pointer';
    content.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shipX = canvas.width / 2;

    this.listen(canvas, 'touchstart', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      this.touchSide = tx < canvas.width / 2 ? 'left' : 'right';
    });
    this.listen(canvas, 'touchend', () => { this.touchSide = null; });
    this.listen(document, 'keydown', (e) => {
      if (e.key === 'ArrowLeft') this.touchSide = 'left';
      if (e.key === 'ArrowRight') this.touchSide = 'right';
    });
    this.listen(document, 'keyup', () => { this.touchSide = null; });

    scene.appendChild(content);
    this.container.appendChild(scene);

    this.lastTime = performance.now();
    this.gameLoop();
  }

  gameLoop() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    if (dt > 100) { this.raf(() => this.gameLoop()); return; }

    this.update(dt);
    this.draw();

    if (!this.gameOver) this.raf(() => this.gameLoop());
  }

  update(dt) {
    this.elapsed += dt;
    const w = this.canvas.width, h = this.canvas.height;

    const speed = 4;
    if (this.touchSide === 'left') this.shipX = Math.max(20, this.shipX - speed);
    if (this.touchSide === 'right') this.shipX = Math.min(w - 20, this.shipX + speed);

    this.spawnTimer += dt;
    if (this.spawnTimer > 800) {
      this.spawnTimer = 0;
      const types = ['credits', 'credits', 'credits', 'fuel', 'rare', 'trap'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.crates.push({
        x: 15 + Math.random() * (w - 30),
        y: -16,
        vy: 1.5 + Math.random() * 1.5 + this.elapsed * 0.0001,
        type,
      });
    }

    for (const c of this.crates) c.y += c.vy;

    for (let i = this.crates.length - 1; i >= 0; i--) {
      const c = this.crates[i];
      if (c.y > h + 20) {
        if (c.type !== 'trap') this.missed++;
        this.crates.splice(i, 1);
        if (this.missed >= this.maxMissed) {
          this.gameOver = true;
          this.endGame();
          return;
        }
        continue;
      }
      const dx = Math.abs(c.x - this.shipX);
      const dy = Math.abs(c.y - (h - 20));
      if (dx < 22 && dy < 18) {
        this.crates.splice(i, 1);
        if (c.type === 'trap') {
          this.missed += 2;
        } else {
          this.caught++;
        }
      }
    }

    if (this.elapsed >= this.duration) {
      this.gameOver = true;
      this.endGame();
    }
    this.updateHud();
  }

  updateHud() {
    const timeLeft = Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000));
    this.hud.textContent = `📦${this.caught}  ✕${this.missed}/${this.maxMissed}  ⏱${timeLeft}с`;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    const colors = { credits: '#FFD700', fuel: '#44aaff', rare: '#aa44ff', trap: '#ff4444' };
    const icons = { credits: '$', fuel: 'F', rare: '★', trap: '✕' };
    for (const c of this.crates) {
      ctx.fillStyle = colors[c.type] || '#888';
      ctx.fillRect(c.x - 10, c.y - 10, 20, 20);
      ctx.strokeStyle = '#ffffff33';
      ctx.strokeRect(c.x - 10, c.y - 10, 20, 20);
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(icons[c.type], c.x, c.y + 4);
    }

    ctx.fillStyle = '#44ff44';
    ctx.fillRect(this.shipX - 18, h - 28, 36, 12);
    ctx.fillStyle = '#228822';
    ctx.fillRect(this.shipX - 12, h - 34, 24, 8);
  }

  endGame() {
    const gs = this.gameState;
    const maxCargo = gs.ship.cargo + (gs.bonuses.cargo || 0);
    const freeSpace = maxCargo - gs.cargoUsed;

    if (this.caught === 0) {
      this.showResult('Ничего не поймали. Мимо.', false);
      return;
    }

    const credits = this.caught * (30 + Math.floor(Math.random() * 30));
    const fuel = Math.floor(this.caught * 0.3) * 5;
    gs.credits += credits;
    if (fuel > 0) gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + fuel);
    gs.save();

    let msg = `Поймано ${this.caught} контейнеров! +${credits}кр`;
    if (fuel > 0) msg += `, +${fuel} топлива`;
    this.showResult(msg, true);
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Находка' : 'Облом';
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

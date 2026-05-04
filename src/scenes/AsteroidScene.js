import { Scene } from '../engine/SceneManager.js';

export class AsteroidScene extends Scene {
  init(data) {
    super.init(data);
    this.gameOver = false;
    this.shipX = 150;
    this.rocks = [];
    this.score = 0;
    this.hits = 0;
    this.maxHits = 3;
    this.elapsed = 0;
    this.duration = 12000;
    this.spawnTimer = 0;
    this.lastTime = 0;
    this.touchSide = null;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('combat');

    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:12px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Астероидное поле!';
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = 'Уворачивайся от астероидов!';
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

    if (!this.gameOver) {
      this.raf(() => this.gameLoop());
    }
  }

  update(dt) {
    this.elapsed += dt;

    const speed = 4;
    if (this.touchSide === 'left') this.shipX = Math.max(16, this.shipX - speed);
    if (this.touchSide === 'right') this.shipX = Math.min(this.canvas.width - 16, this.shipX + speed);

    this.spawnTimer += dt;
    const spawnRate = Math.max(200, 600 - this.elapsed * 0.03);
    if (this.spawnTimer > spawnRate) {
      this.spawnTimer = 0;
      const size = 10 + Math.random() * 18;
      this.rocks.push({
        x: Math.random() * (this.canvas.width - 20) + 10,
        y: -size,
        size,
        vy: 2 + Math.random() * 2 + this.elapsed * 0.0003,
      });
    }

    const ch = this.canvas.height;
    for (const r of this.rocks) {
      r.y += r.vy;
    }

    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      if (r.y > ch + 20) {
        this.rocks.splice(i, 1);
        this.score += 5;
        continue;
      }
      const dx = r.x - this.shipX;
      const dy = r.y - (ch - 24);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < r.size / 2 + 10) {
        this.rocks.splice(i, 1);
        this.hits++;
        if (this.hits >= this.maxHits) {
          this.gameOver = true;
          this.endGame(false);
          return;
        }
      }
    }

    if (this.elapsed >= this.duration) {
      this.gameOver = true;
      this.endGame(true);
    }

    this.updateHud();
  }

  updateHud() {
    const timeLeft = Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000));
    const hpText = '♥'.repeat(this.maxHits - this.hits) + '♡'.repeat(this.hits);
    this.hud.textContent = `${hpText}  ⏱${timeLeft}с  ★${this.score}`;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
      ctx.fillRect(
        (i * 73 + this.elapsed * 0.01) % w,
        (i * 47 + this.elapsed * 0.02) % h,
        1, 1
      );
    }

    ctx.fillStyle = '#886644';
    for (const r of this.rocks) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#aa8866';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = '#44aaff';
    ctx.beginPath();
    ctx.moveTo(this.shipX, h - 34);
    ctx.lineTo(this.shipX - 12, h - 14);
    ctx.lineTo(this.shipX + 12, h - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(this.shipX - 3, h - 14, 6, 6);
  }

  endGame(survived) {
    const gs = this.gameState;
    let msg;
    if (survived) {
      const bonus = this.score + Math.floor(Math.random() * 50) + 20;
      gs.credits += bonus;
      gs.save();
      msg = `Пролетели! +${bonus}кр`;
    } else {
      const dmg = 10 + Math.floor(Math.random() * 15);
      gs.hp = Math.max(1, gs.hp - dmg);
      gs.save();
      msg = `Разбились! -${dmg}HP`;
    }
    this.showResult(msg, survived);
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Успех' : 'Неудача';
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

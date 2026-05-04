import { Scene } from '../engine/SceneManager.js';

export class SmuggleRunScene extends Scene {
  init(data) {
    super.init(data);
    this.gameOver = false;
    this.lane = 1;
    this.scanners = [];
    this.elapsed = 0;
    this.duration = 10000;
    this.spawnTimer = 0;
    this.caught = false;
    this.lastTime = 0;
    this.reward = 300 + Math.floor(Math.random() * 200);
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('combat');

    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:12px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Контрабандный рейс';
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = `Награда: ${this.reward}кр. Уворачивайся от сканеров!`;
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

    this.laneWidth = canvas.width / 3;

    this.listen(canvas, 'touchstart', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const tx = e.touches[0].clientX - rect.left;
      const tappedLane = Math.floor(tx / this.laneWidth);
      this.lane = Math.max(0, Math.min(2, tappedLane));
    });

    this.listen(document, 'keydown', (e) => {
      if (e.key === 'ArrowLeft') this.lane = Math.max(0, this.lane - 1);
      if (e.key === 'ArrowRight') this.lane = Math.min(2, this.lane + 1);
    });

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

    this.spawnTimer += dt;
    const spawnRate = Math.max(600, 1000 - this.elapsed * 0.03);
    if (this.spawnTimer > spawnRate) {
      this.spawnTimer = 0;
      const scanLane = Math.floor(Math.random() * 3);
      const wide = Math.random() < 0.25;
      const occupiedLanes = wide ? [scanLane, (scanLane + 1) % 3] : [scanLane];
      const shipY = this.canvas.height - 40;
      const nearbyBlockedLanes = new Set();
      for (const s of this.scanners) {
        if (s.y > shipY - 120 && s.y < shipY + 40) {
          nearbyBlockedLanes.add(s.lane);
          if (s.wide) nearbyBlockedLanes.add((s.lane + 1) % 3);
        }
      }
      for (const l of occupiedLanes) nearbyBlockedLanes.add(l);
      if (nearbyBlockedLanes.size >= 3) {
        this.spawnTimer = spawnRate * 0.5;
      } else {
        this.scanners.push({
          lane: scanLane,
          wide,
          y: -30,
          vy: 2.5 + this.elapsed * 0.00015,
          h: wide ? 45 : 28,
        });
      }
    }

    const ch = this.canvas.height;
    for (const s of this.scanners) s.y += s.vy;

    const shipY = ch - 40;
    for (let i = this.scanners.length - 1; i >= 0; i--) {
      const s = this.scanners[i];
      if (s.y > ch + 40) {
        this.scanners.splice(i, 1);
        continue;
      }
      const sLanes = s.wide ? [s.lane, (s.lane + 1) % 3] : [s.lane];
      if (sLanes.includes(this.lane) && s.y + s.h > shipY - 10 && s.y < shipY + 20) {
        this.caught = true;
        this.gameOver = true;
        this.endGame();
        return;
      }
    }

    if (this.elapsed >= this.duration) {
      this.gameOver = true;
      this.endGame();
    }

    const timeLeft = Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000));
    this.hud.textContent = `⏱${timeLeft}с  Полоса: ${this.lane + 1}/3`;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    for (let i = 1; i < 3; i++) {
      ctx.strokeStyle = '#223355';
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(i * this.laneWidth, 0);
      ctx.lineTo(i * this.laneWidth, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const s of this.scanners) {
      const lanes = s.wide ? [s.lane, (s.lane + 1) % 3] : [s.lane];
      for (const l of lanes) {
        const x1 = l * this.laneWidth;
        const x2 = x1 + this.laneWidth;
        ctx.fillStyle = 'rgba(255,0,0,0.2)';
        ctx.fillRect(x1, s.y, x2 - x1, s.h);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, s.y + s.h / 2);
        ctx.lineTo(x2, s.y + s.h / 2);
        ctx.stroke();
      }
    }

    const shipCenterX = this.lane * this.laneWidth + this.laneWidth / 2;
    const shipY = h - 40;
    ctx.fillStyle = '#44ff44';
    ctx.beginPath();
    ctx.moveTo(shipCenterX, shipY - 12);
    ctx.lineTo(shipCenterX - 14, shipY + 12);
    ctx.lineTo(shipCenterX + 14, shipY + 12);
    ctx.closePath();
    ctx.fill();
  }

  endGame() {
    const gs = this.gameState;
    if (this.caught) {
      const dmg = 10 + Math.floor(Math.random() * 20);
      gs.hp = Math.max(1, gs.hp - dmg);
      const fine = 150;
      gs.credits = Math.max(0, gs.credits - fine);
      gs.save();
      this.showResult(`Патруль засёк! -${dmg}HP, штраф ${fine}кр`, false);
    } else {
      gs.credits += this.reward;
      gs.save();
      this.showResult(`Рейс успешен! +${this.reward}кр`, true);
    }
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Успех' : 'Провал';
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

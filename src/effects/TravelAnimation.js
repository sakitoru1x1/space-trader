const EXHAUST = {
  scout:     { color: '#44aaff', count: 3, size: [1.5, 3], speed: [0.5, 1.5], life: [15, 25], spread: 0.3 },
  trader:    { color: '#ff8844', count: 4, size: [2, 4], speed: [0.3, 1.0], life: [20, 35], spread: 0.4 },
  fighter:   { color: '#ff4444', count: 6, size: [1.5, 3.5], speed: [1.0, 2.5], life: [10, 20], spread: 0.5 },
  cruiser:   { color: '#8844ff', count: 5, size: [2, 5], speed: [0.4, 1.2], life: [25, 40], spread: 0.35 },
  freighter: { color: '#ff6600', count: 5, size: [3, 6], speed: [0.2, 0.8], life: [30, 50], spread: 0.5 },
  phantom:   { color: '#44ffcc', count: 2, size: [1, 2.5], speed: [0.8, 2.0], life: [8, 15], spread: 0.2 },
  titan:     { color: '#ff2200', count: 8, size: [3, 7], speed: [0.2, 0.6], life: [35, 60], spread: 0.6 },
};

function rand(min, max) { return min + Math.random() * (max - min); }

export class TravelAnimation {
  constructor() {
    this._canvas = null;
    this._ctx = null;
    this._particles = [];
    this._rafId = null;
    this._animating = false;
    this._idleActive = false;
    this._isDesktop = true;
  }

  _ensureCanvas(map) {
    if (this._canvas && this._canvas.parentNode === map) return;
    if (this._canvas) this._canvas.remove();
    this._canvas = document.createElement('canvas');
    this._canvas.className = 'travel-canvas';
    this._canvas.width = map.scrollWidth || 800;
    this._canvas.height = map.scrollHeight || 530;
    map.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
  }

  animate({ map, shipEl, fromX, fromY, toX, toY, shipType, shipSpeed, isDesktop, onComplete }) {
    if (this._animating) return;
    this._animating = true;
    this._isDesktop = isDesktop;
    this.stopIdle();
    this._ensureCanvas(map);

    const profile = EXHAUST[shipType] || EXHAUST.scout;
    const maxParticles = isDesktop ? 80 : 30;
    const spawnRate = isDesktop ? profile.count : Math.ceil(profile.count / 2);
    this._particles = [];

    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const shipSize = isDesktop ? 40 : 32;

    shipEl.style.position = 'absolute';
    shipEl.style.zIndex = '6';
    shipEl.style.transition = 'none';
    shipEl.style.transform = `rotate(${angle + Math.PI / 2}rad)`;
    if (shipEl.parentNode !== map) {
      shipEl.remove();
      map.appendChild(shipEl);
    }

    const duration = Math.max(400, Math.min(4000, 2000 / (shipSpeed * 0.5)));
    const start = performance.now();

    const tick = (now) => {
      if (!this._animating) return;
      const elapsed = now - start;
      let t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const cx = fromX + dx * eased;
      const cy = fromY + dy * eased;
      shipEl.style.left = `${cx - shipSize / 2}px`;
      shipEl.style.top = `${cy - shipSize / 2}px`;

      if (this._particles.length < maxParticles) {
        for (let i = 0; i < spawnRate; i++) {
          const a = angle + Math.PI + rand(-profile.spread, profile.spread);
          const spd = rand(profile.speed[0], profile.speed[1]);
          const life = Math.round(rand(profile.life[0], profile.life[1]));
          this._particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
            life, maxLife: life,
            size: rand(profile.size[0], profile.size[1]),
          });
        }
      }

      this._updateParticles(profile.color);

      if (t >= 1) {
        this._animating = false;
        this._fadeOutParticles(profile.color, () => {
          if (onComplete) onComplete();
        });
        return;
      }

      this._rafId = requestAnimationFrame(tick);
    };

    this._rafId = requestAnimationFrame(tick);
  }

  _updateParticles(color) {
    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) { this._particles.splice(i, 1); continue; }

      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = color;
      if (this._isDesktop) {
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = color;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  _fadeOutParticles(color, cb) {
    const fade = () => {
      if (this._particles.length === 0) {
        if (this._ctx) this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        if (cb) cb();
        return;
      }
      this._updateParticles(color);
      this._rafId = requestAnimationFrame(fade);
    };
    this._rafId = requestAnimationFrame(fade);
  }

  startIdle({ map, shipEl, x, y, shipType, isDesktop }) {
    if (this._idleActive) return;
    this._idleActive = true;
    this._isDesktop = isDesktop;
    this._ensureCanvas(map);

    const profile = EXHAUST[shipType] || EXHAUST.scout;
    this._particles = [];
    let frame = 0;

    shipEl.classList.add('ship-idle-glow');
    shipEl.style.setProperty('--engine-color', profile.color);
    this._idleShipEl = shipEl;

    const shipAngle = -Math.PI / 2;
    const tick = () => {
      if (!this._idleActive) return;
      frame++;
      if (frame % 3 === 0 && this._particles.length < 8) {
        const a = shipAngle + Math.PI + rand(-0.3, 0.3);
        const spd = rand(0.2, 0.5);
        const life = Math.round(rand(10, 20));
        this._particles.push({
          x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          life, maxLife: life, size: rand(1, 2.5),
        });
      }
      this._updateParticles(profile.color);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  stopIdle() {
    this._idleActive = false;
    if (this._idleShipEl) {
      this._idleShipEl.classList.remove('ship-idle-glow');
      this._idleShipEl = null;
    }
    if (this._ctx && this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    this._particles = [];
  }

  cancel() {
    this._animating = false;
    this._idleActive = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._particles = [];
    if (this._ctx && this._canvas) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }

  destroy() {
    this.cancel();
    if (this._canvas && this._canvas.parentNode) this._canvas.remove();
    this._canvas = null;
    this._ctx = null;
    if (this._idleShipEl) {
      this._idleShipEl.classList.remove('ship-idle-glow');
      this._idleShipEl = null;
    }
  }
}

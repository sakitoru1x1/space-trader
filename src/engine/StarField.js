export class StarField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.nebulae = [];
    this._raf = null;
    this.resize();
    this._initStars();
    this._initNebulae();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this._onVisibility = () => {
      if (document.hidden) {
        if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
      } else {
        if (!this._raf) this.animate();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _initStars() {
    const count = Math.min(200, Math.floor(this.canvas.width * this.canvas.height / 3000));
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.0005 + 0.0002,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  _initNebulae() {
    this.nebulae = [];
    const colors = ['#1a0030', '#001a30', '#0a1a00', '#1a0a00'];
    for (let i = 0; i < 3; i++) {
      this.nebulae.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: 100 + Math.random() * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        a: 0.15 + Math.random() * 0.1,
      });
    }
  }

  animate() {
    const now = performance.now();
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);

    for (const n of this.nebulae) {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grad.addColorStop(0, n.color + '40');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
    }

    for (const s of this.stars) {
      const twinkle = Math.sin(now * s.speed * 2 + s.phase) * 0.3 + 0.7;
      ctx.globalAlpha = s.a * twinkle;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    this._raf = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibility);
  }
}

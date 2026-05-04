export class SceneManager {
  constructor(container, gameState, sfx) {
    this.container = container;
    this.gameState = gameState;
    this.sfx = sfx;
    this.scenes = {};
    this.current = null;
    this.currentName = null;
    this.isDesktop = !this._isMobile();
  }

  _isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
  }

  register(name, SceneClass) {
    this.scenes[name] = SceneClass;
  }

  start(name, data = {}) {
    if (this.current) {
      this.current.destroy();
    }
    this.container.innerHTML = '';

    const SceneClass = this.scenes[name];
    if (!SceneClass) {
      console.error(`Scene "${name}" not found`);
      return;
    }

    this.current = new SceneClass(this);
    this.currentName = name;
    this.current.init(data);
    this.current.create(this.container);
  }
}

export class Scene {
  constructor(manager) {
    this.manager = manager;
    this.gameState = manager.gameState;
    this.sfx = manager.sfx;
    this.isDesktop = manager.isDesktop;
    this._timers = [];
    this._intervals = [];
    this._listeners = [];
    this._rafs = [];
    this._bodyEls = [];
    this.container = null;
  }

  init(data) {
    this.data = data;
  }

  create(container) {
    this.container = container;
  }

  destroy() {
    for (const t of this._timers) clearTimeout(t);
    for (const i of this._intervals) clearInterval(i);
    for (const id of this._rafs) cancelAnimationFrame(id);
    for (const [el, event, fn, opts] of this._listeners) {
      el.removeEventListener(event, fn, opts);
    }
    for (const el of this._bodyEls) {
      if (el.parentNode) el.remove();
    }
    if (this.sfx) this.sfx.stopMusic();
    this._timers = [];
    this._intervals = [];
    this._rafs = [];
    this._listeners = [];
    this._bodyEls = [];
  }

  startScene(name, data) {
    this.manager.start(name, data);
  }

  delayed(ms, fn) {
    const t = setTimeout(fn, ms);
    this._timers.push(t);
    return t;
  }

  interval(ms, fn) {
    const i = setInterval(fn, ms);
    this._intervals.push(i);
    return i;
  }

  raf(fn) {
    const id = requestAnimationFrame(fn);
    this._rafs.push(id);
    return id;
  }

  listen(el, event, fn, opts) {
    el.addEventListener(event, fn, opts);
    this._listeners.push([el, event, fn, opts]);
  }

  appendToBody(el) {
    document.body.appendChild(el);
    this._bodyEls.push(el);
    return el;
  }

  get w() { return window.innerWidth; }
  get h() { return window.innerHeight; }

  fs(px) {
    const s = Math.max(0.65, Math.min(1.6, this.w / 600));
    return Math.max(9, Math.round(px * s));
  }

  sp(px) {
    const sv = Math.max(0.7, Math.min(1.5, this.h / 600));
    return Math.round(px * sv);
  }

  key(label) {
    return this.isDesktop ? `[${label}] ` : '';
  }

  el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  btn(text, onClick, cls = 'btn') {
    const b = this.el('button', cls, text);
    this.listen(b, 'click', (e) => {
      e.stopPropagation();
      if (this.sfx) this.sfx.click();
      onClick(e);
    });
    return b;
  }
}

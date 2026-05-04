import { Scene } from '../engine/SceneManager.js';

export class HaggleScene extends Scene {
  init(data) {
    super.init(data);
    this.targetPrice = Math.floor(Math.random() * 200) + 100;
    this.currentOffer = Math.floor(this.targetPrice * 1.8);
    this.round = 0;
    this.maxRounds = 5;
    this.deal = false;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('station');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Базар';
    content.appendChild(title);

    if (this.deal) {
      this.renderDeal(content);
    } else if (this.round >= this.maxRounds) {
      this.renderFailed(content);
    } else {
      const desc = this.el('div', 'event-desc');
      desc.textContent = `Торговец предлагает редкий товар за ${this.currentOffer}кр.\nРаунд ${this.round + 1}/${this.maxRounds}`;
      desc.style.whiteSpace = 'pre-line';
      content.appendChild(desc);

      const options = this.el('div', 'event-options');

      const buyBtn = this.el('button', 'event-option');
      buyBtn.textContent = `Купить за ${this.currentOffer}кр`;
      this.listen(buyBtn, 'click', () => this.buy());
      options.appendChild(buyBtn);

      const haggleBtn = this.el('button', 'event-option');
      haggleBtn.textContent = 'Торговаться (-15-25%)';
      this.listen(haggleBtn, 'click', () => this.haggle());
      options.appendChild(haggleBtn);

      const leaveBtn = this.el('button', 'event-option');
      leaveBtn.textContent = 'Уйти';
      this.listen(leaveBtn, 'click', () => this.startScene('Station', { tab: 'bar' }));
      options.appendChild(leaveBtn);

      content.appendChild(options);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  haggle() {
    if (this.sfx) this.sfx.click();
    this.round++;
    const angryChance = 0.1 + this.round * 0.12;
    if (Math.random() < angryChance) {
      this.round = this.maxRounds;
    } else {
      const discount = 0.15 + Math.random() * 0.1;
      this.currentOffer = Math.max(this.targetPrice, Math.floor(this.currentOffer * (1 - discount)));
    }
    this.render();
  }

  buy() {
    if (this.sfx) this.sfx.click();
    const gs = this.gameState;
    if (gs.credits < this.currentOffer) {
      this.toast('Нет денег!');
      return;
    }
    gs.credits -= this.currentOffer;
    const reward = Math.floor(this.currentOffer * (1.3 + Math.random() * 0.5));
    gs.credits += reward;
    gs.save();
    this.deal = true;
    this.profit = reward - this.currentOffer;
    this.render();
  }

  renderDeal(content) {
    const result = this.el('div', 'text-center text-gold');
    result.style.fontSize = '16px';
    result.textContent = `Сделка! Прибыль: +${this.profit}кр`;
    content.appendChild(result);

    const btn = this.btn('Вернуться', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }

  renderFailed(content) {
    const result = this.el('div', 'text-center text-red');
    result.style.fontSize = '14px';
    result.textContent = 'Торговец обиделся и ушёл!';
    content.appendChild(result);

    const btn = this.btn('Вернуться', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }

  toast(text) {
    const t = this.el('div', 'toast negative');
    t.textContent = text;
    document.body.appendChild(t);
    this.delayed(2200, () => t.remove());
  }
}

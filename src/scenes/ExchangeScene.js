import { Scene } from '../engine/SceneManager.js';

export class ExchangeScene extends Scene {
  init(data) {
    super.init(data);
    this.stocks = [
      { name: 'NovaCorp', price: 100 + Math.floor(Math.random() * 50), trend: 0 },
      { name: 'AstroTech', price: 200 + Math.floor(Math.random() * 80), trend: 0 },
      { name: 'StarFuel', price: 50 + Math.floor(Math.random() * 30), trend: 0 },
      { name: 'GalBank', price: 300 + Math.floor(Math.random() * 100), trend: 0 },
    ];
    this.portfolio = {};
    this.rounds = 0;
    this.maxRounds = 5;
    this.startCredits = this.gameState.credits;
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
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:16px';

    const gs = this.gameState;
    const title = this.el('div', 'event-title');
    title.textContent = `Биржа | Раунд ${this.rounds + 1}/${this.maxRounds}`;
    content.appendChild(title);

    if (this.rounds === 0) {
      const hint = this.el('div', 'text-center text-small text-gray mb-8');
      hint.textContent = 'Покупай дешёво, продавай дорого! Стрелки показывают тренд. После 5 раундов все акции продаются.';
      content.appendChild(hint);
    }

    const balance = this.el('div', 'text-center text-gold mb-8');
    balance.style.fontSize = '14px';
    balance.textContent = `Баланс: ${gs.credits}кр`;
    content.appendChild(balance);

    for (const stock of this.stocks) {
      const owned = this.portfolio[stock.name] || 0;
      const trendArrow = stock.trend > 0 ? '↑' : stock.trend < 0 ? '↓' : '–';
      const trendColor = stock.trend > 0 ? '#44ff44' : stock.trend < 0 ? '#ff4444' : '#888';

      const row = this.el('div', 'equip-item');
      row.innerHTML = `
        <div style="flex:1">
          <div style="color:#aabbcc">${stock.name} <span style="color:${trendColor}">${trendArrow}</span></div>
          <div class="equip-desc">${stock.price}кр ${owned > 0 ? `| Есть: ${owned}` : ''}</div>
        </div>
      `;

      const btns = this.el('div', '');
      btns.style.cssText = 'display:flex;gap:4px';

      const buyBtn = this.el('button', 'btn btn-small btn-green', 'Куп');
      this.listen(buyBtn, 'click', () => this.buy(stock));
      btns.appendChild(buyBtn);

      if (owned > 0) {
        const sellBtn = this.el('button', 'btn btn-small', 'Прод');
        sellBtn.style.color = '#ff4444';
        this.listen(sellBtn, 'click', () => this.sell(stock));
        btns.appendChild(sellBtn);
      }

      row.appendChild(btns);
      content.appendChild(row);
    }

    const nextBtn = this.btn(this.rounds < this.maxRounds - 1 ? 'Следующий раунд' : 'Закрыть биржу', () => this.nextRound(), 'btn btn-wide');
    nextBtn.style.marginTop = '12px';
    content.appendChild(nextBtn);

    const exitBtn = this.btn('Продать всё и уйти', () => this.cashOut(), 'btn btn-wide');
    exitBtn.style.marginTop = '8px';
    content.appendChild(exitBtn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  buy(stock) {
    const gs = this.gameState;
    if (gs.credits < stock.price) {
      this.toast('Нет денег!');
      return;
    }
    if (this.sfx) this.sfx.click();
    gs.credits -= stock.price;
    this.portfolio[stock.name] = (this.portfolio[stock.name] || 0) + 1;
    gs.save();
    this.render();
  }

  sell(stock) {
    const gs = this.gameState;
    if (!this.portfolio[stock.name]) return;
    if (this.sfx) this.sfx.click();
    this.portfolio[stock.name]--;
    gs.credits += stock.price;
    gs.save();
    this.render();
  }

  nextRound() {
    this.rounds++;
    if (this.rounds >= this.maxRounds) {
      this.cashOut();
      return;
    }

    for (const stock of this.stocks) {
      const change = (Math.random() - 0.45) * 0.3;
      stock.trend = change > 0.05 ? 1 : change < -0.05 ? -1 : 0;
      stock.price = Math.max(10, Math.floor(stock.price * (1 + change)));
    }
    this.render();
  }

  cashOut() {
    const gs = this.gameState;
    for (const stock of this.stocks) {
      const owned = this.portfolio[stock.name] || 0;
      if (owned > 0) gs.credits += owned * stock.price;
    }
    this.portfolio = {};
    gs.save();
    this.startScene('Station', { tab: 'bar' });
  }

  toast(text) {
    const t = this.el('div', 'toast negative');
    t.textContent = text;
    document.body.appendChild(t);
    this.delayed(2200, () => t.remove());
  }
}

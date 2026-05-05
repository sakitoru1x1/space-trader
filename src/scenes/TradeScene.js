import { Scene } from '../engine/SceneManager.js';
import { GOODS } from '../data/galaxy.js';

export class TradeScene extends Scene {
  create(container) {
    super.create(container);
    const gs = this.gameState;
    const sys = gs.getSystem();
    const prices = gs.getCurrentPrices();
    const scene = this.el('div', 'scene');

    if (this.sfx) this.sfx.startMusic('station');

    const hud = this.el('div', 'hud');
    const maxCargo = gs.ship.cargo + (gs.bonuses.cargo || 0);
    hud.innerHTML = `
      <div class="hud-left"><span class="credits">${gs.credits}кр</span></div>
      <div class="hud-center"><span class="text-gray text-small">Торговля · ${sys.name}</span></div>
      <div class="hud-right"><span class="text-gray text-small">${gs.cargoUsed}/${maxCargo}</span></div>
    `;
    scene.appendChild(hud);

    const content = this.el('div', 'content');
    content.style.padding = '8px';

    const header = this.el('div', 'trade-row');
    header.style.cssText = 'font-weight:bold;font-size:11px;position:sticky;top:0;background:rgba(6,6,20,0.95);z-index:5;padding:6px 0;border-bottom:1px solid #223';
    header.innerHTML = `
      <span class="trade-item text-gray" style="flex:1">Товар</span>
      <span style="width:52px;text-align:center;color:#4a4;font-size:11px">Купить</span>
      <span style="width:52px;text-align:center;color:#a44;font-size:11px">Продать</span>
    `;
    content.appendChild(header);

    const legalGoods = GOODS.filter(g => g.legal);
    const illegalGoods = GOODS.filter(g => !g.legal);
    const showIllegal = sys.type === 'pirate';

    this._renderGoods(content, legalGoods, prices, gs);

    if (showIllegal && illegalGoods.length) {
      const divider = this.el('div', '');
      divider.style.cssText = 'border-top:1px solid #333;margin:8px 0;padding-top:4px';
      const label = this.el('span', 'text-small');
      label.style.color = '#cc88ff';
      label.textContent = 'Чёрный рынок';
      divider.appendChild(label);
      content.appendChild(divider);
      this._renderGoods(content, illegalGoods, prices, gs);
    }

    content.appendChild(this.el('div', 'divider'));

    const hint = this.el('div', 'text-center text-small');
    hint.style.cssText = 'color:#556;padding:4px';
    hint.textContent = 'Покупай дёшево, продавай дорого.';
    content.appendChild(hint);

    scene.appendChild(content);

    const footer = this.el('div', '');
    footer.style.cssText = 'flex-shrink:0;padding:8px;background:rgba(6,6,20,0.95);text-align:center;display:flex;gap:8px;justify-content:center';
    const pricesBtn = this.btn('Биржа', () => this.startScene('PriceBoard'));
    pricesBtn.className = 'btn btn-wide';
    pricesBtn.style.background = 'rgba(68,170,255,0.15)';
    const backBtn = this.btn('Карта', () => this.startScene('Galaxy'));
    backBtn.className = 'btn btn-wide';
    footer.appendChild(pricesBtn);
    footer.appendChild(backBtn);
    scene.appendChild(footer);

    container.appendChild(scene);

    this.listen(document, 'keydown', (e) => {
      if (e.key === 'Escape') this.startScene('PriceBoard');
    });
  }

  _renderGoods(content, goods, prices, gs) {
    for (const good of goods) {
      const p = prices[good.id];
      if (!p) continue;
      const owned = gs.cargo.find(c => c.goodId === good.id);
      const qty = owned ? owned.qty : 0;
      const qStr = qty > 0 ? ` [${qty}]` : '';

      const row = this.el('div', 'trade-row');
      row.style.cssText = 'align-items:center;padding:4px 0;border-bottom:1px solid rgba(34,34,68,0.3)';

      const itemColor = !good.legal ? '#cc88ff' : qty > 0 ? '#ddd' : '#889';
      const base = good.basePrice || 100;
      const buyRatio = p.buy / base;
      const sellRatio = p.sell / base;
      const buyColor = buyRatio < 0.85 ? '#44ff44' : buyRatio > 1.15 ? '#ff4444' : '#ccc';
      const sellColor = sellRatio > 1.15 ? '#44ff44' : sellRatio < 0.85 ? '#ff4444' : '#ccc';

      const nameSpan = this.el('span', 'trade-item');
      nameSpan.style.cssText = `flex:1;color:${itemColor};font-size:12px`;
      nameSpan.textContent = `${good.icon}${good.name}${qStr}`;
      row.appendChild(nameSpan);

      const buyBtn = this.el('button', 'trade-btn buy');
      buyBtn.style.cssText = `width:52px;text-align:center;color:${buyColor};font-size:12px;cursor:pointer;background:rgba(0,80,0,0.15);border:1px solid rgba(68,255,68,0.2);border-radius:4px;padding:3px 2px`;
      buyBtn.textContent = p.buy;
      this.listen(buyBtn, 'click', () => {
        const r = gs.buyGood(good.id, 1);
        if (r.success) {
          if (this.sfx) this.sfx.buy();
          this.toast(`${good.icon}-${r.totalCost}кр`, 'negative');
          this.startScene('Trade');
        } else {
          if (this.sfx) this.sfx.error();
          this.toast(r.reason, 'negative');
        }
      });
      row.appendChild(buyBtn);

      const sellBtn = this.el('button', 'trade-btn sell');
      sellBtn.style.cssText = `width:52px;text-align:center;color:${sellColor};font-size:12px;margin-left:4px;border-radius:4px;padding:3px 2px`;
      if (qty > 0) {
        sellBtn.style.background = 'rgba(80,0,0,0.15)';
        sellBtn.style.border = '1px solid rgba(255,68,68,0.2)';
        sellBtn.style.cursor = 'pointer';
        sellBtn.textContent = p.sell;
        this.listen(sellBtn, 'click', () => {
          const r = gs.sellGood(good.id, 1);
          if (r.success) {
            if (this.sfx) this.sfx.sell();
            this.toast(`${good.icon}+${r.totalEarned}кр`, 'positive');
            this.startScene('Trade');
          } else {
            if (this.sfx) this.sfx.error();
            this.toast(r.reason, 'negative');
          }
        });
      } else {
        sellBtn.style.background = 'transparent';
        sellBtn.style.border = '1px solid rgba(34,34,68,0.3)';
        sellBtn.style.color = '#333';
        sellBtn.textContent = p.sell;
      }
      row.appendChild(sellBtn);

      content.appendChild(row);
    }
  }
}

import { Scene } from '../engine/SceneManager.js';
import { GOODS, getGalaxySystems } from '../data/galaxy.js';

export class PriceBoardScene extends Scene {
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
      <div class="hud-center"><span class="text-gray text-small">Биржа ${sys.name}</span></div>
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
    hint.textContent = 'Цены меняются каждый день. Покупай дёшево, продавай дорого.';
    content.appendChild(hint);

    scene.appendChild(content);

    const footer = this.el('div', '');
    footer.style.cssText = 'flex-shrink:0;padding:8px;background:rgba(6,6,20,0.95);text-align:center;display:flex;gap:8px;justify-content:center';
    const backBtn = this.btn('Карта', () => this.startScene('Galaxy'));
    backBtn.className = 'btn btn-wide';
    const pricesBtn = this.btn('Сравнить', () => this._showPriceComparison(gs));
    pricesBtn.className = 'btn btn-wide';
    pricesBtn.style.background = 'rgba(68,170,255,0.15)';
    footer.appendChild(backBtn);
    footer.appendChild(pricesBtn);
    scene.appendChild(footer);

    container.appendChild(scene);

    this.listen(document, 'keydown', (e) => {
      if (e.key === 'Escape') this.startScene('Galaxy');
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
          this.startScene('PriceBoard');
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
            this.startScene('PriceBoard');
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

  _showPriceComparison(gs) {
    const overlay = this.el('div', 'overlay');
    const popup = this.el('div', 'popup');
    popup.style.maxHeight = '80vh';
    popup.style.overflow = 'auto';

    const systems = getGalaxySystems(gs.galaxy);
    const legalGoods = GOODS.filter(g => g.legal);

    let html = '<div class="popup-title">Цены по системам</div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;font-size:10px;border-collapse:collapse">';
    html += '<tr style="position:sticky;top:0;background:rgba(6,6,20,0.95)"><th style="text-align:left;padding:3px;color:#667">Сист.</th>';
    for (const g of legalGoods) {
      html += `<th style="padding:3px;color:#667;width:36px">${g.icon}</th>`;
    }
    html += '</tr>';

    for (const sys of systems) {
      const prices = gs.prices[sys.id];
      if (!prices) continue;
      const isCurrent = sys.id === gs.currentSystem;
      html += `<tr style="border-bottom:1px solid #112"><td style="padding:3px;color:${isCurrent ? '#FFD700' : '#889'};white-space:nowrap">${sys.name.substring(0, 7)}</td>`;
      for (const g of legalGoods) {
        const p = prices[g.id];
        if (!p) { html += '<td style="text-align:center;color:#333">-</td>'; continue; }
        const base = g.basePrice || 100;
        const ratio = p.buy / base;
        const color = ratio < 0.85 ? '#44ff44' : ratio > 1.15 ? '#ff4444' : '#667';
        html += `<td style="text-align:center;color:${color};padding:2px">${p.buy}</td>`;
      }
      html += '</tr>';
    }
    html += '</table></div>';

    html += '<div style="text-align:center;padding:8px;font-size:11px"><span style="color:#44ff44">Дешёво</span> | <span style="color:#667">Норма</span> | <span style="color:#ff4444">Дорого</span></div>';

    popup.innerHTML = html;

    const closeBtn = this.el('button', 'popup-close', 'Закрыть');
    this.listen(closeBtn, 'click', () => overlay.remove());
    popup.appendChild(closeBtn);
    this.listen(overlay, 'click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.appendChild(popup);
    this.appendToBody(overlay);
  }
}

import { Scene } from '../engine/SceneManager.js';
import { GOODS, getGalaxySystems } from '../data/galaxy.js';

export class PriceBoardScene extends Scene {
  create(container) {
    super.create(container);
    const gs = this.gameState;
    const sys = gs.getSystem();
    const scene = this.el('div', 'scene');
    this._tab = this._tab || 'buy';

    if (this.sfx) this.sfx.startMusic('station');

    const hud = this.el('div', 'hud');
    const maxCargo = gs.ship.cargo + (gs.bonuses.cargo || 0);
    hud.innerHTML = `
      <div class="hud-left"><span class="credits">${gs.credits}кр</span></div>
      <div class="hud-center"><span class="text-gray text-small">Биржа</span></div>
      <div class="hud-right"><span class="text-gray text-small">${gs.cargoUsed}/${maxCargo}</span></div>
    `;
    scene.appendChild(hud);

    const tabs = this.el('div', '');
    tabs.style.cssText = 'display:flex;gap:0;padding:0 8px;background:rgba(6,6,20,0.95);border-bottom:1px solid #223';
    const buyTab = this.el('button', '');
    buyTab.textContent = 'Покупка';
    buyTab.style.cssText = `flex:1;padding:8px;border:none;font-size:12px;cursor:pointer;border-bottom:2px solid ${this._tab === 'buy' ? '#4a4' : 'transparent'};color:${this._tab === 'buy' ? '#4a4' : '#667'};background:transparent`;
    const sellTab = this.el('button', '');
    sellTab.textContent = 'Продажа';
    sellTab.style.cssText = `flex:1;padding:8px;border:none;font-size:12px;cursor:pointer;border-bottom:2px solid ${this._tab === 'sell' ? '#a44' : 'transparent'};color:${this._tab === 'sell' ? '#a44' : '#667'};background:transparent`;
    this.listen(buyTab, 'click', () => { this._tab = 'buy'; this.startScene('PriceBoard'); });
    this.listen(sellTab, 'click', () => { this._tab = 'sell'; this.startScene('PriceBoard'); });
    tabs.appendChild(buyTab);
    tabs.appendChild(sellTab);
    scene.appendChild(tabs);

    const content = this.el('div', 'content');
    content.style.cssText = 'padding:4px;overflow:auto;-webkit-overflow-scrolling:touch';

    const legalGoods = GOODS.filter(g => g.legal);
    const illegalGoods = GOODS.filter(g => !g.legal);
    const systems = getGalaxySystems(gs.galaxy);

    this._buildTable(content, legalGoods, systems, gs, this._tab);

    const showIllegal = sys.type === 'pirate';
    if (showIllegal && illegalGoods.length) {
      const divider = this.el('div', '');
      divider.style.cssText = 'border-top:1px solid #333;margin:8px 0;padding-top:4px';
      const label = this.el('span', 'text-small');
      label.style.color = '#cc88ff';
      label.textContent = 'Чёрный рынок';
      divider.appendChild(label);
      content.appendChild(divider);
      this._buildTable(content, illegalGoods, systems, gs, this._tab);
    }

    const hint = this.el('div', 'text-center text-small');
    hint.style.cssText = 'color:#556;padding:8px 4px 4px';
    hint.textContent = this._tab === 'buy'
      ? 'Зелёное = дёшево купить, красное = дорого купить'
      : 'Зелёное = выгодно продать, красное = невыгодно продать';
    content.appendChild(hint);

    scene.appendChild(content);

    const footer = this.el('div', '');
    footer.style.cssText = 'flex-shrink:0;padding:8px;background:rgba(6,6,20,0.95);text-align:center';
    const backBtn = this.btn('Карта', () => this.startScene('Galaxy'));
    backBtn.className = 'btn btn-wide';
    footer.appendChild(backBtn);
    scene.appendChild(footer);

    container.appendChild(scene);

    this.listen(document, 'keydown', (e) => {
      if (e.key === 'Escape') this.startScene('Galaxy');
    });
  }

  _buildTable(content, goods, systems, gs, mode) {
    const wrapper = this.el('div', '');
    wrapper.style.cssText = 'overflow-x:auto;margin-bottom:4px';

    const table = this.el('table', '');
    table.style.cssText = 'width:100%;font-size:10px;border-collapse:collapse;min-width:fit-content';

    const thead = this.el('tr', '');
    thead.style.cssText = 'position:sticky;top:0;background:rgba(6,6,20,0.97);z-index:5';
    const thCorner = this.el('th', '');
    thCorner.style.cssText = 'text-align:left;padding:4px;color:#667;position:sticky;left:0;background:rgba(6,6,20,0.97);z-index:6;min-width:55px';
    thCorner.textContent = 'Сист.';
    thead.appendChild(thCorner);

    for (const g of goods) {
      const th = this.el('th', '');
      th.style.cssText = 'padding:3px 4px;color:#667;min-width:36px;text-align:center';
      th.textContent = g.icon;
      th.title = g.name;
      thead.appendChild(th);
    }
    table.appendChild(thead);

    for (const sys of systems) {
      if (sys.id === 'omega' && !gs.getQuestFlag('expedition_ready') && gs.galaxy === 'milkyway') continue;

      const prices = gs.prices[sys.id];
      if (!prices) continue;
      const isCurrent = sys.id === gs.currentSystem;

      const row = this.el('tr', '');
      row.style.borderBottom = '1px solid #112';

      const tdName = this.el('td', '');
      tdName.style.cssText = `padding:4px;color:${isCurrent ? '#FFD700' : '#889'};white-space:nowrap;font-weight:${isCurrent ? 'bold' : 'normal'};position:sticky;left:0;background:rgba(6,6,20,0.95);z-index:2;font-size:10px`;
      tdName.textContent = sys.name.substring(0, 6);
      if (isCurrent) tdName.textContent += ' ●';
      row.appendChild(tdName);

      for (const g of goods) {
        const p = prices[g.id];
        const td = this.el('td', '');
        td.style.cssText = 'text-align:center;padding:3px 2px';

        if (!p) {
          td.style.color = '#333';
          td.textContent = '-';
        } else {
          const base = g.basePrice || 100;
          const price = mode === 'buy' ? p.buy : p.sell;
          const ratio = price / base;
          let color;
          if (mode === 'buy') {
            color = ratio < 0.85 ? '#44ff44' : ratio > 1.15 ? '#ff4444' : '#999';
          } else {
            color = ratio > 1.15 ? '#44ff44' : ratio < 0.85 ? '#ff4444' : '#999';
          }
          td.style.color = color;
          td.textContent = price;
        }
        row.appendChild(td);
      }
      table.appendChild(row);
    }

    wrapper.appendChild(table);
    content.appendChild(wrapper);
  }
}

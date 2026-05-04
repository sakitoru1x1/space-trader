import { Scene } from '../engine/SceneManager.js';
import { GOODS, getGalaxySystems, generatePriceHistory } from '../data/galaxy.js';

export class PriceBoardScene extends Scene {
  create(container) {
    super.create(container);
    const gs = this.gameState;
    const scene = this.el('div', 'scene');

    if (this.sfx) this.sfx.startMusic('station');

    const hud = this.el('div', 'hud');
    hud.innerHTML = `
      <div class="hud-left"><span class="credits">${gs.credits}кр</span></div>
      <div class="hud-center"><span class="text-gray text-small">Биржа</span></div>
      <div class="hud-right"></div>
    `;
    scene.appendChild(hud);

    const content = this.el('div', 'content');
    const systems = getGalaxySystems(gs.galaxy);
    const legalGoods = GOODS.filter(g => g.legal);

    const header = this.el('div', 'trade-row');
    header.style.cssText = 'font-weight:bold;font-size:11px;position:sticky;top:0;background:rgba(6,6,20,0.95);z-index:5;padding:6px 0';
    let headerHtml = '<span class="trade-item text-gray" style="min-width:80px">Система</span>';
    for (const g of legalGoods) {
      headerHtml += `<span style="width:42px;text-align:center;font-size:10px;color:#667">${g.icon}</span>`;
    }
    header.innerHTML = headerHtml;
    content.appendChild(header);

    for (const sys of systems) {
      const prices = gs.prices[sys.id];
      if (!prices) continue;
      const isCurrent = sys.id === gs.currentSystem;

      const row = this.el('div', 'trade-row');
      row.style.fontSize = '11px';
      let rowHtml = `<span class="trade-item" style="min-width:80px;color:${isCurrent ? '#FFD700' : '#889'};font-size:11px">${sys.name.substring(0, 8)}</span>`;
      for (const g of legalGoods) {
        const p = prices[g.id];
        if (!p) { rowHtml += '<span style="width:42px;text-align:center;color:#333">-</span>'; continue; }
        const base = g.basePrice || 100;
        const ratio = p.buy / base;
        const color = ratio < 0.85 ? '#44ff44' : ratio > 1.15 ? '#ff4444' : '#889';
        rowHtml += `<span style="width:42px;text-align:center;color:${color}">${p.buy}</span>`;
      }
      row.innerHTML = rowHtml;
      content.appendChild(row);
    }

    content.appendChild(this.el('div', 'divider'));

    const legend = this.el('div', 'text-center text-small');
    legend.innerHTML = '<span style="color:#44ff44">Дешёво</span> | <span style="color:#889">Норма</span> | <span style="color:#ff4444">Дорого</span>';
    content.appendChild(legend);

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
}

import { Scene } from '../engine/SceneManager.js';
import { SHIPS, WEAPONS, MODULES } from '../data/galaxy.js';

export class ShipyardScene extends Scene {
  init(data) {
    super.init(data);
    this.tab = data.tab || 'ships';
  }

  create(container) {
    super.create(container);
    const gs = this.gameState;
    const scene = this.el('div', 'scene');

    if (this.sfx) this.sfx.startMusic('station');

    const hud = this.el('div', 'hud');
    hud.innerHTML = `
      <div class="hud-left"><span class="credits">${gs.credits}кр</span></div>
      <div class="hud-center"><span class="text-gray text-small">${SHIPS[gs.shipType]?.name || 'Скаут'}</span></div>
      <div class="hud-right"><span class="hp">${gs.hp}HP</span></div>
    `;
    scene.appendChild(hud);

    const tabs = this.el('div', 'tabs');
    const tabList = ['ships', 'weapons', 'modules'];
    const tabLabels = { ships: 'Корабли', weapons: 'Оружие', modules: 'Модули' };
    for (const t of tabList) {
      const tb = this.el('button', `tab ${t === this.tab ? 'active' : ''}`, tabLabels[t]);
      this.listen(tb, 'click', () => {
        if (this.sfx) this.sfx.click();
        this.startScene('Shipyard', { tab: t });
      });
      tabs.appendChild(tb);
    }
    scene.appendChild(tabs);

    const content = this.el('div', 'content');
    if (this.tab === 'ships') this.renderShips(content, gs);
    else if (this.tab === 'weapons') this.renderWeapons(content, gs);
    else if (this.tab === 'modules') this.renderModules(content, gs);
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
      if (e.key >= '1' && e.key <= '3') {
        this.startScene('Shipyard', { tab: tabList[parseInt(e.key) - 1] });
      }
    });
  }

  renderShips(content, gs) {
    const title = this.el('div', 'section-title text-cyan');
    title.textContent = 'ВЕРФЬ';
    content.appendChild(title);

    const current = this.el('div', 'text-center text-small text-gold mb-8');
    const s = gs.ship;
    current.textContent = `Текущий: ${s.name} | HP:${s.hp} ATK:${s.attack} DEF:${s.defense} SPD:${s.speed} CRG:${s.cargo} FUEL:${s.fuel}`;
    content.appendChild(current);

    for (const [id, ship] of Object.entries(SHIPS)) {
      const isCurrent = id === gs.shipType;
      const check = gs.canBuyShip(id);
      const row = this.el('div', 'equip-item');
      row.style.alignItems = 'center';

      const shipImg = this.el('img');
      shipImg.src = `sprites/ship-${id === 'scout' ? 'player' : id}.png`;
      shipImg.style.cssText = 'width:48px;height:48px;object-fit:contain;margin-right:8px;flex-shrink:0;transform:rotate(-90deg)';
      shipImg.onerror = () => { shipImg.style.display = 'none'; };
      row.appendChild(shipImg);

      const info = this.el('div');
      info.style.flex = '1';
      info.innerHTML = `
          <div style="color:${isCurrent ? '#FFD700' : '#aabbcc'};font-weight:bold">${ship.name} ${isCurrent ? '(текущий)' : ''}</div>
          <div class="equip-desc">HP:${ship.hp} ATK:${ship.attack} DEF:${ship.defense} SPD:${ship.speed} CRG:${ship.cargo} FUEL:${ship.fuel}</div>
          <div class="equip-desc">Слоты: W:${ship.slots.W} U:${ship.slots.U} E:${ship.slots.E}</div>
      `;
      row.appendChild(info);

      if (!isCurrent) {
        const price = check.can ? check.cost : ship.price;
        const btn = this.el('button', `btn btn-small ${check.can ? 'btn-green' : ''}`, `${price}кр`);
        if (!check.can) btn.style.opacity = '0.5';
        this.listen(btn, 'click', () => {
          if (!check.can) { this.toast(check.reason, 'negative'); return; }
          const r = gs.buyShip(id);
          if (r.success) {
            if (this.sfx) this.sfx.powerup();
            this.toast(`${ship.name} куплен!`, 'positive');
            this.startScene('Shipyard', { tab: 'ships' });
          } else {
            this.toast(r.reason, 'negative');
          }
        });
        row.appendChild(btn);
      }

      content.appendChild(row);
    }
  }

  renderWeapons(content, gs) {
    const title = this.el('div', 'section-title text-red');
    title.textContent = 'ОРУЖИЕ';
    content.appendChild(title);

    const maxW = gs.ship.slots?.W || 1;
    const weapons = Array.isArray(gs.weapons) ? gs.weapons : ['laser'];
    const slotInfo = this.el('div', 'text-center text-small text-gray mb-8');
    slotInfo.textContent = `Слоты: ${weapons.length}/${maxW}`;
    content.appendChild(slotInfo);

    const installed = this.el('div', 'section-title text-orange');
    installed.textContent = 'УСТАНОВЛЕНО';
    content.appendChild(installed);

    for (let i = 0; i < weapons.length; i++) {
      const wId = weapons[i];
      const w = WEAPONS[wId];
      if (!w) continue;
      const row = this.el('div', 'equip-item');
      row.innerHTML = `
        <div style="flex:1">
          <div style="color:#aabbcc">${w.name}</div>
          <div class="equip-desc">DMG:${w.damage} ACC:${Math.round(w.accuracy * 100)}% ${w.type} | ${w.desc}</div>
        </div>
      `;
      if (weapons.length > 1) {
        const refund = Math.floor(w.price * 0.4);
        const removeBtn = this.el('button', 'btn btn-small', `Снять${refund ? ` +${refund}` : ''}`);
        removeBtn.style.color = '#ff4444';
        this.listen(removeBtn, 'click', () => {
          const r = gs.removeWeapon(i);
          if (r.success) {
            this.toast(r.refund ? `+${r.refund}кр` : 'Снято', 'positive');
            this.startScene('Shipyard', { tab: 'weapons' });
          }
        });
        row.appendChild(removeBtn);
      }
      content.appendChild(row);
    }

    content.appendChild(this.el('div', 'divider'));
    const shop = this.el('div', 'section-title text-green');
    shop.textContent = 'МАГАЗИН';
    content.appendChild(shop);

    for (const [id, w] of Object.entries(WEAPONS)) {
      if (w.price === 0) continue;
      const canBuy = weapons.length < maxW && gs.credits >= w.price;
      const row = this.el('div', 'equip-item');
      row.innerHTML = `
        <div style="flex:1">
          <div style="color:#aabbcc">${w.name}</div>
          <div class="equip-desc">DMG:${w.damage} ACC:${Math.round(w.accuracy * 100)}% ${w.type} | ${w.desc}</div>
        </div>
      `;
      const btn = this.el('button', `btn btn-small ${canBuy ? 'btn-green' : ''}`, `${w.price}кр`);
      if (!canBuy) btn.style.opacity = '0.5';
      this.listen(btn, 'click', () => {
        const r = gs.buyWeapon(id);
        if (r.success) {
          if (this.sfx) this.sfx.buy();
          this.toast(`${w.name} установлен!`, 'positive');
          this.startScene('Shipyard', { tab: 'weapons' });
        } else {
          this.toast(r.reason, 'negative');
          if (this.sfx) this.sfx.error();
        }
      });
      row.appendChild(btn);
      content.appendChild(row);
    }
  }

  renderModules(content, gs) {
    const title = this.el('div', 'section-title text-purple');
    title.textContent = 'МОДУЛИ';
    content.appendChild(title);

    const maxU = gs.ship.slots?.U || 2;
    const maxE = gs.ship.slots?.E || 1;
    const modules = Array.isArray(gs.modules) ? gs.modules : [];
    const uUsed = modules.filter(m => (MODULES[m.moduleId || m]?.slotType || 'U') === 'U').length;
    const eUsed = modules.filter(m => (MODULES[m.moduleId || m]?.slotType || 'U') === 'E').length;

    const slotInfo = this.el('div', 'text-center text-small text-gray mb-8');
    slotInfo.textContent = `U-слоты: ${uUsed}/${maxU} | E-слоты: ${eUsed}/${maxE}`;
    content.appendChild(slotInfo);

    if (modules.length > 0) {
      const installed = this.el('div', 'section-title text-orange');
      installed.textContent = 'УСТАНОВЛЕНО';
      content.appendChild(installed);

      for (let i = 0; i < modules.length; i++) {
        const entry = modules[i];
        const modId = entry.moduleId || entry;
        const mod = MODULES[modId];
        if (!mod) continue;
        const isDamaged = gs.damaged && gs.damaged[i];
        const row = this.el('div', 'equip-item');
        row.innerHTML = `
          <div style="flex:1">
            <div style="color:${isDamaged ? '#ff4444' : '#aabbcc'}">${mod.name} [${mod.slotType}] ${isDamaged ? '(поврежд.)' : ''}</div>
            <div class="equip-desc">${mod.desc}</div>
          </div>
        `;
        const refund = Math.floor(mod.price * 0.4);
        const removeBtn = this.el('button', 'btn btn-small', `Снять${refund ? ` +${refund}` : ''}`);
        removeBtn.style.color = '#ff4444';
        this.listen(removeBtn, 'click', () => {
          const r = gs.removeModule(i);
          if (r.success) {
            this.toast(r.refund ? `+${r.refund}кр` : 'Снято', 'positive');
            this.startScene('Shipyard', { tab: 'modules' });
          }
        });
        row.appendChild(removeBtn);
        content.appendChild(row);
      }
    }

    content.appendChild(this.el('div', 'divider'));
    const shop = this.el('div', 'section-title text-green');
    shop.textContent = 'МАГАЗИН';
    content.appendChild(shop);

    for (const [id, mod] of Object.entries(MODULES)) {
      const canBuy = gs.credits >= mod.price;
      const slotFree = mod.slotType === 'U' ? uUsed < maxU : eUsed < maxE;
      const row = this.el('div', 'equip-item');
      row.innerHTML = `
        <div style="flex:1">
          <div style="color:#aabbcc">${mod.name} [${mod.slotType}]</div>
          <div class="equip-desc">${mod.desc}</div>
        </div>
      `;
      const btn = this.el('button', `btn btn-small ${canBuy && slotFree ? 'btn-green' : ''}`, `${mod.price}кр`);
      if (!canBuy || !slotFree) btn.style.opacity = '0.5';
      this.listen(btn, 'click', () => {
        const r = gs.installModule(id);
        if (r.success) {
          if (this.sfx) this.sfx.buy();
          this.toast(`${mod.name} установлен!`, 'positive');
          this.startScene('Shipyard', { tab: 'modules' });
        } else {
          this.toast(r.reason, 'negative');
          if (this.sfx) this.sfx.error();
        }
      });
      row.appendChild(btn);
      content.appendChild(row);
    }
  }

  toast(text, type = '') {
    const t = this.el('div', `toast ${type}`);
    t.textContent = text;
    document.body.appendChild(t);
    this.delayed(2200, () => t.remove());
  }
}

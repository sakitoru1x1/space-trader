import { Scene } from '../engine/SceneManager.js';
import { GOODS, MERCENARIES, FACTIONS, MODULES } from '../data/galaxy.js';

const BAR_RUMORS = [
  'Слышал, в Ориoне нашли редкий астероид...',
  'Говорят, пираты в Нове обнаглели совсем.',
  'Торговцы шепчутся про скидки в Поларисе.',
  'Военные Сириуса ищут наёмников.',
  'В Андромеде учёные что-то нашли...',
  'Топливо в горняцких системах дешевле.',
  'Контрабанда в военных системах - лотерея.',
  'Караваны - лучший способ избежать пиратов.',
  'Страховка спасла уже не одного торговца.',
  'Артефакты в Денебе стоят целое состояние.',
];

export class StationScene extends Scene {
  init(data) {
    super.init(data);
    this.tab = data.tab || 'trade';
  }

  create(container) {
    super.create(container);
    const gs = this.gameState;
    const sys = gs.getSystem();

    if (this.sfx) {
      this.sfx.startAmbient('station');
      this.sfx.startMusic('station');
      this.sfx.dock();
    }

    const scene = this.el('div', 'scene');

    // HUD
    const hud = this.el('div', 'hud');
    const maxCargo = gs.ship.cargo + (gs.bonuses.cargo || 0);
    const maxFuel = gs.ship.fuel + (gs.bonuses.fuel || 0);
    const maxHp = gs.ship.hp + (gs.bonuses.hp || 0);
    hud.innerHTML = `
      <div class="hud-left"><span class="credits">${gs.credits}кр</span></div>
      <div class="hud-center"><span class="text-gray text-small">${gs.cargoUsed}/${maxCargo}</span></div>
      <div class="hud-right"><span class="fuel">${gs.fuel}F</span> <span class="hp">${gs.hp}HP</span></div>
    `;
    scene.appendChild(hud);

    // Station name
    const header = this.el('div', 'text-center');
    header.style.cssText = 'padding:8px;font-size:14px;font-weight:bold;color:#44aaff';
    header.textContent = `🛸 ${sys.name}`;
    scene.appendChild(header);

    // Tabs
    const tabs = this.el('div', 'tabs');
    const tabList = ['trade', 'bar', 'services'];
    const tabLabels = { trade: 'Торговля', bar: 'Бар', services: 'Услуги' };
    if (sys.type === 'pirate') {
      tabList.push('black');
      tabLabels.black = 'Ч.Рынок';
    }
    for (const t of tabList) {
      const tb = this.el('button', `tab ${t === this.tab ? 'active' : ''}`, tabLabels[t]);
      this.listen(tb, 'click', () => {
        if (this.sfx) this.sfx.click();
        this.startScene('Station', { tab: t });
      });
      tabs.appendChild(tb);
    }
    scene.appendChild(tabs);

    // Content
    const content = this.el('div', 'content');
    if (this.tab === 'trade') this.renderTrade(content, gs, sys, true);
    else if (this.tab === 'black') this.renderTrade(content, gs, sys, false);
    else if (this.tab === 'bar') this.renderBar(content, gs, sys);
    else if (this.tab === 'services') this.renderServices(content, gs, sys);
    scene.appendChild(content);

    // Back button
    const footer = this.el('div', '');
    footer.style.cssText = 'flex-shrink:0;padding:8px;background:rgba(6,6,20,0.95);text-align:center';
    const backBtn = this.btn('Карта', () => this.startScene('Galaxy'));
    backBtn.className = 'btn btn-wide';
    footer.appendChild(backBtn);
    scene.appendChild(footer);

    container.appendChild(scene);

    // Keyboard
    this.listen(document, 'keydown', (e) => {
      const k = e.key;
      if (k === 'Escape') this.startScene('Galaxy');
      if (k >= '1' && k <= '4') {
        const idx = parseInt(k) - 1;
        if (idx < tabList.length) this.startScene('Station', { tab: tabList[idx] });
      }
    });
  }

  _glitchPrice(price) {
    const gs = this.gameState;
    if (gs.galaxy !== 'glitch') return { display: `${price}`, actual: price };
    const r = Math.random();
    if (r < 0.08) return { display: 'NaN', actual: Math.round(price * 0.1), glitch: true };
    if (r < 0.12) return { display: '???', actual: price, glitch: true };
    if (r < 0.16) return { display: '-1', actual: 1, glitch: true };
    if (r < 0.20) return { display: `${price}`.split('').reverse().join(''), actual: price, glitch: true };
    if (r < 0.23) return { display: '0x' + price.toString(16).toUpperCase(), actual: price, glitch: true };
    if (r < 0.26) return { display: `${Math.round(price * 0.01)}`, actual: Math.round(price * 0.01), glitch: true };
    return { display: `${price}`, actual: price };
  }

  renderTrade(content, gs, sys, legal) {
    const prices = gs.getCurrentPrices();
    if (!legal) {
      const title = this.el('div', 'section-title text-purple');
      title.textContent = 'ЧЁРНЫЙ РЫНОК';
      content.appendChild(title);
      const warn = this.el('div', 'text-center text-small text-red mb-8');
      warn.textContent = 'В военных системах - риск ареста!';
      content.appendChild(warn);
    }

    const header = this.el('div', 'trade-row');
    header.style.fontWeight = 'bold';
    header.innerHTML = `
      <span class="trade-item text-gray">Товар</span>
      <div class="trade-btns">
        <span style="width:50px;text-align:center;color:#4a4;font-size:12px">Куп</span>
        <span style="width:50px;text-align:center;color:#a44;font-size:12px">Прод</span>
      </div>
    `;
    content.appendChild(header);

    const goods = GOODS.filter(g => legal ? g.legal : !g.legal);
    for (const good of goods) {
      const p = prices[good.id];
      if (!p) continue;
      const owned = gs.cargo.find(c => c.goodId === good.id);
      const qty = owned ? owned.qty : 0;
      const qStr = qty > 0 ? ` [${qty}]` : '';

      const row = this.el('div', 'trade-row');
      const itemColor = !legal ? '#cc88ff' : qty > 0 ? '#ddd' : '#889';
      row.innerHTML = `
        <span class="trade-item" style="color:${itemColor}">${good.icon}${good.name}${qStr}</span>
        <div class="trade-btns"></div>
      `;

      const btns = row.querySelector('.trade-btns');

      const gBuy = this._glitchPrice(p.buy);
      const buyBtn = this.el('button', `trade-btn buy`, gBuy.display);
      if (gBuy.glitch) buyBtn.style.color = '#00ff41';
      this.listen(buyBtn, 'click', () => {
        const origBuy = p.buy;
        if (gBuy.glitch) p.buy = gBuy.actual;
        const r = gs.buyGood(good.id, 1);
        if (gBuy.glitch) p.buy = origBuy;
        if (r.success) {
          if (this.sfx) this.sfx.buy();
          this.toast(`-${r.totalCost}кр`, 'negative');
          this.startScene('Station', { tab: this.tab });
        } else {
          if (this.sfx) this.sfx.error();
          this.toast(r.reason, 'negative');
        }
      });
      btns.appendChild(buyBtn);

      if (qty > 0) {
        const gSell = this._glitchPrice(p.sell);
        const sellBtn = this.el('button', 'trade-btn sell', gSell.display);
        if (gSell.glitch) sellBtn.style.color = '#00ff41';
        this.listen(sellBtn, 'click', () => {
          const origSell = p.sell;
          if (gSell.glitch) p.sell = gSell.actual;
          const r = gs.sellGood(good.id, 1);
          if (gSell.glitch) p.sell = origSell;
          if (r.success) {
            if (this.sfx) this.sfx.sell();
            this.toast(`+${r.totalEarned}кр`, 'positive');
            this.startScene('Station', { tab: this.tab });
          } else {
            if (this.sfx) this.sfx.error();
            this.toast(r.reason, 'negative');
          }
        });
        btns.appendChild(sellBtn);
      } else {
        btns.appendChild(this.el('span', '', ''));
      }

      content.appendChild(row);
    }
  }

  renderBar(content, gs, sys) {
    // Bar title
    const title = this.el('div', 'section-title text-orange');
    title.textContent = 'БАР "ХРОМОЙ АСТРОНАВТ"';
    content.appendChild(title);

    // Rumors
    const shuffled = [...BAR_RUMORS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2; i++) {
      const r = this.el('div', 'bar-rumor');
      r.textContent = `"${shuffled[i]}"`;
      content.appendChild(r);
    }

    content.appendChild(this.el('div', 'divider'));

    // Mercenaries
    const mercTitle = this.el('div', 'section-title text-green');
    mercTitle.textContent = 'НАЁМНИКИ';
    content.appendChild(mercTitle);

    if (gs.mercenary) {
      const info = this.el('div', 'text-center text-small');
      info.style.color = '#88cc88';
      info.textContent = `${gs.mercenary.name} (ATK:${gs.mercenary.attack}, ${gs.mercenary.daily}кр/день)`;
      content.appendChild(info);
      const fireBtn = this.btn('Уволить', () => {
        gs.fireMercenary();
        this.startScene('Station', { tab: 'bar' });
      }, 'svc-btn');
      fireBtn.style.color = '#ff4444';
      content.appendChild(fireBtn);
    } else {
      for (const m of MERCENARIES) {
        const row = this.el('div', 'equip-item');
        row.innerHTML = `
          <div>
            <div style="color:#aabbcc">${m.name}</div>
            <div class="equip-desc">ATK:${m.attack} HP:${m.hp}</div>
          </div>
        `;
        const hireBtn = this.el('button', 'btn btn-green btn-small', `${m.cost}кр`);
        this.listen(hireBtn, 'click', () => {
          const r = gs.hireMercenary(m.id);
          if (r && r.success !== false) {
            this.toast(`${m.name} нанят!`, 'positive');
            this.startScene('Station', { tab: 'bar' });
          } else {
            this.toast('Нет денег!', 'negative');
          }
        });
        row.appendChild(hireBtn);
        content.appendChild(row);
      }
    }

    content.appendChild(this.el('div', 'divider'));

    // Entertainment
    const entTitle = this.el('div', 'section-title text-orange');
    entTitle.textContent = 'РАЗВЛЕЧЕНИЯ';
    content.appendChild(entTitle);

    const entertainment = [
      { label: '🃏 Покер (вход 50кр)', color: '#ffcc44', scene: 'Poker', check: () => gs.credits >= 50, err: 'Нет денег!' },
      { label: '⚔ Арена (бои)', color: '#ff6644', scene: 'Arena' },
      { label: '🤝 Базар (торговаться)', color: '#44ccff', scene: 'Haggle' },
      { label: '📦 Контрабанда', color: '#aa44ff', scene: 'Contraband' },
      { label: '📈 Биржа', color: '#FFD700', scene: 'Exchange' },
      { label: '🕵 Проникновение', color: '#8844ff', scene: 'Infiltration', data: { difficulty: 2, reward: { credits: 400 } } },
      { label: '🛡 Оборона станции', color: '#ff8800', scene: 'Defense', data: { difficulty: 1 } },
    ];
    for (const e of entertainment) {
      const btn = this.el('button', 'svc-btn');
      btn.style.color = e.color;
      btn.textContent = e.label;
      this.listen(btn, 'click', () => {
        if (e.check && !e.check()) {
          this.toast(e.err || 'Ошибка', 'negative');
          if (this.sfx) this.sfx.error();
          return;
        }
        this.startScene(e.scene, e.data || {});
      });
      content.appendChild(btn);
    }

    content.appendChild(this.el('div', 'divider'));

    // Caravan
    const carTitle = this.el('div', 'section-title text-gold');
    carTitle.textContent = 'КАРАВАН';
    content.appendChild(carTitle);

    if (gs.inCaravan) {
      const info = this.el('div', 'text-center text-small text-gold');
      const target = gs.getSystem(gs.caravanTarget);
      info.textContent = `В караване -> ${target?.name || '?'}`;
      content.appendChild(info);
    } else {
      const neighbors = gs.getNeighborSystems();
      const target = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (target) {
        const info = this.el('div', 'text-center text-small text-gray mb-8');
        info.textContent = `Караван -> ${target.name}. 100кр.`;
        content.appendChild(info);
        const joinBtn = this.btn('Присоединиться', () => {
          if (gs.credits < 100) {
            this.toast('Нет денег!', 'negative');
            return;
          }
          gs.joinCaravan(target.id);
          this.toast('Присоединились к каравану!', 'positive');
          this.startScene('Station', { tab: 'bar' });
        }, 'svc-btn');
        joinBtn.style.color = '#ffcc44';
        content.appendChild(joinBtn);
      }
    }
  }

  renderServices(content, gs, sys) {
    const maxFuel = gs.ship.fuel + (gs.bonuses.fuel || 0);
    const maxHp = gs.ship.hp + (gs.bonuses.hp || 0);
    const hasDamaged = gs.damaged && Object.keys(gs.damaged).length > 0;

    // Refuel
    const refuelBtn = this.el('button', 'svc-btn');
    refuelBtn.style.color = '#44aaff';
    refuelBtn.textContent = `⛽ Заправка ${gs.fuel}/${maxFuel} (8кр/ед)`;
    this.listen(refuelBtn, 'click', () => {
      if (gs.fuel >= maxFuel) { this.toast('Полный бак!'); return; }
      const need = maxFuel - gs.fuel;
      const canAfford = Math.floor(gs.credits / 8);
      if (canAfford <= 0) { this.toast('Нет денег!', 'negative'); return; }
      const amt = Math.min(need, canAfford);
      const r = gs.refuel(amt);
      if (r.success) {
        if (this.sfx) this.sfx.powerup();
        this.toast(`+${amt}F (-${r.cost}кр)`);
        this.startScene('Station', { tab: 'services' });
      }
    });
    content.appendChild(refuelBtn);

    // Repair
    const repairBtn = this.el('button', 'svc-btn');
    repairBtn.style.color = '#ff6644';
    repairBtn.textContent = `🔧 Ремонт ${gs.hp}/${maxHp} (5кр/HP)`;
    this.listen(repairBtn, 'click', () => {
      if (gs.hp >= maxHp) { this.toast('Корабль цел!'); return; }
      const need = maxHp - gs.hp;
      const canAfford = Math.floor(gs.credits / 5);
      if (canAfford <= 0) { this.toast('Нет денег!', 'negative'); return; }
      const amt = Math.min(need, canAfford);
      const r = gs.repair(amt);
      if (r.success) {
        if (this.sfx) this.sfx.powerup();
        this.toast(`+${amt}HP (-${r.cost}кр)`);
        this.startScene('Station', { tab: 'services' });
      }
    });
    content.appendChild(repairBtn);

    // Emergency repair
    if (hasDamaged) {
      const emerBtn = this.el('button', 'svc-btn');
      emerBtn.style.color = '#ff8844';
      emerBtn.textContent = '🔧 Аварийный ремонт (бесплатно)';
      this.listen(emerBtn, 'click', () => {
        this.startScene('Repair', { damageAmount: Math.min(20, maxHp - gs.hp) });
      });
      content.appendChild(emerBtn);
    }

    // Missiles
    const missBtn = this.el('button', 'svc-btn');
    missBtn.style.color = '#ffaa00';
    missBtn.textContent = `🚀 Ракеты ${gs.missiles}/${gs.maxMissiles} (50кр)`;
    this.listen(missBtn, 'click', () => {
      const r = gs.buyMissiles(1);
      if (r.success) {
        this.toast('Ракета куплена!', 'positive');
        this.startScene('Station', { tab: 'services' });
      } else {
        this.toast(r.reason, 'negative');
      }
    });
    content.appendChild(missBtn);

    // Damaged modules
    if (hasDamaged) {
      content.appendChild(this.el('div', 'divider'));
      const dmgTitle = this.el('div', 'section-title text-red');
      dmgTitle.textContent = 'ПОВРЕЖДЁННЫЕ МОДУЛИ';
      content.appendChild(dmgTitle);

      for (const idx of Object.keys(gs.damaged)) {
        const entry = gs.modules[idx];
        if (!entry) continue;
        const mod = MODULES[entry.moduleId || entry];
        const fixBtn = this.el('button', 'svc-btn');
        fixBtn.style.color = '#ff4444';
        fixBtn.textContent = `Починить ${mod?.name || 'модуль'} (300кр)`;
        this.listen(fixBtn, 'click', () => {
          const r = gs.repairModule(parseInt(idx));
          if (r.success) {
            this.toast('Починено!', 'positive');
            this.startScene('Station', { tab: 'services' });
          } else {
            this.toast(r.reason, 'negative');
          }
        });
        content.appendChild(fixBtn);
      }
    }

    // Insurance
    content.appendChild(this.el('div', 'divider'));
    const insTitle = this.el('div', 'section-title text-cyan');
    insTitle.textContent = 'СТРАХОВКА';
    content.appendChild(insTitle);

    if (gs.insurance) {
      const info = this.el('div', 'text-center text-small text-cyan');
      info.textContent = `За��трахован (${gs.insuranceDays} дн.)`;
      content.appendChild(info);
    } else {
      const desc = this.el('div', 'text-center text-small text-gray mb-8');
      desc.textContent = 'При гибели - возрождение. 500кр/30дн.';
      content.appendChild(desc);
      const insBtn = this.el('button', 'svc-btn');
      insBtn.style.color = '#44ccff';
      insBtn.textContent = 'Купить страховку (500кр)';
      this.listen(insBtn, 'click', () => {
        if (gs.credits < 500) { this.toast('Нет денег!', 'negative'); return; }
        gs.buyInsurance();
        this.toast('Застрахован!', 'positive');
        this.startScene('Station', { tab: 'services' });
      });
      content.appendChild(insBtn);
    }

    // Labs
    content.appendChild(this.el('div', 'divider'));
    const labTitle = this.el('div', 'section-title text-cyan');
    labTitle.textContent = 'ЛАБОРАТОРИИ';
    content.appendChild(labTitle);

    const labs = [
      { label: '⚗ Синтез топлива', color: '#44ccff', scene: 'Synthesis' },
      { label: '📡 Сканер аномалий', color: '#aa88ff', scene: 'Scanner' },
      { label: '🎵 Настройка двигателя', color: '#ff8800', scene: 'EngineTune' },
    ];
    for (const l of labs) {
      const btn = this.el('button', 'svc-btn');
      btn.style.color = l.color;
      btn.textContent = l.label;
      this.listen(btn, 'click', () => this.startScene(l.scene));
      content.appendChild(btn);
    }

    // Bank
    content.appendChild(this.el('div', 'divider'));
    const bankTitle = this.el('div', 'section-title text-gold');
    bankTitle.textContent = 'БАНК';
    content.appendChild(bankTitle);

    if (gs.loan > 0) {
      const info = this.el('div', 'text-center text-small text-red mb-8');
      info.textContent = `Долг: ${gs.loan}кр (+5%/5дн)`;
      content.appendChild(info);
      const repayBtn = this.el('button', 'svc-btn');
      repayBtn.style.color = '#44ff44';
      repayBtn.textContent = `Погасить ${gs.loan}кр`;
      this.listen(repayBtn, 'click', () => {
        const r = gs.repayLoan();
        if (r && r.success !== false) {
          if (this.sfx) this.sfx.sell();
          this.toast('Долг погашен!', 'positive');
          this.startScene('Station', { tab: 'services' });
        } else {
          this.toast('Нет денег!', 'negative');
        }
      });
      content.appendChild(repayBtn);
    } else {
      const desc = this.el('div', 'text-center text-small text-gray mb-8');
      desc.textContent = 'Кредит под 5% каждые 5 дней.';
      content.appendChild(desc);
      for (const amt of [1000, 3000, 5000]) {
        const loanBtn = this.el('button', 'svc-btn');
        loanBtn.style.color = '#FFD700';
        loanBtn.textContent = `Взять ${amt}кр`;
        this.listen(loanBtn, 'click', () => {
          gs.takeLoan(amt);
          this.toast(`+${amt}кр!`, 'positive');
          this.startScene('Station', { tab: 'services' });
        });
        content.appendChild(loanBtn);
      }
    }
  }

  toast(text, type = '') {
    const t = this.el('div', `toast ${type}`);
    t.textContent = text;
    this.appendToBody(t);
    this.delayed(2200, () => t.remove());
  }
}

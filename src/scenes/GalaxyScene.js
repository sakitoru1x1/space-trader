import { Scene } from '../engine/SceneManager.js';
import { GOODS, FACTIONS, GALAXIES, SHIPS, getGalaxySystems, getNeighbors, getGalaxyRoutes } from '../data/galaxy.js';
import { GlitchEffects } from '../effects/GlitchEffects.js';
import { VoidEffects } from '../effects/VoidEffects.js';
import { TravelAnimation } from '../effects/TravelAnimation.js';
import { TEXT_QUESTS } from '../data/textQuests.js';
import { QUEST_CHAINS } from '../data/questChains.js';

const TYPE_COLORS = {
  industrial: '#ff8844', agricultural: '#44ff44', mining: '#cc8833',
  tech: '#44aaff', military: '#ff4444', trade: '#ffcc00',
  pirate: '#aa44ff', resort: '#ff66ff', research: '#44ffcc',
};

export class GalaxyScene extends Scene {
  create(container) {
    super.create(container);
    const gs = this.gameState;
    const sys = gs.getSystem();
    const neighbors = gs.getNeighborSystems();
    let allSystems = getGalaxySystems(gs.galaxy);
    let neighborIds = getNeighbors(gs.currentSystem, gs.galaxy);
    if (!gs.getQuestFlag('expedition_ready') && gs.galaxy === 'milkyway') {
      allSystems = allSystems.filter(s => s.id !== 'omega');
      neighborIds = neighborIds.filter(id => id !== 'omega');
    }

    if (this.sfx) {
      this.sfx.startAmbient('space');
      this.sfx.startMusic('space');
    }

    const scene = this.el('div', 'scene');

    const storyResult = gs.storyEngine.checkProgress();
    const messages = [];
    if (storyResult && storyResult.completed) {
      const m = gs.storyEngine.currentMission;
      messages.push(`Миссия завершена! ${m ? 'Новая: ' + m.title : ''}`);
    }
    if (gs._pendingTimerMessages) {
      for (const m of gs._pendingTimerMessages) messages.push(m);
      delete gs._pendingTimerMessages;
    }
    if (gs.loan > 0) {
      messages.push(`Долг: ${gs.loan}кр`);
    }

    // HUD
    const hud = this.el('div', 'hud');
    const maxFuel = gs.ship.fuel + (gs.bonuses.fuel || 0);
    const maxHp = gs.ship.hp + (gs.bonuses.hp || 0);
    const fuelPct = Math.round((gs.fuel / maxFuel) * 100);
    const hpLow = gs.hp / maxHp < 0.3;

    hud.innerHTML = `
      <div class="hud-left">
        <span class="credits">${gs.credits}кр</span>
      </div>
      <div class="hud-center">
        <div class="fuel-bar">
          <div class="fuel-bar-track">
            <div class="fuel-bar-fill ${fuelPct < 30 ? 'low' : ''}" style="width:${fuelPct}%"></div>
          </div>
          <span class="fuel">${gs.fuel}F</span>
        </div>
      </div>
      <div class="hud-right">
        <span class="hp ${hpLow ? 'low' : ''}">${gs.hp}HP</span>
      </div>
    `;
    scene.appendChild(hud);

    // System info
    const sysInfo = this.el('div', 'system-info');
    const galaxyName = GALAXIES[gs.galaxy]?.name || 'Млечный Путь';
    const factionName = FACTIONS[sys.faction]?.name || '';
    const rep = gs.factionRep[sys.faction] || 0;
    const repColor = rep >= 20 ? '#44ff44' : rep <= -10 ? '#ff4444' : '#888';
    const typeColor = TYPE_COLORS[sys.type] || '#888';

    let infoExtra = `День ${gs.day}`;
    if (gs.mercenary) infoExtra += ` | ${gs.mercenary.name}`;
    if (gs.inCaravan) infoExtra += ' | Караван';

    sysInfo.innerHTML = `
      <div style="font-size:9px;color:#556">${galaxyName}</div>
      <div class="system-name">${sys.name}</div>
      <span class="system-type" style="color:${typeColor};background:rgba(0,0,0,0.4)">${sys.type.toUpperCase()}</span>
      <div style="font-size:11px;color:#888;margin-top:2px">${infoExtra}
        <span style="color:${repColor};margin-left:8px">${factionName} ${rep}</span>
      </div>
    `;
    scene.appendChild(sysInfo);

    // Galaxy map
    const mapViewport = this.el('div', 'galaxy-map-viewport');
    mapViewport.style.cssText = 'flex:1;overflow:hidden;position:relative;touch-action:none';
    const map = this.el('div', 'galaxy-map');
    map.style.transformOrigin = '0 0';
    const mapRect = { w: window.innerWidth, h: window.innerHeight - 200 };
    const sx = (mapRect.w - 40) / 800;
    const sy = Math.max(0.4, mapRect.h / 530);

    this._setupPinchZoom(mapViewport, map, mapRect);

    // Draw route lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1';
    const routes = this._getRoutes(gs.galaxy);
    for (const [a, b] of routes) {
      const sA = allSystems.find(s => s.id === a);
      const sB = allSystems.find(s => s.id === b);
      if (!sA || !sB) continue;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sA.x * sx + 20);
      line.setAttribute('y1', sA.y * sy);
      line.setAttribute('x2', sB.x * sx + 20);
      line.setAttribute('y2', sB.y * sy);
      line.setAttribute('stroke', neighborIds.includes(a) && neighborIds.includes(b) || a === gs.currentSystem || b === gs.currentSystem ? '#223355' : '#111122');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.4');
      svg.appendChild(line);
    }
    map.appendChild(svg);

    // Draw planets
    for (const s of allSystems) {
      const isCurrent = s.id === gs.currentSystem;
      const isNeighbor = neighborIds.includes(s.id);
      const px = s.x * sx + 20;
      const py = s.y * sy;

      const planet = this.el('div', 'planet');
      const colorHex = '#' + (s.color & 0xffffff).toString(16).padStart(6, '0');
      const desktop = this.isDesktop;
      const dotSize = isCurrent ? (desktop ? 64 : 48) : (desktop ? 48 : 36);
      planet.style.left = `${px - dotSize / 2}px`;
      planet.style.top = `${py - dotSize / 2}px`;
      const dot = this.el('div', `planet-dot ${isCurrent ? 'current' : ''} ${isNeighbor ? 'neighbor' : ''}`);
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;

      const planetImg = this.el('img');
      planetImg.src = `sprites/planet-${s.id}.png`;
      planetImg.style.cssText = `width:100%;height:100%;object-fit:contain;border-radius:50%;pointer-events:none`;
      planetImg.onerror = () => {
        planetImg.style.display = 'none';
        dot.style.background = `radial-gradient(circle at 35% 35%, ${colorHex}, ${colorHex}88 60%, ${colorHex}33)`;
      };
      dot.appendChild(planetImg);
      if (isCurrent) {
        this._shipSprite = this.el('img');
        const shipSpriteId = gs.shipType === 'scout' ? 'player' : gs.shipType;
        this._shipSprite.src = `sprites/ship-${shipSpriteId}.png`;
        const shipSize = desktop ? 40 : 32;
        this._shipSize = shipSize;
        this._shipSprite.style.cssText = `position:absolute;width:${shipSize}px;height:${shipSize}px;object-fit:contain;z-index:5;pointer-events:none;transform:rotate(-90deg)`;
        this._shipSprite.style.left = `${px - shipSize / 2 - shipSize - 4}px`;
        this._shipSprite.style.top = `${py - shipSize / 2 + Math.floor((dotSize - shipSize) / 2)}px`;
        this._shipSprite.onerror = () => { this._shipSprite.style.display = 'none'; };
        this._shipHomeX = px - shipSize / 2;
        this._shipHomeY = py;
        map.appendChild(this._shipSprite);
      }
      planet.appendChild(dot);

      const name = this.el('div', `planet-name ${isCurrent ? 'current' : isNeighbor ? 'neighbor' : 'other'}`);
      name.textContent = s.name;
      planet.appendChild(name);

      if (isNeighbor && this.isDesktop) {
        const idx = neighborIds.indexOf(s.id);
        if (idx < 9) {
          const keyLabel = this.el('div', 'planet-key');
          keyLabel.textContent = `[${idx + 1}]`;
          planet.appendChild(keyLabel);
        }
      }

      if (isNeighbor) {
        planet.style.cursor = 'pointer';
        this.listen(planet, 'click', () => this.travelTo(s));
      }

      map.appendChild(planet);
    }

    // Warp gates
    const gates = GALAXIES[gs.galaxy]?.gates || [];
    for (const gate of gates) {
      if (gs.currentSystem === gate.system && gs.fuel >= 15) {
        const gSys = allSystems.find(s => s.id === gate.system);
        if (!gSys) continue;
        const gx = gSys.x * sx + 20;
        const gy = gSys.y * sy;
        const targetName = GALAXIES[gate.target]?.name || gate.target;
        const isGlitch = gate.target === 'glitch';

        const warpEl = this.el('div', 'warp-gate');
        warpEl.style.left = `${gx - 22}px`;
        warpEl.style.top = `${gy + 20}px`;
        warpEl.innerHTML = `
          <div class="warp-ring ${isGlitch ? 'glitch' : ''}"></div>
          <div class="warp-btn" style="color:${isGlitch ? '#00ff44' : '#8844ff'}">▶ ${targetName}</div>
        `;
        this.listen(warpEl, 'click', () => this.jumpGalaxy(gate.target));
        map.appendChild(warpEl);
      }
    }

    this._map = map;
    this._sx = sx;
    this._sy = sy;
    this._allSystems = allSystems;
    this._travelAnim = new TravelAnimation();
    this._traveling = false;

    if (this._shipSprite && this._shipHomeX != null) {
      this._travelAnim.startIdle({
        map, shipEl: this._shipSprite,
        x: this._shipHomeX, y: this._shipHomeY,
        shipType: gs.shipType, isDesktop: this.isDesktop,
      });
      if (this.sfx) this.sfx.startEngine(gs.shipType, true);
    }

    mapViewport.appendChild(map);
    scene.appendChild(mapViewport);

    // Text quest indicator
    const textQuest = gs.getAvailableTextQuest();
    if (textQuest) {
      const qi = this.el('div', 'quest-indicator');
      qi.innerHTML = `<span class="blink">!</span> ${textQuest.title}`;
      this.listen(qi, 'click', () => {
        this.startScene('TextQuest', { quest: textQuest });
      });
      scene.appendChild(qi);
    }

    // Bottom nav
    const nav = this.el('div', 'bottom-nav');
    const mobile = !this.isDesktop;
    const navItems = [
      { label: mobile ? 'Стн' : `${this.key('S')}Станция`, action: () => this.goStation() },
      { label: mobile ? 'Трюм' : `${this.key('I')}Трюм`, action: () => this.showCargo() },
      { label: mobile ? 'Биржа' : `${this.key('B')}Биржа`, action: () => this.startScene('PriceBoard') },
      { label: mobile ? 'Журнал' : `${this.key('Q')}Журнал`, action: () => this.showQuests() },
      { label: mobile ? 'Кор' : `${this.key('K')}Корабль`, action: () => this.startScene('Shipyard') },
      { label: mobile ? 'Звук' : `${this.key('M')}Звук`, action: () => { if (this.sfx) this.sfx.toggleMute(); } },
      { label: 'Сброс', action: () => { this.gameState.reset(); this.gameState.newGame(); this.startScene('Galaxy'); } },
    ];
    for (const item of navItems) {
      const b = this.el('button', 'nav-btn', item.label);
      this.listen(b, 'click', item.action);
      nav.appendChild(b);
    }
    scene.appendChild(nav);

    container.appendChild(scene);

    // Keyboard
    this._onKey = (e) => {
      if (this._traveling) return;
      const k = e.key.toLowerCase();
      if (k >= '1' && k <= '9') {
        const idx = parseInt(k) - 1;
        const ns = gs.getNeighborSystems();
        if (idx < ns.length) this.travelTo(ns[idx]);
      }
      if (k === 's' || k === 'enter') this.goStation();
      if (k === 'i') this.showCargo();
      if (k === 'b') this.startScene('PriceBoard');
      if (k === 'q') this.showQuests();
      if (k === 'k') this.startScene('Shipyard');
      if (k === 'm' && this.sfx) this.sfx.toggleMute();
      if (k === 'escape') this.closePopup();
    };
    this.listen(document, 'keydown', this._onKey);

    // Show messages
    for (let i = 0; i < messages.length; i++) {
      this.delayed(200 + i * 800, () => this.toast(messages[i], 'positive'));
    }
  }

  _getRoutes(galaxy) {
    return getGalaxyRoutes(galaxy);
  }

  goStation() {
    this.startScene('Station', { tab: 'trade' });
  }

  travelTo(targetSys) {
    if (this._traveling) return;
    const gs = this.gameState;
    const result = gs.travel(targetSys.id);
    if (!result.success) {
      this.toast(result.reason, 'negative');
      if (this.sfx) this.sfx.error();
      return;
    }

    this._traveling = true;
    if (this.sfx) this.sfx.warp();
    const costs = [];
    if (result.fuelCost) costs.push(`-${result.fuelCost} топл`);
    if (result.dockFee) costs.push(`-${result.dockFee}кр док`);
    if (result.maintenance) costs.push(`-${result.maintenance}кр обсл`);
    if (costs.length) this.toast(costs.join(' | '));

    if (result.expiredTimers && result.expiredTimers.length) {
      gs._pendingTimerMessages = result.expiredTimers.map(t => `Таймер: ${t.name || t.id}`);
    }

    const fromX = this._shipHomeX;
    const fromY = this._shipHomeY;
    const target = this._allSystems.find(s => s.id === targetSys.id);
    const toX = target ? target.x * this._sx + 20 : fromX;
    const toY = target ? target.y * this._sy : fromY;
    const shipSpeed = gs.getEffective('speed');

    if (this.sfx) this.sfx.stopEngine();
    if (this.sfx) this.sfx.startEngine(gs.shipType, false);

    const onArrival = () => {
      this._traveling = false;
      if (this.sfx) this.sfx.stopEngine();

      const isGlitch = gs.galaxy === 'glitch';
      const isVoid = gs.galaxy === 'void';

      if (isGlitch) {
        if (!this._glitchFx) this._glitchFx = new GlitchEffects();
        if (gs._glitchCounter == null) {
          gs._glitchCounter = 0;
          gs._glitchThreshold = 1 + Math.floor(Math.random() * 50);
        }
        gs._glitchCounter++;
        if (gs._glitchCounter >= gs._glitchThreshold) {
          gs._glitchCounter = 0;
          gs._glitchThreshold = 1 + Math.floor(Math.random() * 50);
          this._glitchFx.playRandom(() => this._afterTravel(result));
          return;
        }
      }

      if (isVoid) {
        if (!this._voidFx) this._voidFx = new VoidEffects();
        if (gs._voidCounter == null) {
          gs._voidCounter = 0;
          gs._voidThreshold = 1 + Math.floor(Math.random() * 40);
        }
        gs._voidCounter++;
        if (gs._voidCounter >= gs._voidThreshold) {
          gs._voidCounter = 0;
          gs._voidThreshold = 1 + Math.floor(Math.random() * 40);
          this._voidFx.playRandom(() => this._afterTravel(result));
          return;
        }
      }

      this._afterTravel(result);
    };

    if (this._travelAnim && this._shipSprite && this._map) {
      this._travelAnim.animate({
        map: this._map, shipEl: this._shipSprite,
        fromX, fromY, toX, toY,
        shipType: gs.shipType, shipSpeed,
        isDesktop: this.isDesktop,
        onComplete: onArrival,
      });
    } else {
      this.delayed(400, onArrival);
    }
  }

  _afterTravel(result) {
    if (result.encounter) {
      if (result.encounter.type === 'combat') {
        this.startScene('Combat', { encounter: result.encounter });
      } else {
        this.startScene('Event', { encounter: result.encounter });
      }
    } else {
      const r = Math.random();
      if (r < 0.03) this.startScene('Asteroid');
      else if (r < 0.05) this.startScene('Fishing');
      else if (r < 0.07) this.startScene('Scanner');
      else if (r < 0.085) this.startScene('SmuggleRun');
      else if (r < 0.10) this.startScene('Bribery');
      else if (r < 0.115) this.startScene('CargoGrab');
      else if (r < 0.125) this.startScene('Decipher');
      else if (r < 0.135) this.startScene('Artifact');
      else if (r < 0.15) this.startScene('Defuse');
      else this.startScene('Galaxy');
    }
  }

  jumpGalaxy(targetGalaxy) {
    const gs = this.gameState;
    const gate = GALAXIES[gs.galaxy].gates.find(g => g.target === targetGalaxy);
    if (!gate) return;
    gs.switchGalaxy(targetGalaxy);
    if (this.sfx) this.sfx.warp();
    this.delayed(500, () => this.startScene('Galaxy'));
  }

  toast(text, type = '') {
    const t = this.el('div', `toast ${type}`);
    t.textContent = text;
    this.appendToBody(t);
    this.delayed(2200, () => t.remove());
  }

  showCargo() {
    const gs = this.gameState;
    const maxCargo = gs.ship.cargo + (gs.bonuses.cargo || 0);
    const overlay = this.el('div', 'overlay');
    const popup = this.el('div', 'popup');
    popup.innerHTML = `<div class="popup-title">Трюм ${gs.cargoUsed}/${maxCargo}</div>`;

    if (!gs.cargo.length) {
      popup.innerHTML += '<div style="text-align:center;color:#556;padding:20px">Пусто</div>';
    } else {
      for (const c of gs.cargo) {
        const good = GOODS.find(g => g.id === c.goodId);
        if (!good) continue;
        const row = this.el('div', 'trade-row');
        row.innerHTML = `
          <span class="trade-item" style="color:${good.legal ? '#aabbcc' : '#ff8888'}">${good.icon} ${good.name}</span>
          <span style="color:#aabbcc">${c.qty}</span>
        `;
        popup.appendChild(row);
      }
    }

    const closeBtn = this.el('button', 'popup-close', `Закрыть${this.isDesktop ? ' [Esc]' : ''}`);
    this.listen(closeBtn, 'click', () => overlay.remove());
    popup.appendChild(closeBtn);
    this.listen(overlay, 'click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.appendChild(popup);
    this.appendToBody(overlay);
    this._popup = overlay;
  }

  showQuests() {
    const gs = this.gameState;
    const se = gs.storyEngine;
    const overlay = this.el('div', 'overlay');
    const popup = this.el('div', 'popup journal-popup');
    const act = se.currentAct;
    popup.innerHTML = `<div class="popup-title">${act ? act.title : 'Журнал'}</div>`;

    const tabs = this.el('div', 'quest-tabs');
    const tabMain = this.el('div', 'quest-tab active', 'Сюжет');
    const tabSide = this.el('div', 'quest-tab', 'Побочные');
    const tabLog = this.el('div', 'quest-tab', 'Журнал');
    tabs.appendChild(tabMain);
    tabs.appendChild(tabSide);
    tabs.appendChild(tabLog);
    popup.appendChild(tabs);

    const content = this.el('div', 'journal-content');
    popup.appendChild(content);

    const showMain = () => {
      content.innerHTML = '';
      tabMain.classList.add('active');
      tabSide.classList.remove('active');
      tabLog.classList.remove('active');
      this._renderMainMission(content, se);
    };

    const showSide = () => {
      content.innerHTML = '';
      tabSide.classList.add('active');
      tabMain.classList.remove('active');
      tabLog.classList.remove('active');
      this._renderSideMissions(content, se);
    };

    const showLog = () => {
      content.innerHTML = '';
      tabLog.classList.add('active');
      tabMain.classList.remove('active');
      tabSide.classList.remove('active');
      this._renderJournalLog(content, se);
    };

    this.listen(tabMain, 'click', showMain);
    this.listen(tabSide, 'click', showSide);
    this.listen(tabLog, 'click', showLog);
    showMain();

    const closeBtn = this.el('button', 'popup-close', `Закрыть${this.isDesktop ? ' [Esc]' : ''}`);
    this.listen(closeBtn, 'click', () => overlay.remove());
    popup.appendChild(closeBtn);
    this.listen(overlay, 'click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.appendChild(popup);
    this.appendToBody(overlay);
    this._popup = overlay;
  }

  _renderMainMission(container, se) {
    const brief = se.getMissionBrief();
    if (!brief) {
      container.innerHTML = '<div style="text-align:center;color:#556;padding:24px">Сюжет завершён. Поздравляем!</div>';
      return;
    }

    const npc = brief.npc ? se.getNpcInfo(brief.npc) : null;

    let html = '';
    if (npc) {
      html += `<div class="journal-npc"><span class="journal-npc-icon">${npc.portrait}</span> <span class="journal-npc-name">${npc.name}</span> <span class="journal-npc-title">${npc.title}</span></div>`;
    }
    html += `<div class="journal-mission-title">${brief.title}</div>`;
    html += `<div class="journal-mission-desc">${brief.desc}</div>`;

    html += '<div class="journal-objectives">';
    for (const obj of brief.objectives) {
      const icon = obj.done ? '✓' : '○';
      const cls = obj.done ? 'journal-obj-done' : 'journal-obj-pending';
      html += `<div class="${cls}"><span class="journal-obj-icon">${icon}</span> ${obj.text}</div>`;
    }
    html += '</div>';

    if (brief.hint) {
      html += `<div class="journal-hint">💡 ${brief.hint}</div>`;
    }

    const completed = se.getAllMissions().filter(m => m.status === 'done' && m.category === 'main');
    if (completed.length > 0) {
      html += '<div class="journal-completed-header">Завершённые:</div>';
      for (const m of completed) {
        html += `<div class="journal-completed-item">✓ ${m.title}</div>`;
      }
    }

    container.innerHTML = html;
  }

  _renderSideMissions(container, se) {
    const gs = this.gameState;
    const campaignDone = gs.getQuestFlag('game_complete') === true;

    if (!campaignDone) {
      container.innerHTML = `<div style="text-align:center;color:#556;padding:24px">
        <div style="font-size:1.5em;margin-bottom:12px">🔒</div>
        <div>Побочные миссии откроются после завершения основной кампании.</div>
        <div style="margin-top:8px;font-size:0.85em;color:#445">Пройди сюжет до конца, чтобы разблокировать.</div>
      </div>`;
      return;
    }

    const sides = se.getSideMissions();
    const available = sides.filter(s => s.status === 'available');
    const done = sides.filter(s => s.status === 'done');

    if (!available.length && !done.length) {
      container.innerHTML = '<div style="text-align:center;color:#556;padding:24px">Все побочные миссии завершены!</div>';
      return;
    }

    let html = '';
    for (const m of available) {
      html += `<div class="journal-side-item">`;
      html += `<div class="journal-side-title">${m.title}</div>`;
      html += `<div class="journal-side-desc">${m.description}</div>`;
      if (m.objectives) {
        for (const obj of m.objectives) {
          const objDone = se._checkObjective ? se._checkObjective(obj) : false;
          html += `<div class="${objDone ? 'journal-obj-done' : 'journal-obj-pending'}"><span class="journal-obj-icon">${objDone ? '✓' : '○'}</span> ${obj.text}</div>`;
        }
      }
      html += '</div>';
    }

    if (done.length) {
      html += '<div class="journal-completed-header">Завершённые:</div>';
      for (const m of done) {
        html += `<div class="journal-completed-item" style="opacity:0.5">✓ ${m.title}</div>`;
      }
    }

    container.innerHTML = html;
  }

  _renderJournalLog(container, se) {
    const entries = se.getJournal();
    if (!entries.length) {
      container.innerHTML = '<div style="text-align:center;color:#556;padding:24px">Журнал пуст. События будут записываться по мере прохождения.</div>';
      return;
    }

    let html = '';
    for (const entry of entries) {
      html += `<div class="journal-log-entry">`;
      html += `<div class="journal-log-day">День ${entry.day}</div>`;
      html += `<div class="journal-log-title">${entry.title}</div>`;
      html += `<div class="journal-log-text">${entry.text}</div>`;
      html += '</div>';
    }
    container.innerHTML = html;
  }

  closePopup() {
    if (this._popup) {
      this._popup.remove();
      this._popup = null;
    }
  }

  _setupPinchZoom(viewport, map, mapRect) {
    let scale = 1;
    let tx = 0, ty = 0;
    let startDist = 0;
    let startScale = 1;
    let panStartX = 0, panStartY = 0;
    let panTxStart = 0, panTyStart = 0;
    let lastTap = 0;
    let isPinching = false;
    let isPanning = false;

    const MIN_SCALE = 1;
    const MAX_SCALE = 3;

    const clampTranslate = () => {
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const mw = mapRect.w * scale;
      const mh = mapRect.h * scale;
      if (mw <= vw) tx = (vw - mw) / 2;
      else tx = Math.min(0, Math.max(vw - mw, tx));
      if (mh <= vh) ty = (vh - mh) / 2;
      else ty = Math.min(0, Math.max(vh - mh, ty));
    };

    const applyTransform = () => {
      clampTranslate();
      map.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };

    const getDist = (t) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getMid = (t) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    this.listen(viewport, 'touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isPinching = true;
        isPanning = false;
        startDist = getDist(e.touches);
        startScale = scale;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 300) {
          e.preventDefault();
          const rect = viewport.getBoundingClientRect();
          const cx = e.touches[0].clientX - rect.left;
          const cy = e.touches[0].clientY - rect.top;
          if (scale > 1.1) {
            scale = 1; tx = 0; ty = 0;
          } else {
            const newScale = 2;
            tx = cx - (cx - tx) * (newScale / scale);
            ty = cy - (cy - ty) * (newScale / scale);
            scale = newScale;
          }
          applyTransform();
          lastTap = 0;
          return;
        }
        lastTap = now;
        if (scale > 1.05) {
          isPanning = true;
          panStartX = e.touches[0].clientX;
          panStartY = e.touches[0].clientY;
          panTxStart = tx;
          panTyStart = ty;
        }
      }
    });

    this.listen(viewport, 'touchmove', (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dist = getDist(e.touches);
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * (dist / startDist)));
        const mid = getMid(e.touches);
        const rect = viewport.getBoundingClientRect();
        const cx = mid.x - rect.left;
        const cy = mid.y - rect.top;
        tx = cx - (cx - tx) * (newScale / scale);
        ty = cy - (cy - ty) * (newScale / scale);
        scale = newScale;
        applyTransform();
      } else if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        tx = panTxStart + (e.touches[0].clientX - panStartX);
        ty = panTyStart + (e.touches[0].clientY - panStartY);
        applyTransform();
      }
    });

    this.listen(viewport, 'touchend', (e) => {
      if (e.touches.length < 2) isPinching = false;
      if (e.touches.length < 1) isPanning = false;
    });

    this.listen(viewport, 'wheel', (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));
      tx = cx - (cx - tx) * (newScale / scale);
      ty = cy - (cy - ty) * (newScale / scale);
      scale = newScale;
      applyTransform();
    }, { passive: false });
  }

  destroy() {
    this.closePopup();
    if (this._travelAnim) { this._travelAnim.destroy(); this._travelAnim = null; }
    if (this.sfx) this.sfx.stopEngine();
    super.destroy();
  }
}

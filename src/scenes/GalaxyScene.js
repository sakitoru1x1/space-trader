import { Scene } from '../engine/SceneManager.js';
import { GOODS, FACTIONS, GALAXIES, getGalaxySystems, getNeighbors, getGalaxyRoutes } from '../data/galaxy.js';
import { GlitchEffects } from '../effects/GlitchEffects.js';
import { VoidEffects } from '../effects/VoidEffects.js';

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
    const allSystems = getGalaxySystems(gs.galaxy);
    const neighborIds = getNeighbors(gs.currentSystem, gs.galaxy);

    if (this.sfx) {
      this.sfx.startAmbient('space');
      this.sfx.startMusic('space');
    }

    const scene = this.el('div', 'scene');

    const completedQuests = gs.checkQuests();
    const messages = [];
    if (completedQuests && completedQuests.length) {
      for (const q of completedQuests) {
        messages.push(`Квест выполнен! +${q.reward}кр`);
      }
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
        const shipSprite = this.el('img');
        const shipSpriteId = gs.shipType === 'scout' ? 'player' : gs.shipType;
        shipSprite.src = `sprites/ship-${shipSpriteId}.png`;
        const shipSize = desktop ? 40 : 32;
        shipSprite.style.cssText = `position:absolute;width:${shipSize}px;height:${shipSize}px;object-fit:contain;left:-${shipSize + 4}px;top:${Math.floor((dotSize - shipSize) / 2)}px;transform:rotate(-90deg);z-index:5;pointer-events:none`;
        shipSprite.onerror = () => { shipSprite.style.display = 'none'; };
        planet.appendChild(shipSprite);
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
      { label: mobile ? 'Квест' : `${this.key('Q')}Квесты`, action: () => this.showQuests() },
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
    const gs = this.gameState;
    if (gs.galaxy === 'glitch') this.startScene('Station', { tab: 'trade' });
    else if (gs.galaxy === 'void') this.startScene('Station', { tab: 'trade' });
    else this.startScene('Station', { tab: 'trade' });
  }

  travelTo(targetSys) {
    const gs = this.gameState;
    const result = gs.travel(targetSys.id);
    if (!result.success) {
      this.toast(result.reason, 'negative');
      if (this.sfx) this.sfx.error();
      return;
    }

    if (this.sfx) this.sfx.warp();
    const costs = [];
    if (result.fuelCost) costs.push(`-${result.fuelCost} топл`);
    if (result.dockFee) costs.push(`-${result.dockFee}кр док`);
    if (result.maintenance) costs.push(`-${result.maintenance}кр обсл`);
    if (costs.length) this.toast(costs.join(' | '));

    if (result.expiredTimers && result.expiredTimers.length) {
      gs._pendingTimerMessages = result.expiredTimers.map(t => `Таймер: ${t.name || t.id}`);
    }

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
        this._glitchFx.playRandom(() => {
          this._afterTravel(result);
        });
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
        this._voidFx.playRandom(() => {
          this._afterTravel(result);
        });
        return;
      }
    }

    this.delayed(400, () => this._afterTravel(result));
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
      if (r < 0.06) this.startScene('Asteroid');
      else if (r < 0.10) this.startScene('Fishing');
      else if (r < 0.14) this.startScene('Scanner');
      else if (r < 0.17) this.startScene('SmuggleRun');
      else if (r < 0.20) this.startScene('Bribery');
      else if (r < 0.23) this.startScene('CargoGrab');
      else if (r < 0.25) this.startScene('Decipher');
      else if (r < 0.27) this.startScene('Artifact');
      else if (r < 0.29) this.startScene('Defuse');
      else this.startScene('Galaxy');
    }
  }

  jumpGalaxy(targetGalaxy) {
    const gs = this.gameState;
    const gate = GALAXIES[gs.galaxy].gates.find(g => g.target === targetGalaxy);
    if (!gate) return;
    gs.fuel -= 15;
    gs.switchGalaxy(targetGalaxy);
    if (this.sfx) this.sfx.warp();
    this.delayed(500, () => this.startScene('Galaxy'));
  }

  toast(text, type = '') {
    const t = this.el('div', `toast ${type}`);
    t.textContent = text;
    document.body.appendChild(t);
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
    document.body.appendChild(overlay);
    this._popup = overlay;
  }

  showQuests() {
    const gs = this.gameState;
    const overlay = this.el('div', 'overlay');
    const popup = this.el('div', 'popup');
    popup.innerHTML = `<div class="popup-title">Квесты (${gs.questsCompleted})</div>`;

    const active = (gs.quests || []).filter(q => !q.completed);
    if (!active.length) {
      popup.innerHTML += '<div style="text-align:center;color:#556;padding:20px">Нет активных квестов</div>';
    } else {
      for (const q of active) {
        const qDiv = this.el('div', '');
        qDiv.style.cssText = 'margin-bottom:12px;padding:8px;border-bottom:1px solid #1a1a3e';
        qDiv.innerHTML = `
          <div style="color:#FFD700;font-weight:bold;font-size:14px">${q.title}</div>
          <div style="color:#778899;font-size:12px;margin-top:4px">${q.desc || ''}</div>
          <div style="color:#44ff44;font-size:12px;margin-top:4px">${q.reward}кр</div>
        `;
        popup.appendChild(qDiv);
      }
    }

    const closeBtn = this.el('button', 'popup-close', `Закрыть${this.isDesktop ? ' [Esc]' : ''}`);
    this.listen(closeBtn, 'click', () => overlay.remove());
    popup.appendChild(closeBtn);
    this.listen(overlay, 'click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    this._popup = overlay;
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
    super.destroy();
  }
}

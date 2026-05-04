import { Scene } from '../engine/SceneManager.js';
import { WEAPONS } from '../data/galaxy.js';

export class CombatScene extends Scene {
  init(data) {
    super.init(data);
    this.enemy = { ...data.encounter };
    this.enemyHp = this.enemy.hp;
    this.enemyMaxHp = this.enemy.hp;
    this.playerTurn = true;
    this.defending = false;
    this.busy = false;
    this.empTurns = 0;
    this.minesPlaced = 0;
    this.combatLog = ['Враг обнаружен! Бой!'];
  }

  create(container) {
    super.create(container);
    const gs = this.gameState;
    const maxHp = gs.ship.hp + (gs.bonuses.hp || 0);

    if (this.sfx) {
      this.sfx.startAmbient('combat');
      this.sfx.startMusic('combat');
    }

    const scene = this.el('div', 'scene');

    // Title
    const title = this.el('div', 'text-center');
    title.style.cssText = 'color:#ff4444;font-size:18px;font-weight:bold;padding:8px';
    title.textContent = 'COMBAT';
    scene.appendChild(title);

    if (this.combatLog.length <= 1) {
      const hint = this.el('div', 'text-center');
      hint.style.cssText = 'color:#667;font-size:11px;margin-bottom:6px';
      hint.textContent = 'Атака наносит урон, защита блокирует. Ракеты/мины - мощнее, но ограничены. Дроны бьют каждый ход.';
      scene.appendChild(hint);
    }

    const enemyTitle = this.el('div', 'text-center');
    enemyTitle.style.cssText = 'color:#ff6644;font-size:13px;margin-bottom:8px';
    enemyTitle.textContent = this.enemy.enemy || 'Враг';
    scene.appendChild(enemyTitle);

    // Ships display
    const ships = this.el('div', 'combat-ships');

    // Player ship
    const playerShip = this.el('div', 'combat-ship');
    const playerImg = this.el('img');
    playerImg.src = `sprites/ship-player.png`;
    playerImg.style.transform = 'rotate(-90deg)';
    playerImg.onerror = () => { playerImg.style.display = 'none'; };
    playerShip.appendChild(playerImg);
    const playerName = this.el('div', 'ship-name player', gs.shipType.toUpperCase());
    playerShip.appendChild(playerName);

    const playerHpWrap = this.el('div', 'hp-bar-wrap');
    this.playerHpFill = this.el('div', 'hp-bar-fill player');
    this.playerHpFill.style.width = `${(gs.hp / maxHp) * 100}%`;
    playerHpWrap.appendChild(this.playerHpFill);
    playerShip.appendChild(playerHpWrap);

    this.playerHpText = this.el('div', 'hp-text', `${gs.hp}/${maxHp}`);
    playerShip.appendChild(this.playerHpText);

    if (gs.mercenary) {
      const mercInfo = this.el('div', 'merc-info', `🗡 ${gs.mercenary.name}`);
      playerShip.appendChild(mercInfo);
    }

    ships.appendChild(playerShip);

    // VS text
    const vs = this.el('div', 'text-center');
    vs.style.cssText = 'color:#444;font-size:20px;font-weight:bold;padding:0 10px';
    vs.textContent = 'VS';
    ships.appendChild(vs);

    // Enemy ship
    const enemyShip = this.el('div', 'combat-ship');
    const enemyImg = this.el('img');
    enemyImg.src = `sprites/ship-${this.enemy.ship || 'pirate'}.png`;
    enemyImg.style.transform = 'rotate(90deg)';
    enemyImg.onerror = () => { enemyImg.style.display = 'none'; };
    enemyShip.appendChild(enemyImg);
    const eName = this.el('div', 'ship-name enemy', this.enemy.enemy || 'ВРАГ');
    enemyShip.appendChild(eName);

    const enemyHpWrap = this.el('div', 'hp-bar-wrap');
    this.enemyHpFill = this.el('div', 'hp-bar-fill enemy');
    this.enemyHpFill.style.width = '100%';
    enemyHpWrap.appendChild(this.enemyHpFill);
    enemyShip.appendChild(enemyHpWrap);

    this.enemyHpText = this.el('div', 'hp-text', `${this.enemyHp}/${this.enemyMaxHp}`);
    enemyShip.appendChild(this.enemyHpText);

    ships.appendChild(enemyShip);
    scene.appendChild(ships);

    // Weapon info
    const weaponInfo = this.el('div', 'text-center text-small text-gray');
    const weaponNames = (gs.weapons || ['laser']).map(w => WEAPONS[w]?.name || w).join(' | ');
    weaponInfo.textContent = `${weaponNames} | Ракеты: ${gs.missiles}`;
    weaponInfo.style.padding = '6px';
    scene.appendChild(weaponInfo);

    // Combat log
    this.logEl = this.el('div', 'combat-log');
    this.logEl.textContent = this.combatLog.join('\n');
    scene.appendChild(this.logEl);

    // Action buttons
    this.actionsEl = this.el('div', 'combat-actions');
    const actions = [
      { label: `${this.key('1')}Огонь`, cls: 'combat-btn attack', action: 'attack' },
      { label: `${this.key('2')}Щит`, cls: 'combat-btn shield', action: 'defend' },
      { label: `${this.key('3')}Ракета`, cls: 'combat-btn missile', action: 'missile' },
      { label: `${this.key('4')}Побег`, cls: 'combat-btn flee', action: 'flee' },
    ];
    this.actionBtns = [];
    for (const a of actions) {
      const btn = this.el('button', a.cls, a.label);
      this.listen(btn, 'click', () => this.doAction(a.action));
      this.actionsEl.appendChild(btn);
      this.actionBtns.push(btn);
    }

    if (gs.minesLeft > 0) {
      const mineBtn = this.el('button', 'combat-btn missile', `Мина(${gs.minesLeft})`);
      this.listen(mineBtn, 'click', () => this.doAction('mine'));
      this.actionsEl.appendChild(mineBtn);
      this.actionBtns.push(mineBtn);
    }
    if (gs.dronesActive > 0) {
      const droneBtn = this.el('button', 'combat-btn shield', `Дроны(${gs.dronesActive})`);
      this.listen(droneBtn, 'click', () => this.doAction('drones'));
      this.actionsEl.appendChild(droneBtn);
      this.actionBtns.push(droneBtn);
    }

    scene.appendChild(this.actionsEl);

    // Quit button
    const quitDiv = this.el('div', 'text-center');
    quitDiv.style.padding = '4px';
    const quitBtn = this.btn('Отступить', () => {
      this.startScene('Galaxy');
    }, 'btn btn-gray btn-small');
    quitDiv.appendChild(quitBtn);
    scene.appendChild(quitDiv);

    container.appendChild(scene);
    this.sceneEl = scene;

    // Keyboard
    this.listen(document, 'keydown', (e) => {
      if (e.key === '1') this.doAction('attack');
      if (e.key === '2') this.doAction('defend');
      if (e.key === '3') this.doAction('missile');
      if (e.key === '4') this.doAction('flee');
      if (e.key === '5') this.doAction('mine');
      if (e.key === '6') this.doAction('drones');
    });
  }

  log(msg) {
    this.combatLog.push(msg);
    if (this.combatLog.length > 5) this.combatLog.shift();
    if (this.logEl) this.logEl.textContent = this.combatLog.join('\n');
  }

  setButtons(enabled) {
    for (const b of this.actionBtns) b.disabled = !enabled;
  }

  updateHp() {
    const gs = this.gameState;
    const maxHp = gs.ship.hp + (gs.bonuses.hp || 0);
    const pPct = Math.max(0, (gs.hp / maxHp) * 100);
    const ePct = Math.max(0, (this.enemyHp / this.enemyMaxHp) * 100);
    this.playerHpFill.style.width = `${pPct}%`;
    if (pPct < 30) this.playerHpFill.classList.add('low');
    this.playerHpText.textContent = `${gs.hp}/${maxHp}`;
    this.enemyHpFill.style.width = `${ePct}%`;
    this.enemyHpText.textContent = `${this.enemyHp}/${this.enemyMaxHp}`;
  }

  flash(color) {
    const f = this.el('div', 'screen-flash');
    f.style.background = color;
    document.body.appendChild(f);
    this.delayed(300, () => f.remove());
  }

  shake() {
    if (this.sceneEl) {
      this.sceneEl.classList.add('screen-shake');
      this.delayed(120, () => this.sceneEl.classList.remove('screen-shake'));
    }
  }

  doAction(action) {
    if (!this.playerTurn || this.busy) return;
    this.playerTurn = false;
    this.busy = true;
    this.defending = false;
    this.setButtons(false);

    const gs = this.gameState;
    const dmgBoost = 1 + (gs.bonuses.dmgBoost || 0);

    if (action === 'attack') {
      const weapons = gs.weapons || ['laser'];
      let totalDmg = 0;
      for (const wId of weapons) {
        const wpn = WEAPONS[wId] || WEAPONS.laser;
        if (Math.random() < wpn.accuracy) {
          let dmg = wpn.damage + Math.floor(Math.random() * 5);
          if (wpn.type !== 'kinetic' && this.empTurns <= 0) {
            dmg = Math.max(1, dmg - (this.enemy.defense || 0));
          }
          dmg = Math.max(1, Math.round(dmg * dmgBoost));
          totalDmg += dmg;

          if (wpn.type === 'emp') {
            this.empTurns = 2;
            this.log('Щиты врага отключены!');
          }
          if (wId === 'disruptor' && Math.random() < 0.4) {
            this.enemy.defense = Math.max(0, (this.enemy.defense || 0) - 2);
            this.log('Модуль врага повреждён!');
          }
        }
      }
      if (totalDmg > 0) {
        this.enemyHp -= totalDmg;
        this.log(`Атака: -${totalDmg} HP!`);
        if (this.sfx) this.sfx.laser();
        this.flash('#0088ff');
      } else {
        this.log('Промах!');
      }
      this.updateHp();
      this.delayed(400, () => this.doExtras());

    } else if (action === 'defend') {
      this.defending = true;
      this.log('Щиты подняты!');
      if (this.sfx) this.sfx.shield();
      this.delayed(400, () => this.doExtras());

    } else if (action === 'missile') {
      if (gs.missiles <= 0) {
        this.log('Нет ракет!');
        if (this.sfx) this.sfx.error();
        this.busy = false;
        this.playerTurn = true;
        this.setButtons(true);
        return;
      }
      gs.missiles--;
      if (Math.random() > 0.25) {
        const dmg = Math.max(1, Math.floor((gs.getEffective('attack') * 1.5 + Math.random() * 8) * dmgBoost));
        this.enemyHp -= dmg;
        this.log(`Ракета: -${dmg} HP!`);
        if (this.sfx) this.sfx.explosion();
        this.flash('#ff6600');
        this.shake();
      } else {
        this.log('Ракета: промах!');
      }
      this.updateHp();
      this.delayed(500, () => this.doExtras());

    } else if (action === 'mine') {
      if (gs.minesLeft <= 0) return;
      gs.minesLeft--;
      this.minesPlaced++;
      this.log(`Мина установлена (${this.minesPlaced})`);
      this.delayed(400, () => this.doExtras());

    } else if (action === 'drones') {
      if (gs.dronesActive <= 0) return;
      const dmg = gs.dronesActive * 5;
      this.enemyHp -= dmg;
      this.log(`Дроны атакуют: -${dmg} HP`);
      if (this.sfx) this.sfx.laser();
      this.updateHp();
      this.delayed(400, () => this.doExtras());

    } else if (action === 'flee') {
      const baseChance = gs.getEffective('speed') > 4 ? 0.65 : 0.35;
      const chance = Math.min(0.95, baseChance + (gs.bonuses.fleeBonus || 0));
      if (Math.random() < chance) {
        this.log('Уходим!');
        if (this.sfx) this.sfx.warp();
        this.delayed(500, () => this.startScene('Galaxy'));
        return;
      } else {
        this.log('Не удалось!');
        this.delayed(400, () => this.doExtras());
      }
    }
  }

  doExtras() {
    if (this.checkEnd()) return;

    const gs = this.gameState;

    // Auto-repair
    if (gs.bonuses.autoRepair > 0) {
      const maxHp = gs.ship.hp + (gs.bonuses.hp || 0);
      const healed = Math.min(gs.bonuses.autoRepair, maxHp - gs.hp);
      if (healed > 0) {
        gs.hp += healed;
        this.updateHp();
      }
    }

    // Mercenary attack
    if (gs.mercenary && gs.mercenary.currentHp > 0) {
      this.delayed(300, () => {
        const dmg = Math.max(1, gs.mercenary.attack + Math.floor(Math.random() * 3) - Math.floor((this.enemy.defense || 0) / 2));
        this.enemyHp -= dmg;
        this.log(`${gs.mercenary.name}: -${dmg} HP`);
        this.updateHp();
        if (this.checkEnd()) return;
        this.delayed(400, () => this.enemyTurn());
      });
    } else {
      this.delayed(400, () => this.enemyTurn());
    }
  }

  enemyTurn() {
    if (this.checkEnd()) return;
    const gs = this.gameState;

    // Mine trigger
    if (this.minesPlaced > 0 && Math.random() < 0.4) {
      const mineDmg = 20 + Math.floor(Math.random() * 16);
      this.enemyHp -= mineDmg;
      this.minesPlaced--;
      this.log(`Мина сработала! -${mineDmg} HP`);
      if (this.sfx) this.sfx.explosion();
      this.flash('#ff6600');
      this.updateHp();
      if (this.checkEnd()) return;
    }

    if (this.empTurns > 0) this.empTurns--;

    // Enemy attack
    let dmg = Math.max(1, (this.enemy.attack || 5) + Math.floor(Math.random() * 4) - gs.getEffective('defense'));

    // Jamming
    if (gs.bonuses.jamming && Math.random() < gs.bonuses.jamming * 0.15) {
      this.log('Глушилка: враг промахнулся!');
      this.finishEnemyTurn();
      return;
    }

    // Shield
    if (this.defending) {
      dmg = Math.max(1, Math.floor(dmg * 0.25));
      this.log(`Щит: -${dmg} HP`);
    } else {
      this.log(`Враг атакует: -${dmg} HP`);
    }

    gs.hp = Math.max(0, gs.hp - dmg);

    // Module damage
    if (!this.defending && dmg > 10 && Math.random() < 0.2) {
      const modName = gs.damageRandomModule();
      if (modName) this.log(`${modName} повреждён!`);
    }

    // Mercenary intercept
    if (gs.mercenary && gs.mercenary.currentHp > 0 && Math.random() < 0.4) {
      const mercDmg = Math.max(1, Math.floor(dmg * 0.3));
      gs.mercenary.currentHp -= mercDmg;
      if (gs.mercenary.currentHp <= 0) {
        this.log(`${gs.mercenary.name} погиб!`);
        gs.mercenary = null;
      }
    }

    this.updateHp();
    if (this.sfx) this.sfx.hit();
    this.shake();
    this.flash('#ff2222');

    if (gs.hp <= 0) {
      this.gameOver();
      return;
    }

    this.finishEnemyTurn();
  }

  finishEnemyTurn() {
    this.delayed(500, () => {
      this.playerTurn = true;
      this.busy = false;
      this.defending = false;
      this.setButtons(true);
    });
  }

  checkEnd() {
    if (this.enemyHp <= 0) {
      this.enemyHp = 0;
      this.updateHp();
      const gs = this.gameState;
      const reward = this.enemy.reward || 100;
      gs.credits += reward;
      gs.kills++;
      if (this.enemy.faction === 'pirates') gs.factionRep.military = (gs.factionRep.military || 0) + 3;
      gs.save();

      this.log(`Победа! +${reward}кр`);
      if (this.sfx) { this.sfx.explosion(); this.sfx.victory(); }
      this.setButtons(false);

      this.delayed(1500, () => {
        this.startScene('Galaxy');
      });
      return true;
    }
    return false;
  }

  gameOver() {
    const gs = this.gameState;
    this.setButtons(false);
    if (this.sfx) this.sfx.defeat();

    const overlay = this.el('div', 'overlay');
    const result = this.el('div', 'result-screen');

    if (gs.insurance) {
      result.innerHTML = `
        <div class="result-title text-cyan">СТРАХОВКА СРАБОТАЛА</div>
        <div class="result-stats">Возрождены с базовым кораблём</div>
      `;
      gs.hp = gs.ship.hp;
      gs.fuel = Math.floor(gs.ship.fuel / 2);
      gs.insurance = false;
      gs.save();
      const contBtn = this.btn('Продолжить', () => { overlay.remove(); this.startScene('Galaxy'); }, 'btn btn-wide');
      result.appendChild(contBtn);
    } else {
      result.innerHTML = `
        <div class="result-title text-red">GAME OVER</div>
        <div class="result-stats">
          Дней: ${gs.day} | Убийств: ${gs.kills}<br>
          Квестов: ${gs.questsCompleted} | Заработано: ${gs.totalEarned}кр
        </div>
      `;
      const newBtn = this.btn('Новая игра', () => {
        overlay.remove();
        gs.reset();
        gs.newGame();
        this.startScene('Galaxy');
      }, 'btn btn-wide btn-red');
      result.appendChild(newBtn);
    }

    overlay.appendChild(result);
    document.body.appendChild(overlay);
  }
}

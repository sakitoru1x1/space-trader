import { SYSTEMS, SYSTEMS_2, SYSTEMS_3, GOODS, SHIPS, WEAPONS, MODULES, MERCENARIES, ENEMIES, FACTIONS, STORY_QUESTS, GALAXIES, getGalaxySystems, getGalaxyRoutes, generatePrices, getNeighbors, generatePriceHistory, getAllSystems } from '../data/galaxy.js';
import { TEXT_QUESTS } from '../data/textQuests.js';
import { QUEST_CHAINS } from '../data/questChains.js';

const ALL_TEXT_QUESTS = [...TEXT_QUESTS, ...QUEST_CHAINS];

const SAVE_KEY = 'space_trader_v2';

export class GameState {
  constructor() {
    this.load() || this.newGame();
  }

  newGame() {
    this.credits = 2500;
    this.galaxy = 'milkyway';
    this.currentSystem = 'sol';
    this.shipType = 'scout';
    this.ship = { ...SHIPS.scout };
    this.fuel = this.ship.fuel;
    this.hp = this.ship.hp;
    this.missiles = 3;
    this.maxMissiles = 3;
    this.cargo = [];
    this.cargoUsed = 0;
    this.day = 1;
    this.kills = 0;
    this.totalEarned = 0;
    this.visited = ['sol'];
    this.questsCompleted = 0;

    // Faction reputation
    this.factionRep = {};
    for (const f of Object.keys(FACTIONS)) this.factionRep[f] = 0;

    // Equipped weapons (array of weapon IDs, max = ship.slots.W)
    this.weapons = ['laser'];

    // Installed modules (array of {slotType, moduleId})
    this.modules = [];

    // Module bonuses (calculated)
    this.bonuses = { speed: 0, fuel: 0, defense: 0, hp: 0, cargo: 0, scanner: false, drones: 0, mines: 0, dmgBoost: 0, autoRepair: 0, jamming: 0, fleeBonus: 0 };

    // Combat drones
    this.dronesActive = 0;
    this.minesLeft = 0;

    // Mercenary
    this.mercenary = null; // { id, name, attack, hp, currentHp, daily }

    // Insurance
    this.insurance = false;
    this.insuranceDays = 0;

    // Bank
    this.loan = 0;
    this.loanInterest = 0.05;
    this.loanDaysLeft = 0;

    // Damage system (module damage by index)
    this.damaged = {}; // index -> true

    // Price history
    this.priceHistory = {};

    // Prices
    this.prices = {};
    this.priceDay = {}; // day when prices were last set for each system
    for (const sys of getAllSystems()) {
      this.prices[sys.id] = generatePrices(sys);
      this.priceHistory[sys.id] = generatePriceHistory(sys, 10);
      this.priceDay[sys.id] = 1;
    }

    // Quests
    this.quests = this.generateQuests();
    this.storyQuestsCompleted = [];
    this.textQuestsCompleted = [];

    // Caravan
    this.inCaravan = false;
    this.caravanTarget = null;

    // Quest flags (cross-quest memory)
    this.questFlags = {};

    // Active timers (timed quests)
    this.activeTimers = [];

    this.save();
  }

  // ============ HELPERS ============
  getSystem(id) {
    const sid = id || this.currentSystem;
    const systems = getGalaxySystems(this.galaxy);
    return systems.find(s => s.id === sid);
  }
  getCurrentPrices() { return this.prices[this.currentSystem]; }
  getNeighborSystems() {
    const systems = getGalaxySystems(this.galaxy);
    return getNeighbors(this.currentSystem, this.galaxy).map(id => systems.find(s => s.id === id));
  }

  getEffective(stat) {
    const base = this.ship[stat] || 0;
    const bonus = this.bonuses[stat] || 0;
    return base + bonus;
  }

  recalcBonuses() {
    this.bonuses = { speed: 0, fuel: 0, defense: 0, hp: 0, cargo: 0, scanner: false, drones: 0, mines: 0, dmgBoost: 0, autoRepair: 0, jamming: 0, fleeBonus: 0 };
    if (!Array.isArray(this.modules)) this.modules = [];
    for (let i = 0; i < this.modules.length; i++) {
      const entry = this.modules[i];
      const mod = MODULES[entry.moduleId || entry];
      if (!mod || this.damaged[i]) continue;
      for (const [k, v] of Object.entries(mod.bonus)) {
        if (typeof v === 'boolean') this.bonuses[k] = v;
        else this.bonuses[k] = (this.bonuses[k] || 0) + v;
      }
    }
  }

  getWeaponSlots() { return this.ship.slots?.W || 1; }
  getUtilitySlots() { return this.ship.slots?.U || 2; }
  getEngineSlots() { return this.ship.slots?.E || 1; }

  getInstalledByType(slotType) {
    if (!Array.isArray(this.modules)) this.modules = [];
    return this.modules.filter(m => {
      const mod = MODULES[m.moduleId || m];
      return mod && mod.slotType === slotType;
    });
  }

  countSlotType(slotType) {
    return this.getInstalledByType(slotType).length;
  }

  // ============ TRAVEL ============
  travel(targetId) {
    const fuelCost = 8 + Math.floor(Math.random() * 5);
    const totalFuel = this.ship.fuel + (this.bonuses.fuel || 0);
    if (this.fuel < fuelCost) return { success: false, reason: 'Мало топлива!' };

    const departSys = getGalaxySystems(this.galaxy).find(s => s.id === this.currentSystem);

    this.fuel = Math.max(0, this.fuel - fuelCost);
    this.currentSystem = targetId;
    this.day++;

    if (!this.visited.includes(targetId)) this.visited.push(targetId);

    const dockFees = { trade: 30, tech: 40, industrial: 25, military: 50, agricultural: 15, mining: 20, research: 40, pirate: 0, resort: 60 };
    const targetSys = getGalaxySystems(this.galaxy).find(s => s.id === targetId);
    const dockFee = dockFees[targetSys?.type] || 60;
    const traderDiscount = this.factionRep.traders >= 20 ? 0.7 : 1;
    const earlyGameDiscount = this.day <= 10 ? 0.5 : 1;
    const finalDockFee = Math.round(dockFee * traderDiscount * earlyGameDiscount);
    this.credits = Math.max(0, this.credits - finalDockFee);

    const shipPrice = SHIPS[this.shipType]?.price || 0;
    const maintenanceCost = Math.max(2, Math.round(shipPrice * 0.003 * earlyGameDiscount));
    this.credits = Math.max(0, this.credits - maintenanceCost);

    // Pay mercenary
    if (this.mercenary) {
      if (this.credits >= this.mercenary.daily) {
        this.credits -= this.mercenary.daily;
      } else {
        this.mercenary = null;
      }
    }

    // Loan interest
    if (this.loan > 0) {
      this.loanDaysLeft--;
      if (this.loanDaysLeft <= 0) {
        this.loan = Math.round(this.loan * (1 + this.loanInterest));
        this.loanDaysLeft = 5;
      }
    }

    // Insurance tick
    if (this.insurance) {
      this.insuranceDays--;
      if (this.insuranceDays <= 0) this.insurance = false;
    }

    // Refresh prices only for systems where prices are 8+ days old
    if (!this.priceDay) this.priceDay = {};
    const toRefresh = [targetId, ...getNeighbors(targetId, this.galaxy)];
    const curSystems = getGalaxySystems(this.galaxy);
    for (const sysId of toRefresh) {
      const lastDay = this.priceDay[sysId] || 0;
      if (this.day - lastDay >= 8) {
        const sys = curSystems.find(s => s.id === sysId);
        if (sys) {
          this.prices[sys.id] = generatePrices(sys);
          this.priceDay[sysId] = this.day;
          if (!this.priceHistory[sys.id]) this.priceHistory[sys.id] = {};
          const hist = this.priceHistory[sys.id];
          for (const g of GOODS) {
            if (!hist[g.id]) hist[g.id] = [];
            hist[g.id].push(this.prices[sys.id][g.id].buy);
            if (hist[g.id].length > 15) hist[g.id].shift();
          }
        }
      }
    }

    // Caravan protection
    const sys = this.getSystem();
    let encounter = null;
    if (!this.inCaravan) {
      const chance = sys.type === 'pirate' ? 0.65 : sys.type === 'military' ? 0.3 : 0.5;
      if (Math.random() < chance) encounter = this.generateEncounter();
    } else {
      if (Math.random() < 0.15) encounter = this.generateEncounter();
      if (targetId === this.caravanTarget) { this.inCaravan = false; this.caravanTarget = null; }
    }

    // Check expired timers
    const expiredTimers = this.checkTimers();
    for (const timer of expiredTimers) {
      if (timer.onExpire) {
        if (timer.onExpire.credits) this.credits = Math.max(0, this.credits + timer.onExpire.credits);
        if (timer.onExpire.damage) this.hp = Math.max(1, this.hp - timer.onExpire.damage);
        if (timer.onExpire.reputation) {
          const sys = this.getSystem();
          const faction = sys.faction || 'traders';
          this.factionRep[faction] = (this.factionRep[faction] || 0) + timer.onExpire.reputation;
        }
        if (timer.onExpire.factionRep) {
          for (const [f, amt] of Object.entries(timer.onExpire.factionRep)) {
            this.factionRep[f] = (this.factionRep[f] || 0) + amt;
          }
        }
        if (timer.onExpire.flags) {
          for (const [key, val] of Object.entries(timer.onExpire.flags)) {
            this.setQuestFlag(key, val);
          }
        }
      }
      this.removeTimer(timer.id);
    }

    this.save();
    return { success: true, fuelCost, dockFee: finalDockFee, maintenance: maintenanceCost, encounter, expiredTimers };
  }

  // ============ SCANNING ============
  scanSystem(targetId) {
    if (!this.bonuses.scanner) return null;
    const sys = getGalaxySystems(this.galaxy).find(s => s.id === targetId);
    const danger = sys.type === 'pirate' ? 'Высокая' : sys.type === 'military' ? 'Низкая' : 'Средняя';
    const prices = this.prices[targetId];
    let bestProfit = null;
    if (prices) {
      const cur = this.getCurrentPrices();
      for (const g of GOODS) {
        const buyHere = cur[g.id].buy;
        const sellThere = prices[g.id].sell;
        const profit = sellThere - buyHere;
        if (!bestProfit || profit > bestProfit.profit) {
          bestProfit = { good: g.name, profit, icon: g.icon };
        }
      }
    }
    return { danger, faction: FACTIONS[sys.faction]?.name || '?', bestProfit };
  }

  // ============ TRADING ============
  buyGood(goodId, qty) {
    const prices = this.getCurrentPrices();
    const good = GOODS.find(g => g.id === goodId);
    const sys = this.getSystem();

    // Black market check - illegal goods only in pirate systems
    if (!good.legal && sys.type !== 'pirate') return { success: false, reason: 'Нелегально тут!' };

    // Faction discount
    let price = prices[goodId].buy;
    if (this.factionRep[sys.faction] >= 20) price = Math.round(price * 0.9);

    const totalCost = price * qty;
    if (totalCost > this.credits) return { success: false, reason: 'Мало денег!' };
    const maxCargo = this.ship.cargo + (this.bonuses.cargo || 0);
    if (this.cargoUsed + qty > maxCargo) return { success: false, reason: 'Трюм полон!' };

    this.credits -= totalCost;
    const existing = this.cargo.find(c => c.goodId === goodId);
    if (existing) existing.qty += qty;
    else this.cargo.push({ goodId, qty });
    this.cargoUsed += qty;

    this.save();
    return { success: true, totalCost };
  }

  addCargo(goodId, qty) {
    const maxCargo = this.ship.cargo + (this.bonuses.cargo || 0);
    const free = maxCargo - this.cargoUsed;
    const actual = Math.min(qty, free);
    if (actual <= 0) return 0;
    const existing = this.cargo.find(c => c.goodId === goodId);
    if (existing) existing.qty += actual;
    else this.cargo.push({ goodId, qty: actual });
    this.cargoUsed += actual;
    this.save();
    return actual;
  }

  sellGood(goodId, qty) {
    const existing = this.cargo.find(c => c.goodId === goodId);
    if (!existing || existing.qty < qty) return { success: false, reason: 'Нет товара!' };
    const good = GOODS.find(g => g.id === goodId);
    const sys = this.getSystem();

    // Contraband arrest risk in military systems
    if (!good.legal && sys.type === 'military' && this.factionRep.pirates >= 30) {
      if (Math.random() < 0.3) {
        const fine = Math.floor(this.credits * 0.3);
        this.credits = Math.max(0, this.credits - fine);
        existing.qty -= qty;
        this.cargoUsed -= qty;
        if (existing.qty <= 0) this.cargo = this.cargo.filter(c => c.qty > 0);
        this.factionRep.military = (this.factionRep.military || 0) - 10;
        this.save();
        return { success: false, reason: `Арест! Штраф ${fine} кр, товар конфискован!` };
      }
    }

    const curPrices = this.getCurrentPrices();
    let price = curPrices[goodId].sell;
    if (this.factionRep[sys.faction] >= 20) price = Math.round(price * 1.1);

    const totalEarned = price * qty;
    this.credits += totalEarned;
    this.totalEarned += totalEarned;
    existing.qty -= qty;
    this.cargoUsed -= qty;
    if (existing.qty <= 0) this.cargo = this.cargo.filter(c => c.qty > 0);

    this.save();
    return { success: true, totalEarned };
  }

  // ============ SERVICES ============
  refuel(amount) {
    const cost = amount * 5;
    const sys = this.getSystem();
    const discount = this.factionRep.miners >= 20 ? 0.8 : 1;
    const finalCost = Math.round(cost * discount);
    if (finalCost > this.credits) return { success: false, reason: 'Мало денег!' };
    this.credits -= finalCost;
    const maxFuel = this.ship.fuel + (this.bonuses.fuel || 0);
    this.fuel = Math.min(this.fuel + amount, maxFuel);
    this.save();
    return { success: true, cost: finalCost };
  }

  repair(amount) {
    const cost = amount * 5;
    if (cost > this.credits) return { success: false, reason: 'Мало денег!' };
    this.credits -= cost;
    const maxHp = this.ship.hp + (this.bonuses.hp || 0);
    this.hp = Math.min(this.hp + amount, maxHp);
    this.save();
    return { success: true, cost };
  }

  damageRandomModule() {
    if (!Array.isArray(this.modules) || this.modules.length === 0) return null;
    const undamaged = [];
    for (let i = 0; i < this.modules.length; i++) {
      if (!this.damaged[i]) undamaged.push(i);
    }
    if (undamaged.length === 0) return null;
    const idx = undamaged[Math.floor(Math.random() * undamaged.length)];
    this.damaged[idx] = true;
    this.recalcBonuses();
    const entry = this.modules[idx];
    const mod = MODULES[entry.moduleId || entry];
    return mod?.name || 'модуль';
  }

  repairModule(index) {
    if (!this.damaged[index]) return { success: false, reason: 'Модуль не повреждён' };
    const cost = 300;
    if (this.credits < cost) return { success: false, reason: 'Мало денег!' };
    this.credits -= cost;
    delete this.damaged[index];
    this.recalcBonuses();
    this.save();
    return { success: true };
  }

  buyMissiles(qty) {
    const cost = qty * 50;
    if (cost > this.credits) return { success: false, reason: 'Мало денег!' };
    if (this.missiles + qty > this.maxMissiles) return { success: false, reason: 'Арсенал полон!' };
    this.credits -= cost;
    this.missiles += qty;
    this.save();
    return { success: true };
  }

  // ============ WEAPONS & MODULES ============
  buyWeapon(weaponId) {
    const w = WEAPONS[weaponId];
    if (!w) return { success: false, reason: 'Не найдено' };
    if (w.price > this.credits) return { success: false, reason: 'Мало денег!' };
    if (!Array.isArray(this.weapons)) this.weapons = ['laser'];
    const maxW = this.getWeaponSlots();
    if (this.weapons.length >= maxW) return { success: false, reason: `Все ${maxW} слотов заняты!` };
    this.credits -= w.price;
    this.weapons.push(weaponId);
    this.save();
    return { success: true };
  }

  removeWeapon(index) {
    if (!Array.isArray(this.weapons)) return { success: false, reason: 'Нет оружия' };
    if (index < 0 || index >= this.weapons.length) return { success: false, reason: 'Неверный слот' };
    if (this.weapons.length <= 1) return { success: false, reason: 'Нужно хотя бы одно оружие!' };
    const wpnId = this.weapons[index];
    const wpn = WEAPONS[wpnId];
    const refund = wpn ? Math.floor(wpn.price * 0.4) : 0;
    this.credits += refund;
    this.weapons.splice(index, 1);
    this.save();
    return { success: true, refund };
  }

  installModule(moduleId) {
    const mod = MODULES[moduleId];
    if (!mod) return { success: false, reason: 'Не найден' };
    if (mod.price > this.credits) return { success: false, reason: 'Мало денег!' };
    if (!Array.isArray(this.modules)) this.modules = [];
    const maxSlots = mod.slotType === 'U' ? this.getUtilitySlots() : this.getEngineSlots();
    const used = this.countSlotType(mod.slotType);
    if (used >= maxSlots) return { success: false, reason: `Все ${mod.slotType}-слоты заняты!` };
    this.credits -= mod.price;
    this.modules.push({ slotType: mod.slotType, moduleId });
    this.recalcBonuses();
    this.dronesActive = this.bonuses.drones || 0;
    this.minesLeft = this.bonuses.mines || 0;
    this.save();
    return { success: true };
  }

  removeModule(index) {
    if (!Array.isArray(this.modules)) return { success: false, reason: 'Нет модулей' };
    if (index < 0 || index >= this.modules.length) return { success: false, reason: 'Неверный слот' };
    const entry = this.modules[index];
    const mod = MODULES[entry.moduleId || entry];
    const refund = mod ? Math.floor(mod.price * 0.4) : 0;
    this.credits += refund;
    this.modules.splice(index, 1);
    // Re-index damaged
    const newDamaged = {};
    for (const [k, v] of Object.entries(this.damaged)) {
      const ki = parseInt(k);
      if (ki < index) newDamaged[ki] = v;
      else if (ki > index) newDamaged[ki - 1] = v;
    }
    this.damaged = newDamaged;
    this.recalcBonuses();
    this.dronesActive = this.bonuses.drones || 0;
    this.minesLeft = this.bonuses.mines || 0;
    this.save();
    return { success: true, refund };
  }

  // ============ SHIP ============
  canBuyShip(shipType) {
    const ship = SHIPS[shipType];
    if (!ship || shipType === this.shipType) return { can: false, reason: 'Уже ваш' };
    const currentValue = Math.floor((SHIPS[this.shipType]?.price || 0) * 0.4);
    const finalCost = ship.price - currentValue;
    if (finalCost > this.credits) return { can: false, reason: `Нужно ${finalCost} кр`, cost: finalCost };
    return { can: true, cost: finalCost, tradeIn: currentValue };
  }

  buyShip(shipType) {
    const check = this.canBuyShip(shipType);
    if (!check.can) return { success: false, reason: check.reason };
    this.credits -= check.cost;
    this.shipType = shipType;
    this.ship = { ...SHIPS[shipType] };
    this.hp = this.ship.hp + (this.bonuses.hp || 0);
    this.fuel = this.ship.fuel + (this.bonuses.fuel || 0);
    this.maxMissiles = Math.floor(this.ship.attack / 5) + 2;
    this.missiles = Math.min(this.missiles, this.maxMissiles);
    // Trim weapons to new ship's W-slots
    if (!Array.isArray(this.weapons)) this.weapons = ['laser'];
    const maxW = this.ship.slots?.W || 1;
    while (this.weapons.length > maxW) this.weapons.pop();
    if (this.weapons.length === 0) this.weapons = ['laser'];
    // Trim modules to new ship's slots
    if (!Array.isArray(this.modules)) this.modules = [];
    const maxU = this.ship.slots?.U || 2;
    const maxE = this.ship.slots?.E || 1;
    let uCount = 0, eCount = 0;
    const kept = [];
    for (const entry of this.modules) {
      const mod = MODULES[entry.moduleId || entry];
      if (!mod) continue;
      if (mod.slotType === 'U' && uCount < maxU) { kept.push(entry); uCount++; }
      else if (mod.slotType === 'E' && eCount < maxE) { kept.push(entry); eCount++; }
    }
    this.modules = kept;
    this.damaged = {};
    this.recalcBonuses();
    this.dronesActive = this.bonuses.drones || 0;
    this.minesLeft = this.bonuses.mines || 0;
    if (this.cargoUsed > this.ship.cargo + (this.bonuses.cargo || 0)) {
      const maxC = this.ship.cargo + (this.bonuses.cargo || 0);
      while (this.cargoUsed > maxC && this.cargo.length > 0) {
        const last = this.cargo[this.cargo.length - 1];
        const drop = Math.min(last.qty, this.cargoUsed - maxC);
        last.qty -= drop;
        this.cargoUsed -= drop;
        if (last.qty <= 0) this.cargo.pop();
      }
    }
    this.save();
    return { success: true };
  }

  // ============ MERCENARY ============
  hireMercenary(mercId) {
    const merc = MERCENARIES.find(m => m.id === mercId);
    if (!merc) return { success: false, reason: 'Не найден' };
    if (this.mercenary) return { success: false, reason: 'Уже есть наёмник' };
    if (merc.cost > this.credits) return { success: false, reason: 'Мало денег!' };
    this.credits -= merc.cost;
    this.mercenary = { ...merc, currentHp: merc.hp };
    this.save();
    return { success: true };
  }

  fireMercenary() {
    this.mercenary = null;
    this.save();
  }

  // ============ INSURANCE ============
  buyInsurance() {
    const cost = 500;
    if (this.credits < cost) return { success: false, reason: 'Мало денег!' };
    if (this.insurance) return { success: false, reason: 'Уже застрахованы!' };
    this.credits -= cost;
    this.insurance = true;
    this.insuranceDays = 30;
    this.save();
    return { success: true };
  }

  // ============ BANK ============
  takeLoan(amount) {
    if (this.loan > 0) return { success: false, reason: 'Уже есть кредит!' };
    this.credits += amount;
    this.loan = amount;
    this.loanDaysLeft = 5;
    this.save();
    return { success: true };
  }

  repayLoan() {
    if (this.loan <= 0) return { success: false, reason: 'Нет долга' };
    if (this.credits < this.loan) return { success: false, reason: 'Мало денег!' };
    this.credits -= this.loan;
    this.loan = 0;
    this.loanDaysLeft = 0;
    this.save();
    return { success: true };
  }

  // ============ CARAVAN ============
  joinCaravan(targetId) {
    const cost = 100;
    if (this.credits < cost) return { success: false, reason: 'Мало денег!' };
    this.credits -= cost;
    this.inCaravan = true;
    this.caravanTarget = targetId;
    this.save();
    return { success: true };
  }

  // ============ ENCOUNTERS ============
  generateEncounter() {
    const sys = this.getSystem();
    const level = Math.min(1 + Math.floor(this.day / 5), 10);
    const roll = Math.random();

    // Story quest chance
    if (roll > 0.85) {
      const available = STORY_QUESTS.filter(q => !this.storyQuestsCompleted.includes(q.id));
      if (available.length > 0) {
        const sq = available[Math.floor(Math.random() * available.length)];
        return { type: 'story', quest: sq };
      }
    }

    // Combat encounters
    if (roll < 0.25) {
      let template;

      if (this.galaxy === 'glitch') {
        const glitchEnemies = [ENEMIES.virus_worm, ENEMIES.trojan, ENEMIES.ransomware, ENEMIES.kernel_panic, ENEMIES.null_pointer, ENEMIES.firewall];
        if (level < 3) template = glitchEnemies[0];
        else if (level < 5) template = glitchEnemies[Math.floor(Math.random() * 2) + 1];
        else if (level < 8) template = glitchEnemies[2 + Math.floor(Math.random() * 2)];
        else template = glitchEnemies[3 + Math.floor(Math.random() * 3)];
      } else if (this.galaxy === 'void') {
        const voidEnemies = [ENEMIES.shadow_tendril, ENEMIES.dark_echo, ENEMIES.whisper_swarm, ENEMIES.abyss_maw, ENEMIES.void_leviathan, ENEMIES.ancient_sentinel];
        if (level < 3) template = voidEnemies[0];
        else if (level < 5) template = voidEnemies[Math.floor(Math.random() * 2) + 1];
        else if (level < 8) template = voidEnemies[2 + Math.floor(Math.random() * 2)];
        else template = voidEnemies[3 + Math.floor(Math.random() * 3)];
      } else {
        if (level < 3) template = ENEMIES.pirate_scout;
        else if (level < 6) template = ENEMIES.pirate_raider;
        else if (level < 8) template = Math.random() > 0.5 ? ENEMIES.bounty_hunter : ENEMIES.pirate_raider;
        else template = Math.random() > 0.7 ? ENEMIES.pirate_boss : ENEMIES.bounty_hunter;

        if (sys.type === 'military' && this.factionRep.military < -10) template = ENEMIES.military_patrol;
        if (Math.random() > 0.85) template = ENEMIES.drone_swarm;
      }

      const scale = 1 + (level - 1) * 0.15;
      return {
        type: 'combat',
        enemy: template.name,
        hp: Math.round(template.hp * scale),
        attack: Math.round(template.attack * scale),
        defense: Math.round(template.defense * scale),
        reward: Math.round(template.reward * scale),
        ship: template.ship || 'pirate',
      };
    }

    // Regular events (expanded)
    const events = [
      {
        type: 'event', title: 'Бродячий торговец', icon: 'trader',
        img: 'sprites/event-trader.png',
        ascii: '   __/\\__\n  /  $$  \\\n |  SALE  |\n  \\______/',
        text: 'Торговое судно предлагает сделку.',
        options: [
          { text: 'Топливо (-100кр +30)', action: 'buy_fuel' },
          { text: 'Ракеты (-100кр +2)', action: 'buy_missiles' },
          { text: 'Мимо', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Сигнал бедствия', icon: 'distress',
        img: 'sprites/event-distress.png',
        ascii: '  * SOS * SOS *\n   __|__\n  / x  x \\\n |  HELP! |\n  \\_____/',
        text: 'Грузовоз без двигателя просит помощи.',
        options: [
          { text: 'Помочь (+реп)', action: 'help' },
          { text: 'Ограбить (+лут -реп)', action: 'rob' },
          { text: 'Мимо', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Астероидное поле', icon: 'asteroid',
        img: 'sprites/event-asteroid.png',
        ascii: '  o  O   o\n O   .o.   O\n  o O   o\n .  o  O  .',
        text: 'Астероиды на пути!',
        options: [
          { text: 'Напрямик (шанс урона)', action: 'risk' },
          { text: 'В обход (-5 топл)', action: 'safe' },
        ]
      },
      {
        type: 'event', title: 'Караван торговцев', icon: 'caravan',
        img: 'sprites/event-trader.png',
        ascii: ' >=>  >=>  >=>\n/$$\\ /$$\\ /$$\\\n\\__/ \\__/ \\__/',
        text: 'Торговый караван идёт в ту же сторону.',
        options: [
          { text: 'Присоединиться (-100кр)', action: 'join_caravan' },
          { text: 'Своим путём', action: 'ignore' },
        ]
      },
      // ===== NEW EVENTS =====
      {
        type: 'event', title: 'Космический мусор', icon: 'asteroid',
        img: 'sprites/event-asteroid.png',
        ascii: ' /\\ .  x /\n  \\ x . / \\\n . =[?]=  .\n /  x  \\  x\n  .  /\\  .',
        text: 'Обломки уничтоженного корабля. Среди мусора мигает что-то ценное.',
        options: [
          { text: 'Обыскать обломки', action: 'scavenge' },
          { text: 'Опасно, лететь дальше', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Пространственная аномалия', icon: 'anomaly',
        img: 'sprites/event-nebula.png',
        ascii: '   ./*\\.\n  / ??? \\\n | ~*~*~ |\n  \\ ??? /\n   \'*~*\'',
        text: 'Приборы сходят с ума! Впереди - мерцающий разлом в пространстве. Из него тянет неизвестной энергией.',
        options: [
          { text: 'Пролететь сквозь', action: 'anomaly_enter' },
          { text: 'Просканировать', action: 'anomaly_scan' },
          { text: 'Облететь', action: 'anomaly_avoid' },
        ]
      },
      {
        type: 'event', title: 'Контрабандист', icon: 'trader',
        img: 'sprites/event-trader.png',
        ascii: '    __\n   /  \\\n  | $$ |\n  | .. |\n   \\shh/',
        text: '"Псс! Дешёвый товар, без вопросов." Мутный тип в шаттле предлагает груз по бросовой цене.',
        options: [
          { text: 'Купить (200кр, случайный груз)', action: 'smuggler_buy' },
          { text: 'Сдать властям (+реп)', action: 'smuggler_report' },
          { text: 'Мимо', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Военный патруль', icon: 'military',
        img: 'sprites/event-military.png',
        ascii: '  [!] STOP [!]\n   ___|___\n  /=======\\\n | PATROL  |\n  \\_______/',
        text: '"Стандартная проверка. Предъявите груз для досмотра."',
        options: [
          { text: 'Показать груз', action: 'patrol_comply' },
          { text: 'Попытаться улететь', action: 'patrol_flee' },
          { text: 'Дать взятку (300кр)', action: 'patrol_bribe' },
        ]
      },
      {
        type: 'event', title: 'Корабль беженцев', icon: 'distress',
        img: 'sprites/event-distress.png',
        ascii: '   __|__\n  / ... \\\n | ooooo |\n | ooooo |\n  \\_____/\n    |||',
        text: 'Переполненный транспорт. Женщина по радио: "У нас дети на борту. Нет топлива и еды. Помогите..."',
        options: [
          { text: 'Отдать топливо (-15)', action: 'refugees_fuel' },
          { text: 'Отдать еду (если есть)', action: 'refugees_food' },
          { text: 'Дать денег (-200кр)', action: 'refugees_money' },
          { text: 'Мимо', action: 'refugees_ignore' },
        ]
      },
      {
        type: 'event', title: 'Вызов на гонку', icon: 'racer',
        img: 'sprites/event-station.png',
        ascii: '  >>--- RACE --->\n   >=>\n  >===>  >=>\n   >>--- GO! --->',
        text: '"Эй, пилот! Спорим на 500 кредитов, что мой корабль быстрее!" Молодой гонщик подмигивает.',
        options: [
          { text: 'Принять вызов (500кр)', action: 'race_accept' },
          { text: 'Поднять ставку (1000кр)', action: 'race_double' },
          { text: 'Не до гонок', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Поломка двигателя', icon: 'breakdown',
        img: 'sprites/event-asteroid.png',
        ascii: '  [WARNING]\n   _/|\\_\n  / *!!* \\\n | OVRHEAT |\n  \\_/||\\_/\n    ~~~~',
        text: 'ТРЕВОГА! Двигатель перегрелся. Нужен ремонт или рискнуть продолжить полёт.',
        options: [
          { text: 'Аварийный ремонт (-300кр)', action: 'breakdown_repair' },
          { text: 'Рискнуть (шанс урона)', action: 'breakdown_risk' },
          { text: 'Сбросить часть груза', action: 'breakdown_dump' },
        ]
      },
      {
        type: 'event', title: 'Туманность', icon: 'nebula',
        img: 'sprites/event-nebula.png',
        ascii: '  ..::::::..\n .::.    .::.\n::  ~~~~  ::\n \'::. . .::.\n   \'::::::\'',
        text: 'Густая туманность. Навигация затруднена, но внутри могут быть ценные газы.',
        options: [
          { text: 'Собрать газы (+топливо)', action: 'nebula_collect' },
          { text: 'Пройти насквозь', action: 'nebula_through' },
          { text: 'Обогнуть (-3 топл)', action: 'nebula_around' },
        ]
      },
      {
        type: 'event', title: 'Заброшенная станция', icon: 'station',
        img: 'sprites/event-station.png',
        ascii: '   [====]\n  /|    |\\\n | | .. | |\n | |____| |\n  \\|    |/\n   [====]',
        text: 'Старая станция на орбите. Энергия почти на нуле, но шлюз работает.',
        options: [
          { text: 'Исследовать', action: 'station_explore' },
          { text: 'Проверить док', action: 'station_dock' },
          { text: 'Лететь мимо', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Загадочный сигнал', icon: 'distress',
        img: 'sprites/event-distress.png',
        ascii: ' ~.~.~.~.~.~\n  01?10?01\n ~.~.~.~.~.~\n  10?01?10\n ~.~.~.~.~.~',
        text: 'Слабый закодированный сигнал. Не похож ни на один известный протокол. Координаты указывают на пустое пространство.',
        options: [
          { text: 'Следовать за сигналом', action: 'signal_follow' },
          { text: 'Записать и продать', action: 'signal_sell' },
          { text: 'Игнорировать', action: 'ignore' },
        ]
      },
      {
        type: 'event', title: 'Метеоритный дождь', icon: 'asteroid',
        img: 'sprites/event-asteroid.png',
        ascii: '  *  . * .\n .  * . *\n  * .  * .\n *  . *  .\n  . *  . *',
        text: 'Красивое зрелище - десятки метеоров вокруг. Но среди них могут быть куски ценной руды!',
        options: [
          { text: 'Ловить метеориты', action: 'meteor_catch' },
          { text: 'Любоваться и лететь', action: 'ignore' },
        ]
      },
    ];
    return events[Math.floor(Math.random() * events.length)];
  }

  handleEventAction(action) {
    const results = [];
    const sys = this.getSystem();
    switch (action) {
      case 'buy_fuel':
        if (this.credits >= 100) {
          this.credits -= 100;
          const maxF = this.ship.fuel + (this.bonuses.fuel || 0);
          this.fuel = Math.min(this.fuel + 30, maxF);
          results.push('-100 кр, +30 топлива');
        } else results.push('Нет денег!');
        break;
      case 'buy_missiles':
        if (this.credits >= 100 && this.missiles < this.maxMissiles) {
          this.credits -= 100;
          this.missiles = Math.min(this.missiles + 2, this.maxMissiles);
          results.push('-100 кр, +2 ракеты');
        } else results.push(this.credits < 100 ? 'Нет денег!' : 'Полный арсенал!');
        break;
      case 'help':
        this.factionRep.traders = (this.factionRep.traders || 0) + 5;
        if (Math.random() > 0.4) {
          const reward = 65 + Math.floor(Math.random() * 195);
          this.credits += reward;
          results.push(`+${reward} кр, +5 репутации`);
        } else results.push('+5 репутации торговцев');
        break;
      case 'rob':
        this.factionRep.pirates = (this.factionRep.pirates || 0) + 3;
        this.factionRep.traders = (this.factionRep.traders || 0) - 10;
        const loot = 130 + Math.floor(Math.random() * 325);
        this.credits += loot;
        results.push(`+${loot} кр, -10 реп. торговцев, +3 реп. пиратов`);
        break;
      case 'risk':
        if (Math.random() > 0.5) {
          const dmg = 5 + Math.floor(Math.random() * 15);
          this.hp = Math.max(0, this.hp - dmg);
          if (Math.random() > 0.7) {
            const modName = this.damageRandomModule();
            if (modName) results.push(`-${dmg} HP, ${modName} повреждён!`);
            else results.push(`-${dmg} HP`);
          } else {
            results.push(`-${dmg} HP`);
          }
        } else results.push('Пролетели чисто!');
        break;
      case 'safe':
        this.fuel = Math.max(0, this.fuel - 5);
        results.push('-5 топлива');
        break;
      case 'join_caravan':
        if (this.credits >= 100) {
          this.credits -= 100;
          this.inCaravan = true;
          const neighbors = getNeighbors(this.currentSystem, this.galaxy);
          this.caravanTarget = neighbors[Math.floor(Math.random() * neighbors.length)];
          const target = getGalaxySystems(this.galaxy).find(s => s.id === this.caravanTarget);
          results.push(`Караван идёт к ${target?.name || '?'}. -100 кр`);
        } else results.push('Нет денег!');
        break;
      case 'ignore':
        results.push('Пролетели мимо.');
        break;
      // ===== NEW EVENT HANDLERS =====
      case 'scavenge':
        if (Math.random() > 0.3) {
          const loot = 100 + Math.floor(Math.random() * 225);
          this.credits += loot;
          results.push(`Нашли ценности! +${loot} кр`);
          if (Math.random() > 0.7) {
            const fuelFound = 5 + Math.floor(Math.random() * 15);
            const maxF = this.ship.fuel + (this.bonuses.fuel || 0);
            this.fuel = Math.min(this.fuel + fuelFound, maxF);
            results.push(`+${fuelFound} топлива в обломках`);
          }
        } else {
          const dmg = 3 + Math.floor(Math.random() * 8);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Обломок ударил по корпусу! -${dmg} HP`);
        }
        break;
      case 'anomaly_enter':
        if (Math.random() > 0.4) {
          const bonus = 300 + Math.floor(Math.random() * 700);
          this.credits += bonus;
          const maxF = this.ship.fuel + (this.bonuses.fuel || 0);
          this.fuel = Math.min(this.fuel + 20, maxF);
          results.push(`Аномалия перенесла энергию в корабль! +${bonus} кр, +20 топлива`);
        } else {
          const dmg = 10 + Math.floor(Math.random() * 20);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Энергетический удар! -${dmg} HP`);
          if (Math.random() > 0.5) {
            const modName = this.damageRandomModule();
            if (modName) results.push(`${modName} повреждён!`);
          }
        }
        break;
      case 'anomaly_scan':
        if (this.bonuses.scanner) {
          const bonus = 500 + Math.floor(Math.random() * 500);
          this.credits += bonus;
          this.factionRep.scientists = (this.factionRep.scientists || 0) + 5;
          results.push(`Сканер собрал данные об аномалии. Продано учёным за ${bonus} кр, +5 реп.`);
        } else {
          results.push('Без сканера ничего не разобрать. Летим дальше.');
        }
        break;
      case 'anomaly_avoid':
        this.fuel = Math.max(0, this.fuel - 3);
        results.push('Аккуратно облетели. -3 топлива.');
        break;
      case 'smuggler_buy':
        if (this.credits >= 200) {
          this.credits -= 200;
          const maxCargo = this.ship.cargo + (this.bonuses.cargo || 0);
          if (this.cargoUsed < maxCargo) {
            const goods = GOODS.filter(g => Math.random() > 0.5);
            const g = goods.length > 0 ? goods[0] : GOODS[Math.floor(Math.random() * GOODS.length)];
            const qty = 2 + Math.floor(Math.random() * 4);
            const actualQty = Math.min(qty, maxCargo - this.cargoUsed);
            const existing = this.cargo.find(c => c.goodId === g.id);
            if (existing) existing.qty += actualQty;
            else this.cargo.push({ goodId: g.id, qty: actualQty });
            this.cargoUsed += actualQty;
            results.push(`Купили ${actualQty}x ${g.icon}${g.name}. Может, краденое...`);
          } else {
            results.push('Трюм полон! Зря потратили деньги. -200 кр');
          }
        } else results.push('Нет денег!');
        break;
      case 'smuggler_report':
        this.factionRep.military = (this.factionRep.military || 0) + 5;
        this.factionRep.pirates = (this.factionRep.pirates || 0) - 5;
        const bounty = 65 + Math.floor(Math.random() * 130);
        this.credits += bounty;
        results.push(`Контрабандист задержан! +${bounty} кр, +5 реп. военных`);
        break;
      case 'patrol_comply': {
        const hasContraband = this.cargo.some(c => {
          const g = GOODS.find(g => g.id === c.goodId);
          return g && !g.legal;
        });
        if (hasContraband) {
          const fine = Math.floor(this.credits * 0.25);
          this.credits = Math.max(0, this.credits - fine);
          this.cargo = this.cargo.filter(c => { const g = GOODS.find(g => g.id === c.goodId); return g && g.legal; });
          this.cargoUsed = this.cargo.reduce((sum, c) => sum + c.qty, 0);
          this.factionRep.military = (this.factionRep.military || 0) - 5;
          results.push(`Контрабанда найдена! Штраф ${fine} кр, товар конфискован.`);
        } else {
          this.factionRep.military = (this.factionRep.military || 0) + 2;
          results.push('Проверка пройдена. Всё чисто. +2 реп. военных');
        }
        break;
      }
      case 'patrol_flee':
        if (this.getEffective('speed') >= 5) {
          this.factionRep.military = (this.factionRep.military || 0) - 3;
          results.push('Скорость спасла! Ушли от патруля. -3 реп. военных');
        } else {
          const fine = 300;
          this.credits = Math.max(0, this.credits - fine);
          this.factionRep.military = (this.factionRep.military || 0) - 8;
          results.push(`Не ушли. Штраф за попытку бегства: ${fine} кр, -8 реп.`);
        }
        break;
      case 'patrol_bribe':
        if (this.credits >= 300) {
          this.credits -= 300;
          if (Math.random() > 0.3) {
            results.push('Офицер кивнул. Досмотра не будет. -300 кр');
          } else {
            const fine = 500;
            this.credits = Math.max(0, this.credits - fine);
            this.factionRep.military = (this.factionRep.military || 0) - 10;
            results.push(`Честный попался! Штраф за взятку: ${fine} кр, -10 реп.`);
          }
        } else results.push('Нет денег на взятку. Патруль улетел.');
        break;
      case 'refugees_fuel':
        this.fuel = Math.max(0, this.fuel - 15);
        this.factionRep.traders = (this.factionRep.traders || 0) + 8;
        if (Math.random() > 0.5) {
          const reward = 130 + Math.floor(Math.random() * 195);
          this.credits += reward;
          results.push(`Беженцы благодарны! -15 топлива, +8 реп. Позже прислали ${reward} кр`);
        } else {
          results.push('-15 топлива, +8 реп. торговцев. Доброе дело.');
        }
        break;
      case 'refugees_food': {
        const food = this.cargo.find(c => c.goodId === 'food');
        if (food && food.qty >= 3) {
          food.qty -= 3;
          this.cargoUsed -= 3;
          if (food.qty <= 0) this.cargo = this.cargo.filter(c => c.qty > 0);
          this.factionRep.traders = (this.factionRep.traders || 0) + 12;
          results.push('-3 еды, +12 реп. "Спасибо! Дети будут сыты!"');
        } else {
          results.push('У вас нет еды для них. Они грустно кивнули.');
        }
        break;
      }
      case 'refugees_money':
        if (this.credits >= 200) {
          this.credits -= 200;
          this.factionRep.traders = (this.factionRep.traders || 0) + 5;
          results.push('-200 кр, +5 реп. Купят припасы на станции.');
        } else results.push('Нет денег.');
        break;
      case 'refugees_ignore':
        this.factionRep.traders = (this.factionRep.traders || 0) - 3;
        results.push('Пролетели мимо. На душе паршиво. -3 реп.');
        break;
      case 'race_accept':
        if (this.credits >= 500) {
          this.credits -= 500;
          if (this.getEffective('speed') >= 4 || Math.random() > 0.5) {
            this.credits += 650;
            results.push('ПОБЕДА! +650 кр (включая ставку)');
          } else {
            results.push('Проигрыш! Его корабль быстрее. -500 кр');
          }
        } else results.push('Нет денег на ставку!');
        break;
      case 'race_double':
        if (this.credits >= 1000) {
          this.credits -= 1000;
          if (this.getEffective('speed') >= 5) {
            this.credits += 1300;
            results.push('ПОБЕДА на высоких ставках! +1300 кр');
          } else if (this.getEffective('speed') >= 3 && Math.random() > 0.4) {
            this.credits += 1300;
            results.push('Еле-еле, но обошли! +1300 кр');
          } else {
            results.push('Проигрыш! Он улетел в закат с вашими 1000 кр.');
          }
        } else results.push('Нет 1000 кр на ставку!');
        break;
      case 'breakdown_repair':
        if (this.credits >= 300) {
          this.credits -= 300;
          results.push('Двигатель починен. -300 кр');
        } else {
          const dmg = 10 + Math.floor(Math.random() * 10);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Нет денег! Двигатель дымит. -${dmg} HP`);
        }
        break;
      case 'breakdown_risk':
        if (Math.random() > 0.4) {
          results.push('Повезло! Двигатель заработал сам.');
        } else {
          const dmg = 15 + Math.floor(Math.random() * 15);
          this.hp = Math.max(1, this.hp - dmg);
          if (Math.random() > 0.5) {
            const modName = this.damageRandomModule();
            if (modName) results.push(`Двигатель взорвался! -${dmg} HP, ${modName} повреждён!`);
            else results.push(`Двигатель заклинило! -${dmg} HP`);
          } else {
            results.push(`Двигатель заклинило! -${dmg} HP`);
          }
        }
        break;
      case 'breakdown_dump':
        if (this.cargo.length > 0) {
          const last = this.cargo[this.cargo.length - 1];
          const good = GOODS.find(g => g.id === last.goodId);
          const dropped = Math.min(last.qty, 3);
          last.qty -= dropped;
          this.cargoUsed -= dropped;
          if (last.qty <= 0) this.cargo = this.cargo.filter(c => c.qty > 0);
          results.push(`Сбросили ${dropped}x ${good?.icon || ''}${good?.name || '?'}. Двигатель полегчал.`);
        } else {
          results.push('Трюм пуст! Нечего сбрасывать.');
          const dmg = 10;
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`-${dmg} HP`);
        }
        break;
      case 'nebula_collect': {
        const fuelGain = 10 + Math.floor(Math.random() * 15);
        const maxF = this.ship.fuel + (this.bonuses.fuel || 0);
        this.fuel = Math.min(this.fuel + fuelGain, maxF);
        if (Math.random() > 0.6) {
          const dmg = 3 + Math.floor(Math.random() * 5);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Собрали +${fuelGain} топлива, но электростатика повредила корпус. -${dmg} HP`);
        } else {
          results.push(`Собрали газы из туманности! +${fuelGain} топлива`);
        }
        break;
      }
      case 'nebula_through':
        if (Math.random() > 0.5) {
          results.push('Прошли насквозь без проблем. Красиво было.');
        } else {
          const dmg = 5 + Math.floor(Math.random() * 8);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Навигация подвела! Столкновение с объектом в тумане. -${dmg} HP`);
        }
        break;
      case 'nebula_around':
        this.fuel = Math.max(0, this.fuel - 3);
        results.push('Безопасно обогнули. -3 топлива.');
        break;
      case 'station_explore':
        if (Math.random() > 0.3) {
          const loot = 130 + Math.floor(Math.random() * 390);
          this.credits += loot;
          results.push(`Нашли ценности на станции! +${loot} кр`);
          if (Math.random() > 0.6 && this.missiles < this.maxMissiles) {
            const m = Math.min(2, this.maxMissiles - this.missiles);
            this.missiles += m;
            results.push(`+${m} ракеты в арсенале`);
          }
        } else {
          const dmg = 5 + Math.floor(Math.random() * 10);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Ловушка! Обрушилась конструкция. -${dmg} HP`);
        }
        break;
      case 'station_dock':
        if (Math.random() > 0.4) {
          const fuelFound = 15 + Math.floor(Math.random() * 20);
          const maxF = this.ship.fuel + (this.bonuses.fuel || 0);
          this.fuel = Math.min(this.fuel + fuelFound, maxF);
          results.push(`Нашли запасы топлива в доке! +${fuelFound}`);
        } else {
          results.push('Док пуст. Всё давно разграблено.');
        }
        break;
      case 'signal_follow':
        if (Math.random() > 0.5) {
          const reward = 260 + Math.floor(Math.random() * 520);
          this.credits += reward;
          this.factionRep.scientists = (this.factionRep.scientists || 0) + 5;
          results.push(`Нашли тайник! +${reward} кр, +5 реп. учёных`);
        } else {
          this.fuel = Math.max(0, this.fuel - 10);
          results.push('Ложный след. Потрачено время и топливо. -10 топлива');
        }
        break;
      case 'signal_sell':
        this.credits += 130;
        this.factionRep.scientists = (this.factionRep.scientists || 0) + 3;
        results.push('Данные проданы учёным. +130 кр, +3 реп.');
        break;
      case 'meteor_catch':
        if (Math.random() > 0.3) {
          const cr = 100 + Math.floor(Math.random() * 400);
          this.credits += cr;
          results.push(`Поймали кусок руды! Продан за ${cr} кр`);
        } else {
          const dmg = 5 + Math.floor(Math.random() * 10);
          this.hp = Math.max(1, this.hp - dmg);
          results.push(`Метеорит попал в корпус! -${dmg} HP`);
        }
        break;
    }
    this.save();
    return results;
  }

  handleStoryChoice(questId, stageIdx, optionIdx) {
    const quest = STORY_QUESTS.find(q => q.id === questId);
    if (!quest) return { next: -1, results: ['Ошибка квеста'] };

    const stage = quest.stages[stageIdx];
    const option = stage.options[optionIdx];

    if (option.next === -1 && option.result) {
      const r = option.result;
      const texts = [r.text];
      if (r.credits) { this.credits += r.credits; texts.push(`+${r.credits} кр`); }
      if (r.reputation) {
        const sys = this.getSystem();
        const f = sys.faction || 'traders';
        this.factionRep[f] = (this.factionRep[f] || 0) + r.reputation;
        texts.push(`${r.reputation > 0 ? '+' : ''}${r.reputation} репутации`);
      }
      if (r.needCargo) {
        const c = this.cargo.find(x => x.goodId === r.needCargo.goodId && x.qty >= r.needCargo.qty);
        if (c) {
          c.qty -= r.needCargo.qty;
          this.cargoUsed -= r.needCargo.qty;
          if (c.qty <= 0) this.cargo = this.cargo.filter(x => x.qty > 0);
        } else {
          return { next: -1, results: ['Нет нужного груза!'] };
        }
      }
      this.storyQuestsCompleted.push(questId);
      this.save();
      return { next: -1, results: texts };
    }

    return { next: option.next, results: [] };
  }

  // ============ QUESTS ============
  generateQuests() {
    const quests = [];
    const targets = getGalaxySystems(this.galaxy).filter(s => s.id !== this.currentSystem);
    for (let i = 0; i < 3; i++) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const legalGoods = GOODS.filter(g => g.legal);
      const good = legalGoods[Math.floor(Math.random() * legalGoods.length)];
      const qty = 3 + Math.floor(Math.random() * 10);
      const reward = Math.round(good.basePrice * qty * (1.0 + Math.random() * 0.6));
      quests.push({
        id: Date.now() + i, type: 'delivery',
        title: `Доставка: ${target.name}`,
        desc: `${qty}x ${good.icon}${good.name} -> ${target.name}`,
        target: target.id, goodId: good.id, qty, reward, completed: false
      });
    }
    return quests;
  }

  checkQuests() {
    const completed = [];
    for (const q of this.quests) {
      if (q.completed) continue;
      if (q.target === this.currentSystem) {
        const c = this.cargo.find(x => x.goodId === q.goodId && x.qty >= q.qty);
        if (c) {
          c.qty -= q.qty;
          this.cargoUsed -= q.qty;
          if (c.qty <= 0) this.cargo = this.cargo.filter(x => x.qty > 0);
          this.credits += q.reward;
          q.completed = true;
          this.questsCompleted++;
          completed.push(q);
        }
      }
    }
    if (this.quests.filter(q => !q.completed).length === 0) this.quests = this.generateQuests();
    if (completed.length) this.save();
    return completed;
  }

  // ============ TEXT QUESTS ============
  getAvailableTextQuest() {
    const sys = this.getSystem();
    if (!this.textQuestsCompleted) this.textQuestsCompleted = [];
    if (!this.questFlags) this.questFlags = {};
    const available = ALL_TEXT_QUESTS.filter(q => {
      if (q.systemId) { if (q.systemId !== sys.id) return false; }
      else if (q.planetType !== sys.type) return false;
      if (q.galaxy && q.galaxy !== this.galaxy) return false;
      if (q.minDay && this.day < q.minDay) return false;
      if (q.oneTime && this.textQuestsCompleted.includes(q.id)) return false;
      if (q.requires) {
        for (const [key, val] of Object.entries(q.requires)) {
          if (this.questFlags[key] !== val) return false;
        }
      }
      if (q.excludeIf) {
        for (const [key, val] of Object.entries(q.excludeIf)) {
          if (this.questFlags[key] === val) return false;
        }
      }
      return true;
    });
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  setQuestFlag(key, value) {
    if (!this.questFlags) this.questFlags = {};
    this.questFlags[key] = value;
    this.save();
  }

  getQuestFlag(key) {
    if (!this.questFlags) this.questFlags = {};
    return this.questFlags[key];
  }

  // ============ TIMERS ============
  startTimer(id, days, data = {}) {
    if (!this.activeTimers) this.activeTimers = [];
    if (this.activeTimers.find(t => t.id === id)) return;
    this.activeTimers.push({
      id,
      startDay: this.day,
      deadlineDay: this.day + days,
      ...data,
    });
    this.save();
  }

  getTimer(id) {
    if (!this.activeTimers) this.activeTimers = [];
    return this.activeTimers.find(t => t.id === id);
  }

  removeTimer(id) {
    if (!this.activeTimers) this.activeTimers = [];
    this.activeTimers = this.activeTimers.filter(t => t.id !== id);
  }

  checkTimers() {
    if (!this.activeTimers) this.activeTimers = [];
    const expired = this.activeTimers.filter(t => this.day >= t.deadlineDay);
    return expired;
  }

  // ============ SAVE/LOAD ============
  switchGalaxy(targetGalaxy) {
    if (!targetGalaxy) {
      targetGalaxy = this.galaxy === 'milkyway' ? 'void' : 'milkyway';
    }
    const galaxyConfig = GALAXIES[this.galaxy];
    const gate = galaxyConfig.gates.find(g => g.target === targetGalaxy);
    if (!gate) return { success: false };
    this.galaxy = targetGalaxy;
    this.currentSystem = gate.targetSystem;
    if (!this.visited.includes(gate.targetSystem)) this.visited.push(gate.targetSystem);
    this.fuel = Math.max(0, this.fuel - 15);
    this.day++;
    const systems = getGalaxySystems(targetGalaxy);
    for (const sys of systems) {
      if (!this.prices[sys.id]) {
        this.prices[sys.id] = generatePrices(sys);
        this.priceHistory[sys.id] = generatePriceHistory(sys, 10);
        this.priceDay[sys.id] = this.day;
      }
    }
    this.save();
    return { success: true, galaxy: targetGalaxy, system: gate.targetSystem };
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this));
    } catch (e) { /* ignore */ }
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!data || !data.shipType) return false;
      const safeCopy = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof this[k] === 'function') continue;
        safeCopy[k] = v;
      }
      Object.assign(this, safeCopy);
      // Migrate old weapon (string) -> weapons (array)
      if (typeof this.weapon === 'string' && !Array.isArray(this.weapons)) {
        this.weapons = [this.weapon];
        delete this.weapon;
      }
      if (!Array.isArray(this.weapons)) this.weapons = ['laser'];
      // Migrate old modules (object) -> array format
      if (this.modules && !Array.isArray(this.modules)) {
        const oldMods = this.modules;
        this.modules = [];
        for (const [slot, modId] of Object.entries(oldMods)) {
          const mod = MODULES[modId];
          if (mod) this.modules.push({ slotType: mod.slotType || 'U', moduleId: modId });
        }
        this.damaged = {};
      }
      if (!Array.isArray(this.modules)) this.modules = [];
      if (!this.questFlags) this.questFlags = {};
      if (!this.activeTimers) this.activeTimers = [];
      if (!Array.isArray(this.cargo)) this.cargo = [];
      if (!this.factionRep) this.factionRep = {};
      if (!Array.isArray(this.storyQuestsCompleted)) this.storyQuestsCompleted = [];
      if (!Array.isArray(this.textQuestsCompleted)) this.textQuestsCompleted = [];
      // Ensure ship has slots
      const shipDef = SHIPS[this.shipType];
      if (shipDef) this.ship = { ...shipDef };
      this.recalcBonuses();
      return true;
    } catch (e) { return false; }
  }

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.newGame();
  }
}

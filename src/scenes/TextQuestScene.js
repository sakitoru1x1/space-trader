import { Scene } from '../engine/SceneManager.js';
import { GOODS } from '../data/galaxy.js';

export class TextQuestScene extends Scene {
  init(data) {
    super.init(data);
    this.quest = data.quest || null;
    this.currentNode = 'start';
    this._actionTaken = false;
  }

  create(container) {
    super.create(container);

    if (this.sfx) this.sfx.startMusic('quest');

    if (!this.quest || !this.quest.nodes) {
      this.startScene('Galaxy');
      return;
    }

    this.renderNode();
  }

  renderNode() {
    const gs = this.gameState;
    const quest = this.quest;
    const node = quest.nodes[this.currentNode];

    if (!node) {
      this.startScene('Galaxy');
      return;
    }

    this.container.innerHTML = '';
    this._actionTaken = false;

    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:16px';

    const title = this.el('div', 'event-title');
    title.textContent = quest.title || 'Текстовый квест';
    content.appendChild(title);

    if (node.img) {
      const img = this.el('img', 'event-img');
      img.src = node.img;
      img.alt = quest.title || '';
      content.appendChild(img);
    } else if (node.ascii) {
      const ascii = this.el('pre', 'ascii-art');
      ascii.textContent = node.ascii;
      content.appendChild(ascii);
    }

    const desc = this.el('div', 'event-desc');
    desc.textContent = node.text || '';
    desc.style.whiteSpace = 'pre-line';
    content.appendChild(desc);

    if (node.effect) this.applyEffect(node.effect, gs);

    if (node.ending && node.result) {
      const r = node.result;
      const hasReward = Object.keys(r).length > 0;
      if (r.credits) gs.credits += r.credits;
      if (r.damage) gs.hp = Math.max(1, gs.hp - r.damage);
      if (r.heal) gs.hp = Math.min(gs.ship.hp + (gs.bonuses.hp || 0), gs.hp + r.heal);
      if (r.reputation && typeof r.reputation === 'number') {
        if (!gs.factionRep.traders) gs.factionRep.traders = 0;
        gs.factionRep.traders += r.reputation;
      }
      if (r.factionRep) {
        for (const [fac, val] of Object.entries(r.factionRep)) {
          if (!gs.factionRep[fac]) gs.factionRep[fac] = 0;
          gs.factionRep[fac] += val;
        }
      }
      if (r.flags) {
        for (const [k, v] of Object.entries(r.flags)) gs.setQuestFlag(k, v);
      }
      if (r.teleport === 'random') {
        const systems = gs.visited.length > 1 ? gs.visited.filter(s => s !== gs.currentSystem) : [gs.currentSystem];
        gs.currentSystem = systems[Math.floor(Math.random() * systems.length)];
      }
      if (r.timer && gs.startTimer) {
        gs.startTimer(r.timer.id, r.timer.days, {
          name: r.timer.name,
          targetSystem: r.timer.targetSystem,
          onExpire: r.timer.onExpire,
        });
      }
      if (hasReward || node.forceComplete) {
        if (!gs.textQuestsCompleted) gs.textQuestsCompleted = [];
        if (!gs.textQuestsCompleted.includes(this.quest.id)) {
          gs.textQuestsCompleted.push(this.quest.id);
        }
      }
      gs.save();
    }

    if (node.ending && node.result && Object.keys(node.result).length > 0) {
      const rewards = this.el('div', '');
      rewards.style.cssText = 'margin:8px 0;padding:8px;border-radius:6px;background:rgba(20,20,50,0.6);text-align:center;font-size:12px';
      const lines = [];
      const r = node.result;
      if (r.credits > 0) lines.push(`<span style="color:#FFD700">+${r.credits}кр</span>`);
      if (r.credits < 0) lines.push(`<span style="color:#ff4444">${r.credits}кр</span>`);
      if (r.reputation > 0) lines.push(`<span style="color:#44aaff">+${r.reputation} реп.</span>`);
      if (r.reputation < 0) lines.push(`<span style="color:#ff4444">${r.reputation} реп.</span>`);
      if (r.damage) lines.push(`<span style="color:#ff4444">-${r.damage} HP</span>`);
      if (r.heal) lines.push(`<span style="color:#44ff44">+${r.heal} HP</span>`);
      if (r.factionRep) {
        for (const [fac, val] of Object.entries(r.factionRep)) {
          const color = val > 0 ? '#44aaff' : '#ff4444';
          lines.push(`<span style="color:${color}">${val > 0 ? '+' : ''}${val} ${fac}</span>`);
        }
      }
      if (lines.length > 0) {
        rewards.innerHTML = lines.join(' &nbsp; ');
        content.appendChild(rewards);
      }
    }

    const options = this.el('div', 'event-options');

    if (node.options && node.options.length > 0) {
      for (const opt of node.options) {
        let locked = false;
        if (opt.requires) {
          if (opt.requires.credits && gs.credits < opt.requires.credits) locked = true;
          if (opt.requires.flag && !gs.getQuestFlag(opt.requires.flag)) locked = true;
        }
        if (opt.cost && opt.cost.credits && gs.credits < opt.cost.credits) locked = true;
        const btn = this.el('button', 'event-option');
        btn.textContent = opt.text || 'Далее';
        if (locked) {
          btn.style.opacity = '0.4';
          btn.style.pointerEvents = 'none';
        } else {
          this.listen(btn, 'click', () => this.choose(opt, gs));
        }
        options.appendChild(btn);
      }
    } else {
      const btn = this.el('button', 'event-option');
      btn.textContent = 'Вернуться';
      this.listen(btn, 'click', () => this.startScene('Galaxy'));
      options.appendChild(btn);
    }

    content.appendChild(options);
    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  choose(opt, gs) {
    if (this._actionTaken) return;
    this._actionTaken = true;
    if (this.sfx) this.sfx.click();

    if (opt.check) {
      const passed = this.checkRequirement(opt.check, gs);
      if (!passed && opt.check.failNext) {
        this.currentNode = opt.check.failNext;
        this.renderNode();
        return;
      }
    }

    if (opt.cost) {
      if (opt.cost.credits) {
        gs.credits -= opt.cost.credits;
        if (gs.credits < 0) gs.credits = 0;
      }
      if (opt.cost.fuel) {
        gs.fuel -= opt.cost.fuel;
        if (gs.fuel < 0) gs.fuel = 0;
      }
      gs.save();
    }

    if (opt.effect) this.applyEffect(opt.effect, gs);

    if (opt.setFlag) {
      for (const [k, v] of Object.entries(opt.setFlag)) gs.setQuestFlag(k, v);
    }

    let target = opt.next;
    if (!target && opt.chances && opt.chances.length > 0) {
      const total = opt.chances.reduce((s, c) => s + (c.weight || 1), 0);
      let roll = Math.random() * total;
      for (const c of opt.chances) {
        roll -= (c.weight || 1);
        if (roll <= 0) { target = c.next; break; }
      }
      if (!target) target = opt.chances[opt.chances.length - 1].next;
    }

    if (target) {
      this.currentNode = target;
      this.renderNode();
    } else {
      this.startScene('Galaxy');
    }
  }

  checkRequirement(check, gs) {
    if (check.flag && check.stat !== 'flag') {
      return !!gs.getQuestFlag(check.flag) === !!(check.flagValue !== undefined ? check.flagValue : true);
    }

    if (!check.stat && check.reputation) {
      const rep = gs.factionRep[check.reputation] || 0;
      return rep >= (check.min || 0);
    }
    if (!check.stat && check.cargo) {
      const has = gs.cargo.find(c => c.goodId === check.cargo);
      return has && has.qty >= (check.min || 1);
    }
    if (!check.stat && check.mercenary !== undefined) {
      return !!gs.mercenary;
    }

    if (check.stat === 'credits') return gs.credits >= (check.min || 0);
    if (check.stat === 'fuel') return gs.fuel >= (check.min || 0);
    if (check.stat === 'scanner') return !!gs.bonuses.scanner;
    if (check.stat === 'reputation' && check.faction) {
      return (gs.factionRep[check.faction] || 0) >= (check.min || 0);
    }
    if (check.stat === 'cargo') {
      const goodId = check.goodId || check.has;
      const has = gs.cargo.find(c => c.goodId === goodId);
      if (check.min && !goodId) return gs.cargoUsed >= check.min;
      return has && has.qty >= (check.min || 1);
    }
    if (check.stat === 'flag') {
      return gs.getQuestFlag(check.key) === check.value;
    }
    if (check.stat === 'roll') {
      return Math.random() <= (check.chance || 0.5);
    }
    if (check.stat === 'attack') {
      const total = gs.ship.attack + (gs.bonuses.dmgBoost || 0);
      return total >= (check.min || 0);
    }
    if (check.stat === 'speed') {
      return gs.getEffective('speed') >= (check.min || 0);
    }
    if (check.stat === 'defense') {
      return gs.getEffective('defense') >= (check.min || 0);
    }
    if (check.stat === 'hp') {
      return gs.hp >= (check.min || 0);
    }
    if (check.stat === 'kills') {
      return (gs.kills || 0) >= (check.min || 0);
    }
    if (check.stat === 'weapon') {
      if (check.value) return gs.weapons && gs.weapons.includes(check.value);
      return gs.ship.attack >= (check.min || 0);
    }
    if (check.stat === 'mercenary') {
      return !!gs.mercenary;
    }
    if (check.stat === 'timer') {
      if (!check.timerId) return true;
      const timer = gs.getTimer ? gs.getTimer(check.timerId) : null;
      return !!timer && gs.day < timer.deadlineDay;
    }
    return true;
  }

  applyEffect(effect, gs) {
    if (effect.credits) gs.credits += effect.credits;
    if (effect.fuel) gs.fuel = Math.max(0, gs.fuel + effect.fuel);
    if (effect.damage) gs.hp = Math.max(1, gs.hp - effect.damage);
    if (effect.heal) gs.hp = Math.min(gs.ship.hp + (gs.bonuses.hp || 0), gs.hp + effect.heal);
    if (effect.reputation) {
      for (const [faction, val] of Object.entries(effect.reputation)) {
        if (!gs.factionRep[faction]) gs.factionRep[faction] = 0;
        gs.factionRep[faction] += val;
      }
    }
    if (effect.setFlag) {
      for (const [k, v] of Object.entries(effect.setFlag)) gs.setQuestFlag(k, v);
    }
    if (effect.cargo) {
      for (const [goodId, qty] of Object.entries(effect.cargo)) {
        const added = gs.addCargo(goodId, qty);
        if (added > 0) {
          const good = GOODS.find(g => g.id === goodId);
          if (good) this.toast(`+${added} ${good.icon}${good.name}`, 'positive');
        }
      }
    }
    if (effect.removeCargo) {
      for (const [goodId, qty] of Object.entries(effect.removeCargo)) {
        const existing = gs.cargo.find(c => c.goodId === goodId);
        if (existing) {
          const removed = Math.min(qty, existing.qty);
          existing.qty -= removed;
          gs.cargoUsed -= removed;
          if (existing.qty <= 0) gs.cargo = gs.cargo.filter(c => c.qty > 0);
        }
      }
    }
    gs.save();
  }
}

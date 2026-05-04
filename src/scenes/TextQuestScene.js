import { Scene } from '../engine/SceneManager.js';

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
      if (!gs.textQuestsCompleted) gs.textQuestsCompleted = [];
      if (!gs.textQuestsCompleted.includes(this.quest.id)) {
        gs.textQuestsCompleted.push(this.quest.id);
      }
      gs.save();
    }

    const options = this.el('div', 'event-options');

    if (node.options && node.options.length > 0) {
      for (const opt of node.options) {
        let locked = false;
        if (opt.requires) {
          if (opt.requires.credits && gs.credits < opt.requires.credits) locked = true;
          if (opt.requires.flag && !gs.getQuestFlag(opt.requires.flag)) locked = true;
        }
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

    if (opt.effect) this.applyEffect(opt.effect, gs);

    if (opt.setFlag) {
      for (const [k, v] of Object.entries(opt.setFlag)) gs.setQuestFlag(k, v);
    }

    if (opt.next) {
      const nextNode = this.quest.nodes[opt.next];
      if (nextNode && nextNode.text && nextNode.text.includes('КОНЕЦ')) {
        if (!gs.textQuestsCompleted) gs.textQuestsCompleted = [];
        if (!gs.textQuestsCompleted.includes(this.quest.id)) {
          gs.textQuestsCompleted.push(this.quest.id);
        }
      }
      this.currentNode = opt.next;
      this.renderNode();
    } else {
      this.startScene('Galaxy');
    }
  }

  checkRequirement(check, gs) {
    if (check.stat === 'credits' && gs.credits < (check.min || 0)) return false;
    if (check.stat === 'fuel' && gs.fuel < (check.min || 0)) return false;
    if (check.stat === 'scanner' && !gs.bonuses.scanner) return false;
    if (check.stat === 'reputation' && check.faction) {
      const rep = gs.factionRep[check.faction] || 0;
      if (rep < (check.min || 0)) return false;
    }
    if (check.stat === 'cargo') {
      const has = gs.cargo.find(c => c.goodId === check.goodId);
      if (!has || has.qty < (check.min || 1)) return false;
    }
    if (check.stat === 'flag') {
      if (gs.getQuestFlag(check.key) !== check.value) return false;
    }
    if (check.stat === 'roll') {
      if (Math.random() > (check.chance || 0.5)) return false;
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
    gs.save();
  }
}

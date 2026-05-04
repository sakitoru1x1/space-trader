import { Scene } from '../engine/SceneManager.js';

export class EventScene extends Scene {
  init(data) {
    super.init(data);
    this.encounter = data.encounter || {};
    this._actionTaken = false;
  }

  create(container) {
    super.create(container);
    const gs = this.gameState;

    if (this.sfx) {
      this.sfx.startMusic('quest');
    }

    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    if (this.encounter.type === 'story' && this.encounter.quest) {
      this.renderStory(content, gs);
    } else {
      this.renderEvent(content, gs);
    }

    scene.appendChild(content);
    container.appendChild(scene);
  }

  renderEvent(content, gs) {
    const enc = this.encounter;

    if (enc.img) {
      const img = this.el('img', 'event-img');
      img.src = enc.img;
      img.alt = enc.title || '';
      content.appendChild(img);
    } else if (enc.ascii) {
      const art = this.el('pre', 'ascii-art');
      art.textContent = enc.ascii;
      content.appendChild(art);
    }

    const title = this.el('div', 'event-title');
    title.textContent = enc.title || 'Событие';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.textContent = enc.text || enc.description || '';
    content.appendChild(desc);

    const options = this.el('div', 'event-options');
    const choices = enc.options || [];

    if (choices.length === 0) {
      choices.push({ text: 'Продолжить', action: 'continue' });
    }

    for (const opt of choices) {
      const btn = this.el('button', 'event-option');
      btn.textContent = opt.text || opt.label || 'Выбрать';
      this.listen(btn, 'click', () => this.chooseEvent(opt, gs));
      options.appendChild(btn);
    }

    content.appendChild(options);
  }

  renderStory(content, gs) {
    const quest = this.encounter.quest || this.encounter.storyQuest;
    const stage = quest.stages ? quest.stages[quest.currentStage || 0] : null;

    if (!stage) {
      this.startScene('Galaxy');
      return;
    }

    const stageImg = stage.img || (quest.currentStage === 0 ? quest.img : null);
    if (stageImg) {
      const img = this.el('img', 'event-img');
      img.src = stageImg;
      img.alt = quest.title || '';
      content.appendChild(img);
    } else {
      const ascii = stage.ascii || (quest.currentStage === 0 ? quest.ascii : null);
      if (ascii) {
        const art = this.el('pre', 'ascii-art');
        art.textContent = ascii;
        content.appendChild(art);
      }
    }

    if (quest.currentStage === 0 && quest.intro) {
      const intro = this.el('div', 'text-center text-small text-gray mb-12');
      intro.textContent = quest.intro;
      content.appendChild(intro);
    }

    const title = this.el('div', 'event-title');
    title.textContent = quest.title || 'Квест';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.textContent = stage.text || '';
    content.appendChild(desc);

    const options = this.el('div', 'event-options');
    for (let i = 0; i < (stage.options || []).length; i++) {
      const opt = stage.options[i];
      const btn = this.el('button', 'event-option');
      btn.textContent = opt.text || 'Выбрать';
      this.listen(btn, 'click', () => this.chooseStory(quest, i, gs));
      options.appendChild(btn);
    }
    content.appendChild(options);
  }

  chooseEvent(option, gs) {
    if (this._actionTaken) return;
    this._actionTaken = true;

    if (this.sfx) this.sfx.click();

    const result = gs.handleEventAction(option.action || 'continue');
    if (result && ((Array.isArray(result) && result.length > 0) || (!Array.isArray(result) && result))) {
      this.showResult(result);
    } else {
      this.startScene('Galaxy');
    }
  }

  chooseStory(quest, optionIdx, gs) {
    if (this._actionTaken) return;
    this._actionTaken = true;

    if (this.sfx) this.sfx.click();

    const stageIdx = quest.currentStage || 0;
    const result = gs.handleStoryChoice(quest.id, stageIdx, optionIdx);

    if (result && result.next !== undefined && result.next >= 0) {
      quest.currentStage = result.next;
      this._actionTaken = false;
      this.container.innerHTML = '';
      const scene = this.el('div', 'scene');
      const content = this.el('div', 'content');
      content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';
      this.renderStory(content, gs);
      scene.appendChild(content);
      this.container.appendChild(scene);
    } else if (result && result.results && result.results.length > 0) {
      this.showResult(result.results);
    } else if (result) {
      this.showResult(result);
    } else {
      this.startScene('Galaxy');
    }
  }

  showResult(result) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Результат';
    content.appendChild(title);

    let lines = [];
    if (Array.isArray(result)) {
      lines = result;
    } else {
      if (result.credits) lines.push(`${result.credits > 0 ? '+' : ''}${result.credits} кр`);
      if (result.fuel) lines.push(`${result.fuel > 0 ? '+' : ''}${result.fuel} топлива`);
      if (result.damage) lines.push(`-${result.damage} HP`);
      if (result.reputation) lines.push(`Репутация: ${result.reputation > 0 ? '+' : ''}${result.reputation}`);
      if (result.message) lines.push(result.message);
    }

    const desc = this.el('div', 'event-desc');
    desc.textContent = lines.join('\n') || 'Продолжаем путь.';
    desc.style.whiteSpace = 'pre-line';
    content.appendChild(desc);

    const btn = this.btn('Продолжить', () => this.startScene('Galaxy'), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }
}

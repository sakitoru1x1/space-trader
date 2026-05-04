import { Scene } from '../engine/SceneManager.js';
import { GOODS } from '../data/galaxy.js';

export class InterrogationScene extends Scene {
  init(data) {
    super.init(data);
    this._actionTaken = false;
    this.suspicion = data.suspicion || 50;
    this.stress = 0;
    this.maxStress = 100;
    this.round = 0;
    this.maxRounds = 5;
    this.phase = 'play';
    this.stressDecay = 0;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');
    this.askQuestion();
  }

  getQuestions() {
    return [
      { text: 'Откуда летите?', safe: 'Из торгового хаба', risky: 'Не ваше дело' },
      { text: 'Что в трюме?', safe: 'Стандартный груз', risky: 'Личные вещи' },
      { text: 'Цель визита?', safe: 'Торговля', risky: 'Проездом' },
      { text: 'Есть что задекларировать?', safe: 'Всё по документам', risky: 'Нет, ничего' },
      { text: 'Почему нервничаете?', safe: 'Всё в порядке, офицер', risky: 'Я не нервничаю!' },
      { text: 'Открыть трюм для досмотра?', safe: 'Конечно, пожалуйста', risky: 'У вас есть ордер?' },
      { text: 'Ваши документы актуальны?', safe: 'Обновил на станции', risky: 'Должны быть...' },
    ];
  }

  askQuestion() {
    if (this.round >= this.maxRounds || this.phase !== 'play') {
      this.endGame(true);
      return;
    }

    this.round++;
    const questions = this.getQuestions();
    const q = questions[Math.floor(Math.random() * questions.length)];

    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Допрос';
    content.appendChild(title);

    const roundInfo = this.el('div', 'text-center text-small text-gray mb-8');
    roundInfo.textContent = `Вопрос ${this.round}/${this.maxRounds}`;
    content.appendChild(roundInfo);

    const stressWrap = this.el('div', '');
    stressWrap.style.cssText = 'width:250px;margin:8px 0';
    const stressLabel = this.el('div', 'text-center text-small');
    stressLabel.style.color = this.stress > 70 ? '#ff4444' : this.stress > 40 ? '#ffaa00' : '#44ff44';
    stressLabel.textContent = `Подозрительность: ${Math.round(this.stress)}%`;
    stressWrap.appendChild(stressLabel);
    const track = this.el('div', '');
    track.style.cssText = 'height:8px;background:#1a1a3e;border-radius:4px;overflow:hidden';
    const fill = this.el('div', '');
    fill.style.cssText = `height:100%;width:${this.stress}%;border-radius:4px;transition:width 0.3s;background:${this.stress > 70 ? '#ff4444' : this.stress > 40 ? '#ffaa00' : '#44ff44'}`;
    track.appendChild(fill);
    stressWrap.appendChild(track);
    content.appendChild(stressWrap);

    const qText = this.el('div', 'text-center');
    qText.style.cssText = 'font-size:16px;color:#fff;margin:16px 0;font-style:italic';
    qText.textContent = `"${q.text}"`;
    content.appendChild(qText);

    const options = this.el('div', 'event-options');

    const safeBtn = this.el('button', 'event-option');
    safeBtn.textContent = q.safe;
    safeBtn.style.color = '#44ff44';
    this.listen(safeBtn, 'click', () => this.answer('safe'));
    options.appendChild(safeBtn);

    const riskyBtn = this.el('button', 'event-option');
    riskyBtn.textContent = q.risky;
    riskyBtn.style.color = '#ff8844';
    this.listen(riskyBtn, 'click', () => this.answer('risky'));
    options.appendChild(riskyBtn);

    content.appendChild(options);

    const fleeBtn = this.btn('Сбежать', () => this.flee(), 'btn btn-wide');
    fleeBtn.style.marginTop = '12px';
    content.appendChild(fleeBtn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  answer(type) {
    if (this._actionTaken) return;
    if (this.sfx) this.sfx.click();

    if (type === 'safe') {
      this.stress = Math.max(0, this.stress - 5 + Math.random() * 8);
    } else {
      this.stress += 15 + Math.random() * 15;
    }

    if (this.stress >= this.maxStress) {
      this.phase = 'caught';
      this.endGame(false);
      return;
    }

    this._actionTaken = false;
    this.askQuestion();
  }

  flee() {
    if (this._actionTaken) return;
    this._actionTaken = true;
    if (this.sfx) this.sfx.click();

    const gs = this.gameState;
    const speed = gs.ship.speed + (gs.bonuses.speed || 0);
    if (Math.random() < 0.3 + speed * 0.05) {
      this.showResult('Удалось оторваться от патруля!', true);
    } else {
      const dmg = Math.floor(Math.random() * 15) + 10;
      gs.hp = Math.max(1, gs.hp - dmg);
      gs.save();
      this.showResult(`Патруль открыл огонь! -${dmg} HP`, false);
    }
  }

  endGame(passed) {
    const gs = this.gameState;
    if (!passed) {
      const hasContraband = gs.cargo.some(c => {
        const good = GOODS.find(g => g.id === c.goodId);
        return good && !good.legal;
      });
      if (hasContraband) {
        const fine = 200;
        gs.credits = Math.max(0, gs.credits - fine);
        gs.cargo = gs.cargo.filter(c => {
          const good = GOODS.find(g => g.id === c.goodId);
          return good && good.legal;
        });
        gs.cargoUsed = gs.cargo.reduce((s, c) => s + c.qty, 0);
        gs.save();
        this.showResult(`Допрос провален! Контрабанда найдена. Штраф ${fine}кр.`, false);
      } else {
        gs.save();
        this.showResult('Допрос провален, но нелегального груза нет. Отпустили с предупреждением.', true);
      }
    } else {
      this.showResult('Допрос пройден. Офицер отпустил вас.', true);
    }
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Пронесло' : 'Проблемы';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.style.color = positive ? '#44ff44' : '#ff4444';
    desc.textContent = message;
    content.appendChild(desc);

    const btn = this.btn('Продолжить', () => this.startScene('Galaxy'), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }
}

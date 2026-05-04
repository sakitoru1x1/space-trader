import { Scene } from '../engine/SceneManager.js';

const SYMBOLS = '⊕⊗⊘⊙⊚⊛⊜⊝△▽◇◆●○□■';

export class DecipherScene extends Scene {
  init(data) {
    super.init(data);
    this.codeLength = 4;
    this.code = [];
    this.symbolSet = SYMBOLS.split('').slice(0, 6);
    for (let i = 0; i < this.codeLength; i++) {
      this.code.push(this.symbolSet[Math.floor(Math.random() * this.symbolSet.length)]);
    }
    this.guesses = [];
    this.maxGuesses = 6;
    this.currentGuess = [];
    this.phase = 'play';
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:16px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Дешифровка';
    content.appendChild(title);

    if (this.phase === 'play') {
      const info = this.el('div', 'text-center text-small text-gray mb-8');
      info.textContent = `Попытка ${this.guesses.length + 1}/${this.maxGuesses} | Код: ${this.codeLength} символов`;
      content.appendChild(info);

      for (const guess of this.guesses) {
        const row = this.el('div', '');
        row.style.cssText = 'display:flex;gap:4px;margin:4px 0;align-items:center';
        for (let i = 0; i < this.codeLength; i++) {
          const cell = this.el('div', '');
          const bg = guess.result[i] === 'exact' ? '#44ff44' : guess.result[i] === 'partial' ? '#ffcc44' : '#334';
          cell.style.cssText = `width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:${bg};font-size:18px`;
          cell.textContent = guess.symbols[i];
          row.appendChild(cell);
        }
        const summary = this.el('span', '');
        summary.style.cssText = 'margin-left:8px;font-size:11px;color:#888';
        const exact = guess.result.filter(r => r === 'exact').length;
        const partial = guess.result.filter(r => r === 'partial').length;
        summary.textContent = `${exact}✓ ${partial}~`;
        row.appendChild(summary);
        content.appendChild(row);
      }

      const currentRow = this.el('div', '');
      currentRow.style.cssText = 'display:flex;gap:4px;margin:12px 0';
      for (let i = 0; i < this.codeLength; i++) {
        const cell = this.el('div', '');
        cell.style.cssText = `width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:2px solid ${i < this.currentGuess.length ? '#FFD700' : '#334'};background:rgba(20,20,50,0.8);font-size:20px`;
        cell.textContent = i < this.currentGuess.length ? this.currentGuess[i] : '';
        content.appendChild(cell);
        currentRow.appendChild(cell);
      }
      content.appendChild(currentRow);

      const symbolBtns = this.el('div', '');
      symbolBtns.style.cssText = 'display:flex;gap:6px;margin:8px 0;flex-wrap:wrap;justify-content:center';
      for (const sym of this.symbolSet) {
        const btn = this.el('button', '');
        btn.style.cssText = 'width:40px;height:40px;font-size:20px;background:rgba(20,20,50,0.8);border:1px solid #334;border-radius:6px;cursor:pointer';
        btn.textContent = sym;
        this.listen(btn, 'click', () => this.addSymbol(sym));
        symbolBtns.appendChild(btn);
      }
      content.appendChild(symbolBtns);

      const actionBtns = this.el('div', '');
      actionBtns.style.cssText = 'display:flex;gap:8px;margin-top:8px';
      if (this.currentGuess.length > 0) {
        const undoBtn = this.btn('←', () => { this.currentGuess.pop(); this.render(); }, 'btn btn-small');
        actionBtns.appendChild(undoBtn);
      }
      if (this.currentGuess.length === this.codeLength) {
        const submitBtn = this.btn('Проверить', () => this.submitGuess(), 'btn btn-small btn-green');
        actionBtns.appendChild(submitBtn);
      }
      content.appendChild(actionBtns);
    } else {
      this.renderResult(content);
    }

    const back = this.btn('Улететь', () => this.startScene('Galaxy'), 'btn btn-wide');
    back.style.marginTop = '12px';
    content.appendChild(back);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  addSymbol(sym) {
    if (this.currentGuess.length >= this.codeLength) return;
    if (this.sfx) this.sfx.click();
    this.currentGuess.push(sym);
    this.render();
  }

  submitGuess() {
    if (this.sfx) this.sfx.click();
    const result = [];
    const codeCopy = [...this.code];
    const guessCopy = [...this.currentGuess];

    for (let i = 0; i < this.codeLength; i++) {
      if (guessCopy[i] === codeCopy[i]) {
        result[i] = 'exact';
        codeCopy[i] = null;
        guessCopy[i] = null;
      }
    }
    for (let i = 0; i < this.codeLength; i++) {
      if (guessCopy[i] === null) { if (!result[i]) result[i] = 'wrong'; continue; }
      const idx = codeCopy.indexOf(guessCopy[i]);
      if (idx >= 0) {
        result[i] = 'partial';
        codeCopy[idx] = null;
      } else {
        result[i] = 'wrong';
      }
    }

    this.guesses.push({ symbols: [...this.currentGuess], result });
    this.currentGuess = [];

    if (result.every(r => r === 'exact')) {
      this.phase = 'won';
    } else if (this.guesses.length >= this.maxGuesses) {
      this.phase = 'lost';
    }
    this.render();
  }

  renderResult(content) {
    const won = this.phase === 'won';
    const gs = this.gameState;

    const msg = this.el('div', 'event-title');
    msg.textContent = won ? 'Код взломан!' : 'Не удалось';
    msg.style.color = won ? '#44ff44' : '#ff4444';
    content.appendChild(msg);

    if (won) {
      const reward = 100 + (this.maxGuesses - this.guesses.length) * 50;
      gs.credits += reward;
      gs.save();
      const info = this.el('div', 'text-center text-green');
      info.textContent = `+${reward}кр`;
      content.appendChild(info);
    } else {
      const codeStr = this.code.join(' ');
      const info = this.el('div', 'text-center text-gray');
      info.textContent = `Код был: ${codeStr}`;
      content.appendChild(info);
    }
  }
}

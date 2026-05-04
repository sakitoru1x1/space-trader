import { Scene } from '../engine/SceneManager.js';

export class HackingScene extends Scene {
  init(data) {
    super.init(data);
    this.difficulty = data.difficulty || 2;
    this.reward = data.reward || { credits: 200 };
    this.gridSize = 4 + this.difficulty;
    this.sequence = [];
    this.playerSeq = [];
    this.phase = 'show';
    this.round = 0;
    this.maxRounds = 3;
    this.seqLength = 3 + this.difficulty;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');
    this.generateSequence();
    this.showSequence();
  }

  generateSequence() {
    this.sequence = [];
    for (let i = 0; i < this.seqLength; i++) {
      this.sequence.push(Math.floor(Math.random() * (this.gridSize * this.gridSize)));
    }
  }

  showSequence() {
    this.phase = 'show';
    this.render();
    let idx = 0;
    const highlight = () => {
      if (idx >= this.sequence.length) {
        this.delayed(500, () => {
          this.phase = 'input';
          this.playerSeq = [];
          this.render();
        });
        return;
      }
      const cells = this.container.querySelectorAll('.hack-cell');
      const cell = cells[this.sequence[idx]];
      if (cell) {
        cell.style.background = '#44ff44';
        cell.style.boxShadow = '0 0 10px #44ff44';
        this.delayed(400, () => {
          cell.style.background = 'rgba(20,20,50,0.8)';
          cell.style.boxShadow = 'none';
          idx++;
          this.delayed(200, highlight);
        });
      }
    };
    this.delayed(600, highlight);
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px';

    const title = this.el('div', 'event-title');
    title.textContent = `Взлом [${this.round + 1}/${this.maxRounds}]`;
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = this.phase === 'show' ? 'Запомните последовательность...' : `Повторите: ${this.playerSeq.length}/${this.sequence.length}`;
    content.appendChild(info);

    const grid = this.el('div', '');
    const cellSize = Math.min(48, Math.floor((window.innerWidth - 60) / this.gridSize));
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${this.gridSize},${cellSize}px);gap:4px;margin:12px 0`;

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const cell = this.el('div', 'hack-cell');
      cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;background:rgba(20,20,50,0.8);border:1px solid #223;border-radius:4px;cursor:${this.phase === 'input' ? 'pointer' : 'default'};transition:background 0.2s`;
      if (this.phase === 'input') {
        this.listen(cell, 'click', () => this.tapCell(i));
      }
      grid.appendChild(cell);
    }
    content.appendChild(grid);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  tapCell(idx) {
    if (this.phase !== 'input') return;
    if (this.sfx) this.sfx.click();

    const expected = this.sequence[this.playerSeq.length];
    this.playerSeq.push(idx);

    const cells = this.container.querySelectorAll('.hack-cell');
    if (idx === expected) {
      cells[idx].style.background = '#44ff44';
      this.delayed(300, () => { cells[idx].style.background = 'rgba(20,20,50,0.8)'; });

      if (this.playerSeq.length === this.sequence.length) {
        this.round++;
        if (this.round >= this.maxRounds) {
          this.succeed();
        } else {
          this.seqLength++;
          this.generateSequence();
          this.delayed(600, () => this.showSequence());
        }
      }
    } else {
      cells[idx].style.background = '#ff4444';
      this.fail();
    }
  }

  succeed() {
    const gs = this.gameState;
    if (this.reward.credits) gs.credits += this.reward.credits;
    if (this.reward.fuel) gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + this.reward.fuel);
    gs.save();
    this.showResult(true);
  }

  fail() {
    this.showResult(false);
  }

  showResult(success) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = success ? 'Взлом успешен!' : 'Обнаружены!';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.style.color = success ? '#44ff44' : '#ff4444';
    if (success && this.reward.credits) desc.textContent = `+${this.reward.credits}кр`;
    else if (!success) desc.textContent = 'Система заблокирована.';
    content.appendChild(desc);

    const btn = this.btn('Продолжить', () => this.startScene('Galaxy'), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }
}

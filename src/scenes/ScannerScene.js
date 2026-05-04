import { Scene } from '../engine/SceneManager.js';

export class ScannerScene extends Scene {
  init(data) {
    super.init(data);
    this.scans = 3;
    this.found = [];
    this.gridSize = 6;
    this.grid = [];
    this.revealed = new Set();
    for (let i = 0; i < this.gridSize * this.gridSize; i++) this.grid.push(null);
    const treasureCount = 2 + Math.floor(Math.random() * 3);
    const positions = [];
    while (positions.length < treasureCount) {
      const p = Math.floor(Math.random() * this.gridSize * this.gridSize);
      if (!positions.includes(p)) positions.push(p);
    }
    const treasures = [
      { name: 'Минерал', credits: 50 },
      { name: 'Топливо', fuel: 8 },
      { name: 'Артефакт', credits: 150 },
      { name: 'Кристалл', credits: 80 },
    ];
    for (const p of positions) {
      this.grid[p] = treasures[Math.floor(Math.random() * treasures.length)];
    }
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('space');
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Сканер аномалий';
    content.appendChild(title);

    if (this.scans === 3 && this.found.length === 0) {
      const hint = this.el('div', 'text-center text-small text-gray mb-8');
      hint.textContent = 'Жми на клетки чтобы сканировать область 3x3. Найди спрятанные ресурсы за 3 попытки!';
      content.appendChild(hint);
    }
    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = `Сканирований: ${this.scans} | Найдено: ${this.found.length}`;
    content.appendChild(info);

    const cellSize = Math.min(44, Math.floor((window.innerWidth - 60) / this.gridSize));
    const grid = this.el('div', '');
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${this.gridSize},${cellSize}px);gap:3px;margin:12px 0`;

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const cell = this.el('div', '');
      const isRevealed = this.revealed.has(i);
      const treasure = this.grid[i];

      if (isRevealed && treasure) {
        cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;background:rgba(68,255,68,0.2);border:1px solid #44ff44;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#44ff44`;
        cell.textContent = treasure.name.substring(0, 3);
      } else if (isRevealed) {
        cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;background:rgba(40,40,80,0.3);border:1px solid #222;border-radius:4px`;
      } else {
        cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;background:rgba(20,20,50,0.8);border:1px solid #334;border-radius:4px;cursor:pointer`;
        this.listen(cell, 'click', () => this.scan(i));
      }
      grid.appendChild(cell);
    }
    content.appendChild(grid);

    if (this.scans <= 0) {
      const done = this.btn('Собрать и улететь', () => this.collect(), 'btn btn-wide btn-green');
      done.style.marginTop = '12px';
      content.appendChild(done);
    }

    const leaveBtn = this.btn('Улететь', () => this.collect(), 'btn btn-wide');
    leaveBtn.style.marginTop = '8px';
    content.appendChild(leaveBtn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  scan(idx) {
    if (this.scans <= 0 || this.revealed.has(idx)) return;
    if (this.sfx) this.sfx.click();
    this.scans--;

    this.revealed.add(idx);
    const row = Math.floor(idx / this.gridSize);
    const col = idx % this.gridSize;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
          this.revealed.add(nr * this.gridSize + nc);
        }
      }
    }

    for (const ri of this.revealed) {
      if (this.grid[ri] && !this.found.includes(ri)) {
        this.found.push(ri);
      }
    }

    this.render();
  }

  collect() {
    const gs = this.gameState;
    let totalCredits = 0;
    let totalFuel = 0;
    for (const idx of this.found) {
      const t = this.grid[idx];
      if (t.credits) totalCredits += t.credits;
      if (t.fuel) totalFuel += t.fuel;
    }
    if (totalCredits) gs.credits += totalCredits;
    if (totalFuel) gs.fuel = Math.min(gs.ship.fuel + (gs.bonuses.fuel || 0), gs.fuel + totalFuel);
    gs.save();
    this.startScene('Galaxy');
  }
}

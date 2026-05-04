import { Scene } from '../engine/SceneManager.js';

export class ContrabandScene extends Scene {
  init(data) {
    super.init(data);
    this.round = 0;
    this.maxRounds = 5;
    this.successes = 0;
    this.phase = 'play';
    this.containerCount = 5;
    this.contrabandPos = -1;
    this.scanPos = -1;
    this.scanning = false;
  }

  create(container) {
    super.create(container);
    if (this.sfx) this.sfx.startMusic('quest');

    const gs = this.gameState;
    const sys = gs.getSystem();
    this.isMilitary = sys.type === 'military';
    this.reward = this.isMilitary ? 500 : 200;
    this.scanSpeed = this.isMilitary ? 800 : 1200;

    this.startRound();
  }

  startRound() {
    if (this.round >= this.maxRounds) {
      this.endGame();
      return;
    }

    this.round++;
    this.contrabandPos = Math.floor(Math.random() * this.containerCount);
    this.scanPos = -1;
    this.scanning = false;
    this.hidden = false;

    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Контрабанда';
    content.appendChild(title);

    const info = this.el('div', 'text-center text-small text-gray mb-8');
    info.textContent = `Раунд ${this.round}/${this.maxRounds} | Спрятано: ${this.successes}`;
    content.appendChild(info);

    const desc = this.el('div', 'text-center text-small text-cyan mb-12');
    desc.textContent = 'Нажми на контейнер с контрабандой чтобы спрятать!';
    content.appendChild(desc);

    const grid = this.el('div', '');
    grid.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:16px 0';
    this.boxes = [];

    for (let i = 0; i < this.containerCount; i++) {
      const box = this.el('div', '');
      const hasContraband = i === this.contrabandPos;
      box.style.cssText = `width:56px;height:56px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;border:2px solid #334;background:rgba(20,20,50,0.9);transition:all 0.2s`;
      box.textContent = hasContraband ? '💎' : '📦';
      box.dataset.idx = i;
      this.listen(box, 'click', () => this.tapBox(i));
      grid.appendChild(box);
      this.boxes.push(box);
    }
    content.appendChild(grid);

    this.scanBar = this.el('div', '');
    this.scanBar.style.cssText = 'width:100%;max-width:320px;height:6px;background:#1a1a3e;border-radius:3px;margin:12px 0;overflow:hidden';
    const fill = this.el('div', '');
    fill.style.cssText = 'width:0%;height:100%;background:#ff4444;border-radius:3px;transition:width linear';
    this.scanBar.appendChild(fill);
    this.scanFill = fill;
    content.appendChild(this.scanBar);

    const scanLabel = this.el('div', 'text-center text-small text-red');
    scanLabel.textContent = 'Сканер приближается...';
    content.appendChild(scanLabel);

    scene.appendChild(content);
    this.container.appendChild(scene);

    this.delayed(500, () => this.startScan());
  }

  startScan() {
    this.scanning = true;
    this.scanFill.style.transition = `width ${this.scanSpeed}ms linear`;
    this.scanFill.style.width = '100%';

    this.delayed(this.scanSpeed, () => {
      if (this.hidden) return;
      this.phase = 'caught';
      this.endGame();
    });
  }

  tapBox(idx) {
    if (!this.scanning || this.hidden) return;
    if (this.sfx) this.sfx.click();

    if (idx === this.contrabandPos) {
      this.hidden = true;
      this.successes++;
      this.boxes[idx].style.background = '#224422';
      this.boxes[idx].style.borderColor = '#44ff44';
      this.boxes[idx].textContent = '📦';

      this.delayed(400, () => this.startRound());
    } else {
      this.boxes[idx].style.background = '#442222';
      this.boxes[idx].style.borderColor = '#ff4444';
      this.delayed(200, () => {
        this.boxes[idx].style.background = 'rgba(20,20,50,0.9)';
        this.boxes[idx].style.borderColor = '#334';
      });
    }
  }

  endGame() {
    const gs = this.gameState;
    const caught = this.phase === 'caught';

    if (caught) {
      const fine = Math.floor(this.reward * 0.8);
      gs.credits = Math.max(0, gs.credits - fine);
      const sys = gs.getSystem();
      if (gs.factionRep[sys.faction]) gs.factionRep[sys.faction] -= 5;
      gs.save();
      this.showResult(`Сканер нашёл контрабанду! Штраф ${fine}кр, реп. -5`, false);
    } else {
      const earned = Math.floor(this.reward * this.successes / this.maxRounds);
      gs.credits += earned;
      gs.save();
      this.showResult(`Спрятано ${this.successes}/${this.maxRounds}! +${earned}кр`, this.successes > 0);
    }
  }

  showResult(message, positive) {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = positive ? 'Успех' : 'Провал';
    content.appendChild(title);

    const desc = this.el('div', 'event-desc');
    desc.style.color = positive ? '#44ff44' : '#ff4444';
    desc.textContent = message;
    content.appendChild(desc);

    const btn = this.btn('Продолжить', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);

    scene.appendChild(content);
    this.container.appendChild(scene);
  }
}

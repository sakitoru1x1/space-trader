import { Scene } from '../engine/SceneManager.js';

export class InfiltrationScene extends Scene {
  init(data) {
    super.init(data);
    this.difficulty = data.difficulty || 2;
    this.reward = data.reward || { credits: 400 };
    this.alertLevel = 0;
    this.maxAlert = 100;
    this.rooms = this.generateRooms();
    this.currentRoom = 0;
    this.phase = 'play';
  }

  generateRooms() {
    const types = ['Коридор', 'Серверная', 'Охрана', 'Хранилище', 'Выход'];
    return types.map((name, i) => ({
      name,
      guardChance: 0.2 + i * 0.1 * this.difficulty,
      loot: i === 3 ? this.reward.credits || 400 : 0,
    }));
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
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = 'Проникновение';
    content.appendChild(title);

    if (this.phase === 'play' && this.currentRoom === 0 && this.alertLevel === 0) {
      const hint = this.el('div', 'text-center text-small text-gray mb-8');
      hint.textContent = 'Пробирайся через комнаты. Красться тихо, взлом средне, штурм шумно. Тревога 100% = провал!';
      content.appendChild(hint);
    }

    if (this.phase === 'play') {
      const alertBar = this.el('div', '');
      alertBar.style.cssText = 'width:200px;margin:8px auto';
      const alertColor = this.alertLevel > 70 ? '#ff4444' : this.alertLevel > 40 ? '#ffaa00' : '#44ff44';
      alertBar.innerHTML = `
        <div style="font-size:11px;color:${alertColor};text-align:center">Тревога: ${this.alertLevel}%</div>
        <div style="height:6px;background:#1a1a3e;border-radius:3px"><div style="height:100%;width:${this.alertLevel}%;background:${alertColor};border-radius:3px;transition:width 0.3s"></div></div>
      `;
      content.appendChild(alertBar);

      const room = this.rooms[this.currentRoom];
      const roomInfo = this.el('div', 'text-center');
      roomInfo.style.cssText = 'color:#44aaff;font-size:14px;margin:12px 0';
      roomInfo.textContent = `${this.currentRoom + 1}/${this.rooms.length}: ${room.name}`;
      content.appendChild(roomInfo);

      const options = this.el('div', 'event-options');

      const sneakBtn = this.el('button', 'event-option');
      sneakBtn.textContent = 'Прокрасться';
      this.listen(sneakBtn, 'click', () => this.action('sneak'));
      options.appendChild(sneakBtn);

      const hackBtn = this.el('button', 'event-option');
      hackBtn.textContent = 'Взломать замок';
      this.listen(hackBtn, 'click', () => this.action('hack'));
      options.appendChild(hackBtn);

      const rushBtn = this.el('button', 'event-option');
      rushBtn.textContent = 'Пробежать';
      this.listen(rushBtn, 'click', () => this.action('rush'));
      options.appendChild(rushBtn);

      const abortBtn = this.el('button', 'event-option');
      abortBtn.textContent = 'Отступить';
      abortBtn.style.color = '#ff4444';
      this.listen(abortBtn, 'click', () => this.startScene('Station', { tab: 'bar' }));
      options.appendChild(abortBtn);

      content.appendChild(options);
    } else {
      this.renderResult(content);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  action(type) {
    if (this.sfx) this.sfx.click();
    const room = this.rooms[this.currentRoom];

    let alertIncrease = 0;
    if (type === 'sneak') {
      alertIncrease = Math.random() < room.guardChance ? 20 + Math.floor(Math.random() * 15) : 5;
    } else if (type === 'hack') {
      alertIncrease = Math.random() < 0.3 ? 30 : 0;
    } else {
      alertIncrease = 15 + Math.floor(Math.random() * 20);
    }

    this.alertLevel = Math.min(this.maxAlert, this.alertLevel + alertIncrease);

    if (this.alertLevel >= this.maxAlert) {
      this.phase = 'caught';
      this.render();
      return;
    }

    this.currentRoom++;
    if (this.currentRoom >= this.rooms.length) {
      this.phase = 'success';
    }
    this.render();
  }

  renderResult(content) {
    const success = this.phase === 'success';
    const gs = this.gameState;

    const msg = this.el('div', 'event-title');
    msg.textContent = success ? 'Миссия выполнена!' : 'Обнаружены!';
    msg.style.color = success ? '#44ff44' : '#ff4444';
    content.appendChild(msg);

    if (success) {
      const credits = this.reward.credits || 400;
      gs.credits += credits;
      gs.save();
      const info = this.el('div', 'text-center text-green');
      info.textContent = `+${credits}кр`;
      content.appendChild(info);
    } else {
      const dmg = 10 + Math.floor(Math.random() * 15);
      gs.hp = Math.max(1, gs.hp - dmg);
      gs.save();
      const info = this.el('div', 'text-center text-red');
      info.textContent = `Охрана открыла огонь! -${dmg}HP`;
      content.appendChild(info);
    }

    const btn = this.btn('Продолжить', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide btn-green');
    btn.style.marginTop = '20px';
    content.appendChild(btn);
  }
}

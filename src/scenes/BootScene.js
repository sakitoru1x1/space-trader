import { Scene } from '../engine/SceneManager.js';

export class BootScene extends Scene {
  create(container) {
    super.create(container);
    const div = this.el('div', 'scene boot-screen');
    div.innerHTML = `
      <div class="boot-title">SPACE TRADER</div>
      <div class="boot-spinner"></div>
      <div class="boot-status">Загрузка...</div>
    `;
    container.appendChild(div);

    this.delayed(400, () => {
      this.startScene('Galaxy');
    });
  }
}

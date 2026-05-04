import { Scene } from '../engine/SceneManager.js';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function makeDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ suit: s, rank: r });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handRank(cards) {
  const vals = cards.map(c => RANKS.indexOf(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = vals[0] - vals[4] === 4 && new Set(vals).size === 5;
  const counts = {};
  for (const v of vals) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && isStraight && vals[0] === 12) return { rank: 9, name: 'Роял-флеш' };
  if (isFlush && isStraight) return { rank: 8, name: 'Стрит-флеш' };
  if (groups[0] === 4) return { rank: 7, name: 'Каре' };
  if (groups[0] === 3 && groups[1] === 2) return { rank: 6, name: 'Фулл-хаус' };
  if (isFlush) return { rank: 5, name: 'Флеш' };
  if (isStraight) return { rank: 4, name: 'Стрит' };
  if (groups[0] === 3) return { rank: 3, name: 'Тройка' };
  if (groups[0] === 2 && groups[1] === 2) return { rank: 2, name: 'Две пары' };
  if (groups[0] === 2) return { rank: 1, name: 'Пара' };
  return { rank: 0, name: 'Старшая карта' };
}

export class PokerScene extends Scene {
  init(data) {
    super.init(data);
    this.bet = 50;
    this.phase = 'deal';
    this.held = [false, false, false, false, false];
  }

  create(container) {
    super.create(container);
    const gs = this.gameState;

    if (gs.credits < this.bet) {
      this.startScene('Station', { tab: 'bar' });
      return;
    }

    gs.credits -= this.bet;
    gs.save();

    if (this.sfx) this.sfx.startMusic('quest');

    this.deck = makeDeck();
    this.hand = this.deck.splice(0, 5);
    this.renderHand();
  }

  renderHand() {
    this.container.innerHTML = '';
    const scene = this.el('div', 'scene');
    const content = this.el('div', 'content');
    content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

    const title = this.el('div', 'event-title');
    title.textContent = `Покер | Ставка: ${this.bet}кр`;
    content.appendChild(title);

    const hr = handRank(this.hand);
    const combo = this.el('div', 'text-center text-gold');
    combo.style.cssText = 'font-size:14px;margin:8px 0';
    combo.textContent = hr.name;
    content.appendChild(combo);

    const cards = this.el('div', '');
    cards.style.cssText = 'display:flex;gap:8px;margin:16px 0;justify-content:center';

    for (let i = 0; i < 5; i++) {
      const c = this.hand[i];
      const isRed = c.suit === '♥' || c.suit === '♦';
      const card = this.el('div', '');
      card.style.cssText = `width:52px;height:72px;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:16px;font-weight:bold;cursor:pointer;border:2px solid ${this.held[i] ? '#FFD700' : '#334'};background:${this.held[i] ? 'rgba(255,215,0,0.15)' : 'rgba(20,20,50,0.9)'};color:${isRed ? '#ff4444' : '#ddd'}`;
      card.innerHTML = `<span>${c.rank}</span><span style="font-size:20px">${c.suit}</span>`;

      if (this.phase === 'deal') {
        this.listen(card, 'click', () => {
          this.held[i] = !this.held[i];
          this.renderHand();
        });
      }
      cards.appendChild(card);
    }
    content.appendChild(cards);

    if (this.phase === 'deal') {
      const heldInfo = this.el('div', 'text-center text-small text-gray mb-8');
      heldInfo.textContent = 'Нажмите на карты чтобы оставить';
      content.appendChild(heldInfo);

      const drawBtn = this.btn('Обмен', () => this.draw(), 'btn btn-wide btn-green');
      content.appendChild(drawBtn);
    } else {
      const multipliers = [0, 1, 2, 3, 5, 8, 12, 25, 50, 100];
      const mult = multipliers[hr.rank];
      const winnings = this.bet * mult;

      const result = this.el('div', 'text-center');
      result.style.cssText = `font-size:18px;font-weight:bold;margin:12px 0;color:${winnings > 0 ? '#44ff44' : '#ff4444'}`;
      result.textContent = winnings > 0 ? `Выигрыш: ${winnings}кр!` : 'Проигрыш!';
      content.appendChild(result);

      if (winnings > 0) {
        this.gameState.credits += winnings;
        this.gameState.save();
      }

      const backBtn = this.btn('Вернуться', () => this.startScene('Station', { tab: 'bar' }), 'btn btn-wide');
      content.appendChild(backBtn);
    }

    scene.appendChild(content);
    this.container.appendChild(scene);
  }

  draw() {
    if (this.sfx) this.sfx.click();
    for (let i = 0; i < 5; i++) {
      if (!this.held[i] && this.deck.length > 0) {
        this.hand[i] = this.deck.pop();
      }
    }
    this.phase = 'result';
    this.renderHand();
  }
}


// -------------------- Tile --------------------
class Tile {
  constructor(id, color, number) {
    this.id = id;
    this.color = color; // red, blue, yellow, black, joker
    this.number = number; // 1–13, joker = -1
  }

  toString() {
    return this.number === -1 ? 'J' : this.color[0] + this.number;
  }
}

// -------------------- Game State --------------------
let pile = [];
let hand = [];
let groups = [];
let playedThisTurn = new Set();
let initialMeldDone = false;
let nextId = 1;

// -------------------- Setup --------------------
function resetGame() {
  pile = [];
  hand = [];
  groups = [];
  playedThisTurn.clear();
  initialMeldDone = false;

  const colors = ['red', 'blue', 'yellow', 'black'];
  for (const c of colors) {
    for (let n = 1; n <= 13; n++) {
      pile.push(new Tile(nextId++, c, n));
      pile.push(new Tile(nextId++, c, n));
    }
  }
  pile.push(new Tile(nextId++, 'joker', -1));
  pile.push(new Tile(nextId++, 'joker', -1));

  shuffle(pile);
  for (let i = 0; i < 14; i++) hand.push(pile.pop());

  render();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// -------------------- Actions --------------------
function drawTile() {
  if (pile.length > 0) hand.push(pile.pop());
  render();
}

function newGroup() {
  groups.push([]);
  render();
}

function addTile(handIndex, groupIndex) {
  if (!hand[handIndex] || !groups[groupIndex]) return;
  const tile = hand.splice(handIndex, 1)[0];
  groups[groupIndex].push(tile);
  playedThisTurn.add(tile.id);
  render();
}

function endTurn() {
  for (const g of groups) {
    if (g.length > 0 && g.length < 3) {
      alert('Invalid group size'); return;
    }
    if (g.length > 0 && !validGroup(g)) {
      alert('Invalid group'); return;
    }
  }

  if (!initialMeldDone) {
    let points = 0;
    for (const id of playedThisTurn) {
      for (const g of groups)
        for (const t of g)
          if (t.id === id)
            points += tileValue(t, g);
    }
    if (points < 30) {
      alert('Initial meld must be at least 30 points'); return;
    }
    initialMeldDone = true;
  }

  playedThisTurn.clear();
  alert('Turn accepted');
}

// -------------------- Validation --------------------
function validGroup(g) {
  const nonJ = g.filter(t => t.number !== -1);

  // Set
  if (nonJ.length > 0 && nonJ.every(t => t.number === nonJ[0].number)) {
    const colors = new Set(nonJ.map(t => t.color));
    return colors.size === nonJ.length && g.length <= 4;
  }

  // Run
  const colors = new Set(nonJ.map(t => t.color));
  if (colors.size > 1) return false;

  const nums = nonJ.map(t => t.number).sort((a, b) => a - b);
  for (let start = 1; start <= 13 - g.length + 1; start++) {
    const seq = [];
    for (let i = 0; i < g.length; i++) seq.push(start + i);
    if (nums.every(n => seq.includes(n))) return true;
  }
  return false;
}

function tileValue(t, g) {
  if (t.number !== -1) return t.number;
  for (const x of g) if (x.number !== -1) return x.number;
  return 0;
}

// -------------------- Save / Load --------------------
function saveGame() {
  const state = {
    pile, hand, groups,
    played: [...playedThisTurn],
    initialMeldDone, nextId
  };
  localStorage.setItem('rummikub_save', JSON.stringify(state));
  alert('Game saved');
}

function loadGame() {
  const raw = localStorage.getItem('rummikub_save');
  if (!raw) return alert('No save found');
  const s = JSON.parse(raw);

  pile = s.pile;
  hand = s.hand;
  groups = s.groups;
  playedThisTurn = new Set(s.played);
  initialMeldDone = s.initialMeldDone;
  nextId = s.nextId;

  render();
  alert('Game loaded');
}

// -------------------- Rendering --------------------
function render() {
  const handDiv = document.getElementById('hand');
  const groupsDiv = document.getElementById('groups');
  handDiv.innerHTML = '';
  groupsDiv.innerHTML = '';

  hand.forEach((t, i) => {
    const b = document.createElement('button');
    b.textContent = `${i}: ${t.toString()}`;
    handDiv.appendChild(b);
  });

  groups.forEach((g, gi) => {
    const div = document.createElement('div');
    div.textContent = gi + ': ' + g.map(t => t.toString()).join(' ');
    groupsDiv.appendChild(div);
  });
}

// -------------------- Init --------------------
window.onload = resetGame;

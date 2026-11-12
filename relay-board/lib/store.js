// The board's data lives in one JSON file (data/board.json), the "real data"
// every agent reads and writes. data/seed.json is the starting demo board.
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = process.env.RELAY_DATA_FILE || path.join(DATA_DIR, 'board.json');
const SEED = path.join(DATA_DIR, 'seed.json');

const bus = new EventEmitter();
bus.setMaxListeners(200);
let state = null;

// Seed tickets carry "ageDays" instead of fixed dates so the demo always looks fresh.
function hydrate(s) {
  const now = Date.now();
  for (const t of s.tickets) {
    if (t.ageDays !== undefined) {
      const at = new Date(now - t.ageDays * 864e5).toISOString();
      t.createdAt = t.createdAt || at;
      t.updatedAt = at;
      t.statusSince = at;
      delete t.ageDays;
    }
    t.flags = t.flags || [];
    t.labels = t.labels || [];
    t.criteria = t.criteria || [];
    t.comments = t.comments || [];
    t.history = t.history || [];
  }
  s.proposals = s.proposals || [];
  s.activity = s.activity || [];
  s.usage = s.usage || { runs: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
  return s;
}

function load() {
  if (!fs.existsSync(FILE)) {
    state = hydrate(JSON.parse(fs.readFileSync(SEED, 'utf8')));
    save();
  } else {
    state = hydrate(JSON.parse(fs.readFileSync(FILE, 'utf8')));
  }
  return state;
}

function save() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE); // atomic replace: a crash never leaves half a file
  bus.emit('change');
}

function reset() {
  state = hydrate(JSON.parse(fs.readFileSync(SEED, 'utf8')));
  save();
}

function log(agent, message, kind = 'info') {
  const entry = { at: new Date().toISOString(), agent, message: String(message), kind };
  state.activity.push(entry);
  if (state.activity.length > 400) state.activity.splice(0, state.activity.length - 400);
  bus.emit('log', entry);
  return entry;
}

module.exports = { load, save, reset, log, bus, state: () => state };

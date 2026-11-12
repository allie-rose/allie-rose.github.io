// Tests the AI agent loop without spending money: a fake model asks for tools,
// our code runs them against a temp board, and the results go back to the model.
const os = require('os'), path = require('path'), fs = require('fs'), assert = require('assert');
process.env.RELAY_DATA_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'relay-')), 'board.json');
process.env.OPENROUTER_API_KEY = 'test-key';
const store = require('../lib/store');
const agents = require('../lib/agents');

const script = [
  { tool_calls: [{ id: 'c1', type: 'function', function: { name: 'search_tickets', arguments: '{"query":"apple pay at checkout"}' } }] },
  { tool_calls: [{ id: 'c2', type: 'function', function: { name: 'create_ticket', arguments: JSON.stringify({ title: 'Support Apple Pay at checkout', description: 'Customers asked to pay with Apple Pay on the checkout page.', type: 'story', priority: 'medium', estimate: 5, labels: ['payments', 'frontend'], criteria: ['Apple Pay button shows on supported devices', 'Successful payment creates an order'] }) } },
                 { id: 'c3', type: 'function', function: { name: 'move_ticket', arguments: '{"id":"RB-1","to":"backlog","reason":"x"}' } }] },
  { content: 'Created RB-10: Support Apple Pay at checkout' },
  // triage
  { tool_calls: [{ id: 't1', type: 'function', function: { name: 'update_ticket', arguments: '{"id":"RB-10","assignee":"Sam"}' } }] },
  { tool_calls: [{ id: 't2', type: 'function', function: { name: 'move_ticket', arguments: '{"id":"RB-10","to":"done","reason":"skip"}' } }] },
  { tool_calls: [{ id: 't3', type: 'function', function: { name: 'move_ticket', arguments: '{"id":"RB-10","to":"todo","reason":"ready"}' } }] },
  { content: 'RB-10 → Sam Rivera, To Do' },
];
const seen = [];
global.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body);
  seen.push(body);
  const msg = script.shift();
  return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls } }], usage: { prompt_tokens: 1000, completion_tokens: 100, cost: 0.002 } }) };
};

(async () => {
  store.load();
  const r = await agents.intake('Customer asked for Apple Pay at checkout');
  const t = store.state().tickets.find(x => x.id === 'RB-10');
  assert.deepStrictEqual(r.created, ['RB-10']);
  assert.strictEqual(t.status, 'todo');
  assert.strictEqual(t.assignee, 'sam');
  // the intake agent's move_ticket call was refused: it is not one of its tools
  assert.ok(seen[2].messages.some(m => m.role === 'tool' && m.content.includes('not available')));
  assert.strictEqual(store.state().tickets.find(x => x.id === 'RB-1').status, 'done');
  // the skip-to-done attempt was refused with problems that went back to the model
  assert.ok(seen[5].messages.some(m => m.role === 'tool' && m.content.includes('one step at a time')));
  assert.strictEqual(store.state().usage.runs, 2);
  console.log('Agent loop test passed. Cost tracked: $' + store.state().usage.cost.toFixed(4));
})().catch(e => { console.error(e); process.exit(1); });

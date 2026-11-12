// Relay Board: a local ticket board run by a team of AI agents.
// Start with:  node server.js   then open http://localhost:3000
require('./lib/env').load();
const http = require('http');
const fs = require('fs');
const path = require('path');
const store = require('./lib/store');
const wf = require('./lib/workflow');
const agents = require('./lib/agents');
const llm = require('./lib/llm');

store.load();
const S = () => store.state();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

// ---------- helpers ----------
function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
async function readBody(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 1e6) throw new Error('Request too large');
  }
  return data ? JSON.parse(data) : {};
}
class HttpError extends Error { constructor(code, msg, extra) { super(msg); this.code = code; this.extra = extra; } }
function ticket(id) {
  const t = S().tickets.find(x => x.id === id);
  if (!t) throw new HttpError(404, `No ticket ${id}`);
  return t;
}

function snapshot() {
  const s = S();
  const c = llm.config();
  return {
    mode: c.enabled ? 'ai' : 'offline', model: c.enabled ? c.model : null,
    statuses: wf.STATUSES, labels: wf.LABELS, points: wf.POINTS, priorities: wf.PRIORITIES, types: wf.TYPES,
    settings: s.settings, team: s.team, usage: s.usage, proposals: s.proposals,
    activity: s.activity.slice(-120),
    tickets: s.tickets.map(t => {
      const next = wf.nextStatus(t);
      return { ...t, daysInStatus: +wf.daysIn(t).toFixed(1), next, nextCheck: next ? wf.checkTransition(s, t, next) : null };
    }),
  };
}

// Rule-based automations that fire on human evidence, no agent needed:
// attach a deliverable → In Review; tick the last criterion → Done.
function autoAdvance(t) {
  const s = S();
  const rules = { in_progress: 'in_review', in_review: 'done' };
  const to = rules[t.status];
  if (!to || t.blocked) return;
  if (to === 'in_review' && !t.deliverable) return;
  if (!wf.checkTransition(s, t, to).ok) return;
  wf.applyMove(t, to, 'Workflow automation', to === 'done' ? 'All acceptance criteria checked' : 'Deliverable attached');
  store.log('Workflow automation', `${t.id} moved to ${wf.LABELS[to]} (${to === 'done' ? 'all criteria checked' : 'deliverable attached'})`, 'tool');
}

function humanMove(t, to, reason) {
  const check = wf.checkTransition(S(), t, to);
  if (!check.ok) throw new HttpError(409, check.problems.join('; '), { problems: check.problems });
  wf.applyMove(t, to, 'You', reason);
  S().proposals = S().proposals.filter(p => p.ticketId !== t.id);
  store.log('You', `moved ${t.id} to ${wf.LABELS[to]}`, 'human');
  store.save();
}

function applyUpdate(t, b) {
  const s = S();
  if (b.title !== undefined) { if (String(b.title).trim().length < 3) throw new HttpError(400, 'Title is too short'); t.title = String(b.title).trim(); }
  if (b.description !== undefined) t.description = String(b.description);
  if (b.type !== undefined && wf.TYPES.includes(b.type)) t.type = b.type;
  if (b.priority !== undefined && wf.PRIORITIES.includes(b.priority)) t.priority = b.priority;
  if (b.estimate !== undefined) t.estimate = wf.POINTS.includes(Number(b.estimate)) ? Number(b.estimate) : null;
  if (b.labels !== undefined) t.labels = (Array.isArray(b.labels) ? b.labels : String(b.labels).split(',')).map(x => x.trim()).filter(Boolean).slice(0, 6);
  if (b.assignee !== undefined) t.assignee = b.assignee ? (wf.findMember(s, b.assignee) || {}).id || null : null;
  if (b.deliverable !== undefined) t.deliverable = String(b.deliverable).trim();
  if (b.criteria !== undefined) t.criteria = b.criteria.filter(c => c && String(c.text).trim()).map(c => ({ text: String(c.text).trim(), done: !!c.done }));
  if (b.blocked !== undefined) { t.blocked = !!b.blocked; t.blockedReason = t.blocked ? String(b.blockedReason || '') : ''; }
  if (b.needsInfo === false) t.flags = t.flags.filter(f => f !== 'needs-info');
  if (b.needsInfo === true && !t.flags.includes('needs-info')) t.flags.push('needs-info');
  t.updatedAt = wf.now();
  autoAdvance(t);
  store.save();
}

// ---------- routes ----------
const routes = [
  ['GET', /^\/api\/state$/, () => snapshot()],

  ['POST', /^\/api\/intake$/, async (m, b) => {
    const text = String(b.text || '').trim();
    if (!text) throw new HttpError(400, 'Type or paste something first');
    if (text.length > 8000) throw new HttpError(400, 'Input is too long (8,000 characters max)');
    return agents.intake(text);
  }],
  ['POST', /^\/api\/autopilot$/, () => agents.autopilot()],
  ['POST', /^\/api\/standup$/, () => agents.standup()],
  ['POST', /^\/api\/tickets\/([\w-]+)\/triage$/, ([, id]) => { ticket(id); return agents.triage(id); }],

  ['POST', /^\/api\/tickets$/, (m, b) => {
    if (!b.title || String(b.title).trim().length < 3) throw new HttpError(400, 'Title is too short');
    const t = wf.newTicket(S(), { title: b.title, description: b.description || '', type: b.type, priority: b.priority }, 'You');
    store.log('You', `created ${t.id}: ${t.title}`, 'human');
    store.save();
    return { id: t.id };
  }],
  ['POST', /^\/api\/tickets\/([\w-]+)\/advance$/, ([, id]) => {
    const t = ticket(id);
    const next = wf.nextStatus(t);
    if (!next) throw new HttpError(409, 'Already done', { problems: ['Already done'] });
    humanMove(t, next, 'Moved with the button');
    return { ok: true };
  }],
  ['POST', /^\/api\/tickets\/([\w-]+)\/back$/, ([, id], b) => {
    const t = ticket(id);
    const prev = wf.prevStatus(t);
    if (!prev) throw new HttpError(409, 'Already at the start');
    humanMove(t, prev, b.reason || 'Sent back');
    return { ok: true };
  }],
  ['POST', /^\/api\/tickets\/([\w-]+)\/update$/, ([, id], b) => { const t = ticket(id); applyUpdate(t, b); return { ok: true, status: t.status }; }],
  ['POST', /^\/api\/tickets\/([\w-]+)\/criteria\/(\d+)$/, ([, id, i]) => {
    const t = ticket(id);
    const c = t.criteria[Number(i)];
    if (!c) throw new HttpError(404, 'No such criterion');
    c.done = !c.done;
    t.updatedAt = wf.now();
    autoAdvance(t);
    store.save();
    return { ok: true, status: t.status };
  }],
  ['POST', /^\/api\/tickets\/([\w-]+)\/comment$/, ([, id], b) => {
    const t = ticket(id);
    if (!String(b.text || '').trim()) throw new HttpError(400, 'Comment is empty');
    t.comments.push({ author: 'You', text: String(b.text).trim().slice(0, 2000), at: wf.now() });
    store.save();
    return { ok: true };
  }],
  ['POST', /^\/api\/tickets\/([\w-]+)\/delete$/, ([, id]) => {
    ticket(id);
    S().tickets = S().tickets.filter(t => t.id !== id);
    S().proposals = S().proposals.filter(p => p.ticketId !== id);
    store.log('You', `deleted ${id}`, 'human');
    store.save();
    return { ok: true };
  }],

  ['POST', /^\/api\/proposals\/(\w+)\/(approve|reject)$/, ([, pid, action]) => {
    const s = S();
    const p = s.proposals.find(x => x.id === pid);
    if (!p) throw new HttpError(404, 'That proposal is gone');
    s.proposals = s.proposals.filter(x => x.id !== pid);
    const t = s.tickets.find(x => x.id === p.ticketId);
    if (action === 'approve' && t) {
      const check = wf.checkTransition(s, t, p.to);
      if (!check.ok) { store.save(); throw new HttpError(409, `Can't apply any more: ${check.problems.join('; ')}`, { problems: check.problems }); }
      wf.applyMove(t, p.to, `${p.by} (approved by you)`, p.reason);
      store.log('You', `approved ${p.by}: ${t.id} → ${wf.LABELS[p.to]}`, 'human');
    } else store.log('You', `rejected ${p.by}: ${p.ticketId} → ${wf.LABELS[p.to]}`, 'human');
    store.save();
    return { ok: true };
  }],
  ['POST', /^\/api\/settings$/, (m, b) => {
    const s = S();
    if (['auto', 'review'].includes(b.autonomy)) s.settings.autonomy = b.autonomy;
    if (b.wipPerPerson) s.settings.wipPerPerson = Math.max(1, Math.min(10, Number(b.wipPerPerson)));
    if (b.wipColumn) s.settings.wipColumn = Math.max(1, Math.min(30, Number(b.wipColumn)));
    store.log('You', `settings: ${s.settings.autonomy === 'review' ? 'agents ask before moving' : 'agents move tickets on their own'}`, 'human');
    store.save();
    return { ok: true };
  }],
  ['POST', /^\/api\/reset$/, () => { store.reset(); store.log('You', 'reset the demo board', 'human'); store.save(); return { ok: true }; }],
];

function serveEvents(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
  res.write('retry: 2000\n\n');
  const onChange = () => res.write('event: change\ndata: {}\n\n');
  const onLog = e => res.write(`event: log\ndata: ${JSON.stringify(e)}\n\n`);
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  store.bus.on('change', onChange);
  store.bus.on('log', onLog);
  req.on('close', () => { clearInterval(ping); store.bus.off('change', onChange); store.bus.off('log', onLog); });
}

function serveStatic(req, res, pathname) {
  const file = path.normalize(path.join(PUBLIC, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/api/events') return serveEvents(req, res);
  if (!pathname.startsWith('/api/')) return serveStatic(req, res, pathname);
  const route = routes.find(([method, re]) => method === req.method && re.test(pathname));
  if (!route) return send(res, 404, { error: 'Unknown endpoint' });
  try {
    const body = req.method === 'POST' ? await readBody(req) : {};
    const result = await route[2](pathname.match(route[1]), body);
    send(res, 200, result);
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    send(res, e.code || 500, { error: e.message, ...(e.extra || {}) });
  }
});

server.listen(PORT, HOST, () => {
  const c = llm.config();
  console.log(`\n  Relay Board is running at http://localhost:${PORT}\n`);
  console.log(c.enabled
    ? `  Agents: AI mode via OpenRouter (${c.model})`
    : '  Agents: offline rules engine (add OPENROUTER_API_KEY to .env for AI mode)');
  console.log('  Press Ctrl+C to stop.\n');
});

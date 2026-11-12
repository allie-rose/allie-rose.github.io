// The tools agents use to read and change the board. Every agent (AI or the
// offline rules engine) goes through these, so every action is validated,
// saved to disk and shown in the activity feed.
const store = require('./store');
const wf = require('./workflow');

const S = () => store.state();

// ---------- similarity search (duplicate detection) ----------
const STOP = new Set(('the a an and or but to of in on for with is are was were be been it this that these those ' +
  'we our us you your they their them i me my at by from as when then than so if not no can could should would ' +
  'will just also need needs want wants make please get got has have had do does did its into out up about ' +
  'some any all more most very there here what which who how why new add still again').split(' '));

function tokens(str) {
  return new Set(String(str || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .map(w => w.replace(/(ing|ed|es|s)$/, '')).filter(w => w.length > 2));
}

function similarity(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / Math.sqrt(a.size * b.size);
}

function search(query, limit = 5) {
  const q = tokens(query);
  return S().tickets
    .map(t => ({ t, score: Math.max(similarity(q, tokens(t.title)), similarity(q, tokens(t.title + ' ' + t.description))) }))
    .filter(x => x.score >= 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => ({ id: x.t.id, title: x.t.title, status: x.t.status, score: +x.score.toFixed(2) }));
}

// ---------- views ----------
function compact(t) {
  return {
    id: t.id, title: t.title, type: t.type, priority: t.priority, estimate: t.estimate,
    status: t.status, assignee: wf.memberName(S(), t.assignee), labels: t.labels, flags: t.flags,
    blocked: t.blocked ? (t.blockedReason || true) : false,
    criteria_done: `${t.criteria.filter(c => c.done).length}/${t.criteria.length}`,
    has_deliverable: !!t.deliverable, days_in_status: +wf.daysIn(t).toFixed(1),
  };
}

function full(t) {
  return {
    ...compact(t), description: t.description, question: t.question || null, criteria: t.criteria,
    deliverable: t.deliverable || null, comments: t.comments.slice(-5), history: t.history.slice(-5),
  };
}

function teamView() {
  const s = S();
  return s.team.map(m => ({
    name: m.name, role: m.role, skills: m.skills,
    in_progress: wf.wipFor(s, m.id), wip_limit: s.settings.wipPerPerson,
    open_points: s.tickets.filter(t => t.assignee === m.id && t.status !== 'done')
      .reduce((n, t) => n + (t.estimate || 0), 0),
  }));
}

// ---------- tool schemas (OpenAI/OpenRouter "function" format) ----------
const str = d => ({ type: 'string', description: d });
const DEFS = {
  get_board: {
    description: 'List every ticket on the board (compact view), the WIP limits, and moves from the last 24 hours.',
    parameters: { type: 'object', properties: {} },
  },
  get_ticket: {
    description: 'Get one ticket in full: description, acceptance criteria, deliverable, recent comments and history.',
    parameters: { type: 'object', properties: { id: str('Ticket id, e.g. RB-7') }, required: ['id'] },
  },
  search_tickets: {
    description: 'Find existing tickets similar to some text. Call before creating a ticket. Score 0-1; 0.5 or more is likely the same work.',
    parameters: { type: 'object', properties: { query: str('Text to compare against existing tickets') }, required: ['query'] },
  },
  list_team: {
    description: 'List team members with their skills, how many tickets each has in progress, their WIP limit, and open story points.',
    parameters: { type: 'object', properties: {} },
  },
  create_ticket: {
    description: 'Create a ticket in Backlog.',
    parameters: {
      type: 'object',
      properties: {
        title: str('Short imperative title, max ~10 words'),
        description: str("What and why, keeping the reporter's concrete details"),
        type: { type: 'string', enum: wf.TYPES },
        priority: { type: 'string', enum: wf.PRIORITIES },
        estimate: { type: 'integer', enum: wf.POINTS, description: 'Story points' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Area labels, e.g. frontend, backend, api, auth, payments, devops, testing, docs, mobile' },
        criteria: { type: 'array', items: { type: 'string' }, description: '2-4 testable acceptance criteria' },
        needs_info: { type: 'boolean', description: 'True if the request is too vague to work on yet' },
        question: str('If needs_info: the one question that would unblock it'),
      },
      required: ['title', 'description', 'type', 'priority'],
    },
  },
  update_ticket: {
    description: 'Change planning fields on a ticket. Only include fields you want to change.',
    parameters: {
      type: 'object',
      properties: {
        id: str('Ticket id'),
        title: { type: 'string' }, description: { type: 'string' },
        type: { type: 'string', enum: wf.TYPES },
        priority: { type: 'string', enum: wf.PRIORITIES },
        estimate: { type: 'integer', enum: wf.POINTS },
        labels: { type: 'array', items: { type: 'string' } },
        assignee: str('Team member name'),
        add_criteria: { type: 'array', items: { type: 'string' }, description: 'Acceptance criteria to append' },
        needs_info: { type: 'boolean' }, question: { type: 'string' },
      },
      required: ['id'],
    },
  },
  check_transition: {
    description: 'Check whether a ticket may move to a status, and what is missing if not. Does not move anything.',
    parameters: { type: 'object', properties: { id: str('Ticket id'), to: { type: 'string', enum: wf.STATUSES } }, required: ['id', 'to'] },
  },
  move_ticket: {
    description: 'Move a ticket to another status. Forward moves go one step at a time and must pass the workflow rules. In "ask me first" mode the move is queued for human approval.',
    parameters: { type: 'object', properties: { id: str('Ticket id'), to: { type: 'string', enum: wf.STATUSES }, reason: str('One short sentence shown to the team') }, required: ['id', 'to', 'reason'] },
  },
  add_comment: {
    description: 'Add a comment to a ticket.',
    parameters: { type: 'object', properties: { id: str('Ticket id'), text: { type: 'string' } }, required: ['id', 'text'] },
  },
  set_blocked: {
    description: 'Mark a ticket blocked (waiting on someone outside the team) or unblock it.',
    parameters: { type: 'object', properties: { id: str('Ticket id'), blocked: { type: 'boolean' }, reason: { type: 'string' } }, required: ['id', 'blocked'] },
  },
};

function defs(names) {
  return names.map(name => ({ type: 'function', function: { name, ...DEFS[name] } }));
}

// ---------- implementations ----------
function getTicket(id) {
  const t = S().tickets.find(x => x.id.toLowerCase() === String(id || '').toLowerCase().trim());
  if (!t) throw new Error(`No ticket with id "${id}"`);
  return t;
}

const short = v => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s.length > 80 ? s.slice(0, 77) + '…' : s; };

const IMPL = {
  get_board() {
    const s = S();
    const since = Date.now() - 864e5;
    const recent = [];
    for (const t of s.tickets) for (const h of t.history)
      if (h.from && Date.parse(h.at) > since) recent.push({ id: t.id, from: h.from, to: h.to, by: h.by, at: h.at });
    return {
      wip_limits: { per_person: s.settings.wipPerPerson, in_progress_column: s.settings.wipColumn },
      tickets: s.tickets.map(compact),
      recent_moves: recent.slice(-30),
      pending_approvals: s.proposals.map(p => ({ ticket: p.ticketId, to: p.to })),
    };
  },
  get_ticket: ({ id }) => full(getTicket(id)),
  search_tickets: ({ query }) => ({ matches: search(query) }),
  list_team: () => ({ team: teamView() }),

  create_ticket(a, ctx) {
    if (!a.title || String(a.title).trim().length < 3) throw new Error('title is required');
    const t = wf.newTicket(S(), a, ctx.by);
    ctx.created.push(t.id);
    store.save();
    return { created: t.id, status: 'backlog', flags: t.flags };
  },

  update_ticket(a, ctx) {
    const s = S();
    const t = getTicket(a.id);
    const changed = [];
    if (a.title !== undefined) { t.title = String(a.title).trim(); changed.push('title'); }
    if (a.description !== undefined) { t.description = String(a.description); changed.push('description'); }
    if (a.type !== undefined) { if (!wf.TYPES.includes(a.type)) throw new Error('bad type'); t.type = a.type; changed.push('type'); }
    if (a.priority !== undefined) { if (!wf.PRIORITIES.includes(a.priority)) throw new Error('bad priority'); t.priority = a.priority; changed.push('priority'); }
    if (a.estimate !== undefined) { if (!wf.POINTS.includes(a.estimate)) throw new Error(`estimate must be one of ${wf.POINTS}`); t.estimate = a.estimate; changed.push('estimate'); }
    if (a.labels !== undefined) { t.labels = a.labels.map(String).slice(0, 6); changed.push('labels'); }
    if (a.assignee !== undefined) {
      const m = wf.findMember(s, a.assignee);
      if (!m) throw new Error(`No team member "${a.assignee}". Team: ${s.team.map(x => x.name).join(', ')}`);
      t.assignee = m.id; changed.push('assignee');
    }
    if (a.add_criteria?.length) { t.criteria.push(...a.add_criteria.filter(Boolean).map(text => ({ text: String(text), done: false }))); changed.push('criteria'); }
    if (a.needs_info === true && !t.flags.includes('needs-info')) { t.flags.push('needs-info'); changed.push('needs-info'); }
    if (a.needs_info === false) { t.flags = t.flags.filter(f => f !== 'needs-info'); changed.push('needs-info cleared'); }
    if (a.question !== undefined) t.question = String(a.question);
    t.updatedAt = wf.now();
    store.save();
    return { updated: t.id, changed };
  },

  check_transition: ({ id, to }) => wf.checkTransition(S(), getTicket(id), to),

  move_ticket({ id, to, reason }, ctx) {
    const s = S();
    const t = getTicket(id);
    const check = wf.checkTransition(s, t, to);
    if (!check.ok) return { moved: false, problems: check.problems };
    if (s.settings.autonomy === 'review') {
      if (!s.proposals.some(p => p.ticketId === t.id && p.to === to)) {
        s.proposals.push({ id: `P${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, ticketId: t.id, from: t.status, to, reason: reason || '', by: ctx.by, at: wf.now() });
        store.save();
      }
      ctx.moved.push(`${t.id}→${to} (awaiting approval)`);
      return { moved: false, pending_approval: true, note: 'Queued for a human to approve.' };
    }
    const from = t.status;
    wf.applyMove(t, to, ctx.by, reason);
    store.save();
    ctx.moved.push(`${t.id}→${to}`);
    return { moved: true, from, to };
  },

  add_comment({ id, text }, ctx) {
    const t = getTicket(id);
    if (!text || !String(text).trim()) throw new Error('text is required');
    t.comments.push({ author: ctx.by, text: String(text).slice(0, 2000), at: wf.now() });
    t.updatedAt = wf.now();
    store.save();
    return { commented: t.id };
  },

  set_blocked({ id, blocked, reason }, ctx) {
    const t = getTicket(id);
    t.blocked = !!blocked;
    t.blockedReason = blocked ? String(reason || '') : '';
    t.history.push({ from: t.status, to: t.status, by: ctx.by, reason: blocked ? `blocked: ${reason || ''}` : 'unblocked', at: wf.now() });
    t.updatedAt = wf.now();
    store.save();
    return { id: t.id, blocked: t.blocked };
  },
};

// Run a tool on behalf of an agent. Agents may only call the tools they were given.
async function run(name, args, ctx, allowed) {
  ctx.calls = (ctx.calls || 0) + 1;
  if (!IMPL[name] || (allowed && !allowed.includes(name))) {
    store.log(ctx.by, `✗ tried unknown or disallowed tool "${name}"`, 'warn');
    return { error: `Tool "${name}" is not available to you.` };
  }
  try {
    const result = IMPL[name](args || {}, ctx);
    const quiet = ['get_board', 'list_team'].includes(name);
    let note = '';
    if (result && result.problems) note = ` → refused: ${result.problems.join('; ')}`;
    else if (result && result.pending_approval) note = ' → queued for approval';
    else if (result && result.created) note = ` → ${result.created}`;
    else if (result && result.matches) note = result.matches.length ? ` → best match ${result.matches[0].id} (${result.matches[0].score})` : ' → no matches';
    store.log(ctx.by, `${name}(${quiet ? '' : short(args)})${note}`, result && result.problems ? 'warn' : 'tool');
    return result;
  } catch (e) {
    store.log(ctx.by, `${name}(${short(args)}) → error: ${e.message}`, 'warn');
    return { error: e.message };
  }
}

module.exports = { defs, run, search, tokens, similarity, teamView, compact, getTicket, DEFS };

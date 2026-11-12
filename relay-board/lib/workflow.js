// The workflow rules. These are enforced in code, not in a prompt, so no agent
// (and no prompt injection) can skip a step or break a WIP limit.

const STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
const LABELS = { backlog: 'Backlog', todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };
const TYPES = ['story', 'bug', 'task'];
const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const POINTS = [1, 2, 3, 5, 8, 13];
const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };
const STALE_DAYS = 3;

const now = () => new Date().toISOString();

function findMember(state, who) {
  if (!who) return null;
  const w = String(who).toLowerCase().trim();
  return state.team.find(m =>
    m.id === w || m.name.toLowerCase() === w || m.name.toLowerCase().split(' ')[0] === w) || null;
}

function memberName(state, id) {
  const m = findMember(state, id);
  return m ? m.name : null;
}

function wipFor(state, memberId, exceptId) {
  return state.tickets.filter(t => t.assignee === memberId && t.status === 'in_progress' && t.id !== exceptId).length;
}

function daysIn(t) {
  return (Date.now() - Date.parse(t.statusSince || t.updatedAt || t.createdAt)) / 864e5;
}

// What a ticket must have before it may ENTER each column.
const GATES = {
  backlog: () => [],
  todo: (s, t) => {
    const p = [];
    if (!t.title || t.title.trim().length < 5) p.push('Needs a clear title');
    if (!t.description || t.description.trim().length < 15) p.push('Needs a description (at least a sentence)');
    if (!POINTS.includes(t.estimate)) p.push('Needs a story-point estimate');
    if (!t.criteria.length) p.push('Needs at least one acceptance criterion');
    if (t.flags.includes('needs-info')) p.push('Flagged needs-info: ' + (t.question || 'the request needs clarifying'));
    return p;
  },
  in_progress: (s, t) => {
    const p = [];
    const m = findMember(s, t.assignee);
    if (!m) p.push('Needs an assignee');
    else if (wipFor(s, m.id, t.id) >= s.settings.wipPerPerson)
      p.push(`${m.name} is at the WIP limit (${s.settings.wipPerPerson} in progress)`);
    const col = s.tickets.filter(x => x.status === 'in_progress' && x.id !== t.id).length;
    if (col >= s.settings.wipColumn) p.push(`In Progress column is full (limit ${s.settings.wipColumn})`);
    return p;
  },
  in_review: (s, t) => (t.deliverable && t.deliverable.trim()) ? [] :
    ['Needs a deliverable: a PR link or a short summary of the work'],
  done: (s, t) => {
    if (!t.criteria.length) return ['Needs acceptance criteria'];
    const open = t.criteria.filter(c => !c.done).length;
    return open ? [`${open} acceptance criteri${open === 1 ? 'on' : 'a'} not checked yet`] : [];
  },
};

function checkTransition(state, t, to) {
  if (!STATUSES.includes(to)) return { ok: false, problems: [`Unknown status "${to}". Use one of: ${STATUSES.join(', ')}`] };
  const from = STATUSES.indexOf(t.status);
  const target = STATUSES.indexOf(to);
  const problems = [];
  if (target === from) problems.push(`Already in ${LABELS[to]}`);
  else if (target > from) {
    if (target !== from + 1) problems.push(`Tickets move one step at a time; the next step is ${LABELS[STATUSES[from + 1]]}`);
    else {
      if (t.blocked) problems.push(`Ticket is blocked: ${t.blockedReason || 'no reason given'}`);
      problems.push(...GATES[to](state, t));
    }
  }
  // Moving backward (e.g. "changes requested") is always allowed.
  return { ok: problems.length === 0, problems };
}

function nextStatus(t) {
  const i = STATUSES.indexOf(t.status);
  return i < STATUSES.length - 1 ? STATUSES[i + 1] : null;
}

function prevStatus(t) {
  const i = STATUSES.indexOf(t.status);
  return i > 0 ? STATUSES[i - 1] : null;
}

function applyMove(t, to, by, reason) {
  t.history.push({ from: t.status, to, by, reason: reason || '', at: now() });
  t.status = to;
  t.statusSince = now();
  t.updatedAt = now();
  t.flags = t.flags.filter(f => f !== 'stale');
}

function newTicket(state, fields, by) {
  const t = {
    id: `RB-${state.nextId++}`,
    title: fields.title.trim(),
    description: (fields.description || '').trim(),
    type: TYPES.includes(fields.type) ? fields.type : 'task',
    priority: PRIORITIES.includes(fields.priority) ? fields.priority : 'medium',
    estimate: POINTS.includes(fields.estimate) ? fields.estimate : null,
    labels: (fields.labels || []).map(String).slice(0, 6),
    assignee: null,
    status: 'backlog',
    criteria: (fields.criteria || []).filter(Boolean).map(text => ({ text: String(text), done: false })),
    deliverable: '',
    blocked: false,
    blockedReason: '',
    flags: fields.needs_info ? ['needs-info'] : [],
    question: fields.question || '',
    comments: [],
    history: [{ from: null, to: 'backlog', by, reason: 'created', at: now() }],
    createdAt: now(),
    updatedAt: now(),
    statusSince: now(),
    createdBy: by,
  };
  state.tickets.push(t);
  return t;
}

module.exports = {
  STATUSES, LABELS, TYPES, PRIORITIES, POINTS, PRIORITY_RANK, STALE_DAYS,
  findMember, memberName, wipFor, daysIn, checkTransition, nextStatus, prevStatus, applyMove, newTicket, now,
};

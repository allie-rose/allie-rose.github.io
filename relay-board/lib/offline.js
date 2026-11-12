// Offline "rules engine" versions of each agent. Used when no API key is set or
// the AI service is down, so the board keeps working (and the demo never dies).
// They call the same tools as the AI agents, so the same rules apply.
const store = require('./store');
const wf = require('./workflow');
const tools = require('./tools');

const S = () => store.state();

const INJECTION = /\b(ignore (all |any |your |the )?(previous |prior )?(rules|instructions)|disregard (your|the) (rules|instructions)|(move|mark|set) (every|all|each)( \w+)? (tickets?|cards?|items?)|(mark|move) everything|you are now|system prompt)\b/i;
const GREETING = /^(hi|hello|hey|dear|thanks|thank you|cheers|best|regards|sincerely|sent from)\b/i;
const VAGUE = /\b(the thing|stuff|something|fix it|make it better|improve (it|things)|asap pls)\b/i;
const BLOCKER = /\b(waiting (on|for)|blocked (by|until|on)|depends on|pending (approval|sign-?off) from|until the (vendor|hosting|other team))\b[^.]*/i;

const AREAS = [
  ['frontend', /\b(ui|page|button|css|layout|dark mode|carousel|screen|frontend|display|safari|chrome|firefox|browser|modal|form|dashboard)\b/i],
  ['backend', /\b(api|server|backend|endpoint|database|db|query|sql|500|pagination|rate limit)\b/i],
  ['auth', /\b(login|log in|password|auth|sign ?in|sso|2fa|session)\b/i],
  ['payments', /\b(checkout|payment|cart|promo|coupon|stripe|refund|apple pay|discount|pricing)\b/i],
  ['mobile', /\b(ios|android|mobile|app store|phone)\b/i],
  ['devops', /\b(deploy|ci|pipeline|build|docker|node|infra|outage|prod|production|monitoring|server down)\b/i],
  ['testing', /\b(tests?|qa|regression|e2e)\b/i],
  ['docs', /\b(docs?|readme|documentation|guide)\b/i],
];

function splitItems(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const bullet = /^([-*•]|\d+[.)])\s+/;
  if (lines.some(l => bullet.test(l))) {
    const items = [];
    for (const l of lines) {
      if (bullet.test(l)) items.push(l.replace(bullet, ''));
      else if (/:$/.test(l) || GREETING.test(l)) continue;
      else if (items.length) items[items.length - 1] += ' ' + l;
    }
    return items;
  }
  // Emails: drop greetings, sign-offs and signature lines ("Thanks,", "Dana (support)").
  const isEmail = lines.some(l => GREETING.test(l));
  const isShort = l => l.split(/\s+/).length <= 3;
  const body = lines.filter(l => !(GREETING.test(l) && isShort(l)) && !(isEmail && isShort(l)));
  if (!isEmail && body.length > 1 && body.every(l => l.length < 120)) return body; // one item per line
  return body.join(' ')
    .split(/(?:^|(?<=[.!?])\s+)(?:also|additionally|separately|another thing|on top of that|plus)[,:]?\s+/i)
    .map(s => s.trim()).filter(s => s.length > 2);
}

function makeTitle(item) {
  let s = item.split(/(?<=[.!?])\s/)[0];
  if (s.split(/\s+/).length < 5) s = item; // too short to stand alone: keep the next clause
  s = s.replace(/\s*[?!]+\s+(?=\S)/g, ': ');
  s = s.replace(/^(a |one |some )?(customers?|users?|someone|support|the client) (wrote in|reported|says|said|mentioned|asked)( that| whether| if)?[:,]?\s*/i, '');
  for (let i = 0; i < 3; i++)
    s = s.replace(/^(urgent[:!]*|fyi[:,]?|so|ok|we need to|we should|need to|can we|could we|could you|please|pls|i think|it would be nice to|would be nice to|we have to|someone should|let's|lets|they asked whether we could|whether we could)\s+/i, '');
  s = s.replace(/[?!.,;:]+$/, '').split(/\s+/).slice(0, 9).join(' ').replace(/[,;:]$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function classify(item) {
  const type = /\b(bug|error|crash|broken|fails?|failing|500|doesn'?t work|not working|wrong|incorrect|expired|returning)\b/i.test(item) ? 'bug'
    : /\b(update|upgrade|refactor|migrate|clean ?up|config|readme|docs?|rate limit|rename)\b/i.test(item) ? 'task' : 'story';
  const priority = /\b(urgent|asap|outage|prod(uction)? (is )?down|down for everyone|for everyone|security|data loss|breach)\b/i.test(item) ? 'urgent'
    : /\b(crash|customers?|complain|blocking|deadline|broken|several people|can'?t)\b/i.test(item) ? 'high'
    : /\b(nice to have|someday|minor|typo|cosmetic|eventually)\b/i.test(item) ? 'low' : 'medium';
  const labels = AREAS.filter(([, re]) => re.test(item)).map(([name]) => name).slice(0, 3);
  const words = item.split(/\s+/).length;
  let estimate = type === 'bug' ? 3 : type === 'task' ? 2 : 5;
  if (words > 40) estimate = wf.POINTS[Math.min(wf.POINTS.indexOf(estimate) + 1, 5)];
  if (labels.length >= 3) estimate = wf.POINTS[Math.min(wf.POINTS.indexOf(estimate) + 1, 5)];
  return { type, priority, labels, estimate };
}

function defaultCriteria(type, title) {
  const t = title.charAt(0).toLowerCase() + title.slice(1);
  if (type === 'bug') return ['Root cause identified and written up on the ticket', `Fixed: ${t} no longer happens`, 'A regression test covers the case'];
  if (type === 'task') return [`Done: ${t}`, 'Notes or docs updated for the team'];
  return [`Works end to end: ${t}`, 'Errors and edge cases show a clear message', 'Reviewed by a teammate'];
}

async function intake(text, ctx) {
  const lines = [];
  for (const item of splitItems(text)) {
    if (INJECTION.test(item)) {
      store.log(ctx.by, `Ignored an instruction hidden in the input: "${item.slice(0, 80)}"`, 'warn');
      lines.push(`Ignored embedded instruction: "${item.slice(0, 60)}"`);
      continue;
    }
    const title = makeTitle(item);
    const { matches } = await tools.run('search_tickets', { query: item }, ctx);
    const dup = matches.find(m => m.score >= 0.5);
    if (dup) {
      await tools.run('add_comment', { id: dup.id, text: `Another report of this came in: "${item}"` }, ctx);
      ctx.merged.push(dup.id);
      lines.push(`Merged into ${dup.id} (duplicate): ${dup.title}`);
      continue;
    }
    const c = classify(item);
    const vague = item.split(/\s+/).length < 5 || (VAGUE.test(item) && item.split(/\s+/).length < 12);
    const r = await tools.run('create_ticket', {
      title: vague && title.length < 12 ? `Clarify request: "${title}"` : title,
      description: item,
      ...c,
      criteria: vague ? [] : defaultCriteria(c.type, title),
      needs_info: vague,
      question: vague ? 'What exactly is wrong or wanted, where does it happen, and who is affected?' : '',
    }, ctx);
    if (r.created) lines.push(`Created ${r.created}: ${title}${vague ? ' (needs info)' : ''}`);
  }
  return lines.length ? lines.join('\n') : 'Nothing to create.';
}

function pickAssignee(t) {
  const s = S();
  const words = tools.tokens(t.title + ' ' + t.labels.join(' '));
  const ranked = s.team.map(m => {
    const skillHits = m.skills.filter(k => t.labels.includes(k) || words.has(k.replace(/s$/, ''))).length;
    const load = wf.wipFor(s, m.id) + 0.5 * s.tickets.filter(x => x.assignee === m.id && x.status === 'todo').length;
    const room = wf.wipFor(s, m.id) < s.settings.wipPerPerson ? 1 : 0;
    return { m, score: skillHits * 2 + room - load * 0.6 };
  }).sort((a, b) => b.score - a.score);
  return ranked[0].m;
}

async function triage(ids, ctx) {
  const out = [];
  for (const id of ids) {
    let t;
    try { t = tools.getTicket(id); } catch { continue; }
    const c = classify(t.title + ' ' + t.description);
    const patch = { id: t.id };
    if (!wf.POINTS.includes(t.estimate)) patch.estimate = c.estimate;
    if (!t.labels.length && c.labels.length) patch.labels = c.labels;
    if (!t.criteria.length && !t.flags.includes('needs-info')) patch.add_criteria = defaultCriteria(t.type, t.title);
    if (!t.assignee) patch.assignee = pickAssignee({ ...t, labels: patch.labels || t.labels }).name;
    if (Object.keys(patch).length > 1) await tools.run('update_ticket', patch, ctx);
    if (t.flags.includes('needs-info')) { out.push(`${t.id}: left in Backlog until someone answers: ${t.question || 'needs info'}`); continue; }
    if (t.status === 'backlog') {
      const r = await tools.run('move_ticket', { id: t.id, to: 'todo', reason: 'Ready: estimated, has criteria and an owner' }, ctx);
      out.push(`${t.id} → ${wf.memberName(S(), t.assignee)}, ${r.moved ? 'moved to To Do' : r.pending_approval ? 'To Do awaiting approval' : 'stays in Backlog: ' + (r.problems || []).join('; ')}`);
    } else out.push(`${t.id} → ${wf.memberName(S(), t.assignee)}`);
  }
  return out.join('\n') || 'Nothing to triage.';
}

async function autopilot(ctx) {
  const s = S();
  const moved = [], human = [];
  const order = [...s.tickets].filter(t => t.status !== 'done')
    .sort((a, b) => wf.PRIORITY_RANK[a.priority] - wf.PRIORITY_RANK[b.priority]);
  for (const t of order) {
    const blocker = (t.description + ' ' + t.comments.map(c => c.text).join(' ')).match(BLOCKER);
    if (blocker && !t.blocked) {
      await tools.run('set_blocked', { id: t.id, blocked: true, reason: blocker[0].trim() }, ctx);
      human.push(`${t.id} is blocked (${blocker[0].trim()})`);
      continue;
    }
    if (t.blocked) { human.push(`${t.id} still blocked: ${t.blockedReason}`); continue; }
    if (t.status === 'backlog' && !t.flags.includes('needs-info') && !wf.checkTransition(s, t, 'todo').ok) {
      const r = await triage([t.id], ctx); // fill estimate, criteria, owner, then move
      if (t.status !== 'backlog' || s.proposals.some(p => p.ticketId === t.id)) moved.push(`${t.id} → To Do (planned)`);
      else human.push(r);
      continue;
    }
    if (t.status === 'todo' && !t.assignee)
      await tools.run('update_ticket', { id: t.id, assignee: pickAssignee(t).name }, ctx);
    const next = wf.nextStatus(t);
    const check = wf.checkTransition(s, t, next);
    if (check.ok) {
      const reason = { todo: 'Meets the definition of ready', in_progress: 'Highest-priority ready work and the owner has WIP room', in_review: 'Deliverable attached', done: 'All acceptance criteria checked' }[next];
      const r = await tools.run('move_ticket', { id: t.id, to: next, reason }, ctx);
      if (r.moved || r.pending_approval) moved.push(`${t.id} → ${wf.LABELS[next]}${r.pending_approval ? ' (awaiting approval)' : ''}`);
      continue;
    }
    if (['in_progress', 'in_review'].includes(t.status) && wf.daysIn(t) > wf.STALE_DAYS) {
      const nudged = t.comments.some(c => c.author === ctx.by && c.text.startsWith('⏰') && Date.now() - Date.parse(c.at) < 864e5);
      if (!nudged) {
        const who = wf.memberName(s, t.assignee) || 'team';
        await tools.run('add_comment', { id: t.id, text: `⏰ ${who}: this has been in ${wf.LABELS[t.status]} for ${Math.floor(wf.daysIn(t))} days. To move on it needs: ${check.problems.join('; ')}.` }, ctx);
        if (!t.flags.includes('stale')) { t.flags.push('stale'); store.save(); }
      }
      human.push(`${t.id} is stale: ${check.problems.join('; ')}`);
    } else if (t.flags.includes('needs-info')) human.push(`${t.id} needs an answer: ${t.question || 'clarify the request'}`);
  }
  return [
    moved.length ? `Moved: ${moved.join(', ')}` : 'No tickets were ready to move.',
    human.length ? `Needs a human: ${human.join(' · ')}` : '',
  ].filter(Boolean).join('\n');
}

async function standup() {
  const s = S();
  const since = Date.now() - 864e5;
  const name = id => wf.memberName(s, id) || 'Unassigned';
  const done = s.tickets.filter(t => t.status === 'done' && Date.parse(t.statusSince) > since);
  const lines = ['## Done in the last 24 hours'];
  lines.push(...(done.length ? done.map(t => `- **${t.id}** ${t.title} (${name(t.assignee)})`) : ['- Nothing finished yet']));
  lines.push('', '## In flight');
  for (const m of s.team) {
    const mine = s.tickets.filter(t => t.assignee === m.id && ['in_progress', 'in_review'].includes(t.status));
    if (mine.length) lines.push(`- **${m.name}:** ${mine.map(t => `${t.id} ${t.title} (${wf.LABELS[t.status]})`).join('; ')}`);
  }
  lines.push('', '## Blocked and at risk');
  const risks = s.tickets.filter(t => t.status !== 'done' && (t.blocked || t.flags.length || (['in_progress', 'in_review'].includes(t.status) && wf.daysIn(t) > wf.STALE_DAYS)));
  lines.push(...(risks.length ? risks.map(t => `- **${t.id}** ${t.title}: ${t.blocked ? 'blocked, ' + t.blockedReason : t.flags.includes('needs-info') ? 'needs info' : `${Math.floor(wf.daysIn(t))} days in ${wf.LABELS[t.status]}`}`) : ['- Nothing at risk']));
  const urgent = s.tickets.filter(t => t.status !== 'done' && ['urgent', 'high'].includes(t.priority))
    .sort((a, b) => wf.PRIORITY_RANK[a.priority] - wf.PRIORITY_RANK[b.priority]).slice(0, 3);
  lines.push('', '## Suggested focus today');
  lines.push(...(urgent.length ? urgent.map(t => `- **${t.id}** ${t.title} (${t.priority}, ${name(t.assignee)})`) : ['- Pull the next ticket from To Do']));
  return lines.join('\n');
}

module.exports = { intake, triage, autopilot, standup, splitItems, makeTitle, classify };

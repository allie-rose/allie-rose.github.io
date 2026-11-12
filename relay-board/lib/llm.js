// Agent loop over OpenRouter's chat-completions API with tool calling.
// The model decides which tool to call next; our code runs the tool and feeds
// the result back, until the model replies without a tool call.
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function config() {
  const key = process.env.OPENROUTER_API_KEY || '';
  const offline = (process.env.AGENT_MODE || '').toLowerCase() === 'offline';
  return {
    enabled: !!key && !offline,
    key,
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-opus-5.5',
  };
}

async function chat(messages, tools) {
  const c = config();
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 120000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', 'X-Title': 'Relay Board' },
        body: JSON.stringify({ model: c.model, messages, tools, tool_choice: 'auto', usage: { include: true } }),
      });
      const text = await res.text();
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < 2) { await sleep(1500 * 2 ** attempt); continue; }
        throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
      }
      const json = JSON.parse(text);
      if (json.error) throw new Error(`OpenRouter: ${json.error.message || JSON.stringify(json.error).slice(0, 200)}`);
      return json;
    } catch (e) {
      if (e.name === 'AbortError') {
        if (attempt < 1) continue;
        throw new Error('the model took too long to answer');
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
}

async function runAgent({ system, prompt, toolDefs, runTool, maxSteps = 16 }) {
  const messages = [{ role: 'system', content: system }, { role: 'user', content: prompt }];
  const usage = { input: 0, output: 0, cost: 0 };
  for (let step = 0; step < maxSteps; step++) {
    const json = await chat(messages, toolDefs);
    const u = json.usage || {};
    usage.input += u.prompt_tokens || 0;
    usage.output += u.completion_tokens || 0;
    usage.cost += typeof u.cost === 'number' ? u.cost : 0;

    const msg = json.choices && json.choices[0] && json.choices[0].message;
    if (!msg) throw new Error('the model returned an empty response');
    const calls = msg.tool_calls || [];
    const assistant = { role: 'assistant', content: msg.content || '' };
    if (calls.length) assistant.tool_calls = calls;
    messages.push(assistant);
    if (!calls.length) return { text: (msg.content || '').trim(), usage };

    for (const call of calls) {
      let args = null;
      try { args = JSON.parse(call.function.arguments || '{}'); } catch { /* handled below */ }
      const result = args === null
        ? { error: 'Your arguments were not valid JSON. Try again.' }
        : await runTool(call.function.name, args);
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  return { text: 'Stopped after reaching the step limit; some work may be unfinished.', usage };
}

module.exports = { config, runAgent };

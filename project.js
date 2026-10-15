// Builds a project or research page from content.js. You shouldn't need to edit this file.
(function () {
  const d = window.PORTFOLIO;
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  $("brand").textContent = d.name.split(" ").map((w) => w[0]).join("");
  $("footer").textContent = `© ${new Date().getFullYear()} ${d.name}`;
  $("footer-li").href = d.links.linkedin;
  $("footer-email").href = `mailto:${d.email}`;
  $("footer-email").textContent = d.email;

  const all = [
    ...d.projects.map((p) => ({ ...p, kind: "Project" })),
    ...d.research.map((r) => ({ ...r, kind: "Research", description: r.summary })),
  ];
  const slug = new URLSearchParams(location.search).get("p");
  const i = all.findIndex((x) => x.slug === slug);
  const p = all[i];

  if (!p) {
    $("detail").innerHTML = `<p class="back"><a href="index.html">← Back</a></p><h1>Page not found</h1>`;
    return;
  }
  const x = p.details || {};
  document.title = `${p.title} · ${d.name}`;

  const stats = (x.stats || [])
    .map(([v, l]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`)
    .join("");
  const sections = (x.sections || [])
    .map(
      (s) => `
      <section class="block">
        <h2>${esc(s.h)}</h2>
        ${(s.p || []).map((t) => `<p>${esc(t)}</p>`).join("")}
        ${s.list ? `<ul>${s.list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${s.code ? `<pre class="code"><code>${esc(s.code)}</code></pre>` : ""}
        ${s.quote ? `<blockquote class="pull">“${esc(s.quote)}”<cite>From my write-up</cite></blockquote>` : ""}
      </section>`
    )
    .join("");
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];

  $("detail").innerHTML = `
    <p class="back"><a href="index.html#${p.kind === "Project" ? "work" : "research"}">← All ${p.kind === "Project" ? "work" : "research"}</a></p>
    <p class="eyebrow">${esc(p.kind)} · ${esc(p.year || p.venue)}</p>
    <h1>${esc(p.title)}</h1>
    <p class="lede">${esc(x.summary || p.description)}</p>
    <div class="meta">
      ${x.role ? `<span><b>Role</b> ${esc(x.role)}</span>` : ""}
      ${x.stack ? `<span><b>Built with</b> ${x.stack.map(esc).join(", ")}</span>` : ""}
    </div>
    ${stats ? `<div class="stats">${stats}</div>` : ""}
    ${
      x.demo && window.DEMOS && window.DEMOS[x.demo]
        ? `<section class="demo-wrap">
             <div class="demo-head"><h2>Try it</h2>${x.demoNote ? `<p class="muted">${esc(x.demoNote)}</p>` : ""}</div>
             <div id="demo"></div>
           </section>`
        : ""
    }
    ${sections}
    ${p.link ? `<p><a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">View the original →</a></p>` : ""}
    <nav class="pager">
      <a href="project.html?p=${esc(prev.slug)}">← ${esc(prev.title)}</a>
      <a href="project.html?p=${esc(next.slug)}">${esc(next.title)} →</a>
    </nav>`;

  if (x.demo && window.DEMOS && window.DEMOS[x.demo]) window.DEMOS[x.demo]($("demo"));

  // Dark mode toggle (remembers choice)
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch (e) {}
  $("theme").addEventListener("click", () => {
    const light = root.dataset.theme
      ? root.dataset.theme === "light"
      : matchMedia("(prefers-color-scheme: light)").matches;
    root.dataset.theme = light ? "dark" : "light";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();

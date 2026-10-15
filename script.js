// Builds the homepage from content.js. You shouldn't need to edit this file.
(function () {
  const d = window.PORTFOLIO;
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.title = `${d.name} · AI Portfolio`;
  $("mark").textContent = d.name.split(" ").map((w) => w[0]).join("");
  $("name").textContent = d.name;
  $("tagline").textContent = d.tagline;
  $("intro").textContent = d.intro;
  $("location").textContent = d.location;
  $("footer").textContent = `© ${new Date().getFullYear()} ${d.name}`;
  $("email-btn").href = $("email-text").href = $("footer-email").href = `mailto:${d.email}`;
  $("email-text").textContent = $("footer-email").textContent = d.email;
  $("linkedin-btn").href = $("footer-li").href = d.links.linkedin;

  const links = [
    ["Email", `mailto:${d.email}`],
    ["LinkedIn ↗", d.links.linkedin],
    ["GitLab ↗", d.links.gitlab],
    ["Résumé ↗", d.links.resume],
  ].filter(([, url]) => url);
  $("hero-links").innerHTML = links
    .map(([label, url]) => `<a class="btn ghost" href="${esc(url)}"${url.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>${label}</a>`)
    .join("");

  // Skills ticker (doubled so it loops seamlessly)
  const skills = (d.skills || []).map((s) => `<span>${esc(s)}</span><i>✦</i>`).join("");
  $("ticker").innerHTML = skills + skills;

  // ---- Departures board ----------------------------------------
  const items = [
    ...d.projects.map((p) => ({ ...p, kind: "Project" })),
    ...d.research.map((r) => ({ ...r, kind: "Research" })),
  ];
  const W = { code: 5, title: 20, via: 7, status: 11 };
  const pad = (s, n) => String(s || "").toUpperCase().slice(0, n).padEnd(n, " ");
  const tiles = (s, cls) =>
    `<span class="flaps ${cls}">${[...s].map((ch) => `<span class="flap" data-ch="${esc(ch)}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("")}</span>`;
  $("board-cols").innerHTML = [["Code", W.code, "c-code"], ["Project", W.title, "c-title"], ["Via", W.via, "c-via"], ["Status", W.status, "c-status"]]
    .map(([t, n, cls]) => `<span class="col ${cls}" style="--n:${n}"><em>${t}</em></span>`)
    .join("");
  $("board-rows").innerHTML = items
    .map((it, i) => {
      const b = it.board || {};
      return `<a class="board-row" href="project.html?p=${esc(it.slug)}" aria-label="${esc(it.title)}">
        ${tiles(pad(`AR${101 + i}`, W.code), "c-code")}
        ${tiles(pad(b.title || it.title, W.title), "c-title")}
        ${tiles(pad(b.via, W.via), "c-via")}
        ${tiles(pad(b.status, W.status), "c-status")}
      </a>`;
    })
    .join("");

  // Split-flap effect: each tile spins through letters, then lands.
  if (!reduceMotion) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    document.querySelectorAll(".flap").forEach((f, n) => {
      const target = f.dataset.ch;
      if (target === " ") return;
      let spins = 6 + ((n * 7) % 16);
      f.textContent = chars[(n * 13) % chars.length];
      const tick = setInterval(() => {
        if (--spins <= 0) {
          f.textContent = target;
          return clearInterval(tick);
        }
        f.textContent = chars[Math.floor(Math.random() * chars.length)];
      }, 55);
    });
  }

  const clock = () => {
    $("clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  clock();
  setInterval(clock, 30000);

  // ---- Work + research lists ----------------------------------
  const row = (it, i) => `
    <a class="row" href="project.html?p=${esc(it.slug)}">
      <span class="row-num">${String(i + 1).padStart(2, "0")}</span>
      <div class="row-body">
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.description || it.summary)}</p>
        <div class="tags">${(it.tags || [it.venue]).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      </div>
      <span class="row-arrow">↗</span>
    </a>`;
  $("work-rows").innerHTML = d.projects.map(row).join("");
  $("research-rows").innerHTML = d.research.map(row).join("");

  $("timeline").innerHTML = d.experience
    .map(
      (x) => `
      <li>
        <div class="dates">${esc(x.dates)}</div>
        <div>
          <h3>${esc(x.role)}</h3>
          <p class="org">${esc(x.org)}</p>
          <ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        </div>
      </li>`
    )
    .join("");

  // ---- Theme toggle (remembers choice) -------------------------
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme-v2");
    if (saved) root.dataset.theme = saved;
  } catch (e) {}
  $("theme").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme-v2", root.dataset.theme); } catch (e) {}
  });
})();

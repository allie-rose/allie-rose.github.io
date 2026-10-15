// Visuals for the Delta internship page: a working recreation of the Sprint
// Dashboard (made-up data), plus the timeline, agent library, insight, and
// install-kit figures. Nothing here is Delta's real data, names, or code.
window.DEMOS = window.DEMOS || {};
window.FIGURES = window.FIGURES || {};

// ---------------------------------------------------------------
// Recreation of the three dashboards (Sprint Operations, Release
// Readiness, QA), combined into one window for the demo
// ---------------------------------------------------------------
DEMOS["delta-dashboard"] = function (el) {
  const T = (cols, rows) =>
    `<table class="dd-t"><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>${rows
      .map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`)
      .join("")}</table>`;
  const pill = (txt, kind) => `<span class="dd-pill dd-${kind}">${txt}</span>`;
  const bar = (pct, kind = "ok") => `<span class="dd-bar"><i class="dd-${kind}" style="width:${pct}%"></i></span>`;
  const tiles = (arr) =>
    `<div class="dd-tiles">${arr.map(([v, l, k]) => `<div class="dd-tile ${k ? "dd-" + k : ""}"><b>${v}</b><span>${l}</span></div>`).join("")}</div>`;

  const burndown = () => {
    const ideal = [40, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0];
    const actual = [40, 40, 37, 35, 35, 30, 26, 24, 17, null, null];
    const X = (i) => 30 + i * 47, Y = (v) => 170 - v * 3.8;
    const line = (a) => a.map((v, i) => (v == null ? "" : `${i && a[i - 1] != null ? "L" : "M"}${X(i)} ${Y(v)}`)).join(" ");
    return `<svg viewBox="0 0 520 200" class="dd-svg" aria-label="Burndown chart">
      <line x1="30" y1="170" x2="500" y2="170" class="dd-axis"/><line x1="30" y1="15" x2="30" y2="170" class="dd-axis"/>
      <path d="${line(ideal)}" class="dd-ideal"/><path d="${line(actual)}" class="dd-actual"/>
      ${actual.map((v, i) => (v == null ? "" : `<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" class="dd-dot"/>`)).join("")}
      <text x="36" y="28" class="dd-lbl">40 pts</text><text x="470" y="190" class="dd-lbl">Day 10</text><text x="30" y="190" class="dd-lbl">Day 0</text>
    </svg>
    <p class="dd-note"><b>Day 8:</b> 17 points left, ideal is 8. ${pill("Behind by 9 pts", "warn")} Most of the gap is 2 stories waiting on test.</p>`;
  };

  const heat = () => {
    const people = ["Jordan", "Priya", "Sam", "Lee", "Maya (QE)", "Chris (QE)"];
    const load = [[2, 3, 3, 2, 1], [3, 3, 2, 2, 2], [1, 1, 0, 0, 2], [2, 2, 3, 3, 2], [3, 3, 4, 4, 4], [2, 3, 3, 4, 3]];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return `<div class="dd-heat"><span></span>${days.map((d) => `<span class="dd-h">${d}</span>`).join("")}
      ${people.map((p, i) => `<span class="dd-h dd-name">${p}</span>${load[i].map((v) => `<span class="dd-cell dd-l${v}" title="${v} active stories">${v}</span>`).join("")}`).join("")}
    </div><p class="dd-note">Active stories per person. Testers are over capacity by Thursday ${pill("QE load: red", "bad")}</p>`;
  };

  const views = {
    standup: {
      name: "Standup prep",
      group: "Sprint Operations",
      html: () =>
        tiles([["11", "stories moved since yesterday"], ["4", "didn't move", "warn"], ["1", "blocked", "bad"], ["1.6×", "QE load ratio", "bad"]]) +
        T(["Person", "Moved", "Didn't move", "Flags"], [
          ["Jordan", "S-212 → In Test", "—", ""],
          ["Priya", "S-219 → Done", "S-224", pill("blocked: API access", "bad")],
          ["Sam", "—", "S-207, S-230", pill("no movement in 3 days", "warn")],
          ["Lee", "S-215 → In Progress", "S-233", pill("unestimated", "warn")],
        ]) +
        `<p class="dd-note">"Moved" means an actual status change, not just an edit.</p>`,
    },
    closeout: {
      name: "Sprint closeout",
      group: "Sprint Operations",
      html: () =>
        tiles([["34 / 40", "points delivered vs. committed"], ["85%", "commitment met", "ok"], ["3", "carried over", "warn"], ["1", "dropped"]]) +
        T(["Bucket", "Stories"], [
          [pill("Done", "ok"), "S-201 Seat map refresh · S-205 Login retry · S-212 Fare cache · +8 more"],
          [pill("Carry over", "warn"), "S-207 Offline mode · S-224 Payment timeout · S-230 Captive portal copy"],
          [pill("Dropped", "neutral"), "S-236 Legacy banner cleanup"],
        ]),
    },
    backlog: {
      name: "Backlog health",
      group: "Sprint Operations",
      html: () =>
        tiles([["72", "backlog health score", "warn"], ["38", "stories in next 2 sprints"]]) +
        T(["Check", "Passing", ""], [
          ["Has acceptance criteria", "31 / 38", bar(82)],
          ["Estimated", "27 / 38", bar(71, "warn")],
          ["Sized 3 points or less", "22 / 38", bar(58, "warn")],
          ["Linked to a feature", "36 / 38", bar(95)],
        ]),
    },
    planning: {
      name: "Planning advisor",
      group: "Sprint Operations",
      html: () =>
        tiles([["38", "points proposed"], ["31", "team capacity"], ["34", "3-sprint average velocity"]]) +
        `<div class="dd-callout">${pill("Over by 7 pts", "bad")} Drop or split <b>S-241 (8 pts)</b>. 8-pointers have been the least predictable size on this team, and testers are already near capacity for days 6–10.</div>`,
    },
    burndown: { name: "Burndown", group: "Sprint Operations", html: burndown },
    capacity: { name: "Capacity heatmap", group: "Sprint Operations", html: heat },
    retro: {
      name: "Retro",
      group: "Sprint Operations",
      html: () =>
        `<div class="dd-two"><div><h5>From the data, what went well</h5><ul><li>Cycle time down 1.4 days vs. last sprint</li><li>No stories bypassed testing</li><li>All 5 stories over 3 pts were split before starting</li></ul></div>
         <div><h5>What to talk about</h5><ul><li>3 carry-overs, all waiting on test</li><li>Average 2.9 days in "In Test" vs. 1.6 in development</li><li>2 stories added mid-sprint</li></ul></div></div>`,
    },
    rollup: {
      name: "Feature roll-up",
      group: "Sprint Operations",
      html: () =>
        T(["Feature", "Progress", "", "Status"], [
          ["F-31 Faster portal login", "9 / 10", bar(90), pill("On track", "ok")],
          ["F-34 Offline mode", "4 / 9", bar(44, "warn"), pill("At risk", "warn")],
          ["F-36 Seat map refresh", "6 / 6", bar(100), pill("Done", "ok")],
          ["F-40 Payment reliability", "2 / 8", bar(25, "bad"), pill("Behind", "bad")],
        ]),
    },
    accuracy: {
      name: "Estimate accuracy",
      group: "Sprint Operations",
      html: () =>
        T(["Size", "Stories", "Days planned", "Days actual", "On target"], [
          ["1 pt", "9", "1", "1.3", bar(67)],
          ["2 pts", "14", "2", "3.1", bar(43, "warn")],
          ["3 pts", "11", "3", "4.8", bar(27, "warn")],
          ["5 pts", "6", "5", "9.5", bar(17, "bad")],
          ["8 pts", "3", "8", "14.0", bar(0, "bad")],
        ]) + `<p class="dd-note">Smaller stories land much closer to plan. That's why the splitter exists.</p>`,
    },
    splitter: {
      name: "Story splitter",
      group: "Sprint Operations",
      html: () =>
        `<div class="dd-split"><div class="dd-big"><span class="dd-k">8 pts</span><b>S-241 Offline mode for the captive portal</b><small>Too big to estimate reliably</small></div>
         <div class="dd-arrow">→</div>
         <div class="dd-smalls">${[["3", "Cache portal page for offline load"], ["2", "Show offline banner with retry"], ["3", "Queue login attempts and replay when online"]]
           .map(([p, t]) => `<div><span class="dd-k">${p} pts</span>${t}</div>`).join("")}</div></div>
         <p class="dd-note">Each new story gets its own acceptance criteria, ready to create in Agility with one click.</p>`,
    },
    release: {
      name: "Release readiness",
      group: "Release Readiness",
      html: () =>
        tiles([["64", "stories in the release"], ["49", "done", "ok"], ["8", "in test"], ["5", "at risk", "warn"], ["2", "open defects", "bad"]]) +
        T(["Team", "Done", "", "At risk"], [
          ["Falcon", "18 / 19", bar(95), "0"],
          ["Harbor", "11 / 15", bar(73, "warn"), pill("2", "warn")],
          ["Summit", "9 / 9", bar(100), "0"],
          ["Cedar", "11 / 21", bar(52, "bad"), pill("3", "bad")],
        ]) +
        `<p class="dd-note">Environments: SI ✓ · UAT ✓ · Staging in progress · Production scheduled</p>`,
    },
    qa: {
      name: "QA check",
      group: "QA",
      html: () =>
        `<div class="dd-callout">${pill("3 stories skipped testing", "bad")} Found by reading each story's status history: they went from In Progress straight to Done.</div>` +
        T(["Story", "Team", "Path", "Next step"], [
          ["S-198 Captive portal copy", "Harbor", "In Progress → Done", "4 test cases drafted"],
          ["S-203 Login timeout", "Cedar", "In Progress → Done", "2 test cases drafted"],
          ["S-209 Fare cache TTL", "Harbor", "In Progress → Accepted", "3 test cases drafted"],
        ]) +
        `<p class="dd-note">Also flags regression candidates: in-progress work that touches something shipped in the last two sprints.</p>`,
    },
  };

  const groups = ["Sprint Operations", "Release Readiness", "QA"];
  el.innerHTML = `
    <div class="dd">
      <div class="dd-top"><span class="dd-dots"><i></i><i></i><i></i></span><span class="dd-title">3 dashboards, combined for this demo</span><span class="dd-team">Team Falcon · Sprint 14 · Day 8 of 10</span></div>
      <div class="dd-body">
        <nav class="dd-nav">${groups
          .map((g) => `<div class="dd-g">${g} dashboard</div>${Object.entries(views).filter(([, v]) => v.group === g).map(([k, v]) => `<button data-v="${k}">${v.name}</button>`).join("")}`)
          .join("")}</nav>
        <div class="dd-main" aria-live="polite"></div>
      </div>
    </div>`;
  const main = el.querySelector(".dd-main");
  const pick = (k) => {
    el.querySelectorAll(".dd-nav button").forEach((b) => b.classList.toggle("on", b.dataset.v === k));
    main.innerHTML = `<div class="dd-from">${views[k].group} dashboard</div><h4>${views[k].name}</h4>${views[k].html()}`;
  };
  el.querySelector(".dd-nav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]");
    if (b) pick(b.dataset.v);
  });
  pick("standup");
};

// ---------------------------------------------------------------
// How the summer went
// ---------------------------------------------------------------
FIGURES["delta-timeline"] = function () {
  const steps = [
    ["Discovery", "Got a one-line brief: \"optimize workflow using AI.\" Before building anything, spent the first weeks analyzing how the teams worked, from planning through release, and pinned down six observable bottlenecks."],
    ["First agents", "Started with the most obvious bottleneck, hand-written status updates: two agents for one team, a sprint newsletter and a sprint closeout summary."],
    ["One toolkit for five teams", "Generalized them into a shared toolkit and wrote steering files so the agents knew every team's dates, people, and rules."],
    ["Moved the mechanical work to code", "Realized five agents were just doing math. Rebuilt them as a dashboard: 2–4 seconds per report instead of 60–90, and zero AI tokens. Then added release and QA dashboards."],
    ["A new way to look at the data", "Built a daily history of every story and modeled it in a way that hadn't been done before. Found two clear ways to make planning more accurate, presented them to a 100-person meeting, and facilitated the session on putting them into practice."],
    ["Shipped it", "Packaged everything as one-click installers with an auto-updater and onboarding docs, then presented the whole thing to leadership."],
  ];
  return `<ol class="tl">${steps.map(([h, p], i) => `<li><span class="tl-n">${String(i + 1).padStart(2, "0")}</span><div><b>${h}</b><p>${p}</p></div></li>`).join("")}</ol>`;
};

// ---------------------------------------------------------------
// The agent library
// ---------------------------------------------------------------
FIGURES["delta-agents"] = function () {
  const groups = [
    ["Every day", [["Standup prep", "Who moved what, who's stuck, what to ask about"]]],
    ["Every sprint", [
      ["Sprint planning advisor", "Checks the plan against capacity and past velocity"],
      ["Backlog health check", "Flags stories that aren't ready to start"],
      ["Sprint closeout", "Done, carried over, dropped, and why"],
      ["Sprint newsletter", "A one-page update leadership can read in two minutes"],
    ]],
    ["Planning", [
      ["Story writer", "Turns a rough idea into a story with acceptance criteria"],
      ["Feature breakdown", "Splits a feature into right-sized stories"],
      ["Increment planner", "Drafts the quarterly plan and release schedule"],
    ]],
    ["Leadership updates", [
      ["Weekly summary", "What happened this week across all five teams"],
      ["Weekly status deck", "Builds the weekly PowerPoint from live data"],
      ["Monthly release report", "Where the monthly release stands"],
      ["Increment report", "The quarterly executive summary, as a doc and a deck"],
    ]],
    ["Quality", [["Test case generator", "Writes structured test cases from a story's acceptance criteria"]]],
    ["Keeping it running", [
      ["Setup wizard", "Walks a new user through first-time setup"],
      ["Prompt coach", "Helps teammates write better requests"],
      ["Agent updater", "Pulls the latest version of every agent"],
      ["Publish agents", "Pushes new versions out to everyone"],
    ]],
  ];
  return `<div class="ag">${groups
    .map(([g, list]) => `<div class="ag-g"><h5>${g}</h5>${list.map(([n, d]) => `<div class="ag-c"><b>${n}</b><span>${d}</span></div>`).join("")}</div>`)
    .join("")}</div>`;
};

// ---------------------------------------------------------------
// Finding → recommendation → what I built
// ---------------------------------------------------------------
FIGURES["delta-insight"] = function () {
  const rows = [
    ["Smaller stories were much easier to estimate accurately", "Split stories to 3 points or less", "Story splitter + estimate-accuracy report"],
    ["Testing was where work most often waited", "Track tester load every day", "QE load ratio in standup prep + capacity heatmap"],
    ["Passenger-facing changes carry the most risk at release", "Put them behind feature flags", "Recommendation I brought to the working session"],
  ];
  return `<div class="ins"><div class="ins-h"><span>What the data showed</span><span>What I recommended</span><span>What I built</span></div>${rows
    .map((r) => `<div class="ins-r">${r.map((c) => `<div>${c}</div>`).join("")}</div>`)
    .join("")}</div>`;
};

// ---------------------------------------------------------------
// The three install kits
// ---------------------------------------------------------------
FIGURES["delta-kits"] = function () {
  const kits = [
    ["Scrum Master starter kit", "For a new Scrum Master on day one", ["11 agents", "6 steering files", "All 3 dashboards", "Setup checklist"]],
    ["Full toolkit", "Everything, for the power users", ["17 agents", "13 steering files", "~20 helper scripts", "Auto-updater for Windows + Mac"]],
    ["Weekly status deck kit", "Just the weekly PowerPoint, for people who only need that", ["1 agent", "Data + build scripts", "4 steering files"]],
  ];
  return `<div class="kits">${kits
    .map(([n, who, items], i) => `<div class="kit${i === 1 ? " kit-main" : ""}"><b>${n}</b><span>${who}</span><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></div>`)
    .join("")}</div>`;
};

// ---------------------------------------------------------------
// Each bottleneck I observed, and the tool built to address it
// ---------------------------------------------------------------
FIGURES["delta-bottlenecks"] = function () {
  const rows = [
    ["Standup prep was manual", "Before every standup, Scrum Masters clicked through Agility story by story to work out who had moved what and who was stuck.", "Standup prep report: moved vs. didn't move, blocked and stale work, and tester load, in one click."],
    ["Status updates were written by hand", "Sprint newsletters, weekly decks, release notes, and quarterly reports were rebuilt from scratch every time, by copying numbers out of Agility.", "Writing agents that draft each one from live data, with rules so they never overstate progress."],
    ["Release status took 30+ minutes to piece together", "Knowing where a monthly release stood meant querying five teams' work separately and adding it up.", "Release Readiness dashboard: one scorecard across all five teams, with at-risk work flagged."],
    ["Work could reach Done without being tested", "Nothing flagged a story that skipped testing, and test cases were written by hand.", "QA dashboard that reads each story's status history, plus an agent that drafts test cases from acceptance criteria."],
    ["Planning started with stories that weren't ready", "Stories came into planning missing acceptance criteria, unestimated, or too big, and plans could exceed the team's capacity.", "Backlog health check, planning advisor, story writer, and story splitter."],
    ["Nobody could see trends over time", "Agility shows what's true today, not how work moved over weeks, so where time went was a matter of opinion.", "A daily data pipeline, and the analysis it made possible (below)."],
  ];
  return `<div class="bn">${rows
    .map(([t, saw, built], i) => `
      <div class="bn-r">
        <span class="bn-n">${String(i + 1).padStart(2, "0")}</span>
        <div class="bn-saw"><b>${t}</b><p>${saw}</p></div>
        <span class="bn-arrow" aria-hidden="true">→</span>
        <div class="bn-built"><span>What I built</span><p>${built}</p></div>
      </div>`)
    .join("")}</div>`;
};

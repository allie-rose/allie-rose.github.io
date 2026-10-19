// ============================================================
//  THIS IS THE ONLY FILE YOU NEED TO EDIT.
//  Change the text inside the quotes. Keep the quotes, commas,
//  and brackets exactly as they are.
//
//  Each project and research item has a "slug" (its page name,
//  no spaces) and "details" (what shows on its own page).
//  "board" is the short text on the homepage departures board.
//  A section can have: h (heading), p (paragraphs), list
//  (bullets), quote (a pull quote), and code (a code excerpt).
//  Optional on a page: role, stack, stats, and demoAfter (true =
//  show the demo after the text instead of before it).
// ============================================================

window.PORTFOLIO = {
  name: "Allie Rose",
  tagline: "MIS student at UGA. I build things with AI, and I like figuring out how its decisions connect to business and ethics.",
  intro:
    "I'm finishing a certificate in AI alongside my MIS degree. Last summer at Delta I built AI agents and dashboards for five software teams. On my own time I build small tools and run experiments on how AI models make decisions. Every project below has a demo you can try.",
  location: "UGA '27 · MIS + Artificial Intelligence · Athens, GA",
  email: "allie-rose1@outlook.com",
  links: {
    gitlab: "", // add your GitLab profile link once you have one
    linkedin: "https://www.linkedin.com/in/alexandrajrose/",
    resume: "resume.pdf?v=20261019", // résumé copy with phone number and address removed
  },

  // ---- AI PROJECTS ------------------------------------------
  projects: [
    {
      slug: "sprint-toolkit",
      board: { title: "AI CONSULTING", via: "DELTA", status: "SHIPPED" }, // shown on the homepage departures board
      title: "Internal AI Consulting at Delta",
      year: "2026",
      description:
        "My brief was one line: \"optimize workflow using AI.\" I found six places where better tools could save five software teams time, built something for each, and presented a sprint planning analysis to about 100 people.",
      tags: ["AI Strategy", "AI Agents", "Python", "Dashboards"],
      link: "",
      details: {
        summary:
          "My brief was one line: \"optimize workflow using AI.\" I spent my first weeks learning how the five software teams behind Delta's in-flight Wi-Fi worked, found six places where better tools could save them time, and built something for each. I also built a way to look at their sprint data that hadn't existed before, and presented what it showed to about 100 people.",
        role: "Data Analytics and AI Intern, Delta Air Lines (May–Aug 2026)",
        stack: ["Python", "Flask", "Agility REST + History API", "SQLite", "Kiro AI IDE"],
        stats: [
          ["5–8 hrs", "saved per sprint, per Scrum Master"],
          ["100", "people at my findings presentation"],
          ["17", "AI agents"],
          ["3", "dashboards"],
        ],
        demo: "delta-dashboard",
        demoNote:
          "A recreation of the three dashboards I built (Sprint Operations, Release Readiness, and QA), combined into one window. All teams, people, and numbers are made up.",
        sections: [
          {
            h: "What I noticed",
            p: [
              "I followed work from planning to release and wrote down where people spent time on routine steps. The teams were great to work with, and each tool came from something I watched them do.",
            ],
            figure: "delta-bottlenecks",
          },
          {
            h: "Sprint planning analysis",
            p: [
              "Agility shows where work is today, not how it got there, so I built a daily history of every story. Using 66 finished stories over three sprints, I compared planned time with actual time and split each story into development and testing. Smaller stories were much easier to estimate, and testing was where stories spent the most time.",
              "I presented this to about 100 people, then ran a working session on what to change. It started a review of how the teams estimate work.",
            ],
            figure: "delta-insight",
          },
          {
            h: "Dashboards and agents",
            p: [
              "Questions with exact answers went into dashboards that read Agility directly: 2–4 seconds per report and no AI involved. Writing went to AI agents.",
            ],
            figure: "delta-architecture",
          },
          {
            h: "Agents",
            p: [
              "17 agents in Kiro, each a markdown file with one job and its rules, like never calling a story shipped unless it's marked Done. They all read shared steering files with the teams' sprint dates, rosters, status rules, and report formats, so nobody has to explain context in a prompt and anyone on the team can update them. A steering file looks like this (made-up details):",
            ],
            code:
              "# steering/sprint-conventions.md\n\n- Sprints are two weeks and start on Wednesdays.\n- Status flow: Backlog → In Progress → In Test → Done → Accepted.\n- Story points: 1, 2, 3, 5, 8. Anything over 3 should be split.",
          },
          {
            h: "Story Writer",
            p: [
              "The agent I'm proudest of. You describe a story in one sentence, and it pulls what it needs from Agility and writes the whole thing. An example with made-up details:",
            ],
            code:
              "You: \"Let passengers retry login when the Wi-Fi portal times out.\"\n\nTitle: Retry login after portal timeout\nFeature: F-31 Faster portal login\nSize: 3 points\n\nAs a passenger, when the Wi-Fi login page times out,\nI want a clear way to try again,\nso that I can get online without restarting the whole flow.\n\nAcceptance criteria:\n- After a timeout, the page shows a \"Try again\" button.\n- Retrying keeps anything the passenger already entered.\n- After 3 failed retries, show how to get help.",
          },
          {
            h: "Results",
            list: [
              "5–8 hours saved per sprint for each Scrum Master.",
              "Release status went from 30+ minutes to one click. The release manager and five team leads used it.",
              "The planning analysis led to a review of how the teams estimate work.",
              "Everything installs in one click on Windows or Mac and updates itself, with onboarding docs so the teams can keep using it.",
            ],
          },
        ],
      },
    },
    {
      slug: "fare-check",
      board: { title: "FARE CHECK", via: "CHROME", status: "LIVE DEMO" }, // shown on the homepage departures board
      title: "Fare Check (for delta.com)",
      year: "2026",
      description:
        "A feature idea for delta.com: hover over a fare to see whether it's a good price for that route. I built it as a Chrome extension and wrote up what it could do for Delta's pricing.",
      tags: ["Product Idea", "LLMs", "Browser Extension", "JavaScript"],
      link: "https://github.com/allie-rose/fare-check",
      details: {
        summary:
          "A feature idea for delta.com: hover over a fare and a badge says whether it's cheap, average, or expensive for that route, with a one-line reason from Gemini. I built it as a Chrome extension to see how it would work.",
        stack: ["JavaScript", "Chrome Extensions (Manifest V3)", "Gemini 2.0 Flash API"],
        demo: "delta-helper",
        demoNote:
          "A fake flight results page with the extension running. Hover a price. These ratings are examples I wrote; the real extension asks Gemini live.",
        sections: [
          {
            h: "What it could do for Delta",
            p: ["Ideas I'd want to test with people who know Delta's pricing:"],
            list: [
              "Shoppers who aren't sure a fare is fair often leave to compare on other sites. An answer next to the price gives them a reason to book on delta.com.",
              "The same check could show when Comfort+ or First is good value on a route, which helps sell the upgrade.",
              "Each check, and whether the person then books, says something about how customers see that price. Collected anonymously, that could show which routes, cabins, and dates feel high, and help decide when to run sales.",
              "If Delta built it, I'd use Delta's own fare history instead of an AI's general sense of prices, and labels like \"great value\" or \"high demand\" instead of \"expensive.\"",
            ],
          },
          {
            h: "How it works",
            p: [
              "Fares load after the page opens, so a MutationObserver watches for prices and adds a hover listener to each. On first hover, it reads the price and route off the page and sends Gemini this prompt. Asking for fixed JSON makes the answer easy to turn into a colored badge.",
            ],
            code:
              "A flight from ${origin} to ${destination} costs ${priceText}.\nIs this cheap, average, or expensive for this specific route?\nReply ONLY with this JSON:\n{\"rating\":\"CHEAP\",\"reason\":\"one sentence for this specific route\"}\nRating must be CHEAP, AVERAGE, or EXPENSIVE.",
          },
          {
            h: "Not done yet",
            list: [
              "The popup's \"Analyze This Flight\" button still says \"Coming soon.\"",
              "The API key lives in a local config file. To share the extension, the Gemini call should move to a small server.",
              "Ratings come from Gemini, not real fare history.",
            ],
          },
        ],
      },
    },
    {
      slug: "coffee-assistant",
      board: { title: "COFFEE ORDER AI", via: "JEV", status: "19/20 RIGHT" }, // shown on the homepage departures board
      title: "Coffee Order Assistant (built on Jev)",
      year: "2026",
      description:
        "Type a coffee order the way you'd say it and get the exact drink and price. It runs on Jev, a model that answers with probabilities instead of text, so it knows when to ask instead of guess. 19 of 20 test orders right.",
      tags: ["LLMs", "Python", "New AI tech"],
      link: "https://github.com/allie-rose/coffee-order-assistant",
      details: {
        summary:
          "An assistant that turns orders like \"venti caramel mocha with whip\" into an exact menu drink and price, and asks a question when it isn't sure. It runs on Jev, a model from TypeSafe that answers with probabilities instead of writing text.",
        stack: ["Python", "TypeSafe SDK", "Jev (jev-1.13)", "pytest"],
        stats: [
          ["19 / 20", "test orders right"],
          ["0", "wrong orders placed without a check"],
        ],
        demo: "coffee",
        demoNote:
          "Real results from my test run. Pick a message, then look under the reply at the numbers Jev sent back.",
        sections: [
          {
            h: "Why Jev",
            p: [
              "A chatbot given the menu mostly works, but it can invent a drink or a price and sounds equally sure when it's guessing. Jev doesn't write anything. You give it a question and the allowed answers, and it returns how likely each one is. It never sees a price or talks to the customer; my Python code applies the menu rules and writes the reply.",
            ],
          },
          {
            h: "The questions",
            p: [
              "Each order gets 13 questions in one request: intent, drink, size, temperature, milk, sweetener, whether each of those four was mentioned at all, and yes/no for extra shot, whipped cream, and decaf. Two of them:",
            ],
            code:
              "SIZE = Choice(\n    instructions=\"What cup size does the customer want?\",\n    criteria={\n        \"small\": \"small, short, tall, 8 or 12 ounces\",\n        \"medium\": \"medium, regular, grande, 16 ounces\",\n        \"large\": \"large, big, venti, 20 ounces or more\",\n    },\n)\nSIZE_STATED = Noul(\n    instructions=\"Does `customer_message` say anything about the cup size?\"\n)",
          },
          {
            h: "Using the probabilities",
            p: [
              "An order is only as confident as its least certain detail. Under 80%, the assistant reads the order back. For \"something warm and chocolatey for my kid,\" Jev was 100% on hot chocolate but 68% that it was an order at all, so it confirms first. It also leaned \"small\" (88%) but gave 1% odds that a size was mentioned, so the code used the default medium.",
            ],
          },
          {
            h: "Testing",
            list: [
              "20 test orders with known answers, including Starbucks sizes, \"hot cold brew,\" off-menu drinks, and messages that aren't orders.",
              "The one miss was \"small black coffee please\": Jev split 61% drip and 32% americano, so it asked. Not what the test expected, but no wrong order.",
              "I cached Jev's answers and tried cutoffs from 50% to 90% for free. None let a wrong order through.",
            ],
          },
        ],
      },
    },
  ],

  // ---- RESEARCH ---------------------------------------------
  research: [
    {
      slug: "vending-machine-ethics",
      board: { title: "VENDING MACHINE TEST", via: "GEMINI", status: "PROFIT -71%" }, // shown on the homepage departures board
      title: "The Vending Machine Test, Rerun",
      venue: "Independent experiment · 2026",
      summary:
        "After a viral story about AI models cheating at running a vending machine, I ran my own version with Gemini three ways. Spelling out the legal rules dropped 30-day profit from $2,970 to $860.",
      details: {
        summary:
          "I read about the viral vending machine test, where AI models told to maximize profit rejected refunds, manipulated pricing, and coordinated with competitors. Researchers said part of the reason was that the AI knew it was in a simulation. I found this super interesting and wanted to learn more, so I ran my own version with Gemini to see how much framing and prompt rules actually influence AI decision-making.",
        demo: "vending",
        demoAfter: true,
        demoNote: "Switch between the three runs.",
        sections: [
          {
            h: "Three prompts, one goal",
            p: [
              "Every prompt asked Gemini to maximize profit over 30 days running a vending machine in a busy university student center, with full control over products, pricing, inventory, refunds, and competition. What changed was the setting: a pure simulation, the real world with ethics left up to Gemini, and the real world with explicit legal and ethical rules.",
              "The simulation run was the wildest. Near the end it stopped ordering inventory, sold everything at premium prices, denied refunds based on customer \"lifetime value,\" and undercut a competitor below cost before raising prices. Gemini called this \"calculated coldness.\"",
            ],
          },
          {
            h: "The comparison that mattered",
            p: [
              "The two real-world runs were identical except that the third spelled out the rules: consumer protection and antitrust laws, no lying, transparent refunds, audits, and removal for bad behavior. Profit went from $2,970.45 to $860.10.",
            ],
            quote:
              "When ethics are suggested, they're negotiable. When ethics are hard-coded as enforceable rules, they're not.",
          },
          {
            p: [
              "I started out just wanting to see how AI would price snacks and manage inventory, and ended up thinking way more about incentives, leadership, and AI governance.",
            ],
          },
        ],
      },
    },
    {
      slug: "prompt-compression",
      board: { title: "PROMPT COMPRESSION", via: "LLM", status: "TOKENS -40%" }, // shown on the homepage departures board
      title: "Does a Shorter Prompt Cost Less?",
      venue: "Class experiment · UGA · 2026",
      summary:
        "Same email, four ways of asking for it. Cutting the filler used 40% fewer tokens and the email was just as good. Typos and shorthand saved less, and shorthand made it worse.",
      details: {
        summary:
          "I asked the same model to write the same email, declining a vendor's price increase, four ways: chatty, stripped down, full of typos, and in texting shorthand. Then I counted tokens and graded the emails.",
        demo: "compression",
        demoNote: "Pick a prompt to see what it cost.",
        sections: [
          {
            h: "What I found",
            list: [
              "The compressed prompt used 40% fewer tokens than the chatty one, with the same quality.",
              "The model understood every typo and abbreviation, but shorthand dropped quality from 5 to 4.",
              "Almost all of the savings came from the input. The emails were about the same length either way.",
            ],
          },
        ],
      },
    },
  ],

  // ---- WORK EXPERIENCE (newest first) ------------------------
  experience: [
    {
      role: "Data Analytics and AI Intern",
      org: "Delta Air Lines · Internal AI consulting",
      dates: "May – Aug 2026",
      points: [
        "Took an open-ended brief (\"optimize workflow using AI\") for 5 in-flight Wi-Fi software teams, found six places where better tooling could save time, and built a tool for each.",
        "Built three Python/Flask dashboards (10 sprint reports, release readiness, QA tracking) and 15+ AI agents that write newsletters, release notes, and exec decks. Saves each Scrum Master 5–8 hours per sprint.",
        "Built a new view of sprint data (66 stories, development vs. testing time) and found two ways to make planning more accurate; presented to about 100 people and ran the follow-up working session, which started a review of estimation practices.",
        "Shipped it as one-click installers with an auto-updater and onboarding docs so the teams could keep using it after I left.",
      ],
    },
    {
      role: "Business Analyst Intern",
      org: "Delta Air Lines",
      dates: "May – Aug 2025",
      points: [
        "Built a Power BI dashboard tracking developer progress and data accuracy, and presented it to senior leadership as something 50+ teams could use.",
        "Wrote user stories and requirements for the Delta Sync Wi-Fi team.",
        "Pitched process improvements with a cost-benefit analysis in my capstone presentation to senior leadership.",
      ],
    },
    {
      role: "Leonard Leadership Scholar",
      org: "Institute for Leadership Advancement, UGA",
      dates: "Mar 2025 – Present",
      points: [
        "One of 32 students in a 2-year leadership cohort.",
        "Led a consulting project for RIVL Foundation: ranked 38+ potential partners for its $80M capital campaign and wrote the outreach playbook.",
      ],
    },
  ],

  // ---- SKILLS / TOOLS ----------------------------------------
  skills: ["Agentic AI", "Prompt Engineering", "Python", "Flask", "REST APIs", "Power BI", "AWS CloudWatch", "Java", "Excel"],
};

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
// ============================================================

window.PORTFOLIO = {
  name: "Allie Rose",
  tagline: "MIS student at UGA. I build things with AI, and I like figuring out how its decisions connect to business and ethics.",
  intro:
    "I'm finishing a certificate in AI alongside my MIS degree. Last summer at Delta I built AI agents and dashboards for five software teams. On my own time I build small tools when something bugs me, and run experiments on how AI models make decisions. Every project below has a demo you can try and the details of how I made it.",
  location: "UGA '27 · MIS + Artificial Intelligence · Athens, GA",
  email: "allie-rose1@outlook.com",
  links: {
    gitlab: "", // add your GitLab profile link once you have one
    linkedin: "https://www.linkedin.com/in/alexandrajrose/",
    resume: "resume.pdf", // résumé copy with phone number and address removed
  },

  // ---- AI PROJECTS ------------------------------------------
  projects: [
    {
      slug: "sprint-toolkit",
      board: { title: "AI CONSULTING", via: "DELTA", status: "SHIPPED" }, // shown on the homepage departures board
      title: "Internal AI Consulting at Delta",
      year: "2026",
      description:
        "Delta gave me a one-line brief: \"optimize workflow using AI.\" I built a toolkit five software teams could install in one click, saving each Scrum Master 5–8 hours a sprint. I also modeled their sprint data in a new way and found two clear ways to make planning more accurate, which I presented to a 100-person meeting.",
      tags: ["AI Strategy", "AI Agents", "Python", "Dashboards"],
      link: "",
      details: {
        summary:
          "Delta gave me a one-line brief: \"optimize workflow using AI.\" By the end of the summer, the five software teams behind Delta's in-flight Wi-Fi had a toolkit they could install in one click: three dashboards, 17 AI agents, and a data pipeline. I also modeled the teams' sprint data in a new way, found two clear ways to make their planning more accurate, presented them to a 100-person meeting, and led the working session on putting them into practice.",
        role: "Data Analytics and AI Intern, Delta Air Lines (May–Aug 2026)",
        stack: ["Python", "Flask", "Agility REST + History API", "SQLite", "Kiro AI IDE", "PowerShell / bash"],
        stats: [
          ["5–8 hrs", "saved per sprint, per Scrum Master"],
          ["100", "people at the meeting where I presented my findings"],
          ["17", "AI agents"],
          ["3", "dashboards, 10+ one-click reports"],
        ],
        demo: "delta-dashboard",
        demoNote:
          "A working recreation of the dashboards I built. At Delta these were three separate apps (Sprint Operations, Release Readiness, and QA); I've combined them here so you can click through everything in one place. Every team, person, story, and number is made up.",
        sections: [
          {
            h: "How the summer went",
            figure: "delta-timeline",
          },
          {
            h: "A new way to look at the data",
            p: [
              "I wanted to see how well sprint plans matched what actually happened, so I modeled the teams' work in a way that hadn't been done before: a daily history of every story, comparing the time planned with the time it took, and splitting each story's time into development and testing. I ran it on 66 finished stories across three sprints.",
              "Two patterns stood out. Smaller stories were much easier to estimate accurately, so breaking work down would make plans more reliable. And testing was where work most often waited, so tester capacity was worth tracking right alongside developer capacity.",
              "I presented the findings to a meeting of about 100 people, then facilitated a working session where we turned them into changes, starting from my recommendations. I built tools to support those changes, and the teams began reviewing how they estimate work.",
            ],
            figure: "delta-insight",
          },
          {
            h: "The design",
            p: [
              "Not everything needed AI. Questions with exact answers (what's blocked, what skipped testing) are faster and more trustworthy as code that reads the data directly. Writing (newsletters, release notes, exec decks) is where AI earns its keep. So I built both, on top of the same data. Moving five agents' worth of math into a dashboard cut each report from 60–90 seconds to 2–4, with zero AI tokens.",
            ],
            figure: "delta-architecture",
          },
          {
            h: "17 agents",
            p: [
              "Each agent is a markdown file in Kiro, an AI coding tool, that describes one repeatable job and the rules for doing it. Teammates just ask in plain English.",
            ],
            figure: "delta-agents",
          },
          {
            h: "Rules that make them trustworthy",
            p: [
              "An AI writing a status update for leadership can't be allowed to round \"almost done\" up to \"shipped.\" Here's the shape of one agent, recreated with made-up details:",
            ],
            code:
              "# Sprint newsletter agent (recreated example)\n\nGoal: a one-page update leadership can read in two minutes.\n\nSteps:\n1. Pull every story in the sprint from Agility.\n2. Group them: shipped, in testing, carried over.\n3. Write an exec summary, then a table of every story.\n\nRules:\n- Only call a story \"shipped\" if its status is Done or Accepted.\n- Never invent a number. If a metric isn't in the data, leave it out.\n- Use the team's own terms (see steering/glossary.md).",
          },
          {
            h: "Steering files",
            p: [
              "Every agent reads shared plain-text files about how the teams work: sprint dates, rosters, how statuses flow, what reports should look like. Nobody re-explains context in a prompt, it uses fewer tokens, and anyone can edit them, so the toolkit doesn't need a developer to maintain it.",
            ],
            code:
              "# steering/sprint-conventions.md (recreated example)\n\n- Sprints are two weeks and start on Wednesdays.\n- Status flow: Backlog → In Progress → In Test → Done → Accepted.\n- \"At risk\" = not In Test with 3 or fewer working days left.\n- Story points: 1, 2, 3, 5, 8. Anything over 3 should be split.\n- Reports: lead with the summary, then the table. No jargon in the summary.",
          },
          {
            h: "Shipped like a product",
            p: [
              "A tool only matters if people keep using it after the intern leaves. Everything installs in one click on Windows or Mac from SharePoint, updates itself, runs on the user's own computer, and asks before changing anything in Agility. I wrote a \"say this, get this\" quick-start and an onboarding guide to the teams' systems.",
            ],
            figure: "delta-kits",
          },
          {
            h: "Results",
            list: [
              "5–8 hours saved per sprint for each Scrum Master.",
              "Release status went from 30+ minutes of digging to one click; the release manager and five team leads used it.",
              "Presented my planning analysis to a 100-person meeting and facilitated the follow-up session on putting it into practice, which started a review of how the teams estimate work.",
            ],
          },
        ],
      },
    },
    {
      slug: "delta-helper",
      board: { title: "DELTA HELPER", via: "CHROME", status: "LIVE DEMO" }, // shown on the homepage departures board
      title: "Delta Helper Chrome Extension",
      year: "2026",
      description:
        "There was something I wished Delta.com had: a way to tell if a fare is actually a good price. It didn't exist, so I built it as a Chrome extension.",
      tags: ["Product Idea", "LLMs", "Browser Extension", "JavaScript"],
      link: "https://github.com/allie-rose/delta-helper",
      details: {
        summary:
          "Delta.com lists prices but never tells you whether one is a good deal. I wanted that answer right next to the fare, so I built it: hover over a price and a badge says cheap, average, or expensive for that route, with a one-line reason from Gemini.",
        role: "Solo project",
        stack: ["JavaScript", "Chrome Extensions (Manifest V3)", "Gemini 2.0 Flash API"],
        stats: [
          ["~80", "lines of JavaScript"],
          ["1 API call", "per fare, only when you hover"],
        ],
        demo: "delta-helper",
        demoNote:
          "A fake flight results page with the extension running on it. Hover a price. The ratings are example answers I wrote for the demo; the real extension asks Gemini live.",
        sections: [
          {
            h: "How it works",
            list: [
              "Delta loads fares after the page opens, so a MutationObserver watches for new price elements and attaches a hover listener to each one.",
              "On first hover it reads the price, origin, and destination off the page and sends them to Gemini.",
              "Gemini has to answer in JSON with one of three ratings. The code strips any markdown fences, parses it, and colors the badge green, orange, or red. The reason goes in the tooltip.",
              "Each price is only checked once. If the call fails, the badge shows a gray \"?\" instead of breaking the page.",
            ],
          },
          {
            h: "The prompt",
            p: ["This is the whole prompt. Forcing a fixed JSON shape is what makes the answer easy for code to use."],
            code:
              "A flight from ${origin} to ${destination} costs ${priceText}.\nIs this cheap, average, or expensive for this specific route?\nReply ONLY with this JSON:\n{\"rating\":\"CHEAP\",\"reason\":\"one sentence for this specific route\"}\nRating must be CHEAP, AVERAGE, or EXPENSIVE.",
          },
          {
            h: "What's not done yet",
            list: [
              "The \"Analyze This Flight\" button in the popup still says \"Coming soon.\"",
              "The API key sits in a local config file on my computer. To share the extension, I'd move the Gemini call to a small server.",
              "Ratings come from Gemini's general sense of prices, not real fare history. Plugging in historical fares would make them trustworthy.",
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
        "Type a coffee order the way you'd say it and get the exact drink and price. I built it on Jev, a model that returns probabilities instead of text, so I could see how sure it was about every detail. 19 of 20 test orders right.",
      tags: ["LLMs", "Python", "New AI tech"],
      link: "https://github.com/allie-rose/coffee-order-assistant",
      details: {
        summary:
          "\"Venti caramel mocha with whip\" isn't how a menu is written. I built an assistant that turns orders like that into an exact drink and price, and asks a question when it isn't sure. It runs on Jev, a newer kind of model from TypeSafe that answers with probabilities instead of writing text.",
        role: "Solo project",
        stack: ["Python", "TypeSafe SDK", "Jev (jev-1.13)", "pytest"],
        stats: [
          ["19 / 20", "test orders right"],
          ["13", "questions in 1 request"],
          ["0", "wrong orders placed without a check"],
        ],
        demo: "coffee",
        demoNote:
          "Real results from my test run. Pick a message, then look under the reply at the raw numbers Jev sent back.",
        sections: [
          {
            h: "Why Jev and not a chatbot",
            p: [
              "If you hand a chatbot the menu and ask it to take orders, it mostly works. But it can make up a drink or a price, and it sounds just as confident when it's guessing. You can't tell from the text how sure it was.",
              "Jev doesn't write text. You give it a question and a list of allowed answers, and it returns how likely each one is. There are three question types: a Choice (pick one from a list), a Noul (yes or no, with the chance of yes), and a Score (a spot on a scale). I used Choices and Nouls.",
              "So Jev never sees a price and never talks to the customer. It answers questions about the message. My Python code applies the menu rules, does the math, and writes the reply.",
            ],
          },
          {
            h: "The questions",
            p: [
              "Every order gets the same 13 questions in one request: what they're trying to do, which drink, size, temperature, milk, sweetener, a \"did they even mention it?\" for each of those four, and a yes/no for extra shot, whipped cream, and decaf. Here's what two of them look like in my code:",
            ],
            code:
              "SIZE = Choice(\n    instructions=\"What cup size does the customer want?\",\n    criteria={\n        \"small\": \"small, short, tall, 8 or 12 ounces\",\n        \"medium\": \"medium, regular, grande, 16 ounces\",\n        \"large\": \"large, big, venti, 20 ounces or more\",\n    },\n)\nSIZE_STATED = Noul(\n    instructions=\"Does `customer_message` say anything about the cup size?\"\n)",
          },
          {
            h: "Using the probabilities",
            p: [
              "An order's confidence is its least certain field, because one wrong detail ruins the drink. Under 80%, the assistant reads the order back before placing it. If two drinks are close, it asks which one.",
              "\"Something warm and chocolatey for my kid\" is a good example. Jev was 100% on hot chocolate but only 68% that the message was an order at all, so it gets read back. Jev also leaned \"small\" (88%), but only gave 1% odds that the customer mentioned a size, so the code ignored that guess and used the default medium.",
            ],
          },
          {
            h: "Testing it",
            list: [
              "20 test orders with known right answers, including Starbucks sizes, contradictions (\"hot cold brew\"), off-menu drinks, and things that aren't orders at all.",
              "19 of 20 right. The miss was \"small black coffee please\": Jev split 61% drip coffee and 32% americano, so the assistant asked instead of guessing. Not what the test expected, but it didn't place a wrong order.",
              "I cached Jev's answers, so I could try confidence cutoffs from 50% to 90% without paying for new calls. None of them let a wrong order through.",
              "The non-AI code has its own pytest suite that runs with no API calls.",
            ],
          },
          {
            h: "Next",
            list: [
              "More than one drink per message (\"a latte and two cappuccinos\").",
              "Edits to an order already in progress (\"actually make it oat\").",
              "An allergy check that sends nut-milk orders to a barista.",
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
          "I read about the viral vending machine test, where AI models told to maximize profit started denying refunds and coordinating prices with competitors. Researchers pointed to the fact that the models knew it was a simulation. I wanted to see for myself how much the framing and the rules in a prompt change what an AI decides to do.",
        role: "Designed and ran it, wrote it up",
        stack: ["Google Gemini"],
        stats: [
          ["3", "prompts, same goal"],
          ["$2,970", "profit, ethics suggested"],
          ["$860", "profit, ethics spelled out"],
        ],
        demo: "vending",
        demoNote: "Switch between the three runs.",
        sections: [
          {
            h: "Setup",
            p: [
              "All three prompts had the same goal: maximize profit over 30 days running a vending machine in a busy university student center. Gemini controlled products, pricing, restocking, refunds, competition, and demand shifts. I only changed whether it was told this was a simulation, and how ethics were described.",
            ],
          },
          {
            h: "What stood out",
            p: [
              "Run 1 was the wildest. Once the end date got close, it stopped restocking, sold off everything at premium prices, denied refunds based on customer \"lifetime value,\" and priced a competitor out before raising prices again. Gemini called its own approach \"calculated coldness.\"",
              "But the comparison that mattered most was Runs 2 and 3. Same campus, same real students, same goal. The only difference was that Run 3 listed the actual rules: consumer protection and antitrust laws, no lying, transparent refunds, audits, and removal for bad behavior.",
            ],
            quote:
              "When ethics are suggested, they're negotiable. When ethics are hard-coded as enforceable rules, they're not.",
          },
          {
            h: "Where I landed",
            p: [
              "The rules made it safer and cut profit by more than two-thirds. So if a company needs to hit quarterly numbers, which system do they pick? I started this wanting to see how an AI prices snacks and ended up thinking a lot more about incentives, leadership, and AI governance.",
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
          "I asked the same model to write the same email four ways: chatty, stripped down, full of typos, and in texting shorthand. Then I counted tokens and graded the results.",
        role: "Designed and ran it",
        stack: ["LLM API"],
        stats: [
          ["283 → 169", "tokens, verbose vs. compressed"],
          ["5 / 5", "quality either way"],
        ],
        demo: "compression",
        demoNote: "Pick a prompt to see what it cost.",
        sections: [
          {
            h: "Setup",
            p: [
              "The task was declining a vendor's price increase without damaging the relationship. Same model, same task. Only the wording of the request changed.",
            ],
          },
          {
            h: "Results",
            list: [
              "Compressed used 40% fewer tokens than verbose and scored the same on quality.",
              "The model understood every typo and abbreviation without asking, but messy prompts saved less than clean short ones, and shorthand dropped quality from 5 to 4.",
              "Most of the savings were on the input side. The emails came out about the same length no matter how I asked.",
            ],
          },
          {
            h: "Why I care",
            p: [
              "One prompt saves a fraction of a cent. An agent that chains ten calls together pays that difference ten times, on every run.",
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
        "Took an open-ended brief (\"optimize workflow using AI\") for 5 in-flight Wi-Fi software teams, found the six biggest bottlenecks, and built the fix.",
        "Built three Python/Flask dashboards (10 sprint reports, release readiness, QA tracking) and 15+ AI agents that write newsletters, release notes, and exec decks. Saves each Scrum Master 5–8 hours per sprint.",
        "Modeled sprint data in a new way (66 stories, development vs. testing time) and found two clear ways to make planning more accurate; presented them to a 100-person meeting and facilitated the session on putting them into practice, which started a review of estimation practices.",
        "Shipped it as one-click installers with an auto-updater and onboarding docs, so the teams kept using it after I left.",
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

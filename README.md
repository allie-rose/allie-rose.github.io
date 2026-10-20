# My AI Portfolio

A simple portfolio site showing AI projects, research, and work experience. It's hosted free on GitLab Pages.

## How to update the content

Edit **`content.js`**. It's the only file you need to touch. Change the text inside the quotes, and copy a `{ ... },` block to add another project, paper, or job. Each project's `details` section fills in its own page (`project.html?p=<slug>`).

To add a resume, put `resume.pdf` in this folder and set `resume: "resume.pdf"` in `content.js`.

## Where it lives

The site is hosted for free on GitHub Pages at **https://allie-rose.github.io**, from the repo `allie-rose/allie-rose.github.io`.

## How to update it

Edit `content.js` (you can even do it on github.com: open the file, click the pencil icon, and commit). GitHub Pages republishes the site about a minute after every change.

## Preview on your computer

Double-click `index.html` to open it in your browser.

## If a change doesn't show up

Browsers keep a saved copy of the site for up to 10 minutes. Press **Cmd + Shift + R** to skip it. The `?v=...` at the end of each file link in `index.html` and `project.html` forces a fresh download; change that number whenever you edit the CSS or JavaScript.

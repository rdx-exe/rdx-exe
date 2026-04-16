const fs = require("fs");
const https = require("https");
const path = require("path");

const username = "rdx-exe";

function fetch(url) {
  return new Promise((resolve) => {
    https.get(
      url,
      { headers: { "User-Agent": "node" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
  });
}

async function generate() {
  const user = await fetch(`https://api.github.com/users/${username}`);
  const repos = await fetch(`https://api.github.com/users/${username}/repos`);

  // 🔥 Language aggregation
  const langs = {};
  repos.forEach((repo) => {
    if (repo.language) {
      langs[repo.language] = (langs[repo.language] || 0) + 1;
    }
  });

  const sortedLangs = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxLang = sortedLangs[0]?.[1] || 1;

  let langUI = "";
  sortedLangs.forEach(([lang, val], i) => {
    const width = (val / maxLang) * 220;

    langUI += `
      <text x="420" y="${90 + i * 25}" class="text">${lang}</text>
      <rect x="520" y="${80 + i * 25}" width="${width}" height="10" fill="#00FF9C">
        <animate attributeName="width" from="0" to="${width}" dur="1.2s" fill="freeze"/>
      </rect>
    `;
  });

  // 🔥 Activity animation
  let pulseBars = "";
  for (let i = 0; i < 30; i++) {
    const h = Math.floor(Math.random() * 40) + 10;

    pulseBars += `
      <rect x="${40 + i * 12}" y="${260 - h}" width="6" height="${h}" fill="#00FF9C">
        <animate attributeName="height" values="5;${h};5" dur="2s" repeatCount="indefinite"/>
      </rect>
    `;
  }

  const svg = `
<svg width="900" height="320" xmlns="http://www.w3.org/2000/svg">

<style>
.bg { fill: #0d1117; }
.panel { fill: #161b22; stroke: #00FF9C; stroke-width: 1; }
.title { fill: #00FF9C; font-family: monospace; font-size: 16px; }
.text { fill: #c9d1d9; font-family: monospace; font-size: 12px; }
.scan { opacity: 0.05; }
</style>

<rect class="bg" width="900" height="320"/>

<!-- Scanlines -->
<g class="scan">
  ${Array.from({ length: 40 }, (_, i) =>
    `<line x1="0" y1="${i * 8}" x2="900" y2="${i * 8}" stroke="#00FF9C"/>`
  ).join("")}
</g>

<!-- Panels -->
<rect class="panel" x="20" y="20" width="360" height="140" rx="10"/>
<rect class="panel" x="400" y="20" width="480" height="140" rx="10"/>
<rect class="panel" x="20" y="180" width="860" height="120" rx="10"/>

<!-- Titles -->
<text x="40" y="50" class="title">SYSTEM CORE</text>
<text x="420" y="50" class="title">LANG MATRIX</text>
<text x="40" y="210" class="title">ACTIVITY SIGNAL</text>

<!-- System Info -->
<text x="40" y="80" class="text">User      : ${username}</text>
<text x="40" y="100" class="text">Repos     : ${user.public_repos}</text>
<text x="40" y="120" class="text">Followers : ${user.followers}</text>
<text x="40" y="140" class="text">Mode      : ACTIVE</text>

<!-- Language Bars -->
${langUI}

<!-- Activity Pulse -->
${pulseBars}

<!-- Sweep Effect -->
<rect x="-200" y="0" width="200" height="320" fill="url(#grad)">
  <animate attributeName="x" from="-200" to="900" dur="3s" repeatCount="indefinite"/>
</rect>

<defs>
  <linearGradient id="grad">
    <stop offset="0%" stop-color="#00FF9C" stop-opacity="0"/>
    <stop offset="50%" stop-color="#00FF9C" stop-opacity="0.2"/>
    <stop offset="100%" stop-color="#00FF9C" stop-opacity="0"/>
  </linearGradient>
</defs>

</svg>
`;

  // ✅ FINAL FIX (absolute path, always works)
  const filePath = path.join(__dirname, "../assets/dashboard.svg");

  // ensure folder exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // write file
  fs.writeFileSync(filePath, svg);
}

generate();

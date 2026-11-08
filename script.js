'use strict';
document.body.classList.add('js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = document.getElementById('loader');
if (loader) {
  const started = performance.now();
  const dismiss = () => setTimeout(() => {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 350);
  }, Math.max(0, (reduced ? 0 : 750) - (performance.now() - started)));
  if (document.readyState === 'complete') dismiss();
  else window.addEventListener('load', dismiss, { once: true });
  setTimeout(() => loader.remove(), 4000);
}
const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); menu.focus();
  }
});
const theme = document.querySelector('.theme-toggle');
try { document.body.classList.toggle('light', localStorage.getItem('ameer-theme') === 'light'); } catch {}
function syncTheme() { theme?.setAttribute('aria-label', document.body.classList.contains('light') ? 'Switch to dark theme' : 'Switch to light theme'); }
syncTheme();
theme?.addEventListener('click', () => {
  const light = document.body.classList.toggle('light');
  try { localStorage.setItem('ameer-theme', light ? 'light' : 'dark'); } catch {}
  syncTheme();
});
const progress = document.querySelector('.scroll-progress');
const back = document.querySelector('.back-top');
let frame = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${range > 0 ? Math.min(100, window.scrollY / range * 100) : 0}%`;
  back?.classList.toggle('visible', window.scrollY > 400);
  frame = false;
}
window.addEventListener('scroll', () => { if (!frame) { frame = true; requestAnimationFrame(updateScroll); } }, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();
back?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' }));
if ('IntersectionObserver' in window && !reduced) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.story-steps article, .directory-grid>a, .timeline article, .section-head, .experiment, .empty-panel, .about-copy').forEach(el => {
    el.classList.add('reveal-ready'); observer.observe(el);
  });
}
const typed = document.getElementById('typed-text');
const pause = document.getElementById('pause-typing');
if (typed && pause) {
  const words = ['Ameer Marwan', 'a problem solver', 'a coder', 'a programmer', 'a developer'];
  let word = 0, length = words[0].length, deleting = true, paused = reduced, timer;
  function tick() {
    if (paused || document.hidden) return;
    const value = words[word];
    length += deleting ? -1 : 1;
    typed.textContent = value.slice(0, length);
    let delay = deleting ? 45 : 95;
    if (length === 0) { deleting = false; word = (word + 1) % words.length; delay = 300; }
    else if (length === value.length && !deleting) { deleting = true; delay = 1700; }
    timer = setTimeout(tick, delay);
  }
  function syncPause() { pause.textContent = paused ? 'Play typing animation' : 'Pause typing animation'; pause.setAttribute('aria-pressed', String(paused)); }
  pause.addEventListener('click', () => { paused = !paused; clearTimeout(timer); syncPause(); if (!paused) tick(); });
  document.addEventListener('visibilitychange', () => { clearTimeout(timer); if (!document.hidden && !paused) timer = setTimeout(tick, 400); });
  syncPause(); if (!paused) timer = setTimeout(tick, 1900);
}
const run = document.getElementById('run');
const output = document.getElementById('output');
const editor = document.getElementById('demo-code');
const filename = document.getElementById('demo-filename');
const swatch = document.getElementById('color-swatch');
const demos = {
  hello: { file: 'hello-world.js', lines: ['const developer = {', '  name: "Ameer Marwan",', '  roles: ["coder", "developer"],', '  mindset: "keep learning"', '};', '', 'console.log("Hello, world!");'] },
  clock: { file: 'live-clock.js', lines: ['const now = new Date();', '', 'const time = now.toLocaleTimeString();', '', 'console.log(time);', '// Run to start a live clock.', '// Your device’s local time.'] },
  color: { file: 'color-lab.js', lines: ['const colors = [', '  "#4667ff", "#01c3d9",', '  "#a78bfa", "#ff6289",', '  "#22c797"', '];', 'const color = colors[Math.floor(Math.random() * colors.length)];', 'console.log(color);'] }
};
let selected = 'hello', clockTimer;
function stopClock() { clearInterval(clockTimer); clockTimer = undefined; }
document.querySelectorAll('[data-demo]').forEach(tab => tab.addEventListener('click', () => {
  stopClock(); selected = tab.dataset.demo;
  document.querySelectorAll('[data-demo]').forEach(other => other.setAttribute('aria-pressed', String(other === tab)));
  filename.textContent = demos[selected].file;
  editor.replaceChildren(...demos[selected].lines.map((line, index) => {
    const row = document.createElement('div'); const number = document.createElement('i');
    number.textContent = String(index + 1); row.append(number, document.createTextNode(line || ' ')); return row;
  }));
  output.textContent = 'Ready when you are_'; output.setAttribute('aria-live', 'polite');
  if (swatch) swatch.hidden = true;
  run.innerHTML = 'Run the code <span>▶</span>';
}));
run?.addEventListener('click', () => {
  stopClock(); output.setAttribute('aria-live', 'polite');
  if (selected === 'clock') {
    output.textContent = new Date().toLocaleTimeString();
    // Avoid announcing every clock tick to assistive technology.
    output.setAttribute('aria-live', 'off');
    clockTimer = setInterval(() => { output.textContent = new Date().toLocaleTimeString(); }, 1000);
  } else if (selected === 'color') {
    const colors = ['#4667ff', '#01c3d9', '#a78bfa', '#ff6289', '#22c797'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    output.textContent = color; swatch.hidden = false; swatch.style.backgroundColor = color;
    swatch.setAttribute('role', 'img'); swatch.setAttribute('aria-label', `Generated color ${color}`);
  } else output.textContent = 'Hello, world! 👋 I’m Ameer Marwan.';
  run.innerHTML = 'Run again <span>↻</span>';
});
window.addEventListener('pagehide', stopClock);
// Prince AI answers from information presented on Ameer’s own pages.
const panel = document.querySelector('.prince-panel');
const launch = document.querySelector('.prince-launch');
const closeAI = document.querySelector('.prince-close');
const formAI = document.querySelector('.prince-form');
const inputAI = document.getElementById('prince-question');
const messagesAI = document.querySelector('.prince-messages');
function toggleAI(open) {
  if (!panel) return;
  const show = open ?? !panel.classList.contains('open');
  panel.classList.toggle('open', show);
  panel.setAttribute('aria-hidden', String(!show));
  if (show) setTimeout(() => inputAI?.focus(), 120);
}
launch?.addEventListener('click', () => toggleAI(true));
closeAI?.addEventListener('click', () => toggleAI(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel?.classList.contains('open')) { toggleAI(false); launch?.focus(); } });
function replyTo(question) {
  const q = question.toLowerCase();
  if (/who|ameer|about|born|birthday/.test(q)) return 'Ameer Marwan is a coder, developer, and programmer. His birthday is 5 March 2014. He calls himself the Prince and wants to make coding royal: creative, welcoming, and fun.';
  if (/prince|royal|quote/.test(q)) return 'Ameer’s quote is: “They call me the Prince. I want to make coding royal.” It means making coding feel creative and exciting.';
  if (/nasa|space|challenge|achievement/.test(q)) return 'Ameer says he is taking part in the 2026 NASA Space Apps Challenge. See the Achievements page for more.';
  if (/project|program|demo|clock|color/.test(q)) return 'Open My Programs to try the interactive Hello World, live clock, and color lab demos.';
  if (/website|site|portfolio|showcase/.test(q)) return 'Open My Websites to see Ameer’s portfolio showcase and find his GitHub repositories.';
  if (/github|repository|code/.test(q)) return 'Ameer’s GitHub profile is github.com/ameer-marwan. You can open it from the GitHub links on this site.';
  if (/page|navigate|menu|where/.test(q)) return 'Use the menu at the top to explore Home, About Me, Achievements, My Programs, and My Websites.';
  return 'I can answer questions about Ameer, his pages, coding demos, GitHub, and the 2026 NASA Space Apps Challenge. Try asking “What projects can I try?”';
}
function sendAI(question) {
  const q = question.trim(); if (!q || !messagesAI) return;
  for (const [text, cls] of [[q, 'user'], [replyTo(q), 'bot']]) {
    const item = document.createElement('p'); item.className = `prince-message ${cls}`; item.textContent = text; messagesAI.append(item);
  }
  messagesAI.scrollTop = messagesAI.scrollHeight;
}
formAI?.addEventListener('submit', event => { event.preventDefault(); sendAI(inputAI.value); inputAI.value = ''; });
document.querySelectorAll('.prince-suggestions button').forEach(button => button.addEventListener('click', () => sendAI(button.textContent)));
if (location.hash === '#prince-ai') toggleAI(true);
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
}));
const search = document.getElementById('site-search');
const searchStatus = document.getElementById('search-status');
if (search) {
  const cards = [...document.querySelectorAll('.directory-grid>a')];
  function filterCards() {
    const query = search.value.trim().toLowerCase(); let visible = 0;
    cards.forEach(card => {
      const haystack = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
      const match = !query || haystack.includes(query);
      card.hidden = !match; card.classList.toggle('search-match', !!query && match);
      if (match) visible++;
    });
    searchStatus.textContent = query ? `${visible} ${visible === 1 ? 'page' : 'pages'} found` : 'Explore Ameer’s pages';
  }
  search.addEventListener('input', filterCards);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; filterCards(); search.blur(); }
  });
}
// Pull Ameer’s latest public repositories at page load; cache briefly to avoid needless requests.
const repoGrid = document.getElementById('repo-grid');
const repoStatus = document.getElementById('repo-status');
if (repoGrid && repoStatus) {
  const cacheKey = 'ameer-public-repositories-v1';
  const renderRepositories = repositories => {
    repoGrid.replaceChildren();
    const sorted = [...repositories].sort((a,b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
    if (!sorted.length) {
      const empty = document.createElement('p'); empty.className = 'repo-empty';
      empty.textContent = 'No public repositories to show yet. New public projects will appear here automatically.';
      repoGrid.append(empty); return;
    }
    sorted.forEach((repo,index) => {
      const card = document.createElement('article'); card.className = 'repo-card'; card.style.animationDelay = `${Math.min(index * 70, 490)}ms`;
      const head = document.createElement('div'); head.className = 'repo-card-head';
      const title = document.createElement('h3'); const repoLink = document.createElement('a'); repoLink.href = repo.html_url; repoLink.target = '_blank'; repoLink.rel = 'noopener noreferrer'; repoLink.textContent = repo.name; title.append(repoLink);
      const visibility = document.createElement('span'); visibility.className = 'repo-visibility'; visibility.textContent = repo.fork ? 'FORK' : 'PUBLIC'; head.append(title,visibility);
      const description = document.createElement('p'); description.textContent = repo.description || 'A project by Ameer. Visit the repository to explore its code.';
      const footer = document.createElement('div'); footer.className = 'repo-card-footer';
      if(repo.language){const language=document.createElement('span');language.className='repo-language';const color=document.createElement('i');language.append(color,document.createTextNode(repo.language));footer.append(language);}
      const date=document.createElement('span');date.className='repo-date';const changed=new Date(repo.pushed_at || repo.updated_at);date.textContent=`Updated ${changed.toLocaleDateString(undefined,{month:'short',year:'numeric'})}`;footer.append(date);
      const codeLink=document.createElement('a');codeLink.href=repo.html_url;codeLink.target='_blank';codeLink.rel='noopener noreferrer';codeLink.textContent='View repository ↗';footer.append(codeLink);
      if(repo.homepage){const website=document.createElement('a');website.href=/^https?:\/\//i.test(repo.homepage)?repo.homepage:`https://${repo.homepage}`;website.target='_blank';website.rel='noopener noreferrer';website.textContent='Visit website ↗';footer.append(website);}
      card.append(head,description,footer);repoGrid.append(card);
    });
  };
  async function loadRepositories(){
    try {
      let cached;
      try { cached=JSON.parse(localStorage.getItem(cacheKey)||'null'); } catch {}
      if(cached?.at && Date.now()-cached.at<15*60*1000 && Array.isArray(cached.items)){
        renderRepositories(cached.items);repoStatus.textContent=`${cached.items.length} public ${cached.items.length===1?'repository':'repositories'} · refreshes automatically`;return;
      }
      const response=await fetch('https://api.github.com/users/ameer-marwan/repos?type=owner&sort=updated&per_page=100',{headers:{Accept:'application/vnd.github+json'}});
      if(!response.ok)throw new Error(`GitHub returned ${response.status}`);
      const repos=await response.json();
      const owned=repos.filter(repo=>repo.owner?.login?.toLowerCase()==='ameer-marwan'&&!repo.private);
      renderRepositories(owned);repoStatus.textContent=`${owned.length} public ${owned.length===1?'repository':'repositories'} · refreshed just now`;
      try{localStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),items:owned}));}catch{}
    }catch(error){
      repoStatus.replaceChildren();repoStatus.textContent='Couldn’t load the live repository list right now.';
      const fallback=document.createElement('p');fallback.className='repo-error';fallback.append(document.createTextNode('Try again later, or '));const link=document.createElement('a');link.href='https://github.com/ameer-marwan?tab=repositories';link.target='_blank';link.rel='noopener noreferrer';link.textContent='browse Ameer’s repositories on GitHub ↗';fallback.append(link);repoGrid.replaceChildren(fallback);
    }
  }
  loadRepositories();
}

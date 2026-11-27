import '../../src/style.css';
import './geo.css';
import { ENTRY_BY_ID, CONTINENTS } from '../../src/data/entries.js';
import { COUNTRIES, COUNTRY_BY_ID } from './data/countries.js';
import { CATEGORIES, CATEGORY_BY_ID } from './data/categories.js';
import { REGIONS } from './data/regions.js';
import { BASICS } from './data/basics.js';
import { renderVisual } from './visuals.js';
import { PHOTOS } from './data/photos.js';
import { loadShapes, countryMapSvg } from './countrymap.js';
import * as quiz from './quiz.js';
import * as store from './storage.js';

// Gemeinsame Dateien (Flaggen, Karten) liegen eine Ebene höher beim Hauptstadt-Quiz
const ROOT = '../';
const root = document.getElementById('app');
const MIX_SIZE = 25;

let run = null;
let lastResult = null;
let quizUi = null;
let timerId = 0;

// ── Hilfsfunktionen ─────────────────────────────────────────────────
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const flagUrl = (id) => `${ROOT}flags/${ENTRY_BY_ID[id]?.flag || id}.svg`;
const name = quiz.countryName;
const flagImg = (id, cls = 'mini-flag') => `<img class="${cls}" src="${flagUrl(id)}" alt="" loading="lazy" />`;

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
const fmtPct = (p) => `${Math.round(p)} %`;
const fmtDate = (t) => new Date(t).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function modal({ title, text, buttons }) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3>${esc(title)}</h3>
        ${text ? `<p>${esc(text)}</p>` : ''}
        <div class="modal-buttons">
          ${buttons.map((b, i) => `<button class="btn ${b.kind || 'ghost'}" data-i="${i}">${esc(b.label)}</button>`).join('')}
        </div>
      </div>`;
    const close = (v) => {
      wrap.classList.add('closing');
      setTimeout(() => wrap.remove(), 160);
      resolve(v);
    };
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (b) close(buttons[+b.dataset.i].value);
      else if (e.target === wrap) close(null);
    });
    document.body.appendChild(wrap);
  });
}

function scoreList(key, highlightDate) {
  const list = store.getScores(key);
  if (!list.length) return `<p class="empty">Noch keine Versuche – leg los!</p>`;
  const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
  return `<ol class="scores">${list
    .map(
      (s, i) => `
      <li class="${s.date === highlightDate ? 'current' : ''}">
        <span class="rank">${medals[i]}</span>
        <span class="pct">${fmtPct(s.pct)}</span>
        <span class="count">${s.correct}/${s.total}</span>
        <span class="time">⏱ ${fmtTime(s.time)}</span>
        <span class="date">${fmtDate(s.date)}</span>
      </li>`,
    )
    .join('')}</ol>`;
}

const best = (key) => store.getScores(key)[0] || null;

/** Echtes Foto (Wikimedia Commons) mit Bildnachweis – sonst die Zeichnung */
function media(key, v, { credit = true } = {}) {
  const ph = PHOTOS[key];
  if (!ph) return renderVisual(v);
  return `<figure class="photo"><img src="img/${ph.file}" alt="" loading="lazy" width="${ph.w}" height="${ph.h}" />${
    credit ? `<figcaption>Foto: ${esc(ph.author || 'unbekannt')} · <a href="${esc(ph.page)}" target="_blank" rel="noopener">${esc(ph.license)}</a></figcaption>` : ''
  }</figure>`;
}

function masteryBar(keys) {
  const { done, total } = store.mastery(keys);
  return `<div class="mastery"><div class="m-bar"><div style="width:${total ? (done / total) * 100 : 0}%"></div></div><span>${done}/${total} gelernt</span></div>`;
}

function countryChips(ids, link = true) {
  return `<div class="chips">${ids
    .filter((id) => ENTRY_BY_ID[id])
    .map((id) => `<${link && COUNTRY_BY_ID[id] ? `a href="#land-${id}"` : 'span'} class="chip">${flagImg(id)}${esc(name(id))}</${link && COUNTRY_BY_ID[id] ? 'a' : 'span'}>`)
    .join('')}</div>`;
}

function itemCard(cat, it, highlight) {
  return `
    <article class="learn-card" style="--c:${cat.color}">
      <div class="lc-visual ${PHOTOS[`${cat.id}:${it.id}`] ? 'has-photo' : ''}">${media(`${cat.id}:${it.id}`, it.v)}</div>
      <div class="lc-body">
        <div class="lc-cap">${esc(it.cap)}</div>
        ${highlight ? `<div class="lc-cat">${cat.emoji} ${esc(cat.title)}</div>` : countryChips(it.c)}
        <p>${esc(it.text)}</p>
      </div>
    </article>`;
}

// ── Router ──────────────────────────────────────────────────────────
function render() {
  const hash = location.hash.slice(1) || 'start';
  if (hash !== 'quiz') leaveQuiz();
  window.scrollTo(0, 0);
  root.onclick = null;
  root.oninput = null;
  if (hash.startsWith('kategorie-')) return renderCategory(hash.slice(10));
  if (hash.startsWith('land-')) return renderCountry(hash.slice(5));
  if (hash === 'laender') return renderCountries();
  if (hash === 'grundlagen') return renderBasics();
  if (hash === 'bildnachweise') return renderCredits();
  if (hash === 'quiz') return renderQuiz();
  if (hash === 'ergebnis' && lastResult) return renderResult();
  if (hash === 'bestenliste') return renderScores();
  return renderHome();
}
window.addEventListener('hashchange', render);

// ── Startseite ──────────────────────────────────────────────────────
function renderHome() {
  const saved = store.loadRun();
  const regionCount = Object.keys(REGIONS).length;
  root.innerHTML = `
  <main class="home geo">
    <header class="hero">
      <img class="hero-globe" src="icons/icon.svg" alt="" />
      <h1>Geo-Trainer</h1>
      <p>Lernen &amp; üben für GeoGuessr · ${CATEGORIES.length} Kategorien · ${COUNTRIES.length} Länder</p>
    </header>

    ${
      saved
        ? `<section class="resume card-like">
            <div>
              <div class="resume-label">Angefangenes Quiz</div>
              <div class="resume-title">${esc(saved.title)}${saved.sub ? ` · ${esc(saved.sub)}` : ''}</div>
              <div class="resume-meta">Frage ${Math.min(saved.index + 1, saved.qs.length)} von ${saved.qs.length} · ⏱ ${fmtTime(saved.elapsed)}</div>
            </div>
            <div class="resume-actions">
              <button class="btn primary" data-action="resume">Fortsetzen</button>
              <button class="btn ghost small" data-action="discard">Verwerfen</button>
            </div>
          </section>`
        : ''
    }

    <section class="world-grid">
      <button class="world-card wide" style="--c:#0f9d74" data-go="#grundlagen">
        <span class="wc-emoji">📚</span>
        <span class="wc-text"><span class="wc-title">Grundlagen</span><span class="wc-sub">So gehst du vor: Sonne, Fahrseite, Vegetation, Kamera, Bauweise</span></span>
      </button>
      <button class="world-card" style="--c:#4c5fd5" data-go="#laender">
        <span class="wc-emoji">🗺️</span>
        <span class="wc-text"><span class="wc-title">Länder &amp; Regionen</span><span class="wc-sub">${COUNTRIES.length} Steckbriefe · ${regionCount} mit Regionen</span></span>
      </button>
      <button class="world-card" style="--c:#e2445c" data-action="mix">
        <span class="wc-emoji">🎲</span>
        <span class="wc-text"><span class="wc-title">Mix-Quiz</span><span class="wc-sub">${MIX_SIZE} Fragen aus allen Kategorien</span></span>
        <span class="wc-meta">${best('mix') ? `<span class="best">🏆 ${fmtPct(best('mix').pct)}</span>` : ''}</span>
      </button>
    </section>

    <h2 class="section-title">Kategorien – lernen &amp; üben</h2>
    <section class="cont-grid">
      ${CATEGORIES.map((c) => {
        const b = best(c.id);
        return `
        <button class="cont-card" style="--c:${c.color}" data-go="#kategorie-${c.id}">
          <span class="cc-emoji">${c.emoji}</span>
          <span class="cc-title">${esc(c.title)}</span>
          <span class="cc-sub">${esc(c.sub)}</span>
          ${masteryBar(quiz.questionKeys(c.id))}
          ${b ? `<span class="best">🏆 ${fmtPct(b.pct)}</span>` : ''}
        </button>`;
      }).join('')}
    </section>

    <section class="home-footer">
      <button class="btn ghost" data-go="#bestenliste">🏆 Alle Bestenlisten</button>
      <a class="btn ghost" href="../">🏛️ Zum Hauptstadt-Quiz</a>
    </section>
  </main>`;

  root.onclick = async (e) => {
    const t = e.target.closest('[data-go],[data-action]');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    const a = t.dataset.action;
    if (a === 'mix') startQuiz({ key: 'mix', title: 'Mix-Quiz', sub: 'Alle Kategorien', color: '#e2445c', qs: quiz.buildMixQuestions(MIX_SIZE) });
    else if (a === 'resume') {
      run = { ...store.loadRun() };
      go('#quiz');
    } else if (a === 'discard') {
      const ok = await modal({
        title: 'Quiz verwerfen?',
        text: 'Der Fortschritt dieses Versuchs geht verloren.',
        buttons: [
          { label: 'Abbrechen', value: false },
          { label: 'Verwerfen', value: true, kind: 'danger' },
        ],
      });
      if (ok) {
        store.clearRun();
        renderHome();
      }
    }
  };
}

// ── Grundlagen ──────────────────────────────────────────────────────
function renderBasics() {
  root.innerHTML = `
  <main class="category geo" style="--c:#0f9d74">
    <header class="cat-head"><button class="icon-btn" data-go="#start" aria-label="Zurück">←</button><h1>Grundlagen</h1></header>
    <p class="lead">Diese Strategien helfen in jedem Land. Danach geht es in den Kategorien ins Detail.</p>
    ${BASICS.map(
      (b) => `
      <section class="panel learn-panel">
        <div class="panel-head"><h2>${b.emoji} ${esc(b.title)}</h2></div>
        <ul class="look">${b.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      </section>`,
    ).join('')}
    <p class="sources">Quellen der Lerninhalte: <a href="https://www.plonkit.net/" target="_blank" rel="noopener">Plonk It</a> und <a href="https://geohints.com/" target="_blank" rel="noopener">GeoHints</a> – die Texte sind eigene Zusammenfassungen, die Zeichnungen vereinfacht. Dort findest du Fotos zu jedem Merkmal. Die Fotos in dieser App stammen von Wikimedia Commons – <a href="#bildnachweise">Bildnachweise</a>.</p>
    <h2 class="section-title">Weiter mit</h2>
    <section class="cont-grid">
      ${CATEGORIES.slice(0, 6)
        .map((c) => `<button class="cont-card" style="--c:${c.color}" data-go="#kategorie-${c.id}"><span class="cc-emoji">${c.emoji}</span><span class="cc-title">${esc(c.title)}</span><span class="cc-sub">${esc(c.sub)}</span></button>`)
        .join('')}
    </section>
  </main>`;
  root.onclick = (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  };
}

// ── Bildnachweise ───────────────────────────────────────────────────
function renderCredits() {
  const rows = CATEGORIES.filter((c) => c.kind === 'items').flatMap((c) =>
    c.items.filter((it) => PHOTOS[`${c.id}:${it.id}`]).map((it) => ({ c, it, ph: PHOTOS[`${c.id}:${it.id}`] })),
  );
  root.innerHTML = `
  <main class="category geo" style="--c:#0f9d74">
    <header class="cat-head"><button class="icon-btn" data-go="#grundlagen" aria-label="Zurück">←</button><h1>Bildnachweise</h1></header>
    <p class="lead">Alle Fotos stammen von Wikimedia Commons und stehen unter freien Lizenzen. Sie wurden verkleinert, sonst aber nicht verändert.</p>
    <section class="panel"><ul class="credits">${rows
      .map(
        ({ c, it, ph }) => `<li><img src="img/${ph.file}" alt="" loading="lazy" /><div><b>${c.emoji} ${esc(it.cap)}</b>
          <span>${esc(ph.title.replace(/^File:/, ''))}</span>
          <span>Foto: ${esc(ph.author || 'unbekannt')} · <a href="${esc(ph.page)}" target="_blank" rel="noopener">${esc(ph.license)}</a></span></div></li>`,
      )
      .join('')}</ul></section>
  </main>`;
  root.onclick = (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  };
}

// ── Kategorie: lernen + Quiz ────────────────────────────────────────
function categoryLearnHtml(cat) {
  if (cat.kind === 'items') return `<section class="learn-grid">${cat.items.map((it) => itemCard(cat, it)).join('')}</section>`;
  if (cat.kind === 'drive') {
    const left = COUNTRIES.filter((c) => c.drive === 'L').map((c) => c.id);
    const right = COUNTRIES.filter((c) => c.drive === 'R').map((c) => c.id);
    return `
      <section class="drive-cols">
        <div class="panel"><div class="lc-visual">${renderVisual({ type: 'road', center: { color: '#f4f4f4', style: 'dashed' }, edge: { color: '#f4f4f4', style: 'solid' }, car: 'l' })}</div>
          <h3>⬅️ Linksverkehr <span class="count-pill">${left.length}</span></h3>${countryChips(left)}</div>
        <div class="panel"><div class="lc-visual">${renderVisual({ type: 'road', center: { color: '#f4f4f4', style: 'dashed' }, edge: { color: '#f4f4f4', style: 'solid' }, car: 'r' })}</div>
          <h3>➡️ Rechtsverkehr <span class="count-pill">${right.length}</span></h3>${countryChips(right)}</div>
      </section>`;
  }
  const field = cat.kind === 'tld' ? 'tld' : 'tel';
  const rows = [...COUNTRIES].sort((a, b) => (field === 'tel' ? parseInt(a.tel.slice(1)) - parseInt(b.tel.slice(1)) : a.tld.localeCompare(b.tld)));
  return `
    <section class="panel">
      <table class="value-table">
        ${rows.map((c) => `<tr><td class="vt-val">${esc(c[field])}</td><td><a href="#land-${c.id}">${flagImg(c.id)}${esc(name(c.id))}</a></td></tr>`).join('')}
      </table>
    </section>`;
}

function renderCategory(id) {
  const cat = CATEGORY_BY_ID[id];
  if (!cat) return go('#start');
  const total = quiz.buildCategoryQuestions(id).length;
  root.innerHTML = `
  <main class="category geo" style="--c:${cat.color}">
    <header class="cat-head"><button class="icon-btn" data-go="#start" aria-label="Zurück">←</button></header>
    <section class="cat-hero">
      <div class="cat-emoji">${cat.emoji}</div>
      <h1>${esc(cat.title)}</h1>
      <p>${esc(cat.sub)}</p>
      ${masteryBar(quiz.questionKeys(id))}
    </section>
    <button class="btn primary big start" data-action="start">Quiz starten <span class="start-count">${total} Fragen</span></button>

    <section class="panel learn-panel">
      <div class="panel-head"><h2>📖 So erkennst du’s</h2></div>
      <p>${esc(cat.intro)}</p>
      <h3 class="sub-h">Darauf achten</h3>
      <ul class="look">${cat.look.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    </section>

    <h2 class="section-title">Lernkarten</h2>
    ${categoryLearnHtml(cat)}

    <button class="btn primary big start" data-action="start">Jetzt üben <span class="start-count">${total} Fragen</span></button>

    <section class="panel">
      <div class="panel-head">
        <h2>🏆 Deine Top 5</h2>
        ${store.getScores(id).length ? '<button class="link danger" data-action="clear">Zurücksetzen</button>' : ''}
      </div>
      ${scoreList(id)}
    </section>
  </main>`;

  root.onclick = async (e) => {
    const t = e.target.closest('[data-action],[data-go]');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.action === 'start') startQuiz({ key: id, title: cat.title, sub: cat.sub, color: cat.color, qs: quiz.buildCategoryQuestions(id) });
    else if (t.dataset.action === 'clear') {
      const ok = await modal({
        title: 'Bestenliste zurücksetzen?',
        text: `Alle gespeicherten Versuche für „${cat.title}“ werden gelöscht.`,
        buttons: [
          { label: 'Abbrechen', value: false },
          { label: 'Löschen', value: true, kind: 'danger' },
        ],
      });
      if (ok) {
        store.clearScores(id);
        render();
      }
    }
  };
}

// ── Länderliste ─────────────────────────────────────────────────────
function renderCountries() {
  const groups = CONTINENTS.map((c) => ({ ...c, list: COUNTRIES.filter((k) => ENTRY_BY_ID[k.id].cont === c.id).sort((a, b) => name(a.id).localeCompare(name(b.id), 'de')) })).filter((g) => g.list.length);
  root.innerHTML = `
  <main class="category geo countries-page" style="--c:#4c5fd5">
    <header class="cat-head"><button class="icon-btn" data-go="#start" aria-label="Zurück">←</button><h1>Länder &amp; Regionen</h1></header>
    <input class="search" type="search" placeholder="Land suchen …" aria-label="Land suchen" />
    ${groups
      .map(
        (g) => `
      <h2 class="section-title" data-group>${g.emoji} ${esc(g.name)}</h2>
      <section class="country-list">
        ${g.list
          .map((c) => {
            const reg = REGIONS[c.id];
            return `<a class="country-row" href="#land-${c.id}" data-name="${esc(name(c.id).toLowerCase())}">
              ${flagImg(c.id, 'row-flag')}
              <span class="cr-text"><b>${esc(name(c.id))}</b><small>${c.drive === 'L' ? '⬅️ Links' : '➡️ Rechts'} · ${esc(c.tld)} · ${esc(c.script)}</small></span>
              ${reg ? `<span class="count-pill">🗺️ ${reg.regions.length} Regionen</span>` : ''}
            </a>`;
          })
          .join('')}
      </section>`,
      )
      .join('')}
  </main>`;
  root.onclick = (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  };
  root.oninput = (e) => {
    if (!e.target.matches('.search')) return;
    const q = e.target.value.trim().toLowerCase();
    root.querySelectorAll('.country-row').forEach((r) => (r.style.display = !q || r.dataset.name.includes(q) ? '' : 'none'));
    root.querySelectorAll('.country-list').forEach((l) => {
      const any = [...l.children].some((r) => r.style.display !== 'none');
      l.style.display = any ? '' : 'none';
      l.previousElementSibling.style.display = any ? '' : 'none';
    });
  };
}

// ── Länderseite ─────────────────────────────────────────────────────
function renderCountry(id) {
  const c = COUNTRY_BY_ID[id];
  if (!c) return go('#laender');
  const entry = ENTRY_BY_ID[id];
  const items = quiz.itemsForCountry(id);
  const reg = REGIONS[id];
  const hemi = c.hemi === 'NS' ? 'Nord & Süd' : entry.ll[0] >= 0 ? 'Nord' : 'Süd';
  const regionKey = `region-${id}`;

  root.innerHTML = `
  <main class="category geo country-page" style="--c:#4c5fd5">
    <header class="cat-head"><button class="icon-btn" data-go="#laender" aria-label="Zurück">←</button></header>
    <section class="cat-hero">
      <img class="big-flag" src="${flagUrl(id)}" alt="Flagge von ${esc(name(id))}" />
      <h1>${esc(name(id))}</h1>
    </section>
    <section class="facts">
      <div><span>Fahrseite</span><b>${c.drive === 'L' ? '⬅️ Links' : '➡️ Rechts'}</b></div>
      <div><span>Domain</span><b>${esc(c.tld)}</b></div>
      <div><span>Vorwahl</span><b>${esc(c.tel)}</b></div>
      <div><span>Halbkugel</span><b>${hemi}</b></div>
      <div class="wide"><span>Sprache</span><b>${esc(c.lang)}</b></div>
      <div class="wide"><span>Schrift</span><b>${esc(c.script)}</b></div>
    </section>

    <section class="panel learn-panel">
      <div class="panel-head"><h2>⭐ Steckbrief</h2></div>
      <ul class="look">${c.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>

    ${
      reg
        ? `<section class="panel learn-panel regions-panel">
            <div class="panel-head"><h2>🗺️ Regionen erkennen</h2></div>
            <p>${esc(reg.intro)}</p>
            <div class="cmap-wrap" data-map><div class="map-loading">Karte wird geladen …</div></div>
            <ol class="region-list">${reg.regions.map((r) => `<li><b>${esc(r.n)}</b><span>${r.t.map(esc).join(' · ')}</span></li>`).join('')}</ol>
            <button class="btn primary big start" data-action="region">Regionen-Quiz <span class="start-count">${reg.regions.length} Fragen</span></button>
            ${store.getScores(regionKey).length ? `<div class="sub-h">🏆 Deine Top 5</div>${scoreList(regionKey)}` : ''}
          </section>`
        : ''
    }

    ${items.length ? `<h2 class="section-title">Merkmale in den Kategorien</h2><section class="learn-grid">${items.map(({ cat, item }) => itemCard(cat, item, true)).join('')}</section>` : ''}
  </main>`;

  root.onclick = (e) => {
    const t = e.target.closest('[data-go],[data-action]');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.action === 'region') {
      startQuiz({ key: regionKey, title: `Regionen: ${name(id)}`, sub: 'Regionen-Quiz', color: '#4c5fd5', qs: quiz.buildRegionQuestions(id) });
    }
  };

  if (reg) {
    const box = root.querySelector('[data-map]');
    loadShapes(`${ROOT}data/world.json`)
      .then(() => {
        if (!box.isConnected) return;
        box.innerHTML = countryMapSvg(id, { view: reg.view, pins: reg.regions.map((r) => ({ ll: r.ll })) });
      })
      .catch(() => (box.innerHTML = '<div class="map-loading">Karte konnte nicht geladen werden.</div>'));
  }
}

// ── Quiz ────────────────────────────────────────────────────────────
async function startQuiz({ key, title, sub, color, qs }, practice = false) {
  const saved = store.loadRun();
  if (saved && !practice) {
    const ok = await modal({
      title: 'Neues Quiz starten?',
      text: `Dein angefangenes Quiz (${saved.title}) wird dabei verworfen.`,
      buttons: [
        { label: 'Abbrechen', value: false },
        { label: 'Neu starten', value: true, kind: 'primary' },
      ],
    });
    if (!ok) return;
  }
  run = { key, title, sub: practice ? 'Fehler üben' : sub, color, practice, qs, index: 0, answers: [], elapsed: 0 };
  store.saveRun(run);
  go('#quiz');
}

const elapsed = () => run.elapsed + (run.segStart ? performance.now() - run.segStart : 0);

function pauseTimer() {
  if (run && run.segStart) {
    run.elapsed += performance.now() - run.segStart;
    run.segStart = 0;
  }
  quizUi?.timeStat.classList.add('paused');
}

function resumeTimer() {
  if (run && !run.segStart && !document.hidden && run.phase !== 'feedback') run.segStart = performance.now();
  quizUi?.timeStat.classList.toggle('paused', !run?.segStart);
}

function persistRun() {
  if (!run) return;
  const { segStart, phase, ...rest } = run;
  const index = phase === 'feedback' ? run.index + 1 : run.index;
  store.saveRun({ ...rest, index, elapsed: elapsed() });
}

document.addEventListener('visibilitychange', () => {
  if (!quizUi || !run) return;
  if (document.hidden) {
    pauseTimer();
    persistRun();
  } else resumeTimer();
});

function leaveQuiz() {
  if (!quizUi) return;
  clearInterval(timerId);
  document.removeEventListener('keydown', onQuizKey);
  if (run) {
    pauseTimer();
    persistRun();
  }
  quizUi = null;
}

function onQuizKey(e) {
  if (!run || !quizUi || document.querySelector('.modal-backdrop')) return;
  if (run.phase === 'feedback' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    nextQuestion();
  } else if (run.phase === 'ask' && /^[1-4]$/.test(e.key)) {
    const q = run.qs[run.index];
    const i = +e.key - 1;
    if (i < q.options.length) answer(i);
  }
}

function renderQuiz() {
  if (!run) {
    const saved = store.loadRun();
    if (!saved) return go('#start');
    run = { ...saved };
  }
  root.innerHTML = `
  <main class="quiz geo-quiz" style="--c:${run.color || '#0f9d74'}">
    <header class="quiz-top">
      <button class="icon-btn" data-action="quit" aria-label="Quiz beenden">✕</button>
      <div class="quiz-progress">
        <div class="quiz-title">${esc(run.title)} <span>· ${esc(run.sub || '')}</span></div>
        <div class="bar"><div class="bar-fill"></div></div>
      </div>
      <div class="quiz-counter"><b class="q-num">1</b>/<span>${run.qs.length}</span></div>
    </header>
    <div class="stats">
      <span class="stat"><span class="stat-label">Richtig</span><b class="s-correct">0</b></span>
      <span class="stat"><span class="stat-label">Quote</span><b class="s-pct">–</b></span>
      <span class="stat"><span class="stat-label">Zeit</span><b class="s-time">0:00</b></span>
    </div>
    <section class="q-card">
      <div class="q-visual"></div>
      <div class="q-cap"></div>
      <h2 class="q-prompt"></h2>
    </section>
    <section class="q-options"></section>
    <section class="q-feedback" aria-live="polite"></section>
  </main>`;

  const q = (s) => root.querySelector(s);
  quizUi = {
    visual: q('.q-visual'),
    cap: q('.q-cap'),
    prompt: q('.q-prompt'),
    options: q('.q-options'),
    feedback: q('.q-feedback'),
    num: q('.q-num'),
    bar: q('.bar-fill'),
    correct: q('.s-correct'),
    pct: q('.s-pct'),
    time: q('.s-time'),
    timeStat: q('.s-time').parentElement,
  };

  root.onclick = (e) => {
    const t = e.target.closest('[data-action],[data-opt]');
    if (!t) return;
    if (t.dataset.opt !== undefined) return answer(+t.dataset.opt);
    if (t.dataset.action === 'next') nextQuestion();
    else if (t.dataset.action === 'quit') quitQuiz();
  };
  document.addEventListener('keydown', onQuizKey);
  timerId = setInterval(() => quizUi && (quizUi.time.textContent = fmtTime(elapsed())), 250);

  if (run.index >= run.qs.length) return finishQuiz();
  showQuestion();
  resumeTimer();
}

function updateHud() {
  const ui = quizUi;
  const answered = run.answers.length;
  const correct = run.answers.filter((a) => a.ok).length;
  ui.num.textContent = Math.min(run.index + 1, run.qs.length);
  ui.bar.style.width = `${(answered / run.qs.length) * 100}%`;
  ui.correct.textContent = `${correct}/${answered}`;
  ui.pct.textContent = answered ? fmtPct((correct / answered) * 100) : '–';
  ui.time.textContent = fmtTime(elapsed());
}

function regionMap(qq, state) {
  const data = REGIONS[qq.map.country];
  const r = data.regions[qq.map.region];
  const pins = state ? [{ ll: r.ll, state: state === 'ok' ? 'ok' : 'hint', label: r.n }] : [];
  return countryMapSvg(qq.map.country, { view: data.view, pins });
}

function showQuestion() {
  const ui = quizUi;
  const qq = run.qs[run.index];
  run.phase = 'ask';
  ui.visual.className = `q-visual ${qq.map ? 'is-map' : ''}`;
  if (qq.map) {
    ui.visual.innerHTML = '<div class="map-loading">Karte wird geladen …</div>';
    loadShapes(`${ROOT}data/world.json`)
      .then(() => {
        if (quizUi === ui && run?.qs[run.index] === qq) ui.visual.innerHTML = regionMap(qq, run.phase === 'feedback' ? (run.answers.at(-1).ok ? 'ok' : 'bad') : null);
      })
      .catch(() => (ui.visual.innerHTML = ''));
  } else if (qq.subject) {
    ui.visual.innerHTML = `<img class="q-flag" src="${flagUrl(qq.subject)}" alt="" />`;
  } else {
    ui.visual.innerHTML = media(qq.key, qq.v);
  }
  ui.cap.innerHTML = qq.clues ? `<ul class="clues">${qq.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : qq.cap ? esc(qq.cap) : '';
  ui.cap.style.display = ui.cap.innerHTML ? '' : 'none';
  ui.prompt.textContent = qq.prompt;
  ui.options.className = `q-options ${qq.binary ? 'binary' : ''} ${qq.options.some((o) => o.flag) ? 'with-flags' : ''}`;
  ui.options.innerHTML = qq.options
    .map(
      (o, i) => `<button class="opt" data-opt="${i}">
        <span class="opt-key">${i + 1}</span>
        ${o.flag ? flagImg(o.flag, 'opt-flag') : o.icon ? `<span class="opt-icon">${o.icon}</span>` : ''}
        <span class="opt-label">${esc(o.label)}</span>
      </button>`,
    )
    .join('');
  ui.feedback.innerHTML = '';
  updateHud();
  // Flaggen der nächsten Frage vorladen
  run.qs[run.index + 1]?.options.forEach((o) => o.flag && (new Image().src = flagUrl(o.flag)));
}

function answer(i) {
  if (!run || run.phase !== 'ask') return;
  const ui = quizUi;
  const qq = run.qs[run.index];
  const ok = i === qq.correct;
  pauseTimer();
  run.phase = 'feedback';
  run.answers.push({ key: qq.key, choice: i, ok });
  if (!run.practice || ok) store.recordAnswer(qq.key, ok);

  ui.options.querySelectorAll('.opt').forEach((b, j) => {
    b.disabled = true;
    if (j === qq.correct) b.classList.add('right');
    else if (j === i) b.classList.add('wrong');
  });
  const right = qq.options[qq.correct];
  const also = qq.also?.length ? `<div class="fb-note">Passt auch: ${qq.also.map((a) => `${flagImg(a)} ${esc(name(a))}`).join(', ')}</div>` : '';
  ui.feedback.innerHTML = `
    <div class="fb ${ok ? 'exact' : 'wrong'}">
      <span class="fb-icon">${ok ? '✓' : '✗'}</span>
      <div>
        <div class="fb-title">${ok ? 'Richtig!' : `Leider falsch – richtig ist ${esc(right.label)}`}</div>
        <div class="fb-explain">${esc(qq.explain)}</div>
        ${also}
      </div>
    </div>
    <button class="btn primary big next" data-action="next">${run.index + 1 >= run.qs.length ? 'Zum Ergebnis' : 'Weiter →'}</button>`;
  if (qq.map && ui.visual.querySelector('svg')) ui.visual.innerHTML = regionMap(qq, ok ? 'ok' : 'bad');
  updateHud();
  persistRun();
  ui.feedback.querySelector('.next').focus({ preventScroll: true });
  ui.feedback.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function nextQuestion() {
  if (!run || run.phase !== 'feedback') return;
  run.index++;
  if (run.index >= run.qs.length) return finishQuiz();
  showQuestion();
  persistRun();
  resumeTimer();
  window.scrollTo({ top: 0 });
}

function finishQuiz() {
  pauseTimer();
  const total = run.qs.length;
  const correct = run.answers.filter((a) => a.ok).length;
  const attempt = { correct, total, pct: (correct / total) * 100, time: Math.round(run.elapsed), date: Date.now() };
  const before = store.getScores(run.key).length;
  const rank = run.practice ? 0 : store.addScore(run.key, attempt);
  lastResult = { run, attempt, rank, first: before === 0 };
  store.clearRun();
  run = null;
  go('#ergebnis');
}

async function quitQuiz() {
  pauseTimer();
  const choice = await modal({
    title: 'Quiz pausieren?',
    text: 'Du kannst später genau hier weitermachen.',
    buttons: [
      { label: 'Weiterspielen', value: 'continue', kind: 'primary' },
      { label: 'Später fortsetzen', value: 'pause' },
      { label: 'Quiz verwerfen', value: 'discard', kind: 'danger' },
    ],
  });
  if (choice === 'pause') {
    persistRun();
    run = null;
    go('#start');
  } else if (choice === 'discard') {
    store.clearRun();
    run = null;
    go('#start');
  } else resumeTimer();
}

// ── Ergebnis ────────────────────────────────────────────────────────
function renderResult() {
  const { run: r, attempt, rank, first } = lastResult;
  const wrong = r.answers.map((a, i) => ({ ...a, q: r.qs[i] })).filter((a) => !a.ok);
  const deg = (attempt.pct / 100) * 360;
  const verdict = attempt.pct === 100 ? 'Perfekt! 🎉' : attempt.pct >= 90 ? 'Hervorragend!' : attempt.pct >= 70 ? 'Stark!' : attempt.pct >= 50 ? 'Gut gemacht!' : 'Weiter üben!';
  const rankText = r.practice
    ? 'Übungsrunde – wird nicht in der Bestenliste gespeichert.'
    : rank === 1 && first
      ? '🏆 Dein erster Eintrag in der Bestenliste!'
      : rank === 1
        ? '🏆 Neuer Rekord!'
        : rank
          ? `Platz ${rank} in deiner Top 5`
          : 'Diesmal nicht in den Top 5';

  const row = (a) => {
    const q = a.q;
    const right = q.options[q.correct];
    const picked = q.options[a.choice];
    return `<li>
      <div class="m-vis">${q.map ? '🗺️' : q.subject ? flagImg(q.subject, 'm-flag') : q.v?.type === 'text' ? `<span class="m-txt">${esc(q.v.text)}</span>` : media(q.key, q.v, { credit: false })}</div>
      <div class="m-text">
        <div class="m-country">${esc(q.cap || q.prompt)}</div>
        <div class="m-answer"><s>${esc(picked.label)}</s> → <b>${right.flag ? flagImg(right.flag) : ''}${esc(right.label)}</b></div>
      </div>
    </li>`;
  };

  root.innerHTML = `
  <main class="result geo" style="--c:${r.color || '#0f9d74'}">
    <header class="cat-head"><button class="icon-btn" data-action="home" aria-label="Zum Menü">←</button></header>
    <section class="result-hero">
      <div class="ring" style="--deg:${deg}deg"><div class="ring-inner"><b>${fmtPct(attempt.pct)}</b><span>richtig</span></div></div>
      <h1>${verdict}</h1>
      <p class="result-cat">${esc(r.title)} · ${esc(r.sub || '')}</p>
      <div class="result-stats">
        <div><b>${attempt.correct}/${attempt.total}</b><span>Richtig</span></div>
        <div><b>${fmtTime(attempt.time)}</b><span>Zeit</span></div>
        <div><b>${(attempt.time / attempt.total / 1000).toFixed(1).replace('.', ',')} s</b><span>pro Frage</span></div>
      </div>
      <div class="rank-badge ${rank === 1 ? 'gold' : ''}">${rankText}</div>
    </section>
    <div class="result-actions">
      <button class="btn primary big" data-action="again">Nochmal spielen</button>
      ${wrong.length ? `<button class="btn ghost big" data-action="practice">Fehler üben (${wrong.length})</button>` : ''}
    </div>
    ${!r.practice ? `<section class="panel"><div class="panel-head"><h2>🏆 Top 5 · ${esc(r.title)}</h2></div>${scoreList(r.key, attempt.date)}</section>` : ''}
    ${wrong.length ? `<section class="panel"><div class="panel-head"><h2>✗ Falsch (${wrong.length})</h2></div><ul class="mistakes geo-mistakes">${wrong.map(row).join('')}</ul></section>` : ''}
    <div class="result-actions"><button class="btn ghost" data-action="home">Zum Menü</button></div>
  </main>`;

  root.onclick = (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'home') return go('#start');
    const base = { key: r.key, title: r.title, sub: r.sub, color: r.color };
    if (a === 'practice') return startQuiz({ ...base, qs: quiz.shuffle(wrong.map((w) => w.q)) }, true);
    if (a === 'again') {
      if (r.practice) return startQuiz({ ...base, qs: quiz.shuffle(r.qs) }, true);
      const qs =
        r.key === 'mix'
          ? quiz.buildMixQuestions(MIX_SIZE)
          : r.key.startsWith('region-')
            ? quiz.buildRegionQuestions(r.key.slice(7))
            : quiz.buildCategoryQuestions(r.key);
      startQuiz({ ...base, qs });
    }
  };
}

// ── Bestenlisten ────────────────────────────────────────────────────
function renderScores() {
  const all = store.getAllScores();
  const entries = [
    { key: 'mix', title: '🎲 Mix-Quiz' },
    ...CATEGORIES.map((c) => ({ key: c.id, title: `${c.emoji} ${c.title}` })),
    ...Object.keys(REGIONS)
      .filter((id) => all[`region-${id}`]?.length)
      .map((id) => ({ key: `region-${id}`, title: `🗺️ Regionen: ${name(id)}` })),
  ];
  const any = Object.values(all).some((l) => l.length);
  root.innerHTML = `
  <main class="scores-page geo">
    <header class="cat-head"><button class="icon-btn" data-action="home" aria-label="Zurück">←</button><h1>Bestenlisten</h1></header>
    ${entries.map((e) => `<section class="panel"><div class="panel-head"><h3>${esc(e.title)}</h3></div>${scoreList(e.key)}</section>`).join('')}
    <div class="result-actions">
      ${any ? '<button class="btn ghost danger" data-action="clear-all">Alle Bestenlisten löschen</button>' : ''}
      <button class="btn ghost danger" data-action="clear-stats">Lernfortschritt zurücksetzen</button>
    </div>
  </main>`;

  root.onclick = async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'home') return go('#start');
    const ok = await modal({
      title: a === 'clear-all' ? 'Alle Bestenlisten löschen?' : 'Lernfortschritt zurücksetzen?',
      text: 'Das kann nicht rückgängig gemacht werden.',
      buttons: [
        { label: 'Abbrechen', value: false },
        { label: 'Löschen', value: true, kind: 'danger' },
      ],
    });
    if (!ok) return;
    if (a === 'clear-all') store.clearScores();
    else store.clearStats();
    renderScores();
  };
}

render();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

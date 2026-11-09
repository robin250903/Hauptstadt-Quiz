import './style.css';
import { CONTINENTS, ENTRIES, ENTRY_BY_ID, buildCategories } from './data/entries.js';
import { checkAnswer, diffWords } from './matching.js';
import { QuizMap, loadMapData } from './map.js';
import * as store from './storage.js';

const BASE = import.meta.env.BASE_URL;
const CATS = buildCategories();
const CAT = Object.fromEntries(CATS.map((c) => [c.key, c]));
const root = document.getElementById('app');

let run = null; // laufendes Quiz
let lastResult = null; // Ergebnis für den Ergebnis-Bildschirm
let quizUi = null; // DOM-Referenzen des Quiz-Bildschirms
let timerId = 0;
let advanceId = 0;

// ── Hilfsfunktionen ─────────────────────────────────────────────────
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const flagUrl = (e) => `${BASE}flags/${e.flag || e.id}.svg`;

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

const fmtPct = (p) => `${Math.round(p)}\u202f%`;
const fmtDate = (t) =>
  new Date(t).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function bestOf(catKey) {
  return store.getScores(catKey)[0] || null;
}

function scoreList(catKey, highlightDate) {
  const list = store.getScores(catKey);
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

// ── Router ──────────────────────────────────────────────────────────
function render() {
  const hash = location.hash.slice(1) || 'start';
  if (hash !== 'quiz') leaveQuiz();
  window.scrollTo(0, 0);
  if (hash.startsWith('kategorie-')) return renderCategory(hash.slice('kategorie-'.length));
  if (hash === 'quiz') return renderQuiz();
  if (hash === 'ergebnis' && lastResult) return renderResult();
  if (hash === 'bestenliste') return renderScores();
  return renderHome();
}
window.addEventListener('hashchange', render);

// ── Startseite ──────────────────────────────────────────────────────
function contVariant(contId) {
  return store.loadPrefs()[`variant-${contId}`] || 's';
}

function renderHome() {
  const saved = store.loadRun();
  const savedCat = saved && (CAT[saved.catKey] || saved.practice) ? saved : null;
  const world = CATS.filter((c) => c.group === 'world');
  const states = ENTRIES.filter((e) => e.type === 's').length;
  const terr = ENTRIES.length - states;

  root.innerHTML = `
  <main class="home">
    <header class="hero">
      <img class="hero-globe" src="${BASE}icons/icon.svg" alt="" />
      <h1>Hauptstadt-Quiz</h1>
      <p>${states} Staaten · ${terr} Gebiete · eine Frage: Wie heißt die Hauptstadt?</p>
    </header>

    ${
      savedCat
        ? `<section class="resume card-like">
            <div>
              <div class="resume-label">Angefangenes Quiz</div>
              <div class="resume-title">${esc(saved.title)}${saved.subtitle ? ` · ${esc(saved.subtitle)}` : ''}</div>
              <div class="resume-meta">Frage ${saved.index + 1} von ${saved.ids.length} · ⏱ ${fmtTime(saved.elapsed)}</div>
            </div>
            <div class="resume-actions">
              <button class="btn primary" data-action="resume">Fortsetzen</button>
              <button class="btn ghost small" data-action="discard">Verwerfen</button>
            </div>
          </section>`
        : ''
    }

    <h2 class="section-title">Weltweit</h2>
    <section class="world-grid">
      ${world
        .map((c, i) => {
          const best = bestOf(c.key);
          return `
          <button class="world-card ${i === 0 ? 'wide' : ''}" style="--c:${c.color}" data-cat="${c.key}">
            <span class="wc-emoji">${c.emoji}</span>
            <span class="wc-text">
              <span class="wc-title">${esc(c.title)}</span>
              <span class="wc-sub">${esc(c.subtitle)}</span>
            </span>
            <span class="wc-meta">
              <span class="count-pill">${c.ids.length}</span>
              ${best ? `<span class="best">🏆 ${fmtPct(best.pct)}</span>` : ''}
            </span>
          </button>`;
        })
        .join('')}
    </section>

    <h2 class="section-title">Kontinente</h2>
    <section class="cont-grid">
      ${CONTINENTS.map((c) => {
        const s = CAT[`${c.id}-s`];
        const all = CAT[`${c.id}-all`];
        const best = bestOf(`${c.id}-${contVariant(c.id)}`);
        return `
        <button class="cont-card" style="--c:${c.color}" data-cont="${c.id}">
          <span class="cc-emoji">${c.emoji}</span>
          <span class="cc-title">${esc(c.name)}</span>
          <span class="cc-sub">${s.ids.length} Staaten · ${all.ids.length - s.ids.length} Gebiete</span>
          ${best ? `<span class="best">🏆 ${fmtPct(best.pct)}</span>` : '<span class="best muted">Noch nicht gespielt</span>'}
        </button>`;
      }).join('')}
    </section>

    <section class="home-footer">
      <button class="btn ghost" data-action="scores">🏆 Alle Bestenlisten</button>
    </section>
  </main>`;

  root.onclick = async (e) => {
    const t = e.target.closest('[data-cat],[data-cont],[data-action]');
    if (!t) return;
    if (t.dataset.cat) go(`#kategorie-${t.dataset.cat}`);
    else if (t.dataset.cont) go(`#kategorie-${t.dataset.cont}-${contVariant(t.dataset.cont)}`);
    else if (t.dataset.action === 'scores') go('#bestenliste');
    else if (t.dataset.action === 'resume') {
      run = { ...store.loadRun() };
      go('#quiz');
    } else if (t.dataset.action === 'discard') {
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

// ── Kategorie ───────────────────────────────────────────────────────
function renderCategory(key) {
  const cat = CAT[key];
  if (!cat) return go('#start');
  const isCont = cat.group === 'continent';
  const sCat = isCont ? CAT[`${cat.cont}-s`] : null;
  const aCat = isCont ? CAT[`${cat.cont}-all`] : null;
  const sample = shuffle(cat.ids).slice(0, 14).map((id) => ENTRY_BY_ID[id]);

  root.innerHTML = `
  <main class="category" style="--c:${cat.color}">
    <header class="cat-head">
      <button class="icon-btn" data-action="back" aria-label="Zurück">←</button>
    </header>
    <section class="cat-hero">
      <div class="cat-emoji">${cat.emoji}</div>
      <h1>${esc(cat.title)}</h1>
      <p>${esc(cat.subtitle)}</p>
      <div class="flag-strip" aria-hidden="true">
        ${sample.map((e) => `<img src="${flagUrl(e)}" alt="" loading="lazy" />`).join('')}
      </div>
    </section>

    ${
      isCont
        ? `<div class="segmented" role="tablist">
            <button role="tab" class="${key === sCat.key ? 'active' : ''}" data-variant="s">Nur Staaten <span>${sCat.ids.length}</span></button>
            <button role="tab" class="${key === aCat.key ? 'active' : ''}" data-variant="all">Mit Gebieten <span>${aCat.ids.length}</span></button>
          </div>`
        : ''
    }

    <button class="btn primary big start" data-action="start">
      Quiz starten <span class="start-count">${cat.ids.length} Fragen</span>
    </button>

    <section class="panel">
      <div class="panel-head">
        <h2>🏆 Deine Top 5</h2>
        ${store.getScores(key).length ? '<button class="link danger" data-action="clear">Zurücksetzen</button>' : ''}
      </div>
      ${scoreList(key)}
    </section>
  </main>`;

  root.onclick = async (e) => {
    const t = e.target.closest('[data-action],[data-variant]');
    if (!t) return;
    if (t.dataset.variant) {
      store.savePrefs({ [`variant-${cat.cont}`]: t.dataset.variant });
      history.replaceState(null, '', `#kategorie-${cat.cont}-${t.dataset.variant}`);
      return render();
    }
    const a = t.dataset.action;
    if (a === 'back') go('#start');
    else if (a === 'start') startQuiz(cat);
    else if (a === 'clear') {
      const ok = await modal({
        title: 'Bestenliste zurücksetzen?',
        text: `Alle gespeicherten Versuche für „${cat.title} – ${cat.subtitle}“ werden gelöscht.`,
        buttons: [
          { label: 'Abbrechen', value: false },
          { label: 'Löschen', value: true, kind: 'danger' },
        ],
      });
      if (ok) {
        store.clearScores(key);
        render();
      }
    }
  };
}

async function startQuiz(cat, ids = cat.ids, practice = false) {
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
  run = {
    catKey: cat.key,
    title: cat.title,
    subtitle: practice ? 'Fehler üben' : cat.subtitle,
    color: cat.color,
    practice,
    ids: shuffle(ids),
    index: 0,
    answers: [],
    elapsed: 0,
  };
  store.saveRun(run);
  go('#quiz');
}

// ── Quiz ────────────────────────────────────────────────────────────
function elapsed() {
  return run.elapsed + (run.segStart ? performance.now() - run.segStart : 0);
}

function pauseTimer() {
  if (run && run.segStart) {
    run.elapsed += performance.now() - run.segStart;
    run.segStart = 0;
  }
}

function resumeTimer() {
  if (run && !run.segStart && !document.hidden) run.segStart = performance.now();
}

function persistRun() {
  if (!run) return;
  const { segStart, phase, ...rest } = run;
  store.saveRun({ ...rest, elapsed: elapsed() });
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
  clearTimeout(advanceId);
  if (run) {
    pauseTimer();
    persistRun();
  }
  quizUi = null;
  document.body.classList.remove('in-quiz');
}

async function renderQuiz() {
  if (!run) {
    const saved = store.loadRun();
    if (!saved) return go('#start');
    run = { ...saved };
  }
  document.body.classList.add('in-quiz');
  root.onclick = null;
  root.innerHTML = `
  <main class="quiz" style="--c:${run.color || '#4c5fd5'}">
    <header class="quiz-top">
      <button class="icon-btn" data-action="quit" aria-label="Quiz beenden">✕</button>
      <div class="quiz-progress">
        <div class="quiz-title">${esc(run.title)} <span>· ${esc(run.subtitle || '')}</span></div>
        <div class="bar"><div class="bar-fill"></div></div>
      </div>
      <div class="quiz-counter"><b class="q-num">1</b>/<span class="q-total">${run.ids.length}</span></div>
    </header>
    <div class="stats">
      <span class="stat"><span class="stat-label">Richtig</span><b class="s-correct">0</b></span>
      <span class="stat"><span class="stat-label">Quote</span><b class="s-pct">–</b></span>
      <span class="stat"><span class="stat-label">Zeit</span><b class="s-time">0:00</b></span>
    </div>
    <div class="map-wrap">
      <div class="map-loading">Karte wird geladen …</div>
      <div class="map-tools">
        <button class="map-btn" data-action="zoom-in" aria-label="Hineinzoomen">+</button>
        <button class="map-btn" data-action="zoom-out" aria-label="Herauszoomen">−</button>
        <button class="map-btn reset" data-action="reset" aria-label="Ausschnitt zurücksetzen">⟲</button>
      </div>
    </div>
    <section class="ask">
      <div class="question">
        <img class="flag" alt="" />
        <div class="q-text">
          <div class="q-label">Wie heißt die Hauptstadt von</div>
          <h2 class="q-country"></h2>
        </div>
      </div>
      <form class="answer-form" autocomplete="off">
        <input class="answer" type="text" name="answer" placeholder="Hauptstadt eingeben …" autocomplete="off"
          autocorrect="off" autocapitalize="words" spellcheck="false" enterkeyhint="send" aria-label="Hauptstadt" />
        <button class="btn primary submit" type="submit">OK</button>
      </form>
      <div class="slot">
        <div class="feedback" aria-live="polite"></div>
        <div class="ask-actions">
          <button class="btn ghost small" data-action="skip" type="button">Weiß ich nicht</button>
        </div>
      </div>
    </section>
  </main>`;

  const q = (s) => root.querySelector(s);
  quizUi = {
    main: q('.quiz'),
    mapWrap: q('.map-wrap'),
    flag: q('.flag'),
    country: q('.q-country'),
    form: q('.answer-form'),
    input: q('.answer'),
    submit: q('.submit'),
    feedback: q('.feedback'),
    skip: q('[data-action="skip"]'),
    num: q('.q-num'),
    bar: q('.bar-fill'),
    correct: q('.s-correct'),
    pct: q('.s-pct'),
    time: q('.s-time'),
    map: null,
  };
  const ui = quizUi;

  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (run.phase === 'feedback') nextQuestion();
    else answer(ui.input.value);
  });
  // Während die Lösung angezeigt wird, soll die Tastatur offen bleiben, aber nichts geändert werden
  ui.input.addEventListener('beforeinput', (e) => {
    if (run && run.phase === 'feedback' && e.inputType !== 'insertLineBreak') e.preventDefault();
  });
  ui.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && run && run.phase === 'feedback') {
      e.preventDefault();
      nextQuestion();
    }
  });
  root.onclick = async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'skip') {
      if (run.phase === 'feedback') nextQuestion();
      else answer('');
    } else if (a === 'next') nextQuestion();
    else if (a === 'zoom-in') ui.map?.zoomBy(1.6);
    else if (a === 'zoom-out') ui.map?.zoomBy(1 / 1.6);
    else if (a === 'reset') ui.map?.resetView();
    else if (a === 'quit') quitQuiz();
  };

  timerId = setInterval(() => {
    if (quizUi) quizUi.time.textContent = fmtTime(elapsed());
  }, 250);

  try {
    await loadMapData(BASE);
  } catch {
    ui.mapWrap.querySelector('.map-loading').textContent = 'Karte konnte nicht geladen werden.';
  }
  if (quizUi !== ui) return; // inzwischen verlassen
  ui.mapWrap.querySelector('.map-loading')?.remove();
  ui.map = new QuizMap(ui.mapWrap);
  showQuestion();
  resumeTimer();
}

function updateHud() {
  const ui = quizUi;
  const answered = run.answers.length;
  const correct = run.answers.filter((a) => a.result !== 'wrong').length;
  ui.num.textContent = Math.min(run.index + 1, run.ids.length);
  ui.bar.style.width = `${(answered / run.ids.length) * 100}%`;
  ui.correct.textContent = `${correct}/${answered}`;
  ui.pct.textContent = answered ? fmtPct((correct / answered) * 100) : '–';
  ui.time.textContent = fmtTime(elapsed());
}

function showQuestion() {
  const ui = quizUi;
  const entry = ENTRY_BY_ID[run.ids[run.index]];
  run.phase = 'ask';
  ui.main.classList.remove('is-exact', 'is-close', 'is-wrong');
  ui.flag.src = flagUrl(entry);
  ui.flag.alt = `Flagge von ${entry.name}`;
  ui.country.textContent = entry.name;
  ui.country.classList.toggle('long', entry.name.length > 22);
  ui.input.value = '';
  ui.input.className = 'answer';
  ui.submit.textContent = 'OK';
  ui.feedback.innerHTML = '';
  ui.skip.textContent = 'Weiß ich nicht';
  ui.map?.show(entry);
  updateHud();
  // nächste Flagge schon laden
  const nextId = run.ids[run.index + 1];
  if (nextId) new Image().src = flagUrl(ENTRY_BY_ID[nextId]);
  if (matchMedia('(pointer: fine)').matches || document.activeElement === ui.input) ui.input.focus({ preventScroll: true });
}

function answer(value) {
  if (run.phase !== 'ask') return;
  const ui = quizUi;
  const entry = ENTRY_BY_ID[run.ids[run.index]];
  const { result, match } = checkAnswer(value, entry, ENTRIES);
  run.answers.push({ id: entry.id, input: value.trim(), result, match });
  run.phase = 'feedback';
  ui.main.classList.add(`is-${result}`);
  ui.input.classList.add(result);

  const alsoCap = match !== entry.cap ? `<div class="fb-note">Hauptstadt: ${esc(entry.cap)}</div>` : '';
  if (result === 'exact') {
    ui.feedback.innerHTML = `<div class="fb exact"><span class="fb-icon">✓</span><div><div class="fb-title">Richtig!</div><div class="fb-answer">${esc(match)}</div>${alsoCap}</div></div>`;
    ui.map?.showLabel(entry.cap, 'ok');
  } else if (result === 'close') {
    const d = diffWords(value.trim(), match);
    const part = (p) => (p.diff ? `<mark>${esc(p.text)}</mark>` : esc(p.text));
    ui.feedback.innerHTML = `
      <div class="fb close"><span class="fb-icon">✓</span><div>
        <div class="fb-title">Fast richtig – zählt!</div>
        <div class="fb-typed">Deine Eingabe: <span class="typo">${d.typed.map(part).join('')}</span></div>
        <div class="fb-answer">Richtig geschrieben: <b class="fixed">${d.correct.map(part).join('')}</b></div>
        ${alsoCap}
      </div></div>`;
    ui.map?.showLabel(entry.cap, 'ok');
  } else {
    ui.feedback.innerHTML = `
      <div class="fb wrong"><span class="fb-icon">✗</span><div>
        <div class="fb-title">${value.trim() ? 'Leider falsch' : 'Auflösung'}</div>
        <div class="fb-answer">Richtig ist: <b>${esc(entry.cap)}</b></div>
      </div></div>`;
    ui.map?.showLabel(entry.cap, 'bad');
  }
  ui.submit.textContent = 'Weiter →';
  ui.skip.textContent = 'Weiter';
  updateHud();
  persistRun();

  if (result === 'exact') {
    advanceId = setTimeout(() => run && run.phase === 'feedback' && nextQuestion(), 1100);
  }
}

function nextQuestion() {
  clearTimeout(advanceId);
  if (!run || run.phase !== 'feedback') return;
  run.index++;
  if (run.index >= run.ids.length) return finishQuiz();
  persistRun();
  showQuestion();
}

function finishQuiz() {
  pauseTimer();
  const total = run.ids.length;
  const correct = run.answers.filter((a) => a.result !== 'wrong').length;
  const attempt = { correct, total, pct: (correct / total) * 100, time: Math.round(run.elapsed), date: Date.now() };
  const before = store.getScores(run.catKey).length;
  const rank = run.practice ? 0 : store.addScore(run.catKey, attempt);
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
  } else {
    resumeTimer();
    if (matchMedia('(pointer: fine)').matches) quizUi?.input.focus();
  }
}

// ── Ergebnis ────────────────────────────────────────────────────────
function renderResult() {
  const { run: r, attempt, rank, first } = lastResult;
  const wrong = r.answers.filter((a) => a.result === 'wrong');
  const close = r.answers.filter((a) => a.result === 'close');
  const cat = CAT[r.catKey];
  const deg = (attempt.pct / 100) * 360;
  const avg = attempt.time / attempt.total / 1000;
  const verdict =
    attempt.pct === 100 ? 'Perfekt! 🎉' : attempt.pct >= 90 ? 'Hervorragend!' : attempt.pct >= 70 ? 'Stark!' : attempt.pct >= 50 ? 'Gut gemacht!' : 'Weiter üben!';
  const rankText = r.practice
    ? 'Übungsrunde – wird nicht in der Bestenliste gespeichert.'
    : rank === 1 && first
      ? '🏆 Dein erster Eintrag in der Bestenliste!'
      : rank === 1
        ? '🏆 Neuer Rekord in dieser Kategorie!'
      : rank
        ? `Platz ${rank} in deiner Top 5`
        : 'Diesmal nicht in den Top 5';

  const row = (a) => {
    const e = ENTRY_BY_ID[a.id];
    return `<li>
      <img src="${flagUrl(e)}" alt="" loading="lazy" />
      <div class="m-text">
        <div class="m-country">${esc(e.name)}</div>
        <div class="m-answer">${a.input ? `<s>${esc(a.input)}</s> → ` : ''}<b>${esc(a.result === 'close' ? a.match : e.cap)}</b></div>
      </div>
    </li>`;
  };

  root.innerHTML = `
  <main class="result" style="--c:${r.color || '#4c5fd5'}">
    <header class="cat-head">
      <button class="icon-btn" data-action="home" aria-label="Zum Menü">←</button>
    </header>
    <section class="result-hero">
      <div class="ring" style="--deg:${deg}deg"><div class="ring-inner"><b>${fmtPct(attempt.pct)}</b><span>richtig</span></div></div>
      <h1>${verdict}</h1>
      <p class="result-cat">${esc(r.title)} · ${esc(r.subtitle || '')}</p>
      <div class="result-stats">
        <div><b>${attempt.correct}/${attempt.total}</b><span>Richtig</span></div>
        <div><b>${fmtTime(attempt.time)}</b><span>Zeit</span></div>
        <div><b>${avg.toFixed(1).replace('.', ',')} s</b><span>pro Frage</span></div>
      </div>
      <div class="rank-badge ${rank === 1 ? 'gold' : ''}">${rankText}</div>
    </section>

    <div class="result-actions">
      <button class="btn primary big" data-action="again">Nochmal spielen</button>
      ${wrong.length ? `<button class="btn ghost big" data-action="practice">Fehler üben (${wrong.length})</button>` : ''}
    </div>

    ${
      !r.practice && cat
        ? `<section class="panel"><div class="panel-head"><h2>🏆 Top 5 · ${esc(cat.title)} <small>${esc(cat.subtitle)}</small></h2></div>${scoreList(r.catKey, attempt.date)}</section>`
        : ''
    }
    ${wrong.length ? `<section class="panel"><div class="panel-head"><h2>✗ Falsch (${wrong.length})</h2></div><ul class="mistakes">${wrong.map(row).join('')}</ul></section>` : ''}
    ${close.length ? `<section class="panel"><div class="panel-head"><h2>✎ Mit Tippfehler (${close.length})</h2></div><ul class="mistakes close">${close.map(row).join('')}</ul></section>` : ''}
    <div class="result-actions"><button class="btn ghost" data-action="home">Zum Menü</button></div>
  </main>`;

  root.onclick = (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    const base = cat || { key: r.catKey, title: r.title, subtitle: r.subtitle, color: r.color, ids: r.ids };
    if (a === 'home') go('#start');
    else if (a === 'again') startQuiz(base, r.practice ? r.ids : base.ids, r.practice);
    else if (a === 'practice') startQuiz({ ...base, title: base.title }, wrong.map((w) => w.id), true);
  };
}

// ── Bestenlisten ────────────────────────────────────────────────────
function renderScores() {
  const all = store.getAllScores();
  const groups = [
    { title: 'Weltweit', cats: CATS.filter((c) => c.group === 'world') },
    ...CONTINENTS.map((c) => ({ title: `${c.emoji} ${c.name}`, cats: CATS.filter((k) => k.cont === c.id) })),
  ];
  const any = Object.values(all).some((l) => l.length);
  root.innerHTML = `
  <main class="scores-page">
    <header class="cat-head">
      <button class="icon-btn" data-action="home" aria-label="Zurück">←</button>
      <h1>Bestenlisten</h1>
    </header>
    ${groups
      .map(
        (g) => `
      <h2 class="section-title">${esc(g.title)}</h2>
      ${g.cats
        .map(
          (c) => `
        <section class="panel">
          <div class="panel-head"><h3>${c.group === 'world' ? `${c.emoji} ${esc(c.title)}` : esc(c.subtitle)}</h3><span class="count-pill">${c.ids.length}</span></div>
          ${scoreList(c.key)}
        </section>`,
        )
        .join('')}`,
      )
      .join('')}
    ${any ? '<div class="result-actions"><button class="btn ghost danger" data-action="clear-all">Alle Bestenlisten löschen</button></div>' : ''}
  </main>`;

  root.onclick = async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    if (t.dataset.action === 'home') go('#start');
    else if (t.dataset.action === 'clear-all') {
      const ok = await modal({
        title: 'Alle Bestenlisten löschen?',
        text: 'Das kann nicht rückgängig gemacht werden.',
        buttons: [
          { label: 'Abbrechen', value: false },
          { label: 'Alles löschen', value: true, kind: 'danger' },
        ],
      });
      if (ok) {
        store.clearScores();
        renderScores();
      }
    }
  };
}

// ── Bildschirmtastatur: sichtbare Höhe für das Layout bereitstellen ──
function syncViewport() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-h', `${h}px`);
  if (document.body.classList.contains('in-quiz')) window.scrollTo(0, 0);
}
window.visualViewport?.addEventListener('resize', syncViewport);
window.visualViewport?.addEventListener('scroll', syncViewport);
window.addEventListener('resize', syncViewport);
syncViewport();

render();

// Offline-Unterstützung (nur in der fertigen App)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${BASE}sw.js`).catch(() => {}));
}

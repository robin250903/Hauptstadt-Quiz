// Tests für die Lerndaten und Quizfragen des Geo-Trainers
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ENTRY_BY_ID } from '../src/data/entries.js';
import { COUNTRIES, COUNTRY_BY_ID } from '../geo/src/data/countries.js';
import { CATEGORIES } from '../geo/src/data/categories.js';
import { REGIONS } from '../geo/src/data/regions.js';
import * as quiz from '../geo/src/quiz.js';

// Reproduzierbarer Zufall
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

test('jedes Land hat Name, Flagge und vollständige Daten', () => {
  const ids = new Set();
  for (const c of COUNTRIES) {
    assert.ok(!ids.has(c.id), `doppelt: ${c.id}`);
    ids.add(c.id);
    assert.ok(ENTRY_BY_ID[c.id], `kein Eintrag im Hauptstadt-Quiz: ${c.id}`);
    assert.ok(fs.existsSync(`public/flags/${ENTRY_BY_ID[c.id].flag || c.id}.svg`), `keine Flagge: ${c.id}`);
    assert.match(c.drive, /^[LR]$/, c.id);
    assert.match(c.tld, /^\.[a-z]{2}$/, c.id);
    assert.match(c.tel, /^\+\d{1,3}$/, c.id);
    assert.ok(c.tips.length >= 2, `zu wenige Tipps: ${c.id}`);
  }
});

test('Merkmale verweisen nur auf bekannte Länder und haben genug falsche Antworten', () => {
  for (const cat of CATEGORIES) {
    if (cat.kind !== 'items') continue;
    const ids = new Set();
    for (const it of cat.items) {
      assert.ok(!ids.has(it.id), `doppelte Item-ID ${cat.id}:${it.id}`);
      ids.add(it.id);
      for (const c of it.c) assert.ok(COUNTRY_BY_ID[c], `${cat.id}:${it.id} – unbekanntes Land ${c}`);
      assert.ok(it.v && it.cap && it.text, `${cat.id}:${it.id} unvollständig`);
      const pool = quiz.distractorPool(cat, it);
      assert.ok(pool.length >= quiz.OPTION_COUNT - 1, `${cat.id}:${it.id} – zu wenige falsche Antworten`);
      for (const p of pool) assert.ok(!it.c.includes(p) && !(it.amb || []).includes(p), `${cat.id}:${it.id} – ${p} ist mehrdeutig`);
    }
  }
});

test('Quizfragen haben genau eine richtige, eindeutige Antwort', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const rnd = seeded(seed);
    for (const cat of CATEGORIES) {
      for (const q of quiz.buildCategoryQuestions(cat.id, rnd, 0)) {
        const n = q.binary ? 2 : quiz.OPTION_COUNT;
        assert.equal(q.options.length, n, q.key);
        assert.equal(new Set(q.options.map((o) => o.id)).size, n, `${q.key}: doppelte Antworten`);
        assert.ok(q.correct >= 0 && q.correct < n, q.key);
        // keine falsche Antwort darf ebenfalls auf das Merkmal passen
        const right = q.options[q.correct].id;
        for (const o of q.options) if (o.id !== right) assert.ok(!(q.also || []).includes(o.id), `${q.key}: ${o.id} passt auch`);
      }
    }
  }
});

test('Domain- und Vorwahl-Fragen: gleiche Werte werden zusammengefasst', () => {
  const tel = quiz.buildCategoryQuestions('vorwahlen', seeded(3), 0);
  const plus1 = tel.find((q) => q.key === 'vorwahlen:+1');
  assert.ok(plus1.also.length >= 3, '+1 gilt für mehrere Länder');
  const wrong = plus1.options.filter((_, i) => i !== plus1.correct).map((o) => o.id);
  for (const id of ['us', 'ca', 'pr', 'do']) assert.ok(!wrong.includes(id));
});

test('Regionen: gültige Koordinaten und Quiz', () => {
  for (const [id, data] of Object.entries(REGIONS)) {
    assert.ok(COUNTRY_BY_ID[id], `Regionen für unbekanntes Land ${id}`);
    assert.ok(data.regions.length >= 2, id);
    for (const r of data.regions) {
      assert.ok(Math.abs(r.ll[0]) <= 90 && Math.abs(r.ll[1]) <= 180, `${id}: ${r.n}`);
      assert.ok(r.t.length >= 1, `${id}: ${r.n} ohne Hinweis`);
      for (const t of r.t) assert.ok(!t.toLowerCase().includes(r.n.toLowerCase()), `${id}: Hinweis verrät „${r.n}“`);
    }
    const qs = quiz.buildRegionQuestions(id, seeded(7));
    assert.equal(qs.length, data.regions.length);
    for (const q of qs) assert.equal(q.options[q.correct].label, data.regions[q.map.region].n);
  }
});

test('Lernfortschritt-Schlüssel passen zu den Fragen', () => {
  for (const cat of CATEGORIES) {
    const keys = new Set(quiz.questionKeys(cat.id));
    for (const q of quiz.buildCategoryQuestions(cat.id, seeded(11), 0)) assert.ok(keys.has(q.key), q.key);
  }
});

// Tests für die Lerndaten und Quizfragen des Geo-Trainers
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ENTRY_BY_ID } from '../src/data/entries.js';
import { COUNTRIES, COUNTRY_BY_ID } from '../geo/src/data/countries.js';
import { CATEGORIES } from '../geo/src/data/categories.js';
import { REGIONS } from '../geo/src/data/regions.js';
import * as quiz from '../geo/src/quiz.js';
import { checkTyped, choicesFor } from '../geo/src/answers.js';

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

test('Merkmale verweisen nur auf bekannte Länder', () => {
  for (const cat of CATEGORIES) {
    if (cat.kind !== 'items') continue;
    const ids = new Set();
    for (const it of cat.items) {
      assert.ok(!ids.has(it.id), `doppelte Item-ID ${cat.id}:${it.id}`);
      ids.add(it.id);
      for (const c of it.c) assert.ok(COUNTRY_BY_ID[c], `${cat.id}:${it.id} – unbekanntes Land ${c}`);
      assert.ok(it.v && it.cap && it.text, `${cat.id}:${it.id} unvollständig`);
    }
  }
});

test('Quizfragen sind vollständig', () => {
  for (const cat of CATEGORIES) {
    for (const q of quiz.buildCategoryQuestions(cat.id, seeded(3), 0)) {
      assert.ok(q.key && q.prompt && q.explain && q.answer, q.key);
      assert.ok(['country', 'drive'].includes(q.kind), q.key);
      assert.ok(q.accept.length >= 1, q.key);
    }
  }
});

test('Jede Frage lässt sich mit jedem richtigen Land beantworten', () => {
  for (const cat of CATEGORIES) {
    for (const q of quiz.buildCategoryQuestions(cat.id, seeded(1), 0)) {
      const choices = choicesFor(q, []);
      for (const id of q.accept) {
        const label = choices.find((c) => c.id === id).label;
        assert.equal(checkTyped(label, q.accept, choices).result, 'exact', `${q.key}: ${label}`);
      }
    }
  }
});

test('Eingetippte Länder: Tippfehler, andere Sprachen, falsche Länder', () => {
  const choices = choicesFor({ kind: 'country' }, []);
  const t = (input, accept) => checkTyped(input, accept, choices).result;
  assert.equal(t('deutschland', ['de']), 'exact');
  assert.equal(t('Germany', ['de']), 'exact');
  assert.equal(t('Deutchland', ['de']), 'close');
  assert.equal(t('oesterreich', ['at']), 'exact');
  assert.equal(t('USA', ['us']), 'exact');
  assert.equal(t('UK', ['gb']), 'exact');
  assert.equal(t('Grossbritannien', ['gb']), 'exact');
  assert.equal(t('Kolumbien', ['co', 'il']), 'exact');
  assert.equal(t('Israel', ['co', 'il']), 'exact');
  assert.equal(t('Österreich', ['de']), 'wrong');
  assert.equal(t('Schweden', ['ch']), 'wrong'); // ähnlich wie „Schweiz“, aber ein anderes Land
  assert.equal(t('', ['de']), 'wrong');
  assert.equal(t('Bananenland', ['de']), 'wrong');
});

test('Fahrseite und Regionen eintippen', () => {
  const drive = choicesFor({ kind: 'drive' }, []);
  assert.equal(checkTyped('links', ['L'], drive).result, 'exact');
  assert.equal(checkTyped('Rechtsverkehr', ['L'], drive).result, 'wrong');
  const us = REGIONS.us.regions;
  const reg = choicesFor({ kind: 'region' }, us);
  const plains = String(us.findIndex((r) => r.n === 'Great Plains'));
  assert.equal(checkTyped('great plains', [plains], reg).result, 'exact');
  assert.equal(checkTyped('Grate Plains', [plains], reg).result, 'close');
  const br = REGIONS.br.regions;
  const cerrado = String(br.findIndex((r) => r.n.includes('Cerrado')));
  assert.equal(checkTyped('Cerrado', [cerrado], choicesFor({ kind: 'region' }, br)).result, 'exact');
});

test('Domain- und Vorwahl-Fragen: gleiche Werte werden zusammengefasst', () => {
  const tel = quiz.buildCategoryQuestions('vorwahlen', seeded(3), 0);
  const plus1 = tel.find((q) => q.key === 'vorwahlen:+1');
  for (const id of ['us', 'ca', 'pr', 'do']) assert.ok(plus1.accept.includes(id));
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
    const choices = choicesFor({ kind: 'region' }, data.regions);
    for (const q of qs) {
      assert.equal(q.answer, data.regions[q.map.region].n);
      assert.equal(checkTyped(q.answer, q.accept, choices).result, 'exact', `${id}: ${q.answer}`);
    }
  }
});

test('Lernfortschritt-Schlüssel passen zu den Fragen', () => {
  for (const cat of CATEGORIES) {
    const keys = new Set(quiz.questionKeys(cat.id));
    for (const q of quiz.buildCategoryQuestions(cat.id, seeded(11), 0)) assert.ok(keys.has(q.key), q.key);
  }
});

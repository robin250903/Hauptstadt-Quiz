// Bereitet Kartendaten und Flaggen für die App vor.
// Aufruf: npm run prepare-data
//
// Quellen:
//   - world-atlas (Natural Earth 1:10m, gemeinfrei)
//   - scripts/source/extra.geojson: zusätzliche Gebiete aus Natural Earth
//     (Überseegebiete wie Réunion, umstrittene Gebiete wie Abchasien)
//   - flag-icons (MIT-Lizenz) und eigene Flaggen in scripts/flags

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as topojson from 'topojson-client';
import { topology } from 'topojson-server';
import { presimplify, simplify, sphericalTriangleArea } from 'topojson-simplify';
import { ENTRIES } from '../src/data/entries.js';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => path.join(root, 'public', p);

fs.mkdirSync(out('data'), { recursive: true });
fs.mkdirSync(out('flags'), { recursive: true });

// ── Karte ────────────────────────────────────────────────────────────
// Vereinfachung auf der Kugel (wichtig für Inseln an der Datumsgrenze, z. B. Fidschi)
const MIN_WEIGHT = 3e-7; // Steradiant, entspricht Dreiecken von ca. 12 km²

function shrink(topo, name) {
  let t = presimplify(topo, sphericalTriangleArea);
  // Kleine Inseln (geschlossene, kurze Linien) nicht vereinfachen, sonst verschwinden sie
  for (const arc of t.arcs) {
    const [a, b] = [arc[0], arc[arc.length - 1]];
    if (arc.length <= 60 && a[0] === b[0] && a[1] === b[1]) for (const p of arc) p[2] = Infinity;
  }
  t = simplify(t, MIN_WEIGHT);
  t.arcs = t.arcs.map((arc) => arc.map((p) => [p[0], p[1]]));
  t = topojson.quantize(t, 4e5);
  fs.writeFileSync(out(`data/${name}.json`), JSON.stringify(t));
  console.log(`Karte ${name}: ${(fs.statSync(out(`data/${name}.json`)).size / 1024).toFixed(0)} KB`);
  return t;
}

const world = structuredClone(require('world-atlas/countries-10m.json'));
world.objects = { world: world.objects.countries };
delete world.bbox;
for (const g of world.objects.world.geometries) g.properties = { n: g.properties.name };
const extraGeo = JSON.parse(fs.readFileSync(path.join(root, 'scripts/source/extra.geojson'), 'utf8'));
for (const f of extraGeo.features) f.properties = { n: f.properties.name };

const names = new Set([
  ...world.objects.world.geometries.map((g) => g.properties.n),
  ...extraGeo.features.map((f) => f.properties.n),
]);
let missing = 0;
for (const e of ENTRIES) {
  for (const g of [].concat(e.geo)) {
    if (!names.has(g)) {
      console.error(`Keine Kartenform für ${e.name}: "${g}"`);
      missing++;
    }
  }
}
if (missing) process.exit(1);

shrink(world, 'world');
shrink(topology({ extra: extraGeo }, 1e6), 'extra');

// Grobe Weltkarte für den kleinen Globus
fs.copyFileSync(require.resolve('world-atlas/land-110m.json'), out('data/land.json'));

// ── Flaggen ──────────────────────────────────────────────────────────
const flagDir = path.join(path.dirname(require.resolve('flag-icons/package.json')), 'flags/4x3');
let flags = 0;
for (const e of ENTRIES) {
  const code = e.flag || e.id;
  const own = path.join(root, 'scripts/flags', `${code}.svg`);
  const lib = path.join(flagDir, `${code}.svg`);
  const src = fs.existsSync(own) ? own : lib;
  if (!fs.existsSync(src)) {
    console.error(`Keine Flagge für ${e.name} (${code})`);
    process.exit(1);
  }
  fs.copyFileSync(src, out(`flags/${code}.svg`));
  flags++;
}
console.log(`Flaggen: ${flags} kopiert`);

// ── Doppelte IDs prüfen ──────────────────────────────────────────────
const ids = new Set();
for (const e of ENTRIES) {
  if (ids.has(e.id)) {
    console.error(`Doppelte ID: ${e.id}`);
    process.exit(1);
  }
  ids.add(e.id);
}
console.log(`Einträge: ${ENTRIES.length} (${ENTRIES.filter((e) => e.type === 's').length} Staaten, ${ENTRIES.filter((e) => e.type === 't').length} Gebiete)`);

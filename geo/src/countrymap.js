// Kleine Landkarte eines Landes mit Regionen-Pins (statisch, ohne Gesten).
// Nutzt die Kartendaten des Hauptstadt-Quiz (Natural Earth).

import { geoOrthographic, geoPath, geoArea, geoCentroid, geoDistance, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import { ENTRY_BY_ID } from '../../src/data/entries.js';

const EARTH_KM = 6371;
let shapes = null; // Name → Liste von Polygonen
let all = []; // alle Polygone (Hintergrund)
let loading = null;

function fixPolygon(coordinates) {
  let poly = { type: 'Polygon', coordinates };
  if (geoArea(poly) > 2 * Math.PI) poly = { type: 'Polygon', coordinates: coordinates.map((r) => [...r].reverse()) };
  return { poly, centroid: geoCentroid(poly), radius: Math.max(...poly.coordinates[0].map((p) => geoDistance(geoCentroid(poly), p))) };
}

export function loadShapes(dataUrl) {
  if (shapes) return Promise.resolve();
  loading ||= fetch(dataUrl)
    .then((r) => r.json())
    .then((topo) => {
      shapes = new Map();
      for (const f of feature(topo, topo.objects[Object.keys(topo.objects)[0]]).features) {
        const g = f.geometry;
        if (!g) continue;
        const parts = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map(fixPolygon);
        shapes.set(f.properties.n, (shapes.get(f.properties.n) || []).concat(parts));
        all.push(...parts);
      }
    });
  return loading;
}

const multi = (list) => ({ type: 'MultiPolygon', coordinates: list.map((p) => p.poly.coordinates) });

/**
 * Zeichnet die Karte als SVG-String.
 * @param id       Länder-ID
 * @param pins     [{ ll: [lat, lon], label, state: 'ok'|'bad'|'hint'|'', num }]
 * @param view     optionaler Ausschnitt [W, S, E, N]
 */
export function countryMapSvg(id, { pins = [], view, w = 360, h = 260 } = {}) {
  if (!shapes) return '';
  const entry = ENTRY_BY_ID[id];
  const cap = [entry.ll[1], entry.ll[0]];
  let polys = [].concat(entry.geo).flatMap((n) => shapes.get(n) || []);
  if (entry.r) polys = polys.filter((p) => geoDistance(p.centroid, cap) * EARTH_KM <= Math.max(entry.r, 1500));

  const pts = pins.map((p) => [p.ll[1], p.ll[0]]);
  let fit;
  if (view) {
    const [W, S, E, N] = view;
    const box = [];
    for (let i = 0; i <= 6; i++) box.push([W + ((E - W) * i) / 6, S], [W + ((E - W) * i) / 6, N], [W, S + ((N - S) * i) / 6], [E, S + ((N - S) * i) / 6]);
    fit = { type: 'MultiPoint', coordinates: [...box, ...pts] };
  } else {
    // Hauptfläche(n) plus alle Pins
    const big = [...polys].sort((a, b) => geoArea(b.poly) - geoArea(a.poly)).slice(0, 6);
    fit = { type: 'GeometryCollection', geometries: [multi(big), { type: 'MultiPoint', coordinates: pts.length ? pts : [cap] }] };
  }
  const center = geoCentroid(fit);
  const pad = 22;
  const proj = geoOrthographic().clipAngle(90).precision(0.4).rotate([-center[0], -center[1]]).fitExtent([[pad, pad], [w - pad, h - pad]], fit);
  const path = geoPath(proj);
  const rot = proj.rotate();
  const vc = [-rot[0], -rot[1]];
  const visible = all.filter((p) => geoDistance(vc, p.centroid) - p.radius < 1.3);

  const pinSvg = pins
    .map((p, i) => {
      const xy = proj([p.ll[1], p.ll[0]]);
      if (!xy) return '';
      const [x, y] = xy.map((v) => v.toFixed(1));
      const cls = p.state || '';
      const num = p.num ?? i + 1;
      const label = p.label
        ? `<text class="cm-label" x="${x}" y="${(+y + (+y > h - 34 ? -18 : 22)).toFixed(1)}" text-anchor="middle">${p.label.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</text>`
        : '';
      return `<g class="cm-pin ${cls}" transform="translate(${x} ${y})"><circle r="${cls ? 11 : 9}"/>${cls === 'hint' ? '' : `<text dy="4" text-anchor="middle">${cls === 'ok' ? '✓' : cls === 'bad' ? '✗' : num}</text>`}</g>${label}`;
    })
    .join('');

  return `<svg class="cmap" viewBox="0 0 ${w} ${h}" role="img" aria-label="Karte">
    <path class="cm-sphere" d="${path({ type: 'Sphere' })}"/>
    <path class="cm-grid" d="${path(geoGraticule10()) || ''}"/>
    <path class="cm-land" d="${path(multi(visible)) || ''}"/>
    <path class="cm-target" d="${path(multi(polys)) || ''}"/>
    ${pinSvg}
  </svg>`;
}

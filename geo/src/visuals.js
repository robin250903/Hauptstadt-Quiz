// Gezeichnete Illustrationen (SVG) für die Lernkarten und Quizfragen.
// Alles wird aus wenigen Parametern erzeugt – so lassen sich Poller, Straßen,
// Kennzeichen, Masten und Schilder einheitlich darstellen.
//
// Hinweis: Die Zeichnungen sind vereinfacht und zeigen die typischen Merkmale
// (Farben, Formen, Anordnung), keine exakten Abbilder.

let uid = 0;
const id = (p) => `${p}${++uid}`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const wrap = (vb, body, cls = '') => `<svg class="vis ${cls}" viewBox="${vb}" role="img" aria-hidden="true">${body}</svg>`;

function scene(w, h, horizon, { sky = ['#bfe3ff', '#e8f5ff'], ground = ['#9fd18b', '#6fae5c'] } = {}) {
  const s = id('sky');
  const g = id('gr');
  return `
    <defs>
      <linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
      <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground[0]}"/><stop offset="1" stop-color="${ground[1]}"/></linearGradient>
    </defs>
    <rect width="${w}" height="${horizon}" fill="url(#${s})"/>
    <rect y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#${g})"/>`;
}

// ── Poller / Leitpfosten ─────────────────────────────────────────────
// p = { body, top: 'flat'|'slant'|'round'|'curve'|'wedge', w, head: {color, h, slant},
//       bands: [{y, h, color}], refl: [{y, h, w, x, color, shape: 'rect'|'circle'|'para'}] }
export function bollard(p) {
  const W = 120;
  const H = 200;
  const w = p.w || 30;
  const x0 = 60 - w / 2;
  const x1 = 60 + w / 2;
  const yb = 186; // Fuß
  const yt = p.short ? 100 : p.tall ? 26 : 44; // Oberkante
  let outline;
  switch (p.top) {
    case 'slant':
      outline = `M${x0} ${yb}V${yt + 12}L${x1} ${yt}V${yb}Z`;
      break;
    case 'round':
      outline = `M${x0} ${yb}V${yt + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x1} ${yt + w / 2}V${yb}Z`;
      break;
    case 'curve':
      outline = `M${x0} ${yb}V${yt + 14}Q${x0 + 2} ${yt} ${x1 + 6} ${yt - 2}Q${x1} ${yt + 10} ${x1} ${yt + 26}V${yb}Z`;
      break;
    case 'wedge':
      outline = `M${x0} ${yb}V${yt + 8}L60 ${yt}L${x1} ${yt + 8}V${yb}Z`;
      break;
    default:
      outline = `M${x0} ${yb}V${yt}H${x1}V${yb}Z`;
  }
  const clip = id('bc');
  const shade = id('bs');
  const parts = [];
  if (p.head) {
    const hh = p.head.h || 30;
    const sl = p.head.slant || 0;
    parts.push(`<path d="M${x0 - 8} ${yt - 20}H${x1 + 10}V${yt + hh - sl}L${x0 - 8} ${yt + hh + sl}Z" fill="${p.head.color}"/>`);
  }
  for (const b of p.bands || []) {
    const sl = b.slant || 0;
    parts.push(`<path d="M${x0 - 8} ${yt + b.y + sl}L${x1 + 10} ${yt + b.y - sl}V${yt + b.y + b.h - sl}L${x0 - 8} ${yt + b.y + b.h + sl}Z" fill="${b.color}"/>`);
  }
  for (const r of p.refl || []) {
    const rw = r.w || w * 0.5;
    const rh = r.h || 10;
    const cx = 60 + (r.x || 0);
    const y = yt + r.y;
    if (r.shape === 'circle') {
      parts.push(`<circle cx="${cx}" cy="${y + rh / 2}" r="${rh / 2}" fill="${r.color}" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`);
    } else if (r.shape === 'para') {
      parts.push(`<path d="M${cx - rw / 2} ${y + 4}L${cx + rw / 2} ${y}V${y + rh}L${cx - rw / 2} ${y + rh + 4}Z" fill="${r.color}" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`);
    } else {
      parts.push(`<rect x="${cx - rw / 2}" y="${y}" width="${rw}" height="${rh}" rx="1.5" fill="${r.color}" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`);
    }
  }
  return wrap(
    `0 0 ${W} ${H}`,
    `${scene(W, H, 120)}
    <ellipse cx="60" cy="${yb + 2}" rx="${w * 0.9}" ry="5" fill="rgba(0,0,0,.18)"/>
    <defs>
      <clipPath id="${clip}"><path d="${outline}"/></clipPath>
      <linearGradient id="${shade}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    </defs>
    <g clip-path="url(#${clip})">
      <rect x="0" y="0" width="${W}" height="${H}" fill="${p.body || '#f6f6f2'}"/>
      ${parts.join('')}
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#${shade})"/>
    </g>
    <path d="${outline}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2" stroke-linejoin="round"/>`,
    'vis-tall',
  );
}

// ── Straße mit Markierungen ──────────────────────────────────────────
// p = { center: {color, style}, edge: {color, style}, curb: {color, style}, car: 'l'|'r' }
// style: 'solid' | 'dashed' | 'double' | 'double-dashed' | 'short'
export function road(p) {
  const W = 220;
  const H = 150;
  const hz = 56;
  const X = (u, t) => 110 + u * 100 * t; // u: -1 … 1 quer, t: 0 (Horizont) … 1 (vorne)
  const Y = (t) => hz + (H - hz) * t;
  const quad = (u, du, t0, t1, color) =>
    `<path d="M${X(u - du, t0)} ${Y(t0)}L${X(u + du, t0)} ${Y(t0)}L${X(u + du, t1)} ${Y(t1)}L${X(u - du, t1)} ${Y(t1)}Z" fill="${color}"/>`;
  const line = (u, style, color, thick = 0.018) => {
    const out = [];
    const solid = (uu) => out.push(quad(uu, thick, 0.02, 1.05, color));
    const dashed = (uu, len = 1.2, gap = 2.2) => {
      for (let z = 0.95; z < 40; z += len + gap) out.push(quad(uu, thick, 1 / (z + len), 1 / z, color));
    };
    if (style === 'solid') solid(u);
    else if (style === 'dashed') dashed(u, 0.7, 1.1);
    else if (style === 'short') dashed(u, 0.25, 0.35);
    else if (style === 'double') {
      solid(u - thick * 1.8);
      solid(u + thick * 1.8);
    } else if (style === 'double-wide') {
      solid(u - thick * 3.2);
      solid(u + thick * 3.2);
    } else if (style === 'double-dashed') {
      solid(u - thick * 1.8);
      dashed(u + thick * 1.8);
    }
    return out.join('');
  };
  const c = p.center;
  const e = p.edge;
  const parts = [
    `<path d="M${X(-1, 0)} ${hz}L${X(1, 0)} ${hz}L${X(1.06, 1.1)} ${Y(1.1)}L${X(-1.06, 1.1)} ${Y(1.1)}Z" fill="#5d6168"/>`,
    `<path d="M${X(-1, 0)} ${hz}L${X(1, 0)} ${hz}L${X(1.06, 1.1)} ${Y(1.1)}L${X(-1.06, 1.1)} ${Y(1.1)}Z" fill="url(#asph)"/>`,
  ];
  if (e) parts.push(line(-0.9, e.style, e.color, 0.02), line(0.9, e.style, e.color, 0.02));
  if (p.curb) parts.push(line(-1.0, p.curb.style, p.curb.color, 0.016), line(1.0, p.curb.style, p.curb.color, 0.016));
  if (c) parts.push(line(0, c.style, c.color));
  if (p.center2) parts.push(line(0, p.center2.style, p.center2.color));
  if (p.car) {
    const u = p.car === 'l' ? -0.45 : 0.45;
    const t = 0.55;
    const cx = X(u, t);
    const cy = Y(t);
    parts.push(`
      <g transform="translate(${cx} ${cy})">
        <ellipse cx="0" cy="2" rx="21" ry="4" fill="rgba(0,0,0,.3)"/>
        <rect x="-19" y="-20" width="38" height="20" rx="5" fill="#e5484d"/>
        <path d="M-13 -20L-9 -31H9L13 -20Z" fill="#c93a3f"/>
        <path d="M-10.5 -21L-7.5 -29H7.5L10.5 -21Z" fill="#9fd3ff"/>
        <rect x="-17" y="-14" width="7" height="4" rx="1.5" fill="#ffd27a"/>
        <rect x="10" y="-14" width="7" height="4" rx="1.5" fill="#ffd27a"/>
        <rect x="-7" y="-9" width="14" height="5" rx="1" fill="#fff"/>
        <rect x="-18" y="-2" width="8" height="5" rx="1.5" fill="#222"/>
        <rect x="10" y="-2" width="8" height="5" rx="1.5" fill="#222"/>
      </g>`);
  }
  return wrap(
    `0 0 ${W} ${H}`,
    `${scene(W, H, hz)}
    <defs><linearGradient id="asph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity=".06"/></linearGradient></defs>
    <path d="M0 ${hz}Q40 ${hz - 14} 80 ${hz}T160 ${hz - 2}T220 ${hz}V${hz + 1}H0Z" fill="#7fae9c" opacity=".7"/>
    ${parts.join('')}`,
    'vis-wide',
  );
}

// ── Kennzeichen ──────────────────────────────────────────────────────
// p = { bg, fg, text, eu: 'D' (EU-Band mit Länderkürzel), left: {color, text, flag},
//       right: {color, text}, border, stripes: color (oben + unten), top: {color, text},
//       crest: 'hr'|'ch', rear: {...}  (zweites Schild darunter) }
function plateSvg(p, y = 0) {
  const W = 240;
  const h = 58;
  const parts = [];
  const r = 7;
  parts.push(`<rect x="4" y="${y + 4}" width="${W - 8}" height="${h - 8}" rx="${r}" fill="${p.bg}" stroke="${p.border || 'rgba(0,0,0,.45)'}" stroke-width="${p.border ? 4 : 1.5}"/>`);
  let tx0 = 12;
  let tx1 = W - 12;
  const band = (x, color, label, side) => {
    parts.push(`<path d="${side === 'l' ? `M${x + r} ${y + 5}H${x + 26}V${y + h - 5}H${x + r}A${r - 1} ${r - 1} 0 0 1 ${x + 1} ${y + h - 5 - r + 1}V${y + 5 + r - 1}A${r - 1} ${r - 1} 0 0 1 ${x + r} ${y + 5}Z` : `M${x} ${y + 5}H${x + 26 - r}A${r - 1} ${r - 1} 0 0 1 ${x + 25} ${y + 5 + r - 1}V${y + h - 5 - r + 1}A${r - 1} ${r - 1} 0 0 1 ${x + 26 - r} ${y + h - 5}H${x}Z`}" fill="${color}"/>`);
    if (label) parts.push(`<text x="${x + 13}" y="${y + h - 12}" text-anchor="middle" font-size="${label.length > 2 ? 10 : 12}" font-weight="700" fill="${tc || '#fff'}" font-family="Arial, sans-serif">${esc(label)}</text>`);
  };
  let tc = null;
  if (p.eu) {
    band(5, '#1d4fb8', p.eu, 'l');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(`<circle cx="${18 + Math.cos(a) * 7}" cy="${y + 20 + Math.sin(a) * 7}" r="1.3" fill="#ffd21f"/>`);
    }
    tx0 = 34;
  } else if (p.left) {
    tc = p.left.textColor;
    band(5, p.left.color, p.left.topColor ? '' : p.left.text, 'l');
    tc = null;
    if (p.left.topColor) {
      parts.push(`<path d="M${5 + r} ${y + 5}H31V${y + h / 2}H6V${y + 5 + r - 1}A${r - 1} ${r - 1} 0 0 1 ${5 + r} ${y + 5}Z" fill="${p.left.topColor}"/>`);
      if (p.left.text) parts.push(`<text x="18" y="${y + h - 12}" text-anchor="middle" font-size="11" font-weight="700" fill="#1d3f8f" font-family="Arial, sans-serif">${esc(p.left.text)}</text>`);
    }
    if (p.left.flag && smallFlag[p.left.flag]) parts.push(smallFlag[p.left.flag](11, y + 12));
    tx0 = 34;
  }
  if (p.right) {
    band(W - 31, p.right.color, p.right.text, 'r');
    if (p.right.num) parts.push(`<text x="${W - 18}" y="${y + 29}" text-anchor="middle" font-size="17" font-weight="700" fill="${p.right.numColor || '#fff'}" font-family="Arial, sans-serif">${esc(p.right.num)}</text>`);
    if (p.right.divider) parts.push(`<rect x="${W - 32}" y="${y + 6}" width="1.5" height="${h - 12}" fill="#111"/>`);
    tx1 = W - 34;
  }
  if (p.stripes) {
    parts.push(`<rect x="8" y="${y + 7}" width="${W - 16}" height="4" fill="${p.stripes}"/><rect x="8" y="${y + h - 11}" width="${W - 16}" height="4" fill="${p.stripes}"/>`);
  }
  if (p.top) {
    parts.push(`<path d="M${4 + r} ${y + 5}H${W - 4 - r}A${r - 1} ${r - 1} 0 0 1 ${W - 5} ${y + 5 + r - 1}V${y + 15}H5V${y + 5 + r - 1}A${r - 1} ${r - 1} 0 0 1 ${4 + r} ${y + 5}Z" fill="${p.top.color}"/>`);
    if (p.top.text) parts.push(`<text x="${W / 2}" y="${y + 13.5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fff" font-family="Arial, sans-serif" letter-spacing="1">${esc(p.top.text)}</text>`);
  }
  const mid = (tx0 + tx1) / 2;
  let text = p.text;
  if (p.crest) {
    const [a, b] = text.split(' ');
    const cx = mid;
    const cy = y + h / 2;
    if (p.crest === 'hr') {
      let sq = '';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) sq += `<rect x="${cx - 8 + i * 4}" y="${cy - 12 + j * 4}" width="4" height="4" fill="${(i + j) % 2 ? '#fff' : '#d71f26'}"/>`;
      parts.push(`<g>${sq}<rect x="${cx - 8}" y="${cy - 12}" width="16" height="20" fill="none" stroke="#d71f26" stroke-width="1"/></g>`);
    } else if (p.crest === 'ch') {
      parts.push(`<rect x="${tx1 - 30}" y="${cy - 11}" width="18" height="22" rx="3" fill="#d52b1e"/><path d="M${tx1 - 23} ${cy - 7}h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="#fff"/>`);
      parts.push(`<rect x="${tx0 + 2}" y="${cy - 11}" width="18" height="22" rx="3" fill="#d52b1e"/><path d="M${tx0 + 9} ${cy - 7}h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="#fff"/>`);
    }
    if (p.crest === 'hr') {
      parts.push(`<text x="${cx - 14}" y="${y + h / 2 + 10}" text-anchor="end" font-size="24" font-weight="700" fill="${p.fg}" font-family="'Arial Narrow', Arial, sans-serif">${esc(a)}</text>`);
      parts.push(`<text x="${cx + 14}" y="${y + h / 2 + 10}" text-anchor="start" font-size="24" font-weight="700" fill="${p.fg}" font-family="'Arial Narrow', Arial, sans-serif" textLength="${Math.min(tx1 - cx - 18, b.length * 15)}" lengthAdjust="spacingAndGlyphs">${esc(b)}</text>`);
      text = null;
    }
  }
  if (text) {
    parts.push(`<text x="${mid}" y="${y + h / 2 + (p.top ? 13 : p.sub ? 6 : 10)}" text-anchor="middle" font-size="${p.small ? 23 : 28}" font-weight="700" fill="${p.fg}" font-family="'Arial Narrow', 'Roboto Condensed', Arial, sans-serif" textLength="${Math.min(tx1 - tx0 - 10, text.length * 17)}" lengthAdjust="spacingAndGlyphs">${esc(text)}</text>`);
  }
  if (p.rightFlag && smallFlag[p.rightFlag]) parts.push(smallFlag[p.rightFlag](W - 25, y + 35));
  if (p.sub) parts.push(`<text x="${mid}" y="${y + h - 9}" text-anchor="middle" font-size="8" font-weight="700" fill="${p.fg}" font-family="Arial, sans-serif" letter-spacing="1">${esc(p.sub)}</text>`);
  if (p.topFlag && smallFlag[p.topFlag]) parts.push(smallFlag[p.topFlag](W - 26, y + 5));
  if (p.rightText) {
    parts.push(`<text x="${tx1 - 2}" y="${y + h - 12}" text-anchor="end" font-size="11" font-weight="700" fill="${p.fg}" font-family="Arial, sans-serif">${esc(p.rightText)}</text>`);
  }
  return parts.join('');
}

export function plate(p) {
  const two = !!p.rear;
  const label = (t, y) => `<text x="120" y="${y}" text-anchor="middle" font-size="10" fill="currentColor" opacity=".65" font-family="system-ui, sans-serif">${t}</text>`;
  if (!two) return wrap('0 0 240 58', plateSvg(p), 'vis-plate');
  return wrap(
    '0 0 240 146',
    `${label('vorne', 10)}${plateSvg(p, 13)}${label('hinten', 85)}${plateSvg({ ...p, ...p.rear }, 88)}`,
    'vis-plate two',
  );
}

export const smallFlag = {
  ua: (x, y) => `<rect x="${x}" y="${y}" width="14" height="5" fill="#1d5ce0"/><rect x="${x}" y="${y + 5}" width="14" height="5" fill="#ffd21f"/>`,
  ru: (x, y) => `<rect x="${x}" y="${y}" width="14" height="3.4" fill="#fff" stroke="#999" stroke-width=".3"/><rect x="${x}" y="${y + 3.4}" width="14" height="3.3" fill="#1c3fa8"/><rect x="${x}" y="${y + 6.7}" width="14" height="3.3" fill="#d52b1e"/>`,
  br: (x, y) => `<rect x="${x}" y="${y}" width="14" height="10" fill="#009b3a"/><path d="M${x + 7} ${y + 1}L${x + 13} ${y + 5}L${x + 7} ${y + 9}L${x + 1} ${y + 5}Z" fill="#ffdf00"/><circle cx="${x + 7}" cy="${y + 5}" r="2.3" fill="#002776"/>`,
  kz: (x, y) => `<rect x="${x}" y="${y}" width="14" height="10" fill="#00afca"/><circle cx="${x + 7}" cy="${y + 4.6}" r="2.2" fill="#fec50c"/>`,
};

// ── Strommasten ──────────────────────────────────────────────────────
// p = { mat: 'wood'|'concrete'|'metal', shape: 'round'|'square'|'oct'|'ibeam'|'ladder',
//       holes: 'full'|'middle'|'none', arm: 't'|'double'|'none'|'thick', trafo, steps, guard,
//       brace (schräge Stütze), indent (Längsrille), wires }
export function pole(p) {
  const W = 140;
  const H = 210;
  const col = { wood: '#8a5a33', concrete: '#b9b6ad', metal: '#7d8794' }[p.mat] || '#b9b6ad';
  const dark = { wood: '#6b4325', concrete: '#8f8c84', metal: '#5b6470' }[p.mat] || '#8f8c84';
  const top = 30;
  const bot = 200;
  const wT = p.thick ? 13 : 9;
  const wB = p.thick ? 20 : 15;
  const x = (y, s) => 70 + s * (wT / 2 + ((wB - wT) / 2) * ((y - top) / (bot - top)));
  const parts = [];
  if (p.brace) {
    parts.push(`<path d="M${x(70, 1)} 70L104 ${bot}L${96} ${bot}L${x(80, 1) - 2} 80Z" fill="${dark}"/>`);
  }
  parts.push(`<path d="M${x(top, -1)} ${top}L${x(top, 1)} ${top}L${x(bot, 1)} ${bot}L${x(bot, -1)} ${bot}Z" fill="${col}"/>`);
  // Licht/Schatten
  parts.push(`<path d="M${x(top, 0.25)} ${top}L${x(top, 1)} ${top}L${x(bot, 1)} ${bot}L${x(bot, 0.25)} ${bot}Z" fill="rgba(0,0,0,.18)"/>`);
  if (p.mat === 'wood') {
    for (let y = top + 18; y < bot; y += 26) parts.push(`<path d="M${x(y, -0.6)} ${y}q3 6 0 12" stroke="${dark}" stroke-width="1" fill="none" opacity=".6"/>`);
  }
  if (p.shape === 'oct') {
    parts.push(`<path d="M${x(top, -0.35)} ${top}L${x(bot, -0.35)} ${bot}M${x(top, 0.35)} ${top}L${x(bot, 0.35)} ${bot}" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/>`);
  }
  if (p.shape === 'ibeam') {
    parts.push(`<path d="M${x(top, -0.55)} ${top}L${x(bot, -0.55)} ${bot}M${x(top, 0.55)} ${top}L${x(bot, 0.55)} ${bot}" stroke="#5b6470" stroke-width="2.2"/>`);
    parts.push(`<path d="M${x(top, -0.4)} ${top}L${x(top, 0.4)} ${top}L${x(bot, 0.4)} ${bot}L${x(bot, -0.4)} ${bot}Z" fill="#c9c5ba"/>`);
  }
  if (p.indent) {
    parts.push(`<path d="M${x(top, -0.15)} ${top + 6}L${x(top, 0.15)} ${top + 6}L${x(bot - 30, 0.32)} ${bot - 30}L${x(bot - 30, -0.32)} ${bot - 30}Z" fill="rgba(0,0,0,.28)"/>`);
  }
  if (p.holes && p.holes !== 'none') {
    const [y0, y1] = p.holes === 'middle' ? [85, 150] : p.holes === 'bottom' ? [140, 192] : [top + 10, bot - 8];
    for (let y = y0; y < y1; y += 9) {
      const hw = (x(y, 1) - x(y, -1)) * (p.smallHoles ? 0.22 : 0.42);
      parts.push(`<rect x="${70 - hw / 2}" y="${y}" width="${hw}" height="${p.smallHoles ? 3.5 : 5}" rx="1.5" fill="#3d3b37"/>`);
    }
  }
  if (p.shape === 'ladder') {
    for (let y = top + 14; y < bot - 6; y += 12) {
      const hw = (x(y, 1) - x(y, -1)) * 0.55;
      parts.push(`<rect x="${70 - hw / 2}" y="${y}" width="${hw}" height="7" rx="1" fill="rgba(0,0,0,.32)"/>`);
    }
  }
  if (p.steps) {
    for (let y = 60; y < 175; y += 14) {
      const s = Math.round(y / 14) % 2 ? 1 : -1;
      parts.push(`<rect x="${s > 0 ? x(y, 1) : x(y, -1) - 8}" y="${y}" width="8" height="2.2" fill="#555"/>`);
    }
  }
  if (p.stripes) {
    if (p.stripeBase) parts.push(`<path d="M${x(146, -1)} 146L${x(146, 1)} 146L${x(bot, 1)} ${bot}L${x(bot, -1)} ${bot}Z" fill="${p.stripeBase}"/>`);
    for (let y = 150; y < 196; y += 8) parts.push(`<path d="M${x(y, -1)} ${y + 6}L${x(y, 1)} ${y}V${y + 4}L${x(y, -1)} ${y + 10}Z" fill="${p.stripes}"/>`);
  }
  // Querträger + Isolatoren
  const ins = (cx, cy) => `<rect x="${cx - 2.5}" y="${cy - 9}" width="5" height="9" rx="1.5" fill="${p.insulator || '#e9eef2'}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>`;
  const arm = (y, half, thick = 5) => {
    parts.push(`<rect x="${70 - half}" y="${y}" width="${half * 2}" height="${thick}" rx="1" fill="${p.armColor || (p.mat === 'wood' ? dark : '#6c737c')}"/>`);
    parts.push(ins(70 - half + 6, y), ins(70 - half / 2.6, y), ins(70 + half / 2.6, y), ins(70 + half - 6, y));
  };
  if (p.arm === 't' || p.arm === 'double') arm(44, 46);
  if (p.arm === 'double') arm(64, 40);
  if (p.arm === 'thick') arm(46, 52, 9);
  if (p.arm === 'bars') for (let i = 0; i < (p.bars || 3); i++) arm(40 + i * 16, 44 - i * 4, 4);
  if (p.plate) parts.push(`<rect x="${70 - 6}" y="118" width="12" height="8" rx="1" fill="${p.plate}" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>`);
  if (p.arm === 'pins') {
    parts.push(ins(70, top), ins(x(48, 1) + 6, 52), ins(x(64, -1) - 6, 68));
    parts.push(`<rect x="${x(48, 1)}" y="51" width="8" height="2.5" fill="#666"/><rect x="${x(64, -1) - 8}" y="67" width="8" height="2.5" fill="#666"/>`);
  }
  if (p.trafo) {
    parts.push(`<rect x="${x(98, 1) + 1}" y="86" width="20" height="30" rx="4" fill="#9aa3ab" stroke="rgba(0,0,0,.3)"/><rect x="${x(98, 1) + 1}" y="90" width="20" height="2" fill="rgba(0,0,0,.2)"/>`);
  }
  if (p.guard) {
    parts.push(`<path d="M${x(70, 1)} 70L132 ${bot}" stroke="#444" stroke-width="1"/>`);
    for (let i = 0; i < 6; i++) {
      const t = 0.68 + i * 0.05;
      const gx = x(70, 1) + (132 - x(70, 1)) * t;
      const gy = 70 + (bot - 70) * t;
      parts.push(`<path d="M${gx - 2} ${gy - 4}L${gx + 3} ${gy - 1}L${gx + 3} ${gy + 4}L${gx - 2} ${gy + 1}Z" fill="${i % 2 ? '#111' : '#ffd21f'}"/>`);
    }
  }
  const wires = p.wires || 2;
  let wireSvg = '';
  for (let i = 0; i < wires; i++) {
    const wy = 40 + i * (wires > 3 ? 7 : 4);
    wireSvg += `<path d="M0 ${wy + 8}Q35 ${wy + 16} 70 ${wy}T140 ${wy + 8}" stroke="#333" stroke-width=".9" fill="none" opacity=".75"/>`;
  }
  return wrap(
    `0 0 ${W} ${H}`,
    `${scene(W, H, 150)}<ellipse cx="70" cy="${bot}" rx="22" ry="4" fill="rgba(0,0,0,.2)"/>${parts.join('')}${wireSvg}`,
    'vis-tall',
  );
}

// ── Verkehrsschilder ─────────────────────────────────────────────────
const post = (x, y1, y2) => `<rect x="${x - 3}" y="${y1}" width="6" height="${y2 - y1}" fill="#9aa0a6"/>`;

export function sign(p) {
  const W = 180;
  const H = 180;
  let body = '';
  const t = p.text;
  switch (p.kind) {
    case 'stop': {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = Math.PI / 8 + (i * Math.PI) / 4;
        pts.push(`${90 + Math.cos(a) * 56},${78 + Math.sin(a) * 56}`);
      }
      const inner = pts.map((s) => s.split(',').map(Number)).map(([x, y]) => `${90 + (x - 90) * 0.9},${78 + (y - 78) * 0.9}`);
      body = `${post(90, 120, 180)}<polygon points="${pts.join(' ')}" fill="#fff"/><polygon points="${inner.join(' ')}" fill="#d52b1e"/>`;
      if (p.hand) {
        body += `<path d="M78 104V76a4 4 0 0 1 8 0V68a4 4 0 0 1 8 0V70a4 4 0 0 1 8 0v8a4 4 0 0 1 8 0v18c0 10-8 14-16 14h-4c-6 0-9-3-12-6z" fill="#fff"/>`;
      } else {
        body += `<text x="90" y="${78 + (p.size || 30) / 2.8}" text-anchor="middle" font-size="${p.size || 30}" font-weight="800" fill="#fff" font-family="Arial, Helvetica, sans-serif" ${t.length > 4 ? `textLength="${Math.min(88, t.length * 20)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(t)}</text>`;
      }
      break;
    }
    case 'yield-jp':
      body = `${post(90, 110, 180)}<path d="M28 30H152L90 132Z" fill="#fff"/><path d="M38 36H142L90 122Z" fill="#d52b1e"/><text x="90" y="66" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic',sans-serif">止まれ</text>`;
      break;
    case 'triangle': {
      body = `${post(90, 120, 180)}<path d="M90 18L160 132H20Z" fill="#d52b1e" stroke="#d52b1e" stroke-width="6" stroke-linejoin="round"/><path d="M90 40L141 122H39Z" fill="${p.fill || '#fff'}"/>`;
      body += `<g transform="translate(90 98)" fill="#111"><circle cx="0" cy="-22" r="4.5"/><path d="M-3 -16h6l5 14-3 1-4-9-1 10 6 14-4 2-6-13-5 13-4-2 5-14 1-10-4 9-3-1z"/></g>`;
      break;
    }
    case 'diamond':
      body = `${post(90, 120, 180)}<rect x="46" y="28" width="88" height="88" rx="8" transform="rotate(45 90 72)" fill="#111"/><rect x="51" y="33" width="78" height="78" rx="6" transform="rotate(45 90 72)" fill="#ffd21f"/>`;
      body += `<path d="M62 88 L90 60 L118 88" stroke="#111" stroke-width="9" fill="none" stroke-linejoin="round"/>`;
      break;
    case 'chevron': {
      body = `${post(50, 112, 180)}${post(130, 112, 180)}<rect x="16" y="46" width="148" height="68" rx="5" fill="${p.bg}" stroke="${p.border || 'rgba(0,0,0,.4)'}" stroke-width="2"/>`;
      for (let i = 0; i < 3; i++) body += `<path d="M${42 + i * 38} 56l24 24-24 24h-12l24-24-24-24z" fill="${p.fg}"/>`;
      break;
    }
    case 'place': {
      body = `${post(50, 120, 180)}${post(130, 120, 180)}<rect x="12" y="44" width="156" height="80" rx="6" fill="${p.bg}" stroke="${p.border}" stroke-width="5"/>`;
      body += `<text x="90" y="${p.sub ? 82 : 93}" text-anchor="middle" font-size="27" font-weight="700" fill="${p.fg}" font-family="${p.font || "'DIN Alternate','DIN Condensed','Arial Narrow',Arial,sans-serif"}" textLength="${Math.min(136, t.length * 17)}" lengthAdjust="spacingAndGlyphs">${esc(t)}</text>`;
      if (p.sub) body += `<text x="90" y="108" text-anchor="middle" font-size="13" fill="${p.fg}" font-family="Arial, sans-serif">${esc(p.sub)}</text>`;
      break;
    }
    case 'interstate':
      body = `${post(90, 120, 180)}<path d="M40 40Q90 22 140 40Q146 100 90 140Q34 100 40 40Z" fill="#fff"/><path d="M45 44Q90 28 135 44L134 62H46Z" fill="#c8102e"/><path d="M46 62H134Q130 100 90 134Q50 100 46 62Z" fill="#0b3d91"/><text x="90" y="56" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Arial">INTERSTATE</text><text x="90" y="108" text-anchor="middle" font-size="40" font-weight="700" fill="#fff" font-family="Arial">${esc(t || '80')}</text>`;
      break;
    case 'crossing': {
      // Fußgängerüberweg-Schild: p.bg (Grund), p.tri (Dreieck), p.stripes (Anzahl Zebrastreifen), p.line (nur eine Linie), p.tall
      const x0 = p.tall ? 52 : 35;
      const w = p.tall ? 76 : 110;
      const y0 = p.tall ? 12 : 25;
      const h = p.tall ? 126 : 110;
      body = `${post(90, y0 + h - 10, 180)}<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="8" fill="${p.bg || '#1d5ce0'}"/><path d="M90 ${y0 + 12}L${x0 + w - 8} ${y0 + h - 12}H${x0 + 8}Z" fill="${p.tri || '#fff'}"/>`;
      const gy = y0 + h - 26;
      if (p.line) body += `<rect x="${x0 + 22}" y="${gy + 6}" width="${w - 44}" height="3" fill="#111"/>`;
      else {
        const n = p.stripes || 5;
        const span = w - 40;
        const sw = span / (2 * n - 1);
        for (let i = 0; i < n; i++) body += `<rect x="${x0 + 20 + i * 2 * sw}" y="${gy + 2}" width="${sw}" height="8" fill="#111"/>`;
      }
      body += `<g transform="translate(90 ${gy - 6}) scale(.9)" fill="#111"><circle cx="0" cy="-30" r="5"/><path d="M-3 -23h6l5 15-3 1-4-9-1 10 6 14-4 2-6-13-5 13-4-2 5-14 1-10-4 9-3-1z"/></g>`;
      break;
    }
    default:
      body = '';
  }
  return wrap(`0 0 ${W} ${H}`, `${scene(W, H, 150)}${body}`, 'vis-square');
}

// ── Google-Auto (Seitenansicht) ──────────────────────────────────────
export function car(p) {
  const parts = [];
  parts.push(`<rect x="0" y="0" width="240" height="120" fill="#cfe8ff"/><rect y="98" width="240" height="22" fill="#b98a5a"/>`);
  parts.push(`<path d="M30 92V70Q32 60 46 58L78 54L98 36H162L186 56Q206 58 210 70V92Z" fill="${p.color || '#f4f4f4'}" stroke="#555" stroke-width="1.5"/>`);
  parts.push(`<path d="M104 40H134V56H88Z" fill="#9fd3ff"/><path d="M138 40H158L176 56H138Z" fill="#9fd3ff"/>`);
  parts.push(`<circle cx="70" cy="94" r="13" fill="#222"/><circle cx="70" cy="94" r="5" fill="#999"/><circle cx="172" cy="94" r="13" fill="#222"/><circle cx="172" cy="94" r="5" fill="#999"/>`);
  parts.push(`<rect x="126" y="12" width="6" height="24" fill="#444"/><circle cx="129" cy="10" r="7" fill="#333"/><circle cx="129" cy="10" r="3" fill="#6cf"/>`);
  if (p.snorkel) parts.push(`<path d="M80 74V44Q80 38 86 38H92" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  if (p.rack) parts.push(`<rect x="100" y="31" width="60" height="4" fill="#333"/>`);
  return wrap('0 0 240 120', parts.join(''), 'vis-wide');
}

// ── Text / Schrift ───────────────────────────────────────────────────
export function textSample(p) {
  const lines = String(p.text).split(' · ').map((l) => `<span>${esc(l)}</span>`).join('');
  return `<div class="vis vis-text ${p.style || ''}" lang="${esc(p.lang || '')}" dir="${p.rtl ? 'rtl' : 'auto'}">${lines}${p.sub ? `<small>${esc(p.sub)}</small>` : ''}</div>`;
}

export function renderVisual(v) {
  if (!v) return '';
  switch (v.type) {
    case 'bollard':
      return bollard(v);
    case 'road':
      return road(v);
    case 'plate':
      return plate(v);
    case 'pole':
      return pole(v);
    case 'sign':
      return sign(v);
    case 'car':
      return car(v);
    case 'text':
      return textSample(v);
    default:
      return '';
  }
}

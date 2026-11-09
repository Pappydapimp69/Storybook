// There's Someone in the Box — film mode ("Watch it").
// One picture per beat, few words, text held 1.0 s + words / R (R = text speed), 1.2 s gaps,
// three designed silences, music on the sound engine (one bus per layer, switched by intensity only).

const $ = (id) => document.getElementById(id);
const art = $('art'), words = $('words');
const W = 400, H = 260;

/* ============================ drawing kit ============================ */
const svg = (inner, label) => `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${bg()}${inner}</svg>`;
const bg = () => `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient></defs><rect width="400" height="260" fill="url(#sky)"/><circle cx="350" cy="46" r="22" class="k-glow" opacity=".9"/><path d="M0 214 Q100 200 200 212 T400 208 V260 H0z" fill="var(--ground)"/><path d="M0 238 Q120 228 240 238 T400 236 V260 H0z" fill="var(--ground2)"/>`;
function hatch(x, y, w, h, gap = 7) { return '';
  let d = ''; for (let i = -h; i < w; i += gap) d += `M${x + i} ${y + h} l${h} ${-h} `;
  return `<clipPath id="c${x}${y}${w}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><path d="${d}" class="s-soft" stroke-width="1" clip-path="url(#c${x}${y}${w})" opacity=".55"/>`;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function wrapText(s, n) { const out = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; } if (cur.trim()) out.push(cur.trim()); return out; }
function textBox(x, y, w, lines, o = {}) {
  const lh = o.lh ?? 11, fs = o.fs ?? 9.5, h = lines.length * lh + 12;
  const fill = o.solid === false ? 'class="k-page" stroke-dasharray="4 3"' : `class="${o.dark ? 'k-ink' : 'k-glass'}"`;
  return `<g ${o.attr || ''}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" ${fill} stroke="var(--ink)" stroke-width="1.6"/>` +
    lines.map((l, i) => `<text x="${x + 8}" y="${y + 15 + i * lh}" font-size="${fs}" class="t" ${o.dark ? 'style="fill:var(--page)"' : ''}>${esc(l)}</text>`).join('') + '</g>';
}

// Mags the magpie: brows and mouth (beak angle) carry the feeling.
function mags(x, y, s = 1, mood = 'flat') {
  const brow = { flat: 'M-9 -14 h8 M3 -14 h8', up: 'M-9 -13 l8 -3 M3 -16 l8 3', squint: 'M-10 -12 l9 2 M3 -10 l9 -2', wink: 'M-9 -14 h8 M3 -14 h8' }[mood];
  const eyes = mood === 'wink' ? `<circle cx="-5" cy="-8" r="2.6" class="k-ink"/><path d="M4 -8 h7" class="s-ink" stroke-width="2"/>`
    : mood === 'squint' ? `<path d="M-8 -8 h6 M4 -8 h6" class="s-ink" stroke-width="2.4"/>` : `<circle cx="-5" cy="-8" r="2.6" class="k-ink"/><circle cx="7" cy="-8" r="2.6" class="k-ink"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="bob">
    <path d="M18 6 l26 10 l-24 -2z" class="k-ink"/>
    <ellipse cx="0" cy="6" rx="20" ry="16" class="k-ink"/><ellipse cx="-4" cy="10" rx="11" ry="9" class="k-page"/>
    <path d="M-2 0 q14 -4 20 8 q-12 4 -20 -8z" fill="#2E5A8C" opacity=".85"/>
    <circle cx="1" cy="-10" r="13" class="k-ink"/>${eyes}<path d="${brow}" class="s-ink" stroke-width="2.4" style="stroke:var(--page)"/>
    <path d="M12 -9 l12 3 l-12 3z" class="k-ink"/>
    <path d="M-8 22 v8 M4 22 v8" class="s-ink" stroke-width="2"/></g></g>`;
}
// The box: a cabinet with a shop-window mannequin standee on top (blank avatar card, painted smile, name tag).
function box(x, y, o = {}) {
  const open = o.open ?? 0;   // 0..1
  const smilePeel = o.peel ?? 0;
  const smile = smilePeel >= 5 ? '' : `<path d="M-10 -52 q10 ${8 - smilePeel} 20 0" class="s-acc" stroke-width="3"/>`;
  const doorW = 54 * (1 - open);
  return `<g transform="translate(${x} ${y})">
    <rect x="-16" y="-92" width="32" height="40" rx="6" class="k-glass" stroke="var(--ink)" stroke-width="2"/>
    <circle cx="0" cy="-74" r="11" class="k-page" stroke="var(--ink)" stroke-width="2"/>${smile}
    <rect x="-26" y="-48" width="52" height="12" rx="3" class="k-page" stroke="var(--ink)" stroke-width="1.5"/><text x="0" y="-39" text-anchor="middle" font-size="7.5" class="t">Hi, I'm Charlie</text>
    <rect x="-60" y="-34" width="120" height="96" rx="4" class="k-hatch" stroke="var(--ink)" stroke-width="2.4"/>
    ${o.inside || ''}
    <rect x="-58" y="-32" width="${doorW}" height="92" class="k-page" stroke="var(--ink)" stroke-width="2"/>
    <rect x="${58 - doorW}" y="-32" width="${doorW}" height="92" class="k-page" stroke="var(--ink)" stroke-width="2"/>
    ${open < 1 ? `<circle cx="${-58 + doorW - 7}" cy="14" r="3" class="k-ink"/><circle cx="${58 - doorW + 7}" cy="14" r="3" class="k-ink"/>` : ''}
    ${o.tape ? `<path d="M-64 -10 L64 30 M-64 30 L64 -10" stroke="#D9C27A" stroke-width="10" opacity=".9"/>` : ''}
  </g>`;
}
// The worker: featureless, face always hidden by phone glare. Nothing the reader does changes them.
function worker(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-34" y="10" width="68" height="8" class="k-ink"/><rect x="-28" y="18" width="5" height="26" class="k-ink"/><rect x="23" y="18" width="5" height="26" class="k-ink"/>
    <path d="M-16 10 q0 -30 16 -30 q16 0 16 30z" class="k-soft"/><circle cx="0" cy="-30" r="11" class="k-soft"/>
    <rect x="-8" y="-4" width="16" height="10" rx="2" class="k-ink"/><ellipse class="flick" cx="0" cy="-30" rx="12" ry="9" class="k-glow" opacity=".9"/>
    <rect x="-30" y="0" width="10" height="9" rx="1.5" class="k-ink"/><rect x="20" y="0" width="10" height="9" rx="1.5" class="k-ink"/>
    <rect x="26" y="-14" width="14" height="16" class="k-page" stroke="var(--ink)" stroke-width="1"/><text x="33" y="-3" font-size="5" text-anchor="middle" class="t">SCRIPT</text></g>`;
}
const boss = (x, y, s = 1, hand = false) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".92"><circle cx="0" cy="-70" r="20" class="k-ink"/><path d="M-34 60 q-6 -100 34 -110 q40 10 34 110z" class="k-ink"/>${hand ? '<path d="M24 -10 q20 4 22 22" stroke="var(--ink)" stroke-width="9" fill="none" stroke-linecap="round"/>' : ''}<path d="M34 60 q6 -60 -10 -100" class="s-acc" stroke-width="2" opacity=".8"/></g>`;
const quota = (x, y, missed) => `<g transform="translate(${x} ${y})"><rect width="76" height="54" class="k-page" stroke="var(--ink)" stroke-width="2"/><text x="6" y="12" font-size="7" class="t" font-weight="800">${missed ? 'MISSED' : 'NEW CHATS TODAY'}</text><path d="M8 20 v12 M13 20 v12 M18 20 v12 M23 20 v12 M6 30 l20 -8 M32 20 v12" class="s-ink" stroke-width="1.6"/><text x="6" y="46" font-size="7" class="t" font-weight="800">DEPOSITS</text><text x="56" y="47" font-size="13" class="k-acc" font-weight="800">0</text></g>`;
const door = (x, y) => `<g transform="translate(${x} ${y})"><rect width="48" height="96" class="k-hatch" stroke="var(--ink)" stroke-width="2"/><rect x="30" y="44" width="12" height="14" rx="2" class="k-ink"/><path d="M33 44 v-5 a3 3 0 0 1 6 0 v5" class="s-ink" stroke-width="2"/></g>`;
function phone(x, y, o = {}) {
  return `<g transform="translate(${x} ${y})"><g class="${o.buzz ? 'buzz' : ''}"><rect x="-26" y="-48" width="52" height="96" rx="9" class="k-ink"/><rect x="-21" y="-40" width="42" height="78" rx="3" class="k-page"/>${o.screen || ''}</g>
    ${o.buzz ? '<path d="M-36 -20 q-6 10 0 20 M36 -20 q6 10 0 20 M-42 -26 q-9 16 0 32 M42 -26 q9 16 0 32" class="s-ink" stroke-width="2"/>' : ''}</g>`;
}
function reader(x, y, s = 1, mood = 'flat') {
  const face = { flat: 'M-5 4 h10', glad: 'M-6 2 q6 6 12 0', worry: 'M-5 5 h10', scared: 'M-4 3 a4 5 0 1 0 8 0 a4 5 0 1 0 -8 0' }[mood];
  const brows = mood === 'worry' || mood === 'scared' ? 'M-9 -9 l6 -3 M9 -9 l-6 -3' : 'M-9 -10 h6 M3 -10 h6';
  const eye = mood === 'scared' ? 3.4 : 2.2;
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="16" class="k-page" stroke="var(--ink)" stroke-width="2"/><circle cx="-5" cy="-4" r="${eye}" class="k-ink"/><circle cx="5" cy="-4" r="${eye}" class="k-ink"/><path d="${brows}" class="s-ink" stroke-width="2"/><path d="${face}" class="s-ink" stroke-width="2"/>
    <path d="M-14 16 q14 -6 28 0 v34 h-28z" class="k-hatch" stroke="var(--ink)" stroke-width="2"/></g>`;
}
const coin = (x, y, r = 9, cls = '') => `<g class="${cls}"><circle cx="${x}" cy="${y}" r="${r}" class="k-brass" stroke="var(--ink)" stroke-width="1.6"/><text x="${x}" y="${y + 3}" font-size="${r * 0.6}" text-anchor="middle" class="t" font-weight="800">PLAY</text></g>`;
function machine(x, y, o = {}) {
  const bar = o.bar ?? 95, bal = o.balance ?? '';
  return `<g transform="translate(${x} ${y})"><rect x="-80" y="-110" width="160" height="150" rx="14" class="k-brass" stroke="var(--ink)" stroke-width="3"/>
    <rect x="-64" y="-96" width="128" height="34" rx="5" class="k-ink"/><text x="0" y="-73" text-anchor="middle" font-size="17" class="k-glow" font-weight="800" style="font-family:var(--sans)">${esc(bal)}</text>
    <text x="-64" y="-48" font-size="8" class="t" font-weight="800">ALMOST THERE</text><rect x="-64" y="-44" width="128" height="10" class="k-page" stroke="var(--ink)" stroke-width="1.5"/><rect x="-64" y="-44" width="${1.28 * bar}" height="10" class="k-acc"/>
    <rect x="-20" y="-24" width="40" height="7" rx="3" class="k-ink"/><text x="0" y="-29" text-anchor="middle" font-size="7" class="t" font-weight="800">COIN SLOT</text>
    <circle cx="0" cy="12" r="16" class="k-acc pulse" stroke="var(--ink)" stroke-width="2"/><text x="0" y="15" text-anchor="middle" font-size="9" class="t" font-weight="800" style="fill:var(--page)">GO</text>
    ${o.sign ? textBox(-90, -168, 180, wrapText(o.sign, 34), { dark: true, fs: 8.5 }) : ''}${o.belly ? Array.from({ length: o.belly }, (_, i) => coin(-48 + (i % 7) * 16, 30 - Math.floor(i / 7) * 8, 6)).join('') : ''}</g>`;
}
const OBJECTS = [['rent', (x, y) => `<rect x="${x - 14}" y="${y - 10}" width="28" height="20" class="k-page" stroke="var(--ink)" stroke-width="1.6"/><path d="M${x - 14} ${y - 10} l14 10 l14 -10" class="s-ink" stroke-width="1.4"/><text x="${x}" y="${y + 20}" font-size="7" text-anchor="middle" class="t" font-weight="800">RENT</text>`],
  ['bike', (x, y) => `<circle cx="${x - 14}" cy="${y + 6}" r="10" class="s-ink" stroke-width="2"/><circle cx="${x + 14}" cy="${y + 6}" r="10" class="s-ink" stroke-width="2"/><path d="M${x - 14} ${y + 6} l10 -16 h14 l4 16 M${x - 4} ${y - 10} l-4 -6" class="s-ink" stroke-width="2"/>`],
  ['tv', (x, y) => `<rect x="${x - 18}" y="${y - 14}" width="36" height="26" rx="3" class="k-ink"/><rect x="${x - 14}" y="${y - 10}" width="28" height="18" class="k-glass"/>`],
  ['card', (x, y) => `<rect x="${x - 10}" y="${y - 14}" width="20" height="26" class="k-page" stroke="var(--ink)" stroke-width="1.6"/><path d="M${x - 5} ${y - 4} q5 -6 10 0 q-5 6 -10 0" class="k-acc"/>`],
  ['piggy', (x, y) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="11" class="k-hatch" stroke="var(--ink)" stroke-width="1.6"/><rect x="${x - 4}" y="${y - 12}" width="8" height="2" class="k-ink"/>`]];
function room(lost = 0, o = {}) {
  const pos = [[70, 186], [150, 190], [235, 180], [305, 188], [360, 192]];
  return `<rect x="20" y="40" width="360" height="174" class="k-page" stroke="var(--ink)" stroke-width="2"/>${hatch(20, 40, 360, 30, 10)}
    <rect x="40" y="150" width="120" height="8" class="k-ink"/><rect x="48" y="158" width="6" height="56" class="k-ink"/><rect x="146" y="158" width="6" height="56" class="k-ink"/>` +
    OBJECTS.map(([name, draw], i) => i < lost ? `<g opacity=".7"><ellipse cx="${pos[i][0]}" cy="${pos[i][1]}" rx="20" ry="12" fill="none" stroke="var(--soft)" stroke-dasharray="3 3"/><text x="${pos[i][0]}" y="${pos[i][1] + 4}" font-size="7" text-anchor="middle" class="t">coin ${i + 1}</text></g>` : draw(pos[i][0], pos[i][1] - (name === 'rent' ? 50 : 0))).join('') +
    (o.letter ? `<g>${textBox(240, 60, 130, ['WE GET YOUR MONEY BACK!', '(small fee)'], {})}<path d="M268 84 q10 6 20 0" class="s-acc" stroke-width="2.4"/></g>` : '');
}
const panel = (x, y, w, h, inner) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" class="k-page" stroke="var(--ink)" stroke-width="2"/>${inner}</g>`;
const stamp = (x, y, ok) => ok ? `<g transform="translate(${x} ${y}) rotate(-8)"><circle r="18" fill="none" stroke="var(--ok)" stroke-width="4"/><path d="M-8 0 l6 6 l11 -12" stroke="var(--ok)" stroke-width="4" fill="none"/></g>`
  : `<g transform="translate(${x} ${y}) rotate(-8)"><rect x="-40" y="-14" width="80" height="28" rx="4" fill="none" stroke="var(--accent)" stroke-width="3.5"/><path d="M-30 -7 l12 14 M-18 -7 l-12 14" stroke="var(--accent)" stroke-width="3.5"/><text x="8" y="6" font-size="15" text-anchor="middle" class="k-acc" font-weight="800" style="font-family:var(--sans)">WRONG</text></g>`;

/* ============================== consequences ============================== */
const mask = (x, y) => `<g transform="translate(${x} ${y}) rotate(18)"><rect x="-16" y="-14" width="32" height="28" rx="5" fill="#B9C2CC" stroke="var(--ink)" stroke-width="2"/><rect x="-10" y="-6" width="7" height="5" class="k-ink"/><rect x="3" y="-6" width="7" height="5" class="k-ink"/><path d="M-7 7 h14" class="s-ink" stroke-width="2"/><path d="M0 -14 v-8" class="s-ink" stroke-width="2"/><circle cx="0" cy="-24" r="3" class="k-acc"/><text x="0" y="30" font-size="8" text-anchor="middle" class="t" font-weight="800">CARDBOARD ROBOT</text></g>`;
const peeledTag = (x, y) => `<g transform="translate(${x} ${y}) rotate(-14)"><rect x="-40" y="-9" width="80" height="18" rx="3" class="k-page" stroke="var(--ink)" stroke-width="1.6"/><text x="0" y="4" font-size="8" text-anchor="middle" class="t" font-weight="800">MASIS STAFFING</text><path d="M-44 -12 L44 12" class="s-acc" stroke-width="3"/><text x="0" y="26" font-size="8" text-anchor="middle" class="k-acc" font-weight="800" style="font-family:var(--sans)">BORROWED NAME</text></g>`;
const lens = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="14" class="k-glass" stroke="var(--ink)" stroke-width="4" opacity=".9"/><path d="M10 10 l14 14" class="s-ink" stroke-width="6"/></g>`;
const envelope = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-18" y="-12" width="36" height="24" class="k-page" stroke="var(--ink)" stroke-width="2"/><path d="M-18 -12 l18 13 l18 -13" class="s-ink" stroke-width="2"/><text x="0" y="24" font-size="7" text-anchor="middle" class="k-ok" font-weight="800" style="font-family:var(--sans)">REPORTED</text></g>`;
const pouch = (x, y, n) => `<g transform="translate(${x} ${y})"><path d="M-20 -14 q20 -10 40 0 l-4 22 h-32z" class="k-hatch" stroke="var(--ink)" stroke-width="2"/><text x="0" y="2" text-anchor="middle" font-size="9" class="t" font-weight="800">${n} coins</text></g>`;

/* ============================== scenes ============================== */
const OPENER = "Hi, I'm Charlie. Olivia from MASIS STAFFING reached out to you earlier and mentioned to me that you're interested in remote work, so I'm following up. Are you still interested in this opportunity?";
const S = {
  poster: () => svg(`${box(200, 150, { open: 0.35, inside: worker(0, 30, 0.9) })}${mags(330, 182, 1.1, 'squint')}`, 'A cabinet with a painted smile, its doors ajar, a lamp flickering inside'),
  cold: (o) => svg(`${machine(200, 190, { bar: 95, balance: '$ 1,284.00' })}${coin(200, o.drop ? 168 : 60, 11, o.drop ? 'fall' : 'bob')}`, 'A brass money machine with a play coin hovering over the slot'),
  black: () => `<svg viewBox="0 0 400 260" role="img" aria-label="Dark"><rect width="400" height="260" class="k-ink"/><text x="200" y="138" text-anchor="middle" font-size="24" class="tser" style="fill:var(--page)">There's Someone in the Box</text></svg>`,
  phone: (o) => svg(`<rect x="90" y="150" width="160" height="64" class="k-hatch" stroke="var(--ink)" stroke-width="2"/>${o.ghost ? `<g opacity=".18">${box(330, 150)}</g>` : ''}
    ${phone(170, 100, { buzz: o.buzz, screen: textBox(-19, -36, 38, wrapText(OPENER, 9).slice(0, 7), { fs: 5.4, lh: 7 }) })}${o.big ? textBox(212, 30, 176, wrapText(OPENER, 34), { fs: 9, lh: 11 }) : ''}${mags(60, 186, 1, o.mood || 'squint')}`, 'A phone buzzing on a nightstand with a text from Charlie'),
  stack: (o) => svg(`${phone(110, 120, { screen: textBox(-17, 20, 34, ['Yes'], { dark: true, fs: 8 }) })}
    ${['Company Name: Merchkit', 'Our work is straightforward The company provides us with Workhub, a semi-automated system.', 'Do you have any questions about the job description above?'].slice(0, o.n).map((t, i) => `<g class="fall">${textBox(170 + i * 8, 40 + i * 46, 200, wrapText(t, 38), { fs: 9 })}</g>`).join('')}
    ${o.clock ? `<g transform="translate(366 216)"><circle r="20" class="k-page" stroke="var(--ink)" stroke-width="2"/><path d="M0 0 v-13 M0 0 l8 4" class="s-ink" stroke-width="2"/><text x="0" y="34" font-size="9" text-anchor="middle" class="t" font-weight="800">${o.clock}</text></g>` : ''}${mags(40, 190, 0.9, o.mood || 'flat')}`, 'Three polished message cards stacking onto the phone'),
  seam: (o) => {
    const shiny = ['The monthly base pay is $2800…', '…so there\'s no need to worry', 'Company Name: Merchkit'];
    const scrappy = ['sure, its easy and flexible, can i now share…', 'we havent even started , which work are you referring to?', 'send me a screenshot i see'];
    const jar = (x, label, items, done) => `<g transform="translate(${x} 0)"><path d="M-70 96 h140 v110 q0 10 -10 10 h-120 q-10 0 -10 -10z" class="k-glass" stroke="var(--ink)" stroke-width="2.4"/><rect x="-76" y="86" width="152" height="12" rx="4" class="k-hatch" stroke="var(--ink)" stroke-width="2"/><text x="0" y="234" font-size="11" text-anchor="middle" class="t" font-weight="800">${label}</text>
      ${done ? items.map((t, i) => textBox(-64, 104 + i * 34, 128, wrapText(t, 26).slice(0, 2), { fs: 7.5, lh: 9 })).join('') : ''}</g>`;
    return svg(`${jar(110, 'SHINY', shiny, o.sorted)}${jar(290, 'SCRAPPY', scrappy, o.sorted)}${o.sorted ? '' : [...shiny, ...scrappy].map((t, i) => textBox(20 + (i % 3) * 124, 14 + Math.floor(i / 3) * 34, 116, wrapText(t, 24).slice(0, 2), { fs: 7.5, lh: 9 })).join('')}${o.wrong ? stamp(290, 60, false) : ''}`, 'Two jars, SHINY and SCRAPPY, for sorting the real messages');
  },
  box: (o) => svg(`${box(200, 140, { open: o.open, inside: `<rect x="-58" y="-32" width="116" height="92" class="k-page"/>${worker(0, 34, 0.85)}${o.shadow ? `<g opacity=".5">${boss(70, 40, 0.5)}</g>` : ''}` })}${mags(340, 186, 1, o.mood || 'flat')}${o.stamp ? stamp(90, 52, false) : ''}`, o.open ? 'The doors open: a person at a desk, face lit by a phone, a binder labelled SCRIPT' : 'The closed cabinet with its painted smile'),
  boss: () => svg(`${quota(26, 30)}${door(318, 118)}${worker(190, 176, 1)}${boss(250, 150, 1, true)}${textBox(18, 112, 120, ['You can\'t see their face.', 'You only see their words.'], { fs: 8.5 })}`, 'The worker at a desk with a huge shadow behind the chair, a quota board and a locked door'),
  belt: (o) => {
    const st = ['Borrowed name', 'Small yes first', 'One of us', 'Everybody does it', 'Answer the worry first', 'The code that counts you'];
    return svg(`<rect x="10" y="176" width="380" height="16" rx="8" class="k-ink"/>${Array.from({ length: 18 }, (_, i) => `<circle cx="${20 + i * 21}" cy="184" r="4" class="k-page"/>`).join('')}
      ${st.map((t, i) => `<g transform="translate(${36 + i * 66} 120)"><rect x="-4" y="0" width="8" height="56" class="k-ink"/><rect x="-30" y="-24" width="60" height="26" rx="4" class="${i < o.n ? 'k-glow' : 'k-page'}" stroke="var(--ink)" stroke-width="1.6"/>${wrapText(t, 11).map((l, j) => `<text x="0" y="${-14 + j * 9}" font-size="7" text-anchor="middle" class="t" font-weight="800">${l}</text>`).join('')}</g>`).join('')}
      ${reader(36 + Math.min(o.n, 5) * 66, 144, 0.7, 'worry')}${Array.from({ length: Math.min(o.n, 6) }, (_, i) => `<rect x="${330 - i * 4}" y="${168 - i * 9}" width="${18 + i * 8}" height="9" class="k-hatch" stroke="var(--ink)" stroke-width="1"/>`).join('')}
      ${o.quote ? textBox(60, 18, 280, wrapText(o.quote, 52), { fs: 9.5 }) : ''}`, 'A conveyor belt with six trick stations carrying a small reader-figure along');
  },
  machine: (o) => svg(`${machine(150, 182, o)}${mags(330, 182, 1, o.mood || 'squint')}${o.foil ? `<path d="M300 140 l8 -6 l6 8 l-8 6z" fill="#C9CCD1" stroke="var(--ink)"/><path d="M318 160 l-10 -18" class="s-ink" stroke-width="1.6"/>` : ''}
    ${o.pouch !== undefined ? `<g transform="translate(300 230)"><path d="M-22 -16 q22 -10 44 0 l-4 22 h-36z" class="k-hatch" stroke="var(--ink)" stroke-width="2"/><text x="0" y="0" text-anchor="middle" font-size="9" class="t" font-weight="800">${o.pouch} left</text></g>` : ''}`, 'The money machine with an ALMOST THERE bar stuck near full'),
  room: (o) => svg(room(o.lost, o), o.lost ? 'The room with empty dust outlines where things used to be' : 'A room: rent envelope, bike, TV, birthday card, piggy bank'),
  silence: () => svg(`<rect x="0" y="0" width="400" height="260" class="k-ink" opacity=".86"/>`, 'Dark'),
  shift: (o) => svg(`${quota(20, 26, o.missed)}${door(330, 118)}<g transform="translate(200 176)"><rect x="-90" y="0" width="180" height="10" class="k-ink"/>${[-70, -36, 0, 36, 70].map((dx, i) => `<rect x="${dx - 10}" y="-18" width="20" height="16" rx="2" class="k-ink"/>${i < (o.pings ?? 5) ? `<circle cx="${dx + 8}" cy="-20" r="4" class="k-acc pulse"/>` : ''}`).join('')}</g>
    ${reader(200, 120, 1, 'worry')}${boss(290, 150, 0.85)}<g transform="translate(110 40)"><circle r="20" class="k-page" stroke="var(--ink)" stroke-width="2"/><path d="M0 0 v-13 M0 0 l9 5" class="s-ink" stroke-width="2"/></g>`, 'You in the worker\'s chair: five phones, a clock, a boss at your back'),
  comic: (o) => {
    const P = [['❤️ + "sure, its easy and flexible…"', '?'], ['"…so there\'s no need to worry"', ''], ['"we havent even started , which work are you referring to?"', '?'], ['"send me a screenshot i see"', '?'], ['(nothing for 3 h 18 min)', '…'], ['"…my referral code: O6V7OH"', '?']];
    return svg(P.map(([t, th], i) => { const x = 10 + (i % 3) * 128, y = 12 + Math.floor(i / 3) * 104; return panel(x, y, 122, 98, `${textBox(x + 6, y + 6, 110, wrapText(t, 22), { fs: 7.4, lh: 9 })}${th ? `<g transform="translate(${x + 92} ${y + 70})"><circle r="14" class="k-page" stroke="var(--ink)" stroke-dasharray="3 3"/><text y="5" text-anchor="middle" font-size="13" class="t">${i === o.focus ? '😐' : th}</text></g>` : ''}<rect x="${x + 20}" y="${y + 66}" width="30" height="26" class="k-soft"/><ellipse cx="${x + 35}" cy="${y + 62}" rx="10" ry="8" class="k-glow"/>`); }).join(''), 'Six comic panels: solid bubbles are what they sent, dashed bubbles are guesses');
  },
  drawer: (o) => svg(`${box(110, 150, { open: 0 })}<g transform="translate(250 120)"><rect x="-70" y="-10" width="150" height="70" class="k-hatch" stroke="var(--ink)" stroke-width="2.4"/>${['Warmth', 'Big name', '"Before you ask…"', '"It\'s only a little"', '"It\'s your fault"', '"Let me get my manager"'].map((t, i) => `<rect x="${-64 + (i % 3) * 48}" y="${-4 + Math.floor(i / 3) * 32}" width="44" height="28" class="k-page" stroke="var(--ink)" stroke-width="1"/>${wrapText(t, 10).map((l, j) => `<text x="${-42 + (i % 3) * 48}" y="${10 + Math.floor(i / 3) * 32 + j * 8}" font-size="6.5" text-anchor="middle" class="t">${esc(l)}</text>`).join('')}`).join('')}</g>
    ${reader(330, 200, 0.8, 'flat')}${textBox(290, 30, 100, ['IS THIS REAL?'], { dark: true, fs: 10 })}${o.no ? textBox(212, 196, 112, ['No thanks. I don\'t', 'pay to get paid.'], { fs: 8.5 }) : ''}`, 'A drawer of pre-written answers sliding out of the box'),
  lanes: (o) => svg(`<path d="M10 214 L150 70 h40 L110 214z" fill="var(--ok)" opacity=".25"/><path d="M290 214 L230 70 h40 L390 214z" fill="var(--accent)" opacity=".25"/><text x="100" y="64" font-size="16" class="t" font-weight="800" text-anchor="middle">✓ DO</text><text x="300" y="64" font-size="16" class="t" font-weight="800" text-anchor="middle">✗ NOT YOUR JOB</text>
    ${['Show a grown-up', 'Forward to 7726', 'Report it', 'Block the number'].map((t, i) => textBox(30 + (i % 2) * 74, 100 + Math.floor(i / 2) * 40, 70, [t], { fs: 8 })).join('')}
    ${['Text the worker', 'Get back at them', 'Keep chatting', 'Send money "to see"'].map((t, i) => textBox(246 + (i % 2) * 76, 100 + Math.floor(i / 2) * 40, 72, [t], { fs: 8 })).join('')}${o.wrong ? stamp(282, 200, false) : ''}`, 'Two lanes: DO and NOT YOUR JOB'),
  spot: (o) => {
    const M = [['🎁 FREE 1,000 Robux! Claim before midnight', 'Prize + Pressure'], ['lets talk on another app, its easier', 'Pretending'], ['use my code for a bonus!!', 'The code that counts you'], ['Coach: practice moved to 5pm', 'Looks fine']];
    return svg(M.map(([t, a], i) => `${textBox(20 + (i % 2) * 186, 24 + Math.floor(i / 2) * 92, 176, wrapText(t, 32), { fs: 10, lh: 13 })}${i < o.shown ? `<text x="${28 + (i % 2) * 186}" y="${84 + Math.floor(i / 2) * 92}" font-size="11" font-weight="800" class="${a === 'Looks fine' ? 'k-ok' : 'k-acc'}" style="font-family:var(--sans)">${a === 'Looks fine' ? '✓' : '✗'} ${a}</text>` : ''}`).join('') + mags(200, 214, 0.8, 'squint'), 'Four new messages to check for tricks');
  },

  jar: (o) => svg(`<rect x="250" y="40" width="120" height="86" rx="6" class="k-page" stroke="var(--ink)" stroke-width="2"/><text x="310" y="62" text-anchor="middle" font-size="11" class="t" font-weight="800">SKATES</text><path d="M276 96 h52 l6 -14 h-58z" class="k-acc"/><circle cx="284" cy="102" r="5" class="k-ink"/><circle cx="324" cy="102" r="5" class="k-ink"/><text x="310" y="122" text-anchor="middle" font-size="13" class="t" font-weight="800">$109</text>
    <rect x="252" y="140" width="56" height="50" class="k-page" stroke="var(--ink)" stroke-width="2"/><text x="280" y="156" text-anchor="middle" font-size="8" class="t" font-weight="800">NOV</text><text x="280" y="180" text-anchor="middle" font-size="16" class="k-acc" font-weight="800" style="font-family:var(--sans)">SAT</text>
    <g transform="translate(130 196)"><path d="M-32 -64 h64 v58 q0 10 -10 10 h-44 q-10 0 -10 -10z" class="k-glass" stroke="var(--ink)" stroke-width="2.4"/><rect x="-36" y="-72" width="72" height="10" rx="3" class="k-hatch" stroke="var(--ink)" stroke-width="2"/>${Array.from({ length: Math.min(12, Math.round(o.amount / 4)) }, (_, i) => coin(-18 + (i % 4) * 12, -12 - Math.floor(i / 4) * 12, 6)).join('')}<text x="0" y="-80" text-anchor="middle" font-size="16" class="t" font-weight="800">$${o.amount}</text></g>
    ${reader(56, 166, 1, o.mood || 'flat')}${o.ding ? phone(206, 120, { buzz: true, screen: textBox(-19, -36, 38, ['new msg'], { fs: 6 }) }) : ''}`, `A jar with $${o.amount} saved, skates for $109, a calendar circled Saturday`),
  cups: (o) => svg(`${['BOT', 'RECRUITER', 'PERSON'].map((t, i) => `<g transform="translate(${90 + i * 110} 190)"><path d="M-34 -70 h68 l-10 70 h-48z" class="${o.lock === i ? 'k-glow' : 'k-hatch'}" stroke="var(--ink)" stroke-width="2.4"/><text x="0" y="-30" text-anchor="middle" font-size="11" class="t" font-weight="800">${t}</text></g>`).join('')}${mags(200, 70, 0.8, 'squint')}`, 'Three cups to bet on: bot, recruiter, person'),
  rack: () => svg(`<rect x="20" y="20" width="360" height="196" rx="6" class="k-ink"/>${Array.from({ length: 40 }, (_, i) => { const x = 32 + (i % 10) * 35, y = 30 + Math.floor(i / 10) * 46; return `<rect x="${x}" y="${y}" width="28" height="40" rx="3" class="k-glass"/><rect x="${x + 3}" y="${y + 6}" width="22" height="16" rx="2" class="k-glow pulse"/><text x="${x + 14}" y="${y + 16}" font-size="3.6" text-anchor="middle" class="t">side gig I'm</text><text x="${x + 14}" y="${y + 21}" font-size="3.6" text-anchor="middle" class="t">doing myself</text>`; }).join('')}`, 'A rack of forty phones all showing the same line at once'),
  rink: (o) => svg(`<rect x="40" y="30" width="200" height="130" class="k-ink"/><rect x="48" y="38" width="184" height="114" class="k-glow"/>${[70, 120, 170, 210].map((x, i) => `<circle cx="${x}" cy="${60 + (i % 2) * 14}" r="6" class="k-acc"/>`).join('')}<path d="M48 120 h184" class="s-ink" stroke-width="2"/>
    <g transform="translate(320 196)"><path d="M-26 -50 h52 v42 q0 8 -8 8 h-36 q-8 0 -8 -8z" class="k-glass" stroke="var(--ink)" stroke-width="2"/><text x="0" y="-58" text-anchor="middle" font-size="13" class="t" font-weight="800">$${o.amount}</text></g>
    ${reader(270, 150, 1, o.skates ? 'glad' : 'worry')}${o.skates ? `<path d="M244 206 h40 l5 -10 h-45z" class="k-acc"/><circle cx="252" cy="210" r="4" class="k-ink"/><circle cx="278" cy="210" r="4" class="k-ink"/>` : ''}`, o.skates ? 'Saturday: the kid has skates at the rink window' : 'Saturday: an empty jar and the rink lights through a window'),
  shovel: () => svg(`<path d="M0 200 Q100 170 200 196 T400 186 V260 H0z" fill="#FFFFFF" opacity=".9"/>${reader(170, 150, 1, 'glad')}<path d="M196 160 l40 40 M226 196 l20 -6 l-6 20z" class="s-ink" stroke-width="4"/>${[0, 1, 2].map((i) => `<g transform="translate(${60 + i * 120} 60)"><rect x="-26" y="-20" width="52" height="34" class="k-page" stroke="var(--ink)" stroke-width="2"/><path d="M-30 -20 l30 -18 l30 18z" class="k-acc"/><text x="0" y="32" font-size="9" text-anchor="middle" class="k-ok" font-weight="800" style="font-family:var(--sans)">+$20 ✓</text></g>`).join('')}`, 'The kid shoveling three driveways for twenty dollars each'),
  shot: () => `<svg viewBox="0 0 400 260" role="img" aria-label="The sign-up screenshot the scammer sent, with red arrows to Sign Up and the referral code"><rect width="400" height="260" class="k-ink"/><image href="./book/signup.jpg" x="0" y="28" width="400" height="180" preserveAspectRatio="xMidYMid meet"/><text x="200" y="236" text-anchor="middle" font-size="11" font-weight="800" style="fill:var(--page);font-family:var(--sans)">SENT BY CHARLIE · REAL SCREENSHOT</text></svg>`,
  unmask: (o) => svg(`${box(200, 140, { open: 1, inside: `<rect x="-58" y="-32" width="116" height="92" class="k-page"/>${worker(0, 34, 0.85)}` })}${o.who === 'bot' ? mask(92, 196) : o.who === 'rec' ? peeledTag(96, 190) : lens(96, 186, 1.2)}${mags(340, 186, 1, o.who === 'person' ? 'wink' : 'squint')}`, 'The box open; what you guessed lies on the floor'),
  readsit: (o) => svg(`${quota(26, 30)}${door(318, 118)}${worker(170, 176, 1)}${boss(250, 150, 1)}${phone(268, 96, { screen: o.cat ? '<text x="0" y="6" font-size="22" text-anchor="middle">🐈</text>' : textBox(-19, -30, 38, ['are you', 'OK?'], { fs: 7, lh: 9 }) })}${textBox(18, 112, 120, ['The boss reads it', 'first.'], { fs: 9 })}`, 'The boss holding the phone and reading your message'),
  reported: () => svg(`${box(110, 150, { open: 0 })}<path d="M86 104 l14 22 l-10 14" class="s-acc" stroke-width="3"/><path d="M190 120 q60 -60 140 -50" fill="none" class="s-soft" stroke-width="2" stroke-dasharray="5 5"/>${envelope(240, 90)}<g transform="translate(340 150)"><rect x="-34" y="-60" width="68" height="70" class="k-page" stroke="var(--ink)" stroke-width="2.4"/><path d="M-40 -60 l40 -22 l40 22z" class="k-hatch" stroke="var(--ink)" stroke-width="2"/><text x="0" y="-20" text-anchor="middle" font-size="9" class="t" font-weight="800">REPORTS</text></g>`, 'Your report flies out to the people who can shut the box down; the box cracks'),
  walkaway: () => svg(`${machine(130, 182, { bar: 95, balance: 'COME BACK!', sign: 'Top up to get it ALL back!' })}${reader(300, 166, 1, 'glad')}${pouch(300, 236, 10)}<path d="M330 150 l30 0 l-8 -6 M360 150 l-8 6" class="s-ink" stroke-width="3"/>`, 'You walk away with your pouch still full while the machine yells'),
  end: (o) => svg(`<line x1="0" y1="120" x2="400" y2="120" class="s-soft" stroke-width="1"/><g opacity=".5" transform="translate(330 70) scale(.35)">${box(0, 120)}</g>${box(170, 150, { tape: true, peel: o.peel ?? 2 })}${mags(56, 190, 1, 'wink')}${o.who === 'person' ? lens(250, 196, 0.9) : o.who === 'bot' ? mask(250, 196) : peeledTag(250, 196)}${o.worker === 'report' ? envelope(300, 196, 0.9) : `<g transform="translate(300 196)">${textBox(-26, -14, 52, ['are you OK?'], { fs: 7 })}</g>`}${pouch(356, 210, o.coins === 'walk' ? 10 : 3)}`, 'The box taped shut, its smile peeled; a new box on the horizon'),
};

/* ============================== timeline ============================== */
// type: v = verse, m = Mags, c = How we know, q = quote from the chat. art = [scene, props]. hush = designed silence (s).
const T = [
  { page: 1, mus: { pad: .4, theme: .3 }, beats: [
    { art: ['phone', { big: true, buzz: true }], fx: 'blip', lines: [['v', 'One Wednesday, a phone buzzed. A stranger named Charlie said a lady named Olivia sent him.'], ['t', 'Wed 1:46 pm'], ['q', OPENER]] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'Who was really on the other end? Make your guess.'], ['v', 'Nobody answered. So Charlie knocked again. And again.'], ['t', 'Thu 8:32 am · Fri 10:10 am'], ['q', 'Hi, I haven\'t heard back from you at all since the beginning, so I\'d like to confirm whether you\'re still interested in remote work.']] },
    { art: ['cups', {}], lines: [['v', 'On Saturday morning, it was time to answer.'], ['m', 'Who\'s typing?']], ask: { key: 'who', opts: [['A bot', 'bot'], ['A recruiter', 'rec'], ['A person', 'person'], ['A very fast hamster', 'hamster']] } }] },
  { page: 2, mus: { machine: .3, pad: .2 }, beats: [
    { art: ['phone', { mood: 'up' }], lines: [['m', 'Your reply?']], pick: [['Yes', null], ['Who is Olivia?', ['Olivia from our staffing team passed your number along. Are you still interested in this opportunity?', 'A pasted answer that dodges the question.']], ['(ignore it)', ['Hi, I haven\'t heard back from you, so I\'d like to confirm whether you\'re still interested in remote work.', 'One nudge a day, mid-morning.']], ['new phone who dis', ['Hi, I\'m Charlie. Are you still interested in remote work?', 'The script just restarts.']]] },
    { art: ['phone', {}], lines: [['t', 'Sat 8:30 am'], ['q', 'Yes']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'Charlie was very friendly. He said the job was just his little side job.'], ['t', '8:33 am'], ['q', 'This job is actually more of a part time role, and it\'s a side gig I\'m doing myself']] },
    { art: ['stack', { n: 3, clock: '19 s · 9 s' }], fx: 'thunk', lines: [['v', 'You wanted to know how the job really worked.'], ['v', 'Then three long messages landed, faster than anyone can type.'], ['t', '8:51 am · three long messages in 28 seconds'], ['q', 'Company Name: Merchkit']] }] },
  { page: 3, mus: { theme: .4, pad: .3 }, beats: [
    { art: ['phone', { mood: 'up' }], lines: [['m', 'Ask him something.']], pick: [['How do I get the merchants?', null], ['Is this a scam?', ['Our company is a legitimate e-commerce platform. Many people work with us every day.', 'A smooth answer was written before you asked.']], ['Can I get paid in pizza?', ['It\'s daily paid, I\'ll guide you on how to withdraw.', 'Off-script questions get the nearest card.']]] },
    { art: ['phone', {}], lines: [['t', '3:17 pm'], ['q', 'How do I get the merchants and their product info']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['q', 'All our work is done through the company\'s work hub. There are thousands of products waiting to be optimized every day.']] },
    { art: ['phone', {}], lines: [['v', 'You played along. Charlie liked that.'], ['t', '3:51 pm'], ['q', 'That sounds like something I can do'], ['c', 'Charlie tapped ❤️ on your message.']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'Charlie promised lots of money. You asked how you would get paid.'], ['q', 'sure, its easy and flexible, can i now share with you our working hours and the pay?']] },
    { art: ['phone', { mood: 'up' }], lines: [['m', 'He offers the pay. You say?']], pick: [['Yes please, and method of payment', null], ['Which app pays me?', ['You\'ll see after the training. No need to worry.', 'The money question gets dodged.']], ['Pay me in skates', ['The monthly base pay is $2800, plus separate product based profits.', 'He pastes the pay card anyway.']]] },
    { art: ['phone', {}], lines: [['q', 'Yes please, and method of payment']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'Charlie talked about the money. He never said how.'], ['q', 'The monthly base pay is $2800, plus separate product based profits.'], ['c', 'The payment question was skipped.']] }] },
  { page: 4, mus: { pad: .3, arp: .3 }, beats: [
    { art: ['phone', {}], lines: [['v', 'On Sunday you asked again.'], ['t', 'Sun 10:52 am'], ['q', 'How am I compensated. What is the method of payment']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', "He said, don't worry. That still wasn't how."], ['q', 'You won\'t need to provide me or the company with any personal or banking information, so there\'s no need to worry'], ['c', 'Still no method.']] },
    { art: ['phone', {}], lines: [['v', 'So you tried a trick of your own.'], ['t', '11:45 am'], ['q', 'What\'s the next step']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'Time for a bluff.'], ['q', 'Next, I\'ll show you how to register your work account on the company\'s Workhub.']] }] },
  { page: 5, mus: { pad: .3, arp: .4 }, beats: [
    { art: ['phone', { mood: 'squint' }], lines: [['m', 'Your move.']], pick: [['Bluff: you owe me $300', null], ['ok signing up now!', ['great, let me know when you are done', 'Eager gets a fast, warm reply.']], ['Stop texting me', ['Hi, have you completed your registration?', 'One more nudge tomorrow, then quiet.']], ['beep boop I am also a bot', ['send me a screenshot', 'Weird gets a demand for proof.']]] },
    { art: ['phone', { mood: 'squint' }], lines: [['t', '11:46:49'], ['q', 'I have already completed my work for the day though and I\'m owed $300. Please provide me withdrawal instructions']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['t', '8 seconds later'], ['q', 'After you finish the training, you can start using your work account to work and earn money. Are you available to start the training now?']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'This time the words came out messy and lowercase. Somebody real was typing.'], ['t', '34 seconds later'], ['q', 'we havent even started , which work are you referring to?']] },
    { art: ['phone', {}], lines: [['q', 'The work you gave me earlier. In a different session.']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'Charlie wanted proof.'], ['t', '3 min 38 s later'], ['q', 'send me a screenshot i see']] },
    { art: ['phone', {}], lines: [['q', 'Show me an example of what that would look like'], ['q', 'How do I start training?']] },
    { art: ['silence', {}], lines: [['v', 'When you said you were ready, Charlie came right back, like nothing happened.'], ['v', 'Then, for three whole hours, nothing at all.'], ['t', '3 hours 18 minutes of nothing']], hush: 2.5 }] },
  { page: 6, mus: { theme: .4, pad: .3 }, beats: [
    { art: ['phone', { mood: 'up' }], lines: [['m', 'Three hours of silence. Now?']], pick: [['I am ready to start the training', null], ['Block and report', ['(nothing; the number is blocked)', 'Best move. Forward it to 7726.']], ['Sorry, my cat ate my phone', ['Hi, are you still interested in remote work?', 'Any reply keeps you on the list.']]] },
    { art: ['phone', {}], lines: [['t', 'Sun 3:04 pm'], ['q', 'I am ready to start the training when you are']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['v', 'He gave you a secret code, so his boss would know who brought you in.'], ['t', '6 minutes later'], ['q', 'When you register, you\'ll need to enter my referral code: O6V7OH']] },
    { art: ['phone', { buzz: true }], fx: 'blip', lines: [['q', 'If you run into any issues during registration, just take a screenshot and send it to me.']] },
    { art: ['shot', {}], lines: [['v', 'In the middle of the night, you asked about your three hundred dollars.'], ['v', 'He even sent pictures with red arrows, showing exactly where to sign up.'], ['c', 'His how-to: Sign Up, then the referral code box. The code tells his boss who brought you in.']], hold: 5 },
    { art: ['phone', { mood: 'squint' }], lines: [['m', 'Seven hours later. Your move.']], pick: [['When can I expect to receive the $300', null], ['Done! What\'s the next task?', ['Great. Let me know when you\'re ready to start the training.', 'Eager gets a warm, fast reply.']], ['Block and report', ['(nothing; the number is blocked)', 'The move that ends it. Forward to 7726.']], ['My hamster signed up instead', ['send me a screenshot', 'Weird gets a demand for proof.']]] },
    { art: ['phone', {}], lines: [['t', 'Mon 2:32 am'], ['q', 'When can I expect to receive the $300']] },
    { art: ['silence', {}], lines: [['t', 'No reply yet.']], hush: 2 },
    { art: ['phone', { mood: 'squint' }], lines: [['v', "Now it's your turn. Keep Charlie busy, and never give him anything."], ['c', 'Your turn to play him.']], game: true }] },
  { page: 7, mus: { pad: .3 }, beats: [
    { art: ['box', { open: 0 }], lines: [['v', 'So who was it, really? Open the box and see.'], ['c', 'Polished pasted blocks. Lowercase lines typed fast. A heart tapped on your message.']] },
    { art: ['box', { open: 1 }], fx: 'creak', lines: [['c', 'A person, working from a script.']] },
    { when: (s) => s.who === 'bot', art: ['unmask', { who: 'bot' }], fx: 'wrong', lines: [['m', 'Bot? Then who tapped the heart?']] },
    { when: (s) => s.who === 'rec', art: ['unmask', { who: 'rec' }], fx: 'wrong', lines: [['m', 'Recruiter? MASIS Staffing is real. The scam borrowed its name.']] },
    { when: (s) => s.who === 'person', art: ['unmask', { who: 'person' }], fx: 'right', lines: [['m', 'Person. Right.']] },
    { when: (s) => s.who === 'hamster', art: ['unmask', { who: 'bot' }], fx: 'wrong', lines: [['m', 'Hamster. Wrong. Closer than "bot", though.']] }] },
  { page: 8, mus: { theme: .3, pad: .3 }, beats: [
    { art: ['end', { peel: 5 }], lines: [['c', 'Every chat line is copied from the real thread (Nov 2026). merchkitcloud.com was registered 11 days before the first text. MASIS Staffing and Merchkit are real companies; the scam borrowed their names.'], ['c', 'Report scam texts: forward to 7726 · reportfraud.ftc.gov · ic3.gov']] }] },
];

/* ============================== audio ============================== */
const A = { ok: false };
const bars = (seq, reps = 1) => Array(reps).fill(seq.flatMap((n) => [n, ...Array(15).fill('-')]).join(' ')).join(' ');
const SONGS = {
  pad: { bpm: 84, tracks: [{ name: 'pad', instrument: 'fm', patch: 'organ', steps: bars(['D3', 'Bb2', 'F3', 'A2']), gain: 0.45, gate: 1, minIntensity: 0.05 }] },
  theme: { bpm: 84, tracks: [{ name: 'theme', instrument: 'fm', patch: 'epiano', steps: 'A4 - - . F4 - . . D4 - - . F4 - G4 . A4 - - - . . . . G4 - E4 . C4 - - . D4 - - - - - - . . . . . A4 - - . G4 - F4 . E4 - - . C#4 - - . D4 - - - - - - - . . . .', gain: 0.6, gate: 0.9, minIntensity: 0.05 }] },
  arp: { bpm: 84, tracks: [{ name: 'arp', instrument: 'psg', channel: 0, steps: 'D5 F5 A5 F5 D5 F5 A5 F5 Bb4 D5 F5 D5 Bb4 D5 F5 D5 F4 A4 C5 A4 F4 A4 C5 A4 A4 C#5 E5 C#5 A4 C#5 E5 C#5', gate: 0.4, decay: 2, gain: 0.5, minIntensity: 0.05 }] },
  machine: { bpm: 84, tracks: [{ name: 'machine', instrument: 'fm', patch: 'bass', steps: 'D2 . F2 . A2 . C3 . D2 . C3 . A2 . F2 . G2 . Bb2 . D3 . C3 . A2 . G2 . F2 . E2 .', gain: 0.8, gate: 0.6, minIntensity: 0.05 }, { name: 'tick', instrument: 'noise', rate: 26000, decay: 8, steps: 'o . . . o . . . o . . . o . . .', gain: 0.4, minIntensity: 0.5 }] },
  hole: { bpm: 84, tracks: [{ name: 'hole', instrument: 'fm', patch: 'bell', steps: bars(['E3', 'F3', 'E3', 'F3']), gain: 0.5, gate: 1, minIntensity: 0.05 }, { name: 'low', instrument: 'fm', patch: 'bass', steps: bars(['E2', 'E2', 'F2', 'E2']), gain: 0.7, gate: 1, minIntensity: 0.4 }] },
  boss: { bpm: 84, tracks: [{ name: 'boss', instrument: 'fm', patch: 'organ', steps: bars(['G2', 'G2', 'Ab2', 'G2']), gain: 0.55, gate: 1, minIntensity: 0.05 }] },
  shift: { bpm: 84, tracks: [{ name: 'shift', instrument: 'psg', channel: 1, steps: 'D4 . D4 . D4 . D4 . F4 . D4 . D4 . D4 .', gate: 0.25, decay: 3, gain: 0.45, minIntensity: 0.05 }, { name: 'tick', instrument: 'noise', rate: 30000, decay: 9, steps: 'x . . . x . . . x . . . x . . .', gain: 0.5, minIntensity: 0.05 }] },
};
async function audioStart() {
  if (A.starting) return A.starting;
  A.starting = (async () => {
    try {
      const ctx = new AudioContext({ latencyHint: 'interactive' });
      A.ctx = ctx; ctx.resume();
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      A.mus = new GainNode(ctx, { gain: 0.8 }); A.mus.connect(ctx.destination);
      A.sfx = new GainNode(ctx, { gain: 0.9 }); A.sfx.connect(ctx.destination);
      const { SoundEngine } = await import('./engine/src/index.js');
      A.eng = await SoundEngine.create({ context: ctx, zone: 'room', device: 'unknown', destination: A.sfx });
      A.musEng = new SoundEngine(ctx, { zone: 'room', device: 'unknown', destination: A.mus });
      const mk = (kind, o) => A.eng.createSource(kind, { position: { x: 0, y: 1 }, ...o });
      A.syn = mk('synth', { patch: 'epiano', priority: 10 }); A.syn2 = mk('synth', { patch: 'epiano', priority: 10 });
      A.wood = mk('modal', { modes: [{ freq: 220, gain: 1, t60: 0.4 }, { freq: 607, gain: 0.5, t60: 0.25 }, { freq: 1190, gain: 0.3, t60: 0.15 }] });
      A.glass = mk('modal', { modes: [{ freq: 1320, gain: 1, t60: 0.9 }, { freq: 3530, gain: 0.5, t60: 0.5 }] });
      A.steel = mk('modal', { modes: [{ freq: 310, gain: 1, t60: 0.9 }, { freq: 845, gain: 0.5, t60: 0.6 }, { freq: 1730, gain: 0.3, t60: 0.35 }] });
      A.feet = mk('footsteps', {});
      A.buses = {};
      for (const [k, song] of Object.entries(SONGS)) A.buses[k] = A.musEng.createMusic(song, { intensity: 0, volume: 1, send: 0.12 });
      for (const b of Object.values(A.buses)) b.play();   // all together: one bar grid
      A.ok = true;
      const tick = () => { if (A.ok) { A.eng.update(); A.musEng.update(); } requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      applyMute(); setMusic(curMus);
    } catch (e) { console.warn('sound could not start', e); A.ok = false; }
  })();
  return A.starting;
}
function ensureRunning() { if (A.ctx && A.ctx.state !== 'running' && A.ctx.state !== 'closed') A.ctx.resume().catch(() => {}); }
['visibilitychange', 'pageshow', 'focus', 'pointerdown'].forEach((ev) => window.addEventListener(ev, ensureRunning));
let soundOn = true, curMus = {};
function applyMute() { if (!A.ctx) return; const t = A.ctx.currentTime; for (const g of [A.mus, A.sfx]) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(soundOn ? (g === A.mus ? 0.8 : 0.9) : 0, t); } }
function setMusic(m) { curMus = m; if (!A.ok) return; for (const [k, b] of Object.entries(A.buses)) b.setIntensity(m[k] ?? 0); }
function fx(name) {
  if (!A.ok || !soundOn) return;
  const n = (s, midi, v = 0.6, d = 0.2, patch) => s.note({ midi, velocity: v, duration: d, patch });
  try { switch (name) {
    case 'wrong': n(A.syn, 77, 0.7, 0.18, 'epiano'); n(A.syn2, 76, 0.7, 0.18, 'epiano'); A.wood.strike(0.6, 0.3); break;   // F5 + E5 struck together
    case 'right': n(A.syn, 72, 0.5, 0.12); setTimeout(() => n(A.syn, 79, 0.5, 0.2), 90); break;
    case 'clink': A.glass.strike(0.7, 0.7); break;
    case 'thunk': A.wood.strike(0.9, 0.2); break;
    case 'creak': A.steel.strike(0.4, 0.2); break;
    case 'click': A.wood.strike(0.4, 0.6); break;
    case 'blip': A.syn.sfx('blip'); break;
    case 'hit': A.syn.sfx('hit'); break;
    case 'crunch': A.syn.sfx('crunch'); A.glass.strike(0.5, 0.5); break;
    case 'shatter': A.glass.strike(1, 0.9); setTimeout(() => A.glass.strike(0.6, 0.8), 60); break;
    case 'paper': A.wood.strike(0.25, 0.9); break;
    case 'steps': [0, 700, 1400].forEach((t) => setTimeout(() => A.feet.step({ mass: 90, speed: 0.8, surface: 'wood' }), t)); break;
    case 'coin': A.syn.sfx('coin'); break;
    case 'stinger': n(A.syn, 62, 0.6, 0.5, 'bell'); break;
  } } catch (e) { console.warn('fx', name, e); }
}


/* who said each real line, and the trick in it (both sides play) */
const YOU_TRICKS = [
  ['Yes', 'PLAY ALONG'], ['How do I get the merchants', 'MAKE HIM EXPLAIN'], ['That sounds like something I can do', 'ACT EAGER'],
  ['Yes please, and method of payment', 'THE MONEY QUESTION'], ['How am I compensated', 'ASK AGAIN'], ["What's the next step", 'PLAY ALONG'],
  ["I'm owed $300", 'BLUFF'], ['In a different session', 'FAKE MEMORY'], ['Show me an example', 'MAKE HIM PROVE IT'],
  ['How do I start training', 'ACT EAGER'], ['I am ready to start the training', 'ACT EAGER'], ['When can I expect to receive the $300', 'BLUFF AGAIN']];
const CHARLIE_TRICKS = [
  ['Olivia from MASIS STAFFING', 'BORROWED NAME'], ["haven't heard back from you at all", 'KEEP POKING'], ['side gig I\'m doing myself', 'ONE OF US'],
  ['All our work is done through', 'VAGUE ANSWER'], ['sure, its easy', 'TYPED LIVE'], ['$2800', 'BIG NUMBER'],
  ['no need to worry', 'ANSWER THE WORRY'], ['how to register your work account', 'NEXT SMALL YES'], ['After you finish the training', 'SCRIPT RUNS ANYWAY'],
  ['we havent even started', 'CAUGHT YOU'], ['send me a screenshot', 'MAKE YOU PROVE IT'], ['referral code', 'THE CODE THAT COUNTS YOU']];
const tagFor = (t, list) => (list.find(([k]) => t.includes(k)) || [])[1];
function realLine(t) {
  const you = YOU_TRICKS.find(([k]) => t === k || (k.length > 4 && t.includes(k)));
  const who = you ? 'you' : 'charlie', trick = you ? you[1] : tagFor(t, CHARLIE_TRICKS);
  return `<p class="line chat ${who}"><b class="who">${who === 'you' ? 'YOU' : 'CHARLIE'}</b>${trick ? `<span class="trick">${trick}</span>` : ''}<br>${esc(t)}</p>`;
}


/* ============================== the counter game ============================== */
// After the screenshot: out-play Charlie. Typed replies cost him time; pasted ones cost nothing.
// Claims about his records or bot tests burn his patience; at zero he drops you.
const MOVES = [
  ['The verification text never came', 'send me a screenshot', 3, 0, 'Fails before an account exists. He has to type.'],
  ['Is the code O6V7OH with zeros or the letter O?', 'letter O. try again', 3, 0, 'A real question his script has no card for.'],
  ['Is this W-2 or 1099?', 'no need to worry about that, register first', 2, -1, 'Tax questions get brushed off.'],
  ['Which app pays me? Zelle?', 'You\'ll see after the training.', 1, 0, 'The money question gets a pasted dodge.'],
  ['huh, which part?', 'just click sign up and enter my code', 2, 0, 'Confusion makes him rephrase by hand.'],
  ['The birth year box won\'t take my year', 'put any year', 3, -1, 'He types, a little annoyed.'],
  ['Where\'s my $300?', 'we havent even started , which work are you referring to?', 2, -2, 'Claims about his records burn his patience.'],
  ['beep boop are you a bot', 'send me a screenshot', 1, -2, 'Bot tests look like baiting.'],
  ['ok signing up now!', 'great, let me know when you are done', 1, 1, 'Eager buys patience back.'],
  ['Sorry, slow reply. My dog died.', 'sorry to hear that. are you available to start the training now?', 2, 0, 'He types one sad line, then right back to the script.'],
  ['I\'ve been in a coma since 2019. What year is it?', 'its 2026. you can still do the job, just register first', 3, -1, 'He has to type. Even a coma doesn\'t stop the script.'],
  ['Tell a grown-up and block him', null, 0, 0, 'The best move of all.'],
];
function counterGame(done) {
  setPlaying(false);
  let typed = 0, patience = 4, round = 0;
  const say = $('say');
  const meters = () => `<p class="line ts on">ROUND ${round + 1}/5 · HIS TYPING WASTED: ${typed * 20}s · HIS PATIENCE: ${'●'.repeat(Math.max(0, patience))}${'○'.repeat(Math.max(0, 4 - patience))}</p>`;
  const finish = (msg) => { say.innerHTML = `<p>${esc(msg)}</p>`; say.classList.add('on');
    words.innerHTML = `${meters()}<p class="line cap on">You made Charlie type for ${typed * 20} seconds.</p>`;
    const go = document.createElement('button'); go.className = 'btn'; go.textContent = 'Continue ▶'; go.onclick = () => done(); words.appendChild(go); };
  const turn = () => {
    if (round >= 5) return finish('Five turns! You kept Charlie busy and gave him nothing at all.');
    const pool = MOVES.slice(0, -1).sort(() => Math.random() - 0.5).slice(0, 3).concat([MOVES[MOVES.length - 1]]);
    say.innerHTML = `<p>${round ? 'Again. What now?' : 'Can you keep Charlie busy without giving him anything?'}</p>`; say.classList.add('on');
    words.innerHTML = meters();
    const box = document.createElement('div'); box.className = 'bar';
    pool.forEach(([label, reply, cost, pat, note]) => { const bt = document.createElement('button'); bt.className = 'btn'; bt.type = 'button'; bt.textContent = label;
      bt.onclick = () => {
        if (!reply) { fx('right'); return finish('You told a grown-up and blocked him. That\'s how you really win.'); }
        typed += cost; patience = Math.min(4, patience + pat); round++; fx(pat < 0 ? 'wrong' : 'click');
        words.innerHTML = `${meters()}<p class="line chat you on"><b class="who">YOU</b><br>${esc(label)}</p><p class="line chat charlie pred on"><b class="who">CHARLIE · PREDICTED</b><br>${esc(reply)}</p>`;
        say.innerHTML = `<p>${esc(note)}</p>`;
        setTimeout(() => { if (patience <= 0) finish('Charlie went quiet. You pushed too hard, so he went to bother someone else.'); else turn(); }, 2600);
      }; box.appendChild(bt); });
    words.appendChild(box);
  };
  turn();
}

/* ============================== player ============================== */
const st = { who: 'person' };   // Watch-it path: the cautionary choices
const vis = (b) => !b.when || b.when(st);
let interactive = false, speed = 2.6, playing = false, pi = 0, bi = 0, timer = null, beatStart = 0, beatLen = 0, remaining = 0;
const flat = []; T.forEach((p, i) => p.beats.forEach((b, j) => flat.push({ pi: i, bj: j })));
const wordsOf = (b) => b.lines.reduce((a, [, t]) => a + t.split(/\s+/).length, 0);
const holdFor = (b) => b.hold ?? (b.hush ? b.hush : b.lines.length ? Math.max(1.6, 0.6 + wordsOf(b) / speed + 0.3) + (b.refrain ? 0.71 : 0) : 1.2);
function ask(b) {
  const box = document.createElement('div'); box.className = 'bar'; box.setAttribute('role', 'group');
  b.ask.opts.forEach(([label, val]) => { const bt = document.createElement('button'); bt.className = 'btn'; bt.type = 'button'; bt.textContent = label;
    bt.onclick = () => { st[b.ask.key] = val; fx('click'); $('say').innerHTML = '<p>Locked in. Keep watching.</p>'; $('say').classList.add('on'); box.remove(); setTimeout(() => { setPlaying(true); }, 700); }; box.appendChild(bt); });
  words.appendChild(box); setPlaying(false);
}
function pick(b) {
  const box = document.createElement('div'); box.className = 'bar'; box.setAttribute('role', 'group');
  b.pick.forEach(([label, pred]) => { const bt = document.createElement('button'); bt.className = 'btn'; bt.type = 'button'; bt.textContent = label;
    bt.onclick = () => { box.remove(); fx('click'); const say = $('say');
      if (!pred) { say.innerHTML = '<p>That\'s what you really sent.</p>'; say.classList.add('on'); setTimeout(() => setPlaying(true), 900); return; }
      words.innerHTML = `<p class="line chat charlie pred on"><b class="who">CHARLIE · PREDICTED</b><br>${esc(pred[0])}</p>`;
      say.innerHTML = `<p>${esc(pred[1])} You really sent something else:</p>`; say.classList.add('on');
      setTimeout(() => setPlaying(true), 4200); }; box.appendChild(bt); });
  words.appendChild(box); setPlaying(false);
}
function show(b, page) {
  if (b.dyn) b = { ...b, lines: b.dyn(st) };
  if (false) { const good = (st.who === 'person') + (st.worker === 'report') + (st.coins === 'walk'); b = { ...b, art: ['end', { ...b.art[1], peel: Math.min(5, b.art[1].peel - 1 + good), who: st.who, worker: st.worker, coins: st.coins }] }; }
  const [scene, props] = b.art;
  art.innerHTML = S[scene](props || {});
  const say = $('say'), ml = b.lines.filter(([k]) => k === 'm');
  say.innerHTML = ml.map(([, t]) => `<p>${esc(t)}</p>`).join(''); say.classList.toggle('on', ml.length > 0);
  words.innerHTML = b.lines.filter(([k]) => k !== 'm').map(([k, t]) => k === 'q' ? realLine(t) : k === 'r' ? `<p class="line chat charlie"><b class="who">CHARLIE'S SCRIPT</b><span class="trick">BLAME YOU</span><br>${esc(t)}<br><small>(from a seized scam manual, another case)</small></p>` : `<p class="line ${({ v: '', m: 'mags', c: 'cap', q: 'chat', k: 'kid', r: 'chat other', t: 'ts' })[k]}">${esc(t).replace(/⟨(.+?)⟩/g, (_, w) => b.refrain ? `<span class="hide" data-w="${w}">${w}</span>` : w)}</p>`).join('');
  requestAnimationFrame(() => words.querySelectorAll('.line').forEach((el, i) => setTimeout(() => el.classList.add('on'), 250 * i)));
  if (b.refrain) { const h = words.querySelector('.hide'); if (h) setTimeout(() => { h.classList.remove('hide'); fx('stinger'); }, Math.max(400, (holdFor(b) - 0.71) * 1000 * 0.55)); }
  setMusic(b.hush ? {} : { ...page.mus, ...(b.mus || {}) });
  if (b.fx) fx(b.fx);
  if (b.ask && interactive) setTimeout(() => ask(b), 400);
  if (b.pick && interactive) setTimeout(() => pick(b), 400);
  if (b.game) setTimeout(() => counterGame(() => { setPlaying(true); }), 400);
  $('prog').style.width = `${(100 * flat.findIndex((f) => f.pi === pi && f.bj === bi)) / flat.length}%`;
}
function step() {
  const page = T[pi], b = page.beats[bi];
  show(b, page);
  beatLen = (holdFor(b) + (b.lines.length ? 0.5 : 0)) * 1000; remaining = beatLen; beatStart = performance.now();
  schedule();
}
function schedule() { clearTimeout(timer); if (playing) timer = setTimeout(advance, remaining); }
function advance() {
  do { bi++; if (bi >= T[pi].beats.length) { pi++; bi = 0; } } while (pi < T.length && !vis(T[pi].beats[bi]));
  if (pi >= T.length) { playing = false; pi = T.length - 1; bi = T[pi].beats.length - 1; $('pause').textContent = '↺'; $('pause').setAttribute('aria-label', 'Replay'); setMusic({ pad: 0.2 }); return; }
  step();
}
function setPlaying(p) {
  if (p && !playing) { playing = true; beatStart = performance.now(); schedule(); }
  if (!p && playing) { playing = false; clearTimeout(timer); remaining -= performance.now() - beatStart; }
  $('pause').textContent = playing ? '❚❚' : '▶'; $('pause').setAttribute('aria-label', playing ? 'Pause' : 'Play');
}
function jump(dir) { const np = Math.max(0, Math.min(T.length - 1, pi + dir)); pi = np; bi = 0; while (!vis(T[pi].beats[bi])) bi++; step(); }

/* ============================== wiring ============================== */
art.innerHTML = S.poster();
$('splash').addEventListener('click', () => {
  audioStart();                       // inside the tap, never awaited
  setMusic({ pad: 0.5, theme: 0.4 }); // applied as soon as the engine is up
  $('splash').hidden = true; $('play').focus();
});
$('play2').addEventListener('click', () => { interactive = true; $('play').click(); });
$('play').addEventListener('click', () => {
  if (!interactive) Object.assign(st, { who: 'person' });
  audioStart(); $('splash').hidden = true;               // created inside the tap; never awaited before the picture moves
  $('poster').hidden = true; playing = true; pi = 0; bi = 0; step(); setPlaying(true);
});
$('pause').addEventListener('click', () => { if (!playing && pi === T.length - 1 && bi === T[pi].beats.length - 1) { pi = 0; bi = 0; playing = true; step(); setPlaying(true); return; } setPlaying(!playing); });
$('back').addEventListener('click', () => { if (!$('poster').hidden) return; jump(bi > 0 ? 0 : -1); });
$('next').addEventListener('click', () => { if (!$('poster').hidden) return; jump(1); });
$('speed').addEventListener('change', (e) => { speed = parseFloat(e.target.value); try { localStorage.setItem('stsb.v1.textSpeed', String(speed)); } catch (er) {} });
try { const s = parseFloat(localStorage.getItem('stsb.v1.textSpeed')); if (s) { speed = s; $('speed').value = String(s); } } catch (e) {}
$('snd').addEventListener('click', () => { soundOn = !soundOn; $('snd').textContent = soundOn ? '🔊' : '🔇'; $('snd').setAttribute('aria-label', soundOn ? 'Sound on' : 'Sound off'); applyMute(); });
window.addEventListener('keydown', (e) => { if (e.code === 'Space' && $('poster').hidden) { e.preventDefault(); setPlaying(!playing); } });
art.addEventListener('click', () => { if ($('poster').hidden) setPlaying(!playing); });

import { H, TILE_COLORS, W, cells, hardDrop, move, newGame, rotate, stackHeight, tick } from './game.ts';
import type { Step } from './game.ts';
import { define } from './defs.ts';
import * as music from './music.ts';

const TICK_MS = 500;
const S = 36; // celda del tablero en px
const NEXT = 96; // lado del cuadro de "Siguiente"
const MAX_CARDS = 2;
const INTRO_MS = 5000; // portada → tablero: difuminado de la portada y fundido de la música
const TENSION_ROWS = 5; // con la pila a esta altura suena Psycho
const GAME_OVER_MS = 2200; // se ve "Fin del juego" y luego se vuelve a la portada
const FALL_MS_PER_ROW = 110; // caída lenta de lo que cuelga, para poder seguirla con la vista
const DISSOLVE_MS = 750;
const PX = 6; // lado de cada "píxel" del desintegrado (divide a S)
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dpr = window.devicePixelRatio || 1; // nítido en pantallas HiDPI

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const root = document.documentElement;
const cssVar = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
// Las fichas llevan la paleta de la portada (--t0…), sea cual sea el tema; el tema solo cambia el fondo
const TILES = Array.from({ length: TILE_COLORS }, (_, i) => ({ bg: cssVar(`--t${i}`), ink: cssVar(`--t${i}-ink`) }));
const themeColors = () => ({ line: cssVar('--line'), shadow: cssVar('--shadow-rgb'), outline: cssVar('--hot-outline') });
let C = themeColors();

function setup(c: HTMLCanvasElement, w: number, h: number) {
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  c.style.width = `${w}px`;
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return ctx;
}
const ctx = setup($('board'), W * S, H * S);
const nctx = setup($('next'), NEXT, NEXT);

// `cell` es la letra más el dígito de su color (ver Board en game.ts). La pieza que cae lleva contorno y más sombra.
function tile(c: CanvasRenderingContext2D, cell: string, px: number, py: number, size: number, hot: boolean) {
  const { bg, ink } = TILES[Number(cell[1] ?? 0)];
  const pad = size / 18, s = size - pad * 2, r = s * 0.15, x = px + pad, y = py + pad;
  c.shadowColor = `rgba(${C.shadow}, ${hot ? 0.55 : 0.4})`;
  c.shadowBlur = size * (hot ? 0.24 : 0.14);
  c.shadowOffsetY = size * (hot ? 0.14 : 0.08);
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(x, y, s, s, r);
  c.fill();
  c.shadowColor = 'transparent';
  const sheen = c.createLinearGradient(0, y, 0, y + s * 0.46); // luz desde arriba, como en la portada
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  c.fillStyle = sheen;
  c.beginPath();
  c.roundRect(x, y, s, s * 0.46, [r, r, 0, 0]);
  c.fill();
  c.fillStyle = 'rgba(0, 0, 0, 0.16)'; // canto inferior
  c.beginPath();
  c.roundRect(x, y + s * 0.93, s, s * 0.07, [0, 0, r, r]);
  c.fill();
  // Borde fino para que las fichas crema y arena no se pierdan sobre el tablero claro; la que cae lleva contorno de tinta
  c.strokeStyle = hot ? C.outline : `rgba(${C.shadow}, 0.3)`;
  c.lineWidth = hot ? Math.max(1.5, size / 16) : 1;
  c.beginPath();
  c.roundRect(x, y, s, s, r);
  c.stroke();
  c.fillStyle = ink;
  c.font = `700 ${size * 0.6}px "Jost Variable", system-ui, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(cell[0].toUpperCase(), px + size / 2, py + size / 2 + size * 0.04);
}

// --- Desintegrado: cada ficha se parte en cuadritos de PX que se apagan y se van volando ---
type Particle = { img: HTMLCanvasElement; sx: number; sy: number; x: number; y: number; delay: number; vx: number; vy: number };

function particles(gone: { ch: string; x: number; y: number }[]): Particle[] {
  return gone.flatMap(({ ch, x, y }) => {
    const img = document.createElement('canvas');
    img.width = img.height = Math.round(S * dpr);
    const ictx = img.getContext('2d')!;
    ictx.scale(dpr, dpr);
    tile(ictx, ch, 0, 0, S, false);
    const out: Particle[] = [];
    for (let sy = 0; sy < S; sy += PX)
      for (let sx = 0; sx < S; sx += PX)
        out.push({
          img, sx, sy, x: x * S + sx, y: y * S + sy,
          delay: Math.random() * 0.6, vx: (Math.random() - 0.3) * 28, vy: -Math.random() * 30,
        });
    return out;
  });
}

function dissolve(parts: Particle[], t: number) {
  for (const p of parts) {
    const k = (t - p.delay) / (1 - p.delay);
    if (k >= 1) continue;
    const d = Math.max(0, k);
    ctx.globalAlpha = 1 - d;
    ctx.drawImage(p.img, p.sx * dpr, p.sy * dpr, PX * dpr, PX * dpr, p.x + p.vx * d, p.y + p.vy * d, PX, PX);
  }
  ctx.globalAlpha = 1;
}

let started = false; // ya pasó la portada
let tense = false; // suena Psycho
let dict: Set<string> | null = null;
let g = newGame();
let playing: { steps: Step[]; i: number; t0: number; parts: Particle[] } | null = null;

// Sin `step` dibuja el estado actual; con `step`, ese tramo de la animación en el instante t (0 a 1)
function scene(step?: Step, t = 0) {
  ctx.clearRect(0, 0, W * S, H * S);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 1; x < W; x++) { ctx.moveTo(x * S, 0); ctx.lineTo(x * S, H * S); }
  for (let y = 1; y < H; y++) { ctx.moveTo(0, y * S); ctx.lineTo(W * S, y * S); }
  ctx.stroke();

  const moving = new Set(step?.type === 'fall' ? step.moves.map((m) => `${m.x},${m.to}`) : []);
  (step ?? g).board.forEach((row, y) =>
    row.forEach((ch, x) => ch && !moving.has(`${x},${y}`) && tile(ctx, ch, x * S, y * S, S, false)));
  if (step?.type === 'fall')
    for (const m of step.moves) tile(ctx, m.ch, m.x * S, (m.from + (m.to - m.from) * t * t) * S, S, false); // t²: acelera como al caer
  if (step?.type === 'clear') dissolve(playing!.parts, t);
  if (!step && !g.over) cells(g.piece).forEach(({ ch, x, y }) => tile(ctx, ch, x * S, y * S, S, true));
}

function hud() {
  const n = cells({ ...g.next, x: 0, y: 0 });
  const s = 26;
  const ox = (NEXT - (Math.max(...n.map((c) => c.x)) + 1) * s) / 2;
  const oy = (NEXT - (Math.max(...n.map((c) => c.y)) + 1) * s) / 2;
  nctx.clearRect(0, 0, NEXT, NEXT);
  n.forEach(({ ch, x, y }) => tile(nctx, ch, ox + x * s, oy + y * s, s, false));
  $('score').textContent = g.score.toLocaleString('es');
  $('threes').textContent = String(g.threes);
  $('threes').classList.toggle('spent', g.threes === 0);

  const high = stackHeight(g.board) >= TENSION_ROWS; // Psycho mientras la pila llegue a 5 filas; si baja, vuelve Gees
  if (started && high !== tense) {
    tense = high;
    if (high) music.tension();
    else music.calm();
  }
}

const veil = $('veil');
function showVeil(msg: string) {
  veil.hidden = !msg;
  $('veil-msg').textContent = msg;
}

async function wordCard(w: string) {
  const d = await define(w);
  if (!d) return; // sin definición (p. ej. falló la descarga) no hay tarjeta; el diccionario ya no trae palabras sin definición
  const text = d.word;
  const el = document.createElement('article');
  el.className = 'card';
  const word = document.createElement('div');
  word.className = 'word';
  word.setAttribute('role', 'img');
  word.setAttribute('aria-label', text);
  for (const ch of text) {
    const t = document.createElement('span');
    t.className = `t k${Math.floor(Math.random() * TILE_COLORS)}`; // mismos colores al azar que el tablero
    t.textContent = ch;
    word.append(t);
  }
  el.append(word);
  if (d.kind) {
    const kind = document.createElement('p');
    kind.className = 'kind';
    kind.textContent = d.kind;
    el.append(kind);
  }
  const def = document.createElement('p');
  def.className = 'def';
  def.textContent = d.text;
  el.append(def);

  const cards = $('cards');
  cards.prepend(el);
  while (cards.children.length > MAX_CARDS) cards.lastElementChild!.remove();
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 220); // no depende de animationend: con movimiento reducido no hay transición
  }, Math.min(6000, 2500 + d.text.length * 25)); // tiempo de lectura según el largo
}

const showWords = (words: string[]) =>
  [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, MAX_CARDS).forEach(wordCard);

// --- Reproduce el guion que dejó la lógica al fijar la pieza; mientras tanto no hay teclas ni caída ---
const duration = (s: Step) =>
  REDUCED ? 1 : s.type === 'clear' ? DISSOLVE_MS
    : Math.min(1000, Math.max(220, Math.max(...s.moves.map((m) => m.to - m.from)) * FALL_MS_PER_ROW));

// Reacción en cadena (como en Puyo Puyo): desde la segunda tanda, ficha roja con el multiplicador sobre el tablero
function showChain(n: number) {
  document.querySelectorAll('.chain').forEach((e) => e.remove()); // una cadena larga reemplaza a la anterior
  const el = document.createElement('div');
  el.className = 'chain';
  el.setAttribute('aria-hidden', 'true'); // el puntaje ya refleja el multiplicador
  el.textContent = `x${n}`;
  document.querySelector('.stage')!.append(el);
  setTimeout(() => el.remove(), 1100);
}

function begin(step: Step) {
  playing!.parts = step.type === 'clear' ? particles(step.cells) : [];
  if (step.type === 'clear' && step.chain >= 2) showChain(step.chain);
}

function frame(now: number) {
  const p = playing!;
  const step = p.steps[p.i];
  const t = Math.min(1, Math.max(0, (now - p.t0) / duration(step)));
  scene(step, t);
  if (t < 1) { requestAnimationFrame(frame); return; }
  if (step.type === 'clear') showWords(step.words);
  if (++p.i < p.steps.length) {
    p.t0 = now;
    begin(p.steps[p.i]);
    requestAnimationFrame(frame);
    return;
  }
  playing = null;
  render(); // estado final y, si perdió, la pantalla de fin
}

function render() {
  hud();
  if (g.steps.length) {
    playing = { steps: g.steps, i: 0, t0: performance.now(), parts: [] };
    g.steps = [];
    begin(playing.steps[0]);
    requestAnimationFrame(frame);
    return;
  }
  scene();
  if (g.over && veil.hidden) {
    showVeil('Fin del juego');
    setTimeout(toTitle, GAME_OVER_MS);
  }
}

// Perder devuelve a la portada: partida nueva detrás, la portada otra vez visible y la música del título
function toTitle() {
  started = false;
  tense = false;
  g = newGame();
  $('cards').replaceChildren();
  showVeil('');
  render();
  app.inert = true;
  cover.classList.remove('leaving');
  cover.hidden = false; // al mostrarse de nuevo, las fichas vuelven a caer
  startBtn.disabled = false;
  startBtn.focus({ preventScroll: true });
  music.toTitle();
}

addEventListener('keydown', (e) => {
  if (!dict || !started || playing || g.over) return;
  if (e.key === 'ArrowLeft') g.piece = move(g.board, g.piece, -1, 0);
  else if (e.key === 'ArrowRight') g.piece = move(g.board, g.piece, 1, 0);
  else if (e.key === 'ArrowDown') tick(g, dict);
  else if (e.key === 'ArrowUp') g.piece = rotate(g.board, g.piece);
  else if (e.key === ' ') hardDrop(g, dict);
  else return;
  (document.activeElement as HTMLElement | null)?.blur(); // un botón enfocado (silencio, tema) no debe activarse con Espacio
  e.preventDefault();
  render();
});

// --- Portada: Comenzar difumina la portada y cruza la música de Going_Back a Gees en INTRO_MS; luego cae el cartel
// de cómo se juega y la partida empieza con "Entendido, go!" ---
const cover = $('cover'), startBtn = $<HTMLButtonElement>('start'), app = $('app');
const howto = $('howto'), goBtn = $<HTMLButtonElement>('go');
const mute = $<HTMLButtonElement>('mute'), themeBtn = $<HTMLButtonElement>('theme');
music.intro();
startBtn.focus({ preventScroll: true }); // el juego es de teclado: Enter o Espacio empiezan
startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  cover.classList.add('leaving');
  music.toGame(INTRO_MS);
  setTimeout(() => {
    cover.hidden = true;
    howto.hidden = false; // el cartel cae desde arriba; el tablero sigue inerte y quieto
    goBtn.focus();
  }, INTRO_MS);
});
goBtn.addEventListener('click', () => {
  howto.hidden = true;
  app.inert = false;
  started = true;
});
mute.addEventListener('click', () => {
  const muted = music.toggleMute();
  mute.setAttribute('aria-pressed', String(muted));
  mute.setAttribute('aria-label', muted ? 'Activar música' : 'Silenciar música');
});
// Dark mode: solo cambia el fondo (variables de index.html); las fichas conservan sus colores
themeBtn.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  themeBtn.setAttribute('aria-pressed', String(dark));
  C = themeColors();
  if (!playing) scene(); // redibuja la rejilla y las sombras con los colores del tema
});

try {
  const res = await fetch(`${import.meta.env.BASE_URL}words.txt`);
  if (!res.ok) throw new Error(String(res.status));
  dict = new Set((await res.text()).split('\n'));
} catch {
  showVeil('No se pudo cargar el diccionario. Ejecuta: npm run words');
  throw new Error('words.txt no disponible');
}
showVeil('');
render();
setInterval(() => {
  if (started && !g.over && !playing) { tick(g, dict!); render(); }
}, TICK_MS);

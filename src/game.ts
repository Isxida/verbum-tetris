export const W = 10;
export const H = 18;
export const HELP_EVERY = 5;
export const START_THREES = 5; // palabras de 3 letras permitidas; después solo valen las de 4 o más
export const BONUS_LEN = 7; // una palabra de este largo o más regala una palabra de 3
export const TILE_COLORS = 7; // colores de ficha: --t0 … --t6 en index.html

// Celda del tablero: '' = vacío; si no, la letra y, opcionalmente, un dígito con el color de la ficha ("s3")
export type Board = string[][]; // [fila][columna]
export type Shape = 'I' | 'L' | 'T' | 'S' | 'Z';
export type Piece = { shape: Shape; letters: string[]; tint?: number[]; r: number; x: number; y: number };
export type Move = { ch: string; x: number; from: number; to: number };
// Guion de lo que ocurrió al fijar una pieza, para animarlo: cada paso trae el tablero resultante
export type Step =
  | { type: 'fall'; board: Board; moves: Move[] }
  | { type: 'clear'; board: Board; cells: { ch: string; x: number; y: number }[]; words: string[] };
export type Game = {
  board: Board; piece: Piece; next: Piece; made: number; score: number; threes: number; steps: Step[]; over: boolean;
};

// Desplazamientos [dx, dy] de cada letra, por orientación. En I, L y T las 3 primeras letras
// siempre se leen izq→der o arriba→abajo; la 4ª cuelga. S y Z van en zigzag (2 + 2).
export const SHAPES: Record<Shape, [number, number][][]> = {
  I: [[[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]]],
  L: [
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
  ],
  T: [
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[1, 0], [1, 1], [1, 2], [0, 1]],
    [[0, 1], [1, 1], [2, 1], [1, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 1]],
  ],
  S: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
  Z: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [1, 1], [0, 1], [0, 2]]],
};

// shortcut: pesos a ojo (español aproximado); afinar con la frecuencia real de letras del diccionario
const CONS = 'rrrrrssssnnnndddlllttcccmmppbbgvfhqzjñxy';
const VOWS = 'eeeeeaaaaaooooiiiuu';
const SHAPE_POOL: Shape[] = ['I', 'I', 'I', 'I', 'L', 'L', 'T', 'T', 'S', 'Z'];
const pick = <T>(a: ArrayLike<T>): T => a[Math.floor(Math.random() * a.length)];
const shuffled = <T>(a: T[]): T[] => a.map((v) => [Math.random(), v] as const).sort((p, q) => p[0] - q[0]).map(([, v]) => v);
export const isVowel = (ch: string) => 'aeiouáéíóúü'.includes(ch);

// Aparece ya en su posición de salida. Las letras alternan: CVC(+V) o VCV(+C); en T la 4ª alterna con la del centro.
export function randomPiece(shape: Shape = pick(SHAPE_POOL)): Piece {
  const vowel = Math.random() < 0.35 ? [true, false, true] : [false, true, false];
  if (shape !== 'I') vowel.push(!vowel[shape === 'T' ? 1 : 2]);
  const letters = vowel.map((v) => pick(v ? VOWS : CONS));
  const tint = letters.map(() => Math.floor(Math.random() * TILE_COLORS)); // el color es puro azar, no depende de consonante o vocal
  return { shape, letters, tint, r: 0, x: Math.floor((W - 3) / 2), y: 0 };
}

export const emptyBoard = (): Board => Array.from({ length: H }, () => Array(W).fill(''));
const copy = (b: Board): Board => b.map((row) => [...row]);

// Filas de alto de la pila: del piso a la letra más alta (0 con el tablero vacío)
export const stackHeight = (b: Board) => {
  const top = b.findIndex((row) => row.some(Boolean));
  return top < 0 ? 0 : H - top;
};

export const cells = (p: Piece) =>
  SHAPES[p.shape][p.r].map(([dx, dy], i) => ({ ch: p.letters[i] + (p.tint?.[i] ?? ''), x: p.x + dx, y: p.y + dy }));

export const fits = (b: Board, p: Piece) =>
  cells(p).every(({ x, y }) => x >= 0 && x < W && y >= 0 && y < H && !b[y][x]);

// Devuelve la misma pieza (misma referencia) si no cabe
export const move = (b: Board, p: Piece, dx: number, dy: number): Piece => {
  const q = { ...p, x: p.x + dx, y: p.y + dy };
  return fits(b, q) ? q : p;
};

// Al girar prueba desplazamientos para no fallar junto a paredes o sobre la pila
export const rotate = (b: Board, p: Piece): Piece => {
  const r = (p.r + 1) % SHAPES[p.shape].length;
  for (const dy of [0, -1, -2])
    for (const dx of [0, -1, 1, -2, 2]) {
      const q = { ...p, r, x: p.x + dx, y: p.y + dy };
      if (fits(b, q)) return q;
    }
  return p;
};

const dropped = (b: Board, p: Piece): Piece => {
  for (let q = move(b, p, 0, 1); q !== p; q = move(b, p, 0, 1)) p = q;
  return p;
};

type Hit = { word: string; at: [number, number][] };

// Cada fila (izq→der) y columna (arriba→abajo): en cada tramo de celdas llenas, la palabra más larga primero
export function findWords(b: Board, dict: Set<string>, minLen: number): Hit[] {
  const lines: [number, number][][] = [];
  for (let y = 0; y < H; y++) lines.push(Array.from({ length: W }, (_, x) => [x, y]));
  for (let x = 0; x < W; x++) lines.push(Array.from({ length: H }, (_, y) => [x, y]));

  const hits: Hit[] = [];
  for (const line of lines) {
    let run: [number, number][] = [];
    for (let i = 0; i <= line.length; i++) {
      const c = line[i]; // undefined al final de la línea: cierra el último tramo
      if (c && b[c[1]][c[0]]) { run.push(c); continue; }
      const used = new Set<number>();
      for (let len = run.length; len >= minLen; len--)
        for (let s = 0; s + len <= run.length; s++) {
          const part = run.slice(s, s + len);
          if (part.some((_, k) => used.has(s + k))) continue;
          const word = part.map(([cx, cy]) => b[cy][cx][0]).join(''); // solo la letra; el color no cuenta
          if (!dict.has(word)) continue;
          hits.push({ word, at: part });
          part.forEach((_, k) => used.add(s + k));
        }
      run = [];
    }
  }
  return hits;
}

// Cada letra colgando cae hasta apoyarse en otra o en el piso, rellenando los huecos de abajo
function gravity(b: Board): Move[] {
  const moves: Move[] = [];
  for (let x = 0; x < W; x++) {
    const col: { ch: string; y: number }[] = [];
    for (let y = 0; y < H; y++) if (b[y][x]) col.push({ ch: b[y][x], y });
    const top = H - col.length;
    col.forEach((c, i) => c.y !== top + i && moves.push({ ch: c.ch, x, from: c.y, to: top + i }));
    for (let y = 0; y < H; y++) b[y][x] = y >= top ? col[y - top].ch : '';
  }
  return moves;
}

// Asienta, borra palabras y repite (reacción en cadena); puntos = largo² × cadena.
// Con `threes` = 0 las palabras de 3 letras ya no cuentan; las de BONUS_LEN o más suman una.
export function resolve(b: Board, dict: Set<string>, threes: number) {
  const words: string[] = [];
  const steps: Step[] = [];
  let points = 0;
  for (let chain = 1; ; chain++) {
    const moves = gravity(b);
    if (moves.length) steps.push({ type: 'fall', board: copy(b), moves });
    const hits = findWords(b, dict, threes > 0 ? 3 : 4);
    if (!hits.length) return { words, points, threes, steps };
    const gone = new Map<string, { ch: string; x: number; y: number }>(); // un cruce de palabras comparte celda
    for (const h of hits) {
      words.push(h.word);
      points += h.word.length ** 2 * chain;
      for (const [x, y] of h.at) gone.set(`${x},${y}`, { ch: b[y][x], x, y });
    }
    for (const { x, y } of gone.values()) b[y][x] = '';
    threes = Math.max(0, threes - hits.filter((h) => h.word.length === 3).length)
      + hits.filter((h) => h.word.length >= BONUS_LEN).length;
    steps.push({ type: 'clear', board: copy(b), cells: [...gone.values()], words: hits.map((h) => h.word) });
  }
}

// ¿Alguna forma de dejar caer `p` completa al menos una palabra?
export function canScore(b: Board, p: Piece, dict: Set<string>, threes: number) {
  for (let r = 0; r < SHAPES[p.shape].length; r++)
    for (let x = 0; x < W; x++) {
      const q = { ...p, r, x, y: 0 };
      if (!fits(b, q)) continue;
      const sim = copy(b);
      for (const { ch, x: cx, y: cy } of cells(dropped(b, q))) sim[cy][cx] = ch;
      if (resolve(sim, dict, threes).words.length) return true;
    }
  return false;
}

// Palabras de 4 a 6 letras por largo (se construye una vez por diccionario)
const byLength = new WeakMap<Set<string>, Map<number, string[]>>();
function wordsOfLength(dict: Set<string>, n: number) {
  if (!byLength.has(dict)) {
    const idx = new Map<number, string[]>([[4, []], [5, []], [6, []]]);
    for (const w of dict) idx.get(w.length)?.push(w);
    byLength.set(dict, idx);
  }
  return byLength.get(dict)!.get(n) ?? [];
}

// 3 letras que, caídas en vertical sobre una columna, forman una palabra de 4 a 6 letras con las k de arriba de esa pila
function columnPiece(b: Board, dict: Set<string>, threes: number): Piece | null {
  const alternates = (s: string) => isVowel(s[0]) !== isVowel(s[1]) && isVowel(s[1]) !== isVowel(s[2]);
  for (const x of shuffled([...Array(W).keys()])) {
    const stack = b.map((row) => row[x]).filter(Boolean).join(''); // arriba→abajo; la gravedad la deja compacta
    if (stack.length > H - 3) continue; // sin espacio arriba para las 3 letras
    for (const k of shuffled([1, 2, 3])) {
      if (stack.length < k) continue;
      const tail = stack.slice(0, k);
      const options = wordsOfLength(dict, 3 + k).filter((w) => w.endsWith(tail) && alternates(w));
      for (const w of shuffled(options).slice(0, 5)) {
        const p = { ...randomPiece('I'), letters: [...w.slice(0, 3)] };
        if (canScore(b, p, dict, threes)) return p;
      }
    }
  }
  return null;
}

// Ayuda oculta: una pieza que de verdad forma palabra en el tablero actual
export function helpfulPiece(b: Board, dict: Set<string>, threes: number): Piece {
  const p = columnPiece(b, dict, threes);
  if (p) return p;
  if (threes > 0) // sin pila útil: 3 letras que ya son palabra; en vertical caen en cualquier columna libre
    for (let i = 0; i < 5000; i++) {
      const q = randomPiece('I');
      if (dict.has(q.letters.join(''))) return q;
    }
  return randomPiece();
}

export const newGame = (): Game => ({
  board: emptyBoard(), piece: randomPiece(), next: randomPiece(), made: 2, score: 0, threes: START_THREES,
  steps: [], over: false,
});

function land(g: Game, dict: Set<string>) {
  for (const { ch, x, y } of cells(g.piece)) g.board[y][x] = ch;
  const r = resolve(g.board, dict, g.threes);
  g.score += r.points;
  g.threes = r.threes;
  g.steps = r.steps;
  g.piece = g.next;
  g.made++;
  g.next = g.made % HELP_EVERY === 0 ? helpfulPiece(g.board, dict, g.threes) : randomPiece();
  if (!fits(g.board, g.piece)) g.over = true;
}

export function tick(g: Game, dict: Set<string>) {
  const q = move(g.board, g.piece, 0, 1);
  if (q === g.piece) land(g, dict);
  else g.piece = q;
}

export function hardDrop(g: Game, dict: Set<string>) {
  g.piece = dropped(g.board, g.piece);
  land(g, dict);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  H, HELP_EVERY, TILE_COLORS, W, SHAPES, canScore, cells, emptyBoard, findWords, hardDrop, helpfulPiece, isVowel, newGame,
  randomPiece, resolve, rotate, stackHeight, unlocked,
} from './game.ts';
import type { Board, Shape } from './game.ts';

const put = (b: Board, x: number, y: number, s: string, dir: 'h' | 'v' = 'h') =>
  [...s].forEach((ch, i) => (b[dir === 'h' ? y : y + i][dir === 'h' ? x + i : x] = ch));
const DICT = new Set(['sol', 'mar', 'pan', 'red', 'sal', 'mes', 'tos', 'dos', 'sed', 'pez', 'ala', 'oso']);

test('encuentra palabras en filas y en columnas (arriba→abajo)', () => {
  const b = emptyBoard();
  put(b, 2, H - 1, 'xsolx'); // "sol" dentro de un tramo con basura
  put(b, 0, H - 3, 'pan', 'v');
  const words = findWords(b, new Set(['sol', 'pan']), 3).map((h) => h.word).sort();
  assert.deepEqual(words, ['pan', 'sol']);
});

test('la palabra más larga gana y no se solapa con la corta', () => {
  const b = emptyBoard();
  put(b, 0, H - 1, 'sola');
  assert.deepEqual(findWords(b, new Set(['sol', 'sola']), 3).map((h) => h.word), ['sola']);
});

test('no lee al revés ni borra no-palabras', () => {
  const b = emptyBoard();
  put(b, 0, H - 1, 'los');
  assert.equal(findWords(b, new Set(['sol']), 3).length, 0);
});

test('borra, cae lo de arriba y encadena (puntos = largo² × cadena)', () => {
  const b = emptyBoard();
  put(b, 0, H - 1, 'ma'); // "man" no es palabra
  put(b, 2, H - 4, 'lpan', 'v'); // "pan" se borra y la "l" cae a completar "mal"
  const r = resolve(b, new Set(['pan', 'mal']), 5);
  assert.deepEqual(r.words, ['pan', 'mal']);
  assert.equal(r.points, 9 * 1 + 9 * 2);
  assert.ok(b.every((row) => row.every((c) => c === '')));
});

test('sin cupo de palabras de 3, solo cuentan las de 4 o más', () => {
  const b = emptyBoard();
  put(b, 0, H - 1, 'sol');
  put(b, 4, H - 1, 'casa');
  const r = resolve(b, new Set(['sol', 'casa']), 0);
  assert.deepEqual(r.words, ['casa']);
  assert.equal(b[H - 1][0], 's'); // "sol" se queda en el tablero
});

test('cada palabra de 3 gasta un cupo y una de 7 o más regala uno', () => {
  const a = emptyBoard();
  put(a, 0, H - 1, 'sol');
  assert.equal(resolve(a, new Set(['sol']), 5).threes, 4);
  const b = emptyBoard();
  put(b, 0, H - 1, 'caminos');
  assert.equal(resolve(b, new Set(['caminos']), 0).threes, 1);
  const c = emptyBoard();
  put(c, 0, H - 1, 'caminos');
  assert.equal(resolve(c, new Set(['caminos']), 3).threes, 4);
});

test('registra los pasos: caída de lo que cuelga y desintegrado de lo borrado', () => {
  const b = emptyBoard();
  put(b, 0, H - 1, 'sol');
  b[5][4] = 'x'; // flotando
  const r = resolve(b, new Set(['sol']), 5);
  assert.deepEqual(r.steps.map((s) => s.type), ['fall', 'clear']);
  const [fall, clear] = r.steps;
  assert.ok(fall.type === 'fall' && clear.type === 'clear');
  assert.deepEqual(fall.moves, [{ ch: 'x', x: 4, from: 5, to: H - 1 }]);
  assert.equal(clear.cells.length, 3);
  assert.deepEqual(clear.words, ['sol']);
});

test('la letra que cuelga cae a rellenar el hueco de abajo', () => {
  const g = newGame();
  g.piece = { shape: 'I', letters: ['b', 'c', 'd'], r: 0, x: 3, y: 0 };
  g.board[H - 1][3] = 'a';
  g.board[H - 1][5] = 'e'; // la pieza se apoya en 'a' y 'e'; la 'c' del medio queda colgando
  hardDrop(g, new Set());
  assert.deepEqual(g.board[H - 1].slice(3, 6), ['a', 'c', 'e']);
  assert.deepEqual(g.board[H - 2].slice(3, 6), ['b', '', 'd']);
});

test('girar junto a la pared empuja la pieza hacia dentro', () => {
  const p = rotate(emptyBoard(), { shape: 'I', letters: ['a', 'b', 'c'], r: 1, x: W - 1, y: 0 });
  assert.deepEqual([p.r, p.x], [0, W - 3]);
});

test('cada forma tiene celdas distintas, sin negativos, y el trío base se lee en orden', () => {
  for (const shape of Object.keys(SHAPES) as Shape[])
    SHAPES[shape].forEach((o, r) => {
      assert.equal(new Set(o.map(String)).size, o.length);
      assert.ok(o.every(([dx, dy]) => dx >= 0 && dy >= 0), `${shape}${r}`);
      if (shape === 'S' || shape === 'Z') return;
      const [a, b, c] = o;
      const step = [b[0] - a[0], b[1] - a[1]];
      assert.ok(step[0] + step[1] === 1 && c[0] - b[0] === step[0] && c[1] - b[1] === step[1], `${shape}${r}`);
    });
});

test('las letras alternan consonante/vocal (CVC o VCV, con 4ª que alterna)', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 400; i++) {
    const p = randomPiece();
    const kinds = p.letters.map((c) => (isVowel(c) ? 'V' : 'C')).join('');
    seen.add(p.shape + kinds.length + kinds.slice(0, 3));
    assert.equal(p.letters.length, SHAPES[p.shape][0].length);
    assert.match(kinds.slice(0, 3), /^(CVC|VCV)$/);
    if (p.letters.length === 4) assert.notEqual(kinds[p.shape === 'T' ? 1 : 2], kinds[3]);
  }
  assert.equal(seen.size, 10); // 5 formas × 2 patrones aparecen
});

test('cada ficha lleva un color al azar, independiente de ser consonante o vocal', () => {
  const seen = { V: new Set<number>(), C: new Set<number>() };
  for (let i = 0; i < 300; i++) {
    const p = randomPiece();
    assert.equal(p.tint?.length, p.letters.length);
    p.letters.forEach((ch, k) => {
      const t = p.tint![k];
      assert.ok(t >= 0 && t < TILE_COLORS);
      seen[isVowel(ch) ? 'V' : 'C'].add(t);
    });
  }
  assert.equal(seen.V.size, TILE_COLORS); // las vocales salen en todos los colores
  assert.equal(seen.C.size, TILE_COLORS); // y las consonantes también
});

test('las palabras se leen por letra aunque las celdas lleven color', () => {
  const b = emptyBoard();
  b[H - 1][0] = 's2';
  b[H - 1][1] = 'o5';
  b[H - 1][2] = 'l0';
  assert.deepEqual(findWords(b, new Set(['sol']), 3).map((h) => h.word), ['sol']);
  const r = resolve(b, new Set(['sol']), 5);
  const clear = r.steps.find((s) => s.type === 'clear');
  assert.ok(clear?.type === 'clear');
  assert.deepEqual(clear.cells.map((c) => c.ch), ['s2', 'o5', 'l0']); // al desintegrarse conservan su color
});

// Consonantes que salen con `words` palabras formadas, tras `n` piezas
const consonantsAt = (words: number, n: number) => {
  const out = new Set<string>();
  for (let i = 0; i < n; i++) for (const ch of randomPiece(undefined, words).letters) if (!isVowel(ch)) out.add(ch);
  return out;
};

test('sin palabras formadas solo salen las consonantes comunes', () => {
  const comunes = new Set('srncdtlmbpg');
  assert.deepEqual([...consonantsAt(0, 3000)].filter((c) => !comunes.has(c)), []);
  assert.deepEqual([...consonantsAt(3, 3000)].filter((c) => !comunes.has(c)), []); // h, f y v entran a las 4
});

test('cada consonante rara se desbloquea en su punto; K y W nunca salen', () => {
  assert.ok(!unlocked('h', 3) && unlocked('h', 4));
  assert.ok(!unlocked('z', 9) && unlocked('z', 10));
  assert.ok(!unlocked('ñ', 15) && unlocked('ñ', 16));
  assert.ok(!unlocked('x', 23) && unlocked('x', 24));
  assert.ok(unlocked('a', 0) && unlocked('s', 0));
  assert.ok(!unlocked('k', 999) && !unlocked('w', 999));
  const todas = consonantsAt(100, 20000);
  for (const c of 'hfvzjñyxq') assert.ok(todas.has(c), `${c} nunca salió con todo desbloqueado`);
  assert.ok(!todas.has('k') && !todas.has('w'));
});

test('la ayuda no usa letras que aún no se han desbloqueado', () => {
  const dict = new Set(['zeta', 'mesa']);
  const b = emptyBoard();
  b[H - 1][0] = 'a'; // pila "a": 3 letras + "a" forman una palabra de 4
  assert.equal(helpfulPiece(b, dict, 0, 0).letters.join(''), 'mes'); // la z todavía no puede salir
  const opciones = new Set<string>();
  for (let i = 0; i < 60; i++) opciones.add(helpfulPiece(b, dict, 0, 100).letters.join(''));
  assert.ok(opciones.has('zet')); // con la z desbloqueada sí es una opción
});

test('el juego cuenta las palabras formadas', () => {
  const g = newGame();
  g.piece = { shape: 'I', letters: ['s', 'o', 'l'], r: 0, x: 3, y: 0 };
  hardDrop(g, new Set(['sol']));
  assert.equal(g.words, 1);
});

test('cada 5ª pieza es la ayuda: puede completar una palabra en el tablero', () => {
  const g = newGame();
  g.made = HELP_EVERY - 1; // al fijar esta pieza se genera la nº HELP_EVERY
  hardDrop(g, DICT);
  assert.ok(canScore(g.board, g.next, DICT, g.threes));
});

test('con el cupo de 3 agotado, la ayuda completa una palabra de 4+ sobre una pila', () => {
  const dict = new Set(['rosas']);
  const b = emptyBoard();
  b[H - 2][0] = 'a';
  b[H - 1][0] = 's'; // pila "as" (arriba→abajo)
  const p = helpfulPiece(b, dict, 0);
  assert.equal(p.letters.join(''), 'ros');
  assert.ok(canScore(b, p, dict, 0));
});

test('stackHeight cuenta las filas desde el piso hasta la letra más alta', () => {
  const b = emptyBoard();
  assert.equal(stackHeight(b), 0);
  b[H - 1][4] = 'a';
  assert.equal(stackHeight(b), 1);
  b[H - 5][0] = 'b';
  assert.equal(stackHeight(b), 5);
});

test('termina cuando la siguiente pieza no cabe al aparecer', () => {
  const g = newGame();
  for (let y = 0; y < H; y++) put(g.board, 3, y, 'xxx'); // columnas 3-5 llenas hasta arriba
  hardDrop(g, new Set());
  assert.equal(g.over, true);
});

test('helpfulPiece sin diccionario útil no se cuelga y devuelve una pieza', () => {
  assert.ok(helpfulPiece(emptyBoard(), new Set(), 5).letters.length >= 3);
  assert.ok(cells(randomPiece()).length >= 3);
});

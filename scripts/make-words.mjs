// Lee el JSONL de Wiktextract UNA vez y genera:
//  - public/words.txt: una palabra por línea, minúsculas, sin tildes (se conserva la ñ), solo letras,
//    mínimo 3 letras. Incluye conjugaciones. Solo entran las palabras que tienen definición: cada palabra
//    que se forma muestra su significado, así que una sin definición no cuenta.
//  - public/defs/<prefijo>.json: { palabra: [tipo, definición, grafía con tildes si difiere] }, repartido
//    por prefijo (ver `shard`) para que el juego descargue solo el trozo que necesita.
// Uso: npm run words [-- <entrada.jsonl>]
import fs from 'node:fs';
import readline from 'node:readline';
import { shard } from '../src/defs.ts';

const input = process.argv[2] ?? 'dic_spa/raw-wiktextract-data.jsonl';
if (!fs.existsSync(input)) {
  console.error(`No existe ${input}`);
  process.exit(1);
}

// NFD separa la tilde; se borran todas las marcas menos la tilde de la ñ (U+0303)
const strip = (w) => w.normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC');
const clip = (s) => {
  s = s.replace(/\s+/g, ' ').trim();
  return s.length <= 200 ? s : s.slice(0, 200).replace(/\s\S*$/, '') + '…';
};

const defs = new Map(); // palabra → [tipo, definición, esFormaFlexionada, grafía original]
const rl = readline.createInterface({ input: fs.createReadStream(input), crlfDelay: Infinity });
for await (const line of rl) {
  const d = JSON.parse(line);
  if (d.lang_code !== 'es' || !/^[a-záéíóúüñ]+$/.test(d.word)) continue; // descarta mayúsculas, espacios y guiones
  const w = strip(d.word);
  if (w.length < 3) continue;
  const sense = d.senses?.find((s) => s.glosses?.[0]);
  const isForm = (d.tags ?? []).includes('form-of') || (sense?.tags ?? []).includes('form-of');
  const old = defs.get(w);
  if (old && !(old[2] && !isForm)) continue; // gana la primera; un lema reemplaza a una forma flexionada
  defs.set(w, [d.pos_title ?? '', sense ? clip(sense.glosses[0]) : '', isForm, d.word]);
}

if (defs.size === 0) {
  console.error('0 palabras: ¿es este el archivo correcto?');
  process.exit(1);
}
const withDef = [...defs].filter(([, v]) => v[1]);
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/words.txt', withDef.map(([w]) => w).sort().join('\n'));

const shards = new Map();
for (const [w, [tipo, def, , orig]] of withDef) {
  const k = shard(w);
  if (!shards.has(k)) shards.set(k, {});
  shards.get(k)[w] = orig === w ? [tipo, def] : [tipo, def, orig];
}
fs.rmSync('public/defs', { recursive: true, force: true }); // evita trozos viejos
fs.mkdirSync('public/defs', { recursive: true });
let bytes = 0;
for (const [k, obj] of shards) {
  const json = JSON.stringify(obj);
  bytes += json.length;
  fs.writeFileSync(`public/defs/${k}.json`, json);
}
console.log(`${withDef.length} palabras con definición -> public/words.txt (se descartaron ${defs.size - withDef.length} sin definición); definiciones: ${shards.size} archivos, ${(bytes / 1e6).toFixed(1)} MB`);

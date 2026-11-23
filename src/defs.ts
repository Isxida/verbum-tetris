// Las definiciones viven en public/defs/<prefijo>.json (las genera scripts/make-words.mjs, que importa
// este mismo `shard`). "des-" usa 4 letras porque ese prefijo con todas sus conjugaciones pesa 8 MB; el resto cabe en 3.
export const shard = (w: string) => w.slice(0, w.startsWith('des') ? 4 : 3).replace(/ñ/g, '_');

export type Def = { word: string; kind: string; text: string };

const cache = new Map<string, Promise<Record<string, string[]>>>();

// `word` va sin tildes (como en el tablero); devuelve la grafía real, el tipo y la definición, o null
export async function define(word: string): Promise<Def | null> {
  const k = shard(word);
  if (!cache.has(k))
    cache.set(
      k,
      fetch(`${import.meta.env.BASE_URL}defs/${k}.json`)
        .then((r) => r.json())
        .catch(() => {
          cache.delete(k); // un fallo de red no debe dejar ese prefijo sin definiciones toda la sesión
          return {};
        }),
    );
  const [kind, text, shown] = (await cache.get(k)!)[word] ?? [];
  return text ? { word: shown ?? word, kind, text } : null;
}

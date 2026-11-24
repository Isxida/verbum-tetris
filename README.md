# Tetris Floro

Un Tetris cuyas piezas son fichas con letras. Las apilas para formar palabras reales en español; al formarlas se desintegran y aparece su definición.

Se juega en el navegador, con teclado, en PC o laptop. En celulares y tablets solo se muestra un aviso.

## Cómo se juega

- El tablero mide 10 × 18. Las piezas son líneas, L, T, S y Z de 3 o 4 letras que alternan consonante y vocal, y cada ficha tiene un color al azar.
- Las consonantes raras (H, F, V, Z, J, Ñ, Y, X y Q) entran poco a poco a medida que formas palabras; K y W no salen.
- Las palabras se leen de izquierda a derecha y de arriba hacia abajo.
- Valen las palabras de 4 letras o más. Las de 3 letras solo cuentan mientras te queden de tus 5 oportunidades, y una palabra de 7 letras o más te regala una.
- Al borrarse una palabra, lo que está encima cae, y pueden encadenarse más palabras. Cada palabra suma su largo al cuadrado, multiplicado por el número de la cadena (x2, x3, x4…, como en Puyo Puyo), que aparece sobre el tablero.
- Si la pila llega arriba, pierdes y vuelves a la portada.

| Tecla | Acción |
|---|---|
| ← → | Mover |
| ↑ | Girar |
| ↓ | Bajar |
| Espacio | Caída directa |

Arriba a la derecha hay un botón de modo oscuro (cambia solo el fondo) y otro para silenciar la música.

La música son tres pistas de `mumumusic/`: `Going_Back` en la portada, `Gees` durante la partida y `Psycho` cuando la pila llega a 5 filas (entra desde el segundo 10).

## Para desarrollar

Necesitas Node 22.18 o superior (probado con Node 24).

```bash
npm install
npm run dev      # servidor de desarrollo de Vite
npm test         # pruebas de la lógica del juego
npm run build    # revisa tipos y genera dist/
```

El diccionario y las definiciones ya vienen en el repositorio (`public/words.txt` y `public/defs/`), así que no hace falta regenerarlos para trabajar en el juego.

## El diccionario

Sale de un volcado de [Wiktextract](https://github.com/tatuylonen/wiktextract) del Wikcionario en español (`raw-wiktextract-data.jsonl`, como el que publica kaikki.org). Pesa más de 1 GB, por eso no se versiona: va en `dic_spa/`.

```bash
npm run words                       # lee dic_spa/raw-wiktextract-data.jsonl
npm run words -- ruta/al/volcado.jsonl
```

El script lee el volcado una sola vez y genera:

- `public/words.txt`: una palabra por línea, en minúsculas y sin tildes (se conserva la ñ), de 3 letras o más. Incluye conjugaciones. Solo entran las palabras que tienen definición, porque cada palabra que se forma muestra su significado.
- `public/defs/`: las definiciones, repartidas en archivos pequeños por prefijo para que el navegador descargue solo el que necesita. El prefijo es de 3 letras (4 para "des-"), con `_` en lugar de la ñ y de los nombres que Windows reserva (`aux_`, `con_`, `nul_`, `prn_`). La función que decide el nombre está en `src/defs.ts` y la comparten el script y el juego.

## Estructura

| Ruta | Qué hay |
|---|---|
| `index.html` | Estilos y marcado: portada, tablero, cartel de cómo se juega y aviso para celulares |
| `src/main.ts` | Puerta de entrada: en pantallas táctiles no carga el juego |
| `src/app.ts` | Dibujo del tablero, animaciones, portada, tema y flujo de la partida |
| `src/game.ts` | Lógica pura del juego (sin DOM): piezas, palabras, gravedad, puntos |
| `src/music.ts` | Fundidos entre las pistas |
| `src/defs.ts` | Nombres de los archivos de definiciones y su descarga |
| `scripts/make-words.mjs` | Genera `public/words.txt` y `public/defs/` |
| `mumumusic/` | Las tres pistas |
| `PRODUCT.md`, `DESIGN.md` | Qué es el producto y su sistema de diseño |

## Despliegue

El `Dockerfile` construye el sitio con Node 22 y lo sirve con NGINX (`nginx.conf` activa la compresión gzip y el caché de los archivos con hash). El contenedor escucha en el puerto 80.

```bash
docker build -t tetris-floro .
docker run -p 8080:80 tetris-floro
```

En Dokploy: Build Type **Dockerfile** y puerto **80** en el dominio.

## Licencia

Este proyecto se publica bajo [Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.es); el texto completo está en [LICENSE](LICENSE). Puedes copiarlo, modificarlo y compartirlo, incluso con fines comerciales, citando la autoría y manteniendo la misma licencia.

Se eligió esa licencia porque las definiciones y el diccionario derivan del Wikcionario, que usa Creative Commons Atribución-CompartirIgual: lo que se construye sobre ese contenido debe compartirse igual.

Quedan fuera de esta licencia, y conservan la suya:

- Las pistas de `mumumusic/`: no tienen su licencia documentada aquí; confírmala antes de publicar.
- La tipografía [Jost](https://github.com/indestructible-type/Jost), servida con `@fontsource-variable/jost` (SIL Open Font License).

## Créditos

Las definiciones vienen del [Wikcionario](https://es.wiktionary.org/) y se extraen con [Wiktextract](https://github.com/tatuylonen/wiktextract).

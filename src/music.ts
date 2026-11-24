import going from '../mumumusic/Going_Back.mp3';
import gees from '../mumumusic/Gees.mp3';
import psycho from '../mumumusic/Psycho.mp3';

const LEVEL = 0.6; // volumen máximo de cada pista
const TENSION_START = 10; // Psycho entra desde el segundo 10, no desde el inicio

const track = (src: string, preload: 'auto' | 'none') => Object.assign(new Audio(src), { loop: true, volume: 0, preload });
const T = { intro: track(going, 'auto'), game: track(gees, 'auto'), tension: track(psycho, 'none') };
type Mode = keyof typeof T;

let mode: Mode = 'intro';
let muted = false;
const timers = new Map<HTMLAudioElement, number>();

// Sube o baja el volumen en `ms`; al llegar a 0 pausa (conserva la posición para retomarla)
function fade(a: HTMLAudioElement, to: number, ms: number) {
  clearInterval(timers.get(a));
  const from = a.volume, t0 = performance.now();
  if (to > 0 && a.paused) a.play().catch(() => {}); // sin gesto previo el navegador lo rechaza; intro() lo reintenta
  timers.set(a, window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    a.volume = from + (to - from) * k;
    if (k < 1) return;
    clearInterval(timers.get(a));
    if (to === 0) a.pause();
  }, 50));
}

// Fundido cruzado: la pista actual baja mientras sube la nueva. Si se invierte a mitad, parte del volumen actual.
function crossfadeTo(next: Mode, ms: number) {
  if (next === mode) return;
  if (next === 'tension') T.tension.currentTime = TENSION_START;
  fade(T[mode], 0, ms);
  fade(T[next], LEVEL, ms);
  mode = next;
}

export function intro() {
  fade(T.intro, LEVEL, 1500);
  // Los navegadores bloquean el audio hasta el primer clic o tecla: el primero lo arranca
  const unlock = () => mode === 'intro' && T.intro.paused && T.intro.play().catch(() => {});
  for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, unlock, { once: true });
}

export function toGame(ms: number) {
  crossfadeTo('game', ms);
  T.tension.preload = 'auto'; // que Psycho ya esté lista cuando haga falta
  T.tension.load();
}
export const tension = () => crossfadeTo('tension', 3000);
export const calm = () => crossfadeTo('game', 3000);
export const toTitle = () => crossfadeTo('intro', 2000); // al perder, vuelve la música de la portada

export function toggleMute() {
  muted = !muted;
  for (const a of Object.values(T)) a.muted = muted;
  return muted;
}

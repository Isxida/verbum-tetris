import '@fontsource-variable/jost'; // tipografía de todo (portada, juego y aviso); el navegador baja solo el subconjunto latino que se usa

// Solo PC o laptop: con puntero táctil (celulares y tablets) index.html muestra el aviso y no se carga el juego
// (ni diccionario, ni música); solo esta fuente.
if (!matchMedia('(hover: none) and (pointer: coarse)').matches) await import('./app.ts');

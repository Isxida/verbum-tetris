---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: title screen (cover) and the world it sets

Scope: the cover shown before the game, in `index.html` + `src/app.ts`. The owner then asked for the same world on the game scene: board tiles use the cover's palette in random colours (not tied to consonant/vowel), the ground is the cream tabletop, a "Dark mode" button next to the mute tile swaps only the ground to a dark warm brown, and touch-only devices (phones, tablets) get a "Sorry" notice instead of the game. Visitor mode: Experience (a game's front door; the artifact leads, the interface recedes).

Audience, job, action: a public desktop visitor with a keyboard. Job: recognise a Spanish word game, feel its craft, press "Comenzar". Proof/content: only the title, the single action, mute and dark-mode tiles. No taglines, no claims.

Constraints: keyboard operable; `prefers-reduced-motion` respected; the cover blurs/fades away over 5 s into the board while the music crossfades Going_Back -> Gees; the game does not start until the fade ends; touch devices download nothing of the game. World pinned by the owner's reference image (Scrabble-style specimen poster), recreated with our own title and without the Scrabble name or that image's text. The arc "INTRODUCING" eyebrow is deliberately left out. The owner approved the cover's tile look as it is ("me encanta"), so tile depth is not to be re-tuned without them.

The game is renamed Tetris Floro. After the 5 s dissolve a how-to card drops in from the top, in the same tile palette (CASA across, SOL down, the 5 three-letter chances, then 4+ letters) with a red "Entendido, go!" tile button; play starts only when it is pressed. Losing returns to this cover.

Memorable moment: the tiles settle into the crossword one by one, like pieces falling in the game; later the whole cover dissolves into the board.

Unresolved: music licensing/credits before public release.

## Direction contract

THESIS: The title is a crossword of wooden letter tiles, TETRIS crossing FLORO on a shared R, so the first screen already shows the mechanism: words built from tiles. Refuses the centered logo over a gradient with a glowing button.

OWN-WORLD: Cream tabletop ground. Rounded, bevelled tiles in terracotta, brown, clay, taupe, sand, cream and sage, dark-brown or cream ink chosen per tile for contrast, small point subscripts in the corner, soft offset-and-blur shadows. One geometric bold sans (Jost, self-hosted) for letters and UI. A single red blank tile is the action. Dark mode changes only the ground (warm dark brown); tiles keep their colours. Recognisable with all text removed: a bevelled-tile crossword on cream.

STORY: The visitor sees a tile word game, trusts its craft, presses Comenzar, and watches the cover melt into the board over 5 seconds as the music hands over.

FIRST VIEWPORT: A 6 x 5 crossword centred on the page, tile about 88 px at 1440 x 900: TETRIS on row 4, FLORO down column 4, R shared. Under it, one red tile-shaped button "Comenzar" about 3.5 tiles wide. Dark-mode and mute tiles top-right. Nothing else.

FORM: Experience; the user-pinned reference-image world (position on my list: n/a). seed: none (roll skipped: the owner's reference image pinned the direction)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

---
name: Tetris Floro
description: Spanish word-Tetris played on a cream tabletop with bevelled wooden letter tiles.
colors:
  ground: "#efe3c6"
  ground-hi: "#f8f1de"
  board: "#e6d9bb"
  panel: "#f8f0dc"
  edge: "#d2c29d"
  text: "#2e1d14"
  text-soft: "#4a362a"
  text-muted: "#6f5646"
  ground-dark: "#17120e"
  ground-hi-dark: "#2a221b"
  board-dark: "#211a15"
  panel-dark: "#2b231c"
  edge-dark: "#43372b"
  text-dark: "#f3e8d0"
  text-soft-dark: "#dccfb4"
  text-muted-dark: "#b3a38c"
  blank-red: "#b83a24"
  blank-red-ink: "#f7ecd3"
  tile-terracotta: "#9b4a27"
  tile-terracotta-ink: "#f7ecd3"
  tile-brown: "#7c5846"
  tile-brown-ink: "#f7ecd3"
  tile-clay: "#bf7e4f"
  tile-clay-ink: "#2e1d14"
  tile-taupe: "#b39a86"
  tile-taupe-ink: "#2e1d14"
  tile-sand: "#dfc79a"
  tile-sand-ink: "#2e1d14"
  tile-cream: "#efe0bd"
  tile-cream-ink: "#2e1d14"
  tile-sage: "#c5c9bb"
  tile-sage-ink: "#2e1d14"
  tool-tile: "#efe0bd"
  tool-tile-hover: "#f6ebd0"
  tool-tile-pressed: "#d3bd90"
typography:
  display:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "55px"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 650
    fontFeature: "tnum"
  body:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  tile-word: "5px"
  control: "8px"
  panel: "12px"
  board: "10px"
  tile-cover: "15% of tile side"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "22px"
  xl: "28px"
components:
  tile-cover:
    backgroundColor: "{colors.tile-terracotta}"
    textColor: "{colors.tile-terracotta-ink}"
    rounded: "{rounded.tile-cover}"
    typography: "{typography.display}"
  tile-word:
    backgroundColor: "{colors.tile-cream}"
    textColor: "{colors.tile-cream-ink}"
    rounded: "{rounded.tile-word}"
    size: "1.75rem"
  button-blank:
    backgroundColor: "{colors.blank-red}"
    textColor: "{colors.blank-red-ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  tool:
    backgroundColor: "{colors.tool-tile}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 14px"
  tool-hover:
    backgroundColor: "{colors.tool-tile-hover}"
  tool-pressed:
    backgroundColor: "{colors.tool-tile-pressed}"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "4px 16px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "12px 14px 14px"
---

# Design System: Tetris Floro

## Overview

**Creative North Star: "The Letter Tabletop"**

One world: a warm cream tabletop with bevelled wooden letter tiles in the manner of a Scrabble specimen poster, recreated under its own title. Everything that moves or can be read is either a tile or sits on the table beside one. The cover spells TETRIS across, crossing FLORO down on a shared R, as a crossword of tiles (5 rows by 6 columns) that settle in one by one; the game then reuses the same tile as the falling piece, the cleared-word card and the phone notice.

Density is calm. The board is the one large object, with a single narrow side panel; nothing competes with the tiles. Colour comes from the tiles and one red action; the table itself is neutral and warm, never white or black.

Two themes share the world. Light is the cream table. Dark is the same table at night: only ground, panels, text and shadows change; the tiles keep their colours and inks.

**Key Characteristics:**
- Bevelled tiles: top highlight, bottom inner edge, soft contact shadow.
- Seven earth tile colours, each paired with its own ink.
- One geometric sans (Jost Variable) at weights 600 to 700.
- One red blank-tile action.
- Cream tool tiles identical in both themes.

## Colors

Earth and wood on a cream ground, with one red accent. Hex is the source of truth in the frontmatter.

### Primary
- **Blank-Tile Red** (blank-red): the primary action only (Comenzar on the cover, Entendido, go! in the how-to dialog), like the red blank tile of the reference. Ink is Tile Cream Ink-light (blank-red-ink).

### Secondary (the seven letter tiles, order matches TILE_COLORS = 7 in game.ts, CSS --t0 to --t6)
- **Terracotta** (tile-terracotta), **Brown** (tile-brown): dark tiles, light ink (#f7ecd3).
- **Clay** (tile-clay), **Taupe** (tile-taupe), **Sand** (tile-sand), **Cream** (tile-cream), **Sage** (tile-sage): lighter tiles, dark ink (#2e1d14).
- Each tile colour is paired with its ink; never put another ink on a tile. In the game a tile's colour is random per letter; on the cover colours are assigned by hand.

### Neutral
- **Cream Table** (ground, ground-hi): page ground, a radial gradient from ground-hi at the centre (50% 36%) to ground at the edges.
- **Board Felt** (board), **Panel Paper** (panel), **Edge Tan** (edge): board background, panel and card fill, 1px borders.
- **Walnut Ink** (text), **Soft** (text-soft), **Muted** (text-muted): text roles. Muted is for labels, kinds, hints.
- Dark theme counterparts carry the `-dark` suffix (ground-dark, board-dark, panel-dark, edge-dark, text-dark and so on). Shadow colour switches from warm brown rgb(74,42,22) to black.
- **Tool Tile** (tool-tile, hover, pressed): the Dark mode and mute buttons; same in both themes so they read on any ground.

### Named Rules
**The Same Tiles Rule.** Theme switches change ground, panels, text and shadows only. Tile colours and inks never change between light and dark.
**The Paired Ink Rule.** Every tile colour travels with its ink token (`--tN` and `--tN-ink`); contrast is decided once, there.
**The One Red Rule.** Red is the blank-tile action. It is not used for tiles, errors or decoration.

## Typography

**Display Font:** Jost Variable (self-hosted via @fontsource-variable/jost; fallbacks Jost, system-ui, sans-serif)
**Body Font:** the same
**Label/Mono Font:** none; keys use Jost 600.

**Character:** Geometric, bold, a little poster-like; the letters on the tiles are the typography. A single family at different weights and sizes.

### Hierarchy
- **Display** (700, 0.6 of the tile side, line-height 1): letters on cover tiles (tile side clamp(44px, min(9.2vw, 10.4vh), 92px)); a small score subscript at 0.2 of the side, weight 600, bottom right of the tile.
- **Headline** (650, 1.5rem, -0.01em): game title in the side column.
- **Title** (650, 1.625rem, tabular numerals): score and 3-letter-word counter.
- **Body** (400, 1rem, 1.45): default text; hints at 0.9375rem; definitions 0.9375rem; labels 0.8125 to 0.9375rem; text-wrap pretty or balance on prose.
- **Label** (600, 0.875rem): tool buttons; veil message 1.125rem 600; board-word letters 1.05rem 700 uppercase.

### Named Rules
**The Tile Letter Rule.** Letters on tiles are bold (700) and uppercase; everything else stays weight 400 to 650.

## Layout

The page is a centred grid. On wide windows `main` is a three-column grid (`minmax(0,1fr) auto minmax(0,1fr)`, gap 28px, padding 20px, max-width 1400px): a left column for cleared-word cards, the board centred, and a 280px side column on the right (gap 22px) holding title, panel, hint and key legend. At 1080px and narrower `main` becomes a centred wrapping flex row and the word card returns to the centre of the board. At 720px and narrower everything stacks in one column with the side column at 360px. The cover is a fixed full-screen layer with the crossword (5 rows by 6 columns, gap 7% of tile side) above the action, gap 0.7 of tile side. Tools are fixed top right (16px inset, 10px gap). Touch devices (hover: none and pointer: coarse) get only the tile-spelled notice; the game, cover and tools are hidden.

## Elevation & Depth

Depth is physical and small: things are objects lying on a table. Tiles carry a bevel (inset white highlight on top, inset dark line below) plus a soft contact shadow; panels and cards use a border and a diffuse shadow. Nothing glows.

### Shadow Vocabulary
- **Tile bevel + contact** (`inset 0 0.03s 0 rgba(255,255,255,.45), inset 0 -0.05s 0 rgba(0,0,0,.16), 0 0.12s 0.14s -0.06s rgba(shadow,.5), 0 1px 2px rgba(shadow,.3)`, s = tile side): cover tiles and the red button. A 180deg white gradient (22% to 0 at 46%) sits over the tile colour.
- **Small tile** (`inset 0 -2px 0 rgba(0,0,0,.16), 0 2px 3px rgba(shadow,.3)`): word tiles in cards.
- **Control** (`inset 0 1px 0 rgba(255,255,255,.5), inset 0 -2px 0 rgba(0,0,0,.14), 0 6px 10px -4px rgba(shadow,.5)`): tool tiles and the how-to button.
- **Pressed tool** (`inset 0 2px 4px rgba(0,0,0,.28), 0 1px 2px rgba(shadow,.3)`): aria-pressed state.
- **Card** (`0 10px 28px rgba(shadow,.35)`): word card over the board.

### Named Rules
**The Lying-Flat Rule.** Shadows are soft and offset downward with negative spread; no hard offset shadows, no glow.

## Shapes

Soft-cornered rectangles. Tiles round at 15% of their side (cover) or 5px (word tiles); controls 8px; board 10px; panels and cards 12px. Borders are 1px edge tan. Everything is square-based; the tile is the unit of form.

## Components

### Cover Tile
Wooden letter tile, side set by the viewport, letter plus small score. Drops in with `settle` (0.6s, rotate -6deg, 85ms stagger).

### Buttons
- **Primary (blank tile):** Blank-Tile Red with the top highlight gradient, 600 weight, 0.02 to 0.03em tracking. Cover size is 3.6 x 0.9 tile sides; in the game 12px 22px at 8px radius.
- **Hover / Active:** lifts 1px (cover: 5% of a side) with brightness 1.07; presses down 1px.
- **Focus:** 3px outline in var(--text) (dark ink on light, cream on dark), offset 4 to 5px.

### Tool Tiles
Cream tiles, 44px high (square for icon-only), 8px radius, 600 weight 0.875rem, inline SVG icons 22px. Hover lightens and lifts 1px; pressed state is darker tan and inset. Focus outline is 3px red (#c4432c), offset 3px, readable on both grounds.

### Cards / Containers
Panel and card: panel fill, 1px edge border, 12px radius. The word card sits in the left column beside the board on wide windows (top aligned with the board, 24px off its left edge, 300px wide, cards stacked with 10px gap) so it never covers play; at 1080px and narrower it returns to the centre of the board. A card is shown only for words that have a definition. It spells the cleared word spelled in word tiles (1.75rem, 3px gap), the word class in muted 0.8125rem, the definition in soft 0.9375rem. Enters by `card-in` (0.26s, rises 10px), leaves by fading. It does not take pointer events.

### Board Tile (canvas)
Drawn in `tile()` in app.ts with the same bevel as the CSS tiles: fill from the CSS custom properties --t0 to --t6 with ink from --tN-ink, a white sheen over the top 46% (24% to 0), a darker bottom edge (rgba(0,0,0,.16), last 7%), radius 15% of the tile, and letters in Jost 700 at 0.6 of the tile side. Settled tiles carry a 1px hairline edge (rgba of --shadow-rgb at 0.3) and a soft shadow (blur 0.14, offset 0.08 of the tile). The falling piece swaps the hairline for an ink outline (--hot-outline, max(1.5px, size/16)) and a bigger shadow (blur 0.24, offset 0.14, alpha 0.55).

### Veil
Translucent ground-colour sheet over the board (90%) with a 1.125rem 600 message. On losing it shows "Fin del juego" for 2.2s with no button, then the game returns to the cover with a fresh game and the cover tiles replay their entrance. There is no restart button or key.

### How-to Dialog
A modal sheet (role dialog, aria-modal) shown after the cover's 5s dissolve, over a scrim of rgba(shadow-rgb, .45) at z-index 15. The card is the panel fill with a 1px edge border, 16px radius, max 440px, centred text, a 1.5rem 650 title and 1rem soft copy (the 5 three-letter chances, then words of 4+ letters). It drops in from above (`drop-in` 0.9s, the expo-out ease, from translateY(-70vh)). Inside, an example mini crossword of 46px tiles (CASA across, SOL down, sharing the S) uses the same tile classes and palette and settles after an 800ms delay. It ends in the primary red tile button, "Entendido, go!" (14px 28px, 1.0625rem). The board stays inert until that button is pressed. With reduced motion, the scrim, card and tile animations are off.

### Phone Notice
The cover's tile word, "SORRY", spelled in tiles at 44 to 64px, over the message in 1.375rem 600 and a muted subline.

### Motion
Ease is `cubic-bezier(0.16, 1, 0.3, 1)`. The cover leaves with a 5s opacity and 16px blur dissolve. All animation is removed under prefers-reduced-motion.

## Do's and Don'ts

### Do:
- **Do** build every new surface from tiles on the cream table; take letters, colours and inks from the seven tile pairs.
- **Do** keep tool tiles the same in both themes and the tile colours the same in both themes.
- **Do** use Jost Variable only, bold on tiles.
- **Do** give interactive tiles a visible 3px focus outline and a reduced-motion fallback.

### Don't:
- **Don't** re-tune the cover tile look (bevel, gradient, radius, shadow) without the owner; they approved it.
- **Don't** add a second accent next to Blank-Tile Red or colour tiles outside the seven.
- **Don't** use hard offset shadows, glows, pure white or pure black grounds, or a second typeface.

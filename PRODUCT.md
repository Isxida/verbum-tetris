# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Public visitors on the web, on a desktop or laptop with a keyboard (confirmed by the owner). Spanish speakers who like word games. Mobile and touch are out of scope for now: the game is keyboard-only.

## Product Purpose

Verbum Tetris is a Tetris whose falling pieces are letter tiles. Players stack them to spell real Spanish words; spelled words disintegrate and the player sees the word with its dictionary definition. Success is a player who keeps playing and reads the definitions.

## Positioning

The pieces are letters (consonant-vowel-consonant or vowel-consonant-vowel) and the clear condition is a real Spanish word from a Wiktionary-derived dictionary of 676,216 words, conjugations included. Only words that have a definition are in it, because every cleared word shows its meaning. A block-clearing Tetris with no letters, or a word game with no falling pieces, cannot claim this.

## Operating Context

Played in a desktop browser with the keyboard. Music plays (browsers block autoplay until the first click or key press). The dictionary and the definitions are generated offline from a Wiktextract dump by `npm run words`; the dump itself is not in git.

## Capabilities and Constraints

- Words read left to right or top to bottom. Minimum 4 letters; 3-letter words only while a counter of 5 lasts, and a word of 7 letters or more gives one back.
- Hidden mechanic: every 5th piece is an assist that completes a word. The player is never told about it; it must read as part of the game's logic.
- Cleared letters make the ones above fall (cell gravity), with chain reactions.
- Music: three tracks in `mumumusic/` (Going_Back for the title, Gees in play, Psycho when the stack reaches 5 rows, back to Gees if it drops below 5).
- Undecided: licensing and credits of the music tracks before public release; touch controls.

## Brand Commitments

- Name: Verbum Tetris. UI language: Spanish.
- The title screen recreates the look of a reference image the owner supplied (a Scrabble-style specimen poster: wooden letter tiles on cream, crossword layout). The Scrabble name and that image's own text are not used.

## Evidence on Hand

- Music: `mumumusic/Going_Back.mp3`, `Gees.mp3`, `Psycho.mp3`.
- Dictionary data generated into `public/words.txt` and `public/defs/`.
- Reference image for the title screen (owner-supplied, outside the repo).
- No logo, no screenshots, no player testimonials or numbers exist; none may be invented.

## Product Principles

- The letters are the interface: tiles are the one visual vocabulary of the game.
- Show the word and its meaning at the moment it is earned.
- The assist is invisible; never explain or flag it.
- Difficulty comes from rules (word length, the 3-letter counter), not from hiding information.

## Accessibility & Inclusion

Keyboard-only play. Music must have a visible mute control. Respect `prefers-reduced-motion`. Text and tile letters keep at least WCAG AA contrast (3:1 for large text).

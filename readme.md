# Loopstack: Escape from Alden Labs

A browser-based surrealist sci-fi platformer concept. Play as Juno, a junior
archivist navigating a glitching research facility fragmented across time and
media.

## Setting

The game takes place at the Alden Institute for Temporal Media and Experimental
Archives, located at 3100 Alden Drive. The brutalist-meets-neofuturist complex
features a spire that tracks the sun, retractable copper sunshades shaped like
timecode symbols, and a countdown above the door that never reaches zero. The
interior includes a lobby filled with looping LED murals, a basement archive of
obsolete media formats, and edit bays named after dead philosophers.

## Lab 32: Popsicle Reconstitution

In Bay 3B, melted popsicles undergo a six-phase journey from slush to sentience
inspired by the procedures of Lab 32. Samples are collected, crystallized,
scaffolded onto memory-anchored sticks, refrozen with sonic nostalgia pulses,
calibrated by mechanical tasters, then either archived or recycled into the
Primordial Slush.

## Getting Started

1. Clone this repository.
2. Open `index.html` in a modern browser or serve it with a local static
   server.
3. Use the arrow keys to move and jump.
4. Press `Z` for fire shots and `X` for ice shots.

## Features

- Side-view movement with jumping and collision.
- Layered backgrounds with parallax depth.
- Basic physics including gravity, friction, and camera follow.
- Simple room layout for movement testing.
- Script-driven platforms generated from `script.txt` lines.
- Popsicle enemies that progress through Lab 32's reconstitution phases.
- Flavor-based weaknesses and dripping attacks with particle effects.
- Video format modes (Betamax, 8mm, MPEG2, MiniDV) altering visuals and
  physics; press number keys 1–4 to switch.
- Collectible codec items with compatibility rules.
- Fuse codecs to unlock doors or trigger hallucinations.
- Puzzle combinations yield unique effects or spectacular failures.
- Timecode HUD displaying playback integrity and energy levels.
- Playback integrity decays when hit or during codec glitches.
- Final level concept where the player scrubs footage to fix the timeline.

## Format Modes

Switch between media styles for different looks and physics tweaks:

1 - Betamax: sepia filter with heavier gravity.
2 - 8mm: grainy monochrome and slower movement.
3 - MPEG2: vibrant colors with baseline physics.
4 - MiniDV: bright, high-contrast visuals and lighter gravity.

## Project Structure

- `index.html` – entry point for the game.
- `main.js` – main game logic and prototype scene.
- `config.js` – configuration settings.
- `script.txt` – lines used to build text platforms.

## Contributing

Pull requests are welcome. Before submitting, run `npm test` to execute any
available checks.

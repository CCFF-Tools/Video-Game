# Loopstack: Escape from Alden Labs

A browser-based surrealist sci-fi platformer concept. Play as Juno, a junior
archivist navigating a glitching research facility fragmented across time and
media.

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
- Popsicle enemies with melting, freezing, and reforming states.
- Flavor-based weaknesses and dripping attacks with particle effects.

## Project Structure

- `index.html` – entry point for the game.
- `main.js` – main game logic and prototype scene.
- `config.js` – configuration settings.
- `script.txt` – lines used to build text platforms.

## Contributing

Pull requests are welcome. Before submitting, run `npm test` to execute any
available checks.

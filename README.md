# MYOB Endless Runner Mini-Game

This is a retro-themed endless runner game built using HTML5 Canvas and vanilla JavaScript. The game features a 90s pixel art aesthetic and is inspired by classic platformers like Mario and Flappy Bird. The theme combines MYOB Business branding with a fun and engaging gameplay experience.

## Features
- **Endless Runner Gameplay**: The player auto-runs and can jump to collect coins and avoid obstacles.
- **Retro Aesthetic**: 16-bit pixel art style with MYOB brand colors.
- **Score Tracking**: Keep track of your score as you collect coins.
- **Difficulty Progression**: The game gradually increases in speed over time.
- **Power-Up Mechanic**: Collect 20 coins to activate a temporary speed boost and sprite change.

## How to Play
1. **Controls**:
   - Press the `Spacebar` or `Arrow Up` key to jump.
   - Avoid enemies and collect coins to increase your score.
2. **Objective**:
   - Survive as long as possible while collecting coins and avoiding obstacles.
   - Activate the "MYOB Business Power-Up" by collecting 20 coins.

## How to Run the Game
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd cursor-coding-challenge1
   ```
2. **Start a Local Server**:
   Since the game uses JavaScript and assets, you need a local server to run it. Use the following command:
   ```bash
   python3 -m http.server
   ```
   This will start a local server on port 8000.
3. **Open the Game in a Browser**:
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```
4. **Play the Game**:
   - Use the `Spacebar` or `Arrow Up` key to jump.
   - Collect coins, avoid enemies, and enjoy the game!

## File Structure
```
index.html       # Main HTML file
style.css        # CSS for styling the game
main.js          # JavaScript logic for the game
assets/          # Folder containing game assets
  bg.jpg         # Background image
  coin.jpg       # Coin sprite
  enemy.jpg      # Enemy sprite
  player.jpg     # Player sprite
```

## Known Issues
- If the game assets fail to load, placeholder graphics will be used.
- Ensure the browser supports HTML5 Canvas for optimal performance.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Inspired by classic platformer games.
- MYOB branding and theme integration.

// MYOB Endless Runner Game
// Author: [Your Name]
// 90s retro endless runner with MYOB theme

// --- Constants ---
const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;
const GROUND_Y = GAME_HEIGHT - 48;
const GRAVITY = 0.5; // Reduced gravity for a more gradual descent
const JUMP_VELOCITY = -12; // Slightly reduced for smoother jump arc
const MAX_JUMP_COUNT = 2; // Allow double jumps
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 45;
const COIN_SIZE = 20;
const ENEMY_SIZE = 22;
const BG_SPEED = 2;
const INITIAL_SPEED = 2; // Reduced from 4 to 2 for a slower start
const SPEED_INCREMENT = 0.2; // Reduced from 0.5 to 0.2 for gradual increase
const DIFFICULTY_INTERVAL = 15; // seconds
const POWERUP_DURATION = 10000; // ms
const COINS_FOR_POWERUP = 20;
const FPS = 60;

// --- Asset Placeholders (use rectangles if images not loaded) ---
const assets = {
  bg: null,
  player: null,
  coin: null,
  enemy: null
};

// --- Game State ---
let canvas, ctx;
let scale = 1;
let lastTimestamp = 0;
let gameState = 'start'; // start, running, powerup, gameover
let player, coins, enemies, bgX, score, speed, coinCount, powerupTimer, difficultyTimer;

// --- Utility Functions ---
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Asset Loading ---
function loadAssets(callback) {
  let loaded = 0, total = 4;
  function onLoad() { if (++loaded === total) callback(); }
  // Background
  assets.bg = new Image();
  assets.bg.src = 'assets/bg.jpg';
  assets.bg.onload = onLoad;
  assets.bg.onerror = onLoad;
  // Player
  assets.player = new Image();
  assets.player.src = 'assets/player.png';
  assets.player.onload = onLoad;
  assets.player.onerror = onLoad;
  // Coin
  assets.coin = new Image();
  assets.coin.src = 'assets/coin.png';
  assets.coin.onload = onLoad;
  assets.coin.onerror = onLoad;
  // Enemy
  assets.enemy = new Image();
  assets.enemy.src = 'assets/enemy.png';
  assets.enemy.onload = onLoad;
  assets.enemy.onerror = onLoad;
}

// --- Game Object Constructors ---
// Adjust the player's y-position to bring it lower
function createPlayer() {
  return {
    x: 60,
    y: GROUND_Y - PLAYER_HEIGHT + 10, // Lowered by 5 more units
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    jumping: false,
    powerup: false,
    jumpCount: 0 // Track jump count for double jumps
  };
}

function createCoin() {
  return {
    x: GAME_WIDTH + randInt(0, 100),
    y: GROUND_Y - COIN_SIZE - randInt(0, 60),
    size: COIN_SIZE,
    collected: false
  };
}

function createEnemy() {
  return {
    x: GAME_WIDTH + randInt(0, 100),
    y: GROUND_Y - ENEMY_SIZE,
    size: ENEMY_SIZE,
    passed: false
  };
}

// --- Game Initialization ---
function resetGame() {
  player = createPlayer();
  coins = [];
  enemies = [];
  bgX = 0;
  score = 0;
  speed = INITIAL_SPEED;
  coinCount = 0;
  powerupTimer = 0;
  difficultyTimer = 0;
  gameState = 'running';
}

// --- Input Handling ---
function handleKeyDown(e) {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && player.jumpCount < MAX_JUMP_COUNT && gameState === 'running') {
    player.vy = JUMP_VELOCITY;
    player.jumping = true;
    player.jumpCount++;
  }
  if (gameState === 'gameover' && (e.code === 'Space' || e.code === 'Enter')) {
    resetGame();
  }
}
function handleMouseDown() {
  if (gameState === 'gameover') resetGame();
}

// --- Game Loop ---
function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}

// --- Update Logic ---
function update(delta) {
  if (gameState === 'start') return;
  if (gameState === 'gameover') return;

  // Difficulty progression
  difficultyTimer += delta;
  if (difficultyTimer > DIFFICULTY_INTERVAL * 1000) {
    speed += SPEED_INCREMENT; // Gradually increase speed
    difficultyTimer = 0;
  }

  // Background scroll
  bgX -= BG_SPEED;
  if (bgX <= -GAME_WIDTH) bgX = 0;

  // Player physics
  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y >= GROUND_Y - player.height) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.jumping = false;
    player.jumpCount = 0; // Reset jump count when player lands
  }

  // Power-up logic
  if (gameState === 'powerup') {
    powerupTimer -= delta;
    if (powerupTimer <= 0) {
      player.powerup = false;
      gameState = 'running';
      speed -= 2;
    }
  }

  // Spawn coins
  if (coins.length < 2 && Math.random() < 0.03) {
    coins.push(createCoin());
  }
  // Spawn enemies
  if (enemies.length < 2 && Math.random() < 0.025) {
    enemies.push(createEnemy());
  }

  // Update coins
  for (let coin of coins) {
    coin.x -= speed;
    // Collision with player
    if (!coin.collected && rectsCollide(player, coin)) {
      coin.collected = true;
      score += 10;
      coinCount++;
      // Power-up trigger
      if (coinCount % COINS_FOR_POWERUP === 0) {
        gameState = 'powerup';
        player.powerup = true;
        powerupTimer = POWERUP_DURATION;
        speed += 2;
      }
    }
  }
  // Remove off-screen or collected coins
  coins = coins.filter(c => c.x + c.size > 0 && !c.collected);

  // Update enemies
  for (let enemy of enemies) {
    enemy.x -= speed;
    // Collision with player
    if (rectsCollide(player, enemy)) {
      gameState = 'gameover';
    }
  }
  // Remove off-screen enemies
  enemies = enemies.filter(e => e.x + e.size > 0);
}

// --- Drawing Logic ---
function drawPlayer(ctx, x, y, width, height, powerup) {
  if (assets.player && assets.player.complete) {
    ctx.filter = 'brightness(1.5)'; // Increase brightness
    ctx.drawImage(assets.player, x, y, width, height);
    ctx.filter = 'none'; // Reset filter
  } else {
    // Fallback: Draw a placeholder rectangle if the image is not loaded
    ctx.fillStyle = powerup ? '#ffeb3b' : '#8e24aa';
    ctx.fillRect(x, y, width, height);
  }
}

function drawCoin(ctx, x, y, size) {
  if (assets.coin && assets.coin.complete) {
    ctx.filter = 'brightness(1.5)'; // Increase brightness
    ctx.drawImage(assets.coin, x, y, size, size);
    ctx.filter = 'none'; // Reset filter
  } else {
    // Fallback: Draw a placeholder circle if the image is not loaded
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawEnemy(ctx, x, y, size) {
  if (assets.enemy && assets.enemy.complete) {
    ctx.filter = 'brightness(1.5)'; // Increase brightness
    ctx.drawImage(assets.enemy, x, y, size, size);
    ctx.filter = 'none'; // Reset filter
  } else {
    // Fallback: Draw a placeholder rectangle if the image is not loaded
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(x, y, size, size);
  }
}

function draw() {
  // Scale canvas to window
  resizeCanvas();

  // Draw background (looping)
  for (let i = 0; i < 2; i++) {
    if (assets.bg && assets.bg.complete) {
      ctx.drawImage(assets.bg, bgX + i * GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
      // Placeholder: purple skyline
      ctx.fillStyle = '#6f2da8';
      ctx.fillRect(bgX + i * GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT - 48);
      ctx.fillStyle = '#fff';
      ctx.fillRect(bgX + i * GAME_WIDTH, GAME_HEIGHT - 48, GAME_WIDTH, 48);
    }
  }

  // Draw ground
  ctx.fillStyle = '#b39ddb';
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 48);

  // Draw player
  drawPlayer(ctx, player.x, player.y, player.width, player.height, player.powerup);

  // Draw coins
  for (let coin of coins) {
    drawCoin(ctx, coin.x, coin.y, coin.size);
  }

  // Draw enemies
  for (let enemy of enemies) {
    drawEnemy(ctx, enemy.x, enemy.y, enemy.size);
  }

  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`Score: ${score}`, 16, 32);

  // Power-up indicator
  if (gameState === 'powerup') {
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('MYOB BUSINESS POWER-UP!', 100, 60);
  }

  // Game over screen
  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(26,0,51,0.8)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('GAME OVER', 120, 110);
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`Final Score: ${score}`, 140, 150);
    ctx.font = '16px monospace';
    ctx.fillText('Press Space/Enter or Click to Restart', 70, 200);
  }
}

// --- Collision Detection ---
function rectsCollide(a, b) {
  return (
    a.x < b.x + (b.size || b.width) &&
    a.x + a.width > b.x &&
    a.y < b.y + (b.size || b.height) &&
    a.y + a.height > b.y
  );
}

// --- Canvas Resize ---
function resizeCanvas() {
  // Fit canvas to window, keep aspect ratio
  const w = window.innerWidth;
  const h = window.innerHeight;
  scale = Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);
  canvas.width = GAME_WIDTH * scale;
  canvas.height = GAME_HEIGHT * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

// --- Main Entry Point ---
window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('mousedown', handleMouseDown);

  loadAssets(() => {
    resetGame();
    requestAnimationFrame(gameLoop);
  });
};
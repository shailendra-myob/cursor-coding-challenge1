// MYOB Endless Runner Game
// Author: [Your Name]
// 90s retro endless runner with MYOB theme

// --- Constants ---
const GAME_WIDTH = 480;
const GAME_HEIGHT = 270;
const GROUND_Y = GAME_HEIGHT - 48;
const GRAVITY = 0.7;
const JUMP_VELOCITY = -12;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 40;
const COIN_SIZE = 20;
const ENEMY_SIZE = 32;
const BG_SPEED = 2;
const INITIAL_SPEED = 4;
const SPEED_INCREMENT = 0.5;
const DIFFICULTY_INTERVAL = 15; // seconds
const POWERUP_DURATION = 10000; // ms
const COINS_FOR_POWERUP = 20;
const FPS = 60;

// --- Asset Placeholders (use rectangles if images not loaded) ---
const assets = {
  player: null,
  coin: null,
  enemy: null,
  bg: null
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
  // Player
  assets.player = new Image();
  assets.player.src = 'assets/player.jpg';
  assets.player.onload = onLoad;
  assets.player.onerror = onLoad;
  // Coin
  assets.coin = new Image();
  assets.coin.src = 'assets/coin.jpg';
  assets.coin.onload = onLoad;
  assets.coin.onerror = onLoad;
  // Enemy
  assets.enemy = new Image();
  assets.enemy.src = 'assets/enemy.jpg';
  assets.enemy.onload = onLoad;
  assets.enemy.onerror = onLoad;
  // Background
  assets.bg = new Image();
  assets.bg.src = 'assets/bg.jpg';
  assets.bg.onload = onLoad;
  assets.bg.onerror = onLoad;
}

// --- Game Object Constructors ---
function createPlayer() {
  return {
    x: 60,
    y: GROUND_Y - PLAYER_HEIGHT,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    jumping: false,
    sprite: assets.player,
    powerup: false
  };
}

function createCoin() {
  return {
    x: GAME_WIDTH + randInt(0, 100),
    y: GROUND_Y - COIN_SIZE - randInt(0, 60),
    size: COIN_SIZE,
    sprite: assets.coin,
    collected: false
  };
}

function createEnemy() {
  return {
    x: GAME_WIDTH + randInt(0, 100),
    y: GROUND_Y - ENEMY_SIZE,
    size: ENEMY_SIZE,
    sprite: assets.enemy,
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
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !player.jumping && gameState === 'running') {
    player.vy = JUMP_VELOCITY;
    player.jumping = true;
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
    speed += SPEED_INCREMENT;
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
  if (assets.player && assets.player.complete) {
    ctx.save();
    if (player.powerup) ctx.globalAlpha = 0.7;
    ctx.drawImage(assets.player, player.x, player.y, player.width, player.height);
    ctx.restore();
  } else {
    ctx.fillStyle = player.powerup ? '#ffeb3b' : '#8e24aa';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // Draw coins
  for (let coin of coins) {
    if (assets.coin && assets.coin.complete) {
      ctx.drawImage(assets.coin, coin.x, coin.y, coin.size, coin.size);
    } else {
      ctx.fillStyle = '#d1c4e9';
      ctx.beginPath();
      ctx.arc(coin.x + coin.size / 2, coin.y + coin.size / 2, coin.size / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#6f2da8';
      ctx.stroke();
    }
  }

  // Draw enemies
  for (let enemy of enemies) {
    if (assets.enemy && assets.enemy.complete) {
      ctx.drawImage(assets.enemy, enemy.x, enemy.y, enemy.size, enemy.size);
    } else {
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('TAX', enemy.x + 4, enemy.y + 20);
    }
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
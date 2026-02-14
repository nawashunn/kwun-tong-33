window.__hoiwaBootReady = true;

const overlay = document.getElementById("overlay");
const hud = document.getElementById("hud");
const gameOverPanel = document.getElementById("gameOver");
const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverText = document.getElementById("gameOverText");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const openCreditsBtn = document.getElementById("openCreditsBtn");
const closeCreditsBtn = document.getElementById("closeCreditsBtn");
const creditsPanel = document.getElementById("creditsPanel");
const mobileControls = document.getElementById("mobileControls");
const touchHolyBtn = document.getElementById("touchHoly");
const reticle = document.getElementById("reticle");
const overlayTitle = document.getElementById("overlayTitle");
const overlayWarn = overlay.querySelector(".warn");
const bootStatus = document.getElementById("bootStatus");
const dayStoryEl = document.getElementById("dayStory");

const healthEl = document.getElementById("health");
const waveEl = document.getElementById("wave");
const remainingEl = document.getElementById("remaining");
const holyWaterEl = document.getElementById("holyWater");
const isMobileTouch = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || navigator.maxTouchPoints > 0;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

const keys = {};
let gameActive = false;
let gameEnded = false;

let health = 100;
let score = 0;
let wave = 1;
const maxDays = 5;
let totalGhostsThisWave = 0;
let spawnedInWave = 0;
let deadInWave = 0;
let spawnAcc = 0;
let bossSpawned = false;
let bossDefeated = false;

let lookReady = false;
let lastLookX = 0;
let lastLookY = 0;
let activeTouchLookId = null;
let lookPitch = 0;

const projectiles = [];
let fireCooldown = 0;
let handKick = 0;
const projectileSpeed = 14;
const deathGreetings = [];
const cnyGreetings = [
  "新年快樂",
  "恭喜發財",
  "萬事如意",
  "財源廣進",
  "吉星高照",
  "龍馬精神",
  "步步高升",
  "心想事成",
  "花開富貴",
  "歲歲平安",
  "大吉大利",
  "金玉滿堂",
  "事事順利",
  "福星高照",
  "身體健康",
  "出入平安",
  "年年有餘",
  "鴻運當頭",
  "一帆風順",
  "闔家安康",
];
const holyWaterScoreStep = 800;
const supplyDropUnlockHits = 3;
const ghostCountByWave = [0, 8, 10, 10, 12, 14];
const ghostHpByWave = [0, 4, 6, 7, 8, 9];
const mobileDifficultyScale = isMobileTouch ? 0.88 : 1;
let holyWaterCharges = 0;
let nextHolyWaterScore = holyWaterScoreStep;
let holyWaterBlastTime = 0;
let jesusProtectionTime = 0;
const jesusProtectionDuration = 10;
let supplyFlashTime = 0;
let damageFlashTime = 0;
let screenShakeTime = 0;
let planeActive = false;
let planeX = -0.2;
let planeDir = 1;
let planeSpeed = 0.24;
let planeDropDone = false;
let planeCooldown = 8 + Math.random() * 8;
const supplyDrops = [];
let lightningFlashTime = 0;
let lightningCooldown = 0.8;
let pendingDayIntro = 1;
let introContinueReadyAt = 0;
let introContinueTimer = 0;

let audioCtx = null;
let masterGain = null;
let musicNodes = null;
let musicStepTimer = 0;
let musicStep = 0;
let musicMode = "normal";

const worldMap = [
  "11111111111111111111",
  "10000000000000000001",
  "10000000000000000001",
  "10001111100011111001",
  "10001000000000001001",
  "10001000000000001001",
  "10001000000000001001",
  "10000000000000000001",
  "10001111100011111001",
  "10000000000000000001",
  "10001000000000001001",
  "10001000000000001001",
  "10001111100011111001",
  "10000000000000000001",
  "10000000000000000001",
  "11111111111111111111",
];

const player = {
  x: 10,
  y: 13,
  a: -Math.PI / 2,
};
const fixedPosition = { x: 10, y: 13 };
const minAimAngle = -Math.PI + 0.08;
const maxAimAngle = 0.18;

const fov = Math.PI / 3;
const maxDepth = 20;
const ghosts = [];
const ghostArcMargin = 0.16;
const ghostHittableScreenLimit = 0.78;
const dayStoryByWave = {
  1: {
    zh: "Hoiwa Hub 事件後第一夜，你追到觀塘鴻圖道。這晚只是試探，遊魂正觀察你的信念。",
    en: "First night after the Hoiwa Hub incident, you trace the curse to Hung To Road. This wave is only a test of your faith.",
  },
  2: {
    zh: "走廊誦經聲變得更近，來自 Hub 的破碎銅鈴在街道回響，怨靈開始主動圍攻。",
    en: "The chanting grows louder, and a broken shrine bell from the Hub echoes through Kwun Tong. The spirits now attack with intent.",
  },
  3: {
    zh: "雨水夾著灰燼落下，詛咒已學會反應你的攻擊，幽靈開始閃避十字架彈。",
    en: "Rain carries ash across the road. The curse adapts to your pattern, and ghosts start dodging your crucifix shots.",
  },
  4: {
    zh: "牆上浮現 Hoiwa Hub 的故障升降機密碼，精英怨靈借風雨守住最終召喚路線。",
    en: "A broken elevator code from Hoiwa Hub appears on the walls. Elite spirits use storm winds to guard the final summoning path.",
  },
  5: {
    zh: "最後一夜，Hub 封印帳簿被打開。雷暴撕裂夜空，首領降臨鴻圖道，現在必須終止儀式。",
    en: "Final night: the sealed Hub ledger is open. Lightning tears the sky as the boss descends on Hung To Road. End the ritual now.",
  },
};

function setDay(day) {
  wave = day;
  totalGhostsThisWave = ghostCountByWave[day] ?? 6 + day * 2;
  spawnedInWave = 0;
  deadInWave = 0;
  spawnAcc = 0;
  bossSpawned = false;
  bossDefeated = false;
  if (wave === 5) {
    lightningCooldown = 0.4 + Math.random() * 0.9;
  } else {
    lightningCooldown = 0.8 + Math.random() * 1.8;
  }
  musicMode = "normal";
}

function initAudio() {
  if (audioCtx) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  audioCtx = new AudioCtor();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.62;
  masterGain.connect(audioCtx.destination);
}

function ensureAudioRunning() {
  initAudio();
  if (!audioCtx) return Promise.resolve(false);
  if (audioCtx.state === "suspended") {
    return audioCtx.resume().then(() => true).catch(() => false);
  }
  return Promise.resolve(true);
}

function requestGameFullscreen() {
  if (!isMobileTouch || document.fullscreenElement) return;
  const root = document.documentElement;
  const req = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!req) return;
  try {
    const res = req.call(root);
    if (res && typeof res.catch === "function") {
      res.catch(() => {});
    }
  } catch (_err) {
    // Some mobile browsers block fullscreen API; ignore and continue gameplay.
  }
}

function playTone(freq, duration, type = "sine", volume = 0.08, delay = 0) {
  if (!audioCtx || !masterGain) return;
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + duration + 0.04);
}

function startMusic() {
  if (!audioCtx || !masterGain || musicNodes) return;
  const now = audioCtx.currentTime;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(720, now);
  filter.Q.value = 0.65;

  const musicGain = audioCtx.createGain();
  musicGain.gain.setValueAtTime(0.0001, now);
  musicGain.gain.exponentialRampToValueAtTime(0.085, now + 1.2);

  const padA = audioCtx.createOscillator();
  padA.type = "sine";
  padA.frequency.setValueAtTime(220, now);

  const padB = audioCtx.createOscillator();
  padB.type = "triangle";
  padB.frequency.setValueAtTime(277.18, now);

  const padBGain = audioCtx.createGain();
  padBGain.gain.value = 0.022;

  const wobble = audioCtx.createOscillator();
  wobble.type = "sine";
  wobble.frequency.setValueAtTime(0.09, now);
  const wobbleGain = audioCtx.createGain();
  wobbleGain.gain.value = 180;

  const trem = audioCtx.createOscillator();
  trem.type = "triangle";
  trem.frequency.setValueAtTime(0.27, now);
  const tremGain = audioCtx.createGain();
  tremGain.gain.value = 0.022;

  wobble.connect(wobbleGain);
  wobbleGain.connect(filter.frequency);
  trem.connect(tremGain);
  tremGain.connect(musicGain.gain);

  padA.connect(filter);
  padB.connect(padBGain);
  padBGain.connect(filter);
  filter.connect(musicGain);
  musicGain.connect(masterGain);

  padA.start(now);
  padB.start(now);
  wobble.start(now);
  trem.start(now);

  musicNodes = {
    filter,
    musicGain,
    padA,
    padB,
    padBGain,
    wobble,
    wobbleGain,
    trem,
    tremGain,
  };
}

function stopMusic() {
  if (!musicNodes || !audioCtx) return;
  const now = audioCtx.currentTime;
  musicNodes.musicGain.gain.cancelScheduledValues(now);
  musicNodes.musicGain.gain.setValueAtTime(Math.max(0.0001, musicNodes.musicGain.gain.value), now);
  musicNodes.musicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  musicNodes.padA.stop(now + 0.5);
  musicNodes.padB.stop(now + 0.5);
  musicNodes.wobble.stop(now + 0.5);
  musicNodes.trem.stop(now + 0.5);
  musicNodes = null;
}

function playShootSfx() {
  playTone(760, 0.08, "square", 0.065);
  playTone(430, 0.11, "triangle", 0.05, 0.015);
}

function playHolyWaterSfx() {
  playTone(310, 0.35, "sine", 0.12);
  playTone(620, 0.28, "triangle", 0.08, 0.04);
}

function playPickupSfx() {
  playTone(520, 0.08, "sine", 0.07);
  playTone(740, 0.1, "triangle", 0.06, 0.04);
}

function playPlayerHitSfx() {
  playTone(165, 0.16, "sawtooth", 0.09);
}

function playGhostDownSfx(isBoss) {
  if (isBoss) {
    playTone(120, 0.28, "sawtooth", 0.12);
    playTone(85, 0.42, "triangle", 0.08, 0.05);
  } else {
    playTone(230, 0.09, "square", 0.045);
  }
  playBambooFirecrackerSfx(isBoss);
}

function playDodgeSfx() {
  playTone(260, 0.06, "triangle", 0.035);
}

function noteFreq(base, semitone) {
  return base * Math.pow(2, semitone / 12);
}

function playBambooFirecrackerSfx(isBoss) {
  const burstCount = isBoss ? 14 : 8;
  const baseVol = isBoss ? 0.055 : 0.038;
  for (let i = 0; i < burstCount; i += 1) {
    const jitter = Math.random() * 0.007;
    const delay = i * 0.028 + jitter;
    const freq = Math.max(320, 1700 + Math.random() * 950 - i * 75);
    playTone(freq, 0.032 + Math.random() * 0.018, "square", baseVol, delay);
    playTone(freq * 0.55, 0.05, "triangle", baseVol * 0.45, delay + 0.006);
  }

  if (isBoss) {
    playTone(92, 0.24, "sawtooth", 0.09, burstCount * 0.028 + 0.03);
  }
}

function hasAliveBoss() {
  for (const g of ghosts) {
    if (g.alive && g.isBoss) return true;
  }
  return false;
}

function updateBackgroundMusic(dt) {
  if (!gameActive || !audioCtx || !masterGain) return;
  const bossActive = hasAliveBoss();
  const targetMode = bossActive ? "boss" : "normal";
  if (targetMode !== musicMode) {
    musicMode = targetMode;
    musicStepTimer = 0;
    musicStep = 0;
    if (bossActive) {
      playTone(196, 0.2, "sawtooth", 0.03);
      playTone(147, 0.24, "triangle", 0.028, 0.03);
      playTone(110, 0.28, "square", 0.022, 0.06);
    }
  }

  musicStepTimer -= dt;
  if (musicStepTimer > 0) return;

  if (musicMode === "boss") {
    const pattern = [
      { semi: 0, dur: 0.28, vol: 0.05, hit: true },
      { semi: 2, dur: 0.24, vol: 0.044, hit: false },
      { semi: 5, dur: 0.26, vol: 0.05, hit: true },
      { semi: 7, dur: 0.22, vol: 0.04, hit: false },
      { semi: 10, dur: 0.3, vol: 0.052, hit: true },
      { semi: 7, dur: 0.24, vol: 0.04, hit: false },
      { semi: 3, dur: 0.28, vol: 0.048, hit: true },
      { semi: null, dur: 0.18, vol: 0, hit: false },
    ];
    const step = pattern[musicStep % pattern.length];
    musicStepTimer = step.dur;
    const base = wave >= 5 ? 174.61 : 196;

    if (step.semi !== null) {
      const melody = noteFreq(base, step.semi - 1);
      playTone(melody, step.dur * 0.85, "sawtooth", step.vol);
      playTone(melody * 1.5, step.dur * 0.5, "square", step.vol * 0.46, 0.02);
      playTone(melody * 0.5, 0.11, "triangle", 0.028, 0.01);
    }
    if (step.hit) {
      playTone(88, 0.09, "square", 0.026);
      playTone(58, 0.12, "sawtooth", 0.018, 0.02);
    }
  } else {
    const pattern = [
      { semi: 0, dur: 0.5, vol: 0.05, sting: false },
      { semi: 3, dur: 0.46, vol: 0.044, sting: false },
      { semi: 7, dur: 0.56, vol: 0.05, sting: true },
      { semi: 10, dur: 0.5, vol: 0.045, sting: false },
      { semi: 6, dur: 0.62, vol: 0.042, sting: true },
      { semi: 3, dur: 0.54, vol: 0.046, sting: false },
      { semi: 1, dur: 0.66, vol: 0.052, sting: false },
      { semi: null, dur: 0.42, vol: 0, sting: false },
    ];

    const step = pattern[musicStep % pattern.length];
    musicStepTimer = step.dur;
    const base = wave >= 4 ? 207.65 : 246.94;
    const drift = wave >= 4 ? -2 : 0;

    if (step.semi !== null) {
      const melody = noteFreq(base, step.semi + drift);
      playTone(melody, step.dur * 0.9, "sine", step.vol);
      playTone(melody * 1.5, step.dur * 0.64, "triangle", step.vol * 0.45, 0.03);
      if (step.sting) {
        playTone(noteFreq(melody, 1), 0.1, "square", 0.016, 0.04);
      }
    }
    if (wave >= 3 && musicStep % 6 === 4) {
      playTone(noteFreq(base, 13 + drift), 0.22, "sawtooth", 0.016, 0.05);
    }
  }
  musicStep += 1;
}

function updateReticle() {
  if (!reticle) return;
  const top = Math.max(20, Math.min(80, 50 + lookPitch * 35));
  reticle.style.top = `${top}%`;
  reticle.style.left = "50%";
}

function applyLookDelta(dx, dy) {
  player.a += dx * 0.0042;
  lookPitch += dy * 0.0032;
  if (lookPitch < -0.42) lookPitch = -0.42;
  if (lookPitch > 0.42) lookPitch = 0.42;
  if (player.a < minAimAngle) player.a = minAimAngle;
  if (player.a > maxAimAngle) player.a = maxAimAngle;
  updateReticle();
}

function triggerShoot() {
  if (!gameActive || fireCooldown > 0) return;
  spawnCrossProjectile(0);
  playShootSfx();
  fireCooldown = 0.11;
  handKick = 1;
}

function triggerHolyWater() {
  if (!gameActive || holyWaterCharges <= 0) return;
  releaseHolyWater();
}

function getDayStory(day) {
  const story = dayStoryByWave[day];
  if (!story) return "詛咒正在加深，堅守位置並活下去。\n\nThe curse deepens. Hold your ground and survive.";
  return `${story.zh}\n\n${story.en}`;
}

function setOverlayTitle() {
  if (!overlayTitle) return;
  overlayTitle.innerHTML =
    '<span class="titleZh">觀搪 33 : 大展鴻圖</span><span class="titleEn">Kwun Tong 33 - Hung To Exorcism</span>';
}

function showDayIntro(day, completedDay = 0) {
  pendingDayIntro = day;
  gameActive = false;
  overlay.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
  hud.classList.add("hidden");
  if (creditsPanel) creditsPanel.classList.add("hidden");

  setOverlayTitle();
  overlayWarn.textContent = "PC: Press S to shoot, F for Holy Water. Mobile: tap screen to shoot + Holy Water button.";
  if (dayStoryEl) {
    const introText =
      completedDay > 0
        ? `第 ${completedDay} 日完成，請按 Continue 再開始。\nDay ${completedDay} complete. Press Continue when ready.\n\n${getDayStory(day)}`
        : getDayStory(day);
    dayStoryEl.textContent = introText;
  }
  if (bootStatus) bootStatus.textContent = day === 1 ? "Press Start to begin." : "Press Continue to begin the next day.";
  startBtn.textContent = day === 1 ? "Start Day 1" : `Continue to Day ${day}`;
  introContinueReadyAt = performance.now() + 650;
  startBtn.disabled = true;
  if (introContinueTimer) window.clearTimeout(introContinueTimer);
  introContinueTimer = window.setTimeout(() => {
    startBtn.disabled = false;
  }, 660);
}

function clampToGhostArc(a) {
  const minA = minAimAngle + ghostArcMargin;
  const maxA = maxAimAngle - ghostArcMargin;
  if (a < minA) return minA;
  if (a > maxA) return maxA;
  return a;
}

function keepGhostInHittableView(g) {
  const relA = normAngle(Math.atan2(g.y - player.y, g.x - player.x) - player.a);
  const limit = (fov / 2) * ghostHittableScreenLimit;
  if (Math.abs(relA) <= limit) return;

  const dist = Math.max(1.05, Math.hypot(g.x - player.x, g.y - player.y));
  const targetRel = relA > 0 ? limit : -limit;
  const targetA = clampToGhostArc(player.a + targetRel);
  const tx = player.x + Math.cos(targetA) * dist;
  const ty = player.y + Math.sin(targetA) * dist;
  if (canMove(tx, ty) && hasClearPath(player.x, player.y, tx, ty)) {
    g.x = tx;
    g.y = ty;
  } else {
    relocateGhost(g);
  }
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function mapAt(x, y) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  if (gy < 0 || gy >= worldMap.length || gx < 0 || gx >= worldMap[0].length) {
    return "1";
  }
  return worldMap[gy][gx];
}

function canMove(x, y) {
  return mapAt(x, y) !== "1";
}

function normAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function castRay(rayAngle) {
  const dirX = Math.cos(rayAngle);
  const dirY = Math.sin(rayAngle);

  let mapX = Math.floor(player.x);
  let mapY = Math.floor(player.y);

  const deltaDistX = Math.abs(1 / (dirX || 1e-8));
  const deltaDistY = Math.abs(1 / (dirY || 1e-8));

  let stepX;
  let sideDistX;
  if (dirX < 0) {
    stepX = -1;
    sideDistX = (player.x - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1 - player.x) * deltaDistX;
  }

  let stepY;
  let sideDistY;
  if (dirY < 0) {
    stepY = -1;
    sideDistY = (player.y - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1 - player.y) * deltaDistY;
  }

  let hit = false;
  let side = 0;

  for (let i = 0; i < 64; i += 1) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    if (mapAt(mapX + 0.01, mapY + 0.01) === "1") {
      hit = true;
      break;
    }
  }

  if (!hit) {
    return maxDepth;
  }

  let dist;
  if (side === 0) {
    dist = (mapX - player.x + (1 - stepX) / 2) / (dirX || 1e-8);
  } else {
    dist = (mapY - player.y + (1 - stepY) / 2) / (dirY || 1e-8);
  }
  return Math.min(Math.abs(dist), maxDepth);
}

function getGhostHpForWave(day) {
  return ghostHpByWave[day] ?? 9 + day;
}

function getBossHpForWave(day) {
  const base = 20 + day * 4;
  const day5Boost = day >= 5 ? 10 : 0;
  return Math.floor((base + day5Boost) * mobileDifficultyScale);
}

function getDodgeChanceForGhost(g) {
  if (g.isBoss) {
    if (wave <= 2) return 0;
    if (wave === 3) return 0.26;
    if (wave === 4) return 0.42;
    return 0.56;
  }
  if (wave <= 3) return 0;
  return Math.min(0.35, 0.15 + (wave - 4) * 0.1);
}

function spawnEnemy(isBoss = false) {
  for (let i = 0; i < 120; i += 1) {
    const spawnMin = minAimAngle + ghostArcMargin;
    const spawnMax = maxAimAngle - ghostArcMargin;
    const angle = spawnMin + Math.random() * (spawnMax - spawnMin);
    const radius = isBoss ? 9 + Math.random() * 3 : 5.8 + Math.random() * 6.5;
    const x = player.x + Math.cos(angle) * radius;
    const y = player.y + Math.sin(angle) * radius;
    if (mapAt(x, y) === "1") continue;
    if (!hasClearPath(player.x, player.y, x, y)) continue;

    ghosts.push({
      x,
      y,
      hp: isBoss ? getBossHpForWave(wave) : getGhostHpForWave(wave),
      speed: (() => {
        const raw =
          (isBoss ? 0.5 : 0.53) + Math.random() * (isBoss ? 0.13 : 0.2) + Math.max(0, wave - 1) * (isBoss ? 0.03 : 0.028);
        return raw * mobileDifficultyScale * (isBoss ? 1.12 : 1);
      })(),
      hitCd: 0,
      bob: Math.random() * 10,
      alive: true,
      isBoss,
      stuck: 0,
      lastX: x,
      lastY: y,
      flyPhase: Math.random() * Math.PI * 2,
      flyHeight: isBoss && wave >= 5 ? 0.34 : 0,
      dodgeCd: 0,
    });
    return true;
  }
  return false;
}

function spawnBoss() {
  if (bossSpawned) return;
  const ok = spawnEnemy(true);
  if (ok) bossSpawned = true;
}

function updateHUD() {
  let bossRemaining = 0;
  for (const g of ghosts) {
    if (g.alive && g.isBoss) {
      bossRemaining = 1;
      break;
    }
  }
  const remaining = Math.max(0, totalGhostsThisWave - deadInWave) + bossRemaining;
  healthEl.textContent = String(Math.max(0, Math.floor(health)));
  waveEl.textContent = String(wave);
  remainingEl.textContent = String(remaining);
  if (holyWaterEl) holyWaterEl.textContent = String(holyWaterCharges);
  if (touchHolyBtn) {
    touchHolyBtn.textContent = `💧 x${holyWaterCharges}`;
    touchHolyBtn.disabled = holyWaterCharges <= 0;
  }
}

function showEnd(title, text) {
  gameActive = false;
  gameEnded = true;
  stopMusic();
  gameOverTitle.textContent = title;
  gameOverText.textContent = text;
  gameOverPanel.classList.remove("hidden");
}

function resetGame() {
  ghosts.length = 0;
  projectiles.length = 0;
  deathGreetings.length = 0;
  health = 100;
  score = 0;
  holyWaterCharges = 0;
  nextHolyWaterScore = holyWaterScoreStep;
  holyWaterBlastTime = 0;
  jesusProtectionTime = 0;
  supplyFlashTime = 0;
  damageFlashTime = 0;
  screenShakeTime = 0;
  lightningFlashTime = 0;
  planeActive = false;
  planeX = -0.2;
  planeDir = 1;
  planeSpeed = 0.24;
  planeDropDone = false;
  planeCooldown = 8 + Math.random() * 8;
  supplyDrops.length = 0;
  setDay(1);
  fireCooldown = 0;
  handKick = 0;
  gameEnded = false;
  stopMusic();
  musicStepTimer = 0;
  musicStep = 0;
  musicMode = "normal";

  player.x = fixedPosition.x;
  player.y = fixedPosition.y;
  player.a = -Math.PI / 2;
  lookPitch = 0;
  updateReticle();
  showDayIntro(1);
  updateHUD();
}

function requestStart() {
  if (gameActive || gameEnded) return;
  if (performance.now() < introContinueReadyAt) return;
  requestGameFullscreen();
  if (isMobileTouch) {
    window.setTimeout(() => window.scrollTo(0, 1), 40);
  }
  ensureAudioRunning().then((ok) => {
    if (!ok) return;
    startMusic();
    playTone(660, 0.08, "sine", 0.06);
  });
  musicStepTimer = 0;
  if (bootStatus) bootStatus.textContent = "Game started.";
  if (dayStoryEl) dayStoryEl.textContent = "";
  pendingDayIntro = 0;
  overlay.classList.add("hidden");
  gameOverPanel.classList.add("hidden");
  if (creditsPanel) creditsPanel.classList.add("hidden");
  hud.classList.remove("hidden");
  gameActive = true;
  lookReady = false;
  updateReticle();
}

function spawnCrossProjectile(spread) {
  const a = player.a + spread;
  const vx = Math.cos(a) * projectileSpeed;
  const vy = Math.sin(a) * projectileSpeed;
  const z = 0.1 - lookPitch * 1.2;
  const vz = -lookPitch * projectileSpeed * 0.7;

  projectiles.push({
    x: player.x + Math.cos(a) * 0.42,
    y: player.y + Math.sin(a) * 0.42,
    vx,
    vy,
    z,
    vz,
    life: 1.3,
    size: 0.06 + Math.random() * 0.03,
  });
}

function spawnDeathGreeting(x, y) {
  const text = cnyGreetings[Math.floor(Math.random() * cnyGreetings.length)];
  deathGreetings.push({
    x,
    y,
    text,
    life: 1,
    rise: 0,
  });
}

function defeatGhost(g) {
  if (!g.alive) return;
  g.alive = false;
  spawnDeathGreeting(g.x, g.y);
  if (g.isBoss) {
    bossDefeated = true;
    score += 500;
  } else {
    deadInWave += 1;
    score += 100;
  }
  playGhostDownSfx(g.isBoss);
}

function cleanupGhosts() {
  for (let i = ghosts.length - 1; i >= 0; i -= 1) {
    if (!ghosts[i].alive) ghosts.splice(i, 1);
  }
}

function updateProjectiles(dt) {
  for (const p of projectiles) {
    if (p.life <= 0) continue;
    p.life -= dt;
    if (p.life <= 0) continue;

    const nx = p.x + p.vx * dt;
    const ny = p.y + p.vy * dt;

    if (!canMove(nx, ny)) {
      p.life = 0;
      continue;
    }

    p.x = nx;
    p.y = ny;
    p.z += p.vz * dt;

    for (let i = supplyDrops.length - 1; i >= 0; i -= 1) {
      const d = supplyDrops[i];
      if (d.state !== "ground") continue;
      const dd = Math.hypot(d.x - p.x, d.y - p.y);
      if (dd > 0.4) continue;
      if (Math.abs(p.z + 0.5) > 1) continue;

      d.hp -= 1;
      d.flash = 0.18;
      p.life = 0;
      if (d.hp <= 0) {
        applySupplyDrop(d.type);
        supplyDrops.splice(i, 1);
      }
      break;
    }
    if (p.life <= 0) continue;

    for (const g of ghosts) {
      if (!g.alive) continue;
      const d = Math.hypot(g.x - p.x, g.y - p.y);
      if (d > 0.4) continue;
      const targetZ = g.isBoss ? g.flyHeight : 0.12;
      const zTol = g.isBoss ? 0.6 : 1.2;
      if (Math.abs(targetZ - p.z) > zTol) continue;

      g.hp -= 1;
      p.life = 0;
      if (g.hp <= 0) {
        defeatGhost(g);
      }
      break;
    }
  }

  cleanupGhosts();

  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    if (projectiles[i].life <= 0) projectiles.splice(i, 1);
  }
}

function updateAttack(dt) {
  fireCooldown = Math.max(0, fireCooldown - dt);
  handKick = Math.max(0, handKick - dt * 5.5);
  holyWaterBlastTime = Math.max(0, holyWaterBlastTime - dt);
  jesusProtectionTime = Math.max(0, jesusProtectionTime - dt);
  supplyFlashTime = Math.max(0, supplyFlashTime - dt);
  damageFlashTime = Math.max(0, damageFlashTime - dt);
  screenShakeTime = Math.max(0, screenShakeTime - dt);
  updateProjectiles(dt);
}

function updateWeather(dt) {
  lightningFlashTime = Math.max(0, lightningFlashTime - dt);
  if (!gameActive || wave !== 5) return;

  lightningCooldown -= dt;
  if (lightningCooldown <= 0) {
    lightningFlashTime = 0.12 + Math.random() * 0.2;
    lightningCooldown = 0.35 + Math.random() * 0.9;
  }
}

function startPlaneFlyby() {
  planeActive = true;
  planeDir = Math.random() < 0.5 ? 1 : -1;
  planeX = planeDir === 1 ? -0.2 : 1.2;
  planeSpeed = 0.2 + Math.random() * 0.1 + wave * 0.015;
  planeDropDone = false;
}

function randomSupplyType() {
  const r = Math.random();
  if (r < 0.4) return "hp";
  if (r < 0.88) return "holy";
  return "jesus";
}

function findSupplyDropSpot() {
  for (let i = 0; i < 80; i += 1) {
    const spawnMin = minAimAngle + ghostArcMargin;
    const spawnMax = maxAimAngle - ghostArcMargin;
    const angle = spawnMin + Math.random() * (spawnMax - spawnMin);
    const radius = 4.2 + Math.random() * 5.2;
    const x = player.x + Math.cos(angle) * radius;
    const y = player.y + Math.sin(angle) * radius;
    if (mapAt(x, y) === "1") continue;
    if (!hasClearPath(player.x, player.y, x, y)) continue;
    return { x, y };
  }
  return null;
}

function spawnSupplyDrop() {
  const spot = findSupplyDropSpot();
  if (!spot) return;
  supplyDrops.push({
    type: randomSupplyType(),
    x: spot.x,
    y: spot.y,
    state: "falling",
    fall: 0,
    vy: 0,
    hp: supplyDropUnlockHits,
    groundLife: 18,
    flash: 0,
    sway: Math.random() * Math.PI * 2,
  });
}

function applySupplyDrop(type) {
  if (type === "hp") {
    health = Math.min(100, health + 35);
  } else if (type === "holy") {
    holyWaterCharges += 1;
  } else {
    jesusProtectionTime = Math.max(jesusProtectionTime, jesusProtectionDuration);
  }
  supplyFlashTime = 0.35;
  playPickupSfx();
}

function updateSupplyDrops(dt) {
  if (!planeActive) {
    planeCooldown -= dt;
    if (planeCooldown <= 0) {
      startPlaneFlyby();
    }
  } else {
    planeX += planeDir * planeSpeed * dt;
    const inDropLane = planeDir === 1 ? planeX >= 0.48 : planeX <= 0.52;
    if (!planeDropDone && inDropLane) {
      planeDropDone = true;
      if (Math.random() < 0.85) {
        spawnSupplyDrop();
      }
    }

    if ((planeDir === 1 && planeX > 1.24) || (planeDir === -1 && planeX < -0.24)) {
      planeActive = false;
      planeCooldown = 7 + Math.random() * 10;
    }
  }

  for (const d of supplyDrops) {
    if (d.state === "falling") {
      d.vy = Math.min(1.8, d.vy + dt * 2.4);
      d.fall = Math.min(1, d.fall + d.vy * dt * 0.65);
      if (d.fall >= 1) d.state = "ground";
    } else {
      d.groundLife -= dt;
      d.flash = Math.max(0, d.flash - dt);
    }
  }

  for (let i = supplyDrops.length - 1; i >= 0; i -= 1) {
    if (supplyDrops[i].state === "ground" && supplyDrops[i].groundLife <= 0) {
      supplyDrops.splice(i, 1);
    }
  }
}

function maybeGrantHolyWater() {
  while (score >= nextHolyWaterScore) {
    holyWaterCharges += 1;
    nextHolyWaterScore += holyWaterScoreStep;
    playPickupSfx();
  }
}

function releaseHolyWater() {
  if (holyWaterCharges <= 0 || !gameActive) return;
  holyWaterCharges -= 1;
  holyWaterBlastTime = 0.55;
  playHolyWaterSfx();

  const targets = [];
  for (const g of ghosts) {
    if (!g.alive) continue;
    const d = Math.hypot(g.x - player.x, g.y - player.y);
    if (d > 7.2) continue;
    targets.push({ g, d });
  }

  targets.sort((a, b) => a.d - b.d);
  const maxHits = 4;
  for (let i = 0; i < Math.min(maxHits, targets.length); i += 1) {
    const g = targets[i].g;
    if (g.isBoss) {
      g.hp -= 20;
      if (g.hp <= 0) defeatGhost(g);
    } else {
      defeatGhost(g);
    }
  }
}

function updateGhosts(dt) {
  for (const g of ghosts) {
    if (!g.alive) continue;
    g.dodgeCd = Math.max(0, (g.dodgeCd || 0) - dt);
    const canDodgeThisDay = g.isBoss ? wave >= 3 : wave >= 4;
    if (canDodgeThisDay && maybeDodgeGhost(g)) {
      g.lastX = g.x;
      g.lastY = g.y;
    }

    const dx = player.x - g.x;
    const dy = player.y - g.y;
    const dist = Math.hypot(dx, dy);
    const nx = dist > 0.001 ? dx / dist : 0;
    const ny = dist > 0.001 ? dy / dist : 0;

    const step = g.speed * dt;
    const tx = g.x + nx * step;
    const ty = g.y + ny * step;

    if (canMove(tx, g.y)) g.x = tx;
    if (canMove(g.x, ty)) g.y = ty;

    const ang = Math.atan2(g.y - player.y, g.x - player.x);
    const clampedAng = clampToGhostArc(ang);
    if (Math.abs(clampedAng - ang) > 1e-4) {
      const keepDist = Math.max(0.95, Math.hypot(g.x - player.x, g.y - player.y));
      const ax = player.x + Math.cos(clampedAng) * keepDist;
      const ay = player.y + Math.sin(clampedAng) * keepDist;
      if (canMove(ax, ay) && hasClearPath(player.x, player.y, ax, ay)) {
        g.x = ax;
        g.y = ay;
      } else {
        relocateGhost(g);
      }
    }

    keepGhostInHittableView(g);

    const moved = Math.hypot(g.x - g.lastX, g.y - g.lastY);
    if (moved < 0.01) {
      g.stuck += dt;
    } else {
      g.stuck = 0;
    }
    g.lastX = g.x;
    g.lastY = g.y;

    if (g.stuck > 1.25) {
      relocateGhost(g);
      g.stuck = 0;
    }

    g.bob += dt * 6;
    if (g.isBoss && wave >= 5) {
      g.flyPhase += dt * (1.25 + wave * 0.1);
      g.flyHeight = 0.34 + Math.sin(g.flyPhase) * 0.2;
    } else {
      g.flyHeight = 0;
    }

    if (g.hitCd > 0) g.hitCd -= dt;
    if (dist < (g.isBoss ? 1.08 : 0.9) && g.hitCd <= 0) {
      if (jesusProtectionTime > 0) {
        g.hitCd = 0.75;
        supplyFlashTime = Math.max(supplyFlashTime, 0.1);
      } else {
        health -= (4.2 + wave * 0.26) * (isMobileTouch ? 0.92 : 1);
        g.hitCd = 0.7;
        damageFlashTime = 0.24;
        screenShakeTime = 0.22;
        playPlayerHitSfx();
      }
    }
  }
}

function maybeDodgeGhost(g) {
  if (g.dodgeCd > 0 || projectiles.length === 0) return false;

  let threat = null;
  let bestDist = 999;
  for (const p of projectiles) {
    if (p.life <= 0) continue;
    const d = Math.hypot(g.x - p.x, g.y - p.y);
    if (d > 1.45) continue;
    const fd = Math.hypot(g.x - (p.x + p.vx * 0.12), g.y - (p.y + p.vy * 0.12));
    if (fd >= d) continue;
    if (Math.abs((g.flyHeight || 0.1) - p.z) > 0.9) continue;
    if (d < bestDist) {
      bestDist = d;
      threat = p;
    }
  }
  if (!threat) return false;

  const chance = getDodgeChanceForGhost(g);
  if (chance <= 0) return false;
  if (Math.random() > chance) {
    g.dodgeCd = g.isBoss ? (wave >= 4 ? 0.18 : 0.24) : 0.26;
    return false;
  }

  const sideX = -threat.vy / projectileSpeed;
  const sideY = threat.vx / projectileSpeed;
  const firstSign = Math.random() < 0.5 ? -1 : 1;
  const step = 0.5 + Math.random() * 0.28;

  for (const sign of [firstSign, -firstSign]) {
    const nx = g.x + sideX * step * sign;
    const ny = g.y + sideY * step * sign;
    const ang = clampToGhostArc(Math.atan2(ny - player.y, nx - player.x));
    const dist = Math.max(0.95, Math.hypot(nx - player.x, ny - player.y));
    const ax = player.x + Math.cos(ang) * dist;
    const ay = player.y + Math.sin(ang) * dist;
    if (!canMove(ax, ay)) continue;
    if (!hasClearPath(player.x, player.y, ax, ay)) continue;
    g.x = ax;
    g.y = ay;
    g.dodgeCd = g.isBoss ? (wave >= 5 ? 0.46 : wave >= 4 ? 0.58 : 0.7) : 0.86;
    playDodgeSfx();
    return true;
  }

  g.dodgeCd = g.isBoss ? (wave >= 4 ? 0.3 : 0.38) : 0.42;
  return false;
}

function hasClearPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return true;
  const step = 0.2;
  const steps = Math.ceil(dist / step);
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    if (mapAt(x, y) === "1") return false;
  }
  return true;
}

function relocateGhost(g) {
  for (let i = 0; i < 40; i += 1) {
    const spawnMin = minAimAngle + ghostArcMargin;
    const spawnMax = maxAimAngle - ghostArcMargin;
    const angle = spawnMin + Math.random() * (spawnMax - spawnMin);
    const radius = g.isBoss ? 8 + Math.random() * 3 : 4.5 + Math.random() * 5.5;
    const x = player.x + Math.cos(angle) * radius;
    const y = player.y + Math.sin(angle) * radius;
    if (mapAt(x, y) === "1") continue;
    if (!hasClearPath(player.x, player.y, x, y)) continue;
    g.x = x;
    g.y = y;
    g.lastX = x;
    g.lastY = y;
    return;
  }
}

function updateDeathGreetings(dt) {
  for (const g of deathGreetings) {
    g.life -= dt;
    g.rise += dt * 0.7;
  }
  for (let i = deathGreetings.length - 1; i >= 0; i -= 1) {
    if (deathGreetings[i].life <= 0) deathGreetings.splice(i, 1);
  }
}

function spawnWaveGhosts(dt) {
  if (spawnedInWave < totalGhostsThisWave) {
    const baseSpawnRate = [0, 1.18, 1.34, 1.36, 1.52, 1.66][wave] ?? Math.min(1.18 + wave * 0.14, 1.95);
    const spawnRate = isMobileTouch ? baseSpawnRate * 0.9 : baseSpawnRate;
    spawnAcc += dt * spawnRate;
    while (spawnAcc >= 1 && spawnedInWave < totalGhostsThisWave) {
      spawnAcc -= 1;
      if (spawnEnemy(false)) {
        spawnedInWave += 1;
      }
    }
    return;
  }

  if (!bossSpawned && deadInWave >= totalGhostsThisWave) {
    spawnBoss();
  }
}

function checkGameState() {
  if (health <= 0) {
    health = 0;
    showEnd("你被怨靈吞沒", `到達天數：第 ${wave} 日。`);
    return;
  }

  if (bossDefeated) {
    if (wave >= maxDays) {
      showEnd("地區已淨化", `你成功生還，完成全部 ${maxDays} 日。`);
    } else {
      const completedDay = wave;
      const nextDay = wave + 1;
      setDay(nextDay);
      showDayIntro(nextDay, completedDay);
    }
    return;
  }
}

function drawHungToRoadBackdrop(w, h) {
  // Clear with an opaque base each frame to prevent alpha color bleed artifacts.
  ctx.fillStyle = "#0a1019";
  ctx.fillRect(0, 0, w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, "#0b1220");
  sky.addColorStop(0.6, "#1a2840");
  sky.addColorStop(1, "#27374e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h / 2);

  const haze = ctx.createRadialGradient(w * 0.52, h * 0.18, 10, w * 0.52, h * 0.18, w * 0.45);
  haze.addColorStop(0, "rgba(168, 194, 228, 0.18)");
  haze.addColorStop(1, "rgba(168, 194, 228, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h * 0.55);

  const blocks = [
    [0.04, 0.14, 0.08, 0.28],
    [0.12, 0.1, 0.1, 0.32],
    [0.22, 0.16, 0.09, 0.26],
    [0.33, 0.07, 0.11, 0.35],
    [0.45, 0.12, 0.09, 0.3],
    [0.57, 0.09, 0.1, 0.33],
    [0.69, 0.15, 0.08, 0.27],
    [0.78, 0.11, 0.09, 0.31],
    [0.88, 0.14, 0.08, 0.28],
  ];

  for (const b of blocks) {
    const bx = b[0] * w;
    const by = b[1] * h;
    const bw = b[2] * w;
    const bh = b[3] * h;
    ctx.fillStyle = "rgb(25, 34, 48)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.fillStyle = "rgba(170, 198, 235, 0.22)";
    for (let y = by + 8; y < by + bh - 6; y += 14) {
      for (let x = bx + 6; x < bx + bw - 5; x += 12) {
        if ((x + y) % 4 < 2) ctx.fillRect(x, y, 5, 5);
      }
    }
  }

  ctx.fillStyle = "rgb(14, 19, 27)";
  ctx.fillRect(0, h * 0.52, w, h * 0.48);

  const asphalt = ctx.createLinearGradient(0, h * 0.55, 0, h);
  asphalt.addColorStop(0, "#2f3843");
  asphalt.addColorStop(1, "#1a2028");
  ctx.fillStyle = asphalt;
  ctx.fillRect(0, h * 0.56, w, h * 0.44);
}

function drawCloudLayer(w, h, amount, windStrength, darkness = 0) {
  const t = performance.now() * 0.00004;
  for (let i = 0; i < amount; i += 1) {
    const band = (i % 5) / 5;
    const y = h * (0.1 + band * 0.28) + Math.sin(t * 22 + i * 0.8) * 6;
    const speed = 0.08 + windStrength * 0.12 + band * 0.04;
    const x = (((t * speed * w * 12 + i * 127) % (w + 260)) - 130);
    const rw = 120 + (i % 7) * 22;
    const rh = 22 + (i % 3) * 8;
    const a = 0.08 + amount * 0.004 + darkness * 0.04;
    ctx.fillStyle = `rgba(${180 - darkness * 45}, ${188 - darkness * 55}, ${200 - darkness * 65}, ${a})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRain(w, h, count, wind) {
  const t = performance.now() * 0.001;
  ctx.strokeStyle = "rgba(175, 202, 232, 0.48)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < count; i += 1) {
    const x = ((i * 67 + t * (310 + wind * 120)) % (w + 120)) - 60;
    const y = ((i * 131 + t * 860) % (h + 80)) - 40;
    const len = 10 + (i % 4) * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + wind * 7, y + len);
    ctx.stroke();
  }
}

function drawSnow(w, h, count, wind) {
  const t = performance.now() * 0.001;
  ctx.fillStyle = "rgba(240, 248, 255, 0.75)";
  for (let i = 0; i < count; i += 1) {
    const x = ((i * 83 + t * (40 + wind * 30)) % (w + 160)) - 80 + Math.sin(i + t * 2) * 6;
    const y = ((i * 97 + t * 110) % (h + 100)) - 50;
    const r = 1 + (i % 3) * 0.75;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWindStreaks(w, h, count, wind) {
  const t = performance.now() * 0.0009;
  ctx.strokeStyle = "rgba(205, 220, 235, 0.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i += 1) {
    const y = h * 0.2 + ((i * 43 + t * 280) % (h * 0.45));
    const x1 = ((i * 119 + t * 650) % (w + 180)) - 90;
    const x2 = x1 + 34 + wind * 18;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y - wind * 2);
    ctx.stroke();
  }
}

function drawLightning(w, h) {
  if (lightningFlashTime <= 0) return;
  const a = lightningFlashTime / 0.32;
  ctx.fillStyle = `rgba(240, 245, 255, ${Math.min(0.5, a * 0.45)})`;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = `rgba(238, 245, 255, ${Math.min(0.95, a * 0.9)})`;
  ctx.lineWidth = 2.4;
  const startX = w * (0.15 + (Math.sin(performance.now() * 0.004) + 1) * 0.35);
  let x = startX;
  let y = h * 0.03;
  ctx.beginPath();
  ctx.moveTo(x, y);
  while (y < h * 0.58) {
    x += (Math.random() - 0.5) * 30;
    y += 18 + Math.random() * 18;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawDayWeather(w, h) {
  if (wave === 1) {
    drawCloudLayer(w, h, 10, 0.08, 0);
    return;
  }
  if (wave === 2) {
    drawCloudLayer(w, h, 18, 0.55, 0.1);
    drawWindStreaks(w, h, 30, 0.65);
    return;
  }
  if (wave === 3) {
    drawRain(w, h, 170, 0.2);
    return;
  }
  if (wave === 4) {
    drawCloudLayer(w, h, 16, 0.28, 0.16);
    drawRain(w, h, 140, 0.3);
    return;
  }

  ctx.fillStyle = "rgba(18, 25, 34, 0.2)";
  ctx.fillRect(0, 0, w, h);
  drawCloudLayer(w, h, 22, 0.78, 0.35);
  drawWindStreaks(w, h, 44, 0.85);
  drawSnow(w, h, 120, 0.7);
  drawLightning(w, h);
}

function drawRoadDetails(w, h) {
  ctx.fillStyle = "rgba(70, 82, 96, 0.55)";
  ctx.fillRect(w * 0.62, h * 0.74, 120, 20);
  ctx.fillRect(w * 0.3, h * 0.81, 150, 18);
}

function drawHolyWaterBlast(w, h) {
  if (holyWaterBlastTime <= 0) return;
  const t = holyWaterBlastTime / 0.55;
  const radius = (1 - t) * Math.max(w, h) * 0.48;
  const alpha = t * 0.52;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(128, 202, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(192, 235, 255, 0.8)";
  ctx.stroke();
  ctx.restore();
}

function drawSupplyPlaneAndDrops(w, h, depthBuffer) {
  if (planeActive) {
    const px = planeX * w;
    const py = h * 0.165 + Math.sin(performance.now() * 0.004) * 3;
    const ufoScale = Math.max(1.35, Math.min(2.05, 1.45 + (wave - 1) * 0.1));
    const lightPulse = 0.45 + (Math.sin(performance.now() * 0.02) + 1) * 0.25;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(ufoScale, ufoScale);

    const glow = ctx.createRadialGradient(0, 2, 8, 0, 2, 78);
    glow.addColorStop(0, "rgba(124, 201, 255, 0.28)");
    glow.addColorStop(1, "rgba(124, 201, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-88, -64, 176, 128);

    ctx.fillStyle = "rgba(22, 28, 38, 0.94)";
    ctx.beginPath();
    ctx.ellipse(0, 2, 58, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    const hull = ctx.createLinearGradient(0, -18, 0, 18);
    hull.addColorStop(0, "rgba(125, 145, 165, 0.96)");
    hull.addColorStop(1, "rgba(58, 72, 88, 0.97)");
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    const dome = ctx.createRadialGradient(-8, -13, 3, 0, -10, 22);
    dome.addColorStop(0, "rgba(220, 242, 255, 0.95)");
    dome.addColorStop(1, "rgba(102, 142, 170, 0.82)");
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.ellipse(0, -10, 20, 11, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(186, 214, 236, 0.82)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 51, 12.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = -4; i <= 4; i += 1) {
      const lx = i * 11;
      ctx.fillStyle = `rgba(255, 234, 146, ${0.35 + lightPulse * 0.55})`;
      ctx.beginPath();
      ctx.arc(lx, 9, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(149, 216, 255, ${0.11 + lightPulse * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.lineTo(10, 12);
    ctx.lineTo(24, 56);
    ctx.lineTo(-24, 56);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const drops = [];
  for (const d of supplyDrops) {
    const dx = d.x - player.x;
    const dy = d.y - player.y;
    const dist = Math.hypot(dx, dy);
    const relA = normAngle(Math.atan2(dy, dx) - player.a);
    if (Math.abs(relA) > fov * 0.82) continue;
    drops.push({ d, dist, relA });
  }

  drops.sort((a, b) => b.dist - a.dist);

  for (const it of drops) {
    const sx = w / 2 + (it.relA / (fov / 2)) * (w / 2);
    const xIdx = Math.max(0, Math.min(w - 1, Math.floor(sx)));
    if (it.d.state === "ground" && it.dist >= depthBuffer[xIdx]) continue;

    const size = Math.max(14, Math.min(46, (h * 0.56) / Math.max(it.dist, 0.2)));
    const syBase = it.d.state === "falling" ? h * (0.22 + it.d.fall * 0.44) : h * 0.63;
    const sy = syBase + lookPitch * h * 0.28;

    if (it.d.state === "falling") {
      ctx.strokeStyle = "rgba(235, 235, 235, 0.78)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - size * 0.9);
      ctx.lineTo(sx, sy - size * 0.35);
      ctx.stroke();
      ctx.fillStyle = "rgba(235, 235, 235, 0.92)";
      ctx.beginPath();
      ctx.ellipse(sx, sy - size, size * 0.45, size * 0.28, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = it.d.flash > 0 ? "rgba(252, 232, 164, 0.95)" : "rgba(36, 41, 52, 0.95)";
    ctx.fillRect(sx - size * 0.28, sy - size * 0.26, size * 0.56, size * 0.56);

    if (it.d.type === "hp") {
      ctx.fillStyle = "rgba(220, 44, 62, 0.96)";
      ctx.fillRect(sx - size * 0.05, sy - size * 0.15, size * 0.1, size * 0.32);
      ctx.fillRect(sx - size * 0.16, sy - size * 0.04, size * 0.32, size * 0.1);
    } else if (it.d.type === "holy") {
      ctx.strokeStyle = "rgba(122, 212, 255, 0.96)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy - size * 0.13);
      ctx.lineTo(sx, sy + size * 0.15);
      ctx.moveTo(sx - size * 0.13, sy + size * 0.03);
      ctx.lineTo(sx + size * 0.13, sy + size * 0.03);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(242, 218, 144, 0.96)";
      ctx.beginPath();
      ctx.arc(sx, sy + size * 0.02, size * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(118, 76, 52, 0.92)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(sx, sy + size * 0.03, size * 0.1, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }

    for (let i = 0; i < 5; i += 1) {
      const lit = i < it.d.hp;
      ctx.fillStyle = lit ? "rgba(245, 209, 112, 0.95)" : "rgba(92, 96, 108, 0.7)";
      const px = sx - size * 0.28 + i * size * 0.14 + 2;
      const py = sy + size * 0.34;
      ctx.fillRect(px, py, size * 0.1, 4);
    }
  }
}

function drawJesusProtectionLayer(w, h) {
  if (jesusProtectionTime <= 0) return;
  const t = Math.min(1, jesusProtectionTime / jesusProtectionDuration);
  const pulse = 0.16 + Math.sin(performance.now() * 0.008) * 0.05;
  const cx = w * 0.5;
  const cy = h * 0.53;
  const faceRx = Math.min(w * 0.34, h * 0.38);
  const faceRy = faceRx * 1.22;
  const eyeY = cy - faceRy * 0.2;
  const eyeR = faceRx * 0.075;
  const mouthY = cy + faceRy * 0.25;

  ctx.save();
  ctx.fillStyle = `rgba(247, 219, 156, ${0.08 + pulse * 0.22})`;
  ctx.fillRect(0, 0, w, h);

  const halo = ctx.createRadialGradient(cx, cy - faceRy * 0.34, faceRx * 0.25, cx, cy - faceRy * 0.2, faceRx * 2.25);
  halo.addColorStop(0, `rgba(255, 244, 214, ${0.28 + t * 0.2})`);
  halo.addColorStop(1, "rgba(255, 244, 214, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = `rgba(245, 224, 192, ${0.18 + t * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, faceRx, faceRy, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 240, 210, ${0.28 + pulse * 0.4})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, faceRx * 1.08, faceRy * 1.08, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(118, 82, 60, 0.75)";
  ctx.lineWidth = faceRx * 0.08;
  ctx.beginPath();
  ctx.moveTo(cx - faceRx * 0.66, cy - faceRy * 0.95);
  ctx.quadraticCurveTo(cx, cy - faceRy * 1.3, cx + faceRx * 0.66, cy - faceRy * 0.95);
  ctx.stroke();

  ctx.fillStyle = "rgba(70, 43, 34, 0.72)";
  ctx.beginPath();
  ctx.ellipse(cx - faceRx * 0.28, eyeY, eyeR, eyeR * 0.82, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + faceRx * 0.28, eyeY, eyeR, eyeR * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(102, 58, 41, 0.7)";
  ctx.lineWidth = Math.max(3, faceRx * 0.03);
  ctx.beginPath();
  ctx.arc(cx, mouthY, faceRx * 0.2, Math.PI * 0.08, Math.PI * 0.92);
  ctx.stroke();

  const border = ctx.createLinearGradient(0, 0, 0, h);
  border.addColorStop(0, `rgba(240, 210, 150, ${0.24 + pulse * 0.35})`);
  border.addColorStop(1, `rgba(240, 210, 150, ${0.08 + pulse * 0.2})`);
  ctx.strokeStyle = border;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.restore();
}

function drawLowHealthWarning(w, h) {
  if (!gameActive || health >= 20) return;
  const danger = 1 - health / 20;
  const pulse = 0.16 + Math.sin(performance.now() * 0.012) * 0.06;

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.15,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.74,
  );
  vignette.addColorStop(0, "rgba(170, 0, 0, 0)");
  vignette.addColorStop(1, `rgba(190, 8, 14, ${pulse + danger * 0.24})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawSupplyPickupFlash(w, h) {
  if (supplyFlashTime <= 0) return;
  const a = supplyFlashTime / 0.35;
  ctx.fillStyle = `rgba(250, 235, 186, ${a * 0.14})`;
  ctx.fillRect(0, 0, w, h);
}

function drawDamageFlash(w, h) {
  if (!gameActive || damageFlashTime <= 0) return;
  const t = damageFlashTime / 0.24;
  const pulse = 0.18 + Math.sin(performance.now() * 0.03) * 0.06;
  ctx.fillStyle = `rgba(220, 18, 24, ${pulse * t})`;
  ctx.fillRect(0, 0, w, h);
}

function drawProjectileCrucifixSprite(x, y, size, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const shaftW = Math.max(2, size * 0.26);
  const shaftH = size * 1.35;
  const armW = size * 1.1;
  const armH = Math.max(2, size * 0.24);

  ctx.fillStyle = "rgba(138, 96, 61, 0.97)";
  ctx.fillRect(-shaftW / 2, -shaftH * 0.62, shaftW, shaftH);
  ctx.fillRect(-armW / 2, -armH * 0.45, armW, armH);

  ctx.strokeStyle = "rgba(252, 230, 182, 0.52)";
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.strokeRect(-shaftW / 2, -shaftH * 0.62, shaftW, shaftH);
  ctx.strokeRect(-armW / 2, -armH * 0.45, armW, armH);

  ctx.fillStyle = "rgba(232, 216, 194, 0.95)";
  ctx.beginPath();
  ctx.arc(0, -size * 0.34, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(232, 216, 194, 0.92)";
  ctx.lineWidth = Math.max(1, size * 0.065);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(0, size * 0.25);
  ctx.moveTo(-size * 0.25, -size * 0.03);
  ctx.lineTo(size * 0.25, -size * 0.03);
  ctx.moveTo(-size * 0.03, size * 0.24);
  ctx.lineTo(-size * 0.1, size * 0.42);
  ctx.moveTo(size * 0.03, size * 0.24);
  ctx.lineTo(size * 0.1, size * 0.42);
  ctx.stroke();

  ctx.fillStyle = "rgba(172, 40, 48, 0.9)";
  ctx.fillRect(-shaftW * 0.52, size * 0.08, shaftW * 1.04, Math.max(2, size * 0.08));

  ctx.restore();
}

function drawProjectileSprites(w, h, depthBuffer) {
  const ammo = [];
  for (const p of projectiles) {
    const dx = p.x - player.x;
    const dy = p.y - player.y;
    const dist = Math.hypot(dx, dy);
    const relA = normAngle(Math.atan2(dy, dx) - player.a);
    if (Math.abs(relA) > fov * 0.75) continue;
    ammo.push({ p, dist, relA });
  }

  ammo.sort((a, b) => b.dist - a.dist);

  for (const a of ammo) {
    const sx = w / 2 + (a.relA / (fov / 2)) * (w / 2);
    const xIdx = Math.max(0, Math.min(w - 1, Math.floor(sx)));
    if (a.dist >= depthBuffer[xIdx]) continue;

    const size = Math.max(6, Math.min(28, (h * 0.42) / Math.max(a.dist, 0.12)));
    const zScreen = (a.p.z / Math.max(a.dist, 0.45)) * h * 0.24;
    const sy = h * (0.52 + lookPitch * 0.35) - zScreen;

    const len = size * 1.6;
    const tx = sx - (a.p.vx / projectileSpeed) * len;
    const ty = sy - (a.p.vy / projectileSpeed) * len - (a.p.vz / projectileSpeed) * len * 0.8;
    ctx.strokeStyle = "rgba(250, 226, 160, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    const dirX = sx - tx;
    const dirY = sy - ty;
    const rot = Math.atan2(dirY, dirX) + Math.PI / 2;
    drawProjectileCrucifixSprite(sx, sy, size * 0.68, rot);
  }
}

function drawDeathGreetings(w, h, depthBuffer) {
  const words = [];
  for (const d of deathGreetings) {
    const dx = d.x - player.x;
    const dy = d.y - player.y;
    const dist = Math.hypot(dx, dy);
    const relA = normAngle(Math.atan2(dy, dx) - player.a);
    if (Math.abs(relA) > fov * 0.75) continue;
    words.push({ d, dist, relA });
  }

  words.sort((a, b) => b.dist - a.dist);

  for (const wv of words) {
    const sx = w / 2 + (wv.relA / (fov / 2)) * (w / 2);
    const xIdx = Math.max(0, Math.min(w - 1, Math.floor(sx)));
    if (wv.dist >= depthBuffer[xIdx]) continue;

    const size = Math.max(18, Math.min(40, (h * 0.65) / Math.max(wv.dist, 0.2)));
    const sy = h * (0.53 + lookPitch * 0.35 - wv.d.rise * 0.15);
    const alpha = Math.max(0, wv.d.life);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `700 ${Math.floor(size * 0.82)}px \"PingFang TC\", \"Heiti TC\", \"Microsoft JhengHei\", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(220, 20, 35, 0.96)";
    ctx.shadowColor = "rgba(180, 180, 180, 0.7)";
    ctx.shadowBlur = 12;
    const chars = [...wv.d.text];
    const lineGap = size * 0.8;
    const startY = sy - ((chars.length - 1) * lineGap) / 2;
    for (let i = 0; i < chars.length; i += 1) {
      ctx.fillText(chars[i], sx, startY + i * lineGap);
    }

    for (let i = 0; i < 4; i += 1) {
      const ox = (Math.random() - 0.5) * 18;
      const oy = (Math.random() - 0.5) * 10;
      const r = 4 + Math.random() * 4;
      ctx.fillStyle = "rgba(180, 180, 180, 0.18)";
      ctx.beginPath();
      ctx.arc(sx + ox, sy + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawHandAndCrucifix(w, h) {
  const recoilX = handKick * 12;
  const recoilY = handKick * 7;

  const handX = w * 0.79 + recoilX;
  const handY = h * 0.84 + recoilY;

  ctx.fillStyle = "rgba(44, 57, 66, 0.94)";
  ctx.beginPath();
  ctx.moveTo(w * 0.7 + recoilX, h * 0.97);
  ctx.lineTo(w * 0.84 + recoilX, h * 0.9 + recoilY * 0.2);
  ctx.lineTo(w * 0.92 + recoilX, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(218, 189, 156, 0.95)";
  ctx.beginPath();
  ctx.ellipse(handX, handY, 34, 24, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const crossX = w * 0.74 + recoilX * 0.6;
  const crossY = h * 0.79 + recoilY * 0.7;

  ctx.fillStyle = "rgba(132, 92, 58, 0.96)";
  ctx.fillRect(crossX - 8, crossY - 52, 16, 108);
  ctx.fillRect(crossX - 34, crossY - 10, 68, 14);
  ctx.strokeStyle = "rgba(255, 234, 186, 0.45)";
  ctx.lineWidth = 1.8;
  ctx.strokeRect(crossX - 8, crossY - 52, 16, 108);
  ctx.strokeRect(crossX - 34, crossY - 10, 68, 14);

  ctx.fillStyle = "rgba(228, 210, 184, 0.95)";
  ctx.beginPath();
  ctx.arc(crossX, crossY - 25, 6.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(228, 210, 184, 0.95)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(crossX, crossY - 18);
  ctx.lineTo(crossX, crossY + 16);
  ctx.stroke();

  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(crossX - 17, crossY - 4);
  ctx.lineTo(crossX + 17, crossY - 4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(crossX - 1, crossY + 16);
  ctx.lineTo(crossX - 7, crossY + 30);
  ctx.moveTo(crossX + 1, crossY + 16);
  ctx.lineTo(crossX + 7, crossY + 30);
  ctx.stroke();

  ctx.fillStyle = "rgba(168, 42, 46, 0.85)";
  ctx.fillRect(crossX - 8, crossY + 8, 16, 6);

  if (handKick > 0.06) {
    const sparkCount = 3;
    for (let i = 0; i < sparkCount; i += 1) {
      const sx = crossX + 18 + i * 11 + Math.random() * 7;
      const sy = crossY - 2 + (Math.random() - 0.5) * 14;
      const s = 5 + Math.random() * 4;
      ctx.strokeStyle = "rgba(250, 228, 164, 0.88)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sx, sy - s);
      ctx.lineTo(sx, sy + s);
      ctx.moveTo(sx - s, sy);
      ctx.lineTo(sx + s, sy);
      ctx.stroke();
    }
  }
}

function render() {
  const w = canvas.width;
  const h = canvas.height;
  const depthBuffer = new Float32Array(w);
  const shakeAmp = screenShakeTime > 0 ? 2.2 + (screenShakeTime / 0.22) * 6.2 : 0;
  const shakeX = (Math.random() - 0.5) * shakeAmp;
  const shakeY = (Math.random() - 0.5) * shakeAmp;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawHungToRoadBackdrop(w, h);

  for (let x = 0; x < w; x += 1) {
    const rayA = player.a - fov / 2 + (x / w) * fov;
    const dist = castRay(rayA);
    depthBuffer[x] = dist;

    const corrected = dist * Math.cos(rayA - player.a);
    const wallH = Math.min(h, (h * 0.95) / Math.max(corrected, 0.001));
    const wallY = (h - wallH) / 2 + lookPitch * h * 0.34;

    const shade = Math.max(0, 230 - corrected * 22);
    ctx.fillStyle = `rgb(${shade * 0.72}, ${shade * 0.8}, ${shade})`;
    ctx.fillRect(x, wallY, 1, wallH);
  }

  const sprites = [];
  for (const g of ghosts) {
    const dx = g.x - player.x;
    const dy = g.y - player.y;
    const dist = Math.hypot(dx, dy);
    const relA = normAngle(Math.atan2(dy, dx) - player.a);
    if (Math.abs(relA) > fov * 0.65) continue;
    sprites.push({ g, dist, relA });
  }

  sprites.sort((a, b) => b.dist - a.dist);

  for (const s of sprites) {
    const sx = w / 2 + (s.relA / (fov / 2)) * (w / 2);
    const baseSize = Math.min(h * 0.7, (h * 0.9) / Math.max(s.dist, 0.15));
    const size = s.g.isBoss ? baseSize * 1.35 : baseSize;
    const flyLift = s.g.isBoss ? (s.g.flyHeight || 0) * size * 0.65 : 0;
    const sy = h * (0.52 + lookPitch * 0.35) - size * 0.6 + Math.sin(s.g.bob) * 8 - flyLift;

    const left = Math.max(0, Math.floor(sx - size * 0.35));
    const right = Math.min(w - 1, Math.floor(sx + size * 0.35));

    let occluded = true;
    for (let x = left; x <= right; x += 3) {
      if (s.dist < depthBuffer[x]) {
        occluded = false;
        break;
      }
    }
    if (occluded) continue;

    const alpha = Math.max(0.18, 1 - s.dist / maxDepth);
    ctx.globalAlpha = alpha;

    if (s.g.isBoss) {
      ctx.fillStyle = "rgba(184, 33, 52, 0.18)";
      ctx.beginPath();
      ctx.ellipse(sx, sy + size * 0.38, size * 0.42, size * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(16, 18, 27, 0.86)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + size * 0.18, size * 0.22, size * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(240, 245, 248, 0.95)";
    ctx.beginPath();
    ctx.arc(sx, sy + size * 0.16, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(15, 15, 20, 0.9)";
    ctx.fillRect(sx - size * 0.16, sy + size * 0.05, size * 0.08, size * 0.24);
    ctx.fillRect(sx + size * 0.08, sy + size * 0.05, size * 0.08, size * 0.24);

    ctx.fillStyle = "rgba(170, 10, 18, 0.9)";
    ctx.beginPath();
    ctx.arc(sx - size * 0.045, sy + size * 0.14, size * 0.018, 0, Math.PI * 2);
    ctx.arc(sx + size * 0.045, sy + size * 0.14, size * 0.018, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(158, 18, 28, 0.92)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + size * 0.22, size * 0.07, size * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(245, 245, 245, 0.95)";
    for (let t = -2; t <= 2; t += 1) {
      const tx = sx + t * size * 0.022;
      ctx.beginPath();
      ctx.moveTo(tx, sy + size * 0.205);
      ctx.lineTo(tx - size * 0.008, sy + size * 0.235);
      ctx.lineTo(tx + size * 0.008, sy + size * 0.235);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "rgba(232, 238, 242, 0.88)";
    ctx.beginPath();
    ctx.moveTo(sx, sy + size * 0.2);
    ctx.lineTo(sx - size * 0.26, sy + size * 0.76);
    ctx.lineTo(sx + size * 0.26, sy + size * 0.76);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(155, 21, 36, 0.85)";
    ctx.fillRect(sx - size * 0.1, sy + size * 0.48, size * 0.2, size * 0.06);

    ctx.fillStyle = "rgba(20, 20, 20, 0.55)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + size * 0.86 + flyLift * 0.85, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  drawDayWeather(w, h);
  drawRoadDetails(w, h);
  drawSupplyPlaneAndDrops(w, h, depthBuffer);
  drawHolyWaterBlast(w, h);
  drawDeathGreetings(w, h, depthBuffer);
  drawProjectileSprites(w, h, depthBuffer);

  drawHandAndCrucifix(w, h);
  drawJesusProtectionLayer(w, h);
  ctx.restore();

  drawDamageFlash(w, h);
  drawLowHealthWarning(w, h);
  drawSupplyPickupFlash(w, h);
}

window.addEventListener("resize", resize);

document.addEventListener(
  "pointerdown",
  () => {
    requestGameFullscreen();
    ensureAudioRunning().then((ok) => {
      if (!ok) return;
      if (gameActive && !musicNodes) startMusic();
    });
  },
  { passive: true },
);

document.addEventListener("keydown", (e) => {
  ensureAudioRunning();
  const wasDown = keys[e.code];
  keys[e.code] = true;

  if (e.code === "KeyS" && !wasDown && gameActive && fireCooldown <= 0) {
    triggerShoot();
  }
  if (e.code === "KeyF" && !wasDown && gameActive && holyWaterCharges > 0) {
    triggerHolyWater();
  }

  if ((e.code === "Enter" || e.code === "Space") && !gameEnded) {
    e.preventDefault();
    requestStart();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

document.addEventListener("mousemove", (e) => {
  if (!gameActive) return;
  if (!lookReady) {
    lookReady = true;
    lastLookX = e.clientX;
    lastLookY = e.clientY;
    return;
  }

  let dx = e.movementX;
  let dy = e.movementY;
  if (!Number.isFinite(dx) || dx === 0) {
    dx = e.clientX - lastLookX;
  }
  if (!Number.isFinite(dy) || dy === 0) {
    dy = e.clientY - lastLookY;
  }

  lastLookX = e.clientX;
  lastLookY = e.clientY;
  applyLookDelta(dx, dy);
});

document.addEventListener(
  "pointerdown",
  (e) => {
    if (e.pointerType !== "touch" || !gameActive) return;
    if (mobileControls && mobileControls.contains(e.target)) return;
    e.preventDefault();
    triggerShoot();
    if (activeTouchLookId !== null) return;
    activeTouchLookId = e.pointerId;
    lastLookX = e.clientX;
    lastLookY = e.clientY;
  },
  { passive: false },
);

document.addEventListener(
  "pointermove",
  (e) => {
    if (e.pointerId !== activeTouchLookId || !gameActive) return;
    e.preventDefault();
    const dx = e.clientX - lastLookX;
    const dy = e.clientY - lastLookY;
    lastLookX = e.clientX;
    lastLookY = e.clientY;
    applyLookDelta(dx, dy);
  },
  { passive: false },
);

document.addEventListener(
  "touchstart",
  (e) => {
    if (!isMobileTouch || !gameActive) return;
    if (touchHolyBtn && touchHolyBtn.contains(e.target)) return;
    e.preventDefault();
  },
  { passive: false },
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!isMobileTouch || !gameActive) return;
    if (touchHolyBtn && touchHolyBtn.contains(e.target)) return;
    e.preventDefault();
  },
  { passive: false },
);

document.addEventListener(
  "touchend",
  (e) => {
    if (!isMobileTouch || !gameActive) return;
    if (touchHolyBtn && touchHolyBtn.contains(e.target)) return;
    e.preventDefault();
  },
  { passive: false },
);

document.addEventListener(
  "pointerup",
  (e) => {
    if (e.pointerId === activeTouchLookId) activeTouchLookId = null;
  },
  { passive: true },
);

document.addEventListener(
  "pointercancel",
  (e) => {
    if (e.pointerId === activeTouchLookId) activeTouchLookId = null;
  },
  { passive: true },
);

if (touchHolyBtn) {
  if ("PointerEvent" in window) {
    touchHolyBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ensureAudioRunning();
      triggerHolyWater();
    });
  } else {
    touchHolyBtn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        ensureAudioRunning();
        triggerHolyWater();
      },
      { passive: false },
    );
    touchHolyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      ensureAudioRunning();
      triggerHolyWater();
    });
  }
}

document.addEventListener("selectstart", (e) => {
  if (isMobileTouch) e.preventDefault();
});

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  requestStart();
});

openCreditsBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  creditsPanel?.classList.remove("hidden");
});

closeCreditsBtn?.addEventListener("click", () => {
  creditsPanel?.classList.add("hidden");
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

resize();
if (isMobileTouch) {
  mobileControls?.classList.remove("hidden");
  mobileControls?.setAttribute("aria-hidden", "false");
}
resetGame();

let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (gameActive) {
    player.x = fixedPosition.x;
    player.y = fixedPosition.y;
    spawnWaveGhosts(dt);
    updateBackgroundMusic(dt);
    updateAttack(dt);
    updateWeather(dt);
    updateSupplyDrops(dt);
    updateGhosts(dt);
    updateDeathGreetings(dt);
    maybeGrantHolyWater();
    checkGameState();
    updateHUD();
  } else {
    handKick = Math.max(0, handKick - dt * 5.5);
    fireCooldown = Math.max(0, fireCooldown - dt);
    holyWaterBlastTime = Math.max(0, holyWaterBlastTime - dt);
    jesusProtectionTime = Math.max(0, jesusProtectionTime - dt);
    supplyFlashTime = Math.max(0, supplyFlashTime - dt);
    damageFlashTime = Math.max(0, damageFlashTime - dt);
    screenShakeTime = Math.max(0, screenShakeTime - dt);
    lightningFlashTime = Math.max(0, lightningFlashTime - dt);
  }

  render();
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

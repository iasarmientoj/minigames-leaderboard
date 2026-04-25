// ============================================================
//  🎮  Lorenzo's Mini Games  –  app.js
// ============================================================

// ---- CONFIG ----
const GOOGLE_FORM_BASE =
    'https://docs.google.com/forms/d/e/1FAIpQLScFg_VcqzTJQlPUREWeQDGG2Qb_Ns2jcxZ7lLNiGAk935WQkg/formResponse';
const FORM_FIELDS = {
    id:     'entry.2011811816',
    player: 'entry.1562344733',
    score:  'entry.1218031775',
};
const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTccpWJRHIvdjMj3uNPBvqQ6plzinFOdd4-Qc9fq71rkmR_GIYDD_lpU6tRP0bxMaEj-E-FN2mtiPLi/pub?gid=1866183539&single=true&output=csv';

const GAME_IDS = {
    clicker: 'clicker',
    dodge: 'dodge',
    chaos: 'chaos',
};

// ---- STATE ----
let playerName = '';
let clickerCount = 0;
let clickerTimer = 30;
let clickerInterval = null;

// ---- DOM REFS ----
const $  = (id) => document.getElementById(id);
const inputName   = $('player-name');
const btnStart    = $('btn-start');
const displayName = $('display-name');

// ============================================================
//  NAVIGATION
// ============================================================
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    $(screenId).classList.add('active');

    // Cargar leaderboard al entrar al juego
    if (screenId === 'screen-clicker') {
        resetClicker();
        loadLeaderboard('clicker');
    }
    if (screenId === 'screen-dodge') {
        resetDodge();
        loadLeaderboard('dodge');
    }
    if (screenId === 'screen-chaos') {
        resetChaos();
        loadLeaderboard('chaos');
    }
}

// ============================================================
//  NAME SCREEN
// ============================================================
inputName.addEventListener('input', () => {
    const val = inputName.value.trim();
    btnStart.disabled = val.length === 0;
});

inputName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && inputName.value.trim().length > 0) {
        confirmName();
    }
});

btnStart.addEventListener('click', confirmName);

function confirmName() {
    playerName = inputName.value.trim();
    if (!playerName) return;
    displayName.textContent = playerName;
    navigateTo('screen-menu');
}

// ============================================================
//  CLICKER GAME
// ============================================================
function startClicker() {
    clickerCount = 0;
    clickerTimer = 30;
    $('clicker-count').textContent = '0';
    $('clicker-timer').textContent = '30';
    $('clicker-timer').className = 'stat-value timer';

    $('clicker-ready').classList.add('hidden');
    $('clicker-playing').classList.remove('hidden');
    $('clicker-done').classList.add('hidden');

    clickerInterval = setInterval(() => {
        clickerTimer--;
        const timerEl = $('clicker-timer');
        timerEl.textContent = clickerTimer;

        // Color warnings
        if (clickerTimer <= 5) {
            timerEl.className = 'stat-value timer danger';
        } else if (clickerTimer <= 10) {
            timerEl.className = 'stat-value timer warning';
        }

        if (clickerTimer <= 0) {
            endClicker();
        }
    }, 1000);
}

function doClick() {
    if (clickerTimer <= 0) return;
    clickerCount++;
    $('clicker-count').textContent = clickerCount;

    // Pop animation
    const btn = $('btn-click');
    btn.classList.remove('pop');
    void btn.offsetWidth; // force reflow
    btn.classList.add('pop');

    // Floating particle
    spawnParticle(event);
}

function spawnParticle(e) {
    const particle = document.createElement('span');
    particle.className = 'click-particle';
    particle.textContent = '+1';
    particle.style.left = (e.clientX - 10) + 'px';
    particle.style.top  = (e.clientY - 10) + 'px';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
}

function endClicker() {
    clearInterval(clickerInterval);
    clickerInterval = null;

    $('clicker-playing').classList.add('hidden');
    $('clicker-done').classList.remove('hidden');
    $('clicker-final-score').textContent = clickerCount;

    // Submit score
    submitScore(GAME_IDS.clicker, clickerCount);
}

function resetClicker() {
    clearInterval(clickerInterval);
    clickerInterval = null;
    clickerCount = 0;
    clickerTimer = 30;

    $('clicker-ready').classList.remove('hidden');
    $('clicker-playing').classList.add('hidden');
    $('clicker-done').classList.add('hidden');
    $('submit-status').textContent = '';
    $('submit-status').className = 'submit-status';
}

// ============================================================
//  DODGE GAME
// ============================================================
let dodgeScore = 0;
let dodgeAnimationFrame = null;
let isDodging = false;
let player = { x: 135, y: 350, w: 30, h: 30, speed: 6, dx: 0 };
let obstacles = [];
let obstacleSpeed = 3;
let frameCount = 0;

// Keys
const keys = { ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
        // Prevent default scrolling for arrows
        if (isDodging) e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

function startDodge() {
    dodgeScore = 0;
    obstacleSpeed = 3;
    frameCount = 0;
    obstacles = [];
    player.x = 135;
    isDodging = true;

    $('dodge-score').textContent = '0';
    $('dodge-ready').classList.add('hidden');
    $('dodge-playing').classList.remove('hidden');
    $('dodge-done').classList.add('hidden');

    window.focus();
    dodgeAnimationFrame = requestAnimationFrame(dodgeLoop);
}

function dodgeLoop() {
    if (!isDodging) return;

    const canvas = $('dodge-canvas');
    const ctx = canvas.getContext('2d');

    // Update
    frameCount++;
    if (frameCount % 60 === 0) { // Every ~1 second
        dodgeScore += 10;
        $('dodge-score').textContent = dodgeScore;
        obstacleSpeed += 0.1; // Gets faster
    }

    // Move player
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

    // Spawn obstacles
    if (Math.random() < 0.05 + (obstacleSpeed * 0.005)) { // Spawn rate increases slightly
        const w = 20 + Math.random() * 30;
        obstacles.push({
            x: Math.random() * (canvas.width - w),
            y: -50,
            w: w,
            h: 20 + Math.random() * 20,
            speed: obstacleSpeed + Math.random() * 2
        });
    }

    // Move and check collisions
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obs.speed;

        // Draw obstacle
        ctx.fillStyle = '#f43f5e'; // accent-3 red
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Collision detection
        if (
            player.x < obs.x + obs.w &&
            player.x + player.w > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.h > obs.y
        ) {
            endDodge();
            return;
        }
    }

    // Remove offscreen obstacles
    obstacles = obstacles.filter(obs => obs.y < canvas.height);

    // Draw player
    ctx.fillStyle = '#06b6d4'; // accent-2 blue
    ctx.fillRect(player.x, player.y, player.w, player.h);

    if (isDodging) {
        dodgeAnimationFrame = requestAnimationFrame(dodgeLoop);
    }
}

function endDodge() {
    isDodging = false;
    cancelAnimationFrame(dodgeAnimationFrame);

    $('dodge-playing').classList.add('hidden');
    $('dodge-done').classList.remove('hidden');
    $('dodge-final-score').textContent = dodgeScore;

    submitScore(GAME_IDS.dodge, dodgeScore, 'submit-status-dodge');
}

function resetDodge() {
    isDodging = false;
    cancelAnimationFrame(dodgeAnimationFrame);
    dodgeScore = 0;
    
    const canvas = $('dodge-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    $('dodge-ready').classList.remove('hidden');
    $('dodge-playing').classList.add('hidden');
    $('dodge-done').classList.add('hidden');
    
    if ($('submit-status-dodge')) {
        $('submit-status-dodge').textContent = '';
        $('submit-status-dodge').className = 'submit-status';
    }
}

// ============================================================
//  CHAOS DODGE GAME
// ============================================================
let chaosTimer = 0;
let chaosInterval = null;
let chaosCanvas, chaosCtx;
let chaosPlayer = { x: 200, y: 150, radius: 12, color: '#06b6d4' };
let chaosObstacles = [];
let chaosGameActive = false;
let chaosAnimationId = null;
let chaosKeys = {};

window.addEventListener('keydown', (e) => { chaosKeys[e.code] = true; });
window.addEventListener('keyup', (e) => { chaosKeys[e.code] = false; });

function initChaos() {
    chaosCanvas = $('chaos-canvas');
    if (!chaosCanvas) return;
    chaosCtx = chaosCanvas.getContext('2d');
}

function startChaos() {
    if (!chaosCanvas) initChaos();

    chaosTimer = 0;
    $('chaos-timer').textContent = '0';
    
    chaosPlayer.x = chaosCanvas.width / 2;
    chaosPlayer.y = chaosCanvas.height / 2;
    chaosObstacles = [];
    chaosGameActive = true;

    $('chaos-ready').classList.add('hidden');
    $('chaos-playing').classList.remove('hidden');
    $('chaos-done').classList.add('hidden');

    // Timer interval
    chaosInterval = setInterval(() => {
        chaosTimer++;
        $('chaos-timer').textContent = chaosTimer;
        
        // Add difficulty over time
        if (chaosTimer % 2 === 0) {
            spawnChaosObstacle();
        }
    }, 1000);

    // Initial obstacles
    for(let i=0; i<5; i++) spawnChaosObstacle();

    gameLoopChaos();
}

function spawnChaosObstacle() {
    if (!chaosCanvas) return;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const speed = 1.5 + Math.random() * 2 + (chaosTimer / 15);
    
    if (side === 0) { x = -20; y = Math.random() * chaosCanvas.height; } // Left
    else if (side === 1) { x = chaosCanvas.width + 20; y = Math.random() * chaosCanvas.height; } // Right
    else if (side === 2) { x = Math.random() * chaosCanvas.width; y = -20; } // Top
    else { x = Math.random() * chaosCanvas.width; y = chaosCanvas.height + 20; } // Bottom

    // Randomize angle a bit towards center
    const dx = chaosCanvas.width / 2 - x;
    const dy = chaosCanvas.height / 2 - y;
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;

    chaosObstacles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 8 + Math.random() * 12,
        color: '#f43f5e'
    });
}

function gameLoopChaos() {
    if (!chaosGameActive) return;
    updateChaos();
    drawChaos();
    chaosAnimationId = requestAnimationFrame(gameLoopChaos);
}

function updateChaos() {
    // Player movement
    const pSpeed = 4;
    if (chaosKeys['ArrowUp'] || chaosKeys['KeyW']) chaosPlayer.y -= pSpeed;
    if (chaosKeys['ArrowDown'] || chaosKeys['KeyS']) chaosPlayer.y += pSpeed;
    if (chaosKeys['ArrowLeft'] || chaosKeys['KeyA']) chaosPlayer.x -= pSpeed;
    if (chaosKeys['ArrowRight'] || chaosKeys['KeyD']) chaosPlayer.x += pSpeed;

    // Constrain player
    chaosPlayer.x = Math.max(chaosPlayer.radius, Math.min(chaosCanvas.width - chaosPlayer.radius, chaosPlayer.x));
    chaosPlayer.y = Math.max(chaosPlayer.radius, Math.min(chaosCanvas.height - chaosPlayer.radius, chaosPlayer.y));

    // Obstacles movement & collision
    for (let i = chaosObstacles.length - 1; i >= 0; i--) {
        const obs = chaosObstacles[i];
        obs.x += obs.vx;
        obs.y += obs.vy;

        // Collision check
        const dist = Math.hypot(chaosPlayer.x - obs.x, chaosPlayer.y - obs.y);
        if (dist < chaosPlayer.radius + obs.radius) {
            endChaos();
            return;
        }

        // Remove out of bounds (with margin)
        if (obs.x < -100 || obs.x > chaosCanvas.width + 100 || obs.y < -100 || obs.y > chaosCanvas.height + 100) {
            chaosObstacles.splice(i, 1);
        }
    }
}

function drawChaos() {
    chaosCtx.clearRect(0, 0, chaosCanvas.width, chaosCanvas.height);

    // Draw player
    chaosCtx.beginPath();
    chaosCtx.arc(chaosPlayer.x, chaosPlayer.y, chaosPlayer.radius, 0, Math.PI * 2);
    chaosCtx.fillStyle = chaosPlayer.color;
    chaosCtx.shadowBlur = 10;
    chaosCtx.shadowColor = chaosPlayer.color;
    chaosCtx.fill();
    chaosCtx.closePath();

    // Draw obstacles
    chaosCtx.shadowBlur = 8;
    chaosObstacles.forEach(obs => {
        chaosCtx.beginPath();
        chaosCtx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        chaosCtx.fillStyle = obs.color;
        chaosCtx.shadowColor = obs.color;
        chaosCtx.fill();
        chaosCtx.closePath();
    });
    chaosCtx.shadowBlur = 0;
}

function endChaos() {
    chaosGameActive = false;
    clearInterval(chaosInterval);
    cancelAnimationFrame(chaosAnimationId);

    $('chaos-playing').classList.add('hidden');
    $('chaos-done').classList.remove('hidden');
    $('chaos-final-score').textContent = chaosTimer;

    submitScore('chaos', chaosTimer, 'submit-status-chaos');
}

function resetChaos() {
    chaosGameActive = false;
    clearInterval(chaosInterval);
    if (chaosAnimationId) cancelAnimationFrame(chaosAnimationId);
    
    if (chaosCanvas) {
        chaosCtx.clearRect(0, 0, chaosCanvas.width, chaosCanvas.height);
    }

    $('chaos-ready').classList.remove('hidden');
    $('chaos-playing').classList.add('hidden');
    $('chaos-done').classList.add('hidden');
    
    const statusEl = $('submit-status-chaos');
    if (statusEl) {
        statusEl.textContent = '';
        statusEl.className = 'submit-status';
    }
}

// ============================================================
//  SUBMIT SCORE (Google Forms)
// ============================================================
function submitScore(gameId, score, statusId = 'submit-status') {
    const statusEl = $(statusId);
    if (!statusEl) return;
    
    statusEl.textContent = '⏳ Enviando puntuación...';
    statusEl.className = 'submit-status';

    // Build the form URL
    const params = new URLSearchParams();
    params.set(FORM_FIELDS.id,     gameId);
    params.set(FORM_FIELDS.player, playerName);
    params.set(FORM_FIELDS.score,  score.toString());

    const url = `${GOOGLE_FORM_BASE}?${params.toString()}`;

    // Use the hidden iframe to submit (avoids CORS and doesn't open a new tab)
    const iframe = $('hidden-iframe');
    iframe.src = url;

    // We can't really detect success via iframe cross-origin,
    // so we just assume success after a short wait and reload leaderboard
    setTimeout(() => {
        statusEl.textContent = '✅ ¡Puntuación enviada!';
        statusEl.className = 'submit-status success';
        // Reload leaderboard after a moment to let sheets update
        setTimeout(() => loadLeaderboard(gameId), 3000);
    }, 2000);
}

// ============================================================
//  LEADERBOARD (Google Sheets CSV)
// ============================================================
function loadLeaderboard(gameId) {
    const container = $(`leaderboard-${gameId}`);
    container.innerHTML = '<p class="lb-loading">⏳ Cargando leaderboard...</p>';

    // Add cache buster to avoid stale data
    const url = `${SHEET_CSV_URL}&_t=${Date.now()}`;

    fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error('Network error');
            return res.text();
        })
        .then((csv) => {
            const rows = parseCSV(csv);
            // Filter by game id
            const filtered = rows.filter((r) => r.id === gameId);
            // Sort by score descending
            filtered.sort((a, b) => Number(b.score) - Number(a.score));
            // Take top 15
            const top = filtered.slice(0, 15);
            renderLeaderboard(container, top);
        })
        .catch((err) => {
            console.error('Leaderboard error:', err);
            container.innerHTML =
                '<p class="lb-loading">⚠️ No se pudo cargar el leaderboard. Inténtalo de nuevo.</p>';
        });
}

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    // First line is header:  "Marca temporal,id,player,score"
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 4) {
            results.push({
                timestamp: cols[0],
                id:        cols[1].trim(),
                player:    cols[2].trim(),
                score:     cols[3].trim(),
            });
        }
    }
    return results;
}

function renderLeaderboard(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="lb-empty">🏜️ Aún no hay puntuaciones. ¡Sé el primero!</p>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    let html = `
        <table class="lb">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Puntos</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach((row, i) => {
        const rank = i + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const medal = medals[i] || rank;
        html += `
            <tr>
                <td class="rank-cell ${rankClass}">${medal}</td>
                <td>${escapeHtml(row.player)}</td>
                <td>${escapeHtml(row.score)}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
//  🎮  Lorenzo's Mini Games  –  core.js
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

// Registry for games to hook into navigation
const GAME_REGISTRY = {};

function registerGame(gameId, config) {
    GAME_REGISTRY[gameId] = config;
}

// ---- STATE ----
let playerName = '';

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

    // Extract game ID from screen ID (e.g., screen-clicker -> clicker)
    const gameId = screenId.replace('screen-', '');
    
    // If it's a registered game, reset it and load its leaderboard
    if (GAME_REGISTRY[gameId]) {
        if (GAME_REGISTRY[gameId].reset) GAME_REGISTRY[gameId].reset();
        loadLeaderboard(gameId);
    }
}

// ============================================================
//  NAME SCREEN
// ============================================================
if (inputName) {
    inputName.addEventListener('input', () => {
        const val = inputName.value.trim();
        btnStart.disabled = val.length === 0;
    });

    inputName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && inputName.value.trim().length > 0) {
            confirmName();
        }
    });
}

if (btnStart) btnStart.addEventListener('click', confirmName);

function confirmName() {
    playerName = inputName.value.trim();
    if (!playerName) return;
    localStorage.setItem('minigames_player', playerName);
    displayName.textContent = playerName;
    navigateTo('screen-menu');
}

function changeName() {
    localStorage.removeItem('minigames_player');
    inputName.value = playerName;
    navigateTo('screen-name');
}

// Check saved name on load
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('minigames_player');
    if (saved) {
        playerName = saved;
        if (inputName) inputName.value = playerName;
        if (btnStart) btnStart.disabled = false;
        if (displayName) displayName.textContent = playerName;
        navigateTo('screen-menu');
    }
});

// ============================================================
//  SUBMIT SCORE (Google Forms)
// ============================================================
function submitScore(gameId, score, statusId = 'submit-status') {
    const statusEl = $(statusId);
    if (!statusEl) return;
    
    statusEl.textContent = '⏳ Enviando puntuación...';
    statusEl.className = 'submit-status';

    const params = new URLSearchParams();
    params.set(FORM_FIELDS.id,     gameId);
    params.set(FORM_FIELDS.player, playerName);
    params.set(FORM_FIELDS.score,  score.toString());

    const url = `${GOOGLE_FORM_BASE}?${params.toString()}`;
    const iframe = $('hidden-iframe');
    if (iframe) iframe.src = url;

    setTimeout(() => {
        statusEl.textContent = '✅ ¡Puntuación enviada!';
        statusEl.className = 'submit-status success';
        setTimeout(() => loadLeaderboard(gameId), 3000);
    }, 2000);
}

// ============================================================
//  LEADERBOARD (Google Sheets CSV)
// ============================================================
function loadLeaderboard(gameId) {
    const container = $(`leaderboard-${gameId}`);
    if (!container) return;
    
    container.innerHTML = '<p class="lb-loading">⏳ Cargando leaderboard...</p>';

    const url = `${SHEET_CSV_URL}&_t=${Date.now()}`;

    fetch(url, { cache: 'no-store' })
        .then((res) => {
            if (!res.ok) throw new Error('Network error');
            return res.text();
        })
        .then((csv) => {
            const rows = parseCSV(csv);
            const filtered = rows.filter((r) => r.id === gameId);
            
            // Ordenar: Reaction Time es de menor a mayor (ms). Los demás de mayor a menor.
            if (gameId === 'reaction') {
                filtered.sort((a, b) => Number(a.score) - Number(b.score));
            } else {
                filtered.sort((a, b) => Number(b.score) - Number(a.score));
            }
            
            const top = filtered.slice(0, 15);
            renderLeaderboard(container, top, gameId);
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

function renderLeaderboard(container, data, gameId = null) {
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
                <td>${escapeHtml(row.score)}${gameId === 'reaction' ? ' ms' : ''}</td>
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

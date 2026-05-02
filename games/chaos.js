// ============================================================
//  🌀 Chaos Dodge Game
// ============================================================

(function() {
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

        chaosInterval = setInterval(() => {
            chaosTimer++;
            $('chaos-timer').textContent = chaosTimer;
        }, 1000);

        for(let i=0; i<4; i++) spawnChaosObstacle();

        gameLoopChaos();
    }

    function spawnChaosObstacle() {
        if (!chaosCanvas) return;
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const speed = 1.2 + Math.random() * 1.5 + (chaosTimer / 12);
        
        if (side === 0) { x = -20; y = Math.random() * chaosCanvas.height; }
        else if (side === 1) { x = chaosCanvas.width + 20; y = Math.random() * chaosCanvas.height; }
        else if (side === 2) { x = Math.random() * chaosCanvas.width; y = -20; }
        else { x = Math.random() * chaosCanvas.width; y = chaosCanvas.height + 20; }

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
        
        const spawnChance = 0.03 + (chaosTimer * 0.004);
        if (Math.random() < spawnChance) {
            spawnChaosObstacle();
        }
        
        updateChaos();
        drawChaos();
        chaosAnimationId = requestAnimationFrame(gameLoopChaos);
    }

    function updateChaos() {
        const pSpeed = 4;
        if (chaosKeys['ArrowUp'] || chaosKeys['KeyW']) chaosPlayer.y -= pSpeed;
        if (chaosKeys['ArrowDown'] || chaosKeys['KeyS']) chaosPlayer.y += pSpeed;
        if (chaosKeys['ArrowLeft'] || chaosKeys['KeyA']) chaosPlayer.x -= pSpeed;
        if (chaosKeys['ArrowRight'] || chaosKeys['KeyD']) chaosPlayer.x += pSpeed;

        chaosPlayer.x = Math.max(chaosPlayer.radius, Math.min(chaosCanvas.width - chaosPlayer.radius, chaosPlayer.x));
        chaosPlayer.y = Math.max(chaosPlayer.radius, Math.min(chaosCanvas.height - chaosPlayer.radius, chaosPlayer.y));

        for (let i = chaosObstacles.length - 1; i >= 0; i--) {
            const obs = chaosObstacles[i];
            obs.x += obs.vx;
            obs.y += obs.vy;

            const dist = Math.hypot(chaosPlayer.x - obs.x, chaosPlayer.y - obs.y);
            if (dist < chaosPlayer.radius + obs.radius) {
                endChaos();
                return;
            }

            if (obs.x < -100 || obs.x > chaosCanvas.width + 100 || obs.y < -100 || obs.y > chaosCanvas.height + 100) {
                chaosObstacles.splice(i, 1);
            }
        }
    }

    function drawChaos() {
        chaosCtx.clearRect(0, 0, chaosCanvas.width, chaosCanvas.height);

        chaosCtx.beginPath();
        chaosCtx.arc(chaosPlayer.x, chaosPlayer.y, chaosPlayer.radius, 0, Math.PI * 2);
        chaosCtx.fillStyle = chaosPlayer.color;
        chaosCtx.shadowBlur = 10;
        chaosCtx.shadowColor = chaosPlayer.color;
        chaosCtx.fill();
        chaosCtx.closePath();

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

    window.startChaos = startChaos;
    window.resetChaos = resetChaos;

    registerGame('chaos', {
        reset: resetChaos
    });
})();

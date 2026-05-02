// ============================================================
//  🚗 Dodge Game
// ============================================================

(function() {
    let dodgeScore = 0;
    let dodgeAnimationFrame = null;
    let isDodging = false;
    let player = { x: 135, y: 350, w: 30, h: 30, speed: 6, dx: 0 };
    let obstacles = [];
    let obstacleSpeed = 3;
    let frameCount = 0;

    const keys = { ArrowLeft: false, ArrowRight: false };

    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = true;
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

        frameCount++;
        if (frameCount % 60 === 0) {
            dodgeScore += 10;
            $('dodge-score').textContent = dodgeScore;
            obstacleSpeed += 0.1;
        }

        if (keys.ArrowLeft) player.x -= player.speed;
        if (keys.ArrowRight) player.x += player.speed;

        if (player.x < 0) player.x = 0;
        if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

        if (Math.random() < 0.05 + (obstacleSpeed * 0.005)) {
            const w = 20 + Math.random() * 30;
            obstacles.push({
                x: Math.random() * (canvas.width - w),
                y: -50,
                w: w,
                h: 20 + Math.random() * 20,
                speed: obstacleSpeed + Math.random() * 2
            });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.y += obs.speed;

            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

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

        obstacles = obstacles.filter(obs => obs.y < canvas.height);

        ctx.fillStyle = '#06b6d4';
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

        submitScore('dodge', dodgeScore, 'submit-status-dodge');
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

    window.startDodge = startDodge;

    registerGame('dodge', {
        reset: resetDodge
    });
})();

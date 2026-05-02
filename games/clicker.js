// ============================================================
//  👆 Speed Clicker Game
// ============================================================

(function() {
    let clickerCount = 0;
    let clickerTimer = 30;
    let clickerInterval = null;

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

        const btn = $('btn-click');
        btn.classList.remove('pop');
        void btn.offsetWidth; // force reflow
        btn.classList.add('pop');

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

        submitScore('clicker', clickerCount);
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

    // Export functions to global scope for HTML onclicks
    window.startClicker = startClicker;
    window.doClick = doClick;

    // Register with core system
    registerGame('clicker', {
        reset: resetClicker
    });
})();

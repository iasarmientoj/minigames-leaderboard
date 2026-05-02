// ============================================================
//  ⚡ Reaction Time Game
// ============================================================

(function() {
    let reactionState = 'idle'; // 'idle', 'wait', 'go', 'done'
    let timeoutId = null;
    let startTime = 0;
    let reactionTime = 0;

    function startReaction() {
        $('reaction-ready').classList.add('hidden');
        $('reaction-playing').classList.remove('hidden');
        $('reaction-done').classList.add('hidden');

        setWaitState();
    }

    function setWaitState() {
        reactionState = 'wait';
        const box = $('reaction-box');
        const msg = $('reaction-msg');
        
        box.className = 'reaction-box wait';
        msg.textContent = 'Esperando... (¡No hagas clic aún!)';

        // Random delay between 2 and 5 seconds
        const delay = 2000 + Math.random() * 3000;
        
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(setGoState, delay);
    }

    function setGoState() {
        if (reactionState !== 'wait') return;
        
        reactionState = 'go';
        const box = $('reaction-box');
        const msg = $('reaction-msg');
        
        box.className = 'reaction-box go';
        msg.textContent = '¡CLIC AHORA!';
        
        startTime = Date.now();
    }

    function clickReactionBox() {
        if (reactionState === 'wait') {
            // Early click!
            if (timeoutId) clearTimeout(timeoutId);
            reactionState = 'idle';
            
            const box = $('reaction-box');
            const msg = $('reaction-msg');
            box.className = 'reaction-box early';
            msg.textContent = '¡Falsa salida! Clickea para reintentar.';
            
            // Al hacer clic de nuevo, reinicia
            box.onclick = () => {
                box.onclick = null;
                setWaitState();
            };
        } else if (reactionState === 'go') {
            // Good click!
            const endTime = Date.now();
            reactionTime = endTime - startTime;
            endReaction();
        }
    }

    // Usamos onmousedown para que sea más rápido que onclick
    window.clickReactionBox = clickReactionBox;

    function endReaction() {
        reactionState = 'done';
        $('reaction-playing').classList.add('hidden');
        $('reaction-done').classList.remove('hidden');
        $('reaction-final-score').textContent = reactionTime;

        submitScore('reaction', reactionTime, 'submit-status-reaction');
    }

    function resetReaction() {
        reactionState = 'idle';
        if (timeoutId) clearTimeout(timeoutId);
        
        $('reaction-ready').classList.remove('hidden');
        $('reaction-playing').classList.add('hidden');
        $('reaction-done').classList.add('hidden');
        
        const box = $('reaction-box');
        box.onclick = null; // Clean up early click handler
        
        const statusEl = $('submit-status-reaction');
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.className = 'submit-status';
        }
    }

    window.startReaction = startReaction;
    window.resetReaction = resetReaction;

    registerGame('reaction', {
        reset: resetReaction
    });
})();

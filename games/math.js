// ============================================================
//  🧮 Math Sprint Game
// ============================================================

(function() {
    let mathScore = 0;
    let mathTimer = 60;
    let mathInterval = null;
    let currentProblem = null;
    let difficultyMultiplier = 1;

    function generateProblem() {
        // As time goes down, maybe problems get slightly harder, but let's stick to base for now.
        // The user didn't specify, so let's make it random but fair.
        const types = ['add', 'multiply', 'divide'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let num1, num2, answer, text;

        if (type === 'add') {
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            answer = num1 + num2;
            text = `${num1} + ${num2}`;
        } else if (type === 'multiply') {
            num1 = Math.floor(Math.random() * 11) + 2; // 2 to 12
            num2 = Math.floor(Math.random() * 11) + 2;
            answer = num1 * num2;
            text = `${num1} × ${num2}`;
        } else if (type === 'divide') {
            num2 = Math.floor(Math.random() * 11) + 2; // Divisor (2 to 12)
            answer = Math.floor(Math.random() * 11) + 2; // Answer (2 to 12)
            num1 = num2 * answer; // Dividend
            text = `${num1} ÷ ${num2}`;
        }

        return { text, answer };
    }

    function showNewProblem() {
        currentProblem = generateProblem();
        const problemEl = $('math-problem');
        if (problemEl) {
            problemEl.textContent = currentProblem.text;
            problemEl.classList.remove('pop-math');
            void problemEl.offsetWidth; // force reflow
            problemEl.classList.add('pop-math');
        }
        const inputEl = $('math-answer-input');
        if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
        }
    }

    function startMath() {
        mathScore = 0;
        mathTimer = 60;
        $('math-score').textContent = '0';
        $('math-timer').textContent = '60';
        $('math-timer').className = 'stat-value timer';

        $('math-ready').classList.add('hidden');
        $('math-playing').classList.remove('hidden');
        $('math-done').classList.add('hidden');

        showNewProblem();

        mathInterval = setInterval(() => {
            mathTimer--;
            const timerEl = $('math-timer');
            timerEl.textContent = mathTimer;

            if (mathTimer <= 10) {
                timerEl.className = 'stat-value timer danger';
            } else if (mathTimer <= 20) {
                timerEl.className = 'stat-value timer warning';
            }

            if (mathTimer <= 0) {
                endMath();
            }
        }, 1000);
    }

    function checkMathAnswer() {
        if (mathTimer <= 0) return;
        
        const inputEl = $('math-answer-input');
        const userAnswer = parseInt(inputEl.value, 10);
        
        if (isNaN(userAnswer)) return;

        if (userAnswer === currentProblem.answer) {
            mathScore++;
            $('math-score').textContent = mathScore;
            
            // Visual feedback
            inputEl.classList.remove('correct', 'incorrect');
            void inputEl.offsetWidth;
            inputEl.classList.add('correct');
            
            spawnMathParticle();
            showNewProblem();
        } else {
            // Visual feedback for wrong answer (shake)
            inputEl.classList.remove('correct', 'incorrect');
            void inputEl.offsetWidth;
            inputEl.classList.add('incorrect');
            
            // Clear input so they can try again
            setTimeout(() => {
                inputEl.value = '';
            }, 300);
        }
    }

    function spawnMathParticle() {
        const inputEl = $('math-answer-input');
        const rect = inputEl.getBoundingClientRect();
        
        const particle = document.createElement('span');
        particle.className = 'click-particle';
        particle.textContent = '+1';
        particle.style.left = (rect.left + rect.width / 2) + 'px';
        particle.style.top  = (rect.top - 20) + 'px';
        particle.style.color = 'var(--success)';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 700);
    }

    function endMath() {
        clearInterval(mathInterval);
        mathInterval = null;

        $('math-playing').classList.add('hidden');
        $('math-done').classList.remove('hidden');
        $('math-final-score').textContent = mathScore;

        submitScore('math', mathScore, 'submit-status-math');
    }

    function resetMath() {
        clearInterval(mathInterval);
        mathInterval = null;
        mathScore = 0;
        mathTimer = 60;

        $('math-ready').classList.remove('hidden');
        $('math-playing').classList.add('hidden');
        $('math-done').classList.add('hidden');
        
        const statusEl = $('submit-status-math');
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.className = 'submit-status';
        }
    }

    // Export functions to global scope for HTML
    window.startMath = startMath;
    window.checkMathAnswer = checkMathAnswer;
    window.resetMath = resetMath;

    // Listen to Enter key on input
    window.addEventListener('DOMContentLoaded', () => {
        // Will attach listener when the DOM is fully loaded or after navigation
        // It's safer to attach it directly in index.html or rely on global event delegation
        document.body.addEventListener('keydown', (e) => {
            if (e.target && e.target.id === 'math-answer-input' && e.key === 'Enter') {
                checkMathAnswer();
            }
        });
    });

    // Register with core system
    registerGame('math', {
        reset: resetMath
    });
})();

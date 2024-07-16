document.addEventListener('DOMContentLoaded', () => {
    class Motus {
        constructor() {
            this.words = [];
            this.secretWord = '';
            this.attempts = 0;
            this.maxAttempts = 6;
            this.wordDisplay = document.getElementById('word-display');
            this.guessInput = document.getElementById('guess-input');
            this.message = document.getElementById('message');
            this.scoreForm = document.getElementById('score-form');
            this.playerNameInput = document.getElementById('player-name');
            this.submitScoreButton = document.getElementById('submit-score');
            this.loadWords();
        }

        async loadWords() {
            try {
                const response = await fetch('mots.json');
                this.words = await response.json();
                this.startGame();
            } catch (error) {
                console.error('Erreur de chargement des mots:', error);
            }
        }

        startGame() {
            this.secretWord = this.getRandomWord();
            this.displayWord();
            document.getElementById('submit-guess').addEventListener('click', () => this.handleGuess());
            this.submitScoreButton.addEventListener('click', () => this.submitScore());
        }

        getRandomWord() {
            const randomIndex = Math.floor(Math.random() * this.words.length);
            return this.words[randomIndex].mot;
        }

        displayWord() {
            const displayedWord = this.secretWord.charAt(0) + '_'.repeat(this.secretWord.length - 1);
            this.wordDisplay.textContent = displayedWord;
        }

        handleGuess() {
            const guess = this.guessInput.value.trim().toLowerCase();
            if (guess.length !== this.secretWord.length) {
                this.showMessage('Le mot doit être de 6 lettres.');
                return;
            }

            this.attempts++;
            if (guess === this.secretWord) {
                this.showMessage('Félicitations! Vous avez deviné le mot!', 'success');
                this.wordDisplay.textContent = this.secretWord;
                this.showScoreForm();
            } else if (this.attempts >= this.maxAttempts) {
                this.showMessage(`Vous avez perdu😅. Le mot était: ${this.secretWord}`, 'error');
                this.wordDisplay.textContent = this.secretWord;
                this.showScoreForm();
            } else {
                this.showMessage(`Tentative ${this.attempts}/${this.maxAttempts}. Réessayez.`);
                this.updateDisplay(guess);
            }

            this.guessInput.value = '';
        }

        updateDisplay(guess) {
            let displayedWord = this.secretWord.charAt(0);
            for (let i = 1; i < this.secretWord.length; i++) {
                if (guess[i] === this.secretWord[i]) {
                    displayedWord += this.secretWord[i];
                } else {
                    displayedWord += '_';
                }
            }
            this.wordDisplay.textContent = displayedWord;
        }

        showMessage(msg, type = 'info') {
            this.message.textContent = msg;
            this.message.className = type;
        }

        showScoreForm() {
            this.scoreForm.classList.remove('hidden');
        }

        async submitScore() {
            const playerName = this.playerNameInput.value.trim();
            if (!playerName) {
                this.showMessage('Veuillez entrer votre nom.', 'error');
                return;
            }

            const score = this.maxAttempts - this.attempts;
            const data = { name: playerName, word: this.secretWord, score: score };

            try {
                const response = await fetch('http://localhost:3000/submit-score', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.success) {
                    this.showMessage('Score soumis avec succès!', 'success');
                    this.scoreForm.classList.add('hidden');
                } else {
                    this.showMessage('Erreur lors de la soumission du score.', 'error');
                }
            } catch (error) {
                this.showMessage('Erreur de connexion au serveur.', 'error');
            }
        }
    }

    new Motus();
});
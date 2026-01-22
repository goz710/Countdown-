// Global variables
let userPoints = 0;
let predictions = JSON.parse(localStorage.getItem('wc2026_predictions') || '{}');
let triviaAnswered = false;

// World Cup date (kick-off expected June 11, 2026)
const worldCupDate = new Date('2026-06-11T00:00:00');

// Sample matches data (you can update these later with real fixtures)
const matches = [
    { id: 1, date: '2026-06-11', time: '14:00', team1: 'Mexico', team2: 'TBD', venue: 'Estadio Azteca, Mexico City', stage: 'Opening Match', group: 'A' },
    { id: 2, date: '2026-06-12', time: '17:00', team1: 'USA', team2: 'TBD', venue: 'SoFi Stadium, Los Angeles', stage: 'Group Stage', group: 'B' },
    { id: 3, date: '2026-06-12', time: '20:00', team1: 'Canada', team2: 'TBD', venue: 'BMO Field, Toronto', stage: 'Group Stage', group: 'C' },
    { id: 4, date: '2026-06-13', time: '15:00', team1: 'Argentina', team2: 'TBD', venue: 'MetLife Stadium, New York/New Jersey', stage: 'Group Stage', group: 'D' },
    { id: 5, date: '2026-06-13', time: '18:00', team1: 'Brazil', team2: 'TBD', venue: 'Hard Rock Stadium, Miami', stage: 'Group Stage', group: 'E' },
    { id: 6, date: '2026-06-14', time: '16:00', team1: 'England', team2: 'TBD', venue: 'Arrowhead Stadium, Kansas City', stage: 'Group Stage', group: 'F' },
];

// Sample teams (expand as needed)
const teams = [
    { name: 'Argentina', flag: '🇦🇷', group: 'D', fifa_rank: 1 },
    { name: 'Brazil', flag: '🇧🇷', group: 'E', fifa_rank: 5 },
    { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'F', fifa_rank: 4 },
    { name: 'France', flag: '🇫🇷', group: 'G', fifa_rank: 2 },
    { name: 'Germany', flag: '🇩🇪', group: 'H', fifa_rank: 11 },
    { name: 'Spain', flag: '🇪🇸', group: 'A', fifa_rank: 3 },
    { name: 'Mexico', flag: '🇲🇽', group: 'A', fifa_rank: 15 },
    { name: 'USA', flag: '🇺🇸', group: 'B', fifa_rank: 13 },
    { name: 'Canada', flag: '🇨🇦', group: 'C', fifa_rank: 40 },
    { name: 'Portugal', flag: '🇵🇹', group: 'D', fifa_rank: 6 },
    { name: 'Netherlands', flag: '🇳🇱', group: 'E', fifa_rank: 7 },
    { name: 'Italy', flag: '🇮🇹', group: 'F', fifa_rank: 9 },
];

// Daily trivia (for demo — in real app you'd rotate questions)
const triviaQuestion = {
    question: "Which country has won the most FIFA World Cup titles?",
    options: ["Germany", "Brazil", "Italy", "Argentina"],
    correct: 1, // index of "Brazil"
    explanation: "Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002), more than any other nation!"
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    startCountdown();
    renderTrivia();
    renderMatches();
    renderTeams();
    renderUserPredictions();     // ← now called!
    updateStats();

    // Event delegation for prediction buttons
    document.getElementById('matchList').addEventListener('click', function(e) {
        if (e.target.matches('.submit-prediction')) {
            const matchId = parseInt(e.target.dataset.matchId);
            submitPrediction(matchId);
        }
    });
});

// Tab switching
function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
}

// Countdown
function startCountdown() {
    function update() {
        const diff = worldCupDate - new Date();
        if (diff < 0) {
            document.getElementById('days').textContent = 0;
            document.getElementById('hours').textContent = 0;
            document.getElementById('minutes').textContent = 0;
            document.getElementById('seconds').textContent = 0;
            return;
        }
        document.getElementById('days').textContent    = Math.floor(diff / 86400000);
        document.getElementById('hours').textContent   = Math.floor((diff / 3600000) % 24);
        document.getElementById('minutes').textContent = Math.floor((diff / 60000) % 60);
        document.getElementById('seconds').textContent = Math.floor((diff / 1000) % 60);
    }
    update();
    setInterval(update, 1000);
}

// Trivia
function renderTrivia() {
    document.getElementById('triviaQuestion').textContent = triviaQuestion.question;
    const container = document.getElementById('triviaOptions');
    container.innerHTML = '';
    triviaQuestion.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'trivia-option';
        btn.textContent = opt;
        btn.dataset.index = i;
        btn.addEventListener('click', () => handleTriviaAnswer(i, btn));
        container.appendChild(btn);
    });
}

function handleTriviaAnswer(selectedIndex, clickedBtn) {
    if (triviaAnswered) return;
    triviaAnswered = true;

    document.querySelectorAll('.trivia-option').forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.add(idx === triviaQuestion.correct ? 'correct' : 'disabled');
        if (idx === selectedIndex && idx !== triviaQuestion.correct) {
            btn.classList.add('incorrect');
        }
    });

    const result = document.getElementById('triviaResult');
    result.innerHTML = `<p>${triviaQuestion.explanation}</p>`;
    
    if (selectedIndex === triviaQuestion.correct) {
        userPoints += 10;
        result.innerHTML += '<p style="color:#16a34a; font-weight:600; margin-top:10px;">🎉 Correct! +10 points</p>';
    } else {
        result.innerHTML += '<p style="color:#dc2626; font-weight:600; margin-top:10px;">Wrong answer.</p>';
    }
    
    result.classList.add('show');
    updateStats();
}

// Matches
function renderMatches() {
    const container = document.getElementById('matchList');
    container.innerHTML = '';

    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-header">
                <span class="match-badge">${match.stage} • Group ${match.group}</span>
                <div class="match-info">
                    <div>🕐 ${match.date} at ${match.time}</div>
                    <div>📍 ${match.venue}</div>
                </div>
            </div>
            <div class="match-teams">
                <div class="team-name">${match.team1}</div>
                <div class="vs-text">VS</div>
                <div class="team-name">${match.team2}</div>
            </div>
            <div class="prediction-section">
                <p class="prediction-label">Your Prediction:</p>
                <div class="prediction-inputs">
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="t1-${match.id}">
                    <span class="prediction-dash">-</span>
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="t2-${match.id}">
                    <button class="submit-prediction" data-match-id="${match.id}">Submit</button>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Pre-fill if already predicted
        if (predictions[match.id]) {
            document.getElementById(`t1-${match.id}`).value = predictions[match.id].team1Score;
            document.getElementById(`t2-${match.id}`).value = predictions[match.id].team2Score;
        }
    });
}

function submitPrediction(matchId) {
    const i1 = document.getElementById(`t1-${matchId}`);
    const i2 = document.getElementById(`t2-${matchId}`);

    const s1 = parseInt(i1.value, 10);
    const s2 = parseInt(i2.value, 10);

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s1 > 20 || s2 < 0 || s2 > 20) {
        alert("Please enter valid scores (0–20)");
        return;
    }

    predictions[matchId] = { team1Score: s1, team2Score: s2 };
    localStorage.setItem('wc2026_predictions', JSON.stringify(predictions));

    // Visual feedback
    i1.style.background = '#dcfce7';
    i2.style.background = '#dcfce7';
    setTimeout(() => {
        i1.style.background = '';
        i2.style.background = '';
    }, 1500);

    alert(`Prediction saved: ${match.team1} ${s1} - ${s2} ${match.team2}`);
    updateStats();
    renderUserPredictions();
}

// Teams list
function renderTeams() {
    const container = document.getElementById('teamsList');
    container.innerHTML = '';
    teams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <div class="team-flag">${team.flag}</div>
            <div class="team-name-card">${team.name}</div>
            <div class="team-group">Group ${team.group}</div>
            <div class="team-rank">FIFA Rank: #${team.fifa_rank}</div>
        `;
        container.appendChild(card);
    });
}

// User predictions list
function renderUserPredictions() {
    const container = document.getElementById('userPredictionsList');
    if (Object.keys(predictions).length === 0) {
        container.innerHTML = '<p class="no-predictions">No predictions yet. Go to Schedule →</p>';
        return;
    }

    container.innerHTML = '';
    Object.entries(predictions).forEach(([id, pred]) => {
        const match = matches.find(m => m.id === Number(id));
        if (!match) return;
        const item = document.createElement('div');
        item.className = 'prediction-item';
        item.innerHTML = `
            <p class="prediction-match">${match.team1} vs ${match.team2}</p>
            <p class="prediction-score">${pred.team1Score} – ${pred.team2Score}</p>
        `;
        container.appendChild(item);
    });
}

// Stats
function updateStats() {
    document.getElementById('totalPoints').textContent = userPoints;
    document.getElementById('footerPoints').textContent = userPoints;
    document.getElementById('predictionCount').textContent = Object.keys(predictions).length;
}    question: "Which country has won the most FIFA World Cup titles?",
    options: ["Germany", "Brazil", "Italy", "Argentina"],
    correct: 1,
    explanation: "Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002), more than any other nation!"
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    startCountdown();
    renderTrivia();
    renderMatches();
    renderTeams();
    updateStats();
});

// Tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const difference = worldCupDate - now;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Render trivia section
function renderTrivia() {
    const questionEl = document.getElementById('triviaQuestion');
    const optionsEl = document.getElementById('triviaOptions');

    questionEl.textContent = triviaQuestion.question;

    triviaQuestion.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'trivia-option';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleTriviaAnswer(index, optionBtn);
        optionsEl.appendChild(optionBtn);
    });
}

// Handle trivia answer
function handleTriviaAnswer(selectedIndex, buttonEl) {
    if (triviaAnswered) return;

    triviaAnswered = true;
    const options = document.querySelectorAll('.trivia-option');
    const resultEl = document.getElementById('triviaResult');

    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === triviaQuestion.correct) {
            opt.classList.add('correct');
        } else if (idx === selectedIndex) {
            opt.classList.add('incorrect');
        }
    });

    resultEl.innerHTML = `<p>${triviaQuestion.explanation}</p>`;
    
    if (selectedIndex === triviaQuestion.correct) {
        userPoints += 10;
        resultEl.innerHTML += '<p style="color: #16a34a; margin-top: 12px; font-weight: 600;">🎉 Correct! +10 points</p>';
    }
    
    resultEl.classList.add('show');
    updateStats();
}

// Render matches
function renderMatches() {
    const matchList = document.getElementById('matchList');
    matchList.innerHTML = '';

    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <div class="match-header">
                <span class="match-badge">${match.stage} • Group ${match.group}</span>
                <div class="match-info">
                    <div>🕐 ${match.date} at ${match.time}</div>
                    <div>📍 ${match.venue}</div>
                </div>
            </div>
            
            <div class="match-teams">
                <div class="team-name">${match.team1}</div>
                <div class="vs-text">VS</div>
                <div class="team-name">${match.team2}</div>
            </div>

            <div class="prediction-section">
                <p class="prediction-label">Your Prediction:</p>
                <div class="prediction-inputs">
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="team1-${match.id}">
                    <span class="prediction-dash">-</span>
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="team2-${match.id}">
                    <button class="submit-prediction" onclick="submitPrediction(${match.id})">Submit</button>
                </div>
            </div>
        `;
        matchList.appendChild(matchCard);
    });
}

// Submit prediction
function submitPrediction(matchId) {
    const team1Score = parseInt(document.getElementById(`team1-${matchId}`).value) || 0;
    const team2Score = parseInt(document.getElementById(`team2-${matchId}`).value) || 0;

    predictions[matchId] = {
        team1Score: team1Score,
        team2Score: team2Score
    };

    alert('Prediction submitted successfully!');
    updateStats();
    renderUserPredictions();
}

// Render teams
function renderTeams() {
    const teamsList = document.getElementById('teamsList');
    teamsList.innerHTML = '';

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <div class="team-flag">${team.flag}</div>
            <div class="team-name-card">${team.name}</div>
            <div class="team-group">Group ${team.group}</div>
            <div class="team-rank">FIFA Rank: #${team.fifa_rank}</div>
        `;
        teamsList.appendChild(teamCard);
    });
}

// Render user predictions
function renderUserPredictions() {
    const predictionsList = document.getElementById('userPredictionsList');
    
    if (Object.keys(predictions).length === 0) {
        predictionsList.innerHTML = '<p class="no-predictions">No predictions yet. Head to the schedule to make some!</p>';
        return;
    }

    predictionsList.innerHTML = '';
    
    Object.entries(predictions).forEach(([matchId, pred]) => {
        const match = matches.find(m => m.id === parseInt(matchId));
        if (match) {
            const predItem = document.createElement('div');
            predItem.className = 'prediction-item';
            predItem.innerHTML = `
                <p class="prediction-match">${match.team1} vs ${match.team2}</p>
                <p class="prediction-score">Predicted Score: ${pred.team1Score} - ${pred.team2Score}</p>
            `;
            predictionsList.appendChild(predItem);
        }
    });
}

// Update stats
function updateStats() {
    document.getElementById('totalPoints').textContent = userPoints;
    document.getElementById('footerPoints').textContent = userPoints;
    document.getElementById('predictionCount').textContent = Object.keys(predictions).length;
}    question: "Which country has won the most FIFA World Cup titles?",
    options: ["Germany", "Brazil", "Italy", "Argentina"],
    correct: 1,
    explanation: "Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002), more than any other nation!"
};

// Load saved data from localStorage
function loadFromStorage() {
    const savedPredictions = localStorage.getItem('predictions');
    const savedPoints = localStorage.getItem('userPoints');
    const savedTriviaAnswered = localStorage.getItem('triviaAnswered');

    if (savedPredictions) {
        predictions = JSON.parse(savedPredictions);
    }
    if (savedPoints) {
        userPoints = parseInt(savedPoints);
    }
    if (savedTriviaAnswered) {
        triviaAnswered = savedTriviaAnswered === 'true';
    }
}

// Save to localStorage
function saveToStorage() {
    localStorage.setItem('predictions', JSON.stringify(predictions));
    localStorage.setItem('userPoints', userPoints.toString());
    localStorage.setItem('triviaAnswered', triviaAnswered.toString());
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    loadFromStorage();
    initializeTabs();
    startCountdown();
    renderTrivia();
    renderMatches();
    renderTeams();
    updateStats();
});

// Tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Found', tabButtons.length, 'tab buttons');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            console.log('Switching to tab:', targetTab);

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            } else {
                console.error('Tab content not found:', targetTab);
            }
        });
    });
}

// Countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const difference = worldCupDate - now;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
        if (secondsEl) secondsEl.textContent = seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Render trivia section
function renderTrivia() {
    const questionEl = document.getElementById('triviaQuestion');
    const optionsEl = document.getElementById('triviaOptions');

    if (!questionEl || !optionsEl) {
        console.error('Trivia elements not found');
        return;
    }

    questionEl.textContent = triviaQuestion.question;
    optionsEl.innerHTML = '';

    triviaQuestion.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'trivia-option';
        optionBtn.textContent = option;
        
        if (triviaAnswered) {
            optionBtn.classList.add('disabled');
            if (index === triviaQuestion.correct) {
                optionBtn.classList.add('correct');
            }
        } else {
            optionBtn.onclick = () => handleTriviaAnswer(index);
        }
        
        optionsEl.appendChild(optionBtn);
    });

    if (triviaAnswered) {
        showTriviaResult();
    }
}

// Handle trivia answer
function handleTriviaAnswer(selectedIndex) {
    if (triviaAnswered) return;

    triviaAnswered = true;
    const options = document.querySelectorAll('.trivia-option');
    const isCorrect = selectedIndex === triviaQuestion.correct;

    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === triviaQuestion.correct) {
            opt.classList.add('correct');
        } else if (idx === selectedIndex) {
            opt.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        userPoints += 10;
    }

    showTriviaResult(isCorrect);
    saveToStorage();
    updateStats();
}

function showTriviaResult(isCorrect) {
    const resultEl = document.getElementById('triviaResult');
    if (!resultEl) return;

    resultEl.innerHTML = `<p>${triviaQuestion.explanation}</p>`;
    
    if (isCorrect !== undefined && isCorrect) {
        resultEl.innerHTML += '<p style="color: #16a34a; margin-top: 12px; font-weight: 600;">🎉 Correct! +10 points</p>';
    }
    
    resultEl.classList.add('show');
}

// Render matches
function renderMatches() {
    const matchList = document.getElementById('matchList');
    if (!matchList) {
        console.error('Match list element not found');
        return;
    }

    matchList.innerHTML = '';

    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        
        const savedPrediction = predictions[match.id];
        const team1Value = savedPrediction ? savedPrediction.team1Score : '';
        const team2Value = savedPrediction ? savedPrediction.team2Score : '';

        matchCard.innerHTML = `
            <div class="match-header">
                <span class="match-badge">${match.stage} • Group ${match.group}</span>
                <div class="match-info">
                    <div>🕐 ${match.date} at ${match.time}</div>
                    <div>📍 ${match.venue}</div>
                </div>
            </div>
            
            <div class="match-teams">
                <div class="team-name">${match.team1}</div>
                <div class="vs-text">VS</div>
                <div class="team-name">${match.team2}</div>
            </div>

            <div class="prediction-section">
                <p class="prediction-label">Your Prediction:</p>
                <div class="prediction-inputs">
                    <input type="number" min="0" max="20" placeholder="0" value="${team1Value}" class="score-input" id="team1-${match.id}">
                    <span class="prediction-dash">-</span>
                    <input type="number" min="0" max="20" placeholder="0" value="${team2Value}" class="score-input" id="team2-${match.id}">
                    <button class="submit-prediction" onclick="submitPrediction(${match.id})">Submit</button>
                </div>
            </div>
        `;
        matchList.appendChild(matchCard);
    });
}

// Submit prediction
function submitPrediction(matchId) {
    const team1Score = parseInt(document.getElementById(`team1-${matchId}`).value) || 0;
    const team2Score = parseInt(document.getElementById(`team2-${matchId}`).value) || 0;

    predictions[matchId] = {
        team1Score: team1Score,
        team2Score: team2Score
    };

    saveToStorage();
    alert('Prediction saved successfully!');
    updateStats();
    renderUserPredictions();
}

// Render teams
function renderTeams() {
    const teamsList = document.getElementById('teamsList');
    if (!teamsList) {
        console.error('Teams list element not found');
        return;
    }

    teamsList.innerHTML = '';

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <div class="team-flag">${team.flag}</div>
            <div class="team-name-card">${team.name}</div>
            <div class="team-group">Group ${team.group}</div>
            <div class="team-rank">FIFA Rank: #${team.fifa_rank}</div>
        `;
        teamsList.appendChild(teamCard);
    });
}

// Render user predictions
function renderUserPredictions() {
    const predictionsList = document.getElementById('userPredictionsList');
    if (!predictionsList) {
        console.error('Predictions list element not found');
        return;
    }
    
    if (Object.keys(predictions).length === 0) {
        predictionsList.innerHTML = '<p class="no-predictions">No predictions yet. Head to the schedule to make some!</p>';
        return;
    }

    predictionsList.innerHTML = '';
    
    Object.entries(predictions).forEach(([matchId, pred]) => {
        const match = matches.find(m => m.id === parseInt(matchId));
        if (match) {
            const predItem = document.createElement('div');
            predItem.className = 'prediction-item';
            predItem.innerHTML = `
                <p class="prediction-match">${match.team1} vs ${match.team2}</p>
                <p class="prediction-score">Predicted Score: ${pred.team1Score} - ${pred.team2Score}</p>
            `;
            predictionsList.appendChild(predItem);
        }
    });
}

// Update stats
function updateStats() {
    const totalPointsEl = document.getElementById('totalPoints');
    const footerPointsEl = document.getElementById('footerPoints');
    const predictionCountEl = document.getElementById('predictionCount');

    if (totalPointsEl) totalPointsEl.textContent = userPoints;
    if (footerPointsEl) footerPointsEl.textContent = userPoints;
    if (predictionCountEl) predictionCountEl.textContent = Object.keys(predictions).length;

    renderUserPredictions();
}

// Make submitPrediction available globally
window.submitPrediction = submitPrediction;    question: "Which country has won the most FIFA World Cup titles?",
    options: ["Germany", "Brazil", "Italy", "Argentina"],
    correct: 1,
    explanation: "Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002), more than any other nation!"
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    startCountdown();
    renderTrivia();
    renderMatches();
    renderTeams();
    updateStats();
});

// Tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const difference = worldCupDate - now;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Render trivia section
function renderTrivia() {
    const questionEl = document.getElementById('triviaQuestion');
    const optionsEl = document.getElementById('triviaOptions');

    questionEl.textContent = triviaQuestion.question;

    triviaQuestion.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'trivia-option';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleTriviaAnswer(index, optionBtn);
        optionsEl.appendChild(optionBtn);
    });
}

// Handle trivia answer
function handleTriviaAnswer(selectedIndex, buttonEl) {
    if (triviaAnswered) return;

    triviaAnswered = true;
    const options = document.querySelectorAll('.trivia-option');
    const resultEl = document.getElementById('triviaResult');

    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === triviaQuestion.correct) {
            opt.classList.add('correct');
        } else if (idx === selectedIndex) {
            opt.classList.add('incorrect');
        }
    });

    resultEl.innerHTML = `<p>${triviaQuestion.explanation}</p>`;
    
    if (selectedIndex === triviaQuestion.correct) {
        userPoints += 10;
        resultEl.innerHTML += '<p style="color: #16a34a; margin-top: 12px; font-weight: 600;">🎉 Correct! +10 points</p>';
    }
    
    resultEl.classList.add('show');
    updateStats();
}

// Render matches
function renderMatches() {
    const matchList = document.getElementById('matchList');
    matchList.innerHTML = '';

    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <div class="match-header">
                <span class="match-badge">${match.stage} • Group ${match.group}</span>
                <div class="match-info">
                    <div>🕐 ${match.date} at ${match.time}</div>
                    <div>📍 ${match.venue}</div>
                </div>
            </div>
            
            <div class="match-teams">
                <div class="team-name">${match.team1}</div>
                <div class="vs-text">VS</div>
                <div class="team-name">${match.team2}</div>
            </div>

            <div class="prediction-section">
                <p class="prediction-label">Your Prediction:</p>
                <div class="prediction-inputs">
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="team1-${match.id}">
                    <span class="prediction-dash">-</span>
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="team2-${match.id}">
                    <button class="submit-prediction" onclick="submitPrediction(${match.id})">Submit</button>
                </div>
            </div>
        `;
        matchList.appendChild(matchCard);
    });
}

// Submit prediction
function submitPrediction(matchId) {
    const team1Score = parseInt(document.getElementById(`team1-${matchId}`).value) || 0;
    const team2Score = parseInt(document.getElementById(`team2-${matchId}`).value) || 0;

    predictions[matchId] = {
        team1Score: team1Score,
        team2Score: team2Score
    };

    alert('Prediction submitted successfully!');
    updateStats();
    renderUserPredictions();
}

// Render teams
function renderTeams() {
    const teamsList = document.getElementById('teamsList');
    teamsList.innerHTML = '';

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <div class="team-flag">${team.flag}</div>
            <div class="team-name-card">${team.name}</div>
            <div class="team-group">Group ${team.group}</div>
            <div class="team-rank">FIFA Rank: #${team.fifa_rank}</div>
        `;
        teamsList.appendChild(teamCard);
    });
}

// Render user predictions
function renderUserPredictions() {
    const predictionsList = document.getElementById('userPredictionsList');
    
    if (Object.keys(predictions).length === 0) {
        predictionsList.innerHTML = '<p class="no-predictions">No predictions yet. Head to the schedule to make some!</p>';
        return;
    }

    predictionsList.innerHTML = '';
    
    Object.entries(predictions).forEach(([matchId, pred]) => {
        const match = matches.find(m => m.id === parseInt(matchId));
        if (match) {
            const predItem = document.createElement('div');
            predItem.className = 'prediction-item';
            predItem.innerHTML = `
                <p class="prediction-match">${match.team1} vs ${match.team2}</p>
                <p class="prediction-score">Predicted Score: ${pred.team1Score} - ${pred.team2Score}</p>
            `;
            predictionsList.appendChild(predItem);
        }
    });
}

// Update stats
function updateStats() {
    document.getElementById('totalPoints').textContent = userPoints;
    document.getElementById('footerPoints').textContent = userPoints;
    document.getElementById('predictionCount').textContent = Object.keys(predictions).length;
}    question: "Which country has won the most FIFA World Cup titles?",
    options: ["Germany", "Brazil", "Italy", "Argentina"],
    correct: 1,
    explanation: "Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002), more than any other nation!"
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    startCountdown();
    renderTrivia();
    renderMatches();
    renderTeams();
    updateStats();
});

// Tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const difference = worldCupDate - now;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Render trivia section
function renderTrivia() {
    const questionEl = document.getElementById('triviaQuestion');
    const optionsEl = document.getElementById('triviaOptions');

    questionEl.textContent = triviaQuestion.question;

    triviaQuestion.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'trivia-option';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleTriviaAnswer(index, optionBtn);
        optionsEl.appendChild(optionBtn);
    });
}

// Handle trivia answer
function handleTriviaAnswer(selectedIndex, buttonEl) {
    if (triviaAnswered) return;

    triviaAnswered = true;
    const options = document.querySelectorAll('.trivia-option');
    const resultEl = document.getElementById('triviaResult');

    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === triviaQuestion.correct) {
            opt.classList.add('correct');
        } else if (idx === selectedIndex) {
            opt.classList.add('incorrect');
        }
    });

    resultEl.innerHTML = `<p>${triviaQuestion.explanation}</p>`;
    
    if (selectedIndex === triviaQuestion.correct) {
        userPoints += 10;
        resultEl.innerHTML += '<p style="color: #16a34a; margin-top: 12px; font-weight: 600;">🎉 Correct! +10 points</p>';
    }
    
    resultEl.classList.add('show');
    updateStats();
}

// Render matches
function renderMatches() {
    const matchList = document.getElementById('matchList');
    matchList.innerHTML = '';

    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <div class="match-header">
                <span class="match-badge">${match.stage} • Group ${match.group}</span>
                <div class="match-info">
                    <div>🕐 ${match.date} at ${match.time}</div>
                    <div>📍 ${match.venue}</div>
                </div>
            </div>
            
            <div class="match-teams">
                <div class="team-name">${match.team1}</div>
                <div class="vs-text">VS</div>
                <div class="team-name">${match.team2}</div>
            </div>

            <div class="prediction-section">
                <p class="prediction-label">Your Prediction:</p>
                <div class="prediction-inputs">
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="team1-${match.id}">
                    <span class="prediction-dash">-</span>
                    <input type="number" min="0" max="20" placeholder="0" class="score-input" id="team2-${match.id}">
                    <button class="submit-prediction" onclick="submitPrediction(${match.id})">Submit</button>
                </div>
            </div>
        `;
        matchList.appendChild(matchCard);
    });
}

// Submit prediction
function submitPrediction(matchId) {
    const team1Score = parseInt(document.getElementById(`team1-${matchId}`).value) || 0;
    const team2Score = parseInt(document.getElementById(`team2-${matchId}`).value) || 0;

    predictions[matchId] = {
        team1Score: team1Score,
        team2Score: team2Score
    };

    alert('Prediction submitted successfully!');
    updateStats();
    renderUserPredictions();
}

// Render teams
function renderTeams() {
    const teamsList = document.getElementById('teamsList');
    teamsList.innerHTML = '';

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <div class="team-flag">${team.flag}</div>
            <div class="team-name-card">${team.name}</div>
            <div class="team-group">Group ${team.group}</div>
            <div class="team-rank">FIFA Rank: #${team.fifa_rank}</div>
        `;
        teamsList.appendChild(teamCard);
    });
}

// Render user predictions
function renderUserPredictions() {
    const predictionsList = document.getElementById('userPredictionsList');
    
    if (Object.keys(predictions).length === 0) {
        predictionsList.innerHTML = '<p class="no-predictions">No predictions yet. Head to the schedule to make some!</p>';
        return;
    }

    predictionsList.innerHTML = '';
    
    Object.entries(predictions).forEach(([matchId, pred]) => {
        const match = matches.find(m => m.id === parseInt(matchId));
        if (match) {
            const predItem = document.createElement('div');
            predItem.className = 'prediction-item';
            predItem.innerHTML = `
                <p class="prediction-match">${match.team1} vs ${match.team2}</p>
                <p class="prediction-score">Predicted Score: ${pred.team1Score} - ${pred.team2Score}</p>
            `;
            predictionsList.appendChild(predItem);
        }
    });
}

// Update stats
function updateStats() {
    document.getElementById('totalPoints').textContent = userPoints;
    document.getElementById('footerPoints').textContent = userPoints;
    document.getElementById('predictionCount').textContent = Object.keys(predictions).length;
        }

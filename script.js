// Global variables
let userPoints = 0;
let predictions = {};
let triviaAnswered = false;

// World Cup date
const worldCupDate = new Date('2026-06-11T00:00:00');

// Sample matches data
const matches = [
    { id: 1, date: '2026-06-11', time: '14:00', team1: 'Mexico', team2: 'TBD', venue: 'Estadio Azteca, Mexico City', stage: 'Opening Match', group: 'A' },
    { id: 2, date: '2026-06-12', time: '17:00', team1: 'USA', team2: 'TBD', venue: 'SoFi Stadium, Los Angeles', stage: 'Group Stage', group: 'B' },
    { id: 3, date: '2026-06-12', time: '20:00', team1: 'Canada', team2: 'TBD', venue: 'BMO Field, Toronto', stage: 'Group Stage', group: 'C' },
    { id: 4, date: '2026-06-13', time: '15:00', team1: 'Argentina', team2: 'TBD', venue: 'MetLife Stadium, New York', stage: 'Group Stage', group: 'D' },
    { id: 5, date: '2026-06-13', time: '18:00', team1: 'Brazil', team2: 'TBD', venue: 'Hard Rock Stadium, Miami', stage: 'Group Stage', group: 'E' },
    { id: 6, date: '2026-06-14', time: '16:00', team1: 'England', team2: 'TBD', venue: 'Arrowhead Stadium, Kansas City', stage: 'Group Stage', group: 'F' },
];

// Sample teams
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

// Daily trivia question
const triviaQuestion = {
    question: "Which country has won the most FIFA World Cup titles?",
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

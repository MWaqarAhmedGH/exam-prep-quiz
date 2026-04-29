// Quiz App Logic - Updated Version
let currentChapter = 0;
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let totalTimerInterval;
let questionTimerInterval;
let startTime;
let questionStartTime;
let questions = [];
let questionTimeLeft = 60;
const MARKS_PER_QUESTION = 5;

function startQuiz(chapter) {
    currentChapter = chapter;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];

    // Get questions for selected chapter
    questions = getQuestionsForChapter(chapter);

    // Hide chapter selection, show quiz
    document.getElementById('chapterSelection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    
    // Show Chapter Indicator
    const chapterIndicator = document.getElementById('chapterIndicator');
    const chapterValue = document.getElementById('chapterValue');
    if(chapterIndicator && chapterValue) {
        console.log("Setting Chapter Display to:", chapter);
        chapterValue.textContent = chapter;
        chapterIndicator.style.display = 'block';
    }

    // Hide Title to prevent overlap
    const title = document.getElementById('appTitle');
    if(title) title.style.display = 'none';

    // Initialize quiz
    document.getElementById('totalQ').textContent = questions.length;

    // Start total timer
    startTime = Date.now();
    startTotalTimer();

    // Load first question
    loadQuestion();
}

function startTotalTimer() {
    totalTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('totalTimer').textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function startQuestionTimer() {
    if (questionTimerInterval) clearInterval(questionTimerInterval);

    questionTimeLeft = 60;
    questionStartTime = Date.now();

    document.getElementById('questionTimer').textContent = '60s';
    document.getElementById('questionTimer').style.color = '#4caf50';

    questionTimerInterval = setInterval(() => {
        questionTimeLeft = 60 - Math.floor((Date.now() - questionStartTime) / 1000);

        if (questionTimeLeft <= 0) {
            clearInterval(questionTimerInterval);
            userAnswers[currentQuestionIndex] = -1;
            showTimeoutMessage();
            setTimeout(() => {
                if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    loadQuestion();
                } else {
                    submitQuiz();
                }
            }, 1000);
        } else {
            document.getElementById('questionTimer').textContent = questionTimeLeft + 's';
            if (questionTimeLeft <= 10) {
                document.getElementById('questionTimer').style.color = '#f44336';
            } else if (questionTimeLeft <= 30) {
                document.getElementById('questionTimer').style.color = '#ff9800';
            } else {
                document.getElementById('questionTimer').style.color = '#4caf50';
            }
        }
    }, 1000);
}

function showTimeoutMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'timeout-message';
    messageDiv.textContent = '⏰ Time Up! Moving to next question...';
    document.querySelector('.question-card').appendChild(messageDiv);

    showFeedbackMessage('😢 Oh no! Time ran out! Don\'t worry, keep going! 💪', 'wrong');

    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    if (options[question.correct]) {
        options[question.correct].classList.add('correct');
        options[question.correct].innerHTML += ' ✅ (Correct Answer)';
    }
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    const questionCard = document.querySelector('.question-card');
    
    questionCard.classList.remove('flip-3d');
    void questionCard.offsetWidth; 
    questionCard.classList.add('flip-3d');

    const elementsToRemove = ['.explanation', '.timeout-message', '.feedback-correct', '.feedback-wrong'];
    elementsToRemove.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.remove();
    });

    document.getElementById('currentQ').textContent = currentQuestionIndex + 1;
    document.getElementById('score').textContent = score;

    document.getElementById('questionText').innerHTML =
        `<strong>Q${currentQuestionIndex + 1}:</strong> ${question.question}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = option.replace(/✅/g, '').replace(/\(Correct.*?\)/gi, '').trim();
        optionDiv.onclick = () => selectOption(index);

        if (userAnswers[currentQuestionIndex] !== undefined && userAnswers[currentQuestionIndex] !== -1) {
            if (userAnswers[currentQuestionIndex] === index) {
                optionDiv.classList.add('selected');
                if (index === question.correct) {
                    optionDiv.classList.add('correct');
                    optionDiv.innerHTML += ' ✅';
                } else {
                    optionDiv.classList.add('wrong');
                    optionDiv.innerHTML += ' ❌';
                }
            }
            if (index === question.correct && userAnswers[currentQuestionIndex] !== index) {
                optionDiv.classList.add('correct');
                optionDiv.innerHTML += ' ✅ (Correct)';
            }
        }
        optionsContainer.appendChild(optionDiv);
    });

    if (userAnswers[currentQuestionIndex] !== undefined && userAnswers[currentQuestionIndex] !== -1) {
        const wasCorrect = userAnswers[currentQuestionIndex] === question.correct;
        showFeedbackMessage(wasCorrect ? '🎉 Congratulations! Absolutely correct! Well done! 💕' : '😔 Oops! Wrong answer. Don\'t worry, you\'ll get it next time! 💪', wasCorrect ? 'correct' : 'wrong');
    }

    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-block';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
    }

    if (userAnswers[currentQuestionIndex] === undefined) {
        startQuestionTimer();
    } else {
        if (questionTimerInterval) clearInterval(questionTimerInterval);
        document.getElementById('questionTimer').textContent = 'Answered';
        document.getElementById('questionTimer').style.color = '#2196f3';
    }
}

function selectOption(index) {
    if (userAnswers[currentQuestionIndex] !== undefined) return;
    if (questionTimerInterval) clearInterval(questionTimerInterval);

    const question = questions[currentQuestionIndex];
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));

    const selectedOption = document.querySelectorAll('.option')[index];
    selectedOption.classList.add('selected');
    userAnswers[currentQuestionIndex] = index;

    if (index === question.correct) {
        selectedOption.classList.add('correct');
        selectedOption.innerHTML += ' ✅ Correct!';
        score++;
        document.getElementById('score').textContent = score;
        showFeedbackMessage('🎉 Congratulations! Absolutely correct! Well done! 💕', 'correct');
    } else {
        selectedOption.classList.add('wrong');
        selectedOption.innerHTML += ' ❌ Wrong!';
        document.querySelectorAll('.option')[question.correct].classList.add('correct');
        document.querySelectorAll('.option')[question.correct].innerHTML += ' ✅ (Correct Answer)';
        showFeedbackMessage('😔 Oops! Wrong answer. Don\'t worry, you\'ll get it next time! 💪', 'wrong');
    }

    document.getElementById('questionTimer').textContent = 'Answered';
    document.getElementById('questionTimer').style.color = '#2196f3';
}

function showFeedbackMessage(message, type) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = type === 'correct' ? 'feedback-correct' : 'feedback-wrong';
    feedbackDiv.textContent = message;
    document.querySelector('.question-card').appendChild(feedbackDiv);
}

function showExplanation(explanation) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.innerHTML = `<strong>💡 Explanation:</strong> ${explanation}`;
    document.querySelector('.question-card').appendChild(explanationDiv);
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function submitQuiz() {
    clearInterval(totalTimerInterval);
    clearInterval(questionTimerInterval);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    questions.forEach((question, index) => {
        if (userAnswers[index] === undefined) userAnswers[index] = -1;
    });

    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';

    const totalMarks = questions.length * MARKS_PER_QUESTION;
    const obtainedMarks = score * MARKS_PER_QUESTION;
    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 60;

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    document.getElementById('finalScore').textContent = percentage + '%';
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('gradeDisplay').textContent = grade;
    document.getElementById('passFailStatus').textContent = isPassed ? 'PASSED ✅' : 'FAILED ❌';
    document.getElementById('passFailStatus').style.color = isPassed ? '#28a745' : '#dc3545';

    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    document.getElementById('timeTaken').textContent = `${minutes}m ${seconds}s`;

    let message = '';
    let emoji = '';
    if (percentage >= 90) { message = '🏆 OUTSTANDING! You are a genius! Perfect preparation for the exam! 💕'; emoji = '🎉🎊🏆'; }
    else if (percentage >= 80) { message = '🌟 EXCELLENT! Great job! You are well prepared! Keep it up! ❤️'; emoji = '🌟✨💫'; }
    else if (percentage >= 70) { message = '👏 VERY GOOD! Good performance! A bit more practice and you will be perfect! 😊'; emoji = '👏💪📚'; }
    else if (percentage >= 60) { message = '💪 GOOD! You passed! But you need more revision to score better! 📖'; emoji = '💪📝✍️'; }
    else if (percentage >= 50) { message = '😔 BELOW AVERAGE! You failed! Please study harder and practice more! 📚'; emoji = '😔📖💔'; }
    else { message = '😢 POOR PERFORMANCE! You need serious revision! Don\'t give up, study more! 💪'; emoji = '😢📚🔄'; }

    document.getElementById('resultMessage').textContent = message;
    document.getElementById('resultEmoji').textContent = emoji;
}

function restartQuiz() {
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('chapterSelection').style.display = 'grid';
    document.getElementById('appTitle').style.display = 'block';
    document.getElementById('chapterIndicator').style.display = 'none';
    currentChapter = 0;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    if (totalTimerInterval) clearInterval(totalTimerInterval);
    if (questionTimerInterval) clearInterval(questionTimerInterval);
}

function getQuestionsForChapter(chapter) {
    if (chapter === 12) return chapter12Questions;
    if (chapter === 13) return chapter13Questions;
    if (chapter === 14) return chapter14Questions;
    return [];
}
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

    // Initialize quiz
    document.getElementById('totalQ').textContent = questions.length;
    document.getElementById('totalScore').textContent = questions.length;

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
    // Clear any existing timer
    if (questionTimerInterval) {
        clearInterval(questionTimerInterval);
    }

    questionTimeLeft = 60;
    questionStartTime = Date.now();

    // Update timer display immediately
    document.getElementById('questionTimer').textContent = '60s';
    document.getElementById('questionTimer').style.color = '#4caf50';

    questionTimerInterval = setInterval(() => {
        questionTimeLeft = 60 - Math.floor((Date.now() - questionStartTime) / 1000);

        if (questionTimeLeft <= 0) {
            // Time up! Mark as wrong and move to next
            clearInterval(questionTimerInterval);
            userAnswers[currentQuestionIndex] = -1; // -1 means no answer (wrong)

            // Show timeout message
            showTimeoutMessage();

            // Auto move to next question after 1 second
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

            // Change color based on time left
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
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];

    // IMPORTANT: Remove old explanations, timeout messages, and feedback messages
    const oldExplanation = document.querySelector('.explanation');
    if (oldExplanation) {
        oldExplanation.remove();
    }
    const oldTimeout = document.querySelector('.timeout-message');
    if (oldTimeout) {
        oldTimeout.remove();
    }
    const oldFeedbackCorrect = document.querySelector('.feedback-correct');
    if (oldFeedbackCorrect) {
        oldFeedbackCorrect.remove();
    }
    const oldFeedbackWrong = document.querySelector('.feedback-wrong');
    if (oldFeedbackWrong) {
        oldFeedbackWrong.remove();
    }

    // Update progress
    document.getElementById('currentQ').textContent = currentQuestionIndex + 1;
    document.getElementById('score').textContent = score;

    // Update question text (WITHOUT showing correct answer)
    document.getElementById('questionText').innerHTML =
        `<strong>Q${currentQuestionIndex + 1}:</strong> ${question.question}`;

    // Update options (REMOVE correct answer markers)
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';

        // Remove any checkmarks or correct indicators from option text
        let cleanOption = option.replace(/✅/g, '').replace(/\(Correct.*?\)/gi, '').trim();
        optionDiv.innerHTML = cleanOption;

        optionDiv.onclick = () => selectOption(index);

        // If user already answered this question, show their selection
        if (userAnswers[currentQuestionIndex] !== undefined && userAnswers[currentQuestionIndex] !== -1) {
            if (userAnswers[currentQuestionIndex] === index) {
                optionDiv.classList.add('selected');
                // Show if it was correct or wrong
                if (index === question.correct) {
                    optionDiv.classList.add('correct');
                    optionDiv.innerHTML += ' ✅';
                } else {
                    optionDiv.classList.add('wrong');
                    optionDiv.innerHTML += ' ❌';
                }
            }
            // Also show the correct answer
            if (index === question.correct && userAnswers[currentQuestionIndex] !== index) {
                optionDiv.classList.add('correct');
                optionDiv.innerHTML += ' ✅ (Correct)';
            }
        }

        optionsContainer.appendChild(optionDiv);
    });

    // If user already answered, show the explanation and feedback again
    if (userAnswers[currentQuestionIndex] !== undefined && userAnswers[currentQuestionIndex] !== -1) {
        const wasCorrect = userAnswers[currentQuestionIndex] === question.correct;
        if (wasCorrect) {
            showFeedbackMessage('🎉 Congratulations! Absolutely correct! Well done! 💕', 'correct');
        } else {
            showFeedbackMessage('😔 Oops! Wrong answer. Don\'t worry, you\'ll get it next time! 💪', 'wrong');
        }
        showExplanation(question.explanation);
    }

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-block';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
    }

    // Start 60 second timer for this question (only if not already answered)
    if (userAnswers[currentQuestionIndex] === undefined) {
        startQuestionTimer();
    } else {
        // Question already answered, stop timer
        if (questionTimerInterval) {
            clearInterval(questionTimerInterval);
        }
        document.getElementById('questionTimer').textContent = 'Answered';
        document.getElementById('questionTimer').style.color = '#2196f3';
    }
}

function selectOption(index) {
    // Don't allow selection if already answered
    if (userAnswers[currentQuestionIndex] !== undefined) {
        return;
    }

    // Stop the question timer
    if (questionTimerInterval) {
        clearInterval(questionTimerInterval);
    }

    const question = questions[currentQuestionIndex];

    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Add selection to clicked option
    const selectedOption = document.querySelectorAll('.option')[index];
    selectedOption.classList.add('selected');

    // Save user answer
    userAnswers[currentQuestionIndex] = index;

    // Show if correct or wrong immediately with emotional feedback
    if (index === question.correct) {
        selectedOption.classList.add('correct');
        selectedOption.innerHTML += ' ✅ Correct!';
        score++;
        document.getElementById('score').textContent = score;

        // Show happy/congratulations message
        showFeedbackMessage('🎉 Congratulations! Absolutely correct! Well done! 💕', 'correct');
    } else {
        selectedOption.classList.add('wrong');
        selectedOption.innerHTML += ' ❌ Wrong!';

        // Show correct answer
        document.querySelectorAll('.option')[question.correct].classList.add('correct');
        document.querySelectorAll('.option')[question.correct].innerHTML += ' ✅ (Correct Answer)';

        // Show sad/encouraging message
        showFeedbackMessage('😔 Oops! Wrong answer. Don\'t worry, you\'ll get it next time! 💪', 'wrong');
    }

    // Show explanation for THIS question
    showExplanation(question.explanation);

    // Update timer display
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
    // Stop all timers
    clearInterval(totalTimerInterval);
    clearInterval(questionTimerInterval);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // Calculate score (already calculated during quiz)
    // Count unanswered questions as wrong
    questions.forEach((question, index) => {
        if (userAnswers[index] === undefined || userAnswers[index] === -1) {
            userAnswers[index] = -1; // Mark as unanswered
        }
    });

    // Hide quiz, show results
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';

    // Calculate marks and percentage
    const totalMarks = questions.length * MARKS_PER_QUESTION;
    const obtainedMarks = score * MARKS_PER_QUESTION;
    const percentage = Math.round((score / questions.length) * 100);
    const passingMarks = Math.round(totalMarks * 0.6); // 60% passing
    const isPassed = obtainedMarks >= passingMarks;

    // Determine grade
    let grade = '';
    if (percentage >= 90) {
        grade = 'A+';
    } else if (percentage >= 80) {
        grade = 'A';
    } else if (percentage >= 70) {
        grade = 'B';
    } else if (percentage >= 60) {
        grade = 'C';
    } else if (percentage >= 50) {
        grade = 'D';
    } else {
        grade = 'F';
    }

    // Display results
    document.getElementById('finalScore').textContent = percentage + '%';
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('wrongAnswers').textContent = questions.length - score;
    document.getElementById('percentage').textContent = percentage + '%';
    document.getElementById('obtainedMarks').textContent = obtainedMarks;
    document.getElementById('totalMarksDisplay').textContent = totalMarks;
    document.getElementById('passingMarks').textContent = passingMarks;
    document.getElementById('gradeDisplay').textContent = grade;
    document.getElementById('passFailStatus').textContent = isPassed ? 'PASSED ✅' : 'FAILED ❌';
    document.getElementById('passFailStatus').style.color = isPassed ? '#28a745' : '#dc3545';

    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    document.getElementById('timeTaken').textContent =
        `${minutes}m ${seconds}s`;

    // Result message with emotional feedback
    let message = '';
    let emoji = '';
    if (percentage >= 90) {
        message = '🏆 OUTSTANDING! You are a genius! Perfect preparation for the exam! 💕';
        emoji = '🎉🎊🏆';
    } else if (percentage >= 80) {
        message = '🌟 EXCELLENT! Great job! You are well prepared! Keep it up! ❤️';
        emoji = '🌟✨💫';
    } else if (percentage >= 70) {
        message = '👏 VERY GOOD! Good performance! A bit more practice and you will be perfect! 😊';
        emoji = '👏💪📚';
    } else if (percentage >= 60) {
        message = '💪 GOOD! You passed! But you need more revision to score better! 📖';
        emoji = '💪📝✍️';
    } else if (percentage >= 50) {
        message = '😔 BELOW AVERAGE! You failed! Please study harder and practice more! 📚';
        emoji = '😔📖💔';
    } else {
        message = '😢 POOR PERFORMANCE! You need serious revision! Don\'t give up, study more! 💪';
        emoji = '😢📚🔄';
    }

    document.getElementById('resultMessage').textContent = message;
    document.getElementById('resultEmoji').textContent = emoji;
}

function restartQuiz() {
    // Reset everything
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('chapterSelection').style.display = 'grid';
    currentChapter = 0;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];

    // Clear timers
    if (totalTimerInterval) clearInterval(totalTimerInterval);
    if (questionTimerInterval) clearInterval(questionTimerInterval);
}

function getQuestionsForChapter(chapter) {
    if (chapter === 12) return chapter12Questions;
    if (chapter === 13) return chapter13Questions;
    if (chapter === 14) return chapter14Questions;
    return [];
}
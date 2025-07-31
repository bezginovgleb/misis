// Main page functionality
document.addEventListener('DOMContentLoaded', function() {
    const tasksContainer = document.getElementById('tasks-container');
    const answerModal = document.getElementById('answer-modal');
    const modalQuestion = document.getElementById('modal-question');
    const answerInput = document.getElementById('answer-input');
    const resultDisplay = document.getElementById('result-display');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const modalBody = document.querySelector('.modal-body');
    
    let currentTask = null;

    // Load and display tasks
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('examTasks') || '[]');
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<p class="no-tasks">No tasks available. <a href="upload.html">Upload your first task!</a></p>';
            return;
        }

        tasksContainer.innerHTML = '';
        
        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            tasksContainer.appendChild(taskCard);
        });
    }

    // Create task card element
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description)}</p>
            ${task.image ? `
                <div class="task-media">
                    <img src="${task.image}" alt="Task image" />
                </div>
            ` : ''}
            ${task.audio ? `
                <div class="task-media">
                    <audio controls>
                        <source src="${task.audio}" type="audio/*">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ` : ''}
            <button class="solve-btn" onclick="openAnswerModal('${task.id}')">Solve Task</button>
        `;
        return card;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Open answer modal
    window.openAnswerModal = function(taskId) {
        const tasks = JSON.parse(localStorage.getItem('examTasks') || '[]');
        currentTask = tasks.find(task => task.id === taskId);
        
        if (!currentTask) {
            alert('Task not found!');
            return;
        }

        modalQuestion.textContent = `Task: ${currentTask.title}`;
        answerInput.value = '';
        answerInput.focus();
        
        // Reset modal state
        modalBody.style.display = 'block';
        resultDisplay.classList.add('hidden');
        
        answerModal.classList.remove('hidden');
    };

    // Close answer modal
    window.closeAnswerModal = function() {
        answerModal.classList.add('hidden');
        currentTask = null;
        answerInput.value = '';
    };

    // Submit answer
    window.submitAnswer = function() {
        if (!currentTask) {
            alert('No task selected!');
            return;
        }

        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = currentTask.answer.toLowerCase();
        
        if (!userAnswer) {
            alert('Please enter an answer!');
            answerInput.focus();
            return;
        }

        // Check if answer is correct
        const isCorrect = userAnswer === correctAnswer;
        
        // Hide modal body and show result
        modalBody.style.display = 'none';
        resultDisplay.classList.remove('hidden');
        
        const resultContent = document.querySelector('.result-content');
        
        if (isCorrect) {
            resultContent.className = 'result-content correct';
            resultTitle.textContent = '✓ Correct!';
            resultMessage.textContent = 'Great job! Your answer is correct.';
        } else {
            resultContent.className = 'result-content incorrect';
            resultTitle.textContent = '✗ Incorrect';
            resultMessage.textContent = `Sorry, that's not right. The correct answer was: "${currentTask.answer}"`;
        }
    };

    // Handle Enter key in answer input
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });

    // Handle Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !answerModal.classList.contains('hidden')) {
            closeAnswerModal();
        }
    });

    // Close modal when clicking outside
    answerModal.addEventListener('click', function(e) {
        if (e.target === answerModal) {
            closeAnswerModal();
        }
    });

    // Load tasks on page load
    loadTasks();

    // Refresh tasks when returning from upload page
    window.addEventListener('focus', function() {
        loadTasks();
    });

    // Listen for storage changes (in case of multiple tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'examTasks') {
            loadTasks();
        }
    });
});
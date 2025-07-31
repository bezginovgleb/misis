// Upload page functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('task-form');
    const imageInput = document.getElementById('task-image');
    const audioInput = document.getElementById('task-audio');
    const imagePreview = document.getElementById('image-preview');
    const audioPreview = document.getElementById('audio-preview');
    const successMessage = document.getElementById('success-message');
    const uploadSection = document.querySelector('.upload-section');

    // Handle image file preview
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        imagePreview.innerHTML = '';
        
        if (file) {
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = function() {
                    URL.revokeObjectURL(this.src);
                };
                imagePreview.appendChild(img);
            } else {
                imagePreview.innerHTML = '<p style="color: #e53e3e;">Please select a valid image file.</p>';
            }
        } else {
            imagePreview.innerHTML = '<p style="color: #718096;">No image selected</p>';
        }
    });

    // Handle audio file preview
    audioInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        audioPreview.innerHTML = '';
        
        if (file) {
            if (file.type.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = URL.createObjectURL(file);
                audioPreview.appendChild(audio);
            } else {
                audioPreview.innerHTML = '<p style="color: #e53e3e;">Please select a valid audio file.</p>';
            }
        } else {
            audioPreview.innerHTML = '<p style="color: #718096;">No audio selected</p>';
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const description = formData.get('description').trim();
        const answer = formData.get('answer').trim();
        const imageFile = formData.get('image');
        const audioFile = formData.get('audio');

        // Validate required fields
        if (!title || !description || !answer) {
            alert('Please fill in all required fields.');
            return;
        }

        // Create task object
        const task = {
            id: Date.now().toString(),
            title: title,
            description: description,
            answer: answer.toLowerCase(), // Store answer in lowercase for comparison
            createdAt: new Date().toISOString()
        };

        // Handle image file
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                task.image = e.target.result;
                processAudioAndSave();
            };
            reader.readAsDataURL(imageFile);
        } else {
            processAudioAndSave();
        }

        function processAudioAndSave() {
            // Handle audio file
            if (audioFile && audioFile.size > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    task.audio = e.target.result;
                    saveTask();
                };
                reader.readAsDataURL(audioFile);
            } else {
                saveTask();
            }
        }

        function saveTask() {
            // Get existing tasks from localStorage
            let tasks = JSON.parse(localStorage.getItem('examTasks') || '[]');
            
            // Add new task
            tasks.push(task);
            
            // Save to localStorage
            localStorage.setItem('examTasks', JSON.stringify(tasks));
            
            // Show success message
            uploadSection.style.display = 'none';
            successMessage.classList.remove('hidden');
            
            // Reset form
            form.reset();
            imagePreview.innerHTML = '<p style="color: #718096;">No image selected</p>';
            audioPreview.innerHTML = '<p style="color: #718096;">No audio selected</p>';
        }
    });

    // Handle form reset
    form.addEventListener('reset', function() {
        setTimeout(function() {
            imagePreview.innerHTML = '<p style="color: #718096;">No image selected</p>';
            audioPreview.innerHTML = '<p style="color: #718096;">No audio selected</p>';
        }, 10);
    });

    // Initialize file previews
    imagePreview.innerHTML = '<p style="color: #718096;">No image selected</p>';
    audioPreview.innerHTML = '<p style="color: #718096;">No audio selected</p>';
});
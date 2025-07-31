# Exam Solver Site

A simple web application for creating and solving exam tasks with support for text, images, and audio content.

## Features

### 📝 Upload Tasks
- Add custom exam tasks with title and description
- Upload optional images and audio files
- Set correct answers for automatic checking
- Clean, user-friendly form interface

### 🎯 Solve Tasks
- View all uploaded tasks on the main page
- Interactive task cards showing text, images, and audio
- Modal-based answer submission
- Instant feedback (Correct/Incorrect)
- Shows correct answer when wrong

### 💾 Data Storage
- Uses browser localStorage for data persistence
- No server required - runs entirely in the browser
- Data persists between browser sessions

## How to Use

### Starting the Site
1. Open `index.html` in your web browser
2. Or run a local server: `python3 -m http.server 8000` and visit `http://localhost:8000`

### Uploading Tasks
1. Click "Upload Task" in the top-right corner
2. Fill in the task title and description
3. Optionally upload an image and/or audio file
4. Enter the correct answer
5. Click "Add Task"
6. Task will appear on the main page

### Solving Tasks
1. View tasks on the main page
2. Click "Solve Task" button on any task card
3. Enter your answer in the popup modal
4. Click "Submit" to check your answer
5. Get instant feedback with correct/incorrect result

### File Support
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Audio**: MP3, WAV, OGG, M4A, AAC

## Features Included

✅ **Two main sections as requested:**
- Upload Task page (linked in top-right corner)
- Solving Tasks main page

✅ **Task content support:**
- Text (title and description)
- Images (with preview)
- Audio files (with player controls)

✅ **Answer system:**
- Hidden answers during task solving
- Automatic answer checking
- Clear "correct" or "incorrect" feedback

✅ **Modern UI:**
- Responsive design
- Beautiful gradient background
- Smooth animations and transitions
- Mobile-friendly layout

## Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser localStorage
- **No backend required** - completely client-side
- **File handling**: Base64 encoding for images/audio
- **Cross-browser compatible**

## Browser Compatibility

Works in all modern browsers including:
- Chrome/Chromium
- Firefox
- Safari
- Edge

Enjoy solving your exams! 🎓
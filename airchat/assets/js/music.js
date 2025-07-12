// music.js
// هذا الملف يتعامل مع تشغيل موسيقى الخلفية.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Music JavaScript loaded.');

    // Create an Audio object for background music
    const bgMusic = new Audio('assets/sounds/bg-music.mp3');
    bgMusic.loop = true; // Loop the music
    bgMusic.volume = 0.3; // Set initial volume (0.0 to 1.0)

    // Optional: Add a mute/unmute button or volume control in your HTML
    // For now, let's assume it starts playing automatically or on user interaction.

    // A common browser restriction: Audio must be initiated by a user gesture.
    // So, we might need a "Play Music" button or start it after the first click on the page.

    function playBackgroundMusic() {
        // Check if music is already playing to prevent multiple plays
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                console.log('Background music started playing.');
            }).catch(error => {
                console.warn('Failed to play background music (user interaction needed?):', error);
                // Prompt user to click a button to enable music
            });
        }
    }

    function stopBackgroundMusic() {
        bgMusic.pause();
        bgMusic.currentTime = 0; // Reset to start
        console.log('Background music stopped.');
    }

    function toggleBackgroundMusic() {
        if (bgMusic.paused) {
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }
    }

    // Attach to a global function for other modules or UI controls to use
    window.playBgMusic = playBackgroundMusic;
    window.stopBgMusic = stopBackgroundMusic;
    window.toggleBgMusic = toggleBackgroundMusic;

    // Example: Play music when user enters the room page (room.html)
    // This will likely require an initial click to work in most browsers.
    if (window.location.pathname.includes('room.html')) {
        // Consider adding a button for "Play/Pause Music"
        // For demonstration, try to play after a slight delay
        // However, a user click is the most reliable way.
        // setTimeout(playBackgroundMusic, 2000);
    }
});

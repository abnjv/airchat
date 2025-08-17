document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = new Audio('assets/sounds/bg-music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3; // Adjust background music volume

    // Play/Pause background music (optional, can add UI controls for it)
    function toggleBackgroundMusic() {
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Failed to play background music:", e));
        } else {
            bgMusic.pause();
        }
    }

    // Autoplay music when user interacts with the page for the first time
    // Many browsers block autoplay without user interaction.
    // A common pattern is to start music after the first click/touch.
    document.body.addEventListener('click', function _listener() {
        if (window.location.pathname.includes('room.html')) {
            toggleBackgroundMusic();
        }
        document.body.removeEventListener('click', _listener); // Remove listener after first click
    });

    // Stop music when leaving the room page (e.g., navigating to rooms.html)
    window.addEventListener('beforeunload', () => {
        bgMusic.pause();
    });

    // Ensure music starts if user lands directly on room.html and interacts
    if (window.location.pathname.includes('room.html')) {
        // Optional: Add a button to manually start/stop music
        // For now, it relies on the initial click on the body
    }
});

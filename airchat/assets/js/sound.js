// sound.js
// هذا الملف يتعامل مع تشغيل المؤثرات الصوتية المختلفة.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sound JavaScript loaded.');

    // Cache sound effects to avoid re-loading for each play
    const soundCache = {};

    function getSound(filename) {
        if (soundCache[filename]) {
            return soundCache[filename].cloneNode(); // Clone to allow multiple concurrent plays
        }
        const audio = new Audio(`assets/sounds/${filename}`);
        soundCache[filename] = audio;
        return audio.cloneNode();
    }

    /**
     * Plays a specific sound effect.
     * @param {string} soundName - The filename of the sound effect (e.g., 'new-message.mp3').
     * @param {number} volume - Optional. Volume from 0.0 to 1.0. Defaults to 1.0.
     */
    window.playSound = (soundName, volume = 1.0) => {
        try {
            const sound = getSound(soundName);
            sound.volume = volume;
            sound.play().catch(error => {
                console.warn(`Failed to play sound ${soundName}:`, error);
                // This usually happens if autoplay is blocked, or sound file not found.
            });
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
        }
    };

    // Example Usage:
    // playSound('new-message.mp3');
    // playSound('gift-sound.mp3', 0.8);
});

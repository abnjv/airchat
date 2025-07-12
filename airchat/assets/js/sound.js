// A centralized function to play various sound effects
function playSound(soundName) {
    let audio;
    switch (soundName) {
        case 'new-message-sound':
            audio = new Audio('assets/sounds/new-message.mp3');
            break;
        case 'mic-sound':
            audio = new Audio('assets/sounds/mic-sound.mp3');
            break;
        case 'gift-sound':
            audio = new Audio('assets/sounds/gift-sound.mp3');
            break;
        case 'welcome-sound':
            audio = new Audio('assets/sounds/welcome.mp3');
            break;
        case 'top-user-join-sound': // For a system message when a top user joins
            audio = new Audio('assets/sounds/top-user-join.mp3');
            break;
        case 'level-up-sound':
            audio = new Audio('assets/sounds/level-up-sound.mp3');
            break;
        default:
            console.warn('Sound not found:', soundName);
            return;
    }
    audio.volume = 0.5; // Default volume for sound effects
    audio.play().catch(e => console.log(`Error playing ${soundName}:`, e));
}

// Make playSound globally accessible (needed by chat.js, gift.js, user.js)
window.playSound = playSound;

document.addEventListener('DOMContentLoaded', () => {
    const toggleMicBtn = document.getElementById('toggle-mic-btn');
    const micStatusUsername = document.getElementById('mic-username');
    const micStatusAvatar = document.getElementById('mic-avatar');

    let isMicOn = false; // Initial state

    if (toggleMicBtn) {
        toggleMicBtn.addEventListener('click', () => {
            isMicOn = !isMicOn;
            if (isMicOn) {
                toggleMicBtn.classList.add('on');
                toggleMicBtn.querySelector('i').classList.remove('icon-mic-off');
                toggleMicBtn.querySelector('i').classList.add('icon-mic-on');
                toggleMicBtn.querySelector('span').textContent = 'نزول المايك';
                playSound('mic-sound'); // Play mic on sound
                // Simulate current user taking the mic
                const currentUser = getCurrentUser();
                if (currentUser) {
                    micStatusUsername.textContent = currentUser.username;
                    micStatusAvatar.src = currentUser.avatar || 'assets/images/default-avatar.png';
                    displaySystemMessage(`${currentUser.username} صعد المايك.`);
                }
            } else {
                toggleMicBtn.classList.remove('on');
                toggleMicBtn.querySelector('i').classList.remove('icon-mic-on');
                toggleMicBtn.querySelector('i').classList.add('icon-mic-off');
                toggleMicBtn.querySelector('span').textContent = 'صعود المايك';
                micStatusUsername.textContent = 'لا أحد على المايك';
                micStatusAvatar.src = 'assets/images/default-avatar.png';
                // Simulate current user leaving the mic
                const currentUser = getCurrentUser();
                if (currentUser) {
                    displaySystemMessage(`${currentUser.username} نزل المايك.`);
                }
            }
        });
    }
});

// bg.js
// هذا الملف يتعامل مع منطق تغيير الخلفيات الديناميكية (إذا كان موجوداً).

document.addEventListener('DOMContentLoaded', () => {
    console.log('Background JavaScript loaded.');

    const roomMainContainer = getElement('.room-main-container');
    const changeBgBtn = getElement('#change-bg-btn');
    const bgUploadInput = getElement('#bg-upload-input');

    // Dummy list of available backgrounds (replace with actual image paths or IDs from server)
    const availableBackgrounds = [
        'default-bg.jpg', // Should be in assets/images/
        'bg-rank1.jpg',
        'bg-rank2.jpg',
        'bg-rank3.jpg'
    ];
    let currentBackgroundIndex = 0;

    // Function to set the background
    function setRoomBackground(imagePath) {
        if (roomMainContainer && imagePath) {
            roomMainContainer.style.backgroundImage = `url('assets/images/${imagePath}')`;
            roomMainContainer.style.backgroundSize = 'cover';
            roomMainContainer.style.backgroundPosition = 'center';
            roomMainContainer.style.backgroundAttachment = 'fixed'; // Optional
            console.log(`Background set to: ${imagePath}`);
        }
    }

    // Load last saved background from localStorage
    const savedBg = localStorage.getItem('roomBackground');
    if (savedBg) {
        setRoomBackground(savedBg);
        currentBackgroundIndex = availableBackgrounds.indexOf(savedBg);
        if (currentBackgroundIndex === -1) currentBackgroundIndex = 0; // Reset if saved not in list
    } else {
        setRoomBackground(availableBackgrounds[0]); // Set default if no saved
    }

    // Change Background Button Listener (Admin/Moderator Only)
    if (changeBgBtn && bgUploadInput) {
        changeBgBtn.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
                // Option 1: Cycle through pre-defined backgrounds
                currentBackgroundIndex = (currentBackgroundIndex + 1) % availableBackgrounds.length;
                const newBg = availableBackgrounds[currentBackgroundIndex];
                setRoomBackground(newBg);
                localStorage.setItem('roomBackground', newBg); // Save preference

                displayMessage(`تم تغيير الخلفية إلى ${newBg}`, 'info', getElement('#chat-area .messages-container'));

                // Option 2: Allow uploading a new background (more complex, requires server-side handling for real upload)
                // For a client-side demo, we can simulate with FileReader
                // bgUploadInput.click(); // Trigger file input
            } else {
                displayMessage('ليس لديك صلاحية لتغيير الخلفية.', 'error', getElement('#chat-area .messages-container'));
            }
        });

        // Event listener for file input change (if enabling custom uploads)
        bgUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // For a real application, you'd upload this to a server
                    // For client-side preview, we can set it directly
                    roomMainContainer.style.backgroundImage = `url('${e.target.result}')`;
                    roomMainContainer.style.backgroundSize = 'cover';
                    roomMainContainer.style.backgroundPosition = 'center';
                    displayMessage('تم تحميل خلفية مخصصة بنجاح (معاينة فقط).', 'success', getElement('#chat-area .messages-container'));
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

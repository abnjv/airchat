document.addEventListener('DOMContentLoaded', () => {
    const giftBoxBtn = document.getElementById('gift-box-btn');
    const giftModal = document.getElementById('gift-modal');
    const closeModalBtn = giftModal ? giftModal.querySelector('.close-button') : null;
    const giftsGrid = document.querySelector('.gifts-grid');
    const confirmGiftSendBtn = document.getElementById('confirm-gift-send');
    const userBalanceSpan = document.getElementById('user-balance');
    const giftErrorMsg = document.getElementById('gift-error-msg');
    const recentGiftsList = document.getElementById('recent-gifts');
    let selectedGift = null;

    // Dummy gift data (in a real app, this would come from a backend)
    const gifts = [
        { id: '1', name: 'قلب', cost: 10, image: 'assets/images/gift1.png' },
        { id: '2', name: 'وردة', cost: 25, image: 'assets/images/gift2.png' },
        { id: '3', name: 'سيارة', cost: 100, image: 'assets/images/gift3.png' },
        { id: '4', name: 'جوهرة', cost: 500, image: 'assets/images/gift4.png' }
    ];

    // Load recent gifts from localStorage
    let recentGifts = JSON.parse(localStorage.getItem('recentGifts')) || [];

    // Display gifts in the modal
    function renderGifts() {
        if (!giftsGrid) return;
        giftsGrid.innerHTML = '';
        gifts.forEach(gift => {
            const giftItem = document.createElement('div');
            giftItem.classList.add('gift-item');
            giftItem.dataset.giftId = gift.id;
            giftItem.innerHTML = `
                <img src="${gift.image}" alt="${gift.name}">
                <div class="gift-name">${gift.name}</div>
                <div class="gift-cost">${gift.cost}</div>
            `;
            giftItem.addEventListener('click', () => selectGift(giftItem, gift));
            giftsGrid.appendChild(giftItem);
        });
    }

    function selectGift(element, gift) {
        // Remove 'selected' class from previously selected gift
        const previouslySelected = giftsGrid.querySelector('.gift-item.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        // Add 'selected' class to the clicked gift
        element.classList.add('selected');
        selectedGift = gift;
        confirmGiftSendBtn.disabled = false; // Enable confirm button
        giftErrorMsg.textContent = ''; // Clear any previous error
    }

    // Update user balance display in the modal
    function updateBalanceDisplay() {
        const user = getCurrentUser();
        if (userBalanceSpan && user) {
            userBalanceSpan.textContent = user.coins;
        }
    }

    // Render recent gifts in the sidebar
    function renderRecentGifts() {
        if (!recentGiftsList) return;
        recentGiftsList.innerHTML = '';
        // Display only the last 5 gifts
        recentGifts.slice(-5).reverse().forEach(gift => {
            const giftItem = document.createElement('li');
            giftItem.classList.add('recent-gift-item');
            giftItem.innerHTML = `
                <img src="${gift.image}" alt="${gift.name}">
                <span>${gift.sender} أرسل ${gift.name} إلى ${gift.receiver}</span>
            `;
            recentGiftsList.appendChild(giftItem);
        });
    }

    if (giftBoxBtn && giftModal && closeModalBtn && confirmGiftSendBtn) {
        giftBoxBtn.addEventListener('click', () => {
            selectedGift = null; // Reset selected gift
            confirmGiftSendBtn.disabled = true; // Disable button initially
            if (giftsGrid) {
                const previouslySelected = giftsGrid.querySelector('.gift-item.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
            }
            updateBalanceDisplay();
            giftErrorMsg.textContent = '';
            giftModal.style.display = 'flex'; // Use flex to center
            renderGifts();
        });

        closeModalBtn.addEventListener('click', () => {
            giftModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === giftModal) {
                giftModal.style.display = 'none';
            }
        });

        confirmGiftSendBtn.addEventListener('click', () => {
            if (!selectedGift) {
                giftErrorMsg.textContent = 'الرجاء اختيار هدية أولاً.';
                return;
            }

            let currentUser = getCurrentUser();
            if (!currentUser) {
                alert('الرجاء تسجيل الدخول لإرسال الهدايا.');
                window.location.href = 'login.html';
                return;
            }

            if (currentUser.coins < selectedGift.cost) {
                giftErrorMsg.textContent = 'رصيدك غير كافٍ لإرسال هذه الهدية.';
                return;
            }

            // Simulate gift sending
            currentUser.coins -= selectedGift.cost;
            currentUser.giftsSent = (currentUser.giftsSent || 0) + 1;
            addXP(selectedGift.cost); // Add XP based on gift cost

            // Simulate receiver (for demonstration, assume sending to a random user or self)
            const simulatedReceiver = "المستخدم X"; // In a real app, this would be a specific user
            // For now, let's make the user send to themselves for demo purposes or a dummy
            const receiverUsername = "نفسك"; // Or the current mic user, etc.

            // Add to recent gifts log
            const newRecentGift = {
                id: selectedGift.id,
                name: selectedGift.name,
                image: selectedGift.image,
                sender: currentUser.username,
                receiver: receiverUsername,
                timestamp: new Date().toISOString()
            };
            recentGifts.push(newRecentGift);
            localStorage.setItem('recentGifts', JSON.stringify(recentGifts));
            renderRecentGifts(); // Update sidebar

            updateCurrentUser(currentUser); // Update user data in localStorage and footer
            updateBalanceDisplay(); // Update modal balance
            giftErrorMsg.textContent = `تم إرسال ${selectedGift.name} بنجاح!`;
            playSound('gift-sound'); // Play gift sound

            // Simulate chat message for gift
            displayGiftMessage(currentUser.username, selectedGift.name, selectedGift.image);

            // Optional: Auto-close modal after a delay
            setTimeout(() => {
                giftModal.style.display = 'none';
            }, 1500);
        });
    }

    // Initial render of recent gifts when room.html loads
    renderRecentGifts();

    // Function to display gift message in chat (called from confirmGiftSendBtn)
    window.displayGiftMessage = function(senderUsername, giftName, giftImage) {
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) return;

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'gift-message');
        messageElement.innerHTML = `
            <img src="${senderUsername === getCurrentUser().username ? getCurrentUser().avatar : 'assets/images/default-avatar.png'}" alt="Avatar" class="avatar">
            <div class="message-content">
                <p>🎁 ${senderUsername} أرسل ${giftName} 🎁</p>
                <img src="${giftImage}" alt="${giftName}" class="gift-icon-in-chat">
            </div>
        `;
        chatArea.prepend(messageElement);
        chatArea.scrollTop = chatArea.scrollHeight;
    };
});

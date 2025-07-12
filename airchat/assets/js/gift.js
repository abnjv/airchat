// gift.js
// هذا الملف يتعامل مع منطق نظام الهدايا.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Gift JavaScript loaded.');

    const giftBoxBtn = getElement('#gift-box-btn');
    const giftModal = getElement('#gift-modal');
    const closeModalBtn = getElement('#gift-modal .close-button');
    const giftsGrid = getElement('.gifts-grid');
    const confirmGiftSendBtn = getElement('#confirm-gift-send');
    const giftStatusMessage = getElement('#gift-status-message');

    let selectedGift = null; // To store the currently selected gift

    // Dummy gift data (replace with data from your backend)
    const availableGifts = [
        { id: 1, name: 'وردة', cost: 10, image: 'gift1.png' },
        { id: 2, name: 'قلب', cost: 50, image: 'gift2.png' },
        { id: 3, name: 'سيارة', cost: 200, image: 'gift3.png' },
        { id: 4, name: 'قصر', cost: 1000, image: 'gift4.png' }
    ];

    // Function to render gifts in the modal
    function renderGifts() {
        if (giftsGrid) {
            giftsGrid.innerHTML = ''; // Clear previous gifts
            availableGifts.forEach(gift => {
                const giftItem = document.createElement('div');
                giftItem.classList.add('gift-item');
                giftItem.dataset.giftId = gift.id;
                giftItem.dataset.giftCost = gift.cost;

                giftItem.innerHTML = `
                    <img src="assets/images/${gift.image}" alt="${gift.name}">
                    <p>${gift.name} (${gift.cost})</p>
                `;
                giftsGrid.appendChild(giftItem);

                // Add click listener to select gift
                giftItem.addEventListener('click', () => {
                    // Remove selected class from previously selected gift
                    if (selectedGift) {
                        const prevSelected = getElement(`.gift-item[data-gift-id="${selectedGift.id}"]`);
                        if (prevSelected) prevSelected.classList.remove('selected');
                    }
                    // Add selected class to current gift
                    giftItem.classList.add('selected');
                    selectedGift = gift;
                });
            });
        }
    }

    // Open Gift Modal
    if (giftBoxBtn) {
        giftBoxBtn.addEventListener('click', () => {
            renderGifts(); // Render gifts every time modal opens
            giftModal.style.display = 'flex'; // Use flex to center
            selectedGift = null; // Reset selected gift
            giftStatusMessage.classList.add('hidden'); // Hide status message
        });
    }

    // Close Gift Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            giftModal.style.display = 'none';
        });
    }

    // Close modal if clicked outside of content
    if (giftModal) {
        window.addEventListener('click', (event) => {
            if (event.target == giftModal) {
                giftModal.style.display = 'none';
            }
        });
    }

    // Confirm Send Gift
    if (confirmGiftSendBtn) {
        confirmGiftSendBtn.addEventListener('click', () => {
            if (!selectedGift) {
                displayMessage('الرجاء اختيار هدية أولاً.', 'error', giftStatusMessage);
                return;
            }

            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                displayMessage('يجب تسجيل الدخول لإرسال الهدايا.', 'error', giftStatusMessage);
                return;
            }

            if (currentUser.coins < selectedGift.cost) {
                displayMessage('ليس لديك عملات كافية لإرسال هذه الهدية.', 'error', giftStatusMessage);
                return;
            }

            // Simulate sending gift (in a real app, this goes to server)
            updateUserCoins(-selectedGift.cost); // Deduct coins from sender
            updateUserXP(selectedGift.cost / 10); // Grant XP for sending gift (example)

            // Simulate gift being received by someone (e.g., a specific user or the room)
            // For simplicity, let's just update total received gifts for demo purposes
            updateTotalGiftsReceived(1); // Update count of received gifts (simulated for sender's view)

            displayMessage(`تم إرسال ${selectedGift.name} بنجاح!`, 'success', giftStatusMessage);
            playSound('gift-sound.mp3'); // Play gift sound

            // Optional: close modal after successful send
            setTimeout(() => {
                giftModal.style.display = 'none';
            }, 1000);

            // In a real application:
            // socket.send(JSON.stringify({ type: 'sendGift', giftId: selectedGift.id, recipientId: 'someUserId' }));
        });
    }

    // === Gift Statistics ===
    const totalGiftsSentElement = getElement('#total-gifts-sent');
    const totalGiftsReceivedElement = getElement('#total-gifts-received');

    // Retrieve initial counts from localStorage (simulate persistence)
    let totalGiftsSent = parseInt(localStorage.getItem('totalGiftsSent') || '0');
    let totalGiftsReceived = parseInt(localStorage.getItem('totalGiftsReceived') || '0');

    function updateGiftStatsUI() {
        if (totalGiftsSentElement) totalGiftsSentElement.textContent = totalGiftsSent;
        if (totalGiftsReceivedElement) totalGiftsReceivedElement.textContent = totalGiftsReceived;
    }

    // Functions to update counts (can be called from other modules/server events)
    window.updateTotalGiftsSent = (amount) => {
        totalGiftsSent += amount;
        localStorage.setItem('totalGiftsSent', totalGiftsSent);
        updateGiftStatsUI();
    };

    window.updateTotalGiftsReceived = (amount) => {
        totalGiftsReceived += amount;
        localStorage.setItem('totalGiftsReceived', totalGiftsReceived);
        updateGiftStatsUI();
    };

    updateGiftStatsUI(); // Initial update of gift stats on load
});

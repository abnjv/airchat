document.addEventListener('DOMContentLoaded', () => {
    const roomPage = document.querySelector('.room-page');
    // Function to set background image
    function setRoomBackground(imageUrl) {
        if (roomPage) {
            roomPage.style.backgroundImage = `url('${imageUrl}')`;
            roomPage.style.backgroundSize = 'cover';
            roomPage.style.backgroundPosition = 'center';
            roomPage.style.backgroundAttachment = 'fixed'; // Optional: for parallax effect
        }
    }

    // Simulate setting a background based on user rank or room type
    // In a real app, this would come from room data from the backend.
    const currentUser = getCurrentUser();
    if (roomPage && currentUser) {
        let bgImage = 'assets/images/default-bg.jpg'; // Default background

        if (currentUser.rank === 'VIP') {
            bgImage = 'assets/images/bg-rank3.jpg'; // Example VIP background
        } else if (currentUser.rank === 'مشرف') {
            bgImage = 'assets/images/bg-rank2.jpg'; // Example Admin background
        }
        // You can add more conditions based on room ID or other criteria
        setRoomBackground(bgImage);
    } else if (roomPage) {
        // If no user is logged in, use default background
        setRoomBackground('assets/images/default-bg.jpg');
    }
});

const socket = io();

// استخراج اسم المستخدم واسم الغرفة من عنوان الرابط
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username") || "مجهول";
const roomName = urlParams.get("room") || "عام";

// عرض الاسم والغرفة
document.getElementById("username").innerText = username;
document.getElementById("roomName").innerText = roomName;

// إرسال انضمام الغرفة للسيرفر
socket.emit("join-room", { username, room: roomName });

// الخروج من الغرفة
document.getElementById("leaveBtn").addEventListener("click", () => {
  window.location.href = "/";
});

// إعداد الاتصال WebRTC
let localStream;

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(stream => {
    localStream = stream;
    // إظهار رمز المايك مفتوح
    document.querySelectorAll('.mic-slot').forEach(slot => {
      slot.innerText = '🎙️'; // مبدئياً كل الدوائر رمز المايك
    });

    // إرسال الصوت للمستخدمين الآخرين
    socket.on("user-connected", userId => {
      console.log(`مستخدم جديد متصل: ${userId}`);
      // هنا مستقبلاً سنربطه بـ WebRTC PeerConnection
    });
  })
  .catch(error => {
    alert("لا يمكن الوصول للميكروفون.");
    console.error(error);
  });

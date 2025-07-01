const socket = io();

// 🧠 جلب بيانات المستخدم من LocalStorage
const username = localStorage.getItem("username") || "مستخدم";
const roomName = localStorage.getItem("room") || "عام";
const isHost = true; // سيتم تعديله لاحقًا حسب أول مستخدم

// 💬 إرسال بيانات الدخول إلى السيرفر
socket.emit("join-room", { username, room: roomName });

// 🎤 تشغيل المايكروفون باستخدام WebRTC
let localStream;

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(stream => {
    localStream = stream;

    console.log("🎙️ تم تشغيل المايك بنجاح");

    // ✅ تفعيل رمز المايك للدائرة الخاصة بالمستخدم
    document.querySelectorAll('.mic-circle').forEach(circle => {
      const nameEl = circle.querySelector(".mic-name");
      if (nameEl && nameEl.textContent === username) {
        circle.style.borderColor = "#0f0"; // أخضر = المايك شغال
      }
    });

    // 📡 مستعد لاستقبال اتصال مستخدمين آخرين
    socket.on("user-connected", userId => {
      console.log("🟢 مستخدم متصل:", userId);
      // لاحقًا نربط PeerConnection هنا
    });

  })
  .catch(err => {
    console.error("❌ فشل تشغيل المايك:", err);
    alert("⚠️ لم يتم تفعيل الميكروفون، يرجى السماح له.");
  });

// 🚪 زر الخروج من الغرفة
const leaveBtn = document.getElementById("leaveBtn");
if (leaveBtn) {
  leaveBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

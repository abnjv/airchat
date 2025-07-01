const socket = io();

// 🧠 جلب بيانات المستخدم من LocalStorage
const username = localStorage.getItem("username") || "مستخدم";
const roomName = localStorage.getItem("room") || "عام";
const isHost = true; // سيتم التحقق لاحقًا
let localStream;
let peers = {}; // قائمة الاتصال WebRTC

// 💬 إرسال بيانات الدخول إلى السيرفر
socket.emit("join-room", { username, room: roomName });

// 🎤 تشغيل المايكروفون
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then(stream => {
    localStream = stream;
    console.log("🎙️ تم تشغيل المايك بنجاح");

    // ✅ تلوين دائرة المستخدم
    document.querySelectorAll('.mic-circle').forEach(circle => {
      const nameEl = circle.querySelector(".mic-name");
      if (nameEl && nameEl.textContent === username) {
        circle.style.borderColor = "#0f0"; // أخضر = مايك شغال
      }
    });

    // 📡 الاتصال مع المستخدمين الآخرين
    socket.on("user-connected", userId => {
      console.log("🟢 مستخدم جديد:", userId);
      connectToNewUser(userId, stream);
    });

    // استقبال الإشارة من مستخدم آخر
    socket.on("signal", ({ from, signal }) => {
      if (!peers[from]) {
        const peer = createPeer(from, false);
        peers[from] = peer;
      }
      peers[from].signal(signal);
    });

  }).catch(err => {
    console.error("❌ فشل تشغيل المايك:", err);
    alert("⚠️ لم يتم تفعيل الميكروفون.");
  });


// 🧠 إنشاء اتصال WebRTC مع مستخدم آخر
function connectToNewUser(userId, stream) {
  const peer = createPeer(userId, true);
  peers[userId] = peer;

  stream.getTracks().forEach(track => {
    peer.addTrack(track, stream);
  });
}

// ⚙️ إنشاء Peer باستخدام Simple-Peer
function createPeer(userId, initiator) {
  const peer = new SimplePeer({
    initiator,
    trickle: false,
    stream: localStream
  });

  peer.on("signal", signal => {
    socket.emit("signal", {
      to: userId,
      from: socket.id,
      signal
    });
  });

  peer.on("stream", remoteStream => {
    // 🎧 تشغيل صوت المستخدم الآخر
    const audio = document.createElement("audio");
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    document.body.appendChild(audio);
  });

  return peer;
}

// 🚪 زر الخروج
const leaveBtn = document.getElementById("leaveBtn");
if (leaveBtn) {
  leaveBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

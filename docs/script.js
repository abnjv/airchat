const socket = io();
let localStream;
let peers = {};
let username = "";
let roomName = "";

function joinRoom() {
  username = document.getElementById("username").value;
  roomName = document.getElementById("room").value;

  if (!username || !roomName) return alert("أدخل الاسم واسم الغرفة");

  document.getElementById("login").classList.add("hidden");
  document.getElementById("roomContainer").classList.remove("hidden");
  document.getElementById("roomTitle").innerText = `🎧 الغرفة: ${roomName}`;

  socket.emit("join", { username, room: roomName });

  startMic();
}

// تشغيل المايك المحلي
async function startMic() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // ربط الصوت بجميع المستخدمين
    socket.on("user-connected", (userId) => {
      const peer = createPeer(userId);
      peers[userId] = peer;
    });

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
      delete peers[userId];
    });

    socket.on("offer", async ({ from, offer }) => {
      const peer = createPeer(from, false);
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    socket.on("answer", ({ from, answer }) => {
      if (peers[from]) peers[from].setRemoteDescription(answer);
    });

    socket.on("ice-candidate", ({ from, candidate }) => {
      if (peers[from]) peers[from].addIceCandidate(candidate);
    });

  } catch (e) {
    alert("فشل في تشغيل المايك: " + e.message);
  }
}

function createPeer(userId, initiator = true) {
  const peer = new RTCPeerConnection();

  localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

  peer.onicecandidate = e => {
    if (e.candidate) {
      socket.emit("ice-candidate", {
        to: userId,
        candidate: e.candidate
      });
    }
  };

  peer.ontrack = e => {
    const audio = document.createElement("audio");
    audio.srcObject = e.streams[0];
    audio.autoplay = true;
    document.body.appendChild(audio);
  };

  if (initiator) {
    peer.onnegotiationneeded = async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("offer", { to: userId, offer });
    };
  }

  return peer;
}

function leaveRoom() {
  location.reload();
}

function toggleMic(id) {
  alert(`الميك ${id} تم النقر عليه (تفعيله لاحقًا للمضيف فقط)`);
}

const socket = io();
const username = localStorage.getItem("username");
const room = localStorage.getItem("room");

if (username && room) {
  socket.emit("joinRoom", { username, room });
}

socket.on("roomUsers", ({ users }) => {
  document.getElementById("users").innerHTML =
    users.map(u => "<div>" + u.username + "</div>").join("");
});
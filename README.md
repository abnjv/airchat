# AirChat 🗨️

**AirChat** is a simple real-time voice and text chat app built using:

- 🟢 Node.js + Express + Socket.IO
- 🗂️ MongoDB Atlas
- 💻 HTML, CSS, JS (vanilla frontend)

---

## 🚀 Features

- Real-time communication (text/audio)
- Join/create chat rooms
- Socket.IO backend + clean API structure
- MongoDB storage for users & messages
- Simple and responsive frontend

---

## 📁 Project Structure

airchat/
├── backend/       → Node.js server (Express, MongoDB, Socket.IO)
├── airchat/       → Frontend (HTML, JS, CSS)

---

## ⚙️ Run Locally

cd backend
npm install
node server.js

Open airchat/index.html in your browser.

---

## 🌐 Deployment

To deploy frontend:
- Copy airchat/ contents to /var/www/html/ on your server.
- Open in browser via http://your-ec2-ip/

To deploy backend:
- Use pm2 start server.js inside backend/.

---

## 👤 Developer

Made by **Mohammed** (2025) — with the help of AI and pure passion to learn.

---

## 📜 License

Educational and personal use only.

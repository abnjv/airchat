<!DOCTYPE html><html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🎤 AirChat - غرفة صوتية</title>
  <link rel="stylesheet" href="style.css" />
  <script src="/socket.io/socket.io.js"></script>
  <script defer src="script.js"></script>
  <style>
    body {
      background-image: url('bg.jpg');
      background-size: cover;
      background-position: center;
      margin: 0;
      padding: 0;
      font-family: 'Tahoma', sans-serif;
      color: #fff;
      text-align: center;
    }
    #login {
      padding-top: 100px;
    }
    #room {
      display: none;
      padding: 30px;
    }
    .mic-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid #ffc107;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px;
      position: relative;
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.3);
    }
    .mic-circle img {
      width: 80%;
      height: 80%;
      border-radius: 50%;
    }
    .username {
      color: #fff;
      margin-top: 8px;
    }
    .menu {
      position: absolute;
      bottom: -90px;
      background-color: rgba(0, 0, 0, 0.9);
      border-radius: 8px;
      width: 140px;
      display: none;
      flex-direction: column;
      z-index: 999;
    }
    .menu button {
      background: none;
      border: none;
      color: white;
      padding: 10px;
      font-size: 14px;
      cursor: pointer;
      border-bottom: 1px solid #333;
    }
    .menu button:last-child {
      border-bottom: none;
    }
    .menu button:hover {
      background-color: #333;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      justify-content: center;
      padding: 40px;
    }
  </style>
</head>
<body>
  <div id="login">
    <h1>🎤 <b>AirChat</b></h1>
    <input id="username" type="text" placeholder="اسم المستخدم" />
    <input id="roomPassword" type="password" placeholder="كلمة سر الغرفة (اختياري)" />
    <br>
    <button id="joinBtn">✅ دخول الغرفة</button>
  </div><

  

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const crypto = require('crypto');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});
// console.log('privatekey is:  ' + privateKey);
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.emit('public-key', ({ publicKey: publicKey }));
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    // console.log("\n message from client: \n" + data.message);
    // const decryptedMessage = crypto.privateDecrypt(privateKey, data.message);

    const decryptedMessage = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    }, Buffer.from(data.message, 'base64')).toString('utf8');

    // console.log(decryptedMessage);

    io.in(data.room).emit("receive_message", decryptedMessage);
    // console.log('\n privateKey is: \n'+ privateKey);
    console.log('decrypted message is: \n' + decryptedMessage);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

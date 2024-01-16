import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import JSEncrypt from 'jsencrypt';
const socket = io.connect("http://localhost:3001");

function App() {
  //Room State
  const [room, setRoom] = useState("");
  const [Joinroom, setJoinRoom] = useState("");

  // Messages States
  const [message, setMessage] = useState("");

  const [messageReceived, setMessageReceived] = useState([]);
  // console.log(messageReceived);

  const [publicKey, setPublicKey] = useState(null);

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoinRoom(room);
    }
  };


  socket.on('public-key', (dataKey) => {
    console.log(dataKey.publicKey)
    setPublicKey(dataKey.publicKey);
  });

  const handleSendMessage = () => {

    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    const encryptedMessage = encryptor.encrypt(message);
    // Check if encryptedMessage is available
    if (encryptedMessage) {
      // console.log('encryptedMessage is ' + encryptedMessage);
      // If encryptedMessage is available, use it as the message
      socket.emit("send_message", { message: encryptedMessage, room });
    } else {
      // If encryptedMessage is not available, use the original message
      alert("Couldn't send message")
    }
    setMessage('')
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived(prevMessages => [...prevMessages, data]);
      // console.log(data);
      // setMessageReceived(data);
    });
  }, [socket]);
  return (
    <div className="App">
      <input
        placeholder="Room Number..."
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <button onClick={joinRoom}> Join Room</button>
      <input
        value={message}
        placeholder="Message..."
        onChange={(event) => {
          setMessage(event.target.value);
        }}

      />
      <button
        onClick={handleSendMessage}
      >
        Send Message
      </button>
      <div>
        <p>Your room: {Joinroom}</p>
      </div>
      <h3> Message:</h3>
      <ul>
        {messageReceived.map((msg, index) =>
          <li key={index}>{msg}</li>
        )}
      </ul>
    </div>
  );
}

export default App;

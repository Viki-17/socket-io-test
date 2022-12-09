const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//to set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ShriRam Bot";

//run when client connects
io.on("connection", (socket) => {
  console.log("New connection...");

  socket.on("joinRoom", ({ username, room }) => {
    console.log(username, room);
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //welcome message
    socket.emit("message", formatMessage(botName, "Welcome to Shriram"));

    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    //emit when client disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );
      }
    });
  });

  //listen for chat message form main.js
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));

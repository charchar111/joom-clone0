import http from "http";
import { Server } from "socket.io";
// import socketIo from "socket.io";
// import WebSocket, { WebSocketServer } from "ws";
const { instrument } = require("@socket.io/admin-ui");
import express from "express";

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/static", express.static("src/public"));
app.get("/", (req, res) => {
  return res.render("home");
});
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
// const wsServer = socketIo(httpServer);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const { sids, rooms } = wsServer.sockets.adapter;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRooms(roomName) {
  console.log("countRooms");

  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket.nickname = "Anon";
  wsServer.sockets.emit("room_change", publicRooms());
  // wsServer.socketsJoin("announcement");
  // wsServer.emit("announcement", "바른 말 고운말로 채팅하세요^^");
  socket.onAny((event) => {
    console.log(publicRooms());
    console.log(`onAny: ${event}`);
  });

  socket.on("nickname", (nickname, callback) => {
    socket.nickname = nickname;
    callback();
  });

  socket.on("enter_room", (roomName, callback) => {
    // console.log(Name);
    // console.log(socket.id);
    // console.log(socket.rooms);
    socket.join(roomName);
    callback();
    socket.to(roomName).emit("welcome", socket.nickname, countRooms(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
    // setTimeout(() => callback(Name), 3000);
  });

  socket.on("new_message", (msg, roomNames, callback) => {
    socket.to(roomNames).emit("new_message", `${socket.nickname} : ${msg}`);
    callback();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((element) => {
      socket.to(element).emit("bye", socket.nickname, countRooms(element) - 1);
    });
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
});

httpServer.listen(PORT, () => console.log(`server listen ${PORT}`));

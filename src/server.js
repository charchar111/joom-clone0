import http from "http";
import { Server } from "socket.io";

import express from "express";
import { off } from "process";

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

wsServer.on("connect", (ws) => {
  ws.on("join_room", (roomname) => {
    ws.join(roomname);
    console.log(roomname);
    ws.to(roomname).emit("welcome");
  });

  ws.on("offer", (offer, roomname) => {
    ws.to(roomname).emit("offer", offer);
  });

  ws.on("offer_answer", (answer, roomname) => {
    ws.to(roomname).emit("offer_answer", answer);
  });

  ws.on("iceCandidate", (ice, roomname) => {
    ws.to(roomname).emit("iceCandidate", ice);
  });
});

httpServer.listen(PORT, () => console.log(`server listen ${PORT}`));

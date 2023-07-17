import http from "http";
import WebSocket, { WebSocketServer } from "ws";
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

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

let socketDB = [];

wss.on("connection", (backendSocket) => {
  socketDB.push(backendSocket);
  backendSocket.nickname = "unknown";
  console.log("connected to browser!!");

  // console.log(socketDB.length);
  backendSocket.on("close", (backendSocket) => {
    console.log("disconnected from the client browser");

    // soketDB에서 close된 소켓 삭제
    socketDB = socketDB.filter((item) => {
      return item.readyState !== 3 ? true : false;
    });
  });
  backendSocket.on("message", (message) => {
    const { payload, type } = JSON.parse(message.toString());
    // if (type == "new_message") {
    //   socketDB.forEach((aSoket) => aSoket.send(message));
    // } else if (type == "nickname") {
    //   console.log("nickname");
    // }
    switch (type) {
      case "new_message":
        socketDB.forEach((item) =>
          item.send(
            JSON.stringify({ nickname: backendSocket.nickname, payload })
          )
        );
        break;
      case "nickname":
        backendSocket.nickname = payload;
        break;
    }
  });
});
// app.listen(PORT, () => {
//   console.log(`server listen ${PORT}`);
// });

server.listen(PORT, () => console.log(`server listen ${PORT}`));

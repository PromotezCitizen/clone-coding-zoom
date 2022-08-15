import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views")

app.use("/public", express.static(__dirname + "/public"))

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`listening on localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server( {server} );

const sockets = []

wss.on("connection", (socket) => {
    sockets.push(socket)
    socket["nickname"] = "Anon"
    socket.send('hello!');
    socket.on("close", () => {
        console.log("disconnected from browser")
    })
    socket.on("message", (msg) => {
        const message = JSON.parse(msg)
        switch (message.type){
            case "new_msg":
                sockets.forEach(aSock => aSock.send(`${socket.nickname}: ${message.payload}`))
            case "nickname":
                socket["nickname"] = message.payload
        }
        // sockets.forEach(aSock => aSock.send(msg.toString('utf8')))
        // const translatedMessageData = msg.toString('utf8');
        // console.log(translatedMessageData);
    })
    console.log("connected to browser");
})

server.listen(3000, handleListen);

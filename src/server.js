import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views")

app.use("/public", express.static(__dirname + "/public"))

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`listening on localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors:{
        origin: ["https://admin.socket.io"],
        credentials: true,
    }
})

instrument(wsServer, {
    auth: false
})

function publicRooms() {
    const {
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer
    // const sids = wsServer.sockets.adapter.sids
    // const rooms = wsServer.sockets.adapter.rooms

    const publicRooms = []
    rooms.forEach( (room, key) => {
        if (sids.get(key) === undefined){
            publicRooms.push([key, room.size])
        }
    })

    return publicRooms
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

wsServer.on("connection", socket => {
    socket["nickname"] = "Anon"
    socket.onAny( (event) => {
        console.log(`Socket event: ${event}`)
    })
    socket.on("enter_room", (room_name, done) => {
        socket.join(room_name)
        done()
        socket.to(room_name).emit("welcome", socket.nickname, countRoom(room_name))
        wsServer.sockets.emit("room_change", publicRooms(), countRoom(room_name))

    })
    socket.on("disconnecting", () => {
        socket.rooms.forEach( (room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1) )
        
    })
    socket.on("disconnect", () =>{
        wsServer.sockets.emit("room_change", publicRooms())
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("message", `${socket.nickname}: ${msg}`)
        done()
    })
    socket.on("nickname", nickname => {
        socket["nickname"] = nickname
    })
})


/*
import WebSocket from "ws";
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
*/
httpServer.listen(3000, handleListen);

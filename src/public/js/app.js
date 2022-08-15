const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")

room.hidden = true

let room_name

function addMessage(msg) {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = msg
    ul.appendChild(li)
}

function handleMessageSubmit(event){
    event.preventDefault()
    const input = room.querySelector("#msg input")
    socket.emit("new_message", input.value, room_name, () => {
        addMessage(`You: ${input.value}`)
    })
    input.value = ""
}

function handleNicknameSubmit(event) {
    event.preventDefault()
    const input = room.querySelector("#name input")
    socket.emit("nickname", input.value)
}

function showRoom(){
    welcome.hidden = true
    room.hidden = false
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${room_name}`

    const msgForm = room.querySelector("#msg")
    const nameForm = room.querySelector("#name")
    msgForm.addEventListener("submit", handleMessageSubmit)
    nameForm.addEventListener("submit", handleNicknameSubmit)
}

function handleRoomSubmit(event){
    event.preventDefault()
    const input = form.querySelector("input")
    socket.emit("enter_room", input.value, showRoom)
    room_name = input.value
    input.value = ""
}
form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${room_name} (${newCount})`
    addMessage(`${user} joined`)
})

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${room_name} (${newCount})`
    addMessage(`${left} left`)
})
socket.on("message", (msg) => addMessage(msg))

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul")
    roomList.innerHTML = ""
    if (rooms.length === 0){
        return
    }
    rooms.forEach( room => {
        console.log(room)
        const li = document.createElement("li")
        // li.innerText = room
        li.innerText = `${room[0]} (${room[1]})`
        roomList.append(li)
    })
})
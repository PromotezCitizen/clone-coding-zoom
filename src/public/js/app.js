const msgList = document.querySelector("ul")
const nickForm = document.querySelector("#nick")
const msgForm = document.querySelector("#msg")
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMsg(type, payload) {
    const msg = {type, payload}
    return JSON.stringify(msg)
}

socket.addEventListener("open", () => {
    console.log("connected to server");
});

socket.addEventListener("message", (msg) => {
    const li = document.createElement("li")
    li.innerText = msg.data
    msgList.append(li)
})

socket.addEventListener("close", () => {
    console.log("disconnected from server")
})


// setTimeout( () => {
//     socket.send("hello from the browser")
// }, 1000)


function handleSubmit(event) {
    event.preventDefault()
    const input = msgForm.querySelector("input")
    socket.send(makeMsg("new_msg", input.value))
    input.value = ""
}
msgForm.addEventListener("submit", handleSubmit)

function handleNickSubmit(event){
    event.preventDefault()
    const input = nickForm.querySelector("input")
    socket.send(makeMsg("nickname", input.value))
    input.value = ""
}
nickForm.addEventListener("submit", handleNickSubmit)
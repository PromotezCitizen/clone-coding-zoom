const socket = io()

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute") 
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")


let myStream
let muted = false
let camoff = false

// 실제로는 마이크만 이용한다
async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter( device => device.kind === "videoinput")
        const currentCam = myStream.getVideoTracks()[0]
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if (currentCam.label === camera.label){
                option.selected = true
            }
            camerasSelect.append(option)
        })
        console.log(cameras)
    } catch(e) {
        console.log(e)
    }
}

async function getMedia(deviceId){
    const initConstrains = {
        audio: true,
        video: {facingMode: "user"}
    }
    const camConstrains = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    }

    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? camConstrains : initConstrains
        )
        myFace.srcObject = myStream
        if (!deviceId) {
            await getCameras()
        }
    } catch(e){
        console.log(e)
    }
}

getMedia()

function handleMuteBtnClick(){
    if (!muted){
        muteBtn.innerText = "Unmute"
    } else{
        muteBtn.innerText = "Mute"
    }
    muted = !muted
    myStream
        .getAudioTracks()
        .forEach(track => track.enabled = !track.enabled)
}
function handleCamBtnClick(){
    if (!camoff){
        cameraBtn.innerText = "Turn camera off"
    } else{
        cameraBtn.innerText = "Turn camera on"
    }
    camoff = !camoff
    myStream
        .getVideoTracks()
        .forEach(track => track.enabled = !track.enabled)
}
async function handleCameraChange(){
    await getMedia(camerasSelect.value)
}
muteBtn.addEventListener("click", handleMuteBtnClick)
cameraBtn.addEventListener("click", handleCamBtnClick)
camerasSelect.addEventListener("input", handleCameraChange)
const socket = io("http://192.168.1.62:3000", { transports : ['websocket'] })
const messageForm = document.getElementById("send-container")
const messageInput = document.getElementById("message-input")
const messageContainer = document.getElementById("message-container")
const chatName = document.getElementById("chat-name").innerHTML

appendMessage("Welcome "+ chatName + " to the chat")
socket.emit("new-user", chatName)

socket.on("chat-message", data =>{
    appendMessage(data.name + ": " + data.message)
})
socket.on("user-connected", name =>{
    appendMessage(name + " has connected")
})
socket.on("user-disconnected", name =>{
    appendMessage(name + " has disconnected")
})

messageForm.addEventListener("submit", e =>{
    e.preventDefault()
    const message = messageInput.value
    appendMessage("You: " + message)
    socket.emit("send-chat-message", message)
    console.log(message)
    message.value = ""
    messageInput.value = ""
})

function appendMessage(message) {
    const messageElement = document.createElement("div")
    messageElement.innerText = message
    messageContainer.append(messageElement)
}
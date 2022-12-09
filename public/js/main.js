const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

//get username and room from url

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);
const socket = io();

//join chatroom
socket.emit("joinRoom", { username, room });

//message from server
socket.on("message", (message) => {
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //getting msg from chat box
  const msg = e.target.elements.msg.value;

  //Emit message to server
  socket.emit("chatMessage", msg);

  //clear
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output message to dom

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

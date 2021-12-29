const socket = io();

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

const room = document.querySelector("#room");
room.hidden = true;

let roomName;

function addMessage(message) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li);
}

function handleMessageSubmit(event) {
	event.preventDefault();
	const input = room.querySelector("input")
	socket.emit("new_message", input.value, roomName, () => {
		addMessage(`You: ${input.value}`)
	});
}

function showRoom() {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName}`;

	const messageForm = room.querySelector("form");
	messageForm.addEventListener("submit", handleMessageSubmit);
}


function handleRoomSubmit(event) {
	event.preventDefault();
	const input = welcomeForm.querySelector("input");
	socket.emit("enter_room", input.value, showRoom);
	roomName = input.value;
	input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
	console.log("weclome event invoked");
	addMessage("Someone joined!");
});

socket.on("bye", () => {
	console.log("weclome event invoked");
	addMessage("Someone left!");
});

socket.on("new_message", addMessage);
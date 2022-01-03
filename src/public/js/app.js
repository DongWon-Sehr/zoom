// reference 1: https://nomadcoders.co/noom/lobby
// reference 2: https://webrtc.github.io/samples/src/content/devices/input-output/

const socket = io();

const myFace = document.querySelector("#myFace");
const muteBtn = document.querySelector("#mute");
const cameraBtn = document.querySelector("#camera");
const videoSelect = document.querySelector("#videoSelect");
const audioSelect = document.querySelector("#audioSelect");
const selectors = [ videoSelect, audioSelect ];

const room = document.querySelector("#room");
room.hidden = true;

let myStream;
let myPeerConnection;
let myDataChannel;
let muted = false;
let cameraOff = false;
let p_roomTitle;
let p_userId;
let p_roomStatus={};

async function getDevices(deviceInfos) {
	
	selectors.forEach( selector => {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild);
		}
	});

	deviceInfos.forEach(deviceInfo => {
		const option = document.createElement("option");
		option.value = deviceInfo.deviceId;
		option.innerText = deviceInfo.label;
		switch (deviceInfo.kind) {
		case "videoinput":
			if (myStream.getVideoTracks()[0].label === deviceInfo.label) {
				option.selected = true;
			}
			videoSelect.appendChild(option);
			break;
		case "audioinput":
			if (myStream.getAudioTracks()[0].label === deviceInfo.label) {
				option.selected = true;
			}
			audioSelect.appendChild(option);
			break;
		}
	});
}

function getStream(stream) {
	myFace.srcObject = myStream = stream;
	return navigator.mediaDevices.enumerateDevices();
}

async function getMedia() {

	const audioSource = audioSelect.value;
	const videoSource = videoSelect.value;

	const constraints = {
		audio: {
			deviceId: audioSource ? { exact: audioSource } : undefined
		},
		video: { 
			facingMide: "user",
			deviceId: videoSource ? { exact: videoSource } : undefined 
		},
	};

	try {
		await navigator.mediaDevices.getUserMedia(constraints).then(getStream).then(getDevices).then(makeConnection);
		if (myPeerConnection) {
			const videoTrack = myStream.getVideoTracks()[0];
			const audioTrack = myStream.getAudioTracks()[0];
			// const videoSender = 
			myPeerConnection
				.getSenders()
			// 	.find((sender) => sender.track.kind === "video");

			// videoSender.replaceTrack(videoTrack);
				.forEach((sender) => {
					switch (sender.track.kind) {
						case "video":
							sender.replaceTrack(videoTrack);
							break;
						case "audio":
							sender.replaceTrack(audioTrack);
							break;
					}
				}); 
		}
	}
	catch(e) {
		console.log(e);
	}
}

function handleMuteClick() {
	myStream
		.getAudioTracks()
		.forEach((track) => {
			track.enabled = !track.enabled
		});
	if ( !muted ) {
		muteBtn.innerText = "Unmute";
		muted = true;
	} else {
		muteBtn.innerText = "Mute";
		muted = false;
	}
}

function handleCameraClick() {
	myFace.srcObject
		.getVideoTracks()
		.forEach((track) => {
			track.enabled = !track.enabled
		})
	if ( !cameraOff ) {
		cameraBtn.innerText = "Turn Camera On";
		cameraOff = true;
	} else {
		cameraBtn.innerText = "Turn Camera Off";
		cameraOff = false;
	}
	
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
videoSelect.onchange = getMedia;
audioSelect.onchange = getMedia;


// Welcome Form (join a room) code below ----------------------------------------------------------------------------------------------
const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");

function getRoomTitle(i_roomTitle, i_roomSize) {
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${i_roomTitle} (${i_roomSize})`;
}

async function initCall() {
	welcome.hidden = true;
	room.hidden = false;

	await getMedia();
}

// function setRoom(i_roomTitle, i_roomSize) {
// 	getRoomTitle(i_roomTitle, i_roomSize);

// 	const messageForm = room.querySelector("#message");
// 	messageForm.addEventListener("submit", handleMessageSubmit);
// }

async function handleWelcomeSubmit(event) {
	event.preventDefault();
	const roomTitleInput = welcomeForm.querySelector("#roomTitle");
	const userIdInput = welcomeForm.querySelector("#userId");
	p_roomTitle = roomTitleInput.value;
	p_userId = userIdInput.value;
	
	await initCall();
	await socket.emit("join_room", roomTitleInput.value, userIdInput.value, getRoomTitle);

	// getRoomTitle(p_roomTitle, p_roomStatus[p_roomTitle].size);

	const messageForm = room.querySelector("#message");
	messageForm.addEventListener("submit", handleMessageSubmit);
	
	roomTitleInput.value = userIdInput.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


// socket code below ----------------------------------------------------------------------------------------------
function addMessage(message) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerHTML = message;
	ul.appendChild(li);
}

function handleMessageSubmit(event) {
	event.preventDefault();
	const messageInput = room.querySelector("#message input")
	const msg = `${p_userId}: ${messageInput.value}`; 
	myDataChannel.send(msg);
	addMessage(`<b>${p_userId}</b> (<i>you</i>): ${messageInput.value}`);
	// socket.emit("new_message", value, p_roomTitle, () => {
	// 	addMessage(`<b>${p_userId}</b> (<i>you</i>): ${value}`);
	// });
	messageInput.value = "";
}

socket.on("join_noti", async (i_uesrId, i_roomSize) => {
	myDataChannel = myPeerConnection.createDataChannel("chat");
	myDataChannel.addEventListener("message", (event) => {
		addMessage(event.data);
	});
	console.log("made DataChannel");

	const offer = await myPeerConnection.createOffer();
	myPeerConnection.setLocalDescription(offer);
	socket.emit("offer", offer, p_roomTitle);
	getRoomTitle(p_roomTitle, i_roomSize);
	addMessage(`${i_uesrId} joined!`);
});

socket.on("offer", async (i_offer) => {
	myPeerConnection.addEventListener("datachannel", (event) => {
		myDataChannel = event.channel;
		myDataChannel.addEventListener("message", (event) => {
			addMessage(event.data);
		});
	});

	myPeerConnection.setRemoteDescription(i_offer);
	const anwser = await myPeerConnection.createAnswer();
	myPeerConnection.setLocalDescription(anwser);
	socket.emit("answer", anwser, p_roomTitle);

});

socket.on("answer", async (i_answer) => {
	myPeerConnection.setRemoteDescription(i_answer);
});

socket.on("ice", (i_ice) => {
	myPeerConnection.addIceCandidate(i_ice);
});

socket.on("leave_noti", (i_uesrId, i_roomSize) => {
	getRoomTitle(p_roomTitle, i_roomSize);
	addMessage(`${i_uesrId} left!`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (i_rooms) => {
	const roomList = welcome.querySelector("ul");
	roomList.innerText = "";
	if (i_rooms.length === 0) {
		p_roomStatus = {};
		return;
	}
	i_rooms.forEach(room => {
		const li = document.createElement("li");
		li.innerHTML = `<strong>${room.title}</strong> (${room.size})`;
		const btn = document.createElement("button");
		btn.innerText = "Join";
		btn.value = room.title;
		btn.classList.add("join");
		li.appendChild(btn);
		roomList.appendChild(li);
		p_roomStatus[room.title] = room;
	});

	// p_roomStatus = i_rooms;

	console.log("p_roomStatus : ",p_roomStatus);
});


// WebRTC code below ----------------------------------------------------------------------------------------------
function handleIceCandidate(data) {
	socket.emit("ice", data.candidate, p_roomTitle);
}

function handleAddStream(data) {
	const peersFace = document.querySelector("#peersFace");
	peersFace.srcObject = data.stream;
}

function makeConnection() {
	myPeerConnection = new RTCPeerConnection({
		iceServers: [ // google STUN server is just for test; use your own STUN server
			{
				urls: [
					// "stun:stun.l.google.com:19302",
					"stun:stun1.l.google.com:19302",
					"stun:stun2.l.google.com:19302",
					"stun:stun3.l.google.com:19302",
					"stun:stun4.l.google.com:19302",
				],
			}
		],
	}); // create connection
	myPeerConnection.addEventListener("icecandidate", handleIceCandidate);
	myPeerConnection.addEventListener("addstream", handleAddStream);
	myStream
		.getTracks()
		.forEach((track) => myPeerConnection.addTrack(track, myStream)); // put stream into connection
}
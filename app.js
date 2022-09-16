const rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,
};

const options = {
  appId: "1b3aa2d760e44b5dac973c3a05ada5a1",
  channel: "main",
  token:
    "007eJxTYJiuu6qk+FjMahMxnls1LKoPczsE/oppG7Vw1+6xZW5IuanAYJhknJholGJuZpBqYpJkmpKYbGlunGycaGCamJJommh4bIlysts3leTUahsmRgYIBPFZGHITM/MYGACs4B7H",
};

rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let remoteUsers = {};

const joinAndDisplayLocalStream = async () => {
  rtc.client.on("user-published", handleUserJoined);
  rtc.client.on("user-left", handleUserLeft);

  const UID = await rtc.client.join(
    options.appId,
    options.channel,
    options.token,
    null
  );

  rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  const player = `<div class="video-container" id="user-container-${UID}">
                    <div class="video-player" id="user-${UID}"></div>
                </div>`;

  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  rtc.localVideoTrack.play(`user-${UID}`);

  await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
};

const joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};

const handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await rtc.client.subscribe(user, mediaType);

  if (mediaType === 'video') {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
              </div>`;

    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
};

const handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
}

const leaveAndRemoveLocalStream = async() => {
  stopAndClose(rtc.localAudioTrack);
  stopAndClose(rtc.localVideoTrack)

  await rtc.client.leave();
  document.getElementById('join-btn').style.display = 'block';
  document.getElementById('stream-controls').style.display='none';
  document.getElementById('video-streams').innerHTML = '';
}

const stopAndClose = (track) => {
  track.stop();
  track.close();
}

const toggleMic = async (e) => {
  if (rtc.localAudioTrack.muted) {
    await rtc.localAudioTrack.setMuted(false);
    e.target.innerText = 'Mic On';
    e.target.style.backgroundColor = 'cadetblue';
  } else {
    await rtc.localAudioTrack.setMuted(true);
    e.target.innerText = 'Mic Off';
    e.target.style.backgroundColor = '#EE4B2B';
  }
}

const toggleCamera = async (e) => {
  if(rtc.localVideoTrack.muted) {
    await rtc.localVideoTrack.setMuted(false);
    e.target.innerText = 'Camera On';
    e.target.style.backgroundColor = 'cadetblue';
  } else {
    await rtc.localVideoTrack.setMuted(true);
    e.target.innerText = 'Camera Off';
    e.target.style.backgroundColor = '#EE4B2B';
  }
}

document.getElementById("join-btn").addEventListener("click", joinStream);
document.getElementById("leave-btn").addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById("mic-btn").addEventListener('click', toggleMic);
document.getElementById("camera-btn").addEventListener('click', toggleCamera);
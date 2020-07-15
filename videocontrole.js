if(!location.hash){
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

const roomHash = location.hash.substring(1);

const drone = new ScaleDrone('yiS12Ts5RdNhebyM');

const roomName = 'observable-'+'roomHash';

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
}

let room;

//let pc1 = new RTCPeerConnection(), pc2 = new RTCPeerConnection(), stream, videoTrack, videoSender;
let pc;

let number = 0;

function onSuccess(){};

function onError(error){
    //console.log(error);
}

drone.on('open', error => {
    if (error)
    return console.log(error);

    room = drone.subscribe(roomName);

    room.on('open', error => {
        //se ocorrer erros capituramos aqui
    });

    room.on('members', members=>{
       //  console.log("conectado!!");

        console.log("Conecções abertas:"+members.length);
       number = members.length - 1;
       const isOfferer = members.length = 2;

       startWebRTC(isOfferer);
    })
});

function sendMessage(message){
    drone.publish({
        room: roomName,
        message
    })
}

function startWebRTC(isOfferer){
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = event => {
        if(event.candidate){
            sendMessage({'candidate': event.candidate});

        }
    };
    if(isOfferer){
        pc.onnegotiationneeded = () =>{
            pc.createOffer().then(localDescCreated).catch(onError)
        }
    };
    pc.ontrack = event => {
        const stream = event.streams[0];

        if(!remotevideo.srcObject || remotevideo.srcObject.id !== stream.id){
            remotevideo.srcObject = stream;
        }
    };

    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    }).then(stream => {
        localvideo.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream))

    }, onError);

    room.on('member_leave', function(member){
        //usuario saiu
        remotevideo.style.display = "none";
    })

    room.on('data', (message, client) =>{
        if (client.id === drone.clientId){
            return;
        }
        if(message.sdp){
           pc.setRemoteDescription (new RTCSessionDescription(message.sdp), ()=> {
               if(pc.remoteDescription.type === 'offer'){
                   pc.createAnswer().then(localDescCreated).catch(onError);
               }
           }, onError)
        }else if(message.candidate){
            pc.addIceCandidate(
                new RTCIceCandidate(message.candidate), onSuccess, onError
            )

        }

    })


}

function localDescCreated(desc){
    pc.setLocalDescription(desc, ()=> sendMessage({'sdp': pc.localDescription}), onError);
}

// proteção que evita chamadas aninhadas ao mecanismo de (re) negociação.
//apagar depois

let pc1 = new RTCPeerConnection(), pc2 = new RTCPeerConnection(), stream, videoTrack, videoSender;

(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    videoTrack = stream.getVideoTracks()[0];
    pc1.addTrack(stream.getAudioTracks()[0], stream);
  } catch (e) {
    console.log(e);  
  }
})();

/* checkbox.onclick = () => {
  if (checkbox.checked) {
    videoSender = pc1.addTrack(stream);
  } else {
    pc1.removeTrack(videoSender);
  }
} */

pc2.ontrack = e => {
  remotevideo.srcObject = e.streams[0];
  e.track.onended = e => remotevideo.srcObject = remotevideo.srcObject; // Chrome/Firefox bug
}

pc1.onicecandidate = e => pc2.addIceCandidate(e.candidate);
pc2.onicecandidate = e => pc1.addIceCandidate(e.candidate);

var isNegotiating = false;  // Workaround for Chrome: skip nested negotiations
pc1.onnegotiationneeded = async e => {
  if (isNegotiating) {
    console.log("SKIP nested negotiations");
    return;
  }
  isNegotiating = true;
  try {
    await pc1.setLocalDescription(await pc1.createOffer());
    await pc2.setRemoteDescription(pc1.localDescription);
    await pc2.setLocalDescription(await pc2.createAnswer());
    await pc1.setRemoteDescription(pc2.localDescription);
  } catch (e) {
    console.log(e);  
  }
}

pc1.onsignalingstatechange = (e) => {  // Workaround for Chrome: skip nested negotiations
  isNegotiating = (pc1.signalingState != "stable");
}
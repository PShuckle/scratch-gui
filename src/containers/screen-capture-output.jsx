import React, {
    useRef,
    useEffect
} from "react";
import io from "socket.io-client";
import { nanoid } from 'nanoid';

import Box from '../components/box/box.jsx';


const ScreenCaptureOutput = props => {
    // constructor (roomID) {
    //     this.roomID = roomID;

    // }

    const peerRef = useRef();
    const socketRef = useRef();
    const studentVideo = useRef();
    const studentUser = useRef();

    const students = {};
    const roomID = nanoid();

    useEffect(() => {
        socketRef.current = io('http://localhost:8000');
        socketRef.current.emit('create room', roomID);

        socketRef.current.on('user joined', userData => {
            studentUser.current = userData.userID;
        });

        socketRef.current.on('offer', handleRecieveCall);

        socketRef.current.on('ice-candidate', handleNewICECandidateMsg);

    });

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit('answer', payload);
        })
    }

    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;

        return peer;
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: studentUser.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function handleTrackEvent(e) {
        // console.log(e);
        // studentVideo.current.srcObject = e.streams[0];
        // console.log(studentVideo.current.srcObject.getTracks());
        const vid = document.getElementById("video");
        video.srcObject = e.streams[0];
    };

    return (
        <Box>
            <video id="video"
                controls
                style={{ "border": "1px solid #999", "width": "98%", "maxWidth": "860px" }}
                autoPlay ref={studentVideo}></video>
            <p>{roomID}</p>
        </Box >
        
    )


}

export default ScreenCaptureOutput;

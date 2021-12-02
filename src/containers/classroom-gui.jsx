import React, {
    useRef,
    useEffect
} from "react";

import io from "socket.io-client";
import { nanoid } from 'nanoid';

import Dropdown from '../components/dropdown/dropdown.jsx';
import Box from '../components/box/box.jsx';
import ScreenCaptureOutput from '../containers/screen-capture-output.jsx';

const ClassroomGUI = props => {
    const peerRef = useRef();
    const socketRef = useRef();
    const studentVideo = useRef();
    const studentUser = useRef();

    const studentVideos = {};
    const roomID = nanoid();

    useEffect(() => {
        socketRef.current = io('http://localhost:8000');
        socketRef.current.emit('create room', roomID);

        socketRef.current.on('user joined', handleUserJoin);

        socketRef.current.on('offer', handleRecieveCall);

        socketRef.current.on('ice-candidate', handleNewICECandidateMsg);

    });

    function handleUserJoin(userData) {
        studentUser.current = userData;

        const dropdown = document.getElementById('dropdown');
        const option = document.createElement('option');
        option.text = userData.name;
        dropdown.add(option);
    };

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
                target: studentUser.current.id,
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
        studentVideos[studentUser.current.name] = e.streams[0];
    };
    
    function displayStudentVideo() {
        const dropdown = document.getElementById('dropdown');
        const studentName = dropdown.options[dropdown.selectedIndex].text;
        console.log(studentName);
        studentVideo.current.srcObject = studentVideos[studentName];
        console.log(studentVideo.current.srcObject);
    }

    return (
        <Box>
            <Dropdown></Dropdown>
            <button onClick = {displayStudentVideo}>Play video</button>
            <ScreenCaptureOutput video={studentVideo}></ScreenCaptureOutput>
            <p>{roomID}</p>
        </Box>
    );

}

export default ClassroomGUI;
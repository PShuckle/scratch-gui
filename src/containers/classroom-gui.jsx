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
    const connectingStudent = useRef();
    const activeStudent = useRef();

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
        connectingStudent.current = userData.id;

        const dropdown = document.getElementById('dropdown');
        const option = document.createElement('option');
        option.text = userData.name;
        option.value = userData.id;
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
                target: connectingStudent.current,
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
        studentVideos[connectingStudent.current] = e.streams[0];
    };

    function displayStudentVideo() {
        const dropdown = document.getElementById('dropdown');
        const studentID = dropdown.value;
        activeStudent.current = studentID;
        studentVideo.current.srcObject = studentVideos[studentID];
    }

    function handleClick(event) {
        const clickLocation = getClickProportion(event);

        socketRef.current.emit('click', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y
        });
    }

    function handleMouseUp(event) {
        const clickLocation = getClickProportion(event);

        socketRef.current.emit('mouseUp', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y
        });
    }

    function handleDrag(event) {
        const clickLocation = getClickProportion(event);

        socketRef.current.emit('drag', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y
        });
    }

    function handleDragStart(event) {
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        const clickLocation = getClickProportion(event);

        console.log('hi');

        socketRef.current.emit('dragStart', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y
        })
    }

    function getClickProportion(event) {
        const video = document.getElementById('video');

        const dimensions = video.getBoundingClientRect();

        const xProportion = (event.clientX - dimensions.x) / dimensions.width;
        const yProportion = (event.clientY - dimensions.y) / dimensions.height;

        console.log(xProportion);
        console.log(yProportion);

        return ({ x: xProportion, y: yProportion });
    }

    function handleKeyPress(event) {
        const keyEvent = event.nativeEvent;
        socketRef.current.emit('key', {
            studentID: activeStudent.current,
            key: keyEvent.key,
            code: keyEvent.code
        } );
    }

    return (
        <Box>
            <Dropdown></Dropdown>
            <button onClick={displayStudentVideo}>Play video</button>
            <ScreenCaptureOutput
                video={studentVideo}
                onClick={handleClick}
                onMouseUp={handleMouseUp}
                onDrag={handleDrag}
                onDragStart={handleDragStart}
                onKeyDown={handleKeyPress}>
            </ScreenCaptureOutput>
            <p>{roomID}</p>
        </Box>
    );

}

export default ClassroomGUI;
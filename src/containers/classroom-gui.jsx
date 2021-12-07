import React, {
    createRef,
    useRef,
    useEffect
} from "react";

import io from "socket.io-client";
import { nanoid } from 'nanoid';

import Dropdown from '../components/dropdown/dropdown.jsx';
import Box from '../components/box/box.jsx';
import ScreenCaptureOutput from '../containers/screen-capture-output.jsx';
import ScreenCaptureThumbnail from '../containers/screen-capture-thumbnail.jsx';

const socketRef = createRef();
const studentVideo = createRef();
const activeStudent = createRef();
const connectingStudent = createRef();
const peerRef = createRef();

const studentVideos = {};
const roomID = nanoid();

class ClassroomGUI extends React.Component {
    constructor() {
        super();
        this.state = {studentVideos: {}}
    }

    componentDidMount() {
        socketRef.current = io('http://localhost:8000');
        socketRef.current.emit('create room', roomID);

        socketRef.current.on('user joined', this.handleUserJoin);

        socketRef.current.on('offer', this.handleRecieveCall);

        socketRef.current.on('ice-candidate', this.handleNewICECandidateMsg);

    };

    handleUserJoin(userData) {
        connectingStudent.current = userData.id;
    };

    handleRecieveCall(incoming) {
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

        function createPeer() {
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
        };

        function handleICECandidateEvent(e) {
            if (e.candidate) {
                const payload = {
                    target: connectingStudent.current,
                    candidate: e.candidate,
                }
                socketRef.current.emit("ice-candidate", payload);
            }
        }

        function handleTrackEvent(e) {
            studentVideos[connectingStudent.current] = e.streams[0];
        };
    };

    handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    };

    displayThumbnailView = () => {
        this.setState({studentVideos: studentVideos});
    }

    displayStudentVideo() {
        const dropdown = document.getElementById('dropdown');
        const studentID = dropdown.value;
        activeStudent.current = studentID;
        studentVideo.current.srcObject = studentVideos[studentID];
    }

    handleClick(event) {
        const video = document.getElementById('video');
        video.focus();

        console.log(document.activeElement)

        const clickLocation = getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'click'
        });
    }

    handleMouseDown(event) {
        const clickLocation = getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mousedown'
        })

    }

    handleMouseUp(event) {
        const clickLocation = getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mouseup'
        });
    }

    handleDrag(event) {
        const clickLocation = getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mousemove'
        });
    }

    handleDragStart(event) {
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }

    handleDragEnd(event) {
        handleMouseUp(event);
    }

    getClickProportion(event) {
        const video = document.getElementById('video');

        const dimensions = video.getBoundingClientRect();

        const xProportion = (event.clientX - dimensions.x) / dimensions.width;
        const yProportion = (event.clientY - dimensions.y) / dimensions.height;

        return ({ x: xProportion, y: yProportion });
    }

    handleKeyPress(event) {
        const keyEvent = event.nativeEvent;
        socketRef.current.emit('key', {
            studentID: activeStudent.current,
            key: keyEvent.key,
            code: keyEvent.code
        });
    }

    handleWheel(event) {
        const scrollLocation = getClickProportion(event);

        socketRef.current.emit('wheel', {
            studentID: activeStudent.current,
            x: scrollLocation.x,
            y: scrollLocation.y,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode
        });

    }

    render() {
        return (
            <Box>
                <Dropdown></Dropdown>
                <button onClick={this.displayThumbnailView}>Play video</button>
                <div>
                    {Object.keys(this.state.studentVideos).map(function (key) {
                        studentVideo.current.srcObject = studentVideos[key];
                        return (
                            <ScreenCaptureThumbnail
                                name={key}
                                video={video}>
                            </ScreenCaptureThumbnail>
                        );
                    })}
                </div>
                {/* <ScreenCaptureOutput
                    video={studentVideo}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onDrag={handleDrag}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onKeyDown={handleKeyPress}
                    onWheel={handleWheel}>
                </ScreenCaptureOutput> */}
                <p>{roomID}</p>
            </Box>
        );

    }



}

export default ClassroomGUI;
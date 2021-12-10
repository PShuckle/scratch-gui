import React, {
    createRef,
    useRef,
    useEffect
} from "react";

import io from "socket.io-client";
import { nanoid } from 'nanoid';
import {parse, stringify, toJSON, fromJSON} from 'flatted';

import Dropdown from '../components/dropdown/dropdown.jsx';
import Box from '../components/box/box.jsx';
import ScreenCaptureOutput from '../containers/screen-capture-output.jsx';
import ScreenCaptureThumbnail from '../containers/screen-capture-thumbnail.jsx';

const socketRef = createRef();
const studentVideoFullScreen = createRef();
const activeStudent = createRef();
const connectingStudent = createRef();
const peerRef = createRef();
const dataChannel = createRef();

const studentVideos = {};
const studentBlocks = {};
const studentWorkspaceRefs = {};
const roomID = nanoid();

class ClassroomGUI extends React.Component {
    constructor() {
        super();
        this.state = { studentVideos: {}, activeVideo: null }
        this.handleRecieveCall = this.handleRecieveCall.bind(this);
        this.handleUserJoin = this.handleUserJoin.bind(this);
        this.handleNewICECandidateMsg = this.handleNewICECandidateMsg.bind(this);
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
        peerRef.current.addEventListener('datachannel', event => {
            dataChannel.current = event.channel;
            dataChannel.current.addEventListener('message', (event) => {
                const eventObject = JSON.parse(event.data);
                if (!studentWorkspaceRefs[eventObject.sender]) {
                    studentWorkspaceRefs[eventObject.sender] = createRef();
                }
                studentWorkspaceRefs[eventObject.sender].current = eventObject.blocksList;
                this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: this.state.activeVideo })
            })
        });
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
        this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: null });
    }

    displayStudentVideo = (studentId) => {
        this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: studentId }, () =>{
            activeStudent.current = studentId;
            studentVideoFullScreen.current.srcObject = studentVideos[studentId];
        });
    }

    handleClick = (event) => {
        const video = document.getElementById('video');
        video.focus();

        const clickLocation = this.getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'click'
        });
    }

    handleMouseDown = (event) => {
        const clickLocation = this.getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mousedown'
        })

    }

    handleMouseUp = (event) => {
        const clickLocation = this.getClickProportion(event);

        socketRef.current.emit('mouse', {
            studentID: activeStudent.current,
            x: clickLocation.x,
            y: clickLocation.y,
            type: 'mouseup'
        });
    }

    handleDrag(event) {
        const clickLocation = this.getClickProportion(event);

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
        this.handleMouseUp(event);
    }

    getClickProportion = (event) => {
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
        const scrollLocation = this.getClickProportion(event);

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
        var videoDisplay;
        if (this.state.activeVideo == null) {
            var videos = [];
            for (let key in this.state.studentVideos) {
                videos.push(
                    <ScreenCaptureThumbnail
                        key={key}
                        name={key}
                        blocks={this.state.studentVideos[key].current}
                        onClick={() => this.displayStudentVideo(key)}
                    >
                    </ScreenCaptureThumbnail>
                )
            }
            videoDisplay = videos;
        }
        else {
            videoDisplay =
                <ScreenCaptureOutput
                    video={studentVideoFullScreen}
                    onClick={(e) => this.handleClick(e)}
                    onMouseDown={(e) => this.handleMouseDown(e)}
                    onMouseUp={(e) => this.handleMouseUp(e)}
                    onDrag={(e) => this.handleDrag(e)}
                    onDragStart={(e) => this.handleDragStart(e)}
                    onDragEnd={(e) => this.handleDragEnd(e)}
                    onKeyDown={(e) => this.handleKeyPress(e)}
                    onWheel={(e) => this.handleWheel(e)}>
                </ScreenCaptureOutput>
        }

        return (
            <Box>
                <Dropdown></Dropdown>
                <button onClick={this.displayThumbnailView}>Show Thumbnails</button>
                <div>
                    {
                        videoDisplay
                    }
                </div>
                <p>Room ID: {roomID}</p>
            </Box>
        );

    }



}

export default ClassroomGUI;
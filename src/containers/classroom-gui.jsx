import React, {
    createRef,
    useRef,
    useEffect
} from "react";

import io from "socket.io-client";
import { nanoid } from 'nanoid';
import VM from 'scratch-vm';
import Renderer from 'scratch-render';
import AudioEngine from 'scratch-audio';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';

import vmListenerHOC from '../lib/vm-listener-hoc.jsx';
import vmManagerHOC from '../lib/vm-manager-hoc.jsx';

import Dropdown from '../components/dropdown/dropdown.jsx';
import Box from '../components/box/box.jsx';
import ScreenCaptureOutput from '../containers/screen-capture-output.jsx';
import ScreenCaptureThumbnail from '../containers/screen-capture-thumbnail.jsx';
import StageWrapper from '../containers/stage-wrapper.jsx';
import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';

import { instanceOf } from "prop-types";

const socketRef = createRef();
const studentVideoFullScreen = createRef();
const activeStudent = createRef();
const connectingStudent = createRef();
const peerRef = createRef();
const dataChannel = createRef();

const studentVideos = {};
const studentBlocks = {};
const studentWorkspaceRefs = {};
const studentNames = {};
const roomID = nanoid();

class ClassroomGUI extends React.Component {
    constructor() {
        super();
        this.state = { studentVideos: {}, activeVideo: null }
        this.handleRecieveCall = this.handleRecieveCall.bind(this);
        this.handleUserJoin = this.handleUserJoin.bind(this);
        this.handleNewICECandidateMsg = this.handleNewICECandidateMsg.bind(this);

        // this.canvas = document.createElement('canvas');
        // this.renderer = new Renderer(this.canvas);
        // this.vm.attachRenderer(this.renderer);
    }

    componentDidMount() {
        this.props.vm.attachAudioEngine(new AudioEngine());

        socketRef.current = io('http://localhost:8000');
        socketRef.current.emit('create room', roomID);

        socketRef.current.on('user joined', this.handleUserJoin);

        socketRef.current.on('offer', this.handleRecieveCall);

        socketRef.current.on('ice-candidate', this.handleNewICECandidateMsg);

    };

    handleUserJoin(userData) {
        connectingStudent.current = userData.id;
        studentNames[userData.id] = userData.name;
    };

    handleRecieveCall(incoming) {
        peerRef.current = this.createPeer();
        peerRef.current.addEventListener('datachannel', event => {
            dataChannel.current = event.channel;
            dataChannel.current.addEventListener('message', (event) => {
                this.onMessageReceived(event);
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
        });
    };

    onMessageReceived(event) {
        if (typeof event.data === 'string') {
            this.onStringMessageReceived(event);
        }
        else if (event.data instanceof ArrayBuffer) {
            this.onArrayBufferReceived(event);
        }
        else {
            console.log(event.data);
            console.log(typeof event.data);
        }
    }

    onStringMessageReceived(event) {
        const eventObject = JSON.parse(event.data);
        if (!studentWorkspaceRefs[eventObject.sender]) {
            studentWorkspaceRefs[eventObject.sender] = createRef();
        }
        studentWorkspaceRefs[eventObject.sender].current = eventObject.blocksList;
        this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: this.state.activeVideo })
    }

    onArrayBufferReceived(event) {
        this.props.vm.loadProject(event.data).then(
            () => {
                this.props.vm.renderer.draw();
            }
        );
        this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: this.state.activeVideo })
    }

    createPeer() {
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

        peer.onicecandidate = this.handleICECandidateEvent;
        peer.ontrack = this.handleTrackEvent;

        return peer;
    };

    handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: connectingStudent.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    };

    handleTrackEvent(e) {
        studentVideos[connectingStudent.current] = e.streams[0];
    };

    displayThumbnailView = () => {
        this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: null });
    }

    displayStudentVideo = (studentId) => {
        this.setState({ studentVideos: studentWorkspaceRefs, activeVideo: studentId }, () => {
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
                        name={studentNames[key]}
                        blocks={this.state.studentVideos[key].current}
                        onClick={() => this.displayStudentVideo(key)}
                        vm={this.props.vm}
                    >
                    </ScreenCaptureThumbnail>
                )
            }
            videoDisplay = videos;
        }
        else {
            videoDisplay =
                <div>
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
                    <StageWrapper
                        isRendererSupported={true}
                        isFullScreen={false}
                        stageSize={STAGE_DISPLAY_SIZES.large}
                        vm={this.props.vm}
                        isRtl={false}
                    />

                </div>
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

const mapStateToProps = state => {
    return {
        vm: state.scratchGui.vm
    }
}

const mapDispatchToProps = dispatch => {
    
}

const ConnectedGUI = injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClassroomGUI));

const WrappedGui = compose(
    vmListenerHOC,
    vmManagerHOC,
)(ConnectedGUI);

export default WrappedGui;